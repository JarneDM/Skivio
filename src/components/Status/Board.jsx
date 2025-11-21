import React from "react";
import Status from "./Status.jsx";
import { DragDropContext } from "@hello-pangea/dnd";
import { db } from "../../db.js";
import { useState } from "react";

function Board({ search }) {
  const [statuses, setStatuses] = useState([]);

  const fetchStatuses = async () => {
    const res = await fetch("https://task-manager.ddev.site/api/statuses", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });
    const data = await res.json();
    // const classes = {};
    console.log("Fetched statuses:", data);
    setStatuses(data);
  };

  React.useEffect(() => {
    fetchStatuses();
  }, []);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    await db.tasks.update(Number(draggableId), {
      status: destination.droppableId,
    });
    console.log(`Move task ${draggableId} from ${source.droppableId} to ${destination.droppableId}`);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-4 gap-4 p-4">
        {statuses.map((status) => (
          <Status key={status.id} status={status} search={search} />
        ))}
      </div>
    </DragDropContext>
  );
}

export default Board;
