'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
  AnnouncmentsMangType,
} from '@/app/types';
import { FaTrashAlt } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';


const Page = () => {

  const [loadAnnouncements, setLoad] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [announcements, setAnnouncements] = useState<AnnouncmentsMangType[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      axios.get('/api/uniAnnouncements').then((resp) => {
        console.log(resp.data);
        const message: AnnouncmentsMangType[] = resp.data.message;
        setAnnouncements(message);
      });
    };
    fetchPosts();
  }, [loadAnnouncements]);

  const handleDelete = (id: number) => {
    const data = { item_id: id };
    axios.post('/api/uniAnnouncements', data).then((resp) => {
      toast.success(resp.data.message);
      setLoad(!loadAnnouncements);
    });
  };

  const data1 = announcements.map((item, index) => (
    <tr key={index} className='flex w-full flex-row'>
      <td className="flex items-center w-full justify-between p-2 ">
        <FaTrashAlt className='w-10' onClick={() => handleDelete(item.id)} role="button" />
        {item.subject}

      </td>
        <td className='p-2'>
        {item.type}
        </td>
    </tr>
  ));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newItem) return;
    const id = announcements.length ? announcements[announcements.length - 1].id + 1: 1;
    const data: AnnouncmentsMangType = {
      id: id,
      subject: newItem,
      type: "uni"
    };
    axios.post('/api/newUniAnnouncement', data).then(() => {
      setLoad(!loadAnnouncements);
    });
    setNewItem('');
  };

  return (
    <div className=" absolute text-sm  mt-[70px] ml-[250px]  w-[860px]">
      <table className=" w-[860px] bg-grey h-[300px] overflow-y-auto flex flex-col">
        <th className="p-4 bg-darkBlue text-secondary">اعلانات الجامعة</th>
        {data1.length ? (
          data1
        ) : (
          <tr>
            <td className="flex items-center justify-center p-2 ">
              لا يوجد اعلانات
            </td>
          </tr>
        )}
      </table>
      <form
        className="flex flex-col mt-3 border-solid border-black border-2"
        onSubmit={handleSubmit}
      >
        <label htmlFor="addItem" className="bg-darkBlue text-secondary  ">
          اضف اعلان
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

export default Page;
