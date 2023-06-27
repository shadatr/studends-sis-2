'use client';
import {
  ClassesType,
  CourseType,
  PersonalInfoType,
  SectionType,
  CourseProgramType,
  CheckedType,
  DayOfWeekType,
} from '@/app/types/types';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

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

const Tabs = ({ params }: { params: { idSec: number; idClass: number } }) => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'doctor' : false) {
    redirect('/');
  }
  const [classes, setClasses] = useState<ClassesType[]>([]);
  const [sectionName, setSectionName] = useState<string>();
  const [courseId, setCourseId] = useState<number>();

  const [doctorName, setDoctorName] = useState<string>();
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [doctors, setDoctors] = useState<PersonalInfoType[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>();
  const [load, setLoad] = useState(false);
  const [courseProg, setCourseProg] = useState<CourseProgramType[]>([]);

  useEffect(() => {
    const fetchdata = async () => {
      const responseClass = await axios.get(
        `/api/getAll/getAllClasses/${params.idSec}`
      );
      const messageClass: ClassesType[] = responseClass.data.message;
      setClasses(messageClass);
      console.log(params.idSec);

      const responseCourseProg = await axios.get(
        `/api/courseProgram/${messageClass[0].id}`
      );
      const messageCourseProg: CourseProgramType[] =
        responseCourseProg.data.message;
      setCourseProg(messageCourseProg);
      const responseDoctor = await axios.get(`/api/getAll/doctor`);
      const messageDoctor: PersonalInfoType[] = responseDoctor.data.message;
      setDoctors(messageDoctor);
      const d = messageDoctor.find(
        (doc) => doc.id == messageClass[0].doctor_id
      );
      setDoctorName(d?.name);

      const responseSec = await axios.get(
        `/api/getAll/getAllSections/${params.idClass}`
      );
      const messageSec: SectionType[] = responseSec.data.message;
      messageSec.map((item) => {
        if (item.id == params.idSec) setSectionName(item.name);
        setCourseId(item.course_id);
      });

      const responseCourse = await axios.get(
        `/api/course/courses/courseSection`
      );
      const messageCourse: CourseType[] = responseCourse.data.message;
      setCourses(messageCourse);
    };
    fetchdata();
  }, [load, params.idClass, params.idSec]);

  const handleSubmit = () => {
    const doc = doctors.find((item) => item.name == selectedDoctor);

    const data: ClassesType = {
      doctor_id: doc?.id,
      section_id: params.idSec,
    };
    axios.post('/api/course/assignCourseDoctor', data).then((resp) => {
      toast.success(resp.data.message);
      setLoad(!load);
    });
  };

  return (
    <div className="flex absolute flex-col justify-center items-center w-[80%] ">
      <Link
        href={`/doctor/headOfDepartmentWork/courseStudents/${params.idSec}`}
        className="p-2 rounded-md text-secondary bg-blue-700 hover:bg-blue-500 text-sm"
      >
        الطلاب و الدرجات
      </Link>
      {classes.map((item, index) => {
        const selectedCourse = courses.find((course) => courseId === course.id);
        const selectedStartHour = courseProg.map((item) => {
          return hoursNames.find((item2) => item.starts_at === item2.id);
        });
        const selectedDay = courseProg.map((item) => {
          return days.find((item2) => item.day === item2.day);
        });
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
                  <td>{selectedCourse?.hours}</td>
                  <td>عدد الساعات</td>
                </tr>
                <tr>
                  <td>{selectedCourse?.credits}</td>
                  <td>عدد الكريدت</td>
                </tr>
                <tr>
                  <td>{courseProg.map((item) => item.location)}</td>
                  <td>الموقع </td>
                </tr>
                <tr>
                  <td>
                    {selectedStartHour.map((item) => item?.name)}-
                    {selectedDay.map((item) => item?.name)}
                  </td>
                  <td>التوقيت </td>
                </tr>
                <tr>
                  <td>{selectedCourse?.midterm}</td>
                  <td>الامتحان النصفي</td>
                </tr>
                <tr>
                  <td>{selectedCourse?.final}</td>
                  <td>الامتحان النهائي</td>
                </tr>
                <tr>
                  <td>{selectedCourse?.class_work}</td>
                  <td>اعمال السنة</td>
                </tr>
                <tr>
                  <td>{selectedCourse?.IsOptional ? 'اجباري' : 'اختياري'}</td>
                  <td>اجباري/اختياري </td>
                </tr>
                <tr>
                  <td>{selectedCourse?.passing_percentage}</td>
                  <td>درجة النجاح</td>
                </tr>
                <tr>
                  <td>{doctorName}</td>
                  <td>الدكتور</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}
      <form onSubmit={(e) => e.preventDefault()} className="my-4">
        <p className="bg-lightBlue px-4 py-2 mt-2">اختر الدكتور لهذه المادة</p>
        <table className="border border-gray-300 rounded-lg my-2 w-[600px]">
          <thead>
            <tr>
              <th></th>
              <th>المعلومات الشخصية</th>
              <th>التخصص</th>
              <th>الاسم</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor, index) => (
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
                    href={`/management/personalInformation/doctor/${doctor.id}`}
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
            ))}
          </tbody>
        </table>
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 mt-2"
        >
          اضافة
        </button>
      </form>
    </div>
  );
};

export default Tabs;
