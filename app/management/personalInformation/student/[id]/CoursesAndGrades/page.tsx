'use client';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect, useRef, useState } from 'react';
import {
  StudenCourseType,
  LetterGradesType,
  DayOfWeekType,
  CheckedType,
  GetPermissionType,
} from '@/app/types/types';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';
import { redirect } from 'next/navigation';

const hoursNames: CheckedType[] = [
  { id: 8, name: '8:00' },
  { id: 9, name: '9:00' },
  { id: 10, name: '10:00' },
  { id: 11, name: '11:00' },
  { id: 12, name: '12:00' },
  { id: 13, name: '1:00' },
  { id: 14, name: '2:00' },
  { id: 15, name: '3:00' },
  { id: 16, name: '4:00' },
  { id: 17, name: '5:00' },
  { id: 18, name: '6:00' },
  { id: 19, name: '7:00' },
];

const days: DayOfWeekType[] = [
  { name: 'الجمعة', day: 'friday' },
  { name: 'الخميس', day: 'thursday' },
  { name: 'الاربعاء', day: 'wednesday' },
  { name: 'الثلثاء', day: 'tuesday' },
  { name: 'الاثنين', day: 'monday' },
];

const Page = ({ params }: { params: { id: number } }) => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }
  const user = session.data?.user;

  const [perms, setPerms] = useState<GetPermissionType[]>([]);
  const [studentCourses, setStudentCourses] = useState<StudenCourseType[]>([]);
  const [checkList, setCheckList] = useState<StudenCourseType[]>([]);
  const [checked, setChecked] = useState<number[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [courseLetter, setCourseLetter] = useState<LetterGradesType[]>([]);
  const printableContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if(user){

          const responsePer = await axios.get(
            `/api/allPermission/admin/selectedPerms/${user?.id}`
          );
          const messagePer: GetPermissionType[] = responsePer.data.message;
          setPerms(messagePer);
  
          const responseCourseLetter = await axios.get(`/api/exams/letterGrades`);
          const messageCourseLetter: LetterGradesType[] =
            responseCourseLetter.data.message;
          setCourseLetter(messageCourseLetter);
  
          const responseCourse = await axios.get(
            `/api/getAll/studentCourses/${params.id}`
          );
  
          const messageCourse: StudenCourseType[] = responseCourse.data.message;
          setCheckList(messageCourse);
  
          const responseStudentCourse = await axios.get(
            `/api/getAll/studentCoursesApprove/${params.id}`
          );
  
          const messageStudentCourse: StudenCourseType[] =
            responseStudentCourse.data.message;
          setStudentCourses(messageStudentCourse);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setRefresh(!refresh);
    };

    fetchData();
  }, [params.id, refresh, user]);

  const handleCheck = (item: number) => {
    const checkedIndex = checked.indexOf(item);
    if (checkedIndex === -1) {
      setChecked([...checked, item]);
    } else {
      const updatedChecked = [...checked];
      updatedChecked.splice(checkedIndex, 1);
      setChecked(updatedChecked);
    }
    setRefresh(!refresh);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    for (const item of checked) {
      const check = checkList.find((i) => i.courseEnrollements.id == item);
      const data1 = {
        course: {
          student_id: params.id,
          id: check?.courseEnrollements.id,
          approved: true,
          section_id: check?.section.id,
        },
        grade: { course_enrollment_id: check?.courseEnrollements.id },
      };

      await axios
        .post('/api/courseEnrollment/courseAccept', data1)
        .then((res) => {
          toast.success(res.data.message);
        })
        .catch((error) => {
          toast.error(error.message);
        });
    }

    const filteredList = checkList.filter(
      (item) => !checked.includes(item.courseEnrollements.id)
    );
    for (const item of filteredList) {
      const data1 = {
        id: item.courseEnrollements.id,
      };

      await axios
        .post('/api/courseEnrollment/courseDelete', data1)
        .catch((error) => {
          toast.error(error.message);
        });
    }
    setRefresh(!refresh);
  };

  const handlePrint = useReactToPrint({
    content: () => printableContentRef.current,
  });

  return (
    <div className="absolute w-[80%] flex flex-col p-10 justify-content items-center ">
      <button
        onClick={handlePrint}
        className="flex bg-green-500 hover:bg-green-600 p-2 m-5 text-white rounded-md w-[200px] justify-center items-center"
      >
        طباعة درجات الطالب
      </button>
      {perms.map((permItem, idx) => {
        if (permItem.permission_id === 5 && permItem.active) {
          return (
            <form
              key={idx}
              onSubmit={handleSubmit}
              className="flex-col w-screen flex justify-content items-center"
            >
              <h1 className="flex w-[400px] text-sm justify-end p-1 items-center">
                : المواد التي اختارها الطالب اللتي يجب الموافقة عليها
              </h1>

              <div className="p-1 rounded-md">
                {checkList.length ? (
                  <table className="w-[1100px]">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 bg-grey"></th>
                        <th className="border border-gray-300 px-4 py-2 bg-grey">
                          الكريدت
                        </th>
                        <th className="border border-gray-300 px-4 py-2 bg-grey">
                          درجة النجاح
                        </th>
                        <th className="border border-gray-300 px-4 py-2 bg-grey">
                          الساعات
                        </th>
                        <th className="border border-gray-300 px-4 py-2 bg-grey">
                          التوقيت
                        </th>
                        <th className="border border-gray-300 px-4 py-2 bg-grey">
                          اسم الدكتور
                        </th>
                        <th className="border border-gray-300 px-4 py-2 bg-grey">
                          اسم المجموعة
                        </th>
                        <th className="border border-gray-300 px-4 py-2 bg-grey">
                          اسم المادة
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {checkList.map((item, index) => {
                        const findDay = days.find(
                          (day) => day.day === item.class.day
                        );
                        const findStartTime = hoursNames.find(
                          (hour) => hour.id === item.class.starts_at
                        );
                        const findEndTime = hoursNames.find(
                          (hour) => hour.id === item.class.ends_at
                        );

                        return (
                          <tr key={index}>
                            <td className="border border-gray-300 px-4 py-2">
                              <input
                                type="checkbox"
                                onChange={() =>
                                  handleCheck(item.courseEnrollements.id)
                                }
                                checked={checked.includes(
                                  item.courseEnrollements.id
                                )}
                              />
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {item.course.credits}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {item.course.passing_percentage}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {item.course.hours}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {findDay?.name}/{findStartTime?.name}-
                              {findEndTime?.name}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {item.doctor?.name} {item.doctor?.surname}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {item.section.name}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {item.course.course_name}{' '}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <table>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 w-[200px]">
                          لا يوجد
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>

              <button
                type="submit"
                className="flex w-[200px] p-3 text-sm justify-center items-center bg-darkBlue text-secondary"
              >
                موافقة
              </button>
            </form>
          );
        }
        return null;
      })}
      <h1 className="text-sm bg-lightBlue rounded-md p-3 px-12 m-3">المواد</h1>
      <table className="w-[1100px] m-5">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-grey">
              الكريدت
            </th>
            <th className="border border-gray-300 px-4 py-2 bg-grey">
              درجة النجاح
            </th>
            <th className="border border-gray-300 px-4 py-2 bg-grey">
              الساعات
            </th>
            <th className="border border-gray-300 px-4 py-2 bg-grey">
              التوقيت
            </th>
            <th className="border border-gray-300 px-4 py-2 bg-grey">
              اسم الدكتور
            </th>
            <th className="border border-gray-300 px-4 py-2 bg-grey">
              اسم المجموعة
            </th>
            <th className="border border-gray-300 px-4 py-2 bg-grey">
              اسم المادة
            </th>
          </tr>
        </thead>
        <tbody>
          {studentCourses.map((item, index) => {
            if (
              item.class &&
              item.course &&
              item.section &&
              item.courseEnrollements
            ) {
              const findDay = days.find((day) => day.day === item.class.day);
              const findStartTime = hoursNames.find(
                (hour) => hour.id === item.class.starts_at
              );
              const findEndTime = hoursNames.find(
                (hour) => hour.id === item.class.ends_at
              );

              return (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.course.credits}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.course.passing_percentage}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.course.hours}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {findDay?.name}/{findStartTime?.name}-{findEndTime?.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.doctor?.name} {item.doctor?.surname}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.section.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.course.course_name}{' '}
                  </td>
                </tr>
              );
            } else {
              <tr>
                <td className="border border-gray-300 px-4 py-2 ">لا يوجد</td>
              </tr>;
            }
          })}
        </tbody>
      </table>
      <h1 className="text-sm bg-lightBlue rounded-md p-3 px-12 m-3">الدرجات</h1>
      <div ref={printableContentRef}>
        <table className="m-10 w-[1100px]">
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
                اسم المجموعة
              </th>
              <th className="border border-gray-300 px-4 py-2 bg-grey">
                اسم المادة
              </th>
            </tr>
          </thead>
          <tbody>
            {studentCourses.map((course, index) => {
              if (
                course.class &&
                course.course &&
                course.section &&
                course.courseEnrollements
              ) {
                const letter = courseLetter.find(
                  (item) =>
                    item.course_enrollment_id == course.courseEnrollements.id
                );
                return (
                  <tr key={index}>
                    <td
                      className={`border border-gray-300 px-4 py-2 ${
                        course.courseEnrollements.pass
                          ? 'text-green-600 hover:text-green-700'
                          : 'text-red-500 hover:text-red-600'
                      }`}
                    >
                      {course.class?.result_publish
                        ? course.courseEnrollements.pass
                          ? `${letter?.letter_grade} ناجح`
                          : `${letter?.letter_grade} راسب`
                        : ''}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 ">
                      {course.class?.result_publish
                        ? course.courseEnrollements.result
                        : ''}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {course.course.class_work}%
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {course.class?.class_work_publish
                        ? course.course.class_work
                        : ''}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {course.course.final}%
                    </td>
                    <td className="border border-gray-300 px-4 py-2 ">
                      {course.class?.final_publish
                        ? course.courseEnrollements.final
                        : ' '}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {course.course.midterm}%
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {course.class?.mid_publish
                        ? course.courseEnrollements.midterm
                        : ''}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {course.section?.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {course.course.course_name}
                    </td>
                  </tr>
                );
              } else {
                <tr>
                  <td className="border border-gray-300 px-4 py-2 ">لا يوجد</td>
                </tr>;
              }
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Page;
