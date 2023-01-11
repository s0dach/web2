import axios from "axios";
import React from "react";
import { Header } from "../Header/Header";
import "../Header/styles.css";
import { useNavigate, useParams } from "react-router-dom";
import { Tasks } from "../Task/Tasks";

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

  const startLection = () => {
    axios.patch(`http://95.163.234.208:3500/lists/${params.id}`, {
      active: true,
    });
    setActive(true);
  };

  const stopLection = async () => {
    await axios.patch(`http://95.163.234.208:3500/lists/${params.id}`, {
      active: false,
      complete: 0,
    });
    await lists[params.id - 1].tasks.forEach((task) => {
      axios.patch(`http://95.163.234.208:3500/tasks/${task.id}`, {
        active: "section_rigthbtn",
      });
      setTimeout(() => {
        window.location.reload();
      }, "100");
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
      <Header
        startLection={startLection}
        stopLection={stopLection}
        edit={edit}
        setEdit={setEdit}
        active={active}
        setActive={setActive}
        lectionName={lectionName}
      />
      <div className="section">
        <div className="section_left">
          <div className="section_text">Активные</div>
          {lists
            ? lists.map((list) =>
                list.active || list.editable ? (
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
                !list.active && !list.editable ? (
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
            <div>
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="lection_input"
                type="text"
                placeholder="Введите название лекции"
              />
              <button onClick={addList}>OK</button>
            </div>
          ) : (
            <div
              onClick={() => setVisiblePopup(true)}
              className="section_addlection"
            >
              + добавить лекцию
            </div>
          )}
          <button className="section_helpbtn">
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
