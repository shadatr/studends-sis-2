'use client';
import {
  GetPermissionDoctorType,
  PersonalInfoType,
  LettersType,
  LetterGradesType,
  ClassEnrollmentsType,
} from '@/app/types/types';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';

const Page = ({ params }: { params: { id: number } }) => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'doctor' : false) {
    redirect('/');
  }
  const user = session.data?.user;

  const [studentsNames, setStudentsNames] = useState<PersonalInfoType[]>([]);
  const [edit, setEdit] = useState(false);
  const [editMid, setEditMid] = useState(false);
  const [editFinal, setEditFinal] = useState(false);
  const [editHw, setEditHw] = useState(false);
  const [grades, setGrades] = useState<ClassEnrollmentsType>();
  const [perms, setPerms] = useState<GetPermissionDoctorType[]>([]);
  const [course, setCourse] = useState<ClassEnrollmentsType>();
  const [courseLetter, setCourseLetter] = useState<LetterGradesType[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (user) {
        const responsePerm = await axios.get(
          `/api/allPermission/doctor/selectedPerms/${user?.id}`
        );
        const messagePerm: GetPermissionDoctorType[] =
          responsePerm.data.message;
        setPerms(messagePerm);

        const responseLetter = await axios.get(`/api/exams/grading/1`);
        const messageLetters: LettersType[] = responseLetter.data.message;

        const responseLetter2 = await axios.get(`/api/exams/grading/3`);
        const messageLetters2: LettersType[] = responseLetter2.data.message;

        const responseGrade = await axios.get(`/api/exams/grading/2`);
        const messageGrade: LettersType[] = responseGrade.data.message;

        const responseResult = await axios.get(`/api/exams/grading/5`);
        const messageResult: LettersType[] = responseResult.data.message;

        const responseCourseLetter = await axios.get(`/api/exams/letterGrades`);
        const messageCourseLetter: LetterGradesType[] =
          responseCourseLetter.data.message;
        setCourseLetter(messageCourseLetter);

        const response = await axios.get(
          `/api/exams/examRes/${params.id}/${'section'}`
        );
        const message: ClassEnrollmentsType = response.data.message;

        const resp = await axios.get(`/api/getAll/student`);
        const personalInfoMessage: PersonalInfoType[] = resp.data.message;
        setStudentsNames(personalInfoMessage);

        const updatedLetters = message.courseEnrollements.map((grade) => {
          const student = personalInfoMessage.find(
            (student) => student.id === grade.student_id
          );

          let letter: string | undefined;
          let point: string | undefined;

          if (grade.student_id == student?.id) {
            if (grade.midterm && grade.final && grade.class_work) {
              if (
                message.course[0].midterm != undefined &&
                message.course[0].final !== undefined &&
                message.course[0].class_work !== undefined
              ) {
                const avrg =
                  (grade.midterm * message.course[0].midterm) / 100 +
                  (grade.final * message.course[0].final) / 100 +
                  (grade.class_work * message.course[0].class_work) / 100;

                if (parseFloat(messageGrade[0].AA) <= avrg && 100 >= avrg) {
                  point = messageLetters[0].AA;
                  letter = messageLetters2[0].AA;
                } else if (parseFloat(messageGrade[0].BA) <= avrg) {
                  point = messageLetters[0].BA;
                  letter = messageLetters2[0].BA;
                } else if (parseFloat(messageGrade[0].BB) <= avrg) {
                  point = messageLetters[0].BB;
                  letter = messageLetters2[0].BB;
                } else if (parseFloat(messageGrade[0].CB) <= avrg) {
                  point = messageLetters[0].CB;
                  letter = messageLetters2[0].CB;
                } else if (parseFloat(messageGrade[0].CC) <= avrg) {
                  point = messageLetters[0].CC;
                  letter = messageLetters2[0].CC;
                } else if (parseFloat(messageGrade[0].DC) <= avrg) {
                  point = messageLetters[0].DC;
                  letter = messageLetters2[0].DC;
                } else if (parseFloat(messageGrade[0].DD) <= avrg) {
                  point = messageLetters[0].DD;
                  letter = messageLetters2[0].DD;
                } else if (parseFloat(messageGrade[0].FD) <= avrg) {
                  point = messageLetters[0].FD;
                  letter = messageLetters2[0].FD;
                } else {
                  point = messageLetters[0].FF;
                  letter = messageLetters2[0].FF;
                }
              }
            }
          }
          const data = {
            letter_grade: letter,
            points: point,
            course_enrollment_id: grade.id,
          };
          return data;
        });

        axios.post(`/api/exams/letterGrades`, updatedLetters);

        const updatedResults = message.courseEnrollements.map((grade) => {
          const student = personalInfoMessage.find(
            (student) => student.id === grade.student_id
          );

          if (grade.student_id == student?.id) {
            if (grade.midterm && grade.final && grade.class_work) {
              if (
                message.course[0].midterm != undefined &&
                message.course[0].final !== undefined &&
                message.course[0].class_work !== undefined
              ) {
                const avrg =
                  (grade.midterm * message.course[0].midterm) / 100 +
                  (grade.final * message.course[0].final) / 100 +
                  (grade.class_work * message.course[0].class_work) / 100;

                if (parseFloat(messageGrade[0].AA) <= avrg && 100 >= avrg) {
                  if (messageResult[0].AA == 'نجاح') {
                    return {
                      ...grade,
                      pass: true,
                      can_repeat: false,
                      result: parseFloat(avrg.toFixed(2)),
                    };
                  } else if (messageResult[0].AA == 'نجاح مشروط') {
                    return {
                      ...grade,
                      pass: true,
                      can_repeat: true,
                      result: parseFloat(avrg.toFixed(2)),
                    };
                  } else if (messageResult[0].AA == 'رسوب') {
                    return {
                      ...grade,
                      pass: false,
                      can_repeat: false,
                      result: parseFloat(avrg.toFixed(2)),
                    };
                  }
                } else if (parseFloat(messageGrade[0].BA) <= avrg) {
                  if (messageResult[0].BA == 'نجاح') {
                    return {
                      ...grade,
                      pass: true,
                      can_repeat: false,
                      result: parseFloat(avrg.toFixed(2)),
                    };
                  } else if (messageResult[0].BA == 'نجاح مشروط') {
                    return {
                      ...grade,
                      pass: true,
                      can_repeat: true,
                      result: parseFloat(avrg.toFixed(2)),
                    };
                  } else if (messageResult[0].BA == 'رسوب') {
                    return {
                      ...grade,
                      pass: false,
                      can_repeat: false,
                      result: parseFloat(avrg.toFixed(2)),
                    };
                  }
                } else if (parseFloat(messageGrade[0].BB) <= avrg) {
                  if (messageResult[0].BB == 'نجاح') {
                    return {
                      ...grade,
                      pass: true,
                      can_repeat: false,
                      result: parseFloat(avrg.toFixed(2)),
                    };
                  } else if (messageResult[0].BB == 'نجاح مشروط') {
                    return {
                      ...grade,
                      pass: true,
                      can_repeat: true,
                      result: parseFloat(avrg.toFixed(2)),
                    };
                  } else if (messageResult[0].BB == 'رسوب') {
                    return {
                      ...grade,
                      pass: false,
                      can_repeat: false,
                      result: parseFloat(avrg.toFixed(2)),
                    };
                  }
                } else if (parseFloat(messageGrade[0].CB) <= avrg) {
                  if (messageResult[0].CB == 'نجاح') {
                    return {
                      ...grade,
                      pass: true,
                      can_repeat: false,
                      result: parseFloat(avrg.toFixed(2)),
                    };
                  } else if (messageResult[0].CB == 'نجاح مشروط') {
                    return {
                      ...grade,
                      pass: true,
                      can_repeat: true,
                      result: parseFloat(avrg.toFixed(2)),
                    };
                  } else if (messageResult[0].CB == 'رسوب') {
                    return {
                      ...grade,
                      pass: false,
                      can_repeat: false,
                      result: parseFloat(avrg.toFixed(2)),
                    };
                  }
                } else if (parseFloat(messageGrade[0].CC) <= avrg) {
                  if (messageResult[0].CC == 'نجاح') {
                    return {
                      ...grade,
                      pass: true,
                      can_repeat: false,
                      result: parseFloat(avrg.toFixed(2)),
                    };
                  } else if (messageResult[0].CC == 'نجاح مشروط') {
                    return {
                      ...grade,
                      pass: true,
                      can_repeat: true,
                      result: parseFloat(avrg.toFixed(2)),
                    };
                  } else if (messageResult[0].CC == 'رسوب') {
                    return {
                      ...grade,
                      pass: false,
                      can_repeat: false,
                      result: parseFloat(avrg.toFixed(2)),
                    };
                  }
                } else if (parseFloat(messageGrade[0].DC) <= avrg) {
                  if (messageResult[0].DC == 'نجاح') {
                    return {
                      ...grade,
                      pass: true,
                      can_repeat: false,
                      result: parseFloat(avrg.toFixed(2)),
                    };
                  } else if (messageResult[0].DC == 'نجاح مشروط') {
                    return {
                      ...grade,
                      pass: true,
                      can_repeat: true,
                      result: parseFloat(avrg.toFixed(2)),
                    };
                  } else if (messageResult[0].DC == 'رسوب') {
                    return {
                      ...grade,
                      pass: false,
                      can_repeat: false,
                      result: parseFloat(avrg.toFixed(2)),
                    };
                  }
                } else if (parseFloat(messageGrade[0].DD) <= avrg) {
                  if (messageResult[0].DD == 'نجاح') {
                    return {
                      ...grade,
                      pass: true,
                      can_repeat: false,
                      result: parseFloat(avrg.toFixed(2)),
                    };
                  } else if (messageResult[0].DD == 'نجاح مشروط') {
                    return {
                      ...grade,
                      pass: true,
                      can_repeat: true,
                      result: parseFloat(avrg.toFixed(2)),
                    };
                  } else if (messageResult[0].DD == 'رسوب') {
                    return {
                      ...grade,
                      pass: false,
                      can_repeat: false,
                      result: parseFloat(avrg.toFixed(2)),
                    };
                  }
                } else if (parseFloat(messageGrade[0].FD) <= avrg) {
                  if (messageResult[0].FD == 'نجاح') {
                    return {
                      ...grade,
                      pass: true,
                      can_repeat: false,
                      result: parseFloat(avrg.toFixed(2)),
                    };
                  } else if (messageResult[0].FD == 'نجاح مشروط') {
                    return {
                      ...grade,
                      pass: true,
                      can_repeat: true,
                      result: parseFloat(avrg.toFixed(2)),
                    };
                  } else if (messageResult[0].FD == 'رسوب') {
                    return {
                      ...grade,
                      pass: false,
                      can_repeat: false,
                      result: parseFloat(avrg.toFixed(2)),
                    };
                  }
                } else {
                  if (messageResult[0].FF == 'نجاح') {
                    return {
                      ...grade,
                      pass: true,
                      can_repeat: false,
                      result: parseFloat(avrg.toFixed(2)),
                    };
                  } else if (messageResult[0].FF == 'نجاح مشروط') {
                    return {
                      ...grade,
                      pass: true,
                      can_repeat: true,
                      result: parseFloat(avrg.toFixed(2)),
                    };
                  } else if (messageResult[0].FF == 'رسوب') {
                    return {
                      ...grade,
                      pass: false,
                      can_repeat: false,
                      result: parseFloat(avrg.toFixed(2)),
                    };
                  }
                }
              }
            }
          }
          return grade;
        });

        axios.post(`/api/exams/examRes/${params.id}/a`, updatedResults);
      }
    };
    fetchPosts();
  }, [edit, params.id, editMid, editFinal, editHw, user]);

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await axios.get(
        `/api/exams/examRes/${params.id}/${'section'}`
      );
      const message: ClassEnrollmentsType = response.data.message;
      setGrades(message);
      setCourse(message);
    };
    fetchPosts();
  }, [edit, editMid, editFinal, editHw, params.id]);

  const handleGradeChange = (
    studentId: number,
    exam: string,
    grade: string
  ) => { 
    if(parseInt(grade)<0 ||parseInt(grade)>100){
      toast.error('لا يمكنك ادخال درجة اكثر من 100');
    }
    const updatedGrades = grades?.courseEnrollements.map((gradeObj) => {
      if (gradeObj.student_id === studentId) {
        return {
          ...gradeObj,
          [exam]: parseInt(grade),
        };
      }
      return gradeObj;
    });

    
    if (updatedGrades) {
      const updatedGradesData = {
        ...grades,
        course: grades?.course || [],
        courseEnrollements: updatedGrades,
        section: grades?.section || [],
        class: grades?.class || [],
      };
      
      setGrades(updatedGradesData);
    }
  };

  const handleSubmit = (name: string) => {

    const moreavrg = grades?.courseEnrollements.find(
      (grad) => grad?.class_work&&grad?.midterm&&grad?.final?( grad?.class_work > 100 || grad?.midterm > 100 || grad?.final > 100):''
    );
    if (moreavrg) {
      toast.error('لا يمكنك ادخال درجة اكثر من 100');
      return;
    }

    axios.post(
      `/api/exams/examRes/${params.id}/${name}`,
      grades?.courseEnrollements
    )
      .then(() => {
        toast.success('تم نشر الدرجات بنجاح');
            setEditMid(false);
            setEditFinal(false);
            setEditHw(false);
            setEdit(!edit);
        const dataUsageHistory = {
          id: user?.id,
          type: 'doctor',
          action: ' تعديل درجات مادة' + course?.section[0].name,
        };
        axios.post('/api/usageHistory', dataUsageHistory);
      })
      .catch(() => {
        toast.error('حدث خطأ اثناء نشر الدرجات');
      });
  };
  const printableContentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printableContentRef.current,
  });

  return (
    <div className="flex absolute flex-col w-[80%] justify-center items-center">
      <button
        onClick={handlePrint}
        className="flex bg-green-500 hover:bg-green-600 p-1 m-2 text-white rounded-md w-[200px] justify-center items-center"
      >
        طباعة درجات
      </button>
      <form onSubmit={(e) => e.preventDefault()}>
        {perms.map((item) => {
          if (item.permission_id === 21 && item.active && !course?.class[0].publish_grades) {
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
            );
          }
        })}
        <div ref={printableContentRef}>
          <h1 className="flex justify-center items-center text-sm w-[100%]">
            درجات مادة {course?.section[0].name}
          </h1>
          <table className="border-collapse mt-8 w-[1100px]">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2 bg-grey">
                  النتيجة
                </th>
                <th className="border border-gray-300 px-4 py-2 bg-grey">
                  المجموع
                </th>
                <th className="border border-gray-300 px-4 py-2 bg-grey">
                  النسبة
                </th>
                <th className="border border-gray-300 px-4 py-2 bg-grey">
                  اعمال السنة
                </th>
                <th className="border border-gray-300 px-4 py-2 bg-grey">
                  النسبة
                </th>
                <th className="border border-gray-300 px-4 py-2 bg-grey">
                  الامتحان الانهائي
                </th>
                <th className="border border-gray-300 px-4 py-2 bg-grey">
                  النسبة
                </th>

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
              {course?.courseEnrollements.map((user, index) =>
                perms.map((item) => {
                  const letter = courseLetter.find(
                    (item) => item.course_enrollment_id == user.id
                  );
                  const student = studentsNames.find(
                    (student) => student.id === user.student_id
                  );
                  return (
                    <tr key={index}>
                      <td
                        className={`border border-gray-300 px-4 py-2 ${
                          user.pass
                            ? 'text-green-600 hover:text-green-700'
                            : 'text-red-500 hover:text-red-600'
                        }`}
                      >
                        {user.pass == null
                          ? ''
                          : user.pass
                          ? `${letter?.letter_grade} ناجح`
                          : `${letter?.letter_grade} راسب`}
                      </td>
                      <td className="border border-gray-300 px-4 py-2  ">
                        {user.result}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {course.course[0].class_work}%
                      </td>
                      {editHw && item.permission_id == 21 ? (
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[60px]"
                            key={user.student_id}
                            value={
                              grades?.courseEnrollements.find(
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
                        {course.course[0].final}%
                      </td>
                      {editFinal && item.permission_id == 21 ? (
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[60px]"
                            key={user.student_id}
                            value={
                              grades?.courseEnrollements.find(
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
                        {course.course[0].midterm}%
                      </td>
                      {editMid && item.permission_id == 21 ? (
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[60px]"
                            key={user.student_id}
                            value={
                              grades?.courseEnrollements.find(
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
                })
              )}
            </tbody>
          </table>
        </div>
      </form>
    </div>
  );
};

export default Page;
