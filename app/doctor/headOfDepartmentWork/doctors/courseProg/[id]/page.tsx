'use client';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import {
  AddCourse2Type,
  Section2Type,
  DoctorCourse2Type,
  DayOfWeekType,
} from '@/app/types/types';
import { toast } from 'react-toastify';

const hours: string[] = [
  '8:00',
  '9:00',
  '10:00',
  '11:00',
  '12:00',
  '1:00',
  '2:00',
  '3:00',
  '4:00',
  '5:00',
  '4:00',
  '5:00',
];


const days: DayOfWeekType[] = [
  { name: 'الجمعة', day: 'friday' },
  { name: 'الخميس', day: 'thursday' },
  { name: 'الاربعاء', day: 'wednesday' },
  { name: 'الثلثاء', day: 'tuesday' },
  { name: 'الاثنين', day: 'monday' },
];


const Page = ({ params }: { params: { id: number } }) => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'doctor' : false) {
    throw new Error('Unauthorized');
  }

  const [courses, setCourses] = useState<AddCourse2Type[]>([]);
  const [doctorCourses, setDoctorCourses] = useState<DoctorCourse2Type[]>([]);
  const [sections, setSections] = useState<Section2Type[]>([]);
  const [selectedCourse, setSelecetedCourse] = useState<string>();
  const [selectedStartHour, setSelecetedStartHour] = useState<string>();
  const [selectedEndHour, setSelecetedEndHour] = useState<string>();
  const [selectedDay, setSelecetedDay] = useState<string>();

  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `/api/course/courses/${params.id}/doctor`
        );
        const message: Section2Type[] = response.data.message;
        setSections(message);

        const coursesPromises = message.map(async (section) => {
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
  }, [params]);

  useEffect(() => {
    const updatedStudentCourses: DoctorCourse2Type[] = [];

    sections.map((sec) => {
      const studentCourse = courses.find(
        (course) => course.id == sec.course_id
      );

      if (studentCourse) {
        const data = {
          course_name: studentCourse.course_name,
          section: sec,
        };
        updatedStudentCourses.push(data);
      }
    });
    
    console.log(updatedStudentCourses);
    setDoctorCourses(updatedStudentCourses);
  }, [refresh]);


const handleSubmit=()=>{

    const findDay= days.find((day)=> day.name== selectedDay);
    const findClass= doctorCourses.find((course)=> course.section?.name== selectedCourse);

    const data= {
        class_id: findClass?.section?.class_id,
        day: findDay?.day,
        starts_at: selectedStartHour,
        ends_at: selectedEndHour
    };

    axios
      .post('/api/courseProgram', data)
      .then((res) => {
        toast.success(res.data.message);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
};


  return (
    <div className="absolute w-[80%] flex flex-col text-sm p-10 justify-content items-center ">
      <table className="w-[900px] m-10">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-grey">
              عدد الطلاب
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
          {doctorCourses.map((course, index) => (
            <tr key={index}>
              <td className="border border-gray-300 px-4 py-2">
                {course.section?.students_num}
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
      <div>
        <select
          id="dep"
          dir="rtl"
          onChange={(e) => setSelecetedCourse(e.target.value)}
          className="p-4 text-sm m-5 "
          defaultValue=""
        >
          <option disabled value="">
            المادة
          </option>
          {doctorCourses.map((course, index) => (
            <option key={index}>{course.section?.name}</option>
          ))}
        </select>
        <select
          id="dep"
          dir="rtl"
          onChange={(e) => setSelecetedStartHour(e.target.value)}
          className="p-4 text-sm m-5 "
          defaultValue=""
        >
          <option disabled value="">
            وقت البدأ
          </option>
          {hours.map((hour, index) => (
            <option key={index}>{hour}</option>
          ))}
        </select>
        <select
          id="dep"
          dir="rtl"
          onChange={(e) => setSelecetedEndHour(e.target.value)}
          className="p-4 text-sm m-5 "
          defaultValue=""
        >
          <option disabled value="">
            وقت الانتهاء
          </option>
          {hours.map((hour, index) => (
            <option key={index}>{hour}</option>
          ))}
        </select>
        <select
          id="dep"
          dir="rtl"
          onChange={(e) => setSelecetedDay(e.target.value)}
          className="p-4 text-sm m-5 "
          defaultValue=""
        >
          <option disabled value="">
            اليوم
          </option>
          {days.map((day, index) => (
            <option key={index}>{day.name}</option>
          ))}
        </select>
        <button onClick={handleSubmit}>submit</button>
      </div>
      <table className="w-full bg-white shadow-md rounded-md">
        <thead>
          <tr>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">الجمعة</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">الخميس</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">الاربعاء</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">الثلثاء</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">الاثنين</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">الوقت</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-2 px-4 border-b">Class A</td>
            <td className="py-2 px-4 border-b">Class B</td>
            <td className="py-2 px-4 border-b">-</td>
            <td className="py-2 px-4 border-b">Class C</td>
            <td className="py-2 px-4 border-b">-</td>
            <td className="py-2 px-4 border-b">8:00</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Page;
