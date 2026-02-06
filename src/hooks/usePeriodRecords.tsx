import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface PeriodRecord {
  id: string;
  user_id: string;
  period_type: string;
  period_start: string;
  period_end: string;
  period_label: string;
  notes: string | null;
  screenshots: string[];
  total_trades: number;
  winners: number;
  losers: number;
  win_rate: number;
  gross_pnl: number;
  gross_profit: number;
  gross_loss: number;
  created_at: string;
  updated_at: string;
}

export interface PeriodRecordInsert {
  period_type: string;
  period_start: string;
  period_end: string;
  period_label: string;
  notes?: string;
  screenshots?: string[];
  total_trades?: number;
  winners?: number;
  losers?: number;
  win_rate?: number;
  gross_pnl?: number;
  gross_profit?: number;
  gross_loss?: number;
}

export function usePeriodRecords() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["period-records", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("period_records")
        .select("*")
        .eq("user_id", user.id)
        .order("period_start", { ascending: false });

      if (error) throw error;
      return data as PeriodRecord[];
    },
    enabled: !!user,
  });

  const saveRecord = useMutation({
    mutationFn: async (record: PeriodRecordInsert) => {
      if (!user) throw new Error("Not authenticated");

      // Check if record already exists for this period
      const { data: existing } = await supabase
        .from("period_records")
        .select("id")
        .eq("user_id", user.id)
        .eq("period_start", record.period_start)
        .eq("period_end", record.period_end)
        .single();

      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from("period_records")
          .update({
            notes: record.notes,
            screenshots: record.screenshots,
            total_trades: record.total_trades,
            winners: record.winners,
            losers: record.losers,
            win_rate: record.win_rate,
            gross_pnl: record.gross_pnl,
            gross_profit: record.gross_profit,
            gross_loss: record.gross_loss,
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from("period_records")
          .insert({
            user_id: user.id,
            ...record,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["period-records"] });
      toast.success("Record saved successfully!");
    },
    onError: (error) => {
      console.error("Failed to save record:", error);
      toast.error("Failed to save record");
    },
  });

  const deleteRecord = useMutation({
    mutationFn: async (recordId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("period_records")
        .delete()
        .eq("id", recordId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["period-records"] });
      toast.success("Record deleted");
    },
    onError: (error) => {
      console.error("Failed to delete record:", error);
      toast.error("Failed to delete record");
    },
  });

  const uploadScreenshot = async (file: File): Promise<string> => {
    if (!user) throw new Error("Not authenticated");

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("period-screenshots")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("period-screenshots")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  return {
    records,
    isLoading,
    saveRecord,
    deleteRecord,
    uploadScreenshot,
  };
}
