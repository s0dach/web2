import axios from "axios";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Task } from "../../pages/Task";
import "../Header/styles.css";

export const List = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [lists, setLists] = React.useState("");
  const [visiblePopup, setVisiblePopup] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [activeItem, setActiveItem] = React.useState("");

  React.useEffect(() => {
    axios
      .get("http://95.163.234.208:3500/lists?_expand=color&_embed=tasks")
      .then(({ data }) => {
        setLists(data);
      });
  }, []);

  React.useEffect(() => {
    const listId = location.pathname.split("/posts/")[1];
    if (lists) {
      const list = lists.find((list) => list.id === Number(listId));
      setActiveItem(list);
    }
  }, [lists, location, navigate, setActiveItem]);

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
      .catch(() => {
        alert("Ошибка при добавлении списка!");
      });
  };

  return (
    <div className="section">
      <div className="section_left">
        <div className="section_text">Активные</div>
        {lists
          ? lists.map((list) => (
              <div
                onClick={() => navigate(`/posts/${list.id}`)}
                className="section_activelectname"
                key={list.id}
              >
                {list.name}
              </div>
            ))
          : "Загрузка."}
        <div className="border"></div>
        <div className="section_text">Доступные</div>
        <div className="section_dislectname">disable lectname</div>
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
      <Task list={activeItem} />
    </div>
  );
};
