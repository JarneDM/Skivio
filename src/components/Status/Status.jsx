import React, { useState } from "react";
import TaskCards from "../Tasks/TaskCards.jsx";
import AddTask from "../Tasks/AddTask.jsx";
import { Droppable } from "@hello-pangea/dnd";

const statusClasses = {
  Backlog: "backlog",
  Todo: "todo",
  "In Progress": "in-progress",
  Testing: "testing",
  Done: "done",
};

function Status({ status, selectedProject, search }) {
  const [dueDate, setDueDate] = useState("");
  return (
    <Droppable droppableId={status}>
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={`mx-5 p-2 h-[80vh] rounded-lg flex flex-col items-center overflow-y-scroll no-scrollbar border-black border shadow-lg ${statusClasses[status]}`}
        >
          <h3 className={`font-bold mb-2 px-3 py-1 rounded-xl w-full flex justify-center ${statusClasses[status]} dark:text-white`}>
            {status}
          </h3>

          <TaskCards
            statusClasses={statusClasses[status]}
            status={status}
            selectedProject={selectedProject?.id}
            search={search}
            setDueDate={setDueDate}
            dueDate={dueDate}
          />

          {provided.placeholder}

          <AddTask
            statusClasses={statusClasses[status]}
            dueDate={dueDate}
            setDueDate={setDueDate}
            chosenStatus={status}
            selectedProject={selectedProject?.id}
          />
        </div>
      )}
    </Droppable>
  );
}

export default Status;
