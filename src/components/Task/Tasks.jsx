import React from "react";
import "../quillstyles.css";
import { AddTask } from "./AddTask";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { Task } from "./Task";
import { PollAdd } from "./PollAdd";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

export const Tasks = ({
  onAddTask,
  onEditTask,
  lections,
  editable,
  materials,
  getMaterials,
  setMaterials,
}) => {
  const location = useLocation();
  const params = useParams();
  const [addTaskActive, setAddTaskActive] = React.useState(false);
  const [activeLection, setActiveLection] = React.useState(null);
  const [pollActive, setPollActive] = React.useState(false);
  const [poll, setPoll] = React.useState(false);
  const [taskIdAdd, setTaskIdAdd] = React.useState(null);
  const [completeMaterial, setCompleteMaterial] = React.useState(0);

  // Сортировка лекций
  React.useEffect(() => {
    if (lections) {
      const lection = lections.find((lection) => lection._id === params.id);
      setActiveLection(lection);
    }
  }, [
    completeMaterial,
    lections,
    location,
    materials,
    params.id,
    setActiveLection,
  ]);
  React.useEffect(() => {
    if (activeLection) {
      axios
        .get(`http://127.0.0.1:7000/api/list/getlist/${activeLection._id}`)
        .then((res) => setCompleteMaterial(res.data.published));
    }
  }, [activeLection]);

  const reorderNumbers = (result) => {
    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    setMaterials((materials) => {
      const nums = [...materials];
      const [removed] = nums.splice(startIndex, 1);
      nums.splice(endIndex, 0, removed);
      console.log(nums);
      return nums;
    });
  };

  // Сортировка материала
  const sortTasks = (a, b) => {
    if (a.order > b.order) {
      return 1;
    } else {
      return -1;
    }
  };
  return (
    <>
      {materials ? (
        <>
          <div className="section_lection">
            <AddTask
              materials={materials}
              active={addTaskActive}
              setActive={setAddTaskActive}
              getMaterials={getMaterials}
            />
            <PollAdd
              onAddTask={onAddTask}
              taskIdAdd={taskIdAdd}
              activeItem={activeLection}
              pollActive={pollActive}
              setPollActive={setPollActive}
            />
            {activeLection ? (
              materials ? (
                <DragDropContext onDragEnd={reorderNumbers}>
                  <Droppable droppableId="droppable">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {materials.map((material, index) => (
                          <Task
                            index={index}
                            setCompleteMaterial={setCompleteMaterial}
                            getMaterials={getMaterials}
                            lections={lections}
                            material={material}
                            complete={material.complete}
                            pollQuestion={material.pollQuestion}
                            pollOptions={material.pollOptions}
                            setPollActive={setPollActive}
                            setTaskIdAdd={setTaskIdAdd}
                            onEditTask={onEditTask}
                            documentId={material.documentId}
                            taskId={material._id}
                            taskOrderId={material.order}
                            editable={editable}
                            taskText={material.text}
                            setAddTaskActive={setAddTaskActive}
                            key={material._id}
                            setPoll={setPoll}
                          />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              ) : (
                <>
                  <div className="section_list">
                    <span>Загрузка</span>
                  </div>
                </>
              )
            ) : (
              <div className="dp">Привет</div>
            )}
            <div className="centerButtonbottom">
              <button
                onClick={() => {
                  setAddTaskActive(true);
                }}
                className="addButton"
              >
                +
              </button>
              <button
                onClick={() => {
                  setPollActive(true);
                }}
                className="addQButton"
              >
                опрос
              </button>
            </div>
          </div>
          <div className="section_right">
            <div className="section_rightText">количество участников</div>
            <div className="section_number">
              {activeLection ? activeLection.usersId.length : "NAN"}
            </div>
            <div className="section_rightText">Опубликовано</div>
            <div className="section_number">
              {completeMaterial}/{materials?.length}
            </div>
            {activeLection
              ? activeLection.lections.map((task) => {
                  let abc = task.optionsReply?.reduce((acc, el) => {
                    acc[el] = (acc[el] || 0) + 1;
                    return acc;
                  }, {});
                  return task.pollId || poll ? (
                    task.pollId?.length !== 0 || poll ? (
                      <>
                        <div className="section_rightText">
                          Опрос {task.pollQuestion}
                        </div>
                        <div className="section_number">
                          {task.pollOptions?.map((poll, i) =>
                            abc[String(i)] !== undefined ? (
                              <>
                                {poll} - {abc[String(i)]} голос(а)(ов)
                                <br />
                              </>
                            ) : (
                              <>
                                {poll} - 0 голосов
                                <br />
                              </>
                            )
                          )}
                        </div>
                      </>
                    ) : null
                  ) : null;
                })
              : null}
          </div>
        </>
      ) : (
        <div className="backgroundColorTasks">
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
