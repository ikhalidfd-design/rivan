-- =====================================================================
-- Seed — بيئة التطوير والاختبار المحلية فقط
-- منظمتان + مستخدمان + وحدات وحجوزات لتشغيل RLS/E2E
-- =====================================================================

-- مستخدما اختبار: a@ruwaq.test (منظمة A) / b@ruwaq.test (منظمة B)
-- كلمة المرور للجميع: password123

insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
                        email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
                        created_at, updated_at, confirmation_token, recovery_token,
                        email_change, email_change_token_new,
                        phone_change, phone_change_token)
values
  ('11111111-1111-4111-8111-111111111111', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'a@ruwaq.test', crypt('password123', gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"مالك المنظمة أ"}'::jsonb,
   now(), now(), '', '',
   '', '', '', ''),
  ('22222222-2222-4222-8222-222222222222', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'b@ruwaq.test', crypt('password123', gen_salt('bf')),
   now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"مالك المنظمة ب"}'::jsonb,
   now(), now(), '', '',
   '', '', '', '');

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values
  (gen_random_uuid(), '11111111-1111-4111-8111-111111111111', 'a@ruwaq.test',
   '{"sub":"11111111-1111-4111-8111-111111111111","email":"a@ruwaq.test"}'::jsonb, 'email', now(), now(), now()),
  (gen_random_uuid(), '22222222-2222-4222-8222-222222222222', 'b@ruwaq.test',
   '{"sub":"22222222-2222-4222-8222-222222222222","email":"b@ruwaq.test"}'::jsonb, 'email', now(), now(), now());

-- المنظمتان (بعضوية المالك عبر trigger الـonboarding؟ لا — مباشرة هنا للـseed)
insert into organizations (id, name, slug) values
  ('aaaa0000-0000-4000-8000-00000000000a', 'إدارة الوحدات أ', 'org-a'),
  ('bbbb0000-0000-4000-8000-00000000000b', 'إدارة الوحدات ب', 'org-b');

insert into memberships (org_id, user_id, role) values
  ('aaaa0000-0000-4000-8000-00000000000a', '11111111-1111-4111-8111-111111111111', 'org_owner'),
  ('bbbb0000-0000-4000-8000-00000000000b', '22222222-2222-4222-8222-222222222222', 'org_owner');

insert into org_subscriptions (org_id, plan_id, interval, status, trial_ends_at, current_period_end)
values
  ('aaaa0000-0000-4000-8000-00000000000a', 'trial', 'monthly', 'trialing', now() + interval '14 days', now() + interval '14 days'),
  ('bbbb0000-0000-4000-8000-00000000000b', 'pro', 'yearly', 'active', null, now() + interval '1 year');

insert into properties (id, org_id, name, city) values
  ('cccc0000-0000-4000-8000-00000000000a', 'aaaa0000-0000-4000-8000-00000000000a', 'برج الياسمين', 'الرياض'),
  ('dddd0000-0000-4000-8000-00000000000b', 'bbbb0000-0000-4000-8000-00000000000b', 'شاليهات الخليج', 'الخبر');

insert into units (id, org_id, property_id, name, slug, is_published, capacity, base_price, weekend_price, cleaning_fee, min_nights)
values
  ('eeee0000-0000-4000-8000-00000000000a', 'aaaa0000-0000-4000-8000-00000000000a', 'cccc0000-0000-4000-8000-00000000000a',
   'شقة الياسمين 1', 'yasmin-1', true, 4, 350, 450, 80, 1),
  ('eeee0000-0000-4000-8000-00000000000b', 'aaaa0000-0000-4000-8000-00000000000a', 'cccc0000-0000-4000-8000-00000000000a',
   'شقة الياسمين 2', 'yasmin-2', false, 4, 350, 450, 80, 2),
  ('ffff0000-0000-4000-8000-00000000000b', 'bbbb0000-0000-4000-8000-00000000000b', 'dddd0000-0000-4000-8000-00000000000b',
   'شاليه الخليج الكبير', 'khobar-chalet', true, 10, 1200, 1500, 200, 2);

-- حجز مؤكد + كتلة iCal في المنظمة A
insert into bookings (org_id, unit_id, kind, status, source, check_in, check_out, guests,
                      guest_name, guest_phone, total_amount)
values
  ('aaaa0000-0000-4000-8000-00000000000a', 'eeee0000-0000-4000-8000-00000000000a', 'booking', 'confirmed',
   'manual', current_date + 3, current_date + 6, 3, 'ضيف تجريبي', '0500000001', 1180);

insert into bookings (org_id, unit_id, kind, status, source, check_in, check_out, external_ref)
values
  ('aaaa0000-0000-4000-8000-00000000000a', 'eeee0000-0000-4000-8000-00000000000a', 'block', 'confirmed',
   'ical', current_date + 10, current_date + 12, 'airbnb-fixture-uid-1');
