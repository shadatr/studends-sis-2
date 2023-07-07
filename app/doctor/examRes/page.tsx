'use client';
import { ClassesInfoType, ClassesType, SectionType } from '@/app/types/types';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const Page = () => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'doctor' : false) {
    redirect('/');
  }
  // if user isn't a admin, throw an error
  const user = session.data?.user;
  const [sections, setSections] = useState<ClassesInfoType[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      if(user){
      const response = await axios.get(`/api/course/doctorCourses/${user?.id}`);
      const message: ClassesType[] = response.data.message;

      const classPromises = message.map(async (section) => {
        const responseReq = await axios.get(
          `/api/getAll/getAllClassInfo/${section.section_id}`
        );
        const { message: classMessage }: { message: ClassesInfoType[] } =
          responseReq.data;
        return classMessage;
      });
      const classData = await Promise.all(classPromises);
      const classes = classData.flat();
      setSections(classes);
    }};
    fetchPosts();
  }, [user]);

  return (
    <div className=" w-[80%] justify-center items-center flex p-10 absolute">
      <table className=" w-[800px] border-collapse">
        <thead>
          <tr>
            <th className="border px-4 py-2 bg-darkBlue text-secondary">
              اسم المادة
            </th>
          </tr>
        </thead>
        <tbody>
          {sections.map((item, index) => (
            <tr key={index}>
              <td className="border px-4 py-2 bg-lightBlue">
                <Link href={`/doctor/examRes/courseStudents/${item.section.id}`}>
                  {item.section.name}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Page;
