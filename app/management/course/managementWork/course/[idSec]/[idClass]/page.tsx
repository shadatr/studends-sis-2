'use client';
import {
  ClassesType,
  CourseType,
  PersonalInfoType,
  SectionType,
} from '@/app/types/types';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { FC, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';


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
        className="bg-slate-200  rounded-md m-2 p-2"
      />
    </div>
  );
};



const Tabs = ({ params }: { params: { idSec: number; idClass: number } }) => {
  const session = useSession({ required: true });
  // if user isn't a admin, throw an error
  if (session.data?.user ? session.data?.user.userType !== 'admin' : false) {
    throw new Error('Unauthorized');
  }
  const [classes, setClasses] = useState<ClassesType[]>([]);
  const [sectionName, setSectionName] = useState<string>();
  const [courseId, setCourseId] = useState<number>();
  const [selectedDoctorId, setSelectedDoctorId] = useState<number>();
  const [doctorId, setDoctorId] = useState<number>();
  const [doctorName, setDoctorName] = useState<string>();
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [doctors, setDoctors] = useState<PersonalInfoType[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>();
  const [load, setLoad] = useState(true);
  const location = useRef<HTMLInputElement>(null);
  const startTime = useRef<HTMLInputElement>(null);
  const duration = useRef<HTMLInputElement>(null);
  const classWork = useRef<HTMLInputElement>(null);
  const midterm = useRef<HTMLInputElement>(null);
  const final = useRef<HTMLInputElement>(null);

  useEffect(() => {
    
    if (typeof window !== 'undefined') {
      const fetchdata = async () => {
        const responseClass = await axios.get(
          `/api/getAll/getAllClasses/${params.idSec}`
        );
        const messageClass: ClassesType[] = responseClass.data.message;
        messageClass.map((item) => {
          setDoctorId(item.doctor_id);
        });


        setClasses(messageClass);

        const responseSec = await axios.get(
          `/api/getAll/getAllSections/${params.idClass}`
        );
        const messageSec: SectionType[] = responseSec.data.message;
        messageSec.map((item) => {
          if (item.id == params.idSec) setSectionName(item.name);
          setCourseId(item.course_id);
        });

        const responseCourse = await axios.get(
          `/api/course/courses/courseSection`
        );
        const messageCourse: CourseType[] = responseCourse.data.message;
        setCourses(messageCourse);
      };
      fetchdata();
    }
  }, [load, params.idClass, params.idSec]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fetchPosts = async () => {
        const responseDoctor = await axios.get(`/api/getAll/doctor`);
        const messageDoctor: PersonalInfoType[] = responseDoctor.data.message;
        setDoctors(messageDoctor);
        messageDoctor.map((item) => {
          if (item.id == doctorId) {
            setDoctorName(item.name);
          }
          if (item.name == selectedDoctor) {
            setSelectedDoctorId(item.id);
          }
        });
      };

      fetchPosts();
    }
  }, [selectedDoctor, load, doctors, doctorId]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDoctor) return;

    const data: ClassesType = {
      doctor_id: selectedDoctorId,
      section_id: params.idSec,
    };
    axios.post('/api/course/assignCourseDoctor', data).then((resp) => {
      toast.success(resp.data.message);
      setLoad(!load);
    });
  };

  const handleRegister = () => {

    const data: ClassesType = {
      section_id: params.idSec,
      class_work: parseInt(classWork.current?.value ?? '0'),
      midterm: parseInt(midterm.current?.value ?? '0'),
      final: parseInt(final.current?.value ?? '0'),
    };

    axios
      .post('/api/course/classRegister', data)
      .then((res) => {
        console.log(res.data);
        toast.success(res.data.message);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
      setLoad(!load);
  };


  return (
    <div className="flex absolute flex-col justify-center items-center w-[80%] ">
      <div className="flex m-5">
        <InputBox
          label="الموقع"
          placeholder="مكان القاعة"
          inputRef={location}
        />
        <InputBox
          label="موعد البدأ"
          placeholder="الساعة"
          inputRef={startTime}
        />
        <InputBox
          label="مدة المحاضرة"
          placeholder="٣ ساعات"
          inputRef={duration}
        />
        <InputBox
          label="نسبة اعمال السنة"
          placeholder="30%"
          inputRef={classWork}
        />
        <InputBox
          label="نسبة الامتحان النصفي"
          placeholder="30%"
          inputRef={midterm}
        />
        <InputBox
          label="نسبة الامتحان النهائي"
          placeholder="40%"
          inputRef={final}
        />
      </div>
      <div className="flex-row w-[500px] flex justify-between">
        <Link
          href={`/management/course/managementWork/courseStudents/${params.idSec}`}
          className="p-2  h-[40px] rounded-md text-secondary bg-blue-700 hover:bg-blue-500 text-sm"
        >
          الطلاب و الدرجات
        </Link>
        <button
          className="p-2 h-[40px] rounded-md text-secondary bg-blue-700 hover:bg-blue-500 text-sm"
          onClick={handleRegister}
        >
          اضف محاضرة
        </button>
      </div>
      {classes.map((item, index) => {
        const selectedCourse = courses.find((course) => courseId === course.id);
        return (
          <div key={index}>
            <table className="courseInfo text-sm w-[500px] m-10">
              <tbody>
                <tr>
                  <td>{selectedCourse?.course_name}</td>
                  <td>اسم المادة</td>
                </tr>
                <tr>
                  <td>{sectionName}</td>
                  <td>اسم المجموعة</td>
                </tr>
                <tr>
                  <td>{selectedCourse?.min_semester}</td>
                  <td>تبدأ من الفصل الدراسي</td>
                </tr>
                <tr>
                  <td>{selectedCourse?.hours}</td>
                  <td>عدد الساعات</td>
                </tr>
                <tr>
                  <td>{selectedCourse?.credits}</td>
                  <td>عدد الكريدت</td>
                </tr>
                <tr>
                  <td>{item.location}</td>
                  <td>الموقع </td>
                </tr>
                <tr>
                  <td>{item.midterm}</td>
                  <td>الامتحان النصفي</td>
                </tr>
                <tr>
                  <td>{item.final}</td>
                  <td>الامتحان النهائي</td>
                </tr>
                <tr>
                  <td>{item.class_work}</td>
                  <td>اعمال السنة</td>
                </tr>
                <tr>
                  <td>{selectedCourse?.passing_percentage}</td>
                  <td>درجة النجاح</td>
                </tr>
                <tr>
                  <td>{doctorName}</td>
                  <td>الدكتور</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}
      <form onSubmit={handleSubmit} className="my-4">
        <p className="bg-lightBlue px-4 py-2 mt-2">اختر الدكتور لهذه المادة</p>
        <table className="border border-gray-300 rounded-lg my-2 w-[600px]">
          <thead>
            <tr>
              <th></th>
              <th>المعلومات الشخصية</th>
              <th>التخصص</th>
              <th>الاسم</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor, index) => (
              <tr key={index}>
                <td>
                  <input
                    className="mx-2"
                    type="checkbox"
                    value={doctor.name}
                    checked={selectedDoctor === doctor.name}
                    onChange={(event) => setSelectedDoctor(event.target.value)}
                  />
                </td>
                <td>
                  <Link
                    href={`/doctor/personalInformation/doctor/${doctor.id}`}
                    className="bg-blue-500 hover:bg-blue-600 p-1 m-1 text-white rounded-md inline-block"
                  >
                    الملف الشخصي
                  </Link>
                </td>
                <td className="px-2 py-1">
                  <label>{doctor.major}</label>
                </td>
                <td className="px-2 py-1">
                  <label>{doctor.name}</label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 mt-2">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Tabs;