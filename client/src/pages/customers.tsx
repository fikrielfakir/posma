import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Mail, Building, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/contexts/AppContext";
import { formatCurrency, formatNumber } from "@/lib/i18n";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Customer, InsertCustomer } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCustomerSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function Customers() {
  const { t, currency } = useApp();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data: customers = [], isLoading, error } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const form = useForm<InsertCustomer>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      code: "",
      name: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      ice: "",
      creditLimit: "0",
      currentBalance: "0",
      paymentTerms: 30,
      isActive: true,
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (data: InsertCustomer) => {
      const res = await apiRequest("POST", "/api/customers", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({ title: "Client cree avec succes" });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ title: "Client supprime" });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertCustomer) => {
    createCustomerMutation.mutate(data);
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <p className="text-destructive">Erreur de chargement des clients</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/customers"] })}>
          Reessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">{t("customers")}</h1>
          <p className="text-muted-foreground">{formatNumber(customers.length)} clients enregistres</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-customer"><Plus className="mr-2 h-4 w-4" />Nouveau client</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouveau client</DialogTitle>
              <DialogDescription>Ajouter un nouveau client au systeme</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("code")} *</FormLabel>
                        <FormControl>
                          <Input placeholder="CLI-XXX" data-testid="input-customer-code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("name")} *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom du client" data-testid="input-customer-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom du contact" data-testid="input-customer-contact" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("phone")}</FormLabel>
                        <FormControl>
                          <Input placeholder="+212 5XX XXX XXX" data-testid="input-customer-phone" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("email")}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@example.ma" data-testid="input-customer-email" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("city")}</FormLabel>
                        <FormControl>
                          <Input placeholder="Ville" data-testid="input-customer-city" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("ice")}</FormLabel>
                        <FormControl>
                          <Input placeholder="ICE" data-testid="input-customer-ice" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="creditLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("creditLimit")}</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0" data-testid="input-customer-credit-limit" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("address")}</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Adresse complete" data-testid="input-customer-address" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>{t("cancel")}</Button>
                  <Button type="submit" disabled={createCustomerMutation.isPending} data-testid="button-save-customer">
                    {createCustomerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t("save")}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
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
          {filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">{searchQuery ? "Aucun client trouve" : "Aucun client"}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery ? "Modifiez votre recherche" : "Commencez par ajouter votre premier client"}
              </p>
            </div>
          ) : (
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
                  {paginatedCustomers.map((customer) => (
                    <TableRow key={customer.id} data-testid={`row-customer-${customer.id}`}>
                      <TableCell className="font-mono text-sm">{customer.code}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <Building className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            {customer.ice && <p className="text-xs text-muted-foreground">{customer.ice}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm">{customer.contactName || "-"}</p>
                          {customer.email && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />{customer.email}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.city ? <Badge variant="outline" size="sm">{customer.city}</Badge> : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(parseFloat(customer.creditLimit || "0"), currency)}
                      </TableCell>
                      <TableCell className={`text-right font-mono ${parseFloat(customer.currentBalance || "0") > parseFloat(customer.creditLimit || "0") * 0.8 ? "text-destructive" : ""}`}>
                        {formatCurrency(parseFloat(customer.currentBalance || "0"), currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={customer.isActive ? "default" : "secondary"} size="sm">
                          {customer.isActive ? t("active") : t("inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />Voir details</DropdownMenuItem>
                            <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />{t("edit")}</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => deleteCustomerMutation.mutate(customer.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />{t("delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t mt-4">
              <p className="text-sm text-muted-foreground">
                Affichage {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredCustomers.length)} sur {filteredCustomers.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  data-testid="button-prev-page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">Page {currentPage} / {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  data-testid="button-next-page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
