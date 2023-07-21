/* eslint-disable react-hooks/rules-of-hooks */
'use client';
import {
  AddCourseType,
  AssignPermissionType,
  GetPermissionType,
  ExamProgramType,
} from '@/app/types/types';
import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { redirect } from 'next/navigation';
import DatePicker from 'react-date-picker';
import TimePicker from 'react-time-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import { BsXCircleFill } from 'react-icons/bs';
import { useReactToPrint } from 'react-to-print';

const numbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const page = () => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }

  const user = session.data?.user;

  const [active, setActive] = useState<boolean>();
  const [allCourses, setAllCourses] = useState<AddCourseType[]>([]);
  const [allCourses2, setAllCourses2] = useState<AddCourseType[]>([]);
  const [activeTab, setActiveTab] = useState<string>('Tab 1');
  const [perms, setPerms] = useState<GetPermissionType[]>([]);
  const course = useRef<HTMLInputElement>(null);
  const [loadCourses, setLoadCourse] = useState(false);
  const [edit, setEdit] = useState(false);
  const [credits, setCredits] = useState('');
  const [hours, setHours] = useState('');
  const [mid, setMid] = useState('');
  const [final, setFinal] = useState('');
  const [classWork, setClassWork] = useState('');
  const [newItemCourse, setNewItemCourse] = useState('');
  const [courseNumber, setCourseNumber] = useState('');
    const [courses, setCourses] = useState<AddCourseType[]>([]);
    const [examProg, setExamProg] = useState<ExamProgramType[]>([]);
    const [selectedCourse, setSelecetedCourse] = useState<string>();
    const [selectedStartHour, setSelecetedStartHour] = useState('10:00');
    const [duration, setDuration] = useState<string>();
    const [selecetedDay, setSelecetedDay] = useState(new Date());
    const [Location, setLocation] = useState<string>();
    const printableContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

      axios.get(`/api/course/courseRegistration`).then((resp) => {
        const message: AddCourseType[] = resp.data.message;
        setAllCourses(message);
        setAllCourses2(message);
      });
      if(user){
        const response = await axios.get(
          `/api/allPermission/admin/selectedPerms/${user?.id}`
        );
        const messagePer: GetPermissionType[] = response.data.message;
        setPerms(messagePer);
      }

      const responseActive = await axios.get('/api/allPermission/courseRegPer');
      const messageActive: AssignPermissionType[] = responseActive.data.message;
      setActive(messageActive[0].active);
    };
    fetchPosts();
  }, [active, user, loadCourses,edit]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const handleRegisterCourse = () => {
    if (!newItemCourse) {
      toast.error('يجب كتابة اسم المادة');
      return;
    }
    if (!(credits && hours && newItemCourse && mid && final && classWork)) {
      toast.error('يجب ملئ جميع الحقول');
      return;
    }

    const result = parseInt(mid) + parseInt(final) + parseInt(classWork);

    if (result != 100) {
      toast.error('توزيع الدرجات غير صحيح');
      return;
    }

    let duplicateFound = false;

    allCourses.forEach((item) => {
      if (
        item.course_name == newItemCourse ||
        item.course_number == courseNumber
      ) {
        duplicateFound = true;
        return;
      }
    });

    if (duplicateFound) {
      toast.error('هذه المادة مسجلة بالفعل');
      return;
    }

    const data = {
      course_name: newItemCourse,
      course_number: courseNumber,
      credits: parseInt(credits),
      midterm: parseInt(mid),
      final: parseInt(final),
      class_work: parseInt(classWork),
      hours: parseInt(hours),
    };

    axios
      .post(`/api/course/courseRegistration`, data)
      .then((res) => {
        toast.success(res.data.message);
        setLoadCourse(!loadCourses);
        const dataUsageHistory = {
          id: user?.id,
          type: 'admin',
          action: 'تعديل مواد الجامعة',
        };
        axios.post('/api/usageHistory', dataUsageHistory);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  const handleInputChangeCourses = (
    e: string,
    field: keyof AddCourseType,
    id?: number
  ) => {
    const updatedData = allCourses2.map((i) => {
      if (i.id === id) {
        return {
          ...i,
          [field]: e,
        };
      }
      return i;
    });
    setAllCourses2(updatedData);
    if(field=='course_name'){
  
    }
  };


  const handleSubmit = () => {
    setEdit(false);
    setLoadCourse(!loadCourses);
    axios
      .post(`/api/course/editCourse`, allCourses2)
      .then((res) => {
        toast.success(res.data.message);
        const dataUsageHistory = {
          id: user?.id,
          type: 'admin',
          action: ' تعديل مواد',
        };
        axios.post('/api/usageHistory', dataUsageHistory);
      })
      .catch((error) => {
        toast.error(error.res);
      });
  };

  const selection = numbers.map((num, index) => (
    <option key={index}>{num}</option>
  ));

    const handleSubmitExam = () => {
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
      const exam = examProg.find((e) => e.course_id == findClass?.id);
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
    <div className="absolute flex flex-col w-[80%] items-center justify-center">
      <div className="text-sm flex flex-row ">
        <button
          onClick={() => handleTabClick('Tab 1')}
          className={
            activeTab === 'Tab 1'
              ? ' w-[300px] text-secondary flex bg-darkBlue p-2 justify-center'
              : ' w-[300px]  flex bg-grey p-2 justify-center'
          }
        >
          المواد
        </button>
        <button
          onClick={() => handleTabClick('Tab 2')}
          className={
            activeTab === 'Tab 2'
              ? ' w-[300px] flex bg-darkBlue text-secondary p-2 justify-center'
              : ' w-[300px] flex bg-grey p-2 justify-center'
          }
        >
          جدول الامتحانات
        </button>
      </div>
      {activeTab === 'Tab 1' && (
        <>
          {perms.map((permItem, idx) => {
            if (permItem.permission_id === 6 && permItem.active) {
              return (
                <>
                  <div
                    className="flex flex-row-reverse items-center justify-center  w-[100%] m-10 "
                    key={idx}
                  >
                    <input
                      ref={course}
                      dir="rtl"
                      placeholder="ادخل اسم المادة"
                      type="text"
                      className="w-[600px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
                      onChange={(e) => setNewItemCourse(e.target.value.trim())}
                    />
                    <input
                      ref={course}
                      dir="rtl"
                      placeholder="ادخل رقم المادة"
                      type="text"
                      className="w-[100px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
                      onChange={(e) => setCourseNumber(e.target.value)}
                    />
                    <select
                      id="dep"
                      dir="rtl"
                      onChange={(e) => setCredits(e.target.value)}
                      className="p-4 bg-lightBlue "
                      defaultValue="الكريدت"
                    >
                      <option disabled>الكريدت</option>
                      {selection}
                    </select>
                    <select
                      id="dep"
                      dir="rtl"
                      onChange={(e) => setHours(e.target.value)}
                      className="p-4 bg-lightBlue "
                      defaultValue="الساعات"
                    >
                      <option disabled>الساعات</option>
                      {selection}
                    </select>
                    <input
                      ref={course}
                      dir="rtl"
                      placeholder="نسبة الامتحان النصفي  "
                      type="number"
                      className="w-[150px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
                      onChange={(e) => setMid(e.target.value)}
                    />
                    <input
                      ref={course}
                      dir="rtl"
                      placeholder="نسبة الامتحان النهائي  "
                      type="number"
                      className="w-[150px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
                      onChange={(e) => setFinal(e.target.value)}
                    />
                    <input
                      ref={course}
                      dir="rtl"
                      placeholder=" نسبة اعمال السنة "
                      type="number"
                      className="w-[150px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
                      onChange={(e) => setClassWork(e.target.value)}
                    />
                    <button
                      className="bg-darkBlue text-secondary p-3 w-[200px] rounded-[5px]"
                      type="submit"
                      onClick={handleRegisterCourse}
                    >
                      سجل
                    </button>
                  </div>
                  <button
                    className="m-2 bg-blue-500 hover:bg-blue-600  text-secondary p-3 rounded-md w-[200px]"
                    type="submit"
                    onClick={() => (edit ? handleSubmit() : setEdit(!edit))}
                  >
                    {edit ? 'ارسال' : 'تعديل'}
                  </button>
                </>
              );
            }
            return null;
          })}

          <table className="w-[1100px]  ">
            <thead className="">
              <tr>
                <th className="py-2 px-4 bg-gray-200 text-gray-700">
                  نسبة اعمال السنة{' '}
                </th>
                <th className="py-2 px-4 bg-gray-200 text-gray-700">
                  نسبة الامتحان النهائي{' '}
                </th>
                <th className="py-2 px-4 bg-gray-200 text-gray-700">
                  نسبة الامتحان النصفي{' '}
                </th>
                <th className="py-2 px-4 bg-gray-200 text-gray-700">الكريدت</th>
                <th className="py-2 px-4 bg-gray-200 text-gray-700">الساعات</th>
                <th className="py-2 px-4 bg-gray-200 text-gray-700">
                  اسم المادة
                </th>
                <th className="py-2 px-4 bg-gray-200 text-gray-700">
                  رقم المادة
                </th>
              </tr>
            </thead>
            <tbody>
              {allCourses.map((item, index) => {
                const item2 = allCourses2.find((i) => i.id == item.id);
                return edit ? (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        dir="rtl"
                        type="number"
                        className="w-[70px] "
                        value={item2?.class_work}
                        onChange={(e) =>
                          handleInputChangeCourses(
                            e.target.value,
                            'class_work',
                            item.id
                          )
                        }
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        dir="rtl"
                        type="number"
                        value={item2?.final}
                        className="w-[70px] "
                        onChange={(e) =>
                          handleInputChangeCourses(
                            e.target.value,
                            'final',
                            item.id
                          )
                        }
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        dir="rtl"
                        type="number"
                        value={item2?.midterm}
                        className="w-[70px] "
                        onChange={(e) =>
                          handleInputChangeCourses(
                            e.target.value,
                            'midterm',
                            item.id
                          )
                        }
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        dir="rtl"
                        type="number"
                        value={item2?.credits}
                        className="w-[70px] "
                        onChange={(e) =>
                          handleInputChangeCourses(
                            e.target.value,
                            'credits',
                            item.id
                          )
                        }
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        dir="rtl"
                        type="number"
                        className="w-[70px] "
                        value={item2?.hours}
                        onChange={(e) =>
                          handleInputChangeCourses(
                            e.target.value,
                            'hours',
                            item.id
                          )
                        }
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        dir="rtl"
                        type="text"
                        value={item2?.course_name}
                        className="w-[150px] "
                        onChange={(e) =>
                          handleInputChangeCourses(
                            e.target.value,
                            'course_name',
                            item.id
                          )
                        }
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        dir="rtl"
                        type="text"
                        value={item2?.course_number}
                        className="w-[80px] "
                        onChange={(e) =>
                          handleInputChangeCourses(
                            e.target.value,
                            'course_number',
                            item.id
                          )
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.class_work}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.final}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.midterm}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.credits}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.hours}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <Link
                        href={`/management/course/managementWork/section/${item.id}`}
                      >
                        {item.course_name}
                      </Link>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {item.course_number}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      {activeTab === 'Tab 2' && (
        <div className="flex flex-col  w-[80%] mt-7 items-center justify-center ">

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
                      onClick={handleSubmitExam}
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
          <div style={{ position: 'absolute', top: '-9999px' }}>
            <div ref={printableContentRef} className="m-5">
              <h1 className="flex justify-center items-center text-[30px] m-5">
                جدول الامتحانات
              </h1>
              <table className="w-full bg-white shadow-md rounded-md">
                <thead>
                  <tr>
                    <th className="py-2 px-4 bg-gray-200 text-gray-700">
                      القاعة
                    </th>
                    <th className="py-2 px-4 bg-gray-200 text-gray-700">
                      مدة الامتحان
                    </th>
                    <th className="py-2 px-4 bg-gray-200 text-gray-700">
                      الساعة
                    </th>
                    <th className="py-2 px-4 bg-gray-200 text-gray-700">
                      اسم المادة
                    </th>
                    <th className="py-2 px-4 bg-gray-200 text-gray-700">
                      التاريخ
                    </th>
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
      )}
    </div>
  );
};

export default page;
