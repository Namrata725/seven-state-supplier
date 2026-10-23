"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type DeleteDialogProps = {
  title?: string;
  description?: string;
  onDelete: () => void;
  loading?: boolean;
};

export function DeleteDialog({
  title = "Are you sure?",
  description = "This action cannot be undone. This will permanently delete this item.",
  onDelete,
  loading = false,
}: DeleteDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button
          variant="destructive"
          size="icon"
          disabled={loading}
          className="cursor-pointer"
        >
          <Trash2 />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>

          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>

          <AlertDialogAction onClick={onDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
