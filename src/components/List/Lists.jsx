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

  const onEditListTitle = (id, title) => {
    const newList = lists.map((item) => {
      if (item.id === id) {
        item.name = title;
      }
      return item;
    });
    setLists(newList);
  };

  const onDublicateList = async () => {
    lists?.forEach(async (list) => {
      if (list.id === Number(params.id)) {
        await axios.post("http://95.163.234.208:3500/lists", {
          name: list.name,
          colorId: 1,
          usersId: [],
        });
        await axios
          .get("http://95.163.234.208:3500/lists?_expand=color&_embed=tasks")
          .then(({ data }) => {
            // data[data.length - 1].tasks = data[params.id - 1].tasks;
            // data[data.length - 1].tasks.forEach((e) => {
            // axios.post("http://95.163.234.208:3500/tasks", {
            //   listId: data.length - 1 + 1,
            //   active: e.active,
            //   text: e.text,
            //   documentId: e.documentId,
            //   completed: false,
            // });
            data.forEach((list) => {
              if (list.id === Number(params.id)) {
                console.log(list.tasks);
                list.tasks.forEach((task) => {
                  axios.post("http://95.163.234.208:3500/tasks", {
                    listId: data[data.length - 1].id,
                    active: task.active,
                    text: task.text,
                    documentId: task.documentId,
                    completed: false,
                  });
                });
              }
            });

            setLists(data);
          });
      }
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
    // await lists?.[params.id - 1].tasks.forEach((task) => {
    //   axios.patch(`http://95.163.234.208:3500/tasks/${task.id}`, {
    //     active: "section_rigthbtn",
    //   });
    //   // setTimeout(() => {
    //   //   window.location.reload();
    //   // }, "1000");
    // });
    await lists.forEach((list) => {
      if (list.id === Number(params.id)) {
        // axios.patch(`http://95.163.234.208:3500/tasks/${task.id}`, {
        //   active: "section_rigthbtn",
        // });
        // setTimeout(() => {
        //   window.location.reload();
        // }, "1000");
        list.tasks.forEach(
          (task) =>
            axios.patch(`http://95.163.234.208:3500/tasks/${task.id}`, {
              active: "section_rigthbtn",
            }),
          setTimeout(() => {
            window.location.reload();
          }, "1000")
        );
      }
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

  const editTitle = (listId, listName) => {
    const newTitle = window.prompt("Название лекции", listName);
    if (newTitle) {
      onEditListTitle(listId, newTitle);
      axios
        .patch("http://95.163.234.208:3500/lists/" + listId, {
          name: newTitle,
        })
        .catch((e) => {
          alert("Не удалось обновить название лекции");
          console.log(e);
        });
    }
  };

  const removeList = (itemId) => {
    if (window.confirm("Вы действительно хотите удалить список?")) {
      axios.delete("http://95.163.234.208:3500/lists/" + itemId).then(() => {
        const newLists = lists.filter((item) => item.id !== itemId);
        setLists(newLists);
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
                  <div className="listsTable">
                    <div
                      onClick={() => navigate(`/posts/${list.id}`)}
                      className="section_dislectname"
                      key={list.id}
                    >
                      {list.name}
                    </div>
                    <div
                      className="flexTable"
                      onClick={() => console.log(list.name)}
                    >
                      <div onClick={() => editTitle(list.id, list.name)}>
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 50 50"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M35.4039 17.7808L32.2193 14.5961C31.8349 14.2117 31.3238 14 30.7801 14C30.2365 14 29.7254 14.2117 29.341 14.5961L16.0101 27.927C15.8836 28.0535 15.802 28.2181 15.7779 28.3954L15.0074 34.072C14.9731 34.3251 15.059 34.5798 15.2396 34.7604C15.394 34.9148 15.6025 35 15.818 35C15.8545 35 15.8913 34.9976 15.9281 34.9926L21.6045 34.2221C21.7819 34.198 21.9464 34.1165 22.073 33.9899L35.4039 20.6591C35.7883 20.2747 36 19.7635 36 19.2199C36 18.6763 35.7883 18.1652 35.4039 17.7808ZM21.1112 32.638L16.7731 33.2268L17.362 28.8888L26.8086 19.4422L30.5578 23.1914L21.1112 32.638ZM34.247 19.5022L31.7147 22.0345L27.9655 18.2853L30.4978 15.753C30.5996 15.6512 30.7184 15.636 30.7801 15.636C30.8419 15.636 30.9607 15.6512 31.0624 15.753L34.2471 18.9376C34.3488 19.0394 34.364 19.1581 34.364 19.2199C34.364 19.2816 34.3488 19.4004 34.247 19.5022Z"
                            fill="#68BFD6"
                          ></path>
                          <circle
                            cx="25"
                            cy="25"
                            r="24.5"
                            stroke="#68BFD6"
                          ></circle>
                        </svg>
                      </div>
                      <div onClick={() => removeList(list.id)}>
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 50 50"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M22.5092 15.7149C22.5728 15.8251 22.6423 15.9297 22.7172 16.0285C23.617 17.2175 25.2826 17.5778 26.6073 16.813L28.5813 15.6733L30.3133 14.6733L29.3133 12.9412L29.0011 12.4005L28.0011 10.6685L26.2691 11.6685L23.4291 13.3081L21.697 14.3081L22.5092 15.7149ZM27.2691 13.4005L27.5813 13.9412L25.6073 15.0809C25.244 15.2906 24.8039 15.2466 24.4922 15.0037L27.2691 13.4005ZM27.0082 20.3757H29.923C30.0716 20.3757 30.212 20.4079 30.3381 20.4655L28.7473 22.0851L27.0082 20.3757ZM30.1736 23.4871L30.7689 22.881L30.6545 23.9597L30.1736 23.4871ZM25.2167 21.4193L27.3458 23.5119L25.2493 25.6464L23.1383 23.5354L25.2167 21.4193ZM28.7722 24.9139L26.6636 27.0607L28.7746 29.1717L30.2624 27.657L30.3852 26.4993L28.7722 24.9139ZM21.7367 24.9623L23.8478 27.0733L21.6755 29.2849L20.0708 27.6802L19.9729 26.758L21.7367 24.9623ZM25.262 28.4876L23.0897 30.6992L25.2008 32.8102L27.3731 30.5986L25.262 28.4876ZM21.6882 32.1261L20.8277 33.0022C21.0115 33.2054 21.2771 33.3317 21.5697 33.3317H22.8938L21.6882 32.1261ZM28.761 33.3317H27.4919L28.7874 32.0129L29.6194 32.8449C29.4438 33.1383 29.123 33.3317 28.761 33.3317ZM31.7928 32.1899L32.1777 28.5612L32.293 28.4438L32.1999 28.3523L32.4531 25.9648L32.5717 25.8441L32.4759 25.7499L32.9062 21.6921C33.0942 19.92 31.705 18.3757 29.923 18.3757H20.4077C18.6257 18.3757 17.2365 19.92 17.4244 21.6921L18.5864 32.6481C18.7483 34.1739 20.0353 35.3317 21.5697 35.3317H28.761C30.2953 35.3317 31.5824 34.1739 31.7442 32.6481L31.7497 32.5967L31.9746 32.3717L31.7928 32.1899ZM20.3225 23.548L19.6997 24.182L19.5506 22.7762L20.3225 23.548ZM23.4383 20.3757L21.724 22.1211L20.0459 20.443C20.1578 20.3996 20.2797 20.3757 20.4077 20.3757H23.4383Z"
                            fill="#68BFD6"
                          ></path>
                          <circle
                            cx="25"
                            cy="25"
                            r="24.5"
                            stroke="#68BFD6"
                          ></circle>
                        </svg>
                      </div>
                    </div>
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
