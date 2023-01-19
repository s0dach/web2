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
  const [nextTaskSend, setNextTaskSend] = React.useState(null);
  const [addTaskActive, setAddTaskActive] = React.useState(false);
  const [editTask, setEditTask] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState(null);
  // const [activeList, setActiveList] = React.useState(null);
  const location = useLocation();
  const params = useParams();
  React.useEffect(() => {
    axios
      .get("http://95.163.234.208:3500/lists?_expand=color&_embed=tasks")
      .then(({ data }) => {
        setLists(data);
      });
  }, [setLists]);

  const token = "5960420624:AAEvKvDBpDv5u3aSG2_3jcLULzkZq85aKkA";
  const uriApiMessage = `https://api.telegram.org/bot${token}/sendMessage`;
  const uriDoc = `https://api.telegram.org/bot${token}/sendDocument`;
  const uriApiPhoto = `https://api.telegram.org/bot${token}/sendPhoto`;
  const [edit1, setEdit1] = React.useState(0);
  const [docId, setDocId] = React.useState(null);
  const [taskText, setTaskText] = React.useState(null);
  const [currentTask, setCurrentTask] = React.useState(null);

  const [taskIdAdd, setTaskIdAdd] = React.useState(null);

  React.useEffect(() => {
    if (nextTaskSend !== null) {
      axios
        .get(`http://95.163.234.208:3500/tasks/${nextTaskSend}`)
        .then(({ data }) => {
          setEdit1(data.active);
          setDocId(data.documentId);
          setTaskText(data.text);
        });
    }
  }, [edit1, nextTaskSend, setNextTaskSend]);

  React.useEffect(() => {
    if (lists) {
      const list = lists.find((list) => list.id === Number(params.id));
      setActiveItem(list);
      // setActiveList(list.tasks);
    }
  }, [lists, location, params.id, setActiveItem]);

  const sendLection = async (e) => {
    if (params.id !== undefined) {
      await axios
        .get(`http://95.163.234.208:3500/lists/${params.id}`)
        .then(({ data }) => {
          axios.patch(`http://95.163.234.208:3500/lists/${params.id}`, {
            complete: data.complete + 1,
          });
          setComplete(data.complete + 1);
        });
    }
    setNextTaskSend(nextTaskSend + 1);
    try {
      let data = [];
      if (params.id !== undefined) {
        await axios
          .get(`http://95.163.234.208:3500/lists/${params.id}`)
          .then((res) => {
            data = res.data.usersId;
          });
      }
      await axios.patch(`http://95.163.234.208:3500/tasks/${nextTaskSend}`, {
        active: "section_rigthbtnNone",
      });
      await axios
        .get(`http://95.163.234.208:3500/tasks/${nextTaskSend}`)
        .then(({ data }) => {
          setEdit1(data.active);
        });
      const boldText = taskText.split("**").join("!!!");
      const italicText = boldText.split("*").join("@@@");
      const boldTextFinish = italicText.split("!!!").join("*");
      const allBItext = boldTextFinish.split("@@@").join("_");
      const allFixText = allBItext.replace(/\\/g, "");
      const firstFinishedTextTest = allFixText.split("![](").join("<img src=");
      const lastFinishedTextTest = firstFinishedTextTest
        .split(".png)")
        .join(".png>");
      const firstFinishedText = lastFinishedTextTest
        .split("![](")
        .join("<img src=");
      const lastFinishedText = firstFinishedText.split(".jpg)").join(".jpg>");
      const links = lastFinishedText.match(/https:\/\/[^\sZ]+/i);
      const first_link = links?.[0];
      const finishMyText = lastFinishedText.replace(
        "*Вложения:**",
        "Вложения: "
      );
      data.forEach((ids) => {
        if (first_link !== undefined) {
          // Обрезаем конечный текст с картинкой

          const firstFinishText = lastFinishedText.replace(
            "<img src=" + first_link,
            ""
          );

          const lastFinishText = firstFinishText.replace(">" + first_link, "");
          const finishedText = lastFinishText.replace("<span><span>", "");
          axios.post(uriApiPhoto, {
            chat_id: Number(ids),
            photo: first_link,
            caption: finishedText,
            parse_mode: "Markdown",
          });
        }
        if (first_link === undefined) {
          if (docId !== 0) {
            axios.post(uriDoc, {
              chat_id: Number(ids),
              parse_mode: "Markdown",
              caption: finishMyText,
              document: `https://drive.google.com/u/0/uc?id=${docId}&export=download`,
            });
          }
          if (docId === 0) {
            axios.post(uriApiMessage, {
              chat_id: Number(ids),
              parse_mode: "Markdown",
              text: lastFinishedText,
            });
          }
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  function dragStartHandler(e, card) {
    setCurrentTask(card);
    // console.log(card);
  }
  function dragEndHandler(e) {
    e.target.style.border = "none";
  }
  function dragOverHandler(e) {
    e.preventDefault();
    e.target.style.border = "1px solid black";
  }
  function dropHandler(e, card) {
    e.preventDefault();
    e.target.style.border = "none";
    if (currentTask !== null) {
      axios.patch(`http://95.163.234.208:3500/tasks/${card.id}`, {
        order: Number(currentTask.order),
      });
      axios.patch(`http://95.163.234.208:3500/tasks/${currentTask.id}`, {
        order: Number(card.order),
      });
    }
    setTimeout(() => {
      window.location.reload();
    }, "100");
    // activeItem?.tasks.map((c) => {
    //   if (c.id === card.id) {
    //     axios.patch(`http://95.163.234.208:3500/tasks/${c.id}`, {
    //       order: Number(currentTask.id),
    //     });
    //     return { ...c, id: currentTask.id };
    //   }
    //   if (c.id === currentTask.id) {
    //     axios.patch(`http://95.163.234.208:3500/tasks/${c.id}`, {
    //       ...c,
    //       order: Number(card.id),
    //     });
    //     return { ...c, id: card.id };
    //   }
    //   return c;
    // });
  }

  const sortTasks = (a, b) => {
    if (a.order > b.order) {
      return 1;
    } else {
      return -1;
    }
  };
  return (
    <>
      <div className="section_lection">
        <AddTask
          activeItem={activeItem}
          onAddTask={onAddTask}
          active={addTaskActive}
          setActive={setAddTaskActive}
          taskIdAdd={taskIdAdd}
        />
        {activeItem ? (
          activeItem.tasks ? (
            activeItem.tasks.sort(sortTasks).map((c) => (
              <div
                draggable={true}
                onDragStart={(e) => dragStartHandler(e, c)}
                onDragLeave={(e) => dragEndHandler(e)}
                onDragEnd={(e) => dragEndHandler(e)}
                onDragOver={(e) => dragOverHandler(e)}
                onDrop={(e) => dropHandler(e, c)}
              >
                <Task
                  setTaskIdAdd={setTaskIdAdd}
                  edit1={edit1}
                  setEdit1={setEdit1}
                  nextTaskSend={nextTaskSend}
                  setNextTaskSend={setNextTaskSend}
                  onEditTask={onEditTask}
                  active={editTask}
                  setActive={setEditTask}
                  complete={complete}
                  setComplete={setComplete}
                  documentId={c.documentId}
                  onRemoveTask={onRemoveTask}
                  listId={c.listId}
                  taskId={c.id}
                  taskOrderId={c.order}
                  editable={editable}
                  taskText={c.text}
                  setAddTaskActive={setAddTaskActive}
                  key={c.id}
                />
              </div>
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
        <div className="section_helpbtnSend" onClick={sendLection}>
          <button className="section_helpbtn1Send">
            Опубликовать следующий
          </button>
        </div>
      </div>
    </>
  );
};
