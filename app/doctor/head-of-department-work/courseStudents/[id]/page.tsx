'use client';
import {
  PersonalInfoType,
  LettersType,
  LetterGradesType,
  ClassEnrollmentsType,
} from '@/app/types/types';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';

const Page = ({ params }: { params: { id: number } }) => {
  const session = useSession({ required: true });
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
  const [course, setCourse] = useState<ClassEnrollmentsType>();
  const [courseLetter, setCourseLetter] = useState<LetterGradesType[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (user) {
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
        `/api/exams/examRes/${params.id}/${`section`}`
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
    if (parseInt(grade) < 0 || parseInt(grade) > 100) {
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
    setEditMid(false);
    setEditFinal(false);
    setEditHw(false);
    const hasInvalidGrades = grades?.courseEnrollements.some((grad) => {
      const classWork = grad.class_work;
      const final = grad.final;
      const midterm = grad.midterm;
      return (
        classWork &&
        midterm &&
        final &&
        (classWork > 100 || midterm > 100 || final > 100)
      );
    });

    if (hasInvalidGrades) {
      toast.error('لا يمكنك ادخال درجة اكثر من 100');
      return;
    } else {
      axios
        .post(
          `/api/exams/examRes/${params.id}/${name}`,
          grades?.courseEnrollements
        )
        .then(() => {
          toast.success('تم نشر الدرجات بنجاح');
          setEdit(!edit);

          const dataUsageHistory = {
            id: user?.id,
            type: 'doctor',
            action: 'تعديل الدرجات' + course?.section[0].name,
          };
          axios.post('/api/usageHistory', dataUsageHistory);
        })
        .catch(() => {
          toast.error('حدث خطأ اثناء نشر الدرجات');
        });
    }
  };

  const handleApprove = () => {
    if (typeof window !== 'undefined') {
      axios
        .post(`/api/exams/submitGrades/${params.id}/publish_grades`, 'true')
        .then(() => {
          toast.success('تم موافقة على الدرجات بنجاح');
          const dataUsageHistory = {
            id: user?.id,
            type: 'doctor',
            action: ' موافقة على الدرجات' + course?.section[0].name,
          };
          axios.post('/api/usageHistory', dataUsageHistory);
        })
        .catch(() => {
          toast.error('حدث خطأ اثناء موافقة على الدرجات');
        });
    }
  };

  const printableContentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printableContentRef.current,
  });

  return (
    <div className="flex lg:absolute flex-col sm:text-[8px] lg:text-[16px] lg:w-[80%] sm:w-[100%] justify-center items-center">
      <div>
        <button
          onClick={handlePrint}
          className="flex bg-green-500 hover:bg-green-600 p-1 m-2 text-white rounded-md sm:w-[100px] lg:w-[200px] justify-center items-center"
        >
          طباعة درجات
        </button>
        <div className="flex ">
          <button
            className="m-2 bg-darkBlue hover:bg-blue-800  text-secondary p-1 rounded-md sm:w-[100px] lg:w-[250px]"
            type="submit"
            onClick={handleApprove}
          >
            {course?.class[0].publish_grades
              ? 'لقد وافقت على درجات '
              : ' موافقة على درجات '}
          </button>
        </div>
        <div className="flex flex-row">
          <button
            className="lg:m-10 sm:m-1 bg-darkBlue hover:bg-blue-800  text-secondary p-3 rounded-md lg:w-[200px] sm:w-[80px] "
            type="submit"
            onClick={() =>
              editHw ? handleSubmit('class_work') : setEditHw(!editHw)
            }
          >
            {editHw ? 'ارسال' : ' تعديل درجات اعمال السنة'}
          </button>
          <button
            className="lg:m-10 sm:m-1 bg-darkBlue hover:bg-blue-800  text-secondary p-3 rounded-md lg:w-[200px] sm:w-[80px]"
            type="submit"
            onClick={() =>
              editFinal ? handleSubmit('final') : setEditFinal(!editFinal)
            }
          >
            {editFinal ? 'ارسال' : 'تعديل درجات الامتحان النهائي'}
          </button>
          <button
            className="lg:m-10 sm:m-1 bg-darkBlue hover:bg-blue-800  text-secondary p-3 rounded-md lg:w-[200px] sm:w-[80px]"
            type="submit"
            onClick={() =>
              editMid ? handleSubmit('midterm') : setEditMid(!editMid)
            }
          >
            {editMid ? 'ارسال' : 'تعديل درجات الامتحان النصفي'}
          </button>
        </div>
        <div ref={printableContentRef}>
          <h1 className="flex justify-center items-center lg:text-sm sm:text-[15px] w-[100%]">
            درجات مادة {course?.section[0].name}
          </h1>
          <table className="border-collapse mt-8 lg:text-[16px] sm:text-[8px]   lg:w-[1100px] sm:w-[350px]">
            <thead>
              <tr>
                <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1 bg-grey">
                  النتيجة
                </th>
                <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1 bg-grey">
                  المجموع
                </th>
                <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1 bg-grey">
                  النسبة
                </th>
                <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1 bg-grey">
                  اعمال السنة
                </th>
                <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1 bg-grey">
                  النسبة
                </th>
                <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1 bg-grey">
                  الامتحان الانهائي
                </th>
                <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1 bg-grey">
                  النسبة
                </th>

                <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1 bg-grey">
                  الامتحان النصفي
                </th>
                <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1 bg-grey">
                  رقم الطالب
                </th>
                <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1 bg-grey">
                  اللقب
                </th>
                <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1 bg-grey">
                  اسم الطالب
                </th>
              </tr>
            </thead>
            <tbody>
              {course?.courseEnrollements.map((user, index) => {
                const letter = courseLetter.find(
                  (item) => item.course_enrollment_id == user.id
                );
                const student = studentsNames.find(
                  (student) => student.id === user.student_id
                );
                return (
                  <tr key={index}>
                    <td
                      className={`border border-gray-300 lg:px-4 lg:py-2 sm:p-1 ${
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
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1 ">
                      {user.result}
                    </td>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      {course.course[0].class_work}%
                    </td>
                    {editHw ? (
                      <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1 ">
                        <input
                          className="text-right bg-lightBlue lg:w-[60px] sm:w-[25px] lg:px-4 lg:py-2 sm:p-1"
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
                      <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                        {user.class_work}
                      </td>
                    )}
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      {course.course[0].final}%
                    </td>
                    {editFinal ? (
                      <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1 max-w-[120px]">
                        <input
                          className="text-right lg:px-4 lg:py-2 sm:p-1 bg-lightBlue lg:w-[60px] sm:w-[25px]"
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
                      <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                        {user.final}
                      </td>
                    )}
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      {course.course[0].midterm}%
                    </td>
                    {editMid ? (
                      <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1max-w-[120px]">
                        <input
                          className="text-right lg:px-4 lg:py-2 sm:p-1 bg-lightBlue lg:w-[60px] sm:w-[25px]"
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
                      <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                        {user.midterm}
                      </td>
                    )}
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
    </div>
  );
};

export default Page;
