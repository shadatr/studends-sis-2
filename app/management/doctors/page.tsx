'use client';
<<<<<<< HEAD
import { createHash } from 'crypto';

import React, { FC, useEffect, useRef, useState } from 'react';
import { DatePicker } from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { PersonalInfoType, RegisterdoctorType } from '@/app/types/types';
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
=======
import { DoctorsWithDepartmentsType } from '@/app/types/types';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AssignDepartment from '@/app/components/asignDepartment';
>>>>>>> 6c47a59c27d4115e842fb4c43bd1113e740cf309

const Page = () => {
  const [doctors, setDoctors] = useState<DoctorsWithDepartmentsType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  const [selectedDoctor, setSelectedDoctor] =
    useState<DoctorsWithDepartmentsType>();
  useEffect(() => {
    axios.get('/api/getAllDoctors').then((res) => {
      console.log(res.data);
      const message: DoctorsWithDepartmentsType[] = res.data.message;
      setDoctors(message);
    });
  }, []);

<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState(1);
  const [doctors, setDoctors] = useState<PersonalInfoType[]>([]);


  useEffect(() => {
    const fetchPosts = async () => {
      axios.get('/api/register/doctor').then((resp) => {
        console.log(resp.data);
        const message: PersonalInfoType[] = resp.data.message;
        setDoctors(message);
      });
    };
    fetchPosts();
  }, []);


  const doctorsItems = doctors.map((item, index) => (
    <tr key={index} className="flex flex-row w-full">
      <td
        className="flex flex-row w-full p-1 items-center justify-end"
        key={index}
      >
        <Link href={`/management/personalInformation/doctor/${item.id}`}>
          {item.name} { }{item.surname}
        </Link>
      </td>
      <td className="flex flex-row w-1/7 pr-2 pl-2">{index + 1}</td>
    </tr>
  ));


  const [birthDate, setBirthDate] = useState(new Date());
  const name = useRef<HTMLInputElement>(null);
  const surname = useRef<HTMLInputElement>(null);
  const phone = useRef<HTMLInputElement>(null);
  const address = useRef<HTMLInputElement>(null);
  const email = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);
  const speciality = useRef<HTMLInputElement>(null);

  const handleTabClick = (tabIndex: number) => {
    setActiveTab(tabIndex);
  };

  const handleRegister = () => {
    if (
      !name.current?.value ||
      !surname.current?.value ||
      !email.current?.value ||
      !password.current?.value ||
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
    <div className="flex flex-col items-center h-[150px]  right-[600px] text-sm ">
      <div>
      {activeTab === 1 && (
        <div>
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
      </div>)}
      </div>
      {activeTab === 2 && (
          <table className="w-[800px] mt-[50px] flex flex-col ">
            {doctorsItems}
          </table>
        )}
    </div>
=======
  return (
    <div>
      <div className="w-[80%] flex flex-col fixed justify-end">
        <Link
          className="btn_base mt-20 w-[200px] mb-3"
          href={'/management/doctors/register'}
        >
          اضافة عضو
        </Link>
        <table className="border-collapse w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">اسم</th>
              <th className="border border-gray-300 px-4 py-2">لقب</th>
              <th className="border border-gray-300 px-4 py-2">
                تاريخ الانشاء
              </th>
              <th className="border border-gray-300 px-4 py-2">رئيس قسم</th>
            </tr>
          </thead>
          <AssignDepartment
            isOpen={isModalOpen}
            setIsOpen={setIsModalOpen}
            selectedDoctor={selectedDoctor}
            doctors = {doctors}
            setdoctors = {setDoctors}
          />
          <tbody>
            {doctors.map((user, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                <td className="border border-gray-300 px-4 py-2">
                  {user.name}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {user.name}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {user.doctorSince}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {user.department ? (
                    <p
                      onClick={() => {
                        setSelectedDoctor(user);
                        setIsModalOpen(true);
                      }}
                    >
                      {user.department.name}
                    </p>
                  ) : (
                    <button
                      className="bg-green-500 hover:bg-green-600 px-5 py-1 rounded-md text-white"
                      onClick={() => {
                        setSelectedDoctor(user);
                        setIsModalOpen(true);
                      }}
                    >
                      تعين
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
>>>>>>> 6c47a59c27d4115e842fb4c43bd1113e740cf309
    </div>
  );
};

export default Page;
