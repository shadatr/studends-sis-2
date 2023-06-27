/* eslint-disable react-hooks/rules-of-hooks */
'use client';
import {
  AddCourse2Type,
  AssignPermissionType,
  ClassesType,
  LetterGradesType,
  LettersType,
  MajorRegType,
  PersonalInfoType,
  SectionType,
  StudentClassType,
  TranscriptType,
} from '@/app/types/types';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { redirect } from 'next/navigation';

const page = () => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }

  const [edit, setEdit] = useState(false);
  const [majors, setMajors] = useState<MajorRegType[]>([]);
  const [active, setActive] = useState<boolean>();
  const [courses, setCourses] = useState<AddCourse2Type[]>([]);
  const [sections, setSections] = useState<SectionType[]>([]);
  const [classes, setClasses] = useState<ClassesType[]>([]);
  const [courseEnrollments, setCourseEnrollments] = useState<
    StudentClassType[]
  >([]);
  const [refresh, setRefresh] = useState(false);
  const [students, setStudents] = useState<PersonalInfoType[]>([]);
  const [transcript, setTranscript] = useState<TranscriptType[]>([]);
  const [letters, setLetters] = useState<LettersType[]>([]);
  const [points, setPoints] = useState<LettersType[]>([]);
    const [letters2, setLetters2] = useState<LettersType[]>([]);
    const [points2, setPoints2] = useState<LettersType[]>([]);
  const [courseLetter, setCourseLetter] = useState<LetterGradesType[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
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

      const resp = await axios.get('/api/major/majorReg');
      const message: MajorRegType[] = resp.data.message;
      setMajors(message);

      const studentsPromises = message.map(async (Class) => {
        const responseReq = axios.get(`/api/list/${Class.id}/student`);
        const { message: messagestudents }: { message: PersonalInfoType[] } = (
          await responseReq
        ).data;
        return messagestudents;
      });
      const studentData = await Promise.all(studentsPromises);
      const students = studentData.flat();
      setStudents(students);

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

      const courseEnrollPromises = students.map(async (Class) => {
        const responseReq = await axios.get(
          `/api/getAll/getAllCourseEnroll/${Class.id}`
        );
        const {
          message: courseEnrollMessage,
        }: { message: StudentClassType[] } = responseReq.data;
        return courseEnrollMessage;
      });

      const ccourseEnrollData = await Promise.all(courseEnrollPromises);
      const courseEnrollments = ccourseEnrollData.flat();
      setCourseEnrollments(courseEnrollments);

      const classPromises = courseEnrollments.map(async (Class) => {
        const responseReq = await axios.get(
          `/api/getAll/getSpecificClass/${Class.class_id}`
        );
        const { message: classMessage }: { message: ClassesType[] } =
          responseReq.data;
        return classMessage;
      });

      const classData = await Promise.all(classPromises);
      const classes = classData.flat();
      setClasses(classes);

      const sectionsPromises = classes.map(async (course) => {
        const responseReq = await axios.get(
          `/api/getAll/getSpecificSection/${course.section_id}`
        );
        const { message: secMessage }: { message: SectionType[] } =
          responseReq.data;
        return secMessage;
      });

      const sectionData = await Promise.all(sectionsPromises);
      const sections = sectionData.flat();
      setSections(sections);

      const coursesPromises = sections.map(async (section) => {
        const responseReq = await axios.get(
          `/api/getAll/getSpecificCourse/${section.course_id}`
        );
        const { message: courseMessage }: { message: AddCourse2Type[] } =
          responseReq.data;
        return courseMessage;
      });

      const courseData = await Promise.all(coursesPromises);
      const courses = courseData.flat();
      setCourses(courses);

      const responseActive = await axios.get('/api/allPermission/courseRegPer');
      const messageActive: AssignPermissionType[] = responseActive.data.message;
      setActive(messageActive[0].active);
      console.log(messageActive);
    };
    fetchPosts();
  }, [active,edit,refresh]);

  const handleActivate = () => {
    setActive(!active);
    const data = { active: !active };
    axios.post('/api/allPermission/student/courseRegActive', data);

    axios.post('/api/allPermission/courseRegPer', data).then((res) => {
      console.log(data);
      toast.success(res.data.message);
    });
  };

  const handleSubmit = () => {
    let allDataSent = true;

    students.forEach((student) => {
      let studentTotalGradePoints = 0;
      let studentTotalCredits = 0;

      const studenCourseEnrolls = courseEnrollments.filter(
        (Class) =>
          student.id === Class.student_id && student.semester == Class.semester
      );

      studenCourseEnrolls?.map((course: StudentClassType) => {
        const studenClass = classes.find(
          (Class) => Class.id == course.class_id
        );

        const studentSection = sections.find(
          (sec) => sec.id == studenClass?.section_id
        );

        const studentCourse = courses.find(
          (course) => course.id == studentSection?.course_id
        );

        const studentResult= courseLetter.find((item)=> item.course_enrollment_id==studentCourse?.id);

        if (studentCourse?.credits&&studentResult?.points ) {
          studentTotalGradePoints += studentResult?.points * studentCourse?.credits;
          studentTotalCredits += studentCourse?.credits;
        }
      });

      let duplicateFound = false;

      transcript.forEach((item) => {
        if (
          item.student_id === student.id &&
          item.semester === student.semester
        ) {
          duplicateFound = true;
          return;
        }
      });

      if (duplicateFound) {
        allDataSent = false; // Set the flag to false if a duplicate is found
        return;
      }

      const data = {
        student_id: student.id,
        semester: student.semester,
        gpa: parseFloat(
          (studentTotalGradePoints / studentTotalCredits).toFixed(2)
        ),
      };

      if (studentTotalGradePoints && studentTotalCredits) {
        axios.post(`/api/transcript/${1}`, data).catch((error) => {
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


  const handleChangePoints = (
    letter: string,
    value: string
  ) => {
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
        [letter]:parseFloat(value),
      };
    });
    setLetters2(updatedLetters);
  };

  const handleSubmit2 = () => {
    setEdit(!edit);

    console.log(letters2);

    axios
      .post(`/api/exams/grading/1`, points2);
       axios.post(`/api/exams/grading/2`, letters2)
      .then(() => {
        toast.success('تم التعديل بنجاح');
      })
      .catch((error) => {
        console.error(error);
        toast.error('حدث خطأ اثناء التعديل');
      });
  };


  return (
    <div className="absolute flex flex-col w-[80%] items-center justify-center">
      <button
        className="m-5  bg-blue-500 hover:bg-blue-600  text-secondary p-3 rounded-md w-[200px]"
        type="submit"
        onClick={() => (edit ? handleSubmit2() : setEdit(!edit))}
      >
        {edit ? 'ارسال' : 'تعديل'}
      </button>
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
                <td className="border border-gray-300 px-4 py-2 " key={index}>
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
                <td className="border border-gray-300 px-4 py-2 " key={index}>
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
                <td className="border border-gray-300 px-4 py-2 " key={index}>
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
                <td className="border border-gray-300 px-4 py-2 " key={index}>
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
                <td className="border border-gray-300 px-4 py-2 " key={index}>
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
                <td className="border border-gray-300 px-4 py-2 " key={index}>
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
                <td className="border border-gray-300 px-4 py-2 " key={index}>
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
                <td className="border border-gray-300 px-4 py-2 " key={index}>
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
                <td className="border border-gray-300 px-4 py-2 " key={index}>
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
                <td className="border border-gray-300 px-4 py-2" key={point.id}>
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
                <td className="border border-gray-300 px-4 py-2" key={point.id}>
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
                <td className="border border-gray-300 px-4 py-2" key={point.id}>
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
                <td className="border border-gray-300 px-4 py-2" key={point.id}>
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
                <td className="border border-gray-300 px-4 py-2" key={point.id}>
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
                <td className="border border-gray-300 px-4 py-2" key={point.id}>
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
                <td className="border border-gray-300 px-4 py-2" key={point.id}>
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
                <td className="border border-gray-300 px-4 py-2" key={point.id}>
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
                <td className="border border-gray-300 px-4 py-2" key={point.id}>
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

      <div>
        <button
          onClick={handleSubmit}
          className="bg-green-700 m-2 hover:bg-green-600 px-5 py-2 rounded-md text-white text-sm"
        >
          ارسال المجموع النهائي في جميع التخصصات
        </button>
        <button
          onClick={() => {
            handleActivate();
          }}
          className={`px-5 py-2 rounded-md text-white text-sm ${
            active
              ? 'bg-red-600 hover:bg-red-500'
              : 'bg-green-600 hover:bg-green-500'
          }`}
        >
          {active ? 'اغلاق تسجيل المواد' : ' فتح تسجيل المواد '}
        </button>
      </div>

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
    </div>
  );
};

export default page;
