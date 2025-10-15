-- ============================================================
-- サンプルデータ作成
-- ============================================================
-- 作成日: 2025-10-15
-- 説明: テスト用のサンプル物件データを5件作成
-- 前提: ログインユーザーが存在すること
-- ============================================================

-- ============================================================
-- 注意事項
-- ============================================================
-- このファイルを実行する前に:
-- 1. ログインしているユーザーのIDを確認してください
-- 2. 以下のクエリで確認: SELECT id, email FROM auth.users;
-- 3. 'YOUR_USER_ID_HERE' を実際のユーザーIDに置き換えてください
-- ============================================================

-- ============================================================
-- サンプル物件データの作成
-- ============================================================

-- 現在ログインしているユーザーのIDを取得（Supabase Dashboard では auth.uid() が使えない場合があります）
-- 代わりに、以下のコメントアウトされたクエリでIDを確認してから、手動で置き換えてください

-- SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;

-- ⚠️ 以下の 'YOUR_USER_ID_HERE' を実際のUser IDに置き換えてください
DO $$
DECLARE
  v_user_id UUID;
  v_property_1 UUID;
  v_property_2 UUID;
  v_property_3 UUID;
  v_property_4 UUID;
  v_property_5 UUID;
BEGIN
  -- ユーザーIDの設定（ここを変更してください）
  -- 例: v_user_id := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

  -- 最新のユーザーを自動取得（手動設定の代替）
  SELECT id INTO v_user_id FROM auth.users ORDER BY created_at DESC LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'ユーザーが見つかりません。先にSupabase Authenticationでユーザーを作成してください。';
  END IF;

  RAISE NOTICE '使用するユーザーID: %', v_user_id;

  -- ============================================================
  -- 物件1: 駅近マンション（東京都）
  -- ============================================================
  INSERT INTO hn_pi_properties (
    id, created_by, name, property_type, transaction_type, status,
    postal_code, prefecture, city, address_line, building_name,
    latitude, longitude,
    price, area_sqm, layout, building_age,
    floor_number, total_floors,
    description, parking_available, pet_allowed,
    nearest_station, walk_minutes
  ) VALUES (
    gen_random_uuid(), v_user_id,
    '渋谷駅徒歩3分の好立地マンション', 'mansion', 'sale', 'published',
    '150-0002', '東京都', '渋谷区', '渋谷1-1-1', 'グランドタワー渋谷',
    35.6595, 139.7004,
    85000000, 65.5, '2LDK', 5,
    15, 25,
    '渋谷駅から徒歩わずか3分の好立地。南向きで日当たり良好。リビングは広々としており、家族での生活に最適です。近隣にはスーパー、コンビニ、病院などの生活施設が充実しています。',
    true, false,
    '渋谷駅', 3
  ) RETURNING id INTO v_property_1;

  -- 物件1の画像
  INSERT INTO hn_pi_property_images (property_id, image_url, display_order, is_main, caption)
  VALUES
    (v_property_1, 'https://placehold.co/800x600/e3f2fd/1976d2?text=Exterior+View', 0, true, '外観'),
    (v_property_1, 'https://placehold.co/800x600/e8f5e9/43a047?text=Living+Room', 1, false, 'リビング'),
    (v_property_1, 'https://placehold.co/800x600/fff3e0/fb8c00?text=Kitchen', 2, false, 'キッチン');

  -- 物件1の設備
  INSERT INTO hn_pi_property_amenities (property_id, amenity_type)
  VALUES
    (v_property_1, 'air_conditioner'),
    (v_property_1, 'floor_heating'),
    (v_property_1, 'auto_lock'),
    (v_property_1, 'separate_bathroom'),
    (v_property_1, 'system_kitchen');

  -- ============================================================
  -- 物件2: 広々一戸建て（神奈川県）
  -- ============================================================
  INSERT INTO hn_pi_properties (
    id, created_by, name, property_type, transaction_type, status,
    postal_code, prefecture, city, address_line,
    latitude, longitude,
    price, area_sqm, layout, building_age,
    total_floors,
    description, parking_available, pet_allowed,
    nearest_station, walk_minutes
  ) VALUES (
    gen_random_uuid(), v_user_id,
    '閑静な住宅街の一戸建て', 'house', 'sale', 'published',
    '220-0011', '神奈川県', '横浜市西区', '高島2-10-5',
    35.4657, 139.6201,
    62000000, 120.0, '4LDK', 3,
    2,
    '閑静な住宅街に佇む一戸建て。広々とした庭付きで、お子様やペットとの生活に最適。駐車場2台分完備。リフォーム済みで綺麗な状態です。',
    true, true,
    '横浜駅', 15
  ) RETURNING id INTO v_property_2;

  -- 物件2の画像
  INSERT INTO hn_pi_property_images (property_id, image_url, display_order, is_main, caption)
  VALUES
    (v_property_2, 'https://placehold.co/800x600/f3e5f5/8e24aa?text=House+Exterior', 0, true, '外観'),
    (v_property_2, 'https://placehold.co/800x600/fce4ec/d81b60?text=Garden', 1, false, '庭');

  -- 物件2の設備
  INSERT INTO hn_pi_property_amenities (property_id, amenity_type)
  VALUES
    (v_property_2, 'air_conditioner'),
    (v_property_2, 'balcony'),
    (v_property_2, 'storage'),
    (v_property_2, 'separate_bathroom');

  -- ============================================================
  -- 物件3: 投資用ワンルーム（東京都）
  -- ============================================================
  INSERT INTO hn_pi_properties (
    id, created_by, name, property_type, transaction_type, status,
    postal_code, prefecture, city, address_line, building_name,
    latitude, longitude,
    price, area_sqm, layout, building_age,
    floor_number, total_floors,
    description, parking_available, pet_allowed,
    nearest_station, walk_minutes
  ) VALUES (
    gen_random_uuid(), v_user_id,
    '新宿エリアの投資用ワンルーム', 'mansion', 'sale', 'published',
    '160-0022', '東京都', '新宿区', '新宿3-5-8', 'パークサイド新宿',
    35.6938, 139.7036,
    28000000, 25.5, '1K', 10,
    8, 12,
    '投資用に最適なワンルームマンション。駅近で賃貸需要が高いエリアです。オートロック・宅配ボックス完備。',
    false, false,
    '新宿駅', 7
  ) RETURNING id INTO v_property_3;

  -- 物件3の画像
  INSERT INTO hn_pi_property_images (property_id, image_url, display_order, is_main, caption)
  VALUES
    (v_property_3, 'https://placehold.co/800x600/e0f2f1/00897b?text=Compact+Room', 0, true, '室内');

  -- 物件3の設備
  INSERT INTO hn_pi_property_amenities (property_id, amenity_type)
  VALUES
    (v_property_3, 'air_conditioner'),
    (v_property_3, 'auto_lock'),
    (v_property_3, 'intercom');

  -- ============================================================
  -- 物件4: 賃貸マンション（大阪府）
  -- ============================================================
  INSERT INTO hn_pi_properties (
    id, created_by, name, property_type, transaction_type, status,
    postal_code, prefecture, city, address_line, building_name,
    latitude, longitude,
    price, area_sqm, layout, building_age,
    floor_number, total_floors,
    description, parking_available, pet_allowed,
    nearest_station, walk_minutes
  ) VALUES (
    gen_random_uuid(), v_user_id,
    '梅田駅近くのデザイナーズマンション', 'mansion', 'rent', 'published',
    '530-0001', '大阪府', '大阪市北区', '梅田1-2-3', 'アーバンライフ梅田',
    34.7024, 135.4959,
    150000, 45.0, '1LDK', 2,
    10, 15,
    'おしゃれなデザイナーズマンション。梅田駅から徒歩5分の好立地。カウンターキッチン・ウォークインクローゼット付き。',
    false, true,
    '梅田駅', 5
  ) RETURNING id INTO v_property_4;

  -- 物件4の画像
  INSERT INTO hn_pi_property_images (property_id, image_url, display_order, is_main, caption)
  VALUES
    (v_property_4, 'https://placehold.co/800x600/fff9c4/f9a825?text=Modern+Interior', 0, true, 'モダンな内装'),
    (v_property_4, 'https://placehold.co/800x600/ffebee/e53935?text=Kitchen+Counter', 1, false, 'カウンターキッチン');

  -- 物件4の設備
  INSERT INTO hn_pi_property_amenities (property_id, amenity_type)
  VALUES
    (v_property_4, 'air_conditioner'),
    (v_property_4, 'counter_kitchen'),
    (v_property_4, 'walk_in_closet'),
    (v_property_4, 'separate_bathroom'),
    (v_property_4, 'washlet');

  -- ============================================================
  -- 物件5: 下書き物件（東京都）
  -- ============================================================
  INSERT INTO hn_pi_properties (
    id, created_by, name, property_type, transaction_type, status,
    postal_code, prefecture, city, address_line,
    latitude, longitude,
    price, area_sqm, layout, building_age,
    description, parking_available, pet_allowed,
    nearest_station, walk_minutes
  ) VALUES (
    gen_random_uuid(), v_user_id,
    '下書き：品川駅近マンション（準備中）', 'mansion', 'sale', 'draft',
    '108-0075', '東京都', '港区', '港南2-1-1',
    35.6284, 139.7387,
    95000000, 75.0, '3LDK', 1,
    '※この物件は下書き状態です。一般ユーザーには表示されません。',
    true, false,
    '品川駅', 5
  ) RETURNING id INTO v_property_5;

  -- 物件5の設備
  INSERT INTO hn_pi_property_amenities (property_id, amenity_type)
  VALUES
    (v_property_5, 'air_conditioner');

  -- 完了メッセージ
  RAISE NOTICE '✅ サンプルデータの作成が完了しました！';
  RAISE NOTICE '作成された物件数: 5件';
  RAISE NOTICE '- 公開物件: 4件';
  RAISE NOTICE '- 下書き物件: 1件（自分のみ閲覧可能）';
  RAISE NOTICE '';
  RAISE NOTICE '次のステップ:';
  RAISE NOTICE '1. http://localhost:3000/test/properties でデータを確認';
  RAISE NOTICE '2. http://localhost:3000/test/create-property で新規作成をテスト';
END $$;
