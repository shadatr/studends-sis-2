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
  const [courseLetter, setCourseLetter] = useState<LetterGradesType[]>([]);
  const [perms, setPerms] = useState<GetPermissionType[]>([]);
  const [year, setYear] = useState<LettersType[]>([]);
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

      const responseYear = await axios.get(`/api/exams/grading/4`);
      const messageYear: LettersType[] = responseYear.data.message;
      setYear(messageYear);

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

  const handleSubmit3 = () => {

      students.map(async (student) => {
        let totalQualityPoints = 0;
        let studentTotalCredits = 0;

        const responseCourseLetter = await axios.get(`/api/exams/letterGrades`);
        const messageCourseLetter: LetterGradesType[] =
          responseCourseLetter.data.message;
        setCourseLetter(messageCourseLetter);

        const responseCourse = await axios.get(
          `/api/getAll/studentCoursesGpa/${student.id}`
        );

        const messageCourse: StudenCourseGPAType[] =
          responseCourse.data.message;

          console.log(messageCourse);

        const majCredit = messageCourse.find(
          (c) => c.student?.id == student.id
        );

        if (majCredit) {
          const messageMajCourse = await axios.get(
            `/api/course/courseMajorReg/${majCredit?.major?.id}/${majCredit?.student?.department_id}`
          );
          const responseCourseMaj: MajorCourseType[] =
            messageMajCourse.data.message;

          const responseTranscript = await axios.get(
            `/api/transcript/${student.id}`
          );
          const messageTranscript: TranscriptType[] =
            responseTranscript.data.message;

          if (messageTranscript && messageCourseLetter && messageCourse) {
            const enrollmentsData = messageTranscript.filter(
              (item) => item.student_id == student.id
            );
            const maxId = enrollmentsData.reduce(
              (max, { id }) => Math.max(max, id),
              0
            );

            const graduationYear = messageTranscript?.find(
              (item) => item.id == maxId
            );

            const graduation = messageCourse.find((item) => item.major?.id);

            let isGraduated = false;

            const selectedCourses2 = courses.filter(
              (co) => co.courseEnrollements.student_id == student.id
            );

            const selectedmessageCourseLetter = messageCourseLetter.filter(
              (i) =>
                selectedCourses2.find(
                  (i2) => i.course_enrollment_id === i2.courseEnrollements.id
                )
            );

            selectedmessageCourseLetter.forEach((i) => {
              const selectedCourse = messageCourse.find(
                (course) =>
                  i.course_enrollment_id === course.courseEnrollements.id
              );

              if (
                selectedCourse &&
                selectedCourse.course.credits &&
                i.points != null &&
                !i.repeated
              ) {
                studentTotalCredits += selectedCourse?.course.credits;
                totalQualityPoints += i.points * selectedCourse?.course.credits;
              }
            });


            if (
              graduation?.major.credits_needed &&
              graduation?.department.credits_needed &&
              studentTotalCredits >=
                graduation?.major.credits_needed +
                  graduation?.department.credits_needed &&
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

            if (studentTotalCredits && student.id && graduationYear?.semester) {
              const data = {
                credits: studentTotalCredits,
                student_id: student.id,
                can_graduate: isGraduated,
                graduation_year: graduationYear?.semester,
              };

              axios.post('/api/transcript/editCredits', data);
            }

            const data = {
              value: parseFloat(
                (totalQualityPoints / studentTotalCredits).toFixed(2)
              ),
              name: 'final_gpa',
              student_id: student.id,
            };

            axios.post('/api/transcript/approveGraduation', data);

          }
        }
      });

  };
  const handleSubmit = () => {
    handleSubmit3();
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

      const repCour: StudenCourseType[] = []; // Initialize an empty array to store repeated courses

      selectedCourses.forEach((selectedCourse) => {
        const repeatedCourse = selectedCourses.filter(
          (co) => co.course.id === selectedCourse.course.id
        );

        if (repeatedCourse.length > 1) {
          repCour.push(...repeatedCourse); // Use spread operator to add repeated courses to the array
        }
      });

      repCour.forEach((repeat) => {
        if (
          repeat.class?.semester != `${year[0].AA}-${year[0].BA}` &&
          !courseLetter.some(
            (item) =>
              item.repeated &&
              item.course_enrollment_id === repeat.courseEnrollements.id
          )
        ) {
          selectedCourses.forEach((item) => {
            if (
              item.course.credits &&
              item.class.semester === repeat.class.semester &&
              item.course.id !== repeat.course.id
            ) {
              const studentResult = courseLetter.find(
                (item2) =>
                  item2.course_enrollment_id === item.courseEnrollements.id
              );
              if (studentResult?.points != null) {
                // Check if the course is not repeated before adding it to the total
                const isNotRepeated = !repCour.some(
                  (rep) =>
                    rep.courseEnrollements.id === item.courseEnrollements.id
                );
                if (isNotRepeated) {
                  studentTotalGradePoints2 +=
                    studentResult?.points * item.course.credits;
                  studentTotalCredits2 += item.course.credits;
                }
              }
            }
          });
        }
      });

      repCour.map((repeat) => {
        if (
          repeat.class.semester != `${year[0].AA}-${year[0].BA}` &&
          !courseLetter.some(
            (item) =>
              item.repeated &&
              item.course_enrollment_id === repeat.courseEnrollements.id
          )
        ) {
          const data2 = {
            student_id: student.id,
            course_enrollment_id: repeat.courseEnrollements.id,
            semester: repeat.class.semester,
            gpa: parseFloat(
              (studentTotalGradePoints2 / studentTotalCredits2).toFixed(2)
            ),
          };
          console.log(
            parseFloat(
              (studentTotalGradePoints2 / studentTotalCredits2).toFixed(2)
            )
          );

          if (studentTotalGradePoints2 && studentTotalCredits2) {
            axios.post(`/api/transcript/transcriptUpdate`, data2).catch(() => {
              allDataSent = false;
            });
          }
        }
      });

      selectedCourses.forEach((selectedCourse) => {
        const studentResult = courseLetter.find(
          (item) =>
            item.course_enrollment_id === selectedCourse.courseEnrollements.id
        );

        if (
          selectedCourse.course.credits &&
          studentResult?.points != null &&
          selectedCourse.class.semester === `${year[0].AA}-${year[0].BA}`
        ) {
          studentTotalGradePoints +=
            studentResult?.points * selectedCourse.course.credits;
          studentTotalCredits += selectedCourse.course.credits;
        }
      });

      const gpaFound = transcript.find(
        (item) =>
          item.semester == `${year[0].AA}-${year[0].BA}` &&
          student.id == item.student_id
      );

      if (!gpaFound) {
        const data2 = {
          student_id: student.id,
          semester: `${year[0].AA}-${year[0].BA}`,
          studentSemester: student.semester,
          gpa: parseFloat(
            (studentTotalGradePoints / studentTotalCredits).toFixed(2)
          ),
          credits: studentTotalCredits,
        };

        if (studentTotalGradePoints && studentTotalCredits && gpa[0]?.AA) {
          axios.post(`/api/transcript/${1}`, data2).catch(() => {
            allDataSent = false;
          });
          if (
            (studentTotalGradePoints / studentTotalCredits).toFixed(2) <
            gpa[0].AA
          ) {
            const condCourses = courses.filter(
              (co) =>
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
      }

    });



    handleSubmit3();
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

  const handleChangeYear = (letter: string, value: string) => {
    const updatedPoints = year.map((point) => {
      return {
        ...point,
        [letter]: value,
      };
    });
    setYear(updatedPoints);
  };

  const handleSubmit2 = () => {
    setEdit(!edit);
    axios.post(`/api/exams/grading/4`, year);
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
                className={`p-3 rounded-md m-10 text-white w-[200px] ${
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

      <div className="flex flex-col w-[500px] m-3">
        <div className="flex flex-row">
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
        {perms.map((permItem, idx) => {
          if (permItem.permission_id === 15 && permItem.edit && courses) {
            return (
              <button
                key={idx}
                onClick={handleSubmit}
                className="bg-green-700 m-[20px] hover:bg-green-600 p-3 rounded-md text-white w-[300px]"
              >
                ارسال المجموع النهائي في جميع التخصصات
              </button>
            );
          } else {
            return null;
          }
        })}
      </div>
    </div>
  );
};

export default Page;
