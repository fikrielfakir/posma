import { useState } from "react";
import { Plus, Search, Eye, FileText, Check, X, Receipt, CreditCard, Banknote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useApp } from "@/contexts/AppContext";
import { formatCurrency, formatDate, formatNumber } from "@/lib/i18n";

const mockSales = [
  { id: "1", invoiceNumber: "VNT-2024-0156", customer: "Souk Marrakech", warehouse: "Casablanca Central", status: "paid", saleDate: new Date("2024-12-13"), total: 15750, paidAmount: 15750, paymentMethod: "cash" },
  { id: "2", invoiceNumber: "VNT-2024-0155", customer: "Riad Fès", warehouse: "Casablanca Central", status: "pending", saleDate: new Date("2024-12-12"), total: 8900, paidAmount: 0, paymentMethod: null },
  { id: "3", invoiceNumber: "VNT-2024-0154", customer: "Hotel Atlas", warehouse: "Rabat Nord", status: "partial_paid", saleDate: new Date("2024-12-11"), total: 45000, paidAmount: 20000, paymentMethod: "transfer" },
  { id: "4", invoiceNumber: "VNT-2024-0153", customer: "Boutique Essaouira", warehouse: "Marrakech Sud", status: "paid", saleDate: new Date("2024-12-10"), total: 12300, paidAmount: 12300, paymentMethod: "card" },
  { id: "5", invoiceNumber: "VNT-2024-0152", customer: "Souk Marrakech", warehouse: "Casablanca Central", status: "cancelled", saleDate: new Date("2024-12-09"), total: 5600, paidAmount: 0, paymentMethod: null },
];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredSales = mockSales.filter((s) => {
    const matchesSearch = s.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) || s.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = mockSales.filter(s => s.status !== "cancelled").reduce((sum, s) => sum + s.paidAmount, 0);
  const pendingAmount = mockSales.filter(s => ["pending", "partial_paid"].includes(s.status)).reduce((sum, s) => sum + (s.total - s.paidAmount), 0);

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
                <div className="space-y-2"><Label>{t("customer")} *</Label><Select><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent><SelectItem value="1">Souk Marrakech</SelectItem><SelectItem value="2">Riad Fès</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>{t("warehouse")} *</Label><Select><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent><SelectItem value="1">Casablanca Central</SelectItem><SelectItem value="2">Rabat Nord</SelectItem></SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>{t("saleDate")}</Label><Input type="date" /></div>
                <div className="space-y-2"><Label>{t("paymentMethod")}</Label><Select><SelectTrigger><SelectValue placeholder="Mode" /></SelectTrigger><SelectContent><SelectItem value="cash">{t("cash")}</SelectItem><SelectItem value="card">{t("card")}</SelectItem><SelectItem value="transfer">{t("bankTransfer")}</SelectItem><SelectItem value="check">{t("check")}</SelectItem></SelectContent></Select></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>{t("cancel")}</Button>
              <Button>{t("save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{t("revenue")} ({t("thisMonth")})</p><p className="text-2xl font-bold text-chart-2">{formatCurrency(totalRevenue, currency)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Montant en attente</p><p className="text-2xl font-bold text-chart-3">{formatCurrency(pendingAmount, currency)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Factures ce mois</p><p className="text-2xl font-bold">{mockSales.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="search" placeholder={`${t("search")} facture...`} className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} data-testid="input-search-sales" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder={t("status")} /></SelectTrigger>
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
                {filteredSales.map((sale) => {
                  const config = statusConfig[sale.status];
                  const PaymentIcon = sale.paymentMethod ? paymentIcons[sale.paymentMethod] : null;
                  return (
                    <TableRow key={sale.id} data-testid={`row-sale-${sale.id}`}>
                      <TableCell className="font-mono font-medium">{sale.invoiceNumber}</TableCell>
                      <TableCell>{sale.customer}</TableCell>
                      <TableCell><Badge variant="outline" size="sm">{sale.warehouse}</Badge></TableCell>
                      <TableCell className="text-sm">{formatDate(sale.saleDate, language)}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(sale.total, currency)}</TableCell>
                      <TableCell className={`text-right font-mono ${sale.paidAmount < sale.total ? "text-chart-3" : "text-chart-2"}`}>{formatCurrency(sale.paidAmount, currency)}</TableCell>
                      <TableCell>{PaymentIcon && <div className="flex items-center gap-2"><PaymentIcon className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{t(sale.paymentMethod || "")}</span></div>}</TableCell>
                      <TableCell><Badge variant={config.variant} size="sm">{t(sale.status)}</Badge></TableCell>
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
