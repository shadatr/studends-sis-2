'use client';
import { PersonalInfoType, StudentClassType } from '@/app/types/types';
import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const Page = ({ params }: { params: { id: number } }) => {
    const [students, setStudents] = useState<StudentClassType[]>([]);
    const [studentsNames, setStudentsNames] = useState<PersonalInfoType[]>([]);
    const [num, setNum] = useState<number>(0);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`/api/examRes/${params.id}`);
        const message: StudentClassType[] = response.data.message;
        const resp = await axios.get(`/api/student`);
        console.log(resp.data.message);
        const personalInfoMessage: PersonalInfoType[] = resp.data.message;
        setStudentsNames(personalInfoMessage);
        setStudents(message);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPosts();
  }, [params.id]);


  return (
    <div className="flex absolute flex-col w-4/5">
      <table className="border-collapse mt-8">
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
          {students.map((user) => {
            return studentsNames.map((student, innerIndex) =>
              user.student_id == student.id ? (
                <tr key={innerIndex}>
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
                    {student.id}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {student.surname}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {student.name}
                  </td>
                </tr>
              ) : (
                ''
              )
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Page;
