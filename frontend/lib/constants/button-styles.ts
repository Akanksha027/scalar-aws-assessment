/** Shared primary CTA styles matching AWS Create hosted zone (#ff9903 + black text). */
export const awsPrimaryButtonStyle = {
  root: {
    background: {
      default: "#ff9903",
      hover: "#ec7211",
      active: "#eb5f07",
      disabled: "#fff3d9",
    },
    borderColor: {
      default: "#ff9903",
      hover: "#ec7211",
      active: "#eb5f07",
      disabled: "#fff3d9",
    },
    color: {
      default: "#16191f",
      hover: "#16191f",
      active: "#16191f",
      disabled: "#8c8c94",
    },
  },
} as const;
