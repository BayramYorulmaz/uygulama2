import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Pressable } from 'react-native';

const { width, height } = Dimensions.get('window');

const DIRECTIONS = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

export default function GameScreen() {
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
    if (centerTimeoutRef.current) {
      clearTimeout(centerTimeoutRef.current);
      centerTimeoutRef.current = null;
    }

    arrowPos.stopAnimation();
    arrowPos.setValue({ x: 0, y: 0 });
    currentPosRef.current = { x: 0, y: 0 };

    // NOT: Eğer oyuncu yandığında skorunun SIFIRLANMASINI İSTEMİYORSAN, alttaki satırı silebilirsin.
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
    if (centerTimeoutRef.current) {
      clearTimeout(centerTimeoutRef.current);
      centerTimeoutRef.current = null;
    }
    arrowPos.stopAnimation(); 
    setGamePlaying(false);
    setGamePaused(false);
    setGameOverState(true); 
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
      
      {/* 1. DURUM: OYUN HİÇ BAŞLAMADIYSA ANA MENÜYÜ GÖSTER */}
      {!isPlaying && !isGameOver && (
        <View style={styles.menu}>
          <Text style={styles.title}>Refleks Oyunu</Text>
          <Text style={styles.instruction}>Ok ortadaki hedefe geldiğinde,{'\n'}okun gösterdiği yöne doğru ekranda kaydır!</Text>
          <Pressable style={styles.button} onPress={startGame}>
            <Text style={styles.buttonText}>Oyuna Başla</Text>
          </Pressable>
        </View>
      )}

      {/* 2. DURUM: OYUN OYNANIYORKEN VEYA OYUN BİTTİĞİNDE OYUN ALANINI GÖSTER */}
      {(isPlaying || isGameOver) && (
        <>
          {/* Oyun arka planı hep sabit kalır */}
          <View style={styles.targetZone} pointerEvents="none" />

          <Animated.View 
            pointerEvents="none" 
            style={[
              styles.arrowContainer, 
              // Ok sadece oyun bilerek duraklatıldığında gizlenir, yandığında donup kalır
              { transform: arrowPos.getTranslateTransform(), opacity: (isPaused && !isGameOver) ? 0 : 1 }
            ]}
          >
            <Text style={styles.arrowText}>{getArrowSymbol(currentDir)}</Text>
          </Animated.View>

          <Text style={styles.scoreText}>Skor: {score}</Text>

          {/* Oyuncu yanmadıysa durdurma butonunu göster */}
          {!isGameOver && (
            <Pressable style={styles.pauseButton} onPress={togglePause}>
              <Text style={styles.pauseButtonText}>{isPaused ? '▶️ Devam Et' : '⏸️ Durdur'}</Text>
            </Pressable>
          )}

          {/* A. DURAKLATMA EKRANI (OVERLAY) */}
          {isPaused && !isGameOver && (
            <View style={styles.pausedOverlay} pointerEvents="none">
              <Text style={styles.pausedText}>DURAKLATILDI</Text>
            </View>
          )}

          {/* B. OYUN BİTTİ EKRANI (DURDURMA OVERLAY'İ İLE AYNI TASARIM) */}
          {isGameOver && (
            <View style={styles.pausedOverlay}>
              <View style={styles.menu}>
                <Text style={[styles.title, { color: '#f87171' }]}>Oyun Bitti!</Text>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 30 }}>
                  Skorun: {score}
                </Text>
                <Pressable style={styles.button} onPress={startGame}>
                  <Text style={styles.buttonText}>Tekrar Oyna</Text>
                </Pressable>
              </View>
            </View>
          )}
        </>
      )}
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
    backgroundColor: 'rgba(0,0,0,0.7)', // Arka planın karanlığını biraz artırdık
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
});