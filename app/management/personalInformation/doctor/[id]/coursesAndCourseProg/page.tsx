'use client';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import {
  AddCourse2Type,
  Section2Type,
  DoctorCourse2Type,
  DayOfWeekType,
  CourseProgramType,
  CheckedType,
} from '@/app/types/types';
import { toast } from 'react-toastify';
import { BsXCircleFill } from 'react-icons/bs';

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
  '6:00',
  '7:00',
];

const hoursNames: CheckedType[] = [
  { id: 8, name: '8:00' },
  { id: 9, name: '9:00' },
  { id: 10, name: '10:00' },
  { id: 11, name: '11:00' },
  { id: 12, name: '12:00' },
  { id: 13, name: '1:00' },
  { id: 14, name: '2:00' },
  { id: 15, name: '3:00' },
  { id: 16, name: '4:00' },
  { id: 17, name: '5:00' },
  { id: 18, name: '6:00' },
  { id: 19, name: '7:00' },
];

const days: DayOfWeekType[] = [
  { name: 'الجمعة', day: 'friday' },
  { name: 'الخميس', day: 'thursday' },
  { name: 'الاربعاء', day: 'wednesday' },
  { name: 'الثلثاء', day: 'tuesday' },
  { name: 'الاثنين', day: 'monday' },
];

const daysOfWeek = ['friday', 'thursday', 'wednesday', 'tuesday', 'monday'];

const Page = ({ params }: { params: { id: number } }) => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    throw new Error('Unauthorized');
  }

  const [courses, setCourses] = useState<AddCourse2Type[]>([]);
  const [doctorCourses, setDoctorCourses] = useState<DoctorCourse2Type[]>([]);
  const [sections, setSections] = useState<Section2Type[]>([]);
  const [selectedCourse, setSelecetedCourse] = useState<string>();
  const [selectedStartHour, setSelecetedStartHour] = useState<string>();
  const [selectedEndHour, setSelecetedEndHour] = useState<string>();
  const [selectedDay, setSelecetedDay] = useState<string>();
  const [Location, setLocation] = useState<string>();
  const [programClass, setProgramClass] = useState<CourseProgramType[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `/api/course/courses/${params.id}/doctor`
        );
        const message: Section2Type[] = response.data.message;
        setSections(message);

        const progClassPromises = message.map(async (section) => {
          const responseReq = await axios.get(
            `/api/courseProgram/${section.class_id}`
          );
          const { message: courseMessage }: { message: CourseProgramType[] } =
            responseReq.data;
          return courseMessage;
        });

        const progClassData = await Promise.all(progClassPromises);
        const programClass = progClassData.flat();
        setProgramClass(programClass);

        console.log(programClass);

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
  }, [params, edit]);

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

    setDoctorCourses(updatedStudentCourses);
  }, [courses, refresh, sections]);

  const handleSubmit = () => {
    if (
      !(
        selectedDay &&
        selectedCourse &&
        selectedStartHour &&
        selectedEndHour &&
        location
      )
    ) {
      toast.error('يجب ملئ جميع البيانات');
      return;
    }
    const findDay = days.find((day) => day.name == selectedDay);
    const findClass = doctorCourses.find(
      (course) => course.section?.name == selectedCourse
    );
    const findStartTime = hoursNames.find(
      (hour) => hour.name == selectedStartHour
    );
    const findEndTime = hoursNames.find((hour) => hour.name == selectedEndHour);

    const data = {
      class_id: findClass?.section?.class_id,
      day: findDay?.day,
      starts_at: findStartTime?.id,
      ends_at: findEndTime?.id,
      location: Location,
    };

    axios
      .post('/api/courseProgram/1', data)
      .then((res) => {
        toast.success(res.data.message);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
    setEdit(!edit);
  };

  const handleDelete = (item: CourseProgramType) => {
    axios
      .post('/api/courseProgram/1/deleteCourseProg', item)
      .then((res) => {
        toast.success(res.data.message);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
    setEdit(!edit);
  };

  return (
    <div className="absolute w-[80%] flex flex-col text-sm p-10 justify-content items-center">
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
      <div className="border-2 border-grey m-4 rounded-5 p-5 flex justify-center items-center rounded-md">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          اضافة
        </button>
        <input
          dir="rtl"
          placeholder=" الموقع "
          type="text"
          className="w-48 p-2 bg-gray-200 border-2 border-black rounded-md ml-4"
          onChange={(e) => setLocation(e.target.value)}
        />
        <select
          id="dep"
          dir="rtl"
          onChange={(e) => setSelecetedEndHour(e.target.value)}
          className="px-4 py-2 bg-gray-200 border-2 border-black rounded-md ml-4"
          defaultValue=""
        >
          <option disabled selected value="">
            وقت الانتهاء
          </option>
          {hours.map((hour, index) => (
            <option key={index}>{hour}</option>
          ))}
        </select>
        <select
          id="dep"
          dir="rtl"
          onChange={(e) => setSelecetedStartHour(e.target.value)}
          className="px-4 py-2 bg-gray-200 border-2 border-black rounded-md ml-4"
          defaultValue=""
        >
          <option disabled selected value="">
            وقت البدأ
          </option>
          {hours.map((hour, index) => (
            <option key={index}>{hour}</option>
          ))}
        </select>
        <select
          id="dep"
          dir="rtl"
          onChange={(e) => setSelecetedDay(e.target.value)}
          className="px-4 py-2 bg-gray-200 border-2 border-black rounded-md ml-4"
          defaultValue=""
        >
          <option disabled selected value="">
            اليوم
          </option>
          {days.map((day, index) => (
            <option key={index}>{day.name}</option>
          ))}
        </select>
        <select
          id="dep"
          dir="rtl"
          onChange={(e) => setSelecetedCourse(e.target.value)}
          className="px-4 py-2 bg-gray-200 border-2 border-black rounded-md ml-4"
          defaultValue=""
        >
          <option disabled selected value="">
            المادة
          </option>
          {doctorCourses.map((course, index) => (
            <option key={index}>{course.section?.name}</option>
          ))}
        </select>
      </div>

      <table className="w-full bg-white shadow-md rounded-md">
        <thead>
          <tr>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">الجمعة</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">الخميس</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">الاربعاء</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">الثلاثاء</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">الاثنين</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">الوقت</th>
          </tr>
        </thead>
        <tbody>
          {hoursNames.map((hour, hourIndex) => (
            <tr key={hourIndex}>
              {daysOfWeek.map((day) => {
                const matchingClasses = programClass.filter((Class) => {
                  const classStart = Class.starts_at;
                  const classEnd = Class.ends_at;
                  const hourId = hour.id;
                  return (
                    Class.day === day &&
                    (classStart === hourId ||
                      (classStart < hourId && classEnd >= hourId + 1))
                  );
                });

                if (matchingClasses.length > 0) {
                  return matchingClasses.map((matchingClass, index) => {
                    const className = doctorCourses.find(
                      (course) =>
                        course.section?.class_id === matchingClass.class_id
                    );
                    return (
                      <td
                        key={`${day}-${matchingClass.class_id}-${index}`}
                        className="py-2 px-4 border-b"
                      >
                        <BsXCircleFill
                          onClick={() => handleDelete(matchingClass)}
                        />
                        {className?.section?.name} - {matchingClass.location}
                      </td>
                    );
                  });
                }

                return <td key={day} className="py-2 px-4 border-b"></td>;
              })}
              <td className="py-2 px-4 border-b">{hour.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default Page;
