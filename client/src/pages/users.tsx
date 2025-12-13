import { useState } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Shield, User as UserIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useApp } from "@/contexts/AppContext";
import { formatDateTime, formatNumber } from "@/lib/i18n";

const mockUsers = [
  { id: "1", username: "admin", fullName: "Administrateur Système", email: "admin@stockflow.ma", role: "Super Admin", roleCode: "super_admin", isActive: true, lastLogin: new Date("2024-12-13T10:30:00") },
  { id: "2", username: "m.bennani", fullName: "Mohamed Bennani", email: "m.bennani@stockflow.ma", role: "Directeur Commercial", roleCode: "sales_manager", isActive: true, lastLogin: new Date("2024-12-13T09:15:00") },
  { id: "3", username: "f.zahra", fullName: "Fatima Zahra", email: "f.zahra@stockflow.ma", role: "Responsable Stock", roleCode: "stock_manager", isActive: true, lastLogin: new Date("2024-12-12T16:45:00") },
  { id: "4", username: "y.idrissi", fullName: "Youssef El Idrissi", email: "y.idrissi@stockflow.ma", role: "Vendeur", roleCode: "salesperson", isActive: true, lastLogin: new Date("2024-12-13T08:00:00") },
  { id: "5", username: "k.tazi", fullName: "Karim Tazi", email: "k.tazi@stockflow.ma", role: "Magasinier", roleCode: "warehouse_staff", isActive: false, lastLogin: new Date("2024-12-01T14:20:00") },
];

const roles = [
  { code: "super_admin", name: "Super Admin" },
  { code: "director", name: "Directeur Général" },
  { code: "sales_manager", name: "Directeur Commercial" },
  { code: "store_manager", name: "Manager Point de Vente" },
  { code: "stock_manager", name: "Responsable Stock" },
  { code: "salesperson", name: "Vendeur" },
  { code: "cashier", name: "Caissier" },
  { code: "warehouse_staff", name: "Magasinier" },
  { code: "accountant", name: "Comptable" },
  { code: "auditor", name: "Auditeur" },
];

export default function Users() {
  const { t, language } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredUsers = mockUsers.filter((u) =>
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeVariant = (roleCode: string): "default" | "secondary" | "outline" => {
    if (roleCode === "super_admin" || roleCode === "director") return "default";
    if (roleCode.includes("manager")) return "secondary";
    return "outline";
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">{t("users")}</h1>
          <p className="text-muted-foreground">{formatNumber(mockUsers.length)} utilisateurs</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-user"><Plus className="mr-2 h-4 w-4" />Nouvel utilisateur</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvel utilisateur</DialogTitle>
              <DialogDescription>Ajouter un nouvel utilisateur au système</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>{t("username")} *</Label><Input placeholder="nom.utilisateur" /></div>
                <div className="space-y-2"><Label>{t("fullName")} *</Label><Input placeholder="Prénom Nom" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>{t("email")}</Label><Input type="email" placeholder="email@example.ma" /></div>
                <div className="space-y-2"><Label>{t("phone")}</Label><Input placeholder="+212 6XX XXX XXX" /></div>
              </div>
              <div className="space-y-2">
                <Label>{t("role")} *</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Sélectionner un rôle" /></SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.code} value={role.code}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>{t("password")} *</Label><Input type="password" placeholder="********" /></div>
                <div className="space-y-2"><Label>Confirmer *</Label><Input type="password" placeholder="********" /></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>{t("cancel")}</Button>
              <Button>{t("save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder={`${t("search")} utilisateur...`} className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} data-testid="input-search-users" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>{t("email")}</TableHead>
                  <TableHead>{t("role")}</TableHead>
                  <TableHead>{t("lastLogin")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                            {user.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground">@{user.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.roleCode)} size="sm">
                        <Shield className="mr-1 h-3 w-3" />
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(user.lastLogin, language)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "secondary"} size="sm">
                        {user.isActive ? t("active") : t("inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />{t("edit")}</DropdownMenuItem>
                          <DropdownMenuItem><Shield className="mr-2 h-4 w-4" />{t("permissions")}</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />{t("delete")}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
