import React from "react";
import markdown from "@wcj/markdown-to-html";
import ReactQuill from "react-quill";
import "../components/quillstyles.css";
export const Task = (activeItem) => {
  return (
    <>
      <div className="section_lection">
        {activeItem ? (
          activeItem.list?.tasks ? (
            activeItem.list.tasks.map((c) => (
              <>
                <div className="section_list">
                  <p>
                    <ReactQuill
                      readOnly
                      value={markdown(c.text)}
                      theme={"bubble"}
                    />
                  </p>
                  <div className="section_list_etc">
                    <div className="header_icon1"></div>
                    <button className="section_rigthbtn">Публиковать</button>
                  </div>
                </div>
              </>
            ))
          ) : (
            <>
              <div className="section_list">
                <p>Пусто</p>
              </div>
            </>
          )
        ) : (
          "Загрузка"
        )}
      </div>
      <div className="section_right">
        <div className="section_rightText">количество участников</div>
        <div className="section_number">NAN</div>
        <div className="section_rightText">Опубликовано</div>
        <div className="section_number">NAN/NAN</div>
      </div>
    </>
  );
};
