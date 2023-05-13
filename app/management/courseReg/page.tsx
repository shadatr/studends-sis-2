'use client';
import { DepartmentRegType } from '@/app/types';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { FaTrashAlt } from 'react-icons/fa';


const page = () => {
const department = useRef<HTMLInputElement>(null);
const [departments, setDepartments] = useState<DepartmentRegType[]>([]);
const [loadDepartments, setLoad] = useState(false);
const [newItem, setNewItem] = useState('');

const handleRegister = () => {
    if (!newItem) {
      toast.error('يجب كتابة اسم المادة');
      return;
    }
    const data: DepartmentRegType = { name: newItem };
    axios
      .post('/api/departmentRegister', data)
      .then((res) => {
        console.log(res.data);
        toast.success(res.data.message);
        setLoad(!loadDepartments);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
      setNewItem('');
    };

    useEffect(() => {
      const fetchPosts = async () => {
        axios.get('/api/departmentRegister').then((resp) => {
          console.log(resp.data);
          const message: DepartmentRegType[] = resp.data.message;
          setDepartments(message);
        });
      };
      fetchPosts();
    }, [loadDepartments]);

    const handleDelete = (name: string) => {
      const data = { item_name: name };
      axios.post('/api/deleteDepartment', data).then((resp) => {
        toast.success(resp.data.message);
        setLoad(!loadDepartments);
      });
    };


    const items = departments.map((item, index) => (
      <tr key={index} className="flex flex-row w-full">
        <td
          className="flex flex-row w-full p-2 items-center justify-between"
          key={index}
        >
          <FaTrashAlt
            className="w-[50px] flex"
            onClick={() => handleDelete(item.name)}
            role="button"
          />
          {item.name}
        </td>
        <td className="flex flex-row w-1/8 p-4">{index + 1}</td>
      </tr>
    ));
  return (
    <div className="flex flex-col fixed items-center justify-center">
      <div className="flex flex-row-reverse items-center justify-center w-screen text-sm mt-10">
        <label htmlFor="" lang="ar" className="p-3 bg-darkBlue text-secondary">
          سجل تخصص
        </label>
        <input
          ref={department}
          dir="rtl"
          placeholder="ادخل اسم التخصص"
          type="text"
          className="w-[600px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
        />
        <button
          className="bg-darkBlue text-secondary p-3 w-[200px] rounded-[5px]"
          type="submit"
          onClick={handleRegister}
        >
          سجل
        </button>
      </div>
      <table className="w-[800px] mt-[50px] flex flex-col">{items}</table>
    </div>
  );
};

export default page;
