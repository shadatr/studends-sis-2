'use client';
import React, { useState, useRef, useEffect } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  ClassesType,
  SectionType,
  AnnouncmentsType,
} from '@/app/types/types';
import { useSession } from 'next-auth/react';

const AnnoPage = () => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'doctor' : false) {
    throw new Error('Unauthorized');
  }

  const user = session.data?.user;

  const [Announcements, setAnnouncements] = useState<AnnouncmentsType[]>([]);
  const [loadAnnouncements, setLoad] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [announcements2, setAnnouncements2] = useState<AnnouncmentsType[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [sections, setSections] = useState<SectionType[]>([]);
  const [SelecetdSections, setSelectedSections] = useState<string>();
  const [classes, setClasses] = useState<ClassesType[]>([]);


  useEffect(() => {
    const fetchPosts = async () => {
    if(user){
        axios.get('/api/announcements/uniAnnouncements').then((resp) => {
          const message: AnnouncmentsType[] = resp.data.message;
          setAnnouncements(message);
        });
  
        const response = await axios.get(
          `/api/course/courses/${user?.id}/doctor`
        );
        const message: SectionType[] = response.data.message;
        setSections(message);
  
          const classPromises = message.map(async (section) => {
            const responseReq = await axios.get(
              `/api/getAll/getAllClasses/${section.id}`
            );
            const { message: classMessage }: { message: ClassesType[] } =
              responseReq.data;
            return classMessage;
          });

          const classData = await Promise.all(classPromises);
          const classes = classData.flat();
          setClasses(classes);

          const announcementsPromises = classes.map(async (announ) => {
            const responseReq = await axios.get(
              `/api/announcements/courseAnnouncements/${announ.id}`
            );
            const { message: secMessage }: { message: AnnouncmentsType[] } =
              responseReq.data;
            return secMessage;
          });
  
          const annoncementsData = await Promise.all(announcementsPromises);
          const annoncements = annoncementsData.flat();
          setAnnouncements2(annoncements);        
      }
    };
    fetchPosts();
  }, [loadAnnouncements,user]);

  const handleDelete = (id: number) => {
    const data = { item_id: id };
    axios.post('/api/announcements/uniAnnouncements', data).then((resp) => {
      toast.success(resp.data.message);
      setLoad(!loadAnnouncements);
    });
  };

  const handleSubmit = () => {
    if (!newItem) return;
    if (!SelecetdSections){ 
    toast.error('يجب اختيار المادة');
    return;}

    const section=sections.find((sec)=> sec.name== SelecetdSections);

    const selectedClass = classes.find((cla) => cla.section_id == section?.id);
    
    const data = {
      announcement_text: newItem,
      general: false,
      posted_for_class_id: selectedClass?.id
    };
    console.log(data);
    axios.post('/api/announcements/newUniAnnouncement', data).then((resp) => {
      toast.success(resp.data.message);
      setLoad(!loadAnnouncements);
    });
    setNewItem('');
  };

  return (
    <div className=" flex w-[860px] right-[464px]  flex-col absolute  top-[180px] text-sm  ">
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
          {announcements2.length ? (
            announcements2.map((item, index) => {
              const clas = classes.find(
                (Class) => Class.id === item.posted_for_class_id
              );
              const sec = sections.find((sec) => sec.id === clas?.section_id);
              return (
                <tr key={index} className="">
                  <td className="w-full flex items-center justify-between p-1">
                    <FaTrashAlt
                      className="w-10"
                      onClick={() => handleDelete(item.id)}
                      role="button"
                      />
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

      <form
        className="flex flex-col mt-3 border-solid w-[860px] border-black border-2"
        onSubmit={(e) => e.preventDefault()}
      >
        <label
          htmlFor="addItem"
          className="p-2 bg-darkBlue text-secondary justify-between flex flex-row"
        >
          <select
            id="dep"
            dir="rtl"
            onChange={(e) => setSelectedSections(e.target.value)}
            className=" text-sm bg-darkBlue border border-gray-300 px-4 py-2 "
            defaultValue=""
          >
            <option disabled value="">
              اختر المادة
            </option>
            {sections.map((section, index) => (
              <option key={index}>{section.name}</option>
            ))}
          </select>
          <h1> اضف اعلان للمواد</h1>
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
          onClick={handleSubmit}
        >
          ارسال
        </button>
      </form>
    </div>
  );
};

export default AnnoPage;
