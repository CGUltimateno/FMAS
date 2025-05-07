import React from 'react';
import { Bar, Line, Radar } from 'react-chartjs-2';
import { useGetMatchTimelineQuery } from '../../services/footballApi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import '../../styles/MatchStats/PerformanceGraphs.scss';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

const CHART_COLORS = {
  home: {
    primary: 'rgba(220, 53, 69, 0.8)',    // Red for home team
    secondary: 'rgba(220, 53, 69, 0.2)',
    border: 'rgba(220, 53, 69, 1)'
  },
  away: {
    primary: 'rgba(0, 123, 255, 0.8)',    // Blue for away team
    secondary: 'rgba(0, 123, 255, 0.2)',
    border: 'rgba(0, 123, 255, 1)'
  },
  possession: {
    line: 'rgba(255, 193, 7, 0.8)',       // Yellow for possession line
    fill: 'rgba(255, 193, 7, 0.1)'
  },
  radar: {
    grid: 'rgba(160, 160, 160, 0.2)',     // Grey for radar grid
    text: 'rgba(160, 160, 160, 0.9)'      // Grey for radar text
  }
};

const PerformanceGraphs = ({ matchId }) => {
  const { data: timeline, isLoading, error } = useGetMatchTimelineQuery(matchId);

  if (isLoading) return <div className="performance-graphs loading">Loading match analysis...</div>;

  // Handle errors
  if (error) {
    console.error('Error loading match analysis:', error); // Log detailed error for debugging
    return (
      <div className="performance-graphs error">
        <p>Error loading match analysis. Please try again later.</p>
        <pre>{JSON.stringify(error, null, 2)}</pre> {/* Show detailed error for debugging */}
      </div>
    );
  }

  // Handle missing or incomplete data
  if (!timeline || !timeline.intervals || timeline.intervals.length === 0) {
    return <div className="performance-graphs empty">No match data available</div>;
  }

  const goalsScoredConfig = {
    type: 'bar',
    data: {
      labels: timeline.intervals,
      datasets: [
        {
          label: timeline.homeTeam.name,
          data: timeline.goals.home,
          backgroundColor: CHART_COLORS.home.primary,
          borderColor: CHART_COLORS.home.border,
          borderWidth: 1
        },
        {
          label: timeline.awayTeam.name,
          data: timeline.goals.away,
          backgroundColor: CHART_COLORS.away.primary,
          borderColor: CHART_COLORS.away.border,
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Goals Scored (15min intervals)',
          color: CHART_COLORS.radar.text
        },
        legend: {
          labels: {
            color: CHART_COLORS.radar.text
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { 
            stepSize: 1,
            color: CHART_COLORS.radar.text
          },
          grid: {
            color: CHART_COLORS.radar.grid
          }
        },
        x: {
          ticks: {
            color: CHART_COLORS.radar.text
          },
          grid: {
            color: CHART_COLORS.radar.grid
          }
        }
      }
    }
  };

  const possessionConfig = {
    type: 'line',
    data: {
      labels: timeline.intervals,
      datasets: [
        {
          label: 'Home Possession',
          data: timeline.possession.home,
          borderColor: CHART_COLORS.home.primary,
          backgroundColor: CHART_COLORS.home.secondary,
          fill: true
        },
        {
          label: 'Away Possession',
          data: timeline.possession.away,
          borderColor: CHART_COLORS.away.primary,
          backgroundColor: CHART_COLORS.away.secondary,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Possession Over Time',
          color: CHART_COLORS.radar.text
        }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: {
            callback: value => `${value}%`,
            color: CHART_COLORS.radar.text
          },
          grid: {
            color: CHART_COLORS.radar.grid
          }
        },
        x: {
          ticks: {
            color: CHART_COLORS.radar.text
          },
          grid: {
            color: CHART_COLORS.radar.grid
          }
        }
      }
    }
  };

  const radarConfig = {
    type: 'radar',
    data: {
      labels: ['Attack', 'Defense', 'Possession', 'Shots', 'Passes'],
      datasets: [
        {
          label: timeline.homeTeam.name,
          data: timeline.performance.home,
          backgroundColor: CHART_COLORS.home.secondary,
          borderColor: CHART_COLORS.home.border,
          pointBackgroundColor: CHART_COLORS.home.primary
        },
        {
          label: timeline.awayTeam.name,
          data: timeline.performance.away,
          backgroundColor: CHART_COLORS.away.secondary,
          borderColor: CHART_COLORS.away.border,
          pointBackgroundColor: CHART_COLORS.away.primary
        }
      ]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Team Performance Comparison',
          color: CHART_COLORS.radar.text
        }
      },
      scales: {
        r: {
          angleLines: {
            color: CHART_COLORS.radar.grid
          },
          grid: {
            color: CHART_COLORS.radar.grid
          },
          pointLabels: {
            color: CHART_COLORS.radar.text
          },
          ticks: {
            color: CHART_COLORS.radar.text
          }
        }
      }
    }
  };

  return (
    <div className="performance-graphs">
      <h2 className="graphs-title">Match Timeline Analysis</h2>
      <div className="graphs-container">
        <div className="graph-card">
          <Bar {...goalsScoredConfig} />
        </div>
        <div className="graph-card">
          <Line {...possessionConfig} />
        </div>
        <div className="graph-card">
          <Radar {...radarConfig} />
        </div>
      </div>
    </div>
  );
};

export default PerformanceGraphs;
