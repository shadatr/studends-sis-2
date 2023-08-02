'use client';
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  AssignPermissionType,
  GetPermissionStudentType,
  PersonalInfoHeaderType,
  PersonalInfoType,
  InfoDoctorType,
  MajorRegType,
  DepartmentRegType,
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
  { header: 'القسم' },
  { header: 'الفصل الدراسي' },
  { header: 'عنوان السكن' },
  { header: 'رقم الهاتف' },
  { header: 'الايميل' },
  { header: 'تاريخ التسجيل' },
  { header: 'المشرف' },
];

const Page = ({ params }: { params: { id: number } }) => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'doctor' : false) {
    redirect('/');
  }
  const [useMyData, setMydata] = useState<PersonalInfoType[]>([]);
  const [newData, setNewData] = useState<PersonalInfoType[]>([]);
  const [checkList, setCheckList] = useState<AssignPermissionType[]>([]);
  const [perms, setPerms] = useState<GetPermissionStudentType[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [doctors, setDoctors] = useState<InfoDoctorType[]>([]);
  const [edit, setEdit] = useState(false);
  const printableContentRef = useRef<HTMLDivElement>(null);
  const [major, setMajor] = useState<MajorRegType[]>([]);
  const [departments, setDepartments] = useState<DepartmentRegType[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/api/allPermission/student');
        const message: AssignPermissionType[] = response.data.message;
        setCheckList(message);
      } catch (error) {
        console.error('Error fetching data:', error);
      }

      axios.get('/api/department/departmentRegister').then((resp) => {
        const message: DepartmentRegType[] = resp.data.message;
        setDepartments(message);
      });

      const response = await axios.get(
        `/api/allPermission/student/selectedPerms/${params.id}`
      );
      const message: GetPermissionStudentType[] = response.data.message;
      setPerms(message);

      axios.get(`/api/personalInfo/student/${params.id}`).then(async (resp) => {
        const message: PersonalInfoType[] = resp.data.message;
        setMydata(message);
        setNewData(message);

        const responseMaj = await axios.get(`/api/major/getMajors`);
        const messageMaj: MajorRegType[] = responseMaj.data.message;
        setMajor(messageMaj);
      });

      axios.get('/api/getAll/doctor').then((res) => {
        const message: InfoDoctorType[] = res.data.message;
        setDoctors(message);
      });
    };
    fetchPosts();
  }, [refresh, params.id, edit]);

  const selected: AssignPermissionType[] = perms.flatMap((item) =>
    checkList
      .filter((item2) => item.permission_id == item2.id)
      .map((item2) => ({ name: item2.name, id: item2.id, active: item.active }))
  );

  const handleActivate = (parmId: number, id: number, active: boolean) => {
    const data = { student_id: id, permission_id: parmId, active: active };
    axios
      .post(`/api/allPermission/student/selectedPerms/${params.id}`, data)
      .then((res) => {
        toast.success(res.data.message);
        setRefresh(!refresh);
      });
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

  const handleInputChangeMajor = (e: string, field: keyof PersonalInfoType) => {
    const value = major.find((item) => item.major_name == e);
    const updatedData = newData.map((data) => {
      return {
        ...data,
        [field]: value?.id,
      };
    });
    setNewData(updatedData);
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

  const handleSubmitInfo = () => {
    setEdit(false);
    console.log('Submitted grades:', newData);
    axios
      .post(`/api/personalInfo/edit/${params.id}/editStudent`, newData)
      .then(() => {
        toast.success('تم تحديث البيانات بنجاح');
      })
      .catch(() => {
        toast.error('حدث خطأ أثناء تحديث البيانات');
      });
  };

  const handlePrint = useReactToPrint({
    content: () => printableContentRef.current,
  });

  return (
    <div className="lg:absolute flex justify-center items-center lg:w-[80%] sm:w-[100%] flex-col mt-[80px] sm:text-[10px] lg:text-[16px]">
      <div className="flex flex-row ">
        <button
          onClick={handlePrint}
          className="flex bg-green-500 hover:bg-green-600lg:p-2 lg:m-5 sm:p-1 sm:m-1 text-white rounded-md lg:w-[200px] sm:w-[100px] justify-center items-center"
        >
          طباعة نتائج الطالب
        </button>
        <Link
          className="flex bg-blue-500 hover:bg-blue-600 lg:p-2 lg:m-5 sm:p-1 sm:m-1 text-white rounded-md lg:w-[200px] sm:w-[100px] justify-center items-center"
          href={`/doctor/personalInformation/student/${params.id}/CoursesAndGrades`}
        >
          مواد و درجات الطالب
        </Link>
        <button
          className="lg:p-2 lg:m-5 sm:p-1 sm:m-1 bg-blue-500 hover:bg-blue-600  text-secondary rounded-md lg:w-[200px] sm:w-[100px]"
          type="submit"
          onClick={() => (edit ? handleSubmitInfo() : setEdit(!edit))}
        >
          {edit ? 'ارسال' : 'تعديل'}
        </button>
      </div>
      <table className="flex-row-reverse flex sm:text-[8px] lg:text-sm border-collapse">
        <thead>
          <tr className="">
            {stuInfo.map((title, index) => (
              <th
                className="flex lg:p-2 sm:p-1 justify-end bg-darkBlue text-secondary"
                key={index}
              >
                {title.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {edit
            ? newData.map((item2) =>
                useMyData.map((item, index) => (
                  <tr key={index}>
                    <td className="flex lg:w-[700px] lg:p-2 sm:p-1 sm:w-[200px] justify-end">
                      <input
                        className=" lg:w-[700px] sm:w-[200px] text-right "
                        type="text"
                        value={item2.name}
                        onChange={(e) =>
                          handleInputChange(e.target.value, 'name')
                        }
                      />
                    </td>
                    <td className="flex lg:w-[700px] lg:p-2 sm:p-1 sm:w-[200px] justify-end">
                      <input
                        className=" lg:w-[700px] sm:w-[200px] text-right "
                        type="text"
                        value={item2.surname}
                        onChange={(e) =>
                          handleInputChange(e.target.value, 'surname')
                        }
                      />
                    </td>
                    <td className="flex lg:w-[700px] lg:p-2 sm:p-1 sm:w-[200px] justify-end">
                      <input
                        className=" lg:w-[700px] sm:w-[200px] text-right "
                        type="text"
                        value={item2.surname}
                        onChange={(e) =>
                          handleInputChange(e.target.value, 'number')
                        }
                      />
                    </td>
                    <td className="flex lg:w-[700px] lg:p-2 sm:p-1 sm:w-[200px] justify-end">
                      <input
                        className=" lg:w-[700px] sm:w-[200px] text-right "
                        type="text"
                        value={item2.birth_date}
                        onChange={(e) =>
                          handleInputChange(e.target.value, 'birth_date')
                        }
                      />
                    </td>
                    <td className="flex lg:w-[700px] lg:p-2 sm:p-1 sm:w-[200px] justify-end">
                      <select
                        id="dep"
                        dir="rtl"
                        onChange={(e) =>
                          handleInputChangeMajor(e.target.value, 'major')
                        }
                        className="px-2  bg-gray-200 border-2 border-black rounded-md ml-4"
                        value={item.major}
                      >
                        <option disabled>الدكتور</option>
                        {major.map((maj, index) => {
                          if (maj.active)
                            return (
                              <option key={index}>{maj.major_name}</option>
                            );
                        })}
                      </select>
                    </td>
                    <td className="flex lg:w-[700px] lg:p-2 sm:p-1 sm:w-[200px] justify-end">
                      <select
                        id="dep"
                        dir="rtl"
                        onChange={(e) =>
                          handleInputChange(e.target.value, 'department_id')
                        }
                        className="px-2  bg-gray-200 border-2 border-black rounded-md ml-4"
                        value={item.department_id}
                      >
                        {departments?.map((maj, index) => {
                          if (maj.active)
                            return (
                              <option key={index} value={maj.name}>
                                {maj.name}
                              </option>
                            );
                        })}
                      </select>
                    </td>
                    <td className="flex lg:w-[700px] lg:p-2 sm:p-1 sm:w-[200px] justify-end">
                      <input
                        className="  lg:w-[700px] sm:w-[200px] text-right "
                        type="text"
                        value={item2.semester}
                        onChange={(e) =>
                          handleInputChange(e.target.value, 'semester')
                        }
                      />
                    </td>
                    <td className="flex lg:w-[700px] lg:p-2 sm:p-1 sm:w-[200px] justify-end">
                      <input
                        className=" lg:w-[700px] sm:w-[200px] text-right "
                        type="text"
                        value={item2.address}
                        onChange={(e) =>
                          handleInputChange(e.target.value, 'address')
                        }
                      />
                    </td>
                    <td className="flex lg:w-[700px] lg:p-2 sm:p-1 sm:w-[200px] justify-end">
                      <input
                        className="  lg:w-[700px] sm:w-[200px] text-right "
                        type="text"
                        value={item2.phone}
                        onChange={(e) =>
                          handleInputChange(e.target.value, 'phone')
                        }
                      />
                    </td>
                    <td className="flex lg:w-[700px] lg:p-2 sm:p-1 sm:w-[200px] justify-end">
                      <input
                        className="  lg:w-[700px] sm:w-[200px] text-right "
                        type="text"
                        value={item2.email}
                        onChange={(e) =>
                          handleInputChange(e.target.value, 'email')
                        }
                      />
                    </td>
                    <td className="flex lg:w-[700px] lg:p-2 sm:p-1 sm:w-[200px] justify-end">
                      <input
                        className="  lg:w-[700px] sm:w-[200px] text-right "
                        type="text"
                        value={item2.enrollment_date}
                        onChange={(e) =>
                          handleInputChange(e.target.value, 'enrollment_date')
                        }
                      />
                    </td>

                    <td className="flex  lg:w-[700px] sm:w-[200px] lg:p-2 sm:p-1  justify-end">
                      <select
                        id="dep"
                        dir="rtl"
                        onChange={(e) =>
                          handleInputChange(e.target.value, 'advisor')
                        }
                        className="px-2  bg-gray-200 border-2 border-black rounded-md ml-4"
                        value={item.advisor || 'الدكتور'}
                      >
                        <option disabled>الدكتور</option>
                        {doctors.map((doc, index) => {
                          if (doc.active)
                            return <option key={index} value='doc.id'>{doc.name}</option>;
                        })}
                      </select>
                    </td>
                  </tr>
                ))
              )
            : useMyData.map((item, index) => (
                <tr key={index}>
                  <td className="flex lg:w-[700px] lg:p-2 sm:p-1 sm:w-[200px] justify-end">
                    {item.name}
                  </td>
                  <td className="flex lg:w-[700px] lg:p-2 sm:p-1 sm:w-[200px] justify-end">
                    {item.surname}
                  </td>
                  <td className="flex lg:w-[700px] lg:p-2 sm:p-1 sm:w-[200px] justify-end">
                    {item.number}
                  </td>
                  <td className="flex lg:w-[700px] lg:p-2 sm:p-1 sm:w-[200px] justify-end">
                    {item.birth_date}
                  </td>
                  <td className="flex lg:w-[700px] lg:p-2 sm:p-1 sm:w-[200px] justify-end">
                    {item.major
                      ? major?.find((maj) => item.major == maj.id)?.major_name
                      : 'لا يوجد'}
                  </td>
                  <td className="flex lg:w-[700px] lg:p-2 sm:p-1 sm:w-[200px] justify-end">
                    {item.department_id
                      ? departments?.find((maj) => item.department_id == maj.id)
                          ?.name
                      : 'عام'}
                  </td>
                  <td className="flex lg:w-[700px] lg:p-2 sm:p-1 sm:w-[200px] justify-end">
                    {item.semester}
                  </td>
                  <td className="flex lg:w-[700px] lg:p-2 sm:p-1 sm:w-[200px] justify-end">
                    {item.address}
                  </td>
                  <td className="flex lg:w-[700px] lg:p-2 sm:p-1 sm:w-[200px] justify-end">
                    {item.phone}
                  </td>
                  <td className="flex lg:w-[700px] lg:p-2 sm:p-1 sm:w-[200px] justify-end">
                    {item.email}
                  </td>
                  <td className="flex lg:w-[700px] lg:p-2 sm:p-1 sm:w-[200px] justify-end">
                    {item.enrollment_date}
                  </td>
                  <td className="flex lg:w-[700px] lg:p-2 sm:p-1 sm:w-[200px] justify-end">
                    {item.advisor
                      ? doctors.find((doc) => item.advisor == doc.id)?.name
                      : 'لا يوجد'}
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
      <div>
        <table className="border-collapse mt-8 lg:w-[700px] sm:w-[350px]">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">ايقاف/تفعيل</th>
              <th className="border border-gray-300 px-4 py-2">اسم الصلاحية</th>
            </tr>
          </thead>
          <tbody>
            {selected.map((user, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => {
                      handleActivate(user.id, params.id, !user.active);
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
                  {user.name}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
