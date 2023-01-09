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
  const [editable, setEditable] = React.useState(null);
  const [inputValue, setInputValue] = React.useState("");
  const [lectionName, setLectionName] = React.useState("");
  const [active, setActive] = React.useState(null);
  // Костыль для отображения лекции
  React.useEffect(() => {
    axios
      .get(`http://95.163.234.208:3500/lists/${params.id}`)
      .then(({ data }) => {
        setLectionName(data.name);
        setActive(data.active);
      });
  }, [params.id, active]);

  React.useEffect(() => {
    axios
      .get("http://95.163.234.208:3500/lists?_expand=color&_embed=tasks")
      .then(({ data }) => {
        setLists(data);
      });
  }, [active]);

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

  const onAddTask = (listId, taskObj) => {
    const newList = lists.map((item) => {
      if (item.id === listId) {
        item.tasks = [...item.tasks, taskObj];
      }
      return item;
    });
    setLists(newList);
  };
  return (
    <>
      <Header
        editable={editable}
        setEditable={setEditable}
        active={active}
        setActive={setActive}
        lectionName={lectionName}
      />
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
          <button className="section_helpbtn">Инструкция сервиса</button>
        </div>
        <Tasks
          editable={editable}
          lists={lists}
          setLists={setLists}
          onAddTask={onAddTask}
        />
      </div>
    </>
  );
};
