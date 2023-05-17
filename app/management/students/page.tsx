'use client';
import { createHash } from 'crypto';

import React, { FC, useEffect, useRef, useState } from 'react';
import { DatePicker } from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import {
  MajorReg2Type,
  RegisterStudentType,
} from '@/app/types/types';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const InputBox: FC<{
  label: string;
  placeholder: string;
  inputRef: React.RefObject<HTMLInputElement>;
  type?: string;
}> = ({ label, placeholder, inputRef, type }) => {
  return (
    <div className="flex flex-col">
      <label htmlFor="" lang="ar" className="p-1">
        {label}
      </label>
      <input
        ref={inputRef}
        dir="rtl"
        placeholder={placeholder}
        type={type ? type : 'text'}
        className="bg-slate-200 w-[400px] h-[30px] rounded-md p-5"
      />
    </div>
  );
};



const Page = () => {
  // handling authentication
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    throw new Error('Unauthorized');
  }

  const [activeTab, setActiveTab] = useState(1);
  const [majors, setMajors] = useState<MajorReg2Type[]>([]);



  const [birthDate, setBirthDate] = useState(new Date());
  const name = useRef<HTMLInputElement>(null);
  const surname = useRef<HTMLInputElement>(null);
  const major = useRef<HTMLInputElement>(null);
  const phone = useRef<HTMLInputElement>(null);
  const address = useRef<HTMLInputElement>(null);
  const email = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);

  const handleRegister = () => {
    if (
      !name.current?.value ||
      !surname.current?.value ||
      !email.current?.value ||
      !password.current?.value
      ) {
        toast.error('يجب ملئ جميع الحقول');
        return;
      }
      const passwordHash = createHash('sha256')
      .update(password.current?.value)
      .digest('hex');
      
      
      
      const data: RegisterStudentType = {
        name: name.current?.value,
        surname: surname.current?.value,
        major: major.current?.value,
        phone: phone.current?.value,
        address: address.current?.value,
        email: email.current.value,
        password: passwordHash,
        birth_date: (birthDate.getTime() / 1000).toFixed(),
      };
      
      axios
      .post('/api/register/student', data)
      .then((res) => {
        console.log(res.data);
        toast.success(res.data.message);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
    
  };
    
    
  const handleTabClick = (tabIndex:number) => {
    setActiveTab(tabIndex);
  };
  
  useEffect(() => {
    const fetchPosts = async () => {
      axios.get('/api/major/majorReg').then((resp) => {
        console.log(resp.data);
        const message: MajorReg2Type[] = resp.data.message;
        setMajors(message);
      });
    };
    fetchPosts();
  }, []);

  const majorItems = majors.map((item, index) => (
    <tr key={index} className="flex flex-row w-full">
      <td
        className="flex flex-row w-full p-1 items-center justify-between"
        key={index}
      >
        <Link href={`/management/majorStudents/${item.major_name}`}>{item.major_name}</Link>
      </td>
      <td className="flex flex-row w-1/5 items-center justify-center pr-2 pl-2">
        {item.tb_departments?.name}
      </td>
      <td className="flex flex-row w-1/7 pr-2 pl-2">{index + 1}</td>
    </tr>
  ));


  return (
    <div className="flex absolute flex-col justify-center items-center">
      <div className="flex w-screen  flex-row mb-4 justify-center items-center">
        <button
          className={`flex w-full flex-row p-2 justify-center items-center text-sm ${
            activeTab === 1
              ? 'bg-darkBlue text-secondary'
              : 'bg-grey '
          }`}
          onClick={() => handleTabClick(1)}
        >
          Tab 1
        </button>
        <button
          className={`flex w-full flex-row p-2 justify-center items-center text-sm ${
            activeTab === 2
              ? 'bg-darkBlue text-secondary'
              : 'bg-grey'
          }`}
          onClick={() => handleTabClick(2)}
        >
          Tab 2
        </button>
      </div>
      <div>
        {activeTab === 1 && (
          <div
            className="flex flex-col items-center h-[150px]   text-sm "
            onSubmit={(e) => e.preventDefault}
          >
            <InputBox label="الاسم" placeholder="احمد" inputRef={name} />
            <InputBox label="اللقب" placeholder="محمد" inputRef={surname} />
            <InputBox label="التخصص" placeholder="محمد" inputRef={major} />
            <InputBox
              label="رقم الهاتف"
              placeholder="01000000000"
              inputRef={phone}
            />
            <InputBox label="العنوان" placeholder="طرابلس" inputRef={address} />
            <div className="flex flex-col">
              <label htmlFor="" lang="ar">
                تاريخ الميلاد
              </label>
              <DatePicker
                locale="ar"
                className={
                  'bg-slate-200 w-[400px] h-[40px] rounded-md border-none'
                }
                onChange={(val) => setBirthDate(val as any)}
                value={birthDate}
              />
            </div>
            <InputBox
              label="البريد الالكتروني"
              placeholder="email@example.com"
              inputRef={email}
            />
            <InputBox
              label="كلمة المرور"
              placeholder="********"
              inputRef={password}
              type="password"
            />
            <button
              onClick={handleRegister}
              className="btn_base mt-5 w-[400px]"
            >
              تسجبل الطالب
            </button>
          </div>
        )}
        {activeTab === 2 && (
          <table className="w-[800px] mt-[50px] flex flex-col ">
            {majorItems}
          </table>
        )}
      </div>
    </div>
  );
};

export default Page;
