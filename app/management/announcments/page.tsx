'use client'
import React, { useRef } from "react";
import { announcmentsItem } from "@/app/types";
import { FaTrashAlt } from "react-icons/fa";




const item: announcmentsItem[] = [
  { id: 1, name: "اعلان...." },
  { id: 2, name: "اعلان...." },
  { id: 3, name: "اعلان...." },
  { id: 4, name: "اعلان...." },
  { id: 5, name: "اعلان...." },
  { id: 6, name: "اعلان...." },
];



const page = async() => {
  
  const [items, setItems] = React.useState<string[]>([]);
  const [newItem, setNewItem] = React.useState('');
  const inputRef = useRef();



   const handleDelete = (id:number) => {
     const listItems = items.filter((item) => item.id !== id);
     setItems(listItems);
   };

  const data = items.map((i) => (
    <tr key={i.id}>
      <td className="flex items-center justify-between p-2 ">
        {" "}
        <FaTrashAlt onClick={() => handleDelete(i.id)} role="button" />
        {i.name}
      </td>
    </tr>
  ));


  const addItem = async (item:string) => {
    const id = items.length ? items[items.length - 1].id + 1 : 1;
    const myNewItem = { id:id, name:item };
    const updatedLists = [...items, myNewItem];
    // updatedLists[id] = myNewItem;



    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!newItem) return;
      addItem(newItem);
      setNewItem('');

    const { data, error } = await supabase.from("uni_annoncments").insert([]);

    };

  return (
    <div className=" absolute text-sm  mt-[70px] ml-[250px]  w-[860px]">
      <table className=" w-[860px] bg-grey ">
        <th className="p-4 bg-darkBlue text-secondary">اعلانات الجامعة</th>
        {data.length ? (
          data
        ) : (
          <tr>
            <td className="flex items-center justify-center p-2 ">
              لا يوجد اعلانات
            </td>
          </tr>
        )}
      </table>
      <form className="flex flex-col mt-3 border-solid border-black border-2" onSubmit={handleSubmit}>
        <label htmlFor="addItem" className="bg-darkBlue text-secondary  ">
          اضف اعلان
        </label>
        <textarea
          className="h-[150px] text-right "
          autoFocus
          ref={inputRef.current}
          id="addItem"
          placeholder="Add Item"
          required
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
        />
        <button
          type="submit"
          className="p-2 bg-darkBlue text-secondary text-sm"
        >
          ارسال
        </button>
      </form>
    </div>
  );
};

export default page;
