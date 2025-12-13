import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, Download, Eye, Search, Calendar, Filter,
  Loader2, Plus, Building2, User, Printer, Mail
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/contexts/AppContext";
import { formatCurrency } from "@/lib/i18n";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Invoice, Sale, Customer } from "@shared/schema";

const INVOICE_TYPES = [
  { value: "standard", label: "Facture Standard" },
  { value: "proforma", label: "Facture Proforma" },
  { value: "credit_note", label: "Avoir" },
  { value: "advance", label: "Facture d'Acompte" },
];

const INVOICE_STATUS = [
  { value: "draft", label: "Brouillon", color: "bg-gray-500/20 text-gray-700" },
  { value: "issued", label: "Émise", color: "bg-blue-500/20 text-blue-700" },
  { value: "sent", label: "Envoyée", color: "bg-indigo-500/20 text-indigo-700" },
  { value: "paid", label: "Payée", color: "bg-green-500/20 text-green-700" },
  { value: "overdue", label: "En retard", color: "bg-red-500/20 text-red-700" },
  { value: "cancelled", label: "Annulée", color: "bg-gray-500/20 text-gray-700" },
];

export default function Invoices() {
  const { t, currency } = useApp();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [invoiceType, setInvoiceType] = useState("standard");

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const getCustomerName = (id: string | null) => {
    if (!id) return "Client anonyme";
    const customer = customers.find(c => c.id === id);
    return customer?.name || "Client inconnu";
  };

  const getStatusBadge = (status: string | null) => {
    const statusInfo = INVOICE_STATUS.find(s => s.value === status) || INVOICE_STATUS[0];
    return (
      <Badge variant="secondary" className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    );
  };

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const sequence = String(invoices.length + 1).padStart(5, '0');
    return `FAC-${year}-${sequence}`;
  };

  const createInvoiceMutation = useMutation({
    mutationFn: async () => {
      const sale = sales.find(s => s.id === selectedSale);
      if (!sale) throw new Error("Vente non trouvée");
      
      const invoiceNumber = generateInvoiceNumber();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      
      const subtotal = Number(sale.subtotal) || 0;
      const taxAmount = Number(sale.tvaAmount) || 0;
      const total = Number(sale.total) || 0;
      
      const res = await apiRequest("POST", "/api/invoices", {
        saleId: selectedSale,
        customerId: sale.customerId || selectedCustomer || null,
        invoiceType,
        invoiceNumber,
        invoiceDate: new Date().toISOString(),
        dueDate: dueDate.toISOString(),
        status: "issued",
        subtotal: String(subtotal),
        totalTva: String(taxAmount),
        total: String(total),
        currency: currency,
        notes: "Paiement à 30 jours",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({ title: "Succès", description: "Facture créée avec succès" });
      setIsCreateOpen(false);
      setSelectedSale("");
      setSelectedCustomer("");
      setInvoiceType("standard");
    },
    onError: () => {
      toast({ title: "Erreur", description: "Erreur lors de la création", variant: "destructive" });
    },
  });

  const getMoroccanLegalMentions = () => {
    return `Conformément à la législation marocaine:
- ICE: [Numéro ICE de l'entreprise]
- IF: [Identifiant Fiscal]
- RC: [Registre de Commerce]
- Patente: [Numéro de Patente]
- CNSS: [Numéro CNSS]

TVA appliquée selon les taux en vigueur au Maroc.
En cas de retard de paiement, des pénalités de retard seront appliquées conformément à la loi.`;
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewOpen(true);
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    const printContent = generatePrintableInvoice(invoice);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generatePrintableInvoice = (invoice: Invoice) => {
    const customer = customers.find(c => c.id === invoice.customerId);
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Facture ${invoice.invoiceNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .company { font-size: 20px; font-weight: bold; }
    .invoice-title { font-size: 28px; font-weight: bold; color: #333; }
    .invoice-number { color: #666; margin-top: 5px; }
    .section { margin-bottom: 30px; }
    .section-title { font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .info-label { color: #666; }
    .info-value { font-weight: 500; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f5f5f5; }
    .totals { margin-top: 20px; text-align: right; }
    .totals-row { display: flex; justify-content: flex-end; gap: 40px; padding: 5px 0; }
    .totals-label { color: #666; }
    .totals-value { font-weight: 500; min-width: 100px; }
    .total-final { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; }
    .legal { margin-top: 40px; font-size: 11px; color: #666; white-space: pre-line; border-top: 1px solid #ddd; padding-top: 20px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company">StockFlow ERP</div>
      <div style="color: #666; font-size: 14px;">
        Adresse de l'entreprise<br>
        Casablanca, Maroc<br>
        Tél: +212 5XX XX XX XX
      </div>
    </div>
    <div style="text-align: right;">
      <div class="invoice-title">FACTURE</div>
      <div class="invoice-number">${invoice.invoiceNumber}</div>
      <div style="margin-top: 10px; color: #666;">
        Date: ${invoice.invoiceDate ? format(new Date(invoice.invoiceDate), "dd/MM/yyyy") : '-'}
      </div>
    </div>
  </div>
  
  <div class="grid">
    <div class="section">
      <div class="section-title">Facturer à</div>
      <div style="font-weight: 500;">${customer?.name || 'Client anonyme'}</div>
      <div style="color: #666;">
        ${customer?.address || ''}<br>
        ${customer?.city || ''}<br>
        ICE: ${customer?.ice || '-'}<br>
        IF: ${customer?.if || '-'}
      </div>
    </div>
    <div class="section">
      <div class="section-title">Détails de la facture</div>
      <div class="info-row">
        <span class="info-label">Type:</span>
        <span class="info-value">${INVOICE_TYPES.find(t => t.value === invoice.invoiceType)?.label || 'Standard'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Échéance:</span>
        <span class="info-value">${invoice.dueDate ? format(new Date(invoice.dueDate), "dd/MM/yyyy") : '-'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Statut:</span>
        <span class="info-value">${INVOICE_STATUS.find(s => s.value === invoice.status)?.label || 'Brouillon'}</span>
      </div>
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">Montants</div>
    <div class="totals">
      <div class="totals-row">
        <span class="totals-label">Sous-total HT:</span>
        <span class="totals-value">${formatCurrency(Number(invoice.subtotal) || 0, invoice.currency || 'MAD')}</span>
      </div>
      <div class="totals-row">
        <span class="totals-label">TVA (20%):</span>
        <span class="totals-value">${formatCurrency(Number(invoice.totalTva) || 0, invoice.currency || 'MAD')}</span>
      </div>
      <div class="totals-row total-final">
        <span class="totals-label">Total TTC:</span>
        <span class="totals-value">${formatCurrency(Number(invoice.total) || 0, invoice.currency || 'MAD')}</span>
      </div>
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">Conditions de paiement</div>
    <div>${invoice.notes || 'Paiement à 30 jours'}</div>
  </div>
  
  <div class="legal">
    ${getMoroccanLegalMentions()}
  </div>
</body>
</html>`;
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = !searchTerm || 
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCustomerName(invoice.customerId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || invoice.invoiceType === filterType;
    const matchesStatus = filterStatus === "all" || invoice.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const pendingSales = sales.filter(sale => 
    !invoices.some(inv => inv.saleId === sale.id)
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Factures</h1>
          <p className="text-muted-foreground">Gestion des factures conformes à la législation marocaine</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-invoice">
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle facture
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold" data-testid="text-total-invoices">{invoices.length}</div>
                <div className="text-sm text-muted-foreground">Total factures</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-2">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold" data-testid="text-paid-invoices">
                  {invoices.filter(i => i.status === "paid").length}
                </div>
                <div className="text-sm text-muted-foreground">Payées</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-500/10 p-2">
                <FileText className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold" data-testid="text-pending-invoices">
                  {invoices.filter(i => i.status === "issued" || i.status === "sent").length}
                </div>
                <div className="text-sm text-muted-foreground">En attente</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-500/10 p-2">
                <FileText className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold" data-testid="text-overdue-invoices">
                  {invoices.filter(i => i.status === "overdue").length}
                </div>
                <div className="text-sm text-muted-foreground">En retard</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Liste des factures
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-[200px]"
                  data-testid="input-search-invoices"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]" data-testid="select-filter-type">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {INVOICE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]" data-testid="select-filter-status">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {INVOICE_STATUS.map(status => (
                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mb-2" />
              <span>Aucune facture trouvée</span>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead>Montant TTC</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map(invoice => (
                    <TableRow key={invoice.id} data-testid={`row-invoice-${invoice.id}`}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{getCustomerName(invoice.customerId)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {INVOICE_TYPES.find(t => t.value === invoice.invoiceType)?.label || 'Standard'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {invoice.invoiceDate ? format(new Date(invoice.invoiceDate), "dd/MM/yyyy", { locale: fr }) : '-'}
                      </TableCell>
                      <TableCell>
                        {invoice.dueDate ? format(new Date(invoice.dueDate), "dd/MM/yyyy", { locale: fr }) : '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(Number(invoice.total) || 0, invoice.currency || currency)}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleViewInvoice(invoice)}
                            data-testid={`button-view-invoice-${invoice.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost"
                            onClick={() => handlePrintInvoice(invoice)}
                            data-testid={`button-print-invoice-${invoice.id}`}
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Créer une facture</DialogTitle>
            <DialogDescription>
              Générez une facture conforme à la législation marocaine
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Vente associée</Label>
              <Select value={selectedSale} onValueChange={setSelectedSale}>
                <SelectTrigger data-testid="select-sale">
                  <SelectValue placeholder="Sélectionner une vente" />
                </SelectTrigger>
                <SelectContent>
                  {pendingSales.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">Aucune vente sans facture</div>
                  ) : (
                    pendingSales.map(sale => (
                      <SelectItem key={sale.id} value={sale.id}>
                        {sale.invoiceNumber} - {formatCurrency(Number(sale.total) || 0, currency)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type de facture</Label>
              <Select value={invoiceType} onValueChange={setInvoiceType}>
                <SelectTrigger data-testid="select-invoice-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVOICE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Client (optionnel)</Label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger data-testid="select-customer">
                  <SelectValue placeholder="Utiliser le client de la vente" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <div className="font-medium mb-1">Mentions légales marocaines</div>
              <div className="text-muted-foreground text-xs">
                La facture inclura automatiquement les mentions obligatoires:
                ICE, IF, RC, Patente, CNSS, et conditions de TVA.
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={() => createInvoiceMutation.mutate()}
              disabled={createInvoiceMutation.isPending || !selectedSale}
              data-testid="button-confirm-create"
            >
              {createInvoiceMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer la facture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Facture {selectedInvoice?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Émetteur</span>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">StockFlow ERP</div>
                    <div className="text-muted-foreground">
                      Adresse de l'entreprise<br />
                      Casablanca, Maroc
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Client</span>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">{getCustomerName(selectedInvoice.customerId)}</div>
                    {selectedInvoice.customerId && (
                      <div className="text-muted-foreground">
                        {customers.find(c => c.id === selectedInvoice.customerId)?.address || ''}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <div className="text-sm text-muted-foreground">Type</div>
                  <div className="font-medium">
                    {INVOICE_TYPES.find(t => t.value === selectedInvoice.invoiceType)?.label || 'Standard'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Date d'émission</div>
                  <div className="font-medium">
                    {selectedInvoice.invoiceDate ? format(new Date(selectedInvoice.invoiceDate), "dd MMMM yyyy", { locale: fr }) : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Échéance</div>
                  <div className="font-medium">
                    {selectedInvoice.dueDate ? format(new Date(selectedInvoice.dueDate), "dd MMMM yyyy", { locale: fr }) : '-'}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sous-total HT</span>
                    <span>{formatCurrency(Number(selectedInvoice.subtotal) || 0, selectedInvoice.currency || currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TVA (20%)</span>
                    <span>{formatCurrency(Number(selectedInvoice.totalTva) || 0, selectedInvoice.currency || currency)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total TTC</span>
                    <span>{formatCurrency(Number(selectedInvoice.total) || 0, selectedInvoice.currency || currency)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>{getStatusBadge(selectedInvoice.status)}</div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handlePrintInvoice(selectedInvoice)}>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimer
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
