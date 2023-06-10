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

  useEffect(() => {
    const fetchData = async () => { 

      if(user){
      try {
        console.log(user);
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
      } catch (error) {  
        console.error('Error fetching data:', error);
      }
      
    }
  };
    fetchData();
  setRefresh(!refresh);
  }, [ user ]);
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
            console.log(course);
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
      });
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
}, [refresh, user, classes, courseEnrollments, prerequisites, sections]);

  const handleCheck = (item: AddCourse2Type) => {
    const checkedIndex = checked.indexOf(item.id);
    if (checkedIndex === -1) {
      setChecked([...checked, item.id]);
    } else {
      const updatedChecked = [...checked];
      updatedChecked.splice(checkedIndex, 1);
      setChecked(updatedChecked); 
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    checked.forEach((item) => {
      const data1 = {
        student_id: user?.id,
        permission_id: item,
        active: true,
      };
      axios.post('/api/allPermission/admin', data1);
    });
  };

  return ( 
    <div className="fixed w-[800px] text-sm right-[464px] top-[140px] ">
      <form onSubmit={handleSubmit} className="p-10 w-[400px] ">
        <h1 className="flex w-full  text-sm justify-center items-center bg-darkBlue text-secondary">
          اختر الصلاحيات
        </h1>
        <div className="p-1 rounded-md">
          {checkList.map((item, index) => (
            <div className="bg-lightBlue flex justify-between" key={index}>
              <input
                className="p-2 ml-9"
                value={item.course_name}
                type="checkbox"
                onChange={() => handleCheck(item)}
                checked={checked.includes(item.id)}
              />
              <label className="pr-5">{item.course_name}</label>
            </div>
          ))}
        </div>
        <button
          type="submit"
          className="flex w-full  text-sm justify-center items-center bg-darkBlue text-secondary"
        >
          اضافة
        </button>
      </form>
    </div>
  );
};

export default Page;
