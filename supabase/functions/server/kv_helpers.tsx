import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const client = () => createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
);

// Get key-value pairs by prefix, returning both key and value
export const getByPrefixWithKeys = async (prefix: string): Promise<{ key: string; value: any }[]> => {
  const supabase = client();
  const { data, error } = await supabase.from("kv_store_ec49694e").select("key, value").like("key", prefix + "%");
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
};
