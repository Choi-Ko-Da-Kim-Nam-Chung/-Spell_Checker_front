import React, { useState, useEffect } from 'react';

// CheckerModify는 props로 data와 onUpdateData 함수를 받는 React 컴포넌트입니다.
const CheckerModify = ({ data, onUpdateData }) => {
  // 오류 목록을 저장하기 위해 errors라는 상태를 선언합니다.
  const [errors, setErrors] = useState([]);

  // useEffect 훅을 사용하여 data가 변경될 때마다 특정 로직을 실행합니다.
  useEffect(() => {
    // extractParagraphs 함수는 재귀적으로 문서의 모든 파라그래프를 추출합니다.
    const extractParagraphs = (item, paragraphs = []) => {
      // item이 PARAGRAPH 타입이면 배열에 추가합니다.
      if (item.type === 'PARAGRAPH') {
        paragraphs.push(item);
      }
      // ibody가 있는 경우 각 항목에 대해 재귀적으로 함수를 호출합니다.
      if (item.ibody) {
        item.ibody.forEach(subItem => extractParagraphs(subItem, paragraphs));
      }
      // table이 있는 경우 각 셀에 대해 재귀적으로 함수를 호출합니다.
      if (item.table) {
        item.table.forEach(row => row.forEach(cell => extractParagraphs(cell, paragraphs)));
      }
      return paragraphs;
    };

    // 문서에서 모든 파라그래프를 추출합니다.
    const paragraphs = extractParagraphs({ ibody: data.body });
    // 오류가 있는 모든 파라그래프를 필터링하고 각 오류를 정리하여 새로운 객체로 매핑합니다.
    const allErrors = paragraphs
      .filter(p => p.errors && p.errors.length > 0)
      .flatMap(p =>
        p.errors.map(error => ({
          paragraphId: p.id,
          originalText: error.orgStr,
          replacementText: error.candWord ? error.candWord.join(', ') : '',
          userText: '',
          checkedSection: null,
          start: error.start,
          end: error.end,
        })),
      );

    // 추출한 오류 정보를 상태로 설정합니다.
    setErrors(allErrors);
  }, [data]);

  // toggleCheck 함수는 사용자가 체크를 토글할 때 호출되어 해당 오류의 상태를 업데이트합니다.
  const toggleCheck = (index, section) => {
    setErrors(
      errors.map((error, i) =>
        i === index ? { ...error, checkedSection: error.checkedSection === section ? null : section } : error,
      ),
    );
  };

  // handleUserTextChange 함수는 사용자 입력을 오류 객체에 반영하기 위해 호출됩니다.
  const handleUserTextChange = (index, text) => {
    setErrors(errors.map((error, i) => (i === index ? { ...error, userText: text } : error)));
  };

  // applyChanges 함수는 최종적으로 사용자의 선택이나 입력에 따라 데이터를 수정하고 부모 컴포넌트로 업데이트를 전달합니다.
  const applyChanges = () => {
    const updatedData = JSON.parse(JSON.stringify(data)); // 데이터의 깊은 복사

    let isValid = true; // 모든 입력이 유효한지 여부를 추적하는 플래그

    const updateContent = body => {
      body.forEach(section => {
        if (section.type === 'PARAGRAPH' && section.errors.length > 0) {
          section.errors.forEach(error => {
            const errorToApply = errors.find(e => e.paragraphId === section.id && e.start === error.start);
            if (errorToApply) {
              const originalText = section.orgStr;
              const beforeText = originalText.substring(0, error.start);
              const afterText = originalText.substring(error.end);
              let newText;

              if (errorToApply.checkedSection === 'original') {
                newText = errorToApply.originalText;
              } else if (errorToApply.checkedSection === 'replacement') {
                newText = errorToApply.replacementText;
              } else if (errorToApply.checkedSection === 'user') {
                newText = errorToApply.userText;
                if (!newText.trim()) {
                  // 사용자가 '직접 수정'에 아무것도 입력하지 않았을 경우
                  isValid = false; // 유효하지 않은 입력이 있음을 표시
                }
              } else {
                newText = originalText.substring(error.start, error.end);
              }

              // Update the text and adjust indices accordingly
              section.orgStr = beforeText + newText + afterText;
              error.end = error.start + newText.length; // Update end index based on new text length
              error.checkedSection = errorToApply.checkedSection; // 선택한 섹션을 저장
            }
          });
        }

        if (section.table) {
          section.table.forEach(row => row.forEach(cell => updateContent(cell.ibody)));
        }
      });
    };

    updateContent(updatedData.body);

    if (!isValid) {
      alert('직접 수정할 내용을 입력해주세요.'); // 유효하지 않은 입력이 있을 경우 경고 표시
    } else {
      onUpdateData(updatedData); // 모든 입력이 유효할 경우 업데이트 함수 호출
    }
  };

  // 컴포넌트의 렌더링 부분입니다. 각 오류에 대해 해당 UI 요소를 표시합니다.
  return (
    <div className="flex flex-col h-[60vh]">
      <div className="bg-slate-700 h-14 pb-3 sticky top-0">
        <div className="text-white text-lg pl-5 pt-3 fontSB">수정하기</div>
      </div>
      <div className="w-full h-full bg-white border-b border-r border-stone-300 scroll overflow-y-scroll">
        {errors.map((error, index) => (
          <div key={index} className="px-4 pb-1 text-sm">
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
              <div className="fontBold">{error.replacementText || 'N/A'}</div>
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
                  error.checkedSection === 'user' ? '/assets/images/after_check.png' : '/assets/images/before_check.png'
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
        ))}
      </div>
    </div>
  );
};

export default CheckerModify;
