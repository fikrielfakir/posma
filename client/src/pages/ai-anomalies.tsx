import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  AlertTriangle, 
  Search, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  Activity,
  FileWarning,
  Filter
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/i18n";

const anomalies = [
  {
    id: "ANO-001",
    type: "fraud",
    severity: "critical",
    entity: "Transaction #VNT-2024-0892",
    description: "Remise excessive de 45% sans autorisation",
    detectedValue: 45,
    expectedValue: 10,
    riskScore: 0.94,
    status: "new",
    detectedAt: new Date(2024, 11, 13, 14, 30),
    user: "Mohammed Alami",
  },
  {
    id: "ANO-002",
    type: "theft",
    severity: "high",
    entity: "Produit: iPhone 15 Pro 256GB",
    description: "Écart d'inventaire: -12 unités non justifiées",
    detectedValue: -12,
    expectedValue: 0,
    riskScore: 0.87,
    status: "investigating",
    detectedAt: new Date(2024, 11, 12, 9, 15),
    user: "Système",
  },
  {
    id: "ANO-003",
    type: "unusual_pattern",
    severity: "medium",
    entity: "Client: SARL TechMaroc",
    description: "Pic d'achats anormal: +340% en 24h",
    detectedValue: 340,
    expectedValue: 100,
    riskScore: 0.72,
    status: "new",
    detectedAt: new Date(2024, 11, 11, 16, 45),
    user: "Système",
  },
  {
    id: "ANO-004",
    type: "price_manipulation",
    severity: "high",
    entity: "Vente #VNT-2024-0876",
    description: "Prix de vente inférieur au coût d'achat",
    detectedValue: 2800,
    expectedValue: 3200,
    riskScore: 0.81,
    status: "confirmed",
    detectedAt: new Date(2024, 11, 10, 11, 20),
    user: "Karim Idrissi",
  },
  {
    id: "ANO-005",
    type: "error",
    severity: "low",
    entity: "Stock: Entrepôt Casa-Nord",
    description: "Stock négatif détecté pour 3 articles",
    detectedValue: -3,
    expectedValue: 0,
    riskScore: 0.45,
    status: "resolved",
    detectedAt: new Date(2024, 11, 9, 8, 0),
    user: "Système",
  },
];

const severityConfig: Record<string, { color: string; label: string }> = {
  critical: { color: "destructive", label: "Critique" },
  high: { color: "destructive", label: "Élevé" },
  medium: { color: "secondary", label: "Moyen" },
  low: { color: "outline", label: "Faible" },
};

const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
  new: { color: "default", label: "Nouveau", icon: Clock },
  investigating: { color: "secondary", label: "Investigation", icon: Search },
  confirmed: { color: "destructive", label: "Confirmé", icon: CheckCircle },
  false_positive: { color: "outline", label: "Faux positif", icon: XCircle },
  resolved: { color: "default", label: "Résolu", icon: CheckCircle },
};

const typeConfig: Record<string, { icon: any; label: string }> = {
  fraud: { icon: Shield, label: "Fraude" },
  theft: { icon: FileWarning, label: "Vol" },
  error: { icon: AlertTriangle, label: "Erreur" },
  unusual_pattern: { icon: Activity, label: "Pattern Inhabituel" },
  price_manipulation: { icon: DollarSign, label: "Manipulation Prix" },
};

export default function AIAnomalies() {
  const { t, currency, language } = useApp();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [selectedAnomaly, setSelectedAnomaly] = useState<typeof anomalies[0] | null>(null);

  const stats = {
    total: anomalies.length,
    critical: anomalies.filter(a => a.severity === "critical").length,
    investigating: anomalies.filter(a => a.status === "investigating").length,
    resolved: anomalies.filter(a => a.status === "resolved").length,
  };

  const filteredAnomalies = anomalies.filter(a => {
    const matchesSearch = a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === "all" || a.severity === severityFilter;
    const matchesTab = activeTab === "all" || a.type === activeTab;
    return matchesSearch && matchesSeverity && matchesTab;
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Détection d'Anomalies
          </h1>
          <p className="text-muted-foreground">Surveillance automatique des fraudes et erreurs</p>
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Configurer Alertes
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Anomalies Totales</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <Shield className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critiques</p>
                <p className="text-2xl font-bold text-destructive">{stats.critical}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <Search className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En Investigation</p>
                <p className="text-2xl font-bold text-orange-600">{stats.investigating}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Résolues</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Tout</TabsTrigger>
          <TabsTrigger value="fraud">Fraude</TabsTrigger>
          <TabsTrigger value="theft">Vol</TabsTrigger>
          <TabsTrigger value="unusual_pattern">Patterns</TabsTrigger>
          <TabsTrigger value="price_manipulation">Prix</TabsTrigger>
          <TabsTrigger value="error">Erreurs</TabsTrigger>
        </TabsList>

        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Rechercher une anomalie..." 
              className="pl-9" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sévérité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="critical">Critique</SelectItem>
              <SelectItem value="high">Élevé</SelectItem>
              <SelectItem value="medium">Moyen</SelectItem>
              <SelectItem value="low">Faible</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Entité</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Score Risque</TableHead>
                    <TableHead>Sévérité</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnomalies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                        Aucune anomalie trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAnomalies.map((anomaly) => {
                      const TypeIcon = typeConfig[anomaly.type]?.icon || AlertTriangle;
                      const StatusIcon = statusConfig[anomaly.status]?.icon || Clock;
                      return (
                        <TableRow key={anomaly.id}>
                          <TableCell className="font-mono text-sm">{anomaly.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <TypeIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{typeConfig[anomaly.type]?.label}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-40 truncate">{anomaly.entity}</TableCell>
                          <TableCell className="max-w-60 truncate">{anomaly.description}</TableCell>
                          <TableCell>
                            <Badge variant={anomaly.riskScore > 0.8 ? "destructive" : anomaly.riskScore > 0.6 ? "secondary" : "outline"}>
                              {(anomaly.riskScore * 100).toFixed(0)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={severityConfig[anomaly.severity]?.color as any}>
                              {severityConfig[anomaly.severity]?.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusConfig[anomaly.status]?.color as any} className="gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig[anomaly.status]?.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(anomaly.detectedAt, language)}
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="icon" variant="ghost" onClick={() => setSelectedAnomaly(anomaly)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <TypeIcon className="h-5 w-5" />
                                    {anomaly.id} - {typeConfig[anomaly.type]?.label}
                                  </DialogTitle>
                                  <DialogDescription>{anomaly.entity}</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg bg-muted">
                                      <p className="text-sm text-muted-foreground mb-1">Valeur Détectée</p>
                                      <p className="text-xl font-bold">{anomaly.detectedValue}</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-muted">
                                      <p className="text-sm text-muted-foreground mb-1">Valeur Attendue</p>
                                      <p className="text-xl font-bold">{anomaly.expectedValue}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Description</Label>
                                    <p className="mt-1 text-sm">{anomaly.description}</p>
                                  </div>
                                  <div>
                                    <Label>Utilisateur Concerné</Label>
                                    <p className="mt-1 text-sm">{anomaly.user}</p>
                                  </div>
                                  <div>
                                    <Label>Notes d'Investigation</Label>
                                    <Textarea placeholder="Ajouter des notes..." className="mt-1" />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline">Marquer Faux Positif</Button>
                                  <Button variant="destructive">Confirmer Anomalie</Button>
                                  <Button>Résoudre</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
