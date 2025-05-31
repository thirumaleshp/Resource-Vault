import { useState, useRef, useEffect } from "react";
import { X, Plus, Upload, Mic, StopCircle, PlayCircle } from "lucide-react";
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
  customTags: string[];
  onAddCustomCategory: (category: string) => void;
  onDeleteCustomCategory: (category: string) => void;
}

interface Resource {
  title: string;
  type: ResourceType;
  content: string;
  category: ResourceCategory;
  tags: string[];
  images?: File[];
  fileURL?: string;
  fileData?: File;
  audioBlob?: Blob;
  audioURL?: string;
}

const AddResourceModal = ({ isOpen, onClose, onAdd, customTags, onAddCustomCategory, onDeleteCustomCategory }: AddResourceModalProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Resource>({
    title: "",
    type: "note",
    content: "",
    category: "watch later",
    tags: [],
    images: [],
  });
  const [newTag, setNewTag] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const newCategoryInputRef = useRef<HTMLInputElement>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRecording) {
      await stopRecording(true); // pass true to indicate we want to wait for audioBlob
    }
    if (!validateForm()) return;
    onAdd({ ...formData, audioBlob, images: formData.images });
    onClose();
    resetForm();
    removeAudio();
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

    if (formData.type === 'note' && !formData.content.trim() && !audioBlob) {
      toast({
        title: "Missing Content",
        description: "Please provide content or a voice note for your resource.",
        variant: "destructive"
      });
      return false;
    }

    if (formData.type === 'link' && !formData.content.trim()) {
      toast({
        title: "Missing Content",
        description: "Please provide a URL for your resource.",
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Only for images, allow multiple and append
    if (formData.type === 'image') {
      const validFiles: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/') || file.name.match(/\.(heic|heif)$/i)) {
          validFiles.push(file);
        }
      }
      setFormData(prev => ({
        ...prev,
        images: prev.images ? [...prev.images, ...validFiles] : [...validFiles],
        fileData: prev.images && prev.images.length > 0 ? prev.images[0] : validFiles[0],
        fileURL: URL.createObjectURL(validFiles[0])
      }));
      return;
    }

    // Validate file type for non-image types
    if (['pdf', 'file'].includes(formData.type)) {
      const fileType = files[0].type;
      if (formData.type === 'pdf' && fileType !== 'application/pdf') {
        toast({
          title: "Invalid File Type",
          description: "Please select a PDF file.",
          variant: "destructive",
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      setFormData(prev => ({
        ...prev,
        fileData: files[0],
        fileURL: URL.createObjectURL(files[0])
      }));
    }
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
      images: [],
    });
    setNewTag("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const builtInCategories = ["watch later", "study", "work", "personal"];
  const [customCategories, setCustomCategories] = useState<string[]>(customTags);
  const allCategories = [...builtInCategories, ...customCategories];
  useEffect(() => {
    setCustomCategories(customTags);
  }, [customTags]);

  // Set default category to the first available when modal opens or categories change
  useEffect(() => {
    if (isOpen && allCategories.length > 0) {
      if (!formData.category || !allCategories.includes(formData.category)) {
        setFormData(prev => ({ ...prev, category: allCategories[0] }));
      }
    }
  }, [isOpen, allCategories]);

  // Handle recording
  const startRecording = async () => {
    if (!navigator.mediaDevices) {
      toast({ title: "Not Supported", description: "Audio recording is not supported in this browser.", variant: "destructive" });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      audioChunks.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
        if (mediaStream) {
          mediaStream.getTracks().forEach(track => track.stop());
          setMediaStream(null);
        }
      };
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      toast({ title: "Microphone Error", description: "Could not access microphone.", variant: "destructive" });
    }
  };

  // Accept a waitForBlob argument to wait for audioBlob to be set
  const stopRecording = (waitForBlob = false) => {
    if (mediaRecorder && isRecording) {
      return new Promise<void>(resolve => {
        const handleStop = () => {
          setTimeout(() => {
            mediaRecorder.removeEventListener('stop', handleStop);
            resolve();
          }, 50); // small delay to ensure audioBlob is set
        };
        if (waitForBlob) {
          mediaRecorder.addEventListener('stop', handleStop);
        }
        mediaRecorder.stop();
        setIsRecording(false);
        if (mediaStream) {
          mediaStream.getTracks().forEach(track => track.stop());
          setMediaStream(null);
        }
        if (!waitForBlob) resolve();
      });
    }
    return Promise.resolve();
  };

  const removeAudio = () => {
    setAudioBlob(null);
    setAudioURL(null);
    audioChunks.current = [];
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
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="file">File</SelectItem>
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
                      {allCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                      <div className="flex items-center gap-2 px-3 py-2 border-t border-surface-container-highest mt-2">
                        {!isAddingCategory ? (
                          <button
                            type="button"
                            className="rounded-full px-3 py-1 text-sm font-medium bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-highest"
                            onClick={() => {
                              setIsAddingCategory(true);
                              setTimeout(() => newCategoryInputRef.current?.focus(), 100);
                            }}
                          >
                            + Add Category
                          </button>
                        ) : (
                          <input
                            ref={newCategoryInputRef}
                            type="text"
                            value={newCategory}
                            onChange={e => setNewCategory(e.target.value)}
                            onBlur={() => setIsAddingCategory(false)}
                            onKeyDown={e => {
                              if (e.key === "Enter" && newCategory.trim()) {
                                if (!customCategories.includes(newCategory.trim()) && !builtInCategories.includes(newCategory.trim())) {
                                  const newCat = newCategory.trim();
                                  setCustomCategories([...customCategories, newCat]);
                                  const updatedFormData = { ...formData, category: newCat as ResourceCategory };
                                  setFormData(updatedFormData);
                                  setTimeout(() => {
                                    setFormData(updatedFormData);
                                  }, 0);
                                  onAddCustomCategory(newCat);
                                } else {
                                  toast({
                                    title: "Duplicate Category",
                                    description: "This category already exists.",
                                    variant: "destructive",
                                  });
                                }
                                setNewCategory("");
                                setIsAddingCategory(false);
                              } else if (e.key === "Escape") {
                                setIsAddingCategory(false);
                                setNewCategory("");
                              }
                            }}
                            className="rounded-full px-3 py-1 text-sm font-medium bg-surface-container-lowest text-on-surface-variant border border-surface-container-highest outline-none w-full"
                            placeholder="New category"
                          />
                        )}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(formData.type === 'note' || formData.type === 'link') && (
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-on-surface">{formData.type === 'note' ? 'Content' : 'URL'}</Label>
                  {formData.type === 'note' ? (
                    <div className="relative flex flex-col bg-surface-container-lowest rounded-lg shadow-sm p-0">
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Enter notes here..."
                        className="bg-transparent text-on-surface border-0 focus:ring-2 focus:ring-primary/20 rounded-lg shadow-none min-h-[100px] pr-12"
                      />
                      <div className="absolute top-2 right-2 flex items-center">
                        {!isRecording && (
                          <Button type="button" variant="outline" onClick={startRecording} className="rounded-full p-2" title="Record Voice Note">
                            <Mic className="w-5 h-5" />
                          </Button>
                        )}
                        {isRecording && (
                          <Button type="button" variant="destructive" onClick={() => stopRecording()} className="rounded-full p-2 animate-pulse" title="Stop Recording">
                            <StopCircle className="w-5 h-5" />
                          </Button>
                        )}
                      </div>
                      {audioBlob && audioURL && !isRecording && (
                        <div className="flex items-center gap-2 px-4 pb-3 pt-2">
                          <audio ref={audioPlayerRef} src={audioURL} controls className="h-8 w-full rounded-2xl bg-surface-container-high" />
                          <Button type="button" variant="ghost" onClick={removeAudio} className="rounded-full p-2" title="Remove Voice Note">
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                      )}
                    </div>
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
                        formData.type === 'image' ? 'image/*,.heic,.heif' :
                        formData.type === 'pdf' ? '.pdf' :
                        '*/*'
                      }
                      multiple={formData.type === 'image'}
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
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="ml-2 px-3 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant"
                      title="Add more images"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.fileData && (
                    <p className="text-sm text-on-surface mt-2">
                      Selected: {formData.fileData.name}
                    </p>
                  )}
                  {formData.type === 'image' && formData.images && formData.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded overflow-hidden border border-surface-container-highest">
                          <img
                            src={URL.createObjectURL(img)}
                            alt={`Selected ${idx+1}`}
                            className="object-cover w-full h-full"
                          />
                          <button
                            type="button"
                            className="absolute top-0 right-0 bg-error text-white rounded-full p-1"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              images: prev.images?.filter((_, i) => i !== idx)
                            }))}
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
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
                      if (e.key === 'Enter') {
                        e.preventDefault(); // Prevent default form submission or newline
                      addTag();
                      }
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
