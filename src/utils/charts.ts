import Chart from "chart.js/auto";
import type { Chart as ChartJS } from "chart.js";
import type { SpotifyExtendedStreamingHistory } from "../interfaces/SpotifyExtendedStreamingHistory.ts";
import { getMinutesPerYear, getPlaysPerDay } from "./sorter.ts";
import type { DayName } from "../interfaces/DayName.ts";
import type { PlaysPerDayCount } from "../interfaces/PlaysPerDayCount.ts";
import type { PlayPerDay } from "../interfaces/PlayPerDay .ts";

export async function renderMinutesPerYearChart(artistData: SpotifyExtendedStreamingHistory[], container: HTMLElement): Promise<ChartJS | null> {
  if (typeof window === "undefined") {
    console.warn("renderMinutesPerYearChart debe ejecutarse en el navegador");
    return null;
  }

  const data = getMinutesPerYear(artistData);
  const labels = data.map(d => String(d.year));
  const values = data.map(d => Math.round(d.minutes));

  const existingCanvas = container.querySelector("canvas");
  if (existingCanvas) {
    const chartInstance = (existingCanvas as any).__chartInstance as ChartJS | undefined;
    if (chartInstance) {
      chartInstance.destroy();
    }
    existingCanvas.remove();
  }

  const canvas = document.createElement("canvas") as HTMLCanvasElement;
  canvas.style.width = "100%";
  canvas.style.height = "300px";
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("No se pudo obtener el contexto del canvas");
    return null;
  }

  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Minutes listened per year",
          data: values,

          backgroundColor: "rgba(75, 192, 192, 0.5)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => `${value} min`,
          },
        },
      },
    },
  });

  (canvas as any).__chartInstance = chart;

  return chart;
}

export async function renderPlaysPerDayChart(artistData: SpotifyExtendedStreamingHistory[], container: HTMLElement): Promise<Chart | null> {
  if (typeof window === "undefined") {
    console.warn("renderPlaysPerDayChart debe ejecutarse en el navegador");
    return null;
  }

  // Días de la semana
  const days: DayName[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Inicializar contador
  const playsPerDayCount: PlaysPerDayCount = days.reduce((acc, day) => {
    acc[day] = 0;
    return acc;
  }, {} as PlaysPerDayCount);

  // Obtener plays por día
  const playsPerDay: PlayPerDay[] = getPlaysPerDay(artistData);

  playsPerDay.forEach(value => {
    const date = new Date(value.date);
    const dayName: DayName = days[date.getDay()];
    playsPerDayCount[dayName] += value.plays;
  });

  // Labels y values ordenados según "days"
  const labels = days;
  const values = labels.map(day => playsPerDayCount[day]);

  // ─────────────────────────────────────
  // Si ya existía un canvas y un chart, destruirlo
  // ─────────────────────────────────────
  const existingCanvas = container.querySelector("canvas");
  if (existingCanvas) {
    const chartInstance = (existingCanvas as any).__chartInstance as Chart | undefined;
    if (chartInstance) {
      chartInstance.destroy();
    }
    existingCanvas.remove();
  }

  // Crear canvas nuevo
  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "300px";
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("No se pudo obtener el contexto del canvas");
    return null;
  }

  // ─────────────────────────────────────
  // Crear chart
  // ─────────────────────────────────────
  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Plays per day of the week",
          data: values,
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
        },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.raw} plays`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => `${value}`,
          },
        },
      },
    },
  });

  // Guardar instancia
  (canvas as any).__chartInstance = chart;

  return chart;
}
