import { useState, useEffect } from "react";
import { Plus, Search, ClipboardList, Check, AlertTriangle, Play, Square, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/contexts/AppContext";
import { formatDate, formatNumber } from "@/lib/i18n";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InventorySession, InventoryCount, Warehouse, Product } from "@shared/schema";

export default function Inventory() {
  const { t, language } = useApp();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [newSession, setNewSession] = useState({ name: "", warehouseId: "", notes: "" });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<InventorySession[]>({
    queryKey: ["/api/inventory-sessions"],
  });

  useEffect(() => {
    if (sessions.length > 0 && !selectedSession) {
      setSelectedSession(sessions[0].id);
    }
  }, [sessions, selectedSession]);

  const { data: warehouses = [] } = useQuery<Warehouse[]>({
    queryKey: ["/api/warehouses"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: counts = [], isLoading: countsLoading } = useQuery<InventoryCount[]>({
    queryKey: ["/api/inventory-sessions", selectedSession, "counts"],
    enabled: !!selectedSession,
    queryFn: async () => {
      if (!selectedSession) return [];
      const res = await fetch(`/api/inventory-sessions/${selectedSession}/counts`);
      if (!res.ok) throw new Error("Failed to fetch counts");
      return res.json();
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data: { name: string; warehouseId: string; notes?: string }) => {
      const res = await apiRequest("POST", "/api/inventory-sessions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-sessions"] });
      setIsAddDialogOpen(false);
      setNewSession({ name: "", warehouseId: "", notes: "" });
      toast({ title: t("success"), description: "Session d'inventaire créée" });
    },
    onError: () => {
      toast({ title: t("error"), description: "Échec de la création", variant: "destructive" });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InventorySession> }) => {
      const res = await apiRequest("PATCH", `/api/inventory-sessions/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-sessions"] });
      toast({ title: t("success"), description: "Session mise à jour" });
    },
  });

  const updateCountMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { countedQuantity: string; status: string } }) => {
      const res = await apiRequest("PATCH", `/api/inventory-counts/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-sessions", selectedSession, "counts"] });
      toast({ title: t("success"), description: "Comptage enregistré" });
    },
  });

  const getWarehouseName = (warehouseId: string | null) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return warehouse?.name || "-";
  };

  const getProductInfo = (productId: string | null) => {
    const product = products.find(p => p.id === productId);
    return product ? { sku: product.sku, name: product.name } : { sku: "-", name: "-" };
  };

  const activeSession = sessions.find(s => s.id === selectedSession);

  const countedItems = counts.filter(c => c.status === "counted" || c.status === "verified").length;
  const totalItems = counts.length;
  const varianceItems = counts.filter(c => c.variance && parseFloat(c.variance) !== 0).length;
  const progress = totalItems > 0 ? (countedItems / totalItems) * 100 : 0;

  const handleCreateSession = () => {
    if (!newSession.name || !newSession.warehouseId) return;
    createSessionMutation.mutate(newSession);
  };

  const handleFinishSession = () => {
    if (!selectedSession) return;
    updateSessionMutation.mutate({ id: selectedSession, data: { status: "completed", endDate: new Date() } });
  };

  if (sessionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
              <div className="space-y-2">
                <Label>{t("name")} *</Label>
                <Input 
                  placeholder="Nom de la session" 
                  value={newSession.name}
                  onChange={(e) => setNewSession({ ...newSession, name: e.target.value })}
                  data-testid="input-session-name"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("warehouse")} *</Label>
                <Select value={newSession.warehouseId} onValueChange={(v) => setNewSession({ ...newSession, warehouseId: v })}>
                  <SelectTrigger data-testid="select-warehouse">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((wh) => (
                      <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("notes")}</Label>
                <Textarea 
                  placeholder="Notes" 
                  value={newSession.notes}
                  onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>{t("cancel")}</Button>
              <Button onClick={handleCreateSession} disabled={createSessionMutation.isPending}>
                {createSessionMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                {t("startInventory")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucune session d'inventaire</p>
            <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />{t("startInventory")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {sessions.slice(0, 6).map((session) => {
              const sessionCounted = session.id === selectedSession ? countedItems : 0;
              const sessionTotal = session.id === selectedSession ? totalItems : 1;
              return (
                <Card 
                  key={session.id} 
                  className={`cursor-pointer transition-all ${selectedSession === session.id ? "ring-2 ring-primary" : "hover-elevate"}`}
                  onClick={() => setSelectedSession(session.id)}
                  data-testid={`card-session-${session.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-muted-foreground" />
                        <Badge variant={session.status === "in_progress" ? "default" : session.status === "completed" ? "secondary" : "outline"} size="sm">
                          {t(session.status || "in_progress")}
                        </Badge>
                      </div>
                    </div>
                    <h3 className="font-medium mb-1">{session.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{getWarehouseName(session.warehouseId)}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.startDate && formatDate(new Date(session.startDate), language)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {activeSession && (
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle>{activeSession.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activeSession.startDate && `Démarré le ${formatDate(new Date(activeSession.startDate), language)}`} • {getWarehouseName(activeSession.warehouseId)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {activeSession.status === "in_progress" && (
                      <Button variant="outline" onClick={handleFinishSession} disabled={updateSessionMutation.isPending} data-testid="button-finish-inventory">
                        {updateSessionMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Square className="mr-2 h-4 w-4" />}
                        {t("finishInventory")}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {countsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : counts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucun produit dans cette session
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input type="search" placeholder={`${t("search")} produit...`} className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Progression: {countedItems}/{totalItems}</span>
                        {varianceItems > 0 && <Badge variant="destructive" size="sm">{varianceItems} écarts</Badge>}
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
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {counts.map((count) => {
                            const productInfo = getProductInfo(count.productId);
                            const variance = count.variance ? parseFloat(count.variance) : null;
                            return (
                              <TableRow key={count.id} data-testid={`row-count-${count.id}`}>
                                <TableCell className="font-mono text-sm">{productInfo.sku}</TableCell>
                                <TableCell className="font-medium">{productInfo.name}</TableCell>
                                <TableCell className="text-right font-mono">{count.expectedQuantity ? formatNumber(parseFloat(count.expectedQuantity)) : "-"}</TableCell>
                                <TableCell className="text-right font-mono">
                                  {count.countedQuantity ? formatNumber(parseFloat(count.countedQuantity)) : "-"}
                                </TableCell>
                                <TableCell className={`text-right font-mono ${variance !== null && variance !== 0 ? (variance > 0 ? "text-chart-2" : "text-destructive") : ""}`}>
                                  {variance !== null ? (variance > 0 ? `+${variance}` : variance) : "-"}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={count.status === "verified" ? "default" : count.status === "counted" ? "secondary" : "outline"} size="sm">
                                    {count.status === "verified" && <Check className="mr-1 h-3 w-3" />}
                                    {variance !== null && variance !== 0 && <AlertTriangle className="mr-1 h-3 w-3" />}
                                    {t(count.status || "pending")}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
