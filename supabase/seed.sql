-- Demo Content only: not tested or approved launch inventory. No production image bytes are seeded.
insert into public.categories (id, slug, name) values
  ('00000000-0000-4000-8000-000000000101', 'product-photography', 'Product Photography · Demo Content'),
  ('00000000-0000-4000-8000-000000000102', 'draft-only', 'Draft-only · Demo Content');
insert into public.models (id, slug, name) values
  ('00000000-0000-4000-8000-000000000201', 'demo-image-model', 'Demo Image Model'),
  ('00000000-0000-4000-8000-000000000202', 'draft-only-model', 'Draft-only Model');
insert into public.tags (id, slug, name) values
  ('00000000-0000-4000-8000-000000000301', 'studio-lighting', 'Studio Lighting · Demo Content'),
  ('00000000-0000-4000-8000-000000000302', 'draft-only-tag', 'Draft-only Tag');
insert into public.use_cases (id, slug, name) values
  ('00000000-0000-4000-8000-000000000401', 'product-ad', 'Product Ad · Demo Content'),
  ('00000000-0000-4000-8000-000000000402', 'draft-only-use-case', 'Draft-only Use Case');
insert into public.media_assets (id, bucket, storage_path, mime_type, byte_size, width, height) values
  ('00000000-0000-4000-8000-000000000501', 'prompt-previews', 'demo/free-product-preview.webp', 'image/webp', 1024, 1200, 1200),
  ('00000000-0000-4000-8000-000000000502', 'prompt-previews', 'demo/draft-only-preview.webp', 'image/webp', 1024, 1200, 1200);
insert into public.prompts (id, slug, title, short_description, access_type, category_id, aspect_ratio, orientation, status, published_at) values
  ('00000000-0000-4000-8000-000000000601', 'demo-studio-product', 'Demo Content: Studio Product', 'Unvalidated example recipe for local development only.', 'FREE', '00000000-0000-4000-8000-000000000101', '1:1', 'SQUARE', 'PUBLISHED', '2026-10-01T00:00:00Z'),
  ('00000000-0000-4000-8000-000000000602', 'demo-draft-product', 'Demo Content: Draft Product', 'Non-public example for policy checks.', 'FREE', '00000000-0000-4000-8000-000000000102', '1:1', 'SQUARE', 'DRAFT', null);
insert into public.prompt_contents (prompt_id, prompt_template, generation_notes) values
  ('00000000-0000-4000-8000-000000000601', 'Make a studio product image of {product} on {background} with soft lighting.', 'Demo Content; not tested against a model.'),
  ('00000000-0000-4000-8000-000000000602', 'PRIVATE DRAFT RECIPE {product}', 'Non-public Demo Content');
insert into public.prompt_variables (id, prompt_id, key, label, default_value, required, sort_order) values
  ('00000000-0000-4000-8000-000000000701', '00000000-0000-4000-8000-000000000601', 'product', 'Product', null, true, 0),
  ('00000000-0000-4000-8000-000000000702', '00000000-0000-4000-8000-000000000601', 'background', 'Background', 'neutral backdrop', false, 1),
  ('00000000-0000-4000-8000-000000000703', '00000000-0000-4000-8000-000000000602', 'product', 'Private draft variable', null, true, 0);
insert into public.prompt_images (id, prompt_id, media_asset_id, alt_text, is_primary) values
  ('00000000-0000-4000-8000-000000000801', '00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000501', 'Illustrative preview metadata for Demo Content; no image uploaded.', true),
  ('00000000-0000-4000-8000-000000000802', '00000000-0000-4000-8000-000000000602', '00000000-0000-4000-8000-000000000502', 'Private draft preview metadata.', true);
insert into public.prompt_models (prompt_id, model_id) values
  ('00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000201'),
  ('00000000-0000-4000-8000-000000000602', '00000000-0000-4000-8000-000000000202');
insert into public.prompt_tags (prompt_id, tag_id) values
  ('00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000301'),
  ('00000000-0000-4000-8000-000000000602', '00000000-0000-4000-8000-000000000302');
insert into public.prompt_use_cases (prompt_id, use_case_id) values
  ('00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000401'),
  ('00000000-0000-4000-8000-000000000602', '00000000-0000-4000-8000-000000000402');
