import React, { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Exercise, type ExerciseFilters } from "@/services/exerciseService";

interface ExerciseFilterProps {
    filters: ExerciseFilters;
    onFiltersChange: (filters: ExerciseFilters) => void;
    availableCategories: string[];
    availableLevels: Exercise["level"][];
    availableEquipment: Exercise["equipment"][];
    isLoading?: boolean;
}

/**
 * Component for selecting individual filter options - to be used inside FilterSection
 */
export function ExerciseFilter({ 
    filters, 
    onFiltersChange, 
    availableCategories,
    availableLevels,
    availableEquipment,
    isLoading = false 
}: ExerciseFilterProps) {
    
    const handleFilterChange = (key: keyof ExerciseFilters, value: string | undefined) => {
        onFiltersChange({ ...filters, [key]: value });
    };
    
    if (isLoading) {
        return (
            <View className="py-4 items-center justify-center">
                <ActivityIndicator size="small" />
                <Text className="mt-2 text-muted-foreground">Loading options...</Text>
            </View>
        );
    }
    
    return (
        <View className="space-y-4">
            {/* Filter selections will go here */}
            {/* This component is separate to allow for more customization and reuse */}
        </View>
    );
}
