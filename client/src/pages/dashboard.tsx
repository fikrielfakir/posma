import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Receipt,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Truck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/contexts/AppContext";
import { formatCurrency, formatNumber } from "@/lib/i18n";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const salesData = [
  { name: "Lun", sales: 4000, purchases: 2400 },
  { name: "Mar", sales: 3000, purchases: 1398 },
  { name: "Mer", sales: 5000, purchases: 9800 },
  { name: "Jeu", sales: 2780, purchases: 3908 },
  { name: "Ven", sales: 8890, purchases: 4800 },
  { name: "Sam", sales: 6390, purchases: 3800 },
  { name: "Dim", sales: 3490, purchases: 4300 },
];

const topProducts = [
  { name: "Huile d'olive extra vierge 1L", sales: 245, revenue: 24500, trend: 12 },
  { name: "Savon noir traditionnel", sales: 189, revenue: 9450, trend: 8 },
  { name: "Argan cosmétique 50ml", sales: 156, revenue: 31200, trend: -3 },
  { name: "Miel de thym 500g", sales: 134, revenue: 16750, trend: 15 },
  { name: "Couscous fin 1kg", sales: 122, revenue: 4880, trend: 5 },
];

const stockAlerts = [
  { id: 1, product: "Huile d'olive 1L", type: "low_stock", current: 12, min: 50, severity: "warning" },
  { id: 2, product: "Savon noir 200g", type: "out_of_stock", current: 0, min: 20, severity: "critical" },
  { id: 3, product: "Épices Ras el Hanout", type: "expiring", current: 45, daysLeft: 15, severity: "warning" },
  { id: 4, product: "Thé à la menthe", type: "overstock", current: 500, max: 200, severity: "info" },
];

const recentTransactions = [
  { id: 1, type: "sale", reference: "VNT-2024-0156", customer: "Souk Marrakech", amount: 15750, status: "paid" },
  { id: 2, type: "purchase", reference: "ACH-2024-0089", supplier: "Coopérative Atlas", amount: 45200, status: "received" },
  { id: 3, type: "sale", reference: "VNT-2024-0155", customer: "Riad Fès", amount: 8900, status: "pending" },
  { id: 4, type: "purchase", reference: "ACH-2024-0088", supplier: "Ferme Bio Agadir", amount: 23500, status: "ordered" },
];

export default function Dashboard() {
  const { t, currency } = useApp();

  const kpiCards = [
    {
      title: t("totalSales"),
      value: formatCurrency(847500, currency),
      change: 12.5,
      trend: "up",
      icon: Receipt,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      title: t("totalPurchases"),
      value: formatCurrency(523400, currency),
      change: -3.2,
      trend: "down",
      icon: ShoppingCart,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      title: t("activeProducts"),
      value: formatNumber(1247),
      change: 5.8,
      trend: "up",
      icon: Package,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
    {
      title: t("lowStock"),
      value: formatNumber(23),
      change: 8,
      trend: "up",
      icon: AlertTriangle,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      paid: "default",
      received: "default",
      pending: "secondary",
      ordered: "secondary",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{t(status)}</Badge>;
  };

  const getAlertBadge = (severity: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      critical: "destructive",
      warning: "secondary",
      info: "outline",
    };
    return variants[severity] || "secondary";
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">
            {t("welcome")}, Admin
          </h1>
          <p className="text-muted-foreground">
            {t("today")}: {new Date().toLocaleDateString("fr-MA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button data-testid="button-new-sale">
            <Plus className="mr-2 h-4 w-4" />
            {t("newSale")}
          </Button>
          <Button variant="outline" data-testid="button-new-purchase">
            <Truck className="mr-2 h-4 w-4" />
            {t("newPurchase")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index} data-testid={`card-kpi-${index}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`rounded-lg p-2.5 ${kpi.bgColor}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${kpi.trend === "up" ? "text-chart-2" : "text-destructive"}`}>
                  {kpi.trend === "up" ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {Math.abs(kpi.change)}%
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" data-testid="card-sales-chart">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">
              {t("revenue")} vs {t("expenses")}
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">{t("thisWeek")}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={false}
                    name={t("sales")}
                  />
                  <Line
                    type="monotone"
                    dataKey="purchases"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={false}
                    name={t("purchases")}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-alerts">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">{t("alerts")}</CardTitle>
            <Badge variant="destructive">{stockAlerts.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stockAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                  data-testid={`alert-item-${alert.id}`}
                >
                  <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                    alert.severity === "critical" ? "text-destructive" :
                    alert.severity === "warning" ? "text-chart-3" : "text-chart-1"
                  }`} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-tight">{alert.product}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.type === "low_stock" && `Stock: ${alert.current}/${alert.min}`}
                      {alert.type === "out_of_stock" && t("outOfStock")}
                      {alert.type === "expiring" && `Expire dans ${alert.daysLeft} ${t("days")}`}
                      {alert.type === "overstock" && `${alert.current}/${alert.max} max`}
                    </p>
                  </div>
                  <Badge variant={getAlertBadge(alert.severity)}>
                    {t(alert.severity)}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="mt-4 w-full" data-testid="button-view-all-alerts">
              {t("viewAll")}
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card data-testid="card-top-products">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">{t("topProducts")}</CardTitle>
            <Badge variant="outline">{t("thisMonth")}</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4"
                  data-testid={`top-product-${index}`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-tight">{product.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{product.sales} {t("sales")}</span>
                      <span>•</span>
                      <span>{formatCurrency(product.revenue, currency)}</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${product.trend >= 0 ? "text-chart-2" : "text-destructive"}`}>
                    {product.trend >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(product.trend)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-recent-transactions">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">{t("recentTransactions")}</CardTitle>
            <Button variant="ghost" size="sm" data-testid="button-view-all-transactions">
              {t("viewAll")}
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-3"
                  data-testid={`transaction-${tx.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${tx.type === "sale" ? "bg-chart-2/10" : "bg-chart-1/10"}`}>
                      {tx.type === "sale" ? (
                        <Receipt className={`h-4 w-4 text-chart-2`} />
                      ) : (
                        <ShoppingCart className={`h-4 w-4 text-chart-1`} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.reference}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.type === "sale" ? tx.customer : tx.supplier}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${tx.type === "sale" ? "text-chart-2" : ""}`}>
                      {tx.type === "sale" ? "+" : "-"}{formatCurrency(tx.amount, currency)}
                    </p>
                    {getStatusBadge(tx.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-stock-overview">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">{t("stockValue")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Produits Alimentaires</span>
                <span className="text-sm font-medium">45%</span>
              </div>
              <Progress value={45} className="h-2" />
              <p className="text-lg font-semibold">{formatCurrency(1250000, currency)}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cosmétiques</span>
                <span className="text-sm font-medium">30%</span>
              </div>
              <Progress value={30} className="h-2" />
              <p className="text-lg font-semibold">{formatCurrency(830000, currency)}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Artisanat</span>
                <span className="text-sm font-medium">25%</span>
              </div>
              <Progress value={25} className="h-2" />
              <p className="text-lg font-semibold">{formatCurrency(695000, currency)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
