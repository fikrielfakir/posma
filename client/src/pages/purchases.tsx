import { useState } from "react";
import { Plus, Search, Eye, FileText, Truck, Check, X, ShoppingCart } from "lucide-react";
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
import { formatCurrency, formatDate, formatNumber } from "@/lib/i18n";

const mockPurchases = [
  { id: "1", orderNumber: "ACH-2024-0089", supplier: "Coopérative Atlas", warehouse: "Casablanca Central", status: "received", orderDate: new Date("2024-12-10"), expectedDate: new Date("2024-12-13"), total: 45200, currency: "MAD", itemsCount: 5 },
  { id: "2", orderNumber: "ACH-2024-0088", supplier: "Ferme Bio Agadir", warehouse: "Casablanca Central", status: "ordered", orderDate: new Date("2024-12-08"), expectedDate: new Date("2024-12-15"), total: 23500, currency: "MAD", itemsCount: 3 },
  { id: "3", orderNumber: "ACH-2024-0087", supplier: "Artisanat Marrakech", warehouse: "Marrakech Sud", status: "partial_received", orderDate: new Date("2024-12-05"), expectedDate: new Date("2024-12-12"), total: 18900, currency: "MAD", itemsCount: 8 },
  { id: "4", orderNumber: "ACH-2024-0086", supplier: "Huiles du Souss", warehouse: "Rabat Nord", status: "pending_approval", orderDate: new Date("2024-12-12"), expectedDate: new Date("2024-12-20"), total: 67800, currency: "MAD", itemsCount: 4 },
  { id: "5", orderNumber: "ACH-2024-0085", supplier: "Coopérative Atlas", warehouse: "Casablanca Central", status: "draft", orderDate: new Date("2024-12-13"), expectedDate: null, total: 12400, currency: "MAD", itemsCount: 2 },
];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredPurchases = mockPurchases.filter((p) => {
    const matchesSearch = p.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) || p.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: mockPurchases.length,
    pending: mockPurchases.filter(p => ["draft", "pending_approval"].includes(p.status)).length,
    inProgress: mockPurchases.filter(p => ["ordered", "partial_received"].includes(p.status)).length,
    completed: mockPurchases.filter(p => p.status === "received").length,
  };

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
                <div className="space-y-2"><Label>{t("supplier")} *</Label><Select><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent><SelectItem value="1">Coopérative Atlas</SelectItem><SelectItem value="2">Ferme Bio Agadir</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>{t("warehouse")} *</Label><Select><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent><SelectItem value="1">Casablanca Central</SelectItem><SelectItem value="2">Rabat Nord</SelectItem></SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>{t("orderDate")}</Label><Input type="date" data-testid="input-order-date" /></div>
                <div className="space-y-2"><Label>{t("expectedDate")}</Label><Input type="date" data-testid="input-expected-date" /></div>
              </div>
              <div className="space-y-2"><Label>{t("notes")}</Label><Textarea placeholder="Notes de la commande" /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>{t("cancel")}</Button>
              <Button>{t("save")}</Button>
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
              <SelectTrigger className="w-40"><SelectValue placeholder={t("status")} /></SelectTrigger>
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
                {filteredPurchases.map((po) => {
                  const config = statusConfig[po.status];
                  return (
                    <TableRow key={po.id} data-testid={`row-purchase-${po.id}`}>
                      <TableCell className="font-mono font-medium">{po.orderNumber}</TableCell>
                      <TableCell>{po.supplier}</TableCell>
                      <TableCell><Badge variant="outline" size="sm">{po.warehouse}</Badge></TableCell>
                      <TableCell className="text-sm">{formatDate(po.orderDate, language)}</TableCell>
                      <TableCell className="text-sm">{po.expectedDate ? formatDate(po.expectedDate, language) : "-"}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(po.total, currency)}</TableCell>
                      <TableCell><Badge variant={config.variant} size="sm">{t(po.status)}</Badge></TableCell>
                      <TableCell><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
