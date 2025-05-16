import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookmarkButton } from '@/components/BookmarkButton';
import { exerciseService, type Exercise } from '@/services/exerciseService';
import Svg, { FeColorMatrix, Filter, Image } from 'react-native-svg'
import Animated, {
    FadeIn,
    FadeOut,
    SlideInRight,
    SlideOutRight,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    interpolate,
    Extrapolate,
    withTiming
} from 'react-native-reanimated';

interface ExerciseInfoProps {
    exercise: Exercise;
}

export function ExerciseInfo({ exercise }: ExerciseInfoProps) {
    const { width, height } = useWindowDimensions();
    const [showFullDescription, setShowFullDescription] = useState(false);

    // Animation values
    const scrollY = useSharedValue(0);


    const headerAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(
                scrollY.value,
                [0, 100],
                [0, 1],
                Extrapolate.CLAMP
            ),
        };
    });

    const titleOpacityStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(
                scrollY.value,
                [0, 50, 100],
                [1, 0.5, 0],
                Extrapolate.CLAMP
            ),
        };
    });

    return (
        <Animated.View
            className="flex-1 bg-background pt-4"
            entering={SlideInRight.springify().damping(15)}
            exiting={SlideOutRight.springify().damping(15)}
        >
            <StatusBar style="light" />
            {/* Fixed header that appears when scrolling */}
            <Animated.View
                style={[headerAnimatedStyle]}
                className="absolute top-0 left-0 right-0 z-10 bg-background/90 backdrop-blur-md p-4 border-b border-border flex-row justify-between items-center"
            >
                <Text className="text-lg font-semibold">{exercise.name}</Text>
                <BookmarkButton
                    exerciseId={exercise.id}
                    variant="icon"
                    size="sm"
                />
            </Animated.View>

            {/* Main scrollable content */}
            <Animated.ScrollView
                className="flex-1"
                onScroll={(event) => {
                    scrollY.value = event.nativeEvent.contentOffset.y;
                }}
                scrollEventThrottle={16}
            >
                {/* Header with image */}
                <View className="relative pt-4">
                    <Svg style={{
                        width: '100%',
                        height: 250,
                        // black and white filter
                    }}>
                        <Filter id="myFilter">
                            <FeColorMatrix type="saturate" values="0" />
                        </Filter>
                        <Image
                            href={{ uri: exerciseService.getImageUrl(exercise.images[0]) }}
                            height="100%"
                            width="100%"
                            filter="url(#myFilter)"
                        />
                    </Svg>

                    {/* Overlay gradient */}
                    <View className="absolute inset-0 bg-black/30" />

                    {/* Back button */}
                    <View className="absolute top-12 left-4 right-4 flex-row justify-between">
                        <BookmarkButton
                            exerciseId={exercise.id}
                            variant="icon"
                            size="lg"
                            className="bg-background/20 rounded-full text-white"
                        />
                    </View>

                    {/* Title overlay */}
                    <Animated.View
                        style={[titleOpacityStyle]}
                        className="absolute bottom-0 left-0 right-0 p-4 bg-background/60 backdrop-blur-lg"
                        entering={FadeIn.delay(200).duration(300)}
                    >
                        <Text className="text-2xl font-bold text-foreground">{exercise.name}</Text>
                    </Animated.View>
                </View>
                {/* Content */}
                <View className="flex-1 px-4 py-6">
                    <Animated.View
                        className="space-y-6"
                        entering={FadeIn.delay(300).duration(500)}
                    >

                        {/* Description with expand/collapse - would normally come from the API */}
                        <View className="bg-muted/30 rounded-lg p-4 mt-4">
                            <TouchableOpacity
                                className="flex-row justify-between items-center"
                                onPress={() => setShowFullDescription(!showFullDescription)}
                            >
                                <Text className="text-lg font-semibold">Description</Text>
                                {showFullDescription ?
                                    <ChevronUp size={20} className="text-muted-foreground" /> :
                                    <ChevronDown size={20} className="text-muted-foreground" />
                                }
                            </TouchableOpacity>

                            {/* Quick stats */}
                            <View className="flex-row justify-between mt-8 mb-4">
                                <Animated.View
                                    entering={FadeIn.delay(300).duration(500)}
                                    className="items-center bg-muted/30 p-3 rounded-lg flex-1 mr-2"
                                >
                                    <Text className="text-xs text-muted-foreground">Category</Text>
                                    <Text className="font-semibold">{exercise.category}</Text>
                                </Animated.View>

                                <Animated.View
                                    entering={FadeIn.delay(400).duration(500)}
                                    className="items-center bg-muted/30 p-3 rounded-lg flex-1 mx-2"
                                >
                                    <Text className="text-xs text-muted-foreground">level</Text>
                                    <Text className="font-semibold">{exercise.level}</Text>
                                </Animated.View>

                                <Animated.View
                                    entering={FadeIn.delay(500).duration(500)}
                                    className="items-center bg-muted/30 p-3 rounded-lg flex-1 ml-2"
                                >
                                    <Text className="text-xs text-muted-foreground">Muscle</Text>
                                    <Text className="font-semibold">{exercise.primaryMuscles.join(', ')}</Text>
                                </Animated.View>
                            </View>

                            <Animated.View
                                entering={FadeIn.duration(300)}
                                exiting={FadeOut.duration(200)}
                                className={showFullDescription ? "mt-2" : "mt-2 overflow-hidden"}
                            >
                                {!showFullDescription && (
                                    <View className="flex-row justify-between mt-8 mb-4">
                                        <Animated.View
                                            entering={FadeIn.delay(300).duration(500)}
                                            className="items-center bg-muted/30 p-3 rounded-lg flex-1 mr-2"
                                        >
                                            <Text className="text-xs text-muted-foreground">Mechanic</Text>
                                            <Text className="font-semibold">{exercise.mechanic ? exercise.mechanic : "None"}</Text>
                                        </Animated.View>

                                        <Animated.View
                                            entering={FadeIn.delay(400).duration(500)}
                                            className="items-center bg-muted/30 p-3 rounded-lg flex-1 mx-2"
                                        >
                                            <Text className="text-xs text-muted-foreground">Force</Text>
                                            <Text className="font-semibold">{exercise.force ? exercise.force : "None"}</Text>
                                        </Animated.View>

                                        <Animated.View
                                            entering={FadeIn.delay(500).duration(500)}
                                            className="items-center bg-muted/30 p-3 rounded-lg flex-1 ml-2"
                                        >
                                            <Text className="text-xs text-muted-foreground">Secondary</Text>
                                            <Text className="font-semibold">{exercise.secondaryMuscles.length === 0 ? "None" : exercise.secondaryMuscles.join(', ')}</Text>
                                        </Animated.View>
                                    </View>
                                )}
                            </Animated.View>
                        </View>
                        <Animated.View
                            entering={FadeIn.duration(300)}
                            exiting={FadeOut.duration(200)}
                            className={showFullDescription ? "mt-2" : "mt-2 overflow-hidden"}
                        >
                            <Text className="text-base leading-relaxed text-muted-foreground">
                                {`Equipment: ${exercise.equipment || "None"}`}
                            </Text>

                        </Animated.View>
                        {/* Instructions - would normally come from the API */}
                        <View className="mt-6">
                            <Text className="text-lg font-semibold mb-4">Instructions</Text>
                            <View className="space-y-4">
                                {(exercise.instructions || [
                                    "Start in a proper position with your body aligned.",
                                    "Slowly perform the movement with controlled motion.",
                                    "Focus on form and technique throughout the exercise.",
                                    "Breathe properly throughout the movement.",
                                    "Complete the required repetitions with proper form."
                                ]).map((instruction, index) => (
                                    <Animated.View
                                        key={index}
                                        className="flex-row bg-muted/20 p-3 rounded-lg"
                                        entering={FadeIn.delay(index * 100).duration(400)}
                                    >
                                        <View className="bg-primary h-6 w-6 rounded-full items-center justify-center mr-3">
                                            <Text className="text-primary-foreground font-bold">{index + 1}</Text>
                                        </View>
                                        <Text className="flex-1 text-foreground">{instruction}</Text>
                                    </Animated.View>
                                ))}
                            </View>
                        </View>

                        {/* Start workout button */}
                        <Animated.View
                            entering={FadeIn.delay(600).duration(500)}
                            className="mt-4 mb-12"
                        >
                            <Button
                                className="mb-4"
                                onPress={() => console.log('Start workout with', exercise.name)}
                            >
                                <Text className="text-primary-foreground font-medium">Add to Workout</Text>
                            </Button>
                            <Button
                                variant="outline"
                                onPress={() => console.log('View similar exercises')}
                            >
                                <Text className="font-medium">View Similar Exercises</Text>
                            </Button>
                        </Animated.View>
                    </Animated.View>
                </View>
                <View className="h-10" />
            </Animated.ScrollView>
        </Animated.View>
    );
}
