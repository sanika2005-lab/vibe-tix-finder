import { useCallback, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface AvatarCropperProps {
  open: boolean;
  imageSrc: string | null;
  onCancel: () => void;
  onCropped: (dataUrl: string) => void;
}

async function getCroppedImg(src: string, area: Area): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
  const size = 320;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, size, size);
  return canvas.toDataURL("image/jpeg", 0.92);
}

export const AvatarCropper = ({ open, imageSrc, onCancel, onCropped }: AvatarCropperProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);

  const onComplete = useCallback((_: Area, pixels: Area) => setAreaPixels(pixels), []);

  const handleSave = async () => {
    if (!imageSrc || !areaPixels) return;
    const url = await getCroppedImg(imageSrc, areaPixels);
    onCropped(url);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crop your photo</DialogTitle>
        </DialogHeader>
        <div className="relative h-72 w-full overflow-hidden rounded-xl bg-muted">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onComplete}
            />
          )}
        </div>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Zoom</p>
          <Slider value={[zoom]} min={1} max={3} step={0.05} onValueChange={(v) => setZoom(v[0])} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} className="rounded-full">Cancel</Button>
          <Button onClick={handleSave} className="rounded-full">Save photo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
