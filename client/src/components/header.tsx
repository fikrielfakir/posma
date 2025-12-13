import { Moon, Sun, Bell, Globe, Building2, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { languages, currencies, type Language, type Currency } from "@/lib/i18n";

export function Header() {
  const { theme, toggleTheme, language, setLanguage, currency, setCurrency, t } = useApp();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("search")}
            className="w-64 pl-9 lg:w-80"
            data-testid="input-global-search"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="button-warehouse-selector">
              <Building2 className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{t("selectWarehouse")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-testid="warehouse-all">
              {t("allWarehouses")}
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="warehouse-casa">
              Casablanca Central
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="warehouse-rabat">
              Rabat Nord
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="button-currency-selector">
              <span className="text-sm font-medium">{currency}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("currency")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.keys(currencies) as Currency[]).map((curr) => (
              <DropdownMenuItem
                key={curr}
                onClick={() => setCurrency(curr)}
                data-testid={`currency-${curr.toLowerCase()}`}
              >
                <span className="mr-2 font-mono">{currencies[curr].symbol}</span>
                {currencies[curr].name}
                {curr === currency && (
                  <Badge variant="secondary" className="ml-auto" size="sm">
                    {t("active")}
                  </Badge>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="button-language-selector">
              <Globe className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("language")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.keys(languages) as Language[]).map((lang) => (
              <DropdownMenuItem
                key={lang}
                onClick={() => setLanguage(lang)}
                data-testid={`language-${lang}`}
              >
                <span className="mr-2">{languages[lang].flag}</span>
                {languages[lang].name}
                {lang === language && (
                  <Badge variant="secondary" className="ml-auto" size="sm">
                    {t("active")}
                  </Badge>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          data-testid="button-notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
            3
          </span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          data-testid="button-theme-toggle"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
}
