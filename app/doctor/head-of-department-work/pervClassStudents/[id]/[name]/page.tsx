'use client';
import { PersonalInfoType, StudentClassType } from '@/app/types/types';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

const Page = ({ params }: { params: { id: number , name:string} }) => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'doctor' : false) {
    redirect('/');
  }
  const [students, setStudents] = useState<StudentClassType[]>([]);
  const [studentsNames, setStudentsNames] = useState<PersonalInfoType[]>([]);
    const printableContentRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fetchPosts = async () => {
        try {
          const response = await axios.get(
            `/api/exams/previousClassExams/${params.id}/${params.name}`
          );
          const message: StudentClassType[] = response.data.message;
          setStudents(message);
            console.log(message);

          const resp = await axios.get(`/api/getAll/student`);
          const personalInfoMessage: PersonalInfoType[] = resp.data.message;
          setStudentsNames(personalInfoMessage);
        } catch (error) {
          console.error(error);
        }
      };
      fetchPosts();
    }
  }, [params.id, params.name]);

    const handlePrint = useReactToPrint({
      content: () => printableContentRef.current,
    });

  return (
    <div className="flex lg:absolute flex-col lg:w-[80%] sm:w-[100%] justify-center items-center sm:text-[8px] lg:text-[16px]">
      <button
        onClick={handlePrint}
        className="flex bg-green-500 hover:bg-green-600 p-2 m-5 text-white rounded-md w-[200px] justify-center items-center sm:block"
      >
        طباعة درجات
      </button>
      <div ref={printableContentRef}>
        <table className="border-collapse mt-8 lg:w-[900px] sm:w-[350px]">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                المعلومات الشخصية
              </th>
              <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                اعمال السنة
              </th>
              <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                الامتحان النهائي
              </th>
              <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                الامتحان النصفي
              </th>
              <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                رقم الطالب
              </th>
              <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                لقب
              </th>
              <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                اسم
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((user, index) => {
              const student = studentsNames.find(
                (student) => student.id === user.student_id
              );
              return (
                <tr key={index}>
                  <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                    <Link
                      href={`/management/personalInformation/student/${user.student_id}`}
                      className="bg-blue-500 hover:bg-blue-600 p-2 text-white rounded-md inline-block"
                    >
                      الملف الشخصي
                    </Link>
                  </td>

                  <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                    {user.class_work}
                  </td>

                  <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                    {user.final}
                  </td>
                  <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                    {user.midterm}
                  </td>
                  <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                    {student?.id}
                  </td>
                  <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                    {student?.surname}
                  </td>
                  <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                    {student?.name}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Page;
