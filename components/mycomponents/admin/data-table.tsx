"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";

import { AdminLoading } from "./admin-loading";
import { DeleteDialog } from "./delete-dialog";

type Column<T> = {
  key: keyof T;
  label: string;
};

type TableActions<T> = {
  view?: boolean;
  edit?: boolean;
  delete?: boolean;

  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  actions?: TableActions<T>;
  loading?: boolean;
  emptyMessage?: string;
  deleteLoading?: boolean;
};

export function DataTable<T>({
  columns,
  data,
  actions,
  loading = false,
  emptyMessage = "No data found.",
  deleteLoading = false,
}: DataTableProps<T>) {
  const hasActions = actions?.view || actions?.edit || actions?.delete;

  const totalColumns = columns.length + (hasActions ? 1 : 0);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-background shadow-lg shadow-primary/5">
      {/* Primary top accent */}
      <div className="h-1 w-full bg-primary" />

      <div className="overflow-x-auto">
        <Table>
          {/* Header */}
          <TableHeader>
            <TableRow className="border-b border-primary/10 bg-primary/5 hover:bg-primary/5">
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  className="h-14 px-6 text-xs font-bold uppercase tracking-wider text-primary"
                >
                  {column.label}
                </TableHead>
              ))}

              {hasActions && (
                <TableHead className="h-14 px-6 text-xs font-bold uppercase tracking-wider text-primary">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          {/* Body */}
          <TableBody>
            {/* Loading */}
            {loading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={totalColumns} className="p-0">
                  <div className="flex min-h-48 items-center justify-center">
                    <AdminLoading />
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              /* Empty */
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={totalColumns} className="p-0">
                  <div className="flex min-h-48 items-center justify-center text-sm text-muted-foreground">
                    {emptyMessage}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              /* Data */
              data.map((item, index) => (
                <TableRow
                  key={index}
                  className="group border-b border-border/50 transition-all duration-200 hover:bg-primary/[0.04]"
                >
                  {columns.map((column, columnIndex) => (
                    <TableCell
                      key={String(column.key)}
                      className={`px-6 py-4 text-sm ${
                        columnIndex === 0
                          ? "font-semibold text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {String(item[column.key])}
                    </TableCell>
                  ))}

                  {/* Actions */}
                  {hasActions && (
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* View */}
                        {actions?.view && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-lg border-primary/20 cursor-pointer text-primary transition-all duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:shadow-primary/20"
                            onClick={() => actions.onView?.(item)}
                          >
                            <Eye className="h-4 w-4 cursor-pointer" />
                          </Button>
                        )}

                        {/* Edit */}
                        {actions?.edit && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-lg border-primary/20 cursor-pointer text-primary transition-all duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:shadow-primary/20"
                            onClick={() => actions.onEdit?.(item)}
                          >
                            <Pencil className="h-4 w-4 " />
                          </Button>
                        )}

                        {/* Delete */}
                        {actions?.delete && (
                          <DeleteDialog
                            onDelete={() => actions.onDelete?.(item)}
                            loading={deleteLoading}
                          />
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
