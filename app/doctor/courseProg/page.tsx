'use client';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import {
  AddCourse2Type,
  Section2Type,
  DoctorCourse2Type,
  CourseProgramType,
  CheckedType,
} from '@/app/types/types';


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



const daysOfWeek = ['friday', 'thursday', 'wednesday', 'tuesday', 'monday'];

const Page = () => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'doctor' : false) {
    throw new Error('Unauthorized');
  }

const user = session.data?.user;


  const [courses, setCourses] = useState<AddCourse2Type[]>([]);
  const [doctorCourses, setDoctorCourses] = useState<DoctorCourse2Type[]>([]);
  const [sections, setSections] = useState<Section2Type[]>([]);
  const [programClass, setProgramClass] = useState<CourseProgramType[]>([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        if(user){
      try {

            const response = await axios.get(
              `/api/course/courses/${user?.id}/doctor`
            );
            const message: Section2Type[] = response.data.message;
            setSections(message);
    
            const progClassPromises = message.map(async (section) => {
              const responseReq = await axios.get(
                `/api/courseProgram/${section.class_id}`
              );
              const { message: courseMessage }: { message: CourseProgramType[] } =
                responseReq.data;
              return courseMessage;
            });
    
            const progClassData = await Promise.all(progClassPromises);
            const programClass = progClassData.flat();
            setProgramClass(programClass);
    
            console.log(programClass);
    
            const coursesPromises = message.map(async (section) => {
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
          } catch (error) {
            console.error('Error fetching data:', error);
          }
          setRefresh(!refresh);
        }
    };

    fetchData();
  }, [refresh, user]);

  useEffect(() => {
    const updatedStudentCourses: DoctorCourse2Type[] = [];

    sections.map((sec) => {
      const studentCourse = courses.find(
        (course) => course.id == sec.course_id
      );

      if (studentCourse) {
        const data = {
          course_name: studentCourse.course_name,
          section: sec,
        };
        updatedStudentCourses.push(data);
      }
    });

    setDoctorCourses(updatedStudentCourses);
  }, [courses, refresh, sections]);

 

  return (
    <div className="absolute w-[80%] flex flex-col text-sm p-10 justify-content items-center">

      <table className="w-full bg-white shadow-md rounded-md">
        <thead>
          <tr>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">الجمعة</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">الخميس</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">الاربعاء</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">الثلاثاء</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">الاثنين</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">الوقت</th>
          </tr>
        </thead>
        <tbody>
          {hoursNames.map((hour, hourIndex) => (
            <tr key={hourIndex}>
              {daysOfWeek.map((day) => {
                const matchingClasses = programClass.filter((Class) => {
                  const classStart = Class.starts_at;
                  const classEnd = Class.ends_at;
                  const hourId = hour.id;
                  return (
                    Class.day === day &&
                    (classStart === hourId ||
                      (classStart < hourId && classEnd >= hourId + 1))
                  );
                });

                if (matchingClasses.length > 0) {
                  return matchingClasses.map((matchingClass, index) => {
                    const className = doctorCourses.find(
                      (course) =>
                        course.section?.class_id === matchingClass.class_id
                    );
                    return (
                      <td
                        key={`${day}-${matchingClass.class_id}-${index}`}
                        className="py-2 px-4 border-b"
                      >
                        
                        {className?.section?.name} - {matchingClass.location}
                      </td>
                    );
                  });
                }

                return <td key={day} className="py-2 px-4 border-b"></td>;
              })}
              <td className="py-2 px-4 border-b">{hour.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default Page;
