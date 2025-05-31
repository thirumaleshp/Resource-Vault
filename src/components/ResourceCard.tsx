import { useState } from "react";
import { MoreVertical, ExternalLink, Copy, Download, Trash2, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Resource, ResourceType } from "@/pages/Index";

interface ResourceCardProps {
  resource: Resource;
  onDelete: (id: string) => void;
  getResourceTypeIcon: (type: ResourceType) => JSX.Element;
}

// Helper to get a Blob URL for fileData or File
function getBlobUrl(fileData?: File | Blob) {
  return fileData ? URL.createObjectURL(fileData) : undefined;
}

const ResourceCard = ({ resource, onDelete, getResourceTypeIcon }: ResourceCardProps) => {
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const { toast } = useToast();

  const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resource.content);
      toast({
        title: "Copied to clipboard",
        description: "Resource content has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy content to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleExternalLink = () => {
    if (resource.type === 'link') {
      window.open(resource.content, '_blank', 'noopener,noreferrer');
    }
  };

  const handleViewFile = () => {
    if (resource.fileData) {
      const blobUrl = getBlobUrl(resource.fileData);
      if (resource.type === 'image') {
        // Always open in-app preview for images
        setIsPreviewOpen(true);
      } else if (isMobile()) {
        // On mobile, open non-image files in a new tab to prompt native app
        window.open(blobUrl, '_blank');
      } else {
        if (resource.type === 'pdf') {
          setIsPreviewOpen(true);
        } else {
          window.open(blobUrl, '_blank', 'noopener,noreferrer');
        }
      }
    } else {
       toast({
        title: "File not available",
        description: "Could not open the file.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    try {
      onDelete(resource.id);
      toast({
        title: "Resource deleted",
        description: "The resource has been successfully deleted.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Failed to delete",
        description: "Could not delete the resource.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (resource.fileData) {
      const link = document.createElement('a');
      link.href = getBlobUrl(resource.fileData);
      link.download = (resource.fileData as File)?.name || 'file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
       toast({
        title: "Download failed",
        description: "File data not available for download.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.touches[0].clientX);
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchEndX(e.touches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (touchStartX !== null && touchEndX !== null) {
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          // Swipe left
          setCarouselIndex((prev) => (prev + 1) % (resource.images?.length || 1));
        } else {
          // Swipe right
          setCarouselIndex((prev) => (prev - 1 + (resource.images?.length || 1)) % (resource.images?.length || 1));
        }
      }
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <>
      <Card className="flex-grow-0 flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.3%-16px)] bg-surface-container-high hover:bg-surface-container-highest transition-colors duration-200 overflow-hidden shadow-sm border-0">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-surface-container-lowest rounded-lg text-primary">
                {getResourceTypeIcon(resource.type)}
              </div>
              <div>
                <h3 className="font-semibold text-on-surface line-clamp-1">{resource.title}</h3>
                <p className="text-sm text-on-surface-variant">{formatDate(resource.createdAt)}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-surface-container-highest dark:hover:bg-surface-container-highest">
                  <MoreVertical className="w-4 h-4 text-on-surface-variant" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-surface-container-high border-0 shadow-lg">
                <DropdownMenuItem
                  onClick={() => setIsViewDetailsOpen(true)}
                  className="text-on-surface-variant hover:bg-surface-container-highest cursor-pointer"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {resource.type === 'note' && (
                  <DropdownMenuItem
                    onClick={handleCopy}
                    className="text-on-surface-variant hover:bg-surface-container-highest cursor-pointer"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Content
                  </DropdownMenuItem>
                )}
                 {resource.type === 'link' && (
                  <DropdownMenuItem
                    onClick={handleExternalLink}
                    className="text-on-surface-variant hover:bg-surface-container-highest cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Link
                  </DropdownMenuItem>
                )}
                {(resource.type === 'image' || resource.type === 'pdf' || resource.type === 'file') && (
                  <DropdownMenuItem
                    onClick={handleDownload}
                    className="text-on-surface-variant hover:bg-surface-container-highest cursor-pointer"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-error hover:bg-error-container hover:text-on-error-container cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-4">
            {resource.type === 'note' && (
              <>
                {resource.content && (
                  <div className="p-4 bg-surface-container-lowest rounded-lg mb-2">
                    <p className="text-on-surface-variant line-clamp-3">{resource.content}</p>
                  </div>
                )}
                {(resource.audioBlob || resource.audioURL) && (
                  <div className="bg-surface-container-high rounded-2xl p-4 shadow-sm flex items-center justify-center">
                    <style>{`
                      .custom-audio-player {
                        background: transparent;
                        border-radius: 0.75rem;
                        width: 100%;
                        display: block;
                      }
                      .custom-audio-player::-webkit-media-controls-panel {
                        background: transparent;
                        border-radius: 0.75rem;
                      }
                      .custom-audio-player::-webkit-media-controls-play-button,
                      .custom-audio-player::-webkit-media-controls-timeline,
                      .custom-audio-player::-webkit-media-controls-current-time-display,
                      .custom-audio-player::-webkit-media-controls-time-remaining-display,
                      .custom-audio-player::-webkit-media-controls-volume-slider,
                      .custom-audio-player::-webkit-media-controls-mute-button,
                      .custom-audio-player::-webkit-media-controls-enclosure {
                        border-radius: 0.75rem;
                      }
                    `}</style>
                    <audio controls className="custom-audio-player">
                      <source src={resource.audioBlob ? URL.createObjectURL(resource.audioBlob) : resource.audioURL} type="audio/webm" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </>
            )}
            {resource.type === 'link' && (
              <div className="p-4 bg-surface-container-lowest rounded-lg">
                <a
                  href={resource.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline line-clamp-1 flex items-center gap-2"
                >
                   {resource.content}
                   <ExternalLink className="w-4 h-4 flex-shrink-0" />
                </a>
              </div>
            )}
            {resource.type === 'image' && resource.images && resource.images.length > 0 && (
              <div
                className="relative w-full aspect-video min-h-[120px] sm:min-h-[150px] rounded-lg overflow-hidden bg-surface-container-lowest cursor-pointer flex items-center justify-center mt-2"
                style={{ backgroundColor: '#222' }}
                onClick={handleViewFile}
              >
                {/* 1 image: full */}
                {resource.images.length === 1 && (
                  <img src={getBlobUrl(resource.images[0])} alt={resource.title} className="object-cover w-full h-full" />
                )}
                {/* 2 images: side by side */}
                {resource.images.length === 2 && (
                  <>
                    <img src={getBlobUrl(resource.images[0])} alt="1" className="absolute left-0 top-0 w-1/2 h-full object-cover" />
                    <img src={getBlobUrl(resource.images[1])} alt="2" className="absolute right-0 top-0 w-1/2 h-full object-cover" />
                  </>
                )}
                {/* 3 images: one large left, two stacked right */}
                {resource.images.length === 3 && (
                  <>
                    <img src={getBlobUrl(resource.images[0])} alt="1" className="absolute left-0 top-0 w-1/2 h-full object-cover" />
                    <img src={getBlobUrl(resource.images[1])} alt="2" className="absolute right-0 top-0 w-1/2 h-1/2 object-cover" />
                    <img src={getBlobUrl(resource.images[2])} alt="3" className="absolute right-0 bottom-0 w-1/2 h-1/2 object-cover" />
                  </>
                )}
                {/* 4 images: 2x2 grid */}
                {resource.images.length === 4 && (
                  <>
                    <img src={getBlobUrl(resource.images[0])} alt="1" className="absolute left-0 top-0 w-1/2 h-1/2 object-cover" />
                    <img src={getBlobUrl(resource.images[1])} alt="2" className="absolute right-0 top-0 w-1/2 h-1/2 object-cover" />
                    <img src={getBlobUrl(resource.images[2])} alt="3" className="absolute left-0 bottom-0 w-1/2 h-1/2 object-cover" />
                    <img src={getBlobUrl(resource.images[3])} alt="4" className="absolute right-0 bottom-0 w-1/2 h-1/2 object-cover" />
                  </>
                )}
                {/* >9 images: 3x3 grid of first 9, +N overlay if more */}
                {resource.images.length > 9 && (
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 w-full h-full">
                    {resource.images.slice(0, 9).map((img, idx) => (
                      <div key={idx} className="relative w-full h-full">
                        <img src={getBlobUrl(img)} alt={String(idx + 1)} className="object-cover w-full h-full" />
                        {idx === 8 && resource.images.length > 9 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-lg font-bold">
                            +{resource.images.length - 9}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {(resource.type === 'pdf') && getBlobUrl(resource.fileData) && (
              <div
                 className="flex items-center gap-2 p-3 bg-surface-container-lowest rounded-lg cursor-pointer"
                 onClick={handleViewFile}
              >
                <div className="p-2 bg-surface-container-high rounded-lg">
                  {getResourceTypeIcon(resource.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">{(resource.fileData as File)?.name || 'file'}</p>
                  <p className="text-xs text-on-surface-variant">
                    {(resource.fileData.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            )}
             {resource.type === 'file' && resource.fileData && (
              <div>
                <h3 className="text-sm font-medium text-on-surface-variant">File Details</h3>
                <div className="mt-2 p-4 bg-surface-container-lowest rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-on-surface font-medium">{(resource.fileData as File)?.name || 'file'}</p>
                    <p className="text-on-surface-variant text-sm">
                      {(resource.fileData.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <a href={getBlobUrl(resource.fileData)} target="_blank" rel="noopener noreferrer" className="inline-block">
                    <Button variant="outline" size="sm" className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant">
                      <ExternalLink className="w-4 h-4 mr-2" /> Open File
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-4">
          <div className="flex flex-wrap gap-2 p-4 bg-surface-container-lowest rounded-lg">
            <Badge variant="secondary" className="bg-surface-container-high text-on-surface-variant">
              {resource.category}
            </Badge>
            {resource.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="bg-surface-container-high text-on-surface-variant border-surface-container-highest"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="bg-surface-container-high border-0 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-on-surface">
              Resource Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-on-surface-variant">Title</h3>
              <p className="text-on-surface">{resource.title}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-on-surface-variant">Type</h3>
              <p className="text-on-surface capitalize">{resource.type}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-on-surface-variant">Category</h3>
              <p className="text-on-surface capitalize">{resource.category}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-on-surface-variant">Created</h3>
              <p className="text-on-surface">{formatDate(resource.createdAt)}</p>
            </div>
            {resource.type === 'note' && (
              <div>
                <h3 className="text-sm font-medium text-on-surface-variant">Content</h3>
                <p className="text-on-surface whitespace-pre-wrap">{resource.content}</p>
              </div>
            )}
            {resource.type === 'link' && (
              <div>
                <h3 className="text-sm font-medium text-on-surface-variant">URL</h3>
                <a
                  href={resource.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all flex items-center gap-2"
                >
                   {resource.content}
                   <ExternalLink className="w-4 h-4 flex-shrink-0" />
                </a>
              </div>
            )}
            {resource.type === 'file' && resource.fileData && (
              <div>
                <h3 className="text-sm font-medium text-on-surface-variant">File Details</h3>
                <div className="mt-2 p-4 bg-surface-container-lowest rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-on-surface font-medium">{(resource.fileData as File)?.name || 'file'}</p>
                    <p className="text-on-surface-variant text-sm">
                      {(resource.fileData.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <a href={getBlobUrl(resource.fileData)} target="_blank" rel="noopener noreferrer" className="inline-block">
                    <Button variant="outline" size="sm" className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant">
                      <ExternalLink className="w-4 h-4 mr-2" /> Open File
                    </Button>
                  </a>
                </div>
              </div>
            )}
            {resource.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-on-surface-variant mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="bg-surface-container-high text-on-surface-variant border-surface-container-highest"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="dark:bg-surface-container-high dark:text-on-surface border-0 shadow-xl rounded-xl w-full max-w-3xl h-[80vh] flex flex-col p-6">
          <style>{`.dark .fixed > button > svg { color: #fff !important; }`}</style>
          <DialogHeader>
            <div className="flex items-center gap-2 mb-4">
              <DialogTitle className="text-2xl font-bold text-on-surface dark:text-on-surface line-clamp-1 flex items-center gap-2">
                {resource.title}
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-hidden flex items-center justify-center dark:bg-surface-container-lowest relative">
            {resource.type === 'image' && resource.images && resource.images.length > 0 && (
              <div className="relative w-full h-full flex items-center justify-center"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-surface-container-high rounded-full p-2 shadow hover:bg-surface-container-highest"
                  onClick={() => setCarouselIndex((prev) => (prev - 1 + resource.images.length) % resource.images.length)}
                  disabled={resource.images.length <= 1}
                  style={{ opacity: resource.images.length <= 1 ? 0.5 : 1 }}
                >
                  &#8592;
                </button>
                <img
                  src={getBlobUrl(resource.images[carouselIndex])}
                  alt={`Preview ${carouselIndex + 1}`}
                  className="object-contain w-full h-full rounded-xl"
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-surface-container-high rounded-full p-2 shadow hover:bg-surface-container-highest"
                  onClick={() => setCarouselIndex((prev) => (prev + 1) % resource.images.length)}
                  disabled={resource.images.length <= 1}
                  style={{ opacity: resource.images.length <= 1 ? 0.5 : 1 }}
                >
                  &#8594;
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-surface-container-high px-3 py-1 rounded-full text-xs text-on-surface-variant">
                  {carouselIndex + 1} / {resource.images.length}
                </div>
              </div>
            )}
            {/* fallback for single image/fileData */}
            {resource.type === 'image' && (!resource.images || resource.images.length === 0) && getBlobUrl(resource.fileData) && (
              <img
                src={getBlobUrl(resource.fileData)}
                alt={resource.title}
                className="object-contain w-full h-full"
              />
            )}
            {resource.type === 'pdf' && getBlobUrl(resource.fileData) && (
              <iframe src={getBlobUrl(resource.fileData)} className="w-full h-full border-0"></iframe>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResourceCard;
