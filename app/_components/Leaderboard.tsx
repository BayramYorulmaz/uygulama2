import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { supabase } from '../../constants/supabase';

interface LeaderboardProps {
  sortBy: 'score' | 'name' | 'date';
  sortOrder: 'desc' | 'asc';
  refreshKey?: number;
}

export default function Leaderboard({ sortBy, sortOrder, refreshKey }: LeaderboardProps) {
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScores();
  }, [sortBy, sortOrder, refreshKey]);

  const fetchScores = async () => {
    setLoading(true);
    
    // Props'tan gelen sıralama türünü Supabase sütun isimleriyle eşleştiriyoruz
    let column = 'skor';
    if (sortBy === 'name') column = 'isim';
    if (sortBy === 'date') column = 'created_at';

    let isAscending = sortOrder === 'asc';

    const { data, error } = await supabase
      .from('SkorTablosu')
      .select('*')
      .order(column, { ascending: isAscending })
      .limit(50); // İlk 50 skoru getir

    if (error) {
      console.error('Veri çekme hatası:', error);
    } else if (data) {
      setScores(data);
    }
    
    setLoading(false);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#4ade80" style={{ marginTop: 50 }} />;
  }

  return (
    <FlatList
      data={scores}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item, index }) => (
        <View style={styles.row}>
          <Text style={styles.rank}>#{index + 1}</Text>
          <Text style={styles.name}>{item.isim}</Text>
          <Text style={styles.score}>{item.skor}</Text>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.emptyText}>Henüz skor kaydedilmedi.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    alignItems: 'center',
  },
  rank: {
    width: 40,
    color: '#ccc',
    fontWeight: 'bold',
    fontSize: 16,
  },
  name: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  score: {
    color: '#4ade80',
    fontWeight: 'bold',
    fontSize: 18,
  },
  emptyText: {
    color: '#ccc',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  }
});