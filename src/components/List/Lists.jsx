import axios from "axios";
import React from "react";
import { Header } from "../Header/Header";
import "../Header/styles.css";
import { useNavigate, useParams } from "react-router-dom";
import { Tasks } from "../Task/Tasks";
import { Instruction } from "../Task/Instruction";

export const Lists = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [lists, setLists] = React.useState(null);
  const [visiblePopup, setVisiblePopup] = React.useState(false);
  const [edit, setEdit] = React.useState(null);
  const [inputValue, setInputValue] = React.useState("");
  const [lectionName, setLectionName] = React.useState("");
  const [complete, setComplete] = React.useState(0);
  const [active, setActive] = React.useState(null);
  const [instrActive, setInstrActive] = React.useState(false);
  // Костыль для отображения лекции
  React.useEffect(() => {
    if (params.id !== undefined) {
      axios
        .get(`http://95.163.234.208:3500/lists/${params.id}`)
        .then(({ data }) => {
          setLectionName(data.name);
          setActive(data.active);
          setEdit(data.editable);
          setComplete(data.complete);
        });
    }
  }, [params.id, active, edit, complete]);

  React.useEffect(() => {
    axios
      .get("http://95.163.234.208:3500/lists?_expand=color&_embed=tasks")
      .then(({ data }) => {
        setLists(data);
      });
  }, [active, edit]);

  const onAdd = (obj) => {
    const newList = [...lists, obj];
    setLists(newList);
  };

  const addList = () => {
    if (!inputValue) {
      alert("Введите название списка");
      return;
    }
    axios
      .post("http://95.163.234.208:3500/lists", {
        name: inputValue,
        colorId: 1,
        usersId: [],
      })
      .then(({ data }) => {
        const color = { id: 1, hex: "#C9D1D3", name: "grey" };
        const listObj = { ...data, color, tasks: [] };
        onAdd(listObj);
        setVisiblePopup(false);
        setInputValue("");
      })
      .catch((e) => {
        console.log(e);
        alert("Ошибка при добавлении списка!");
      });
  };

  const onEditTask = (listId, taskText, id) => {
    const newList = lists.map((list) => {
      if (list.id === listId) {
        list.tasks = list.tasks.map((task) => {
          if (task.id === id) {
            task.text = taskText;
          }
          return task;
        });
      }
      return list;
    });
    setLists(newList);
    axios
      .patch("http://95.163.234.208:3500/tasks/" + id, {
        text: taskText,
      })
      .catch((e) => {
        alert("Не удалось обновить задачу");
        console.log(e);
      });
  };

  const onAddTask = (listId, taskObj) => {
    const newList = lists.map((item) => {
      if (item.id === listId) {
        item.tasks = [...item.tasks, taskObj];
      }
      return item;
    });
    setLists(newList);
  };

  const onDublicateList = async () => {
    await axios.post("http://95.163.234.208:3500/lists", {
      name: lists?.[params.id - 1].name,
      colorId: 1,
      usersId: [],
    });
    await axios
      .get("http://95.163.234.208:3500/lists?_expand=color&_embed=tasks")
      .then(({ data }) => {
        data[data.length - 1].tasks = data[params.id - 1].tasks;
        data[data.length - 1].tasks.forEach((e) => {
          axios.post("http://95.163.234.208:3500/tasks", {
            listId: data.length - 1 + 1,
            active: e.active,
            text: e.text,
            documentId: e.documentId,
            completed: false,
          });
          console.log(e);
        });
        setLists(data);
      });
  };
  const startLection = () => {
    axios.patch(`http://95.163.234.208:3500/lists/${params.id}`, {
      active: true,
    });
    setActive(true);
    setTimeout(() => {
      window.location.reload();
    }, "1000");
  };

  const stopLection = async () => {
    await axios.patch(`http://95.163.234.208:3500/lists/${params.id}`, {
      active: false,
      complete: 0,
      usersId: [],
    });
    await lists[params.id - 1].tasks.forEach((task) => {
      axios.patch(`http://95.163.234.208:3500/tasks/${task.id}`, {
        active: "section_rigthbtn",
      });
      setTimeout(() => {
        window.location.reload();
      }, "1000");
    });

    setLists(lists);
    setActive(false);
  };
  const onRemoveTask = (listId, taskId) => {
    if (window.confirm("Подтвердить удаление?")) {
      const newList = lists.map((item) => {
        if (item.id === listId) {
          item.tasks = item.tasks.filter((task) => task.id !== taskId);
        }
        return item;
      });
      setLists(newList);
      axios.delete("http://95.163.234.208:3500/tasks/" + taskId).catch((e) => {
        alert("Не удалось удалить задачу");
        console.log(e);
      });
    }
  };

  return (
    <>
      <Instruction instrActive={instrActive} setInstrActive={setInstrActive} />
      <Header
        onDublicateList={onDublicateList}
        startLection={startLection}
        stopLection={stopLection}
        edit={edit}
        setEdit={setEdit}
        active={active}
        setActive={setActive}
        lectionName={lectionName}
      />
      <div className="bottomButton">
        <svg
          width="50"
          height="50"
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="25" cy="25" r="25" fill="#095164" />
          <path
            d="M25.5 29L19.8708 19.25L31.1292 19.25L25.5 29Z"
            fill="white"
          />
          <rect x="19" y="31" width="13" height="2" fill="white" />
        </svg>
      </div>
      <div className="section">
        <div className="section_left">
          <div className="section_text">Активные</div>
          {lists
            ? lists.map((list) =>
                list.active ? (
                  <div
                    onClick={() => navigate(`/posts/${list.id}`)}
                    className="section_activelectname"
                    key={list.id}
                  >
                    {list.name}
                  </div>
                ) : undefined
              )
            : "Загрузка."}
          <div className="border"></div>
          <div className="section_text">Доступные</div>
          {lists
            ? lists.map((list) =>
                !list.active ? (
                  <div
                    onClick={() => navigate(`/posts/${list.id}`)}
                    className="section_dislectname"
                    key={list.id}
                  >
                    {list.name}
                  </div>
                ) : undefined
              )
            : "Загрузка."}
          <div className="border"></div>
          {visiblePopup ? (
            <div className="addListBlock">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="lection_input"
                type="text"
                placeholder="Название лекции"
              />
              <button className="buttonOK" onClick={addList}>
                OK
              </button>
            </div>
          ) : (
            <div
              onClick={() => setVisiblePopup(true)}
              className="section_addlection"
            >
              + добавить лекцию
            </div>
          )}
          <button
            className="section_helpbtn"
            onClick={() => setInstrActive(true)}
          >
            <div className="section_helpbtn1">?</div>Инструкция сервиса
          </button>
        </div>
        <Tasks
          complete={complete}
          setComplete={setComplete}
          onRemoveTask={onRemoveTask}
          editable={edit}
          lists={lists}
          setLists={setLists}
          onAddTask={onAddTask}
          onEditTask={onEditTask}
        />
      </div>
    </>
  );
};
