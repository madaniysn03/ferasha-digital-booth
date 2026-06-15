
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE POLICY "public_read_avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "auth_upload_avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "auth_update_avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "auth_delete_avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "public_read_logos" ON storage.objects FOR SELECT USING (bucket_id = 'ferasha-logos');
CREATE POLICY "auth_upload_logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'ferasha-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "auth_update_logos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'ferasha-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "auth_delete_logos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'ferasha-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "public_read_listings_files" ON storage.objects FOR SELECT USING (bucket_id = 'listings');
CREATE POLICY "auth_upload_listings_files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'listings' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "auth_update_listings_files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'listings' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "auth_delete_listings_files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'listings' AND (storage.foldername(name))[1] = auth.uid()::text);
