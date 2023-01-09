import React from "react";
import { useParams } from "react-router-dom";
import "./styles.css";

export const Header = () => {
  const params = useParams();
  return (
    <div className="header">
      <div className="header_left">
        <div className="header_icon"></div>
        <button className="header_active">Активно</button>
      </div>
      <div className="header_section">
        <div className="header_text">Структура презентации</div>
        <div className="header_icons">
          <div className="header_icon1"></div>
          <div className="header_icon2"></div>
        </div>
      </div>
      <div className="header_right">
        <button onClick={() => console.log(params)} className="header_button">
          Запустить сессию
        </button>
      </div>
    </div>
  );
};
