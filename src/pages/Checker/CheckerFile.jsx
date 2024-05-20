import React from 'react';

const CheckerFile = ({ data, onTextClick }) => {
  // 오류 강조 표시와 함께 텍스트를 렌더링하고 오류에 클릭 핸들러를 첨부
  const renderTextWithErrors = (text, errors) => {
    if (!errors || errors.length === 0) {
      return <span style={{ whiteSpace: 'pre-wrap' }}>{text || '\n'}</span>;
    }

    errors.sort((a, b) => a.start - b.start);

    let lastIndex = 0;
    const elements = [];

    errors.forEach((error, index) => {
      const color = error.replaceStr ? '#5e75f1' : 'red';

      if (error.start > lastIndex) {
        elements.push(
          <span key={`${index}-before`} style={{ whiteSpace: 'pre-wrap' }}>
            {text.substring(lastIndex, error.start)}
          </span>,
        );
      }

      elements.push(
        <span
          key={error.start}
          id={`errorText-${error.start}`}
          style={{ color, fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'pre-wrap' }}
          onClick={() => onTextClick(error.start)}>
          {error.replaceStr || text.substring(error.start, error.end)}
        </span>,
      );

      lastIndex = error.end;
    });

    if (lastIndex < text.length) {
      elements.push(
        <span key="after" style={{ whiteSpace: 'pre-wrap' }}>
          {text.substring(lastIndex)}
        </span>,
      );
    } else {
      elements.push(
        <span key="after" style={{ whiteSpace: 'pre-wrap' }}>
          &nbsp;
        </span>,
      );
    }

    return elements;
  };

  // 각 섹션을 적절한 HTML 요소로 렌더링하는 함수
  const renderContent = section => {
    if (section.type === 'PARAGRAPH') {
      return <p>{renderTextWithErrors(section.orgStr || '', section.errors)}</p>;
    } else if (section.type === 'TABLE') {
      // 테이블 타입의 섹션 처리
      return (
        <table style={{ width: '100%', border: '1px solid black', padding: '4px' }}>
          <tbody>
            {section.table.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    colSpan={cell.colspan}
                    rowSpan={cell.rowspan}
                    style={{ border: '1px solid black', padding: '4px' }}>
                    {cell.ibody.map((item, itemIndex) => (
                      <p key={itemIndex}>{renderContent(item)}</p>
                    ))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    return null;
  };

  // 데이터의 body를 순회하며 각 섹션을 렌더링
  const renderPage = data => {
    return data.body.map((section, index) => <div key={index}>{renderContent(section)}</div>);
  };

  // 최종적으로 페이지 컴포넌트 반환
  return (
    <div className="w-[70%] h-[60vh] bg-white border border-stone-300 scroll overflow-y-scroll">
      <div className="py-4 pl-5 pr-3">{renderPage(data)}</div>
    </div>
  );
};

export default CheckerFile;
