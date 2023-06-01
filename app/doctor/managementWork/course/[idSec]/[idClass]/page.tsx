'use client';
import { ClassesType, CourseType, SectionType } from '@/app/types/types';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

const Tabs = ({ params }: { params: { idSec: number; idClass: number } }) => {
  const [activeTab, setActiveTab] = useState<string>('Tab 1');
  const [classes, setClasses] = useState<ClassesType[]>([]);
  const [section, setSection] = useState<SectionType[]>([]);
  const [sectionName, setSectionName] = useState<string>();
  const [courseId, setCourseId] = useState<number>();
  const [courses, setCourses] = useState<CourseType[]>([]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    const fetchClasses = async () => {
      const response = await axios.get(
        `/api/getAll/getAllClasses/${params.idSec}`
      );
      const message: ClassesType[] = response.data.message;
      setClasses(message);
    };
    const fetchSections = async () => {
      const response = await axios.get(
        `/api/getAll/getAllSections/${params.idClass}`
      );
      const message: SectionType[] = response.data.message;
      setSection(message);
      message.map((item) => {
        if (item.id == params.idSec) setSectionName(item.name);
        setCourseId(item.course_id);
      });

      const res = await axios.get(`/api/course/courses/courseSection`);
      const mess: CourseType[] = res.data.message;
      console.log(mess);
      setCourses(mess);
    };
    fetchClasses();
    fetchSections();
  }, [courseId, params.idClass, params.idSec]);

  return (
    <div className="flex absolute flex-col justify-center items-center w-[80%]">
      <div className="text-sm flex flex-row ">
        <button
          onClick={() => handleTabClick('Tab 1')}
          className={
            activeTab === 'Tab 1'
              ? ' w-[400px] text-secondary flex bg-darkBlue p-2 justify-center'
              : ' w-[400px]  flex bg-grey p-2 justify-center'
          }
        >
          Tab 1
        </button>
        <button
          onClick={() => handleTabClick('Tab 2')}
          className={
            activeTab === 'Tab 2'
              ? ' w-[400px] flex bg-darkBlue text-secondary p-2 justify-center'
              : ' w-[400px] flex bg-grey p-2 justify-center'
          }
        >
          Tab 2
        </button>
      </div>
      <div>
        {activeTab === 'Tab 1' &&
          classes.map((item, index) => {
            const selectedCourse = courses.find(
              (course) => courseId == course.id
            );
            console.log(selectedCourse);
            return (
              <div key={index}>
                <table className="courseInfo text-sm w-[500px] m-10">
                  <tr>
                    <td>{selectedCourse?.course_name}</td>
                    <td>اسم المادة</td>
                  </tr>
                  <tr>
                    <td>{sectionName}</td>
                    <td>اسم المجموعة</td>
                  </tr>
                  <tr>
                    <td>{selectedCourse?.min_semester}</td>
                    <td>تبدأ من الفصل الدراسي</td>
                  </tr>
                  <tr>
                    <td>{selectedCourse?.hours}</td>
                    <td> عدد الساعات</td>
                  </tr>
                  <tr>
                    <td>{selectedCourse?.credits}</td>
                    <td>عدد الكريدت</td>
                  </tr>
                  <tr>
                    <td>{item.midterm}</td>
                    <td> الامتحان النصفي</td>
                  </tr>
                  <tr>
                    <td>{item.final}</td>
                    <td>الامتحان النهائي </td>
                  </tr>
                  <tr>
                    <td>{item.class_work}</td>
                    <td> اعمال السنة</td>
                  </tr>
                  <tr>
                    <td>{selectedCourse?.passing_grade}</td>
                    <td>درجة النجاح</td>
                  </tr>
                  <tr>
                    <td>{item.doctor_id}</td>
                    <td> الدكتور</td>
                  </tr>
                </table>
              </div>
            );
          })}
        {activeTab === 'Tab 2' && <div> </div>}
      </div>
    </div>
  );
};

export default Tabs;
