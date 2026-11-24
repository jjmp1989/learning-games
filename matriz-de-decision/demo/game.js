"use strict";

(() => {
  const game = document.querySelector("[data-decision-game]");
  if (!game) return;

  const select = (name) => game.querySelector(`[data-${name}]`);
  const configNode = game.querySelector("#decision-game-config");
  const config = configNode ? JSON.parse(configNode.textContent) : decisionGameDemo;
  const { rounds, scenarios, strategies, buildings, timeLimit } = config;
  const { criteria, formatResult } = decisionCriteria;
  const assetTemplate = select("building-assets");
  const buildingUrls = assetTemplate
    ? Array.from(assetTemplate.content.querySelectorAll("img"), (image) => image.getAttribute("src"))
    : buildings.map((_, index) => `assets/building-${index}.webp`);
  const choices = select("choices");
  const startButton = select("action");
  const feedback = select("feedback");
  const feedbackTitle = feedback.querySelector("h2");
  const feedbackButton = select("feedback-action");
  const calculations = select("calculations");
  const completion = select("completion");
  const matrix = select("results");
  const timer = select("time");
  const progressStrip = game.querySelector(".progress-strip");
  const timerWarning = select("timer-warning");
  const building = select("building");

  let level = 0;
  let state = "ready";
  let deadline = 0;
  let intervalId;
  let lastSeconds;

  function createCell(tagName, text, scope) {
    const cell = document.createElement(tagName);
    cell.textContent = text;
    if (scope) cell.scope = scope;
    return cell;
  }

  function setClock(seconds) {
    if (seconds === lastSeconds) return;
    const previousSeconds = lastSeconds;
    lastSeconds = seconds;
    timer.textContent = `${seconds} s`;
    timer.classList.toggle("clock-urgent", seconds <= 5);
    if (state === "playing" && previousSeconds > 5 && seconds <= 5 && seconds > 0) {
      timerWarning.textContent = `Quedan ${seconds} segundos.`;
    }
  }

  function renderProgress() {
    select("progress-text").textContent = `Nivel ${level} de ${rounds.length}`;
    const progress = select("progress");
    progress.max = rounds.length;
    progress.value = level;
    select("building-level").textContent = `Sede · Nivel ${level}`;
    select("building-name").textContent = buildings[level];
    building.src = buildingUrls[level];
  }

  function renderMatrix(results) {
    matrix.replaceChildren();
    strategies.forEach((strategy, rowIndex) => {
      const row = document.createElement("tr");
      row.append(createCell("th", strategy, "row"));
      scenarios.forEach((_, columnIndex) => {
        const value = results?.[rowIndex][columnIndex];
        const cell = createCell("td", value === undefined ? "—" : formatResult(value));
        if (value < 0) cell.className = "negative";
        row.append(cell);
      });
      matrix.append(row);
    });
  }

  function renderRound() {
    const round = rounds[level];
    select("round").textContent = `Ronda ${level + 1} de ${rounds.length}`;
    select("criterion").textContent = criteria[round.criterion].label(round.alpha);
    select("question").textContent = round.context;
    renderMatrix();
    setClock(timeLimit);
  }

  function stopClock() {
    clearInterval(intervalId);
    timerWarning.textContent = "";
  }

  function tick() {
    const seconds = Math.max(0, Math.ceil((deadline - performance.now()) / 1000));
    setClock(seconds);
    if (seconds === 0) finishRound();
  }

  function startRound() {
    feedback.hidden = true;
    startButton.hidden = true;
    choices.hidden = false;
    state = "playing";
    renderMatrix(rounds[level].results);
    setClock(timeLimit);
    deadline = performance.now() + timeLimit * 1000;
    intervalId = setInterval(tick, 100);
    choices.querySelector("button").focus({ preventScroll: true });
    const matrixPanel = matrix.closest(".matrix-panel");
    const stickyOffset = getComputedStyle(progressStrip).position === "sticky" ? progressStrip.offsetHeight : 0;
    if (matrixPanel.getBoundingClientRect().top < stickyOffset) {
      matrixPanel.scrollIntoView({ block: "start" });
    }
  }

  function finishRound(selectedIndex) {
    if (state !== "playing") return;

    const timedOut = selectedIndex === undefined || performance.now() >= deadline;
    if (timedOut) setClock(0);
    stopClock();
    choices.hidden = true;
    calculations.hidden = true;
    calculations.replaceChildren();

    const round = rounds[level];
    const criterion = criteria[round.criterion];
    const evaluated = round.results.map((row) => criterion.evaluate(row, round.alpha));
    const best = Math.max(...evaluated.map(({ score }) => score));
    const correct = !timedOut && evaluated[selectedIndex].score === best;
    state = correct ? "correct" : "retry";

    if (correct) {
      level += 1;
      renderProgress();
      feedbackTitle.textContent = "¡Has acertado!";
      select("feedback-message").textContent = `${strategies[selectedIndex]} obtiene el mejor resultado según este criterio.`;
      evaluated.forEach(({ score, calculation }, index) => {
        const item = document.createElement("li");
        const label = document.createElement("strong");
        label.textContent = strategies[index];
        if (score === best) item.className = "best-score";
        item.append(label, document.createTextNode(` · ${calculation}`));
        calculations.append(item);
      });
      calculations.hidden = false;
      matrix.rows[selectedIndex].classList.add("selected-row");
      feedbackButton.textContent = level === rounds.length ? "Ver resultado final" : "Siguiente ronda";
    } else {
      feedbackTitle.textContent = timedOut ? "Se acabó el tiempo" : "Prueba de nuevo";
      select("feedback-message").textContent = criterion.hint(round.alpha);
      feedbackButton.textContent = "Reintentar ronda";
    }

    feedback.dataset.result = state;
    feedback.hidden = false;
    feedbackTitle.focus();
  }

  function continueGame() {
    if (state === "retry") {
      startRound();
      return;
    }
    if (level === rounds.length) {
      state = "complete";
      feedback.hidden = true;
      completion.hidden = false;
      select("round").textContent = "Partida completada";
      select("completion-title").focus();
      return;
    }

    renderRound();
    startRound();
  }

  function resetGame() {
    stopClock();
    level = 0;
    state = "ready";
    completion.hidden = true;
    feedback.hidden = true;
    choices.hidden = true;
    startButton.hidden = false;
    renderProgress();
    renderRound();
  }

  select("scenarios").append(
    createCell("th", "Estrategia", "col"),
    ...scenarios.map((scenario) => createCell("th", scenario, "col")),
  );
  strategies.forEach((strategy, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = strategy;
    button.addEventListener("click", () => finishRound(index));
    choices.append(button);
  });

  startButton.addEventListener("click", startRound);
  feedbackButton.addEventListener("click", continueGame);
  select("restart").addEventListener("click", () => {
    resetGame();
    startButton.focus();
  });

  resetGame();
})();
