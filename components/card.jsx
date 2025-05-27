import React from 'react';

export default function Card({ name, img }) {
  return (
    <div className="w-[250px] flex-col justify-start items-start gap-[8.01px] inline-flex">
      <div className="Container w-full h-[370.37px] relative overflow-hidden rounded-[6px]">
        <div className="w-full h-[370.37px] left-0 top-0 absolute shadow-[0px_4px_4px_rgba(0,0,0,0.25)] overflow-hidden flex-col justify-start items-start inline-flex">
          <img className="Image w-full h-[370.37px] object-cover" src={img || null} alt={name} />
        </div>
        <div className="w-full h-[370.37px] left-0 top-0 absolute bg-gradient-to-b from-[rgba(9,9,9,0)] to-[rgba(0,0,0,0.25)]" />
      </div>
      <div className="Heading3 w-full overflow-hidden flex-col justify-start items-start flex">
        <div className="self-stretch text-white text-sm font-['Inter'] font-medium leading-5 break-words">{name}</div>
      </div>
    </div>
  );
}

