export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
}

export const questions: Question[] = [
  {
    id: 1,
    text: "Qual número completa a sequência? 2, 6, 12, 20, 30, _",
    options: ["36", "38", "40", "42"],
    correctAnswer: "42",
  },
  {
    id: 2,
    text: "Complete a sequência: 5, 9, 17, 33, 65, _",
    options: ["128", "130", "129", "131"],
    correctAnswer: "129",
  },
  {
    id: 3,
    text: "Qual número vem a seguir? 7, 10, 8, 11, 9, 12, _",
    options: ["10", "13", "11", "14"],
    correctAnswer: "10",
  },
  {
    id: 4,
    text: "Qual o próximo número? 1, 4, 9, 16, 25, _",
    options: ["30", "35", "36", "49"],
    correctAnswer: "36",
  },
  {
    id: 5,
    text: "Se A = 3, B = 7 e C = 10, qual é o resultado de A + (B × C)?",
    options: ["33", "70", "73", "100"],
    correctAnswer: "73",
  },
  {
    id: 6,
    text: "Se ◼︎ = 2 e ◻︎ = 3, qual é o resultado de ◼︎ + ◻︎ + ◻︎ ?",
    options: ["6", "7", "8", "9"],
    correctAnswer: "8",
  },
  {
    id: 7,
    text: "Qual item não pertence ao grupo? Maçã, Banana, Laranja, Tomate, Uva",
    options: ["Maçã", "Banana", "Tomate", "Uva"],
    correctAnswer: "Tomate",
  },
  {
    id: 8,
    text: "Complete a sequência: 2, 4, 12, 48, _",
    options: ["96", "144", "192", "240"],
    correctAnswer: "240",
  },
  {
    id: 9,
    text: "Se A=1, B=2 ... Z=26, então 10 + 8 corresponde a qual letra?",
    options: ["R", "S", "Q", "T"],
    correctAnswer: "R",
  },
  {
    id: 10,
    text: 'Conte quantas vezes a letra "a" (sem acento) aparece na frase: "ana avanca ali, mas aguarda a analise."',
    options: ["8", "9", "10", "12"],
    correctAnswer: "10",
  },
  {
    id: 11,
    text: 'Se "todos os gatos têm bigodes" e "Mimi tem bigodes", podemos concluir que Mimi é um gato?',
    options: ["Sim", "Não"],
    correctAnswer: "Não",
  },
  {
    id: 12,
    text: "Se hoje é terça-feira, que dia foi anteontem?",
    options: ["Domingo", "Segunda", "Sábado", "Quarta"],
    correctAnswer: "Domingo",
  },
  {
    id: 13,
    text: "Qual letra vem a seguir na sequência? C, F, I, L, _",
    options: ["O", "M", "P", "N"],
    correctAnswer: "O",
  },
  {
    id: 14,
    text: "Complete a sequência: 4, 9, 19, 39, 79, _",
    options: ["157", "158", "159", "160"],
    correctAnswer: "159",
  },
  {
    id: 15,
    text: "Na lista abaixo há um item repetido. Qual é ele? caneta, lápis, caderno, borracha, régua, estojo, caderno",
    options: ["Caneta", "Lápis", "Caderno", "Estojo"],
    correctAnswer: "Caderno",
  },
  {
    id: 16,
    text: "Qual par não segue o padrão das letras consecutivas do alfabeto?",
    options: ["AB", "CD", "YZ", "ZA"],
    correctAnswer: "ZA",
  },
  {
    id: 17,
    text: "Se todas as rosas são flores e algumas flores são amarelas, podemos afirmar que:",
    options: [
      "Todas as rosas são amarelas",
      "Nenhuma rosa é amarela",
      "É possível que algumas rosas sejam amarelas",
      "Todas as flores são rosas",
    ],
    correctAnswer: "É possível que algumas rosas sejam amarelas",
  },
  {
    id: 18,
    text: "Complete a sequência: 10, 9, 7, 4, 0, _",
    options: ["-5", "-4", "-6", "-7"],
    correctAnswer: "-5",
  },
  {
    id: 19,
    text: "Ordene por velocidade média, do menor para o maior: Tartaruga (0,2 km/h), Caminhão (60 km/h), Carro (40 km/h), Bicicleta (15 km/h)",
    options: [
      "Tartaruga, Bicicleta, Carro, Caminhão",
      "Tartaruga, Carro, Bicicleta, Caminhão",
      "Bicicleta, Tartaruga, Carro, Caminhão",
      "Tartaruga, Bicicleta, Caminhão, Carro",
    ],
    correctAnswer: "Tartaruga, Bicicleta, Carro, Caminhão",
  },
  {
    id: 20,
    text: "Identifique a sequência que segue um padrão diferente das demais:",
    options: ["2, 4, 8, 16", "3, 6, 12, 24", "5, 10, 20, 40", "4, 8, 14, 20"],
    correctAnswer: "4, 8, 14, 20",
  },
];
