import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, GripVertical, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useTradingRules, TradingRule, CreateRuleInput } from "@/hooks/useTradingRules";
import { cn } from "@/lib/utils";

interface RuleFormProps {
  onSubmit: (data: CreateRuleInput) => void;
  initialData?: Partial<TradingRule>;
  onCancel: () => void;
  isLoading?: boolean;
}

function RuleForm({ onSubmit, initialData, onCancel, isLoading }: RuleFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [weight, setWeight] = useState(initialData?.weight_percentage?.toString() || "10");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      weight_percentage: Math.min(100, Math.max(1, Number(weight) || 10)),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1.5 block">Rule Title *</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Check higher timeframe trend"
          className="bg-background"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium mb-1.5 block">Description (optional)</label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details about this rule..."
          className="bg-background resize-none"
          rows={3}
        />
      </div>
      
      <div>
        <label className="text-sm font-medium mb-1.5 block">
          Weight Percentage (1-100)
        </label>
        <Input
          type="number"
          min={1}
          max={100}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="bg-background w-32"
        />
        <p className="text-xs text-muted-foreground mt-1">
          How important is this rule to your trading framework?
        </p>
      </div>
      
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!title.trim() || isLoading}>
          {isLoading ? "Saving..." : initialData?.id ? "Update Rule" : "Add Rule"}
        </Button>
      </div>
    </form>
  );
}

export function RuleManager() {
  const { rules, isLoading, createRule, updateRule, deleteRule, totalWeight } = useTradingRules();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<TradingRule | null>(null);

  const handleCreate = (data: CreateRuleInput) => {
    createRule.mutate(data, {
      onSuccess: () => setIsAddOpen(false),
    });
  };

  const handleUpdate = (data: CreateRuleInput) => {
    if (!editingRule) return;
    updateRule.mutate(
      { id: editingRule.id, ...data },
      { onSuccess: () => setEditingRule(null) }
    );
  };

  const handleDelete = (ruleId: string) => {
    deleteRule.mutate(ruleId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Trading Rules</h3>
          <p className="text-sm text-muted-foreground">
            Define your personal trading checklist
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary shadow-glow">
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Rule</DialogTitle>
            </DialogHeader>
            <RuleForm
              onSubmit={handleCreate}
              onCancel={() => setIsAddOpen(false)}
              isLoading={createRule.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Weight Summary */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Total Weight Distribution</span>
          <span className={cn(
            "text-sm font-bold",
            totalWeight === 100 ? "text-profit" : totalWeight > 100 ? "text-loss" : "text-muted-foreground"
          )}>
            {totalWeight}%
          </span>
        </div>
        <Progress value={Math.min(totalWeight, 100)} className="h-2" />
        {totalWeight !== 100 && (
          <p className="text-xs text-muted-foreground mt-2">
            {totalWeight < 100 
              ? `Add ${100 - totalWeight}% more weight for complete coverage`
              : `Reduce ${totalWeight - 100}% to reach 100%`}
          </p>
        )}
      </div>

      {/* Rules List */}
      {rules.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h4 className="font-medium mb-2">No rules yet</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first trading rule to build your checklist
          </p>
          <Button variant="outline" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Rule
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {rules.map((rule, index) => (
              <motion.div
                key={rule.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-lg border border-border p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="text-muted-foreground mt-1 cursor-grab">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{rule.title}</h4>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                        {rule.weight_percentage}%
                      </span>
                    </div>
                    {rule.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {rule.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Dialog open={editingRule?.id === rule.id} onOpenChange={(open) => !open && setEditingRule(null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingRule(rule)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Rule</DialogTitle>
                        </DialogHeader>
                        <RuleForm
                          initialData={editingRule || undefined}
                          onSubmit={handleUpdate}
                          onCancel={() => setEditingRule(null)}
                          isLoading={updateRule.isPending}
                        />
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-loss">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Rule</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{rule.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(rule.id)}
                            className="bg-loss hover:bg-loss/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
