'use client';
import { AddCourse2Type, ClassesType, MajorType, PersonalInfoType, SectionType, StudentClassType, TranscriptType } from '@/app/types/types';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';


const Page = () => {

  const session = useSession({ required: true });

  const user = session.data?.user;

  const [majors, setMajors] = useState<MajorType[]>([]);
  const [courses, setCourses] = useState<AddCourse2Type[]>([]);
  const [sections, setSections] = useState<SectionType[]>([]);
  const [classes, setClasses] = useState<ClassesType[]>([]);
  const [courseEnrollments, setCourseEnrollments] = useState<StudentClassType[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [students, setStudents] = useState<PersonalInfoType[]>([]);
  const [transcript, setTranscript] = useState<TranscriptType[]>([]);


  useEffect(() => {
    const fetchPosts = async () => {
      if (user){
        const response = await axios.get(
          `/api/major/getMajors/${user?.head_of_deparment_id}`
        );
        const message: MajorType[] = response.data.message;
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
          const { message: messageTranscript }: { message: TranscriptType[] } =
            (await responseReq).data;
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
        
      }
    };
    fetchPosts();
  }, [refresh,user]);


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
        let grade= 0;
        const studenClass = classes.find(
          (Class) => Class.id == course.class_id
        );

        const studentSection = sections.find(
          (sec) => sec.id == studenClass?.section_id
        );

        const studentCourse = courses.find(
          (course) => course.id == studentSection?.course_id
        );


        if (studentCourse?.credits && course.result) {
          if (course.result >= 90) grade = 4.0;
          else if (course.result >= 80){ grade = 3.0;}
          else if (course.result >= 70) {grade = 2.0;}
          else if (course.result >= 60){ grade = 1.0;}
          else if (course.result < 60) {grade = 0.0;}

          console.log(course);
          console.log(grade);

          studentTotalGradePoints +=
            grade * studentCourse?.credits;
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
        console.log(data);
      }
    });

    if (allDataSent) {
      setRefresh(!refresh);
      toast.success('تم إرسال جميع البيانات بنجاح');
    }else{toast.error(' تم ارسال المجموع النهائي بالفعل من قبل');}
  };



  return (
    <div className="flex absolute items-center justify-center w-[80%] mt-10">
      {user?.head_of_deparment_id ? (
        <div>
          <button
            onClick={handleSubmit}
            className="bg-green-700 m-4 hover:bg-green-600 px-5 py-2 rounded-md text-white"
          >
            ارسال المجموع النهائي في جميع التخصصات
          </button>
          <table className="w-[800px]">
            <thead>
              <tr>
                <th className="p-2 bg-darkBlue text-secondary">اسم التخصص</th>
              </tr>
            </thead>
            <tbody>
              {majors.map((major, index) => (
                <tr key={index}>
                  <td className=" bg-grey  flex justify-between p-2">
                    <>
                      <Link
                        className="bg-blue-700  hover:bg-blue-600 px-5 py-2 rounded-md text-white"
                        href={`/doctor/headOfDepartmentWork/major/${major.id}`}
                      >
                        المواد
                      </Link>
                      <Link
                        className="bg-blue-700  hover:bg-blue-600 px-5 py-2 rounded-md text-white"
                        href={`/doctor/headOfDepartmentWork/majorStudents/${major.id}`}
                      >
                        الطلاب
                      </Link>
                    </>
                    <>{major.major_name}</>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-sm bg-grey text-red-600 p-3 w-[500px] flex items-center justify-center">
          لست عميد لاي كلية
        </div>
      )}
    </div>
  );
};

export default Page;
