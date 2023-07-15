'use client';
import {
  PersonalInfoType,
  ClassesType,
  StudentClassType,
} from '@/app/types/types';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { redirect } from 'next/navigation';

const Page = () => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'doctor' : false) {
    redirect('/');
  }

  const user = session.data?.user;
  const [refresh, setRefresh] = useState(false);
  const [selected, setSelected] = useState('');
  const [students, setStudents] = useState<PersonalInfoType[]>([]);
  const [allStudents, setAllStudents] = useState<PersonalInfoType[]>([]);
  const [classes, setClasses] = useState<ClassesType[]>([]);
  const [coursEnrollments, setCourseEnrollements] = useState<
    StudentClassType[]
  >([]);
  const [checked, setChecked] = useState<number[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (user) {
        axios
          .get(`/api/advisor/assignAdvisor/${user?.id}`)
          .then(async (resp) => {
            const message: PersonalInfoType[] = resp.data.message;
            setAllStudents(message);
          });

        const responseEnroll = await axios.get(
          `/api/courseEnrollment/courseAccept`
        );
        const messageEnroll: StudentClassType[] = responseEnroll.data.message;
        setCourseEnrollements(messageEnroll);

        const responseClasses = await axios.get(
          `/api/getAll/getAllActiveClasses`
        );
        const messageClasses: ClassesType[] = responseClasses.data.message;
        setClasses(messageClasses);
      }
    };

    fetchPosts();
  }, [user, refresh]);

  const handleActivate = (studentId: number, active: boolean) => {
    const data = { studentId, active };
    axios.post('/api/active/studentActive', data).then((res) => {
      toast.success(res.data.message);
      setRefresh(!refresh);
    });
  };

  const handleSubmit = async () => {
    const updatedStudents: PersonalInfoType[] = [];

    if (selected === 'كل الطلاب') {
      axios.get(`/api/advisor/assignAdvisor/${user?.id}`).then(async (resp) => {
        const message: PersonalInfoType[] = resp.data.message;
        setStudents(message);
      });
    } else {
      if (selected === 'الخرجين') {
        allStudents.forEach((student) => {
          if (
            student.can_graduate === true &&
            student.graduate_advisor_approval === false
          ) {
            updatedStudents.push(student);
          }
        });
      } else if (selected === 'لم تتم الموافقة على مواد') {
        allStudents.forEach((student) => {
          const unApprovedCourse = coursEnrollments.find(
            (course) =>
              course.approved === false && student.id === course.student_id
          );
          if (unApprovedCourse) {
            updatedStudents.push(student);
          }
        });
      } else if (selected === 'لا يوجد لديهم مواد') {
        allStudents.forEach((student) => {
          const unApprovedCourse = classes.find((cls) =>
            coursEnrollments.some(
              (course) =>
                course.student_id === student.id &&
                cls.id === course.class_id &&
                cls.active
            )
          );
          if (!unApprovedCourse) {
            updatedStudents.push(student);
          }
        });
      }
      setStudents(updatedStudents);
    }
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
        name: 'graduate_advisor_approval',
        student_id: item,
      };
      axios.post('/api/transcript/approveGraduation', data).then((res) => {
        toast.success(res.data.message);
        setRefresh(!refresh);
        const dataUsageHistory = {
          id: user?.id,
          type: 'doctor',
          action: ' الموافقة على الخريجين ',
        };
        axios.post('/api/usageHistory', dataUsageHistory);
      });
    });
  };

  return (
    <div className="flex absolute flex-col w-[80%]">
      <span className="flex flex-row m-5">
        <button
          onClick={handleSubmit}
          className="bg-blue-500 hover:bg-blue-600  text-white font-bold py-2 px-4 rounded w-[150px]"
        >
          ابحث
        </button>
        <select
          defaultValue="اختر النوع"
          className="border border-gray-300 p-2 w-[250px]"
          onChange={(e) => setSelected(e.target.value)}
        >
          <option disabled>اختر النوع</option>
          <option>كل الطلاب</option>
          <option>الخرجين</option>
          <option>لم تتم الموافقة على مواد</option>
          <option>لا يوجد لديهم مواد</option>
        </select>
      </span>

      {selected == 'الخرجين' && (
        <button
          onClick={handleApprove}
          className="bg-blue-500 hover:bg-blue-600  text-white font-bold py-2 px-4 rounded w-[150px]"
        >
          موافقة
        </button>
      )}

      <table className="border-collapse mt-8">
        <thead>
          <tr className="bg-gray-200">
            {selected == 'الخرجين' && (
              <>
                <th className="border border-gray-300 px-4 py-2"></th>
                <th className="border border-gray-300 px-4 py-2">
                  المجموع النهائي
                </th>
              </>
            )}
            <th className="border border-gray-300 px-4 py-2">ايقاف/تفعيل</th>
            <th className="border border-gray-300 px-4 py-2">
              المعلومات الشخصية
            </th>
            <th className="border border-gray-300 px-4 py-2">تاريخ الانشاء</th>
            <th className="border border-gray-300 px-4 py-2">لقب</th>
            <th className="border border-gray-300 px-4 py-2">اسم</th>
          </tr>
        </thead>
        {students ? (
          <tbody>
            {students.map((user, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                {selected == 'الخرجين' && (
                  <>
                    <td className="border border-gray-300 px-4 py-2">
                      <input
                        type="checkbox"
                        onChange={() => handleCheck(user.id)}
                        checked={checked.includes(user.id)}
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {user.final_gpa}
                    </td>
                  </>
                )}
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => {
                      handleActivate(user.id, !user.active);
                    }}
                    className={`text-white py-1 px-2 rounded ${
                      user.active
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {user.active ? 'ايقاف' : 'تفعيل'}
                  </button>
                </td>

                <td className="border border-gray-300 px-4 py-2">
                  <Link
                    href={`/doctor/personalInformation/student/${user.id}`}
                    className="bg-blue-500 hover:bg-blue-600 p-2 text-white rounded-md justify-center items-center"
                  >
                    الملف الشخصي
                  </Link>
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
              </tr>
            ))}
          </tbody>
        ) : (
          <tbody>
            <tr className="flex w-full flex-row justify-center items-center text-2xl border border-gray-300 px-4 py-2">
              لا يوجد طلاب
            </tr>
          </tbody>
        )}
      </table>
    </div>
  );
};

export default Page;
