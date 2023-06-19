'use client';
import axios from 'axios';
import React, {useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useReactToPrint } from 'react-to-print';
import { AddCourse2Type, ExamProgramType, MajorType } from '@/app/types/types';
import { useSession } from 'next-auth/react';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { DatePicker } from 'react-date-picker';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import { BsXCircleFill } from 'react-icons/bs';



const Page = ({ params }: { params: { id: number } }) => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'doctor' : false) {
    throw new Error('Unauthorized');
  }
  const user = session.data?.user;
  const [courses, setCourses] = useState<AddCourse2Type[]>([]);
  const [examProg, setExamProg] = useState<ExamProgramType[]>([]);
  const [selectedCourse, setSelecetedCourse] = useState<string>();
  const [selectedStartHour, setSelecetedStartHour] = useState('10:00');
  const [duration, setDuration] = useState<string>();
  const [selecetedDay, setSelecetedDay] = useState(new Date());
  const [Location, setLocation] = useState<string>();
  const [edit, setEdit] = useState(false);
  const printableContentRef = useRef<HTMLDivElement>(null);
  const [majors, setMajors] = useState<string>();


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fetchPosts = async () => {
        const response = await axios.get(
          `/api/major/getMajors/${params.id}`
        );
        const message: MajorType[] = response.data.message;
          const m = message.find((m) => m.id == params.id);
        setMajors(m?.major_name);
        axios
          .get(`/api/course/courseRegistration/${params.id}`)
          .then(async (resp) => {
            const message: AddCourse2Type[] = resp.data.message;
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
        
      };
      fetchPosts();
    }
  }, [params.id, user,edit]);

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
      <button
        onClick={handlePrint}
        className="px-4 py-2 bg-green-500 text-white rounded-md text-sm"
      >
        طباعة جدول الامتحانات
      </button>
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
      <div className="border-2 border-grey m-4 rounded-5 p-5 flex justify-center items-center rounded-md">
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
      <div
        className="m-2 flex flex-col justify-center items center"
        ref={printableContentRef}
      >
        <h1 className="m-5 text-[30px] flex justify-center items center">
          {majors}جدول الامتحانات لتخصص
        </h1>
        <table className="w-full bg-white shadow-md rounded-md m-2 text-sm">
          <thead>
            <tr>
              <th className="py-2 px-4 bg-gray-200 text-gray-700"></th>
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
      </div>
    </div>
  );
};

export default Page;
