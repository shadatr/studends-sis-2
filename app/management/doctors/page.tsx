'use client';
import {
  GetPermissionType,
  DoctorsWithDepartmentsType,
  DepartmentRegType,
} from '@/app/types/types';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import SearchBar from '@/app/components/searchBar';
import { redirect } from 'next/navigation';
import { toast } from 'react-toastify';
import AssignDepartment from '@/app/components/asignDepartment';

const Page = () => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }

  const user = session.data?.user;

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [doctors, setDoctors] = useState<DoctorsWithDepartmentsType[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [perms, setPerms] = useState<GetPermissionType[]>([]);
  const [selectedDoctor, setSelectedDoctor] =useState<DoctorsWithDepartmentsType>();
  const [departments, setDepartments] = useState<DepartmentRegType[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (user) {
        const response = await axios.get(
          `/api/allPermission/admin/selectedPerms/${user?.id}`
        );
        const message: GetPermissionType[] = response.data.message;
        setPerms(message);

        const response2 = await axios.get(`/api/getAll/doctor`);
        const message2: DoctorsWithDepartmentsType[] = response2.data.message;
        setDoctors(message2);

        const response3 = await axios.get('/api/getAll/getAllDepartments');
        const message3: DepartmentRegType[] = response3.data.message;
        setDepartments(message3);
      }
    };
    fetchPosts();
  }, [user, refresh, isModalOpen]);

  const handleActivate = (doctorId: number, active: boolean) => {
    const data = { doctorId, active };
    axios.post('/api/active/doctorActive', data).then((res) => {
      const dataUsageHistory = {
        id: user?.id,
        type: 'admin',
        action: ' تغيير حالة الدكاترة',
      };
      axios.post('/api/usageHistory', dataUsageHistory);
      toast.success(res.data.message);
      setRefresh(!refresh);
    });
  };

  return (
    <div className="flex absolute flex-col w-[80%] justify-center items-center mt-10">
      {perms.map((permItem, idx) => {
        if (permItem.permission_id === 2 && permItem.see) {
          return (
            <div key={idx}>
              {permItem.add && (
                <Link
                  key={idx}
                  className="btn_base w-[200px] mb-3"
                  href={'/management/doctors/register'}
                >
                  اضافة عضو
                </Link>
              )}
              <SearchBar />
              <AssignDepartment
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                selectedDoctor={selectedDoctor}
                doctors={doctors}
                setdoctors={setDoctors}
              />
              <table className="border-collapse w-[1100px]">
                <thead>
                  <tr className="bg-gray-200">
                    {permItem.edit && (
                      <th className="border border-gray-300 px-4 py-2">
                        ايقاف/تفعيل
                      </th>
                    )}
                    <th className="border border-gray-300 px-4 py-2">
                      المعلومات الشخصية
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      رئيس قسم
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      تاريخ الانشاء
                    </th>
                    <th className="border border-gray-300 px-4 py-2">لقب</th>
                    <th className="border border-gray-300 px-4 py-2">اسم</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((user, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? 'bg-gray-100' : ''}
                    >
                      {permItem.edit && (
                        <td
                          className="border border-gray-300 px-4 py-2"
                          key={idx}
                        >
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
                      )}
                      <td className="border border-gray-300 px-4 py-2">
                        <Link
                          className=" bg-blue-500  hover:bg-blue-600 p-2 text-white rounded-md  justify-center items-center"
                          href={`/management/personalInformation/doctor/${user.id}`}
                        >
                          الملف الشخصي
                        </Link>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <button
                          className="bg-green-500 hover:bg-green-600 px-5 py-1 mr-3 rounded-md text-white"
                          onClick={() => {
                            setSelectedDoctor(user);
                            setIsModalOpen(true);
                          }}
                        >
                          تعيين
                        </button>
                        {user.head_of_department_id
                          ? departments.find(
                              (dep) => dep.id === user.head_of_department_id
                            )?.name || 'لا يوجد'
                          : 'لا يوجد'}
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
              </table>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

export default Page;
