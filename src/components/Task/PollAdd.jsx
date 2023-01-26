import axios from "axios";
import React from "react";
import "../Header/styles.css";

export const PollAdd = ({
  pollActive,
  setPollActive,
  activeItem,
  onAddTask,
  taskIdAdd,
}) => {
  const [inputValue, setInputValue] = React.useState("");
  const [optionValue, setOptionValue] = React.useState("");
  const [optionValue1, setOptionValue1] = React.useState("");
  const [optionValue2, setOptionValue2] = React.useState("");
  const [optionValue3, setOptionValue3] = React.useState("");
  const [optionValue4, setOptionValue4] = React.useState("");
  const [optionValue5, setOptionValue5] = React.useState("");

  const addPoll = async (e) => {
    let preOptionValues = [];
    preOptionValues.push(
      optionValue,
      optionValue1,
      optionValue2,
      optionValue3,
      optionValue4,
      optionValue5
    );
    const OptionValues = preOptionValues.filter((element) => element !== "");
    const obj = {
      order: activeItem.tasks.length + 1,
      listId: activeItem.id,
      active: "section_rigthbtn",
      text: `<h1><span style="color: rgb(102, 163, 224);">Опрос:</span><span style="background-color: rgb(204, 224, 245); color: rgb(102, 163, 224);"> ${inputValue}
        </span></h1>`,
      documentId: 0,
      completed: false,
      pollId: 0,
      pollOptions: OptionValues,
      pollQuestion: inputValue,
    };
    await axios
      .post("http://95.163.234.208:3500/tasks", obj)
      .then(({ data }) => {
        onAddTask(Number(activeItem.id), data, taskIdAdd);
      })
      .catch((e) => {
        console.log(e);
        alert("Ошибка при добавлении задачи!");
      });
    setPollActive(false);
    setInputValue("");
    setOptionValue("");
    setOptionValue1("");
    setOptionValue2("");
    setOptionValue3("");
    setOptionValue4("");
    setOptionValue5("");
  };
  return (
    <div
      className={pollActive ? "modal active" : "modal"}
      onClick={() => setPollActive(false)}
    >
      <div className="modal_content" onClick={(e) => e.stopPropagation()}>
        <div className="pollDiv">
          <span>Вопрос?</span>
          <input
            className="lection_input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
        <div className="addPoll">
          <div className="pollDiv">
            <p>Опция</p>
            <input
              value={optionValue}
              onChange={(e) => setOptionValue(e.target.value)}
              className="lection_input"
            />
          </div>
          <div className="pollDiv">
            <p>Опция</p>
            <input
              value={optionValue1}
              onChange={(e) => setOptionValue1(e.target.value)}
              className="lection_input"
            />
          </div>
          <div className="pollDiv">
            <p>Опция</p>
            <input
              value={optionValue2}
              onChange={(e) => setOptionValue2(e.target.value)}
              className="lection_input"
            />
          </div>
        </div>
        <div className="addPoll">
          <div className="pollDiv">
            <p>Опция</p>
            <input
              value={optionValue3}
              onChange={(e) => setOptionValue3(e.target.value)}
              className="lection_input"
            />
          </div>
          <div className="pollDiv">
            <p>Опция</p>
            <input
              value={optionValue4}
              onChange={(e) => setOptionValue4(e.target.value)}
              className="lection_input"
            />
          </div>
          <div className="pollDiv">
            <p>Опция</p>
            <input
              value={optionValue5}
              onChange={(e) => setOptionValue5(e.target.value)}
              className="lection_input"
            />
          </div>
        </div>
        <button onClick={addPoll} className="saveBtn">
          Сохранить
        </button>
      </div>
    </div>
  );
};
