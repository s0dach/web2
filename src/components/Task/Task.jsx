import React from "react";
import markdown from "@wcj/markdown-to-html";
import ReactQuill from "react-quill";
import "../quillstyles.css";
import { AddTask } from "./AddTask";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";

export const Task = ({ onAddTask, lists, setLists }) => {
  const [addTaskActive, setAddTaskActive] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState(null);
  const location = useLocation();
  const params = useParams();

  React.useEffect(() => {
    axios
      .get("http://95.163.234.208:3500/lists?_expand=color&_embed=tasks")
      .then(({ data }) => {
        setLists(data);
      });
  }, [setLists]);
  React.useEffect(() => {
    if (lists) {
      const list = lists.find((list) => list.id === Number(params.id));
      setActiveItem(list);
    }
  }, [lists, location, params.id, setActiveItem]);

  return (
    <>
      <div className="section_lection">
        <div className="buttonDiv">
          <button
            onClick={() => {
              setAddTaskActive(true);
            }}
            className="addButton"
          >
            +
          </button>
        </div>

        <AddTask
          activeItem={activeItem}
          onAddTask={onAddTask}
          active={addTaskActive}
          setActive={setAddTaskActive}
        />
        {activeItem ? (
          activeItem.tasks ? (
            activeItem.tasks.map((c) => (
              <>
                <div className="section_list">
                  <span>
                    <ReactQuill
                      readOnly
                      value={markdown(c.text)}
                      theme={"bubble"}
                    />
                  </span>
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
                <span>Пусто</span>
              </div>
            </>
          )
        ) : (
          "Пусто"
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
