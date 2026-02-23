import { createContext } from "react";
import { URLState } from "../URLState.ts";

export const URLContext = createContext(new URLState());
