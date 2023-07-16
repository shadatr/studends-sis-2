import { Client } from 'pg';
import { ClassesType, Section2Type } from '@/app/types/types';


export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  try {
    const client = new Client({
      user: process.env.DB_USERNAME || '',
      password: process.env.DB_PASSWORD || '',
      host: process.env.DB_HOST || '',
      database: process.env.DB_NAME || '',
      port: Number(process.env.DB_PORT),
    });

    await client.connect();

    const classesQueryResult = await client.query(
      'SELECT * FROM tb_classes WHERE doctor_id = $1',
      [params.id]
    );

    const classesData = classesQueryResult.rows as ClassesType[];

    const sectionPromises = classesData.map(async (classItem) => {
      const sectionQueryResult = await client.query(
        'SELECT * FROM tb_section WHERE id = $1',
        [classItem.section_id]
      );

      const sectionData = sectionQueryResult.rows as Section2Type[];

      return sectionData.map((sectionItem) => ({
        class_id: classItem.id,
        id: sectionItem.id,
        course_id: sectionItem.course_id,
        name: sectionItem.name,
        students_num: sectionItem.students_num,
      }));
    });

    const sectionData = await Promise.all(sectionPromises);
    const sections: Section2Type[] = sectionData.flat();

    await client.end();

    return new Response(JSON.stringify({ message: sections }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(null, { status: 500 });
  }
}
