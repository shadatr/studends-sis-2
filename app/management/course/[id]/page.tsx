'use client';
import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { useReactToPrint } from 'react-to-print';
import {
  AddCourseType,
  MajorCourseType,
  GetPermissionType,
  SectionType,
  PersonalInfoType,
  DayOfWeekType,
  CheckedType,
  ClassesInfoType,
  LettersType,
  MajorRegType,
} from '@/app/types/types';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
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

const Page = ({ params }: { params: { id: number } }) => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }

  const user = session.data?.user;

  const [perms, setPerms] = useState<GetPermissionType[]>([]);
  const [majorCourses, setMajorCourses] = useState<MajorCourseType[]>([]);
  const [courses, setCourses] = useState<AddCourseType[]>([]);
  const [sections, setSections] = useState<SectionType[]>([]);
  const [classes, setClasses] = useState<ClassesInfoType[]>([]);
  const [doctors, setDoctors] = useState<PersonalInfoType[]>([]);
  const [course, setCourse] = useState<string>('');
  const [loadCourses, setLoadCourse] = useState(false);
  const [isOptional, SetIsOptional] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('Tab 1');
  const [edit, setEdit] = useState(false);
  const section = useRef<HTMLSelectElement>(null);
  const [doctor, setDoctor] = useState<string>();
  const [selectedCourse, setSelecetedCourse] = useState<string>();
  const [selectedStartHour, setSelecetedStartHour] = useState<string>();
  const [selectedEndHour, setSelecetedEndHour] = useState<string>();
  const [selectedDay, setSelecetedDay] = useState<string>();
  const [year, setYear] = useState<LettersType[]>([]);
  const [Location, setLocation] = useState<string>();
  const [major, setMajor] = useState<string>();

  useEffect(() => {
    const fetchPosts = async () => {
      if (user) {
        const resMajorCourses = await axios.get(
          `/api/course/courseMajorReg/${params.id}`
        );
        const messageMajorCour: MajorCourseType[] = await resMajorCourses.data
          .message;
        setMajorCourses(messageMajorCour);
        const response = await axios.get(
          `/api/allPermission/admin/selectedPerms/${user?.id}`
        );
        const message: GetPermissionType[] = response.data.message;
        setPerms(message);

        const sectionsPromises = messageMajorCour.map(async (course) => {
          const responseReq = await axios.get(
            `/api/getAll/getAllSections/${course.course_id}`
          );
          const { message: secMessage }: { message: SectionType[] } =
            responseReq.data;
          return secMessage;
        });
        axios.get(`/api/getAll/doctor`).then((resp) => {
          const message: PersonalInfoType[] = resp.data.message;
          setDoctors(message);
        });

        const res = await axios.get(`/api/course/courseRegistration`);
        const messageCour: AddCourseType[] = await res.data.message;
        setCourses(messageCour);

        const responseMaj = await axios.get(
          `/api/majorEnrollment/${params.id}`
        );
        const messageMaj: MajorRegType[] = responseMaj.data.message;
        setMajor(messageMaj[0].major_name);


        const sectionData = await Promise.all(sectionsPromises);
        const sections = sectionData.flat();
        setSections(sections);
        console.log(sections);

        const classPromises = sections.map(async (section) => {
          const responseReq = await axios.get(
            `/api/getAll/getAllClassInfo/${section.id}`
          );
          const { message: classMessage }: { message: ClassesInfoType[] } =
            responseReq.data;
          console.log(classMessage);
          return classMessage;
        });

        const classData = await Promise.all(classPromises);
        const classes = classData.flat();

        setClasses(classes);

        const responseYear = await axios.get(`/api/exams/grading/4`);
        const messageYear: LettersType[] = responseYear.data.message;
        setYear(messageYear);
        setYear(messageYear);

      }
    };
    fetchPosts();
  }, [params, user, loadCourses, edit]);

  const handleRegisterCourse = () => {
    const courseId = courses.find((item) => item.course_name == course);

    if (!(course && isOptional)) {
      toast.error('يجب ملئ جميع الحقول');
      return;
    }

    let duplicateFound = false;

    majorCourses.forEach((item) => {
      if (item.course_id == courseId?.id) {
        duplicateFound = true;
        return;
      }
    });

    if (duplicateFound) {
      toast.error('هذه المادة مسجلة بالفعل');
      return;
    }

    const opt = isOptional == 'اختياري' ? true : false;

    const data = {
      major_id: params.id,
      course_id: courseId?.id,
      isOptional: opt,
    };

    axios
      .post(`/api/course/courseMajorReg/1`, data)
      .then((res) => {
        toast.success(res.data.message);
        setLoadCourse(!loadCourses);
        const dataUsageHistory = {
          id: user?.id,
          type: 'admin',
          action: ' تعديل مواد تخصص' + major,
        };
        axios.post('/api/usageHistory', dataUsageHistory);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSubmit = () => {
    if (
      !(
        selectedDay &&
        selectedCourse &&
        selectedStartHour &&
        selectedEndHour &&
        location &&
        doctor &&
        section &&
        `${year[0].AA}-${year[0].BA}` &&
        year
      )
    ) {
      toast.error('يجب ملئ جميع البيانات');
      return;
    }
    const findDay = days.find((day) => day.name === selectedDay);
    const findStartTime = hoursNames.find(
      (hour) => hour.name === selectedStartHour
    );
    const findEndTime = hoursNames.find(
      (hour) => hour.name === selectedEndHour
    );

    const doctorId = doctors.find((item) => item.name === doctor);

    const sectionId = sections.find(
      (item) => item.name === section.current?.value
    );

    const hasConflictingClass = classes.some(
      (cls) =>
        cls.class.doctor_id === doctorId?.id &&
        findEndTime &&
        findStartTime &&
        cls.class.day === findDay?.day &&
        ((cls.class.starts_at <= findStartTime.id &&
          cls.class.ends_at > findStartTime.id) ||
          (cls.class.starts_at <= findEndTime.id &&
            cls.class.ends_at >= findEndTime.id) ||
          (cls.class.starts_at >= findStartTime.id &&
            cls.class.ends_at <= findEndTime.id))
    );

    if (hasConflictingClass) {
      toast.error('يوجد محاضرة أخرى لدى الدكتور في الوقت المحدد');
      return;
    }

    let duplicateFound = false;

    classes.forEach((item) => {
      if (
        item.section.id == sectionId?.id &&
        item.class.semester == `${year[0].AA}-${year[0].BA}`
      ) {
        duplicateFound = true;
        return;
      }
    });

    if (duplicateFound) {
      toast.error('محاضرة هذه المجموعة مسجلة بالفعل');
      return;
    }
    const data = {
      doctor_id: doctorId?.id,
      section_id: sectionId?.id,
      semester: `${year[0].AA}-${year[0].BA}`,
      day: findDay?.day,
      starts_at: findStartTime?.id,
      ends_at: findEndTime?.id,
      location: Location,
    };

    axios
      .post('/api/course/classRegister', data)
      .then((res) => {
        toast.success(res.data.message);
        const dataUsageHistory = {
          id: user?.id,
          type: 'admin',
          action: ' تعديل محاضرات تخصص' + major,
        };
        axios.post('/api/usageHistory', dataUsageHistory);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
    setEdit(!edit);
  };

  const handleDelete = (item?: number) => {
    axios
      .post(`/api/getAll/getAllClassInfo/1`, item)
      .then((res) => {
        toast.success(res.data.message);
        const dataUsageHistory = {
          id: user?.id,
          type: 'admin',
          action: ' تعديل محاضرات تخصص' + major,
        };
        axios.post('/api/usageHistory', dataUsageHistory);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
    setEdit(!edit);
  };

  const handleDeleteCourse = (item?: number) => {
    axios
      .post(`/api/course/majorCourses/1`, item)
      .then((res) => {
        toast.success(res.data.message);
        const dataUsageHistory = {
          id: user?.id,
          type: 'admin',
          action: `${major} تعديل مواد تخصص`,
        };
        axios.post('/api/usageHistory', dataUsageHistory);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
    setEdit(!edit);
  };

  const printableContentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printableContentRef.current,
  });

  return (
    <div className="flex flex-col absolute w-[80%]  items-center justify-center text-[16px]">
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
          جدول المحاضرات
        </button>

        <Link
          className="px-4 py-2 bg-green-500 text-white ml-5 rounded-md"
          href={`/management/course/allClasses/${params.id}`}
        >
          جميع محاضرات السنوات الماضية
        </Link>
      </div>
      {activeTab === 'Tab 1' && (
        <>
          {perms.map((permItem, idx) => {
            if (permItem.permission_id == 6 && permItem.active) {
              return (
                <div
                  className="flex flex-row-reverse items-center justify-center  w-[100%] m-10 "
                  key={idx}
                >
                  <select
                    id="dep"
                    dir="rtl"
                    onChange={(e) => setCourse(e.target.value)}
                    className="p-4 bg-lightBlue "
                    defaultValue="المادة"
                  >
                    <option disabled>المادة</option>
                    {courses.map((item, index) => (
                      <option key={index+15}>{item.course_name}</option>
                    ))}
                  </select>

                  <select
                    id="dep"
                    dir="rtl"
                    onChange={(e) => SetIsOptional(e.target.value)}
                    className="p-4  bg-lightBlue "
                    defaultValue="اجباري/اختياري"
                  >
                    <option disabled> اجباري/اختياري</option>
                    <option>اختياري </option>
                    <option> اجباري</option>
                  </select>
                  <button
                    className="bg-darkBlue text-secondary p-3 w-[200px] rounded-[5px]"
                    type="submit"
                    onClick={handleRegisterCourse}
                  >
                    سجل
                  </button>
                </div>
              );
            }
            return null;
          })}

          <table className="w-[800px]  ">
            <thead>
              <tr>
                {perms.map((permItem, idx) => {
                  if (permItem.permission_id === 6 && permItem.active) {
                    return (
                      <th key={idx+7} className="py-2 px-4 bg-gray-200 text-gray-700"></th>
                    );
                  }
                  return null;
                })}
                <th className="py-2 px-4 bg-gray-200 text-gray-700">
                  اجباري/اختياري
                </th>
                <th className="py-2 px-4 bg-gray-200 text-gray-700">
                  اسم المادة
                </th>
                <th className="py-2 px-4 bg-gray-200 text-gray-700">
                  رقم المادة
                </th>
              </tr>
            </thead>
            <tbody>
              {majorCourses.map((item, index) => {
                const selectedCourse = courses.find(
                  (course) => course.id == item.course_id
                );
                return (
                  <tr key={index}>
                    {perms.map((permItem, idx) => {
                      if (permItem.permission_id === 6 && permItem.active) {
                        return (
                          <td
                            className="border border-gray-300 px-4 py-2"
                            key={idx+9}
                          >
                            <BsXCircleFill
                              onClick={() => handleDeleteCourse(item.id)}
                            />
                          </td>
                        );
                      }
                      return null;
                    })}
                    <td className="border border-gray-300 px-4 py-2">
                      {item.isOptional ? 'اختياري' : 'اجباري'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <Link
                        href={`/management/course/managementWork/section/${item.course_id}`}
                      >
                        {selectedCourse?.course_name}
                      </Link>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {selectedCourse?.course_number}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
      {activeTab === 'Tab 2' && (
        <>
          {perms.map((permItem, idx) => {
            const selectedMajorCourse = courses.filter((item1) =>
              majorCourses.find((item2) => item1.id === item2.course_id)
            );
            const courseId = selectedMajorCourse.find(
              (item) => item.course_name === selectedCourse
            );
            const selectedSections = sections.filter(
              (item1) => item1.course_id === courseId?.id
            );

            if (permItem.permission_id === 9 && permItem.active) {
              return (
                <div
                  className="border-2 border-grey m-4 rounded-5 p-5 flex w-[100%] justify-center items-center rounded-md"
                  key={idx+5}
                >
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
                    defaultValue="وقت الانتهاء"
                  >
                    <option disabled>وقت الانتهاء</option>
                    {hours.map((hour, index) => (
                      <option key={index+14}>{hour}</option>
                    ))}
                  </select>
                  <select
                    id="dep"
                    dir="rtl"
                    onChange={(e) => setSelecetedStartHour(e.target.value)}
                    className="px-4 py-2 bg-gray-200 border-2 border-black rounded-md ml-4"
                    defaultValue="وقت البدأ"
                  >
                    <option disabled>وقت البدأ</option>
                    {hours.map((hour, index) => (
                      <option key={index+2}>{hour}</option>
                    ))}
                  </select>
                  <select
                    id="dep"
                    dir="rtl"
                    onChange={(e) => setSelecetedDay(e.target.value)}
                    className="px-4 py-2 bg-gray-200 border-2 border-black rounded-md ml-4"
                    defaultValue="اليوم"
                  >
                    <option disabled>اليوم</option>
                    {days.map((day, index) => (
                      <option key={index+10}>{day.name}</option>
                    ))}
                  </select>

                  <select
                    id="dep"
                    dir="rtl"
                    onChange={(e) => setDoctor(e.target.value)}
                    className="px-4 py-2 bg-gray-200 border-2 border-black rounded-md ml-4"
                    defaultValue="الدكتور"
                  >
                    <option disabled>الدكتور</option>
                    {doctors.map((doc, index) => {
                      if (doc.active)
                        return <option key={index+11}>{doc.name}</option>;
                    })}
                  </select>
                  <select
                    id="dep"
                    dir="rtl"
                    ref={section}
                    className="px-4 py-2 bg-gray-200 border-2 border-black rounded-md ml-4  w-[150px]"
                    defaultValue="المجموعة"
                  >
                    <option disabled>المجموعة</option>
                    {selectedSections.map((course, index) => (
                      <option key={index+12}>{course.name}</option>
                    ))}
                  </select>
                  <select
                    id="dep"
                    dir="rtl"
                    onChange={(e) => setSelecetedCourse(e.target.value)}
                    className="px-4 py-2 bg-gray-200 border-2 border-black rounded-md ml-4 w-[150px]"
                    defaultValue="المادة"
                  >
                    <option disabled>المادة</option>
                    {selectedMajorCourse.map((course, index) => (
                      <option key={index+13}>{course.course_name}</option>
                    ))}
                  </select>
                </div>
              );
            }
            return null;
          })}
          <button
            onClick={handlePrint}
            className="flex bg-green-500 hover:bg-green-600 p-2 m-5 text-white rounded-md w-[200px] justify-center items-center"
          >
            طباعة جدول المحاضرات
          </button>
          <h1 className="flex justify-center items-center text-sm w-[100%] m-4">
            جدول محاضرات تخصص {major}
          </h1>
          <table className="w-[1100px]">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2"></th>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  الموقع
                </th>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  موعد الانتهاء
                </th>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  موعد البدأ
                </th>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  اليوم
                </th>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  الفصل الدراسي
                </th>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  الدكتور
                </th>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  المجموعة
                </th>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  المادة
                </th>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  رقم المادة
                </th>
              </tr>
            </thead>
            <tbody>
              {classes.map((Class, index) => {
                const findDay = days.find((day) => day.day == Class.class?.day);
                const findStartTime = hoursNames.find(
                  (hour) => hour.id == Class.class?.starts_at
                );
                const findEndTime = hoursNames.find(
                  (hour) => hour.id == Class.class?.ends_at
                );
                return (
                  <tr key={index+1}>
                    <td className="border border-gray-300 px-4 py-2">
                      <BsXCircleFill
                        className="cursor-pointer"
                        onClick={() => handleDelete(Class.class.id)}
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {Class.class?.location}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {findEndTime?.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {findStartTime?.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {findDay?.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {Class.class?.semester}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {Class.doctor?.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <Link
                        href={`/management/course/managementWork/class/${Class.class.section_id}`}
                      >
                        {Class.section?.name}
                      </Link>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <Link
                        href={`/management/course/managementWork/class/${Class.class.section_id}`}
                      >
                        {Class.course?.course_name}
                      </Link>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {Class.course?.course_number}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
      <div style={{ position: 'absolute', top: '-9999px' }}>
        <div ref={printableContentRef} className="m-5">
          <h1 className="flex justify-center items-center text-sm w-[100%] m-4">
            {' '}
            جدول محاضرات تخصص {major}
          </h1>
          <table className="w-[1100px]">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  الموقع
                </th>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  موعد الانتهاء
                </th>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  موعد البدأ
                </th>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  اليوم
                </th>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  الفصل الدراسي
                </th>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  الدكتور
                </th>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  المجموعة
                </th>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  المادة
                </th>
                <th className="border border-gray-300 bg-gray-200 px-4 py-2">
                  رقم المادة
                </th>
              </tr>
            </thead>
            <tbody>
              {classes.map((Class, index) => {
                const findDay = days.find((day) => day.day == Class.class?.day);
                const findStartTime = hoursNames.find(
                  (hour) => hour.id == Class.class?.starts_at
                );
                const findEndTime = hoursNames.find(
                  (hour) => hour.id == Class.class?.ends_at
                );
                return (
                  <tr key={index}>
                    <td className="border border-gray-300 px-4 py-2">
                      {Class.class?.location}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {findEndTime?.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {findStartTime?.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {findDay?.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {Class.class?.semester}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {Class.doctor?.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <Link
                        href={`/management/course/managementWork/class/${Class.class.section_id}`}
                      >
                        {Class.section?.name}
                      </Link>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <Link
                        href={`/management/course/managementWork/class/${Class.class.section_id}`}
                      >
                        {Class.course?.course_name}
                      </Link>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {Class.course?.course_number}
                    </td>
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
