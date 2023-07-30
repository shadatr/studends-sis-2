'use client';
import { MajorRegType, PersonalInfoType } from '@/app/types/types';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useReactToPrint } from 'react-to-print';

const Page = ({ params }: { params: { id: number } }) => {
  const session = useSession({ required: true });

  if (session.data?.user ? session.data?.user.userType !== 'doctor' : false) {
    redirect('/');
  }

  const user = session.data?.user;
  const [refresh, setRefresh] = useState(false);
  const [approve, setApprove] = useState(true);
  const [students, setStudents] = useState<PersonalInfoType[]>([]);
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [checked, setChecked] = useState<number[]>([]);
  const printableContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await axios.get(`/api/getAll/graduatedStudents`);
      const message: PersonalInfoType[] = response.data.message;

      const resp = await axios.get('/api/major/getMajors');
      const message2: MajorRegType[] = resp.data.message;
      const selelectedMajors = message2.filter(
        (maj) => maj.department_id == user?.head_of_department_id
      );
      const stu = message.filter(
        (st) =>
          st.graduate_advisor_approval &&
          st.can_graduate &&
          !st.graduated &&
          selelectedMajors.find(
            (m) =>
              m.id == st.major && m.department_id == user?.head_of_department_id
          )
      );
      setStudents(stu);
    };

    fetchPosts();
  }, [user?.head_of_department_id]);

  const handleActivate = (studentId: number, active: boolean) => {
    const data = { studentId, active };
    axios.post('/api/active/studentActive', data).then((res) => {
      toast.success(res.data.message);
      setRefresh(!refresh);
      const dataUsageHistory = {
        id: user?.id,
        type: 'admin',
        action: ' تغيير حالة الطلبة',
      };
      axios.post('/api/usageHistory', dataUsageHistory);
    });
  };

  const handleSubmit = async () => {
    setApprove(false);
    const resp = await axios.get('/api/major/getMajors');
    const message2: MajorRegType[] = resp.data.message;
    const selelectedMajors = message2.filter(
      (maj) => maj.department_id == user?.head_of_department_id
      );
      axios
      .get(`/api/major/graduatedStudents/${params.id}/${semester}-${year}`)
      .then((resp) => {
        const message: PersonalInfoType[] = resp.data.message;
        const stu = message.filter((st) =>
          selelectedMajors.find(
            (m) =>
              m.id == st.major &&
              m.department_id == user?.head_of_department_id
          )
        );
        setStudents(stu);
      });
  };

  const handleCheck = (item: number) => {
    const isChecked = checked.includes(item);
    if (!isChecked) {
      setChecked((prevChecked) => [...prevChecked, item]);
    } else {
      setChecked((prevChecked) =>
        prevChecked.filter((value) => value !== item)
      );
    }
  };

  const handleApprove = () => {
    checked.map((item) => {
      const data = {
        value: true,
        name: 'graduated',
        student_id: item,
      };
      axios.post('/api/transcript/approveGraduation', data).then((res) => {
        toast.success(res.data.message);
        setRefresh(!refresh);
        const dataUsageHistory = {
          id: user?.id,
          type: 'doctor',
          action: ' موافقة على الخريجين ',
        };
        axios.post('/api/usageHistory', dataUsageHistory);
      });
    });
  };

  const handlePrint = useReactToPrint({
    content: () => printableContentRef.current,
  });

  return (
    <div className="flex absolute flex-col justify-center items-center  sm:text-[8px] lg:text-[16px] lg:w-[80%] sm:w-[100%]">
      <button
        onClick={handlePrint}
        className="flex bg-green-500 hover:bg-green-600 p-1 m-2 text-white rounded-md lg:w-[200px] sm:w-[100px] justify-center items-center"
      >
        طباعة
      </button>

      <div className="flex flex-row m-5">
        <button
          onClick={handleSubmit}
          className="bg-green-700 m-2 hover:bg-green-600 lg:p-3 sm:p-1 rounded-md text-white lg:w-[150px] sm:w-[80px]"
        >
          بحث
        </button>
        <input
          dir="rtl"
          placeholder=" السنة"
          type="text"
          className="lg:w-20 sm:w-[100px] px-4 py-1 bg-gray-200 border-2 border-black rounded-md ml-4"
          onChange={(e) => setYear(e.target.value)}
        />
        <select
          id="dep"
          dir="rtl"
          onChange={(e) => setSemester(e.target.value)}
          className="px-4 py-1 bg-gray-200 border-2 border-black rounded-md ml-4"
          defaultValue="الفصل"
        >
          <option disabled>الفصل</option>
          <option>خريف</option>
          <option>ربيع</option>
        </select>
      </div>
      {approve == true && (
        <button
          onClick={handleApprove}
          className="bg-blue-500 hover:bg-blue-600  text-white font-bold py-2 px-4 rounded sm:w-[80px] lg:w-[150px]"
        >
          موافقة
        </button>
      )}
      <table className="border-collapse mt-8 lg:w-[1100px] sm:w-[350px]">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1"></th>

            <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
              ايقاف/تفعيل
            </th>
            <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
              المعلومات الشخصية
            </th>
            <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
              المجموع النهائي
            </th>
            <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
              تاريخ الانشاء
            </th>
            <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
              لقب
            </th>
            <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
              اسم
            </th>
            <th className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
              رقم الطالب
            </th>
          </tr>
        </thead>
        <tbody>
          {students ? (
            students.map((user, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                  <input
                    type="checkbox"
                    onChange={() => handleCheck(user.id)}
                    checked={checked.includes(user.id)}
                  />
                </td>

                <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                  <button
                    onClick={() => {
                      handleActivate(user.id, !user.active);
                    }}
                    className={`text-white lg:px-4 lg:py-2 sm:p-1 rounded ${
                      user.active
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {user.active ? 'ايقاف' : 'تفعيل'}
                  </button>
                </td>

                <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                  <Link
                    href={`/management/personalInformation/student/${user.id}`}
                    className="bg-blue-500 hover:bg-blue-600 p-2 text-white rounded-md justify-center items-center"
                  >
                    الملف الشخصي
                  </Link>
                </td>
                <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                  {user.final_gpa}
                </td>
                <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                  {user.enrollment_date}
                </td>
                <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                  {user.surname}
                </td>
                <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                  {user.name}
                </td>
                <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                  {user.number}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="border border-gray-300 lg:px-4 lg:py-2 sm:p-1">
                لا يوجد طلاب
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div style={{ position: 'absolute', top: '-9999px' }}>
        <div ref={printableContentRef} className="m-5">
          <h1 className="flex justify-center items-center text-[30px]">
            خرجين {semester}- {year}
          </h1>
          <table className="border-collapse mt-8 w-[1100px]">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2">
                  المجموع النهائي
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  تاريخ الانشاء
                </th>
                <th className="border border-gray-300 px-4 py-2">لقب</th>
                <th className="border border-gray-300 px-4 py-2">اسم</th>
                <th className="border border-gray-300 px-4 py-2">رقم الطالب</th>
              </tr>
            </thead>
            <tbody>
              {students ? (
                students.map((user, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-gray-100' : ''}
                  >
                    <td className="border border-gray-300 px-4 py-2">
                      {user.final_gpa}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {user.enrollment_date}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {user.surname}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {user.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {user.number}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="border border-gray-300 px-4 py-2">
                    لا يوجد طلاب
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Page;
