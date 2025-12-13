import { useState } from "react";
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

const mockProducts = [
  {
    id: "1",
    sku: "PRD-001",
    barcode: "6111234567890",
    name: "Huile d'olive extra vierge",
    nameFr: "Huile d'olive extra vierge",
    category: "Alimentaire",
    subcategory: "Huiles",
    unit: "L",
    purchasePrice: 85,
    sellingPrice: 120,
    tvaRate: 10,
    stock: 234,
    minStock: 50,
    isActive: true,
  },
  {
    id: "2",
    sku: "PRD-002",
    barcode: "6111234567891",
    name: "Savon noir traditionnel",
    nameFr: "Savon noir traditionnel Beldi",
    category: "Cosmétique",
    subcategory: "Savons",
    unit: "kg",
    purchasePrice: 35,
    sellingPrice: 55,
    tvaRate: 20,
    stock: 89,
    minStock: 30,
    isActive: true,
  },
  {
    id: "3",
    sku: "PRD-003",
    barcode: "6111234567892",
    name: "Argan cosmétique bio",
    nameFr: "Huile d'Argan cosmétique bio",
    category: "Cosmétique",
    subcategory: "Huiles",
    unit: "mL",
    purchasePrice: 150,
    sellingPrice: 220,
    tvaRate: 20,
    stock: 12,
    minStock: 25,
    isActive: true,
  },
  {
    id: "4",
    sku: "PRD-004",
    barcode: "6111234567893",
    name: "Miel de thym naturel",
    nameFr: "Miel de thym des montagnes",
    category: "Alimentaire",
    subcategory: "Miels",
    unit: "kg",
    purchasePrice: 180,
    sellingPrice: 280,
    tvaRate: 7,
    stock: 0,
    minStock: 15,
    isActive: true,
  },
  {
    id: "5",
    sku: "PRD-005",
    barcode: "6111234567894",
    name: "Couscous fin traditionnel",
    nameFr: "Couscous fin roulé à la main",
    category: "Alimentaire",
    subcategory: "Céréales",
    unit: "kg",
    purchasePrice: 28,
    sellingPrice: 45,
    tvaRate: 0,
    stock: 567,
    minStock: 100,
    isActive: true,
  },
  {
    id: "6",
    sku: "PRD-006",
    barcode: "6111234567895",
    name: "Tajine traditionnel",
    nameFr: "Tajine en terre cuite",
    category: "Artisanat",
    subcategory: "Poterie",
    unit: "piece",
    purchasePrice: 65,
    sellingPrice: 120,
    tvaRate: 20,
    stock: 45,
    minStock: 20,
    isActive: false,
  },
];

const categories = ["Alimentaire", "Cosmétique", "Artisanat", "Textile"];
const units = ["piece", "kg", "g", "L", "mL", "carton", "palette", "m", "m²", "lot"];
const tvaRates = [0, 7, 10, 14, 20];

export default function Products() {
  const { t, currency } = useApp();
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode.includes(searchQuery);
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockBadge = (stock: number, minStock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive" size="sm">{t("outOfStock")}</Badge>;
    }
    if (stock < minStock) {
      return <Badge variant="secondary" size="sm">{t("lowStock")}</Badge>;
    }
    return <Badge variant="outline" size="sm">{t("active")}</Badge>;
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">
            {t("products")}
          </h1>
          <p className="text-muted-foreground">
            {formatNumber(mockProducts.length)} {t("activeProducts")}
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
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">{t("sku")} *</Label>
                    <Input id="sku" placeholder="PRD-XXX" data-testid="input-sku" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barcode">{t("barcode")}</Label>
                    <div className="flex gap-2">
                      <Input id="barcode" placeholder="EAN13" data-testid="input-barcode" />
                      <Button variant="outline" size="icon">
                        <Barcode className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">{t("name")} *</Label>
                  <Input id="name" placeholder="Nom du produit" data-testid="input-name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">{t("category")}</Label>
                    <Select>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder={t("category")} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">{t("unit")}</Label>
                    <Select>
                      <SelectTrigger data-testid="select-unit">
                        <SelectValue placeholder={t("unit")} />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">{t("purchasePrice")}</Label>
                    <Input id="purchasePrice" type="number" placeholder="0.00" data-testid="input-purchase-price" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sellingPrice">{t("sellingPrice")}</Label>
                    <Input id="sellingPrice" type="number" placeholder="0.00" data-testid="input-selling-price" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tva">{t("tva")} %</Label>
                    <Select>
                      <SelectTrigger data-testid="select-tva">
                        <SelectValue placeholder="TVA" />
                      </SelectTrigger>
                      <SelectContent>
                        {tvaRates.map((rate) => (
                          <SelectItem key={rate} value={rate.toString()}>{rate}%</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minStock">{t("minStock")}</Label>
                    <Input id="minStock" type="number" placeholder="0" data-testid="input-min-stock" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxStock">{t("maxStock")}</Label>
                    <Input id="maxStock" type="number" placeholder="1000" data-testid="input-max-stock" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t("description")}</Label>
                  <Textarea id="description" placeholder="Description du produit" data-testid="input-description" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button data-testid="button-save-product">{t("save")}</Button>
              </DialogFooter>
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
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40" data-testid="select-filter-category">
                  <SelectValue placeholder={t("category")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("category")}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          {viewMode === "list" ? (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">{t("sku")}</TableHead>
                    <TableHead>{t("name")}</TableHead>
                    <TableHead>{t("category")}</TableHead>
                    <TableHead className="text-right">{t("purchasePrice")}</TableHead>
                    <TableHead className="text-right">{t("sellingPrice")}</TableHead>
                    <TableHead className="text-right">{t("currentStock")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.barcode}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" size="sm">{product.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(product.purchasePrice, currency)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(product.sellingPrice, currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={product.stock < product.minStock ? "text-destructive font-medium" : ""}>
                          {formatNumber(product.stock)} {product.unit}
                        </span>
                      </TableCell>
                      <TableCell>{getStockBadge(product.stock, product.minStock)}</TableCell>
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
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              {t("edit")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
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
              {filteredProducts.map((product) => (
                <Card key={product.id} className="hover-elevate" data-testid={`card-product-${product.id}`}>
                  <CardContent className="p-4">
                    <div className="relative mb-3 flex aspect-square items-center justify-center rounded-lg bg-muted">
                      <Package className="h-12 w-12 text-muted-foreground" />
                      <div className="absolute right-2 top-2">
                        {getStockBadge(product.stock, product.minStock)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
                      <h3 className="font-medium leading-tight">{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" size="sm">{product.category}</Badge>
                        <span className="font-semibold">{formatCurrency(product.sellingPrice, currency)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Stock: {formatNumber(product.stock)}</span>
                        <span>Min: {product.minStock}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
