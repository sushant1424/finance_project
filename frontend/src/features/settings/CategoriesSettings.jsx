import { useState } from 'react';
import { FolderOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useCategories } from '@/hooks/useCategories';
import { CATEGORIES } from '@/constants/categories';
import CategoryForm from '@/features/settings/CategoryForm';

export default function CategoriesSettings() {
  const { custom, loading, create, update, remove } = useCategories();
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const [editCat, setEditCat] = useState(null);

  const handleCreate = async (data) => {
    try {
      await create(data);
      toast.success('Category created');
      setOpen(false);
    } catch {
      toast.error('Failed to create category');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await update(editCat.id, data);
      toast.success('Category updated');
      setEditCat(null);
    } catch {
      toast.error('Failed to update category');
    }
  };

  const handleDelete = async (cat) => {
    const ok = await confirm({
      title: 'Delete category?',
      description: `Remove "${cat.name}"?`,
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (!ok) return;
    try {
      await remove(cat.id);
      toast.success('Category deleted');
    } catch {
      toast.error('Failed to delete category');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">Add your own categories for transactions.</p>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />Add
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {[1, 2].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-surface-2" />)}
        </div>
      ) : !custom.length ? (
        <EmptyState
          icon={FolderOpen}
          title="No custom categories"
          description="Create categories that match how you spend."
          actionLabel="Add category"
          onAction={() => setOpen(true)}
        />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {custom.map((cat) => (
            <Card key={cat.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base"
                style={{ backgroundColor: `${cat.color}25` }}>{cat.icon}</div>
              <span className="flex-1 truncate text-sm font-medium">{cat.name}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditCat(cat)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-danger" onClick={() => handleDelete(cat)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-muted">{CATEGORIES.length} built-in categories included.</p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add category</DialogTitle></DialogHeader>
          <CategoryForm onSubmit={handleCreate} onCancel={() => setOpen(false)} />
        </DialogContent>
      </Dialog>

      {editCat && (
        <Dialog open onOpenChange={(v) => !v && setEditCat(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit category</DialogTitle></DialogHeader>
            <CategoryForm defaultValues={editCat} onSubmit={handleUpdate} onCancel={() => setEditCat(null)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
