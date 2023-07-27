'use client';
import { CheckedType, DayOfWeekType, ClassesInfoType } from '@/app/types/types';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React, { useEffect, useState } from 'react';

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

const Tabs = ({ params }: { params: { id: number, name:string } }) => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }

  const [classes, setClasses] = useState<ClassesInfoType[]>([]);

  useEffect(() => {
    const fetchdata = async () => {
      const responseReq = await axios.get(
        `/api/getAll/allClasses/${params.id}/${params.name}`
      );
      const classMessage: ClassesInfoType[] = responseReq.data.message;

      setClasses(classMessage);
    };
    fetchdata();
  }, [params]);

  return (
    <div className="flex absolute flex-col justify-center items-center w-[80%] ">
      <Link
        href={`/management/course/pervClassStudents/${params.id}/${params.name}`}
        className="p-2 rounded-md text-secondary bg-blue-700 hover:bg-blue-500 text-sm"
      >
        الطلاب و الدرجات
      </Link>
      {classes.map((item, index) => {
        const findDay = days.find((day) => day.day == item.class?.day);
        const findStartTime = hoursNames.find(
          (hour) => hour.id == item.class?.starts_at
        );
        const findEndTime = hoursNames.find(
          (hour) => hour.id == item.class?.ends_at
        );
        return (
          <div key={index}>
            <table className="courseInfo text-sm w-[500px] m-10">
              <tbody>
                <tr>
                  <td>{item.course.course_name}</td>
                  <td>اسم المادة</td>
                </tr>
                <tr>
                  <td>{item.section.name}</td>
                  <td>اسم المجموعة</td>
                </tr>
                <tr>
                  <td>{item.course.hours}</td>
                  <td>عدد الساعات</td>
                </tr>
                <tr>
                  <td>{item.course.credits}</td>
                  <td>عدد الكريدت</td>
                </tr>
                <tr>
                  <td>{item.class.location}</td>
                  <td>الموقع </td>
                </tr>
                <tr>
                  <td>
                    {findStartTime?.name}-{findEndTime?.name}/{findDay?.name}
                  </td>
                  <td>التوقيت </td>
                </tr>
                <tr>
                  <td>{item.course.midterm}</td>
                  <td>الامتحان النصفي</td>
                </tr>
                <tr>
                  <td>{item.course.final}</td>
                  <td>الامتحان النهائي</td>
                </tr>
                <tr>
                  <td>{item.course.class_work}</td>
                  <td>اعمال السنة</td>
                </tr>
                <tr>
                  <td>{item.class.semester}</td>
                  <td> الفصل الدراسي</td>
                </tr>
                <tr>
                  <td>
                    {item.doctor.name} {item.doctor.surname}
                  </td>
                  <td>الدكتور</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

export default Tabs;
