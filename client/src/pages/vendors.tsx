import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  User,
  Trophy,
  Target,
  TrendingUp,
  Award,
  Star,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Briefcase,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useApp } from "@/contexts/AppContext";
import { formatCurrency, formatNumber } from "@/lib/i18n";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Vendor, InsertVendor } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVendorSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const levelColors: Record<string, string> = {
  bronze: "bg-amber-700 text-white",
  silver: "bg-slate-400 text-white",
  gold: "bg-yellow-500 text-white",
  platinum: "bg-slate-300 text-slate-800",
  diamond: "bg-cyan-400 text-white",
};

const levelXpThresholds: Record<string, number> = {
  bronze: 0,
  silver: 1000,
  gold: 5000,
  platinum: 15000,
  diamond: 50000,
};

const contractTypes = [
  { value: "cdi", label: "CDI" },
  { value: "cdd", label: "CDD" },
  { value: "interim", label: "Intérim" },
  { value: "freelance", label: "Freelance" },
];

function getLevelProgress(xp: number, currentLevel: string): number {
  const levels = ["bronze", "silver", "gold", "platinum", "diamond"];
  const currentIdx = levels.indexOf(currentLevel);
  if (currentIdx === levels.length - 1) return 100;
  
  const currentThreshold = levelXpThresholds[currentLevel];
  const nextThreshold = levelXpThresholds[levels[currentIdx + 1]];
  const progress = ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

function getNextLevel(currentLevel: string): string | null {
  const levels = ["bronze", "silver", "gold", "platinum", "diamond"];
  const currentIdx = levels.indexOf(currentLevel);
  if (currentIdx === levels.length - 1) return null;
  return levels[currentIdx + 1];
}

function VendorCard({ vendor }: { vendor: Vendor }) {
  const { currency } = useApp();
  const level = vendor.level || "bronze";
  const xp = vendor.totalXp || 0;
  const progress = getLevelProgress(xp, level);
  const nextLevel = getNextLevel(level);
  
  const initials = vendor.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="hover-elevate" data-testid={`card-vendor-${vendor.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold truncate">{vendor.fullName}</h3>
              <Badge className={levelColors[level]}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{vendor.code}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              {vendor.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {vendor.phone}
                </span>
              )}
              {vendor.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {vendor.city}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">XP: {formatNumber(xp)}</span>
            {nextLevel && (
              <span className="text-muted-foreground">
                Prochain: {nextLevel.charAt(0).toUpperCase() + nextLevel.slice(1)}
              </span>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Commission de base</span>
          <span className="font-medium">{vendor.baseCommissionRate || "2"}%</span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Badge variant={vendor.isActive ? "default" : "secondary"}>
            {vendor.isActive ? "Actif" : "Inactif"}
          </Badge>
          {vendor.contractType && (
            <Badge variant="outline">
              {contractTypes.find(c => c.value === vendor.contractType)?.label || vendor.contractType}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function LeaderboardTable({ vendors }: { vendors: Vendor[] }) {
  const sortedVendors = [...vendors]
    .sort((a, b) => (b.totalXp || 0) - (a.totalXp || 0))
    .slice(0, 10);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Classement des vendeurs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Rang</TableHead>
              <TableHead>Vendeur</TableHead>
              <TableHead>Niveau</TableHead>
              <TableHead className="text-right">XP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedVendors.map((vendor, index) => {
              const initials = vendor.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              const level = vendor.level || "bronze";
              
              return (
                <TableRow key={vendor.id} data-testid={`row-leaderboard-${vendor.id}`}>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                      {index === 1 && <Trophy className="h-5 w-5 text-slate-400" />}
                      {index === 2 && <Trophy className="h-5 w-5 text-amber-700" />}
                      {index > 2 && <span className="text-muted-foreground">{index + 1}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-muted text-sm">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{vendor.fullName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={levelColors[level]}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNumber(vendor.totalXp || 0)}
                  </TableCell>
                </TableRow>
              );
            })}
            {sortedVendors.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Aucun vendeur trouve
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function Vendors() {
  const { t, currency } = useApp();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("list");

  const { data: vendors = [], isLoading, error } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
  });

  const form = useForm<InsertVendor>({
    resolver: zodResolver(insertVendorSchema),
    defaultValues: {
      code: "",
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      cin: "",
      cnss: "",
      contractType: "cdi",
      level: "bronze",
      totalXp: 0,
      baseCommissionRate: "2",
      isActive: true,
      specializations: [],
      skills: [],
      notes: "",
    },
  });

  const createVendorMutation = useMutation({
    mutationFn: async (data: InsertVendor) => {
      const res = await apiRequest("POST", "/api/vendors", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({ title: "Vendeur cree avec succes" });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const deleteVendorMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/vendors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      toast({ title: "Vendeur supprime" });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertVendor) => {
    createVendorMutation.mutate(data);
  };

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vendor.email && vendor.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const activeVendors = vendors.filter((v) => v.isActive);
  const totalXp = vendors.reduce((sum, v) => sum + (v.totalXp || 0), 0);
  const avgXp = vendors.length > 0 ? totalXp / vendors.length : 0;
  const levelCounts = vendors.reduce((acc, v) => {
    const level = v.level || "bronze";
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
        <p className="text-destructive">Erreur de chargement des vendeurs</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/vendors"] })}>
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
            Vendeurs
          </h1>
          <p className="text-muted-foreground">
            {formatNumber(activeVendors.length)} vendeurs actifs
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-vendor">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau vendeur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nouveau vendeur</DialogTitle>
              <DialogDescription>
                Ajouter un nouveau vendeur a l'equipe
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code *</FormLabel>
                        <FormControl>
                          <Input placeholder="VND-001" data-testid="input-code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom complet *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom et prenom" data-testid="input-fullname" {...field} />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@exemple.com" data-testid="input-email" {...field} value={field.value || ""} />
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
                        <FormLabel>Telephone</FormLabel>
                        <FormControl>
                          <Input placeholder="+212 6XX XXX XXX" data-testid="input-phone" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CIN</FormLabel>
                        <FormControl>
                          <Input placeholder="AB123456" data-testid="input-cin" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cnss"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNSS</FormLabel>
                        <FormControl>
                          <Input placeholder="Numero CNSS" data-testid="input-cnss" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contractType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de contrat</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "cdi"}>
                          <FormControl>
                            <SelectTrigger data-testid="select-contract">
                              <SelectValue placeholder="Type de contrat" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {contractTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="baseCommissionRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Commission de base (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="2" data-testid="input-commission" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse</FormLabel>
                        <FormControl>
                          <Input placeholder="Adresse" data-testid="input-address" {...field} value={field.value || ""} />
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
                        <FormLabel>Ville</FormLabel>
                        <FormControl>
                          <Input placeholder="Ville" data-testid="input-city" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Notes sur le vendeur" data-testid="input-notes" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createVendorMutation.isPending} data-testid="button-save-vendor">
                    {createVendorMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enregistrer
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total vendeurs</p>
                <p className="text-2xl font-semibold">{formatNumber(vendors.length)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">XP moyen</p>
                <p className="text-2xl font-semibold">{formatNumber(Math.round(avgXp))}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                <Award className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gold+</p>
                <p className="text-2xl font-semibold">
                  {formatNumber((levelCounts.gold || 0) + (levelCounts.platinum || 0) + (levelCounts.diamond || 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                <Star className="h-5 w-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Diamond</p>
                <p className="text-2xl font-semibold">{formatNumber(levelCounts.diamond || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="list" data-testid="tab-list">Liste</TabsTrigger>
          <TabsTrigger value="leaderboard" data-testid="tab-leaderboard">Classement</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1 md:max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher par nom, code, email..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search-vendors"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredVendors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <User className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">{searchQuery ? "Aucun vendeur trouve" : "Aucun vendeur"}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchQuery ? "Modifiez votre recherche" : "Commencez par ajouter votre premier vendeur"}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredVendors.map((vendor) => (
                    <div key={vendor.id} className="relative">
                      <VendorCard vendor={vendor} />
                      <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-actions-${vendor.id}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Voir profil
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteVendorMutation.mutate(vendor.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4">
          <LeaderboardTable vendors={vendors} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
