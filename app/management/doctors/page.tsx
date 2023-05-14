'use client';
import { createHash } from 'crypto';

import React, { FC, useRef, useState } from 'react';
import { DatePicker } from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { RegisterdoctorType } from '@/app/types';
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
  const [birthDate, setBirthDate] = useState(new Date());
  const name = useRef<HTMLInputElement>(null);
  const surname = useRef<HTMLInputElement>(null);
  const phone = useRef<HTMLInputElement>(null);
  const address = useRef<HTMLInputElement>(null);
  const email = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);
  const speciality = useRef<HTMLInputElement>(null);

  const handleRegister = () => {
    if (
      !name.current?.value ||
      !surname.current?.value ||
      !email.current?.value ||
      !password.current?.value||
      !speciality.current?.value
    ) {
      toast.error('يجب ملئ جميع الحقول');
      return;
    }

    const passwordHash = createHash('sha256')
      .update(password.current?.value)
      .digest('hex');

    const data: RegisterdoctorType = {
      name: name.current?.value,
      surname: surname.current?.value,
      phone: phone.current?.value,
      address: address.current?.value,
      email: email.current?.value,
      speciality: speciality.current?.value,
      password: passwordHash,
      birth_date: (birthDate.getTime() / 1000).toFixed(),
    };

    axios
      .post('/api/register/doctor', data)
      .then((res) => {
        console.log(res.data);
        toast.success(res.data.message);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };
  return (
    <div className="flex flex-col items-center h-[150px] pt-5 fixed right-[600px] text-sm ">
      <InputBox label="الاسم" placeholder="احمد" inputRef={name} />
      <InputBox label="اللقب" placeholder="محمد" inputRef={surname} />
      <InputBox label="رقم الهاتف" placeholder="01000000000" inputRef={phone} />
      <InputBox label="العنوان" placeholder="طرابلس" inputRef={address} />
      <InputBox label="التخصص" placeholder="احصاء" inputRef={speciality} />
      <div className="flex flex-col">
        <label htmlFor="" lang="ar">
          تاريخ الميلاد
        </label>
        <DatePicker
          locale="ar"
          className={'bg-slate-200 w-[400px] h-[40px] rounded-md border-none'}
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
  );
};

export default Page;
