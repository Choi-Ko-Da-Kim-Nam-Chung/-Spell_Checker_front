import React, { forwardRef, useState, useEffect } from 'react';
import { images } from '../../utils/images';

const TextBox = ({ index, selectedTextBox, handleClick, title, content }) => (
  <div className="flex lg:mb-8">
    <div
      className={`relative -top-[80px] left-[22px] lg:-top-[112px] lg:left-[21px] ${
        index === 0 ? '' : 'bg-[#e3e3e3]'
      } h-[80px] lg:h-[114px] w-1`}></div>
    <div
      className={`z-10 w-[40px] h-[40px] text-center text-xl text-[#5e75ee] fontBlack rounded-full border-4 border-[#e3e3e3] pt-0.5 ${
        selectedTextBox === index ? 'bg-[#5e75ee] border-none text-[#ffffff] pt-[6px]' : ''
      }`}
      onClick={() => handleClick(index)}>
      {index + 1}
    </div>
    <div
      className={`w-[250px] p-5 rounded-[20px] -mt-4 mb-3 duration-500 hover:translate-y-[-5px] ml-12 cursor-pointer ${
        selectedTextBox === index ? 'bg-white textBoxShadow' : ''
      }`}
      onClick={() => handleClick(index)}>
      <div className="mb-2 text-xl fontBold">{title}</div>
      <div className="text-base">{content}</div>
    </div>
  </div>
);

const ThirdSection = forwardRef((props, ref) => {
  const [selectedTextBox, setSelectedTextBox] = useState(0);

  const handleTextBoxClick = index => {
    setSelectedTextBox(index);
  };

  const selectedImage = () => {
    switch (selectedTextBox) {
      case 0:
        return images.mainIntro;
      case 1:
        return images.howToUse2;
      case 2:
        return images.howToUse3;
      default:
        return images.mainIntro;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedTextBox(prevTextBox => (prevTextBox === 2 ? 0 : prevTextBox + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative z-10 flex flex-col justify-center w-11/12 mx-auto mt-20 lg:min-h-screen lg:mt-28"
      ref={reviewRef => (ref.current[1] = reviewRef)}>
      <div className="mt-14 text-[28px] text-center lg:text-[40px] fontBold">이용방법</div>
      <div className="flex flex-col justify-center w-11/12 mx-auto mt-16 lg:flex-row lg:my-auto lg:w-full">
        <div className="lg:mr-24">
          <TextBox
            index={0}
            selectedTextBox={selectedTextBox}
            handleClick={handleTextBoxClick}
            title="파일 업로드"
            content="내가 수정하고 싶은 파일이나 텍스트를 넣어주세요."
          />
          <TextBox
            index={1}
            selectedTextBox={selectedTextBox}
            handleClick={handleTextBoxClick}
            title="맞춤법 검사"
            content="직접 수정과 추천수정을 통해 올바른 맞춤법으로 수정하세요."
          />
          <TextBox
            index={2}
            selectedTextBox={selectedTextBox}
            handleClick={handleTextBoxClick}
            title="파일 출력"
            content="맞춤법 검사를 통해 수정된 파일을 다운받아 보세요!"
          />
        </div>
        <div className="w-[350px] mx-auto lg:mx-0 my-12 h-fit lg:w-[600px] shadow-lg rounded-[30px] lg:rounded-[50px] my-auto">
          <img src={selectedImage()} alt="이용방법 사진" className="rounded-[30px] lg:rounded-[50px]" />
        </div>
      </div>
    </div>
  );
});

export default ThirdSection;
