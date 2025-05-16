import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { cn } from '~/lib/utils';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';
import { Label } from '~/components/ui/label';
import { Heart } from 'phosphor-react-native';
import DumbbellIcon from '@/components/icons/DumbbellIcon';
import WeightIcon from '@/components/icons/WeightIcon';

// Define all possible fitness goals
export interface FitnessGoal {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface FitnessGoalSelectorProps {
  goals: FitnessGoal[];
  onSelect: (goalId: string) => void;
  selectedGoalId?: string;
  className?: string;
}

export function FitnessGoalSelector({ 
  goals, 
  onSelect, 
  selectedGoalId = '',
  className 
}: FitnessGoalSelectorProps) {
  
  // Function to create onLabelPress handlers
  function onLabelPress(goalId: string) {
    return () => {
      onSelect(goalId);
    };
  }

  return (
    <View className={cn("p-4", className)}>
      <RadioGroup
        value={selectedGoalId}
        onValueChange={onSelect}
        className="gap-3"
      >
        {goals.map((goal) => (
          <GoalOption
            key={goal.id}
            goal={goal}
            onLabelPress={onLabelPress(goal.id)}
          />
        ))}
      </RadioGroup>
    </View>
  );
}

// Radio Group Goal Option
interface GoalOptionProps {
  goal: FitnessGoal;
  onLabelPress: () => void;
}

function GoalOption({ goal, onLabelPress }: GoalOptionProps) {
  return (
    <View className="flex-row items-center p-4 rounded-lg border border-border mb-3">
      <RadioGroupItem 
        aria-labelledby={`label-for-${goal.id}`} 
        value={goal.id} 
      />
      <View className="flex-row items-center ml-3 flex-1">
        {/* {goal.icon && <View className="mr-3">{goal.icon}</View>} */}
        <View className="flex-1">
          <Label 
            nativeID={`label-for-${goal.id}`} 
            onPress={onLabelPress}
            className="font-bold text-lg text-foreground"
          >
            {goal.title}
          </Label>
          <Text className="text-muted-foreground">
            {goal.description}
          </Text>
        </View>
      </View>
    </View>
  );
}
