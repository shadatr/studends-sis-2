'use client';

import React, { useState, useEffect } from 'react';
import { AnnouncmentsMangType } from '@/app/types/types';
import axios from 'axios';
import { useSession } from 'next-auth/react';

const AnnoPage = () => {
  // handling authentication
  const session = useSession({ required: true });
  // if user isn't a student, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'student' : false) {
    throw new Error('Unauthorized');
  }
  const [Announcements, setAnnouncements] = useState<AnnouncmentsMangType[]>(
    []
  );
  const [courseAnnouncements, setCourseAnnouncements] = useState<
    AnnouncmentsMangType[]
  >([]);

  useEffect(() => {
    const fetchPosts = async () => {
      axios.get('/api/uniAnnouncements').then((resp) => {
        console.log(resp.data);
        const message: AnnouncmentsMangType[] = resp.data.message;
        setAnnouncements(message);
      });
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      axios.get('/api/courseAnnouncements').then((resp) => {
        console.log(resp.data);
        const message: AnnouncmentsMangType[] = resp.data.message;
        setCourseAnnouncements(message);
      });
    };
    fetchPosts();
  }, []);

  const uni = Announcements.map((item, index) => (
    <tr key={index}>
      <td className=" p-1 w-full flex items-center justify-end " key={index}>
        {item.announcement_text}
      </td>
    </tr>
  ));

  const course = courseAnnouncements.map((item, index) => (
    <tr key={index}>
      <td className=" p-1 w-full flex items-center justify-end " key={index}>
        {item.announcement_text}
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
