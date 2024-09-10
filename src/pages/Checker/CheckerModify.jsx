import React, { useState, useEffect, useRef } from 'react';
import { FaRegCheckCircle } from 'react-icons/fa';

const CheckerModify = ({ data, onUpdateData, onBoxClick }) => {
  const [errors, setErrors] = useState([]); // 오류 목록을 상태로 관리
  const [refresh, setRefresh] = useState(false); // 데이터 갱신 여부를 상태로 관리
  const isApplyingChanges = useRef(false); // 변경 적용 중 여부를 관리하는 Ref

  // 데이터가 업데이트될 때마다 오류 목록을 추출하는 useEffect
  useEffect(() => {
    if (!data || !data.body) return;

    // 데이터를 순회하며 오류 정보를 추출하는 함수
    const extractErrors = (item, errors = []) => {
      // PARAGRAPH 유형의 데이터를 처리
      if (item.type === 'PARAGRAPH' && item.errors) {
        item.errors.forEach(error => {
          errors.push({
            paragraphId: item.id,
            originalText: error.orgStr, // 원본 텍스트
            replacementOptions: error.candWord || [], // 추천 수정 옵션
            selectedReplacement: error.candWord?.length === 1 ? error.candWord[0] : '', // 추천 수정 자동 선택
            userText: '', // 사용자가 입력한 수정 텍스트
            checkedSection: null, // 현재 선택된 수정 섹션
            start: error.start,
            end: error.end,
            originalStart: error.start, // 원본 인덱스를 유지
            originalEnd: error.end, // 원본 인덱스를 유지
            errorIdx: error.errorIdx,
            replaceStr: error.replaceStr || null, // replaceStr 초기화
          });
        });
      }
      // 내부 섹션, 테이블, 주석 등을 재귀적으로 처리
      if (item.ibody) {
        item.ibody.forEach(subItem => extractErrors(subItem, errors));
      }
      if (item.table) {
        item.table.forEach(row => row.forEach(cell => extractErrors(cell, errors)));
      }
      if (item.notes) {
        item.notes.forEach(note => {
          const noteIndex = note.noteNum - 1;
          const noteType = note.noteInfoType === 'FOOT_NOTE' ? 'footNote' : 'endNote';
          if (data[noteType] && data[noteType][noteIndex]) {
            data[noteType][noteIndex].forEach(noteItem => extractErrors(noteItem, errors));
          }
        });
      }
      return errors;
    };

    // 추출된 오류 목록을 상태로 저장
    setErrors(extractErrors({ ibody: data.body }));
  }, [data, refresh]);

  // 사용자가 추천 수정 옵션을 선택했을 때 처리하는 함수
  const handleReplacementSelection = (index, selectedOption) => {
    if (isApplyingChanges.current) return;
    setErrors(prevErrors =>
      prevErrors.map((error, i) =>
        i === index
          ? {
              ...error,
              selectedReplacement: selectedOption,
              replaceStr: selectedOption, // replaceStr 업데이트
              checkedSection: 'replacement', // 선택된 섹션을 업데이트
            }
          : error,
      ),
    );
  };

  // 사용자가 직접 수정 텍스트를 입력했을 때 처리하는 함수
  const handleUserTextChange = (index, text) => {
    if (isApplyingChanges.current) return;
    setErrors(prevErrors =>
      prevErrors.map((error, i) =>
        i === index
          ? {
              ...error,
              userText: text,
              replaceStr: text, // replaceStr 업데이트
              checkedSection: 'user', // 선택된 섹션을 'user'로 업데이트
            }
          : error,
      ),
    );
  };

  // 수정 섹션의 선택을 토글하는 함수
  const toggleCheck = (index, section) => {
    if (isApplyingChanges.current) return;
    setErrors(prevErrors =>
      prevErrors.map((error, i) =>
        i === index
          ? {
              ...error,
              checkedSection: error.checkedSection === section ? null : section,
            }
          : error,
      ),
    );
  };

  // 변경 사항을 적용하는 함수
  const applyChanges = () => {
    if (isApplyingChanges.current) return;
    isApplyingChanges.current = true;

    // 데이터를 깊게 복사하여 작업
    const updatedData = JSON.parse(JSON.stringify(data));
    let isValid = true;

    const appliedModifications = new Set();

    // 본문 내용을 순회하며 오류를 수정
    const updateContent = body => {
      body.forEach(section => {
        if (section.type === 'PARAGRAPH' && section.errors && section.errors.length > 0) {
          section.errors.forEach(error => {
            const errorToApply = errors.find(
              e => e.paragraphId === section.id && e.start === error.start && e.errorIdx === error.errorIdx,
            );

            if (errorToApply && !appliedModifications.has(`${section.id}-${error.start}-${error.errorIdx}`)) {
              appliedModifications.add(`${section.id}-${error.start}-${error.errorIdx}`);

              // 사용자가 선택한 수정사항에 따라 replaceStr 업데이트
              if (errorToApply.checkedSection === 'original') {
                error.replaceStr = errorToApply.originalText;
              } else if (errorToApply.checkedSection === 'replacement') {
                error.replaceStr = errorToApply.selectedReplacement;
              } else if (errorToApply.checkedSection === 'user') {
                error.replaceStr = errorToApply.userText;
                if (!errorToApply.userText.trim()) {
                  isValid = false;
                }
              }

              // start, end 인덱스를 원본으로 유지
              error.start = errorToApply.originalStart;
              error.end = errorToApply.originalEnd;
            }
          });
        }

        // 테이블, 주석 등의 섹션을 재귀적으로 처리
        if (section.table) {
          section.table.forEach(row => row.forEach(cell => updateContent(cell.ibody)));
        }

        if (section.notes) {
          section.notes.forEach(note => {
            const noteIndex = note.noteNum - 1;
            const noteType = note.noteInfoType === 'FOOT_NOTE' ? 'footNote' : 'endNote';
            if (data[noteType] && data[noteType][noteIndex]) {
              data[noteType][noteIndex].forEach(noteItem => updateContent([noteItem]));
            }
          });
        }
      });
    };

    // 본문 내용 업데이트
    updateContent(updatedData.body);

    // 유효하지 않은 입력이 있는 경우 경고
    if (!isValid) {
      alert('직접 수정할 내용을 입력해주세요.');
      isApplyingChanges.current = false;
    } else {
      onUpdateData(updatedData); // 수정된 데이터 전달
      setRefresh(prev => !prev); // 데이터 갱신
      isApplyingChanges.current = false;
    }
  };

  return (
    <div className="flex flex-col h-[40vh] lg:h-[60vh] lg:w-[30%]">
      <div className="sticky top-0 h-10 pb-3 bg-slate-700 lg:h-14">
        <div className="pt-2.5 pl-5 text-sm text-white lg:pt-3 lg:text-lg fontSB">수정하기</div>
      </div>
      <div className="w-full h-full overflow-y-scroll bg-white border-b border-r border-stone-300 scroll">
        {errors.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-xl fontBold">추천 수정사항이 없습니다!</div>
          </div>
        ) : (
          errors.map((error, index) => (
            <div
              key={`${error.start}-${error.errorIdx}-${index}`}
              id={`modifyBox-${error.start}-${error.errorIdx}`}
              className="px-4 pb-1 text-xs lg:text-sm modifyBox"
              onClick={() => onBoxClick(error.start, error.errorIdx)}
              style={{ cursor: 'pointer' }}>
              <div className="flex items-center my-2">
                <div className="mr-5 text-black fontBold whitespace-nowrap">기존 내용</div>
                <div className="text-red-500 fontBold">{error.originalText}</div>
                <FaRegCheckCircle
                  size="18"
                  className={`cursor-pointer ml-auto ${
                    error.checkedSection === 'original' ? 'text-slate-700' : 'text-gray-300'
                  }`}
                  onClick={() => toggleCheck(index, 'original')}
                />
              </div>
              <div className="flex items-center my-4">
                <div className="mr-5 text-black fontBold whitespace-nowrap">추천 수정</div>
                {error.replacementOptions.length > 1 ? (
                  <>
                    <select
                      value={error.selectedReplacement}
                      onChange={e => handleReplacementSelection(index, e.target.value)}>
                      <option value="">선택하세요</option>
                      {error.replacementOptions.map((option, optIndex) => (
                        <option key={optIndex} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <FaRegCheckCircle
                      size="18"
                      className={`cursor-pointer ml-auto ${
                        error.checkedSection === 'replacement' ? 'text-slate-700' : 'text-gray-300'
                      }`}
                      onClick={() => toggleCheck(index, 'replacement')}
                    />
                  </>
                ) : (
                  <>
                    <div className="fontBold">{error.replacementOptions[0]}</div>
                    <FaRegCheckCircle
                      size="18"
                      className={`cursor-pointer ml-auto ${
                        error.checkedSection === 'replacement' ? 'text-slate-700' : 'text-gray-300'
                      }`}
                      onClick={() => toggleCheck(index, 'replacement')}
                    />
                  </>
                )}
              </div>
              <div className="flex my-4">
                <div className="mr-4 text-black fontBold whitespace-nowrap">직접 수정</div>
                <input
                  type="text"
                  className="w-2/3 pl-1"
                  placeholder="원하는 대치어를 입력하세요."
                  value={error.userText}
                  onChange={e => handleUserTextChange(index, e.target.value)}
                />
                <FaRegCheckCircle
                  size="18"
                  className={`cursor-pointer ml-auto ${
                    error.checkedSection === 'user' ? 'text-slate-700' : 'text-gray-300'
                  }`}
                  onClick={() => toggleCheck(index, 'user')}
                />
              </div>
              <div className="flex justify-end">
                <button
                  className="text-white text-[10px] lg:text-xs px-4 lg:px-5 py-1.5 bg-slate-700 lg:fontBold rounded-[12px] lg:rounded-[14px]"
                  onClick={applyChanges}>
                  적용
                </button>
              </div>
              <hr className="w-full my-2 border border-gray-200" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CheckerModify;
