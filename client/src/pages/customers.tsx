import { useState } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Mail, Building, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/contexts/AppContext";
import { formatCurrency, formatNumber } from "@/lib/i18n";

const mockCustomers = [
  { id: "1", code: "CLI-001", name: "Souk Marrakech", contactName: "Hassan Alami", email: "hassan@soukmarrakech.ma", phone: "+212 524 123 456", city: "Marrakech", ice: "002345678901234", creditLimit: 50000, currentBalance: 15750, isActive: true },
  { id: "2", code: "CLI-002", name: "Riad Fès", contactName: "Nadia Benjelloun", email: "nadia@riadfes.ma", phone: "+212 535 987 654", city: "Fès", ice: "002345678901235", creditLimit: 30000, currentBalance: 8900, isActive: true },
  { id: "3", code: "CLI-003", name: "Boutique Essaouira", contactName: "Karim Tazi", email: "karim@boutiqueessaouira.ma", phone: "+212 524 456 789", city: "Essaouira", ice: "002345678901236", creditLimit: 25000, currentBalance: 0, isActive: true },
  { id: "4", code: "CLI-004", name: "Hotel Atlas", contactName: "Leila Idrissi", email: "achats@hotelatlas.ma", phone: "+212 522 111 222", city: "Casablanca", ice: "002345678901237", creditLimit: 100000, currentBalance: 45000, isActive: true },
];

export default function Customers() {
  const { t, currency } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredCustomers = mockCustomers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">{t("customers")}</h1>
          <p className="text-muted-foreground">{formatNumber(mockCustomers.length)} clients enregistrés</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-customer"><Plus className="mr-2 h-4 w-4" />Nouveau client</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouveau client</DialogTitle>
              <DialogDescription>Ajouter un nouveau client au système</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>{t("code")} *</Label><Input placeholder="CLI-XXX" /></div>
                <div className="space-y-2"><Label>{t("name")} *</Label><Input placeholder="Nom du client" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Contact</Label><Input placeholder="Nom du contact" /></div>
                <div className="space-y-2"><Label>{t("phone")}</Label><Input placeholder="+212 5XX XXX XXX" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>{t("email")}</Label><Input type="email" placeholder="email@example.ma" /></div>
                <div className="space-y-2"><Label>{t("city")}</Label><Input placeholder="Ville" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>{t("ice")}</Label><Input placeholder="ICE" /></div>
                <div className="space-y-2"><Label>{t("creditLimit")}</Label><Input type="number" placeholder="0" /></div>
              </div>
              <div className="space-y-2"><Label>{t("address")}</Label><Textarea placeholder="Adresse complète" /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>{t("cancel")}</Button>
              <Button>{t("save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader className="pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder={`${t("search")} client...`} className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} data-testid="input-search-customers" />
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
                  <TableHead className="text-right">{t("creditLimit")}</TableHead>
                  <TableHead className="text-right">{t("currentBalance")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} data-testid={`row-customer-${customer.id}`}>
                    <TableCell className="font-mono text-sm">{customer.code}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"><Building className="h-5 w-5 text-muted-foreground" /></div>
                        <div><p className="font-medium">{customer.name}</p><p className="text-xs text-muted-foreground">{customer.ice}</p></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm">{customer.contactName}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{customer.email}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" size="sm">{customer.city}</Badge></TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(customer.creditLimit, currency)}</TableCell>
                    <TableCell className={`text-right font-mono ${customer.currentBalance > customer.creditLimit * 0.8 ? "text-destructive" : ""}`}>
                      {formatCurrency(customer.currentBalance, currency)}
                    </TableCell>
                    <TableCell><Badge variant={customer.isActive ? "default" : "secondary"} size="sm">{customer.isActive ? t("active") : t("inactive")}</Badge></TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
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
