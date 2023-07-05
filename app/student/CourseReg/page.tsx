'use client';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  CheckedType,
  CourseInfoType,
  DayOfWeekType,
  GetPermissionStudentType,
  StudentClassType,
} from '@/app/types/types';
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

const Page = () => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'student' : false) {
    redirect('/');
  }
  const user = session.data?.user;

  const [courses, setCourses] = useState<CourseInfoType[]>([]);
  const [repeat, setRepeat] = useState<CourseInfoType[]>([]);
  const [checkList, setCheckList] = useState<CourseInfoType[]>([]);
  const [courseEnrollements, setCourseEnrollements] = useState<
    StudentClassType[]
  >([]);
  const [checked, setChecked] = useState<number[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [submit, setSubmit] = useState(false);
  const [perms, setPerms] = useState<GetPermissionStudentType[]>([]);
  const [unableCourses, setUnableCourses] = useState<CourseInfoType[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const response = await axios.get(
            `/api/getAll/StudentCourseReg/${user?.major}`
          );
          const message: CourseInfoType[] = response.data.message;
          setCourses(message);

          const responseEnroll = await axios.get(
            `/api/courseEnrollment/courseAccept`
          );
          const messageEnroll: StudentClassType[] = responseEnroll.data.message;
          setCourseEnrollements(messageEnroll);

          console.log(messageEnroll);

          const responsePer = await axios.get(
            `/api/allPermission/student/selectedPerms/${user?.id}`
          );
          const messagePer: GetPermissionStudentType[] =
            responsePer.data.message;
          setPerms(messagePer);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };
    setRefresh(!refresh);
    fetchData();
  }, [user, submit]);

  useEffect(() => {
    const updatedCheckList: CourseInfoType[] = [];
    const updatedCheckList2: CourseInfoType[] = [];
    const repeatList: CourseInfoType[] = [];

    courses.forEach((course) => {
      if (course.prerequisites.length === 0) {
        if (course?.courseEnrollements?.length != 0) {
          course.courseEnrollements.map((courseEnroll) => {
            course.class.map((classItem) => {
              if (
                courseEnroll.student_id === user?.id &&
                classItem.id === courseEnroll.class_id &&
                courseEnroll.pass === true &&
                courseEnroll.can_repeat === false
              ) {
                const index = updatedCheckList.indexOf(course);
                if (index !== -1) {
                  updatedCheckList.splice(index, 1);
                }
              } else if (
                !updatedCheckList.find(
                  (item) => item.course.id === course.course.id
                )
              ) {
                updatedCheckList.push(course);
                if (courseEnroll.can_repeat === true) {
                  repeatList.push(course);
                }
              }
            });
          });
        } else {
          updatedCheckList.push(course);
        }
      } else {
        course.prerequisites.map((preCourse) => {
          const prerequisiteCourse = courses.find(
            (prereq) => preCourse.prerequisite_course_id === prereq.course.id
          );

          prerequisiteCourse?.class.forEach((classItem) => {
            const passed = prerequisiteCourse.courseEnrollements.find(
              (courseEnroll) =>
                courseEnroll.student_id === user?.id &&
                classItem.id === courseEnroll.class_id &&
                courseEnroll
            );

            if (
              passed?.pass === true &&
              !updatedCheckList.find(
                (item) => item.course.id === course.course.id
              )
            ) {
              updatedCheckList.push(course);
              const index = updatedCheckList2.indexOf(course);
              if (index !== -1) {
                updatedCheckList2.splice(index, 1);
              }
            } else {
              if (
                !updatedCheckList2.find(
                  (item) => item.course.id === course.course.id
                )
              ) {
                updatedCheckList2.push(course);
              }
              const index = updatedCheckList.indexOf(course);
              if (index !== -1) {
                updatedCheckList.splice(index, 1);
              }
            }
          });
          if (
            prerequisiteCourse?.class.length == 0 &&
            !updatedCheckList2.find(
              (item) => item.course.id === course.course.id
            )
          ) {
            updatedCheckList2.push(course);
          }
        });
      }
    });
    setRepeat(repeatList);
    setUnableCourses(updatedCheckList2);
    setCheckList(updatedCheckList);
  }, [user, refresh, courses]);

  const handleCheck = (item: number) => {
    const isChecked = checked.includes(item);
    if (!isChecked) {
      setChecked((prevChecked) => [...prevChecked, item]);
    } else {
      setChecked((prevChecked) =>
        prevChecked.filter((value) => value !== item)
      );
    }
  };

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }

    setSubmitting(true);

    for (const item of checked) {
      const registeredBefore = courseEnrollements.find(
        (enrollment) =>
          enrollment.class_id === item && enrollment.student_id === user?.id
      );

      if (registeredBefore) {
        toast.error('لقد سجلت في هذه الماده من قبل');
        return;
      }

      const enrollmentData = {
        student_id: user?.id,
        class_id: item,
      };
      await axios.post(`/api/getAll/getAllCourseEnroll`, enrollmentData);
    }

    const permissionData = {
      student_id: user?.id,
      permission_id: 20,
      active: false,
    };
    await axios.post(
      `/api/allPermission/student/selectedPerms/${user?.id}`,
      permissionData
    );

    setSubmitting(false); 
    setSubmit(!submit);
  };

  return (
    <div className="absolute w-[80%] flex p-10 justify-center flex-col items-center ">
      {perms.map((item, index) =>
        item.permission_id == 20 && item.active ? (
          <>
            <h1> اختر المواد</h1>
            <table className="w-[1100px] ">
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
                    اجباري/اختياري
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
                {checkList.map((item, index) =>
                  item.class.map((cls) => {
                    if (cls.active) {
                      const selectedSec = item.section.find(
                        (sec) => sec.id == cls.section_id
                      );
                      const selectedDoc = item.doctor.find(
                        (doct) => doct.id == cls.doctor_id
                      );
                      const findDay = days.find((day) => day.day == cls.day);
                      const findStartTime = hoursNames.find(
                        (hour) => hour.id == cls.starts_at
                      );
                      const findEndTime = hoursNames.find(
                        (hour) => hour.id == cls.ends_at
                      );
                      const repeated = repeat.find(
                        (co) => co.course.id == item.course.id
                      );

                      return (
                        <tr key={index}>
                          <td className="border border-gray-300 px-4 py-2">
                            <input
                              type="checkbox"
                              onChange={() => handleCheck(cls.id)}
                              checked={checked.includes(cls.id)}
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
                            {item.majorCourse.isOptional ? 'اختياري' : 'اجباري'}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {findDay?.name}/ {findStartTime?.name}-
                            {findEndTime?.name}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {selectedDoc?.name} {selectedDoc?.surname}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {selectedSec?.name}
                          </td>
                          <td
                            className={`border border-gray-300 px-4 py-2 ${
                              repeated?.course.id == item.course.id
                                ? 'text-green-500'
                                : ''
                            }`}
                          >
                            {item.course.course_name}{' '}
                            {repeated?.course.id == item.course.id
                              ? '- اعادة'
                              : ''}
                          </td>
                        </tr>
                      );
                    }
                  })
                )}
              </tbody>
            </table>
            <table className="m-10">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 bg-grey">
                    المواد المشروطة
                  </th>
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
                    اجباري/اختياري
                  </th>
                  <th className="border border-gray-300 px-4 py-2 bg-grey">
                    اسم المادة
                  </th>
                </tr>
              </thead>
              <tbody>
                {unableCourses.map((item, index) => {
                  const preCourses = item.prerequisites.map((pre) =>
                    courses.find(
                      (course) =>
                        pre.prerequisite_course_id === course.course.id
                    )
                  );
                  return (
                    <tr className="text-red-500" key={index}>
                      <td className="border border-gray-300 px-4 py-2">
                        {preCourses.map((preCourse) => (
                          <span key={preCourse?.course.id}>
                            {preCourse?.course.course_name}{' - '}
                          </span>
                        ))}
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
                        {item.majorCourse.isOptional ? 'اختياري' : 'اجباري'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.course.course_name}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <button
              onClick={handleSubmit}
              className="flex p-3 text-sm  bg-darkBlue text-secondary m-3 rounded-md"
            >
              اضافة
            </button>
          </>
        ) : (
          <div
            key={index}
            className=" flex-col w-screen flex justify-content items-center"
          >
            <p className="flex w-[400px]  text-sm justify-center items-center bg-lightBlue p-5 ">
              لقد تم ارسال المواد الى المشرف بنجاح
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default Page;
