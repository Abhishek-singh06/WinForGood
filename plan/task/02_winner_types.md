# Task 02: Winner Verification Domain Types & Upload Validation Config

## Contexto
Define the TypeScript types, interfaces, and file upload validation configuration ensuring non-restrictive file format acceptance and clear file size / ownership rules.

## Subtareas
- [x] Create `src/lib/winners/types.ts`:
  - Extended `WinnerDetailRecord` including profile information (`full_name`, `email`), draw details (`draw_number`, `month`), timestamps, and review state.
  - Action responses and mutation payloads.
- [x] Create `src/lib/winners/config.ts`:
  - File upload constraints: generous 20 MB max file size.
  - Non-restrictive format support: `image/png`, `image/jpeg`, `image/webp`, `image/gif`, `image/heic`, `image/heif`, `application/pdf`, etc.
  - Validation helper function: `validateProofFile(file: { size: number; type: string; name: string })`.
