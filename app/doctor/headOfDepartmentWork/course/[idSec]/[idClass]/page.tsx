'use client';
import {
  ClassesType,
  CourseType,
  PersonalInfoType,
  SectionType,
} from '@/app/types/types';
import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const Tabs = ({ params }: { params: { idSec: number; idClass: number } }) => {
  const [classes, setClasses] = useState<ClassesType[]>([]);
  const [sectionName, setSectionName] = useState<string>();
  const [courseId, setCourseId] = useState<number>();
  const [sectionId, setSectionId] = useState<number>();
  const [selectedDoctorId, setSelectedDoctorId] = useState<number>();
  const [doctorId, setDoctorId] = useState<number>();
  const [doctorName, setDoctorName] = useState<string>();
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [doctors, setDoctors] = useState<PersonalInfoType[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>();
  const [load, setLoad] = useState(true);



  useEffect(() => {
    if(typeof window !== 'undefined'){
    const fetchdata = async () => {
      const responseClass = await axios.get(
        `/api/getAll/getAllClasses/${params.idSec}`
      );
      const messageClass: ClassesType[] = responseClass.data.message;
      messageClass.map((item) => {
        setDoctorId(item.doctor_id);
      });
      setClasses(messageClass);

      const responseSec = await axios.get(
        `/api/getAll/getAllSections/${params.idClass}`
      );
      const messageSec: SectionType[] = responseSec.data.message;
      messageSec.map((item) => {
        if (item.id == params.idSec) setSectionName(item.name);
        setCourseId(item.course_id);
        setSectionId(params.idSec);
      });

      const responseCourse = await axios.get(
        `/api/course/courses/courseSection`
      );
      const messageCourse: CourseType[] = responseCourse.data.message;
      setCourses(messageCourse);
    };
    fetchdata();}
  }, [load, params.idClass, params.idSec]);

  useEffect(() => {
    if(typeof window !== 'undefined'){
    const fetchPosts = async () => {
      const responseDoctor = await axios.get(`/api/getAll/doctor`);
      const messageDoctor: PersonalInfoType[] = responseDoctor.data.message;
      setDoctors(messageDoctor);
      messageDoctor.map((item) => {
        if (item.id == doctorId) {
          setDoctorName(item.name);
        }
        if (item.name == selectedDoctor) {
          setSelectedDoctorId(item.id);
        }
      });
    };

    fetchPosts();}
  }, [selectedDoctor, load, doctors, doctorId]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDoctor) return;

    const data ={
      doctor_id: selectedDoctorId,
      section_id: sectionId,
    };
    console.log(data);
    axios.post('/api/course/assignCourseDoctor', data).then((resp) => {
      toast.success(resp.data.message);
      setLoad(!load);
    });
  };

  return (
    <div className="flex absolute flex-col justify-center items-center w-[80%]">
      <Link
        href={`/doctor/headOfDepartmentWork/courseStudents/${params.idSec}`}
        className="p-2 rounded-md text-secondary bg-blue-700 hover:bg-blue-500 text-sm"
      >
        الطلاب و الدرجات
      </Link>
      {classes.map((item, index) => {
        const selectedCourse = courses.find((course) => courseId == course.id);
        return (
          <div key={index}>
            <table className="courseInfo text-sm w-[500px] m-10">
              <tbody>
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
                  <td>{selectedCourse?.passing_percentage}</td>
                  <td>درجة النجاح</td>
                </tr>
                <tr>
                  <td>{doctorName}</td>
                  <td> الدكتور</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}
      <form onSubmit={handleSubmit} className="my-4">
        <p className="bg-lightBlue px-4 py-2 mt-2">اختر الدكتور لهذه المادة</p>
        <table className="border border-gray-300 rounded-lg my-2 w-[600px]">
          <thead>
            <th></th>
            <th>المعلومات الشخصية</th>
            <th>التخصص</th>
            <th>الاسم</th>
          </thead>
          {doctors.map((doctor, index) => (
            <tbody key={index}>
              <tr key={index}>
                <td>
                  <input
                    className="mx-2"
                    type="checkbox"
                    value={doctor.name}
                    checked={selectedDoctor === doctor.name}
                    onChange={(event) => setSelectedDoctor(event.target.value)}
                  />
                </td>
                <td>
                  <Link
                    href={`/doctor/personalInformation/doctor/${doctor.id}`}
                    className="bg-blue-500 hover:bg-blue-600 p-1 m-1 text-white rounded-md inline-block"
                  >
                    الملف الشخصي
                  </Link>
                </td>
                <td className="px-2 py-1">
                  <label>{doctor.major}</label>
                </td>
                <td className="px-2 py-1">
                  <label>{doctor.name}</label>
                </td>
              </tr>
            </tbody>
          ))}
        </table>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 mt-2">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Tabs;
