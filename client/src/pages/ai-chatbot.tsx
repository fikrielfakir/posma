import { useState, useRef, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Mic, 
  MicOff,
  Volume2,
  Languages,
  Search,
  Package,
  TrendingUp,
  HelpCircle,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RefreshCw
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  intent?: string;
  sources?: Array<{ type: string; id: string; excerpt: string }>;
}

const sampleConversations = [
  { id: "1", title: "Stock iPhone 15", date: "Aujourd'hui", messages: 5 },
  { id: "2", title: "Promo Black Friday", date: "Hier", messages: 8 },
  { id: "3", title: "Commande #ACH-2024-0045", date: "Il y a 2 jours", messages: 3 },
];

const suggestedQuestions = [
  { icon: Package, text: "Quel est le stock actuel de l'iPhone 15 Pro ?", intent: "stock_check" },
  { icon: TrendingUp, text: "Quels sont les produits les plus vendus ce mois ?", intent: "sales_analysis" },
  { icon: Search, text: "Rechercher les commandes en attente", intent: "order_status" },
  { icon: HelpCircle, text: "Comment créer un bon de réception ?", intent: "help" },
];

export default function AIChatbot() {
  const { t, language } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: language === "ar" 
        ? "مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟"
        : "Bonjour ! Je suis votre assistant IA. Comment puis-je vous aider aujourd'hui ?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<"fr" | "ar">("fr");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const responses: Record<string, string> = {
      stock: "Le stock actuel de l'iPhone 15 Pro est de **28 unités** dans l'entrepôt principal. La prédiction de demande pour les 30 prochains jours est de 95 unités. Je recommande de passer une commande de réapprovisionnement.",
      ventes: "Les 5 produits les plus vendus ce mois sont :\n1. iPhone 15 Pro - 156 unités\n2. Samsung Galaxy S24 - 134 unités\n3. AirPods Pro 2 - 98 unités\n4. MacBook Air M3 - 67 unités\n5. iPad Pro 12.9 - 45 unités",
      commande: "Il y a actuellement **12 commandes en attente** de traitement. 5 sont en attente d'approbation, 4 sont en cours de préparation, et 3 sont prêtes pour expédition.",
      default: "Je comprends votre question. Laissez-moi rechercher les informations pertinentes dans notre base de données...\n\nVoici ce que j'ai trouvé : Pour toute question spécifique sur les stocks, les commandes ou les ventes, n'hésitez pas à me demander !",
    };

    const lowerInput = inputValue.toLowerCase();
    let responseContent = responses.default;
    let intent = "general";

    if (lowerInput.includes("stock") || lowerInput.includes("iphone")) {
      responseContent = responses.stock;
      intent = "stock_check";
    } else if (lowerInput.includes("vente") || lowerInput.includes("vendu")) {
      responseContent = responses.ventes;
      intent = "sales_analysis";
    } else if (lowerInput.includes("commande") || lowerInput.includes("attente")) {
      responseContent = responses.commande;
      intent = "order_status";
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: responseContent,
      timestamp: new Date(),
      intent,
      sources: [
        { type: "product", id: "prod-123", excerpt: "iPhone 15 Pro 256GB" },
        { type: "stock", id: "stk-456", excerpt: "Entrepôt Principal" },
      ],
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTimeout(() => {
        setInputValue("Quel est le stock actuel ?");
        setIsListening(false);
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-[calc(100vh-4rem)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold flex items-center gap-3">
            <MessageCircle className="h-8 w-8 text-primary" />
            Assistant IA
          </h1>
          <p className="text-muted-foreground">Chatbot multilingue avec compréhension du langage naturel</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={selectedLanguage === "fr" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedLanguage("fr")}
          >
            🇫🇷 Français
          </Button>
          <Button
            variant={selectedLanguage === "ar" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedLanguage("ar")}
          >
            🇲🇦 العربية
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4 flex-1 min-h-0">
        <Card className="md:col-span-1 hidden md:flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-2">
              {sampleConversations.map(conv => (
                <button
                  key={conv.id}
                  className="w-full p-3 text-left rounded-lg hover:bg-muted transition-colors"
                >
                  <p className="font-medium text-sm truncate">{conv.title}</p>
                  <p className="text-xs text-muted-foreground">{conv.date} • {conv.messages} messages</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">Assistant StockFlow</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    En ligne • GPT-4 Fine-tuné
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className={message.role === "assistant" ? "bg-primary" : "bg-muted"}>
                        {message.role === "assistant" ? (
                          <Bot className="h-4 w-4 text-primary-foreground" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col gap-1 max-w-[80%] ${message.role === "user" ? "items-end" : ""}`}>
                      <div
                        className={`rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      {message.intent && (
                        <Badge variant="outline" className="text-xs">
                          {message.intent}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Button
                  variant={isListening ? "destructive" : "outline"}
                  size="icon"
                  onClick={handleVoiceInput}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Input
                  placeholder={selectedLanguage === "ar" ? "اكتب رسالتك..." : "Tapez votre message..."}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1"
                  dir={selectedLanguage === "ar" ? "rtl" : "ltr"}
                />
                <Button onClick={handleSend} disabled={!inputValue.trim() || isTyping}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1 hidden md:flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {suggestedQuestions.map((q, index) => (
              <button
                key={index}
                onClick={() => setInputValue(q.text)}
                className="w-full p-3 text-left rounded-lg border hover:bg-muted transition-colors"
              >
                <div className="flex items-start gap-2">
                  <q.icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <p className="text-sm">{q.text}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
