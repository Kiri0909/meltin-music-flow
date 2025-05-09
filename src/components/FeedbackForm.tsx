
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export const FeedbackForm = () => {
  const [feedbackType, setFeedbackType] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackType || !feedbackText.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a feedback type and provide feedback text.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would send the feedback to a backend
    console.log('Feedback submitted:', { type: feedbackType, feedback: feedbackText });
    
    toast({
      title: "Feedback Submitted",
      description: "Thank you for your feedback!",
    });
    
    // Reset form
    setFeedbackType('');
    setFeedbackText('');
  };

  return (
    <Card className="glass-card w-full animate-fade-in">
      <CardHeader>
        <CardTitle>Submit Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Feedback Type</label>
            <Select value={feedbackType} onValueChange={setFeedbackType}>
              <SelectTrigger>
                <SelectValue placeholder="Select feedback type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">Bug Report</SelectItem>
                <SelectItem value="suggestion">Suggestion</SelectItem>
                <SelectItem value="comment">General Comment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Feedback</label>
            <Textarea 
              placeholder="Tell us what you think or report an issue..." 
              className="min-h-[120px]"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-meltin-purple hover:bg-meltin-purple/90"
          >
            Submit Feedback
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FeedbackForm;
