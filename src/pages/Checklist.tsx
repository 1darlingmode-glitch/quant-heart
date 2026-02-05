import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardCheck, Settings, BarChart3 } from "lucide-react";
import { RuleManager } from "@/components/checklist/RuleManager";
import { TradeEvaluator } from "@/components/checklist/TradeEvaluator";
import { RuleAnalytics } from "@/components/checklist/RuleAnalytics";
import { useState } from "react";

export default function Checklist() {
  const [activeTab, setActiveTab] = useState("evaluate");

  return (
    <AppLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">My Strategy Checklist</h1>
        <p className="text-muted-foreground">
          Evaluate trade quality before execution with your personal trading strategy
        </p>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="evaluate" className="gap-2">
              <ClipboardCheck className="w-4 h-4" />
              Evaluate Trade
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="manage" className="gap-2">
              <Settings className="w-4 h-4" />
              Manage Rules
            </TabsTrigger>
          </TabsList>

          <TabsContent value="evaluate" className="mt-6">
            <TradeEvaluator />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <RuleAnalytics />
          </TabsContent>

          <TabsContent value="manage" className="mt-6">
            <RuleManager />
          </TabsContent>
        </Tabs>
      </motion.div>
    </AppLayout>
  );
}
