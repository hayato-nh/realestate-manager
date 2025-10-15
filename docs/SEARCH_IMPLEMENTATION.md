# 検索機能の実装ガイド

## 概要

このドキュメントでは、不動産物件管理アプリケーションの検索機能の実装方法について説明します。日本語テキスト検索には `pg_trgm` 拡張機能（トライグラム検索）を使用します。

---

## 検索方法の種類

### 1. 完全一致検索（Exact Match）
```sql
SELECT * FROM hn_pi_properties
WHERE name = '駅近マンション';
```
**用途**: 正確な物件名での検索

### 2. 前方一致検索（Prefix Match）
```sql
SELECT * FROM hn_pi_properties
WHERE name LIKE '駅近%';
```
**用途**: 「駅近」で始まる物件を検索

### 3. 部分一致検索（Partial Match）- 推奨
```sql
SELECT * FROM hn_pi_properties
WHERE name ILIKE '%マンション%';
```
**用途**: 物件名に「マンション」を含む検索（大文字小文字区別なし）

### 4. トライグラム検索（Trigram Search）- 最も推奨
```sql
SELECT * FROM hn_pi_properties
WHERE name % '駅近マンション'
ORDER BY similarity(name, '駅近マンション') DESC;
```
**用途**: 曖昧検索、タイポに強い、類似度順にソート可能

---

## pg_trgm 拡張機能について

### 特徴
- **部分一致検索が高速**: ILIKE '%keyword%' のようなクエリを高速化
- **曖昧検索**: タイプミスや表記ゆれに対応
- **類似度検索**: 類似度スコアでソート可能
- **日本語対応**: 日本語の文字列でも正常に動作

### インデックスの種類
マイグレーションファイルで作成した2種類のインデックス：

1. **LOWER インデックス**: 大文字小文字を区別しない検索用
```sql
CREATE INDEX idx_properties_name_lower ON hn_pi_properties(LOWER(name));
```

2. **トライグラムインデックス**: 部分一致・曖昧検索用
```sql
CREATE INDEX idx_properties_name_trgm ON hn_pi_properties USING gin(name gin_trgm_ops);
```

---

## Supabase クライアントでの検索実装

### 基本的な検索（ILIKE）

```typescript
import { createClient } from '@/lib/supabase/client'

async function searchProperties(keyword: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('hn_pi_properties')
    .select('*')
    .ilike('name', `%${keyword}%`)
    .eq('status', 'published')
    .is('deleted_at', null)

  if (error) throw error
  return data
}

// 使用例
const results = await searchProperties('マンション')
```

### 複数カラムでの検索

```typescript
async function searchPropertiesMultiColumn(keyword: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('hn_pi_properties')
    .select('*')
    .or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`)
    .eq('status', 'published')
    .is('deleted_at', null)

  if (error) throw error
  return data
}

// 使用例
const results = await searchPropertiesMultiColumn('駅近')
```

### 高度な検索（フィルター付き）

```typescript
interface SearchFilters {
  keyword?: string
  propertyType?: string
  minPrice?: number
  maxPrice?: number
  prefecture?: string
  city?: string
  layout?: string[]
  amenities?: string[]
}

async function advancedSearch(filters: SearchFilters) {
  const supabase = createClient()

  let query = supabase
    .from('hn_pi_properties')
    .select(`
      *,
      hn_pi_property_images!inner(image_url, is_main),
      hn_pi_property_amenities!inner(amenity_type)
    `)
    .eq('status', 'published')
    .is('deleted_at', null)

  // キーワード検索
  if (filters.keyword) {
    query = query.or(
      `name.ilike.%${filters.keyword}%,description.ilike.%${filters.keyword}%`
    )
  }

  // 物件種別
  if (filters.propertyType) {
    query = query.eq('property_type', filters.propertyType)
  }

  // 価格帯
  if (filters.minPrice) {
    query = query.gte('price', filters.minPrice)
  }
  if (filters.maxPrice) {
    query = query.lte('price', filters.maxPrice)
  }

  // エリア
  if (filters.prefecture) {
    query = query.eq('prefecture', filters.prefecture)
  }
  if (filters.city) {
    query = query.eq('city', filters.city)
  }

  // 間取り（複数選択）
  if (filters.layout && filters.layout.length > 0) {
    query = query.in('layout', filters.layout)
  }

  // 設備（複数選択）
  if (filters.amenities && filters.amenities.length > 0) {
    query = query.in('hn_pi_property_amenities.amenity_type', filters.amenities)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

// 使用例
const results = await advancedSearch({
  keyword: 'マンション',
  propertyType: 'mansion',
  minPrice: 5000000,
  maxPrice: 10000000,
  prefecture: '東京都',
  layout: ['1LDK', '2LDK'],
  amenities: ['air_conditioner', 'auto_lock']
})
```

---

## トライグラム検索の実装（SQL関数）

### 類似度検索関数

```sql
-- 類似度検索用の関数を作成
CREATE OR REPLACE FUNCTION search_properties_by_similarity(
  search_term TEXT,
  similarity_threshold REAL DEFAULT 0.3
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  similarity_score REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.description,
    GREATEST(
      similarity(p.name, search_term),
      similarity(COALESCE(p.description, ''), search_term)
    ) AS similarity_score
  FROM hn_pi_properties p
  WHERE
    p.status = 'published' AND
    p.deleted_at IS NULL AND
    (
      p.name % search_term OR
      COALESCE(p.description, '') % search_term
    )
  ORDER BY similarity_score DESC;
END;
$$ LANGUAGE plpgsql;

-- 使用例
SELECT * FROM search_properties_by_similarity('駅近マンション', 0.2);
```

### Next.js での Supabase RPC 呼び出し

```typescript
async function searchBySimilarity(keyword: string, threshold: number = 0.3) {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('search_properties_by_similarity', {
    search_term: keyword,
    similarity_threshold: threshold
  })

  if (error) throw error
  return data
}

// 使用例
const results = await searchBySimilarity('駅近マンション')
```

---

## 検索UIコンポーネントの実装例

### 検索フォームコンポーネント

```typescript
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export function PropertySearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [keyword, setKeyword] = useState(searchParams.get('q') || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!keyword.trim()) {
      router.push('/properties')
      return
    }

    const params = new URLSearchParams()
    params.set('q', keyword.trim())
    router.push(`/properties?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <Input
        type="text"
        placeholder="物件名や説明文で検索..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="flex-1"
      />
      <Button type="submit">
        <Search className="h-4 w-4 mr-2" />
        検索
      </Button>
    </form>
  )
}
```

### 検索結果ページ

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PropertyCard } from '@/components/property/property-card'

export default function SearchResultsPage() {
  const searchParams = useSearchParams()
  const keyword = searchParams.get('q') || ''
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchResults() {
      if (!keyword) {
        setProperties([])
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { data, error } = await supabase
        .from('hn_pi_properties')
        .select('*, hn_pi_property_images(image_url, is_main)')
        .or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`)
        .eq('status', 'published')
        .is('deleted_at', null)
        .limit(50)

      if (!error) {
        setProperties(data || [])
      }
      setLoading(false)
    }

    fetchResults()
  }, [keyword])

  if (loading) {
    return <div>検索中...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">
        「{keyword}」の検索結果: {properties.length}件
      </h1>

      {properties.length === 0 ? (
        <p className="text-gray-500">検索結果が見つかりませんでした。</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## パフォーマンスの最適化

### 1. 検索結果のキャッシング

```typescript
import useSWR from 'swr'

function usePropertySearch(keyword: string) {
  const fetcher = async (key: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('hn_pi_properties')
      .select('*')
      .ilike('name', `%${keyword}%`)
      .eq('status', 'published')
      .is('deleted_at', null)

    if (error) throw error
    return data
  }

  return useSWR(keyword ? `search-${keyword}` : null, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1分間はキャッシュを使用
  })
}

// コンポーネントでの使用
export function SearchResults({ keyword }: { keyword: string }) {
  const { data: properties, isLoading, error } = usePropertySearch(keyword)

  if (isLoading) return <div>検索中...</div>
  if (error) return <div>エラーが発生しました</div>

  return (
    <div>
      {properties?.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  )
}
```

### 2. デバウンス処理（入力中の無駄なクエリを削減）

```typescript
import { useState, useEffect } from 'react'

function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// 使用例
export function LiveSearchBar() {
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebounce(keyword, 500)
  const { data: results } = usePropertySearch(debouncedKeyword)

  return (
    <div>
      <Input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="検索..."
      />

      {debouncedKeyword && results && (
        <div className="mt-2">
          {results.length}件の結果
        </div>
      )}
    </div>
  )
}
```

### 3. ページネーション

```typescript
async function searchWithPagination(
  keyword: string,
  page: number = 1,
  pageSize: number = 20
) {
  const supabase = createClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('hn_pi_properties')
    .select('*', { count: 'exact' })
    .ilike('name', `%${keyword}%`)
    .eq('status', 'published')
    .is('deleted_at', null)
    .range(from, to)

  if (error) throw error

  return {
    data,
    totalCount: count,
    totalPages: Math.ceil((count || 0) / pageSize),
    currentPage: page,
  }
}
```

---

## 検索クエリのベストプラクティス

### ✅ 推奨される実装

1. **インデックスを活用する**
```typescript
// ILIKE検索はトライグラムインデックスを活用
.ilike('name', `%${keyword}%`)
```

2. **必要なカラムのみ取得**
```typescript
.select('id, name, price, prefecture, city')
```

3. **適切な制限を設ける**
```typescript
.limit(50) // 大量のデータを一度に取得しない
```

4. **ステータスチェックを忘れない**
```typescript
.eq('status', 'published')
.is('deleted_at', null)
```

### ❌ 避けるべき実装

1. **前方・後方の % なし**
```typescript
// インデックスが効かない
.like('name', 'マンション')
```

2. **SELECT *での全カラム取得**
```typescript
// 不要なデータまで取得
.select('*')
```

3. **LIMITなしのクエリ**
```typescript
// データが多いとパフォーマンス問題
// .limit() を指定していない
```

---

## テスト方法

### SQL Editorでの動作確認

```sql
-- 1. ILIKE検索のテスト
SELECT name, description
FROM hn_pi_properties
WHERE name ILIKE '%マンション%'
LIMIT 10;

-- 2. トライグラム検索のテスト
SELECT name, similarity(name, '駅近マンション') as score
FROM hn_pi_properties
WHERE name % '駅近マンション'
ORDER BY score DESC
LIMIT 10;

-- 3. 複合検索のテスト
SELECT name, price, prefecture, city
FROM hn_pi_properties
WHERE
  (name ILIKE '%マンション%' OR description ILIKE '%マンション%')
  AND prefecture = '東京都'
  AND price BETWEEN 5000000 AND 10000000
LIMIT 10;
```

---

## まとめ

- ✅ `pg_trgm` 拡張機能を使用した日本語検索に対応
- ✅ ILIKE検索で部分一致・大文字小文字区別なし検索が可能
- ✅ トライグラムインデックスで高速検索を実現
- ✅ デバウンス・キャッシング・ページネーションでUX向上
- ✅ 複数カラム・複数条件の高度な検索に対応

次のステップ: アプリケーションコードで実際に検索機能を実装してください！
