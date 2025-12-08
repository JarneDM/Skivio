import React from "react";
import Status from "./Status.jsx";
import { DragDropContext } from "@hello-pangea/dnd";
// import { db } from "../../db.js";
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

    const moveDetail = {
      move: true,
      id: Number(draggableId),
      fromStatus: source.droppableId,
      toStatus: destination.droppableId,
      fromIndex: source.index,
      toIndex: destination.index,
    };

    // optimistically update UI first
    try {
      window.dispatchEvent(new CustomEvent("tasksUpdated", { detail: moveDetail }));
    } catch (e) {
      void e;
    }

    // persist new status and position
    try {
      const res = await fetch(`https://task-manager.ddev.site/api/tasks/${draggableId}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ status_id: destination.droppableId, position: destination.index }),
      });

      console.log(`Move task ${draggableId} from ${source.droppableId} to ${destination.droppableId}`);

      if (!res.ok) {
        window.dispatchEvent(new CustomEvent("tasksUpdated"));
        return;
      }

      // prefer the server's ordering (position) if it returns JSON
      try {
        const updatedTask = await res.json();
        if (updatedTask && updatedTask.id) {
          window.dispatchEvent(new CustomEvent("tasksUpdated", { detail: updatedTask }));
          return;
        }
      } catch {
        // fall through to minimal dispatch
      }

      // fallback minimal detail with requested position
      const persisted = { id: Number(draggableId), status_id: destination.droppableId, position: destination.index };
      window.dispatchEvent(new CustomEvent("tasksUpdated", { detail: persisted }));
    } catch (error) {
      console.error("Failed to update task status:", error);
      window.dispatchEvent(new CustomEvent("tasksUpdated"));
    }
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
