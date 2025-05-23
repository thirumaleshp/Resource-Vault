import { useState } from "react";
import { Plus, Search, FileText, Link, Image, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import AddResourceModal from "@/components/AddResourceModal";
import ResourceCard from "@/components/ResourceCard";

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

const Index = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | "all">("all");
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
          {/* Notes Card */}
          <Card
            className={`flex-1 min-w-[150px] rounded-full border h-14 flex items-center justify-center shadow-none transition-colors duration-200 cursor-pointer
              ${selectedType === 'note' 
                ? 'bg-secondary-container hover:bg-secondary-container/90 border-transparent' 
                : 'bg-surface-container-low hover:bg-surface-container border-outline'
              }
            `}
            onClick={() => {
              setSelectedType('note');
              setShowResources(true);
            }}
          >
            <CardContent className="p-0 flex flex-col items-center justify-center">
              <div className={`text-xl font-bold ${selectedType === 'note' ? 'text-on-secondary-container' : 'text-on-surface-variant'}`}>{stats.notes}</div>
              <div className={`text-sm ${selectedType === 'note' ? 'text-on-secondary-container' : 'text-on-surface-variant'}`}>Notes</div>
            </CardContent>
          </Card>

          {/* Links Card */}
          <Card
            className={`flex-1 min-w-[150px] rounded-full border h-14 flex items-center justify-center shadow-none transition-colors duration-200 cursor-pointer
              ${selectedType === 'link' 
                ? 'bg-secondary-container hover:bg-secondary-container/90 border-transparent' 
                : 'bg-surface-container-low hover:bg-surface-container border-outline'
              }
            `}
            onClick={() => {
              setSelectedType('link');
              setShowResources(true);
            }}
          >
            <CardContent className="p-0 flex flex-col items-center justify-center">
              <div className={`text-xl font-bold ${selectedType === 'link' ? 'text-on-secondary-container' : 'text-on-surface-variant'}`}>{stats.links}</div>
              <div className={`text-sm ${selectedType === 'link' ? 'text-on-secondary-container' : 'text-on-surface-variant'}`}>Links</div>
            </CardContent>
          </Card>

          {/* Images Card */}
          <Card
            className={`flex-1 min-w-[150px] rounded-full border h-14 flex items-center justify-center shadow-none transition-colors duration-200 cursor-pointer
              ${selectedType === 'image' 
                ? 'bg-secondary-container hover:bg-secondary-container/90 border-transparent' 
                : 'bg-surface-container-low hover:bg-surface-container border-outline'
              }
            `}
            onClick={() => {
              setSelectedType('image');
              setShowResources(true);
            }}
          >
            <CardContent className="p-0 flex flex-col items-center justify-center">
              <div className={`text-xl font-bold ${selectedType === 'image' ? 'text-on-secondary-container' : 'text-on-surface-variant'}`}>{stats.images}</div>
              <div className={`text-sm ${selectedType === 'image' ? 'text-on-secondary-container' : 'text-on-surface-variant'}`}>Images</div>
            </CardContent>
          </Card>

          {/* Files Card */}
          <Card
            className={`flex-1 min-w-[150px] rounded-full border h-14 flex items-center justify-center shadow-none transition-colors duration-200 cursor-pointer
              ${selectedType === 'file_group' 
                ? 'bg-secondary-container hover:bg-secondary-container/90 border-transparent' 
                : 'bg-surface-container-low hover:bg-surface-container border-outline'
              }
            `}
            onClick={() => {
              setSelectedType('file_group');
              setShowResources(true);
            }}
          >
            <CardContent className="p-0 flex flex-col items-center justify-center">
              <div className={`text-xl font-bold ${selectedType === 'file_group' ? 'text-on-secondary-container' : 'text-on-surface-variant'}`}>{stats.files}</div>
              <div className={`text-sm ${selectedType === 'file_group' ? 'text-on-secondary-container' : 'text-on-surface-variant'}`}>Files</div>
            </CardContent>
          </Card>

          {/* Home Button */}
          <Button
            variant="outline"
            onClick={() => {
              setSelectedType('all');
              setShowResources(false);
            }}
            className="capitalize rounded-full px-6 bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant"
          >
            Home
          </Button>
        </div>

        {/* Search and Filters */}
        {showResources && (
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant w-4 h-4" />
              <Input
                placeholder="Search resources, tags, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 bg-surface-container-high border-0 focus:ring-2 focus:ring-primary/20 rounded-full shadow-sm"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={`capitalize rounded-full px-6 ${
                    selectedCategory === category 
                      ? "bg-primary hover:bg-primary/90 text-on-primary" 
                      : "bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant"
                  }`}
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
          <div className="text-center text-on-surface-variant">
            <p>Select a resource type above to view.</p>
          </div>
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
