import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

export const dynamic = 'force-dynamic';

export async function GET() {
  try {

    const dataCoursePrerequisties = await supabase
      .from('tb_prerequisites_courses')
      .select('*');

    return new Response(JSON.stringify({ message: dataCoursePrerequisties.data }), {
      status: 200,
      headers: { revalidate: dynamic },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
    });
  }
}
