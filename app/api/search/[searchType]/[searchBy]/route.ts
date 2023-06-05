import { Database } from '@/app/types/supabase';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function GET(
  request: Request,
  { params }: { params: { searchType: string; searchBy: string } }
) {
  console.log(params.searchBy);
  console.log(params.searchType);

  const tableName = `tb_${params.searchType}`;
  console.log(typeof params.searchBy);
  // const num = parseInt(params.searchBy);
  console.log(!isNaN(Number(params.searchBy)));

  if (!isNaN(Number(params.searchBy))) {
    const data = await supabase
      .from(tableName)
      .select('*')
      .eq('id', params.searchBy);
    console.log(data);
    console.log(data.error?.message);
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
    console.log(data);
    console.log(data.error?.message);
    const data2 = JSON.stringify(data.data);
    if (data2.length == 0) {
      return new Response(JSON.stringify({ message: 'لا يوجد نتائج' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ message: data.data }));
  }
}
