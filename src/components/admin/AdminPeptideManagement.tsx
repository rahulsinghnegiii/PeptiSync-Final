import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, BookOpen } from "lucide-react";
import { AdminPeptides } from "./AdminPeptides";
import { AdminPeptideLibrary } from "./AdminPeptideLibrary";

export const AdminPeptideManagement = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="master" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="master" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Master Database
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Educational Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="master" className="mt-6">
          <AdminPeptides />
        </TabsContent>

        <TabsContent value="library" className="mt-6">
          <AdminPeptideLibrary />
        </TabsContent>
      </Tabs>
    </div>
  );
};

