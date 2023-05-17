import { createClient } from "@supabase/supabase-js";
import { Database } from "@/app/types/supabase";

const supabase = createClient<Database>( process.env.SUPABASE_URL || '', process.env.SUPABASE_KEY || '');

export async function GET() {
  const fetchDoctorsQuery = supabase.from('tb_doctors').select('*').order('id');
  const fetchDepartmentsQuery = supabase.from('tb_departments').select('*');
  const [doctorsResponse, departmentsResponse] = await Promise.all([
    fetchDoctorsQuery,
    fetchDepartmentsQuery,
  ]);
  if (doctorsResponse.error) {
    throw doctorsResponse.error;
  }
  if (departmentsResponse.error) {
    throw departmentsResponse.error;
  }

  const doctors = doctorsResponse.data;
  const departments = departmentsResponse.data;

  const data = doctors.map((doctor) => {
    const department = departments.find(
      (department) => department.id === doctor.head_of_deparment_id
    );
    return {
      id: doctor.id,
      name: doctor.name,
      surname: doctor.surname,
      doctorSince : doctor.enrollment_date,
      email : doctor.email,
      department: department,
    };
  });
  return new Response(JSON.stringify({message : data}), {
    headers: { 'content-type': 'application/json' },
  });
}