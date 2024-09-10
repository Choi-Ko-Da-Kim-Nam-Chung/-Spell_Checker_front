import React, { forwardRef } from 'react';
import { RiKakaoTalkFill } from 'react-icons/ri';
import { MdOutlineEmail } from 'react-icons/md';
import { FaInstagram } from 'react-icons/fa';

const Footer = forwardRef((props, ref) => {
  return (
    <>
      <div
        className="relative z-20 bg-[#191f28] text-[#ffffff] text-center py-12 min-h-min"
        ref={reviewRef => (ref.current[2] = reviewRef)}>
        <div className="fontBold text-start text-[28px] lg:text-[40px] mb-8 w-10/12 mx-auto">문의하기</div>
        <div className="text-[10px] leading-loose lg:text-base">
          <div>
            서식 유지 맞춤법 검사기는 성결대학교 컴퓨터공학과 졸업작품으로 제작하였습니다. <br />
            서비스 및 팀 관련 문의는 아래 채널들을 통해 연락해주시길 바랍니다.
          </div>
          <div className="flex justify-center mb-8 mt-9">
            <div className="rounded-full  bg-[#ffffff] w-[50px] h-[50px] pt-[7px] pl-[7px] mx-4">
              <RiKakaoTalkFill size={36} color="#191f28" />
            </div>
            <div className="rounded-full bg-[#ffffff] w-[50px] h-[50px] pt-[7px] pl-[7px] mx-4">
              <MdOutlineEmail size={36} color="#191f28" />
            </div>
            <div className="rounded-full bg-[#ffffff] w-[50px] h-[50px] pt-[7px] pl-[7px] mx-4">
              <FaInstagram size={36} color="#191f28" />
            </div>
          </div>
          <div className="text-xl fontBold">spell-checker.co.kr ⓒ 2024</div>
          <div className="mb-8 text-sm leading-loose">최종 업데이트: 2024.09</div>
        </div>
      </div>
    </>
  );
});

export default Footer;
