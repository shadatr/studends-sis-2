'use client';
import { PersonalInfoType, StudentClassType } from '@/app/types/types';
import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';

const Page = ({ params }: { params: { id: number } }) => {
  const [students, setStudents] = useState<StudentClassType[]>([]);
  const [studentsNames, setStudentsNames] = useState<PersonalInfoType[]>([]);
  const printableContentRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if(typeof window !== 'undefined'){
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`/api/exams/examRes/${params.id}/section`);
        const message: StudentClassType[] = response.data.message;
        setStudents(message);

        
        const resp = await axios.get(`/api/getAll/student`);
        const personalInfoMessage: PersonalInfoType[] = resp.data.message;
        setStudentsNames(personalInfoMessage);

      } catch (error) {
        console.error(error);
      }
    };
    fetchPosts();}
  }, [params.id]);


  const handleSubmit = (name:string) => {
    if(typeof window !== 'undefined'){
    axios
      .post(`/api/exams/submitGrades/${params.id}/${name}`, 'true')
      .then(() => {
        toast.success('تم موافقة على الدرجات بنجاح');
      })
      .catch((error) => {
        console.error(error);
        toast.error('حدث خطأ اثناء موافقة على الدرجات');
      });}
  };

  const handlePrint = useReactToPrint({
    content: () => printableContentRef.current,
  });

  return (
    <div className="flex absolute flex-col w-4/5 justify-center items-center">
      <div className="flex ">
        <button
          onClick={handlePrint}
          className="flex bg-green-500 hover:bg-green-600 p-1 m-2 text-white rounded-md w-[200px] justify-center items-center"
        >
          طباعة درجات
        </button>
        <button
          className="m-2 bg-darkBlue hover:bg-blue-800  text-secondary p-1 rounded-md w-[250px]"
          type="submit"
          onClick={() => handleSubmit('mid_publish')}
        >
          موافقة على درجات الامتحان النصفي
        </button>
        <button
          className="m-2 bg-darkBlue hover:bg-blue-800  text-secondary p-1 rounded-md w-[250px]"
          type="submit"
          onClick={() => handleSubmit('final_publish')}
        >
          موافقة على درجات الامتحان النهائي
        </button>
        <button
          className="m-2 bg-darkBlue hover:bg-blue-800  text-secondary p-1 rounded-md w-[200px]"
          type="submit"
          onClick={() => handleSubmit('class_work_publish')}
        >
          موافقة على درجات اعمال السنة
        </button>
        <button
          className="m-2 bg-darkBlue hover:bg-blue-800  text-secondary p-3 rounded-md w-[200px]"
          type="submit"
          onClick={() => handleSubmit('result_publish')}
        >
          موافقة النتيجة النهائية
        </button>
      </div>
      <div ref={printableContentRef}>
        <table className="border-collapse mt-8 w-[1100px] ref={printableContentRef}">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">
                المعلومات الشخصية
              </th>
              <th className="border border-gray-300 px-4 py-2"> النتيجة</th>
              <th className="border border-gray-300 px-4 py-2"> المجموع</th>
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
                  <td
                    className={`border border-gray-300 px-4 py-2 ${
                      user.pass
                        ? 'text-green-600 hover:text-green-700'
                        : 'text-red-500 hover:text-red-600'
                    }`}
                  >
                    {user.pass == null ? '' : user.pass ? 'ناجح' : 'راسب'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {user.result}
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
