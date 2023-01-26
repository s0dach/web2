import markdown from "@wcj/markdown-to-html";
import axios from "axios";
import React from "react";
import ReactQuill from "react-quill";
import { useParams } from "react-router-dom";
import { EditTask } from "./EditTask";

export const Task = ({
  setPollActive,
  pollQuestion,
  taskText,
  pollOptions,
  setAddTaskActive,
  editable,
  listId,
  taskId,
  taskOrderId,
  onRemoveTask,
  documentId,
  setComplete,
  onEditTask,
  active,
  setActive,
  setNextTaskSend,
  setTaskIdAdd,
  taskIdAdd,
  card,
  activeItem,
}) => {
  const token = "5960420624:AAEvKvDBpDv5u3aSG2_3jcLULzkZq85aKkA";
  const uriApiMessage = `https://api.telegram.org/bot${token}/sendMessage`;
  const uriDoc = `https://api.telegram.org/bot${token}/sendDocument`;
  const uriApiPhoto = `https://api.telegram.org/bot${token}/sendPhoto`;
  const params = useParams();
  const [edit, setEdit] = React.useState(null);
  const [edit1, setEdit1] = React.useState(0);
  const [editTaskId, setEditTaskId] = React.useState(null);
  const [editTaskText, setEditTaskText] = React.useState(null);
  const [activeList, setActiveList] = React.useState(null);

  React.useEffect(() => {
    if (params.id !== undefined) {
      axios
        .get(`http://95.163.234.208:3500/lists/${params.id}`)
        .then(({ data }) => {
          setEdit(data.editable);
          setActiveList(data.active);
        });
    }
  }, [params.id, editable]);

  React.useEffect(() => {
    axios.get(`http://95.163.234.208:3500/tasks/${taskId}`).then(({ data }) => {
      setEdit1(data.active);
    });
  }, [taskId, edit1, setEdit1]);

  const taskEditDown = () => {
    activeItem.forEach(async (item, index) => {
      if (item.order === taskOrderId) {
        await axios.patch(`http://95.163.234.208:3500/tasks/${item.id}`, {
          order: activeItem[index + 1].order,
        });
        await axios.patch(
          `http://95.163.234.208:3500/tasks/${activeItem[index + 1].id}`,
          {
            order: item.order,
          }
        );
      }
      setTimeout(() => {
        window.location.reload();
      }, "500");
    });
  };

  const taskEditUp = () => {
    activeItem.forEach(async (item, index) => {
      if (item.order === taskOrderId) {
        await axios.patch(`http://95.163.234.208:3500/tasks/${item.id}`, {
          order: activeItem[index - 1].order,
        });
        await axios.patch(
          `http://95.163.234.208:3500/tasks/${activeItem[index - 1].id}`,
          {
            order: item.order,
          }
        );
      }
      setTimeout(() => {
        window.location.reload();
      }, "500");
    });
  };

  const sendLection = async (e) => {
    if (!pollOptions) {
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
      setNextTaskSend(taskId + 1);
      try {
        let data = [];
        if (params.id !== undefined) {
          await axios
            .get(`http://95.163.234.208:3500/lists/${listId}`)
            .then((res) => {
              data = res.data.usersId;
            });
        }
        await axios.patch(`http://95.163.234.208:3500/tasks/${taskId}`, {
          active: "section_rigthbtnNone",
        });
        await axios
          .get(`http://95.163.234.208:3500/tasks/${taskId}`)
          .then(({ data }) => {
            setEdit1(data.active);
          });
        const boldText = taskText.split("**").join("!!!");
        const italicText = boldText.split("*").join("@@@");
        const boldTextFinish = italicText.split("!!!").join("*");
        const allBItext = boldTextFinish.split("@@@").join("_");
        const allFixText = allBItext.replace(/\\/g, "");
        const firstFinishedTextTest = allFixText
          .split("![](")
          .join("<img src=");
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

            const lastFinishText = firstFinishText.replace(
              ">" + first_link,
              ""
            );
            const finishedText = lastFinishText.replace("<span><span>", "");
            axios.post(uriApiPhoto, {
              chat_id: Number(ids),
              photo: first_link,
              caption: finishedText,
              parse_mode: "Markdown",
            });
          }
          if (first_link === undefined) {
            if (documentId !== 0) {
              axios.post(uriDoc, {
                chat_id: Number(ids),
                parse_mode: "Markdown",
                caption: finishMyText,
                document: `https://drive.google.com/u/0/uc?id=${documentId}&export=download`,
              });
            }
            if (documentId === 0) {
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
    } else {
      try {
        let data = [];
        if (params.id !== undefined) {
          await axios
            .get(`http://95.163.234.208:3500/lists/${listId}`)
            .then((res) => {
              data = res.data.usersId;
            });
        }
        data.forEach((ids) => {
          axios
            .post(`https://api.telegram.org/bot${token}/sendPoll`, {
              chat_id: Number(ids),
              question: pollQuestion,
              options: pollOptions,
              is_anonymous: false,
            })
            .then((data) => {
              console.log(data.data.result.poll.id);
            });
        });
        await axios.patch(`http://95.163.234.208:3500/tasks/${taskId}`, {
          active: "section_rigthbtnNone",
        });
        await axios
          .get(`http://95.163.234.208:3500/tasks/${taskId}`)
          .then(({ data }) => {
            setEdit1(data.active);
          });
      } catch (err) {
        console.log(err);
      }
    }
  };
  return (
    <>
      <div className="buttonDiv">
        {edit && (
          <>
            <button
              onClick={() => {
                setAddTaskActive(true);
                setTaskIdAdd(taskOrderId);
              }}
              className="addButton"
            >
              +
            </button>
            <button
              onClick={() => {
                setPollActive(true);
                setTaskIdAdd(taskOrderId);
              }}
              className="addQButton"
            >
              опрос
            </button>
          </>
        )}
      </div>
      <div
        className={
          edit1 === "section_rigthbtnNone"
            ? "section_listComplete"
            : "section_list"
        }
      >
        <span>
          <ReactQuill readOnly value={markdown(taskText)} theme={"bubble"} />
        </span>
        <div className="section_list_etc">
          <div
            className="header_icon1"
            onClick={() => {
              setEditTaskId(taskId);
              setEditTaskText(taskText);
              setActive(true);
            }}
          >
            <svg
              width="47"
              height="47"
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M35.4039 17.7808L32.2193 14.5961C31.8349 14.2117 31.3238 14 30.7801 14C30.2365 14 29.7254 14.2117 29.341 14.5961L16.0101 27.927C15.8836 28.0535 15.802 28.2181 15.7779 28.3954L15.0074 34.072C14.9731 34.3251 15.059 34.5798 15.2396 34.7604C15.394 34.9148 15.6025 35 15.818 35C15.8545 35 15.8913 34.9976 15.9281 34.9926L21.6045 34.2221C21.7819 34.198 21.9464 34.1165 22.073 33.9899L35.4039 20.6591C35.7883 20.2747 36 19.7635 36 19.2199C36 18.6763 35.7883 18.1652 35.4039 17.7808ZM21.1112 32.638L16.7731 33.2268L17.362 28.8888L26.8086 19.4422L30.5578 23.1914L21.1112 32.638ZM34.247 19.5022L31.7147 22.0345L27.9655 18.2853L30.4978 15.753C30.5996 15.6512 30.7184 15.636 30.7801 15.636C30.8419 15.636 30.9607 15.6512 31.0624 15.753L34.2471 18.9376C34.3488 19.0394 34.364 19.1581 34.364 19.2199C34.364 19.2816 34.3488 19.4004 34.247 19.5022Z"
                fill="#68BFD6"
              />
              <circle cx="25" cy="25" r="24.5" stroke="#68BFD6" />
            </svg>
          </div>
          {editTaskId && editTaskText !== null ? (
            <EditTask
              editTaskId={editTaskId}
              editTaskText={markdown(editTaskText)}
              setEditTaskText={setEditTaskText}
              onEditTask={onEditTask}
              active={active}
              setActive={setActive}
              listId={listId}
            />
          ) : undefined}
          {!edit ? (
            <button
              className={activeList ? edit1 : "section_rigthbtnNone"}
              onClick={sendLection}
            >
              Публиковать
            </button>
          ) : (
            <>
              <div className="editDiv">
                <svg
                  onClick={taskEditUp}
                  width="14"
                  height="12"
                  viewBox="0 0 14 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.00001 0L13.9282 12H0.0718079L7.00001 0Z"
                    fill="#68BFD6"
                  />
                </svg>
                <svg
                  width="1"
                  height="36"
                  viewBox="0 0 1 36"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M-1.57361e-06 36L0 -4.37114e-08L1 0L0.999998 36L-1.57361e-06 36Z"
                    fill="#68BFD6"
                  />
                </svg>
                <svg
                  onClick={taskEditDown}
                  width="14"
                  height="12"
                  viewBox="0 0 14 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.99999 12L0.071786 -1.21137e-06L13.9282 0L6.99999 12Z"
                    fill="#68BFD6"
                  />
                </svg>
              </div>
              <div
                className="header_iconTrash"
                onClick={() => onRemoveTask(listId, taskId, taskOrderId)}
              >
                <svg
                  width="47"
                  height="47"
                  viewBox="0 0 50 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M22.5092 15.7149C22.5728 15.8251 22.6423 15.9297 22.7172 16.0285C23.617 17.2175 25.2826 17.5778 26.6073 16.813L28.5813 15.6733L30.3133 14.6733L29.3133 12.9412L29.0011 12.4005L28.0011 10.6685L26.2691 11.6685L23.4291 13.3081L21.697 14.3081L22.5092 15.7149ZM27.2691 13.4005L27.5813 13.9412L25.6073 15.0809C25.244 15.2906 24.8039 15.2466 24.4922 15.0037L27.2691 13.4005ZM27.0082 20.3757H29.923C30.0716 20.3757 30.212 20.4079 30.3381 20.4655L28.7473 22.0851L27.0082 20.3757ZM30.1736 23.4871L30.7689 22.881L30.6545 23.9597L30.1736 23.4871ZM25.2167 21.4193L27.3458 23.5119L25.2493 25.6464L23.1383 23.5354L25.2167 21.4193ZM28.7722 24.9139L26.6636 27.0607L28.7746 29.1717L30.2624 27.657L30.3852 26.4993L28.7722 24.9139ZM21.7367 24.9623L23.8478 27.0733L21.6755 29.2849L20.0708 27.6802L19.9729 26.758L21.7367 24.9623ZM25.262 28.4876L23.0897 30.6992L25.2008 32.8102L27.3731 30.5986L25.262 28.4876ZM21.6882 32.1261L20.8277 33.0022C21.0115 33.2054 21.2771 33.3317 21.5697 33.3317H22.8938L21.6882 32.1261ZM28.761 33.3317H27.4919L28.7874 32.0129L29.6194 32.8449C29.4438 33.1383 29.123 33.3317 28.761 33.3317ZM31.7928 32.1899L32.1777 28.5612L32.293 28.4438L32.1999 28.3523L32.4531 25.9648L32.5717 25.8441L32.4759 25.7499L32.9062 21.6921C33.0942 19.92 31.705 18.3757 29.923 18.3757H20.4077C18.6257 18.3757 17.2365 19.92 17.4244 21.6921L18.5864 32.6481C18.7483 34.1739 20.0353 35.3317 21.5697 35.3317H28.761C30.2953 35.3317 31.5824 34.1739 31.7442 32.6481L31.7497 32.5967L31.9746 32.3717L31.7928 32.1899ZM20.3225 23.548L19.6997 24.182L19.5506 22.7762L20.3225 23.548ZM23.4383 20.3757L21.724 22.1211L20.0459 20.443C20.1578 20.3996 20.2797 20.3757 20.4077 20.3757H23.4383Z"
                    fill="#68BFD6"
                  />
                  <circle cx="25" cy="25" r="24.5" stroke="#68BFD6" />
                </svg>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
