import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Package,
  Grid3X3,
  List,
  Barcode,
  Upload,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/contexts/AppContext";
import { formatCurrency, formatNumber } from "@/lib/i18n";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Product, InsertProduct } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const categories = ["Alimentaire", "Cosmetique", "Artisanat", "Textile"];
const units = ["piece", "kg", "g", "L", "mL", "carton", "palette", "m", "m2", "lot"];
const tvaRates = [0, 7, 10, 14, 20];

export default function Products() {
  const { t, currency } = useApp();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      sku: "",
      name: "",
      nameFr: "",
      barcode: "",
      description: "",
      unit: "piece",
      purchasePrice: "0",
      sellingPrice: "0",
      tvaRate: "20",
      minStock: 0,
      maxStock: 1000,
      isActive: true,
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      const res = await apiRequest("POST", "/api/products", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({ title: "Produit cree avec succes" });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Produit supprime" });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertProduct) => {
    createProductMutation.mutate(data);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.barcode && product.barcode.includes(searchQuery));
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const getStockBadge = (product: Product) => {
    return <Badge variant="outline" size="sm">{product.isActive ? t("active") : t("inactive")}</Badge>;
  };

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
        <p className="text-destructive">Erreur de chargement des produits</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/products"] })}>
          Reessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">
            {t("products")}
          </h1>
          <p className="text-muted-foreground">
            {formatNumber(products.length)} {t("activeProducts")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" data-testid="button-import">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" data-testid="button-export">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-product">
                <Plus className="mr-2 h-4 w-4" />
                {t("newProduct")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("newProduct")}</DialogTitle>
                <DialogDescription>
                  Ajouter un nouveau produit au catalogue
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("sku")} *</FormLabel>
                          <FormControl>
                            <Input placeholder="PRD-XXX" data-testid="input-sku" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="barcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("barcode")}</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input placeholder="EAN13" data-testid="input-barcode" {...field} value={field.value || ""} />
                            </FormControl>
                            <Button type="button" variant="outline" size="icon">
                              <Barcode className="h-4 w-4" />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("name")} *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom du produit" data-testid="input-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("unit")}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || "piece"}>
                            <FormControl>
                              <SelectTrigger data-testid="select-unit">
                                <SelectValue placeholder={t("unit")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {units.map((unit) => (
                                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tvaRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("tva")} %</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value?.toString() || "20"}>
                            <FormControl>
                              <SelectTrigger data-testid="select-tva">
                                <SelectValue placeholder="TVA" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {tvaRates.map((rate) => (
                                <SelectItem key={rate} value={rate.toString()}>{rate}%</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="purchasePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("purchasePrice")}</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" data-testid="input-purchase-price" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sellingPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("sellingPrice")}</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" data-testid="input-selling-price" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="minStock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("minStock")}</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" data-testid="input-min-stock" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxStock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("maxStock")}</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="1000" data-testid="input-max-stock" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 1000)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("description")}</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Description du produit" data-testid="input-description" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      {t("cancel")}
                    </Button>
                    <Button type="submit" disabled={createProductMutation.isPending} data-testid="button-save-product">
                      {createProductMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t("save")}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1 md:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={`${t("search")} SKU, nom, code-barres...`}
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-products"
                />
              </div>
              <Button variant="outline" size="icon" data-testid="button-filters">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-1 rounded-lg border p-1">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                data-testid="button-view-list"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                data-testid="button-view-grid"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">{searchQuery ? "Aucun produit trouve" : "Aucun produit"}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery ? "Modifiez votre recherche" : "Commencez par ajouter votre premier produit"}
              </p>
            </div>
          ) : viewMode === "list" ? (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">{t("sku")}</TableHead>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead className="text-right">{t("purchasePrice")}</TableHead>
                    <TableHead className="text-right">{t("sellingPrice")}</TableHead>
                    <TableHead>{t("unit")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map((product) => (
                    <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            {product.barcode && <p className="text-xs text-muted-foreground">{product.barcode}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(parseFloat(product.purchasePrice || "0"), currency)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(parseFloat(product.sellingPrice || "0"), currency)}
                      </TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell>{getStockBadge(product)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-actions-${product.id}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Voir details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              {t("edit")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => deleteProductMutation.mutate(product.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t("delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedProducts.map((product) => (
                <Card key={product.id} className="hover-elevate" data-testid={`card-product-${product.id}`}>
                  <CardContent className="p-4">
                    <div className="relative mb-3 flex aspect-square items-center justify-center rounded-lg bg-muted">
                      <Package className="h-12 w-12 text-muted-foreground" />
                      <div className="absolute right-2 top-2">
                        {getStockBadge(product)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
                      <h3 className="font-medium leading-tight">{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{product.unit}</span>
                        <span className="font-semibold">{formatCurrency(parseFloat(product.sellingPrice || "0"), currency)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t mt-4">
              <p className="text-sm text-muted-foreground">
                Affichage {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProducts.length)} sur {filteredProducts.length}
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
