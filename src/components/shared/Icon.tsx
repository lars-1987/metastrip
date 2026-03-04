"use client";

import type { ComponentType } from "react";
import {
  MapPin,
  DeviceMobile,
  CalendarBlank,
  Laptop,
  User,
  ImageSquare,
  Camera,
  NotePencil,
  Package,
  Robot,
  Tag,
  Buildings,
  LockKey,
  Eye,
  MagnifyingGlass,
  ChatText,
  UsersThree,
  ClipboardText,
  MapTrifold,
  Warning,
  Globe,
  Scales,
  FileText,
  ShieldCheck,
  Clock,
  Lock,
  Ghost,
  Prohibit,
  Lightbulb,
  CreditCard,
  Coffee,
  Lightning,
  Crosshair,
  ChartBar,
  PushPin,
  Copyright,
  GearSix,
} from "@phosphor-icons/react";
import type { IconProps as PhosphorIconProps } from "@phosphor-icons/react";

const ICONS: Record<string, ComponentType<PhosphorIconProps>> = {
  MapPin,
  DeviceMobile,
  CalendarBlank,
  Laptop,
  User,
  ImageSquare,
  Camera,
  NotePencil,
  Package,
  Robot,
  Tag,
  Buildings,
  LockKey,
  Eye,
  MagnifyingGlass,
  ChatText,
  UsersThree,
  ClipboardText,
  MapTrifold,
  Warning,
  Globe,
  Scales,
  FileText,
  ShieldCheck,
  Clock,
  Lock,
  Ghost,
  Prohibit,
  Lightbulb,
  CreditCard,
  Coffee,
  Lightning,
  Crosshair,
  ChartBar,
  PushPin,
  Copyright,
  GearSix,
};

export type IconName =
  | "MapPin"
  | "DeviceMobile"
  | "CalendarBlank"
  | "Laptop"
  | "User"
  | "ImageSquare"
  | "Camera"
  | "NotePencil"
  | "Package"
  | "Robot"
  | "Tag"
  | "Buildings"
  | "LockKey"
  | "Eye"
  | "MagnifyingGlass"
  | "ChatText"
  | "UsersThree"
  | "ClipboardText"
  | "MapTrifold"
  | "Warning"
  | "Globe"
  | "Scales"
  | "FileText"
  | "ShieldCheck"
  | "Clock"
  | "Lock"
  | "Ghost"
  | "Prohibit"
  | "Lightbulb"
  | "CreditCard"
  | "Coffee"
  | "Lightning"
  | "Crosshair"
  | "ChartBar"
  | "PushPin"
  | "Copyright"
  | "GearSix";

interface IconComponentProps {
  name: IconName;
  size?: number;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  className?: string;
  color?: string;
}

export function Icon({
  name,
  size = 20,
  weight = "duotone",
  className,
  color,
}: IconComponentProps) {
  const Component = ICONS[name];
  if (!Component) return null;
  return (
    <Component
      size={size}
      weight={weight}
      className={className}
      color={color}
    />
  );
}
