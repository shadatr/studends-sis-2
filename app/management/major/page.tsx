'use client';
import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
  MajorCourseType,
  SectionType,
  DayOfWeekType,
  CheckedType,
  ClassesInfoType,
  MajorRegType,
  PersonalInfoType,
  AddCourseType,
  GetPermissionType,
  LettersType,
  ExamProgramType,
} from '@/app/types/types';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
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
  { name: 'الاحد', day: 'sunday' },
  { name: 'السبت', day: 'saturday' },
  { name: 'الجمعة', day: 'friday' },
  { name: 'الخميس', day: 'thursday' },
  { name: 'الاربعاء', day: 'wednesday' },
  { name: 'الثلثاء', day: 'tuesday' },
  { name: 'الاثنين', day: 'monday' },
];

const Page = () => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }

  const user = session.data?.user;

  const [classes, setClasses] = useState<ClassesInfoType[]>([]);
  const [majors, setMajors] = useState<MajorRegType[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<MajorRegType>();
  const [perms, setPerms] = useState<GetPermissionType[]>([]);
  const [majorCourses, setMajorCourses] = useState<MajorCourseType[]>([]);
  const [courses, setCourses] = useState<AddCourseType[]>([]);
  const [sections, setSections] = useState<SectionType[]>([]);
  const [doctors, setDoctors] = useState<PersonalInfoType[]>([]);
  const [activeTab, setActiveTab] = useState<string>('Tab 1');
  const [select, setSelect] = useState(false);
  const section = useRef<HTMLSelectElement>(null);
  const [doctor, setDoctor] = useState<number>();
  const [selectedCourse, setSelecetedCourse] = useState<string>();
  const [selectedStartHour, setSelecetedStartHour] = useState<string>();
  const [selectedEndHour, setSelecetedEndHour] = useState<string>();
  const [selectedDay, setSelecetedDay] = useState<string>();
  const [year, setYear] = useState<LettersType[]>([]);
  const [Location, setLocation] = useState<string>();
  const [major, setMajor] = useState<string>();
  const [refresh, setRefresh] = useState(false);
  const [students, setStudents] = useState<PersonalInfoType[]>([]);
  const [classes2, setClasses2] = useState<ClassesInfoType[]>([]);
  const [year2, setYear2] = useState('');
  const [semester2, setSemester2] = useState('');
  const [examProg, setExamProg] = useState<ExamProgramType[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const resp = await axios.get('/api/major/getMajors');
      const message: MajorRegType[] = resp.data.message;
      setMajors(message);

      const response = await axios.get(
        `/api/allPermission/admin/selectedPerms/${user?.id}`
      );
      const message2: GetPermissionType[] = response.data.message;
      setPerms(message2);
    };
    fetchPosts();
  }, [user]);

  const handleChangeMajor = async () => {
    axios.get(`/api/major/majorStudents/${selectedMajor?.id}`).then((resp) => {
      const message: PersonalInfoType[] = resp.data.message;
      setStudents(message);
    });

    const resMajorCourses = await axios.get(
      `/api/course/courseMajorReg/${selectedMajor?.id}`
    );
    const messageMajorCour: MajorCourseType[] = await resMajorCourses.data
      .message;
    setMajorCourses(messageMajorCour);

    const progClassPromises = messageMajorCour.map(async (course) => {
      const responseReq = await axios.get(`/api/examProg/${course.course_id}`);
      const { message: courseMessage }: { message: ExamProgramType[] } =
        responseReq.data;
      return courseMessage;
    });

    const progClassData = await Promise.all(progClassPromises);
    const programClass = progClassData.flat();
    setExamProg(programClass);

    const sectionsPromises = messageMajorCour.map(async (course) => {
      const responseReq = await axios.get(
        `/api/getAll/getAllSections/${course.course_id}`
      );
      const { message: secMessage }: { message: SectionType[] } =
        responseReq.data;
      return secMessage;
    });
    const sectionData = await Promise.all(sectionsPromises);
    const sections = sectionData.flat();
    setSections(sections);

    const classPromises = sections.map(async (section) => {
      const responseReq = await axios.get(
        `/api/getAll/getAllClassInfo/${section.id}`
      );
      const { message: classMessage }: { message: ClassesInfoType[] } =
        responseReq.data;
      return classMessage;
    });

    const classData = await Promise.all(classPromises);
    const classes = classData.flat();

    setClasses(classes);

    axios.get(`/api/getAll/doctor`).then((resp) => {
      const message: PersonalInfoType[] = resp.data.message;
      setDoctors(message);
    });

    const res = await axios.get(`/api/course/courseRegistration`);
    const messageCour: AddCourseType[] = await res.data.message;
    setCourses(messageCour);

    const responseMaj = await axios.get(
      `/api/majorEnrollment/${selectedMajor?.id}`
    );
    const messageMaj: MajorRegType[] = responseMaj.data.message;
    setMajor(messageMaj[0].major_name);

    const responseYear = await axios.get(`/api/exams/grading/4`);
    const messageYear: LettersType[] = responseYear.data.message;
    setYear(messageYear);
    setYear(messageYear);
    setSelect(true);

  };

  const printableContentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printableContentRef.current,
  });

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const handleActivate = (studentId: number, active: boolean) => {
    const data = { studentId, active };
    axios.post('/api/active/studentActive', data).then((res) => {
      const dataUsageHistory = {
        id: user?.id,
        type: 'admin',
        action: ' تغيير حالة الطلبة',
      };
      axios.post('/api/usageHistory', dataUsageHistory);
      toast.success(res.data.message);
      setRefresh(!refresh);
      handleChangeMajor();
    });
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

    const sectionId = sections.find(
      (item) => item.name === section.current?.value
    );

    const hasConflictingClass = classes.some(
      (cls) =>
        cls.class.doctor_id === doctor &&
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
      doctor_id: doctor,
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
        handleChangeMajor();
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
  };

  const handleDelete = (item?: number) => {
    axios
      .post(`/api/getAll/getAllClassInfo/1`, item)
      .then((res) => {
        handleChangeMajor();
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
  };


  const handleAllClasses = async () => {
    const resMajorCourses = await axios.get(
      `/api/course/courseMajorReg/${selectedMajor?.id}`
    );
    const messageMajorCour: MajorCourseType[] = await resMajorCourses.data
      .message;

    const sectionsPromises = messageMajorCour.map(async (course) => {
      const responseReq = await axios.get(
        `/api/getAll/getAllSections/${course.course_id}`
      );
      const { message: secMessage }: { message: SectionType[] } =
        responseReq.data;
      return secMessage;
    });

    const sectionData = await Promise.all(sectionsPromises);
    const sections = sectionData.flat();

    const classPromises = sections.map(async (section) => {
      const responseReq = await axios.get(
        `/api/getAll/allClasses/${section.id}/${semester2}-${year2}`
      );
      const { message: classMessage }: { message: ClassesInfoType[] } =
        responseReq.data;
      return classMessage;
    });

    const classData = await Promise.all(classPromises);
    const classes = classData.flat();

    setClasses2(classes);
  };

  return (
    <div className="flex flex-col absolute w-[80%]  items-center justify-center text-[16px]">
      <div className="text-sm flex flex-row ">
        <button
          onClick={() => handleTabClick('Tab 1')}
          className={
            activeTab === 'Tab 1'
              ? ' w-[200px] flex bg-darkBlue text-secondary p-2 justify-center'
              : ' w-[200px] flex bg-grey p-2 justify-center'
          }
        >
          جدول المحاضرات
        </button>
        <button
          onClick={() => handleTabClick('Tab 2')}
          className={
            activeTab === 'Tab 2'
              ? ' w-[200px] flex bg-darkBlue text-secondary p-2 justify-center'
              : ' w-[200px] flex bg-grey p-2 justify-center'
          }
        >
          الطلاب
        </button>
        <button
          onClick={() => handleTabClick('Tab 3')}
          className={
            activeTab === 'Tab 3'
              ? ' w-[300px] flex bg-darkBlue text-secondary p-2 justify-center'
              : ' w-[300px] flex bg-grey p-2 justify-center'
          }
        >
          جميع محاضرات السنوات الماضية
        </button>
        <button
          onClick={() => handleTabClick('Tab 4')}
          className={
            activeTab === 'Tab 4'
              ? ' w-[300px] flex bg-darkBlue text-secondary p-2 justify-center'
              : ' w-[300px] flex bg-grey p-2 justify-center'
          }
        >
          جدول الامتحانات
        </button>
      </div>
      <div className="flex flex-row m-5">
        <button
          onClick={handleChangeMajor}
          className="bg-green-700 m-2 hover:bg-green-600 p-3 rounded-md text-white w-[150px]"
        >
          بحث
        </button>
        <select
          id="dep"
          dir="rtl"
          onChange={(e) => {
            const maj = majors.find((i) => i.major_name === e.target.value);
            setSelectedMajor(maj);
          }}
          className="px-2  bg-gray-200 border-2 border-black rounded-md ml-4 w-[200px]"
        >
          <option>اختر التخصص</option>
          {majors.map((item) => (
            <option key={item.id}>{item.major_name}</option>
          ))}
        </select>
      </div>
      
      {activeTab === 'Tab 1' &&
        perms.find((per) => per.permission_id == 8 && per.see) && (
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

              if (
                permItem.permission_id === 8 &&
                permItem.add &&
                selectedMajor && select
              ) {
                return (
                  <div
                    className="border-2 border-grey m-4 rounded-5 p-5 flex w-[100%] justify-center items-center rounded-md"
                    key={idx + 5}
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
                        <option key={index + 14}>{hour}</option>
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
                        <option key={index + 2}>{hour}</option>
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
                        <option key={index + 10}>{day.name}</option>
                      ))}
                    </select>

                    <select
                      id="dep"
                      dir="rtl"
                      onChange={(e) => setDoctor(parseInt(e.target.value))}
                      className="px-4 py-2 bg-gray-200 border-2 border-black rounded-md ml-4  w-[150px]"
                      defaultValue="الدكتور"
                    >
                      <option disabled>الدكتور</option>
                      {doctors.map((doc, index) => {
                        if (doc.active)
                          return (
                            <option key={index + 11} value={doc.id}>
                              {doc.name}
                            </option>
                          );
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
                        <option key={index + 12}>{course.name}</option>
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
                        <option key={index}>{course.course_name}</option>
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
                  {perms.map((permItem, idx) => {
                    if (permItem.permission_id === 8 && permItem.Delete) {
                      return (
                        <th className="border border-gray-300 bg-gray-200 px-4 py-2" key={idx}></th>
                      );
                    }
                    return null;
                  })}
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
                  const findDay = days.find(
                    (day) => day.day == Class.class?.day
                  );
                  const findStartTime = hoursNames.find(
                    (hour) => hour.id == Class.class?.starts_at
                  );
                  const findEndTime = hoursNames.find(
                    (hour) => hour.id == Class.class?.ends_at
                  );
                  return (
                    <tr key={index + 1}>
                      {perms.map((permItem, idx) => {
                        if (permItem.permission_id === 8 && permItem.Delete) {
                          return (
                            <td
                              className="border border-gray-300 px-4 py-2"
                              key={idx}
                            >
                              <BsXCircleFill
                                className="cursor-pointer"
                                onClick={() => handleDelete(Class.class.id)}
                              />
                            </td>
                          );
                        }
                        return null;
                      })}
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
      {activeTab === 'Tab 2' &&
        perms.find((per) => per.permission_id == 1 && per.see&&selectedMajor) && (
          <div className="flex  flex-col justify-center items-center w-[80%]">
            {perms.map((permItem, idx) => {
              if (
                permItem.permission_id === 17 &&
                permItem.see &&
                selectedMajor
              ) {
                return (
                  <Link
                    key={idx}
                    className="bg-green-700 m-2 hover:bg-green-600 p-3 rounded-md text-white w-[200px]"
                    href={`/management/students/graduatedStudents/${selectedMajor?.id}`}
                  >
                    الخرجين
                  </Link>
                );
              }
              return null;
            })}
            <table className="border-collapse mt-8 w-[1100px]">
              <thead>
                <tr className="bg-gray-200">
                  {perms.map((permItem, idx) => {
                    if (permItem.permission_id === 1 && permItem.edit) {
                      return (
                        <th
                          key={idx}
                          className="border border-gray-300 px-4 py-2"
                        >
                          ايقاف/تفعيل
                        </th>
                      );
                    }
                    return null;
                  })}
                  <th className="border border-gray-300 px-4 py-2">
                    المعلومات الشخصية
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    تاريخ الانشاء
                  </th>
                  <th className="border border-gray-300 px-4 py-2">لقب</th>
                  <th className="border border-gray-300 px-4 py-2">اسم</th>
                  <th className="border border-gray-300 px-4 py-2">
                    رقم الطالب
                  </th>
                </tr>
              </thead>
              <tbody>
                {students ? (
                  students.map((user, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? 'bg-gray-100' : ''}
                    >
                      {perms.map((permItem, idx) => {
                        if (permItem.permission_id === 1 && permItem.edit) {
                          return (
                            <td
                              className="border border-gray-300 px-4 py-2"
                              key={idx}
                            >
                              <button
                                onClick={() => {
                                  handleActivate(user.id, !user.active);
                                }}
                                className={`text-white py-1 px-2 rounded ${
                                  user.active
                                    ? 'bg-red-500 hover:bg-red-600'
                                    : 'bg-green-600 hover:bg-green-700'
                                }`}
                              >
                                {user.active ? 'ايقاف' : 'تفعيل'}
                              </button>
                            </td>
                          );
                        }
                        return null;
                      })}
                      <td className="border border-gray-300 px-4 py-2">
                        <Link
                          href={`/management/personalInformation/student/${user.id}`}
                          className="bg-blue-500 hover:bg-blue-600 p-2 text-white rounded-md justify-center items-center"
                        >
                          الملف الشخصي
                        </Link>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {user.enrollment_date}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {user.surname}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {user.name}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {user.number}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">
                      لا يوجد طلاب
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      {activeTab === 'Tab 3' &&
        perms.find((per) => per.permission_id == 8 && per.see) && (
          <div className="flex flex-col  w-[90%]  items-center justify-center text-[16px]">
            <div className="flex flex-row m-5">
              <button
                onClick={handleAllClasses}
                className="bg-green-700 m-2 hover:bg-green-600 p-3 rounded-md text-white w-[150px]"
              >
                بحث
              </button>
              <input
                dir="rtl"
                placeholder=" السنة"
                type="text"
                className="w-20 px-4 py-1 bg-gray-200 border-2 border-black rounded-md ml-4"
                onChange={(e) => setYear2(e.target.value)}
              />
              <select
                id="dep"
                dir="rtl"
                onChange={(e) => setSemester2(e.target.value)}
                className="px-4 py-1 bg-gray-200 border-2 border-black rounded-md ml-4"
                defaultValue="الفصل"
              >
                <option disabled>الفصل</option>
                <option>خريف</option>
                <option>ربيع</option>
              </select>
            </div>
            <table className="w-[1000px]">
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
                {classes2.map((Class, index) => {
                  const findDay = days.find(
                    (day) => day.day == Class.class?.day
                  );
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
                          href={`/management/course/AllClassesInfo/${Class.class.section_id}//${semester2}-${year}`}
                        >
                          {Class.section?.name}
                        </Link>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <Link
                          href={`/management/course/AllClassesInfo/${Class.class.section_id}//${semester2}-${year}`}
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
        )}
      {activeTab === 'Tab 4' &&
        perms.find((per) => per.permission_id == 9 && per.see) && (
          <div className="flex flex-col  w-[80%] mt-7 items-center justify-center ">
            <button
              onClick={handlePrint}
              className="flex bg-green-500 hover:bg-green-600 p-2 m-5 text-white rounded-md w-[200px] justify-center items-center"
            >
              طباعة جدول الامتحانات
            </button>
            <div ref={printableContentRef}>
              <h1 className="flex justify-center items-center text-[30px] w-[1000px] m-5">
                جدول الامتحانات تخصص {major}
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
                    const selectMajorCourse = majorCourses.find(
                      (course) => course.course_id == item.course_id
                    );
                    const selectcourse = courses.find(
                      (course) => course.id == selectMajorCourse?.course_id
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
        )}
      <div style={{ position: 'absolute', top: '-9999px' }}>
        <div ref={printableContentRef} className="m-5">
          <h1 className="flex justify-center items-center text-sm w-[100%] m-4">
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
