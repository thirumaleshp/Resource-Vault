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

// Helper to get a Blob URL for fileData
function getBlobUrl(fileData?: File | Blob) {
  return fileData ? URL.createObjectURL(fileData) : undefined;
}

const ResourceCard = ({ resource, onDelete, getResourceTypeIcon }: ResourceCardProps) => {
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { toast } = useToast();

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
      if (resource.type === 'image' || resource.type === 'pdf') {
        setIsPreviewOpen(true);
      } else {
        window.open(getBlobUrl(resource.fileData), '_blank', 'noopener,noreferrer');
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
    }).format(date);
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
              <div className="p-4 bg-surface-container-lowest rounded-lg">
                <p className="text-on-surface-variant line-clamp-3">{resource.content}</p>
              </div>
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
            {resource.type === 'image' && getBlobUrl(resource.fileData) && (
              <div
                className="relative aspect-video rounded-lg overflow-hidden bg-surface-container-lowest cursor-pointer"
                onClick={handleViewFile}
              >
                <img
                  src={getBlobUrl(resource.fileData)}
                  alt={resource.title}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\' class=\'lucide lucide-image\'><rect width=\'18\' height=\'18\' x=\'3\' y=\'3\' rx=\'2\' ry=\'2\'/><circle cx=\'9\' cy=\'9\' r=\'2\'/><path d=\'m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\'/></svg>';
                    target.onerror = null;
                  }}
                  onLoad={(e) => {
                    // Optionally, you can set a flag if the image loads successfully
                  }}
                />
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
             {resource.type === 'file' && getBlobUrl(resource.fileData) && (
              <div
                 className="flex items-center gap-2 p-3 bg-surface-container-lowest rounded-lg cursor-pointer"
                 onClick={() => setIsViewDetailsOpen(true)}
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
                  <Button variant="outline" size="sm" onClick={handleDownload} className="bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant">
                     <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
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
        <DialogContent className="dark dark:bg-surface-container-high dark:text-on-surface border-0 shadow-xl rounded-xl w-full max-w-3xl h-[80vh] flex flex-col p-6">
          <style>{`.dark .fixed > button > svg { color: #fff !important; }`}</style>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-on-surface dark:text-on-surface line-clamp-1 mb-4">{resource.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden flex items-center justify-center dark:bg-surface-container-lowest">
             {resource.type === 'image' && getBlobUrl(resource.fileData) && (
               <img
                 src={getBlobUrl(resource.fileData)}
                 alt={resource.title}
                 className="object-contain w-full h-full"
                 onError={(e) => {
                   const target = e.target as HTMLImageElement;
                   target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                 }}
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
