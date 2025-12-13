import { useState } from "react";
import {
  Search,
  Filter,
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

const mockStockData = [
  {
    id: "1",
    productSku: "PRD-001",
    productName: "Huile d'olive extra vierge",
    warehouse: "Casablanca Central",
    quantity: 234,
    reservedQty: 12,
    availableQty: 222,
    minStock: 50,
    maxStock: 500,
    averageCost: 85,
    lastMovement: new Date("2024-12-12"),
  },
  {
    id: "2",
    productSku: "PRD-002",
    productName: "Savon noir traditionnel",
    warehouse: "Casablanca Central",
    quantity: 89,
    reservedQty: 5,
    availableQty: 84,
    minStock: 30,
    maxStock: 200,
    averageCost: 35,
    lastMovement: new Date("2024-12-11"),
  },
  {
    id: "3",
    productSku: "PRD-003",
    productName: "Argan cosmétique bio",
    warehouse: "Rabat Nord",
    quantity: 12,
    reservedQty: 0,
    availableQty: 12,
    minStock: 25,
    maxStock: 100,
    averageCost: 150,
    lastMovement: new Date("2024-12-10"),
  },
  {
    id: "4",
    productSku: "PRD-004",
    productName: "Miel de thym naturel",
    warehouse: "Casablanca Central",
    quantity: 0,
    reservedQty: 0,
    availableQty: 0,
    minStock: 15,
    maxStock: 80,
    averageCost: 180,
    lastMovement: new Date("2024-12-08"),
  },
  {
    id: "5",
    productSku: "PRD-005",
    productName: "Couscous fin traditionnel",
    warehouse: "Casablanca Central",
    quantity: 567,
    reservedQty: 45,
    availableQty: 522,
    minStock: 100,
    maxStock: 500,
    averageCost: 28,
    lastMovement: new Date("2024-12-13"),
  },
];

const mockMovements = [
  {
    id: "1",
    date: new Date("2024-12-13T10:30:00"),
    type: "entry",
    reason: "purchase",
    product: "Huile d'olive extra vierge",
    warehouse: "Casablanca Central",
    quantity: 100,
    unitCost: 85,
    totalCost: 8500,
    reference: "ACH-2024-0089",
    createdBy: "Mohamed",
  },
  {
    id: "2",
    date: new Date("2024-12-13T09:15:00"),
    type: "exit",
    reason: "sale",
    product: "Savon noir traditionnel",
    warehouse: "Casablanca Central",
    quantity: 25,
    unitCost: 35,
    totalCost: 875,
    reference: "VNT-2024-0156",
    createdBy: "Fatima",
  },
  {
    id: "3",
    date: new Date("2024-12-12T16:45:00"),
    type: "transfer_out",
    reason: "transfer",
    product: "Argan cosmétique bio",
    warehouse: "Casablanca Central",
    quantity: 10,
    unitCost: 150,
    totalCost: 1500,
    reference: "TRF-2024-0012",
    createdBy: "Youssef",
  },
  {
    id: "4",
    date: new Date("2024-12-12T14:20:00"),
    type: "adjustment",
    reason: "inventory_adjustment",
    product: "Couscous fin traditionnel",
    warehouse: "Casablanca Central",
    quantity: -5,
    unitCost: 28,
    totalCost: 140,
    reference: "INV-2024-0045",
    createdBy: "Admin",
  },
];

const warehouses = ["Casablanca Central", "Rabat Nord", "Marrakech Sud"];
const movementTypes = ["entry", "exit", "transfer_in", "transfer_out", "adjustment"];
const movementReasons = ["purchase", "sale", "return_client", "return_supplier", "loss", "damage", "sample", "gift", "inventory_adjustment"];

export default function Stock() {
  const { t, currency, language } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [movementType, setMovementType] = useState<"entry" | "exit" | "transfer">("entry");

  const filteredStock = mockStockData.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.productSku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWarehouse = selectedWarehouse === "all" || item.warehouse === selectedWarehouse;
    return matchesSearch && matchesWarehouse;
  });

  const totalStockValue = mockStockData.reduce((sum, item) => sum + item.quantity * item.averageCost, 0);
  const lowStockCount = mockStockData.filter((item) => item.quantity < item.minStock && item.quantity > 0).length;
  const outOfStockCount = mockStockData.filter((item) => item.quantity === 0).length;
  const overstockCount = mockStockData.filter((item) => item.quantity > item.maxStock).length;

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
                  <Select>
                    <SelectTrigger data-testid="select-movement-product">
                      <SelectValue placeholder="Sélectionner un produit" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockStockData.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.productSku} - {item.productName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("warehouse")} *</Label>
                    <Select>
                      <SelectTrigger data-testid="select-movement-warehouse">
                        <SelectValue placeholder={t("warehouse")} />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((wh) => (
                          <SelectItem key={wh} value={wh}>{wh}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {movementType === "transfer" && (
                    <div className="space-y-2">
                      <Label>Destination *</Label>
                      <Select>
                        <SelectTrigger data-testid="select-movement-destination">
                          <SelectValue placeholder="Destination" />
                        </SelectTrigger>
                        <SelectContent>
                          {warehouses.map((wh) => (
                            <SelectItem key={wh} value={wh}>{wh}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("quantity")} *</Label>
                    <Input type="number" placeholder="0" data-testid="input-movement-quantity" />
                  </div>
                  {movementType !== "transfer" && (
                    <div className="space-y-2">
                      <Label>{t("reason")}</Label>
                      <Select>
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
                  <Textarea placeholder="Notes additionnelles" data-testid="input-movement-notes" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsMovementDialogOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button data-testid="button-save-movement">{t("save")}</Button>
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
                      <SelectItem key={wh} value={wh}>{wh}</SelectItem>
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
                    {filteredStock.map((item) => {
                      const stockLevel = getStockLevel(item.quantity, item.minStock, item.maxStock);
                      return (
                        <TableRow key={item.id} data-testid={`row-stock-${item.id}`}>
                          <TableCell className="font-mono text-sm">{item.productSku}</TableCell>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" size="sm">{item.warehouse}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono">{formatNumber(item.quantity)}</TableCell>
                          <TableCell className="text-right font-mono text-muted-foreground">
                            {formatNumber(item.reservedQty)}
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium">
                            {formatNumber(item.availableQty)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={stockLevel.percent} className="h-2 w-16" />
                              <Badge 
                                variant={item.quantity === 0 ? "destructive" : item.quantity < item.minStock ? "secondary" : "outline"} 
                                size="sm"
                              >
                                {stockLevel.text}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(item.quantity * item.averageCost, currency)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
                      <TableHead>Par</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockMovements.map((mov) => (
                      <TableRow key={mov.id} data-testid={`row-movement-${mov.id}`}>
                        <TableCell className="text-sm">
                          {formatDateTime(mov.date, language)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMovementIcon(mov.type)}
                            <span className="text-sm">{t(mov.type)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{mov.product}</TableCell>
                        <TableCell>
                          <Badge variant="outline" size="sm">{mov.warehouse}</Badge>
                        </TableCell>
                        <TableCell className={`text-right font-mono ${mov.type === "entry" || mov.type === "transfer_in" ? "text-chart-2" : mov.type === "exit" || mov.type === "transfer_out" ? "text-destructive" : ""}`}>
                          {mov.type === "entry" || mov.type === "transfer_in" ? "+" : "-"}
                          {formatNumber(Math.abs(mov.quantity))}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(mov.totalCost, currency)}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {mov.reference}
                        </TableCell>
                        <TableCell className="text-sm">{mov.createdBy}</TableCell>
                      </TableRow>
                    ))}
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
