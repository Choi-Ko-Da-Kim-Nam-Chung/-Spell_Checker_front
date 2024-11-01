import React, { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Nav from '../../components/Nav';
import CheckerFile from './CheckerFile';
import CheckerModify from './CheckerModify';
import { images } from '../../utils/images';
import Predata2 from '../../utils/data2.json';
import { IoClose } from 'react-icons/io5';

function Checker() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = location.state?.data || Predata2; // 초기 데이터 로드
  const originalDocxFile = location.state?.originalFile; // 전달받은 원본 파일
  const checkerName = location.state?.checkerName || 'modified_document'; // 전달받은 검사명, 기본값 설정
  const [data, setData] = useState(addUniqueIds(initialData)); // 고유 ID 추가된 데이터로 초기화
  const [showManual, setShowManual] = useState(false);
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [fileBlob, setFileBlob] = useState(null);
  const [modifiedText, setModifiedText] = useState({});

  const fileRef = useRef(null);
  const modifyRef = useRef(null);

  function addUniqueIds(data) {
    // 고유 ID 추가 함수 (errors의 오류텍스트 식별)
    let idCounter = 0;

    function addIdToSection(section) {
      section.id = idCounter++;
      if (section.ibody) {
        section.ibody.forEach(subSection => addIdToSection(subSection));
      }
      if (section.table) {
        section.table.forEach(row => row.forEach(cell => addIdToSection(cell)));
      }
    }

    data.body.forEach(section => addIdToSection(section));
    return data;
  }

  const handleUpdateData = updatedData => {
    setData(updatedData);
    setModifiedText(modifiedText => ({
      ...modifiedText,
      ...updatedData.modifiedText,
    }));
  };

  const handleTextClick = (start, errorIdx) => {
    const modifyBox = document.getElementById(`modifyBox-${start}-${errorIdx}`);
    
  };

  const handleBoxClick = (start, errorIdx) => {
    const errorText = document.getElementById(`errorText-${start}-${errorIdx}`);
    
  };

  const finishEdit = async () => {
    const formData = new FormData();
    formData.append('file', originalDocxFile);
    formData.append('data', JSON.stringify(data));
    console.log(data);

    try {
      const response = await axios.post('http://localhost:8080/grammar-check/apply', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
      });
      console.log(response.data);
      setFileBlob(new Blob([response.data], { type: response.headers['content-type'] }));
      setShowDownloadPopup(true);
    } catch (error) {
      console.error('Error sending data:', error);
    }
  };

  const downloadFile = () => {
    if (fileBlob) {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(fileBlob);
      link.download = `${checkerName}`;
      link.click();
      window.URL.revokeObjectURL(link.href);
      setShowDownloadPopup(false);
    }
  };

  const fileExtension = checkerName.split('.').pop().toLowerCase();
  const fileIcon = fileExtension === 'docx' ? images.DocxIcon : fileExtension === 'hwp' ? images.HwpIcon : null;

  const onClose = () => {
    navigate(-1);
  };

  return (
    <>
      <Nav />
      <div className="min-h-screen">
        <div className="flex flex-col items-center w-10/12 p-4 mx-auto mt-12 bg-white shadow-md lg:mt-24 rounded-xl">
          <div className="text-xl lg:text-3xl fontBold w-11/12 border-l-[6px] lg:border-l-8 border-[#303A6E] pl-2 lg:pl-4 py-2 lg:py-3 mt-4 flex justify-between">
            맞춤법 검사
          </div>
          <div className="flex items-center w-11/12 px-1 justify-between text-base text-[#a9a9a9]">
            <div className="text-[10px] lg:text-sm">** 본 내용에서 서식은 무시됩니다.</div>
            <div className="flex items-center cursor-pointer" onClick={() => setShowManual(true)}>
              <img src={images.Question} alt="물음표 아이콘" className="w-3 h-3 mx-1 lg:mx-2 lg:w-4 lg:h-4" />
              <div className="text-xs lg:text-base">사용설명서</div>
            </div>
          </div>
          {showManual && (
            <div>
              <div className="absolute w-[320px] right-8 z-20 lg:w-[400px] rounded-lg shadow-2xl lg:right-44 lg:top-56">
                <div className="p-5 bg-white rounded-lg lg:p-8">
                  <div className="flex justify-between">
                    <div className="text-sm font-bold lg:text-xl">사용설명서</div>
                    <button onClick={() => setShowManual(false)}>
                      <IoClose size="25" />
                    </button>
                  </div>
                  <div className="mt-2 border"></div>
                  <div className="flex p-1 mt-2 text-xs leading-loose lg:text-base">
                    <div className="mr-1">
                      <div>1.</div>
                      <br />
                      <div>2.</div>
                      <br />
                      <div>3.</div>
                    </div>
                    <div>
                      <div>기존 내용을 유지하고 싶다면, 기존 내용 옆의 선택버튼을 누른 후 적용버튼을 눌러주세요.</div>
                      <div>
                        원하는 수정사항이 있으시다면, 직접 수정에 내용을 작성하시고, 선택 버튼 클릭 후 적용 버튼을
                        눌러주세요.
                      </div>
                      <div>전체적으로 수정이 완료되면, 수정 완료 버튼을 누른 후 파일을 다운받아주세요.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col justify-center w-11/12 h-full mt-2 lg:flex-row">
            <CheckerFile data={data} onTextClick={handleTextClick} modifiedText={modifiedText} />
            <CheckerModify data={data} onUpdateData={handleUpdateData} onBoxClick={handleBoxClick} />
          </div>
          <div className="flex items-center justify-end w-11/12 mt-4">
            <button
              className="px-6 py-2 mr-4 text-xs text-white lg:text-sm bg-slate-700 rounded-[14px]"
              onClick={finishEdit}>
              수정 완료
            </button>
            <button
              className="px-6 py-2 text-xs border lg:text-sm bg-zinc-100 rounded-[14px] border-stone-300"
              onClick={onClose}>
              이전 화면
            </button>
          </div>
        </div>
      </div>
      {showDownloadPopup && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white py-8 px-16 rounded-[40px] shadow-2xl">
            {fileIcon && (
              <div className="flex justify-center my-4">
                <img src={fileIcon} alt="File Icon" className="w-12 h-12" />
              </div>
            )}
            <div className="mb-4 text-lg font-bold text-center">파일을 다운하시겠습니까?</div>
            <div className="flex justify-center">
              <button
                className="px-4 py-2 mr-2 text-sm text-white bg-slate-700 fontBold rounded-2xl"
                onClick={downloadFile}>
                다운
              </button>
              <button
                className="px-4 py-2 text-sm border bg-zinc-100 rounded-2xl border-stone-300"
                onClick={() => setShowDownloadPopup(false)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Checker;
