import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";

// Ícones Lucide
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Brain,
  Calculator,
  CheckCircle2,
  Clock,
  Dna,
  Film,
  Flame,
  FlaskConical,
  Gamepad2,
  Globe,
  Heart,
  HelpCircle,
  Landmark,
  Languages,
  Library,
  LogOut,
  Medal,
  Moon,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Sun,
  Trash2,
  Trophy,
  User,
  Users,
  XCircle,
  Zap,
} from "lucide-react-native";

import allQuestionsData from "../questions.json";

export type Question = {
  category: string;
  level: string;
  question: string;
  options: string[];
  correctAnswer: string;
};

export type RankingItem = {
  id: string;
  playerName: string;
  score: number;
  total: number;
  category: string;
  date: string;
};

type CustomAlertState = {
  visible: boolean;
  title: string;
  message: string;
  type: "success" | "warning" | "error" | "confirm";
  onConfirm?: () => void;
};

const OPTION_LETTERS = ["A", "B", "C", "D"];
const QUESTIONS_PER_GAME = 10;
const INITIAL_LIVES = 3;

// ⏱️ Tempo por dificuldade
const getQuestionTimeLimit = (level: string) => {
  switch (level?.toLowerCase()) {
    case "fácil":
      return 20;
    case "médio":
      return 15;
    case "difícil":
      return 10;
    default:
      return 15;
  }
};

const CATEGORIES = [
  { id: "Português", name: "Português", tag: "Gramática & Texto", color: "#EC4899", Icon: BookOpen },
  { id: "Matemática", name: "Matemática", tag: "Lógica & Cálculos", color: "#3B82F6", Icon: Calculator },
  { id: "História", name: "História", tag: "Fatos & Eras", color: "#F59E0B", Icon: Landmark },
  { id: "Geografia", name: "Geografia", tag: "Países & Clima", color: "#10B981", Icon: Globe },
  { id: "Física", name: "Física", tag: "Leis & Energia", color: "#8B5CF6", Icon: Zap },
  { id: "Química", name: "Química", tag: "Elementos & Reações", color: "#06B6D4", Icon: FlaskConical },
  { id: "Biologia", name: "Biologia", tag: "Vida & Células", color: "#84CC16", Icon: Dna },
  { id: "Inglês", name: "Inglês", tag: "Vocabulário & Língua", color: "#6366F1", Icon: Languages },
  { id: "Filosofia", name: "Filosofia", tag: "Pensadores & Ideias", color: "#A855F7", Icon: Brain },
  { id: "Sociologia", name: "Sociologia", tag: "Sociedade & Cultura", color: "#F97316", Icon: Users },
  { id: "Conhecimento Geral", name: "Conhecimentos", tag: "Atualidades & Mídia", color: "#14B8A6", Icon: Sparkles },
  { id: "Entretenimento", name: "Entretenimento", tag: "Games & Pop", color: "#EF4444", Icon: Gamepad2 },
  { id: "Cinema", name: "Cinema", tag: "Filmes & Séries", color: "#E11D48", Icon: Film },
  { id: "Literatura", name: "Literatura", tag: "Obras & Autores", color: "#D97706", Icon: Library },
];

export default function HomePage() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Estados do Quiz
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  // Vidas & Cronômetro
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isGameOver, setIsGameOver] = useState(false);

  // Ranking & Nome
  const [playerName, setPlayerName] = useState("");
  const [rankingList, setRankingList] = useState<RankingItem[]>([]);
  const [hasSavedScore, setHasSavedScore] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Desafio da Última Chance
  const [showReviveModal, setShowReviveModal] = useState(false);
  const [reviveQuestion, setReviveQuestion] = useState<Question | null>(null);
  const [hasUsedRevive, setHasUsedRevive] = useState(false);

  // Modal de Alerta
  const [alertState, setAlertState] = useState<CustomAlertState>({
    visible: false,
    title: "",
    message: "",
    type: "warning",
  });

  const [playedQuestionTexts, setPlayedQuestionTexts] = useState<string[]>([]);

  // Animações
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Tema Dinâmico
  const theme = {
    bg: isDarkMode ? "#030712" : "#F8FAFC",
    glowTop: isDarkMode ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.08)",
    glowBottom: isDarkMode ? "rgba(16,185,129,0.12)" : "rgba(16,185,129,0.06)",
    cardBg: isDarkMode ? "rgba(17, 24, 39, 0.75)" : "#FFFFFF",
    cardBorder: isDarkMode ? "rgba(255,255,255,0.08)" : "#E2E8F0",
    textPrimary: isDarkMode ? "#F9FAFB" : "#0F172A",
    textSecondary: isDarkMode ? "#9CA3AF" : "#64748B",
    iconColorLight: "#0F172A",
    iconCircleBg: isDarkMode ? "rgba(255, 255, 255, 0.06)" : "rgba(15, 23, 42, 0.05)",
    optionBg: isDarkMode ? "#111827" : "#FFFFFF",
    optionBorder: isDarkMode ? "rgba(255,255,255,0.08)" : "#E2E8F0",
    letterBadgeBg: isDarkMode ? "rgba(255,255,255,0.06)" : "#F1F5F9",
    letterBadgeText: isDarkMode ? "#9CA3AF" : "#475569",
    headerBtnBg: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.06)",
    headerBtnText: isDarkMode ? "#E5E7EB" : "#1E293B",
    modalBg: isDarkMode ? "#111827" : "#FFFFFF",
    modalOverlay: isDarkMode ? "rgba(3, 7, 18, 0.85)" : "rgba(15, 23, 42, 0.65)",
    inputBg: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#F1F5F9",
  };

  // -------------------------------------------------------------
  // 🔊 SISTEMA DE EFEITOS SONOROS LEVES E RÁPIDOS
  // -------------------------------------------------------------
  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true }).catch(() => {});
  }, []);

  const playSound = async (type: "correct" | "wrong" | "victory" | "gameover" | "challenge") => {
    try {
      const soundSources = {
        correct: "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3", // Acerto Rápido
        wrong: "https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3",   // Erro Rápido
        challenge: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",// Suspense / Alerta
        victory: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3",  // Animada (>= 7 Acertos)
        gameover: "https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3", // Triste (< 7 ou Game Over)
      };

      const uri = soundSources[type];
      if (!uri) return;

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, volume: 1.0 }
      );

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
        }
      });
    } catch (e) {
      console.log("Erro no som:", e);
    }
  };

  // Alerta Bonito
  const showAlert = (
    title: string,
    message: string,
    type: "success" | "warning" | "error" | "confirm" = "warning",
    onConfirm?: () => void
  ) => {
    setAlertState({
      visible: true,
      title,
      message,
      type,
      onConfirm,
    });
  };

  const closeAlert = () => {
    setAlertState((prev) => ({ ...prev, visible: false }));
  };

  // -------------------------------------------------------------
  // 🏆 RANKING
  // -------------------------------------------------------------
  useEffect(() => {
    loadRanking();
  }, []);

  const loadRanking = async () => {
    try {
      const stored = await AsyncStorage.getItem("@quiz_global_ranking");
      if (stored) {
        setRankingList(JSON.parse(stored));
      }
    } catch (e) {
      console.log("Erro ao carregar ranking", e);
    }
  };

  const saveScoreToRanking = async () => {
    if (!playerName.trim()) {
      showAlert("Nome Obrigatório", "Por favor, digite seu nome para registrar sua pontuação no Ranking!", "warning");
      return;
    }

    const newItem: RankingItem = {
      id: Date.now().toString(),
      playerName: playerName.trim(),
      score: score,
      total: questions.length,
      category: selectedCategory || "Geral",
      date: new Date().toLocaleDateString("pt-BR"),
    };

    const updated = [...rankingList, newItem].sort((a, b) => b.score - a.score);

    try {
      await AsyncStorage.setItem("@quiz_global_ranking", JSON.stringify(updated));
      setRankingList(updated);
      setHasSavedScore(true);
      playSound("correct");
      showAlert("Salvo com Sucesso! 🎉", `${playerName.trim()}, sua nota foi gravada no Ranking!`, "success");
    } catch (e) {
      showAlert("Erro", "Não foi possível salvar o placar. Tente novamente.", "error");
    }
  };

  const handleClearRanking = () => {
    showAlert(
      "Apagar Ranking",
      "Tem certeza que deseja apagar todo o histórico de pontuações?",
      "confirm",
      async () => {
        try {
          await AsyncStorage.removeItem("@quiz_global_ranking");
          setRankingList([]);
          showAlert("Limpo!", "O histórico de pontuações foi zerado.", "success");
        } catch (e) {
          console.log("Erro ao limpar", e);
        }
      }
    );
  };

  // Animações
  const triggerFadeIn = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  };

  // 🔥 Lógica de Vidas e Desafio (Som de Suspense)
  const triggerLifeLoss = () => {
    setLives((prevLives) => {
      const newLives = prevLives - 1;

      if (newLives <= 0) {
        if (!hasUsedRevive) {
          triggerReviveChallenge();
        } else {
          setIsGameOver(true);
          setShowResult(true);
          playSound("gameover"); // Som Triste no final
        }
      }
      return newLives;
    });
  };

  const triggerReviveChallenge = () => {
    const hardQuestions = (allQuestionsData as Question[]).filter(
      (q) => q.level.toLowerCase() === "difícil"
    );
    const randomHard =
      hardQuestions[Math.floor(Math.random() * hardQuestions.length)];

    setReviveQuestion(randomHard);
    setHasUsedRevive(true);
    setShowReviveModal(true);
    playSound("challenge"); // ⚡ Som de Suspense para o Desafio
  };

  const handleReviveAnswer = (option: string) => {
    if (option === reviveQuestion?.correctAnswer) {
      playSound("correct");
      setLives(1);
      setShowReviveModal(false);
      showAlert("🔥 DESAFIO CONCLUÍDO!", "Você acertou a pergunta difícil e ganhou +1 Vida extra!", "success");
      if (questions[currentIndex]) {
        setTimeLeft(getQuestionTimeLimit(questions[currentIndex].level));
      }
    } else {
      playSound("gameover"); // Som Triste
      setShowReviveModal(false);
      setIsGameOver(true);
      setShowResult(true);
      showAlert("Fim de Jogo! ❌", "Você errou a pergunta desafio da última chance.", "error");
    }
  };

  // ⏰ Cronômetro
  const handleTimeout = () => {
    setHasAnswered(true);
    playSound("wrong");
    triggerShake();
    triggerLifeLoss();
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (started && !hasAnswered && !showResult && !isGameOver && !showReviveModal) {
      if (timeLeft > 0) {
        timer = setTimeout(() => {
          setTimeLeft((prev) => prev - 1);
        }, 1000);
      } else {
        handleTimeout();
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [started, hasAnswered, showResult, isGameOver, showReviveModal, timeLeft]);

  // Navegação
  const loadCategoryQuestions = (categoryName: string) => {
    const categoryQuestions = (allQuestionsData as Question[]).filter(
      (q) => q.category.toLowerCase() === categoryName.toLowerCase()
    );

    let availableQuestions = categoryQuestions.filter(
      (q) => !playedQuestionTexts.includes(q.question)
    );

    if (availableQuestions.length < QUESTIONS_PER_GAME) {
      availableQuestions = categoryQuestions;
      setPlayedQuestionTexts([]);
    }

    const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, QUESTIONS_PER_GAME);

    setPlayedQuestionTexts((prev) => [
      ...prev,
      ...selected.map((q) => q.question),
    ]);

    setQuestions(selected);

    if (selected.length > 0) {
      setTimeLeft(getQuestionTimeLimit(selected[0].level));
    }
  };

  const handleStartCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
    loadCategoryQuestions(categoryName);
    setCurrentIndex(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setScore(0);
    setLives(INITIAL_LIVES);
    setShowResult(false);
    setIsGameOver(false);
    setHasUsedRevive(false);
    setHasSavedScore(false);
    setPlayerName("");
    setStarted(true);
    triggerFadeIn();
  };

  const handleRestartSameCategory = () => {
    if (selectedCategory) {
      handleStartCategory(selectedCategory);
    }
  };

  const handleExitHome = () => {
    setShowResult(false);
    setStarted(false);
    setSelectedCategory(null);
    setQuestions([]);
  };

  const handleSelectOption = (option: string) => {
    if (hasAnswered || showResult || isGameOver || showReviveModal) return;

    setSelectedOption(option);
    setHasAnswered(true);

    if (option === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1);
      playSound("correct");
    } else {
      playSound("wrong");
      triggerShake();
      triggerLifeLoss();
    }
  };

  const handleNext = () => {
    if (!hasAnswered) return;

    if (currentIndex < questions.length - 1 && lives > 0) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setSelectedOption(null);
      setHasAnswered(false);
      setTimeLeft(getQuestionTimeLimit(questions[nextIndex].level));
      triggerFadeIn();
    } else {
      // TELA FINAL: Toca som de acordo com o resultado final
      setShowResult(true);
      if (score >= 7 && lives > 0) {
        playSound("victory"); // 🎉 Música animada para 7+ acertos
      } else {
        playSound("gameover"); // 💔 Música triste para menos de 7 ou Game Over
      }
    }
  };

  const currentQuestion = questions[currentIndex];
  const isCorrectAnswer =
    currentQuestion && selectedOption === currentQuestion.correctAnswer;
  const progressPercent = questions.length
    ? `${((currentIndex + 1) / questions.length) * 100}%`
    : "0%";

  const getLevelBadgeStyle = (level: string) => {
    switch (level?.toLowerCase()) {
      case "fácil":
        return { bg: "rgba(34, 197, 94, 0.15)", text: "#16A34A", border: "#22C55E" };
      case "médio":
        return { bg: "rgba(245, 158, 11, 0.15)", text: "#D97706", border: "#F59E0B" };
      case "difícil":
        return { bg: "rgba(239, 68, 68, 0.15)", text: "#DC2626", border: "#EF4444" };
      default:
        return { bg: "rgba(99, 102, 241, 0.15)", text: "#4F46E5", border: "#6366F1" };
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      <View style={[styles.glowTop, { backgroundColor: theme.glowTop }]} />
      <View style={[styles.glowBottom, { backgroundColor: theme.glowBottom }]} />

      {/* 🟢 TELA INICIAL */}
      {!started ? (
        <View style={styles.welcomeContainer}>
          <FlatList
            data={CATEGORIES}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.categoryRow}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListHeaderComponent={
              <View>
                <View style={styles.appHeaderRow}>
                  <View>
                    <View style={styles.brandRow}>
                      <Sparkles color="#6366F1" size={16} />
                      <Text style={styles.brandBadge}>MASTER QUIZ PRO</Text>
                    </View>
                    <Text style={[styles.welcomeTitle, { color: theme.textPrimary }]}>
                      Escolha a Matéria
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.themeToggleBtn, { backgroundColor: theme.headerBtnBg }]}
                    onPress={() => setIsDarkMode(!isDarkMode)}
                    activeOpacity={0.8}
                  >
                    {isDarkMode ? (
                      <Sun color="#FBBF24" size={20} />
                    ) : (
                      <Moon color="#0F172A" size={20} />
                    )}
                  </TouchableOpacity>
                </View>

                <Text style={[styles.welcomeText, { color: theme.textSecondary }]}>
                  Selecione uma matéria, responda antes do tempo acabar e dispute o topo do Ranking!
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const IconComponent = item.Icon;
              const iconColor = isDarkMode ? item.color : theme.iconColorLight;

              return (
                <TouchableOpacity
                  style={[
                    styles.categoryCard,
                    {
                      backgroundColor: theme.cardBg,
                      borderColor: isDarkMode ? `${item.color}35` : theme.cardBorder,
                    },
                  ]}
                  onPress={() => handleStartCategory(item.id)}
                  activeOpacity={0.75}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: isDarkMode ? `${item.color}20` : theme.iconCircleBg },
                    ]}
                  >
                    <IconComponent color={iconColor} size={28} strokeWidth={2.2} />
                  </View>

                  <Text style={[styles.categoryName, { color: theme.textPrimary }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.categoryTag, { color: theme.textSecondary }]}>
                    {item.tag}
                  </Text>
                </TouchableOpacity>
              );
            }}
            ListFooterComponent={
              /* 🏆 SEÇÃO DE RANKING */
              <View style={styles.rankingSection}>
                <View style={styles.rankingHeaderRow}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Trophy color="#F59E0B" size={22} />
                    <Text style={[styles.rankingTitle, { color: theme.textPrimary }]}>
                      Ranking dos Jogadores
                    </Text>
                  </View>

                  {rankingList.length > 0 && (
                    <TouchableOpacity
                      style={styles.clearRankingBtn}
                      onPress={handleClearRanking}
                      activeOpacity={0.7}
                    >
                      <Trash2 color="#EF4444" size={15} />
                      <Text style={styles.clearRankingText}>Limpar</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {rankingList.length === 0 ? (
                  <View
                    style={[
                      styles.emptyRankingCard,
                      { backgroundColor: theme.cardBg, borderColor: theme.cardBorder },
                    ]}
                  >
                    <Medal color={theme.textSecondary} size={28} style={{ marginBottom: 6 }} />
                    <Text style={[styles.emptyRankingText, { color: theme.textSecondary }]}>
                      Nenhuma pontuação salva ainda. Seja o primeiro a entrar no ranking!
                    </Text>
                  </View>
                ) : (
                  rankingList.slice(0, 5).map((item, index) => (
                    <View
                      key={item.id}
                      style={[
                        styles.rankingCardItem,
                        { backgroundColor: theme.cardBg, borderColor: theme.cardBorder },
                      ]}
                    >
                      <View style={styles.rankingPosCircle}>
                        <Text style={styles.rankingPosText}>#{index + 1}</Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={[styles.rankingPlayerName, { color: theme.textPrimary }]}>
                          {item.playerName}
                        </Text>

                        <Text style={[styles.rankingCategory, { color: theme.textSecondary }]}>
                          {item.category} • {item.date}
                        </Text>
                      </View>

                      <Text style={styles.rankingScoreText}>
                        {item.score}/{item.total} pts
                      </Text>
                    </View>
                  ))
                )}
              </View>
            }
          />
        </View>
      ) : (
        /* 🔵 TELA DE QUIZ */
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {currentQuestion && (
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateX: shakeAnim }],
              }}
            >
              {/* HEADER DO QUIZ */}
              <View style={styles.quizHeader}>
                <TouchableOpacity
                  style={[styles.iconButton, { backgroundColor: theme.headerBtnBg }]}
                  onPress={handleExitHome}
                >
                  <LogOut color={theme.headerBtnText} size={18} />
                  <Text style={[styles.iconButtonText, { color: theme.headerBtnText }]}>
                    Sair
                  </Text>
                </TouchableOpacity>

                {/* VIDAS */}
                <View style={styles.livesContainer}>
                  {[1, 2, 3].map((heartIndex) => (
                    <Heart
                      key={heartIndex}
                      size={20}
                      color={heartIndex <= lives ? "#EF4444" : "#4B5563"}
                      fill={heartIndex <= lives ? "#EF4444" : "transparent"}
                    />
                  ))}
                </View>

                {/* CRONÔMETRO */}
                <View
                  style={[
                    styles.timerBadge,
                    {
                      backgroundColor:
                        timeLeft <= 5 ? "rgba(239,68,68,0.2)" : "rgba(99,102,241,0.15)",
                      borderColor: timeLeft <= 5 ? "#EF4444" : "#6366F1",
                    },
                  ]}
                >
                  <Clock size={16} color={timeLeft <= 5 ? "#EF4444" : "#6366F1"} />
                  <Text
                    style={[
                      styles.timerText,
                      { color: timeLeft <= 5 ? "#EF4444" : "#6366F1" },
                    ]}
                  >
                    {timeLeft}s
                  </Text>
                </View>
              </View>

              {/* PROGRESSO */}
              <View style={[styles.progressBarBackground, { backgroundColor: theme.cardBorder }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: progressPercent as `${number}%` },
                  ]}
                />
              </View>

              {/* PERGUNTA */}
              <View
                style={[
                  styles.questionCard,
                  { backgroundColor: theme.cardBg, borderColor: theme.cardBorder },
                ]}
              >
                <View style={styles.rowTop}>
                  <Text style={styles.questionCounter}>
                    QUESTÃO {currentIndex + 1} / {questions.length}
                  </Text>

                  <View
                    style={[
                      styles.levelBadge,
                      {
                        backgroundColor: getLevelBadgeStyle(currentQuestion.level).bg,
                        borderColor: getLevelBadgeStyle(currentQuestion.level).border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.levelText,
                        { color: getLevelBadgeStyle(currentQuestion.level).text },
                      ]}
                    >
                      {currentQuestion.level.toUpperCase()} (
                      {getQuestionTimeLimit(currentQuestion.level)}s)
                    </Text>
                  </View>
                </View>

                <Text style={[styles.questionText, { color: theme.textPrimary }]}>
                  {currentQuestion.question}
                </Text>
              </View>

              {/* ALTERNATIVAS */}
              <View style={styles.optionsContainer}>
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedOption === option;
                  const isCorrect = option === currentQuestion.correctAnswer;

                  const optionStyle = [
                    styles.option,
                    { backgroundColor: theme.optionBg, borderColor: theme.optionBorder },
                  ] as any[];

                  const letterBadgeStyle = [
                    styles.letterBadge,
                    { backgroundColor: theme.letterBadgeBg },
                  ] as any[];

                  const letterTextStyle = [
                    styles.letterBadgeText,
                    { color: theme.letterBadgeText },
                  ] as any[];

                  if (hasAnswered && isCorrect) {
                    optionStyle.push(styles.correctOption);
                    letterBadgeStyle.push(styles.correctLetterBadge);
                    letterTextStyle.push(styles.correctLetterText);
                  } else if (hasAnswered && isSelected && !isCorrect) {
                    optionStyle.push(styles.wrongOption);
                    letterBadgeStyle.push(styles.wrongLetterBadge);
                    letterTextStyle.push(styles.wrongLetterText);
                  } else if (!hasAnswered && isSelected) {
                    optionStyle.push(styles.selectedOption);
                    letterBadgeStyle.push(styles.selectedLetterBadge);
                    letterTextStyle.push(styles.selectedLetterText);
                  }

                  return (
                    <TouchableOpacity
                      key={option}
                      style={optionStyle}
                      onPress={() => handleSelectOption(option)}
                      disabled={hasAnswered}
                      activeOpacity={0.75}
                    >
                      <View style={letterBadgeStyle}>
                        <Text style={letterTextStyle}>{OPTION_LETTERS[index]}</Text>
                      </View>
                      <Text style={[styles.optionText, { color: theme.textPrimary }]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* FEEDBACK */}
              {hasAnswered && (
                <View
                  style={[
                    styles.feedbackBox,
                    isCorrectAnswer
                      ? styles.feedbackCorrectBox
                      : styles.feedbackWrongBox,
                  ]}
                >
                  {isCorrectAnswer ? (
                    <CheckCircle2 color="#16A34A" size={20} />
                  ) : (
                    <XCircle color="#DC2626" size={20} />
                  )}
                  <Text
                    style={[
                      styles.feedbackText,
                      isCorrectAnswer
                        ? styles.feedbackCorrectText
                        : styles.feedbackWrongText,
                    ]}
                  >
                    {isCorrectAnswer
                      ? "Resposta Exata! Parabéns!"
                      : timeLeft === 0
                      ? "O tempo acabou!"
                      : `Incorreto! A resposta certa é: ${currentQuestion.correctAnswer}`}
                  </Text>
                </View>
              )}

              {/* BOTÃO PRÓXIMA */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    !hasAnswered && styles.primaryButtonDisabled,
                  ]}
                  onPress={handleNext}
                  disabled={!hasAnswered}
                >
                  <Text style={styles.primaryButtonText}>
                    {currentIndex === questions.length - 1 || lives <= 0
                      ? "Ver Placar Final"
                      : "Próxima Pergunta"}
                  </Text>
                  <ArrowRight color="#FFFFFF" size={20} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      )}

      {/* 🔴 MODAL DESAFIO ÚLTIMA CHANCE (SOM DE SUSPENSE) */}
      {showReviveModal && reviveQuestion && (
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.modalBg, borderColor: "#EF4444" },
            ]}
          >
            <View style={styles.reviveHeader}>
              <Flame color="#EF4444" size={26} />
              <Text style={styles.reviveTitle}>ÚLTIMA CHANCE</Text>
            </View>

            <Text style={[styles.reviveSubtitle, { color: theme.textSecondary }]}>
              Suas vidas acabaram! Acerte este desafio DIFÍCIL para ganhar +1 Vida e continuar!
            </Text>

            <View
              style={[
                styles.questionCard,
                { backgroundColor: theme.cardBg, borderColor: theme.cardBorder, marginVertical: 14 },
              ]}
            >
              <Text style={[styles.questionText, { color: theme.textPrimary, fontSize: 16 }]}>
                {reviveQuestion.question}
              </Text>
            </View>

            <View style={{ width: "100%", gap: 8 }}>
              {reviveQuestion.options.map((option, idx) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.option,
                    { backgroundColor: theme.optionBg, borderColor: theme.optionBorder },
                  ]}
                  onPress={() => handleReviveAnswer(option)}
                >
                  <Text style={[styles.optionText, { color: theme.textPrimary }]}>
                    {OPTION_LETTERS[idx]}) {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* 🔴 MODAL DE RESULTADO FINAL */}
      {showResult && !showReviveModal && (
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.modalBg, borderColor: theme.cardBorder },
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
              {isGameOver || score < 7 ? (
                <ShieldAlert color="#EF4444" size={20} />
              ) : (
                <Trophy color="#6366F1" size={20} />
              )}
              <Text style={[styles.modalBadge, (isGameOver || score < 7) && { color: "#EF4444" }]}>
                {isGameOver ? "GAME OVER" : score >= 7 ? "MUITO BEM!" : "FIM DA RODADA"}
              </Text>
            </View>

            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              {selectedCategory}
            </Text>

            <View style={styles.scoreCircle}>
              <Text style={[styles.modalScore, { color: theme.textPrimary }]}>
                {score}
              </Text>
              <Text style={styles.modalScoreTotal}>/ {questions.length}</Text>
            </View>

            {/* CARD DE SALVAR O NOME */}
            {!hasSavedScore ? (
              <View
                style={[
                  styles.saveNameCard,
                  { backgroundColor: theme.cardBg, borderColor: isInputFocused ? "#6366F1" : theme.cardBorder },
                ]}
              >
                <View style={styles.saveNameHeader}>
                  <User color="#6366F1" size={18} />
                  <Text style={[styles.saveNameTitle, { color: theme.textPrimary }]}>
                    Registrar no Ranking
                  </Text>
                </View>

                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: isInputFocused ? "#6366F1" : "transparent",
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.textInput, { color: theme.textPrimary }]}
                    placeholder="Digite seu Nome ou Apelido..."
                    placeholderTextColor="#9CA3AF"
                    value={playerName}
                    onChangeText={setPlayerName}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    maxLength={16}
                  />
                </View>

                <TouchableOpacity
                  style={styles.saveScoreButton}
                  onPress={saveScoreToRanking}
                  activeOpacity={0.8}
                >
                  <Trophy color="#FFFFFF" size={16} style={{ marginRight: 6 }} />
                  <Text style={styles.saveScoreButtonText}>Salvar Pontuação</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.savedScoreBadge}>
                <CheckCircle2 color="#10B981" size={18} />
                <Text style={styles.savedScoreText}>
                  Pontuação Registrada para {playerName}!
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleRestartSameCategory}
            >
              <RotateCcw color="#FFFFFF" size={18} style={{ marginRight: 8 }} />
              <Text style={styles.modalButtonText}>Jogar Novamente</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalSecondaryButton,
                { backgroundColor: theme.headerBtnBg, borderColor: theme.cardBorder },
              ]}
              onPress={handleExitHome}
            >
              <LogOut color={theme.textPrimary} size={18} style={{ marginRight: 8 }} />
              <Text style={[styles.modalSecondaryButtonText, { color: theme.textPrimary }]}>
                Escolher outra Matéria
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 🔴 MODAL DE ALERTA CUSTOMIZADO */}
      {alertState.visible && (
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay, zIndex: 999 }]}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.modalBg, borderColor: theme.cardBorder, maxWidth: 340 },
            ]}
          >
            <View style={{ marginBottom: 12 }}>
              {alertState.type === "success" && <CheckCircle2 color="#10B981" size={42} />}
              {alertState.type === "warning" && <AlertTriangle color="#F59E0B" size={42} />}
              {alertState.type === "error" && <XCircle color="#EF4444" size={42} />}
              {alertState.type === "confirm" && <HelpCircle color="#6366F1" size={42} />}
            </View>

            <Text style={[styles.modalTitle, { color: theme.textPrimary, fontSize: 18, marginBottom: 6 }]}>
              {alertState.title}
            </Text>

            <Text style={[styles.modalDescription, { color: theme.textSecondary, marginBottom: 20 }]}>
              {alertState.message}
            </Text>

            <View style={{ width: "100%", gap: 8 }}>
              {alertState.type === "confirm" ? (
                <>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: "#EF4444" }]}
                    onPress={() => {
                      closeAlert();
                      if (alertState.onConfirm) alertState.onConfirm();
                    }}
                  >
                    <Text style={styles.modalButtonText}>Sim, Confirmar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalSecondaryButton, { backgroundColor: theme.headerBtnBg, borderColor: theme.cardBorder }]}
                    onPress={closeAlert}
                  >
                    <Text style={[styles.modalSecondaryButtonText, { color: theme.textPrimary }]}>Cancelar</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={styles.modalButton} onPress={closeAlert}>
                  <Text style={styles.modalButtonText}>Entendido</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  glowTop: {
    position: "absolute",
    top: -120,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  glowBottom: {
    position: "absolute",
    bottom: -120,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 40,
  },
  welcomeContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 54,
  },
  appHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  brandBadge: {
    color: "#6366F1",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "900",
  },
  welcomeText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  themeToggleBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  categoryRow: {
    justifyContent: "space-between",
    marginBottom: 14,
  },
  categoryCard: {
    width: "48%",
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    alignItems: "center",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 2,
  },
  categoryTag: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },

  // 🏆 RANKING STYLES
  rankingSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  rankingHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  rankingTitle: {
    fontSize: 20,
    fontWeight: "900",
  },
  clearRankingBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(239,68,68,0.15)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  clearRankingText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "800",
  },
  emptyRankingCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyRankingText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  rankingCardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  rankingPosCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(99,102,241,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  rankingPosText: {
    color: "#6366F1",
    fontWeight: "900",
    fontSize: 13,
  },
  rankingPlayerName: {
    fontSize: 15,
    fontWeight: "800",
  },
  rankingCategory: {
    fontSize: 11,
    fontWeight: "600",
  },
  rankingScoreText: {
    color: "#10B981",
    fontSize: 15,
    fontWeight: "900",
  },

  // QUIZ SCREEN STYLES
  quizHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    gap: 6,
  },
  iconButtonText: {
    fontWeight: "700",
    fontSize: 13,
  },
  livesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  timerText: {
    fontWeight: "900",
    fontSize: 14,
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 99,
    marginBottom: 20,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#6366F1",
    borderRadius: 99,
  },
  questionCard: {
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  questionCounter: {
    color: "#6366F1",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  levelBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 99,
    borderWidth: 1,
  },
  levelText: {
    fontWeight: "800",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 10,
    marginBottom: 18,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  selectedOption: {
    backgroundColor: "rgba(99,102,241,0.15)",
    borderColor: "#6366F1",
  },
  correctOption: {
    backgroundColor: "rgba(34,197,94,0.15)",
    borderColor: "#22C55E",
  },
  wrongOption: {
    backgroundColor: "rgba(239,68,68,0.15)",
    borderColor: "#EF4444",
  },
  letterBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  letterBadgeText: {
    fontSize: 13,
    fontWeight: "800",
  },
  selectedLetterBadge: { backgroundColor: "#6366F1" },
  selectedLetterText: { color: "#FFFFFF" },
  correctLetterBadge: { backgroundColor: "#22C55E" },
  correctLetterText: { color: "#FFFFFF" },
  wrongLetterBadge: { backgroundColor: "#EF4444" },
  wrongLetterText: { color: "#FFFFFF" },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  feedbackBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
  },
  feedbackCorrectBox: {
    backgroundColor: "rgba(34,197,94,0.12)",
    borderWidth: 1,
    borderColor: "#22C55E",
  },
  feedbackWrongBox: {
    backgroundColor: "rgba(239,68,68,0.12)",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  feedbackCorrectText: { color: "#16A34A" },
  feedbackWrongText: { color: "#DC2626" },
  buttonRow: {
    flexDirection: "row",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#6366F1",
    paddingVertical: 16,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonDisabled: {
    backgroundColor: "rgba(99,102,241,0.4)",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },

  // MODAL STYLES
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    alignItems: "center",
  },
  modalBadge: {
    color: "#6366F1",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 12,
  },
  scoreCircle: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: "rgba(99,102,241,0.12)",
    paddingVertical: 10,
    paddingHorizontal: 26,
    borderRadius: 99,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#6366F1",
  },
  modalScore: {
    fontSize: 40,
    fontWeight: "900",
  },
  modalScoreTotal: {
    color: "#6366F1",
    fontSize: 18,
    fontWeight: "800",
    marginLeft: 4,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },

  // CARD DE REGISTRAR O NOME
  saveNameCard: {
    width: "100%",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  saveNameHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  saveNameTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  inputWrapper: {
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 12,
    overflow: "hidden",
  },
  textInput: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: "700",
  },
  saveScoreButton: {
    backgroundColor: "#10B981",
    paddingVertical: 13,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveScoreButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  savedScoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(16,185,129,0.15)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 99,
    marginBottom: 16,
  },
  savedScoreText: {
    color: "#10B981",
    fontWeight: "800",
    fontSize: 13,
  },
  modalButton: {
    width: "100%",
    backgroundColor: "#6366F1",
    paddingVertical: 15,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  modalSecondaryButton: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  modalSecondaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },

  // STYLES DA ÚLTIMA CHANCE
  reviveHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  reviveTitle: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "900",
  },
  reviveSubtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 10,
  },
});