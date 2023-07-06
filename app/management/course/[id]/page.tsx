'use client';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  AddCourseType,
  MajorCourseType,
  GetPermissionType,
  SectionType,
  PersonalInfoType,
  DayOfWeekType,
  CheckedType,
  ClassesInfoType,
} from '@/app/types/types';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

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
  const [section, setSection] = useState<string>();
  const [doctor, setDoctor] = useState<string>();
  const [semester, setSemester] = useState<string>();
  const [selectedCourse, setSelecetedCourse] = useState<string>();
  const [selectedStartHour, setSelecetedStartHour] = useState<string>();
  const [selectedEndHour, setSelecetedEndHour] = useState<string>();
  const [selectedDay, setSelecetedDay] = useState<string>();
  const [year, setYear] = useState<string>();
  const [Location, setLocation] = useState<string>();


  useEffect(() => {
    const fetchPosts = async () => {
      if (user) {
        axios.get(`/api/getAll/doctor`).then((resp) => {
          const message: PersonalInfoType[] = resp.data.message;
          setDoctors(message);
        });

        const res = await axios.get(`/api/course/courseRegistration`);
        const messageCour: AddCourseType[] = await res.data.message;
        setCourses(messageCour);


          const resMajorCourses = await axios.get(`/api/course/courseMajorReg/${params.id}`);
          const messageMajorCour: MajorCourseType[] = await resMajorCourses.data.message;
          setMajorCourses(messageMajorCour);

        const sectionsPromises = messageMajorCour.map(async (course) => {
          const responseReq = await axios.get(
            `/api/getAll/getAllSections/${course.course_id}`,{headers: {'Cache-Control': 'no-store'}}
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
            `/api/getAll/getAllClassInfo/${section.id}`,
            { headers: { 'Cache-Control': 'no-store' } }
          );
          const { message: classMessage }: { message: ClassesInfoType[] } =
            responseReq.data;
          return classMessage;
        });

        const classData = await Promise.all(classPromises);
        const classes = classData.flat();

        setClasses(classes);

        const response = await axios.get(
          `/api/allPermission/admin/selectedPerms/${user?.id}`
        );
        const message: GetPermissionType[] = response.data.message;
        setPerms(message);
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
        semester &&
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

    const sectionId = sections.find((item) => item.name === section);

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
        item.class.semester == `${semester}-${year}`
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
      semester: `${semester}-${year}`,
      day: findDay?.day,
      starts_at: findStartTime?.id,
      ends_at: findEndTime?.id,
      location: Location,
    };

    axios
      .post('/api/course/classRegister', data)
      .then((res) => {
        toast.success(res.data.message);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
    setEdit(!edit);
  };

  return (
    <div className="flex flex-col absolute w-[90%]  items-center justify-center text-[16px]">
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
        > جميع محاضرات السنوات الماضية</Link>
      </div>
      {activeTab === 'Tab 1' && (
        <>
          {perms.map((permItem, idx) => {
            if (permItem.permission_id === 6 && permItem.active) {
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
                      <option key={index}>{item.course_name}</option>
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
                  className="border-2 border-grey m-4 rounded-5 p-5 flex justify-center items-center rounded-md "
                  key={idx}
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
                  <input
                    dir="rtl"
                    placeholder=" السنة"
                    type="text"
                    className="w-20 p-2 bg-gray-200 border-2 border-black rounded-md ml-4"
                    onChange={(e) => setYear(e.target.value)}
                  />
                  <select
                    id="dep"
                    dir="rtl"
                    onChange={(e) => setSemester(e.target.value)}
                    className="px-4 py-2 bg-gray-200 border-2 border-black rounded-md ml-4"
                    defaultValue="الفصل"
                  >
                    <option disabled>الفصل</option>
                    <option>خريف</option>
                    <option>ربيع</option>
                  </select>
                  <select
                    id="dep"
                    dir="rtl"
                    onChange={(e) => setDoctor(e.target.value)}
                    className="px-4 py-2 bg-gray-200 border-2 border-black rounded-md ml-4"
                    defaultValue="الدكتور"
                  >
                    <option disabled>الدكتور</option>
                    {doctors.map((doc, index) => (
                      <option key={index}>{doc.name}</option>
                    ))}
                  </select>
                  <select
                    id="dep"
                    dir="rtl"
                    onChange={(e) => setSection(e.target.value)}
                    className="px-4 py-2 bg-gray-200 border-2 border-black rounded-md ml-4 w-[150px]"
                    defaultValue="المجموعة"
                  >
                    <option disabled>المجموعة</option>
                    {selectedSections.map((course, index) => (
                      <option key={index}>{course.name}</option>
                    ))}
                  </select>
                  <select
                    id="dep"
                    dir="rtl"
                    onChange={(e) => setSelecetedCourse(e.target.value)}
                    className="px-4 py-2 bg-gray-200 border-2 border-black rounded-md ml-4 w-[150px]"
                    defaultValue=""
                  >
                    <option disabled selected value="">
                      المادة
                    </option>
                    {selectedMajorCourse.map((course, index) => (
                      <option key={index}>{course.course_name}</option>
                    ))}
                  </select>
                </div>
              );
            }
            return null;
          })}
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
        </>
      )}
    </div>
  );
};

export default Page;
