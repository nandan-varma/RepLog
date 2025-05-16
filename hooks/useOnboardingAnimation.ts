import { useEffect } from 'react';
import { useSharedValue, withTiming, WithTimingConfig, withSpring, WithSpringConfig } from 'react-native-reanimated';

interface AnimationOptions {
  initialValue?: number;
  toValue?: number;
  duration?: number;
  delay?: number;
  useSpring?: boolean;
  springConfig?: WithSpringConfig;
  timingConfig?: Partial<WithTimingConfig>;
}

/**
 * Hook for creating animations in the onboarding flow
 * 
 * @param options Animation options
 * @returns Animated shared value
 */
export function useOnboardingAnimation({
  initialValue = 0,
  toValue = 1,
  duration = 500,
  delay = 0,
  useSpring = false,
  springConfig,
  timingConfig,
}: AnimationOptions = {}) {
  const animatedValue = useSharedValue(initialValue);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (useSpring) {
        animatedValue.value = withSpring(toValue, {
          stiffness: 100,
          ...springConfig
        });
      } else {
        animatedValue.value = withTiming(toValue, {
          duration,
          ...timingConfig
        });
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, []);

  return animatedValue;
}

/**
 * Hook for managing sequential animations in onboarding
 * 
 * @returns Functions to create and run sequential animations
 */
export function useSequentialAnimations() {
  const animationSequence: Array<{ value: any, options: AnimationOptions }> = [];
  
  const addAnimation = (value: any, options: AnimationOptions = {}) => {
    animationSequence.push({ value, options });
    return animationSequence.length - 1; // Return index of added animation
  };
  
  const runSequence = (totalDuration = 2000, baseDelay = 0) => {
    const stepCount = animationSequence.length;
    if (stepCount === 0) return;
    
    // Distribute delay across animations
    const stepDelay = totalDuration / stepCount;
    
    animationSequence.forEach(({ value, options }, index) => {
      const delay = baseDelay + (index * stepDelay);
      
      setTimeout(() => {
        if (options.useSpring) {
          value.value = withSpring(options.toValue || 1, {
            stiffness: 100,
            ...options.springConfig
          });
        } else {
          value.value = withTiming(options.toValue || 1, {
            duration: options.duration || 300,
            ...options.timingConfig
          });
        }
      }, delay);
    });
  };
  
  const resetSequence = () => {
    animationSequence.forEach(({ value, options }) => {
      value.value = options.initialValue || 0;
    });
  };
  
  return { addAnimation, runSequence, resetSequence };
}
