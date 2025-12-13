import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, Plus, Minus, Trash2, Barcode, CreditCard, Banknote, 
  Smartphone, FileCheck, ShoppingCart, X, Loader2, Calculator, Percent
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/contexts/AppContext";
import { formatCurrency } from "@/lib/i18n";
import type { Product, Customer, Warehouse, Stock } from "@shared/schema";

interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  tvaRate: number;
}

interface PaymentLine {
  method: string;
  amount: number;
  receivedAmount?: number;
  changeAmount?: number;
  reference?: string;
}

const TVA_RATES = [
  { value: "20", label: "20%" },
  { value: "14", label: "14%" },
  { value: "10", label: "10%" },
  { value: "7", label: "7%" },
  { value: "0", label: "Exonéré" },
];

const PAYMENT_METHODS = [
  { value: "cash", label: "Espèces", icon: Banknote },
  { value: "card", label: "Carte bancaire", icon: CreditCard },
  { value: "check", label: "Chèque", icon: FileCheck },
  { value: "cashplus", label: "CashPlus", icon: Smartphone },
  { value: "wafacash", label: "Wafacash", icon: Smartphone },
  { value: "orange_money", label: "Orange Money", icon: Smartphone },
];

export default function POS() {
  const { t, currency } = useApp();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [payments, setPayments] = useState<PaymentLine[]>([]);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState("cash");
  const [currentPaymentAmount, setCurrentPaymentAmount] = useState("");
  const [receivedCash, setReceivedCash] = useState("");

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: warehouses = [] } = useQuery<Warehouse[]>({
    queryKey: ["/api/warehouses"],
  });

  const { data: stockItems = [] } = useQuery<Stock[]>({
    queryKey: ["/api/stock"],
  });

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products.filter(p => p.isActive);
    const query = searchQuery.toLowerCase();
    return products.filter(p => 
      p.isActive && (
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        (p.barcode && p.barcode.toLowerCase().includes(query)) ||
        (p.internalCode && p.internalCode.toLowerCase().includes(query))
      )
    );
  }, [products, searchQuery]);

  const getStockForProduct = (productId: string) => {
    if (!selectedWarehouse || selectedWarehouse === "all") {
      return stockItems
        .filter(s => s.productId === productId)
        .reduce((sum, s) => sum + Number(s.quantity), 0);
    }
    const stockItem = stockItems.find(s => s.productId === productId && s.warehouseId === selectedWarehouse);
    return stockItem ? Number(stockItem.quantity) : 0;
  };

  const addToCart = (product: Product) => {
    const existingIndex = cart.findIndex(item => item.product.id === product.id);
    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, {
        product,
        quantity: 1,
        unitPrice: Number(product.sellingPrice) || 0,
        discountPercent: 0,
        tvaRate: Number(product.tvaRate) || 20,
      }]);
    }
  };

  const updateCartItem = (index: number, updates: Partial<CartItem>) => {
    const updated = [...cart];
    updated[index] = { ...updated[index], ...updates };
    setCart(updated);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
    setGlobalDiscount(0);
    setSelectedCustomer("");
    setPayments([]);
  };

  const calculateItemTotal = (item: CartItem) => {
    const subtotal = item.quantity * item.unitPrice;
    const discount = subtotal * (item.discountPercent / 100);
    const afterDiscount = subtotal - discount;
    const tva = afterDiscount * (item.tvaRate / 100);
    return { subtotal, discount, afterDiscount, tva, total: afterDiscount + tva };
  };

  const cartTotals = useMemo(() => {
    let subtotal = 0;
    let totalItemDiscount = 0;
    let base20 = 0, base14 = 0, base10 = 0, base7 = 0;

    cart.forEach(item => {
      const calc = calculateItemTotal(item);
      subtotal += calc.subtotal;
      totalItemDiscount += calc.discount;
      
      if (item.tvaRate === 20) base20 += calc.afterDiscount;
      else if (item.tvaRate === 14) base14 += calc.afterDiscount;
      else if (item.tvaRate === 10) base10 += calc.afterDiscount;
      else if (item.tvaRate === 7) base7 += calc.afterDiscount;
    });

    const afterItemDiscount = subtotal - totalItemDiscount;
    const globalDiscountFactor = 1 - (globalDiscount / 100);
    const globalDiscountAmount = afterItemDiscount * (globalDiscount / 100);
    
    const adjusted20 = base20 * globalDiscountFactor;
    const adjusted14 = base14 * globalDiscountFactor;
    const adjusted10 = base10 * globalDiscountFactor;
    const adjusted7 = base7 * globalDiscountFactor;
    
    const tva20 = adjusted20 * 0.20;
    const tva14 = adjusted14 * 0.14;
    const tva10 = adjusted10 * 0.10;
    const tva7 = adjusted7 * 0.07;
    
    const afterGlobalDiscount = afterItemDiscount - globalDiscountAmount;
    const totalTva = tva20 + tva14 + tva10 + tva7;
    const grandTotal = afterGlobalDiscount + totalTva;

    return {
      subtotal,
      totalDiscount: totalItemDiscount + globalDiscountAmount,
      afterDiscount: afterGlobalDiscount,
      tva20, tva14, tva10, tva7,
      totalTva,
      grandTotal,
    };
  }, [cart, globalDiscount]);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = cartTotals.grandTotal - totalPaid;
  const change = receivedCash ? Math.max(0, Number(receivedCash) - remaining) : 0;

  const addPayment = () => {
    const amount = Number(currentPaymentAmount) || remaining;
    if (amount <= 0) return;
    
    const paymentAmount = Math.min(amount, remaining);
    const newPayment: PaymentLine = {
      method: currentPaymentMethod,
      amount: paymentAmount,
    };
    
    if (currentPaymentMethod === "cash" && receivedCash) {
      const received = Number(receivedCash);
      newPayment.receivedAmount = received;
      newPayment.changeAmount = Math.max(0, received - paymentAmount);
    }
    
    setPayments([...payments, newPayment]);
    setCurrentPaymentAmount("");
    setReceivedCash("");
  };

  const removePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const createSaleMutation = useMutation({
    mutationFn: async () => {
      const invoiceNumber = `VNT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      
      const saleRes = await apiRequest("POST", "/api/sales", {
        customerId: selectedCustomer && selectedCustomer !== "walk-in" ? selectedCustomer : null,
        warehouseId: selectedWarehouse && selectedWarehouse !== "all" ? selectedWarehouse : null,
        invoiceNumber,
        status: "paid",
        saleDate: new Date().toISOString(),
        subtotal: String(cartTotals.subtotal),
        discountPercent: String(globalDiscount),
        discountAmount: String(cartTotals.totalDiscount),
        tvaAmount: String(cartTotals.totalTva),
        total: String(cartTotals.grandTotal),
        paidAmount: String(totalPaid),
        paymentMethod: payments[0]?.method || "cash",
      });
      const sale = await saleRes.json();

      for (const item of cart) {
        const calc = calculateItemTotal(item);
        await apiRequest("POST", "/api/sale-items", {
          saleId: sale.id,
          productId: item.product.id,
          quantity: String(item.quantity),
          unitPrice: String(item.unitPrice),
          discountPercent: String(item.discountPercent),
          tvaRate: String(item.tvaRate),
          subtotal: String(calc.subtotal),
          tvaAmount: String(calc.tva),
          total: String(calc.total),
        });
      }

      for (const payment of payments) {
        await apiRequest("POST", "/api/payments", {
          saleId: sale.id,
          method: payment.method,
          amount: String(payment.amount),
          receivedAmount: payment.receivedAmount ? String(payment.receivedAmount) : null,
          changeAmount: payment.changeAmount ? String(payment.changeAmount) : null,
          status: "completed",
        });
      }

      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stock"] });
      toast({ title: "Succès", description: "Vente enregistrée avec succès" });
      clearCart();
      setIsPaymentOpen(false);
    },
    onError: () => {
      toast({ title: "Erreur", description: "Erreur lors de l'enregistrement", variant: "destructive" });
    },
  });

  const handleFinalizeSale = () => {
    if (cart.length === 0) {
      toast({ title: "Erreur", description: "Le panier est vide", variant: "destructive" });
      return;
    }
    if (remaining > 0.01) {
      toast({ title: "Erreur", description: "Le paiement n'est pas complet", variant: "destructive" });
      return;
    }
    createSaleMutation.mutate();
  };

  if (productsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-full gap-4 p-4">
      <div className="flex flex-1 flex-col gap-4">
        <Card className="flex-none">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher par nom, SKU ou code-barres..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-pos-search"
                />
              </div>
              <Button variant="outline" size="icon" data-testid="button-barcode-scan">
                <Barcode className="h-4 w-4" />
              </Button>
              <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                <SelectTrigger className="w-[180px]" data-testid="select-pos-warehouse">
                  <SelectValue placeholder="Entrepôt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les entrepôts</SelectItem>
                  {warehouses.map(w => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Produits</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-320px)]">
              <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {filteredProducts.map(product => {
                  const stock = getStockForProduct(product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="flex cursor-pointer flex-col rounded-lg border p-3 hover-elevate active-elevate-2"
                      data-testid={`product-card-${product.id}`}
                    >
                      <div className="mb-2 flex h-16 items-center justify-center rounded bg-muted">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover rounded" />
                        ) : (
                          <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-sm font-medium line-clamp-2">{product.name}</span>
                      <span className="text-xs text-muted-foreground">{product.sku}</span>
                      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                        <span className="text-sm font-semibold">
                          {formatCurrency(Number(product.sellingPrice) || 0, currency)}
                        </span>
                        <Badge variant={stock > 0 ? "secondary" : "destructive"} className="text-xs">
                          {stock}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card className="w-[400px] flex flex-col">
        <CardHeader className="flex-none pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Panier ({cart.length})
            </CardTitle>
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart} data-testid="button-clear-cart">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
            <SelectTrigger data-testid="select-pos-customer">
              <SelectValue placeholder="Client (optionnel)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="walk-in">Client de passage</SelectItem>
              {customers.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-[calc(100vh-520px)]">
            <div className="space-y-2 p-4">
              {cart.map((item, index) => (
                <div key={index} className="rounded-lg border p-3" data-testid={`cart-item-${index}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium line-clamp-1">{item.product.name}</span>
                      <span className="text-xs text-muted-foreground">{item.product.sku}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFromCart(index)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateCartItem(index, { quantity: Math.max(1, item.quantity - 1) })}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateCartItem(index, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                      className="h-7 w-14 text-center text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateCartItem(index, { quantity: item.quantity + 1 })}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <span className="ml-auto text-sm font-medium">
                      {formatCurrency(calculateItemTotal(item).total, currency)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Percent className="h-3 w-3 text-muted-foreground" />
                      <Input
                        type="number"
                        value={item.discountPercent}
                        onChange={(e) => updateCartItem(index, { discountPercent: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })}
                        className="h-6 w-12 text-xs"
                        placeholder="0"
                      />
                    </div>
                    <Select
                      value={String(item.tvaRate)}
                      onValueChange={(v) => updateCartItem(index, { tvaRate: Number(v) })}
                    >
                      <SelectTrigger className="h-6 w-20 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TVA_RATES.map(rate => (
                          <SelectItem key={rate.value} value={rate.value}>{rate.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mb-2" />
                  <span>Panier vide</span>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        <div className="flex-none border-t p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sous-total:</span>
              <span>{formatCurrency(cartTotals.subtotal, currency)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">Remise globale:</span>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={globalDiscount}
                  onChange={(e) => setGlobalDiscount(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                  className="h-6 w-14 text-xs text-right"
                  data-testid="input-global-discount"
                />
                <span className="text-xs">%</span>
              </div>
            </div>
            {cartTotals.totalDiscount > 0 && (
              <div className="flex justify-between text-destructive">
                <span>Remise totale:</span>
                <span>-{formatCurrency(cartTotals.totalDiscount, currency)}</span>
              </div>
            )}
            {cartTotals.tva20 > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>TVA 20%:</span>
                <span>{formatCurrency(cartTotals.tva20, currency)}</span>
              </div>
            )}
            {cartTotals.tva14 > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>TVA 14%:</span>
                <span>{formatCurrency(cartTotals.tva14, currency)}</span>
              </div>
            )}
            {cartTotals.tva10 > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>TVA 10%:</span>
                <span>{formatCurrency(cartTotals.tva10, currency)}</span>
              </div>
            )}
            {cartTotals.tva7 > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>TVA 7%:</span>
                <span>{formatCurrency(cartTotals.tva7, currency)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total TTC:</span>
              <span>{formatCurrency(cartTotals.grandTotal, currency)}</span>
            </div>
          </div>

          <Button 
            className="mt-4 w-full" 
            size="lg"
            disabled={cart.length === 0}
            onClick={() => setIsPaymentOpen(true)}
            data-testid="button-proceed-payment"
          >
            <Calculator className="mr-2 h-4 w-4" />
            Paiement
          </Button>
        </div>
      </Card>

      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Paiement</DialogTitle>
            <DialogDescription>
              Total à payer: <span className="font-bold">{formatCurrency(cartTotals.grandTotal, currency)}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map(method => (
                <Button
                  key={method.value}
                  variant={currentPaymentMethod === method.value ? "default" : "outline"}
                  onClick={() => setCurrentPaymentMethod(method.value)}
                  className="flex flex-col gap-1 h-auto py-3"
                  data-testid={`payment-method-${method.value}`}
                >
                  <method.icon className="h-5 w-5" />
                  <span className="text-xs">{method.label}</span>
                </Button>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label className="text-xs">Montant</Label>
                  <Input
                    type="number"
                    value={currentPaymentAmount}
                    onChange={(e) => setCurrentPaymentAmount(e.target.value)}
                    placeholder={String(remaining.toFixed(2))}
                    data-testid="input-payment-amount"
                  />
                </div>
                {currentPaymentMethod === "cash" && (
                  <div className="flex-1">
                    <Label className="text-xs">Montant reçu</Label>
                    <Input
                      type="number"
                      value={receivedCash}
                      onChange={(e) => setReceivedCash(e.target.value)}
                      placeholder="0.00"
                      data-testid="input-received-cash"
                    />
                  </div>
                )}
              </div>

              {currentPaymentMethod === "cash" && receivedCash && Number(receivedCash) > 0 && (
                <div className="rounded-lg bg-muted p-3 text-center">
                  <span className="text-sm text-muted-foreground">Monnaie à rendre:</span>
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(Math.max(0, Number(receivedCash) - remaining), currency)}
                  </div>
                </div>
              )}

              <Button onClick={addPayment} className="w-full" disabled={remaining <= 0} data-testid="button-add-payment">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter paiement
              </Button>
            </div>

            {payments.length > 0 && (
              <div className="space-y-2">
                <Label>Paiements ajoutés</Label>
                {payments.map((payment, index) => {
                  const methodInfo = PAYMENT_METHODS.find(m => m.value === payment.method);
                  return (
                    <div key={index} className="flex items-center justify-between rounded-lg border p-2">
                      <div className="flex items-center gap-2">
                        {methodInfo && <methodInfo.icon className="h-4 w-4" />}
                        <span>{methodInfo?.label || payment.method}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatCurrency(payment.amount, currency)}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removePayment(index)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total payé:</span>
                <span className="font-medium">{formatCurrency(totalPaid, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Reste à payer:</span>
                <span className={remaining > 0 ? "font-medium text-destructive" : "font-medium text-green-600"}>
                  {formatCurrency(Math.max(0, remaining), currency)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleFinalizeSale}
              disabled={remaining > 0.01 || createSaleMutation.isPending}
              data-testid="button-finalize-sale"
            >
              {createSaleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Valider la vente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
