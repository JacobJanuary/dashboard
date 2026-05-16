"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Building2, MapPin, Users, Image, AlignLeft, ListChecks, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { addVenue, updateUserVenue, type Venue } from "@/lib/venue-data";

interface VenueFormDialogProps {
  ownerId: string;
  venue?: Venue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function VenueFormDialog({ ownerId, venue, open, onOpenChange, onSaved }: VenueFormDialogProps) {
  const isEdit = Boolean(venue);

  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [capacity, setCapacity] = useState("");
  const [coverPhoto, setCoverPhoto] = useState("");
  const [description, setDescription] = useState("");
  const [amenities, setAmenities] = useState("");
  const [rules, setRules] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (venue) {
      setName(venue.name);
      setArea(venue.area);
      setAddress(venue.address);
      setCapacity(String(venue.capacity ?? ""));
      setCoverPhoto(venue.coverPhoto);
      setDescription(venue.description);
      setAmenities(venue.amenities.join(", "));
      setRules(venue.rules.join(", "));
    } else {
      resetForm();
    }
  }, [venue, open]);

  const resetForm = () => {
    setName("");
    setArea("");
    setAddress("");
    setCapacity("");
    setCoverPhoto("");
    setDescription("");
    setAmenities("");
    setRules("");
    setErrors({});
  };

  const handleClose = (val: boolean) => {
    if (!val) resetForm();
    onOpenChange(val);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Введите название";
    if (!area.trim()) errs.area = "Укажите район";
    if (!address.trim()) errs.address = "Введите адрес";
    if (!capacity.trim() || isNaN(Number(capacity))) errs.capacity = "Укажите вместимость";
    if (!coverPhoto.trim()) errs.coverPhoto = "Добавьте ссылку на фото";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildVenue = (): Venue => ({
    id: venue?.id ?? `uv_${Date.now()}`,
    name: name.trim(),
    slug: slugify(name),
    description: description.trim(),
    location: area.trim(),
    address: address.trim(),
    area: area.trim(),
    photos: coverPhoto.trim() ? [coverPhoto.trim()] : [],
    coverPhoto: coverPhoto.trim(),
    amenities: amenities.split(",").map((a) => a.trim()).filter(Boolean),
    rules: rules.split(",").map((r) => r.trim()).filter(Boolean),
    ownerId: venue?.ownerId ?? ownerId,
    source: "manual",
    eventsCount: venue?.eventsCount ?? 0,
    rating: venue?.rating ?? 0,
    reviewCount: venue?.reviewCount ?? 0,
    capacity: Number(capacity),
    aiKnowledge: venue?.aiKnowledge ?? {
      parking: "",
      transit: "",
      accessibility: "",
      nearby: "",
    },
  });

  const handleSubmit = () => {
    if (!validate()) return;

    if (isEdit && venue) {
      updateUserVenue(venue.id, buildVenue());
    } else {
      addVenue(buildVenue());
    }

    resetForm();
    onOpenChange(false);
    onSaved?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEdit ? (
              <Pencil className="w-5 h-5 text-primary" />
            ) : (
              <Building2 className="w-5 h-5 text-primary" />
            )}
            {isEdit ? "Редактировать заведение" : "Добавить заведение"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Измените информацию о заведении."
              : "Заполните информацию о новом заведении. Оно появится в вашем профиле и при создании событий."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Name */}
          <div>
            <Label className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
              Название <span className="text-red-500">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: AUM Sound Center"
              className="mt-1"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Area + Address */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                Район <span className="text-red-500">*</span>
              </Label>
              <Input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Tiong Bahru"
                className="mt-1"
              />
              {errors.area && <p className="text-xs text-red-500 mt-1">{errors.area}</p>}
            </div>
            <div>
              <Label className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                Адрес <span className="text-red-500">*</span>
              </Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="78 Yong Siak St"
                className="mt-1"
              />
              {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
            </div>
          </div>

          {/* Capacity + Cover */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                Вместимость <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="40"
                className="mt-1"
              />
              {errors.capacity && <p className="text-xs text-red-500 mt-1">{errors.capacity}</p>}
            </div>
            <div>
              <Label className="flex items-center gap-1.5">
                <Image className="w-3.5 h-3.5 text-muted-foreground" />
                Обложка (URL) <span className="text-red-500">*</span>
              </Label>
              <Input
                value={coverPhoto}
                onChange={(e) => setCoverPhoto(e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
              {errors.coverPhoto && <p className="text-xs text-red-500 mt-1">{errors.coverPhoto}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-muted-foreground" />
              Описание
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание заведения..."
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Amenities */}
          <div>
            <Label className="flex items-center gap-1.5">
              <ListChecks className="w-3.5 h-3.5 text-muted-foreground" />
              Удобства
            </Label>
            <Input
              value={amenities}
              onChange={(e) => setAmenities(e.target.value)}
              placeholder="WiFi, Проектор, Кухня, Парковка..."
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">Через запятую</p>
            {amenities && (
              <div className="flex flex-wrap gap-1 mt-2">
                {amenities.split(",").map((a, i) =>
                  a.trim() ? (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {a.trim()}
                    </Badge>
                  ) : null
                )}
              </div>
            )}
          </div>

          {/* Rules */}
          <div>
            <Label className="flex items-center gap-1.5">
              <Gavel className="w-3.5 h-3.5 text-muted-foreground" />
              Правила
            </Label>
            <Input
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              placeholder="Тишина за 10 минут, Без обуви..."
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">Через запятую</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => handleClose(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-white gap-1.5">
            {isEdit ? (
              <>
                <Pencil className="w-4 h-4" />
                Сохранить
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Добавить
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
