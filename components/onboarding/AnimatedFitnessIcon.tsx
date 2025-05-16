import React from 'react';
import { View, StyleSheet } from 'react-native';
import { cn } from '~/lib/utils';

interface AnimatedFitnessIconProps {
    iconType: 'dumbbell' | 'runner' | 'scale' | 'heart' | 'ruler';
    size?: number;
    color?: string;
    className?: string;
    style?: any;
}

/**
 * Static fitness icons for onboarding screens
 */
export function AnimatedFitnessIcon({
    iconType,
    size = 100,
    color = '#0891b2', // Primary color
    className,
    style
}: AnimatedFitnessIconProps) {
    // No animations to avoid interpolation errors    // Render specific icon based on type
    const renderIconContent = () => {
        switch (iconType) {
            case 'dumbbell':
                return <DumbbellIcon color={color} />;
            case 'runner':
                return <StaticRunnerIcon color={color} />;
            case 'scale':
                return <ScaleIcon color={color} />;
            case 'heart':
                return <HeartIcon color={color} />;
            case 'ruler':
                return <StaticRulerIcon color={color} />;
            default:
                return null;
        }
    };
    return (
        <View
            style={style}
            className={cn("items-center justify-center", className)}>
            {renderIconContent()}
        </View>
    );
}

// Individual icon components
const DumbbellIcon = ({ color }: { color: string }) => (
    <View className="flex-row items-center">
        <View className="w-5 h-5 rounded-full" style={{ backgroundColor: color }} />
        <View className="w-[30px] h-2 rounded" style={{ backgroundColor: color }} />
        <View className="w-5 h-5 rounded-full" style={{ backgroundColor: color }} />
    </View>
);

// Static version of the runner icon to avoid animation issues
const StaticRunnerIcon = ({ color }: { color: string }) => {
    return (
        <View className="items-center">
            <View className="w-5 h-5 rounded-full mb-0.5" style={{ backgroundColor: color }} />
            <View className="w-2 h-[25px] rounded mb-0.5" style={{ backgroundColor: color }} />
            <View className="flex-row relative">
                <View className="w-[5px] h-[18px] rounded mx-[5px]" style={{ backgroundColor: color }} />
                <View style={[styles.runnerLimb, { backgroundColor: color }]} />
            </View>
            <View className="flex-row absolute top-5">
                <View className="w-[5px] h-3 rounded mx-[5px]" style={{ backgroundColor: color }} />
                <View className="w-[5px] h-3 rounded mx-[5px]" style={{ backgroundColor: color }} />
            </View>
        </View>
    );
};

const ScaleIcon = ({ color }: { color: any }) => {
    const backgroundColor = typeof color === 'string' ? color : '#0891b2';

    return (
        <View className="items-center">
            <View className="w-10 h-[5px] rounded" style={{ backgroundColor }} />
            <View className="w-[30px] h-5 rounded border-2 my-[5px]" style={{ borderColor: backgroundColor }} />
            <View className="w-[45px] h-[10px] rounded" style={{ backgroundColor }} />
        </View>
    );
};

const HeartIcon = ({ color }: { color: any }) => {
    const backgroundColor = typeof color === 'string' ? color : '#0891b2';

    return (
        <View className="w-[30px] h-[30px] rounded transform rotate-45 relative" style={{ backgroundColor }} />
    );
};

// Static version of the ruler icon to avoid animation issues
const StaticRulerIcon = ({ color }: { color: string }) => {
    return (
        <View className="items-center">
            <View className="w-[60px] h-[10px] rounded" style={{ backgroundColor: color }} />
            <View className="absolute top-[-10px] w-1 h-[15px] rounded" style={{ backgroundColor: color }} />
        </View>
    );
};

const styles = StyleSheet.create({
    // Dumbbell styles
    dumbbellWeight: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    dumbbellBar: {
        width: 30,
        height: 8,
        borderRadius: 4,
    },

    // Runner styles
    runnerHead: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginBottom: 2,
    },
    runnerBody: {
        width: 8,
        height: 25,
        borderRadius: 4,
        marginBottom: 2,
    },
    runnerLimb: {
        width: 5,
        height: 18,
        borderRadius: 3,
        marginHorizontal: 5,
    },

    // Scale styles
    scaleTop: {
        width: 40,
        height: 5,
        borderRadius: 2,
    },
    scaleDisplay: {
        width: 30,
        height: 20,
        borderRadius: 5,
        borderWidth: 2,
        marginVertical: 5,
    },
    scaleBottom: {
        width: 45,
        height: 10,
        borderRadius: 5,
    },

    // Heart styles
    heart: {
        width: 30,
        height: 30,
        transform: [{ rotate: '45deg' }],
        borderRadius: 5,
        position: 'relative',
    },

    // Ruler styles
    ruler: {
        width: 60,
        height: 10,
        borderRadius: 2,
    },
    rulerMarker: {
        position: 'absolute',
        top: -10,
        width: 4,
        height: 15,
        borderRadius: 2,
    }
});
