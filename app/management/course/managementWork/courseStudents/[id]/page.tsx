'use client';
import { PersonalInfoType, StudentClassType } from '@/app/types/types';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

const Page = ({ params }: { params: { id: number } }) => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    throw new Error('Unauthorized');
  }
  const [students, setStudents] = useState<StudentClassType[]>([]);
  const [studentsNames, setStudentsNames] = useState<PersonalInfoType[]>([]);
    const printableContentRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fetchPosts = async () => {
        try {
          const response = await axios.get(
            `/api/exams/examRes/${params.id}/section`
          );
          const message: StudentClassType[] = response.data.message;
          const resp = await axios.get(`/api/getAll/student`);
          const personalInfoMessage: PersonalInfoType[] = resp.data.message;
          setStudentsNames(personalInfoMessage);
          setStudents(message);
        } catch (error) {
          console.error(error);
        }
      };
      fetchPosts();
    }
  }, [params.id]);

    const handlePrint = useReactToPrint({
      content: () => printableContentRef.current,
    });

  return (
    <div className="flex absolute flex-col w-4/5 justify-center items-center">
      <button
        onClick={handlePrint}
        className="flex bg-green-500 hover:bg-green-600 p-2 m-5 text-white rounded-md w-[200px] justify-center items-center"
      >
        طباعة درجات
      </button>
      <div ref={printableContentRef}>
        <table className="border-collapse mt-8 w-[900px]">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">
                المعلومات الشخصية
              </th>
              <th className="border border-gray-300 px-4 py-2">اعمال السنة</th>
              <th className="border border-gray-300 px-4 py-2">
                الامتحان النهائي
              </th>
              <th className="border border-gray-300 px-4 py-2">
                الامتحان النصفي
              </th>
              <th className="border border-gray-300 px-4 py-2">رقم الطالب</th>
              <th className="border border-gray-300 px-4 py-2">لقب</th>
              <th className="border border-gray-300 px-4 py-2">اسم</th>
            </tr>
          </thead>
          <tbody>
            {students.map((user, index) => {
              const student = studentsNames.find(
                (student) => student.id === user.student_id
              );
              return (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">
                    <Link
                      href={`/doctor/personalInformation/student/${user.student_id}`}
                      className="bg-blue-500 hover:bg-blue-600 p-2 text-white rounded-md inline-block"
                    >
                      الملف الشخصي
                    </Link>
                  </td>

                  <td className="border border-gray-300 px-4 py-2">
                    {user.class_work}
                  </td>

                  <td className="border border-gray-300 px-4 py-2">
                    {user.final}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {user.midterm}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {student?.id}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {student?.surname}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
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
