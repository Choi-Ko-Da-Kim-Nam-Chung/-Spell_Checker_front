import React from 'react';
import { useNavigate } from 'react-router-dom';
import { images } from '../../utils/images';

export default function FirstSection() {
  const navigate = useNavigate();

  const moveUpload = () => {
    navigate('/upload');
  };

  return (
    <>
      <div className="relative z-10 flex mt-32 lg:mt-0 lg:min-h-screen justify-evenly">
        <div className="my-auto">
          <img src={images.mainLapTop} alt="메인화면노트북" className="w-[200px] lg:w-[500px]" />
        </div>
        <div className="flex flex-col my-auto">
          <div className="text-[28px] lg:text-[64px] fontBold leading-tight whitespace-nowrap">
            서식이 그대로! <br />
            맞춤법 검사기
          </div>
          <div className="my-4 text-xs whitespace-normal lg:text-base">
            <div className="flex flex-col lg:flex-row">
              <span className="mr-1">맞춤법 검사기 사용 후</span>
              <span>서식 수정이 귀찮으시다면</span>
            </div>
            지금 경험해보세요!
          </div>
          <button
            className="w-fit px-3 py-2 rounded-lg text-center bg-[#303A6E] text-[#ffffff] text-[10px] lg:text-base lg:px-4 lg:py-3"
            onClick={moveUpload}>
            맞춤법 검사하기
          </button>
        </div>
      </div>
    </>
  );
}
