import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Mail,
  Bell,
  Globe,
  Palette,
  Shield,
  Database,
  Plug,
  Users,
  FileText,
  Clock,
  Save,
  RefreshCw,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [companyName, setCompanyName] = useState("RecruitHub Inc.");
  const [companyEmail, setCompanyEmail] = useState("hr@recruithub.com");
  const [timezone, setTimezone] = useState("America/New_York");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [autoLogout, setAutoLogout] = useState(true);
  const [dataRetention, setDataRetention] = useState("365");
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
  };

  const integrations = [
    {
      name: "Slack",
      status: "connected",
      icon: "💬",
      description: "Get notifications in Slack channels",
    },
    {
      name: "Microsoft Teams",
      status: "disconnected",
      icon: "👥",
      description: "Sync with MS Teams",
    },
    {
      name: "Google Workspace",
      status: "connected",
      icon: "📧",
      description: "Calendar and email integration",
    },
    {
      name: "LinkedIn Recruiter",
      status: "connected",
      icon: "💼",
      description: "Import candidates directly",
    },
    {
      name: "DocuSign",
      status: "disconnected",
      icon: "✍️",
      description: "E-signature for offer letters",
    },
    {
      name: "BambooHR",
      status: "disconnected",
      icon: "🎋",
      description: "HRIS integration",
    },
  ];

  return (
    <AppLayout title="Settings">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Configure your workspace, notifications, and integrations
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto gap-2 bg-transparent p-0">
            <TabsTrigger
              value="general"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger
              value="integrations"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <Plug className="h-4 w-4" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
            <TabsTrigger
              value="compliance"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Compliance</span>
            </TabsTrigger>
            <TabsTrigger
              value="data"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <div className="card-elevated p-6 space-y-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-foreground">
                  Organization Settings
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Contact Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">
                        Eastern Time (ET)
                      </SelectItem>
                      <SelectItem value="America/Chicago">
                        Central Time (CT)
                      </SelectItem>
                      <SelectItem value="America/Denver">
                        Mountain Time (MT)
                      </SelectItem>
                      <SelectItem value="America/Los_Angeles">
                        Pacific Time (PT)
                      </SelectItem>
                      <SelectItem value="Europe/London">
                        Greenwich Mean Time (GMT)
                      </SelectItem>
                      <SelectItem value="Europe/Paris">
                        Central European Time (CET)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select value={dateFormat} onValueChange={setDateFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Company Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your company address"
                  defaultValue="1600 Pennsylvania Avenue NW, Washington, DC 20500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="card-elevated p-6 space-y-6">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-foreground">
                  Notification Preferences
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">
                      Email Notifications
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Receive updates via email
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">
                      Push Notifications
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Get browser notifications
                    </p>
                  </div>
                  <Switch
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Weekly Digest</p>
                    <p className="text-sm text-muted-foreground">
                      Summary of hiring activity
                    </p>
                  </div>
                  <Switch
                    checked={weeklyDigest}
                    onCheckedChange={setWeeklyDigest}
                  />
                </div>
              </div>
            </div>

            <div className="card-elevated p-6 space-y-6">
              <h3 className="font-semibold text-foreground">
                Notification Events
              </h3>
              <div className="space-y-3">
                {[
                  "New application received",
                  "Candidate status changed",
                  "Interview scheduled",
                  "Offer accepted/declined",
                  "Security alerts",
                  "System updates",
                ].map((event) => (
                  <div
                    key={event}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-foreground">{event}</span>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Appearance */}
          <TabsContent value="appearance" className="space-y-6">
            <div className="card-elevated p-6 space-y-6">
              <div className="flex items-center gap-3">
                <Palette className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-foreground">
                  Display Settings
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Use dark theme
                    </p>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Compact Mode</p>
                    <p className="text-sm text-muted-foreground">
                      Reduce spacing for dense layouts
                    </p>
                  </div>
                  <Switch
                    checked={compactMode}
                    onCheckedChange={setCompactMode}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="card-elevated p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Plug className="h-5 w-5 text-accent" />
                  <h3 className="font-semibold text-foreground">
                    Connected Services
                  </h3>
                </div>
                <Button variant="outline" size="sm">
                  Browse Marketplace
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map((integration, index) => (
                  <div
                    key={integration.name}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{integration.icon}</span>
                      <div>
                        <p className="font-medium text-foreground">
                          {integration.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {integration.description}
                        </p>
                      </div>
                    </div>
                    {integration.status === "connected" ? (
                      <Badge className="bg-success/10 text-success border-success/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Button variant="outline" size="sm">
                        Connect
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Compliance */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="card-elevated p-6 space-y-6">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-foreground">
                  Compliance & Security
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "SOC 2 Type II", status: "Certified", icon: Shield },
                  { name: "GDPR", status: "Compliant", icon: Globe },
                  { name: "CCPA", status: "Compliant", icon: Users },
                  { name: "FedRAMP", status: "In Progress", icon: Shield },
                ].map((cert) => (
                  <div
                    key={cert.name}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <cert.icon className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {cert.name}
                      </span>
                    </div>
                    <Badge
                      className={
                        cert.status === "Certified" ||
                        cert.status === "Compliant"
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-warning/10 text-warning border-warning/20"
                      }
                    >
                      {cert.status}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">
                      Auto Session Timeout
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Automatically log out inactive users
                    </p>
                  </div>
                  <Switch
                    checked={autoLogout}
                    onCheckedChange={setAutoLogout}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Audit Logging</p>
                    <p className="text-sm text-muted-foreground">
                      Track all user actions
                    </p>
                  </div>
                  <Badge className="bg-success/10 text-success border-success/20">
                    Always On
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Data Management */}
          <TabsContent value="data" className="space-y-6">
            <div className="card-elevated p-6 space-y-6">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-foreground">
                  Data Management
                </h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Data Retention Period</Label>
                  <Select
                    value={dataRetention}
                    onValueChange={setDataRetention}
                  >
                    <SelectTrigger className="w-full md:w-[300px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="730">2 years</SelectItem>
                      <SelectItem value="1095">3 years</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Candidate data older than this will be anonymized
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Export All Data
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Run Data Cleanup
                  </Button>
                </div>
              </div>
            </div>

            <div className="card-elevated p-6 space-y-4">
              <h3 className="font-semibold text-foreground">
                Backup & Recovery
              </h3>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Last Backup</p>
                  <p className="text-sm text-muted-foreground">
                    January 22, 2024 at 3:00 AM ET
                  </p>
                </div>
                <Badge className="bg-success/10 text-success border-success/20">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Successful
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Automatic backups run daily at 3:00 AM ET. Data is encrypted and
                stored in multiple regions.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
