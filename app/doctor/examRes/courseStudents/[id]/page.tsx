'use client';
import {
  PersonalInfoType,
  StudentClassType,
} from '@/app/types/types';
import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const Page = ({ params }: { params: { id: number } }) => {
  const [students, setStudents] = useState<StudentClassType[]>([]);
  const [studentsNames, setStudentsNames] = useState<PersonalInfoType[]>([]);
  const [edit, setEdit] = useState(false);
  const [editMid, setEditMid] = useState(false);
  const [editFinal, setEditFinal] = useState(false);
  const [editHw, setEditHw] = useState(false);

  const [grades, setGrades] = useState<StudentClassType[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`/api/examRes/${params.id}/section`);
        const message: StudentClassType[] = response.data.message;
        const resp = await axios.get(`/api/student`);
        const personalInfoMessage: PersonalInfoType[] = resp.data.message;
        setStudentsNames(personalInfoMessage);
        setStudents(message);
        setGrades(message);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPosts();
  }, [edit, params.id]);



  const handleGradeChange = (
    studentId: number,
    exam: string,
    grade: string
  ) => {
    const updatedGrades = grades.map((gradeObj) => {
      if (gradeObj.student_id == studentId) {
        return {
          ...gradeObj,
          [exam]: grade,
        };
      }
      return gradeObj;
    });

    setGrades(updatedGrades);
  };

  const handleSubmit = (name:string) => {
    setEditMid(false);
    setEditFinal(false);
    setEditHw(false);
    setEdit(!edit);
    console.log('Submitted grades:', grades);
    axios
      .post(`/api/examRes/${params.id}/${name}`, grades)
      .then(() => {
        toast.success('تم نشر الدرجات بنجاح');
      })
      .catch((error) => {
        console.error(error);
        toast.error('حدث خطأ اثناء نشر الدرجات');
      });
  };

  return (
    <div className="flex absolute flex-col w-4/5">
      <form onSubmit={(e) => e.preventDefault()}>
        <button
        className='m-10'
          type="submit"
          onClick={() => (editHw ? handleSubmit("class_work") : setEditHw(!editHw))}
        >
          {editHw ? 'ارسال' : 'hwتعديل'}
        </button>
        <button
          type="submit"
          onClick={() => editFinal ? handleSubmit("final") : setEditFinal(!editFinal)}
        >
          {editFinal ? 'ارسال' : 'finتعديل'}
        </button>
        <button
          type="submit"
          onClick={() => editMid ? handleSubmit("midterm") : setEditMid(!editMid)
          }
        >
          {editMid ? 'ارسال' : 'midتعديل'}
        </button>
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
                  {editHw ? (
                    <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                      <input
                        className="text-right px-4 py-2 bg-lightBlue w-[100px]"
                        key={user.student_id}
                        value={
                          grades.find(
                            (gradeObj) =>
                              gradeObj.student_id === user.student_id
                          )?.class_work || ''
                        }
                        onChange={(e) => {
                          handleGradeChange(
                            user.student_id,
                            'class_work',
                            e.target.value
                          );
                        }}
                        placeholder="ادخل الدرجة"
                      />
                    </td>
                  ) : (
                    <td className="border border-gray-300 px-4 py-2">
                      {user.class_work}
                    </td>
                  )}
                  {editFinal ? (
                    <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                      <input
                        className="text-right px-4 py-2 bg-lightBlue w-[120px]"
                        key={user.student_id}
                        value={
                          grades.find(
                            (gradeObj) =>
                              gradeObj.student_id === user.student_id
                          )?.final || ''
                        }
                        onChange={(e) => {
                          handleGradeChange(
                            user.student_id,
                            'final',
                            e.target.value
                          );
                        }}
                        placeholder="ادخل الدرجة"
                      />
                    </td>
                  ) : (
                    <td className="border border-gray-300 px-4 py-2">
                      {user.final}
                    </td>
                  )}
                  {editMid ? (
                    <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                      <input
                        className="text-right px-4 py-2 bg-lightBlue w-[120px]"
                        key={user.student_id}
                        value={
                          grades.find(
                            (gradeObj) =>
                              gradeObj.student_id === user.student_id
                          )?.midterm || ''
                        }
                        onChange={(e) => {
                          handleGradeChange(
                            user.student_id,
                            'midterm',
                            e.target.value
                          );
                        }}
                        placeholder="ادخل الدرجة"
                      />
                    </td>
                  ) : (
                    <td className="border border-gray-300 px-4 py-2">
                      {user.midterm}
                    </td>
                  )}
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
      </form>
    </div>
  );
};

export default Page;
