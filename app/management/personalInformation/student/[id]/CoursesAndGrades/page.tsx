'use client';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import {
  AddCourse2Type,
  ClassesType,
  SectionType,
  StudentClassType,
  StudentCourseType,
} from '@/app/types/types';

const Page = ({ params }: { params: { id: number } }) => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'doctor' : false) {
    throw new Error('Unauthorized');
  }

  const [courses, setCourses] = useState<AddCourse2Type[]>([]);
  const [checkList, setCheckList] = useState<AddCourse2Type[]>([]);
  const [checked, setChecked] = useState<number[]>([]);
    const [studentCourses, setStudentCourses] = useState<StudentCourseType[]>([]);
  const [sections, setSections] = useState<SectionType[]>([]);
  const [classes, setClasses] = useState<ClassesType[]>([]);
  const [courseEnrollments, setCourseEnrollments] = useState<StudentClassType[]>([]);
  const [refresh, setRefresh] = useState(false);

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

      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setRefresh(!refresh);
    };

    fetchData();
  }, [params.id, refresh]);


  useEffect(() => {
    const updatedCheckList: AddCourse2Type[] = [];
    const updatedStudentCourses: StudentCourseType[] = [];

    courseEnrollments.map((course) => {
      const studenClass = classes.find((Class) => Class.id == course.class_id);

      const studentSection = sections.find(
        (sec) => sec.id == studenClass?.section_id
      );

      const studentCourse = courses.find(
        (course) => course.id == studentSection?.course_id
      );
    
      if (studentCourse){ 
        if(!course.approved){
        updatedCheckList.push(studentCourse); }
        else{
            const data = {
              course_name: studentCourse.course_name,
              course: course,
              section: studentSection,
              class: studenClass,
            };
            updatedStudentCourses.push(data);
        }
    }
    });
    console.log(updatedStudentCourses);
    setStudentCourses(updatedStudentCourses);
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
    <div className="absolute w-[100%] flex flex-col text-sm p-10 justify-content items-center ">
      <form
        onSubmit={handleSubmit}
        className=" flex-col w-screen flex justify-content items-center"
      >
        <h1 className="flex w-[400px] text-sm justify-end p-1 items-center">
          :المواد التي اختارها الطالب
        </h1>
        <h1 className="flex w-[400px] text-sm justify-end p-1 items-center bg-darkBlue text-secondary">
          :اختر المواد
        </h1>
        <div className="p-1 rounded-md">
          {checkList
            ? checkList.map((item, index) => (
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
              ))
            : 'لا يوجد'}
        </div>
        <button
          type="submit"
          className="flex w-[400px]  text-sm justify-center items-center bg-darkBlue text-secondary"
        >
          موافقة
        </button>
      </form>
      <table className='m-10'>
        <thead>
          <th className="border border-gray-300 px-4 py-2 bg-grey">النتيجة</th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">المجموع</th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">النسبة</th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">
            اعمال السنة
          </th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">النسبة</th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">
            الامتحان الانهائي
          </th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">النسبة</th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">
            الامتحان النصفي
          </th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">
            اسم المجموعة
          </th>
          <th className="border border-gray-300 px-4 py-2 bg-grey">
            اسم المادة
          </th>
        </thead>
        <tbody>
          {studentCourses.map((course, index) => (
            <tr key={index}>
              <td className="border border-gray-300 px-4 py-2">
                {course.class?.result_publish ? course.course.pass : ''}
              </td>
              <td className="border border-gray-300 px-4 py-2  ">
                {course.class?.result_publish ? course.course.result : ''}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {course.class?.class_work}%
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {course.class?.class_work_publish
                  ? course.course.class_work
                  : ''}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {course.class?.final}%
              </td>
              <td className="border border-gray-300 px-4 py-2 flex justify-between items-center">
                {course.class?.final_publish ? course.course.final : ''}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {course.class?.midterm}%
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {course.class?.mid_publish ? course.course.midterm : ''}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {course.section?.name}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {course.course_name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Page;
