"use client";

import { createContext, useContext } from "react";

/**
 * `true` cuando termina la cortinilla de entrada. Lo consumen el hero y la
 * navegación para no animar nada detrás del telón.
 */
export const IntroReadyContext = createContext(false);

export const useIntroReady = () => useContext(IntroReadyContext);
