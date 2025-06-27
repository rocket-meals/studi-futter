import { ReactNode } from "react";
export interface ProjectButtonProps {
  text: string;
  onPress?: () => void;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}
