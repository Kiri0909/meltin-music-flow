
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import Navbar from '@/components/Navbar';
import LoginHistory from '@/components/LoginHistory';
import FeedbackForm from '@/components/FeedbackForm';
import { Moon, Sun } from 'lucide-react';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { toast } = useToast();
  const [qualityPreference, setQualityPreference] = useState("high");
  const [enableCrossfade, setEnableCrossfade] = useState(true);
  const [enableAutoplay, setEnableAutoplay] = useState(true);

  const handleSavePreferences = () => {
    // In a real app, this would save to a backend
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="w-full max-w-3xl mx-auto animate-fade-in">
          <h1 className="text-3xl font-bold mb-6">Settings</h1>
          
          <Tabs defaultValue="profile">
            <TabsList className="mb-6 glass-card">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="audio">Audio</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="history">Login History</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>User Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">User ID</label>
                      <div className="mt-1 p-3 bg-black/20 rounded border border-white/10">
                        {user?.id}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Account Type</label>
                      <div className="mt-1 p-3 bg-black/20 rounded border border-white/10">
                        Standard
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="audio">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Audio Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Audio Quality</h3>
                      <RadioGroup value={qualityPreference} onValueChange={setQualityPreference}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="low" id="low" />
                          <Label htmlFor="low">Low (64 kbps)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="medium" id="medium" />
                          <Label htmlFor="medium">Medium (128 kbps)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="high" id="high" />
                          <Label htmlFor="high">High (256 kbps)</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Playback</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="crossfade">Enable Crossfade</Label>
                          <p className="text-sm text-muted-foreground">Smooth transition between tracks</p>
                        </div>
                        <Switch 
                          id="crossfade"
                          checked={enableCrossfade}
                          onCheckedChange={setEnableCrossfade}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="autoplay">Enable Autoplay</Label>
                          <p className="text-sm text-muted-foreground">Continue playing similar tracks</p>
                        </div>
                        <Switch 
                          id="autoplay"
                          checked={enableAutoplay}
                          onCheckedChange={setEnableAutoplay}
                        />
                      </div>
                    </div>
                    
                    <Button onClick={handleSavePreferences}>
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Theme</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          className={`p-4 rounded-lg border transition-all ${
                            theme === 'light' 
                            ? 'border-meltin-purple ring-2 ring-meltin-purple/50' 
                            : 'border-white/10 hover:border-white/30'
                          }`}
                          onClick={() => theme !== 'light' && toggleTheme()}
                        >
                          <div className="bg-gray-100 text-black rounded-md p-3 flex justify-center mb-2">
                            <Sun size={24} />
                          </div>
                          <p className="font-medium">Light</p>
                        </button>
                        
                        <button 
                          className={`p-4 rounded-lg border transition-all ${
                            theme === 'dark' 
                            ? 'border-meltin-purple ring-2 ring-meltin-purple/50' 
                            : 'border-white/10 hover:border-white/30'
                          }`}
                          onClick={() => theme !== 'dark' && toggleTheme()}
                        >
                          <div className="bg-gray-800 text-white rounded-md p-3 flex justify-center mb-2">
                            <Moon size={24} />
                          </div>
                          <p className="font-medium">Dark</p>
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <LoginHistory />
            </TabsContent>
            
            <TabsContent value="feedback">
              <FeedbackForm />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Settings;
