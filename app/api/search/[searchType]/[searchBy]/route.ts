import { Database } from '@/app/types/supabase';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { searchType: string; searchBy: string } }
) {

  const tableName = `tb_${params.searchType}`;

  if (!isNaN(Number(params.searchBy))) {
    const data = await supabase
      .from(tableName)
      .select('*')
      .eq('number', params.searchBy);

    const data2 = JSON.stringify(data.data);
    if (data2.length == 0) {
      return new Response(JSON.stringify({ message: 'لا يوجد نتائج' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ message: data.data }));
  } else {
    const data = await supabase
      .from(tableName)
      .select('*')
      .textSearch('name', (params.searchBy as string).split(' ')[0]);

    const data2 = JSON.stringify(data.data);
    if (data2.length == 0) {
      return new Response(JSON.stringify({ message: 'لا يوجد نتائج' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ message: data.data }), {
      status: 200,
      headers: { revalidate: dynamic },
    });
  }
}
