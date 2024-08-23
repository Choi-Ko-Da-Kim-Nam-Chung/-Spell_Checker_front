import React, { useState, useEffect, useRef } from 'react';
import { FaRegCheckCircle } from 'react-icons/fa';

const CheckerModify = ({ data, onUpdateData, onBoxClick }) => {
  const [errors, setErrors] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const isApplyingChanges = useRef(false);

  useEffect(() => {
    if (!data || !data.body) return;

    const extractErrors = (item, errors = []) => {
      if (item.type === 'PARAGRAPH' && item.errors) {
        item.errors.forEach(error => {
          errors.push({
            paragraphId: item.id,
            originalText: error.orgStr,
            replacementOptions: error.candWord || [],
            selectedReplacement: error.candWord?.length === 1 ? error.candWord[0] : '',
            userText: '',
            checkedSection: null,
            start: error.start,
            end: error.end,
            errorIdx: error.errorIdx,
            revisions: 0, // 초기 수정 횟수
          });
        });
      }
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

    setErrors(extractErrors({ ibody: data.body }));
  }, [data, refresh]);

  const handleReplacementSelection = (index, selectedOption) => {
    if (isApplyingChanges.current) return;
    setErrors(prevErrors =>
      prevErrors.map((error, i) =>
        i === index
          ? {
              ...error,
              selectedReplacement: selectedOption,
              checkedSection: 'replacement',
              revisions: error.revisions + 1, // 수정 횟수 증가
            }
          : error,
      ),
    );
  };

  const handleUserTextChange = (index, text) => {
    if (isApplyingChanges.current) return;
    setErrors(prevErrors =>
      prevErrors.map((error, i) =>
        i === index
          ? {
              ...error,
              userText: text,
              checkedSection: 'user',
              revisions: error.revisions + 1, // 수정 횟수 증가
            }
          : error,
      ),
    );
  };

  const toggleCheck = (index, section) => {
    if (isApplyingChanges.current) return;
    setErrors(prevErrors =>
      prevErrors.map((error, i) =>
        i === index
          ? {
              ...error,
              checkedSection: error.checkedSection === section ? null : section,
              revisions: error.revisions + 1, // 수정 횟수 증가
            }
          : error,
      ),
    );
  };

  const applyChanges = () => {
    if (isApplyingChanges.current) return;
    isApplyingChanges.current = true;

    const updatedData = JSON.parse(JSON.stringify(data));
    let isValid = true;

    const appliedModifications = new Set();

    const updateError = (section, error, newText, offset) => {
      section.orgStr =
        section.orgStr.slice(0, error.start + offset) + newText + section.orgStr.slice(error.end + offset);
    };

    const updateContent = body => {
      body.forEach(section => {
        if (section.type === 'PARAGRAPH' && section.errors && section.errors.length > 0) {
          let offset = 0;
          const updatedErrors = [];
          section.errors.forEach(error => {
            const errorToApply = errors.find(
              e => e.paragraphId === section.id && e.start === error.start && e.errorIdx === error.errorIdx,
            );
            if (errorToApply && !appliedModifications.has(`${section.id}-${error.start}-${error.errorIdx}`)) {
              appliedModifications.add(`${section.id}-${error.start}-${error.errorIdx}`);
              let newText;
              if (errorToApply.checkedSection === 'original') {
                newText = errorToApply.originalText;
                error.replaceStr = newText;
              } else if (errorToApply.checkedSection === 'replacement') {
                newText = errorToApply.selectedReplacement;
                error.replaceStr = newText;
              } else if (errorToApply.checkedSection === 'user') {
                newText = errorToApply.userText;
                if (!newText.trim()) {
                  isValid = false;
                }
                error.replaceStr = newText;
              } else {
                newText = error.orgStr;
              }

              updateError(section, error, newText, offset);

              const lengthChange = newText.length - (error.end - error.start);
              offset += lengthChange;

              updatedErrors.push({
                ...error,
                start: error.start + offset - lengthChange,
                end: error.start + newText.length + offset - lengthChange,
              });
            } else {
              updatedErrors.push({ ...error, start: error.start + offset, end: error.end + offset });
            }
          });
          section.errors = updatedErrors;
        }

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

    updateContent(updatedData.body);

    if (!isValid) {
      alert('직접 수정할 내용을 입력해주세요.');
      isApplyingChanges.current = false;
    } else {
      onUpdateData(updatedData);
      setRefresh(prev => !prev);
      isApplyingChanges.current = false;
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
              key={`${error.start}-${error.errorIdx}-${index}`}
              id={`modifyBox-${error.start}-${error.errorIdx}`}
              className="modifyBox px-4 pb-1 text-sm"
              onClick={() => onBoxClick(error.start, error.errorIdx)}
              style={{ cursor: 'pointer' }}>
              <div className="flex items-center my-2">
                <div className="text-black fontBold mr-5">기존 내용</div>
                <div className="fontBold text-red-500">{error.originalText}</div>
                <FaRegCheckCircle
                  size="18"
                  className={`cursor-pointer ml-auto ${
                    error.checkedSection === 'original' ? 'text-green-500' : 'text-gray-300'
                  }`}
                  onClick={() => toggleCheck(index, 'original')}
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
                    <FaRegCheckCircle
                      size="18"
                      className={`cursor-pointer ml-auto ${
                        error.checkedSection === 'replacement' ? 'text-green-500' : 'text-gray-300'
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
                        error.checkedSection === 'replacement' ? 'text-green-500' : 'text-gray-300'
                      }`}
                      onClick={() => toggleCheck(index, 'replacement')}
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
                <FaRegCheckCircle
                  size="18"
                  className={`cursor-pointer ml-auto ${
                    error.checkedSection === 'user' ? 'text-green-500' : 'text-gray-300'
                  }`}
                  onClick={() => toggleCheck(index, 'user')}
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
