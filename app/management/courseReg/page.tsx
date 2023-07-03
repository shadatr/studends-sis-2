/* eslint-disable react-hooks/rules-of-hooks */
'use client';
import {
  AddCourseType,
  AssignPermissionType,
  LetterGradesType,
  LettersType,
  MajorRegType,
  PersonalInfoType,
  StudenCourseType,
  TranscriptType,
  GetPermissionType,
} from '@/app/types/types';
import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { redirect } from 'next/navigation';

const numbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const page = () => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }

  const user = session.data?.user;

  const [edit, setEdit] = useState(false);
  const [majors, setMajors] = useState<MajorRegType[]>([]);
  const [active, setActive] = useState<boolean>();
  const [allCourses, setAllCourses] = useState<AddCourseType[]>([]);
  const [courses, setCourses] = useState<StudenCourseType[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [students, setStudents] = useState<PersonalInfoType[]>([]);
  const [transcript, setTranscript] = useState<TranscriptType[]>([]);
  const [letters, setLetters] = useState<LettersType[]>([]);
  const [points, setPoints] = useState<LettersType[]>([]);
  const [letters2, setLetters2] = useState<LettersType[]>([]);
  const [points2, setPoints2] = useState<LettersType[]>([]);
  const [courseLetter, setCourseLetter] = useState<LetterGradesType[]>([]);
  const [activeTab, setActiveTab] = useState<string>('Tab 1');
  const [perms, setPerms] = useState<GetPermissionType[]>([]);
  const course = useRef<HTMLInputElement>(null);
  const [loadCourses, setLoadCourse] = useState(false);
  const [credits, setCredits] = useState('');
  const [hours, setHours] = useState('');
  const [mid, setMid] = useState('');
  const [final, setFinal] = useState('');
  const [classWork, setClassWork] = useState('');
  const [newItemCourse, setNewItemCourse] = useState('');
  const [passingGrade, setPassingGrade] = useState('');
  const [courseNumber, setCourseNumber] = useState('');
  const [year, setYear] = useState<string>();
  const [semester, setSemester] = useState<string>();

  useEffect(() => {
    const fetchPosts = async () => {
      const resp = await axios.get('/api/major/majorReg');
      const message: MajorRegType[] = resp.data.message;
      setMajors(message);

      axios.get(`/api/course/courseRegistration`).then((resp) => {
        const message: AddCourseType[] = resp.data.message;
        setAllCourses(message);
      });

      const response = await axios.get(
        `/api/allPermission/admin/selectedPerms/${user?.id}`
      );
      const messagePer: GetPermissionType[] = response.data.message;
      setPerms(messagePer);

      const responseLetter = await axios.get(`/api/exams/grading/1`);
      const messageLetters: LettersType[] = responseLetter.data.message;
      setPoints(messageLetters);
      setPoints2(messageLetters);

      const responseGrade = await axios.get(`/api/exams/grading/2`);
      const messageGrade: LettersType[] = responseGrade.data.message;
      setLetters(messageGrade);
      setLetters2(messageGrade);

      const responseCourseLetter = await axios.get(`/api/exams/letterGrades`);
      const messageCourseLetter: LetterGradesType[] =
        responseCourseLetter.data.message;
      setCourseLetter(messageCourseLetter);

      const responseReq = await axios.get(`/api/getAll/student`);
      const messagestudents: PersonalInfoType[] = responseReq.data.message;
      setStudents(messagestudents);

      const transccriptPromises = students.map(async (Class) => {
        const responseReq = axios.get(`/api/transcript/${Class.id}`);
        const { message: messageTranscript }: { message: TranscriptType[] } = (
          await responseReq
        ).data;
        return messageTranscript;
      });

      const tansData = await Promise.all(transccriptPromises);
      const transcript = tansData.flat();
      setTranscript(transcript);

      const coursesPromises = students.map(async (student) => {
        const responseReq = await axios.get(
          `/api/getAll/studentCoursesApprove/${student.id}`
        );
        const { message: courseMessage }: { message: StudenCourseType[] } =
          responseReq.data;
        return courseMessage;
      });

      const courseData = await Promise.all(coursesPromises);
      const courses = courseData.flat();
      setCourses(courses);

      const responseActive = await axios.get('/api/allPermission/courseRegPer');
      const messageActive: AssignPermissionType[] = responseActive.data.message;
      setActive(messageActive[0].active);
    };
    fetchPosts();
  }, [active, edit, refresh, user, loadCourses]);

  const handleActivate = () => {
    setActive(!active);
    const data = { active: !active };
    axios.post('/api/allPermission/student/courseRegActive', data);

    axios.post('/api/allPermission/courseRegPer', data).then((res) => {
      toast.success(res.data.message);
    });
  };

  const handleSubmit = () => {
    let allDataSent = true;

    console.log(students);

    students.map((student) => {
      let studentTotalGradePoints = 0;
      let studentTotalCredits = 0;

      const selectedCourses = courses.filter(
        (co) => co.courseEnrollements.student_id === student.id
      );

      selectedCourses.map((selectedCourse) => {
        const studentResult = courseLetter.find(
          (item) =>
            item.course_enrollment_id === selectedCourse?.courseEnrollements.id
        );

        let duplicateFound = false;
        if (
          selectedCourse?.course.credits &&
          studentResult?.points &&
          selectedCourse.class.semester === `${semester}-${year}`
        ) {
          studentTotalGradePoints +=
            studentResult?.points * selectedCourse?.course.credits;
          studentTotalCredits += selectedCourse?.course.credits;
        }

        transcript.forEach((item) => {
          if (item.semester === `${semester}-${year}`) {
            duplicateFound = true;
            return;
          }

          if (duplicateFound) {
            allDataSent = false;
          }
        });
      });
      const data2 = {
        student_id: student.id,
        semester: `${semester}-${year}`,
        studentSemester: student.semester,
        gpa: parseFloat(
          (studentTotalGradePoints / studentTotalCredits).toFixed(2)
        ),
      };

      console.log(data2);

      if (studentTotalGradePoints && studentTotalCredits) {
        axios.post(`/api/transcript/${1}`, data2).catch((error) => {
          allDataSent = false;
          console.error('Error sending data:', error);
        });
      }
    });
    if (allDataSent) {
      setRefresh(!refresh);
      toast.success('تم إرسال جميع البيانات بنجاح');
    } else {
      toast.error(' تم ارسال المجموع النهائي بالفعل من قبل');
    }
  };

  const handleChangePoints = (letter: string, value: string) => {
    const updatedPoints = points2.map((point) => {
      return {
        ...point,
        [letter]: parseFloat(value),
      };
    });
    setPoints2(updatedPoints);
  };

  const handleChangeLetters = (letter: string, value: string) => {
    const updatedLetters = letters2.map((point) => {
      return {
        ...point,
        [letter]: parseFloat(value),
      };
    });
    setLetters2(updatedLetters);
  };

  const handleSubmit2 = () => {
    setEdit(!edit);

    axios.post(`/api/exams/grading/1`, points2);
    axios
      .post(`/api/exams/grading/2`, letters2)
      .then(() => {
        toast.success('تم التعديل بنجاح');
      })
      .catch((error) => {
        console.error(error);
        toast.error('حدث خطأ اثناء التعديل');
      });
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const handleRegisterCourse = () => {
    if (!newItemCourse) {
      toast.error('يجب كتابة اسم المادة');
      return;
    }

    if (
      !(
        credits &&
        hours &&
        passingGrade &&
        newItemCourse &&
        mid &&
        final &&
        classWork
      )
    ) {
      toast.error('يجب ملئ جميع الحقول');
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
      passing_percentage: parseInt(passingGrade),
    };

    axios
      .post(`/api/course/courseRegistration`, data)
      .then((res) => {
        toast.success(res.data.message);
        setLoadCourse(!loadCourses);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  const selection = numbers.map((num, index) => (
    <option key={index}>{num}</option>
  ));

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
          التخصصات
        </button>
        <button
          onClick={() => handleTabClick('Tab 3')}
          className={
            activeTab === 'Tab 3'
              ? ' w-[300px] flex bg-darkBlue text-secondary p-2 justify-center'
              : ' w-[300px] flex bg-grey p-2 justify-center'
          }
        >
          تنزيل المواد و الدرجات
        </button>
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
                  <input
                    ref={course}
                    dir="rtl"
                    placeholder="ادخل اسم المادة"
                    type="text"
                    className="w-[600px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
                    onChange={(e) => setNewItemCourse(e.target.value)}
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
                    type="text"
                    className="w-[150px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
                    onChange={(e) => setMid(e.target.value)}
                  />
                  <input
                    ref={course}
                    dir="rtl"
                    placeholder="نسبة الامتحان النهائي  "
                    type="text"
                    className="w-[150px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
                    onChange={(e) => setFinal(e.target.value)}
                  />
                  <input
                    ref={course}
                    dir="rtl"
                    placeholder=" نسبة اعمال السنة "
                    type="text"
                    className="w-[150px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
                    onChange={(e) => setClassWork(e.target.value)}
                  />

                  <input
                    ref={course}
                    dir="rtl"
                    placeholder="درجة النجاح"
                    type="text"
                    className="w-[150px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
                    onChange={(e) => setPassingGrade(e.target.value)}
                  />
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

          <table className="w-[1100px]  ">
            <thead className="">
              <tr>
                <th className="py-2 px-4 bg-gray-200 text-gray-700">
                  درجة النجاح
                </th>
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
              {allCourses.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.passing_percentage}
                  </td>
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
              ))}
            </tbody>
          </table>
        </>
      )}
      {activeTab === 'Tab 3' && (
        <>
          {perms.map((permItem, idx) => {
            if (permItem.permission_id === 23 && permItem.active) {
              return (
                <div
                  key={idx}
                  className="w-[100px] flex justify-center items-center flex-col"
                >
                  <div className="flex flex-col w-[500px] m-3">
                    <div className="flex flex-row">
                      <button
                        onClick={handleSubmit}
                        className="bg-green-700 m-2 hover:bg-green-600 p-3 rounded-md text-white w-[300px]"
                      >
                        ارسال المجموع النهائي في جميع التخصصات
                      </button>
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
                    </div>
                    <div className="flex flex-row">
                      <button
                        className="m-2 bg-blue-500 hover:bg-blue-600  text-secondary p-3 rounded-md w-[200px]"
                        type="submit"
                        onClick={() =>
                          edit ? handleSubmit2() : setEdit(!edit)
                        }
                      >
                        {edit ? 'ارسال' : 'تعديل'}
                      </button>
                      <button
                        onClick={() => {
                          handleActivate();
                        }}
                        className={`p-3 rounded-md m-2 text-white ${
                          active
                            ? 'bg-red-600 hover:bg-red-500'
                            : 'bg-green-600 hover:bg-green-500'
                        }`}
                      >
                        {active ? 'اغلاق تسجيل المواد' : ' فتح تسجيل المواد '}
                      </button>
                    </div>
                  </div>
                  <table className="w-[300px] h-[600px]">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 max-w-[120px] bg-grey">
                          النقاط
                        </th>
                        <th className="border border-gray-300 px-4 py-2 max-w-[120px] bg-grey">
                          الدرجة
                        </th>
                        <th className="border border-gray-300 px-4 py-2 max-w-[120px] bg-grey">
                          الحرف
                        </th>
                      </tr>
                    </thead>
                    {points.map((point, index) => {
                      const letter = letters.find((l) => l);
                      const letter2 = letters2.find((l) => l);
                      const Point = points2.find((p) => p);
                      return edit ? (
                        <>
                          <tr>
                            <td
                              className="border border-gray-300 px-4 py-2 "
                              key={point.id}
                            >
                              <input
                                className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                                value={Point?.AA || 0}
                                onChange={(e) => {
                                  handleChangePoints('AA', e.target.value);
                                }}
                                placeholder="ادخل النقاط"
                                type="number"
                                step="any"
                              />
                            </td>
                            <td
                              className="border border-gray-300 px-4 py-2 "
                              key={index}
                            >
                              <input
                                className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                                value={letter2?.AA || 0}
                                onChange={(e) => {
                                  handleChangeLetters('AA', e.target.value);
                                }}
                                placeholder="ادخل الدرجة"
                                type="number"
                              />
                            </td>
                            <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                              AA
                            </td>
                          </tr>
                          <tr>
                            <td
                              className="border border-gray-300 px-4 py-2 "
                              key={point.id}
                            >
                              <input
                                className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                                value={Point?.BA || 0}
                                onChange={(e) => {
                                  handleChangePoints('BA', e.target.value);
                                }}
                                placeholder="ادخل النقاط"
                                type="number"
                                step="any"
                              />
                            </td>
                            <td
                              className="border border-gray-300 px-4 py-2 "
                              key={index}
                            >
                              <input
                                className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                                value={letter2?.BA || 0}
                                onChange={(e) => {
                                  handleChangeLetters('BA', e.target.value);
                                }}
                                placeholder="ادخل الدرجة"
                                type="number"
                              />
                            </td>
                            <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                              BA
                            </td>
                          </tr>
                          <tr>
                            <td
                              className="border border-gray-300 px-4 py-2 "
                              key={point.id}
                            >
                              <input
                                className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                                value={Point?.BB || 0}
                                onChange={(e) => {
                                  handleChangePoints('BB', e.target.value);
                                }}
                                placeholder="ادخل النقاط"
                                type="number"
                                step="any"
                              />
                            </td>
                            <td
                              className="border border-gray-300 px-4 py-2 "
                              key={index}
                            >
                              <input
                                className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                                value={letter2?.BB || 0}
                                onChange={(e) => {
                                  handleChangeLetters('BB', e.target.value);
                                }}
                                placeholder="ادخل الدرجة"
                                type="number"
                              />
                            </td>
                            <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                              BB
                            </td>
                          </tr>
                          <tr>
                            <td
                              className="border border-gray-300 px-4 py-2 "
                              key={point.id}
                            >
                              <input
                                className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                                value={Point?.CB || 0}
                                onChange={(e) => {
                                  handleChangePoints('CB', e.target.value);
                                }}
                                placeholder="ادخل النقاط"
                                type="number"
                                step="any"
                              />
                            </td>
                            <td
                              className="border border-gray-300 px-4 py-2 "
                              key={index}
                            >
                              <input
                                className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                                value={letter2?.CB || 0}
                                onChange={(e) => {
                                  handleChangeLetters('CB', e.target.value);
                                }}
                                placeholder="ادخل الدرجة"
                                type="number"
                              />
                            </td>
                            <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                              CB
                            </td>
                          </tr>
                          <tr>
                            <td
                              className="border border-gray-300 px-4 py-2 "
                              key={point.id}
                            >
                              <input
                                className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                                value={Point?.CC || 0}
                                onChange={(e) => {
                                  handleChangePoints('CC', e.target.value);
                                }}
                                placeholder="ادخل النقاط"
                                type="number"
                                step="any"
                              />
                            </td>
                            <td
                              className="border border-gray-300 px-4 py-2 "
                              key={index}
                            >
                              <input
                                className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                                value={letter2?.CC || 0}
                                onChange={(e) => {
                                  handleChangeLetters('CC', e.target.value);
                                }}
                                placeholder="ادخل الدرجة"
                                type="number"
                              />
                            </td>
                            <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                              CC
                            </td>
                          </tr>
                          <tr>
                            <td
                              className="border border-gray-300 px-4 py-2 "
                              key={point.id}
                            >
                              <input
                                className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                                value={Point?.DC || 0}
                                onChange={(e) => {
                                  handleChangePoints('DC', e.target.value);
                                }}
                                placeholder="ادخل النقاط"
                                type="number"
                                step="any"
                              />
                            </td>
                            <td
                              className="border border-gray-300 px-4 py-2 "
                              key={index}
                            >
                              <input
                                className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                                value={letter2?.DC || 0}
                                onChange={(e) => {
                                  handleChangeLetters('DC', e.target.value);
                                }}
                                placeholder="ادخل الدرجة"
                                type="number"
                              />
                            </td>
                            <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                              DC
                            </td>
                          </tr>
                          <tr>
                            <td
                              className="border border-gray-300 px-4 py-2 "
                              key={point.id}
                            >
                              <input
                                className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                                value={Point?.DD || 0}
                                onChange={(e) => {
                                  handleChangePoints('DD', e.target.value);
                                }}
                                placeholder="ادخل النقاط"
                                type="number"
                                step="any"
                              />
                            </td>
                            <td
                              className="border border-gray-300 px-4 py-2 "
                              key={index}
                            >
                              <input
                                className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                                value={letter2?.DD || 0}
                                onChange={(e) => {
                                  handleChangeLetters('DD', e.target.value);
                                }}
                                placeholder="ادخل الدرجة"
                                type="number"
                              />
                            </td>
                            <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                              DD
                            </td>
                          </tr>
                          <tr>
                            <td
                              className="border border-gray-300 px-4 py-2 "
                              key={point.id}
                            >
                              <input
                                className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                                value={Point?.FD || 0}
                                onChange={(e) => {
                                  handleChangePoints('FD', e.target.value);
                                }}
                                placeholder="ادخل النقاط"
                                type="number"
                                step="any"
                              />
                            </td>
                            <td
                              className="border border-gray-300 px-4 py-2 "
                              key={index}
                            >
                              <input
                                className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                                value={letter2?.FD || 0}
                                onChange={(e) => {
                                  handleChangeLetters('FD', e.target.value);
                                }}
                                placeholder="ادخل الدرجة"
                                type="number"
                              />
                            </td>
                            <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                              FD
                            </td>
                          </tr>
                          <tr>
                            <td
                              className="border border-gray-300 px-4 py-2 "
                              key={point.id}
                            >
                              <input
                                className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                                value={Point?.FF || 0}
                                onChange={(e) => {
                                  handleChangePoints('FF', e.target.value);
                                }}
                                placeholder="ادخل النقاط"
                                type="number"
                                step="any"
                              />
                            </td>
                            <td
                              className="border border-gray-300 px-4 py-2 "
                              key={index}
                            >
                              <input
                                className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                                value={letter2?.FF || 0}
                                onChange={(e) => {
                                  handleChangeLetters('FF', e.target.value);
                                }}
                                placeholder="ادخل الدرجة"
                                type="number"
                              />
                            </td>
                            <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                              FF
                            </td>
                          </tr>
                        </>
                      ) : (
                        <>
                          <tr>
                            <td
                              className="border border-gray-300 px-4 py-2"
                              key={point.id}
                            >
                              {point.AA || ''}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {letter?.AA}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                              AA
                            </td>
                          </tr>
                          <tr>
                            <td
                              className="border border-gray-300 px-4 py-2"
                              key={point.id}
                            >
                              {point.BA || ''}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {letter?.BA}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                              BA
                            </td>
                          </tr>
                          <tr>
                            <td
                              className="border border-gray-300 px-4 py-2"
                              key={point.id}
                            >
                              {point.BB || ''}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {letter?.BB}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                              BB
                            </td>
                          </tr>
                          <tr>
                            <td
                              className="border border-gray-300 px-4 py-2"
                              key={point.id}
                            >
                              {point.CB || ''}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {letter?.CB}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                              CB
                            </td>
                          </tr>
                          <tr>
                            <td
                              className="border border-gray-300 px-4 py-2"
                              key={point.id}
                            >
                              {point.CC || ''}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {letter?.CC}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                              CC
                            </td>
                          </tr>
                          <tr>
                            <td
                              className="border border-gray-300 px-4 py-2"
                              key={point.id}
                            >
                              {point.DC || ''}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {letter?.DC}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                              DC
                            </td>
                          </tr>
                          <tr>
                            <td
                              className="border border-gray-300 px-4 py-2"
                              key={point.id}
                            >
                              {point.DD || ''}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {letter?.DD}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                              DD
                            </td>
                          </tr>
                          <tr>
                            <td
                              className="border border-gray-300 px-4 py-2"
                              key={point.id}
                            >
                              {point.FD || ''}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {letter?.FD}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                              FD
                            </td>
                          </tr>
                          <tr>
                            <td
                              className="border border-gray-300 px-4 py-2"
                              key={point.id}
                            >
                              {point.FF || 0}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {letter?.FF}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                              FF
                            </td>
                          </tr>
                        </>
                      );
                    })}
                  </table>
                </div>
              );
            }
            return null;
          })}
        </>
      )}
      {activeTab === 'Tab 2' && (
        <>
          <p className="flex text-md bg-lightBlue rounded-md p-4 w-[200px] justify-center m-5 items-center">
            تخصصات
          </p>
          <table className="w-[1000px] flex flex-col">
            <thead className="bg-darkBlue text-secondary">
              <tr className="flex flex-row w-full">
                <th className="flex flex-row w-full p-1 items-center justify-end pr-2 pl-2">
                  التخصصات
                </th>
                <th className="flex flex-row  w-1/4  p-1 items-center justify-end pr-2 pl-2">
                  الكليات
                </th>
                <th className="flex flex-row w-1/8 p-1 items-center justify-end pr-2 pl-2">
                  {' 0'}
                </th>
              </tr>
            </thead>
            <tbody>
              {majors.map((item, index) => (
                <tr key={index} className="flex flex-row w-full">
                  <td className="flex flex-row w-full p-1 items-center justify-end pr-2 pl-2">
                    <Link href={`/management/course/${item.id}`}>
                      {item.major_name}
                    </Link>
                  </td>
                  <td className="flex flex-row w-1/4 p-1 items-center justify-end pr-2 pl-2">
                    {item.tb_departments?.name}
                  </td>
                  <td className="flex flex-row w-1/8 p-1 items-center justify-end pr-2 pl-2">
                    {index + 1}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default page;
