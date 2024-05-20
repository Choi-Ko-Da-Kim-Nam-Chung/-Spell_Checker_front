import React, { useState, useEffect } from 'react';

const CheckerModify = ({ data, onUpdateData, onBoxClick }) => {
  const [errors, setErrors] = useState([]);

  // 데이터가 변경될 때 단락과 오류를 추출
  useEffect(() => {
    if (!data || !data.body) {
      return;
    }

    // 재귀적으로 단락을 추출
    const extractParagraphs = (item, paragraphs = []) => {
      if (item.type === 'PARAGRAPH') {
        paragraphs.push(item);
      }
      if (item.ibody) {
        item.ibody.forEach(subItem => extractParagraphs(subItem, paragraphs));
      }
      if (item.table) {
        item.table.forEach(row => row.forEach(cell => extractParagraphs(cell, paragraphs)));
      }
      return paragraphs;
    };

    const paragraphs = extractParagraphs({ ibody: data.body });
    const allErrors = paragraphs
      .filter(p => p.errors && p.errors.length > 0)
      .flatMap(p =>
        p.errors.map(error => ({
          paragraphId: p.id,
          originalText: error.orgStr,
          replacementOptions: error.candWord || [],
          selectedReplacement: error.candWord && error.candWord.length === 1 ? error.candWord[0] : '',
          userText: '',
          checkedSection: null,
          start: error.start,
          end: error.end,
        })),
      );

    setErrors(allErrors);
  }, [data]);

  // 드롭다운에서 교체 옵션을 선택
  const handleReplacementSelection = (index, selectedOption) => {
    setErrors(
      errors.map((error, i) =>
        i === index ? { ...error, selectedReplacement: selectedOption, checkedSection: 'replacement' } : error,
      ),
    );
  };

  // 사용자가 텍스트 입력을 변경할 때 호출
  const handleUserTextChange = (index, text) => {
    setErrors(errors.map((error, i) => (i === index ? { ...error, userText: text, checkedSection: 'user' } : error)));
  };

  // 체크 섹션을 원본, 교체 및 사용자 입력 간에 전환하는 함수
  const toggleCheck = (index, section) => {
    setErrors(
      errors.map((error, i) =>
        i === index ? { ...error, checkedSection: error.checkedSection === section ? null : section } : error,
      ),
    );
  };

  // 사용자가 선택하고 입력한 내용에 따라 데이터를 변경
  const applyChanges = () => {
    const updatedData = JSON.parse(JSON.stringify(data)); // 데이터 깊은 복사

    let isValid = true; // 모든 입력이 유효한지 여부를 추적

    const updateContent = body => {
      body.forEach(section => {
        if (section.type === 'PARAGRAPH' && section.errors && section.errors.length > 0) {
          section.errors.forEach(error => {
            const errorToApply = errors.find(e => e.paragraphId === section.id && e.start === error.start);
            if (errorToApply) {
              const { checkedSection, selectedReplacement, userText } = errorToApply;
              let newText;

              switch (checkedSection) {
                case 'original':
                  newText = error.orgStr; // 원본을 유지
                  break;
                case 'replacement':
                  newText = selectedReplacement; // 선택된 수정사항
                  break;
                case 'user':
                  newText = userText; // 사용자 입력
                  if (!newText.trim()) {
                    isValid = false; // 입력값이 비어 있으면 유효하지 않음
                    return;
                  }
                  break;
              }

              error.replaceStr = newText; // replaceStr 설정
            }
          });
        }
      });
    };

    updateContent(updatedData.body);

    if (!isValid) {
      alert('직접 수정할 내용을 입력해주세요.'); // 유효하지 않은 입력에 대한 경고
    } else {
      onUpdateData(updatedData); // 모든 검증을 통과했으면 업데이트된 데이터를 상태에 반영
    }
  };

  return (
    <div className="flex flex-col h-[60vh] w-[30%]">
      <div className="bg-slate-700 h-14 pb-3 sticky top-0">
        <div className="text-white text-lg pl-5 pt-3 fontSB">수정하기</div>
      </div>
      <div className="w-full h-full bg-white border-b border-r border-stone-300 scroll overflow-y-scroll">
        {errors.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-xl fontBold">추천 수정사항이 없습니다!</div>
          </div>
        ) : (
          errors.map((error, index) => (
            <div
              key={index}
              id={`modifyBox-${error.start}`}
              className="modifyBox px-4 pb-1 text-sm"
              onClick={() => onBoxClick(error.start)}
              style={{ cursor: 'pointer' }}>
              <div className="flex items-center my-2">
                <div className="text-black fontBold mr-5">기존 내용</div>
                <div className="fontBold text-red-500">{error.originalText}</div>
                <img
                  src={
                    error.checkedSection === 'original'
                      ? '/assets/images/after_check.png'
                      : '/assets/images/before_check.png'
                  }
                  alt="체크 표시"
                  onClick={() => toggleCheck(index, 'original')}
                  className="cursor-pointer ml-auto w-4 h-4"
                />
              </div>
              <div className="flex items-center my-4">
                <div className="text-black fontBold mr-5">추천 수정</div>
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
                    <img
                      src={
                        error.checkedSection === 'replacement'
                          ? '/assets/images/after_check.png'
                          : '/assets/images/before_check.png'
                      }
                      alt="체크 표시"
                      onClick={() => toggleCheck(index, 'replacement')}
                      className="cursor-pointer ml-auto w-4 h-4"
                    />
                  </>
                ) : (
                  <>
                    <div className="fontBold">{error.replacementOptions[0]}</div>
                    <img
                      src={
                        error.checkedSection === 'replacement'
                          ? '/assets/images/after_check.png'
                          : '/assets/images/before_check.png'
                      }
                      alt="체크 표시"
                      onClick={() => toggleCheck(index, 'replacement')}
                      className="cursor-pointer ml-auto w-4 h-4"
                    />
                  </>
                )}
              </div>
              <div className="flex my-4">
                <div className="text-black fontBold mr-4">직접 수정</div>
                <input
                  type="text"
                  className="pl-1 w-2/3"
                  placeholder="원하는 대치어를 입력하세요."
                  value={error.userText}
                  onChange={e => handleUserTextChange(index, e.target.value)}
                />
                <img
                  src={
                    error.checkedSection === 'user'
                      ? '/assets/images/after_check.png'
                      : '/assets/images/before_check.png'
                  }
                  alt="체크 표시"
                  onClick={() => toggleCheck(index, 'user')}
                  className="cursor-pointer ml-auto w-4 h-4"
                />
              </div>
              <div className="flex justify-end">
                <button
                  className="text-white text-xs px-5 py-1.5 bg-slate-700 fontBold rounded-[14px]"
                  onClick={applyChanges}>
                  적용
                </button>
              </div>
              <hr className="w-full border border-gray-200 my-2" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CheckerModify;
