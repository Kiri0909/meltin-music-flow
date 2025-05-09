
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const LoginHistory = () => {
  const { user } = useAuth();

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: '2-digit',
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  // Extract device info
  const getDeviceInfo = (userAgent: string) => {
    // Simple parsing for demo
    let deviceType = "Unknown";
    let browser = "Unknown";
    
    if (userAgent.includes("iPhone") || userAgent.includes("iPad")) {
      deviceType = "iOS";
    } else if (userAgent.includes("Android")) {
      deviceType = "Android";
    } else if (userAgent.includes("Windows")) {
      deviceType = "Windows";
    } else if (userAgent.includes("Mac")) {
      deviceType = "Mac";
    } else if (userAgent.includes("Linux")) {
      deviceType = "Linux";
    }
    
    if (userAgent.includes("Chrome")) {
      browser = "Chrome";
    } else if (userAgent.includes("Firefox")) {
      browser = "Firefox";
    } else if (userAgent.includes("Safari")) {
      browser = "Safari";
    } else if (userAgent.includes("Edge")) {
      browser = "Edge";
    }
    
    return `${deviceType} - ${browser}`;
  };

  const currentLoginData = user ? [
    {
      id: 1,
      userId: user.id,
      timestamp: user.loginTime,
      device: getDeviceInfo(user.device)
    }
  ] : [];

  return (
    <Card className="glass-card w-full animate-fade-in">
      <CardHeader>
        <CardTitle>Login History</CardTitle>
      </CardHeader>
      <CardContent>
        {currentLoginData.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Device</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentLoginData.map((login) => (
                <TableRow key={login.id}>
                  <TableCell>{formatDate(login.timestamp)}</TableCell>
                  <TableCell>{login.device}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No login history available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LoginHistory;
