"use client";

import { DataTable } from "@/components/mycomponents/admin/data-table";

type User = {
  id: number;
  name: string;
  email: string;
};

const users: User[] = [
  {
    id: 1,
    name: "Ram",
    email: "ram@example.com",
  },
  {
    id: 2,
    name: "Hari",
    email: "hari@example.com",
  },
  {
    id: 3,
    name: "Sita",
    email: "sita@example.com",
  },
];

const columns = [
  {
    key: "name" as keyof User,
    label: "Name",
  },
  {
    key: "email" as keyof User,
    label: "Email",
  },
];

export default function TestTablePage() {
  function handleView(user: User) {
    console.log("View:", user);
  }

  function handleEdit(user: User) {
    console.log("Edit:", user);
  }

  function handleDelete(user: User) {
    console.log("Delete:", user);
  }

  return (
    <main className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Test Data Table</h1>

      <DataTable
        columns={columns}
        data={users}
        actions={{
          view: true,
          edit: true,
          delete: true,
          onView: handleView,
          onEdit: handleEdit,
          onDelete: handleDelete,
        }}
      />
    </main>
  );
}
