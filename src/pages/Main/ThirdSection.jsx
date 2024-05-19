import React, { forwardRef, useState, useEffect } from 'react';
import { images } from '../../utils/images';

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
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div
        className="flex flex-col justify-center mt-28 relative z-10  min-h-screen w-11/12 mx-auto"
        ref={reviewRef => (ref.current[1] = reviewRef)}>
        <div className="mt-14 text-center text-[40px] fontBold ">이용방법</div>
        <div className="flex justify-center my-auto mx-auto">
          <div className="mr-24">
            <div>
              <div className="flex mb-8">
                <div className="relative -top-[112px] left-[21px] h-[114px] w-1"></div>
                <div
                  className={`w-[40px] h-[40px] text-center text-xl text-[#5e75ee] fontBlack rounded-full border-4 border-[#e3e3e3] pt-0.5 ${
                    selectedTextBox === 0 ? 'bg-[#5e75ee] border-none text-[#ffffff] pt-1.5' : ''
                  }`}
                  onClick={() => handleTextBoxClick(0)}>
                  1
                </div>
                <div
                  className={`textBox w-[250px] p-5 rounded-[20px] -mt-4 mb-3 duration-500 hover:translate-y-[-5px] ml-12 cursor-pointer ${
                    selectedTextBox === 0 ? 'bg-white textBoxShadow' : ''
                  }`}
                  onClick={() => handleTextBoxClick(0)}>
                  <div className="text-xl fontBold mb-2">파일 업로드</div>
                  <div>
                    내가 수정하고 싶은 파일이나 <br />
                    텍스트를 넣어주세요.
                  </div>
                </div>
              </div>
              <div className="flex mb-8">
                <div className="relative -z-10 -top-[112px] left-[21px] bg-[#e3e3e3] h-[114px] w-1"></div>
                <div
                  className={`w-[40px] h-[40px] text-center text-xl text-[#5e75ee] fontBlack rounded-full border-4 border-[#e3e3e3] pt-0.5 ${
                    selectedTextBox === 1 ? 'bg-[#5e75ee] border-none text-[#ffffff] pt-1.5' : ''
                  }`}
                  onClick={() => handleTextBoxClick(1)}>
                  2
                </div>
                <div
                  className={`textBox w-[250px] p-5 rounded-[20px] -mt-4 mb-3 duration-500 hover:translate-y-[-5px] ml-12 cursor-pointer ${
                    selectedTextBox === 1 ? 'bg-white textBoxShadow' : ''
                  }`}
                  onClick={() => handleTextBoxClick(1)}>
                  <div className="text-xl fontBold mb-2">맞춤법 검사</div>
                  <div>
                    직접 수정과 추천수정을 통해 <br />
                    올바른 맞춤법으로 수정하세요.
                  </div>
                </div>
              </div>
              <div className="flex mb-8">
                <div className="relative -z-10 -top-[112px] left-[21px] bg-[#e3e3e3] h-[114px] w-1"></div>
                <div
                  className={`w-[40px] h-[40px] text-center text-xl text-[#5e75ee] fontBlack rounded-full border-4 border-[#e3e3e3] pt-0.5 ${
                    selectedTextBox === 2 ? 'bg-[#5e75ee] border-none text-[#ffffff] pt-1.5' : ''
                  }`}
                  onClick={() => handleTextBoxClick(2)}>
                  3
                </div>
                <div
                  className={`textBox w-[250px] p-5 rounded-[20px] -mt-4 mb-3 duration-500 hover:translate-y-[-5px] ml-12 cursor-pointer ${
                    selectedTextBox === 2 ? 'bg-white textBoxShadow' : ''
                  }`}
                  onClick={() => handleTextBoxClick(2)}>
                  <div className="text-xl fontBold mb-2">파일 출력</div>
                  <div>
                    맞춤법 검사를 통해 수정된 <br />
                    파일을 다운받아 보세요!
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-[600px]">
            <img src={selectedImage()} alt="이용방법 사진" className="shadow-lg rounded-[50px]" />
          </div>
        </div>
      </div>
    </>
  );
});

export default ThirdSection;
