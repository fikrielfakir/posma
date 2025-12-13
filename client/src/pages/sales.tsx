import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Eye, FileText, Check, X, Receipt, CreditCard, Banknote, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useApp } from "@/contexts/AppContext";
import { formatCurrency, formatDate } from "@/lib/i18n";
import type { Sale, Customer, Warehouse } from "@shared/schema";

interface SaleWithDetails extends Sale {
  customer?: Customer;
  warehouse?: Warehouse;
}

const statusConfig: Record<string, { variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { variant: "outline" },
  confirmed: { variant: "secondary" },
  paid: { variant: "default" },
  partial_paid: { variant: "secondary" },
  pending: { variant: "secondary" },
  cancelled: { variant: "destructive" },
};

const paymentIcons: Record<string, any> = {
  cash: Banknote,
  card: CreditCard,
  transfer: Receipt,
  check: FileText,
};

export default function Sales() {
  const { t, currency, language } = useApp();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    customerId: "",
    warehouseId: "",
    saleDate: "",
    paymentMethod: "",
  });

  const { data: sales = [], isLoading } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: warehouses = [] } = useQuery<Warehouse[]>({
    queryKey: ["/api/warehouses"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { customerId: string; warehouseId: string; saleDate?: string; paymentMethod?: string }) => {
      const invoiceNumber = `VNT-${new Date().getFullYear()}-${String(sales.length + 1).padStart(4, '0')}`;
      const res = await apiRequest("POST", "/api/sales", {
        ...data,
        invoiceNumber,
        status: "draft",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      toast({ title: t("success"), description: "Vente créée" });
      setIsAddDialogOpen(false);
      setFormData({ customerId: "", warehouseId: "", saleDate: "", paymentMethod: "" });
    },
    onError: () => {
      toast({ title: t("error"), description: "Erreur lors de la création", variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (!formData.customerId || !formData.warehouseId) {
      toast({ title: t("error"), description: "Veuillez remplir les champs obligatoires", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      customerId: formData.customerId,
      warehouseId: formData.warehouseId,
      saleDate: formData.saleDate || undefined,
      paymentMethod: formData.paymentMethod || undefined,
    });
  };

  const getCustomerById = (id: string | null | undefined) => customers.find(c => c.id === id);
  const getWarehouseById = (id: string | null | undefined) => warehouses.find(w => w.id === id);

  const enrichedSales: SaleWithDetails[] = sales.map(s => ({
    ...s,
    customer: getCustomerById(s.customerId),
    warehouse: getWarehouseById(s.warehouseId),
  }));

  const filteredSales = enrichedSales.filter((s) => {
    const matchesSearch = s.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (s.customer?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = sales.filter(s => s.status !== "cancelled").reduce((sum, s) => sum + (Number(s.paidAmount) || 0), 0);
  const pendingAmount = sales.filter(s => ["pending", "partial_paid"].includes(s.status || "")).reduce((sum, s) => sum + ((Number(s.total) || 0) - (Number(s.paidAmount) || 0)), 0);

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
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">{t("sales")}</h1>
          <p className="text-muted-foreground">Gestion des ventes et factures</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-sale"><Plus className="mr-2 h-4 w-4" />{t("newSale")}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouvelle vente</DialogTitle>
              <DialogDescription>Créer une nouvelle facture de vente</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("customer")} *</Label>
                  <Select value={formData.customerId} onValueChange={(v) => setFormData(prev => ({ ...prev, customerId: v }))}>
                    <SelectTrigger data-testid="select-sale-customer"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {customers.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("warehouse")} *</Label>
                  <Select value={formData.warehouseId} onValueChange={(v) => setFormData(prev => ({ ...prev, warehouseId: v }))}>
                    <SelectTrigger data-testid="select-sale-warehouse"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
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
                  <Label>{t("saleDate")}</Label>
                  <Input type="date" value={formData.saleDate} onChange={(e) => setFormData(prev => ({ ...prev, saleDate: e.target.value }))} data-testid="input-sale-date" />
                </div>
                <div className="space-y-2">
                  <Label>{t("paymentMethod")}</Label>
                  <Select value={formData.paymentMethod} onValueChange={(v) => setFormData(prev => ({ ...prev, paymentMethod: v }))}>
                    <SelectTrigger data-testid="select-payment-method"><SelectValue placeholder="Mode" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">{t("cash")}</SelectItem>
                      <SelectItem value="card">{t("card")}</SelectItem>
                      <SelectItem value="transfer">{t("bankTransfer")}</SelectItem>
                      <SelectItem value="check">{t("check")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>{t("cancel")}</Button>
              <Button onClick={handleSave} disabled={createMutation.isPending} data-testid="button-save-sale">
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{t("revenue")} ({t("thisMonth")})</p><p className="text-2xl font-bold text-chart-2">{formatCurrency(totalRevenue, currency)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Montant en attente</p><p className="text-2xl font-bold text-chart-3">{formatCurrency(pendingAmount, currency)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Factures ce mois</p><p className="text-2xl font-bold">{sales.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="search" placeholder={`${t("search")} facture...`} className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} data-testid="input-search-sales" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" data-testid="select-sale-status"><SelectValue placeholder={t("status")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("status")}</SelectItem>
                <SelectItem value="paid">{t("paid")}</SelectItem>
                <SelectItem value="pending">{t("pending")}</SelectItem>
                <SelectItem value="partial_paid">Paiement partiel</SelectItem>
                <SelectItem value="cancelled">{t("cancelled")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("invoiceNumber")}</TableHead>
                  <TableHead>{t("customer")}</TableHead>
                  <TableHead>{t("warehouse")}</TableHead>
                  <TableHead>{t("saleDate")}</TableHead>
                  <TableHead className="text-right">{t("total")}</TableHead>
                  <TableHead className="text-right">Payé</TableHead>
                  <TableHead>{t("paymentMethod")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                      Aucune vente trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => {
                    const config = statusConfig[sale.status || "draft"];
                    const PaymentIcon = sale.paymentMethod ? paymentIcons[sale.paymentMethod] : null;
                    const total = Number(sale.total) || 0;
                    const paidAmount = Number(sale.paidAmount) || 0;
                    return (
                      <TableRow key={sale.id} data-testid={`row-sale-${sale.id}`}>
                        <TableCell className="font-mono font-medium">{sale.invoiceNumber}</TableCell>
                        <TableCell>{sale.customer?.name || "-"}</TableCell>
                        <TableCell><Badge variant="outline" size="sm">{sale.warehouse?.name || "-"}</Badge></TableCell>
                        <TableCell className="text-sm">{sale.saleDate ? formatDate(new Date(sale.saleDate), language) : "-"}</TableCell>
                        <TableCell className="text-right font-mono">{formatCurrency(total, currency)}</TableCell>
                        <TableCell className={`text-right font-mono ${paidAmount < total ? "text-chart-3" : "text-chart-2"}`}>{formatCurrency(paidAmount, currency)}</TableCell>
                        <TableCell>{PaymentIcon && <div className="flex items-center gap-2"><PaymentIcon className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{t(sale.paymentMethod || "")}</span></div>}</TableCell>
                        <TableCell><Badge variant={config?.variant || "outline"} size="sm">{t(sale.status || "draft")}</Badge></TableCell>
                        <TableCell><Button variant="ghost" size="icon" data-testid={`button-view-sale-${sale.id}`}><Eye className="h-4 w-4" /></Button></TableCell>
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
