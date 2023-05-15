import React from 'react';
import { ColumnDefinitionType } from '@/app/types/types';

import Table from "../../table";



interface Cat {
  name: string;
  age: number;
  gender: string;
  color: string;
  activityLevel: string; 
  favoriteFood: string; 
}

const data: Cat[] = [
  {
    name: "Mittens",
    color: "black",
    age: 2,
    gender: "female",
    activityLevel: "hight",
    favoriteFood: "milk",
  },
  {
    name: "Mons",
    color: "grey",
    age: 2,
    gender: "male",
    favoriteFood: "old socks",
    activityLevel: "medium",
  },
  {
    name: "Luna",
    color: "black",
    age: 2,
    gender: "female",
    activityLevel: "medium",
    favoriteFood: "fish",
  },
  {
    name: "Bella",
    color: "grey",
    age: 1,
    gender: "female",
    activityLevel: "high",
    favoriteFood: "mice",
  },
  {
    name: "Oliver",
    color: "orange",
    age: 1,
    gender: "male",
    activityLevel: "low",
    favoriteFood: "fish",
  },
];

const columns: ColumnDefinitionType<Cat, keyof Cat>[] = [
  {
    key: "name",
    header: "Name",
  },
  {
    key: "age",
    header: "Age in years",
  },
  {
    key: "color",
    header: "Color",
  },
];

const page = () => {

  return (
    <div className="pl-[300px] py-[150px]  m-auto fixed text-sm w-[1200px]">
      <Table data={data} columns={columns} />
    </div>
  );
};

export default page;
