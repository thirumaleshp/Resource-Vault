import { useState, useRef } from "react";
import { X, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ResourceType, ResourceCategory } from "@/pages/Index";

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (resource: Omit<Resource, 'id' | 'createdAt'>) => void;
}

interface Resource {
  title: string;
  type: ResourceType;
  content: string;
  category: ResourceCategory;
  tags: string[];
  fileURL?: string;
  fileData?: File;
}

const AddResourceModal = ({ isOpen, onClose, onAdd }: AddResourceModalProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Resource>({
    title: "",
    type: "note",
    content: "",
    category: "watch later",
    tags: [],
  });
  const [newTag, setNewTag] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    onAdd(formData);
    onClose();
    resetForm();
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Missing Title",
        description: "Please provide a title for your resource.",
        variant: "destructive",
      });
      return false;
    }

    if ((formData.type === 'note' || formData.type === 'link') && !formData.content.trim()) {
      toast({
        title: "Missing Content",
        description: `Please provide ${formData.type === 'note' ? 'content' : 'a URL'} for your resource.`,
        variant: "destructive",
      });
      return false;
    }

    if (formData.type === 'link' && !isValidUrl(formData.content)) {
      toast({
        title: "Invalid URL",
        description: "Please provide a valid URL for the link resource.",
        variant: "destructive",
      });
      return false;
    }

    if ((formData.type === 'image' || formData.type === 'pdf' || formData.type === 'file') && !formData.fileData) {
      toast({
        title: "Missing File",
        description: "Please select a file for this resource type.",
        variant: "destructive",
      });
      if (fileInputRef.current) { // Clear the file input as well
        fileInputRef.current.value = "";
      }
      return false;
    }

    return true;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear previous file data before validation
    setFormData(prev => ({
      ...prev,
      fileData: undefined,
      fileURL: undefined
    }));

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB.",
        variant: "destructive",
      });
      if (fileInputRef.current) { // Clear the file input as well
        fileInputRef.current.value = "";
      }
      return; // Exit if validation fails
    }

    // Validate file type based on resource type
    const fileType = file.type;
    if (formData.type === 'image' && !fileType.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file.",
        variant: "destructive",
      });
       if (fileInputRef.current) { // Clear the file input as well
        fileInputRef.current.value = "";
      }
      return; // Exit if validation fails
    }
    if (formData.type === 'pdf' && fileType !== 'application/pdf') {
      toast({
        title: "Invalid File Type",
        description: "Please select a PDF file.",
        variant: "destructive",
      });
       if (fileInputRef.current) { // Clear the file input as well
        fileInputRef.current.value = "";
      }
      return; // Exit if validation fails
    }

    // If all validations pass, update the state with the valid file
    setFormData(prev => ({
      ...prev,
      fileData: file,
      fileURL: URL.createObjectURL(file)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      type: "note",
      content: "",
      category: "watch later",
      tags: [],
    });
    setNewTag("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-surface-container-high rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-on-surface">Add New Resource</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-surface-container-highest"
              >
                <X className="w-5 h-5 text-on-surface-variant" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-on-surface">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-surface-container-lowest text-on-surface border-0 focus:ring-2 focus:ring-primary/20 rounded-lg shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-on-surface">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: ResourceType) => setFormData({ ...formData, type: value, content: "", fileData: undefined, fileURL: undefined })}
                  >
                    <SelectTrigger className="w-full bg-surface-container-lowest text-on-surface border-0 focus:ring-2 focus:ring-primary/20 rounded-lg shadow-sm">
                      <SelectValue placeholder="Select resource type" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-surface-container dark:text-on-surface dark:border-outline">
                      <SelectItem value="note" className="dark:text-on-surface dark:focus:bg-surface-container-highest dark:focus:text-on-surface dark:data-[state=checked]:bg-surface-container-highest dark:data-[state=checked]:text-on-surface">Note</SelectItem>
                      <SelectItem value="link" className="dark:text-on-surface dark:focus:bg-surface-container-highest dark:focus:text-on-surface dark:data-[state=checked]:bg-surface-container-highest dark:data-[state=checked]:text-on-surface">Link</SelectItem>
                      <SelectItem value="image" className="dark:text-on-surface dark:focus:bg-surface-container-highest dark:focus:text-on-surface dark:data-[state=checked]:bg-surface-container-highest dark:data-[state=checked]:text-on-surface">Image</SelectItem>
                      <SelectItem value="pdf" className="dark:text-on-surface dark:focus:bg-surface-container-highest dark:focus:text-on-surface dark:data-[state=checked]:bg-surface-container-highest dark:data-[state=checked]:text-on-surface">PDF</SelectItem>
                      <SelectItem value="file" className="dark:text-on-surface dark:focus:bg-surface-container-highest dark:focus:text-on-surface dark:data-[state=checked]:bg-surface-container-highest dark:data-[state=checked]:text-on-surface">File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-on-surface">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: ResourceCategory) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="w-full bg-surface-container-lowest text-on-surface border-0 focus:ring-2 focus:ring-primary/20 rounded-lg shadow-sm">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-surface-container dark:text-on-surface dark:border-outline">
                      <SelectItem value="watch later" className="dark:text-on-surface dark:focus:bg-surface-container-highest dark:focus:text-on-surface dark:data-[state=checked]:bg-surface-container-highest dark:data-[state=checked]:text-on-surface">Watch Later</SelectItem>
                      <SelectItem value="study" className="dark:text-on-surface dark:focus:bg-surface-container-highest dark:focus:text-on-surface dark:data-[state=checked]:bg-surface-container-highest dark:data-[state=checked]:text-on-surface">Study</SelectItem>
                      <SelectItem value="work" className="dark:text-on-surface dark:focus:bg-surface-container-highest dark:focus:text-on-surface dark:data-[state=checked]:bg-surface-container-highest dark:data-[state=checked]:text-on-surface">Work</SelectItem>
                      <SelectItem value="personal" className="dark:text-on-surface dark:focus:bg-surface-container-highest dark:focus:text-on-surface dark:data-[state=checked]:bg-surface-container-highest dark:data-[state=checked]:text-on-surface">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(formData.type === 'note' || formData.type === 'link') && (
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-on-surface">{formData.type === 'note' ? 'Content' : 'URL'}</Label>
                  {formData.type === 'note' ? (
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Enter notes here..."
                      className="bg-surface-container-lowest text-on-surface border-0 focus:ring-2 focus:ring-primary/20 rounded-lg shadow-sm min-h-[100px]"
                    />
                  ) : (
                    <Input
                      id="content"
                      type="url"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Enter URL here..."
                      className="bg-surface-container-lowest text-on-surface border-0 focus:ring-2 focus:ring-primary/20 rounded-lg shadow-sm"
                    />
                  )}
                </div>
              )}

              {(formData.type === 'image' || formData.type === 'pdf' || formData.type === 'file') && (
                <div className="space-y-2">
                  <Label className="text-on-surface">File</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept={
                        formData.type === 'image' ? 'image/*' :
                        formData.type === 'pdf' ? '.pdf' :
                        '*/*'
                      }
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 bg-surface-container-lowest border-0 hover:bg-surface-container-highest text-on-surface rounded-xl"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                  {formData.fileData && (
                    <p className="text-sm text-on-surface mt-2">
                      Selected: {formData.fileData.name}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="tags" className="text-on-surface">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tags..."
                    className="flex-1 bg-surface-container-lowest text-on-surface border-0 focus:ring-2 focus:ring-primary/20 rounded-lg shadow-sm"
                    onKeyPress={(e) => {
                      e.preventDefault();
                      addTag();
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant rounded-xl"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-1 bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-error"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-on-primary rounded-xl"
                >
                  Add Resource
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddResourceModal;
