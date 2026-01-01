import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Upload, Loader2 } from "lucide-react";
import { storage, db, auth } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/firestoreHelpers";
import { toast } from "sonner";
import { Profile } from "@/pages/Settings";
import ImageCropDialog from "./ImageCropDialog";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().regex(/^\d{10}$/, "Phone must be 10 digits").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileTabProps {
  profile: Profile;
  onProfileUpdate: () => void;
}

const ProfileTab = ({ profile, onProfileUpdate }: ProfileTabProps) => {
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarUrl || null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.fullName || "",
      email: profile.email || "",
      phone_number: profile.phoneNumber || "",
    },
  });

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please upload a JPG, PNG, or WebP image");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // Create preview URL for cropper
    const imageUrl = URL.createObjectURL(file);
    setSelectedImageUrl(imageUrl);
    setSelectedFile(file);
    setCropDialogOpen(true);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!selectedFile) return;

    setUploading(true);
    setCropDialogOpen(false);

    try {
      // Generate unique filename
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${profile.uid}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Firebase Storage
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, croppedBlob, {
        contentType: "image/jpeg",
        cacheControl: "public, max-age=3600",
      });

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Update profile with new avatar URL
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not authenticated");

      await updateDoc(doc(db, COLLECTIONS.USERS, currentUser.uid), {
        avatarUrl: downloadURL,
      });

      setAvatarPreview(downloadURL);
      toast.success("Avatar updated successfully");
      onProfileUpdate();
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
      // Clean up
      URL.revokeObjectURL(selectedImageUrl);
      setSelectedImageUrl("");
      setSelectedFile(null);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not authenticated");

      await updateDoc(doc(db, COLLECTIONS.USERS, currentUser.uid), {
        fullName: data.full_name,
        phoneNumber: data.phone_number || null,
      });

      toast.success("Profile updated successfully");
      onProfileUpdate();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass border-glass-border">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information and profile picture
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={avatarPreview || ""} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {profile.fullName?.[0] || profile.email?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    asChild
                  >
                    <span>
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Avatar
                        </>
                      )}
                    </span>
                  </Button>
                </div>
              </Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarSelect}
                disabled={uploading}
              />
              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG or WebP. Max 5MB. You'll be able to crop before uploading.
              </p>
            </div>
          </div>

          {/* Membership Tier */}
          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card/50">
            <div>
              <p className="font-medium">Membership Tier</p>
              <p className="text-sm text-muted-foreground">Your current membership level</p>
            </div>
            <Badge variant="secondary" className="capitalize text-base px-4 py-2">
              {profile.membershipTier}
            </Badge>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                {...register("full_name")}
                placeholder="Enter your full name"
              />
              {errors.full_name && (
                <p className="text-sm text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                {...register("phone_number")}
                placeholder="1234567890"
                maxLength={10}
              />
              {errors.phone_number && (
                <p className="text-sm text-destructive">{errors.phone_number.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                10 digits, no spaces or dashes
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Image Crop Dialog */}
      <ImageCropDialog
        open={cropDialogOpen}
        imageUrl={selectedImageUrl}
        onCropComplete={handleCropComplete}
        onClose={() => {
          setCropDialogOpen(false);
          URL.revokeObjectURL(selectedImageUrl);
          setSelectedImageUrl("");
          setSelectedFile(null);
        }}
      />
    </motion.div>
  );
};

export default ProfileTab;
