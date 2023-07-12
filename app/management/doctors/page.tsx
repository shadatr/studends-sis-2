'use client';
import {
  GetPermissionType,
  PersonalInfoType,
} from '@/app/types/types';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import SearchBar from '@/app/components/searchBar';
import { redirect } from 'next/navigation';
import { toast } from 'react-toastify';

const Page = () => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }

  const user = session.data?.user;

  const [doctors, setDoctors] = useState<PersonalInfoType[]>([]);
<<<<<<< HEAD
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
=======
>>>>>>> 60795405c522ea122ef98b85b257185e32a615e5
  const [refresh, setRefresh] = useState(false);
  const [perms, setPerms] = useState<GetPermissionType[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (user) {
        const response = await axios.get(
          `/api/allPermission/admin/selectedPerms/${user?.id}`
        );
        const message: GetPermissionType[] = response.data.message;
        setPerms(message);
<<<<<<< HEAD
  
        fetch('/api/getAll/doctor', { cache: 'no-store' })
=======

        fetch('/api/getAll/doctor')
>>>>>>> 60795405c522ea122ef98b85b257185e32a615e5
          .then((response) => response.json())
          .then((data) => {
            const message = data.message;
            setDoctors(message);
          });
      }
    };
    fetchPosts();
<<<<<<< HEAD
  }, [user,refresh]);

   const handleActivate = (doctorId: number, active: boolean) => {
     const data = { doctorId, active };
     axios.post('/api/active/doctorActive', data).then((res) => {
       toast.success(res.data.message);
       setRefresh(!refresh);
     });
   };
=======
  }, [user, refresh]);
>>>>>>> 60795405c522ea122ef98b85b257185e32a615e5

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
        if (permItem.permission_id === 9 && permItem.active) {
          return (
            <Link
              key={idx}
              className="btn_base w-[200px] mb-3"
              href={'/management/doctors/register'}
            >
              اضافة عضو
            </Link>
          );
        }
        return null;
      })}
      <SearchBar />
      <table className="border-collapse w-[1100px]">
        <thead>
          <tr className="bg-gray-200">
            {perms.map((permItem, idx) => {
              if (permItem.permission_id === 5 && permItem.active) {
                return (
                  <th key={idx} className="border border-gray-300 px-4 py-2">
                    ايقاف/تفعيل
                  </th>
                );
              }
              return null;
            })}
            <th className="border border-gray-300 px-4 py-2">
              المعلومات الشخصية
            </th>
<<<<<<< HEAD
            {/* <th className="border border-gray-300 px-4 py-2">رئيس قسم</th> */}
=======
>>>>>>> 60795405c522ea122ef98b85b257185e32a615e5
            <th className="border border-gray-300 px-4 py-2">تاريخ الانشاء</th>
            <th className="border border-gray-300 px-4 py-2">لقب</th>
            <th className="border border-gray-300 px-4 py-2">اسم</th>
          </tr>
        </thead>
<<<<<<< HEAD
        {/* <AssignDepartment
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          selectedDoctor={selectedDoctor}
          doctors={doctors}
          setdoctors={setDoctors}
        /> */}
=======
>>>>>>> 60795405c522ea122ef98b85b257185e32a615e5
        <tbody>
          {doctors.map((user, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
              {perms.map((permItem, idx) => {
                if (permItem.permission_id === 5 && permItem.active) {
                  return (
                    <td className="border border-gray-300 px-4 py-2" key={idx}>
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
                  );
                }
                return null;
              })}
              <td className="border border-gray-300 px-4 py-2">
                <Link
                  className=" bg-blue-500  hover:bg-blue-600 p-2 text-white rounded-md  justify-center items-center"
                  href={`/management/personalInformation/doctor/${user.id}`}
                >
                  الملف الشخصي
                </Link>
              </td>
<<<<<<< HEAD
              {/* <td className="border border-gray-300 px-4 py-2 flex justify-between">
                {perms.map((permItem) => {
                  if (permItem.permission_id === 9 && permItem.active) {
                    return (
                      <button
                        key={index}
                        className="bg-green-500 hover:bg-green-600 px-5 py-1 rounded-md text-white"
                        onClick={() => {
                          setSelectedDoctor(user);
                          setIsModalOpen(true);
                        }}
                      >
                        تعين
                      </button>
                    );
                  }
                  return null;
                })}

                {user.department ? (
                  <p>{user.department.name}</p>
                ) : (
                  <p className="text-red-500">لا يوجد </p>
                )}
              </td> */}

=======
>>>>>>> 60795405c522ea122ef98b85b257185e32a615e5
              <td className="border border-gray-300 px-4 py-2">
                {user.enrollment_date}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {user.surname}
              </td>
              <td className="border border-gray-300 px-4 py-2">{user.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Page;
