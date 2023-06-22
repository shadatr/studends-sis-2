'use client';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import {
  AddCourse2Type,
  ClassesType,
  GetPermissionStudentType,
  PrerequisiteCourseType,
  SectionType,
  StudentClassType,
} from '@/app/types/types';

const Page = () => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'student' : false) {
    throw new Error('Unauthorized');
  }
  const user = session.data?.user;

  const [courses, setCourses] = useState<AddCourse2Type[]>([]);
  const [checkList, setCheckList] = useState<AddCourse2Type[]>([]);
  const [checked, setChecked] = useState<number[]>([]);
  const [prerequisites, setPrerequisites] = useState<PrerequisiteCourseType[]>(
    []
  );
  const [sections, setSections] = useState<SectionType[]>([]);
  const [classes, setClasses] = useState<ClassesType[]>([]);
  const [courseEnrollments, setCourseEnrollments] = useState<
    StudentClassType[]
  >([]);
  const [refresh, setRefresh] = useState(false);
  const [perms, setPerms] = useState<GetPermissionStudentType[]>([]);
  const [unableCourses, setUnableCourses] = useState<AddCourse2Type[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const response = await axios.get(
            `/api/course/majorCourses/${user?.major}`
          );
          const message: AddCourse2Type[] = response.data.message;
          setCourses(message);

          const responseCourseEnroll = await axios.get(
            `/api/getAll/getAllCourseEnroll/${user?.id}`
          );
          const messageCourseEnroll: StudentClassType[] =
            responseCourseEnroll.data.message;
          setCourseEnrollments(messageCourseEnroll);

          const prerequisitePromises = message.map(async (course) => {
            const responseReq = await axios.get(
              `/api/course/prerequisitesCourses/${course.id}`
            );
            const {
              message: prerequisiteMessage,
            }: { message: PrerequisiteCourseType[] } = responseReq.data;
            return prerequisiteMessage;
          });

          const prerequisiteData = await Promise.all(prerequisitePromises);
          const prerequisites = prerequisiteData.flat();
          setPrerequisites(prerequisites);

          const sectionsPromises = message.map(async (course) => {
            const responseReq = await axios.get(
              `/api/getAll/getAllSections/${course.id}`
            );
            const { message: secMessage }: { message: SectionType[] } =
              responseReq.data;
            return secMessage;
          });

          const sectionData = await Promise.all(sectionsPromises);
          const sections = sectionData.flat();
          setSections(sections);

          const classPromises = sections.map(async (section) => {
            const responseReq = await axios.get(
              `/api/getAll/getAllClasses/${section.id}`
            );
            const { message: classMessage }: { message: ClassesType[] } =
              responseReq.data;
            return classMessage;
          });

          const classData = await Promise.all(classPromises);
          const classes = classData.flat();
          setClasses(classes);

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
    fetchData();
    setRefresh(!refresh);
  }, [user]);

  useEffect(() => {
    const updatedCheckList: AddCourse2Type[] = [];
    const updatedCheckList2: AddCourse2Type[] = [];
    const updatedSections: SectionType[] = [];
    const updatedClasses: ClassesType[] = [];

    courses.forEach((course) => {
      const prerequisiteCourse = prerequisites.filter(
        (prereq) => prereq.course_id === course.id
      );
      if (
        !prerequisiteCourse.length &&
        !updatedCheckList.find((item) => item.id === course.id)
      ) {
        const prerequisiteSection = sections.find(
          (prereq) =>
            course.id === prereq.course_id &&
            prereq.max_students > prereq.students_num
        );
        if (prerequisiteSection) {
          updatedSections.push(prerequisiteSection);
        }

        classes.forEach((classItem) => {
          updatedSections.forEach((sec) => {
            if (sec.id === classItem.section_id) {
              updatedClasses.push(classItem);
            }
          });
        });

        if (courseEnrollments.length) {
          courseEnrollments.forEach((courseEnroll) => {
            const passed = updatedClasses.map((classItem) => {
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
                !updatedCheckList.find((item) => item.id === course.id)
              ) {
                updatedCheckList.push(course);
              }
            });
          });
        } else {
          updatedCheckList.push(course);
        }
      } else {
        prerequisiteCourse.map((preCourse) => {
          const updatedClasses2: ClassesType[] = [];
          const prerequisiteSectionIds2 = sections.filter(
            (prereq) => preCourse.prerequisite_course_id === prereq.course_id
          );

          classes.forEach((classItem) => {
            prerequisiteSectionIds2.forEach((sec) => {
              if (sec.id === classItem.section_id) {
                updatedClasses2.push(classItem);
              }
            });
          });

          if (courseEnrollments.length) {
            courseEnrollments.forEach((courseEnroll) => {
              updatedClasses2.map((classItem) => {
                const passed = courseEnrollments.find(
                  (classItem) =>
                    courseEnroll.student_id === user?.id &&
                    classItem.id === courseEnroll.class_id &&
                    courseEnroll
                );

                if (
                  passed?.pass === true &&
                  !updatedCheckList.find((item) => item.id === course.id)
                ) {
                  updatedCheckList.push(course);
                  console.log(course);
                } else {
                  if (
                    !updatedCheckList2.find((item) => item.id === course.id)
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
          } else if (!updatedCheckList2.find((item) => item.id === course.id)) {
            updatedCheckList2.push(course);
          }
        });
      }
    });

    setUnableCourses(updatedCheckList2);
    setCheckList(updatedCheckList);
  }, [user, classes, courseEnrollments, prerequisites, sections, courses]);

  const handleCheck = (item: AddCourse2Type) => {
    const checkedIndex = checked.indexOf(item.id);
    if (checkedIndex === -1) {
      setChecked([...checked, item.id]);
    } else {
      const updatedChecked = [...checked];
      updatedChecked.splice(checkedIndex, 1);
      setChecked(updatedChecked);
    }
    setRefresh(!refresh);
  };

  const handleSubmit = () => {
    checked.forEach((item) => {
      const updatedSections2: SectionType[] = [];
      const updatedClasses2: ClassesType[] = [];

      const prerequisiteSection = sections.find(
        (prereq) =>
          item === prereq.course_id && prereq.max_students > prereq.students_num
      );
      if (prerequisiteSection) {
        updatedSections2.push(prerequisiteSection);

        classes.forEach((classItem) => {
          updatedSections2.forEach((sec) => {
            if (sec.id === classItem.section_id) {
              updatedClasses2.push(classItem);
            }
          });
        });
        if (updatedClasses2[0]) {
          const data1 = {
            student_id: user?.id,
            class_id: updatedClasses2[0].id,
          };
          axios.post(`/api/getAll/getAllCourseEnroll/${user?.id}`, data1);
        }
      }
    });
    const data2 = {
      student_id: user?.id,
      permission_id: 20,
      active: false,
    };
    // console.log(data2);
    axios.post(`/api/allPermission/student/selectedPerms/${user?.id}`, data2);
    setRefresh(!refresh);
  };

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
                      <input
                        value={item.course_name}
                        type="checkbox"
                        onChange={() => handleCheck(item)}
                        checked={checked.includes(item.id)}
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2"></td>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.credits}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.passing_percentage}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.hours}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.IsOptional ? 'اجباري' : 'اختياري'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.course_name}
                    </td>
                  </tr>
                ))}
                {unableCourses.map((item, index) => {
                  const updatedCheckList: AddCourse2Type[] = [];
                  const pre = prerequisites.filter(
                    (i) => i.course_id === item.id
                  );
                  pre.map((i) =>
                    courses.map((c) => {
                      if (i.prerequisite_course_id == c.id) {
                        updatedCheckList.push(c);
                      }
                    })
                  );
                  return (
                    <tr className="text-red-500" key={index}>
                      <td className="border border-gray-300 px-4 py-2"></td>
                      <td className="border border-gray-300 px-4 py-2">
                        {updatedCheckList.map((c) => `${c.course_name} - `)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.credits}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.passing_percentage}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.hours}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.IsOptional ? 'اجباري' : 'اختياري'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {item.course_name}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <button
              onClick={() => handleSubmit}
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
