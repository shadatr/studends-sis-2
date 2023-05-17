import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState, useRef } from 'react';
import { DoctorsWithDepartmentsType } from '@/app/types/types';
import axios from 'axios';
import { toast } from 'react-toastify';

interface AsignDepartmentProps {
  isOpen: any;
  setIsOpen: any;
  selectedDoctor: DoctorsWithDepartmentsType | undefined;
}

export default function AssignDepartment({
  isOpen,
  setIsOpen,
  selectedDoctor,
}: AsignDepartmentProps) {
  function closeModal() {
    setIsOpen(false);
  }

  const [departments, setDepartments] = useState<
    {
      created_at: string | null;
      id: number;
      name: string | null;
    }[]
  >([]);

  const selectedDepartment = useRef<HTMLSelectElement>(null);

  const handleAssignDepartment = () => {
    axios
      .post('/api/assignDepartment', {
        department_id: selectedDepartment.current?.value,
        doctor_id: selectedDoctor?.id,
      })
      .then((res) => {
        toast.success('تم تعيين القسم بنجاح');
      })
      .catch((err) => {
        toast.error('حدث خطأ ما');
      });
  };

  useEffect(() => {
    axios.get('/api/getAllDepartments').then((res) => {
      console.log(res.data);
      const message: {
        created_at: string | null;
        id: number;
        name: string | null;
      }[] = res.data.message;
      setDepartments(message);
    });
  }, [selectedDoctor]);

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  ></Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      <select name="select" id="" ref={selectedDepartment}>
                        {departments.map((department, index) => (
                          <option key={index} value={department.id}>
                            {department.name}
                          </option>
                        ))}
                      </select>
                      اختر قسم
                    </p>
                    <button
                      className="mt-2 btn_base"
                      onClick={() => {
                        handleAssignDepartment();
                        closeModal();
                      }}
                    >
                      موافقة
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
