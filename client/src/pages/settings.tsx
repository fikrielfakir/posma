import { Building2, Globe, Palette, Bell, Shield, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/contexts/AppContext";
import { languages, currencies, type Language, type Currency } from "@/lib/i18n";

export default function Settings() {
  const { t, language, setLanguage, currency, setCurrency, theme, setTheme } = useApp();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">{t("settings")}</h1>
        <p className="text-muted-foreground">Configuration du système et préférences</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList>
          <TabsTrigger value="company" data-testid="tab-company"><Building2 className="mr-2 h-4 w-4" />{t("companySettings")}</TabsTrigger>
          <TabsTrigger value="localization" data-testid="tab-localization"><Globe className="mr-2 h-4 w-4" />Localisation</TabsTrigger>
          <TabsTrigger value="appearance" data-testid="tab-appearance"><Palette className="mr-2 h-4 w-4" />Apparence</TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications"><Bell className="mr-2 h-4 w-4" />{t("notifications")}</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Informations de l'entreprise</CardTitle>
              <CardDescription>Paramètres généraux et informations fiscales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Nom de l'entreprise</Label><Input placeholder="Nom" defaultValue="StockFlow SARL" /></div>
                <div className="space-y-2"><Label>{t("email")}</Label><Input type="email" placeholder="contact@example.ma" defaultValue="contact@stockflow.ma" /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>{t("phone")}</Label><Input placeholder="+212 5XX XXX XXX" defaultValue="+212 522 123 456" /></div>
                <div className="space-y-2"><Label>{t("address")}</Label><Input placeholder="Adresse" defaultValue="123 Bd Mohammed V, Casablanca" /></div>
              </div>
              <Separator />
              <h3 className="font-medium">Informations fiscales marocaines</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>{t("ice")} (Identifiant Commun de l'Entreprise)</Label><Input placeholder="15 chiffres" defaultValue="001234567890012" /></div>
                <div className="space-y-2"><Label>{t("identifiantFiscal")} (IF)</Label><Input placeholder="IF" defaultValue="12345678" /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>{t("taxeProfessionnelle")} (TP)</Label><Input placeholder="TP" defaultValue="12345678" /></div>
                <div className="space-y-2"><Label>{t("cnss")}</Label><Input placeholder="CNSS" defaultValue="1234567" /></div>
              </div>
              <Button data-testid="button-save-company">{t("save")}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="localization">
          <Card>
            <CardHeader>
              <CardTitle>Préférences régionales</CardTitle>
              <CardDescription>Langue, devise et fuseau horaire</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{t("language")}</Label>
                  <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                    <SelectTrigger data-testid="select-language"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(languages) as Language[]).map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          <span className="mr-2">{languages[lang].flag}</span>
                          {languages[lang].name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("currency")}</Label>
                  <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                    <SelectTrigger data-testid="select-currency"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(currencies) as Currency[]).map((curr) => (
                        <SelectItem key={curr} value={curr}>
                          <span className="mr-2 font-mono">{currencies[curr].symbol}</span>
                          {currencies[curr].name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("timezone")}</Label>
                  <Select defaultValue="Africa/Casablanca">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Casablanca">Africa/Casablanca (GMT+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <h3 className="font-medium">Taux de TVA marocains</h3>
              <div className="grid gap-4 md:grid-cols-5">
                <div className="space-y-2"><Label>Taux normal</Label><div className="flex items-center gap-2"><Input defaultValue="20" className="w-20" /><span>%</span></div></div>
                <div className="space-y-2"><Label>Taux réduit 1</Label><div className="flex items-center gap-2"><Input defaultValue="14" className="w-20" /><span>%</span></div></div>
                <div className="space-y-2"><Label>Taux réduit 2</Label><div className="flex items-center gap-2"><Input defaultValue="10" className="w-20" /><span>%</span></div></div>
                <div className="space-y-2"><Label>Taux réduit 3</Label><div className="flex items-center gap-2"><Input defaultValue="7" className="w-20" /><span>%</span></div></div>
                <div className="space-y-2"><Label>Exonéré</Label><div className="flex items-center gap-2"><Input defaultValue="0" className="w-20" disabled /><span>%</span></div></div>
              </div>
              <Button>{t("save")}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Apparence</CardTitle>
              <CardDescription>Personnaliser l'interface utilisateur</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">{theme === "dark" ? t("darkMode") : t("lightMode")}</Label>
                  <p className="text-sm text-muted-foreground">Basculer entre le mode clair et sombre</p>
                </div>
                <Switch checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} data-testid="switch-theme" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Barre latérale compacte</Label>
                  <p className="text-sm text-muted-foreground">Afficher uniquement les icônes</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Animations</Label>
                  <p className="text-sm text-muted-foreground">Activer les animations de l'interface</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t("notifications")}</CardTitle>
              <CardDescription>Configurer les alertes et notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Alertes stock faible</Label>
                  <p className="text-sm text-muted-foreground">Notification quand le stock atteint le seuil minimum</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Alertes rupture de stock</Label>
                  <p className="text-sm text-muted-foreground">Notification en cas de rupture de stock</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Commandes en retard</Label>
                  <p className="text-sm text-muted-foreground">Notification pour les commandes fournisseurs en retard</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Produits proches expiration</Label>
                  <p className="text-sm text-muted-foreground">Alerte pour les produits expirant bientôt</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Notifications par email</Label>
                  <p className="text-sm text-muted-foreground">Recevoir un récapitulatif quotidien par email</p>
                </div>
                <Switch />
              </div>
              <Button>{t("save")}</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
