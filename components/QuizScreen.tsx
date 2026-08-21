import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Importa nosso banco de perguntas
import allQuestions from "../questions.json";

// Mapeamento simples para colocar os níveis em ordem
const levelOrder: Record<string, number> = {
  fácil: 1,
  médio: 2,
  difícil: 3,
};

// Organiza as perguntas para começar pelas fáceis
const questions = [...allQuestions].sort(
  (a, b) => levelOrder[a.level] - levelOrder[b.level],
);

const OPTION_LETTERS = ["A", "B", "C", "D"];

export default function QuizScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (option: string) => {
    if (hasAnswered) return;

    setSelectedOption(option);
    setHasAnswered(true);

    if (option === currentQuestion.correctAnswer) {
      setScore((prevScore) => prevScore + 1);
    }
  };

  const goToNextQuestion = () => {
    const acertou = selectedOption === currentQuestion.correctAnswer;

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      const totalAcertos = score + (acertou ? 1 : 0);
      alert(
        `🎉 Quiz finalizado!\nVocê acertou ${totalAcertos} de ${questions.length} perguntas.`,
      );

      setCurrentIndex(0);
      setSelectedOption(null);
      setHasAnswered(false);
      setScore(0);
    }
  };

  const handleSkip = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      alert(
        `🎉 Quiz finalizado!\nVocê acertou ${score} de ${questions.length} perguntas.`,
      );

      setCurrentIndex(0);
      setSelectedOption(null);
      setHasAnswered(false);
      setScore(0);
    }
  };

  const isCorrectAnswer = selectedOption === currentQuestion.correctAnswer;

  // Função auxiliar para definir a cor do selo de acordo com a dificuldade
  const getLevelBadgeStyle = (level: string) => {
    switch (level.toLowerCase()) {
      case "fácil":
        return { bg: "#DCFCE7", text: "#15803D" };
      case "médio":
        return { bg: "#FEF3C7", text: "#B45309" };
      case "difícil":
        return { bg: "#FEE2E2", text: "#B91C1C" };
      default:
        return { bg: "#EEF2FF", text: "#4F46E5" };
    }
  };

  const levelStyle = getLevelBadgeStyle(currentQuestion.level);
  const progressPercent = `${((currentIndex + 1) / questions.length) * 100}%`;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Barra de Progresso no Topo */}
      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBarFill,
            { width: progressPercent as `${number}%` },
          ]}
        />
      </View>

      {/* Header com Informações de Nível e Pontuação */}
      <View style={styles.headerCard}>
        <View style={[styles.levelBadge, { backgroundColor: levelStyle.bg }]}>
          <Text style={[styles.levelText, { color: levelStyle.text }]}>
            ● NÍVEL {currentQuestion.level.toUpperCase()}
          </Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>PONTOS</Text>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>

      {/* Cartão da Pergunta */}
      <View style={styles.questionCard}>
        <Text style={styles.questionCounter}>
          PERGUNTA {currentIndex + 1} DE {questions.length}
        </Text>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
      </View>

      {/* Lista de Alternativas */}
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedOption === option;
          const isCorrect = option === currentQuestion.correctAnswer;

          const optionStyle = [styles.option] as any[];
          const letterBadgeStyle = [styles.letterBadge] as any[];
          const letterTextStyle = [styles.letterBadgeText] as any[];

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
              activeOpacity={0.7}
            >
              <View style={letterBadgeStyle}>
                <Text style={letterTextStyle}>{OPTION_LETTERS[index]}</Text>
              </View>
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Caixa de Feedback */}
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
              ? "✨ Excelente! Você acertou!"
              : `❌ Ops! A resposta correta é: ${currentQuestion.correctAnswer}`}
          </Text>
        </View>
      )}

      {/* Botões de Ação */}
      {hasAnswered && (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={goToNextQuestion}
          >
            <Text style={styles.nextButtonText}>Próxima Pergunta ➔</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Reiniciar</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 99,
    marginBottom: 16,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#6366F1",
    borderRadius: 99,
  },
  headerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  levelBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  levelText: {
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  scoreContainer: {
    alignItems: "flex-end",
  },
  scoreLabel: {
    color: "#94A3B8",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  scoreText: {
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "900",
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  questionCounter: {
    color: "#6366F1",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 8,
    textAlign: "center",
  },
  questionText: {
    fontSize: 19,
    fontWeight: "700",
    textAlign: "center",
    color: "#1E293B",
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  selectedOption: {
    backgroundColor: "#EEF2FF",
    borderColor: "#6366F1",
  },
  correctOption: {
    backgroundColor: "#F0FDF4",
    borderColor: "#22C55E",
  },
  wrongOption: {
    backgroundColor: "#FEF2F2",
    borderColor: "#EF4444",
  },
  letterBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  letterBadgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
  },
  selectedLetterBadge: {
    backgroundColor: "#6366F1",
  },
  selectedLetterText: {
    color: "#FFFFFF",
  },
  correctLetterBadge: {
    backgroundColor: "#22C55E",
  },
  correctLetterText: {
    color: "#FFFFFF",
  },
  wrongLetterBadge: {
    backgroundColor: "#EF4444",
  },
  wrongLetterText: {
    color: "#FFFFFF",
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: "#334155",
    fontWeight: "600",
  },
  feedbackBox: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  feedbackCorrectBox: {
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  feedbackWrongBox: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  feedbackText: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  feedbackCorrectText: {
    color: "#15803D",
  },
  feedbackWrongText: {
    color: "#B91C1C",
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 18,
    gap: 12,
  },
  nextButton: {
    flex: 2,
    backgroundColor: "#6366F1",
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
  skipButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  skipButtonText: {
    color: "#64748B",
    fontWeight: "700",
    fontSize: 15,
  },
});
