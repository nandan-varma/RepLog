import { useState, useEffect, useRef } from 'react';
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
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Pressable,
  SafeAreaView,
  useColorScheme
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, View } from '@/components/Themed';
import { getExerciseImageUrl, getExerciseById } from '@/services/exerciseService';
import { addWorkoutLog } from '@/services/workoutService';
import type { Exercise } from '@/services/exerciseService';
import theme from '@/constants/theme';

export default function LogWorkoutModal() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = theme[colorScheme];
  
  const params = useLocalSearchParams();
  const exerciseId = params.exerciseId as string;
  const mode = params.mode as string;
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageOpacity = useRef(new Animated.Value(1)).current;
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Form state
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

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

  // Image carousel effect
  useEffect(() => {
    if (!exercise || !exercise.images || exercise.images.length <= 1 || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    
    const cycleImages = () => {
      // Store the next index before animation starts
      const nextIndex = (currentImageIndex + 1) >= exercise.images.length ? 0 : (currentImageIndex + 1);
      
      // Fade out current image
      Animated.timing(imageOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.ease
      }).start(() => {
        // Change image index
        setCurrentImageIndex(nextIndex);
        
        // Fade in new image
        Animated.timing(imageOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.ease
        }).start();
      });
    };

    // Set interval to cycle images every second
    intervalRef.current = setInterval(cycleImages, 1000);
    
    // Clear interval on cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [exercise, isPaused, currentImageIndex]);

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  const handleManualImageChange = (index: number) => {
    if (index === currentImageIndex) return;
    
    // Briefly pause automatic cycling when manually changed
    setIsPaused(true);
    
    // Fade out current image
    Animated.timing(imageOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
      easing: Easing.ease
    }).start(() => {
      // Change image index
      setCurrentImageIndex(index);
      
      // Fade in new image
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.ease
      }).start();
      
      // Use setTimeout instead of directly scheduling in the animation callback
      setTimeout(() => {
        if (isPaused) setIsPaused(false);
      }, 1500);
    });
  };

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
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={[styles.loadingText, { color: themeColors.foreground }]}>Loading exercise details...</Text>
      </View>
    );
  }

  if (!exercise) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: themeColors.destructive }]}>Exercise not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeColors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.container, { backgroundColor: themeColors.background }]}
      >
        {/* Header with back button */}
        <View style={[styles.header, { 
          backgroundColor: themeColors.background,
          borderBottomColor: themeColors.border
        }]}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: themeColors.accent }]}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Text style={[styles.backButtonText, { color: themeColors.accentForeground }]}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.title, { color: themeColors.foreground }]}>{exercise.name}</Text>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          bounces={false} 
          showsVerticalScrollIndicator={false}
        >
          {/* Badge row */}
          <View style={styles.badgesRow}>
            <View style={[styles.badge, { backgroundColor: themeColors.accent }]}>
              <Text style={[styles.badgeText, { color: themeColors.accentForeground }]}>{exercise.level}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: themeColors.accent }]}>
              <Text style={[styles.badgeText, { color: themeColors.accentForeground }]}>{exercise.category}</Text>
            </View>
            {exercise.equipment && (
              <View style={[styles.badge, { backgroundColor: themeColors.accent }]}>
                <Text style={[styles.badgeText, { color: themeColors.accentForeground }]}>{exercise.equipment}</Text>
              </View>
            )}
            {exercise.mechanic && (
              <View style={[styles.badge, { backgroundColor: themeColors.accent }]}>
                <Text style={[styles.badgeText, { color: themeColors.accentForeground }]}>{exercise.mechanic}</Text>
              </View>
            )}
          </View>
          
          {/* Image Carousel */}
          <View style={[styles.imageContainer, { backgroundColor: themeColors.muted }]}>
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={togglePause}
              style={styles.imageWrapper}
            >
              {exercise.images && exercise.images.length > 0 ? (
                <Animated.Image 
                  source={{ uri: getExerciseImageUrl(exercise.id, currentImageIndex) }} 
                  style={[styles.image, { opacity: imageOpacity }]}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.image, styles.noImageContainer, { backgroundColor: themeColors.muted }]}>
                  <Text style={[styles.noImageText, { color: themeColors.mutedForeground }]}>No image available</Text>
                </View>
              )}
              
              {/* Pause/Play button overlay */}
              {exercise.images && exercise.images.length > 1 && (
                <View style={styles.pauseButtonContainer}>
                  <TouchableOpacity 
                    style={styles.pauseButton}
                    onPress={togglePause}
                  >
                    <Text style={styles.pauseButtonText}>
                      {isPaused ? "▶" : "⏸"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
            
            {/* Image dots indicators */}
            {exercise.images && exercise.images.length > 1 && (
              <View style={styles.dotIndicatorContainer}>
                {exercise.images.map((_, index) => (
                  <TouchableOpacity 
                    key={index}
                    onPress={() => handleManualImageChange(index)}
                  >
                    <View
                      style={[
                        styles.dot,
                        { backgroundColor: index === currentImageIndex 
                          ? themeColors.primary 
                          : themeColors.muted 
                        }
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          
          {/* Section Tabs */}
          <View style={[styles.tabsContainer, { borderColor: themeColors.border }]}>
            <Pressable
              style={[
                styles.tab, 
                showInstructions && [styles.activeTab, { borderBottomColor: themeColors.primary }]
              ]}
              onPress={() => setShowInstructions(true)}
            >
              <Text style={[
                styles.tabText, 
                { color: themeColors.mutedForeground },
                showInstructions && [styles.activeTabText, { color: themeColors.primary }]
              ]}>
                Instructions
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.tab, 
                !showInstructions && [styles.activeTab, { borderBottomColor: themeColors.primary }]
              ]}
              onPress={() => setShowInstructions(false)}
            >
              <Text style={[
                styles.tabText, 
                { color: themeColors.mutedForeground },
                !showInstructions && [styles.activeTabText, { color: themeColors.primary }]
              ]}>
                Log Workout
              </Text>
            </Pressable>
          </View>
          
          {/* Instructions panel */}
          {showInstructions ? (
            <>
              {/* Muscles targeted */}
              {(exercise.primaryMuscles && exercise.primaryMuscles.length > 0) && (
                <View style={styles.musclesContainer}>
                  <Text style={styles.sectionTitle}>Muscles Targeted</Text>
                  <View style={styles.muscleTagsContainer}>
                    {exercise.primaryMuscles.map((muscle, index) => (
                      <View key={index} style={styles.muscleTag}>
                        <Text style={styles.muscleTagText}>{muscle}</Text>
                      </View>
                    ))}
                  </View>
                  
                  {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                    <>
                      <Text style={styles.secondaryMusclesTitle}>Secondary Muscles</Text>
                      <View style={styles.muscleTagsContainer}>
                        {exercise.secondaryMuscles.map((muscle, index) => (
                          <View key={index} style={[styles.muscleTag, styles.secondaryMuscleTag]}>
                            <Text style={styles.muscleTagText}>{muscle}</Text>
                          </View>
                        ))}
                      </View>
                    </>
                  )}
                </View>
              )}

              {exercise.instructions && exercise.instructions.length > 0 && (
                <View style={styles.instructionsContainer}>
                  <Text style={styles.sectionTitle}>How To Perform</Text>
                  {exercise.instructions.map((instruction, index) => (
                    <View key={index} style={styles.instructionItem}>
                      <Text style={styles.instructionNumber}>{index + 1}</Text>
                      <Text style={styles.instructionText}>{instruction}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          ) : (
            /* Form Container with shadow */
            <View style={styles.formCardContainer}>
              <View style={styles.formContainer}>                
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
                  style={[
                    styles.saveButton, 
                    { backgroundColor: themeColors.primary },
                    saving ? [styles.saveButtonDisabled, { backgroundColor: themeColors.muted }] : null
                  ]} 
                  onPress={handleSave}
                  disabled={saving}
                >
                  <Text style={[styles.saveButtonText, { color: themeColors.primaryForeground }]}>
                    {saving ? 'Saving...' : 'Save Workout'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Use a light status bar on iOS to account for the black space above the modal */}
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // backgroundColor is applied dynamically
  },
  container: {
    flex: 1,
    // backgroundColor is applied dynamically
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    // color is applied dynamically
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    // color is applied dynamically
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    // borderBottomColor is applied dynamically
    // backgroundColor is applied dynamically
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    // backgroundColor is applied dynamically
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    // color is applied dynamically
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    // color is applied dynamically
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    // backgroundColor is applied dynamically
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    // color is applied dynamically
    textTransform: 'capitalize',
  },
  imageContainer: {
    width: '100%',
    height: 280,
    // backgroundColor is applied dynamically
    marginBottom: 16,
    position: 'relative',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor is applied dynamically
  },
  noImageText: {
    fontSize: 16,
    // color is applied dynamically
  },
  pauseButtonContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  pauseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  dotIndicatorContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    // backgroundColor is applied dynamically
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    // borderColor is applied dynamically
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    // borderBottomColor is applied dynamically
  },
  tabText: {
    fontSize: 16,
    // color is applied dynamically
  },
  activeTabText: {
    fontWeight: '600',
    // color is applied dynamically
  },
  musclesContainer: {
    padding: 16,
    // backgroundColor is applied dynamically
    marginBottom: 16,
  },
  muscleTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  muscleTag: {
    // backgroundColor is applied dynamically
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  secondaryMuscleTag: {
    // backgroundColor is applied dynamically
  },
  muscleTagText: {
    // color is applied dynamically
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  secondaryMusclesTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 8,
    // color is applied dynamically
  },
  instructionsContainer: {
    padding: 16,
    // backgroundColor is applied dynamically
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
    // backgroundColor is applied dynamically
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    // backgroundColor is applied dynamically
    // color is applied dynamically
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 28,
    marginRight: 16,
    overflow: 'hidden',
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    // color is applied dynamically
  },
  formCardContainer: {
    margin: 16,
    // backgroundColor is applied dynamically
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 32,
  },
  formContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    // color is applied dynamically
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 16,
    flex: 1,
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    // color is applied dynamically
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    // borderColor is applied dynamically
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    // backgroundColor is applied dynamically
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    // backgroundColor is applied dynamically
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonDisabled: {
    // backgroundColor is applied dynamically
  },
  saveButtonText: {
    // color is applied dynamically
    fontWeight: 'bold',
    fontSize: 16,
  }
});