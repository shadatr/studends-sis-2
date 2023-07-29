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
  StudenCourseType,
  StudentClassType
} from '@/app/types/types';
import { redirect } from 'next/navigation';
import { BsXCircleFill } from 'react-icons/bs';

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
  { name: 'الاحد', day: 'sunday' },
  { name: 'السبت', day: 'saturday' },
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
  const [selectedCourses, setSelectedCourses] = useState<StudenCourseType[]>(
    []
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const response = await axios.get(
            `/api/getAll/StudentCourseReg/${user?.major}`,
          );
          const message: CourseInfoType[] = response.data.message;
          setCourses(message);

          const responseEnroll = await axios.get(
            `/api/courseEnrollment/courseAccept`
          );
          const messageEnroll: StudentClassType[] = responseEnroll.data.message;
          setCourseEnrollements(messageEnroll);

          const responsePer = await axios.get(
            `/api/allPermission/student/selectedPerms/${user?.id}`
          );
          const messagePer: GetPermissionStudentType[] =
            responsePer.data.message;
          setPerms(messagePer);

          const responseCourse = await axios.get(
            `/api/getAll/studentCourses/${user?.id}`
          );

          const messageCourse: StudenCourseType[] = responseCourse.data.message;
          setSelectedCourses(messageCourse);


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
          const enrollments = course.courseEnrollements.filter(
            (co) => co.student_id == user?.id
          );
          if (enrollments.length == 0) {
            updatedCheckList.push(course);
          }

          enrollments.map((courseEnroll) => {
            course.class.map((classItem) => {
              if (
                classItem.id === courseEnroll.class_id &&
                courseEnroll.pass === true
              ) {
                const index = updatedCheckList.indexOf(course);

                if (courseEnroll.can_repeat == false) {
                  if (index !== -1) {
                    updatedCheckList.splice(index, 1);
                  }
                }
              } else if (
                (!updatedCheckList.find(
                  (item) => item.course.id === course.course.id
                ) &&
                  courseEnroll.pass == false) ||
                courseEnroll.can_repeat == true
              ) {
                if (
                  courseEnroll.can_repeat == true &&
                  !repeatList.find(
                    (item) => item.course.id === course.course.id
                  )
                ) {
                  repeatList.push(course);
                }
                updatedCheckList.push(course);
              }
            });
          });
        } else {
          updatedCheckList.push(course);
        }
      } else {
        let done = 0;
        course.prerequisites.forEach((preCourse) => {
          const prerequisiteCourse = courses.find(
            (prereq) => preCourse.prerequisite_course_id === prereq.course.id 
          );

          const passed = prerequisiteCourse?.courseEnrollements.find(
            (courseEnroll) =>
              prerequisiteCourse.class.find(
                (classItem) =>
                  courseEnroll.student_id === user?.id &&
                  classItem.id === courseEnroll.class_id
              )
          );

            if (passed?.pass==true) {
              done++;
            } 
        });

        if (done == course.prerequisites.length) {
          if (
            course?.courseEnrollements?.length != 0 &&
            course?.courseEnrollements 
          ) {
            const enrollments = course.courseEnrollements.filter(
              (co) => co.student_id == user?.id
            );
            if (enrollments.length == 0) {
              updatedCheckList.push(course);
              const index = updatedCheckList.indexOf(course);
              if (index !== -1) {
                updatedCheckList2.splice(index, 1);
              }
            }

            enrollments.map((courseEnroll) => {
              course.class.map((classItem) => {
                if (
                  classItem.id === courseEnroll.class_id &&
                  courseEnroll.pass === true
                ) {
                  const index = updatedCheckList.indexOf(course);

                  if (courseEnroll.can_repeat == false) {
                    if (index !== -1) {
                      updatedCheckList.splice(index, 1);
                    }
                  }
                } else if (
                  (!updatedCheckList.find(
                    (item) => item.course.id === course.course.id
                  ) &&
                    courseEnroll.pass == false) ||
                  courseEnroll.can_repeat == true
                ) {
                  if (
                    courseEnroll.can_repeat == true &&
                    !repeatList.find(
                      (item) => item.course.id === course.course.id
                    )
                  ) {
                    repeatList.push(course);
                  }
                  updatedCheckList.push(course);
                  const index = updatedCheckList.indexOf(course);
                  if (index !== -1) {
                    updatedCheckList2.splice(index, 1);
                  }
                }
              });
            });
          } else {
            updatedCheckList.push(course);
            const index = updatedCheckList.indexOf(course);
            if (index !== -1) {
              updatedCheckList2.splice(index, 1);
            }
          }
        } else {
          updatedCheckList2.push(course);
          const index = updatedCheckList.indexOf(course);
          if (index !== -1) {
            updatedCheckList.splice(index, 1);
          }
        }
      }

    });
    const uniqueCourseIds = new Set();
    const uniqueCourses:any = [];

    
    updatedCheckList.forEach((item) => {
      if (!uniqueCourseIds.has(item.course.id)) {
        uniqueCourseIds.add(item.course.id);
        uniqueCourses.push(item);
      }
    });
    
    console.log(uniqueCourses);
    setRepeat(repeatList);
    setUnableCourses(updatedCheckList2);
    setCheckList(uniqueCourses);
    
  }, [user, refresh, courses, submit]);

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

    setSubmitting(false);
    setSubmit(!submit);
    setChecked([]);
  };

const handleDelete = (item?: StudentClassType) => {
  axios
    .post(`/api/courseEnrollment/courseDelete`, item)
    .then((res) => {
      toast.success(res.data.message);
    })
    .catch((err) => {
      toast.error(err.response.data.message);
    });
  setSubmit(!submit);
};

  return (
    <div className="lg:bsolute lg:w-[80%] sm:w-[100%] mt-[70px]  sm:text-[8px] lg:text-[16px]  flex p-10 justify-center flex-col items-center ">
      {perms.map((item, index) =>
        item.permission_id == 20 && item.active ? (
          <>
            <h1 className="flex p-3 lg:text-sm  bg-lightBlue m-3 rounded-md">
              اختر المواد
            </h1>
            <table className="lg:w-[1100px] sm:w-[350px]">
              <thead>
                <tr>
                  <th className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1 bg-grey"></th>
                  <th className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1 bg-grey">
                    الكريدت
                  </th>
                  <th className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1 bg-grey">
                    الساعات
                  </th>
                  <th className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1 bg-grey">
                    اجباري/اختياري
                  </th>
                  <th className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1 bg-grey">
                    التوقيت
                  </th>
                  <th className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1 bg-grey">
                    اسم الدكتور
                  </th>
                  <th className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1 bg-grey">
                    اسم المجموعة
                  </th>
                  <th className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1 bg-grey">
                    اسم المادة
                  </th>
                </tr>
              </thead>
              <tbody>
                {checkList.map((item, inde) =>
                  item.class.map((cls) => {
                    if (
                      cls.active &&
                      !selectedCourses.find((item) => cls.id === item.class.id)
                    ) {
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
                        <tr key={inde + 1}>
                          <td className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1">
                            <input
                              type="checkbox"
                              onChange={() => handleCheck(cls.id)}
                              checked={checked.includes(cls.id)}
                            />
                          </td>

                          <td className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1">
                            {item.course.credits}
                          </td>
                          <td className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1">
                            {item.course.hours}
                          </td>
                          <td className="border border-gray-300lg:py-2 lg:px-4 sm:p-1">
                            {item.majorCourse.isOptional ? 'اختياري' : 'اجباري'}
                          </td>
                          <td className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1">
                            {findDay?.name}/ {findStartTime?.name}-
                            {findEndTime?.name}
                          </td>
                          <td className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1">
                            {selectedDoc?.name} {selectedDoc?.surname}
                          </td>
                          <td className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1">
                            {selectedSec?.name}
                          </td>
                          <td
                            className={`border border-gray-300 lg:py-2 lg:px-4 sm:p-1${
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
                  <th className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1 bg-grey">
                    المواد المشروطة
                  </th>
                  <th className="border border-gray-300 px-4 py-2 bg-grey">
                    الكريدت
                  </th>
                  <th className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1 bg-grey">
                    الساعات
                  </th>
                  <th className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1 bg-grey">
                    اجباري/اختياري
                  </th>
                  <th className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1 bg-grey">
                    اسم المادة
                  </th>
                </tr>
              </thead>
              <tbody>
                {courses &&
                  unableCourses.map((item, ind) => {
                    const preCourses = item.prerequisites.map((pre) =>
                      courses.find(
                        (course) =>
                          pre.prerequisite_course_id === course.course.id
                      )
                    );
                    return (
                      <tr className="text-red-500" key={ind + 3}>
                        <td className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1">
                          {preCourses.map((preCourse) => (
                            <span key={preCourse?.course.id}>
                              {preCourse?.course.course_name}
                              {' - '}
                            </span>
                          ))}
                        </td>
                        <td className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1">
                          {item.course.credits}
                        </td>
                        <td className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1">
                          {item.course.hours}
                        </td>
                        <td className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1">
                          {item.majorCourse.isOptional ? 'اختياري' : 'اجباري'}
                        </td>
                        <td className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1">
                          {item.course.course_name}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            <button
              onClick={handleSubmit}
              className="flex p-3 lg:text-sm  bg-darkBlue text-secondary m-3 rounded-md"
            >
              اضافة
            </button>
            <h1 className="flex p-3 lg:text-sm  bg-lightBlue rounded-md m-5">
              المواد التي تم اختيارها/ في انتظار موافقة المشرف
            </h1>
            <table className="lg:w-[1100px] sm:w-[350px]">
              <thead>
                <tr>
                  <th className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1 bg-grey"></th>
                  <th className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1 bg-grey">
                    الكريدت
                  </th>
                  <th className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1 bg-grey">
                    الساعات
                  </th>
                  <th className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1 bg-grey">
                    التوقيت
                  </th>
                  <th className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1 bg-grey">
                    اسم الدكتور
                  </th>
                  <th className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1 bg-grey">
                    اسم المجموعة
                  </th>
                  <th className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1 bg-grey">
                    اسم المادة
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedCourses &&
                  selectedCourses.map((item, index) => {
                    const findDay = days.find(
                      (day) => day.day === item.class.day
                    );
                    const findStartTime = hoursNames.find(
                      (hour) => hour.id === item.class.starts_at
                    );
                    const findEndTime = hoursNames.find(
                      (hour) => hour.id === item.class.ends_at
                    );
                    const repeated = repeat.find(
                      (co) => co.course.id == item.course.id
                    );
                    return (
                      <tr key={index}>
                        <td className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1">
                          <BsXCircleFill
                            className="cursor-pointer"
                            onClick={() =>
                              handleDelete(item.courseEnrollements)
                            }
                          />
                        </td>
                        <td className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1">
                          {item.course.credits}
                        </td>
                        <td className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1">
                          {item.course.hours}
                        </td>
                        <td className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1">
                          {findDay?.name}/{findStartTime?.name}-
                          {findEndTime?.name}
                        </td>
                        <td className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1">
                          {item.doctor?.name} {item.doctor?.surname}
                        </td>
                        <td className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1">
                          {item.section.name}
                        </td>
                        <td className="border border-gray-300 lg:py-2 lg:px-4 sm:p-1">
                          {item.course.course_name}{' '}
                          {repeated?.course.id == item.course.id
                            ? '- اعادة'
                            : ''}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </>
        ) : (
          <div
            key={index}
            className=" flex-col w-screen flex justify-content items-center"
          >
            <p className="flex lg:w-[400px] sm:w-[200px] justify-center items-center bg-lightBlue p-5 ">
              لقد تم اغلاق تسجيل المواد
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default Page;
