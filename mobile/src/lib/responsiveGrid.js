import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIDE_PADDING = 20;
const GRID_GAP = 16;
const TABLET_BREAKPOINT = 700;

// Phones stay a single centered column (a 2-up grid there would be too
// cramped); tablets get a 2-column grid instead of one centered card with
// the rest of the row sitting empty.
export const GRID_COLUMNS = SCREEN_WIDTH >= TABLET_BREAKPOINT ? 2 : 1;

export const GRID_CARD_WIDTH =
  GRID_COLUMNS === 1
    ? Math.min(SCREEN_WIDTH - SIDE_PADDING * 2, 500)
    : (SCREEN_WIDTH - SIDE_PADDING * 2 - GRID_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

export const GRID_GAP_SIZE = GRID_GAP;
