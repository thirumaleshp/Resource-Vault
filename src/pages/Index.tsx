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
import { useToast } from "@/components/ui/use-toast";
import { getResources as idbGetResources, addResource as idbAddResource, deleteResource as idbDeleteResource, IDBResource } from "@/lib/idb";

export type ResourceType = 'note' | 'link' | 'image' | 'pdf' | 'file';
export type BuiltInCategory = 'study' | 'watch later' | 'work' | 'personal';
export type ResourceCategory = BuiltInCategory | string;

export interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  content: string;
  category: ResourceCategory;
  createdAt: Date;
  tags: string[];
  fileData?: File | Blob;
  audioBlob?: Blob;
  audioURL?: string;
}

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

const Index = () => {
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | "all" | "home">("home");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [selectedType, setSelectedType] = useState<ResourceType | 'file_group' | 'all'>('all');
  const [customTags, setCustomTags] = useState<string[]>(() => {
    const saved = localStorage.getItem('customTags');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState("");
  const newTagInputRef = useRef<HTMLInputElement>(null);

  // --- Reminder Notification Logic ---
  // Track notified task IDs for today
  const notifiedRef = useRef<{[key: string]: string}>({}); // { [taskId]: 'YYYY-MM-DD' }
  useEffect(() => {
    // Request browser notification permission on mount
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    const interval = setInterval(() => {
      const now = new Date();
      const nowStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      const today = now.toISOString().slice(0, 10);
      // Check all todos in localStorage
      const todos = JSON.parse(localStorage.getItem('professional-todos') || '[]');
      todos.forEach((todo) => {
        if (!todo.remindTime || todo.completed) return;
        // Normalize time string for comparison
        const todoTime = todo.remindTime.replace(/^0/, '').replace(' 0', ' ');
        const nowTime = nowStr.replace(/^0/, '').replace(' 0', ' ');
        if (todoTime === nowTime && notifiedRef.current[todo.id] !== today) {
          // In-app toast
          toast({
            title: `Task Reminder: ${todo.title}`,
            description: todo.description || undefined,
          });
          // Browser notification
          if (window.Notification && Notification.permission === 'granted') {
            new Notification(`Task Reminder: ${todo.title}`, {
              body: todo.description || 'It\'s time for your task!',
            });
          }
          notifiedRef.current[todo.id] = today;
        }
      });
    }, 30000); // check every 30 seconds
    return () => clearInterval(interval);
  }, [toast]);

  // Load resources from IndexedDB on initial render
  useEffect(() => {
    async function migrateAndLoad() {
      // 1. Migration: move from localStorage to IndexedDB if needed
      const savedResources = localStorage.getItem('resources');
      if (savedResources) {
        try {
          const parsed = JSON.parse(savedResources);
          const dbResources = await idbGetResources();
          const dbIds = new Set(dbResources.map(r => r.id));
          for (const r of parsed) {
            if (!dbIds.has(r.id)) {
              await idbAddResource({
                ...r,
                createdAt: (typeof r.createdAt === 'string') ? r.createdAt : new Date(r.createdAt).toISOString(),
              });
            }
          }
          localStorage.removeItem('resources');
        } catch (e) {
          // ignore migration errors
        }
      }
      // 2. Load from IndexedDB
      idbGetResources().then((dbResources) => {
        setResources(dbResources.map((r) => ({
          ...r,
          type: r.type as ResourceType,
          category: r.category as ResourceCategory,
          createdAt: new Date(r.createdAt)
        })));
      });
    }
    migrateAndLoad();
  }, []);

  useEffect(() => {
    localStorage.setItem('customTags', JSON.stringify(customTags));
  }, [customTags]);

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
    let matchesType = selectedType === 'all' || 
      (selectedType === 'file_group' && (resource.type === 'pdf' || resource.type === 'file')) ||
      (selectedType !== 'file_group' && resource.type === selectedType);

    // For images, only include resources with valid image Blob
    if (selectedType === 'image') {
      matchesType = resource.type === 'image' && resource.fileData &&
        typeof (resource.fileData as Blob).type === 'string' &&
        (resource.fileData as Blob).type.startsWith('image/');
    }

    return matchesSearch && matchesCategory && matchesType;
  });

  const addResource = (newResource: Omit<Resource, 'id' | 'createdAt'>) => {
    const saveResource = (resource: Resource) => {
      const idbResource: IDBResource = {
        ...resource,
        createdAt: resource.createdAt.toISOString(),
        // fileData is a Blob
      };
      idbAddResource(idbResource).then(() => {
        setResources(prev => [resource, ...prev]);
      }).catch(() => {
        toast({
          title: "Storage Error",
          description: "Failed to save resource to IndexedDB.",
          variant: "destructive",
        });
      });
    };
    if (newResource.fileData) {
      // Store the file as a Blob
      const resource: Resource = {
        ...newResource,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        fileData: newResource.fileData,
      };
      saveResource(resource);
    } else {
      const resource: Resource = {
        ...newResource,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      };
      saveResource(resource);
    }
  };

  const deleteResource = (id: string) => {
    idbDeleteResource(id).then(() => {
      setResources(prev => prev.filter(resource => resource.id !== id));
    }).catch(() => {
      toast({
        title: "Delete Error",
        description: "Failed to delete resource from IndexedDB.",
        variant: "destructive",
      });
    });
  };

  const getResourceStats = () => {
    return {
      total: resources.length,
      notes: resources.filter(r => r.type === 'note').length,
      links: resources.filter(r => r.type === 'link').length,
      images: resources.filter(r => r.type === 'image' && r.fileData && typeof (r.fileData as Blob).type === 'string' && (r.fileData as Blob).type.startsWith('image/')).length,
      files: resources.filter(r => r.type === 'pdf' || r.type === 'file').length,
    };
  };

  const stats = getResourceStats();

  const buttonStyle = (selected: boolean) =>
    `rounded-full px-6 transition-colors duration-200 focus:outline-none focus:ring-0 
    ${selected ? 'bg-primary hover:bg-primary/90 text-on-primary border-none' : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant border-none'}`;

  const handleAddCustomCategory = (category: string) => {
    if (!customTags.includes(category)) {
      setCustomTags([...customTags, category]);
      toast({
        title: "Category Added",
        description: `"${category}" has been added to your categories.`,
      });
    }
  };

  const handleDeleteCustomCategory = (category: string) => {
    // Check if category is in use
    const categoryInUse = resources.some(resource => resource.category === category);
    if (categoryInUse) {
      toast({
        title: "Cannot Delete Category",
        description: "This category is in use by one or more resources. Please reassign those resources first.",
        variant: "destructive",
      });
      return;
    }
    setCustomTags(customTags.filter(tag => tag !== category));
    toast({
      title: "Category Deleted",
      description: `"${category}" has been removed from your categories.`,
    });
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest dark">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        {selectedCategory === 'home' ? (
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">
              Vault Hub
            </h1>
            <p className="text-on-surface-variant text-lg">
              Your personal knowledge vault - all resources in one place
            </p>
          </div>
        ) : (
          <div className="text-center mb-8 hidden md:block">
            <h1 className="text-4xl font-bold text-primary mb-2">
              Vault Hub
            </h1>
            <p className="text-on-surface-variant text-lg">
              Your personal knowledge vault - all resources in one place
            </p>
          </div>
        )}

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

        {/* Text message when no resource type is selected */}
        {selectedType === 'all' && !showResources && (
          <div className="text-center text-on-surface-variant mb-8">
            <p>Select a resource type above to view.</p>
          </div>
        )}

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
            <div className="flex flex-row gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide pl-4 pr-4">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={buttonStyle(selectedCategory === category) + ' h-12 min-w-max'}
                >
                  {category}
                </Button>
              ))}
              {/* Custom tags */}
              {customTags && customTags.map((tag) => (
                <div key={tag} className="relative inline-block min-w-max">
                  <Button
                    variant={selectedCategory === tag ? "default" : "outline"}
                    onClick={() => setSelectedCategory(tag)}
                    className={buttonStyle(selectedCategory === tag) + ' h-12 pr-8 min-w-max'}
                  >
                    {tag}
                  </Button>
                  <button
                    onClick={() => handleDeleteCustomCategory(tag)}
                    className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full text-xs text-on-surface-variant hover:bg-error hover:text-white transition-colors"
                    style={{lineHeight: 1}}
                    title={`Remove ${tag}`}
                  >
                    ×
                  </button>
                </div>
              ))}
              {/* + Button */}
              {!isAddingTag && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingTag(true);
                    setTimeout(() => newTagInputRef.current?.focus(), 100);
                  }}
                  className={buttonStyle(false) + ' h-12 min-w-max'}
                  title="Add custom tag"
                >
                  +
                </Button>
              )}
              {/* Input for new tag */}
              {isAddingTag && (
                <input
                  ref={newTagInputRef}
                  type="text"
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  onBlur={() => setIsAddingTag(false)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && newTag.trim()) {
                      if (!customTags.includes(newTag.trim()) && !categories.includes(newTag.trim())) {
                        setCustomTags([...customTags, newTag.trim()]);
                        setSelectedCategory(newTag.trim());
                      }
                      setNewTag("");
                      setIsAddingTag(false);
                    }
                  }}
                  className="h-12 px-4 rounded-full bg-surface-container-high text-on-surface-variant border-none shadow-sm min-w-max"
                  placeholder="New tag"
                />
              )}
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
          customTags={customTags}
          onAddCustomCategory={handleAddCustomCategory}
          onDeleteCustomCategory={handleDeleteCustomCategory}
        />
      </div>
    </div>
  );
};

export default Index;
