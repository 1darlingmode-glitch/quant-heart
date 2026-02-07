import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface BrokerAccount {
  id: string;
  user_id: string;
  name: string;
  broker: string;
  balance: number | null;
  status: string;
  api_key_ref: string | null;
  last_sync: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBrokerAccountInput {
  name: string;
  broker: string;
  balance?: number;
}

export interface UpdateBrokerAccountInput {
  id: string;
  name?: string;
  broker?: string;
  balance?: number;
  status?: string;
}

export function useBrokerAccounts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const accountsQuery = useQuery({
    queryKey: ["broker_accounts", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("broker_accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BrokerAccount[];
    },
    enabled: !!user,
  });

  const createAccount = useMutation({
    mutationFn: async (input: CreateBrokerAccountInput) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("broker_accounts")
        .insert({
          user_id: user.id,
          name: input.name,
          broker: input.broker,
          balance: input.balance || 0,
          status: "active",
          last_sync: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broker_accounts", user?.id] });
      toast({
        title: "Account connected",
        description: "Your broker account has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateAccount = useMutation({
    mutationFn: async (input: UpdateBrokerAccountInput) => {
      if (!user) throw new Error("Not authenticated");

      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from("broker_accounts")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broker_accounts", user?.id] });
      toast({
        title: "Account updated",
        description: "Your broker account has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteAccount = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("broker_accounts")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broker_accounts", user?.id] });
      toast({
        title: "Account removed",
        description: "Your broker account has been disconnected.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const syncAccount = useMutation({
    mutationFn: async (account: BrokerAccount) => {
      if (!user) throw new Error("Not authenticated");

      // Simulate balance change (±0.5% to ±2% fluctuation)
      const currentBalance = account.balance || 0;
      const changePercent = (Math.random() - 0.5) * 0.04; // -2% to +2%
      const newBalance = Math.round((currentBalance * (1 + changePercent)) * 100) / 100;

      const { data, error } = await supabase
        .from("broker_accounts")
        .update({
          balance: newBalance,
          last_sync: new Date().toISOString(),
          status: "active",
        })
        .eq("id", account.id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return { account: data, change: newBalance - currentBalance };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["broker_accounts", user?.id] });
      const changeText = result.change >= 0 
        ? `+$${result.change.toFixed(2)}` 
        : `-$${Math.abs(result.change).toFixed(2)}`;
      toast({
        title: "Account synced",
        description: `Balance updated (${changeText})`,
      });
    },
    onError: (error) => {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const syncAllAccounts = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      
      const accounts = accountsQuery.data || [];
      const activeAccounts = accounts.filter(a => a.status === "active");
      
      const results = await Promise.all(
        activeAccounts.map(async (account) => {
          const currentBalance = account.balance || 0;
          const changePercent = (Math.random() - 0.5) * 0.04;
          const newBalance = Math.round((currentBalance * (1 + changePercent)) * 100) / 100;

          const { error } = await supabase
            .from("broker_accounts")
            .update({
              balance: newBalance,
              last_sync: new Date().toISOString(),
            })
            .eq("id", account.id)
            .eq("user_id", user.id);

          if (error) throw error;
          return { name: account.name, change: newBalance - currentBalance };
        })
      );

      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["broker_accounts", user?.id] });
      toast({
        title: "All accounts synced",
        description: `Updated ${results.length} account${results.length !== 1 ? "s" : ""}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    accounts: accountsQuery.data || [],
    isLoading: accountsQuery.isLoading,
    error: accountsQuery.error,
    createAccount,
    updateAccount,
    deleteAccount,
    syncAccount,
    syncAllAccounts,
  };
}
