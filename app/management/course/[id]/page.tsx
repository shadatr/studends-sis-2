'use client';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import MyModel from '@/app/components/dialog';
import { AddCourse2Type, GetPermissionType } from '@/app/types/types';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const numbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const Page = ({ params }: { params: { id: number } }) => {
  const session = useSession({ required: true });
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }
  const user = session.data?.user;
  const [perms, setPerms] = useState<GetPermissionType[]>([]);

  const [courses, setCourses] = useState<AddCourse2Type[]>([]);
  const course = useRef<HTMLInputElement>(null);
  const [loadCourses, setLoadCourse] = useState(false);
  const [isOptional, SetIsOptional] = useState('');
  const [credits, setCredits] = useState('');
  const [hours, setHours] = useState('');
  const [mid, setMid] = useState('');
  const [final, setFinal] = useState('');
  const [classWork, setClassWork] = useState('');

  const [newItemCourse, setNewItemCourse] = useState('');
  const [passingGrade, setPassingGrade] = useState('');


   useEffect(() => {
    if (typeof window !== 'undefined') {
      const fetchPosts = async () => {
        if (user) {
          axios
            .get(`/api/course/courseRegistration/${params.id}`)
            .then((resp) => {
              const message: AddCourse2Type[] = resp.data.message;
              setCourses(message);
              console.log(message);
            });

          const response = await axios.get(
            `/api/allPermission/admin/selectedPerms/${user?.id}`
          );
          const message: GetPermissionType[] = response.data.message;
          setPerms(message);
        }
      };
      fetchPosts();
    }
  }, [params.id, user?.id, loadCourses]);

  

  const selection = numbers.map((num, index) => (
    <option key={index}>{num}</option>
  ));

  const handleRegisterCourse = () => {
    if (!newItemCourse) {
      toast.error('يجب كتابة اسم المادة');
      return;
    }

    if (
      !(
        credits &&
        hours &&
        passingGrade &&
        newItemCourse &&
        mid &&
        final &&
        classWork &&
        isOptional
      )
    ) {
      toast.error('يجب ملئ جميع الحقول');
      return;
    }

    let duplicateFound = false;

    courses.forEach((item) => {
      if (item.course_name === newItemCourse) {
        duplicateFound = true;
        return;
      }
    });

    if (duplicateFound) {
      toast.error('هذه المادة مسجلة بالفعل');
      return;
    }

    let opt;
    if (isOptional == 'اجباري') {
      opt = true;
    } else {
      opt = false;
    }

    const data = {
      major_id: params.id,
      course_name: newItemCourse,
      credits: parseInt(credits),
      midterm: parseInt(mid),
      final: parseInt(final),
      class_work: parseInt(classWork),
      IsOptional: opt,
      hours: parseInt(hours),
      passing_percentage: parseInt(passingGrade),
    };

    console.log(data);

    axios
      .post(`/api/course/courseRegistration/${params.id}`, data)
      .then((res) => {
        toast.success(res.data.message);
        setLoadCourse(!loadCourses);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };



  const handleActivate = (id: number, active: boolean) => {
    const data = { id: id, active: active };
    console.log(data);
    axios.post('/api/course/courseEditActive', data).then((res) => {
      toast.success(res.data.message);
      setLoadCourse(!loadCourses);
    });
  };

  return (
    <div className="flex flex-col absolute w-[80%] mt-10 items-center justify-center text-[16px]">
      <div className="flex flex-row-reverse items-center justify-center  w-[100%] mb-10 ">
        <input
          ref={course}
          dir="rtl"
          placeholder="ادخل اسم المادة"
          type="text"
          className="w-[700px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
          onChange={(e) => setNewItemCourse(e.target.value)}
        />
        <select
          id="dep"
          dir="rtl"
          onChange={(e) => setCredits(e.target.value)}
          className="p-4 bg-lightBlue "
          defaultValue=""
        >
          <option disabled>الكريدت</option>
          {selection}
        </select>
        <select
          id="dep"
          dir="rtl"
          onChange={(e) => setHours(e.target.value)}
          className="p-4 bg-lightBlue "
          defaultValue=""
        >
          <option disabled>الساعات</option>
          {selection}
        </select>
        <select
          id="dep"
          dir="rtl"
          onChange={(e) => SetIsOptional(e.target.value)}
          className="p-4  bg-lightBlue "
        >
          <option>اختياري </option>
          <option> اجباري</option>
        </select>
        <input
          ref={course}
          dir="rtl"
          placeholder="نسبة الامتحان النصفي  "
          type="text"
          className="w-[150px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
          onChange={(e) => setMid(e.target.value)}
        />
        <input
          ref={course}
          dir="rtl"
          placeholder="نسبة الامتحان النهائي  "
          type="text"
          className="w-[150px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
          onChange={(e) => setFinal(e.target.value)}
        />
        <input
          ref={course}
          dir="rtl"
          placeholder=" نسبة اعمال السنة "
          type="text"
          className="w-[150px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
          onChange={(e) => setClassWork(e.target.value)}
        />

        <input
          ref={course}
          dir="rtl"
          placeholder="درجة النجاح"
          type="text"
          className="w-[150px] p-2.5 bg-grey border-black border-2 rounded-[5px]"
          onChange={(e) => setPassingGrade(e.target.value)}
        />
        <button
          className="bg-darkBlue text-secondary p-3 w-[200px] rounded-[5px]"
          type="submit"
          onClick={handleRegisterCourse}
        >
          سجل
        </button>
      </div>

      <table className="w-[1100px]  ">
        <thead className="">
          <tr>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">ايقاف/تفعيل</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">درجة النجاح</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">
              اجباري/اختياري{' '}
            </th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">
              نسبة اعمال السنة{' '}
            </th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">
              نسبة الامتحان النهائي{' '}
            </th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">
              نسبة الامتحان النصفي{' '}
            </th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">الكريدت</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">الساعات</th>
            <th className="py-2 px-4 bg-gray-200 text-gray-700">اسم المادة</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((item, index) => (
            <tr key={index}>
              <td className="border border-gray-300 px-4 py-2">
                <button
                  onClick={() => {
                    handleActivate(item.id, !item.active);
                  }}
                  className={`text-white py-1 px-2 rounded ${
                    item.active
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {item.active ? 'ايقاف' : 'تفعيل'}
                </button>
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {item.passing_percentage}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {item.IsOptional ? 'اجباري' : 'اختياري'}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {item.class_work}
              </td>
              <td className="border border-gray-300 px-4 py-2">{item.final}</td>
              <td className="border border-gray-300 px-4 py-2">
                {item.midterm}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {item.credits}
              </td>
              <td className="border border-gray-300 px-4 py-2">{item.hours}</td>
              <td className="border border-gray-300 px-4 py-2">
                <Link
                  href={`/management/course/managementWork/section/${item.id}/${item.major_id}`}
                >
                  {item.course_name}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Page;
