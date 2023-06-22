'use client';

import React, { useState, useEffect } from 'react';
import { AnnouncmentsType, ClassesType, SectionType, StudentClassType } from '@/app/types/types';
import axios from 'axios';
import { useSession } from 'next-auth/react';

const AnnoPage = () => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'student' : false) {
    throw new Error('Unauthorized');
  }
  const user = session.data?.user;


  const [Announcements, setAnnouncements] = useState<AnnouncmentsType[]>([]);
  const [courseAnnouncements, setCourseAnnouncements] = useState<
    AnnouncmentsType[]
  >([]);
  const [sections, setSections] = useState<SectionType[]>([]);
  const [classes, setClasses] = useState<ClassesType[]>([]);


  useEffect(() => {
    const fetchPosts = async () => {
      if(user){

        axios.get('/api/announcements/uniAnnouncements').then((resp) => {
          console.log(resp.data);
          const message: AnnouncmentsType[] = resp.data.message;
          setAnnouncements(message);
        });
  
        const responseCourseEnroll = await axios.get(
            `/api/getAll/getCourseEnrollStudent/${user?.id}`
          );
          const messageCourseEnroll: StudentClassType[] =
            responseCourseEnroll.data.message;
  
  
          const annonPromises = messageCourseEnroll.map(async (Class) => {
            const responseReq = await axios.get(
              `/api/announcements/courseAnnouncements/${Class.class_id}`
            );
            const { message: classMessage }: { message: AnnouncmentsType[] } =
              responseReq.data;
            return classMessage;
          });
  
          const annonData = await Promise.all(annonPromises);
          const annoncement = annonData.flat();
          setCourseAnnouncements(annoncement);
  
  
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
            const { message: secMessage }: { message: SectionType[] } =
              responseReq.data;
            return secMessage;
          });
  
          const sectionData = await Promise.all(sectionsPromises);
          const sections = sectionData.flat();
          setSections(sections);
      }
        
    };
    fetchPosts();
  }, [user]);


  return (
    <div className=" flex w-[800px] right-[464px]  flex-col absolute  top-[180px] text-sm  ">
      <table className="w-[860px] overflow-y-auto ">
        <thead>
          <tr>
            <th className="bg-darkBlue   text-secondary   w-full flex items-center justify-end p-1">
              اعلانات الجامعة
            </th>
          </tr>
        </thead>
        <tbody>
          {Announcements.map((item, index) => (
            <tr key={index}>
              <td
                className=" p-1 w-full flex items-center justify-end "
                key={index}
              >
                {item.announcement_text}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <table className="w-[860px] bg-grey max-h-[300px] mt-4 overflow-y-auto ">
        <thead>
          <tr>
            <th className="p-1 bg-darkBlue text-secondary">اعلانات المواد</th>
            <th className="p-1 bg-darkBlue text-secondary w-1/5">اسم المادة</th>
          </tr>
        </thead>
        <tbody>
          {courseAnnouncements.length ? (
            courseAnnouncements.map((item, index) => {
              const clas = classes.find(
                (Class) => Class.id === item.posted_for_class_id
              );
              const sec = sections.find((sec) => sec.id === clas?.section_id);
              return (
                <tr key={index} className="">
                  <td className=" flex items-center justify-end p-1">
                    {item.announcement_text}
                  </td>
                  <td>{sec?.name}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td className="items-center justify-center p-2">
                لا يوجد اعلانات
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AnnoPage;
