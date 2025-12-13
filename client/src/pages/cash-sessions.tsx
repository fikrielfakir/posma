import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Wallet, Play, Square, Clock, Calendar, ChevronRight, 
  Plus, Minus, Loader2, AlertTriangle, CheckCircle2, XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApp } from "@/contexts/AppContext";
import { formatCurrency } from "@/lib/i18n";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { CashSession, Warehouse, User, CashMovement } from "@shared/schema";

const MOVEMENT_TYPES = [
  { value: "deposit", label: "Dépôt", icon: Plus },
  { value: "withdrawal", label: "Retrait", icon: Minus },
  { value: "bank_deposit", label: "Versement banque", icon: Wallet },
];

const MOVEMENT_REASONS = [
  { value: "expense", label: "Dépense" },
  { value: "advance", label: "Avance" },
  { value: "petty_cash", label: "Petite caisse" },
  { value: "bank_transfer", label: "Remise en banque" },
  { value: "other", label: "Autre" },
];

export default function CashSessions() {
  const { t, currency } = useApp();
  const { toast } = useToast();
  
  const [isOpenSessionOpen, setIsOpenSessionOpen] = useState(false);
  const [isCloseSessionOpen, setIsCloseSessionOpen] = useState(false);
  const [isMovementOpen, setIsMovementOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CashSession | null>(null);
  
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [openingCash, setOpeningCash] = useState("");
  const [closingCash, setClosingCash] = useState("");
  const [closingNotes, setClosingNotes] = useState("");
  const [differenceJustification, setDifferenceJustification] = useState("");
  
  const [movementType, setMovementType] = useState("deposit");
  const [movementReason, setMovementReason] = useState("other");
  const [movementAmount, setMovementAmount] = useState("");
  const [movementDescription, setMovementDescription] = useState("");

  const { data: cashSessions = [], isLoading: sessionsLoading } = useQuery<CashSession[]>({
    queryKey: ["/api/cash-sessions"],
  });

  const { data: warehouses = [] } = useQuery<Warehouse[]>({
    queryKey: ["/api/warehouses"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const openSession = cashSessions.find(s => s.status === "open");

  const { data: cashMovements = [] } = useQuery<CashMovement[]>({
    queryKey: ["/api/cash-movements", openSession?.id],
    queryFn: async () => {
      if (!openSession?.id) return [];
      const res = await fetch(`/api/cash-movements?sessionId=${openSession.id}`);
      if (!res.ok) throw new Error("Failed to fetch movements");
      return res.json();
    },
    enabled: !!openSession?.id,
  });

  const getWarehouseName = (id: string | null) => {
    if (!id) return "Non défini";
    const warehouse = warehouses.find(w => w.id === id);
    return warehouse?.name || "Non défini";
  };

  const getCashierName = (id: string | null) => {
    if (!id) return "Non défini";
    const user = users.find(u => u.id === id);
    return user?.fullName || user?.username || "Non défini";
  };

  const getSessionMovements = (sessionId: string) => {
    return cashMovements.filter(m => m.sessionId === sessionId);
  };

  const openSessionMutation = useMutation({
    mutationFn: async () => {
      const sessionNumber = `CAISSE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const res = await apiRequest("POST", "/api/cash-sessions", {
        warehouseId: selectedWarehouse || null,
        sessionNumber,
        status: "open",
        openingDate: new Date().toISOString(),
        openingCash: openingCash || "0",
        expectedCash: openingCash || "0",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cash-sessions"] });
      toast({ title: "Succès", description: "Session de caisse ouverte" });
      setIsOpenSessionOpen(false);
      setOpeningCash("");
      setSelectedWarehouse("");
    },
    onError: () => {
      toast({ title: "Erreur", description: "Erreur lors de l'ouverture", variant: "destructive" });
    },
  });

  const closeSessionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSession) throw new Error("No session selected");
      
      const actualCash = Number(closingCash) || 0;
      const expectedCash = Number(selectedSession.expectedCash) || 0;
      const difference = actualCash - expectedCash;
      
      const res = await apiRequest("PATCH", `/api/cash-sessions/${selectedSession.id}`, {
        status: "closed",
        closingDate: new Date().toISOString(),
        actualCash: String(actualCash),
        cashDifference: String(difference),
        differenceJustification: difference !== 0 ? differenceJustification : null,
        notes: closingNotes || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cash-sessions"] });
      toast({ title: "Succès", description: "Session de caisse clôturée" });
      setIsCloseSessionOpen(false);
      setSelectedSession(null);
      setClosingCash("");
      setClosingNotes("");
      setDifferenceJustification("");
    },
    onError: () => {
      toast({ title: "Erreur", description: "Erreur lors de la clôture", variant: "destructive" });
    },
  });

  const addMovementMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSession) throw new Error("No session selected");
      
      const amount = Number(movementAmount) || 0;
      if (amount <= 0) throw new Error("Invalid amount");
      
      await apiRequest("POST", "/api/cash-movements", {
        sessionId: selectedSession.id,
        type: movementType,
        reason: movementReason,
        amount: String(amount),
        description: movementDescription || null,
      });
      
      const currentExpected = Number(selectedSession.expectedCash) || 0;
      const newExpected = movementType === "deposit" 
        ? currentExpected + amount 
        : currentExpected - amount;
      
      const updateField = movementType === "deposit" ? "totalDeposits" : "totalWithdrawals";
      const currentTotal = Number(selectedSession[updateField as keyof CashSession]) || 0;
      
      await apiRequest("PATCH", `/api/cash-sessions/${selectedSession.id}`, {
        expectedCash: String(newExpected),
        [updateField]: String(currentTotal + amount),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cash-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cash-movements", selectedSession?.id] });
      toast({ title: "Succès", description: "Mouvement enregistré" });
      setIsMovementOpen(false);
      setMovementAmount("");
      setMovementDescription("");
    },
    onError: () => {
      toast({ title: "Erreur", description: "Erreur lors de l'enregistrement", variant: "destructive" });
    },
  });

  const handleOpenClose = (session: CashSession) => {
    setSelectedSession(session);
    setIsCloseSessionOpen(true);
  };

  const handleAddMovement = (session: CashSession) => {
    setSelectedSession(session);
    setIsMovementOpen(true);
  };

  if (sessionsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const closedSessions = cashSessions.filter(s => s.status === "closed");

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Gestion de Caisse</h1>
          <p className="text-muted-foreground">Gérez vos sessions de caisse et mouvements d'espèces</p>
        </div>
        {!openSession && (
          <Button onClick={() => setIsOpenSessionOpen(true)} data-testid="button-open-session">
            <Play className="mr-2 h-4 w-4" />
            Ouvrir une caisse
          </Button>
        )}
      </div>

      {openSession && (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-500/20 p-2">
                  <Wallet className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Session Active
                    <Badge variant="secondary" className="bg-green-500/20 text-green-700">
                      {openSession.sessionNumber}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Ouverte le {format(new Date(openSession.openingDate!), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                    {" - "}{getWarehouseName(openSession.warehouseId)}
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleAddMovement(openSession)} data-testid="button-add-movement">
                  <Plus className="mr-2 h-4 w-4" />
                  Mouvement
                </Button>
                <Button variant="destructive" onClick={() => handleOpenClose(openSession)} data-testid="button-close-session">
                  <Square className="mr-2 h-4 w-4" />
                  Clôturer
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Fond de caisse</div>
                <div className="text-2xl font-bold" data-testid="text-opening-cash">
                  {formatCurrency(Number(openSession.openingCash) || 0, currency)}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Ventes espèces</div>
                <div className="text-2xl font-bold text-green-600" data-testid="text-cash-sales">
                  {formatCurrency(Number(openSession.totalCashPayments) || 0, currency)}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Dépôts / Retraits</div>
                <div className="text-2xl font-bold">
                  <span className="text-green-600">+{formatCurrency(Number(openSession.totalDeposits) || 0, currency)}</span>
                  {" / "}
                  <span className="text-red-600">-{formatCurrency(Number(openSession.totalWithdrawals) || 0, currency)}</span>
                </div>
              </div>
              <div className="rounded-lg border p-4 bg-muted/50">
                <div className="text-sm text-muted-foreground">Solde attendu</div>
                <div className="text-2xl font-bold" data-testid="text-expected-cash">
                  {formatCurrency(Number(openSession.expectedCash) || 0, currency)}
                </div>
              </div>
            </div>
            
            {getSessionMovements(openSession.id).length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 font-medium">Mouvements de la session</h4>
                <div className="space-y-2">
                  {getSessionMovements(openSession.id).map(movement => (
                    <div key={movement.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        {movement.type === "deposit" ? (
                          <Plus className="h-4 w-4 text-green-600" />
                        ) : (
                          <Minus className="h-4 w-4 text-red-600" />
                        )}
                        <div>
                          <span className="font-medium">
                            {MOVEMENT_REASONS.find(r => r.value === movement.reason)?.label || movement.reason}
                          </span>
                          {movement.description && (
                            <span className="ml-2 text-sm text-muted-foreground">{movement.description}</span>
                          )}
                        </div>
                      </div>
                      <span className={movement.type === "deposit" ? "font-medium text-green-600" : "font-medium text-red-600"}>
                        {movement.type === "deposit" ? "+" : "-"}{formatCurrency(Number(movement.amount), currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historique des sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {closedSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mb-2" />
              <span>Aucune session clôturée</span>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {closedSessions.map(session => {
                  const difference = Number(session.cashDifference) || 0;
                  const hasDifference = Math.abs(difference) > 0.01;
                  
                  return (
                    <div key={session.id} className="rounded-lg border p-4" data-testid={`session-card-${session.id}`}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`rounded-full p-2 ${hasDifference ? 'bg-yellow-500/20' : 'bg-green-500/20'}`}>
                            {hasDifference ? (
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{session.sessionNumber}</span>
                              <Badge variant="outline">{getWarehouseName(session.warehouseId)}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(session.openingDate!), "dd/MM/yyyy HH:mm", { locale: fr })}
                              {" - "}
                              {session.closingDate && format(new Date(session.closingDate), "dd/MM/yyyy HH:mm", { locale: fr })}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(Number(session.actualCash) || 0, currency)}</div>
                          {hasDifference && (
                            <div className={`text-sm ${difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              Écart: {difference > 0 ? '+' : ''}{formatCurrency(difference, currency)}
                            </div>
                          )}
                        </div>
                      </div>
                      {session.differenceJustification && (
                        <div className="mt-2 rounded bg-muted/50 p-2 text-sm text-muted-foreground">
                          Justification: {session.differenceJustification}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpenSessionOpen} onOpenChange={setIsOpenSessionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ouvrir une session de caisse</DialogTitle>
            <DialogDescription>
              Entrez le fond de caisse pour commencer la session
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Point de vente / Entrepôt</Label>
              <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                <SelectTrigger data-testid="select-open-warehouse">
                  <SelectValue placeholder="Sélectionner un point de vente" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map(w => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fond de caisse (espèces)</Label>
              <Input
                type="number"
                value={openingCash}
                onChange={(e) => setOpeningCash(e.target.value)}
                placeholder="0.00"
                data-testid="input-opening-cash"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpenSessionOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={() => openSessionMutation.mutate()}
              disabled={openSessionMutation.isPending}
              data-testid="button-confirm-open"
            >
              {openSessionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ouvrir la caisse
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCloseSessionOpen} onOpenChange={setIsCloseSessionOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Clôturer la session de caisse</DialogTitle>
            <DialogDescription>
              Comptez les espèces en caisse et validez la clôture
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Solde attendu:</span>
                  <span className="font-bold">{formatCurrency(Number(selectedSession.expectedCash) || 0, currency)}</span>
                </div>
              </div>
              
              <div>
                <Label>Montant réel en caisse</Label>
                <Input
                  type="number"
                  value={closingCash}
                  onChange={(e) => setClosingCash(e.target.value)}
                  placeholder="0.00"
                  data-testid="input-closing-cash"
                />
              </div>
              
              {closingCash && Math.abs(Number(closingCash) - Number(selectedSession.expectedCash)) > 0.01 && (
                <>
                  <div className={`flex items-center gap-2 rounded-lg p-3 ${
                    Number(closingCash) > Number(selectedSession.expectedCash) 
                      ? 'bg-green-500/10 text-green-700' 
                      : 'bg-red-500/10 text-red-700'
                  }`}>
                    {Number(closingCash) > Number(selectedSession.expectedCash) ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                    <span className="font-medium">
                      Écart de {formatCurrency(Math.abs(Number(closingCash) - Number(selectedSession.expectedCash)), currency)}
                      {Number(closingCash) > Number(selectedSession.expectedCash) ? ' en plus' : ' en moins'}
                    </span>
                  </div>
                  <div>
                    <Label>Justification de l'écart</Label>
                    <Textarea
                      value={differenceJustification}
                      onChange={(e) => setDifferenceJustification(e.target.value)}
                      placeholder="Expliquez la raison de l'écart..."
                      data-testid="input-difference-justification"
                    />
                  </div>
                </>
              )}
              
              <div>
                <Label>Notes (optionnel)</Label>
                <Textarea
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="Notes de fin de session..."
                  data-testid="input-closing-notes"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCloseSessionOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive"
              onClick={() => closeSessionMutation.mutate()}
              disabled={closeSessionMutation.isPending || !closingCash}
              data-testid="button-confirm-close"
            >
              {closeSessionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Clôturer la caisse
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isMovementOpen} onOpenChange={setIsMovementOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enregistrer un mouvement</DialogTitle>
            <DialogDescription>
              Ajoutez un dépôt ou un retrait dans la caisse
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Type de mouvement</Label>
              <Select value={movementType} onValueChange={setMovementType}>
                <SelectTrigger data-testid="select-movement-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOVEMENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Motif</Label>
              <Select value={movementReason} onValueChange={setMovementReason}>
                <SelectTrigger data-testid="select-movement-reason">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOVEMENT_REASONS.map(reason => (
                    <SelectItem key={reason.value} value={reason.value}>{reason.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Montant</Label>
              <Input
                type="number"
                value={movementAmount}
                onChange={(e) => setMovementAmount(e.target.value)}
                placeholder="0.00"
                data-testid="input-movement-amount"
              />
            </div>
            <div>
              <Label>Description (optionnel)</Label>
              <Input
                value={movementDescription}
                onChange={(e) => setMovementDescription(e.target.value)}
                placeholder="Description du mouvement..."
                data-testid="input-movement-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMovementOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={() => addMovementMutation.mutate()}
              disabled={addMovementMutation.isPending || !movementAmount}
              data-testid="button-confirm-movement"
            >
              {addMovementMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
