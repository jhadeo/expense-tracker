import { useState, useEffect } from "react";
import { DataTable } from "@/components/tables/DataTable";
import { getCategoryColumns } from "@/components/columns/categories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { TableSkeleton } from "@/components/skeleton/table-skeleton";
import { Button } from "@/components/ui/button";
import { AppDialog } from "@/components/AppDialog";
import { ErrorCard } from "@/components/cards/ErrorCard";

import api from "../api/axios";
import { CategoryForm } from "@/components/forms/CategoryForm";

export function Categories() {
  const [categories, setCategories] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryOpen, setCategoryOpen] = useState(false);

  async function fetchCategories() {
    try {
      setError(null);
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch {
      setError("Unable to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  if (error) {
    return (
            <ErrorCard
        title="Unable to load categories."
        message="Please try again later."
        onRetry={fetchCategories}
      />
    );
  }

  if (loading) {
    return (
      <div className="w-full">
        <TableSkeleton showAction />
      </div>
    );
  }
  return (
    <div className="w-full">
      <Card className={"col-span-3"}>
        <CardHeader>
          <div className="flex justify-between">
            <CardTitle>Your Categories</CardTitle>
            <AppDialog
              open={categoryOpen}
              onOpenChange={setCategoryOpen}
              trigger={<Button>Add Category</Button>}
              title={"Add category"}
              description="Create a new category."
            >
              <CategoryForm
                onSuccess={fetchCategories}
                onClose={() => setCategoryOpen(false)}
              />
            </AppDialog>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={categories.data}
            columns={getCategoryColumns({
              onRefresh: fetchCategories,
            })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
