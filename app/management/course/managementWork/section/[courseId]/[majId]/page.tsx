'use client';
import { CourseType, PrerequisiteCourseType, SectionType } from '@/app/types/types';
import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const Page = ({ params }: { params: { courseId: number,majId: number } }) => {
  const [section, setSection] = useState<SectionType[]>([]);
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [load, setLoad] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('Tab 1');
  const [selectedCourseName, setSelectedCourseName] = useState('');

  const handleCourseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourseName(event.target.value);
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await axios.get(
        `/api/getAll/getAllSections/${params.courseId}`
      );
      const message: SectionType[] = response.data.message;
      setSection(message);

      const responseCourse = await axios.get(
        `/api/course/majorCourses/${params.majId}`
      );
      const messageCourse: CourseType[] = responseCourse.data.message;
      console.log(messageCourse);
      setCourses(messageCourse);
    };
    fetchPosts();
  }, [params.courseId, load]);

  const handleRegisterSection = () => {
    
    const selectedCourse = courses.find(
      (course) => params.courseId == course.id
    );
    const data: SectionType = {
      name: selectedCourse?.course_name + `(S${section.length + 1})`,
      course_id: selectedCourse?.id
    };
    console.log(data);
    axios
      .post('/api/course/sectionRegistration', data)
      .then((res) => {
        setLoad(!load);
        console.log(res.data);
        toast.success(res.data.message);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

    const handleRegisterCourPre = () => {
      const selectedCourse = courses.find(
        (course) => params.courseId == course.id
      );
      const selectedCoursePer = courses.find(
        (course) =>selectedCourseName == course.course_name
      );
      const data: PrerequisiteCourseType = {
        course_id: selectedCourse?.id,
        prerequisite_course_id: selectedCoursePer?.id,
      };
      console.log(data);
      axios
        .post('/api/course/prerequisitesCourses', data)
        .then((res) => {
          setLoad(!load);
          console.log(res.data);
          toast.success(res.data.message);
        })
        .catch((err) => {
          toast.error(err.response.data.message);
        });
    };

    

  return (
    <div className="flex absolute flex-col w-screen justify-center items-center  text-sm">
      <div className="text-sm flex flex-row ">
        <button
          onClick={() => handleTabClick('Tab 1')}
          className={
            activeTab === 'Tab 1'
              ? ' w-[400px] text-secondary flex bg-darkBlue p-2 justify-center'
              : ' w-[400px]  flex bg-grey p-2 justify-center'
          }
        >
          المجموعات
        </button>
        <button
          onClick={() => handleTabClick('Tab 2')}
          className={
            activeTab === 'Tab 2'
              ? ' w-[400px] flex bg-darkBlue text-secondary p-2 justify-center'
              : ' w-[400px] flex bg-grey p-2 justify-center'
          }
        >
          المواد المشروطة
        </button>
      </div>
      {activeTab === 'Tab 1' && (
        <>
          <button
            onClick={handleRegisterSection}
            className="p-3 m-5 bg-blue-900 hover:bg-blue-700 text-secondary pl-[80px] pr-[80px] items-center flex justify-center rounded-sm"
          >
            اضاف مجموعة
          </button>
          {section.map((sec, index) => (
            <div
              key={index}
              className="p-3 m-5 bg-lightBlue pl-[80px] pr-[80px] items-center flex justify-center rounded-sm"
            >
              <Link
                href={`/management/course/managementWork/course/${sec.id}/${params.courseId}`}
              >
                {sec.name}
              </Link>
            </div>
          ))}
        </>
      )}
      {activeTab === 'Tab 2' && (
        <div>
          <select value={selectedCourseName} onChange={handleCourseChange}>
            {courses.map((course, index) => (
              <option key={index} value={course.course_name}>
                {course.course_name}
              </option>
            ))}
          </select>
          <button onClick={handleRegisterCourPre}>submit</button>
          <p>المواد المشروطة: {selectedCourseName}</p>
        </div>
      )}
    </div>
  );
};

export default Page;
