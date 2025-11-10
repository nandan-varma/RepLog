import * as AccordionPrimitive from '@rn-primitives/accordion';
import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';

import { ChevronDown } from 'lucide-react-native';
import { cn } from '~/lib/utils';
import { TextClassContext } from '~/components/ui/text';

const Accordion = React.forwardRef<AccordionPrimitive.RootRef, AccordionPrimitive.RootProps>(
  ({ children, ...props }, ref) => {
    return (
      <AccordionPrimitive.Root ref={ref} {...props} asChild={Platform.OS !== 'web'}>
        <View>{children}</View>
      </AccordionPrimitive.Root>
    );
  }
);

Accordion.displayName = AccordionPrimitive.Root.displayName;

const AccordionItem = React.forwardRef<AccordionPrimitive.ItemRef, AccordionPrimitive.ItemProps>(
  ({ className, value, ...props }, ref) => {
    return (
      <View className={'overflow-hidden'}>
        <AccordionPrimitive.Item
          ref={ref}
          className={cn('border-b border-border', className)}
          value={value}
          {...props}
        />
      </View>
    );
  }
);
AccordionItem.displayName = AccordionPrimitive.Item.displayName;

const Trigger = Platform.OS === 'web' ? View : Pressable;

const AccordionTrigger = React.forwardRef<
  AccordionPrimitive.TriggerRef,
  AccordionPrimitive.TriggerProps
>(({ className, children, ...props }, ref) => {
  const { isExpanded } = AccordionPrimitive.useItemContext();

  return (
    <TextClassContext.Provider value='native:text-lg font-medium web:group-hover:underline'>
      <AccordionPrimitive.Header className='flex'>
        <AccordionPrimitive.Trigger ref={ref} {...props} asChild>
          <Trigger
            className={cn(
              'flex flex-row web:flex-1 items-center justify-between py-4 web:transition-all group web:focus-visible:outline-none web:focus-visible:ring-1 web:focus-visible:ring-muted-foreground',
              className
            )}
          >
            <>{children}</>
            <View>
              <ChevronDown size={18} className={'text-foreground shrink-0'} />
            </View>
          </Trigger>
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
    </TextClassContext.Provider>
  );
});
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  AccordionPrimitive.ContentRef,
  AccordionPrimitive.ContentProps
>(({ className, children, ...props }, ref) => {
  const { isExpanded } = AccordionPrimitive.useItemContext();
  return (
    <TextClassContext.Provider value='native:text-lg'>
      <AccordionPrimitive.Content
        className={cn('overflow-hidden text-sm')}
        ref={ref}
        {...props}
      >
        <InnerContent className={cn('pb-4', className)}>{children}</InnerContent>
      </AccordionPrimitive.Content>
    </TextClassContext.Provider>
  );
});

function InnerContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <View className={cn('pb-4', className)}>{children}</View>;
}

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
