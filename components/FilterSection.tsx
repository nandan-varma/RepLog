import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { ChevronDown, ChevronUp, Filter as FilterIcon } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ScrollArea";
import Animated, {
    FadeIn,
    FadeOut,
    SlideInDown,
    SlideInLeft,
    SlideOutLeft,
    SlideOutRight,
    SlideOutUp,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel
} from "@/components/ui/select";
import { Exercise, exerciseService, type ExerciseFilters } from "@/services/exerciseService";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface FilterSectionProps {
    filters: ExerciseFilters;
    onFiltersChange: (filters: ExerciseFilters) => void;
    activeFilterCount: number;
}

export function FilterSection({ filters, onFiltersChange, activeFilterCount = 0 }: FilterSectionProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const [levels, setLevels] = useState<Exercise["level"][]>([]);
    const [equipmentTypes, setEquipmentTypes] = useState<Exercise["equipment"][]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const insets = useSafeAreaInsets();

    const contentInsets = {
        top: insets.top,
        bottom: insets.bottom,
        left: 12,
        right: 12,
    };

    // Load filter options when filter section expands
    useEffect(() => {
        if (isExpanded) {
            loadFilterOptions();
        }
    }, [isExpanded]);

    const loadFilterOptions = async () => {
        setIsLoading(true);
        try {
            const [categoriesData, levelsData, equipmentData] = await Promise.all([
                exerciseService.getCategories(),
                exerciseService.getLevels(),
                exerciseService.getEquipment()
            ]);

            setCategories(categoriesData);
            setLevels(levelsData);
            setEquipmentTypes(equipmentData);
        } catch (error) {
            console.error("Failed to load filter options:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (key: keyof ExerciseFilters, value: string | undefined) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    const clearFilters = () => {
        onFiltersChange({
            query: filters.query,
            category: undefined,
            level: undefined,
            equipment: undefined,
            muscle: undefined,
        });
    };

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <View className="mt-2">
            <Button
                variant="outline"
                size="sm"
                onPress={toggleExpanded}
                className="flex-row items-center justify-between w-full h-10"
            >
                <View className="flex-row items-center p-2">
                    <FilterIcon className="h-4 w-4 mr-1.5" />
                    <Text>Filters</Text>
                    {activeFilterCount > 0 ? (
                        <View className="ml-1.5 rounded-full bg-primary w-5 h-5 items-center justify-center">
                            <Text className="text-primary-foreground text-xs font-medium">{activeFilterCount}</Text>
                        </View>
                    ) : null}
                </View>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {isExpanded ? (
                <Animated.View
                    className="mt-2 bg-card rounded-md border border-border p-4 space-y-4"
                    entering={SlideInLeft.springify().damping(15)}
                    exiting={SlideOutRight.springify().damping(15)}
                >
                    <Text className="font-semibold text-lg">Filter Options</Text>
                    <ScrollArea className="h-80">
                        <View className="p-4 space-y-4">
                            <Text className="font-semibold text-lg">Filters</Text>
                            {isLoading ? (
                                <View className="py-12 items-center justify-center">
                                    <ActivityIndicator size="small" />
                                    <Text className="mt-2 text-muted-foreground">Loading filters...</Text>
                                </View>
                            ) : (
                                <>
                                    <View className="space-y-2">
                                        <Text className="font-medium">Category</Text>
                                        <Select defaultValue={filters.category ? { value: filters.category, label: filters.category.charAt(0).toUpperCase() + filters.category.slice(1) } : undefined}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent insets={contentInsets}>
                                                <SelectGroup>
                                                    <SelectLabel>Categories</SelectLabel>
                                                    {categories.map((category) => (
                                                        <SelectItem
                                                            key={category}
                                                            value={category}
                                                            label={category.charAt(0).toUpperCase() + category.slice(1)}
                                                            onPress={() => handleFilterChange("category", category)}
                                                        >
                                                            {category.charAt(0).toUpperCase() + category.slice(1)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </View>

                                    <View className="space-y-2">
                                        <Text className="font-medium">Level</Text>
                                        <Select defaultValue={filters.level ? { value: filters.level, label: filters.level.charAt(0).toUpperCase() + filters.level.slice(1) } : undefined}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select level" />
                                            </SelectTrigger>
                                            <SelectContent insets={contentInsets}>
                                                <SelectGroup>
                                                    <SelectLabel>Difficulty</SelectLabel>
                                                    {levels.map((level) => (
                                                        <SelectItem
                                                            key={level}
                                                            value={level}
                                                            label={level.charAt(0).toUpperCase() + level.slice(1)}
                                                            onPress={() => handleFilterChange("level", level)}
                                                        >
                                                            {level.charAt(0).toUpperCase() + level.slice(1)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </View>

                                    <View className="space-y-2">
                                        <Text className="font-medium">Equipment</Text>
                                        <Select defaultValue={filters.equipment ? { value: filters.equipment, label: filters.equipment.charAt(0).toUpperCase() + filters.equipment.slice(1) } : undefined}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select equipment" />
                                            </SelectTrigger>
                                            <SelectContent insets={contentInsets}>
                                                <SelectGroup>
                                                    <SelectLabel>Equipment Types</SelectLabel>
                                                    {equipmentTypes.map((item) => (
                                                        item && (
                                                            <SelectItem
                                                                key={item}
                                                                value={item}
                                                                label={item.charAt(0).toUpperCase() + item.slice(1)}
                                                                onPress={() => handleFilterChange("equipment", item)}
                                                            >
                                                                {item.charAt(0).toUpperCase() + item.slice(1)}
                                                            </SelectItem>
                                                        )
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </View>
                                </>
                            )}

                            <Separator />

                            <View className="flex-row justify-center space-x-2 p-2">
                                <Button variant="outline" onPress={clearFilters}>
                                    <Text>Clear</Text>
                                </Button>
                            </View>
                        </View>
                    </ScrollArea>
                </Animated.View>
            ) : null}
        </View>
    );
}
