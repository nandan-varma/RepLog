import * as SecureStore from 'expo-secure-store';
import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for storing and retrieving string values in SecureStore
 * @param key The key to store the value under
 * @param initialValue Optional initial value
 * @returns A tuple containing the current value and a setter function
 */
export function useSecureStoreString(key: string, initialValue: string = ''): [string | undefined, (value: string) => Promise<void>] {
  const [storedValue, setStoredValue] = useState<string | undefined>(undefined);
  
  // Load the value from SecureStore on initial mount
  useEffect(() => {
    const loadValue = async () => {
      try {
        const value = await SecureStore.getItemAsync(key);
        setStoredValue(value !== null ? value : initialValue);
      } catch (error) {
        console.error(`Error loading ${key} from SecureStore:`, error);
        setStoredValue(initialValue);
      }
    };
    
    loadValue();
  }, [key, initialValue]);
  
  // Function to update the value in SecureStore
  const setValue = useCallback(async (value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
      setStoredValue(value);
    } catch (error) {
      console.error(`Error saving ${key} to SecureStore:`, error);
    }
  }, [key]);
  
  return [storedValue, setValue];
}

/**
 * Custom hook for storing and retrieving number values in SecureStore
 * @param key The key to store the value under
 * @param initialValue Optional initial value
 * @returns A tuple containing the current value and a setter function
 */
export function useSecureStoreNumber(key: string, initialValue?: number): [number | undefined, (value: number) => Promise<void>] {
  const [storedValue, setStoredValue] = useState<number | undefined>(undefined);
  
  // Load the value from SecureStore on initial mount
  useEffect(() => {
    const loadValue = async () => {
      try {
        const value = await SecureStore.getItemAsync(key);
        
        if (value !== null) {
          setStoredValue(Number(value));
        } else if (initialValue !== undefined) {
          setStoredValue(initialValue);
        }
      } catch (error) {
        console.error(`Error loading ${key} from SecureStore:`, error);
        if (initialValue !== undefined) {
          setStoredValue(initialValue);
        }
      }
    };
    
    loadValue();
  }, [key, initialValue]);
  
  // Function to update the value in SecureStore
  const setValue = useCallback(async (value: number) => {
    try {
      await SecureStore.setItemAsync(key, String(value));
      setStoredValue(value);
    } catch (error) {
      console.error(`Error saving ${key} to SecureStore:`, error);
    }
  }, [key]);
  
  return [storedValue, setValue];
}

/**
 * Custom hook for storing and retrieving boolean values in SecureStore
 * @param key The key to store the value under
 * @param initialValue Optional initial value
 * @returns A tuple containing the current value and a setter function
 */
export function useSecureStoreBoolean(key: string, initialValue: boolean = false): [boolean | undefined, (value: boolean) => Promise<void>] {
  const [storedValue, setStoredValue] = useState<boolean | undefined>(undefined);
  
  // Load the value from SecureStore on initial mount
  useEffect(() => {
    const loadValue = async () => {
      try {
        const value = await SecureStore.getItemAsync(key);
        
        if (value !== null) {
          setStoredValue(value === 'true');
        } else {
          setStoredValue(initialValue);
        }
      } catch (error) {
        console.error(`Error loading ${key} from SecureStore:`, error);
        setStoredValue(initialValue);
      }
    };
    
    loadValue();
  }, [key, initialValue]);
  
  // Function to update the value in SecureStore
  const setValue = useCallback(async (value: boolean) => {
    try {
      await SecureStore.setItemAsync(key, String(value));
      setStoredValue(value);
    } catch (error) {
      console.error(`Error saving ${key} to SecureStore:`, error);
    }
  }, [key]);
  
  return [storedValue, setValue];
}

/**
 * Helper function to save a value to SecureStore
 * @param key The key to save under
 * @param value The value to save
 */
export async function saveToSecureStore(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`Error saving ${key} to SecureStore:`, error);
  }
}

/**
 * Helper function to retrieve a value from SecureStore
 * @param key The key to retrieve
 * @returns The value if found, null otherwise
 */
export async function getFromSecureStore(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Error getting ${key} from SecureStore:`, error);
    return null;
  }
}

/**
 * Helper function to delete a value from SecureStore
 * @param key The key to delete
 */
export async function removeFromSecureStore(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`Error deleting ${key} from SecureStore:`, error);
  }
}
