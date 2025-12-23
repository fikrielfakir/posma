import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Production() {
  const productionOrders = [
    {
      id: "1",
      orderNumber: "PO-001",
      product: "Ice Cubes - Premium",
      quantity: 500,
      unit: "kg",
      status: "in_progress",
      priority: "high",
      scheduledStart: "2025-12-23",
      scheduledEnd: "2025-12-24",
    },
    {
      id: "2",
      orderNumber: "PO-002",
      product: "Ice Blocks - Standard",
      quantity: 1000,
      unit: "kg",
      status: "planned",
      priority: "normal",
      scheduledStart: "2025-12-24",
      scheduledEnd: "2025-12-25",
    },
    {
      id: "3",
      orderNumber: "PO-003",
      product: "Crushed Ice",
      quantity: 750,
      unit: "kg",
      status: "completed",
      priority: "normal",
      scheduledStart: "2025-12-22",
      scheduledEnd: "2025-12-23",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "planned":
        return "bg-gray-100 text-gray-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "on_hold":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Production Management</h1>
          <p className="text-muted-foreground">
            Ice manufacturing production orders and batches
          </p>
        </div>
        <Button data-testid="button-new-production">
          <Plus className="mr-2 h-4 w-4" />
          New Production Order
        </Button>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Production Orders</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="quality">Quality Control</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid gap-4">
            {productionOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                      <CardDescription>{order.product}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Quantity</p>
                      <p className="text-lg font-semibold">
                        {order.quantity} {order.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="text-sm font-medium">{order.scheduledStart}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">End Date</p>
                      <p className="text-sm font-medium">{order.scheduledEnd}</p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" data-testid={`button-edit-${order.id}`}>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" data-testid={`button-view-${order.id}`}>
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="batches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Production Batches</CardTitle>
              <CardDescription>
                Track individual production batches and yields
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Production batch data will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quality Control</CardTitle>
              <CardDescription>
                Monitor ice quality parameters (clarity, hardness, purity)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Quality control results and test data will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
