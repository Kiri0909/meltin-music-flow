
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageSquare } from "lucide-react";
import FeedbackHistory from './FeedbackHistory';

const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full shadow-lg z-50 bg-meltin-purple hover:bg-meltin-purple/90 h-12 w-12 p-0 flex items-center justify-center"
        aria-label="View Feedback History"
      >
        <MessageSquare />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Feedback History</DialogTitle>
          </DialogHeader>
          <FeedbackHistory />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FeedbackButton;
