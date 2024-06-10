import React from 'react';

const CheckerFile = ({ data, onTextClick }) => {
  const renderTextWithErrors = (text, errors) => {
    if (!errors || errors.length === 0) {
      return <span style={{ whiteSpace: 'pre-wrap' }}>{text || '\n'}</span>;
    }

    errors.sort((a, b) => a.start - b.start);

    let lastIndex = 0;
    const elements = [];

    errors.forEach((error, index) => {
      const color = error.replaceStr ? '#5e75f1' : 'red';
      const displayText = error.replaceStr || text.substring(error.start, error.end);

      if (error.start > lastIndex) {
        elements.push(
          <span key={`${index}-before`} style={{ whiteSpace: 'pre-wrap' }}>
            {text.substring(lastIndex, error.start)}
          </span>,
        );
      }

      elements.push(
        <span
          key={`${error.start}-${error.errorIdx}`}
          id={`errorText-${error.start}-${error.errorIdx}`}
          style={{ color, fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'pre-wrap' }}
          onClick={() => onTextClick(error.start, error.errorIdx)}>
          {displayText}
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
  const renderNoteText = (noteNum, noteType, notesData) => {
    const noteIndex = noteNum - 1;
    const noteElements = [];
    if (noteType === 'FOOT_NOTE' && notesData && notesData.footNote && notesData.footNote[noteIndex]) {
      notesData.footNote[noteIndex].forEach((item, index) => {
        if (item.type === 'PARAGRAPH') {
          noteElements.push(
            <div key={index} style={{ fontSize: 'smaller', color: 'gray' }}>
              {renderTextWithErrors(item.orgStr, item.errors)}
            </div>,
          );
        } else if (item.type === 'TABLE') {
          noteElements.push(
            <table key={index} style={{ width: '100%', border: '1px solid gray', fontSize: 'smaller', color: 'gray' }}>
              <tbody>
                {item.table.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        colSpan={cell.colspan}
                        rowSpan={cell.rowspan}
                        style={{ border: '1px solid gray', padding: '4px' }}>
                        {cell.ibody.map((bodyItem, bodyIndex) => (
                          <div key={bodyIndex} style={{ fontSize: 'smaller', color: 'gray' }}>
                            {renderTextWithErrors(bodyItem.orgStr, bodyItem.errors)}
                          </div>
                        ))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>,
          );
        }
      });
    } else if (noteType === 'END_NOTE' && notesData && notesData.endNote && notesData.endNote[noteIndex]) {
      notesData.endNote[noteIndex].forEach((item, index) => {
        if (item.type === 'PARAGRAPH') {
          noteElements.push(
            <div key={index} style={{ fontSize: 'smaller', color: 'gray' }}>
              {renderTextWithErrors(item.orgStr, item.errors)}
            </div>,
          );
        } else if (item.type === 'TABLE') {
          noteElements.push(
            <table key={index} style={{ width: '100%', border: '1px solid gray', fontSize: 'smaller', color: 'gray' }}>
              <tbody>
                {item.table.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        colSpan={cell.colspan}
                        rowSpan={cell.rowspan}
                        style={{ border: '1px solid gray', padding: '4px' }}>
                        {cell.ibody.map((bodyItem, bodyIndex) => (
                          <div key={bodyIndex} style={{ fontSize: 'smaller', color: 'gray' }}>
                            {renderTextWithErrors(bodyItem.orgStr, bodyItem.errors)}
                          </div>
                        ))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>,
          );
        }
      });
    }
    return noteElements;
  };

  const renderNotes = (notes, notesData) => {
    return notes.map((note, index) => (
      <div key={index} style={{ fontSize: 'smaller', color: 'gray' }}>
        {renderNoteText(note.noteNum, note.noteInfoType, notesData)}
      </div>
    ));
  };

  const renderContent = (section, notesData) => {
    if (section.type === 'PARAGRAPH') {
      return (
        <div>
          <p>{renderTextWithErrors(section.orgStr || '', section.errors)}</p>
          {section.notes && renderNotes(section.notes, notesData)}
        </div>
      );
    } else if (section.type === 'TABLE') {
      return (
        <table style={{ width: '100%', border: '1px solid gray', padding: '4px' }}>
          <tbody>
            {section.table.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    colSpan={cell.colspan}
                    rowSpan={cell.rowspan}
                    style={{ border: '1px solid gray', padding: '4px' }}>
                    {cell.ibody.map((item, itemIndex) => (
                      <div key={itemIndex}>{renderContent(item, notesData)}</div>
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

  const renderPage = data => {
    return data.body.map((section, index) => <div key={index}>{renderContent(section, data)}</div>);
  };

  return (
    <div className="w-[70%] h-[60vh] bg-white border border-stone-300 scroll overflow-y-scroll">
      <div className="py-4 pl-5 pr-3">{renderPage(data)}</div>
    </div>
  );
};

export default CheckerFile;
