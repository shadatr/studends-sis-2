'use client';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect, useRef, useState } from 'react';
import {
  StudenCourseType,
  LetterGradesType,
  DayOfWeekType,
  CheckedType,
  CourseInfoType,
  StudentClassType,
  RegisterStudent2Type,
} from '@/app/types/types';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';
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
  { name: 'الجمعة', day: 'friday' },
  { name: 'الخميس', day: 'thursday' },
  { name: 'الاربعاء', day: 'wednesday' },
  { name: 'الثلثاء', day: 'tuesday' },
  { name: 'الاثنين', day: 'monday' },
];

const Page = ({ params }: { params: { id: number } }) => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'doctor' : false) {
    redirect('/');
  }
  const user = session.data?.user;

  const [studentCourses, setStudentCourses] = useState<StudenCourseType[]>([]);
  const [student, setStudent] = useState<RegisterStudent2Type[]>([]);
  const [checkList, setCheckList] = useState<StudenCourseType[]>([]);
  const [checked, setChecked] = useState<number[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [courseLetter, setCourseLetter] = useState<LetterGradesType[]>([]);
  const printableContentRef = useRef<HTMLDivElement>(null);
  const [courses, setCourses] = useState<CourseInfoType[]>([]);
  const [repeat, setRepeat] = useState<CourseInfoType[]>([]);
  const [checkList2, setCheckList2] = useState<CourseInfoType[]>([]);
  const [courseEnrollements, setCourseEnrollements] = useState<
    StudentClassType[]
  >([]);
  const [checked2, setChecked2] = useState<number[]>([]);
  const [submit, setSubmit] = useState(false);
  const [unableCourses, setUnableCourses] = useState<CourseInfoType[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await axios.get(`/api/personalInfo/student/${params.id}`);
        const messageMaj: RegisterStudent2Type[] = resp.data.message;
        setStudent(messageMaj);

        const response = await axios.get(
          `/api/getAll/StudentCourseReg/${messageMaj[0].major}`
        );
        const message: CourseInfoType[] = response.data.message;
        setCourses(message);

        const responseEnroll = await axios.get(
          `/api/courseEnrollment/courseAccept`
        );
        const messageEnroll: StudentClassType[] = responseEnroll.data.message;
        setCourseEnrollements(messageEnroll);


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
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setRefresh(!refresh);
    };

    fetchData();
  }, [params.id, refresh, user]);

  useEffect(() => {
    const updatedCheckList: CourseInfoType[] = [];
    const updatedCheckList2: CourseInfoType[] = [];
    const repeatList: CourseInfoType[] = [];

    courses.forEach((course) => {
      if (course.prerequisites.length === 0) {
        if (course?.courseEnrollements?.length != 0) {
          const enrollments = course.courseEnrollements.filter(
            (co) => co.student_id == params.id
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
            (prereq) => preCourse.prerequisite_course_id === prereq.course?.id
          );

          const passed = prerequisiteCourse?.courseEnrollements.find(
            (courseEnroll) =>
              prerequisiteCourse.class.find(
                (classItem) =>
                  courseEnroll.student_id === params.id &&
                  classItem.id === courseEnroll.class_id
              )
          );
          if (passed?.pass == true) {
            done++;
          }
        });

        if (done == course.prerequisites.length) {
          if (course?.courseEnrollements?.length != 0) {
            const enrollments = course.courseEnrollements.filter(
              (co) => co.student_id == params.id
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
    const uniqueCourses: any = [];

    updatedCheckList.forEach((item) => {
      if (!uniqueCourseIds.has(item.course.id)) {
        uniqueCourseIds.add(item.course.id);
        uniqueCourses.push(item);
      }
    });

    setRepeat(repeatList);
    setUnableCourses(updatedCheckList2);
    setCheckList2(uniqueCourses);
  }, [params,user, refresh, courses]);

  const handleCheck2 = (item: number) => {
    const isChecked = checked2.includes(item);
    if (!isChecked) {
      setChecked2((prevChecked) => [...prevChecked, item]);
    } else {
      setChecked2((prevChecked) =>
        prevChecked.filter((value) => value !== item)
      );
    }
  };

  const handleSubmit2 = async () => {
    if (submitting) {
      return;
    }

    setSubmitting(true);

    for (const item of checked2) {
      const registeredBefore = courseEnrollements.find(
        (enrollment) =>
          enrollment.class_id === item && enrollment.student_id === params?.id
      );

      if (registeredBefore) {
        toast.error('لقد سجلت في هذه الماده من قبل');
        return;
      }

      const enrollmentData = {
        student_id: params.id,
        class_id: item,
        approved: true,
      };
      await axios.post(`/api/getAll/getAllCourseEnroll`, enrollmentData);
    }

    setSubmitting(false);
    setSubmit(!submit);
  };

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

      const permissionData = {
        student_id: params.id,
        permission_id: 20,
        active: false,
      };
      await axios.post(
        `/api/allPermission/student/selectedPerms/${params.id}`,
        permissionData
      );
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

  const handleDelete = (item?: number) => {
    const data1 = {
      id: item,
    };
    axios
      .post(`/api/courseEnrollment/courseDelete`, data1)
      .then((res) => {
        toast.success(res.data.message);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
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

      <form
        onSubmit={handleSubmit}
        className="flex-col w-screen flex justify-content items-center"
      >
        <h1 className="text-sm bg-lightBlue rounded-md p-3 px-12 m-3">
          : المواد التي اختارها الطالب اللتي يجب الموافقة عليها
        </h1>

        <div className="p-1 rounded-md mb-5">
          {checkList.length ? (
            <>
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
                    const repeated = repeat.find(
                      (co) => co.course.id == item.course.id
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
                          {repeated?.course.id == item.course.id
                            ? '- اعادة'
                            : ''}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <button
                type="submit"
                className="flex w-[200px] p-3 text-sm justify-center items-center bg-darkBlue text-secondary"
              >
                موافقة
              </button>
            </>
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
      </form>

      <h1 className="text-sm bg-lightBlue rounded-md p-3 px-12 m-3">
        اضف مواد اضافية لطالب
      </h1>
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
          {checkList2.map((item, inde) =>
            item.class.map((cls) => {
              if (
                cls.active &&
                item.class &&
                !studentCourses.find((item) => cls.id === item.class?.id)
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
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        type="checkbox"
                        onChange={() => handleCheck2(cls.id)}
                        checked={checked2.includes(cls.id)}
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
                      {findDay?.name}/ {findStartTime?.name}-{findEndTime?.name}
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
                      {repeated?.course.id == item.course.id ? '- اعادة' : ''}
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
          {unableCourses.map((item, ind) => {
            const preCourses = item.prerequisites.map((pre) =>
              courses.find(
                (course) => pre.prerequisite_course_id === course.course.id
              )
            );
            return (
              <tr className="text-red-500" key={ind + 3}>
                <td className="border border-gray-300 px-4 py-2">
                  {preCourses.map((preCourse) => (
                    <span key={preCourse?.course.id}>
                      {preCourse?.course.course_name}
                      {' - '}
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
        onClick={handleSubmit2}
        className="flex p-3 text-sm  bg-darkBlue text-secondary m-3 rounded-md"
      >
        اضافة
      </button>

      <h1 className="text-sm bg-lightBlue rounded-md p-3 px-12 m-3">
        الدرجات و المواد
      </h1>
      <div ref={printableContentRef}>
        <table className="m-10 w-[1100px]">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 bg-grey"></th>
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
                    <td className="border border-gray-300 px-4 py-2">
                      <BsXCircleFill
                        className="cursor-pointer"
                        onClick={() =>
                          handleDelete(course.courseEnrollements.id)
                        }
                      />
                    </td>
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
                      {course.doctor.name} {course.doctor.surname}
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
      <div style={{ position: 'absolute', top: '-9999px' }}>
        <div ref={printableContentRef} className="m-5">
          {student.length>0 && <>
            <h1>{student[0].name} :الاسم</h1>
            <h1>{student[0].surname} :اللقب</h1>
            <h1>{student[0].number} : رقم الطالب</h1>
          </> 
          }
          
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
                        {course.doctor.name} {course.doctor.surname}
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
                    <td className="border border-gray-300 px-4 py-2 ">
                      لا يوجد
                    </td>
                  </tr>;
                }
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Page;
