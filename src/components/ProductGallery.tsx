import { OptimizedImage } from "@/components/OptimizedImage";

interface ProductGalleryProps {
  images: string[];
}

export const ProductGallery = ({ images }: ProductGalleryProps) => {
  return (
    <div className="space-y-4">
      <div className="aspect-square rounded-lg overflow-hidden border border-glass-border bg-muted/20">
        <OptimizedImage
          src={images[0] || "/placeholder.svg"}
          alt="Product"
          className="w-full h-full"
          priority
          width={800}
          height={800}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </div>
  );
};
