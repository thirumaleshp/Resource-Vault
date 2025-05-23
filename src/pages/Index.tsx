import { useState, useRef, useEffect } from "react";
import { Plus, Search, FileText, Link, Image, File, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import AddResourceModal from "@/components/AddResourceModal";
import ResourceCard from "@/components/ResourceCard";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export type ResourceType = 'note' | 'link' | 'image' | 'pdf' | 'file';
export type ResourceCategory = 'study' | 'watch later' | 'work' | 'personal';

export interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  content: string;
  category: ResourceCategory;
  createdAt: Date;
  tags: string[];
  fileURL?: string;
  fileData?: File;
}

function ProfessionalTodo() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [repeat, setRepeat] = useState("none");
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
        completed: false,
      },
    ]);
    setTitle("");
    setDescription("");
    setRepeat("none");
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
        <h2 className="text-2xl font-semibold mb-4 text-primary">To-Do List</h2>
        <form onSubmit={addTodo} className="flex flex-col gap-2 mb-6">
          <div className="flex flex-row gap-2">
            <Input
              ref={inputRef}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Task title"
              className="flex-1 bg-surface-container-lowest text-on-surface border-0 focus:ring-2 focus:ring-primary/20 rounded-lg shadow-sm text-sm md:text-base"
              required
            />
            <Select value={repeat} onValueChange={setRepeat}>
              <SelectTrigger className="w-28 md:w-32 bg-surface-container-lowest text-on-surface border-0 focus:ring-2 focus:ring-primary/20 rounded-lg shadow-sm px-3 text-sm md:text-base">
                <SelectValue placeholder="Repeat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Repeat</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="rounded-lg bg-primary text-on-primary hover:bg-primary/90 w-full">Add</Button>
        </form>
        <Input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="mb-4 bg-surface-container-lowest text-on-surface border-0 focus:ring-2 focus:ring-primary/20 rounded-lg shadow-sm"
        />
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
      </CardContent>
    </Card>
  );
}

const Index = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | "all" | "home">("home");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [selectedType, setSelectedType] = useState<ResourceType | 'file_group' | 'all'>('all');

  const categories: (ResourceCategory | "all")[] = ["all", "watch later", "study", "work", "personal"];
  
  const getResourceTypeIcon = (type: ResourceType) => {
    switch (type) {
      case 'note': return <FileText className="w-4 h-4" />;
      case 'link': return <Link className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'pdf': return <File className="w-4 h-4" />;
      case 'file': return <File className="w-4 h-4" />;
    }
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
    const matchesType = selectedType === 'all' || 
                        (selectedType === 'file_group' && (resource.type === 'pdf' || resource.type === 'file')) ||
                        (selectedType !== 'file_group' && resource.type === selectedType);

    return matchesSearch && matchesCategory && matchesType;
  });

  const addResource = (newResource: Omit<Resource, 'id' | 'createdAt'>) => {
    const resource: Resource = {
      ...newResource,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setResources([resource, ...resources]);
  };

  const deleteResource = (id: string) => {
    setResources(resources.filter(resource => resource.id !== id));
  };

  const getResourceStats = () => {
    return {
      total: resources.length,
      notes: resources.filter(r => r.type === 'note').length,
      links: resources.filter(r => r.type === 'link').length,
      images: resources.filter(r => r.type === 'image').length,
      files: resources.filter(r => r.type === 'pdf' || r.type === 'file').length,
    };
  };

  const stats = getResourceStats();

  const buttonStyle = (selected: boolean) =>
    `rounded-full px-6 transition-colors duration-200 focus:outline-none focus:ring-0 
    ${selected ? 'bg-primary hover:bg-primary/90 text-on-primary border-none' : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant border-none'}`;

  return (
    <div className="min-h-screen bg-surface-container-lowest dark">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            ResourceHub
          </h1>
          <p className="text-on-surface-variant text-lg">
            Your personal knowledge vault - all resources in one place
          </p>
        </div>

        {/* Stats Cards styled as M3 Pills */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {/* Notes Button */}
          <Button
            onClick={() => {
              setSelectedType('note');
              setShowResources(true);
              setSelectedCategory('all');
            }}
            className={`flex-1 min-w-[150px] h-14 text-xl font-bold ${buttonStyle(selectedType === 'note')}`}
          >
            {stats.notes}
            <span className="ml-2 text-sm font-normal">Notes</span>
          </Button>

          {/* Links Button */}
          <Button
            onClick={() => {
              setSelectedType('link');
              setShowResources(true);
              setSelectedCategory('all');
            }}
            className={`flex-1 min-w-[150px] h-14 text-xl font-bold ${buttonStyle(selectedType === 'link')}`}
          >
            {stats.links}
            <span className="ml-2 text-sm font-normal">Links</span>
          </Button>

          {/* Images Button */}
          <Button
            onClick={() => {
              setSelectedType('image');
              setShowResources(true);
              setSelectedCategory('all');
            }}
            className={`flex-1 min-w-[150px] h-14 text-xl font-bold ${buttonStyle(selectedType === 'image')}`}
          >
            {stats.images}
            <span className="ml-2 text-sm font-normal">Images</span>
          </Button>

          {/* Files Button */}
          <Button
            onClick={() => {
              setSelectedType('file_group');
              setShowResources(true);
              setSelectedCategory('all');
            }}
            className={`flex-1 min-w-[150px] h-14 text-xl font-bold ${buttonStyle(selectedType === 'file_group')}`}
          >
            {stats.files}
            <span className="ml-2 text-sm font-normal">Files</span>
          </Button>
        </div>

        {/* Search and Filters */}
        {showResources && (
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-row gap-2 items-center">
              <Button
                variant={selectedCategory === 'home' ? "default" : "outline"}
                onClick={() => {
                  setSelectedType('all');
                  setSelectedCategory('home');
                  setShowResources(false);
                }}
                className={buttonStyle(selectedCategory === 'home') + ' h-12'}
              >
                Home
              </Button>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant w-4 h-4" />
                <Input
                  placeholder="Search resources, tags, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-surface-container-high border-0 focus:ring-2 focus:ring-primary/20 rounded-full shadow-sm"
                />
              </div>
            </div>
            <div className="flex flex-row gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={buttonStyle(selectedCategory === category) + ' h-12'}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Resources Grid or Dashboard Content */}
        {showResources ? (
          filteredResources.length > 0 ? (
            <div className="flex flex-wrap gap-6">
              {filteredResources.map((resource) => (
                <ResourceCard 
                  key={resource.id} 
                  resource={resource} 
                  onDelete={deleteResource}
                  getResourceTypeIcon={getResourceTypeIcon}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-on-surface mb-2">No resources found</h3>
              <p className="text-on-surface-variant">Try adjusting your search or filters</p>
            </div>
          )
        ) : (
          <>
            {selectedType === 'all' && !showResources && <ProfessionalTodo />}
            <div className="text-center text-on-surface-variant">
              <p>Select a resource type above to view.</p>
            </div>
          </>
        )}

        {/* Floating Action Button */}
        <Button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-primary hover:bg-primary/90 text-on-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        >
          <Plus className="w-6 h-6" />
        </Button>

        {/* Add Resource Modal */}
        <AddResourceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={addResource}
        />
      </div>
    </div>
  );
};

export default Index;
