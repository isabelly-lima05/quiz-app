import React, { useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Ícones da Lucide Icons
import {
  BookOpen,
  Calculator,
  Landmark,
  Globe,
  Zap,
  FlaskConical,
  Dna,
  Languages,
  Brain, 
  Users,
  Sparkles,
  Gamepad2,
  Film,
  Library,
  Sun,
  Moon,
  LogOut,
  RotateCcw,
  ArrowRight,
  Trophy,
} from "lucide-react-native";

import allQuestionsData from "../questions.json";

export type Question = {
  category: string;
  level: string;
  question: string;
  options: string[];
  correctAnswer: string;
};

const OPTION_LETTERS = ["A", "B", "C", "D"];
const QUESTIONS_PER_GAME = 10;

// Lista de Categorias com componentes do Lucide
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

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const [playedQuestionTexts, setPlayedQuestionTexts] = useState<string[]>([]);

  // TEMA DINÂMICO
  const theme = {
    bg: isDarkMode ? "#030712" : "#F8FAFC",
    glowTop: isDarkMode ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.08)",
    glowBottom: isDarkMode ? "rgba(16,185,129,0.12)" : "rgba(16,185,129,0.06)",
    cardBg: isDarkMode ? "rgba(17, 24, 39, 0.75)" : "#FFFFFF",
    cardBorder: isDarkMode ? "rgba(255,255,255,0.08)" : "#E2E8F0",
    textPrimary: isDarkMode ? "#F9FAFB" : "#0F172A",
    textSecondary: isDarkMode ? "#9CA3AF" : "#64748B",
    iconColorLight: "#0F172A", // Escuro para o modo claro
    iconCircleBg: isDarkMode ? "rgba(255, 255, 255, 0.06)" : "rgba(15, 23, 42, 0.05)",
    optionBg: isDarkMode ? "#111827" : "#FFFFFF",
    optionBorder: isDarkMode ? "rgba(255,255,255,0.08)" : "#E2E8F0",
    letterBadgeBg: isDarkMode ? "rgba(255,255,255,0.06)" : "#F1F5F9",
    letterBadgeText: isDarkMode ? "#9CA3AF" : "#475569",
    headerBtnBg: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.06)",
    headerBtnText: isDarkMode ? "#E5E7EB" : "#1E293B",
    modalBg: isDarkMode ? "#111827" : "#FFFFFF",
    modalOverlay: isDarkMode ? "rgba(3, 7, 18, 0.85)" : "rgba(15, 23, 42, 0.6)",
  };

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
  };

  const handleStartCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
    loadCategoryQuestions(categoryName);
    setCurrentIndex(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setScore(0);
    setShowResult(false);
    setStarted(true);
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

  const handleSelectOption = (option: string) => {
    if (hasAnswered || showResult) return;

    setSelectedOption(option);
    setHasAnswered(true);

    if (option === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (!hasAnswered) return;

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      <View style={[styles.glowTop, { backgroundColor: theme.glowTop }]} />
      <View style={[styles.glowBottom, { backgroundColor: theme.glowBottom }]} />

      {/* 🟢 TELA INICIAL: SELEÇÃO DE MATÉRIAS */}
      {!started ? (
        <View style={styles.welcomeContainer}>
          <View style={styles.appHeaderRow}>
            <View>
              <Text style={styles.brandBadge}>✨ MASTER QUIZ</Text>
              <Text style={[styles.welcomeTitle, { color: theme.textPrimary }]}>
                Escolha a Matéria
              </Text>
            </View>

            {/* BOTÃO MUDAR TEMA */}
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
            Selecione uma categoria para responder 10 perguntas dinâmicas.
          </Text>

          <FlatList
            data={CATEGORIES}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.categoryRow}
            contentContainerStyle={{ paddingBottom: 30, paddingTop: 10 }}
            renderItem={({ item }) => {
              const IconComponent = item.Icon;
              // Cor do ícone: Mais escura no modo claro, mais clara/viva no modo escuro
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
          />
        </View>
      ) : (
        /* 🔵 TELA DE QUIZ (PERGUNTAS) */
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {currentQuestion && (
            <>
              {/* HEADER COM BOTÕES DE AÇÃO COM ÍCONES LUCIDE */}
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

                <TouchableOpacity
                  style={[styles.iconButton, { backgroundColor: theme.headerBtnBg }]}
                  onPress={() => setIsDarkMode(!isDarkMode)}
                >
                  {isDarkMode ? (
                    <Sun color="#FBBF24" size={18} />
                  ) : (
                    <Moon color="#0F172A" size={18} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconButtonAction}
                  onPress={handleRestartSameCategory}
                >
                  <RotateCcw color="#6366F1" size={18} />
                  <Text style={styles.iconButtonActionText}>Novas</Text>
                </TouchableOpacity>
              </View>

              {/* BARRA DE PROGRESSO */}
              <View style={[styles.progressBarBackground, { backgroundColor: theme.cardBorder }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: progressPercent as `${number}%` },
                  ]}
                />
              </View>

              {/* CARTÃO DA PERGUNTA */}
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
                      {currentQuestion.level.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.questionText, { color: theme.textPrimary }]}>
                  {currentQuestion.question}
                </Text>
              </View>

              {/* LISTA DE ALTERNATIVAS */}
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
                        <Text style={letterTextStyle}>
                          {OPTION_LETTERS[index]}
                        </Text>
                      </View>
                      <Text style={[styles.optionText, { color: theme.textPrimary }]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* FEEDBACK DE ACERTO/ERRO */}
              {hasAnswered && (
                <View
                  style={[
                    styles.feedbackBox,
                    isCorrectAnswer
                      ? styles.feedbackCorrectBox
                      : styles.feedbackWrongBox,
                  ]}
                >
                  <Text
                    style={[
                      styles.feedbackText,
                      isCorrectAnswer
                        ? styles.feedbackCorrectText
                        : styles.feedbackWrongText,
                    ]}
                  >
                    {isCorrectAnswer
                      ? "✨ Resposta Exata! Parabéns!"
                      : `❌ Incorreto! A resposta certa é: ${currentQuestion.correctAnswer}`}
                  </Text>
                </View>
              )}

              {/* BOTÃO PRÓXIMA / FINALIZAR */}
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
                    {currentIndex === questions.length - 1
                      ? "Ver Placar Final"
                      : "Próxima Pergunta"}
                  </Text>
                  {currentIndex === questions.length - 1 ? (
                    <Trophy color="#FFFFFF" size={20} style={{ marginLeft: 8 }} />
                  ) : (
                    <ArrowRight color="#FFFFFF" size={20} style={{ marginLeft: 8 }} />
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      )}

      {/* 🔴 MODAL DE RESULTADO FINAL */}
      {showResult && (
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.modalBg, borderColor: theme.cardBorder },
            ]}
          >
            <Text style={styles.modalBadge}>FIM DA RODADA</Text>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              {selectedCategory}
            </Text>

            <View style={styles.scoreCircle}>
              <Text style={[styles.modalScore, { color: theme.textPrimary }]}>
                {score}
              </Text>
              <Text style={styles.modalScoreTotal}>/ {questions.length}</Text>
            </View>

            <Text style={[styles.modalDescription, { color: theme.textSecondary }]}>
              {score >= 7
                ? "🎯 Excelente desempenho! Você domina esta matéria!"
                : "📚 Bom treino! Continue praticando para melhorar sua nota!"}
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleRestartSameCategory}
            >
              <RotateCcw color="#FFFFFF" size={18} style={{ marginRight: 8 }} />
              <Text style={styles.modalButtonText}>Novas Perguntas</Text>
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
  brandBadge: {
    color: "#6366F1",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 4,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
  iconButtonAction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(99,102,241,0.15)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#6366F1",
    gap: 6,
  },
  iconButtonActionText: {
    color: "#6366F1",
    fontWeight: "800",
    fontSize: 13,
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
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 16,
  },
  scoreCircle: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: "rgba(99,102,241,0.12)",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 99,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#6366F1",
  },
  modalScore: {
    fontSize: 44,
    fontWeight: "900",
  },
  modalScoreTotal: {
    color: "#6366F1",
    fontSize: 20,
    fontWeight: "800",
    marginLeft: 4,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 20,
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
});