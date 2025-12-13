import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Plus,
  ArrowRightLeft,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Download,
  Loader2,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/contexts/AppContext";
import { formatCurrency, formatNumber, formatDateTime } from "@/lib/i18n";
import type { Stock, StockMovement, Warehouse, Product } from "@shared/schema";

interface StockWithDetails extends Stock {
  product?: Product;
  warehouse?: Warehouse;
}

interface StockMovementWithDetails extends StockMovement {
  product?: Product;
  warehouse?: Warehouse;
}

const movementReasons = ["purchase", "sale", "return_client", "return_supplier", "loss", "damage", "sample", "gift", "inventory_adjustment"];

export default function StockPage() {
  const { t, currency, language } = useApp();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [movementType, setMovementType] = useState<"entry" | "exit" | "transfer">("entry");
  
  const [formData, setFormData] = useState({
    productId: "",
    warehouseId: "",
    destinationWarehouseId: "",
    quantity: "",
    reason: "",
    notes: "",
  });

  const { data: stockData = [], isLoading: isLoadingStock } = useQuery<StockWithDetails[]>({
    queryKey: ["/api/stock"],
  });

  const { data: movements = [], isLoading: isLoadingMovements } = useQuery<StockMovementWithDetails[]>({
    queryKey: ["/api/stock-movements"],
  });

  const { data: warehouses = [] } = useQuery<Warehouse[]>({
    queryKey: ["/api/warehouses"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const createMovementMutation = useMutation({
    mutationFn: async (data: {
      productId: string;
      warehouseId: string;
      type: string;
      reason?: string;
      quantity: string;
      notes?: string;
    }) => {
      const res = await apiRequest("POST", "/api/stock-movements", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stock"] });
      toast({ title: t("success"), description: "Mouvement enregistré" });
      setIsMovementDialogOpen(false);
      setFormData({
        productId: "",
        warehouseId: "",
        destinationWarehouseId: "",
        quantity: "",
        reason: "",
        notes: "",
      });
    },
    onError: () => {
      toast({ title: t("error"), description: "Erreur lors de l'enregistrement", variant: "destructive" });
    },
  });

  const handleSaveMovement = () => {
    if (!formData.productId || !formData.warehouseId || !formData.quantity) {
      toast({ title: t("error"), description: "Veuillez remplir les champs obligatoires", variant: "destructive" });
      return;
    }

    const type = movementType === "entry" ? "entry" : movementType === "exit" ? "exit" : "transfer_out";
    
    createMovementMutation.mutate({
      productId: formData.productId,
      warehouseId: formData.warehouseId,
      type,
      reason: formData.reason || undefined,
      quantity: formData.quantity,
      notes: formData.notes || undefined,
    });
  };

  const getProductById = (id: string | null | undefined) => products.find(p => p.id === id);
  const getWarehouseById = (id: string | null | undefined) => warehouses.find(w => w.id === id);

  const enrichedStock = stockData.map(item => ({
    ...item,
    product: getProductById(item.productId),
    warehouse: getWarehouseById(item.warehouseId),
  }));

  const enrichedMovements = movements.map(mov => ({
    ...mov,
    product: getProductById(mov.productId),
    warehouse: getWarehouseById(mov.warehouseId),
  }));

  const filteredStock = enrichedStock.filter((item) => {
    const productName = item.product?.name || "";
    const productSku = item.product?.sku || "";
    const warehouseName = item.warehouse?.name || "";
    const matchesSearch =
      productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      productSku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWarehouse = selectedWarehouse === "all" || item.warehouseId === selectedWarehouse;
    return matchesSearch && matchesWarehouse;
  });

  const totalStockValue = enrichedStock.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const cost = Number(item.averageCost) || 0;
    return sum + qty * cost;
  }, 0);

  const lowStockCount = enrichedStock.filter((item) => {
    const qty = Number(item.quantity) || 0;
    const minStock = item.product?.minStock || 0;
    return qty < minStock && qty > 0;
  }).length;

  const outOfStockCount = enrichedStock.filter((item) => {
    const qty = Number(item.quantity) || 0;
    return qty === 0;
  }).length;

  const overstockCount = enrichedStock.filter((item) => {
    const qty = Number(item.quantity) || 0;
    const maxStock = item.product?.maxStock || 1000;
    return qty > maxStock;
  }).length;

  const getStockLevel = (qty: number, min: number, max: number) => {
    if (qty === 0) return { color: "bg-destructive", text: t("outOfStock"), percent: 0 };
    if (qty < min) return { color: "bg-chart-3", text: t("lowStock"), percent: (qty / max) * 100 };
    if (qty > max) return { color: "bg-chart-1", text: t("overstock"), percent: 100 };
    return { color: "bg-chart-2", text: t("active"), percent: (qty / max) * 100 };
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "entry":
        return <ArrowDownRight className="h-4 w-4 text-chart-2" />;
      case "exit":
        return <ArrowUpRight className="h-4 w-4 text-destructive" />;
      case "transfer_in":
        return <ArrowRightLeft className="h-4 w-4 text-chart-1" />;
      case "transfer_out":
        return <ArrowRightLeft className="h-4 w-4 text-chart-4" />;
      case "adjustment":
        return <RefreshCw className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  if (isLoadingStock || isLoadingMovements) {
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
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">
            {t("stock")}
          </h1>
          <p className="text-muted-foreground">
            Gestion des stocks et mouvements
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" data-testid="button-export-stock">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-movement">
                <Plus className="mr-2 h-4 w-4" />
                Mouvement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Nouveau mouvement de stock</DialogTitle>
                <DialogDescription>
                  Enregistrer une entrée, sortie ou transfert de stock
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex gap-2 rounded-lg border p-1">
                  <Button
                    variant={movementType === "entry" ? "secondary" : "ghost"}
                    className="flex-1"
                    onClick={() => setMovementType("entry")}
                    data-testid="button-movement-entry"
                  >
                    <ArrowDownRight className="mr-2 h-4 w-4" />
                    {t("entry")}
                  </Button>
                  <Button
                    variant={movementType === "exit" ? "secondary" : "ghost"}
                    className="flex-1"
                    onClick={() => setMovementType("exit")}
                    data-testid="button-movement-exit"
                  >
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    {t("exit")}
                  </Button>
                  <Button
                    variant={movementType === "transfer" ? "secondary" : "ghost"}
                    className="flex-1"
                    onClick={() => setMovementType("transfer")}
                    data-testid="button-movement-transfer"
                  >
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    {t("transfer")}
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Produit *</Label>
                  <Select value={formData.productId} onValueChange={(v) => setFormData(prev => ({ ...prev, productId: v }))}>
                    <SelectTrigger data-testid="select-movement-product">
                      <SelectValue placeholder="Sélectionner un produit" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.sku} - {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("warehouse")} *</Label>
                    <Select value={formData.warehouseId} onValueChange={(v) => setFormData(prev => ({ ...prev, warehouseId: v }))}>
                      <SelectTrigger data-testid="select-movement-warehouse">
                        <SelectValue placeholder={t("warehouse")} />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((wh) => (
                          <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {movementType === "transfer" && (
                    <div className="space-y-2">
                      <Label>Destination *</Label>
                      <Select value={formData.destinationWarehouseId} onValueChange={(v) => setFormData(prev => ({ ...prev, destinationWarehouseId: v }))}>
                        <SelectTrigger data-testid="select-movement-destination">
                          <SelectValue placeholder="Destination" />
                        </SelectTrigger>
                        <SelectContent>
                          {warehouses.map((wh) => (
                            <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("quantity")} *</Label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                      data-testid="input-movement-quantity" 
                    />
                  </div>
                  {movementType !== "transfer" && (
                    <div className="space-y-2">
                      <Label>{t("reason")}</Label>
                      <Select value={formData.reason} onValueChange={(v) => setFormData(prev => ({ ...prev, reason: v }))}>
                        <SelectTrigger data-testid="select-movement-reason">
                          <SelectValue placeholder={t("reason")} />
                        </SelectTrigger>
                        <SelectContent>
                          {movementReasons.map((reason) => (
                            <SelectItem key={reason} value={reason}>{t(reason)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t("notes")}</Label>
                  <Textarea 
                    placeholder="Notes additionnelles" 
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    data-testid="input-movement-notes" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsMovementDialogOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button 
                  onClick={handleSaveMovement} 
                  disabled={createMovementMutation.isPending}
                  data-testid="button-save-movement"
                >
                  {createMovementMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("save")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card data-testid="card-stock-value">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-chart-1/10 p-3">
                <Package className="h-5 w-5 text-chart-1" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("stockValue")}</p>
                <p className="text-2xl font-bold">{formatCurrency(totalStockValue, currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-low-stock">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-chart-3/10 p-3">
                <TrendingDown className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("lowStock")}</p>
                <p className="text-2xl font-bold">{lowStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-out-of-stock">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-destructive/10 p-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("outOfStock")}</p>
                <p className="text-2xl font-bold">{outOfStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-overstock">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-chart-4/10 p-3">
                <TrendingUp className="h-5 w-5 text-chart-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("overstock")}</p>
                <p className="text-2xl font-bold">{overstockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stock" data-testid="tab-stock">{t("currentStock")}</TabsTrigger>
          <TabsTrigger value="movements" data-testid="tab-movements">Mouvements</TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1 md:max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={`${t("search")} produit...`}
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search-stock"
                  />
                </div>
                <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                  <SelectTrigger className="w-48" data-testid="select-warehouse-filter">
                    <SelectValue placeholder={t("warehouse")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("allWarehouses")}</SelectItem>
                    {warehouses.map((wh) => (
                      <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("sku")}</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>{t("warehouse")}</TableHead>
                      <TableHead className="text-right">{t("quantity")}</TableHead>
                      <TableHead className="text-right">Réservé</TableHead>
                      <TableHead className="text-right">Disponible</TableHead>
                      <TableHead>Niveau</TableHead>
                      <TableHead className="text-right">Valeur</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStock.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                          Aucun stock trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStock.map((item) => {
                        const qty = Number(item.quantity) || 0;
                        const reserved = Number(item.reservedQuantity) || 0;
                        const available = qty - reserved;
                        const minStock = item.product?.minStock || 0;
                        const maxStock = item.product?.maxStock || 1000;
                        const avgCost = Number(item.averageCost) || 0;
                        const stockLevel = getStockLevel(qty, minStock, maxStock);
                        
                        return (
                          <TableRow key={item.id} data-testid={`row-stock-${item.id}`}>
                            <TableCell className="font-mono text-sm">{item.product?.sku || "-"}</TableCell>
                            <TableCell className="font-medium">{item.product?.name || "-"}</TableCell>
                            <TableCell>
                              <Badge variant="outline" size="sm">{item.warehouse?.name || "-"}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono">{formatNumber(qty)}</TableCell>
                            <TableCell className="text-right font-mono text-muted-foreground">
                              {formatNumber(reserved)}
                            </TableCell>
                            <TableCell className="text-right font-mono font-medium">
                              {formatNumber(available)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={stockLevel.percent} className="h-2 w-16" />
                                <Badge 
                                  variant={qty === 0 ? "destructive" : qty < minStock ? "secondary" : "outline"} 
                                  size="sm"
                                >
                                  {stockLevel.text}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {formatCurrency(qty * avgCost, currency)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Historique des mouvements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("date")}</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>{t("warehouse")}</TableHead>
                      <TableHead className="text-right">{t("quantity")}</TableHead>
                      <TableHead className="text-right">Coût</TableHead>
                      <TableHead>Référence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrichedMovements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                          Aucun mouvement enregistré
                        </TableCell>
                      </TableRow>
                    ) : (
                      enrichedMovements.map((mov) => {
                        const qty = Number(mov.quantity) || 0;
                        const totalCost = Number(mov.totalCost) || 0;
                        return (
                          <TableRow key={mov.id} data-testid={`row-movement-${mov.id}`}>
                            <TableCell className="text-sm">
                              {mov.createdAt ? formatDateTime(new Date(mov.createdAt), language) : "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getMovementIcon(mov.type)}
                                <span className="text-sm">{t(mov.type)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{mov.product?.name || "-"}</TableCell>
                            <TableCell>
                              <Badge variant="outline" size="sm">{mov.warehouse?.name || "-"}</Badge>
                            </TableCell>
                            <TableCell className={`text-right font-mono ${mov.type === "entry" || mov.type === "transfer_in" ? "text-chart-2" : mov.type === "exit" || mov.type === "transfer_out" ? "text-destructive" : ""}`}>
                              {mov.type === "entry" || mov.type === "transfer_in" ? "+" : "-"}
                              {formatNumber(Math.abs(qty))}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {formatCurrency(totalCost, currency)}
                            </TableCell>
                            <TableCell className="font-mono text-sm text-muted-foreground">
                              {mov.referenceId || mov.reason || "-"}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
