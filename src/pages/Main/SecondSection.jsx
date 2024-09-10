import React, { forwardRef } from 'react';
import { images } from '../../utils/images';
import { FaSearch } from 'react-icons/fa';

const SecondSection = forwardRef((props, ref) => {
  return (
    <>
      <div
        className="relative z-10 flex flex-col justify-center w-11/12 mx-auto lg:min-h-screen mt-28"
        ref={reviewRef => (ref.current[0] = reviewRef)}>
        <div className="mt-14 text-center text-[28px] fontBold mb-12 lg:mb-0 lg:text-[40px]">서비스 소개</div>
        <div className="flex items-center justify-center mx-auto my-auto">
          <img
            src={images.mainIntro}
            alt="검사기 이용방법 사진"
            className="shadow-lg rounded-2xl lg:rounded-[50px] w-1/2"
          />
          <div className="my-auto ml-8 lg:ml-24">
            <div className="bg-[#303A6E] w-fit p-1 rounded lg:w-[45px] lg:h-[45px] lg:p-[7px] lg:rounded-lg">
              <FaSearch className="text-[8px] text-white lg:text-3xl" />
            </div>
            <div className="my-2 text-lg leading-tight lg:my-6 lg:text-4xl fontBold">
              서식 유지로 인한 <br />
              빠른 업무 처리에 <br />
              최적화된 맞춤법 검사기
            </div>
            <div className="text-[9px] lg:text-base">
              <div>서식을 수정할 필요 없이 파일을 업로드한 후,</div>
              <div>맞춤법 여부를 확인해 수정하세요.</div>
              <div>직접 수정과, 추천 수정 2가지 수정 방법을</div>
              <div>사용해 편리하게 수정해보세요.</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default SecondSection;
