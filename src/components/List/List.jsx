import axios from "axios";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Tasks } from "../../pages/Tasks";
import "../Header/styles.css";

export const List = () => {
  const navigate = useNavigate();
  const [lists, setLists] = React.useState(null);
  React.useEffect(() => {
    axios.get("http://95.163.234.208:3500/lists").then(({ data }) => {
      setLists(data);
    });
  }, []);
  console.log(lists);
  return (
    <div className="section">
      <div className="section_left">
        <div className="section_text">Активные</div>
        {lists
          ? lists.map((list) => (
              <div className="section_activelectname" key={list.id}>
                {list.name}
              </div>
            ))
          : "Загрузка."}
        <div className="border"></div>
        <div className="section_text">Доступные</div>
        <div className="section_dislectname">disable lectname</div>
        <div className="border"></div>
        <div className="section_addlection">+ добавить лекцию</div>
        <button className="section_helpbtn">Инструкция сервиса</button>
      </div>
      <Tasks />
    </div>
  );
};
