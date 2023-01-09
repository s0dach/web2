import React from "react";
import ReactQuill, { Quill } from "react-quill";
import "./styles.css";
import "../quillstyles.css";
import "react-quill/dist/quill.snow.css";
import { ImageUpload } from "quill-image-upload";
import axios from "axios";
import { htmlToMarkdown } from "../Parser/Parser";

Quill.register("modules/imageUpload", ImageUpload);

export const AddTask = ({ active, setActive, onAddTask, activeItem }) => {
  const [inputValue, setInputValue] = React.useState("");
  const [file, setFile] = React.useState("Вложений нет");
  const [isLoading, setIsLoading] = React.useState(false);

  const editorRef = React.useRef();

  // кастомные значки в тулбар
  var icons = Quill.import("ui/icons");
  icons[
    "bold"
  ] = `<svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="25" cy="25" r="24.5" stroke="#68BFD6"/>
  <path d="M20.824 24.04H25.72C26.44 24.04 27.04 23.84 27.52 23.44C28 23.024 28.24 22.432 28.24 21.664C28.24 20.8 28.024 20.192 27.592 19.84C27.16 19.488 26.536 19.312 25.72 19.312H20.824V24.04ZM17.824 16.864H26.152C27.688 16.864 28.92 17.216 29.848 17.92C30.776 18.624 31.24 19.688 31.24 21.112C31.24 21.976 31.024 22.72 30.592 23.344C30.176 23.952 29.576 24.424 28.792 24.76V24.808C29.848 25.032 30.648 25.536 31.192 26.32C31.736 27.088 32.008 28.056 32.008 29.224C32.008 29.896 31.888 30.528 31.648 31.12C31.408 31.696 31.032 32.2 30.52 32.632C30.008 33.048 29.352 33.384 28.552 33.64C27.752 33.88 26.8 34 25.696 34H17.824V16.864ZM20.824 31.552H26.128C27.04 31.552 27.744 31.32 28.24 30.856C28.752 30.376 29.008 29.704 29.008 28.84C29.008 27.992 28.752 27.344 28.24 26.896C27.744 26.432 27.04 26.2 26.128 26.2H20.824V31.552Z" fill="#68BFD6"/>
  </svg>
  `;
  icons[
    "italic"
  ] = `<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="25" cy="25" r="24.5" stroke="#68BFD6"/>
  <path d="M25.3695 16.864H28.0815L27.5535 19.456H24.8415L25.3695 16.864ZM24.3855 21.592H27.1215L24.5535 34H21.8175L24.3855 21.592Z" fill="#68BFD6"/>
  </svg>`;
  icons[
    "image"
  ] = `<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="25" cy="25" r="24.5" stroke="#68BFD6"/>
  <path d="M28.6562 20.2188C29.5882 20.2188 30.3437 20.9743 30.3437 21.9062C30.3437 22.8382 29.5882 23.5938 28.6562 23.5938C27.7242 23.5938 26.9687 22.8382 26.9687 21.9062C26.9687 20.9743 27.7245 20.2188 28.6562 20.2188ZM18.2816 17.125H31.7816C32.9927 17.125 34.0002 18.1322 34.0002 19.375V30.625C34.0002 31.8678 32.993 32.875 31.7819 32.875H18.2819C17.0391 32.875 16.0319 31.8678 16.0319 30.625V19.375C16.0316 18.1322 17.0089 17.125 18.2816 17.125ZM17.7191 30.3895L22.5284 23.8539C22.6163 23.6922 22.8167 23.5938 23.0312 23.5938C23.2461 23.5938 23.4467 23.6911 23.5659 23.8532L27.3136 28.9192L28.6175 27.2985C28.7385 27.148 28.9316 27.0591 29.1368 27.0591C29.3421 27.0591 29.5351 27.148 29.6564 27.2985L32.3114 30.5965C32.3114 30.5955 32.3114 30.5975 32.3114 30.5965L32.3128 19.375C32.3128 19.0649 32.0604 18.8125 31.7503 18.8125H18.2503C17.9401 18.8125 17.6878 19.0649 17.6878 19.375V30.3895H17.7191Z" fill="#68BFD6"/>
  </svg>`;
  //модули тулбара
  const modules = React.useMemo(
    () => ({
      toolbar: [["bold", "italic", "image"]],
      clipboard: {
        matchVisual: false,
      },
      imageUpload: {
        url: "https://api.imgur.com/3/image",
        method: "POST",
        name: "image",
        withCredentials: false,
        headers: {
          Authorization: "Client-ID ed6e53ec921452e",
        },
        callbackOK: (serverResponse, next) => {
          next(serverResponse.data.link);
        },
        callbackKO: (serverError) => {
          alert(serverError);
        },
        checkBeforeSend: (file, next) => {
          next(file);
        },
      },
    }),
    []
  );
  const addTask = async (e) => {
    setIsLoading(true);
    const htmlTooMarkdown = htmlToMarkdown(inputValue);
    // const boldText = htmlTooMarkdown.replace("**", "*");
    const firstFinishedTextTest = htmlTooMarkdown
      .split("![](")
      .join("<img src=");
    const lastFinishedTextTest = firstFinishedTextTest
      .split(".png)")
      .join(".png>");
    const firstFinishedText = lastFinishedTextTest
      .split("![](")
      .join("<img src=");
    // const boldText = firstFinishedText.split("**").join("!!!");
    // const italicText = boldText.split("*").join("@@");
    // const boldFinish = italicText.split("!!!").join("**");
    // const italicFinish = boldFinish.split("@@").join("*");
    const lastFinishedText = firstFinishedText.split(".jpg)").join(".jpg>");
    const obj = {
      listId: activeItem.id,
      text:
        file === "Вложений нет"
          ? lastFinishedText
          : lastFinishedText + `\`[Вложения:${file.name}]\``,
      documentId: 0,
      completed: false,
    };
    let id = 0;
    await axios
      .post("http://95.163.234.208:3500/tasks", obj)
      .then(({ data }) => {
        id = data.id;
        onAddTask(Number(activeItem.id), data);
      })
      .catch((e) => {
        console.log(e);
        alert("Ошибка при добавлении задачи!");
      });
    setTimeout(() => {
      const date = new FormData();
      date.append("file", file);
      date.append("data", id);
      axios
        .post("http://95.163.234.208:8000/upload-file-to-google-drive", date)
        .then((e) => console.log("ok"))
        .catch((e) => console.log("Ошибка"));
      setFile("Вложений нет");
      setIsLoading(false);
      setActive(false);
    }, "2000");
  };

  return (
    <div className={active ? "modal active" : "modal"}>
      <div className="modal_content" onClick={(e) => e.stopPropagation()}>
        <ReactQuill
          value={inputValue}
          onChange={(e) => setInputValue(e)}
          ref={editorRef}
          modules={modules}
          placeholder="Введите текст"
        />
        <div className="groupbtns">
          <button onClick={() => setActive(false)} className="closeBtn">
            Отменить
          </button>
          <button disabled={isLoading} onClick={addTask} className="saveBtn">
            {isLoading ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
};
