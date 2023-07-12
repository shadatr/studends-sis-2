'use client';
import React, { useState, useRef, useEffect } from 'react';
import { AnnouncmentsMangType } from '@/app/types/types';
import { FaTrashAlt } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

const Page = () => {
  // handling authentication
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }

  const user = session.data?.user;

  const [loadAnnouncements, setLoad] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [announcements, setAnnouncements] = useState<AnnouncmentsMangType[]>(
    []
  );
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      axios.get('/api/announcements/uniAnnouncements').then((resp) => {
        console.log(resp.data);
        const message: AnnouncmentsMangType[] = resp.data.message;
        setAnnouncements(message);
      });
    };
    fetchPosts();
  }, [loadAnnouncements]);

  const handleDelete = (id?: number) => {
    const data = { item_id: id };
    axios.post('/api/announcements/uniAnnouncements', data).then((resp) => {
      toast.success(resp.data.message);
      setLoad(!loadAnnouncements);
      const dataUsageHistory = {
        id: user?.id,
        type: 'admin',
        action: 'تعديل الاعلانات',
      };
      axios.post('/api/usageHistory', dataUsageHistory);
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newItem) return;
    const data: AnnouncmentsMangType = {
      announcement_text: newItem,
      general: true,
      admin_id: session.data?.user.id,
    };
    console.log(data);
    axios.post('/api/announcements/newUniAnnouncement', data).then(() => {
      const dataUsageHistory={
        id: user?.id,
        type: 'admin',
        action: 'تعديل الاعلانات'
      };
      axios.post('/api/usageHistory', dataUsageHistory);
      setLoad(!loadAnnouncements);
    });
    setNewItem('');
  };

  return (
    <div className=" absolute text-sm  w-[80%] justify-center items-center mt-10 flex flex-col">
      <table className=" w-[860px] bg-grey  ">
        <thead>
          <tr>
            <th className="p-4 bg-darkBlue text-secondary"> </th>
            <th className="p-4 bg-darkBlue text-secondary">اعلانات الجامعة</th>
          </tr>
        </thead>
        <tbody>
          {announcements.length ? (
            announcements.map((item, index) => (
              <tr key={index} className="">
                <td className="border border-gray-300 px-4 py-2 w-[50px]">
                  <FaTrashAlt
                    className="w-10"
                    onClick={() => handleDelete(item.id)}
                    role="button"
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2 ">
                  {item.announcement_text}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="flex items-center justify-center p-2 ">
                لا يوجد اعلانات
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <form className="flex flex-col mt-3 w-[860px]" onSubmit={handleSubmit}>
        <label htmlFor="addItem" className="bg-darkBlue text-secondary  ">
          اضف اعلان
        </label>
        <textarea
          className="h-[150px] text-right border border-gray-300 px-4 py-2 bg-grey "
          autoFocus
          ref={inputRef}
          id="addItem"
          placeholder="اكتب هنا"
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

export default Page;
