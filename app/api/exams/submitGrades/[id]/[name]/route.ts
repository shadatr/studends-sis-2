import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(
  request: Request,
  { params }: { params: { id: number ; name: string} }
) {
  const data1 = await request.json();
  const data2=await supabase
    .from('tb_classes')
    .update({ [params.name]: data1 })
    .eq('section_id', params.id);

  console.log(data2);

  return new Response(JSON.stringify({ message: 'تم حذف الاعلان بنجاح' }));
}
