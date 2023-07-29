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
  if (session.data?.user ? session.data?.user.userType !== 'doctor' : false) {
    redirect('/');
  }

  const user = session.data?.user;

  const [classes, setClasses] = useState<ClassesInfoType[]>([]);
  const [majors, setMajors] = useState<MajorRegType[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<MajorRegType>();
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
  const [classesGrade, setClassesGrade] = useState<ClassesInfoType[]>([]);
  const [year2, setYear2] = useState('');
  const [semester2, setSemester2] = useState('');
  const [examProg, setExamProg] = useState<ExamProgramType[]>([]);
  const type = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      const resp = await axios.get('/api/major/getMajors');
      const message: MajorRegType[] = resp.data.message;
      console.log(user);
      const selelectedMajors = message.filter(
        (maj) => maj.department_id == user?.head_of_department_id
      );
      setMajors(selelectedMajors);
    };
    fetchPosts();
  }, [user]);

  const handleChangeMajor = async () => {
    setSelect(true);
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
    setSelect(true);

    const messageMaj: MajorRegType[] = responseMaj.data.message;
    setMajor(messageMaj[0].major_name);

    const responseYear = await axios.get(`/api/exams/grading/4`);
    const messageYear: LettersType[] = responseYear.data.message;
    setYear(messageYear);

    handleAllGrades();
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
          type: 'doctor',
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
          type: 'doctor',
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
      `/api/course/departmentCourse/${user?.head_of_department_id}`
    );
    const messageMajorCour: AddCourseType[] = await resMajorCourses.data
      .message;

    const sectionsPromises = messageMajorCour.map(async (course) => {
      const responseReq = await axios.get(
        `/api/getAll/getAllSections/${course.id}`
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

  const handleAllGrades = async () => {
    const resMajorCourses = await axios.get(
      `/api/course/departmentCourse/${user?.head_of_department_id}`
    );
    const messageMajorCour: AddCourseType[] = await resMajorCourses.data
      .message;

    const sectionsPromises = messageMajorCour.map(async (course) => {
      const responseReq = await axios.get(
        `/api/getAll/getAllSections/${course.id}`
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

    const clss: ClassesInfoType[] = [];
    classes.forEach((cls) => {
      if (type?.current?.value === 'جميع المجموعات') {
        clss.push(cls);
      } else if (
        type?.current?.value == 'في انتظار قبول الدرجات' &&
        cls.class.publish_grades == false &&
        !cls.courseEnrollements.find((c) => c.result == null)
      ) {
        clss.push(cls);
      } else if (
        type?.current?.value === 'تم قبول الدرجات' &&
        cls.class.publish_grades
      ) {
        clss.push(cls);
      } else if (
        type?.current?.value === 'لم يتم ادخال جميع الدرجات' &&
        cls.courseEnrollements.find((c) => c.result == null)
      ) {
        clss.push(cls);
      }
    });
    setClassesGrade(clss);
  };

  return (
    <div className="flex flex-col lg:absolute lg:w-[80%] sm:w-[100%] items-center justify-center lg:text-[16px] sm:text-[10px]">
      <div className="lg:text-sm sm:text-[7px] flex flex-row ">
        <button
          onClick={() => handleTabClick('Tab 1')}
          className={
            activeTab === 'Tab 1'
              ? ' lg:w-[200px] sm:w-[60px] lg:p-2 sm:p-1 flex bg-darkBlue text-secondary justify-center'
              : ' lg:w-[200px] sm:w-[60px] lg:p-2 sm:p-1 flex bg-grey justify-center'
          }
        >
          جدول المحاضرات
        </button>
        <button
          onClick={() => handleTabClick('Tab 2')}
          className={
            activeTab === 'Tab 2'
              ? ' lg:w-[200px] sm:w-[60px] lg:p-2 sm:p-1 flex bg-darkBlue text-secondary justify-center'
              : ' lg:w-[200px] sm:w-[60px] lg:p-2 sm:p-1 flex bg-grey justify-center'
          }
        >
          الطلاب
        </button>
        <button
          onClick={() => handleTabClick('Tab 4')}
          className={
            activeTab === 'Tab 4'
              ? ' lg:w-[200px] sm:w-[60px] lg:p-2 sm:p-1 flex bg-darkBlue text-secondary justify-center'
              : ' lg:w-[200px] sm:w-[60px] lg:p-2 sm:p-1 flex bg-grey justify-center'
          }
        >
          جدول الامتحانات
        </button>
        <button
          onClick={() => handleTabClick('Tab 5')}
          className={
            activeTab === 'Tab 5'
              ? 'lg:w-[200px] sm:w-[60px] lg:p-2 sm:p-1 flex bg-darkBlue text-secondary p-2 justify-center'
              : ' lg:w-[200px] sm:w-[60px] lg:p-2 sm:p-1 flex bg-grey p-2 justify-center'
          }
        >
          الدرجات
        </button>
        <button
          onClick={() => handleTabClick('Tab 3')}
          className={
            activeTab === 'Tab 3'
              ? 'lg:w-[300px] sm:w-[100px] lg:p-2 sm:p-1  flex bg-darkBlue text-secondary p-2 justify-center'
              : ' lg:w-[300px] sm:w-[100px] lg:p-2 sm:p-1  flex bg-grey p-2 justify-center'
          }
        >
          جميع محاضرات السنوات الماضية
        </button>
      </div>
      <div className="flex flex-row m-5 ">
        {activeTab != 'Tab 5' && activeTab != 'Tab 3' && (
          <>
            <button
              onClick={handleChangeMajor}
              className="bg-green-700 m-2 hover:bg-green-600 lg:p-3 sm:p-1 rounded-md text-white lg:w-[150px] sm:w-[60px]"
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
              className="lg:px-2 sm:p-1  bg-gray-200 border-2 border-black rounded-md ml-4 lg:w-[200px] sm:w-[100px]"
            >
              <option>اختر التخصص</option>
              {majors.map((item) => (
                <option key={item.id}>{item.major_name}</option>
              ))}
            </select>
          </>
        )}

        {activeTab === 'Tab 5' && (
          <div className="flex flex-row">
            <button
              onClick={handleAllGrades}
              className="bg-green-700 m-2 hover:bg-green-600 lg:p-3 sm:p-1 rounded-md text-white lg:w-[150px] sm:w-[60px]"
            >
              بحث
            </button>
            <select
              id="dep"
              dir="rtl"
              ref={type}
              className="lg:px-2 bg-gray-200 p-4 border-2 border-black rounded-md ml-4 lg:w-[200px] sm:w-[100px]"
            >
              <option>جميع المجموعات</option>
              <option>في انتظار قبول الدرجات</option>
              <option>تم قبول الدرجات</option>
              <option>لم يتم ادخال جميع الدرجات</option>
            </select>
          </div>
        )}
      </div>

      {activeTab === 'Tab 1' && (
        <>
          {select && (
            <div className="border-2 border-grey m-4 rounded-5 p-5 flex w-[100%] justify-center items-center rounded-md sm:text-[8px] lg:text-[16px]">
              <button
                onClick={handleSubmit}
                className="plg:x-4 lg:py-2 sm:p-1 bg-blue-500 text-white rounded-md"
              >
                اضافة
              </button>
              <input
                dir="rtl"
                placeholder=" الموقع "
                type="text"
                className="lg:w-48 sm:w-[60px] lg:p-2 sm:p-1 bg-gray-200 border-2 border-black rounded-md lg:ml-4"
                onChange={(e) => setLocation(e.target.value)}
              />
              <select
                id="dep"
                dir="rtl"
                onChange={(e) => setSelecetedEndHour(e.target.value)}
                className="lg:px-4 lg:py-2 sm:p-1 bg-gray-200 border-2 border-black rounded-md lg:ml-4"
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
                className="lg:px-4 lg:py-2 sm:p-1  bg-gray-200 border-2 border-black rounded-md lg:ml-4"
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
                className="lg:px-4 lg:py-2 sm:p-1  bg-gray-200 border-2 border-black rounded-md lg:ml-4"
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
                className="lg:px-4 lg:py-2 sm:p-1 sm-[60x] lg:w-[150px] bg-gray-200 border-2 border-black rounded-md lg:ml-4 "
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
                className="lg:px-4 lg:py-2 sm:p-1 bg-gray-200 border-2 border-black rounded-md lg:ml-4 sm:w-[60x] lg:w-[150px]"
                defaultValue="المجموعة"
              >
                <option disabled>المجموعة</option>
                {sections
                  .filter(
                    (sec) =>
                      sec.course_id ===
                      courses.find((co) => selectedCourse == co.course_name)?.id
                  )
                  .map((course) => (
                    <option key={course.id}>{course.name}</option>
                  ))}
              </select>

              <select
                id="dep"
                dir="rtl"
                onChange={(e) => setSelecetedCourse(e.target.value)}
                className="lg:px-4 lg:py-2 sm:p-1  bg-gray-200 border-2 border-black rounded-md lg:ml-4 sm:w-[60x] lg:w-[150px]"
                defaultValue="المادة"
              >
                <option disabled>المادة</option>
                {courses
                  .filter((item1) =>
                    majorCourses.find((item2) => item1.id === item2.course_id)
                  )
                  .map((course, index) => (
                    <option key={index}>{course.course_name}</option>
                  ))}
              </select>
            </div>
          )}

          <button
            onClick={handlePrint}
            className="flex bg-green-500 hover:bg-green-600 p-2 lg:m-5 text-white rounded-md lg:w-[200px] sm:w-[100px] justify-center items-center"
          >
            طباعة جدول المحاضرات
          </button>
          <h1 className="flex justify-center items-center lg:text-sm sm:text-[15px] w-[100%] m-4">
            جدول محاضرات تخصص {major}
          </h1>
          <table className="lg:w-[1100px] lg:text-[16px] sm:w-[350px] sm:text-[8px]">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-200 lg:px-4 lg:py-2 sm:p-1"></th>
                <th className="border border-gray-300 bg-gray-200 lg:px-4 lg:py-2 sm:p-1">
                  الموقع
                </th>
                <th className="border border-gray-300 bg-gray-200 lg:px-4 lg:py-2 sm:p-1">
                  موعد الانتهاء
                </th>
                <th className="border border-gray-300 bg-gray-200 lg:px-4 lg:py-2 sm:p-1">
                  موعد البدأ
                </th>
                <th className="border border-gray-300 bg-gray-200 lg:px-4 lg:py-2 sm:p-1">
                  اليوم
                </th>
                <th className="border border-gray-300 bg-gray-200 lg:px-4 lg:py-2 sm:p-1">
                  الفصل الدراسي
                </th>
                <th className="border border-gray-300 bg-gray-200 lg:px-4 lg:py-2 sm:p-1">
                  الدكتور
                </th>
                <th className="border border-gray-300 bg-gray-200 lg:px-4 lg:py-2 sm:p-1">
                  المجموعة
                </th>
                <th className="border border-gray-300 bg-gray-200 lg:px-4 lg:py-2 sm:p-1">
                  المادة
                </th>
                <th className="border border-gray-300 bg-gray-200 lg:px-4 lg:py-2 sm:p-1">
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
                  <tr key={index + 1}>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      <BsXCircleFill
                        className="cursor-pointer"
                        onClick={() => handleDelete(Class.class.id)}
                      />
                    </td>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      {Class.class?.location}
                    </td>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      {findEndTime?.name}
                    </td>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      {findStartTime?.name}
                    </td>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      {findDay?.name}
                    </td>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      {Class.class?.semester}
                    </td>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      {Class.doctor?.name}
                    </td>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      {Class.section?.name}
                    </td>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      {Class.course?.course_name}
                    </td>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      {Class.course?.course_number}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
      {activeTab === 'Tab 2' && (
        <div className="flex  flex-col justify-center items-center w-[80%]">
          <Link
            className="bg-green-700 m-2 hover:bg-green-600 p-3 rounded-md text-white lg:w-[200px] sm:w-[80px]"
            href={`/doctor/head-of-department-work/graduatedStudents/${selectedMajor?.id}`}
          >
            الخرجين
          </Link>

          <table className="border-collapse mt-8 lg:w-[1100px] sm:w-[350px] ">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                  ايقاف/تفعيل
                </th>

                <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                  المعلومات الشخصية
                </th>
                <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                  تاريخ الانشاء
                </th>
                <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                  لقب
                </th>
                <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                  اسم
                </th>
                <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
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
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      <button
                        onClick={() => {
                          handleActivate(user.id, !user.active);
                        }}
                        className={`text-white py-1 px-1 rounded ${
                          user.active
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {user.active ? 'ايقاف' : 'تفعيل'}
                      </button>
                    </td>

                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      <Link
                        href={`/doctor/personalInformation/student/${user.id}`}
                        className="bg-blue-500 hover:bg-blue-600 p-2 text-white rounded-md justify-center items-center"
                      >
                        الملف الشخصي
                      </Link>
                    </td>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      {user.enrollment_date}
                    </td>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      {user.surname}
                    </td>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      {user.name}
                    </td>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
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
      {activeTab === 'Tab 3' && (
        <div className="flex flex-col  w-[90%]  items-center justify-center ">
          <div className="flex flex-row m-5">
            <button
              onClick={handleAllClasses}
              className="bg-green-700 m-2 hover:bg-green-600 lg:p-3 sm:p-1 rounded-md text-white sm:w-[80px] lg:w-[150px]"
            >
              بحث
            </button>
            <input
              dir="rtl"
              placeholder=" السنة"
              type="text"
              className="lg:w-20 sm:w-[60x] lg:px-4 lg:py-2 sm:p-1 bg-gray-200 border-2 border-black rounded-md ml-4"
              onChange={(e) => setYear2(e.target.value)}
            />
            <select
              id="dep"
              dir="rtl"
              onChange={(e) => setSemester2(e.target.value)}
              className="lg:px-4 lg:py-2 sm:p-1 bg-gray-200 border-2 border-black rounded-md ml-4"
              defaultValue="الفصل"
            >
              <option disabled>الفصل</option>
              <option>خريف</option>
              <option>ربيع</option>
            </select>
          </div>
          <table className="lg:w-[1000px] sm:w-[350px]">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-200 lg:px-4 lg:py-2 sm:p-1">
                  الموقع
                </th>
                <th className="border border-gray-300 bg-gray-200 lg:px-4 lg:py-2 sm:p-1">
                  موعد الانتهاء
                </th>
                <th className="border border-gray-300 bg-gray-200 lg:px-4 lg:py-2 sm:p-1">
                  موعد البدأ
                </th>
                <th className="border border-gray-300 bg-gray-200 lg:px-4 lg:py-2 sm:p-1">
                  اليوم
                </th>
                <th className="border border-gray-300 bg-gray-200 lg:px-4 lg:py-2 sm:p-1">
                  الفصل الدراسي
                </th>
                <th className="border border-gray-300 bg-gray-200 lg:px-4 lg:py-2 sm:p-1">
                  الدكتور
                </th>
                <th className="border border-gray-300 bg-gray-200 lg:px-4 lg:py-2 sm:p-1">
                  المجموعة
                </th>
                <th className="border border-gray-300 bg-gray-200 lg:px-4 lg:py-2 sm:p-1">
                  المادة
                </th>
                <th className="border border-gray-300 bg-gray-200 lg:px-4 lg:py-2 sm:p-1">
                  رقم المادة
                </th>
              </tr>
            </thead>
            <tbody>
              {classes2.map((Class, index) => {
                const findDay = days.find((day) => day.day == Class.class?.day);
                const findStartTime = hoursNames.find(
                  (hour) => hour.id == Class.class?.starts_at
                );
                const findEndTime = hoursNames.find(
                  (hour) => hour.id == Class.class?.ends_at
                );
                return (
                  <tr key={index}>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      {Class.class?.location}
                    </td>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      {findEndTime?.name}
                    </td>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      {findStartTime?.name}
                    </td>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      {findDay?.name}
                    </td>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      {Class.class?.semester}
                    </td>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      {Class.doctor?.name}
                    </td>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      <Link
                        href={`/doctor/head-of-department-work/AllClassesInfo/${Class.class.section_id}/${semester2}-${year2}`}
                      >
                        {Class.section?.name}
                      </Link>
                    </td>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      <Link
                        href={`/doctor/head-of-department-work/AllClassesInfo/${Class.class.section_id}/${semester2}-${year2}`}
                      >
                        {Class.course?.course_name}
                      </Link>
                    </td>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      {Class.course?.course_number}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {activeTab === 'Tab 4' && (
        <div className="flex flex-col lg:w-[80%] sm:w-[100%] mt-7 items-center justify-center ">
          <button
            onClick={handlePrint}
            className="flex bg-green-500 hover:bg-green-600 p-2 m-5 text-white rounded-md lg:w-[200px] sm:w-[100px] justify-center items-center"
          >
            طباعة جدول الامتحانات
          </button>
          <div ref={printableContentRef}>
            <h1 className="flex justify-center items-center lg-text-[30px] sm:text-[16px] lg:w-[1000px] sm:m-2 lg:m-5">
              جدول الامتحانات تخصص {major}
            </h1>
            <table className="lg:w-[1000px] sm:w-[350px] bg-white shadow-md rounded-md">
              <thead>
                <tr>
                  <th className="lg:px-4 lg:py-2 sm:p-1 bg-gray-200 text-gray-700">
                    القاعة
                  </th>
                  <th className="lg:px-4 lg:py-2 sm:p-1 bg-gray-200 text-gray-700">
                    مدة الامتحان
                  </th>
                  <th className="lg:px-4 lg:py-2 sm:p-1 bg-gray-200 text-gray-700">
                    الساعة
                  </th>
                  <th className="lg:px-4 lg:py-2 sm:p-1 bg-gray-200 text-gray-700">
                    اسم المادة
                  </th>
                  <th className="lg:px-4 lg:py-2 sm:p-1 bg-gray-200 text-gray-700">
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
                      <td className="lg:px-4 lg:py-2 sm:p-1 border-b">
                        {item.location}
                      </td>
                      <td className="lg:px-4 lg:py-2 sm:p-1 border-b">
                        {item.duration}
                      </td>
                      <td className="lg:px-4 lg:py-2 sm:p-1 border-b">
                        {item.hour}
                      </td>
                      <td className="lg:px-4 lg:py-2 sm:p-1 border-b">
                        {selectcourse?.course_name}
                      </td>
                      <td className="lg:px-4 lg:py-2 sm:p-1 border-b">
                        {item.date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab == 'Tab 5' && (
        <div>
          <table className="lg:w-[1100px] sm:w-[350px]">
            <thead>
              <tr>
                <th className="border border-gray-300 bg-gray-200 lg:px-4 lg:py-2 sm:p-1">
                  الدكتور
                </th>
                <th className="border border-gray-300 bg-gray-200 lg:px-4 lg:py-2 sm:p-1">
                  المجموعة
                </th>
                <th className="border border-gray-300 bg-gray-200 lg:px-4 lg:py-2 sm:p-1">
                  المادة
                </th>
                <th className="border border-gray-300 bg-gray-200 lg:px-4 lg:py-2 sm:p-1">
                  رقم المادة
                </th>
              </tr>
            </thead>
            <tbody>
              {classesGrade.map((Class, index) => {
                return (
                  <tr key={index + 1}>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      {Class.doctor?.name}
                    </td>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      <Link
                        href={`/management/head-of-department-work/courseStudents/${Class.class.section_id}`}
                      >
                        {Class.section?.name}
                      </Link>
                    </td>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      <Link
                        href={`/management/head-of-department-work/courseStudents/${Class.class.section_id}`}
                      >
                        {Class.course?.course_name}
                      </Link>
                    </td>
                    <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                      {Class.course?.course_number}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
