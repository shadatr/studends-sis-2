import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export async function POST(
  request: Request,
  { params }: { params: { id: number } }
) {
  // TODO: Maybe add some validation for security here

  const newData= await request.json();

  try {
    const updatePromises = await supabase
      .from('tb_doctors')
      .update(newData)
      .eq('id', params.id);

    console.log(updatePromises.error?.message);

    return new Response(
      JSON.stringify({ message: 'تم تحديث البيانات بنجاح' }),
      {
        headers: { 'content-type': 'application/json' },
      }
    );
  } catch (error) {
    // send a 400 response with an error happened during update in Arabic
    return new Response(
      JSON.stringify({ message: 'حدث خطأ أثناء تحديث البيانات' }),
      { headers: { 'content-type': 'application/json' }, status: 400 }
    );
  }
}
