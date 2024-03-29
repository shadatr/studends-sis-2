'use client';

import { createHash } from 'crypto';

import React, { FC, useEffect, useRef, useState } from 'react';
import { DatePicker } from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { MajorType, DepartmentRegType } from '@/app/types/types';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

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
    redirect('/');
  }

  const user = session.data?.user;

  const [departments, setDepartments] = useState<DepartmentRegType[]>([]);
  const department = useRef<HTMLSelectElement>(null);
  const [birthDate, setBirthDate] = useState(new Date());
  const name = useRef<HTMLInputElement>(null);
  const surname = useRef<HTMLInputElement>(null);
  const phone = useRef<HTMLInputElement>(null);
  const address = useRef<HTMLInputElement>(null);
  const number = useRef<HTMLInputElement>(null);
  const email = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);
  const [majors, setMajors] = useState<MajorType[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<
    MajorType | undefined
  >();
  const [submitting, setSubmitting] = useState(false);
  const [submit, setSubmit] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const resp = await axios.get('/api/major/getMajors');
        const message: MajorType[] = resp.data.message;
        setMajors(message);

        axios.get('/api/department/departmentRegister').then((resp) => {
          const message: DepartmentRegType[] = resp.data.message;
          setDepartments(message);
        });
      } catch (error) {
        console.log(error);
      }
    };
    fetchPosts();
  }, []);

  const handleRegister = () => {
    if (submitting) {
      return;
    }

    setSubmitting(true);

    if (
      !name.current?.value ||
      !surname.current?.value ||
      !email.current?.value ||
      !password.current?.value ||
      !number.current?.value ||
      !selectedMajor ||
      !address.current?.value ||
      !phone.current?.value ||
      !department.current?.value
    ) {
      toast.error('يجب ملئ جميع الحقول');
      return;
    }

    const passwordHash = createHash('sha256')
      .update(password.current?.value)
      .digest('hex');

    const data = {
      name: name.current?.value,
      surname: surname.current?.value,
      major: selectedMajor?.id,
      department_id: department.current?.value,
      phone: phone.current?.value,
      number: number.current?.value,
      address: address.current?.value,
      email: email.current?.value,
      password: passwordHash,
      birth_date: birthDate.toLocaleDateString(),
    };

    axios
      .post('/api/register/student', data)
      .then((res) => {
        toast.success(res.data.message);
        const dataUsageHistory = {
          id: user?.id,
          type: 'admin',
          action: 'اضافة طالب ',
        };
        axios.post('/api/usageHistory', dataUsageHistory);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });

    setSubmitting(false);
    setSubmit(!submit);
  };

  const handleMajorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = event.target.value;
    const major = majors.find((item) => item.major_name === selectedOption);
    setSelectedMajor(major);
  };

  return (
    <div className="flex absolute flex-col items-center w-[100%] p-10 h-[150px] text-sm">
      <div>
        <InputBox label="الاسم" placeholder="الاسم" inputRef={name} />
        <InputBox label="اللقب" placeholder="اللقب" inputRef={surname} />
        <InputBox
          label="رقم الطالب"
          placeholder="رقم الطالب"
          inputRef={number}
        />

        <label>اختر التخصص</label>
        <select
          id="dep"
          dir="rtl"
          className="flex flex-col bg-slate-200 w-[400px] h-[50px] rounded-md p-2"
          onChange={handleMajorChange}
        >
          <option disabled selected>
            اختر التخصص
          </option>
          {majors.map((item, index) => {
            if (item.active) {
              return (
                <option key={index} value={item.major_name}>
                  {item.major_name}
                </option>
              );
            }
          })}
        </select>
        <label>اختر القسم</label>
        <select
          id="dep"
          dir="rtl"
          className="flex flex-col bg-slate-200 w-[400px] h-[50px] rounded-md p-2"
          ref={department}
        >
          <option disabled selected>
            اختر القسم
          </option>
          {departments
            .filter((dep) => dep.major_id == selectedMajor?.id || dep.id==0)
            .map((item, index) => {
              if (item.active) {
                return (
                  <option key={index} value={item.id}>
                    {item.name}
                  </option>
                );
              }
            })}
        </select>
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
            className="bg-slate-200 w-[400px] h-[40px] rounded-md border-none"
            onChange={(val) => setBirthDate(val as Date)}
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
        <button onClick={handleRegister} className="btn_base mt-5 w-[400px]">
          تسجيل الطالب
        </button>
      </div>
    </div>
  );
};

export default Page;
