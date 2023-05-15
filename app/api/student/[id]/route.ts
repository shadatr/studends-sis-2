import { createClient } from "@supabase/supabase-js";


const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_KEY || '');

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const student = params.id;
  try {
    const studentId = Number(student);
    const { data, error } = await supabase.from('tb_students').select('*').eq('id', studentId);
    if (error) {
      // return an error saying search failed in arabic
      return {
        status: 500,
        body: {
          message: 'حدث خطأ أثناء البحث'
        }
      };
    }
    if (data) {
      console.log(data);
      return new Response(JSON.stringify({"message":data}));
    }
  } catch {

  }

}