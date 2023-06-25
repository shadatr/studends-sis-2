'use client';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect, useRef, useState } from 'react';
import {
  AddCourse2Type,
  ClassesType,
  LetterGradesType,
  SectionType,
  StudentClassType,
  StudentCourseType,
} from '@/app/types/types';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';

const Page = ({ params }: { params: { id: number } }) => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
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
  const printableContentRef = useRef<HTMLDivElement>(null);
  const [courseLetter, setCourseLetter] = useState<LetterGradesType[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseCourseLetter = await axios.get(`/api/exams/letterGrades`);
        const messageCourseLetter: LetterGradesType[] =
          responseCourseLetter.data.message;
        setCourseLetter(messageCourseLetter);
        
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
              course: studentCourse,
              courseEnroll: course,
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
        (sec) => sec.course_id == studentCourse?.id && (sec.students_num <=
        sec.max_students));

      if (
        studentSection== undefined
      ) {
        return toast.error("لقد تخطت هذه المادة الحد الاقصى من الطلاب");
      }
        const studentClass = classes.find(
          (sec) => sec.section_id == studentSection?.id
        );

      const studenCourseEnroll = courseEnrollments.find(
        (Class) => Class.class_id == studentClass?.id
      );
        if(studentSection){
        const data1 = {
          course:{
          student_id: params.id,
          id: studenCourseEnroll?.id,
          approved: true,
          section_id: studentSection?.id,
          students_num: studentSection?.students_num+1},
          grade:{course_enrollment_id: studenCourseEnroll?.id,}
        };
        axios.post('/api/courseEnrollment/courseAccept', data1).then((res)=>
        toast.success(res.data.message));}});

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

  const handlePrint = useReactToPrint({
    content: () => printableContentRef.current,
  });
  
  return (
    <div className="absolute w-[80%] flex flex-col text-sm p-10 justify-content items-center ">
      <button
        onClick={handlePrint}
        className="flex bg-green-500 hover:bg-green-600 p-2 m-5 text-white rounded-md w-[200px] justify-center items-center"
      >
        طباعة درجات الطالب
      </button>
      <form
        onSubmit={handleSubmit}
        className=" flex-col w-screen flex justify-content items-center"
      >
        <h1 className="flex w-[400px] text-sm justify-end p-1 items-center">
          : المواد التي اختارها الطالب اللتي يجب الموافقة عليها
        </h1>
        <h1 className="flex w-[400px] text-sm justify-end p-1 items-center bg-darkBlue text-secondary">
          :اختر المواد
        </h1>
        <div className="p-1 rounded-md">
          {checkList.length ? (
            checkList.map((item, index) => (
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
                <label className="pr-5">{item.course_name}</label>
              </div>
            ))
          ) : (
            <div className="bg-lightBlue flex w-[400px]  justify-center p-1 items-center">
              لا يوجد
            </div>
          )}
        </div>
        <button
          type="submit"
          className="flex w-[400px]  text-sm justify-center items-center bg-darkBlue text-secondary"
        >
          موافقة
        </button>
      </form>
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
            {studentCourses.map((course, index) =>{ 
              const letter = courseLetter.find(
                (item) => item.course_enrollment_id == course.courseEnroll.id
              );
              return (
                <tr key={index}>
                  <td
                    className={`border border-gray-300 px-4 py-2 ${
                      course.courseEnroll.pass
                        ? 'text-green-600 hover:text-green-700'
                        : 'text-red-500 hover:text-red-600'
                    }`}
                  >
                    {course.class?.result_publish
                      ? course.courseEnroll.pass
                        ? `${letter?.letter_grade} ناجح`
                        : `${letter?.letter_grade} راسب`
                      : ''}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 ">
                    {course.class?.result_publish
                      ? course.courseEnroll.result
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
                      ? course.courseEnroll.final
                      : ' '}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {course.course.midterm}%
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {course.class?.mid_publish
                      ? course.courseEnroll.midterm
                      : ''}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {course.section?.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {course.course.course_name}
                  </td>
                </tr>
              );})}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Page;
