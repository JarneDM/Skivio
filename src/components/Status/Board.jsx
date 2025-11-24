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

    if (destination.droppableId === source.droppableId) {
      if (destination.index === source.index) return;
      const reorderDetail = {
        reorder: true,
        id: Number(draggableId),
        status_id: destination.droppableId,
        fromIndex: source.index,
        toIndex: destination.index,
      };

      try {
        window.dispatchEvent(new CustomEvent("tasksUpdated", { detail: reorderDetail }));
      } catch (e) {
        void e;
      }

      (async () => {
        try {
          const res = await fetch(`https://task-manager.ddev.site/api/tasks/${draggableId}`, {
            method: "PUT",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            body: JSON.stringify({ position: destination.index, status_id: destination.droppableId }),
          });

          if (!res.ok) {
            // fallback: ask clients to refetch full lists
            window.dispatchEvent(new CustomEvent("tasksUpdated"));
            return;
          }

          try {
            const updatedTask = await res.json();
            if (updatedTask && updatedTask.id) {
              window.dispatchEvent(new CustomEvent("tasksUpdated", { detail: updatedTask }));
            }
          } catch {
            // ignore JSON parse errors; UI already updated optimistically
          }
        } catch (err) {
          console.error("Failed to persist reordered position:", err);
          // fallback to full refetch
          window.dispatchEvent(new CustomEvent("tasksUpdated"));
        }
      })();

      return;
    }

    // await db.tasks.update(Number(draggableId), {
    //   status: destination.droppableId,
    // });

    try {
      const res = await fetch(`https://task-manager.ddev.site/api/tasks/${draggableId}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ status_id: destination.droppableId }),
      });

      console.log(`Move task ${draggableId} from ${source.droppableId} to ${destination.droppableId}`);

      // Try to parse the updated task object from the response. If unavailable, dispatch minimal detail.
      try {
        const updatedTask = await res.json();
        if (updatedTask && updatedTask.id) {
          window.dispatchEvent(new CustomEvent("tasksUpdated", { detail: updatedTask }));
        } else {
          const updated = { id: Number(draggableId), status_id: destination.droppableId };
          window.dispatchEvent(new CustomEvent("tasksUpdated", { detail: updated }));
        }
      } catch {
        // If JSON parse fails, fallback to minimal dispatch
        const updated = { id: Number(draggableId), status_id: destination.droppableId };
        try {
          window.dispatchEvent(new CustomEvent("tasksUpdated", { detail: updated }));
        } catch (e) {
          void e;
        }
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
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
