"use client";
import { createHash } from "crypto";

import { Switch } from "@headlessui/react";
import { FC, useRef, useState } from "react";
import { toast } from "react-toastify";
import { signIn } from "next-auth/react";

export default function Home() {
  const username = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);
  const [student, setStudent] = useState<boolean>(true);

  const handleLogin = async () => {
    if (!student) {
      toast.error("not implemented yet");
      return;
    }
    if (!username.current?.value || !password.current?.value) {
      toast.error("يجب ملئ جميع الحقول");
      return;
    }
    const passwordHash = createHash('sha256').update(password.current?.value).digest('hex');

    const result = await signIn("credentials", {
      username : username.current.value,
      password : passwordHash,
      redirect : true,
      callbackUrl : "/student/announcements"
    });
    console.log(result);
  };
  
  const handleForgotPassword = () => {
    toast.error("not implemented yet");
  };

  const handleKeyDown = (e: any) => {
    console.log("key down");
    if (e.code === "Enter") {
      handleLogin();
    }
  };

  return (
    <main className="flex justify-center items-center h-full" onKeyDown={handleKeyDown}>
      <div className="w-[800px] h-[400px] bg-darkBlue rounded-lg flex items-center flex-col">
        <h1 className="text-white text-lg pt-3">تسجيل الدخول</h1>
        <div className="flex flex-col items-end mt-10">
          <UserSwitch student={student} setStudent={setStudent} />
          <div className="flex flex-col">
            <label className="text-white text-sm">اسم المستخدم</label>
            <input ref={username}
              dir="rtl"
              className="w-[350px] h-[34px] rounded-lg"
              type="text"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-white text-sm">كلمة المرور</label>
            <input
              dir="rtl"
              className="w-[350px] h-[34px] rounded-lg"
              type="password"
              ref={password}
            />
          </div>
        </div>
        <div className="flex justify-center items-center mt-10">
          <button
            onClick={handleForgotPassword}
            className="w-[150px] h-[40px] border rounded-lg text-white mr-5"
          >
            نسيت كلمة المرور
          </button>
          <button
            onClick={handleLogin}
            className="w-[150px] h-[40px] bg-white rounded-lg text-darkBlue"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    </main>
  );
}

interface UserSwitchProps {
  student: boolean
  setStudent: (student: boolean) => void
}

const UserSwitch: FC<UserSwitchProps> = ({ student, setStudent }) => {
  return (
    <div className="flex items-center">
      <p className="text-white mr-1">مدرس</p>
      <Switch
        checked={student}
        onChange={setStudent}
        className={`${student ? "bg-sky-900" : "bg-sky-700"}
    relative inline-flex h-[26px] w-[64px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
      >
        <span className="sr-only">Switch User</span>
        <span
          aria-hidden="true"
          className={`${student ? "translate-x-9" : "translate-x-0"}
      pointer-events-none inline-block h-[23px] w-[23px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
        />
      </Switch>
      <p className="text-white ml-1">طالب</p>
    </div>
  );
};
