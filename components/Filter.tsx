import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { Filter } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Text } from "@/components/ui/text";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ScrollArea";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue,
    SelectGroup,
    SelectLabel
} from "@/components/ui/select";
import { Exercise, ExerciseCategory, exerciseService, type ExerciseFilters } from "@/services/exerciseService";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface FilterPopoverProps {
        filters: ExerciseFilters;
        onFiltersChange: (filters: ExerciseFilters) => void;
        activeFilterCount?: number;
}

export function FilterPopover({ filters, onFiltersChange, activeFilterCount = 0 }: FilterPopoverProps) {
        const [isOpen, setIsOpen] = useState(false);
        const [categories, setCategories] = useState<ExerciseCategory[]>([]);
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

        // Load filter options when popover opens
        useEffect(() => {
                if (isOpen) {
                        loadFilterOptions();
                }
        }, [isOpen]);

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
                setIsOpen(false);
        };
        return (
                <Popover onOpenChange={setIsOpen}>
                        <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="flex-row items-center h-10">
                                        <Filter className="h-4 w-4 mr-1.5 p-2" />
                                        <Text>Filters</Text>
                                        {activeFilterCount > 0 ? (
                                                <View className="ml-1.5 rounded-full bg-primary w-5 h-5 items-center justify-center">
                                                        <Text className="text-primary-foreground text-xs font-medium">{activeFilterCount}</Text>
                                                </View>
                                        ) : null}
                                </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px]">
                                
                        </PopoverContent>
                </Popover>
        );
}
