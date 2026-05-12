import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Pressable, Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Keyboard } from 'react-native';
import { useRouter } from 'expo-router'; // YÖNLENDİRME İÇİN EKLENDİ
import { BACKEND_BASE_URL } from '../../constants/api';

const { width, height } = Dimensions.get('window');

const DIRECTIONS = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

export default function GameScreen() {
  const router = useRouter(); // ROUTER TANIMLANDI

  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);

  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);

  const [isGameOver, setIsGameOver] = useState(false);
  const isGameOverRef = useRef(false);

  const [currentDir, setCurrentDir] = useState<string | null>(null);
  const currentDirRef = useRef<string | null>(null);

  const centerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // Skor kaydetme state'i
  const [modalVisible, setModalVisible] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);

  // STATE VE REF SENKRONİZASYON FONKSİYONLARI
  const updateScore = (val: number) => { setScore(val); scoreRef.current = val; };
  const setGamePlaying = (val: boolean) => { setIsPlaying(val); isPlayingRef.current = val; };
  const setGamePaused = (val: boolean) => { setIsPaused(val); isPausedRef.current = val; };
  const setGameOverState = (val: boolean) => { setIsGameOver(val); isGameOverRef.current = val; };
  const setDirection = (val: string | null) => { setCurrentDir(val); currentDirRef.current = val; };

  const arrowPos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const currentPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const listenerId = arrowPos.addListener((val) => {
      currentPosRef.current = val;
    });
    return () => arrowPos.removeListener(listenerId);
  }, [arrowPos]);

  const startGame = () => {
    console.log('🎮 Oyun başlıyor...');
    if (centerTimeoutRef.current) {
      clearTimeout(centerTimeoutRef.current);
      centerTimeoutRef.current = null;
    }

    arrowPos.stopAnimation();
    arrowPos.setValue({ x: 0, y: 0 });
    currentPosRef.current = { x: 0, y: 0 };

    updateScore(0);
    setDirection(null);
    setGamePaused(false);
    setGameOverState(false);
    setGamePlaying(true);

    setTimeout(() => {
      spawnArrow();
    }, 50);
  };

  const animateToCenter = (duration: number) => {
    Animated.timing(arrowPos, {
      toValue: { x: 0, y: 0 },
      duration: duration,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && isPlayingRef.current && !isPausedRef.current) {
        centerTimeoutRef.current = setTimeout(() => {
          if (isPlayingRef.current && !isPausedRef.current) {
            gameOver();
          }
        }, 500);
      }
    });
  };

  const spawnArrow = () => {
    const randomDir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    setDirection(randomDir);

    let startX = 0;
    let startY = 0;

    if (randomDir === 'UP') startY = height / 2 + 100;
    if (randomDir === 'DOWN') startY = -(height / 2 + 100);
    if (randomDir === 'LEFT') startX = width / 2 + 100;
    if (randomDir === 'RIGHT') startX = -(width / 2 + 100);

    arrowPos.setValue({ x: startX, y: startY });
    currentPosRef.current = { x: startX, y: startY };

    animateToCenter(1500);
  };

  const handleSwipe = (swipeDir: string) => {
    if (!isPlayingRef.current || isPausedRef.current || isGameOverRef.current) return;

    const { x, y } = currentPosRef.current;
    const distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

    if (distance < 150 && swipeDir === currentDirRef.current) {
      arrowPos.stopAnimation();

      if (centerTimeoutRef.current) {
        clearTimeout(centerTimeoutRef.current);
        centerTimeoutRef.current = null;
      }

      updateScore(scoreRef.current + 10);
      spawnArrow();
    }
  };

  const togglePause = () => {
    if (isPausedRef.current) {
      setGamePaused(false);
      const { x, y } = currentPosRef.current;

      if (Math.abs(x) < 1 && Math.abs(y) < 1) {
        centerTimeoutRef.current = setTimeout(() => {
          if (isPlayingRef.current && !isPausedRef.current) gameOver();
        }, 500);
      } else {
        const distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        const maxDist = Math.max(width / 2 + 100, height / 2 + 100);
        const remainingDuration = (distance / maxDist) * 1500;
        animateToCenter(Math.max(remainingDuration, 100));
      }
    } else {
      setGamePaused(true);
      arrowPos.stopAnimation();

      if (centerTimeoutRef.current) {
        clearTimeout(centerTimeoutRef.current);
        centerTimeoutRef.current = null;
      }
    }
  };

  const gameOver = () => {
    console.log('🏁 Oyun bitiyor. Score:', scoreRef.current);
    if (centerTimeoutRef.current) {
      clearTimeout(centerTimeoutRef.current);
      centerTimeoutRef.current = null;
    }
    arrowPos.stopAnimation();
    setGamePlaying(false);
    setGamePaused(false);
    setGameOverState(true);
    setModalVisible(true);
    console.log('📝 Modal açılıyor...');
  };

  const submitScore = async () => {
    if (!playerName.trim()) {
      Alert.alert('Hata', 'Lütfen oyuncu adınızı girin.');
      return;
    }

    Keyboard.dismiss(); 
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playerName.trim(),
          score: scoreRef.current,
        }),
      });

      if (!res.ok) {
        throw new Error('Skor kaydedilemedi');
      }

      console.log('✅ Skor kaydedildi');
      Alert.alert('Başarılı ✅', `${playerName} adınız ile ${scoreRef.current} puan kaydedildi!`, [
        {
          text: 'Tamam',
          onPress: () => {
            resetToMenu(); // Yönlendirme fonksiyonu çağrılıyor
          },
        },
      ]);
    } catch (err: any) {
      Alert.alert('Hata ❌', err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // ANA MENÜYE DÖNÜŞ VE SIFIRLAMA FONKSİYONU
  const resetToMenu = () => {
    console.log('🔄 Index dosyasına (Ana Menüye) yönlendiriliyor...');
    setModalVisible(false);
    setPlayerName('');
    
    // Arka plan state'lerini temizle
    setGameOverState(false);
    setGamePlaying(false);
    setGamePaused(false);
    setDirection(null);
    updateScore(0);

    // Expo Router ile doğrudan 'index.tsx' ekranına git
    router.navigate('/'); 
  };

  const getArrowSymbol = (dir: string | null) => {
    switch (dir) {
      case 'UP': return '⬆️';
      case 'DOWN': return '⬇️';
      case 'LEFT': return '⬅️';
      case 'RIGHT': return '➡️';
      default: return '';
    }
  };

  const onTouchStart = (e: any) => {
    touchStartX.current = e.nativeEvent.pageX;
    touchStartY.current = e.nativeEvent.pageY;
  };

  const onTouchEnd = (e: any) => {
    if (!isPlayingRef.current || isPausedRef.current || isGameOverRef.current) return;

    const touchEndX = e.nativeEvent.pageX;
    const touchEndY = e.nativeEvent.pageY;

    const dx = touchEndX - touchStartX.current;
    const dy = touchEndY - touchStartY.current;

    let swipeDir = null;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 15) swipeDir = dx > 0 ? 'RIGHT' : 'LEFT';
    } else {
      if (Math.abs(dy) > 15) swipeDir = dy > 0 ? 'DOWN' : 'UP';
    }

    if (swipeDir) handleSwipe(swipeDir);
  };

  return (
    <View
      style={styles.container}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* DURUM 1: OYUN İÇİ BAŞLANGIÇ EKRANI */}
      {!isPlaying && !isGameOver && (
        <View style={styles.menu}>
          <Text style={styles.title}>🎮 Hazır Mısın?</Text>
          <Text style={styles.instruction}>Ok ortadaki hedefe geldiğinde,{'\n'}okun gösterdiği yöne doğru ekranda kaydır!</Text>
          <Pressable style={styles.button} onPress={startGame}>
            <Text style={styles.buttonText}>Başla!</Text>
          </Pressable>
        </View>
      )}

      {/* DURUM 2: OYUN OYNANIYORKEN */}
      {isPlaying && !isGameOver && (
        <>
          <View style={styles.targetZone} pointerEvents="none" />

          <Animated.View
            pointerEvents="none"
            style={[
              styles.arrowContainer,
              { transform: arrowPos.getTranslateTransform(), opacity: isPaused ? 0 : 1 }
            ]}
          >
            <Text style={styles.arrowText}>{getArrowSymbol(currentDir)}</Text>
          </Animated.View>

          <Text style={styles.scoreText}>Skor: {score}</Text>

          <Pressable style={styles.pauseButton} onPress={togglePause}>
            <Text style={styles.pauseButtonText}>{isPaused ? '▶️ Devam Et' : '⏸️ Durdur'}</Text>
          </Pressable>

          {isPaused && (
            <View style={styles.pausedOverlay} pointerEvents="none">
              <Text style={styles.pausedText}>DURAKLATILDI</Text>
            </View>
          )}
        </>
      )}

      {/* DURUM 3: SKOR KAYDETME MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>🏆 Oyun Bitti!</Text>
              <Text style={styles.finalScore}>Skor: {score}</Text>

              <TextInput
                placeholder="Oyuncu Adı"
                value={playerName}
                onChangeText={setPlayerName}
                style={styles.input}
                editable={!loading}
                placeholderTextColor="#666"
              />

              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalBtn, loading && styles.btnDisabled]}
                  onPress={submitScore}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#1e1e1e" />
                  ) : (
                    <Text style={styles.modalBtnText}>✅ Skoru Kaydet</Text>
                  )}
                </Pressable>
                <Pressable
                  style={[styles.modalBtn, styles.modalBtnCancel]}
                  onPress={() => {
                    Keyboard.dismiss();
                    resetToMenu(); // İptale basıldığında da index'e dönecek
                  }}
                  disabled={loading}
                >
                  <Text style={styles.modalBtnText}>❌ İptal</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  pauseButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 10,
  },
  pauseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scoreText: {
    position: 'absolute',
    top: 65,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  menu: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    width: '80%',
    zIndex: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4ade80',
    marginBottom: 15,
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
    elevation: 3,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e1e1e',
  },
  targetZone: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
    zIndex: 1,
  },
  arrowContainer: {
    position: 'absolute',
    zIndex: 2,
  },
  arrowText: {
    fontSize: 60,
  },
  pausedOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  pausedText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 2,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#4ade80',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
    color: '#4ade80',
    textAlign: 'center',
  },
  finalScore: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },

  input: {
    borderWidth: 2,
    borderColor: '#4ade80',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#1e1e1e',
    color: '#fff',
  },

  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#4ade80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#f87171',
  },
  modalBtnText: {
    color: '#1e1e1e',
    fontWeight: '700',
    fontSize: 16,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});