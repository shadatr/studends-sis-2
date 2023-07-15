'use client';
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  AssignPermissionType,
  GetPermissionStudentType,
  PersonalInfoHeaderType,
  PersonalInfoType,
  InfoDoctorType,
  GetPermissionType,
  MajorRegType,
} from '@/app/types/types';
import { toast } from 'react-toastify';
import Link from 'next/link';
import Transcript from '@/app/components/transcript';
import { useReactToPrint } from 'react-to-print';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

const stuInfo: PersonalInfoHeaderType[] = [
  { header: 'الاسم' },
  { header: 'اللقب' },
  { header: 'رقم الطالب' },
  { header: 'تاريخ الميلاد' },
  { header: 'التخصص' },
  { header: 'الفصل الدراسي' },
  { header: 'عنوان السكن' },
  { header: 'رقم الهاتف' },
  { header: 'الايميل' },
  { header: 'تاريخ التسجيل' },
  { header: 'المشرف' },
  { header: 'حالة الطالب' },
];

const Page = ({ params }: { params: { id: number } }) => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }
  const [useMyData, setMydata] = useState<PersonalInfoType[]>([]);
  const [newData, setNewData] = useState<PersonalInfoType[]>([]);
  const [checkList, setCheckList] = useState<AssignPermissionType[]>([]);
  const [perms, setPerms] = useState<GetPermissionStudentType[]>([]);
  const [adminPerms, setAdminPerms] = useState<GetPermissionType[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [doctors, setDoctors] = useState<InfoDoctorType[]>([]);
  const [edit, setEdit] = useState(false);
  const [major, setMajor] = useState<string>();
  const printableContentRef = useRef<HTMLDivElement>(null);
  const user = session.data?.user;


  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/api/allPermission/student');
        const message: AssignPermissionType[] = response.data.message;
        setCheckList(message);
      } catch (error) {
        console.error('Error fetching data:', error);
      }

      const responsePer = await axios.get(
        `/api/allPermission/admin/selectedPerms/${user?.id}`
      );
      const messagePer: GetPermissionType[] = responsePer.data.message;
      setAdminPerms(messagePer);

      const response = await axios.get(
        `/api/allPermission/student/selectedPerms/${params.id}`
      );
      const message: GetPermissionStudentType[] = response.data.message;
      setPerms(message);

      axios.get(`/api/personalInfo/student/${params.id}`).then(async (resp) => {
        const message: PersonalInfoType[] = resp.data.message;
        setMydata(message);
        setNewData(message);

        const responseMaj = await axios.get(
          `/api/majorEnrollment/${message[0].major}`
        );
        const messageMaj: MajorRegType[] = responseMaj.data.message;
        setMajor(messageMaj[0].major_name);
      });

      axios.get('/api/getAll/doctor').then((res) => {
        const message: InfoDoctorType[] = res.data.message;
        setDoctors(message);
      });

    };
    fetchPosts();
  }, [refresh, params.id,user, edit]);



  const handleActivate = (parmId: number, id: number, active: boolean) => {
    const data = { student_id: id, permission_id: parmId, active: active };
    axios
      .post(`/api/allPermission/student/selectedPerms/${params.id}`, data)
      .then((res) => {
        toast.success(res.data.message);
        setRefresh(!refresh);
        const dataUsageHistory = {
          id: user?.id,
          type: 'admin',
          action: ' تغيير صلاحية الطالب',
        };
        axios.post('/api/usageHistory', dataUsageHistory);
      });
  };

  const handleInputChange = (e: string, field: keyof PersonalInfoType) => {
    const updatedData = newData.map((data) => {
      return {
        ...data,
        [field]: e,
      };
    });

    setNewData(updatedData);
  };

    const handleInputChangeDoctor = (
      e: string,
      field: keyof PersonalInfoType
    ) => {
      const value = doctors.find((item) => item.name === e);
      const updatedData = newData.map((data) => {
        return {
          ...data,
          [field]: value?.id,
        };
      });

      setNewData(updatedData);
    };

  const handleSubmitInfo = () => {
    setEdit(false);
    axios
      .post(`/api/personalInfo/edit/${params.id}/editStudent`, newData)
      .then(() => {
        toast.success('تم تحديث البيانات بنجاح');
        const dataUsageHistory = {
          id: user?.id,
          type: 'admin',
          action: ' تعديل معلومات الطالب',
        };
        axios.post('/api/usageHistory', dataUsageHistory);
      })
      .catch(() => {
        toast.error('حدث خطأ أثناء تحديث البيانات');
      });
  };

  const handlePrint = useReactToPrint({
    content: () => printableContentRef.current,
  });

  return (
    <div className="absolute flex justify-center items-center w-[80%] flex-col m-10">
      <div className="flex flex-row ">
        <button
          onClick={handlePrint}
          className="flex bg-green-500 hover:bg-green-600 p-2 m-5 text-white rounded-md w-[200px] justify-center items-center"
        >
          طباعة نتائج الطالب
        </button>
        <Link
          className="flex bg-blue-500 hover:bg-blue-600 p-2 m-5 text-white rounded-md w-[200px] justify-center items-center"
          href={`/management/personalInformation/student/${params.id}/CoursesAndGrades`}
        >
          مواد و درجات الطالب
        </Link>
        <button
          className="m-5  bg-blue-500 hover:bg-blue-600  text-secondary p-3 rounded-md w-[200px]"
          type="submit"
          onClick={() => (edit ? handleSubmitInfo() : setEdit(!edit))}
        >
          {edit ? 'ارسال' : 'تعديل'}
        </button>
      </div>
      <table className="flex-row-reverse flex text-sm  border-collapse">
        <thead>
          <tr className="">
            {stuInfo.map((title, index) => (
              <th
                className="flex p-2 justify-end bg-darkBlue text-secondary"
                key={index}
              >
                {title.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="">
          {edit
            ? newData.map((item2) =>
                useMyData.map((item, index) => (
                  <tr key={index}>
                    <td className="flex w-[700px] p-2 justify-end">
                      <input
                        className=" w-[700px] text-right "
                        type="text"
                        value={item2.name}
                        onChange={(e) =>
                          handleInputChange(e.target.value, 'name')
                        }
                      />
                    </td>
                    <td className="flex w-[700px] p-2 justify-end">
                      <input
                        className=" w-[700px] text-right "
                        type="text"
                        value={item2.surname}
                        onChange={(e) =>
                          handleInputChange(e.target.value, 'surname')
                        }
                      />
                    </td>
                    <td className="flex w-[700px] p-2 justify-end">
                      <input
                        className=" w-[700px] text-right "
                        type="number"
                        value={item2.number}
                        onChange={(e) =>
                          handleInputChange(e.target.value, 'number')
                        }
                      />
                    </td>
                    <td className="flex w-[700px] p-2 justify-end">
                      <input
                        className=" w-[700px] text-right "
                        type="text"
                        value={item2.birth_date}
                        onChange={(e) =>
                          handleInputChange(e.target.value, 'birth_date')
                        }
                      />
                    </td>
                    <td className="flex w-[700px] p-2 justify-end">
                      {item2.major}
                    </td>
                    <td className="flex w-[700px] p-2 justify-end">
                      <input
                        className=" w-[700px] text-right "
                        type="number"
                        value={item2.semester}
                        onChange={(e) =>
                          handleInputChange(e.target.value, 'semester')
                        }
                      />
                    </td>
                    <td className="flex w-[700px] p-2 justify-end">
                      <input
                        className=" w-[700px] text-right "
                        type="text"
                        value={item2.address}
                        onChange={(e) =>
                          handleInputChange(e.target.value, 'address')
                        }
                      />
                    </td>
                    <td className="flex w-[700px] p-2 justify-end">
                      <input
                        className=" w-[700px] text-right "
                        type="text"
                        value={item2.phone}
                        onChange={(e) =>
                          handleInputChange(e.target.value, 'phone')
                        }
                      />
                    </td>
                    <td className="flex w-[700px] p-2 justify-end">
                      <input
                        className=" w-[700px] text-right "
                        type="text"
                        value={item2.email}
                        onChange={(e) =>
                          handleInputChange(e.target.value, 'email')
                        }
                      />
                    </td>
                    <td className="flex w-[700px] p-2 justify-end">
                      <input
                        className=" w-[700px] text-right "
                        type="text"
                        value={item2.enrollment_date}
                        onChange={(e) =>
                          handleInputChange(e.target.value, 'enrollment_date')
                        }
                      />
                    </td>
                    <td className="flex w-[700px] p-2 justify-end">
                      <select
                        id="dep"
                        dir="rtl"
                        onChange={(e) =>
                          handleInputChangeDoctor(e.target.value, 'advisor')
                        }
                        className="px-2  bg-gray-200 border-2 border-black rounded-md ml-4"
                        defaultValue={
                          item.advisor
                            ? doctors.find((doc) => item.advisor == doc.id)
                                ?.name
                            : 'لا يوجد'
                        }
                      >
                        <option disabled>الدكتور</option>
                        {doctors.map((doc, index) => {
                          if (doc.active)
                            return <option key={index}>{doc.name}</option>;
                        })}
                      </select>
                    </td>
                  </tr>
                ))
              )
            : useMyData.map((item, index) => (
                <tr key={index}>
                  <td className="flex w-[700px] p-2 justify-end">
                    {item.name}
                  </td>
                  <td className="flex w-[700px] p-2 justify-end">
                    {item.surname}
                  </td>
                  <td className="flex w-[700px] p-2 justify-end">
                    {item.number}
                  </td>
                  <td className="flex w-[700px] p-2 justify-end">
                    {item.birth_date}
                  </td>
                  <td className="flex w-[700px] p-2 justify-end">
                    {major ? major : 'غير محدد'}
                  </td>

                  <td className="flex w-[700px] p-2 justify-end">
                    {item.semester}
                  </td>
                  <td className="flex w-[700px] p-2 justify-end">
                    {item.address}
                  </td>
                  <td className="flex w-[700px] p-2 justify-end">
                    {item.phone}
                  </td>
                  <td className="flex w-[700px] p-2 justify-end">
                    {item.email}
                  </td>
                  <td className="flex w-[700px] p-2 justify-end">
                    {item.enrollment_date}
                  </td>
                  <td className="flex w-[700px] p-2 justify-end">
                    {item.advisor
                      ? doctors.find((doc) => item.advisor == doc.id)?.name
                      : 'لا يوجد'}
                  </td>
                  <td className="flex w-[700px] p-2 justify-end">{user?.graduated ? 'تخرج' : 'لم يتخرج'}</td>
                </tr>
              ))}
        </tbody>
      </table>
      <div>
        {adminPerms.map((permItem, idx) => {
          if (permItem.permission_id === 5 && permItem.active) {
            return (
              <table className="border-collapse mt-8 w-[700px]" key={idx}>
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 px-4 py-2">
                      ايقاف/تفعيل
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      اسم الصلاحية
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {perms.map((user, index) => {
                    const selectedPer = checkList.find(
                      (item) => item.id == user.permission_id
                    );
                    return (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? 'bg-gray-100' : ''}
                      >
                        <td className="border border-gray-300 px-4 py-2">
                          <button
                            onClick={() => {
                              handleActivate(
                                user.permission_id,
                                params.id,
                                !user.active
                              );
                            }}
                            className={`w-[50px] text-white py-1 px-2 rounded ${
                              user.active
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                          >
                            {user.active ? 'ايقاف' : 'تفعيل'}
                          </button>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {selectedPer?.name}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            );
          }
          return null;
        })}
        <div>
          {useMyData.length > 0 && (
            <Transcript majorId={useMyData[0].major} user={params.id} />
          )}
        </div>
        <div style={{ position: 'absolute', top: '-9999px' }}>
          <div ref={printableContentRef} className="m-5">
            {useMyData.length > 0 && (
              <>
                <h1>{useMyData[0].name} :الاسم</h1>
                <h1>{useMyData[0].surname} :اللقب</h1>
                <h1>{useMyData[0].number} : رقم الطالب</h1>
                <Transcript majorId={useMyData[0].major} user={params.id} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
