import * as React from "react";
import { View, ScrollView, ScrollViewProps, DimensionValue } from "react-native";
import { cn } from '~/lib/utils';

interface ScrollAreaProps extends ScrollViewProps {
  className?: string;
  children?: React.ReactNode;
  orientation?: "vertical" | "horizontal";
  height?: DimensionValue;
  width?: DimensionValue;
}

/**
 * A scrollable area component that works with React Native.
 */
export function ScrollArea({
  className,
  children,
  orientation = "vertical",
  height,
  width,
  style,
  ...props
}: ScrollAreaProps) {
  const isVertical = orientation === "vertical";
  
  return (
    <View 
      style={[
        height !== undefined || width !== undefined ? { height, width } : undefined,
        style
      ]} 
      className={cn("overflow-hidden", className)}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={isVertical}
        showsHorizontalScrollIndicator={!isVertical}
        horizontal={!isVertical}
        {...props}
      >
        {children}
      </ScrollView>
    </View>
  );
}

// Export legacy components for backward compatibility
export const ScrollViewport = ScrollView;
export const ScrollBar = View;
export const ScrollThumb = View;
