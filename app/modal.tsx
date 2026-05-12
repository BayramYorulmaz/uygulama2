import { Link } from 'expo-router';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Leaderboard from './_components/Leaderboard';
import { useState } from 'react';

export default function ModalScreen() {
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'date'>('score');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Sıralama Tablosu</Text>
        <Link href="/(tabs)" asChild>
          <Pressable style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        </Link>
      </View>

      {/* Sıralama kontrolleri */}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sırala:</Text>

        <Pressable
          style={[styles.sortBtn, sortBy === 'score' ? styles.sortActive : null]}
          onPress={() => setSortBy('score')}
        >
          <Text style={sortBy === 'score' ? styles.sortActiveText : styles.sortBtnText}>⭐ Puan</Text>
        </Pressable>

        <Pressable
          style={[styles.sortBtn, sortBy === 'name' ? styles.sortActive : null]}
          onPress={() => setSortBy('name')}
        >
          <Text style={sortBy === 'name' ? styles.sortActiveText : styles.sortBtnText}>📝 İsim</Text>
        </Pressable>

        <Pressable
          style={[styles.sortBtn, sortBy === 'date' ? styles.sortActive : null]}
          onPress={() => setSortBy('date')}
        >
          <Text style={sortBy === 'date' ? styles.sortActiveText : styles.sortBtnText}>📅 Tarih</Text>
        </Pressable>

        <Pressable
          style={styles.orderBtn}
          onPress={() => setSortOrder(o => (o === 'desc' ? 'asc' : 'desc'))}
        >
          <Text style={styles.sortBtnText}>{sortOrder === 'desc' ? '⬇️ Azalan' : '⬆️ Artan'}</Text>
        </Pressable>
      </View>

      <View style={styles.leaderboard}>
        <Leaderboard sortBy={sortBy} sortOrder={sortOrder} refreshKey={0} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ade80',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    flexWrap: 'wrap',
    gap: 6,
  },
  sortLabel: {
    fontWeight: '700',
    marginRight: 8,
    color: '#4ade80',
  },
  sortBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4ade80',
    backgroundColor: '#2a2a2a',
  },
  sortBtnText: {
    color: '#ccc',
    fontWeight: '600',
  },
  sortActive: {
    backgroundColor: '#4ade80',
    borderColor: '#4ade80',
  },
  sortActiveText: {
    color: '#1e1e1e',
    fontWeight: '700',
  },
  orderBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4ade80',
    backgroundColor: '#2a2a2a',
  },
  leaderboard: {
    flex: 1,
    marginTop: 12,
  },
});