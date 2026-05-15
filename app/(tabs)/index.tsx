import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function MainMenu() {
  return (
    <View style={styles.container}>
      <View style={styles.menu}>
        <Text style={styles.title}>🎮 Refleks Oyunu</Text>
        <Text style={styles.instruction}>
          Ok ortadaki hedefe geldiğinde,{'\n'}okun gösterdiği yöne doğru ekranda kaydır!
        </Text>

        <Link href="/explore" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>🎯 Oyuna Başla</Text>
          </Pressable>
        </Link>

            <Link href="/modal" asChild>
            <Pressable style={StyleSheet.flatten([styles.button, styles.leaderboardBtn])}>
            <Text style={styles.buttonText}>📊 Sıralamayı Gör</Text>
            </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menu: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    width: '85%',
    borderWidth: 2,
    borderColor: '#4ade80',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4ade80',
    marginBottom: 15,
    textAlign: 'center',
  },
  instruction: {
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#4ade80',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  leaderboardBtn: {
    backgroundColor: '#60a5fa',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e1e1e',
  },
});