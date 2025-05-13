
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Bot } from "lucide-react";

const SilverwolfBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{type: 'bot' | 'user', content: string}[]>([
    {type: 'bot', content: "Hi, I'm Silverwolf! How can I help you with your music today?"}
  ]);
  const [isFloating, setIsFloating] = useState(false);

  // Animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFloating(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = () => {
    if (message.trim() === "") return;
    
    setMessages([...messages, {type: 'user', content: message}]);
    setMessage("");
    
    // Simple bot response logic
    setTimeout(() => {
      let botResponse = "";
      const lowerMsg = message.toLowerCase();
      
      if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
        botResponse = "Hello there! I'm Silverwolf, your music assistant!";
      } else if (lowerMsg.includes("help") || lowerMsg.includes("how")) {
        botResponse = "I can help you navigate the music player, add tracks from YouTube or Spotify, or manage your playlists!";
      } else if (lowerMsg.includes("music") || lowerMsg.includes("song") || lowerMsg.includes("track")) {
        botResponse = "You can add music by clicking the 'Add Music' button and pasting a YouTube or Spotify link!";
      } else if (lowerMsg.includes("who") && lowerMsg.includes("you")) {
        botResponse = "I'm Silverwolf, your virtual assistant for Meltine Music!";
      } else {
        botResponse = "I'm still learning! Try asking me about adding music, navigation, or features!";
      }
      
      setMessages(prev => [...prev, {type: 'bot', content: botResponse}]);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <>
      <div 
        className={`fixed bottom-8 left-8 z-50 transition-transform duration-700 cursor-pointer ${isFloating ? 'transform translate-y-[-8px]' : ''}`}
        onClick={() => setIsOpen(true)}
      >
        <div className="relative">
          <img 
            src="/lovable-uploads/c281995f-8050-4327-8112-5e5287f922f6.png" 
            alt="Silverwolf" 
            className="w-20 h-20 rounded-full border-2 border-meltin-purple shadow-lg object-cover"
          />
          <div className="absolute -top-2 -right-2 bg-meltin-purple text-white text-xs px-2 py-1 rounded-full">
            <Bot size={16} />
          </div>
          <div className={`absolute -bottom-12 left-0 bg-black/70 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full transition-opacity duration-500 ${isFloating ? 'opacity-100' : 'opacity-0'}`}>
            Need help?
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="glass-card sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/c281995f-8050-4327-8112-5e5287f922f6.png" 
                alt="Silverwolf" 
                className="w-8 h-8 rounded-full object-cover"
              />
              Silverwolf
            </DialogTitle>
            <DialogDescription>
              Your Meltine music assistant
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col h-[300px]">
            <div className="flex-grow overflow-y-auto p-2 space-y-3 mb-4 scrollbar-none">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex ${msg.type === 'bot' ? 'justify-start' : 'justify-end'}`}
                >
                  {msg.type === 'bot' && (
                    <img 
                      src="/lovable-uploads/c281995f-8050-4327-8112-5e5287f922f6.png" 
                      alt="Silverwolf" 
                      className="w-8 h-8 rounded-full object-cover mr-2 self-end"
                    />
                  )}
                  <div 
                    className={`rounded-2xl px-4 py-2 max-w-[75%] animate-fade-in
                      ${msg.type === 'bot' 
                        ? 'bg-meltin-purple/20 text-left' 
                        : 'bg-meltin-purple/40 text-right'}`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 mt-auto">
              <Input 
                placeholder="Type your message..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-grow"
              />
              <Button onClick={handleSendMessage}>Send</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SilverwolfBot;
