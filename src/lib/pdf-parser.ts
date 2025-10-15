// PDF から物件情報を抽出するユーティリティ関数

export interface ExtractedPropertyData {
  name?: string
  prefecture?: string
  city?: string
  address_line?: string
  property_type?: 'mansion' | 'house' | 'land' | 'shop' | 'office'
  transaction_type?: 'sale' | 'rent'
  price?: number
  area_sqm?: number
  layout?: string
  building_age?: number
  description?: string
  // Raw text for manual mapping
  rawText: string
}

// キーワードマッピング
const PROPERTY_TYPE_KEYWORDS = {
  mansion: ['マンション', 'アパート', '共同住宅'],
  house: ['一戸建て', '戸建', '住宅'],
  land: ['土地', '更地', '宅地'],
  shop: ['店舗', '商業施設'],
  office: ['事務所', 'オフィス', '事業用'],
}

const TRANSACTION_TYPE_KEYWORDS = {
  sale: ['売買', '売り', '販売', '購入'],
  rent: ['賃貸', '貸', 'レンタル'],
}

const PREFECTURE_LIST = [
  '東京都',
  '神奈川県',
  '千葉県',
  '埼玉県',
  '大阪府',
  '京都府',
  '兵庫県',
  '愛知県',
  '福岡県',
  '北海道',
  // Add more as needed
]

/**
 * PDFテキストから物件情報を抽出
 */
export function extractPropertyData(text: string): ExtractedPropertyData {
  const result: ExtractedPropertyData = {
    rawText: text,
  }

  // 物件名を抽出（「物件名：」の後、次のキーワードまたは改行まで）
  const nameMatch = text.match(/物件名\s*[：:]\s*([^住価面間築マ一売賃\n\r]+?)(?=\s*(?:住所|価格|面積|間取り|築|マンション|一戸建て|売買|賃貸|\n|$))/)
  if (nameMatch) {
    result.name = nameMatch[1].trim()
  }

  // 住所を抽出（「住所：」の後、次のキーワードまで）
  const addressMatch = text.match(/(?:住所|所在地)\s*[：:]\s*([^価面間築マ一売賃\n\r]+?)(?=\s*(?:価格|面積|間取り|築|マンション|一戸建て|売買|賃貸|\n|$))/)
  if (addressMatch) {
    const fullAddress = addressMatch[1].trim()

    // 都道府県と市区町村を抽出
    for (const pref of PREFECTURE_LIST) {
      if (fullAddress.includes(pref)) {
        result.prefecture = pref
        // 都道府県以降を取得
        const afterPref = fullAddress.split(pref)[1]
        // 市区町村を抽出（番地の前まで）
        const cityMatch = afterPref?.match(/^([^0-9０-９]+?[市区町村])/)
        if (cityMatch) {
          result.city = cityMatch[1]
          // 市区町村以降を町名・番地として設定
          const afterCity = afterPref.substring(cityMatch[1].length).trim()
          result.address_line = afterCity
        } else {
          // 市区町村が見つからない場合は都道府県以降を全て設定
          result.address_line = afterPref.trim()
        }
        break
      }
    }

    // 都道府県が見つからない場合は元の住所を設定
    if (!result.prefecture) {
      result.address_line = fullAddress
    }
  }

  // 住所が見つからない場合でも都道府県を抽出
  if (!result.prefecture) {
    for (const pref of PREFECTURE_LIST) {
      if (text.includes(pref)) {
        result.prefecture = pref
        break
      }
    }
  }

  // 物件種別を抽出
  for (const [type, keywords] of Object.entries(PROPERTY_TYPE_KEYWORDS)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      result.property_type = type as ExtractedPropertyData['property_type']
      break
    }
  }

  // 取引種別を抽出
  for (const [type, keywords] of Object.entries(TRANSACTION_TYPE_KEYWORDS)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      result.transaction_type = type as ExtractedPropertyData['transaction_type']
      break
    }
  }

  // 価格を抽出（万円、円）
  const priceMatch = text.match(/(?:価格|金額|賃料)\s*[：:]\s*([0-9,]+)\s*(万\s*円|円)/)
  if (priceMatch) {
    const priceStr = priceMatch[1].replace(/,/g, '')
    const priceValue = parseInt(priceStr)
    const unit = priceMatch[2].replace(/\s/g, '')
    // 万円の場合は10000倍
    if (unit.includes('万')) {
      result.price = priceValue * 10000
    } else {
      result.price = priceValue
    }
  }

  // 面積を抽出（㎡、平米）
  const areaMatch = text.match(/(?:面積|専有面積)\s*[：:]\s*([0-9.]+)\s*(?:㎡|平米|m2|m²)/)
  if (areaMatch) {
    result.area_sqm = parseFloat(areaMatch[1])
  }

  // 間取りを抽出（1K、2LDK など）
  const layoutMatch = text.match(/(?:間取り)\s*[：:]\s*([0-9]+[RLDK]+)/)
  if (layoutMatch) {
    result.layout = layoutMatch[1]
  }

  // 築年数を抽出
  const buildingAgeMatch = text.match(/築\s*([0-9]+)\s*年/)
  if (buildingAgeMatch) {
    result.building_age = parseInt(buildingAgeMatch[1])
  }

  // 説明を抽出（「説明」「詳細」などのキーワードの後）
  const descMatch = text.match(/(?:説明|詳細|備考)[：:\s]*([^\n]+(?:\n[^\n]+)*)/)
  if (descMatch) {
    result.description = descMatch[1].trim()
  }

  return result
}

/**
 * 複数の物件データを含むPDFテキストを分割
 * （将来的な一括インポート用）
 */
export function splitMultipleProperties(text: string): string[] {
  // 「物件名」または「【」で区切る
  const sections = text.split(/(?=物件名|【)/).filter((s) => s.trim().length > 0)
  return sections
}

/**
 * 抽出されたデータの信頼度をチェック
 */
export function validateExtractedData(data: ExtractedPropertyData): {
  isValid: boolean
  missingFields: string[]
  warnings: string[]
} {
  const missingFields: string[] = []
  const warnings: string[] = []

  // 必須フィールドのチェック
  if (!data.name) missingFields.push('物件名')
  if (!data.prefecture) missingFields.push('都道府県')
  if (!data.property_type) missingFields.push('物件種別')
  if (!data.transaction_type) missingFields.push('取引種別')
  if (!data.price) missingFields.push('価格')

  // 推奨フィールドのチェック
  if (!data.area_sqm) warnings.push('面積が見つかりませんでした')
  if (!data.layout) warnings.push('間取りが見つかりませんでした')
  if (!data.address_line) warnings.push('住所が見つかりませんでした')

  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings,
  }
}
