import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  Platform, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  TextInput,
  Alert,
  KeyboardAvoidingView,
  View as RNView,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { getExerciseImageUrl, getExerciseById } from '@/services/exerciseService';
import { addWorkoutLog } from '@/services/workoutService';
import type { Exercise } from '@/services/exerciseService';
import theme from '@/constants/theme';

export default function LogWorkoutModal() {
  const params = useLocalSearchParams();
  const exerciseId = params.exerciseId as string;
  const mode = params.mode as string;
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExercise = async () => {
      try {
        const exerciseData = await getExerciseById(exerciseId);
        if (exerciseData) {
          setExercise(exerciseData);
        } else {
          Alert.alert("Error", "Exercise not found");
          router.back();
        }
      } catch (error) {
        console.error("Error loading exercise:", error);
        Alert.alert("Error", "Failed to load exercise");
        router.back();
      } finally {
        setLoading(false);
      }
    };
    
    loadExercise();
  }, [exerciseId]);
  
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!exercise || !sets || !reps) {
      Alert.alert('Required Fields', 'Please fill in sets and reps');
      return;
    }
    
    setSaving(true);
    try {
      const workout = {
        exerciseId: exercise.id,
        date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
        duration: null,
        id: 0, // This will be assigned by the backend
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight: weight ? parseFloat(weight) : null,
        notes: notes || null,
        createdAt: new Date().toISOString()
      };
      
      const result = await addWorkoutLog(workout);
      
      if (result) {
        Alert.alert(
          'Success',
          'Workout logged successfully',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', 'Failed to log workout');
      }
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading exercise details...</Text>
      </View>
    );
  }

  if (!exercise) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Exercise not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{exercise.name}</Text>
          <Text style={styles.subtitle}>
            {exercise.level} • {exercise.category}
          </Text>
        </View>
        
        {exercise.images && exercise.images.length > 0 ? (
          <Image 
            source={{ uri: getExerciseImageUrl(exercise.id, 0) }} 
            style={styles.image}
            resizeMode="cover"
          />
        ) : null}
        
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Log Your Workout</Text>
          
          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sets</Text>
              <TextInput
                style={styles.input}
                value={sets}
                onChangeText={setSets}
                keyboardType="number-pad"
                placeholder="e.g., 3"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Reps</Text>
              <TextInput
                style={styles.input}
                value={reps}
                onChangeText={setReps}
                keyboardType="number-pad"
                placeholder="e.g., 10"
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Weight (kg/lbs)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder="Optional"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add your notes here..."
              multiline
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.saveButton, saving ? styles.saveButtonDisabled : null]} 
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Workout'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: theme.light.destructive,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: theme.light.mutedForeground,
    textTransform: 'capitalize',
  },
  image: {
    width: '100%',
    height: 200,
  },
  formContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    marginBottom: 16,
    flex: 1,
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: theme.light.foreground,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.light.border,
    borderRadius: theme.radius,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: theme.light.primary,
    padding: 16,
    borderRadius: theme.radius,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonDisabled: {
    backgroundColor: theme.light.mutedForeground,
  },
  saveButtonText: {
    color: theme.light.primaryForeground,
    fontWeight: 'bold',
    fontSize: 16,
  }
});
