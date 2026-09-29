import { Pencil, Plus, Tags, Trash } from "lucide-react";

import { CategoryIcon } from "@/components/categories/category-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { CategoryWithUsage } from "@/lib/data/categories";
import { pluralize } from "@/lib/utils";

type CategoryGroupProps = {
  title: string;
  categories: CategoryWithUsage[];
  onAdd: () => void;
  onEdit: (category: CategoryWithUsage) => void;
  onDelete: (category: CategoryWithUsage) => void;
};

export function CategoryGroup({
  title,
  categories,
  onAdd,
  onEdit,
  onDelete,
}: CategoryGroupProps) {
  const headingId = `category-group-${title.toLowerCase()}`;

  return (
    <Card as="section" aria-labelledby={headingId} className="p-0 sm:p-0">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 sm:px-6 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <h2 id={headingId} className="font-semibold text-zinc-900 dark:text-zinc-50">
            {title}
          </h2>
          <Badge>{categories.length}</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onAdd}>
          <Plus className="size-4" aria-hidden />
          Add
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={Tags}
          title={`No ${title.toLowerCase()} categories`}
          description="Add one to start organizing your transactions."
          className="m-4 border-none py-8"
        />
      ) : (
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center gap-3 px-4 py-3 sm:px-6">
              <CategoryIcon icon={category.icon} color={category.color} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                  {category.name}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {category.transactionCount > 0
                    ? pluralize(category.transactionCount, "transaction")
                    : "No transactions"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(category)}
                aria-label={`Edit ${category.name}`}
                title="Edit"
              >
                <Pencil className="size-4" aria-hidden />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(category)}
                aria-label={`Delete ${category.name}`}
                title="Delete"
                className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                <Trash className="size-4" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
