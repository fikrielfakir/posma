import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, DollarSign, CreditCard, Banknote, 
  Smartphone, FileText, Receipt, Wallet, Loader2 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/contexts/AppContext";
import { formatCurrency } from "@/lib/i18n";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

interface FinancialSummary {
  revenue: {
    daily: number;
    weekly: number;
    monthly: number;
    total: number;
  };
  paymentBreakdown: {
    cash: number;
    card: number;
    check: number;
    mobile: number;
    transfer: number;
  };
  outstanding: {
    count: number;
    amount: number;
  };
  cashSessions: {
    openCount: number;
    totalCash: number;
  };
  sales: {
    total: number;
    today: number;
  };
}

interface TopProduct {
  id: string;
  name: string;
  sku: string;
  quantitySold: number;
  revenue: number;
  margin: number;
}

interface DailyRevenue {
  date: string;
  dayName: string;
  revenue: number;
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function FinancialDashboard() {
  const { t, currency } = useApp();

  const { data: summary, isLoading: summaryLoading } = useQuery<FinancialSummary>({
    queryKey: ["/api/financial/summary"],
  });

  const { data: topProducts = [], isLoading: productsLoading } = useQuery<TopProduct[]>({
    queryKey: ["/api/financial/top-products"],
  });

  const { data: dailyRevenue = [], isLoading: revenueLoading } = useQuery<DailyRevenue[]>({
    queryKey: ["/api/financial/daily-revenue"],
  });

  const isLoading = summaryLoading || productsLoading || revenueLoading;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const paymentData = summary ? [
    { name: "Espèces", value: summary.paymentBreakdown.cash, icon: Banknote },
    { name: "Carte", value: summary.paymentBreakdown.card, icon: CreditCard },
    { name: "Chèque", value: summary.paymentBreakdown.check, icon: FileText },
    { name: "Mobile", value: summary.paymentBreakdown.mobile, icon: Smartphone },
    { name: "Virement", value: summary.paymentBreakdown.transfer, icon: DollarSign },
  ].filter(p => p.value > 0) : [];

  const totalPayments = paymentData.reduce((sum, p) => sum + p.value, 0);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-financial-title">
            Tableau de Bord Financier
          </h1>
          <p className="text-muted-foreground">
            Vue d'ensemble des performances financières
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-daily-revenue">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg p-2.5 bg-chart-2/10">
                <Receipt className="h-5 w-5 text-chart-2" />
              </div>
              <Badge variant="secondary">Aujourd'hui</Badge>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold" data-testid="text-daily-revenue">
                {formatCurrency(summary?.revenue.daily || 0, currency)}
              </p>
              <p className="text-sm text-muted-foreground">Chiffre d'affaires du jour</p>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-weekly-revenue">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg p-2.5 bg-chart-1/10">
                <TrendingUp className="h-5 w-5 text-chart-1" />
              </div>
              <Badge variant="secondary">7 jours</Badge>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold" data-testid="text-weekly-revenue">
                {formatCurrency(summary?.revenue.weekly || 0, currency)}
              </p>
              <p className="text-sm text-muted-foreground">CA hebdomadaire</p>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-monthly-revenue">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg p-2.5 bg-chart-4/10">
                <DollarSign className="h-5 w-5 text-chart-4" />
              </div>
              <Badge variant="secondary">Ce mois</Badge>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold" data-testid="text-monthly-revenue">
                {formatCurrency(summary?.revenue.monthly || 0, currency)}
              </p>
              <p className="text-sm text-muted-foreground">CA mensuel</p>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-outstanding">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg p-2.5 bg-destructive/10">
                <FileText className="h-5 w-5 text-destructive" />
              </div>
              <Badge variant="destructive">{summary?.outstanding.count || 0}</Badge>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold" data-testid="text-outstanding-amount">
                {formatCurrency(summary?.outstanding.amount || 0, currency)}
              </p>
              <p className="text-sm text-muted-foreground">Factures impayées</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" data-testid="card-revenue-chart">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">
              Chiffre d'affaires des 7 derniers jours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="dayName" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value, currency), "CA"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-payment-breakdown">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">
              Répartition des paiements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentData.length > 0 ? (
              <>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {paymentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {paymentData.map((payment, index) => (
                    <div key={payment.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{payment.name}</span>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(payment.value, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-48 items-center justify-center text-muted-foreground">
                Aucun paiement enregistré
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card data-testid="card-top-products">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Produits les plus vendus</CardTitle>
            <Badge variant="outline">Top 5</Badge>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.slice(0, 5).map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4"
                    data-testid={`top-product-${index}`}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-sm font-medium leading-tight truncate">{product.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{product.quantitySold} vendus</span>
                        <span>-</span>
                        <span>{formatCurrency(product.revenue, currency)}</span>
                      </div>
                    </div>
                    {product.margin > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {product.margin.toFixed(0)}% marge
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-muted-foreground">
                Aucune vente enregistrée
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-cash-status">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">État des caisses</CardTitle>
            {(summary?.cashSessions.openCount || 0) > 0 && (
              <Badge variant="default">{summary?.cashSessions.openCount} ouverte(s)</Badge>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Espèces en caisse</span>
                  <span className="text-lg font-bold">
                    {formatCurrency(summary?.cashSessions.totalCash || 0, currency)}
                  </span>
                </div>
                <Progress 
                  value={Math.min(((summary?.cashSessions.totalCash || 0) / 10000) * 100, 100)} 
                  className="h-2" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Ventes du jour</span>
                  </div>
                  <p className="mt-2 text-xl font-semibold" data-testid="text-today-sales">
                    {summary?.sales.today || 0}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Total ventes</span>
                  </div>
                  <p className="mt-2 text-xl font-semibold" data-testid="text-total-sales">
                    {summary?.sales.total || 0}
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">CA Total</span>
                  <span className="text-xl font-bold text-chart-2" data-testid="text-total-revenue">
                    {formatCurrency(summary?.revenue.total || 0, currency)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
