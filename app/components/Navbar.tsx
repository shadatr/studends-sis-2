'use client';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import { AiOutlineLogout } from 'react-icons/ai';
import { BiUser } from 'react-icons/bi';
import { VscSettingsGear } from 'react-icons/vsc';
import Link from 'next/link';

const Navbar = () => {
  const session = useSession({ required: true });
  const { push } = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const user = session.data?.user;
  const handleShowProfile = () => {
    if (user?.userType === 'student') {
      push('/student/studentInfo');
    } else if (user?.userType === 'admin') {
      push('/management/managerInfo');
    } else if (user?.userType === 'doctor') {
      push('/doctor/doctorInfo');
    }
  };

  return (
    <div className="flex justify-between lg:text-lg text-left p-[35px] bg-darkBlue text-secondary lg:p-[35px] sm:p-[15px] sm:text-sm">
      <p>جامعة طرابلس</p>
      <div className="flex items-center ">
        <BiUser
          onClick={handleShowProfile}
          className="h-6 hover:cursor-pointer"
        />
        <p className="lg:text-[20px] sm:text-[15px]">
          {session.data?.user.name} {session.data?.user.surname}
        </p>
        <button onClick={() => signOut({ redirect: true })}>
          <AiOutlineLogout className="h-6" />
        </button>
        {session.data?.user.userType == 'admin' && (
          <div className="relative ">
            <button onClick={toggleDropdown} className="p-3">
              <VscSettingsGear />
            </button>
            {isOpen && (
              <div className="absolute top-0 right-0 mt-[50px] py-2 bg-white border rounded shadow-lg text-[13px] w-[150px]">
                <Link
                  onClick={() => setIsOpen(false)}
                  href="management/sittings/majors-and-fac"
                  className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white"
                >
                  التخصصات و الاقسام
                </Link>
                <Link
                  onClick={() => setIsOpen(false)}
                  href="management/sittings/uni-courses"
                  className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white"
                >
                  مواد الجامعة
                </Link>
                <Link
                  onClick={() => setIsOpen(false)}
                  href="management/sittings/major-courses"
                  className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white"
                >
                  مواد التخصصات
                </Link>
                <Link
                  onClick={() => setIsOpen(false)}
                  href="management/sittings/grading"
                  className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white"
                >
                  توزيع الدرجات
                </Link>
                <Link
                  onClick={() => setIsOpen(false)}
                  href="management/sittings/course-reg-and-gpa"
                  className="block px-4 py-2 text-gray-800 hover:bg-blue-500 hover:text-white"
                >
                  فتح تسجيل المواد/ارسال المجموع النهائي
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
