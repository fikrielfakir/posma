import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Eye, FileText, Truck, Check, X, ShoppingCart, Loader2 } from "lucide-react";
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
import { formatCurrency, formatDate } from "@/lib/i18n";
import type { PurchaseOrder, Supplier, Warehouse } from "@shared/schema";

interface PurchaseOrderWithDetails extends PurchaseOrder {
  supplier?: Supplier;
  warehouse?: Warehouse;
}

const statusConfig: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; icon: any }> = {
  draft: { variant: "outline", icon: FileText },
  pending_approval: { variant: "secondary", icon: FileText },
  approved: { variant: "default", icon: Check },
  ordered: { variant: "secondary", icon: ShoppingCart },
  partial_received: { variant: "secondary", icon: Truck },
  received: { variant: "default", icon: Check },
  cancelled: { variant: "destructive", icon: X },
};

export default function Purchases() {
  const { t, currency, language } = useApp();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    supplierId: "",
    warehouseId: "",
    orderDate: "",
    expectedDate: "",
    notes: "",
  });

  const { data: purchaseOrders = [], isLoading } = useQuery<PurchaseOrder[]>({
    queryKey: ["/api/purchase-orders"],
  });

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const { data: warehouses = [] } = useQuery<Warehouse[]>({
    queryKey: ["/api/warehouses"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      supplierId: string;
      warehouseId: string;
      orderDate?: string;
      expectedDate?: string;
      notes?: string;
    }) => {
      const orderNumber = `ACH-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(4, '0')}`;
      const res = await apiRequest("POST", "/api/purchase-orders", {
        ...data,
        orderNumber,
        status: "draft",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
      toast({ title: t("success"), description: "Commande créée" });
      setIsAddDialogOpen(false);
      setFormData({ supplierId: "", warehouseId: "", orderDate: "", expectedDate: "", notes: "" });
    },
    onError: () => {
      toast({ title: t("error"), description: "Erreur lors de la création", variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (!formData.supplierId || !formData.warehouseId) {
      toast({ title: t("error"), description: "Veuillez remplir les champs obligatoires", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      supplierId: formData.supplierId,
      warehouseId: formData.warehouseId,
      orderDate: formData.orderDate || undefined,
      expectedDate: formData.expectedDate || undefined,
      notes: formData.notes || undefined,
    });
  };

  const getSupplierById = (id: string | null | undefined) => suppliers.find(s => s.id === id);
  const getWarehouseById = (id: string | null | undefined) => warehouses.find(w => w.id === id);

  const enrichedPurchases: PurchaseOrderWithDetails[] = purchaseOrders.map(po => ({
    ...po,
    supplier: getSupplierById(po.supplierId),
    warehouse: getWarehouseById(po.warehouseId),
  }));

  const filteredPurchases = enrichedPurchases.filter((p) => {
    const matchesSearch = p.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.supplier?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: purchaseOrders.length,
    pending: purchaseOrders.filter(p => ["draft", "pending_approval"].includes(p.status || "")).length,
    inProgress: purchaseOrders.filter(p => ["ordered", "partial_received"].includes(p.status || "")).length,
    completed: purchaseOrders.filter(p => p.status === "received").length,
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">{t("purchases")}</h1>
          <p className="text-muted-foreground">Gestion des commandes fournisseurs</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-purchase"><Plus className="mr-2 h-4 w-4" />{t("newPurchase")}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouvelle commande d'achat</DialogTitle>
              <DialogDescription>Créer une nouvelle commande fournisseur</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("supplier")} *</Label>
                  <Select value={formData.supplierId} onValueChange={(v) => setFormData(prev => ({ ...prev, supplierId: v }))}>
                    <SelectTrigger data-testid="select-purchase-supplier">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("warehouse")} *</Label>
                  <Select value={formData.warehouseId} onValueChange={(v) => setFormData(prev => ({ ...prev, warehouseId: v }))}>
                    <SelectTrigger data-testid="select-purchase-warehouse">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map(w => (
                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("orderDate")}</Label>
                  <Input 
                    type="date" 
                    value={formData.orderDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, orderDate: e.target.value }))}
                    data-testid="input-order-date" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("expectedDate")}</Label>
                  <Input 
                    type="date" 
                    value={formData.expectedDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedDate: e.target.value }))}
                    data-testid="input-expected-date" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("notes")}</Label>
                <Textarea 
                  placeholder="Notes de la commande" 
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  data-testid="input-purchase-notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>{t("cancel")}</Button>
              <Button onClick={handleSave} disabled={createMutation.isPending} data-testid="button-save-purchase">
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{t("total")}</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{t("pending")}</p><p className="text-2xl font-bold text-chart-3">{stats.pending}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{t("inProgress")}</p><p className="text-2xl font-bold text-chart-1">{stats.inProgress}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{t("completed")}</p><p className="text-2xl font-bold text-chart-2">{stats.completed}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="search" placeholder={`${t("search")} commande...`} className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} data-testid="input-search-purchases" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" data-testid="select-status-filter"><SelectValue placeholder={t("status")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("status")}</SelectItem>
                <SelectItem value="draft">{t("draft")}</SelectItem>
                <SelectItem value="pending_approval">{t("pending")}</SelectItem>
                <SelectItem value="ordered">{t("ordered")}</SelectItem>
                <SelectItem value="partial_received">{t("partialReceived")}</SelectItem>
                <SelectItem value="received">{t("received")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("orderNumber")}</TableHead>
                  <TableHead>{t("supplier")}</TableHead>
                  <TableHead>{t("warehouse")}</TableHead>
                  <TableHead>{t("orderDate")}</TableHead>
                  <TableHead>{t("expectedDate")}</TableHead>
                  <TableHead className="text-right">{t("total")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                      Aucune commande trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPurchases.map((po) => {
                    const config = statusConfig[po.status || "draft"];
                    const total = Number(po.total) || 0;
                    return (
                      <TableRow key={po.id} data-testid={`row-purchase-${po.id}`}>
                        <TableCell className="font-mono font-medium">{po.orderNumber}</TableCell>
                        <TableCell>{po.supplier?.name || "-"}</TableCell>
                        <TableCell><Badge variant="outline" size="sm">{po.warehouse?.name || "-"}</Badge></TableCell>
                        <TableCell className="text-sm">{po.orderDate ? formatDate(new Date(po.orderDate), language) : "-"}</TableCell>
                        <TableCell className="text-sm">{po.expectedDate ? formatDate(new Date(po.expectedDate), language) : "-"}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(total, currency)}</TableCell>
                        <TableCell><Badge variant={config?.variant || "outline"} size="sm">{t(po.status || "draft")}</Badge></TableCell>
                        <TableCell><Button variant="ghost" size="icon" data-testid={`button-view-purchase-${po.id}`}><Eye className="h-4 w-4" /></Button></TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
