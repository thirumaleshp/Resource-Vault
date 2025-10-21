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
import ProfessionalTodo from '../components/ProfessionalTodo';

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
  files?: File[];
  audioBlob?: Blob;
  audioURL?: string;
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
      matchesType = resource.type === 'image' && resource.files && resource.files.length > 0;
    }

    return matchesSearch && matchesCategory && matchesType;
  });

  const addResource = (newResource: Omit<Resource, 'id' | 'createdAt'>) => {
    const saveResource = (resource: Resource) => {
      const idbResource: IDBResource = {
        ...resource,
        createdAt: resource.createdAt.toISOString(),
        // files are stored as an array of File objects
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
    if (newResource.files) {
      // Store multiple files
      const resource: Resource = {
        ...newResource,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        files: newResource.files,
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
      images: resources.filter(r => r.type === 'image' && r.files && r.files.length > 0).length,
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
            <div className="flex flex-row gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide pl-4 pr-4 md:justify-center">
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
        <footer className="fixed bottom-5 left-1/2 -translate-x-1/2 text-center text-on-surface-variant">
          Profile{" "}
          <a
            href="https://thirumalesh.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            @Thirumalesh
          </a>
        </footer>
      </div>
    </div>
  );
};

export default Index;
