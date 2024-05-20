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

  const handleUserTextChange = (index, text) => {
    setErrors(errors.map((error, i) => (i === index ? { ...error, userText: text, checkedSection: 'user' } : error)));
  };

  const toggleCheck = (index, section) => {
    setErrors(
      errors.map((error, i) =>
        i === index ? { ...error, checkedSection: error.checkedSection === section ? null : section } : error,
      ),
    );
  };

  const applyChanges = () => {
    const updatedData = JSON.parse(JSON.stringify(data)); // 데이터 깊은 복사
    const newErrors = JSON.parse(JSON.stringify(errors)); // 에러 데이터 깊은 복사

    let isValid = true;

    const updateContent = body => {
      body.forEach(section => {
        if (section.type === 'PARAGRAPH' && section.errors && section.errors.length > 0) {
          section.errors.forEach(error => {
            const errorToApply = newErrors.find(e => e.paragraphId === section.id && e.start === error.start);
            if (errorToApply) {
              const { checkedSection, selectedReplacement, userText } = errorToApply;
              let newText;

              switch (checkedSection) {
                case 'original':
                  newText = error.orgStr;
                  break;
                case 'replacement':
                  newText = selectedReplacement;
                  break;
                case 'user':
                  newText = userText;
                  if (!newText.trim()) {
                    isValid = false;
                    return;
                  }
                  break;
              }

              error.replaceStr = newText;
              error.checkedSection = true; // 수정됨 표시
            }
          });
        }

        if (section.ibody) {
          updateContent(section.ibody);
        }

        if (section.table) {
          section.table.forEach(row => row.forEach(cell => updateContent(cell.ibody)));
        }
      });
    };

    updateContent(updatedData.body);

    if (!isValid) {
      alert('직접 수정할 내용을 입력해주세요.');
    } else {
      onUpdateData(updatedData); // 수정된 데이터로 상태 업데이트
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
