
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Feedback, useFeedbackStore } from "@/stores/feedbackStore";

const getBadgeColor = (type: string) => {
  switch (type) {
    case 'bug':
      return 'bg-red-500 hover:bg-red-600';
    case 'suggestion':
      return 'bg-blue-500 hover:bg-blue-600';
    case 'comment':
      return 'bg-green-500 hover:bg-green-600';
    default:
      return 'bg-gray-500 hover:bg-gray-600';
  }
};

const FeedbackHistory = () => {
  const { feedbackItems } = useFeedbackStore();

  if (feedbackItems.length === 0) {
    return (
      <Card className="glass-card w-full animate-fade-in">
        <CardHeader>
          <CardTitle>Feedback History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-400 py-8">
            No feedback submissions yet. Your feedback history will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card w-full animate-fade-in">
      <CardHeader>
        <CardTitle>Feedback History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {feedbackItems.map((item, index) => (
              <div key={index} className="bg-black/20 p-4 rounded-lg border border-white/10">
                <div className="flex justify-between items-start mb-2">
                  <Badge className={`${getBadgeColor(item.type)}`}>
                    {item.type === 'bug' ? 'Bug Report' : 
                     item.type === 'suggestion' ? 'Suggestion' : 'General Comment'}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm mt-2">{item.text}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default FeedbackHistory;
