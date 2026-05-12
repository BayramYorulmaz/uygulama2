import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Button,
  ActivityIndicator,
} from 'react-native';
import { BACKEND_BASE_URL } from '../../constants/api';

type Entry = {
  name: string;
  score: number;
  date?: string;
};

type Props = {
  refreshKey?: number;
  sortBy?: 'score' | 'name' | 'date';
  sortOrder?: 'asc' | 'desc';
};

export default function Leaderboard({
  refreshKey,
  sortBy = 'score',
  sortOrder = 'desc',
}: Props) {
  const [items, setItems] = useState<Entry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUrl = () =>
    `${BACKEND_BASE_URL}/leaderboard?by=${encodeURIComponent(sortBy)}&order=${encodeURIComponent(sortOrder)}`;

  async function fetchLeaderboard() {
    setLoading(true);
    setError(null);
    try {
      const url = getUrl();
      console.log(`📡 Fetching: ${url}`);

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
      console.log(`✅ Leaderboard fetched: ${data.length} items`);
    } catch (err: any) {
      const errorMsg = err.message || String(err);
      console.error('❌ Leaderboard fetch error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, sortBy, sortOrder]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
  };

  if (loading && items.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text style={styles.loadingText}>⏳ Sıralama yükleniyor...</Text>
      </View>
    );
  }

  if (error && items.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.title}>❌ Sıralama Yüklenemedi</Text>
        <Text style={styles.error}>Hata: {error}</Text>
        <Text style={styles.info}>Backend URL:</Text>
        <Text style={styles.url}>{getUrl()}</Text>
        <View style={styles.retryContainer}>
          <Button title="🔄 Tekrar Deneye" onPress={fetchLeaderboard} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>
        {items.length} Oyuncu ({sortBy} - {sortOrder === 'desc' ? 'Azalan ⬇️' : 'Artan ⬆️'})
      </Text>
      <FlatList
        data={items}
        keyExtractor={(item, idx) => `${item.name}-${item.score}-${idx}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.row,
              index % 2 === 0 ? styles.rowEven : styles.rowOdd,
            ]}
          >
            <Text style={styles.rank}>
              {index === 0
                ? '🥇'
                : index === 1
                  ? '🥈'
                  : index === 2
                    ? '🥉'
                    : `${index + 1}.`}
            </Text>
            <View style={styles.infoRow}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.score}>{item.score} 📍</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.empty}>📭 Henüz skor yok.</Text>
            <Text style={styles.emptyHint}>İlk skoru kaydedin!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 8, backgroundColor: 'transparent', flex: 1 },
  subtitle: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#666' },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
  },
  rowEven: { backgroundColor: '#f5f5f5' },
  rowOdd: { backgroundColor: '#fff' },
  rank: { width: 40, fontWeight: '700', fontSize: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', flex: 1 },
  name: { fontWeight: '600', color: '#333', flex: 1 },
  score: { fontWeight: '700', color: '#0a7ea4' },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
    fontWeight: '600',
  },
  emptyHint: {
    textAlign: 'center',
    marginTop: 4,
    color: '#ccc',
    fontSize: 12,
  },
  emptyContainer: { paddingVertical: 40 },
  errorContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 16,
  },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: '#c00' },
  error: { color: '#c00', marginBottom: 8, fontSize: 13 },
  info: { color: '#666', fontSize: 12, marginTop: 8 },
  url: {
    fontSize: 11,
    color: '#444',
    marginBottom: 12,
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  retryContainer: { marginTop: 12 },
  loadingText: { marginTop: 12, textAlign: 'center', color: '#666' },
});