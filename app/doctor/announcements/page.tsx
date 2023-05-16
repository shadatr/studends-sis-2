'use client';
import React, { useState, useRef, useEffect } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import {  AnnouncmentsMangType } from '@/app/types/types';
import { useSession } from 'next-auth/react';


const AnnoPage = () => {

  const [Announcements, setAnnouncements] = useState<AnnouncmentsMangType[]>([]);
  // handling authentication
  const session = useSession({ required: true });
  // TODO if user isn't a doctor, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'doctor' : false) {
    throw new Error('Unauthorized');
  }

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

  const uni = Announcements.map((item,index) => (
    <tr key={index}>
      <td className=" p-1 w-full flex items-center justify-end " key={index}>
        {item.announcement_text}
      </td>
    </tr>
  ));

    const [loadAnnouncements, setLoad] = useState(false);
    const [newItem, setNewItem] = useState('');
    const [announcements2, setAnnouncements2] = useState<AnnouncmentsMangType[]>(
      []
    );
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      const fetchPosts = async () => {
        axios.get('/api/courseAnnouncements').then((resp) => {
          console.log(resp.data);
          const message: AnnouncmentsMangType[] = resp.data.message;
          setAnnouncements2(message);
        });
      };
      fetchPosts();
    }, [loadAnnouncements]);

    const handleDelete = (announcement_text: string) => {
      const data = { item_announcement_text: announcement_text };
      axios.post('/api/uniAnnouncements', data).then((resp) => {
        toast.success(resp.data.message);
        setLoad(!loadAnnouncements);
      });
    };

    const data1 = announcements2.map((item, index) => (
      <tr key={index} className="flex w-full flex-row">
        <td className="flex items-center w-full justify-between p-2 ">
          <FaTrashAlt
            className="w-10"
            onClick={() => handleDelete(item.announcement_text)}
            role="button"
          />
          {item.announcement_text}
        </td>
      </tr>
    ));

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!newItem) return;
      // const id = announcements2.length   ? announcements2[announcements2.length - 1].key + 1: 1;
      const data: AnnouncmentsMangType = {
        announcement_text: newItem,
        general: true,
      };
      axios.post('/api/newUniAnnouncement', data).then(() => {
        setLoad(!loadAnnouncements);
      });
      setNewItem('');
    };




  return (
    <div className=" flex w-[860px] right-[464px]  flex-col absolute  top-[180px] text-sm  ">
      <table className="w-full h-[300px] overflow-y-auto flex flex-col">
        <tr>
          <th className="bg-darkBlue   text-secondary   w-full flex items-center justify-end p-1">
            اعلانات الجامعة
          </th>
        </tr>
        {uni}
      </table>
      

        <table className=" w-[860px] bg-grey h-[300px] mt-4 overflow-y-auto flex flex-col">
          <th className="p-4 bg-darkBlue text-secondary">اعلانات المواد</th>
          {data1.length ? (
            data1
          ) : (
              <td className="flex items-center justify-center p-2 ">
                لا يوجد اعلانات
              </td>
          )}
        </table>
        <form
          className="flex flex-col mt-3 border-solid w-[860px] border-black border-2"
          onSubmit={handleSubmit}
        >
          <label htmlFor="addItem" className="bg-darkBlue text-secondary  ">
            اضف اعلان للمواد
          </label>
          <textarea
            className="h-[150px] text-right "
            autoFocus
            ref={inputRef}
            id="addItem"
            placeholder="Add Item"
            required
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
          />
          <button
            type="submit"
            className="p-2 bg-darkBlue text-secondary text-sm"
          >
            ارسال
          </button>
        </form>

    </div>
  );
};

export default AnnoPage;
