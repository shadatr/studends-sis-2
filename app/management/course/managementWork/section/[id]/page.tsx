'use client';
import { CourseType, SectionType } from '@/app/types/types';
import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const Page = ({ params }: { params: { id: number } }) => {
  const [section, setSection] = useState<SectionType[]>([]);
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [load, setLoad] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await axios.get(
        `/api/getAll/getAllSections/${params.id}`
      );
      const message: SectionType[] = response.data.message;
      setSection(message);
      console.log(message);

      const responseCourse = await axios.get(
        `/api/course/courses/courseSection`
      );
      const messageCourse: CourseType[] = responseCourse.data.message;
      setCourses(messageCourse);
    };
    fetchPosts();
  }, [params.id,load]);

  const handleRegister = () => {
    
    const selectedCourse = courses.find((course) => params.id == course.id);
    const data: SectionType = {
      name: selectedCourse?.course_name + `S(${section.length + 1})`,
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

  return (
    <div className="flex absolute flex-col w-screen justify-center items-center mt-10 text-sm">
      <button
        onClick={handleRegister}
        className="p-3 m-5 bg-darkBlue text-secondary pl-[80px] pr-[80px] items-center flex justify-center rounded-sm"
      >
        اضاف مجموعة
      </button>
      {section.map((sec, index) => (
        <div
          key={index}
          className="p-3 m-5 bg-lightBlue pl-[80px] pr-[80px] items-center flex justify-center rounded-sm"
        >
          <Link
            href={`/management/course/managementWork/course/${sec.id}/${params.id}`}
          >
            {sec.name}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default Page;
