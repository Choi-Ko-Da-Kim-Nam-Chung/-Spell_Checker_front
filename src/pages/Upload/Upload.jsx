import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Nav from '../../components/Nav';
import { images } from '../../utils/images';
import { IoClose } from 'react-icons/io5';
import Lottie from 'lottie-react';
import loadingLottie from '../../utils/loading.json';

function Upload() {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false); // 팝업 표시 여부 상태 관리
  const [inputType, setInputType] = useState('file'); // 파일 또는 텍스트 입력 상태 관리
  const [selectedFile, setSelectedFile] = useState(null); // 선택된 파일 상태 관리
  const [text, setText] = useState(''); // 텍스트 입력 상태 관리
  const [checkerType, setCheckerType] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [checkerName, setCheckerName] = useState(''); // 검사명 상태 관리
  const [modalVisible, setModalVisible] = useState(false); // 확장자 관련 모달 상태 추가
  const [modalMessage, setModalMessage] = useState(''); // 확장자 관련 모달 상태 메시지
  const [fileSize, setFileSize] = useState('0'); // 파일 크기를 저장할 상태 변수
  const [isCheckerNameValid, setIsCheckerNameValid] = useState(true); // 검사명 유효성 상태 관리

  const textChange = e => {
    setText(e.target.value); // 텍스트 변경 처리
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      const supportedExtensions = ['docx', 'hwp'];
      const extension = file.name.split('.').pop().toLowerCase();
      if (supportedExtensions.includes(extension)) {
        setSelectedFile(file);
        setCheckerName(file.name);
        // 파일 크기 상태 업데이트
        const size = (file.size / 1024).toFixed(2); // 바이트를 킬로바이트로 변환하고 소수점 둘째 자리에서 반올림
        setFileSize(size > 1024 ? `${(size / 1024).toFixed(2)}MB` : `${size}KB`); // 필요한 경우 킬로바이트를 메가바이트로 변환
      } else {
        setSelectedFile(null);
        setFileSize('0'); // 파일이 선택되지 않은 경우 파일 크기 리셋
        setModalMessage('서식 유지 맞춤법 검사기는\n .docx, .hwp 파일만 지원하고 있습니다.');
        setModalVisible(true);
      }
    } else {
      setFileSize('0'); // 파일 선택이 없는 경우 파일 크기 리셋
    }
    e.target.value = ''; // 파일 입력 필드 초기화
  };

  const handleTypeChange = e => {
    setCheckerType(e.target.value);
  };

  const handleCheckerNameChange = e => {
    const name = e.target.value;
    setCheckerName(name); // 검사명 변경 처리
    validateCheckerName(name);
  };

  const handleStartCheck = async () => {
    if (inputType === 'file' && selectedFile && checkerType && isCheckerNameValid) {
      setShowPopup(true); // 팝업 표시
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', checkerType);

      try {
        const response = await axios.post('http://3.34.51.88:8080/grammar-check/scan', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        const jsonData = response.data;
        console.log('Received JSON data:');
        console.log(JSON.stringify(jsonData, null, 2)); // JSON 데이터를 문자열로 변환하여 출력, 보기 좋게 포맷팅
        navigate('/checker', { state: { data: jsonData, originalFile: selectedFile, checkerName } });
      } catch (error) {
        console.error('파일 업로드 실패:', error.message);
        alert('파일 업로드에 실패했습니다. 관리자에게 문의해주세요.');
      } finally {
        setShowPopup(false);
      }
    } else {
      alert('파일을 선택하고 확장자를 확인하세요.');
    }
  };

  const validateCheckerName = name => {
    if (name) {
      const supportedExtensions = ['hwp', 'docx'];
      const extension = name.split('.').pop().toLowerCase();
      setIsCheckerNameValid(supportedExtensions.includes(extension));
    } else {
      setIsCheckerNameValid(true);
    }
  };

  const goBack = () => {
    navigate(-1); // 이전 페이지로 이동
  };

  return (
    <>
      <Nav />
      {/* hwp, docx 외의 확장자 파일 업로드시 모달 창 등장 */}
      {modalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col items-center w-4/12 p-10 bg-white rounded-lg shadow-lg">
            <div className="text-xl text-center whitespace-pre-wrap fontBold">{modalMessage}</div>
            <button
              onClick={() => setModalVisible(false)}
              className="px-4 py-2 mt-4 font-bold transition duration-300 ease-in-out border-2 border-black rounded-xl hover:bg-gray-700 hover:text-white hover:border-transparent">
              확인
            </button>
          </div>
        </div>
      )}
      {/* 여기까지 모달창 코드 */}
      <div className="min-h-screen">
        <div className="flex flex-col items-center w-10/12 p-4 mx-auto mt-24 bg-white shadow-md rounded-xl">
          <div className="text-xl lg:text-3xl fontBold w-11/12 border-l-[6px] lg:border-l-8 border-[#303A6E] pl-2 lg:pl-4 py-2 lg:py-3 mt-4 flex justify-between">
            문서 업로드
          </div>
          {showManual && (
            <div className="absolute z-20 lg:w-[400px] rounded-lg shadow-2xl lg:right-44 top-56">
              <div className="p-8 bg-white rounded-lg">
                <div className="flex justify-between">
                  <div className="font-bold lg:text-xl">사용설명서</div>
                  <button onClick={() => setShowManual(false)}>
                    <IoClose size="25" />
                  </button>
                </div>
                <div className="mt-2 border"></div>
                <div className="flex p-1 mt-2 text-sm leading-loose">
                  <div className="mr-1">
                    <div>1.</div>
                    <div>2.</div>
                    <div>3.</div>
                  </div>
                  <div>
                    <div>맞춤법 검사를 하실 파일을 업로드해주세요.</div>
                    <div>입력하신 검사명으로 파일이 다운됩니다.</div>
                    <div>파일크기 확인 후 검사 시작 버튼을 눌러주세요.</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center w-11/12 px-1 justify-end text-base text-[#c8c8c8]">
            <div className="flex items-center cursor-pointer" onClick={() => setShowManual(true)}>
              <img src={images.Question} alt="물음표 아이콘" className="w-3 h-3 mx-1 lg:mx-2 lg:w-4 lg:h-4" />
              <div className="text-xs lg:text-base">사용설명서</div>
            </div>
          </div>
          <div className="flex flex-col justify-around w-11/12 py-12 my-4 border-t-4 border-b-4 lg:p-12 lg:flex-row border-slate-700">
            <div className="flex justify-center mx-auto lg:w-1/2">
              <label className="w-40 h-40 lg:w-80 lg:h-80 bg-neutral-50 rounded-[10px] border border-dashed border-neutral-400 flex justify-center items-center cursor-pointer mb-12 lg:mb-0">
                <input type="file" className="hidden" onChange={handleFileChange} />
                {selectedFile ? (
                  <div className="text-xl text-neutral-400">{selectedFile.name}</div>
                ) : (
                  <div className="flex flex-col">
                    <img
                      src="./assets/images/file_upload.png"
                      alt="파일 업로드 아이콘"
                      className="mx-auto lg:size-16 size-8"
                    />
                    <div className="mt-5 lg:text-xl text-neutral-400">Drag file to upload</div>
                  </div>
                )}
              </label>
            </div>
            <div className="flex flex-col mx-auto my-auto lg:w-1/2">
              <div className="flex flex-col pb-10">
                <div className="flex items-center">
                  <img src="./assets/images/list_disc.png" alt="리스트 원" className="w-[6px] lg:w-[8px] mr-4" />
                  <div className="w-24 text-sm font-medium lg:text-lg whitespace-nowrap">검사명</div>
                  <input
                    className="h-6 w-[180px] p-1 bg-white border rounded lg:h-8 border-zinc-400 lg:w-7/12 "
                    value={checkerName}
                    onChange={handleCheckerNameChange}
                  />
                </div>
                <div className="pl-2 mt-1 text-[10px] lg:text-xs ml-28 text-neutral-400 text-opacity-95 whitespace-nowrap">
                  * 작성하신 검사명으로 파일이 다운됩니다.
                </div>
                {!isCheckerNameValid && checkerName && (
                  <div className="pl-2 mt-1 text-[10px] lg:text-xs text-red-500 ml-28 text-opacity-95 whitespace-nowrap">
                    * 확장자 명을 확인해주세요!
                  </div>
                )}
              </div>
              <div className="flex items-center pb-4">
                <img src="./assets/images/list_disc.png" alt="리스트 원" className="w-[6px] lg:w-[8px] mr-4" />
                <span className="w-24 text-sm font-medium lg:text-lg whitespace-nowrap">검사 유형</span>
                <select
                  onChange={handleTypeChange}
                  className="w-[180px] lg:w-7/12 p-1 text-xs border rounded lg:text-base border-zinc-400">
                  <option value="">선택</option>
                  <option value="BUSAN_UNIV" className="text-xs lg:text-base">
                    부산대 맞춤법 검사기
                  </option>
                  <option value="INCRUIT" className="text-xs lg:text-base">
                    인크루트 맞춤법 검사기
                  </option>
                  <option value="JOB_KOREA" className="text-xs lg:text-base">
                    잡코리아 맞춤법 검사기(현재 중단)
                  </option>
                </select>
              </div>
              <div className="flex items-center w-full mt-5">
                <div className="flex items-center">
                  <img src="./assets/images/list_disc.png" alt="리스트 원" className="w-[6px] lg:w-[8px] mr-4" />
                  <span className=" text-sm lg:text-lg font-medium w-[70px] whitespace-nowrap">파일 크기</span>
                  <div className="flex items-center text-sm text-stone-500 lg:text-base">
                    {/*
                    밑 div className에 추가 
                    ${
                        parseFloat(fileSize) > 20.0 ? 'text-red-500' : 'text-stone-500'
                      } 
                       */}
                    <div className="flex items-center ml-6 mr-1">{fileSize}</div>
                    <div> / 20.0MB</div>
                  </div>
                </div>
              </div>
              <div className="pt-2 ml-1 text-[10px] lg:text-xs leading-normal text-neutral-400 pl-28">
                <div className="font-bold">
                  * 파일 참고란
                  <br />
                </div>
                <div className="whitespace-nowrap">
                  &nbsp;허용 확장자 : *.docx, *.hwp
                  <br />
                  &nbsp;파일 제한 버전 : 한글2018 버전 이하
                  <br />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end w-11/12 mt-2 mb-5">
            <button
              onClick={handleStartCheck}
              className="w-20 h-8 mr-6 text-xs font-medium text-white lg:mr-4 rounded-xl lg:w-32 lg:h-10 bg-slate-700 lg:rounded-2xl lg:text-base">
              검사 시작
            </button>
            <button
              onClick={goBack}
              className="w-20 h-8 text-xs border lg:w-32 lg:h-10 bg-zinc-100 rounded-xl lg:rounded-2xl border-stone-300 lg:text-base">
              이전 화면
            </button>
          </div>
        </div>
      </div>
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg w-[500px]">
            <div className="">
              <Lottie animationData={loadingLottie} />
            </div>
            <div className="mt-4 text-lg text-center text-gray-400">시간이 다소 소요될 수 있습니다...</div>
          </div>
        </div>
      )}
    </>
  );
}

export default Upload;
