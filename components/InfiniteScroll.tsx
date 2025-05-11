import React, { useState, useEffect } from "react";
import { FlatList, ActivityIndicator, View } from "react-native";
import { Text } from "@/components/ui/text";

interface InfiniteScrollProps<T> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  initialNumToRender?: number;
  pageSize?: number;
  listEmptyComponent?: React.ReactElement;
  ListHeaderComponent?: React.ReactElement;
  onEndReachedThreshold?: number;
}

export function InfiniteScroll<T>({
  data,
  renderItem,
  keyExtractor,
  initialNumToRender = 10,
  pageSize = 10,
  listEmptyComponent,
  ListHeaderComponent,
  onEndReachedThreshold = 0.5,
}: InfiniteScrollProps<T>) {
  const [displayedData, setDisplayedData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);

  // Initialize with first batch of data
  useEffect(() => {
    if (data.length > 0) {
      setDisplayedData(data.slice(0, initialNumToRender));
      setPage(Math.ceil(initialNumToRender / pageSize));
    } else {
      setDisplayedData([]);
    }
  }, [data, initialNumToRender, pageSize]);

  const loadMoreData = () => {
    if (loading || displayedData.length >= data.length) return;
    
    setLoading(true);
    const start = page * pageSize;
    const end = Math.min(start + pageSize, data.length);
    
    setTimeout(() => {
      setDisplayedData(prevData => [...prevData, ...data.slice(start, end)]);
      setPage(page + 1);
      setLoading(false);
    }, 300); // Small delay to prevent rapid firing
  };

  const renderFooter = () => {
    if (!loading) return null;
    
    return (
      <View className="py-4 flex-row justify-center">
        <ActivityIndicator size="small" />
        <Text className="ml-2">Loading more...</Text>
      </View>
    );
  };

  return (
    <FlatList
      data={displayedData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReached={loadMoreData}
      onEndReachedThreshold={onEndReachedThreshold}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={listEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      initialNumToRender={initialNumToRender}
    />
  );
}
