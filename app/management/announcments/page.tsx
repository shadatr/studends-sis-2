'use client';
import React, { useState,useRef } from "react";
import { AnnouncmentsItemType, AnnouncmentsMangType } from '@/app/types';
import { FaTrashAlt } from "react-icons/fa";
import axios from "axios";
// import { toast } from 'react-toastify';



const itemm: AnnouncmentsItemType[] = [
  { id: 1, subject: 'اعلان....' },
  { id: 2, subject: 'اعلان....' },
  { id: 3, subject: 'اعلان....' },
  { id: 4, subject: 'اعلان....' },
  { id: 5, subject: 'اعلان....' },
  { id: 6, subject: 'اعلان....' },
];


const Page = () => {
  
  const [items, setItems] = useState(itemm);
  const [newItem, setNewItem] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

 

   const handleDelete = (id:number) => {
     const listItems = items.filter((item) => item.id !== id);
     setItems(listItems);
   };

  const data1 = items.map((i) => (
    <tr key={i.id}>
      <td className="flex items-center justify-between p-2 ">
        {' '}
        <FaTrashAlt onClick={() => handleDelete(i.id)} role="button" />
        {i.subject}
      </td>
    </tr>
  ));


    const handleSubmit =  (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!newItem) return;
      const id = items.length ? items[items.length - 1].id + 1 : 1;
      const myNewItem = { id: id, subject: newItem };
      const updatedLists = [...items, myNewItem];
      setItems(updatedLists);
      const data: AnnouncmentsMangType = {
        subject: newItem,
      };
      
      axios
      .post('/api/announs/employee', data);
      setNewItem('');
  };

    

  return (
    <div className=" absolute text-sm  mt-[70px] ml-[250px]  w-[860px]">
      <table className=" w-[860px] bg-grey ">
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
      <form className="flex flex-col mt-3 border-solid border-black border-2" onSubmit={handleSubmit}>
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
