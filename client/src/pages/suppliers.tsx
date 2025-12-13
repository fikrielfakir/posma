import { useState } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Phone, Mail, MapPin, Building } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/contexts/AppContext";
import { formatNumber } from "@/lib/i18n";

const mockSuppliers = [
  { id: "1", code: "FRN-001", name: "Coopérative Atlas", contactName: "Ahmed Bennani", email: "contact@atlas-coop.ma", phone: "+212 522 123 456", city: "Fès", ice: "001234567890012", paymentTerms: 30, isActive: true, ordersCount: 45 },
  { id: "2", code: "FRN-002", name: "Ferme Bio Agadir", contactName: "Fatima Zahra", email: "info@fermebio.ma", phone: "+212 528 987 654", city: "Agadir", ice: "001234567890013", paymentTerms: 15, isActive: true, ordersCount: 28 },
  { id: "3", code: "FRN-003", name: "Artisanat Marrakech", contactName: "Youssef El Idrissi", email: "ventes@artisanat-mk.ma", phone: "+212 524 456 789", city: "Marrakech", ice: "001234567890014", paymentTerms: 45, isActive: true, ordersCount: 19 },
  { id: "4", code: "FRN-004", name: "Huiles du Souss", contactName: "Khadija Amrani", email: "export@huilessouss.ma", phone: "+212 528 111 222", city: "Taroudant", ice: "001234567890015", paymentTerms: 30, isActive: false, ordersCount: 12 },
];

export default function Suppliers() {
  const { t } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredSuppliers = mockSuppliers.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">{t("suppliers")}</h1>
          <p className="text-muted-foreground">{formatNumber(mockSuppliers.length)} fournisseurs enregistrés</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-supplier"><Plus className="mr-2 h-4 w-4" />Nouveau fournisseur</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouveau fournisseur</DialogTitle>
              <DialogDescription>Ajouter un nouveau fournisseur au système</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>{t("code")} *</Label><Input placeholder="FRN-XXX" data-testid="input-supplier-code" /></div>
                <div className="space-y-2"><Label>{t("name")} *</Label><Input placeholder="Nom du fournisseur" data-testid="input-supplier-name" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Contact</Label><Input placeholder="Nom du contact" data-testid="input-supplier-contact" /></div>
                <div className="space-y-2"><Label>{t("phone")}</Label><Input placeholder="+212 5XX XXX XXX" data-testid="input-supplier-phone" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>{t("email")}</Label><Input type="email" placeholder="email@example.ma" data-testid="input-supplier-email" /></div>
                <div className="space-y-2"><Label>{t("city")}</Label><Input placeholder="Ville" data-testid="input-supplier-city" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>{t("ice")}</Label><Input placeholder="ICE" data-testid="input-supplier-ice" /></div>
                <div className="space-y-2"><Label>{t("paymentTerms")} ({t("days")})</Label><Input type="number" placeholder="30" data-testid="input-supplier-terms" /></div>
              </div>
              <div className="space-y-2"><Label>{t("address")}</Label><Textarea placeholder="Adresse complète" data-testid="input-supplier-address" /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>{t("cancel")}</Button>
              <Button data-testid="button-save-supplier">{t("save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader className="pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder={`${t("search")} fournisseur...`} className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} data-testid="input-search-suppliers" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("code")}</TableHead>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>{t("city")}</TableHead>
                  <TableHead>{t("paymentTerms")}</TableHead>
                  <TableHead>Commandes</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id} data-testid={`row-supplier-${supplier.id}`}>
                    <TableCell className="font-mono text-sm">{supplier.code}</TableCell>
                    <TableCell><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"><Building className="h-5 w-5 text-muted-foreground" /></div><div><p className="font-medium">{supplier.name}</p><p className="text-xs text-muted-foreground">{supplier.ice}</p></div></div></TableCell>
                    <TableCell><div className="space-y-1"><p className="text-sm">{supplier.contactName}</p><p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{supplier.email}</p></div></TableCell>
                    <TableCell><Badge variant="outline" size="sm">{supplier.city}</Badge></TableCell>
                    <TableCell>{supplier.paymentTerms} {t("days")}</TableCell>
                    <TableCell className="font-mono">{supplier.ordersCount}</TableCell>
                    <TableCell><Badge variant={supplier.isActive ? "default" : "secondary"} size="sm">{supplier.isActive ? t("active") : t("inactive")}</Badge></TableCell>
                    <TableCell>
                      <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />Voir détails</DropdownMenuItem>
                          <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />{t("edit")}</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />{t("delete")}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
