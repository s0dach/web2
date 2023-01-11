import React from "react";
import "../quillstyles.css";
import { AddTask } from "./AddTask";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { Task } from "./Task";

export const Tasks = ({
  onAddTask,
  onEditTask,
  lists,
  setLists,
  editable,
  onRemoveTask,
  complete,
  setComplete,
}) => {
  const [addTaskActive, setAddTaskActive] = React.useState(false);
  const [editTask, setEditTask] = React.useState(false);
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
        <AddTask
          activeItem={activeItem}
          onAddTask={onAddTask}
          active={addTaskActive}
          setActive={setAddTaskActive}
        />
        {activeItem ? (
          activeItem.tasks ? (
            activeItem.tasks.map((c) => (
              <Task
                onEditTask={onEditTask}
                active={editTask}
                setActive={setEditTask}
                complete={complete}
                setComplete={setComplete}
                documentId={c.documentId}
                onRemoveTask={onRemoveTask}
                listId={c.listId}
                taskId={c.id}
                editable={editable}
                taskText={c.text}
                setAddTaskActive={setAddTaskActive}
                key={c.id}
              />
            ))
          ) : (
            <>
              <div className="section_list">
                <span>Загрузка</span>
              </div>
            </>
          )
        ) : (
          <div className="dp">Привет</div>
        )}
        <div className="centerButtonbottom">
          <button
            onClick={() => {
              setAddTaskActive(true);
            }}
            className="addButton"
          >
            +
          </button>
        </div>
      </div>
      <div className="section_right">
        <div className="section_rightText">количество участников</div>
        <div className="section_number">
          {activeItem ? activeItem.usersId.length : "NAN"}
        </div>
        <div className="section_rightText">Опубликовано</div>
        <div className="section_number">
          {complete}/{activeItem ? activeItem.tasks.length : 0}
        </div>
      </div>
    </>
  );
};
