import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      {/* Oculta a barra padrão para o app ocupar a tela toda com o novo design */} 
      <Stack
        screenOptions={{
          headerShown: false, // Remove a barra branca/padrão do topo
          animation: "fade",   // Animação suave ao trocar de tela
        }}
      />
      <StatusBar style="auto" />
    </>
  );
} 