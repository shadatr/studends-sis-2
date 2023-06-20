'use client';
import {
  AddCourse2Type,
  ClassesType,
  GetPermissionDoctorType,
  PersonalInfoType,
  SectionType,
  StudentClassType,
} from '@/app/types/types';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const Page = ({ params }: { params: { id: number } }) => {

  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'doctor' : false) {
    throw new Error('Unauthorized');
  }
  const user = session.data?.user;

  const [students, setStudents] = useState<StudentClassType[]>([]);
  const [studentsNames, setStudentsNames] = useState<PersonalInfoType[]>([]);
  const [edit, setEdit] = useState(false);
  const [editMid, setEditMid] = useState(false);
  const [editFinal, setEditFinal] = useState(false);
  const [editHw, setEditHw] = useState(false);
  const [classes, setClasses] = useState<ClassesType[]>([]);
  const [grades, setGrades] = useState<StudentClassType[]>([]);
  const [perms, setPerms] = useState<GetPermissionDoctorType[]>([]);
  const [course, setCourse] = useState<AddCourse2Type[]>([]);

useEffect(() => {
  const fetchPosts = async () => {
    if (user) {
      const responsePerm = await axios.get(
        `/api/allPermission/doctor/selectedPerms/${user?.id}`
      );
      const messagePerm: GetPermissionDoctorType[] = responsePerm.data.message;
      setPerms(messagePerm);

      const response = await axios.get(
        `/api/exams/examRes/${params.id}/section`
      );
      const message: StudentClassType[] = response.data.message;
      setStudents(message);
      setGrades(message);

      const sectionResponse = await axios.get(
        `/api/getAll/getSpecificSection/${params.id}`
      );
      const sectionMessage: SectionType[] = sectionResponse.data.message;

      const CourseResponse = await axios.get(
        `/api/getAll/getSpecificCourse/${sectionMessage[0].course_id}`
      );
      const CourseMessage: AddCourse2Type[] = CourseResponse.data.message;

      setCourse(CourseMessage);

      const classesPromises = message.map(async (course) => {
        const responseReq = await axios.get(
          `/api/getAll/getSpecificClass/${course.class_id}`
        );
        const { message: classesMessage }: { message: ClassesType[] } =
          responseReq.data;
        return classesMessage;
      });

      const classesData = await Promise.all(classesPromises);
      const classes = classesData.flat();
      setClasses(classes);

      const resp = await axios.get(`/api/getAll/student`);
      const personalInfoMessage: PersonalInfoType[] = resp.data.message;
      setStudentsNames(personalInfoMessage);

      const updatedGradesResult = message.map((grade) => {
        const student = personalInfoMessage.find(
          (student) => student.id === grade.student_id
        );

        if (grade.student_id == student?.id) {
          if (grade.midterm && grade.final && grade.class_work) {
            if (
              CourseMessage[0].midterm &&
              CourseMessage[0].final &&
              CourseMessage[0].class_work
            ) {
              const avrg =
                (grade.midterm * CourseMessage[0].midterm) / 100 +
                (grade.final * CourseMessage[0].final) / 100 +
                (grade.class_work * CourseMessage[0].class_work) / 100;
              return {
                ...grade,
                result: avrg,
              };
            }
          }
        }
        return grade;
      });

      axios.post(`/api/exams/examRes/${params.id}/result`, updatedGradesResult);

      const updatedGradesPass = message.map((grade) => {
        const student = personalInfoMessage.find(
          (student) => student.id === grade.student_id
        );

        if (grade.student_id == student?.id) {
          if (grade.midterm && grade.final && grade.class_work) {
            if (
              CourseMessage[0].midterm &&
              CourseMessage[0].final &&
              CourseMessage[0].class_work
            ) {
              const avrg =
                (grade.midterm * CourseMessage[0].midterm) / 100 +
                (grade.final * CourseMessage[0].final) / 100 +
                (grade.class_work * CourseMessage[0].class_work) / 100;

              if (
                CourseMessage[0].passing_percentage &&
                CourseMessage[0].passing_percentage > avrg
              ) {
                return {
                  ...grade,
                  pass: false,
                };
              } else {
                return {
                  ...grade,
                  pass: true,
                };
              }
            }
          }
        }
        return grade;
      });

      axios.post(`/api/exams/examRes/${params.id}/pass`, updatedGradesPass);
    }
  };
  fetchPosts();
}, [edit, params.id, editMid, editFinal, editHw, user]);




  const handleGradeChange = (
    studentId: number,
    exam: string,
    grade: string
  ) => {
    const updatedGrades = grades.map((gradeObj) => {
      if (gradeObj.student_id == studentId) {
        return {
          ...gradeObj,
          [exam]: parseInt(grade),
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
      .post(`/api/exams/examRes/${params.id}/${name}`, grades)
      .then(() => {
        toast.success('تم نشر الدرجات بنجاح');
      })
      .catch((error) => {
        console.error(error);
        toast.error('حدث خطأ اثناء نشر الدرجات');
      });
  };

  return (
    <div className="flex absolute flex-col w-[90%] justify-center items-center">
      <form onSubmit={(e) => e.preventDefault()}>
      {perms.map((item) =>
       {
        if (item.permission_id === 21 && item.active){
          return (
            <>
              <button
                className="m-10 bg-darkBlue hover:bg-blue-800  text-secondary p-3 rounded-md w-[200px] "
                type="submit"
                onClick={() =>
                  editHw ? handleSubmit('class_work') : setEditHw(!editHw)
                }
              >
                {editHw ? 'ارسال' : ' تعديل درجات اعمال السنة'}
              </button>
              <button
                className="m-10 bg-darkBlue hover:bg-blue-800  text-secondary p-3 rounded-md w-[200px]"
                type="submit"
                onClick={() =>
                  editFinal ? handleSubmit('final') : setEditFinal(!editFinal)
                }
              >
                {editFinal ? 'ارسال' : 'تعديل درجات الامتحان النهائي'}
              </button>
              <button
                className="m-10 bg-darkBlue hover:bg-blue-800  text-secondary p-3 rounded-md w-[200px]"
                type="submit"
                onClick={() =>
                  editMid ? handleSubmit('midterm') : setEditMid(!editMid)
                }
              >
                {editMid ? 'ارسال' : 'تعديل درجات الامتحان النصفي'}
              </button>
            </>
          );}})}
        <table className="border-collapse mt-8 w-[1000px]">
          <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-grey">
             الملف الشخصي
          </th>
            <th className="border border-gray-300 px-4 py-2 bg-grey">النتيجة</th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">المجموع</th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">النسبة</th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">
            اعمال السنة
          </th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">النسبة</th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">
            الامتحان الانهائي
          </th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">النسبة</th>
          
          <th className="border border-gray-300 px-4 py-2 bg-grey">
            الامتحان النصفي
          </th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">
             رقم الطالب
          </th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">
            اللقب
          </th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">
            اسم الطالب
          </th>
          </tr>
          </thead>
          <tbody>
            {students.map((user, index) => 
              perms.map((item) => {
              const Course= course.find((Class)=> Class.id);
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
                  <td className="border border-gray-300 px-4 py-2  ">
                    {user.result}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {Course?.class_work}%
                  </td>
                  {editHw && item.permission_id == 21 ? (
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
                  <td className="border border-gray-300 px-4 py-2">
                    {Course?.final}%
                  </td>
                  {editFinal && item.permission_id == 21 ? (
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
                  <td className="border border-gray-300 px-4 py-2">
                    {Course?.midterm}%
                  </td>
                  {editMid && item.permission_id == 21 ? (
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
            }))}
          </tbody>
        </table>
      </form>
    </div>
  );
};

export default Page;
