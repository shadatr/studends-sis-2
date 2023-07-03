'use client';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import React, { useEffect, useState } from 'react';
import { CourseInfoType, GetPermissionStudentType } from '@/app/types/types';
import { redirect } from 'next/navigation';


const Page = () => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'student' : false) {
    redirect('/');
  }
  const user = session.data?.user;

  const [courses, setCourses] = useState<CourseInfoType[]>([]);
  const [checkList, setCheckList] = useState<CourseInfoType[]>([]);
  const [checked, setChecked] = useState<number[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [submit, setSubmit] = useState(false);
  const [perms, setPerms] = useState<GetPermissionStudentType[]>([]);
  const [unableCourses, setUnableCourses] = useState<CourseInfoType[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const response = await axios.get(
            `/api/getAll/getAllStudentCourse/${user?.major}`
          );
          const message: CourseInfoType[] = response.data.message;
          setCourses(message);
          console.log(message);


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


    courses.forEach((course) => {
      if(course.prerequisites){

        if (course.courseEnrollements) {
          course.courseEnrollements.map((courseEnroll) => {
            const passed = course.class.map((classItem) => {
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
                !updatedCheckList.find((item) => item.course.id === course.course.id)
              ) {
                updatedCheckList.push(course);
              }
            });
          });
        } else {
          updatedCheckList.push(course);
        }
      } else {
        if (course.prerequisites){
          course.prerequisites.map((preCourse) => {
            const prerequisiteCourse = courses.find(
              (prereq) => preCourse.prerequisite_course_id === prereq.course.id
            );

            if (prerequisiteCourse?.courseEnrollements.length) {
              prerequisiteCourse.courseEnrollements.forEach((courseEnroll) => {
                prerequisiteCourse.class.map((classItem) => {
                  const passed = prerequisiteCourse.courseEnrollements.find(
                    (classItem) =>
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
                    console.log(course);
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
              });
            } else if (
              !updatedCheckList2.find(
                (item) => item.course.id === course.course.id
              )
            ) {
              updatedCheckList2.push(course);
            }
          });}
      }
    });

    setUnableCourses(updatedCheckList2);
    setCheckList(updatedCheckList);
  }, [user, refresh, courses]);

  // const handleCheck = (item: AddCourse2Type) => {
  //   const checkedIndex = checked.indexOf(item.id);
  //   if (checkedIndex === -1) {
  //     setChecked([...checked, item.id]);
  //   } else {
  //     const updatedChecked = [...checked];
  //     updatedChecked.splice(checkedIndex, 1);
  //     setChecked(updatedChecked);
  //   }
  //   setRefresh(!refresh);
  // };

  // const handleSubmit = () => {
  //   checked.forEach((item) => {
  //     const updatedSections2: SectionType[] = [];
  //     const updatedClasses2: ClassesType[] = [];

  //     const prerequisiteSection = sections.find(
  //       (prereq) =>
  //         item === prereq.course_id && prereq.max_students > prereq.students_num
  //     );
  //     if (prerequisiteSection) {
  //       updatedSections2.push(prerequisiteSection);

  //       classes.forEach((classItem) => {
  //         updatedSections2.forEach((sec) => {
  //           if (sec.id === classItem.section_id) {
  //             updatedClasses2.push(classItem);
  //           }
  //         });
  //       });
  //       if (updatedClasses2[0]) {
  //         const data1 = {
  //           student_id: user?.id,
  //           semester: user?.semester,
  //           class_id: updatedClasses2[0].id,
  //         };
  //         axios.post(`/api/getAll/getAllCourseEnroll/${user?.id}`, data1);
  //       }
  //     }
  //   });
  //   const data2 = {
  //     student_id: user?.id,
  //     permission_id: 20,
  //     active: false,
  //   };
  //   axios.post(`/api/allPermission/student/selectedPerms/${user?.id}`, data2);
  //   setSubmit(!submit);
  // };

  return (
    <div className="absolute w-[80%] flex text-sm p-10 justify-center flex-col items-center ">
      {perms.map((item, index) =>
        item.permission_id == 20 && item.active ? (
          <>
            <h1> اختر المواد</h1>
            <table className="w-[1100px] ">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 bg-grey"></th>
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
                {checkList.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2">
                      {/* <input
                        value={item.course_name}
                        type="checkbox"
                        onChange={() => handleCheck(item)}
                        checked={checked.includes(item.id)}
                      /> */}
                    </td>
                    <td className="border border-gray-300 px-4 py-2"></td>
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
                      {item.majorCourse.isOptional ? 'اجباري' : 'اختياري'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.course.course_name}
                    </td>
                  </tr>
                ))}
                {unableCourses.map((item, index) => {
                  const preCourses = item.prerequisites.map((pre) =>
                    courses.find(
                      (course) =>
                        pre.prerequisite_course_id === course.course.id
                    )
                  );
                  return (
                    <tr className="text-red-500" key={index}>
                      <td className="border border-gray-300 px-4 py-2"></td>
                      <td className="border border-gray-300 px-4 py-2">
                        {preCourses.map((preCourse) => (
                          <span key={preCourse?.course.id}>
                            {preCourse?.course.course_name}
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
                        {item.majorCourse.isOptional ? 'اجباري' : 'اختياري'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.course.course_name}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* <button
              onClick={handleSubmit}
              className="flex p-3 text-sm  bg-darkBlue text-secondary m-3 rounded-md"
            >
              اضافة
            </button> */}
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
