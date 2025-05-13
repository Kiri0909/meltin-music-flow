
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Feedback = {
  type: 'bug' | 'suggestion' | 'comment';
  text: string;
  timestamp: number;
};

type FeedbackStore = {
  feedbackItems: Feedback[];
  addFeedback: (feedback: Feedback) => void;
  clearFeedback: () => void;
};

export const useFeedbackStore = create<FeedbackStore>()(
  persist(
    (set) => ({
      feedbackItems: [],
      addFeedback: (feedback) => 
        set((state) => ({ 
          feedbackItems: [feedback, ...state.feedbackItems] 
        })),
      clearFeedback: () => set({ feedbackItems: [] }),
    }),
    {
      name: 'feedback-storage',
    }
  )
);
