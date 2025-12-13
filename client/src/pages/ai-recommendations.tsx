import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Lightbulb, 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  Target,
  DollarSign,
  Check,
  X,
  ArrowRight,
  Sparkles,
  Gift,
  Percent,
  Star,
  Eye
} from "lucide-react";
import { formatCurrency } from "@/lib/i18n";

const crossSellRecommendations = [
  { 
    customer: "Entreprise ABC", 
    currentProduct: "MacBook Pro 16\"", 
    recommended: ["Magic Keyboard", "Magic Mouse", "USB-C Hub"],
    score: 0.94,
    potentialRevenue: 4500,
  },
  { 
    customer: "SARL Tech Solutions", 
    currentProduct: "iPhone 15 Pro", 
    recommended: ["AirPods Pro", "MagSafe Charger", "Coque Protection"],
    score: 0.89,
    potentialRevenue: 2800,
  },
  { 
    customer: "Mohamed El Amrani", 
    currentProduct: "Samsung Galaxy S24", 
    recommended: ["Galaxy Buds Pro", "Wireless Charger", "Étui Cuir"],
    score: 0.86,
    potentialRevenue: 1900,
  },
];

const upSellRecommendations = [
  { 
    product: "iPhone 15", 
    upgradeFrom: 128, 
    upgradeTo: 256, 
    priceDiff: 1000,
    successRate: 0.34,
    customers: 45,
  },
  { 
    product: "MacBook Air M3", 
    upgradeFrom: 8, 
    upgradeTo: 16, 
    priceDiff: 2000,
    successRate: 0.28,
    customers: 23,
  },
  { 
    product: "iPad Pro", 
    upgradeFrom: "11\"", 
    upgradeTo: "12.9\"", 
    priceDiff: 3000,
    successRate: 0.21,
    customers: 18,
  },
];

const promotionRecommendations = [
  {
    segment: "Clients Fidèles (Gold)",
    customers: 156,
    recommendation: "Offre -15% sur accessoires",
    expectedLift: "+22%",
    confidence: 0.91,
  },
  {
    segment: "Nouveaux Clients",
    customers: 89,
    recommendation: "Livraison gratuite",
    expectedLift: "+18%",
    confidence: 0.87,
  },
  {
    segment: "Clients Inactifs (90j+)",
    customers: 234,
    recommendation: "Coupon 500 MAD",
    expectedLift: "+35%",
    confidence: 0.82,
  },
];

const personalizedOffers = [
  { customer: "Ahmed Benali", offer: "iPhone 15 Pro + AirPods = -10%", expires: "3 jours", status: "sent" },
  { customer: "Fatima Zahra", offer: "Pack Bureau Complet -20%", expires: "5 jours", status: "viewed" },
  { customer: "Karim Idrissi", offer: "Mise à niveau gratuite 256GB", expires: "7 jours", status: "pending" },
  { customer: "Sara Tazi", offer: "Accessoires -25% (panier >5000 MAD)", expires: "2 jours", status: "accepted" },
];

export default function AIRecommendations() {
  const { t, currency } = useApp();
  const [activeTab, setActiveTab] = useState("cross-sell");

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold flex items-center gap-3">
            <Lightbulb className="h-8 w-8 text-primary" />
            Recommandations IA
          </h1>
          <p className="text-muted-foreground">Suggestions personnalisées pour augmenter les ventes</p>
        </div>
        <Button>
          <Sparkles className="mr-2 h-4 w-4" />
          Générer Nouvelles Recommandations
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenus Potentiels</p>
                <p className="text-2xl font-bold">{formatCurrency(156000, currency)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taux Conversion</p>
                <p className="text-2xl font-bold">28.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clients Ciblés</p>
                <p className="text-2xl font-bold">479</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <Star className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Score Moyen</p>
                <p className="text-2xl font-bold">0.87</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cross-sell" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Cross-Sell
          </TabsTrigger>
          <TabsTrigger value="upsell" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Up-Sell
          </TabsTrigger>
          <TabsTrigger value="promotions" className="flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Promotions
          </TabsTrigger>
          <TabsTrigger value="personalized" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Offres Personnalisées
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cross-sell" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recommandations Cross-Sell</CardTitle>
              <CardDescription>Produits complémentaires à suggérer lors des achats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {crossSellRecommendations.map((rec, index) => (
                  <div key={index} className="p-4 rounded-lg border">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-medium">{rec.customer}</p>
                        <p className="text-sm text-muted-foreground">Achat actuel: {rec.currentProduct}</p>
                      </div>
                      <div className="text-right">
                        <Badge className="mb-1">Score: {(rec.score * 100).toFixed(0)}%</Badge>
                        <p className="text-sm font-medium text-green-600">
                          +{formatCurrency(rec.potentialRevenue, currency)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Recommander:</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {rec.recommended.map((item, i) => (
                        <Badge key={i} variant="outline">{item}</Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">
                        <Check className="mr-2 h-4 w-4" />
                        Appliquer
                      </Button>
                      <Button size="sm" variant="outline">
                        <X className="mr-2 h-4 w-4" />
                        Ignorer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upsell" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Opportunités Up-Sell</CardTitle>
              <CardDescription>Mises à niveau recommandées par produit</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>De</TableHead>
                    <TableHead>Vers</TableHead>
                    <TableHead>Différence Prix</TableHead>
                    <TableHead>Taux Succès</TableHead>
                    <TableHead>Clients Potentiels</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upSellRecommendations.map((rec, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{rec.product}</TableCell>
                      <TableCell>{rec.upgradeFrom}{typeof rec.upgradeFrom === "number" ? " GB" : ""}</TableCell>
                      <TableCell>{rec.upgradeTo}{typeof rec.upgradeTo === "number" ? " GB" : ""}</TableCell>
                      <TableCell className="text-green-600">+{formatCurrency(rec.priceDiff, currency)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={rec.successRate * 100} className="w-20 h-2" />
                          <span className="text-sm">{(rec.successRate * 100).toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{rec.customers}</TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotions" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recommandations Promotionnelles</CardTitle>
              <CardDescription>Offres optimisées par segment client</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {promotionRecommendations.map((rec, index) => (
                  <div key={index} className="p-4 rounded-lg border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium">{rec.segment}</p>
                        <p className="text-sm text-muted-foreground">{rec.customers} clients</p>
                      </div>
                      <Badge variant={rec.confidence > 0.9 ? "default" : "secondary"}>
                        Confiance: {(rec.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-primary" />
                        <span className="font-medium">{rec.recommendation}</span>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {rec.expectedLift} ventes
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm">Créer Campagne</Button>
                      <Button size="sm" variant="outline">Détails</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personalized" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Offres Personnalisées</CardTitle>
              <CardDescription>Offres individuelles générées par IA</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Offre</TableHead>
                    <TableHead>Expire dans</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {personalizedOffers.map((offer, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{offer.customer}</TableCell>
                      <TableCell>{offer.offer}</TableCell>
                      <TableCell>{offer.expires}</TableCell>
                      <TableCell>
                        <Badge variant={
                          offer.status === "accepted" ? "default" :
                          offer.status === "viewed" ? "secondary" :
                          offer.status === "sent" ? "outline" : "outline"
                        }>
                          {offer.status === "accepted" ? "Acceptée" :
                           offer.status === "viewed" ? "Vue" :
                           offer.status === "sent" ? "Envoyée" : "En attente"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
