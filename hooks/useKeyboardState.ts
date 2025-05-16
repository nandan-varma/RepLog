import { useState, useEffect } from 'react';
import { Keyboard, KeyboardEvent, Platform } from 'react-native';

interface KeyboardState {
  keyboardHeight: number;
  isKeyboardVisible: boolean;
}

export function useKeyboardState(): KeyboardState {
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    keyboardHeight: 0,
    isKeyboardVisible: false,
  });

  useEffect(() => {
    const showEventName = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEventName = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    // Using a single state update to reduce renders
    const handleKeyboardShow = (event: KeyboardEvent) => {
      setKeyboardState({
        keyboardHeight: event.endCoordinates.height,
        isKeyboardVisible: true,
      });
    };

    const handleKeyboardHide = () => {
      setKeyboardState(prev => ({
        ...prev,
        isKeyboardVisible: false,
      }));
    };

    // Add listeners
    const showSubscription = Keyboard.addListener(showEventName, handleKeyboardShow);
    const hideSubscription = Keyboard.addListener(hideEventName, handleKeyboardHide);

    // Clean up
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return keyboardState;
}
