import { View } from "react-native"
import { Text } from "~/components/ui/text"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button"
import { LogWorkoutForm } from "~/components/LogWorkoutForm"

type LogWorkoutDialogProps = {
  isOpen: boolean
  selectedDate: Date | null
  onOpenChange: (open: boolean) => void
  triggerLabel?: string
}

export function LogWorkoutDialog({ 
  isOpen, 
  selectedDate, 
  onOpenChange,
  triggerLabel = "Log Workout" 
}: LogWorkoutDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-full">
          <Text className="text-white">{triggerLabel}</Text>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Text className="text-white">
              Log Workout for{" "}
              {selectedDate?.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </DialogTitle>
        </DialogHeader>
        <LogWorkoutForm
          date={selectedDate?.toISOString().split('T')[0]}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
