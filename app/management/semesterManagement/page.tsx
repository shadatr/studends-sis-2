'use client';
import {
  AssignPermissionType,
  LetterGradesType,
  LettersType,
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

const Page = () => {
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
  const [grades, setGrades] = useState<LettersType[]>([]);
  const [grades2, setGrades2] = useState<LettersType[]>([]);
  const [points2, setPoints2] = useState<LettersType[]>([]);
  const [courseLetter, setCourseLetter] = useState<LetterGradesType[]>([]);
  const [perms, setPerms] = useState<GetPermissionType[]>([]);
  const [year, setYear] = useState<LettersType[]>([]);
  const [results, setResult] = useState<LettersType[]>([]);
  const [results2, setResult2] = useState<LettersType[]>([]);
  const [gpa, setGpa] = useState<LettersType[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (user) {
        const response = await axios.get(
          `/api/allPermission/admin/selectedPerms/${user?.id}`
        );
        const messagePer: GetPermissionType[] = response.data.message;
        setPerms(messagePer);
      }

      const responsePoint = await axios.get(`/api/exams/grading/1`);
      const messagePoint: LettersType[] = responsePoint.data.message;
      setPoints(messagePoint);
      setPoints2(messagePoint);

      const responseLetter = await axios.get(`/api/exams/grading/3`);
      const messageLetter: LettersType[] = responseLetter.data.message;
      setLetters(messageLetter);
      setLetters2(messageLetter);

      const responseGrade = await axios.get(`/api/exams/grading/2`);
      const messageGrade: LettersType[] = responseGrade.data.message;
      setGrades(messageGrade);
      setGrades2(messageGrade);

      const responseYear = await axios.get(`/api/exams/grading/4`);
      const messageYear: LettersType[] = responseYear.data.message;
      setYear(messageYear);

      const responseResult = await axios.get(`/api/exams/grading/5`);
      const messageResult: LettersType[] = responseResult.data.message;
      setResult2(messageResult);
      setResult(messageResult);

      const responseGPA = await axios.get(`/api/exams/grading/6`);
      const messageGPA: LettersType[] = responseGPA.data.message;
      setGpa(messageGPA);

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

      const responseActive = await axios.get('/api/allPermission/courseRegPer');
      const messageActive: AssignPermissionType[] = responseActive.data.message;
      setActive(messageActive[0].active);
    };
    fetchPosts();
  }, [active, edit, refresh, user]);

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

    const missingGrade = courseLetter.find(
      (item) => item.points == null || item.letter_grade == null
    );

    const unAprrovedCourse = courses.find((item) => !item.class.publish_grades);

    if (missingGrade) {
      toast.error('لا يمكنك نشر الدرجات، هنالك درجات لم يتم ادخالها');
      return;
    }

    if (unAprrovedCourse) {
      toast.error('لا يمكنك نشر الدرجات، هنالك درجات لم يتم الموافقة عليها');
      return;
    }

    students.forEach((student) => {
      let studentTotalGradePoints = 0;
      let studentTotalCredits = 0;

      let studentTotalGradePoints2 = 0;
      let studentTotalCredits2 = 0;

      const selectedCourses = courses.filter(
        (co) => co.courseEnrollements.student_id == student.id
      );

      selectedCourses.map((selectedCourse) => {
        const repeatedCourse = courses.filter(
          (co) =>
            co.courseEnrollements.student_id ===
            selectedCourse?.courseEnrollements.student_id
        );

        if (repeatedCourse.length > 1) {
          const repeat = repeatedCourse.find(
            (co) => co.class?.semester != `${year[0].AA}-${year[0].BA}`
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

          if (studentTotalGradePoints2 && studentTotalCredits2) {
            axios.post(`/api/transcript/transcriptUpdate`, data2).catch(() => {
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
          selectedCourse.class.semester === `${year[0].AA}-${year[0].BA}`
        ) {
          studentTotalGradePoints +=
            studentResult?.points * selectedCourse?.course.credits;
          studentTotalCredits += selectedCourse?.course.credits;
        }
      });

      const gpaFound = transcript.find(
        (item) =>
          item.semester == `${year[0].AA}-${year[0].BA}` &&
          student.id == item.student_id
      );
      if (gpaFound) {
        return;
      }
      const data2 = {
        student_id: student.id,
        semester: `${year[0].AA}-${year[0].BA}`,
        studentSemester: student.semester,
        gpa: parseFloat(
          (studentTotalGradePoints / studentTotalCredits).toFixed(2)
        ),
        credits: studentTotalCredits,
      };

      if (studentTotalGradePoints && studentTotalCredits && gpa[0].AA) {
        axios.post(`/api/transcript/${1}`, data2).catch(() => {
          allDataSent = false;
        });
        if (
          (studentTotalGradePoints / studentTotalCredits).toFixed(2) < gpa[0].AA
        ) {
          const condCourses = courses.filter(
            (co) =>
              co.courseEnrollements.can_repeat == true &&
              co.class.semester == `${year[0].AA}-${year[0].BA}` &&
              co.courseEnrollements.student_id == student.id
          );
          const updatedCondCourses = condCourses.map((co) => {
            return {
              ...co.courseEnrollements,
              pass: false,
              can_repeat: false,
            };
          });
          axios.post(
            `/api/exams/updateUnconditionalPassing/${student.id}`,
            updatedCondCourses
          );
        }
      }
    });
    if (user) {
      students.map(async (user) => {
        const responseCourseLetter = await axios.get(`/api/exams/letterGrades`);
        const messageCourseLetter: LetterGradesType[] =
          responseCourseLetter.data.message;
        setCourseLetter(messageCourseLetter);

        const responseCourse = await axios.get(
          `/api/getAll/studentCoursesGpa/${user.id}`
        );

        const messageCourse: StudenCourseGPAType[] =
          responseCourse.data.message;

        const majCredit = messageCourse.find((c) => c.student?.id == user.id);

        if (majCredit) {
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
                  item.course_enrollment_id === course.courseEnrollements.id &&
                  item.repeated == false
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

            let totalQualityPoints = 0;

            for (let i = 0; i < enrollmentsData.length; i++) {
              const gpa = enrollmentsData[i].gpa;
              const creditHours = enrollmentsData[i].credits;

              totalQualityPoints += gpa * creditHours;
            }
            const data = {
              value: parseFloat(
                (totalQualityPoints / studentTotalCredits).toFixed(2)
              ),
              name: 'final_gpa',
              student_id: user.id,
            };
            axios.post('/api/transcript/approveGraduation', data);

            if (
              graduation?.major.credits_needed &&
              studentTotalCredits >= graduation?.major.credits_needed &&
              parseFloat(gpa[0].AA) <=
                parseFloat(
                  (totalQualityPoints / studentTotalCredits).toFixed(2)
                )
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

            if (studentTotalCredits && user.id && graduationYear?.semester) {
              const data = {
                credits: studentTotalCredits,
                student_id: user.id,
                can_graduate: isGraduated,
                graduation_year: graduationYear?.semester,
              };

              axios.post('/api/transcript/editCredits', data);
            }
          }
        }
      });
    }
    if (allDataSent) {
      setRefresh(!refresh);
      toast.success('تم إرسال جميع البيانات بنجاح');
      const dataUsageHistory = {
        id: user?.id,
        type: 'admin',
        action: ' ارسال المجموع النهائي في جميع التخصصات',
      };
      axios.post('/api/usageHistory', dataUsageHistory);
    } else {
      toast.error('حدث خطأ اثناء نشر الدرجات');
    }
  };

  const handleChangePoints = (letter: string, value: string) => {
    const updatedPoints = points2.map((point) => {
      return {
        ...point,
        [letter]: value,
      };
    });
    setPoints2(updatedPoints);
  };

  const handleChangeLetters = (letter: string, value: string) => {
    const updatedLetters = letters2.map((point) => {
      return {
        ...point,
        [letter]: value,
      };
    });
    setLetters2(updatedLetters);
  };

  const handleChangeGrades = (letter: string, value: string) => {
    const updatedLetters = grades2.map((point) => {
      return {
        ...point,
        [letter]: value,
      };
    });
    setGrades2(updatedLetters);
  };

  const handleChangeYear = (letter: string, value: string) => {
    const updatedPoints = year.map((point) => {
      return {
        ...point,
        [letter]: value,
      };
    });
    setYear(updatedPoints);
  };

  const handleChangeResults = (letter: string, value: string) => {
    const updatedPoints = results2.map((point) => {
      return {
        ...point,
        [letter]: value,
      };
    });
    setResult2(updatedPoints);
  };

  const handleChangeGPA = (letter: string, value: string) => {
    const updatedPoints = gpa.map((point) => {
      return {
        ...point,
        [letter]: value,
      };
    });
    setGpa(updatedPoints);
  };

  const handleSubmit2 = () => {
    setEdit(!edit);

    axios.post(`/api/exams/grading/1`, points2);
    axios.post(`/api/exams/grading/2`, grades2);
    axios.post(`/api/exams/grading/3`, letters2);
    axios.post(`/api/exams/grading/4`, year);
    axios.post(`/api/exams/grading/5`, results2);
    axios
      .post(`/api/exams/grading/6`, gpa)
      .then(() => {
        toast.success('تم التعديل بنجاح');
        const dataUsageHistory = {
          id: user?.id,
          type: 'admin',
          action: ' تعديل توزيع الدراجات',
        };
        axios.post('/api/usageHistory', dataUsageHistory);
      })
      .catch(() => {
        toast.error('حدث خطأ اثناء التعديل');
      });
  };

  return (
    <div className="absolute flex flex-col w-[80%] items-center justify-center">
      {perms.map((permItem, idx) => {
        if (permItem.permission_id === 14 && permItem.edit) {
          return (
            <div
              key={idx + 2}
              className="w-[100px] flex justify-center items-center flex-col"
            >
              <button
                onClick={() => {
                  handleActivate();
                }}
                className={`p-3 rounded-md m-2 text-white w-[200px] ${
                  active
                    ? 'bg-red-600 hover:bg-red-500'
                    : 'bg-green-600 hover:bg-green-500'
                }`}
              >
                {active ? 'اغلاق تسجيل المواد' : ' فتح تسجيل المواد '}
              </button>
            </div>
          );
        } else {
          return null;
        }
      })}
      {perms.map((permItem, idx) => {
        if (permItem.permission_id === 13 && permItem.edit) {
          return (
            <button
              key={idx}
              className="m-2 bg-blue-500 hover:bg-blue-600  text-secondary p-3 rounded-md w-[200px]"
              type="submit"
              onClick={() => (edit ? handleSubmit2() : setEdit(!edit))}
            >
              {edit ? 'ارسال' : 'تعديل'}
            </button>
          );
        } else {
          return null;
        }
      })}

      <div className="flex flex-col w-[500px] m-3">
        <div className="flex flex-row">
          {perms.map((permItem, idx) => {
            if (permItem.permission_id === 15 && permItem.edit && courses) {
              return (
                <button
                  key={idx}
                  onClick={handleSubmit}
                  className="bg-green-700 m-2 hover:bg-green-600 p-3 rounded-md text-white w-[300px]"
                >
                  ارسال المجموع النهائي في جميع التخصصات
                </button>
              );
            } else {
              return null;
            }
          })}
          {edit ? (
            <>
              <input
                dir="rtl"
                placeholder=" السنة"
                type="text"
                className="w-20 p-2 bg-gray-200 border-2 border-black rounded-md ml-4"
                onChange={(e) => handleChangeYear('BA', e.target.value)}
                value={year[0].BA}
              />
              <select
                id="dep"
                dir="rtl"
                onChange={(e) => handleChangeYear('AA', e.target.value)}
                className="px-4 py-2 bg-gray-200 border-2 border-black rounded-md ml-4"
                defaultValue={year[0].AA}
              >
                <option disabled>الفصل</option>
                <option>خريف</option>
                <option>ربيع</option>
              </select>
            </>
          ) : (
            <>
              {year && year.length > 0 ? (
                <>
                  <h1 className="w-20 p-2 bg-gray-200 border-2 border-black rounded-md ml-4 flex justify-center items-center">
                    {year[0].BA ? year[0].BA : ''}
                  </h1>
                  <h1 className="w-20 p-2 bg-gray-200 border-2 border-black rounded-md ml-4 flex justify-center items-center">
                    {year[0].AA ? year[0].AA : ''}
                  </h1>
                </>
              ) : (
                ''
              )}
            </>
          )}
        </div>
      </div>
      {gpa && gpa.length > 0 ? (
        edit ? (
          <div className="w-[500px] flex flex-row m-3">
            <input
              className="w-20 p-2 bg-gray-200 border-2 border-black rounded-md ml-4"
              value={gpa[0].AA || ''}
              onChange={(e) => {
                handleChangeGPA('AA', e.target.value);
              }}
              placeholder="ادخل الدرجة"
              type="text"
            />
            <h1 className="w-[200px] p-2 bg-gray-200 rounded-md ml-4">
              المجموع المطلوب لنجاح المشروط
            </h1>
          </div>
        ) : (
          <div className="w-[500px] flex flex-row m-3">
            <h1 className="w-20 p-2 bg-gray-200 border-2 border-black rounded-md ml-4">
              {gpa[0].AA}
            </h1>
            <h1 className="w-[200px] p-2 bg-gray-200 rounded-md ml-4 flex fex-end">
              :المجموع المطلوب لنجاح المشروط
            </h1>
          </div>
        )
      ) : (
        ''
      )}

      {perms.map((permItem, idx) => {
        if (permItem.permission_id === 13 && permItem.see) {
          return (
            <table className="w-[300px] h-[600px]" key={idx}>
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
                  <th className="border border-gray-300 px-4 py-2 max-w-[120px] bg-grey">
                    نجاح/رسوب
                  </th>
                </tr>
              </thead>
              {points.length > 0 &&
                points.map((point, index) => {
                  const grade = grades.find((l) => l);
                  const grade2 = grades2.find((l) => l);
                  const Point2 = points2.find((p) => p);
                  const letter = letters.find((p) => p);
                  const letter2 = letters2.find((p) => p);
                  const result = results.find((p) => p);
                  const result2 = results2.find((p) => p);
                  return edit ? (
                    <tbody key={index + 3}>
                      <tr>
                        <td
                          className="border border-gray-300 px-4 py-2 "
                          key={point.id}
                        >
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={Point2?.AA || 0}
                            onChange={(e) => {
                              handleChangePoints('AA', e.target.value);
                            }}
                            placeholder="ادخل النقاط"
                            type="number"
                            step="any"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={grade2?.AA || 0}
                            onChange={(e) => {
                              handleChangeGrades('AA', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="number"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={letter2?.AA || ''}
                            onChange={(e) => {
                              handleChangeLetters('AA', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="text"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <select
                            id="dep"
                            dir="rtl"
                            onChange={(e) =>
                              handleChangeResults('AA', e.target.value)
                            }
                            className="text-right px-4 py-2 bg-lightBlue w-[100px]"
                            defaultValue={result2?.AA}
                          >
                            <option>نجاح</option>
                            <option>رسوب</option>
                            <option>نجاح مشروط</option>
                          </select>
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="border border-gray-300 px-4 py-2 "
                          key={point.id}
                        >
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={Point2?.BA || 0}
                            onChange={(e) => {
                              handleChangePoints('BA', e.target.value);
                            }}
                            placeholder="ادخل النقاط"
                            type="number"
                            step="any"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={grade2?.BA || 0}
                            onChange={(e) => {
                              handleChangeGrades('BA', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="number"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={letter2?.BA || ''}
                            onChange={(e) => {
                              handleChangeLetters('BA', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="text"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <select
                            id="dep"
                            dir="rtl"
                            onChange={(e) =>
                              handleChangeResults('BA', e.target.value)
                            }
                            className="text-right px-4 py-2 bg-lightBlue w-[100px]"
                            defaultValue={result2?.BA}
                          >
                            <option>نجاح</option>
                            <option>رسوب</option>
                            <option>نجاح مشروط</option>
                          </select>
                        </td>
                      </tr>

                      <tr>
                        <td
                          className="border border-gray-300 px-4 py-2 "
                          key={point.id}
                        >
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={Point2?.BB || 0}
                            onChange={(e) => {
                              handleChangePoints('BB', e.target.value);
                            }}
                            placeholder="ادخل النقاط"
                            type="number"
                            step="any"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={grade2?.BB || 0}
                            onChange={(e) => {
                              handleChangeGrades('BB', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="number"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={letter2?.BB || ''}
                            onChange={(e) => {
                              handleChangeLetters('BB', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="text"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <select
                            id="dep"
                            dir="rtl"
                            onChange={(e) =>
                              handleChangeResults('BB', e.target.value)
                            }
                            className="text-right px-4 py-2 bg-lightBlue w-[100px]"
                            defaultValue={result2?.BB}
                          >
                            <option>نجاح</option>
                            <option>رسوب</option>
                            <option>نجاح مشروط</option>
                          </select>
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="border border-gray-300 px-4 py-2 "
                          key={point.id}
                        >
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={Point2?.CB || 0}
                            onChange={(e) => {
                              handleChangePoints('CB', e.target.value);
                            }}
                            placeholder="ادخل النقاط"
                            type="number"
                            step="any"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={grade2?.CB || 0}
                            onChange={(e) => {
                              handleChangeGrades('CB', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="number"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={letter2?.CB || ''}
                            onChange={(e) => {
                              handleChangeLetters('CB', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="text"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <select
                            id="dep"
                            dir="rtl"
                            onChange={(e) =>
                              handleChangeResults('CB', e.target.value)
                            }
                            className="text-right px-4 py-2 bg-lightBlue w-[100px]"
                            defaultValue={result2?.CB}
                          >
                            <option>نجاح</option>
                            <option>رسوب</option>
                            <option>نجاح مشروط</option>
                          </select>
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="border border-gray-300 px-4 py-2 "
                          key={point.id}
                        >
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={Point2?.CC || 0}
                            onChange={(e) => {
                              handleChangePoints('CC', e.target.value);
                            }}
                            placeholder="ادخل النقاط"
                            type="number"
                            step="any"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={grade2?.CC || 0}
                            onChange={(e) => {
                              handleChangeGrades('CC', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="number"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={letter2?.CC || ''}
                            onChange={(e) => {
                              handleChangeLetters('CC', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="text"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <select
                            id="dep"
                            dir="rtl"
                            onChange={(e) =>
                              handleChangeResults('CC', e.target.value)
                            }
                            className="text-right px-4 py-2 bg-lightBlue w-[100px]"
                            defaultValue={result2?.CC}
                          >
                            <option>نجاح</option>
                            <option>رسوب</option>
                            <option>نجاح مشروط</option>
                          </select>
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="border border-gray-300 px-4 py-2 "
                          key={point.id}
                        >
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={Point2?.DC || 0}
                            onChange={(e) => {
                              handleChangePoints('DC', e.target.value);
                            }}
                            placeholder="ادخل النقاط"
                            type="number"
                            step="any"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={grade2?.DC || 0}
                            onChange={(e) => {
                              handleChangeGrades('DC', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="number"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={letter2?.DC || ''}
                            onChange={(e) => {
                              handleChangeLetters('DC', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="text"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <select
                            id="dep"
                            dir="rtl"
                            onChange={(e) =>
                              handleChangeResults('DC', e.target.value)
                            }
                            className="text-right px-4 py-2 bg-lightBlue w-[100px]"
                            defaultValue={result2?.DC}
                          >
                            <option>نجاح</option>
                            <option>رسوب</option>
                            <option>نجاح مشروط</option>
                          </select>
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="border border-gray-300 px-4 py-2 "
                          key={point.id}
                        >
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={Point2?.DD || 0}
                            onChange={(e) => {
                              handleChangePoints('DD', e.target.value);
                            }}
                            placeholder="ادخل النقاط"
                            type="number"
                            step="any"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={grade2?.DD || 0}
                            onChange={(e) => {
                              handleChangeGrades('DD', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="number"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={letter2?.DD || ''}
                            onChange={(e) => {
                              handleChangeLetters('DD', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="text"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <select
                            id="dep"
                            dir="rtl"
                            onChange={(e) =>
                              handleChangeResults('DD', e.target.value)
                            }
                            className="text-right px-4 py-2 bg-lightBlue w-[100px]"
                            defaultValue={result2?.DD}
                          >
                            <option>نجاح</option>
                            <option>رسوب</option>
                            <option>نجاح مشروط</option>
                          </select>
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="border border-gray-300 px-4 py-2 "
                          key={point.id}
                        >
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={Point2?.FD || 0}
                            onChange={(e) => {
                              handleChangePoints('FD', e.target.value);
                            }}
                            placeholder="ادخل النقاط"
                            type="number"
                            step="any"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={grade2?.FD || 0}
                            onChange={(e) => {
                              handleChangeGrades('FD', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="number"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={letter2?.FD || ''}
                            onChange={(e) => {
                              handleChangeLetters('FD', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="text"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <select
                            id="dep"
                            dir="rtl"
                            onChange={(e) =>
                              handleChangeResults('FD', e.target.value)
                            }
                            className="text-right px-4 py-2 bg-lightBlue w-[100px]"
                            defaultValue={result2?.FD}
                          >
                            <option>نجاح</option>
                            <option>رسوب</option>
                            <option>نجاح مشروط</option>
                          </select>
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="border border-gray-300 px-4 py-2 "
                          key={point.id}
                        >
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={Point2?.FF || 0}
                            onChange={(e) => {
                              handleChangePoints('FF', e.target.value);
                            }}
                            placeholder="ادخل النقاط"
                            type="number"
                            step="any"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={grade2?.FF || 0}
                            onChange={(e) => {
                              handleChangeGrades('FF', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="number"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <input
                            className="text-right px-4 py-2 bg-lightBlue w-[70px]"
                            value={letter2?.FF || ''}
                            onChange={(e) => {
                              handleChangeLetters('FF', e.target.value);
                            }}
                            placeholder="ادخل الدرجة"
                            type="text"
                          />
                        </td>
                        <td className="border border-gray-300 px-4 py-2 ">
                          <select
                            id="dep"
                            dir="rtl"
                            onChange={(e) =>
                              handleChangeResults('FF', e.target.value)
                            }
                            className="text-right px-4 py-2 bg-lightBlue w-[100px]"
                            defaultValue={result2?.FF}
                          >
                            <option>نجاح</option>
                            <option>رسوب</option>
                            <option>نجاح مشروط</option>
                          </select>
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          {point.AA || ''}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {grade?.AA}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {letter?.AA}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {result?.AA}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          {point.BA || ''}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {grade?.BA}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {letter?.BA}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {result?.BA}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          {point.BB || ''}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {grade?.BB}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {letter?.BB}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {result?.BB}
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
                          {grade?.CB}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {letter?.CB}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {result?.CB}
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
                          {grade?.CC}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {letter?.CC}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px] ">
                          {result?.CC}
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
                          {grade?.DC}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {letter?.DC}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {result?.DC}
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
                          {grade?.DD}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {letter?.DD}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {result?.DD}
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
                          {grade?.FD}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {letter?.FD}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {result?.FD}
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
                          {grade?.FF}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {letter?.FF}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 max-w-[120px]">
                          {result?.FF}
                        </td>
                      </tr>
                    </tbody>
                  );
                })}
            </table>
          );
        } else {
          return null;
        }
      })}
    </div>
  );
};

export default Page;
