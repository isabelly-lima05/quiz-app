# Master Quiz Pro

Aplicativo de quiz desenvolvido em React Native com Expo. O jogador escolhe uma matéria, responde a uma rodada de 10 perguntas com tempo limitado, administra suas vidas e pode registrar a pontuação em um ranking local.

O projeto foi criado para a disciplina de Programação para Dispositivos Móveis e funciona como uma aplicação multiplataforma para Android, iOS e web.

## Sumário

- [Visão geral](#visão-geral)
- [Recursos](#recursos)
- [Regras do jogo](#regras-do-jogo)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Executando o projeto](#executando-o-projeto)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Banco de perguntas](#banco-de-perguntas)
- [Ranking e armazenamento](#ranking-e-armazenamento)
- [Scripts disponíveis](#scripts-disponíveis)
- [Lint e qualidade](#lint-e-qualidade)
- [Build com EAS](#build-com-eas)
- [Como contribuir](#como-contribuir)
- [Limitações conhecidas](#limitações-conhecidas)
- [Referências](#referências)

## Visão geral

O Master Quiz Pro apresenta 14 categorias: Português, Matemática, História, Geografia, Física, Química, Biologia, Inglês, Filosofia, Sociologia, Conhecimentos Gerais, Entretenimento, Cinema e Literatura.

O banco contém 1.392 perguntas classificadas nos níveis fácil, médio e difícil. A seleção de uma categoria inicia imediatamente uma nova rodada.

## Recursos

- Interface responsiva para Android, iOS e web.
- Tema claro e escuro, alternado pelo botão de sol/lua.
- Seleção aleatória de 10 perguntas por rodada.
- Barra de progresso e quatro alternativas por pergunta.
- Feedback visual para respostas corretas e incorretas.
- Três vidas por partida.
- Cronômetro ajustado ao nível: fácil (20s), médio (15s) e difícil (10s).
- Desafio de última chance com uma pergunta difícil quando as vidas acabam.
- Animações de entrada e de erro.
- Efeitos sonoros para acerto, erro, vitória, fim de jogo e desafio.
- Tela final com pontuação e classificação da rodada.
- Cadastro de nome ou apelido de até 16 caracteres no ranking.
- Ranking local com os cinco melhores resultados exibidos.
- Opção para apagar todo o histórico de pontuações.

## Regras do jogo

1. Cada rodada possui até 10 perguntas da matéria selecionada.
2. Cada pergunta possui quatro alternativas e só pode ser respondida uma vez.
3. Uma resposta correta adiciona 1 ponto.
4. Uma resposta incorreta remove 1 vida.
5. Quando o tempo chega a zero, a pergunta é considerada incorreta e uma vida é perdida.
6. Ao perder as três vidas, o jogador recebe uma única pergunta difícil de última chance.
7. Ao acertar o desafio, o jogador recupera 1 vida e continua a rodada.
8. Ao errar o desafio, a partida termina imediatamente.
9. A tela final exibe “MUITO BEM!” com 7 ou mais acertos; pontuações menores aparecem como “FIM DA RODADA”.
10. A pontuação só entra no ranking depois que o jogador informa um nome e toca em “Salvar Pontuação”.

## Tecnologias

- [Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/)
- [React Native 0.81](https://reactnative.dev/)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [expo-av](https://docs.expo.dev/versions/v54.0.0/sdk/audio/)
- [Lucide React Native](https://lucide.dev/guide/packages/lucide-react-native)
- ESLint com `eslint-config-expo`

## Pré-requisitos

- Node.js compatível com o Expo SDK 54.
- npm, instalado junto com o Node.js.
- Expo Go em um dispositivo físico, ou um emulador Android/iOS configurado.
- Android Studio para executar no Android por emulador.
- Xcode e macOS para executar no simulador iOS.

Consulte a [documentação da versão 54 do Expo](https://docs.expo.dev/versions/v54.0.0/) para verificar o ambiente recomendado.

## Instalação

```bash
npm install
npm start
```

Ao executar `npm start`, o Expo exibirá um QR code e atalhos para abrir a aplicação no Expo Go, em um emulador ou no navegador.

## Executando o projeto

```bash
npm run android
npm run ios
npm run web
```

Os comandos iniciam o projeto diretamente no Android, iOS ou web. Para iOS, é necessário macOS com o simulador disponível. Para usar o Expo Go, instale o aplicativo no celular, execute `npm start` e leia o QR code.

## Estrutura do projeto

```text
quiz-app/
├── app/
│   ├── _layout.tsx       # Layout e configuração da navegação Expo Router
│   └── index.tsx         # Tela principal e fluxo completo do aplicativo
├── assets/
│   └── icon.jpg          # Ícone do aplicativo
├── components/
│   └── QuizScreen.tsx    # Implementação alternativa/legada da tela de quiz
├── questions.json        # Banco de perguntas e respostas
├── app.json              # Configurações do Expo e identificadores do app
├── eas.json              # Perfis de build e distribuição pelo EAS
├── eslint.config.js      # Configuração do ESLint
├── expo-env.d.ts         # Tipos do ambiente Expo
├── package.json          # Dependências e scripts
└── tsconfig.json         # Configuração do TypeScript
```

O Expo Router usa roteamento baseado em arquivos. `app/index.tsx` é a rota inicial e concentra a tela inicial, a tela do quiz, os modais e o estado da partida.

## Banco de perguntas

As perguntas ficam em `questions.json`, permitindo alterar o conteúdo sem modificar a lógica da interface. Cada item segue este formato:

```json
{
  "category": "Matemática",
  "level": "fácil",
  "question": "Quanto é 2 + 2?",
  "options": ["3", "4", "5", "6"],
  "correctAnswer": "4"
}
```

| Campo           | Tipo       | Descrição                                                    |
| --------------- | ---------- | ------------------------------------------------------------ |
| `category`      | `string`   | Categoria usada no filtro da tela inicial.                   |
| `level`         | `string`   | `fácil`, `médio` ou `difícil`, para aplicar o tempo correto. |
| `question`      | `string`   | Texto apresentado ao jogador.                                |
| `options`       | `string[]` | Lista com quatro alternativas.                               |
| `correctAnswer` | `string`   | Deve ser exatamente igual a uma opção.                       |

Ao adicionar perguntas, mantenha a resposta correta dentro de `options` e evite textos repetidos, pois eles controlam a repetição entre rodadas.

## Ranking e armazenamento

O ranking é salvo somente no dispositivo ou navegador atual usando AsyncStorage. Ele não é sincronizado entre aparelhos e não utiliza servidor ou banco de dados remoto.

- Chave utilizada: `@quiz_global_ranking`.
- Cada registro possui `id`, `playerName`, `score`, `total`, `category` e `date`.
- Os registros são ordenados da maior para a menor pontuação.
- A tela inicial exibe os cinco primeiros registros.
- O botão “Limpar” remove todo o ranking local após confirmação.

## Scripts disponíveis

| Comando                 | Função                                                              |
| ----------------------- | ------------------------------------------------------------------- |
| `npm start`             | Inicia o servidor Expo.                                             |
| `npm run android`       | Inicia o projeto no Android.                                        |
| `npm run ios`           | Inicia o projeto no iOS.                                            |
| `npm run web`           | Inicia o projeto na web.                                            |
| `npm run lint`          | Executa o ESLint.                                                   |
| `npm run reset-project` | Executa o script de redefinição do projeto Expo, quando disponível. |

## Lint e qualidade

```bash
npm run lint
```

O projeto usa TypeScript em modo estrito e a configuração oficial do Expo como base. Valide também o fluxo completo: seleção de categoria, resposta correta, resposta incorreta, tempo esgotado, perda de vidas, desafio de última chance e salvamento do ranking.

## Build com EAS

O projeto possui configuração para [EAS Build](https://docs.expo.dev/build/introduction/). Instale e autentique a CLI:

```bash
npm install --global eas-cli
eas login
```

Perfis configurados em `eas.json`:

- `development`: development build com distribuição interna.
- `preview`: distribuição interna com APK para Android.
- `production`: perfil de produção.

Exemplos:

```bash
eas build --profile development
eas build --profile preview
eas build --profile production
```

O identificador Android configurado é `com.isabellylima05.quizapp`. O projeto também possui um `projectId` do EAS em `app.json`; não altere esses identificadores sem atualizar a configuração de publicação correspondente.

## Como contribuir

1. Crie uma branch para sua alteração.
2. Instale as dependências com `npm install`.
3. Faça a alteração mantendo os tipos e os padrões existentes.
4. Execute `npm run lint`.
5. Teste a funcionalidade no destino desejado.
6. Abra um pull request descrevendo o que foi alterado e como foi validado.

Ao editar o banco de perguntas, revise ortografia, alternativas, nível e resposta correta. Ao alterar o fluxo do quiz, teste também os casos de fim de tempo e perda de vidas.

## Limitações conhecidas

- O ranking é local e não possui autenticação, servidor ou sincronização online.
- Os efeitos sonoros são carregados de URLs externas; dependem de conexão com a internet e da disponibilidade desses arquivos.
- `components/QuizScreen.tsx` contém uma implementação alternativa mais simples e não é a rota principal usada atualmente.
- A aplicação está configurada para orientação retrato.

## Referências

- [Documentação do Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Expo Go](https://expo.dev/go)
- [React Native](https://reactnative.dev/docs/getting-started)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [EAS Build](https://docs.expo.dev/build/introduction/)

## Desenvolvido por Isabelly Lima, 2026. 