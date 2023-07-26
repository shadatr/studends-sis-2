'use client';
import React, { useState, useEffect } from 'react';
import {  signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

const LoginPage = ({ params }: { params: { name: string } }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType] = useState('طالب');
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    // Check if the user is already signed in
    if (session?.user) {
      const userType = session.user.userType;

      if (userType === 'admin' && type === 'موظف') {
        router.push('/management/announcements');
      } else if (userType === 'doctor' && type === 'دكتور') {
        router.push('/doctor/announcements');
      } else if (userType === 'student' && type === 'طالب') {
        router.push('/student/announcements');
      }
    }
  }, [session, type, router]);

  const handleLogin = async () => {
    let providerName = '';

    if (type === 'طالب') {
      providerName = 'student';
    } else if (type === 'دكتور') {
      providerName = 'professor';
    } else if (type === 'موظف') {
      providerName = 'admin';
    }

    if (providerName) {
      const result = await signIn(providerName, {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        console.log(result.error);
        if (result.error == 'CredentialsSignin')
          toast.error('هناك خطأ في البيانات');
      } else {
        if (type === 'موظف') {
          router.push('/management/announcements');
        } else if (type === 'دكتور') {
          router.push('/doctor/announcements');
        } else if (type === 'طالب') {
          router.push('/student/announcements');
        }
      }
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-[20px] flex items-center justify-center flex-col shadow-lg w-[500px] h-[550px]">
        <h1 className="text-[30px] font-bold m-3">تسجيل الدخول {params.name}</h1>
        <span className="w-[450px] items-right flex justify-end">
          <select
            className="px-4 py-2 bg-gray-200 border-2 border-black rounded-md m-4 items-right flex justify-end"
            onChange={(e) => setType(e.target.value)}
          >
            <option>طالب</option>
            <option>دكتور</option>
            <option>موظف</option>
          </select>
        </span>
        <div className="mb-4">
          <input
            type="text"
            placeholder="البريد الالكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className=" border w-[450px] border-gray-300 rounded-md px-3 py-2 h-[50px]"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-[450px] flex border border-gray-300 rounded-md px-3 py-2 h-[50px]"
          />
        </div>
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white font-semibold px-4 py-2 rounded-md h-[50px]"
        >
          تسجيل
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
