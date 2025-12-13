import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  BarChart3, 
  LineChart, 
  Target, 
  Zap,
  RefreshCw,
  Calendar,
  Package,
  Users,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from "lucide-react";
import { formatCurrency } from "@/lib/i18n";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from "recharts";

const demandForecastData = [
  { month: "Jan", actual: 4500, predicted: 4200, lower: 3800, upper: 4600 },
  { month: "Fév", actual: 5200, predicted: 5100, lower: 4700, upper: 5500 },
  { month: "Mar", actual: 4800, predicted: 4900, lower: 4500, upper: 5300 },
  { month: "Avr", actual: 5800, predicted: 5600, lower: 5200, upper: 6000 },
  { month: "Mai", actual: 6200, predicted: 6100, lower: 5700, upper: 6500 },
  { month: "Juin", actual: null, predicted: 6800, lower: 6400, upper: 7200 },
  { month: "Juil", actual: null, predicted: 7200, lower: 6800, upper: 7600 },
  { month: "Août", actual: null, predicted: 6900, lower: 6500, upper: 7300 },
];

const salesPredictionData = [
  { category: "Électronique", predicted: 125000, confidence: 0.92 },
  { category: "Vêtements", predicted: 89000, confidence: 0.88 },
  { category: "Alimentation", predicted: 156000, confidence: 0.95 },
  { category: "Maison", predicted: 67000, confidence: 0.85 },
  { category: "Sport", predicted: 45000, confidence: 0.82 },
];

const abcClassification = [
  { name: "Classe A", value: 20, products: 150, revenue: "70%" },
  { name: "Classe B", value: 30, products: 350, revenue: "20%" },
  { name: "Classe C", value: 50, products: 500, revenue: "10%" },
];

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"];

const topPredictions = [
  { product: "Samsung Galaxy S24", currentStock: 45, predictedDemand: 120, reorderPoint: 30, action: "Commander 75 unités" },
  { product: "iPhone 15 Pro", currentStock: 28, predictedDemand: 95, reorderPoint: 25, action: "Commander 70 unités" },
  { product: "MacBook Air M3", currentStock: 15, predictedDemand: 40, reorderPoint: 10, action: "Commander 25 unités" },
  { product: "AirPods Pro 2", currentStock: 85, predictedDemand: 60, reorderPoint: 20, action: "Stock suffisant" },
];

export default function AIPredictions() {
  const { t, currency } = useApp();
  const [activeTab, setActiveTab] = useState("demand");
  const [timeHorizon, setTimeHorizon] = useState("30");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshModels = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            Prédictions IA
          </h1>
          <p className="text-muted-foreground">Intelligence artificielle pour anticiper la demande et optimiser les stocks</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeHorizon} onValueChange={setTimeHorizon}>
            <SelectTrigger className="w-40">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 jours</SelectItem>
              <SelectItem value="30">30 jours</SelectItem>
              <SelectItem value="90">90 jours</SelectItem>
              <SelectItem value="180">6 mois</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefreshModels} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser les modèles
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Précision Modèle</p>
                <p className="text-2xl font-bold">94.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CA Prédit (30j)</p>
                <p className="text-2xl font-bold">{formatCurrency(482000, currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ruptures Prévues</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Zap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Économies Stock</p>
                <p className="text-2xl font-bold">{formatCurrency(28500, currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demand" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Prévision Demande
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Prédiction Ventes
          </TabsTrigger>
          <TabsTrigger value="abc" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Classification ABC
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Optimisation Stock
          </TabsTrigger>
        </TabsList>

        <TabsContent value="demand" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Prévision de la Demande</CardTitle>
                <CardDescription>Modèle LSTM avec intervalles de confiance à 95%</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={demandForecastData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                      <Legend />
                      <Area type="monotone" dataKey="upper" stroke="transparent" fill="hsl(var(--chart-1))" fillOpacity={0.1} name="Limite sup." />
                      <Area type="monotone" dataKey="lower" stroke="transparent" fill="hsl(var(--chart-1))" fillOpacity={0.1} name="Limite inf." />
                      <Area type="monotone" dataKey="predicted" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} name="Prédit" strokeWidth={2} />
                      <Area type="monotone" dataKey="actual" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.5} name="Réel" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Métriques du Modèle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>MAE (Erreur Absolue)</span>
                    <span className="font-medium">312 MAD</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>MAPE</span>
                    <span className="font-medium">5.8%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>R² Score</span>
                    <span className="font-medium">0.942</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Dernière mise à jour</p>
                  <p className="text-sm font-medium">Aujourd'hui à 06:00</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Données d'entraînement</p>
                  <p className="text-sm font-medium">24 mois historiques</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Prédiction des Ventes par Catégorie</CardTitle>
                <CardDescription>Prévisions XGBoost pour les 30 prochains jours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesPredictionData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(value) => `${value / 1000}k`} />
                      <YAxis type="category" dataKey="category" width={100} />
                      <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                      <Bar dataKey="predicted" fill="hsl(var(--chart-1))" name="CA Prédit" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Confiance des Prédictions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {salesPredictionData.map((item) => (
                  <div key={item.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.category}</span>
                      <span className="font-medium">{(item.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={item.confidence * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="abc" className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Distribution ABC</CardTitle>
                <CardDescription>Classification automatique par ML</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={abcClassification}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {abcClassification.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            {abcClassification.map((cls, index) => (
              <Card key={cls.name}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <CardTitle>{cls.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Produits</span>
                      <span className="font-medium">{cls.products}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">% Catalogue</span>
                      <span className="font-medium">{cls.value}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">% CA</span>
                      <span className="font-medium">{cls.revenue}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recommandations de Réapprovisionnement</CardTitle>
              <CardDescription>Optimisation basée sur les prédictions de demande</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPredictions.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{item.product}</p>
                        <p className="text-sm text-muted-foreground">
                          Stock: {item.currentStock} | Demande prévue: {item.predictedDemand}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge variant={item.currentStock < item.reorderPoint ? "destructive" : "default"}>
                          {item.action}
                        </Badge>
                      </div>
                      {item.currentStock < item.predictedDemand ? (
                        <ArrowUpRight className="h-5 w-5 text-destructive" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
