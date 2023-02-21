import axios from "axios";
import React from "react";
import { Header } from "../Header/Header";
import "../Header/styles.css";
import { useNavigate, useParams } from "react-router-dom";
import { Tasks } from "../Task/Tasks";
import { Instruction } from "../Task/Instruction";
import { ReactComponent as RemoveCircle } from "../../assets/svg/remove.svg";
import { ReactComponent as EditCircle } from "../../assets/svg/edit.svg";

export const Lists = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [lists, setLists] = React.useState(null);
  const [lections, setLections] = React.useState(null);
  const [visiblePopup, setVisiblePopup] = React.useState(false);
  const [listInputValue, setListInputValue] = React.useState("");
  const [instrActive, setInstrActive] = React.useState(false);
  const [materials, setMaterials] = React.useState(null);
  // Отсюда пойдут основные правки mongodb

  // Получение лекций
  const getList = React.useCallback(async () => {
    try {
      await axios
        .get("http://127.0.0.1:7000/api/list/getlist", {})
        .then((res) => {
          setLections(res.data);
        });
    } catch (err) {
      console.log(err);
    }
  }, []);
  // Получение лекций
  React.useEffect(() => {
    getList();
  }, [getList]);
  // Добавление лекций
  const addList = () => {
    if (!listInputValue) {
      alert("Введите название списка");
      return;
    }
    axios
      .post("http://127.0.0.1:7000/api/list/addlist", {
        listInputValue,
      })
      .then(() => {
        setVisiblePopup(false);
        setListInputValue("");
        getList();
      })
      .catch((err) => {
        console.log(err);
        alert("Ошибка при добавлении списка!");
      });
  };

  // Получение материалов
  const getMaterials = React.useCallback(async () => {
    try {
      if (params.id !== "1") {
        await axios
          .get("http://127.0.0.1:7000/api/lection/getmaterial", {
            params: { params },
          })
          .then((res) => {
            setMaterials(res.data);
          });
      }
    } catch (err) {
      console.log(err);
    }
  }, [params]);

  React.useEffect(() => {
    getMaterials();
  }, [getMaterials]);
  // тут конец правок

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

  const onAddTask = (listId, taskObj, taskIdAdd) => {
    const newList = lists.map((item) => {
      if (item.id === listId) {
        item.tasks = [...item.tasks, taskObj];

        item.tasks.map((task) => {
          if (taskIdAdd) {
            if (task.order === taskIdAdd) {
              taskObj.order = taskIdAdd;
            }
            if (taskObj.id !== task.id) {
              if (task.order >= taskIdAdd) {
                task.order = task.order + 1;
              }
            }
          }
          axios.patch("http://95.163.234.208:3500/tasks/" + task.id, {
            order: task.order,
          });
          return task;
        });
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
            data.forEach((list) => {
              if (list.id === Number(params.id)) {
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

  // Удаление материала
  const removeMaterial = (listId, taskId, taskOrderId) => {
    if (window.confirm("Подтвердить удаление?")) {
      const newList = lists.map((item) => {
        if (item.id === listId) {
          item.tasks = item.tasks.filter((task) => task.id !== taskId);
        }
        if (item.id === listId) {
          item.tasks.forEach((task) => {
            if (task.order > taskOrderId) {
              axios.patch(`http://95.163.234.208:3500/tasks/${task.id}`, {
                order: task.order - 1,
              });
            }
          });
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

  const removeList = (id) => {
    if (window.confirm("Вы действительно хотите удалить лекцию?")) {
      axios
        .delete(`http://127.0.0.1:7000/api/list/deletelist/${id}`)
        .then(() => {
          getList();
        });
    }
  };

  return (
    <>
      {lections ? (
        <>
          <Instruction
            instrActive={instrActive}
            setInstrActive={setInstrActive}
          />
          <Header
            getMaterials={getMaterials}
            getList={getList}
            lections={lections}
            onDublicateList={onDublicateList}
          />
          <div className="section">
            <div className="section_left">
              <div className="section_text">Активные</div>
              {lections
                ? lections.map((lection) =>
                    lection.active ? (
                      <div
                        onClick={() => {
                          navigate(`/posts/${lection._id}`);
                          getMaterials();
                        }}
                        className="section_activelectname"
                        key={lection._id}
                      >
                        {lection.name}
                      </div>
                    ) : undefined
                  )
                : "Загрузка."}
              <div className="border"></div>
              <div className="section_text">Доступные</div>
              {lections
                ? lections.map((lection) =>
                    !lection.active ? (
                      <div className="listsTable" key={lection._id}>
                        <div
                          onClick={() => {
                            navigate(`/posts/${lection._id}`);
                            getMaterials();
                          }}
                          className="section_dislectname"
                          key={lection.id}
                        >
                          {lection.name}
                        </div>
                        <div className="flexTable">
                          <div
                            onClick={() => editTitle(lection.id, lection.name)}
                          >
                            <EditCircle />
                          </div>
                          <div onClick={() => removeList(lection._id)}>
                            <RemoveCircle />
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
                    value={listInputValue}
                    onChange={(e) => setListInputValue(e.target.value)}
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
              <div>
                <button
                  className="section_helpbtn"
                  onClick={() => setInstrActive(true)}
                >
                  <div className="section_helpbtn1">?</div>Инструкция сервиса
                </button>
              </div>
            </div>
            <Tasks
              setMaterials={setMaterials}
              materials={materials}
              getMaterials={getMaterials}
              lections={lections}
              setLists={setLists}
              onAddTask={onAddTask}
              onEditTask={onEditTask}
            />
          </div>
        </>
      ) : (
        <div className="backgroundColor">
          <div className="lds-ellipsis">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      )}
    </>
  );
};
