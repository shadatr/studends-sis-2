'use client';
import axios from 'axios';
import React, { useEffect, useState,useRef } from 'react';
import { toast } from 'react-toastify';
import {
  AddCourseType,
  GetPermissionType,
  ExamProgramType,
} from '@/app/types/types';
import { useSession } from 'next-auth/react';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { DatePicker } from 'react-date-picker';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import { BsXCircleFill } from 'react-icons/bs';
import { redirect } from 'next/navigation';
import { useReactToPrint } from 'react-to-print';

const Page = () => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }
  const user = session.data?.user;
  const [perms, setPerms] = useState<GetPermissionType[]>([]);
  const [courses, setCourses] = useState<AddCourseType[]>([]);
  const [examProg, setExamProg] = useState<ExamProgramType[]>([]);
  const [selectedCourse, setSelecetedCourse] = useState<string>();
  const [selectedStartHour, setSelecetedStartHour] = useState('10:00');
  const [duration, setDuration] = useState<string>();
  const [selecetedDay, setSelecetedDay] = useState(new Date());
  const [Location, setLocation] = useState<string>();
  const [edit, setEdit] = useState(false);
  const printableContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fetchPosts = async () => {
        axios.get(`/api/course/courseRegistration`).then(async (resp) => {
          const message: AddCourseType[] = resp.data.message;
          setCourses(message);

          const progClassPromises = message.map(async (course) => {
            const responseReq = await axios.get(`/api/examProg/${course.id}`);
            const { message: courseMessage }: { message: ExamProgramType[] } =
              responseReq.data;
            return courseMessage;
          });

          const progClassData = await Promise.all(progClassPromises);
          const programClass = progClassData.flat();
          setExamProg(programClass);
        });
        if (user) {
          const response = await axios.get(
            `/api/allPermission/admin/selectedPerms/${user?.id}`
          );
          const message: GetPermissionType[] = response.data.message;
          setPerms(message);
        }
      };
      fetchPosts();
    }
  }, [user, edit]);

  const handleSubmit = () => {
    if (
      !(
        selecetedDay &&
        selectedCourse &&
        selectedStartHour &&
        duration &&
        location
      )
    ) {
      toast.error('يجب ملئ جميع البيانات');
      return;
    }

    const findClass = courses.find(
      (course) => course.course_name == selectedCourse
      );
      const exam= examProg.find((e)=> e.course_id== findClass?.id);
      if (exam) {
        toast.error('هذه المادة مسجلة بالفعل');
        return;
      }

    const data = {
      course_id: findClass?.id,
      hour: selectedStartHour,
      date: selecetedDay.toLocaleString(),
      duration: duration,
      location: Location,
    };

    console.log(selecetedDay.toLocaleString());

    axios
      .post('/api/examProg/1', data)
      .then((res) => {
        toast.success(res.data.message);
        const dataUsageHistory = {
          id: user?.id,
          type: 'admin',
          action: ' تعديل جدول الامتحانات',
        };
        axios.post('/api/usageHistory', dataUsageHistory);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
    setEdit(!edit);
  };

  const handleDelete = (item: ExamProgramType) => {
    axios
      .post('/api/examProg/1/deleteExamProg', item)
      .then((res) => {
        toast.success(res.data.message);
        const dataUsageHistory = {
          id: user?.id,
          type: 'admin',
          action: ' تعديل جدول الامتحانات',
        };
        axios.post('/api/usageHistory', dataUsageHistory);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
    setEdit(!edit);
  };

  const deleteAllProgram = () => {
    axios
      .post('/api/examProg/1/deleteAllExamProg')
      .then((res) => {
        toast.success(res.data.message);
        const dataUsageHistory = {
          id: user?.id,
          type: 'admin',
          action: ' تعديل جدول الامتحانات',
        };
        axios.post('/api/usageHistory', dataUsageHistory);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
    setEdit(!edit);
  };

    const handlePrint = useReactToPrint({
      content: () => printableContentRef.current,
    });

  return (
    <div className="flex flex-col absolute w-[80%] mt-7 items-center justify-center ">
      <table className="w-[900px] m-10">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-grey">
              اسم المادة
            </th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course, index) => (
            <tr key={index}>
              <td className="border border-gray-300 px-4 py-2">
                {course.course_name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {perms.map((permItem, idx) => {
        if (permItem.permission_id === 6 && permItem.active) {
          return (
            <>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md"
                onClick={deleteAllProgram}
              >
                حذف كل الجدول
              </button>
              <div
                key={idx}
                className="border-2 border-grey m-4 rounded-5 p-5 flex justify-center items-center rounded-md"
              >
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md"
                >
                  اضافة
                </button>
                <input
                  dir="rtl"
                  placeholder=" القاعة "
                  type="text"
                  className="w-48 p-2 bg-gray-200 border-2 border-black rounded-md ml-4"
                  onChange={(e) => setLocation(e.target.value)}
                />
                <div>
                  <input
                    dir="rtl"
                    placeholder=" الفترة "
                    type="text"
                    className="w-48 p-2 bg-gray-200 border-2 border-black rounded-md ml-4"
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
                <TimePicker
                  locale="ar"
                  onChange={(e: any) => setSelecetedStartHour(e)}
                  value={selectedStartHour}
                  className="w-48 p-2 bg-gray-200 border-2 border-black rounded-md ml-4"
                  closeClock
                />

                <DatePicker
                  locale="ar"
                  className="w-48 p-2 bg-gray-200 border-2 border-black rounded-md ml-4"
                  onChange={(val) => setSelecetedDay(val as any)}
                  value={selecetedDay}
                />

                <select
                  id="dep"
                  dir="rtl"
                  onChange={(e) => setSelecetedCourse(e.target.value)}
                  className="px-4 py-2 bg-gray-200 border-2 border-black rounded-md ml-4"
                  defaultValue=""
                >
                  <option disabled value="">
                    المادة
                  </option>
                  {courses.map((course, index) => (
                    <option key={index}>{course.course_name}</option>
                  ))}
                </select>
              </div>
            </>
          );
        }
      })}
      <button
        onClick={handlePrint}
        className="flex bg-green-500 hover:bg-green-600 p-2 m-5 text-white rounded-md w-[200px] justify-center items-center"
      >
        طباعة جدول الامتحانات
      </button>
      <table className="w-full bg-white shadow-md rounded-md">
        <thead>
          <tr>
            <th className="py-2 px-4 bg-gray-200 text-gray-700"></th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">القاعة</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">
              مدة الامتحان
            </th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">الساعة</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">اسم المادة</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">التاريخ</th>
          </tr>
        </thead>
        <tbody>
          {examProg.map((item, index) => {
            const selectcourse = courses.find(
              (course) => course.id == item.course_id
            );
            return (
              <tr key={index}>
                <td className="py-2 px-4 border-b">
                  <BsXCircleFill onClick={() => handleDelete(item)} />
                </td>
                <td className="py-2 px-4 border-b">{item.location}</td>
                <td className="py-2 px-4 border-b">{item.duration}</td>
                <td className="py-2 px-4 border-b">{item.hour}</td>
                <td className="py-2 px-4 border-b">
                  {selectcourse?.course_name}
                </td>
                <td className="py-2 px-4 border-b">{item.date}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ position: 'absolute', top: '-9999px' }}>
        <div ref={printableContentRef} className="m-5">
          <h1 className='flex justify-center items-center text-[30px] m-5'>جدول الامتحانات</h1>
          <table className="w-full bg-white shadow-md rounded-md">
            <thead>
              <tr>
                <th className="py-2 px-4 bg-gray-200 text-gray-700">القاعة</th>
                <th className="py-2 px-4 bg-gray-200 text-gray-700">
                  مدة الامتحان
                </th>
                <th className="py-2 px-4 bg-gray-200 text-gray-700">الساعة</th>
                <th className="py-2 px-4 bg-gray-200 text-gray-700">
                  اسم المادة
                </th>
                <th className="py-2 px-4 bg-gray-200 text-gray-700">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {examProg.map((item, index) => {
                const selectcourse = courses.find(
                  (course) => course.id == item.course_id
                );
                return (
                  <tr key={index}>
                    <td className="py-2 px-4 border-b">{item.location}</td>
                    <td className="py-2 px-4 border-b">{item.duration}</td>
                    <td className="py-2 px-4 border-b">{item.hour}</td>
                    <td className="py-2 px-4 border-b">
                      {selectcourse?.course_name}
                    </td>
                    <td className="py-2 px-4 border-b">{item.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Page;
