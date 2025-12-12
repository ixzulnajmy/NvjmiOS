// file: app/settings/page.tsx
"use client";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { User, Palette, Database } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <AppShell showDetail={false}>
      <div className="p-6 space-y-6 max-w-4xl">
        <PageHeader
          title="Settings"
          description="Manage your account and application preferences"
        />

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Database className="h-4 w-4" />
              Data & Privacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and profile settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                    N
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Profile Picture</p>
                    <Button variant="outline" size="sm">
                      Change Picture
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Your name" defaultValue="Nvjmi" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your.email@example.com" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input id="tagline" placeholder="A short description about you" />
                  </div>
                </div>

                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
                <CardDescription>
                  Your activity across NvjmiOS 2.0
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Transactions</p>
                    <p className="text-2xl font-bold">127</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Life Events</p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Tasks</p>
                    <p className="text-2xl font-bold">68</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Documents</p>
                    <p className="text-2xl font-bold">42</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>
                  Choose your preferred theme for the interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label>Select Theme</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      onClick={() => setTheme("light")}
                    >
                      Light
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      onClick={() => setTheme("dark")}
                    >
                      Dark
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      onClick={() => setTheme("system")}
                    >
                      System
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Display Preferences</CardTitle>
                <CardDescription>
                  Customize how information is displayed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" defaultValue="RM" disabled />
                  <p className="text-xs text-muted-foreground">
                    Currency settings will be available soon
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Input id="dateFormat" defaultValue="DD/MM/YYYY" disabled />
                  <p className="text-xs text-muted-foreground">
                    Date format settings will be available soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Export, backup, or delete your data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Export Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Download all your data in JSON format
                  </p>
                  <Button variant="outline">Export All Data</Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Backup</h4>
                  <p className="text-sm text-muted-foreground">
                    Create a backup of your data
                  </p>
                  <Button variant="outline">Create Backup</Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-destructive">Danger Zone</h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete all your data
                  </p>
                  <Button variant="destructive">Delete All Data</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacy</CardTitle>
                <CardDescription>
                  Manage your privacy preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  All data is stored locally on your device. No data is shared with third parties.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
