import { useState } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Shield, Loader2 } from "lucide-react";
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
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, Role } from "@shared/schema";

export default function Users() {
  const { t, language } = useApp();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    roleId: "",
    password: "",
    confirmPassword: "",
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: { username: string; fullName: string; email?: string; phone?: string; roleId: string; password: string }) => {
      const res = await apiRequest("POST", "/api/users", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsAddDialogOpen(false);
      setNewUser({ username: "", fullName: "", email: "", phone: "", roleId: "", password: "", confirmPassword: "" });
      toast({ title: t("success"), description: "Utilisateur créé" });
    },
    onError: () => {
      toast({ title: t("error"), description: "Échec de la création", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: t("success"), description: "Utilisateur supprimé" });
    },
    onError: () => {
      toast({ title: t("error"), description: "Échec de la suppression", variant: "destructive" });
    },
  });

  const getRoleName = (roleId: string | null) => {
    const role = roles.find(r => r.id === roleId);
    return role?.name || "-";
  };

  const getRoleCode = (roleId: string | null) => {
    const role = roles.find(r => r.id === roleId);
    return role?.code || "";
  };

  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeVariant = (roleCode: string): "default" | "secondary" | "outline" => {
    if (roleCode === "super_admin" || roleCode === "director") return "default";
    if (roleCode.includes("manager")) return "secondary";
    return "outline";
  };

  const handleCreateUser = () => {
    if (!newUser.username || !newUser.fullName || !newUser.roleId || !newUser.password) {
      toast({ title: t("error"), description: "Veuillez remplir tous les champs obligatoires", variant: "destructive" });
      return;
    }
    if (newUser.password !== newUser.confirmPassword) {
      toast({ title: t("error"), description: "Les mots de passe ne correspondent pas", variant: "destructive" });
      return;
    }
    createUserMutation.mutate({
      username: newUser.username,
      fullName: newUser.fullName,
      email: newUser.email || undefined,
      phone: newUser.phone || undefined,
      roleId: newUser.roleId,
      password: newUser.password,
    });
  };

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">{t("users")}</h1>
          <p className="text-muted-foreground">{formatNumber(users.length)} utilisateurs</p>
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
                <div className="space-y-2">
                  <Label>{t("username")} *</Label>
                  <Input 
                    placeholder="nom.utilisateur" 
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    data-testid="input-username"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("fullName")} *</Label>
                  <Input 
                    placeholder="Prénom Nom" 
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                    data-testid="input-fullname"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("email")}</Label>
                  <Input 
                    type="email" 
                    placeholder="email@example.ma" 
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("phone")}</Label>
                  <Input 
                    placeholder="+212 6XX XXX XXX" 
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    data-testid="input-phone"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("role")} *</Label>
                <Select value={newUser.roleId} onValueChange={(v) => setNewUser({ ...newUser, roleId: v })}>
                  <SelectTrigger data-testid="select-role">
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("password")} *</Label>
                  <Input 
                    type="password" 
                    placeholder="********" 
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    data-testid="input-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirmer *</Label>
                  <Input 
                    type="password" 
                    placeholder="********" 
                    value={newUser.confirmPassword}
                    onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                    data-testid="input-confirm-password"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>{t("cancel")}</Button>
              <Button onClick={handleCreateUser} disabled={createUserMutation.isPending}>
                {createUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("save")}
              </Button>
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
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "Aucun utilisateur trouvé" : "Aucun utilisateur"}
            </div>
          ) : (
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
                  {filteredUsers.map((user) => {
                    const roleCode = getRoleCode(user.roleId);
                    return (
                      <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                {user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.fullName}</p>
                              <p className="text-xs text-muted-foreground">@{user.username}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{user.email || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(roleCode)} size="sm">
                            <Shield className="mr-1 h-3 w-3" />
                            {getRoleName(user.roleId)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.lastLogin ? formatDateTime(new Date(user.lastLogin), language) : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? "default" : "secondary"} size="sm">
                            {user.isActive ? t("active") : t("inactive")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-menu-${user.id}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />{t("edit")}</DropdownMenuItem>
                              <DropdownMenuItem><Shield className="mr-2 h-4 w-4" />{t("permissions")}</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => deleteUserMutation.mutate(user.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />{t("delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
