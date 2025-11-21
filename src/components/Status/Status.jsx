import React, { useState } from "react";
import TaskCards from "../Tasks/TaskCards.jsx";
import AddTask from "../Tasks/AddTask.jsx";
import { useProject } from "../../contexts/ProjectContext.jsx";
import { Droppable } from "@hello-pangea/dnd";

function Status({ status, search }) {
  const [dueDate, setDueDate] = useState("");
  useProject();

  // convert hex color (#rrggbb or #rgb) to rgba string with alpha
  const hexToRgba = (hex, alpha = 1) => {
    if (!hex) return hex;
    let h = hex.replace("#", "");
    if (h.length === 3) {
      h = h
        .split("")
        .map((c) => c + c)
        .join("");
    }
    const int = parseInt(h, 16);
    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <Droppable droppableId={String(status.id)}>
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={`mx-5 p-2 h-[80vh] rounded-lg flex flex-col items-center overflow-y-scroll no-scrollbar border-black border shadow-lg dark:bg-[#022c54]`}
          style={{ backgroundColor: hexToRgba(status.color, 0.5) }}
        >
          <h3
            className={`font-bold mb-2 px-3 py-1 rounded-xl w-full flex justify-center text-white dark:text-white`}
            style={{ backgroundColor: hexToRgba(status.color, 0.7) }}
          >
            {status.name}
          </h3>
          <TaskCards statusColor={status.color} status={status} search={search} setDueDate={setDueDate} dueDate={dueDate} />

          {provided.placeholder}

          <AddTask statusColor={status.color} dueDate={dueDate} setDueDate={setDueDate} chosenStatus={status} />
        </div>
      )}
    </Droppable>
  );
}

export default Status;
