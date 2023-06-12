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

const Page = ({ params }: { params: { id: number } }) => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'doctor' : false) {
    throw new Error('Unauthorized');
  }
//   const user = session.data?.user;

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseCourseEnroll = await axios.get(
          `/api/getAll/getAllCourseEnroll/${params.id}`
        );
        const messageCourseEnroll: StudentClassType[] =
          responseCourseEnroll.data.message;
        setCourseEnrollments(messageCourseEnroll);

        const classPromises = messageCourseEnroll.map(async (Class) => {
          const responseReq = await axios.get(
            `/api/getAll/getSpecificClass/${Class.class_id}`
          );
          const { message: classMessage }: { message: ClassesType[] } =
            responseReq.data;
          return classMessage;
        });

        const classData = await Promise.all(classPromises);
        const classes = classData.flat();
        setClasses(classes);

        const sectionsPromises = classes.map(async (course) => {
          const responseReq = await axios.get(
            `/api/getAll/getSpecificSection/${course.section_id}`
          );
          const { message: secMessage }: { message: SectionType[] } =
            responseReq.data;
          return secMessage;
        });

        const sectionData = await Promise.all(sectionsPromises);
        const sections = sectionData.flat();
        setSections(sections);

        const coursesPromises = sections.map(async (section) => {
          const responseReq = await axios.get(
            `/api/getAll/getSpecificCourse/${section.course_id}`
          );
          const { message: courseMessage }: { message: AddCourse2Type[] } =
            responseReq.data;
          return courseMessage;
        });

        const courseData = await Promise.all(coursesPromises);
        const courses = courseData.flat();
        setCourses(courses);

        // const responsePer = await axios.get(
        //   `/api/allPermission/student/selectedPerms/${params.id}`
        // );
        // const messagePer: GetPermissionStudentType[] = responsePer.data.message;
        // setPerms(messagePer);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setRefresh(!refresh);
    };

    fetchData();
  }, [params.id, refresh]);


  useEffect(() => {
    const updatedCheckList: AddCourse2Type[] = [];


    courseEnrollments.map((course) => {
      const studenClass = classes.find((Class) => Class.id == course.class_id);

      const studentSection = sections.find(
        (sec) => sec.id == studenClass?.section_id
      );

      const studentCourse = courses.find(
        (course) => course.id == studentSection?.course_id
      );
    
      if (studentCourse) updatedCheckList.push(studentCourse);
    });
    setCheckList(updatedCheckList);
  }, [ refresh]);


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

        const studentCourse = courses.find(
        (course) => course.id == item
      );

      const studentSection = sections.find(
        (sec) => sec.course_id == studentCourse?.id
      );

      const studentClass = classes.find(
        (sec) => sec.section_id == studentSection?.id
      );

      const studenCourseEnroll = courseEnrollments.find(
        (Class) => Class.class_id == studentClass?.id
      );

        const data1 = {
          student_id: params.id,
          id: studenCourseEnroll?.id,
          approved: true,
        };
        axios.post('/api/courseEnrollment/courseAccept', data1);

    });
      const filteredList = checkList.filter((item) => !checked.includes(item.id));
    filteredList.forEach((item) => {

        const studentCourse = courses.find(
        (course) => course.id == item.id
      );

      const studentSection = sections.find(
        (sec) => sec.course_id == studentCourse?.id
      );

      const studentClass = classes.find(
        (sec) => sec.section_id == studentSection?.id
      );

      const studenCourseEnroll = courseEnrollments.find(
        (Class) => Class.class_id == studentClass?.id
      );
      console.log(studenCourseEnroll);

        const data1 = {
          student_id: params.id,
          id: studenCourseEnroll?.id,
          approved: true,
        };
        axios.post('/api/courseEnrollment/courseDelete', data1);});
    
  setRefresh(!refresh);};

  return (
    <div className="absolute w-[100%] flex text-sm p-10 justify-content items-center ">
          <form
            onSubmit={handleSubmit}
            className=" flex-col w-screen flex justify-content items-center"
          >
            <h1 className="flex w-[400px] text-sm justify-end p-1 items-center bg-darkBlue text-secondary">
              :اختر المواد
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
              موافقة
            </button>
          </form>
        
    </div>
  );
};

export default Page;
