import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardCheck, Settings } from "lucide-react";
import { RuleManager } from "./RuleManager";
import { TradeEvaluator } from "./TradeEvaluator";

export function ChecklistTab() {
  const [activeTab, setActiveTab] = useState("evaluate");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="evaluate" className="gap-2">
            <ClipboardCheck className="w-4 h-4" />
            Evaluate Trade
          </TabsTrigger>
          <TabsTrigger value="manage" className="gap-2">
            <Settings className="w-4 h-4" />
            Manage Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="evaluate" className="mt-6">
          <TradeEvaluator />
        </TabsContent>

        <TabsContent value="manage" className="mt-6">
          <RuleManager />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
