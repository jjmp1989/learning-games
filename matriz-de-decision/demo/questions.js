"use strict";

// Demo data. Django can supply the same shape through a JSON script.
const decisionGameDemo = {
  timeLimit: 30,
  strategies: ["Conservadora", "Equilibrada", "Agresiva"],
  scenarios: ["Bajan los tipos", "Sin cambios", "Suben los tipos"],
  buildings: [
    "Local de barrio",
    "Oficina de esquina",
    "Edificio de ladrillo",
    "Sede de piedra y vidrio",
    "Edificio con atrio",
    "Sede central",
    "Torre acristalada",
    "Torre de negocios",
    "Torre escalonada",
    "Torre panorámica",
    "Rascacielos",
  ],
  // Each row follows the strategy order and each column the scenario order.
  rounds: [
    {
      context: "Acabáis de abrir. Buscáis la mayor ganancia posible.",
      criterion: "maximax",
      results: [[12, 9, 6], [18, 14, 3], [30, 10, -8]],
    },
    {
      context: "Tenéis que pagar el alquiler. Proteged el resultado en el peor caso.",
      criterion: "wald",
      results: [[10, 8, 6], [16, 10, 2], [28, 9, -9]],
    },
    {
      context: "Consideráis que los tres escenarios son igual de probables.",
      criterion: "laplace",
      results: [[12, 9, 6], [21, 15, 6], [27, 9, -6]],
    },
    {
      context: "El equipo quiere aprovechar la mejor oportunidad de este trimestre.",
      criterion: "maximax",
      results: [[15, 12, 9], [27, 21, 6], [24, 12, -6]],
    },
    {
      context: "La sede crece. Dad el mismo peso al mejor y al peor resultado.",
      criterion: "hurwicz",
      alpha: 0.5,
      results: [[16, 12, 8], [20, 16, 8], [24, 10, -4]],
    },
    {
      context: "Habéis asumido nuevos gastos. Elegid la mejor garantía en el peor caso.",
      criterion: "wald",
      results: [[14, 9, 5], [20, 14, 8], [30, 12, -6]],
    },
    {
      context: "En vuestro informe dais la misma probabilidad a las tres decisiones sobre los tipos.",
      criterion: "laplace",
      results: [[15, 12, 9], [21, 15, 6], [39, 12, -3]],
    },
    {
      context: "El equipo pesa más el mejor resultado. Aplicad un optimismo del 75 %.",
      criterion: "hurwicz",
      alpha: 0.75,
      results: [[20, 16, 12], [28, 20, 8], [40, 16, -8]],
    },
    {
      context: "Para el último proyecto, el comité pide optimismo total.",
      criterion: "hurwicz",
      alpha: 1,
      results: [[20, 16, 12], [32, 24, 8], [48, 20, -8]],
    },
    {
      context: "El comité revisa el mismo proyecto y ahora pide centrarse por completo en el peor resultado.",
      criterion: "hurwicz",
      alpha: 0,
      results: [[20, 16, 12], [32, 24, 8], [48, 20, -8]],
    },
  ],
};
