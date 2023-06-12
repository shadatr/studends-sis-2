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
  const [prerequisites, setPrerequisites] = useState<PrerequisiteCourseType[]>([]);
  const [sections, setSections] = useState<SectionType[]>([]);
  const [classes, setClasses] = useState<ClassesType[]>([]);
  const [courseEnrollments, setCourseEnrollments] = useState<StudentClassType[] >([]);
  const [refresh, setRefresh] = useState(false);
  const [perms, setPerms] = useState<GetPermissionStudentType[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const response = await axios.get(
            `/api/course/courseRegistration/${user?.major}`
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
  const updatedSections: SectionType[] = [];
  const updatedClasses: ClassesType[] = [];
  const updatedSections2: SectionType[] = [];
  const updatedClasses2: ClassesType[] = [];

  courses.forEach((course) => {
    const prerequisiteCourse = prerequisites.find(
      (prereq) => prereq.course_id === course.id
    );
    if (
      !prerequisiteCourse &&
      !updatedCheckList.find((item) => item.id === course.id)
    ) {
      const prerequisiteSection = sections.find(
        (prereq) => course.id === prereq.course_id&&
          prereq.max_students > prereq.students_num
      );
        if (prerequisiteSection) {updatedSections2.push(prerequisiteSection);

      classes.forEach((classItem) => {
        updatedSections2.forEach((sec) => {
          if (sec.id === classItem.section_id) {
            updatedClasses2.push(classItem);
          }
        });
      });

      
      courseEnrollments.forEach((courseEnroll) => {
        updatedClasses2.forEach((classItem) => {
        const check = updatedClasses2.find(
          (classItem) =>
            courseEnroll.student_id === user?.id &&
            classItem.id === courseEnroll.class_id &&
            courseEnroll.pass === true
        );
          
          if (
              !check&&
            !updatedCheckList.find((item) => item.id === course.id)
          ) {
            // console.log(course);
            updatedCheckList.push(course);
          } else if (
            courseEnroll.student_id === user?.id &&
            classItem.id === courseEnroll.class_id &&
            (courseEnroll.pass === false || courseEnroll.can_repeat === true) &&
            !updatedCheckList.find((item) => item.id === course.id)
          ) {
            updatedCheckList.push(course);
          }
        });
      });}
    } else {
        const prerequisiteSectionIds2 = sections.filter(
          (prereq) => course.id === prereq.course_id
        );
      updatedSections2.push(...prerequisiteSectionIds2);

      classes.forEach((classItem) => {
        updatedSections2.forEach((sec) => {
          if (sec.id === classItem.section_id) {
            updatedClasses2.push(classItem);
          }
        });
      });

      const prerequisiteSectionIds = sections.filter(
        (prereq) =>
          prerequisiteCourse?.prerequisite_course_id === prereq.course_id
      );
      updatedSections.push(...prerequisiteSectionIds);

      classes.forEach((classItem) => {
        updatedSections.forEach((sec) => {
          if (sec.id === classItem.section_id) {
            updatedClasses.push(classItem);
          }
        });
      });

      courseEnrollments.forEach((courseEnroll) => {
        updatedClasses.forEach((classItem) => { 
          
          if (
            courseEnroll.student_id === user?.id &&
            classItem.id === courseEnroll.class_id &&
            courseEnroll.pass &&
            !updatedCheckList.find((item) => item.id === course.id)
          ) {
              updatedCheckList.push(course);
          }
        });
      });
    }
  });

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    checked.forEach((item) => {
      const updatedSections2: SectionType[] = [];
      const updatedClasses2: ClassesType[] = [];

      const prerequisiteSection = sections.find(
        (prereq) => item === prereq.course_id&&
          prereq.max_students > prereq.students_num
      );
        if (prerequisiteSection) {updatedSections2.push(prerequisiteSection);


      classes.forEach((classItem) => {
        updatedSections2.forEach((sec) => {
          if (sec.id === classItem.section_id) {
            updatedClasses2.push(classItem);
          }
        });
      });
      if (updatedClasses2[0]){
        const data1 = {
          student_id: user?.id,
          class_id: updatedClasses2[0].id,
        };
      axios.post(`/api/getAll/getAllCourseEnroll/${user?.id}`, data1);
      }}
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
    <div className="absolute w-[100%] flex text-sm p-10 justify-content items-center ">
      {perms.map((item, index) =>
        item.permission_id == 20 && item.active ? (
          <form
            key={index}
            onSubmit={handleSubmit}
            className=" flex-col w-screen flex justify-content items-center"
          >
            <h1 className="flex w-[400px] text-sm justify-center items-center bg-darkBlue text-secondary">
              اختر المواد
            </h1>
            <div className="p-1 rounded-md">
              {checkList.map((item, index) => (
                <div
                  className="bg-lightBlue flex w-[400px] justify-between"
                  key={index}
                >
                  <input
                    className="p-2 ml-9"
                    value={item.course_name}
                    type="checkbox"
                    onChange={() => handleCheck(item)}
                    checked={checked.includes(item.id)}
                  />
                  <label className="pr-5  ">{item.course_name}</label>
                </div>
              ))}
            </div>
            <button
              type="submit"
              className="flex w-[400px]  text-sm justify-center items-center bg-darkBlue text-secondary"
            >
              اضافة
            </button>
          </form>
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
