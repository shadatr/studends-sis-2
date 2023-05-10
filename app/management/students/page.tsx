'use client';
import { createHash } from 'crypto';

import React, { FC, useRef, useState } from 'react';
import { DatePicker } from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { RegisterStudentType } from '@/app/types';
import axios from 'axios';
import { toast } from 'react-toastify';

const InputBox: FC<{
  label: string;
  placeholder: string;
  inputRef: React.RefObject<HTMLInputElement>;
  type?: string;
}> = ({ label, placeholder, inputRef, type }) => {
  return (
    <div className="flex flex-col">
      <label htmlFor="" lang="ar">
        {label}
      </label>
      <input
        ref={inputRef}
        dir="rtl"
        placeholder={placeholder}
        type={type ? type : 'text'}
        className="bg-slate-200 w-[350px] h-[30px] rounded-md"
      />
    </div>
  );
};

const Page = () => {
  const [birthDate, setBirthDate] = useState(new Date());
  const name = useRef<HTMLInputElement>(null);
  const surname = useRef<HTMLInputElement>(null);
  const department = useRef<HTMLInputElement>(null);
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
      department: department.current?.value,
      phone: phone.current?.value,
      address: address.current?.value,
      email: email.current?.value,
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
  return (
    <div className="flex flex-col items-center h-[40px]">
      <InputBox label="الاسم" placeholder="احمد" inputRef={name} />
      <InputBox label="اللقب" placeholder="محمد" inputRef={surname} />
      <InputBox label="القسم" placeholder="هندسه" inputRef={department} />
      <InputBox label="رقم الهاتف" placeholder="01000000000" inputRef={phone} />
      <InputBox label="العنوان" placeholder="طرابلس" inputRef={address} />
      <div className="flex flex-col">
        <label htmlFor="" lang="ar">
          تاريخ الميلاد
        </label>
        <DatePicker
          locale="ar"
          className={'bg-slate-200 w-[350px] h-[30px] rounded-md border-none'}
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
      <button onClick={handleRegister} className="btn_base mt-5 w-[350px]">
        تسجبل الطالب
      </button>
    </div>
  );
};

export default Page;
