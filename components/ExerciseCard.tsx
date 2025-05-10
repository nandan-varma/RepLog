import React from 'react';
import { StyleSheet, Image, View as RNView, Pressable, TouchableOpacity, useColorScheme } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Exercise, getExerciseImageUrl } from '@/services/exerciseService';
import { router } from 'expo-router';
import theme from '@/constants/theme';

interface ExerciseCardProps {
    exercise: Exercise;
    onPress?: (exercise: Exercise) => void;
}

export default function ExerciseCard({ exercise, onPress }: ExerciseCardProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = theme[colorScheme];
    
    const handlePress = () => {
        if (onPress) {
            onPress(exercise);
        } else {
            router.push({
                pathname: "/modal",
                params: { exerciseId: exercise.id }
            });
        }
    };    // Create dynamic styles based on current theme
    const dynamicStyles = styles(themeColors);

    return (
        <Pressable
            style={dynamicStyles.card}
            onPress={handlePress}
        >
            <RNView style={dynamicStyles.imageContainer}>
                {exercise.images && exercise.images.length > 0 ? (
                    <Image
                        source={{ uri: getExerciseImageUrl(exercise.id, 0) }}
                        style={dynamicStyles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <RNView style={dynamicStyles.placeholderImage} />
                )}
                <TouchableOpacity
                    style={dynamicStyles.logButton}
                    onPress={() => router.push({
                        pathname: "/modal",
                        params: { exerciseId: exercise.id, mode: 'log' }
                    })}
                >
                    <Text style={dynamicStyles.logButtonText}>Log Workout</Text>
                </TouchableOpacity>
            </RNView>
            <RNView style={dynamicStyles.content}>
                <Text style={dynamicStyles.title}>{exercise.name}</Text>
                <RNView style={dynamicStyles.metaContainer}>
                    <Text style={dynamicStyles.level}>{exercise.level}</Text>
                    {exercise.equipment ? (
                        <Text style={dynamicStyles.equipment}>• {exercise.equipment}</Text>
                    ) : null}
                </RNView>
                <Text style={dynamicStyles.muscles}>
                    {exercise.primaryMuscles.join(', ')}
                </Text>
            </RNView>
        </Pressable>
    );
}

const styles = (themeColors: any) => StyleSheet.create({
    card: {
        borderRadius: 8,
        marginHorizontal: 16,
        marginBottom: 16,
        overflow: 'hidden',
        backgroundColor: themeColors.card,
        shadowColor: themeColors.background,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    logButton: {
        position: 'absolute',
        right: 10,
        bottom: 10,
        backgroundColor: themeColors.primary,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: theme.radius,
    },
    logButtonText: {
        color: themeColors.primaryForeground,
        fontWeight: 'bold',
    },
    imageContainer: {
        height: 160,
        width: '100%',
        backgroundColor: themeColors.muted,
    }, 
    image: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        backgroundColor: themeColors.muted,
    },
    content: {
        padding: 16,
        backgroundColor: themeColors.card,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        color: themeColors.cardForeground,
    },
    metaContainer: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    level: {
        textTransform: 'capitalize',
        marginRight: 8,
        fontSize: 14,
        color: themeColors.cardForeground,
    },
    equipment: {
        fontSize: 14,
        color: themeColors.cardForeground,
    },
    muscles: {
        fontSize: 14,
        color: themeColors.cardForeground,
    },
});
