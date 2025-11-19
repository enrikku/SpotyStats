import Chart from "chart.js/auto";
import type { Chart as ChartJS } from "chart.js";
import type { SpotifyExtendedStreamingHistory } from "../interfaces/SpotifyExtendedStreamingHistory.ts";
import { getMinutesPerYear } from "./sorter.ts";

export async function renderMinutesPerYearChart(
    artistData: SpotifyExtendedStreamingHistory[],
    container: HTMLElement // elemento donde se añadirá el canvas
): Promise<ChartJS | null> {
    if (typeof window === "undefined") {
        console.warn("renderMinutesPerYearChart debe ejecutarse en el navegador");
        return null;
    }

    const data = getMinutesPerYear(artistData);
    const labels = data.map((d) => String(d.year));
    const values = data.map((d) => Math.round(d.minutes));

    // Si hay un canvas previo en el container, lo eliminamos y destruimos el chart guardado
    const existingCanvas = container.querySelector("canvas");
    if (existingCanvas) {
        // Si se ha guardado la instancia en dataset, intentamos destruirla
        const chartInstance = (existingCanvas as any).__chartInstance as ChartJS | undefined;
        if (chartInstance) {
            chartInstance.destroy();
        }
        existingCanvas.remove();
    }

    // Crear canvas y agregar al DOM ANTES de instanciar Chart si usas responsive:true
    const canvas = document.createElement("canvas") as HTMLCanvasElement;
    canvas.style.width = "100%";
    canvas.style.height = "300px"; // ajusta altura según necesites
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
                    label: "Minutos escuchados por año",
                    data: values,
                    // si usas Tailwind/tema oscuro, pon colores en variables CSS o dinámicos
                    backgroundColor: "rgba(75, 192, 192, 0.5)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // importante si controlas la altura con CSS
            plugins: {
                legend: {
                    display: true,
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => `${value} min`,
                    },
                },
            },
        },
    });

    // Guardamos la instancia en el canvas para poder destruirla después
    (canvas as any).__chartInstance = chart;

    return chart;
}