'use client';
import React, { useState, useRef, useEffect } from 'react';
import { AnnouncmentsMangType, GetPermissionType } from '@/app/types/types';
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
  const [perms, setPerms] = useState<GetPermissionType[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      axios.get('/api/announcements/uniAnnouncements').then((resp) => {
        const message: AnnouncmentsMangType[] = resp.data.message;
        setAnnouncements(message);
      });
      if (user) {
        const response = await axios.get(
          `/api/allPermission/admin/selectedPerms/${user?.id}`
        );
        const message2: GetPermissionType[] = response.data.message;
        setPerms(message2);
      }
    };
    fetchPosts();
  }, [loadAnnouncements, user]);

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
    };
    axios.post('/api/announcements/newUniAnnouncement', data).then(() => {
      const dataUsageHistory = {
        id: user?.id,
        type: 'admin',
        action: 'تعديل الاعلانات',
      };
      axios.post('/api/usageHistory', dataUsageHistory);
      setLoad(!loadAnnouncements);
    });
    setNewItem('');
  };
  return (
    <div className="absolute text-sm w-[80%] justify-center items-center mt-10 flex flex-col">
      {perms.map((permItem, idx) => {
        if (permItem.permission_id === 3 && permItem.see) {
          return (
            <div key={idx}>
              <table className="w-[860px] bg-grey">
                <thead>
                  <tr>
                    {perms.map((permItem, idx) => {
                      if (permItem.permission_id === 3 && permItem.Delete) {
                        return (
                          <th
                            className="p-4 bg-darkBlue text-secondary"
                            key={idx}
                          ></th>
                        );
                      }
                      return null;
                    })}
                    <th className="p-4 bg-darkBlue text-secondary">
                      اعلانات الجامعة
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {announcements.length ? (
                    announcements.map((item, index) => (
                      <tr key={index} className="">
                        {perms.map((permItem, idx) => {
                          if (permItem.permission_id === 3 && permItem.Delete) {
                            return (
                              <td
                                className="border border-gray-300 px-4 py-2 w-[50px]"
                                key={idx}
                              >
                                <FaTrashAlt
                                  className="w-10"
                                  onClick={() => handleDelete(item.id)}
                                  role="button"
                                />
                              </td>
                            );
                          }
                          return null;
                        })}
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

              {perms.map((permItem, idx) => {
                if (permItem.permission_id === 3 && permItem.add) {
                  return (
                    <form
                      key={idx}
                      className="flex flex-col mt-3 w-[860px]"
                      onSubmit={handleSubmit}
                    >
                      <label
                        htmlFor="addItem"
                        className="bg-darkBlue text-secondary"
                      >
                        اضف اعلان
                      </label>
                      <textarea
                        className="h-[150px] text-right border border-gray-300 px-4 py-2 bg-grey"
                        autoFocus
                        dir="rtl"
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
                  );
                }
                return null;
              })}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

export default Page;
