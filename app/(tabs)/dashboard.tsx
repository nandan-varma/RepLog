"use client"

import { useState } from "react"
import { View } from "react-native"
import { Text } from "@/components/ui/text"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkoutStats } from "@/components/workout/WorkoutStats"
import { BookmarkedExercises } from "@/components/excercise/BookmarkedExercises"
import { WorkoutHistory } from "@/components/workout/WorkoutHistory"
import { FitnessGoalDisplay } from "@/components/FitnessGoalDisplay"

export function Dashboard() {
    const [tab, setTab] = useState("bookmarks");

    return (
        <View className="p-4 space-y-6 gap-4 mt-16">
            <WorkoutStats />
            <FitnessGoalDisplay />
            <Tabs
                value={tab}
                onValueChange={(value) => setTab(value)}
            >
                <TabsList className="flex-row w-full">
                    <TabsTrigger value="bookmarks" className="flex-1">
                        <Text>Bookmarks</Text>
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex-1">
                        <Text>History</Text>
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="bookmarks" className="mt-4">
                    <BookmarkedExercises />
                </TabsContent>
                <TabsContent value="history" className="mt-4">
                    <WorkoutHistory />
                </TabsContent>
            </Tabs>
        </View>
    )
}

export default Dashboard