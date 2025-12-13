import { useState } from "react";
import { Plus, Search, ClipboardList, Check, AlertTriangle, Play, Square } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/contexts/AppContext";
import { formatDate, formatNumber } from "@/lib/i18n";

const mockSessions = [
  { id: "1", name: "Inventaire Décembre 2024", warehouse: "Casablanca Central", status: "in_progress", startDate: new Date("2024-12-10"), endDate: null, totalItems: 245, countedItems: 180, varianceItems: 12 },
  { id: "2", name: "Inventaire Trimestriel Q4", warehouse: "Rabat Nord", status: "completed", startDate: new Date("2024-11-15"), endDate: new Date("2024-11-17"), totalItems: 156, countedItems: 156, varianceItems: 8 },
  { id: "3", name: "Inventaire Mensuel Nov", warehouse: "Marrakech Sud", status: "completed", startDate: new Date("2024-11-01"), endDate: new Date("2024-11-03"), totalItems: 89, countedItems: 89, varianceItems: 3 },
];

const mockCounts = [
  { id: "1", sku: "PRD-001", product: "Huile d'olive extra vierge", expectedQty: 234, countedQty: 230, variance: -4, status: "counted" },
  { id: "2", sku: "PRD-002", product: "Savon noir traditionnel", expectedQty: 89, countedQty: 89, variance: 0, status: "verified" },
  { id: "3", sku: "PRD-003", product: "Argan cosmétique bio", expectedQty: 12, countedQty: null, variance: null, status: "pending" },
  { id: "4", sku: "PRD-005", product: "Couscous fin traditionnel", expectedQty: 567, countedQty: 572, variance: 5, status: "counted" },
];

export default function Inventory() {
  const { t, language } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>("1");

  const activeSession = mockSessions.find(s => s.id === selectedSession);
  const progress = activeSession ? (activeSession.countedItems / activeSession.totalItems) * 100 : 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">{t("inventory")}</h1>
          <p className="text-muted-foreground">Gestion des sessions d'inventaire</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-inventory"><Plus className="mr-2 h-4 w-4" />{t("startInventory")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle session d'inventaire</DialogTitle>
              <DialogDescription>Démarrer une nouvelle session de comptage</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><Label>{t("name")} *</Label><Input placeholder="Nom de la session" /></div>
              <div className="space-y-2"><Label>{t("warehouse")} *</Label><Select><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent><SelectItem value="1">Casablanca Central</SelectItem><SelectItem value="2">Rabat Nord</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>{t("notes")}</Label><Textarea placeholder="Notes" /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>{t("cancel")}</Button>
              <Button><Play className="mr-2 h-4 w-4" />{t("startInventory")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {mockSessions.slice(0, 3).map((session) => (
          <Card 
            key={session.id} 
            className={`cursor-pointer transition-all ${selectedSession === session.id ? "ring-2 ring-primary" : "hover-elevate"}`}
            onClick={() => setSelectedSession(session.id)}
            data-testid={`card-session-${session.id}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-muted-foreground" />
                  <Badge variant={session.status === "in_progress" ? "default" : session.status === "completed" ? "secondary" : "outline"} size="sm">
                    {t(session.status)}
                  </Badge>
                </div>
                {session.varianceItems > 0 && (
                  <Badge variant="destructive" size="sm">{session.varianceItems} écarts</Badge>
                )}
              </div>
              <h3 className="font-medium mb-1">{session.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{session.warehouse}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progression</span>
                  <span>{session.countedItems}/{session.totalItems}</span>
                </div>
                <Progress value={(session.countedItems / session.totalItems) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {activeSession && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>{activeSession.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Démarré le {formatDate(activeSession.startDate, language)} • {activeSession.warehouse}
                </p>
              </div>
              <div className="flex gap-2">
                {activeSession.status === "in_progress" && (
                  <Button variant="outline" data-testid="button-finish-inventory">
                    <Square className="mr-2 h-4 w-4" />
                    {t("finishInventory")}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="search" placeholder={`${t("search")} produit...`} className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("sku")}</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead className="text-right">{t("expectedQuantity")}</TableHead>
                    <TableHead className="text-right">{t("countedQuantity")}</TableHead>
                    <TableHead className="text-right">{t("variance")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead className="w-32"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCounts.map((count) => (
                    <TableRow key={count.id} data-testid={`row-count-${count.id}`}>
                      <TableCell className="font-mono text-sm">{count.sku}</TableCell>
                      <TableCell className="font-medium">{count.product}</TableCell>
                      <TableCell className="text-right font-mono">{formatNumber(count.expectedQty)}</TableCell>
                      <TableCell className="text-right">
                        {count.status === "pending" ? (
                          <Input type="number" className="w-24 ml-auto text-right" placeholder="0" />
                        ) : (
                          <span className="font-mono">{formatNumber(count.countedQty || 0)}</span>
                        )}
                      </TableCell>
                      <TableCell className={`text-right font-mono ${count.variance && count.variance !== 0 ? (count.variance > 0 ? "text-chart-2" : "text-destructive") : ""}`}>
                        {count.variance !== null ? (count.variance > 0 ? `+${count.variance}` : count.variance) : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={count.status === "verified" ? "default" : count.status === "counted" ? "secondary" : "outline"} size="sm">
                          {count.status === "verified" && <Check className="mr-1 h-3 w-3" />}
                          {count.variance && count.variance !== 0 && <AlertTriangle className="mr-1 h-3 w-3" />}
                          {t(count.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {count.status === "pending" && (
                          <Button size="sm">{t("save")}</Button>
                        )}
                        {count.status === "counted" && (
                          <Button size="sm" variant="outline">{t("confirm")}</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
