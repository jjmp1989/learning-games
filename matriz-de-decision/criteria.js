"use strict";

const decisionCriteria = (() => {
  const numberFormat = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 });
  const signedFormat = new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 2,
    signDisplay: "exceptZero",
  });
  const format = (number) => numberFormat.format(number);
  const formatResult = (number) => signedFormat.format(number).replace("-", "−");

  const criteria = {
    maximax: {
      label: () => "Optimista (maxi-max)",
      hint: () => "Busca el máximo de cada fila y compara esos máximos.",
      evaluate: (row) => {
        const score = Math.max(...row);
        return { score, calculation: `máximo = ${format(score)}` };
      },
    },
    wald: {
      label: () => "Pesimista (Wald)",
      hint: () => "Busca el mínimo de cada fila y elige el mayor de esos mínimos.",
      evaluate: (row) => {
        const score = Math.min(...row);
        return { score, calculation: `mínimo = ${format(score)}` };
      },
    },
    laplace: {
      label: () => "Laplace",
      hint: () => "Suma los resultados de cada fila, divide entre tres y compara las medias.",
      evaluate: (row) => {
        const score = row.reduce((total, value) => total + value, 0) / row.length;
        const values = row.map((value) => value < 0 ? `(${format(value)})` : format(value));
        return { score, calculation: `(${values.join(" + ")}) ÷ ${row.length} = ${format(score)}` };
      },
    },
    hurwicz: {
      label: (alpha) => `Hurwicz · α = ${format(alpha)}`,
      hint: (alpha) => `En cada fila, multiplica el máximo por ${format(alpha)} y el mínimo por ${format(1 - alpha)}. Suma y compara.`,
      evaluate: (row, alpha) => {
        const maximum = Math.max(...row);
        const minimum = Math.min(...row);
        const pessimism = 1 - alpha;
        const score = alpha * maximum + pessimism * minimum;
        return {
          score,
          calculation: `${format(alpha)} × (${format(maximum)}) + ${format(pessimism)} × (${format(minimum)}) = ${format(score)}`,
        };
      },
    },
  };

  return { criteria, formatResult };
})();
