import React, { ReactNode } from 'react';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInRight,
  SlideOutLeft 
} from 'react-native-reanimated';
import { cn } from '~/lib/utils';

interface OnboardingCardProps {
  children: ReactNode;
  className?: string;
  animate?: 'scale' | 'slide' | 'fade' | 'none';
}

export function OnboardingCard({ 
  children, 
  className,
  animate = 'none' 
}: OnboardingCardProps) {
  // Set default entrance/exit animations based on animate prop
  const entering = 
    animate === 'slide' ? SlideInRight.duration(300) : 
    animate === 'fade' ? FadeIn.duration(500) : 
    animate === 'scale' ? FadeIn.duration(500).withInitialValues({ scale: 0.9 }) :
    undefined;
    
  const exiting = 
    animate === 'slide' ? SlideOutLeft.duration(300) : 
    animate === 'fade' ? FadeOut.duration(300) : 
    animate === 'scale' ? FadeOut.duration(300).withInitialValues({ scale: 0.9 }) :
    undefined;

  return (
    <Animated.View 
      entering={entering}
      exiting={exiting}
      className={cn(
        "p-6 rounded-xl bg-card border border-border shadow",
        className
      )}
    >
      {children}
    </Animated.View>
  );
}
