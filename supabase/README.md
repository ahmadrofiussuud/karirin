# ARAH accounts and workspace storage

The client uses Supabase Auth for email/password registration, confirmation,
login, and logout. Passwords are handled by Supabase, never by workspace tables.

Apply `migrations/202611010001_workspace.sql` once to a new project. The
`workspaces` table holds one versioned JSON workspace per authenticated user.
RLS limits SELECT, INSERT, and UPDATE to `auth.uid() = user_id`. The anonymous
role has no table privileges. The browser uses only the publishable key.

Copy `.env.example` to `.env.local` and supply the project URL and publishable
key. Add the same variables to Vercel before building. Never expose secret or
service-role keys with a `NEXT_PUBLIC_` prefix.

Set the Supabase Auth Site URL to the production origin and allow only owned
production or local origins in redirect URLs. Email confirmation remains enabled.

In the interface, local notes save automatically. Signed-in users explicitly
select **Akun → Simpan ke akun** to persist a snapshot remotely. Existing cloud
notes load on login. Guest notes use a separate browser storage key. Writes use
the expected revision to reject overwriting newer data from another device.

Acceptance checks:

1. Register, confirm the email, and log in.
2. Edit the profile, save an opportunity, and change a task or reflection.
3. Save through the account panel, then sign out and log in again.
4. Confirm that the saved snapshot returns and guest notes remain separate.
5. With a second account, confirm that the first account's workspace is invisible.
6. From two sessions on the same account, save in one then save in the other;
   the older revision must show a conflict instead of replacing newer data.

Gemini integration is a separate step and is not enabled by these changes.
