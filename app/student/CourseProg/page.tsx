'use client';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import {
  ClassesType,
  CourseProgramType,
  CheckedType,
  StudentClassType,
  Section2Type,
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
  if (session.data?.user ? session.data?.user.userType !== 'student' : false) {
    throw new Error('Unauthorized');
  }

  const user = session.data?.user;
  const [sections, setSections] = useState<Section2Type[]>([]);
  const [programClass, setProgramClass] = useState<CourseProgramType[]>([]);
  const [classes, setClasses] = useState<ClassesType[]>([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const responseCourseEnroll = await axios.get(
            `/api/getAll/getAllCourseEnroll/${user?.id}`
          );
          const messageCourseEnroll: StudentClassType[] =
            responseCourseEnroll.data.message;

          const classPromises = messageCourseEnroll.map(async (Class) => {
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
            const { message: secMessage }: { message: Section2Type[] } =
              responseReq.data;
            return secMessage;
          });

          const sectionData = await Promise.all(sectionsPromises);
          const sections = sectionData.flat();
          setSections(sections);

          const progClassPromises = classes.map(async (section) => {
            const responseReq = await axios.get(
              `/api/courseProgram/${section.id}`
            );
            const { message: courseMessage }: { message: CourseProgramType[] } =
              responseReq.data;
            return courseMessage;
          });

          const progClassData = await Promise.all(progClassPromises);
          const programClass = progClassData.flat();
          setProgramClass(programClass);
 

        } catch (error) {
          console.error('Error fetching data:', error);
        }
        setRefresh(!refresh);
      }
    };

    fetchData();
  }, [refresh, user]);



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
                    const className = classes.find(
                      (course) =>
                        course.id === matchingClass.class_id
                    );
                    const sectionName = sections.find(
                      (sec) => sec.id === className?.section_id
                    );
                    return (
                      <td
                        key={`${day}-${matchingClass.class_id}-${index}`}
                        className="py-2 px-4 border-b"
                      >
                        {sectionName?.name} - {matchingClass.location}
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
