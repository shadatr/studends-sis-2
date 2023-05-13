"use client";

import React, { useState, useEffect } from 'react';
import { AnnouncementType } from '@/app/types';
import axios from 'axios';

interface Item {
  id: number;
  name: string;
}

const courseAnno: Item[] = [
  { id: 1, name: "اعلان...." },
  { id: 2, name: "اعلان...." },
  { id: 3, name: "اعلان...." },
  { id: 4, name: "اعلان...." },
  { id: 5, name: "اعلان...." },
  { id: 6, name: "اعلان...." },
 
];

const AnnoPage = () => {
// <<<<<<<< HEAD:app/student/Announcment/page.tsx
//   const session = useSession({required : true})
// ========
//   const session = useSession({required : true})
// >>>>>>>> 815d1f63c47e79bb17de01fa164812beaaa26f05:app/student/Announcement/page.tsx
    const [Announcements, setAnnouncements] = useState < AnnouncementType[]>([]);
    const [courseAnnouncements, setCourseAnnouncements] = useState < AnnouncementType[]>([]);


    useEffect(() => {
      const fetchPosts = async () => {
        axios.get('/api/uniAnnouncements').then((resp) => {
          console.log(resp.data);
          const message: AnnouncementType[] = resp.data.message;
          setAnnouncements(message);
        });
      };
      fetchPosts();
    }, []);

    useEffect(() => {
      const fetchPosts = async () => {
        axios.get('/api/courseAnnouncements').then((resp) => {
          console.log(resp.data);
          const message: AnnouncementType[] = resp.data.message;
          setCourseAnnouncements(message);
        });
      };
      fetchPosts();
    }, []);


  const uni = Announcements.map((i) => (
    <tr key={i.id}>
      <td className=" p-1 w-full flex items-center justify-end " key={i.id}>
        {i.subject}
      </td>
    </tr>
  ));

  const course = courseAnnouncements.map((i) => (
    <tr key={i.id}>
      <td className=" p-1 w-full flex items-center justify-end " key={i.id}>
        {i.subject}
      </td>
    </tr>
  ));
  

  return (
    <div className=" flex w-[800px] right-[464px]  flex-col absolute  top-[180px] text-sm  ">
      <table className="w-full h-[300px] overflow-y-auto flex flex-col">
        <tr>
          <th className="bg-darkBlue   text-secondary   w-full flex items-center justify-end p-1">
            اعلانات الجامعة
          </th>
        </tr>
        {uni}
      </table>
      <table className="mt-[30px] w-full h-[300px] overflow-y-auto flex flex-col">
        <tr className="w-full">
          <th className="bg-darkBlue   text-secondary   w-full flex items-center justify-end p-1">
            اعلانات المواد
          </th>
        </tr>
        {course}
      </table>
    </div>
  );
};

export default AnnoPage;
