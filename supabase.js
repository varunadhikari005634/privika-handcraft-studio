const SUPABASE_URL =
    "https://jgyhxrxdpqfilyzzfttx.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_AkvNTfs2zCxR7TWdOkf1fg_6HzI3Jf1";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
