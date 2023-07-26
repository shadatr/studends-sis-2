'use client';
import {
  CheckedType,
  DayOfWeekType,
  ClassesInfoType,
  PersonalInfoType,
  GetPermissionType,
} from '@/app/types/types';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const hours: string[] = [
  '8:00',
  '9:00',
  '10:00',
  '11:00',
  '12:00',
  '1:00',
  '2:00',
  '3:00',
  '4:00',
  '5:00',
  '6:00',
  '7:00',
];

const hoursNames: CheckedType[] = [
  { id: 8, name: '8:00' },
  { id: 9, name: '9:00' },
  { id: 10, name: '10:00' },
  { id: 11, name: '11:00' },
  { id: 12, name: '12:00' },
  { id: 13, name: '1:00' },
  { id: 14, name: '2:00' },
  { id: 15, name: '3:00' },
  { id: 16, name: '4:00' },
  { id: 17, name: '5:00' },
  { id: 18, name: '6:00' },
  { id: 19, name: '7:00' },
];

const days: DayOfWeekType[] = [
  { name: 'الاحد', day: 'sunday' },
  { name: 'السبت', day: 'saturday' },
  { name: 'الجمعة', day: 'friday' },
  { name: 'الخميس', day: 'thursday' },
  { name: 'الاربعاء', day: 'wednesday' },
  { name: 'الثلثاء', day: 'tuesday' },
  { name: 'الاثنين', day: 'monday' },
];

const Tabs = ({ params }: { params: { sectionId: number } }) => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    redirect('/');
  }

  const user = session.data?.user;

  const [classes, setClasses] = useState<ClassesInfoType[]>([]);
  const [editClasses, setEditClasses] = useState<ClassesInfoType[]>([]);
  const [edit, setEdit] = useState(false);
  const [doctors, setDoctors] = useState<PersonalInfoType[]>([]);
  const [perms, setPerms] = useState<GetPermissionType[]>([]);

  useEffect(() => {
    const fetchdata = async () => {
      const responseReq = await axios.get(
        `/api/getAll/getAllClassInfo/${params.sectionId}`
      );
      const classMessage: ClassesInfoType[] = responseReq.data.message;

      setClasses(classMessage);
      setEditClasses(classMessage);
      axios.get(`/api/getAll/doctor`).then((resp) => {
        const message: PersonalInfoType[] = resp.data.message;
        setDoctors(message);
      });
      if(user){
        const response = await axios.get(
          `/api/allPermission/admin/selectedPerms/${user?.id}`
        );
        const message: GetPermissionType[] = response.data.message;
        setPerms(message);
      }

    };
    fetchdata();
  }, [params.sectionId, edit, user]);

  const handleInputChange = (
    e: string,
    field: keyof ClassesInfoType['class']
  ) => {
    let value: DayOfWeekType | any;
    if (field == 'day') {
      value = days.find((day) => day.name === e);
    }

    const updatedData = editClasses.map((data) => {
      return {
        ...data,
        class: {
          ...data.class,
          [field]: value?.day,
        },
      };
    });
    console.log(updatedData);
    setEditClasses(updatedData);
  };

  const handleInputChangeLocation = (
    e: string,
    field: keyof ClassesInfoType['class']
  ) => {
    const updatedData = editClasses.map((data) => {
      return {
        ...data,
        class: {
          ...data.class,
          [field]: e,
        },
      };
    });
    console.log(updatedData);
    setEditClasses(updatedData);
  };

  const handleInputChangeHour = (
    e: string,
    field: keyof ClassesInfoType['class']
  ) => {
    let value: CheckedType | any;
    if (field == 'starts_at' || field == 'ends_at') {
      value = hoursNames.find((hour) => hour.name === e);
    }

    const updatedData = editClasses.map((data) => {
      return {
        ...data,
        class: {
          ...data.class,
          [field]: value?.id,
        },
      };
    });
    console.log(updatedData);
    setEditClasses(updatedData);
  };

  const handleInputChangeDoctor = (
    e: string,
    field: keyof ClassesInfoType['class']
  ) => {
    let value: PersonalInfoType | any;
    if (field == 'doctor_id') {
      value = doctors.find((item) => item.name === e);
    }
    const updatedData = editClasses.map((data) => {
      return {
        ...data,
        class: {
          ...data.class,
          [field]: value?.id,
        },
      };
    });
    console.log(updatedData);
    setEditClasses(updatedData);
  };

  const handleSubmitInfo = () => {
    setEdit(false);
    axios
      .post(`/api/course/editClass`, editClasses)
      .then((res) => {
        toast.success(res.data.message);
        const dataUsageHistory = {
          id: user?.id,
          type: 'admin',
          action: 'تعديل بيانات محاضرة ' + classes[0]?.section.name,
        };
        axios.post('/api/usageHistory', dataUsageHistory);
      })
      .catch((error) => {
        toast.error(error.data.message);
      });
  };

  return (
    <div className="flex absolute flex-col justify-center items-center w-[80%] ">
      <Link
        href={`/management/course/managementWork/courseStudents/${params.sectionId}`}
        className="p-2 rounded-md text-secondary bg-blue-700 hover:bg-blue-500 text-sm"
      >
        الطلاب و الدرجات
      </Link>
      {perms.map((permItem, idx) => {
        if (permItem.permission_id === 8 && permItem.edit) {
          return (
              <button key={idx}
                className="m-5  bg-blue-500 hover:bg-blue-600  text-secondary p-3 rounded-md w-[200px]"
                type="submit"
                onClick={() => (edit ? handleSubmitInfo() : setEdit(!edit))}
              >
                {edit ? 'ارسال' : 'تعديل'}
              </button>
          );
        }
        return null;
      })}

      {classes.map((item, index) =>
        editClasses.map((item2) => {
          const findDay = days.find((day) => day.day == item.class?.day);
          const findStartTime = hoursNames.find(
            (hour) => hour.id == item.class?.starts_at
          );
          const findEndTime = hoursNames.find(
            (hour) => hour.id == item.class?.ends_at
          );
          return (
            <div key={index} className="mb-10">
              <table className="courseInfo text-sm w-[500px] m-10">
                {edit ? (
                  <tbody>
                    <tr>
                      <td>{item.course.course_name}</td>
                      <td>اسم المادة</td>
                    </tr>
                    <tr>
                      <td>{item.section.name}</td>
                      <td>اسم المجموعة</td>
                    </tr>
                    <tr>
                      <td>{item.course.hours}</td>
                      <td>عدد الساعات</td>
                    </tr>
                    <tr>
                      <td>{item.course.credits}</td>
                      <td>عدد الكريدت</td>
                    </tr>
                    <tr>
                      <td>
                        <input
                          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
                          dir="rtl"
                          value={item2.class.location}
                          onChange={(e) =>
                            handleInputChangeLocation(
                              e.target.value,
                              'location'
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-2 text-right">الموقع</td>
                    </tr>
                    <tr>
                      <td>
                        <select
                          id="dep"
                          dir="rtl"
                          onChange={(e) =>
                            handleInputChangeHour(e.target.value, 'starts_at')
                          }
                          className=" bg-gray-200 border-2 border-black rounded-md ml-4"
                          defaultValue={findStartTime?.name}
                        >
                          <option disabled selected value="">
                            وقت البدأ
                          </option>
                          {hours.map((hour, index) => (
                            <option key={index}>{hour}</option>
                          ))}
                        </select>
                        <select
                          id="dep"
                          dir="rtl"
                          onChange={(e) =>
                            handleInputChangeHour(e.target.value, 'ends_at')
                          }
                          className=" bg-gray-200 border-2 border-black rounded-md ml-4"
                          defaultValue={findEndTime?.name}
                        >
                          <option disabled selected value="">
                            وقت الانتهاء
                          </option>
                          {hours.map((hour, index) => (
                            <option key={index}>{hour}</option>
                          ))}
                        </select>
                        <select
                          id="dep"
                          dir="rtl"
                          onChange={(e) =>
                            handleInputChange(e.target.value, 'day')
                          }
                          className=" bg-gray-200 border-2 border-black rounded-md ml-4"
                          defaultValue={findDay?.name}
                        >
                          <option disabled selected value="">
                            اليوم
                          </option>
                          {days.map((day, index) => (
                            <option key={index}>{day.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>التوقيت</td>
                    </tr>
                    <tr>
                      <td>{item.course.midterm}</td>
                      <td>الامتحان النصفي</td>
                    </tr>
                    <tr>
                      <td>{item.course.final}</td>
                      <td>الامتحان النهائي</td>
                    </tr>
                    <tr>
                      <td>{item.course.class_work}</td>
                      <td>اعمال السنة</td>
                    </tr>
                    <tr>
                      <td>{item.class.semester}</td>
                      <td>الفصل الدراسي</td>
                    </tr>
                    <tr>
                      <td>
                        <select
                          id="dep"
                          dir="rtl"
                          onChange={(e) =>
                            handleInputChangeDoctor(e.target.value, 'doctor_id')
                          }
                          className="px-4 py-2 bg-gray-200 border-2 border-black rounded-md ml-4"
                          defaultValue={item.doctor.name}
                        >
                          <option disabled>الدكتور</option>
                          {doctors.map((doc, index) => {
                            if (doc.active)
                              return <option key={index}>{doc.name}</option>;
                          })}
                        </select>
                      </td>
                      <td>الدكتور</td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    <tr>
                      <td>{item.course.course_name}</td>
                      <td>اسم المادة</td>
                    </tr>
                    <tr>
                      <td>{item.section.name}</td>
                      <td>اسم المجموعة</td>
                    </tr>
                    <tr>
                      <td>{item.course.hours}</td>
                      <td>عدد الساعات</td>
                    </tr>
                    <tr>
                      <td>{item.course.credits}</td>
                      <td>عدد الكريدت</td>
                    </tr>
                    <tr>
                      <td>{item.class.location}</td>
                      <td>الموقع</td>
                    </tr>
                    <tr>
                      <td>
                        {findStartTime?.name}-{findEndTime?.name}/
                        {findDay?.name}
                      </td>
                      <td>التوقيت</td>
                    </tr>
                    <tr>
                      <td>{item.course.midterm}</td>
                      <td>الامتحان النصفي</td>
                    </tr>
                    <tr>
                      <td>{item.course.final}</td>
                      <td>الامتحان النهائي</td>
                    </tr>
                    <tr>
                      <td>{item.course.class_work}</td>
                      <td>اعمال السنة</td>
                    </tr>
                    <tr>
                      <td>{item.class.semester}</td>
                      <td>الفصل الدراسي</td>
                    </tr>
                    <tr>
                      <td>
                        {item.doctor.name} {item.doctor.surname}
                      </td>
                      <td>الدكتور</td>
                    </tr>
                  </tbody>
                )}
              </table>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Tabs;
