import {
  CourseType,
  ClassesType,
  PersonalInfoType,
  SectionType,
} from '@/app/types/types';
import { Client } from 'pg';


export async function GET(
  request: Request,
  { params }: { params: { id: number, name:string } }
) {
  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      host: process.env.DB_HOST || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });
    
    const classQuery = `SELECT * FROM tb_classes WHERE section_id = $1 AND semester = $2`;
    const classValues = [params.id, params.name];
    const classResult = await client.query(classQuery, classValues);
    const classes: ClassesType[] = classResult.rows;

    const sectionQuery = `SELECT * FROM tb_section WHERE id = $1`;
    const sectionValues = [params.id];
    const sectionResult = await client.query(sectionQuery, sectionValues);
    const sections: SectionType[] = sectionResult.rows;

    const doctorQuery = `SELECT * FROM tb_doctors`;
    const doctorResult = await client.query(doctorQuery);
    const doctors: PersonalInfoType[] = doctorResult.rows;

    const courseQuery = `SELECT * FROM tb_courses`;
    const courseResult = await client.query(courseQuery);
    const courses: CourseType[] = courseResult.rows;

    const data = classes?.map((cls) => {
      const secInfo = sections?.find((sec) => cls.section_id === sec.id);
      const docto = doctors?.find((doc) => doc.id === cls.doctor_id);
      const cours = courses?.find((co) => co.id === secInfo?.course_id);
      console.log(cours);
      return {
        class: cls,
        course: cours,
        doctor: docto,
        section: secInfo,
      };
    });


    return new Response(JSON.stringify({ message: data }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'An error occurred' }), {
      status: 500,
    });
  }
}