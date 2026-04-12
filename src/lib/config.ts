/**
 * Application-wide configuration constants.
 * Values are read from environment variables with sensible defaults.
 */

export const CONFIG = {
  /** "simulation" | "hardware" */
  dataMode: (process.env.NEXT_PUBLIC_DATA_MODE ?? 'simulation') as 'simulation' | 'hardware',

  /** Distance threshold (cm) above which a booking counts as ghost */
  ghostThresholdCm: Number(process.env.NEXT_PUBLIC_GHOST_THRESHOLD_CM ?? 60),

  /** How long (ms) the distance must stay above threshold before marking ghost */
  ghostDelayMs: Number(process.env.NEXT_PUBLIC_GHOST_DELAY_MS ?? 3000),

  /** Hours after which a booking triggers overstay warning */
  overstayHours: Number(process.env.NEXT_PUBLIC_OVERSTAY_HOURS ?? 4),

  /** Minutes of total inactivity before energy-saver mode activates */
  energySaverMinutes: Number(process.env.NEXT_PUBLIC_ENERGY_SAVER_MINUTES ?? 30),

  /** Debounce interval (ms) for sensor data */
  sensorDebounceMs: Number(process.env.NEXT_PUBLIC_SENSOR_DEBOUNCE_MS ?? 3000),
} as const;
