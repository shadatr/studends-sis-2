'use client';
import { createHash } from 'crypto';

import React, { FC, useRef, useState } from 'react';
import { DatePicker } from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import {  RegisterStudentType } from '@/app/types/types';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';

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


  const [birthDate, setBirthDate] = useState(new Date());
  const name = useRef<HTMLInputElement>(null);
  const surname = useRef<HTMLInputElement>(null);
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
      phone: phone.current?.value,
      address: address.current?.value,
      email: email.current?.value,
      password: passwordHash,
      birth_date: (birthDate.getTime() / 1000).toFixed(),
    };

    axios
      .post('/api/register/manager', data)
      .then((res) => {
        toast.success(res.data.message);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };
  return (
    <div className="flex absolute flex-col justify-center items-center w-screen pt-10">
      <div className="flex flex-col items-center h-[150px]  right-[600px] text-sm ">
        <InputBox label="الاسم" placeholder="احمد" inputRef={name} />
        <InputBox label="اللقب" placeholder="محمد" inputRef={surname} />
        <InputBox
          label="رقم الهاتف"
          placeholder="01000000000"
          inputRef={phone}
        />
        <InputBox label="العنوان" placeholder="طرابلس" inputRef={address} />
        <div className="flex flex-col ">
          <label htmlFor="" lang="ar">
            تاريخ الميلاد
          </label>
          <DatePicker
            locale="ar"
            className={
              'bg-slate-200 w-[400px] h-[40px] rounded-md border-none '
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

        <button onClick={handleRegister} className="btn_base mt-5 w-[400px] ">
          تسجبل عضو هيئة التدريس
        </button>
      </div>
    </div>
  );
};

export default Page;