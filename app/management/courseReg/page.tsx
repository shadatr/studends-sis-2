'use client';
import { DepartmentRegType } from '@/app/types';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

const page = () => {
const department = useRef<HTMLInputElement>(null);
const [departments, setDepartments] = useState<DepartmentRegType[]>([]);

const handleRegister = () => {
    if (
      !department.current?.value 
    ) {
      toast.error('يجب كتابة اسم المادة');
      return;
    }
    const data: DepartmentRegType = { name: department.current?.value };
    axios
      .post('/api/departmentRegister', data)
      .then((res) => {
        console.log(res.data);
        toast.success(res.data.message);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });

    
      
      
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
    }, []);
    const items = departments.map((item, index)=>(<td key={index}>{item.name}</td>));
  return (
    <div className="flex flex-col fixed items-center justify-center">
      <div className="flex flex-row-reverse items-center justify-center w-screen text-sm mt-10">
        <label htmlFor="" lang="ar" className="p-3">
          سجل تخصص
        </label>
        <input
          ref={department}
          dir="rtl"
          placeholder="ادخل اسم التخصص"
          type="text"
          className="w-[600px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
        />
        <button
          className="bg-darkBlue text-secondary p-3 w-[200px] rounded-[5px]"
          type="submit"
          onClick={handleRegister}
        >
          سجل
        </button>
      </div>
      <table className="w-[500px]">{items}</table>
    </div>
  );
};

export default page;
