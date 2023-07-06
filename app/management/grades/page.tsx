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
  StudenCourseGPAType,
  MajorCourseType,
} from '@/app/types/types';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { redirect } from 'next/navigation';


const page = () => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }

  const user = session.data?.user;

  const [edit, setEdit] = useState(false);
  const [active, setActive] = useState<boolean>();
  const [courses, setCourses] = useState<StudenCourseType[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [students, setStudents] = useState<PersonalInfoType[]>([]);
  const [transcript, setTranscript] = useState<TranscriptType[]>([]);
  const [letters, setLetters] = useState<LettersType[]>([]);
  const [points, setPoints] = useState<LettersType[]>([]);
  const [letters2, setLetters2] = useState<LettersType[]>([]);
  const [points2, setPoints2] = useState<LettersType[]>([]);
  const [courseLetter, setCourseLetter] = useState<LetterGradesType[]>([]);
  const [perms, setPerms] = useState<GetPermissionType[]>([]);
  const [loadCourses, setLoadCourse] = useState(false);

  const [year, setYear] = useState<string>();
  const [semester, setSemester] = useState<string>();

  useEffect(() => {
    const fetchPosts = async () => {


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
          `/api/getAll/studentCoursesGpa/${student.id}`
        );
        const { message: courseMessage }: { message: StudenCourseType[] } =
          responseReq.data;
        return courseMessage;
      });

      const courseData = await Promise.all(coursesPromises);
      const courses = courseData.flat();
      setCourses(courses);
      console.log(courses);

      const responseActive = await axios.get('/api/allPermission/courseRegPer');
      const messageActive: AssignPermissionType[] = responseActive.data.message;
      setActive(messageActive[0].active);
    };
    fetchPosts();
  }, [active, edit, refresh, user, loadCourses]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          students.map(async (user) => {
            const responseCourseLetter = await axios.get(
              `/api/exams/letterGrades`
            );
            const messageCourseLetter: LetterGradesType[] =
              responseCourseLetter.data.message;
            setCourseLetter(messageCourseLetter);

            const responseCourse = await axios.get(
              `/api/getAll/studentCoursesGpa/${user.id}`
            );

            const messageCourse: StudenCourseGPAType[] =
              responseCourse.data.message;

            const majCredit = messageCourse.find(
              (c) => c.student?.id == user.id
            );

            const messageMajCourse = await axios.get(
              `/api/course/courseMajorReg/${majCredit?.major?.id}`
            );
            const responseCourseMaj: MajorCourseType[] =
              messageMajCourse.data.message;

            const responseTranscript = await axios.get(
              `/api/transcript/${user.id}`
            );
            const messageTranscript: TranscriptType[] =
              responseTranscript.data.message;
            setTranscript(messageTranscript);

            if (messageTranscript && messageCourseLetter && messageCourse) {
              const enrollmentsData = messageTranscript.filter(
                (item) => item.student_id == user.id
              );
              const maxId = enrollmentsData.reduce(
                (max, { id }) => Math.max(max, id),
                0
              );

              let studentTotalCredits = 0;
              messageCourseLetter.map((item) => {
                const selectedCourse = messageCourse.find(
                  (course) =>
                    item.course_enrollment_id ===
                      course.courseEnrollements.id && item.repeated == false
                );
                if (selectedCourse?.course.credits) {
                  studentTotalCredits += selectedCourse?.course.credits;
                }
              });

              const graduationYear = messageTranscript?.find(
                (item) => item.id == maxId
              );

              const graduation = messageCourse.find((item) => item.major?.id);

              let isGraduated = false;

              if (
                graduation?.major.credits_needed &&
                studentTotalCredits >= graduation?.major.credits_needed
              ) {
                isGraduated = true;
              }

              responseCourseMaj.map((majCo) => {
                const selecetedCourse = messageCourse.find(
                  (c) =>
                    c.course.id == majCo.course_id && c.courseEnrollements.pass
                );
                if (selecetedCourse == undefined && majCo.isOptional == false) {
                  isGraduated = false;
                }
              });

              if (studentTotalCredits && user.id&&graduationYear?.semester){
                const data = {
                  credits: studentTotalCredits,
                  student_id: user.id,
                  graduation: isGraduated,
                  graduation_year: graduationYear?.semester,
                };
                console.log(data);

              axios.post('/api/transcript/editCredits', data);}
            }
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [user]);

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

    students.forEach((student)=> {
      let studentTotalGradePoints = 0;
      let studentTotalCredits = 0;

      let studentTotalGradePoints2 = 0;
      let studentTotalCredits2 = 0;

      const selectedCourses = courses.filter(
        (co) =>
          co.courseEnrollements.student_id == student.id 
      );

      console.log(selectedCourses);
      console.log(courses);
      console.log(student);

      selectedCourses.map((selectedCourse) => {
        const repeatedCourse = courses.filter(
          (co) =>
            co.courseEnrollements.student_id ===
            selectedCourse?.courseEnrollements.student_id
        );

        if (repeatedCourse.length > 1) {
          const repeat = repeatedCourse.find(
            (co) => co.class.semester != `${semester}-${year}`
          );

          const studentResult = courseLetter.find(
            (item) =>
              item.course_enrollment_id ===
              selectedCourse?.courseEnrollements.id
          );

          if (
            selectedCourse?.course.credits &&
            studentResult?.points &&
            selectedCourse.class.semester === repeat?.class.semester &&
            selectedCourse?.course.id != repeat?.course.id
          ) {
            studentTotalGradePoints2 +=
              studentResult?.points * selectedCourse?.course.credits;
            studentTotalCredits2 += selectedCourse?.course.credits;
          }

          const data2 = {
            student_id: student.id,
            course_enrollment_id: repeat?.courseEnrollements.id,
            semester: repeat?.class.semester,
            gpa: parseFloat(
              (studentTotalGradePoints2 / studentTotalCredits2).toFixed(2)
            ),
          };

          console.log(data2);

          if (studentTotalGradePoints && studentTotalCredits) {
            axios
              .post(`/api/transcript/transcriptUpdate`, data2)
              .catch((error) => {
                allDataSent = false;
              });
          }
        }

        const studentResult = courseLetter.find(
          (item) =>
            item.course_enrollment_id === selectedCourse?.courseEnrollements.id
        );

        if (
          selectedCourse?.course.credits &&
          studentResult?.points &&
          selectedCourse.class.semester === `${semester}-${year}`
        ) {
          studentTotalGradePoints +=
            studentResult?.points * selectedCourse?.course.credits;
          studentTotalCredits += selectedCourse?.course.credits;
        }
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
        toast.error('حدث خطأ اثناء التعديل');
      });
  };


  return (
    <div className="absolute flex flex-col w-[80%] items-center justify-center">
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
                      onClick={() => (edit ? handleSubmit2() : setEdit(!edit))}
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
                      <tbody key={index}>
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
                      </tbody>
                    ) : (
                      <tbody>
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
                      </tbody>
                    );
                  })}
                </table>
              </div>
            );
          }
          return null;
        })}
      </>
    </div>
  );
};

export default page;
