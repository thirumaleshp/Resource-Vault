import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Trash2 } from "lucide-react";

function ProfessionalTodo() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [repeat, setRepeat] = useState("none");
  // Single time dropdown with 15-minute intervals
  const pad = (n) => n.toString().padStart(2, '0');
  function generateTimeOptions() {
    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hour12 = h % 12 === 0 ? 12 : h % 12;
        const ampm = h < 12 ? 'AM' : 'PM';
        times.push(`${pad(hour12)}:${pad(m)} ${ampm}`);
      }
    }
    return times;
  }
  const timeOptions = generateTimeOptions();
  // Default to the closest next 15-min interval
  const now = new Date();
  const roundedMinutes = Math.ceil(now.getMinutes() / 15) * 15;
  let defaultTimeIdx = now.getHours() * 4 + Math.floor(roundedMinutes / 15);
  if (defaultTimeIdx >= timeOptions.length) defaultTimeIdx = 0;
  const [remindTime, setRemindTime] = useState("");
  const inputRef = useRef(null);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("professional-todos");
    if (stored) setTodos(JSON.parse(stored));
  }, []);
  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("professional-todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setTodos([
      ...todos,
      {
        id: Date.now(),
        title: title.trim(),
        description: description.trim(),
        repeat,
        remindTime,
        completed: false,
      },
    ]);
    setTitle("");
    setDescription("");
    setRepeat("none");
    setRemindTime("");
    if (inputRef.current) inputRef.current.focus();
  };

  const toggleComplete = (id) => {
    setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(todos);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setTodos(reordered);
  };

  return (
    <Card className="max-w-2xl mx-auto mb-8 bg-surface-container-high rounded-2xl shadow-md border-0">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-stretch">
          {/* Clock on the left */}
          {/* ... if you want to add the clock here, you can uncomment the DigitalClock ... */}
          {/* <div className="flex-shrink-0 flex items-center justify-center md:mr-6 mb-6 md:mb-0">
            <DigitalClock />
          </div> */}
          {/* To-Do List content on the right */}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-4 text-primary">To-Do List</h2>
            <form onSubmit={addTodo} className="flex flex-col gap-2 mb-6">
              {/* First row: Task title (half), time & repeat (fit), fills full width */}
              <div className="flex flex-col gap-2 w-full md:flex-row md:items-center">
                <div className="w-full md:flex-1 min-w-0">
                  <Input
                    ref={inputRef}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Task title"
                    className="w-full bg-surface-container-lowest text-on-surface border-0 focus:ring-2 focus:ring-primary/20 rounded-lg shadow-sm text-sm md:text-base h-10"
                    required
                  />
                </div>
                <div className="flex flex-row gap-2 w-full md:w-auto">
                  <Select value={remindTime} onValueChange={setRemindTime}>
                    <SelectTrigger className="w-full md:w-32 bg-surface-container-lowest text-on-surface border-0 focus:ring-2 focus:ring-primary/20 rounded-lg shadow-sm">
                      <SelectValue placeholder="Time" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-surface-container dark:text-on-surface dark:border-outline max-h-64 overflow-y-auto">
                      {timeOptions.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={repeat} onValueChange={setRepeat}>
                    <SelectTrigger className="w-full md:w-28 md:w-32 bg-surface-container-lowest text-on-surface border-0 focus:ring-2 focus:ring-primary/20 rounded-lg shadow-sm">
                      <SelectValue placeholder="Repeat" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-surface-container dark:text-on-surface dark:border-outline">
                      <SelectItem value="none">No Repeat</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Second row: Description and Add button */}
              <div className="flex flex-row gap-2 items-center w-full">
                <div className="flex-1 min-w-0">
                  <Input
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Description (optional)"
                    className="w-full bg-surface-container-lowest text-on-surface border-0 focus:ring-2 focus:ring-primary/20 rounded-lg shadow-sm"
                  />
                </div>
                <Button type="submit" className="flex-1 rounded-lg bg-primary text-on-primary hover:bg-primary/90 h-10 px-6">Add</Button>
              </div>
            </form>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="todo-list">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                    {todos.length === 0 && <div className="text-on-surface-variant text-center">No tasks yet.</div>}
                    {todos.map((todo, idx) => (
                      <Draggable key={todo.id} draggableId={todo.id.toString()} index={idx}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className={`flex items-start gap-3 p-3 rounded-xl bg-surface-container-lowest shadow-sm group transition-all duration-300 ${todo.completed ? 'opacity-60' : ''} ${dragSnapshot.isDragging ? 'ring-2 ring-primary' : ''}`}
                            style={{ ...dragProvided.draggableProps.style, animation: todo.completed ? 'fadeOut 0.5s' : undefined }}
                          >
                            <Checkbox
                              checked={todo.completed}
                              onCheckedChange={() => toggleComplete(todo.id)}
                              className="accent-primary w-5 h-5 mt-1 rounded focus:ring-2 focus:ring-primary/20"
                              aria-label="Mark as done"
                            />
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium text-on-surface ${todo.completed ? 'line-through opacity-60' : ''}`}>{todo.title}</div>
                              {todo.description && <div className="text-on-surface-variant text-sm">{todo.description}</div>}
                              {todo.repeat !== 'none' && <div className="text-xs text-on-surface-variant mt-1">Repeat: {todo.repeat.charAt(0).toUpperCase() + todo.repeat.slice(1)}</div>}
                              {todo.remindTime && (
                                <div className="text-xs text-on-surface-variant mt-1">Remind at: {todo.remindTime}</div>
                              )}
                            </div>
                            <div className="flex flex-col gap-1">
                              <Button size="sm" variant="ghost" onClick={() => deleteTodo(todo.id)} className="rounded-full text-on-surface-variant hover:bg-destructive/10 hover:text-destructive" aria-label="Delete">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProfessionalTodo; 