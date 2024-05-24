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
  const [loading, setLoading] = useState(false); // 로딩 상태 관리
  const [showPopup, setShowPopup] = useState(false); // 팝업 표시 여부 상태 관리
  const [inputType, setInputType] = useState('file'); // 파일 또는 텍스트 입력 상태 관리
  const [selectedFile, setSelectedFile] = useState(null); // 선택된 파일 상태 관리
  const [text, setText] = useState(''); // 텍스트 입력 상태 관리
  const [checkerType, setCheckerType] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [checkerName, setCheckerName] = useState(''); // 검사명 상태 관리
  const [modalVisible, setModalVisible] = useState(false); // 확장자 관련 모달 상태 추가
  const [modalMessage, setModalMessage] = useState(''); // 확장자 관련 모달 상태 메시지

  const textChange = e => {
    setText(e.target.value); // 텍스트 변경 처리
  };

  const handleFileChange = e => {
    // 현재 지원하지 않는 확장자 메시지
    const file = e.target.files[0];
    if (file) {
      const supportedExtensions = ['docx', 'hwp'];
      const extension = file.name.split('.').pop().toLowerCase();
      if (supportedExtensions.includes(extension)) {
        setSelectedFile(file);
        setCheckerName(file.name);
      } else {
        setSelectedFile(null);
        setModalMessage('현재 지원하지 않는 확장자입니다!');
        setModalVisible(true);
      }
    }
  };

  const handleTypeChange = e => {
    setCheckerType(e.target.value);
  };

  const handleCheckerNameChange = e => {
    setCheckerName(e.target.value); // 검사명 변경 처리
  };

  const handleStartCheck = async () => {
    if (inputType === 'file' && selectedFile && checkerType) {
      setShowPopup(true); // 팝업 표시
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', checkerType);

      try {
        const response = await axios.post('https://api.spell-checker.co.kr/grammar-check/scan', formData);
        navigate('/checker', { state: { data: response.data, originalFile: selectedFile, checkerName } });
      } catch (error) {
        console.error('Error:', error.message);
        alert('파일과 검사 유형을 선택해주세요.');
      } finally {
        setShowPopup(false); // 팝업 숨기기
      }
    } else {
      alert('파일과 검사 유형을 선택해주세요.');
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-10 rounded-lg w-3/12 shadow-lg flex flex-col items-center">
            <div className="text-lg text-center font-bold">{modalMessage}</div>
            <button
              onClick={() => setModalVisible(false)}
              className="mt-8 py-2 px-4 border-2 border-black font-bold rounded-xl transition duration-300 ease-in-out hover:bg-gray-700 hover:text-white hover:border-transparent">
              닫기
            </button>
          </div>
        </div>
      )}
      {/* 여기까지 모달창 코드 */}
      <div className="min-h-screen">
        <div className="w-10/12 bg-white rounded-xl shadow-md flex flex-col mx-auto items-center mt-24 p-4">
          <div className="text-3xl fontBold w-11/12 border-l-8 border-[#303A6E] pl-4 py-3 mt-4 flex justify-between">
            <div>문서 업로드</div>
          </div>
          {showManual && (
            <div className="absolute right-44 top-56 z-20 rounded-lg shadow-2xl w-4/12">
              <div className="bg-white p-8 rounded-lg">
                <div className="flex justify-between">
                  <div className="text-xl font-bold">사용설명서</div>
                  <button onClick={() => setShowManual(false)}>
                    <IoClose size="25" />
                  </button>
                </div>
                <div className="border mt-2"></div>
                <div className="p-1 mt-2 leading-loose flex">
                  <div className="mr-1">
                    <div>1.</div>
                    <div>2.</div>
                    <div>3.</div>
                  </div>
                  <div>
                    <div>맞춤법 검사를 하실 파일 및 텍스트를 업로드해주세요.</div>
                    <div>검사명을 입력해주세요.(입력하신 검사명으로 파일이 다운됩니다.)</div>
                    <div>검사유형을 선택 후 검사 시작 버튼을 눌러주세요.</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center w-11/12 px-1 justify-end text-base text-[#c8c8c8]">
            <div className="flex items-center cursor-pointer" onClick={() => setShowManual(true)}>
              <img src={images.Question} alt="물음표 아이콘" className="w-4 h-4 mx-2" />
              <div>사용설명서</div>
            </div>
          </div>
          <div className="flex w-11/12 justify-around p-12 my-4 border-t-4 border-b-4 border-slate-700">
            {inputType === 'file' ? (
              <div className="w-1/2 flex justify-center">
                <label className="w-80 h-80 bg-neutral-50 rounded-[10px] border border-dashed border-neutral-400 flex justify-center items-center cursor-pointer">
                  <input type="file" className="hidden" onChange={handleFileChange} />
                  {selectedFile ? (
                    <div className="text-neutral-400 text-xl">{selectedFile.name}</div>
                  ) : (
                    <>
                      <img src="./assets/images/file_upload.png" alt="파일 업로드 아이콘" className="size-16" />
                      <div className="mt-5 text-neutral-400 text-xl">Drag file to upload</div>
                    </>
                  )}
                </label>
              </div>
            ) : (
              <div className="flex flex-col items-center w-1/2">
                <div className="w-80 flex flex-col bg-white border border-zinc-300">
                  <div className="bg-stone-50 text-center p-2 border border-zinc-300 text-sm">문서 내용</div>
                  <textarea
                    id="textArea"
                    className="w-full h-64 p-4 bg-white border-none rounded-md resize-none"
                    placeholder="텍스트를 입력해주세요."
                    value={text}
                    onChange={textChange}></textarea>
                </div>
                <div className="text-right w-80">{`${text.length}/1000자`}</div>
              </div>
            )}
            <div className="flex flex-col w-1/2">
              <div className="flex flex-col pb-10">
                <div className="flex items-center">
                  <img src="./assets/images/list_disc.png" alt="리스트 원" className="mr-4" />
                  <span className="text-lg font-medium w-14">검사명</span>
                  <input
                    className="p-1 h-8 bg-white border border-zinc-400 rounded w-7/12 ml-10"
                    value={checkerName}
                    onChange={handleCheckerNameChange}
                  />
                </div>
                <div className="ml-28 pl-2 mt-4 text-neutral-400 text-opacity-95 text-xs">
                  * 파일 다운 시 작성하신 검사명으로 파일 명이 작성됩니다.
                </div>
              </div>
              <div className="flex items-center pb-4">
                <img src="./assets/images/list_disc.png" alt="리스트 원" className="mr-4" />
                <span className="text-lg font-medium">검사 유형</span>
                <select onChange={handleTypeChange} className="ml-6 border border-zinc-400 rounded p-1">
                  <option value="">선택</option>
                  <option value="BUSAN_UNIV">부산대 맞춤법 검사기</option>
                  <option value="INCRUIT">인크루트 맞춤법 검사기</option>
                  <option value="JOB_KOREA">잡코리아 맞춤법 검사기</option>
                </select>
              </div>
              <div className="flex items-center w-full mt-5">
                <div className="flex items-center">
                  <img src="./assets/images/list_disc.png" alt="리스트 원" className="mr-4" />
                  <span className="text-lg font-medium">검사설정</span>
                  <div className="flex items-center">
                    <div className="flex items-center ml-7">
                      <input
                        type="radio"
                        id="file"
                        name="inputType"
                        value="file"
                        checked={inputType === 'file'}
                        onChange={e => setInputType(e.target.value)}
                      />
                      <label htmlFor="file" className="ml-2">
                        파일
                      </label>
                    </div>
                    <div className="flex items-center ml-20">
                      <input
                        type="radio"
                        id="text"
                        name="inputType"
                        value="text"
                        checked={inputType === 'text'}
                        onChange={e => setInputType(e.target.value)}
                      />
                      <label htmlFor="text" className="ml-2">
                        텍스트
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-neutral-400 text-xs leading-normal pt-2 pl-28 ml-1">
                <div className="font-bold">
                  * 파일 참고란
                  <br />
                </div>
                <div>
                  &nbsp;허용 확장자 : *.docx, *.txt, *.hwp
                  <br />
                  &nbsp;문서 첨부 제한 : 0Byte/ 100.0MB
                  <br />
                  &nbsp;파일 제한 크기 : 100MB
                  <br />
                </div>
              </div>
            </div>
          </div>
          <div className="w-11/12 mt-1 flex justify-end items-center">
            <button
              onClick={handleStartCheck}
              className="text-white w-32 h-10 bg-slate-700 font-medium rounded-2xl mr-4">
              검사 시작
            </button>
            <button onClick={goBack} className="w-32 h-10 bg-zinc-100 rounded-2xl border border-stone-300">
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
