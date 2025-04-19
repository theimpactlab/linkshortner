// This file contains the database schema for reference
// You'll need to create these tables in your Supabase dashboard

/*
Table: links
- id: uuid (primary key, default: uuid_generate_v4())
- short_code: text (unique, not null)
- original_url: text (not null)
- user_id: uuid (references auth.users.id)
- clicks: integer (default: 0)
- active: boolean (default: true)
- expires_at: timestamp with time zone
- created_at: timestamp with time zone (default: now())
- updated_at: timestamp with time zone (default: now())

Table: clicks
- id: uuid (primary key, default: uuid_generate_v4())
- link_id: uuid (references links.id)
- referrer: text
- user_agent: text
- ip_address: text
- created_at: timestamp with time zone (default: now())

Table: telegram_users
- id: uuid (primary key, default: uuid_generate_v4())
- user_id: uuid (references auth.users.id)
- telegram_chat_id: text (unique, not null)
- created_at: timestamp with time zone (default: now())
*/
