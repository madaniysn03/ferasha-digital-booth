
DO $$
DECLARE
  test_uid uuid := '22222222-2222-2222-2222-222222222222';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = test_uid) THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', test_uid, 'authenticated', 'authenticated',
      'demo@ferasha.app', crypt('Demo1234!', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Demo Ferasha"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), test_uid,
      jsonb_build_object('sub', test_uid::text, 'email', 'demo@ferasha.app', 'email_verified', true),
      'email', test_uid::text, now(), now(), now());
  END IF;

  INSERT INTO public.profiles (id, full_name)
  VALUES (test_uid, 'Demo Ferasha')
  ON CONFLICT (id) DO NOTHING;
END $$;
