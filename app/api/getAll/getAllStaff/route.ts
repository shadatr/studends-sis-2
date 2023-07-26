import { Database } from '@/app/types/supabase';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);
export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await supabase.from('tb_admins').select('*');

  if (result.error) {
    return { status: 400, body: { message: 'there is an error' } };
  }

  return new Response(JSON.stringify({ message: result.data }), {
    status: 200,
    headers: { revalidate: dynamic },
  });
}
