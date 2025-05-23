import Color from 'tinycolor2';
import {useMemo} from 'react';
import { Theme } from '@/context/ThemeContext';

// TODO: memorize this function to reduce computation load and improve performance
/**
 * Calculates the contrast ratio between two colors based on their luminance.
 * The function uses the WCAG formula for contrast ratio, which is (L1 + 0.05) / (L2 + 0.05),
 * where L1 is the luminance of the lighter color and L2 is the luminance of the darker color.
 * Luminance is calculated using the provided `Color` library function `getLuminance()`.
 *
 * @param {string | undefined} foreground - The foreground color in any CSS color format.
 * @param {string} background - The background color in any CSS color format.
 * @returns {number} - The contrast ratio between the foreground and background colors.
 */
export function getContrastRatio(foreground: string | undefined | null, background: string): number {
	const start = performance.now();

	let usedForeground = !!foreground ? foreground : undefined

	const lumA = Color(usedForeground).getLuminance();
	const lumB = Color(background).getLuminance();
	let contrastRation = (Math.max(lumA, lumB) + 0.05) / (Math.min(lumA, lumB) + 0.05);

	const end = performance.now();
	let duration = end - start;
	if(duration>5) {
		console.log("WARNING - getContrastRatio: foreground: ", usedForeground, "duration: ", duration, "ms")
	}

	return contrastRation;
}

export function getColorAsHex(color: string | undefined): string | undefined {
	if (!color) {
		return undefined;
	}
	return Color(color).toHexString();
}

export function useLighterOrDarkerColorForSelection(color: string | undefined): string {
	const backgroundColor = Color(color);
	const isDark = backgroundColor.isDark();
	return useColorForSelectionWithOption(color, isDark);
}

export function useColorForSelectionWithOption(color: string | undefined, lightenUpColor: boolean): string {
	return getLighterOrDarkerColorByContrastWithOptions(color, ContrastThresholdSelectedItems.MaternaLandNiedersachsen, lightenUpColor);
}

function getLighterOrDarkerColorByContrastWithOptions(color: string | undefined, contrastRatio: number, lightenUpColor: boolean): string {
	const start = performance.now();

	const dependencyKey = ""+color + contrastRatio;
	let steps = 0;

	let result = useMemo(() => {
		if (!color) {
			return 'transparent';
		}

		const backgroundColor = Color(color);
		const isDark = backgroundColor.isDark();
		let modifiedColor = backgroundColor.clone();
		const step = 1; // Adjust step to be more precise
		let currentContrastRatio = getContrastRatio(modifiedColor.toHexString(), color);

		// Loop until the contrast ratio is met or improved
		while (currentContrastRatio < contrastRatio) {
			if(steps>100) {
				console.warn("getLighterOrDarkerColorByContrast: color: ", color, "contrastRatio: ", contrastRatio, "steps: ", steps)
				break;
			}
			if (lightenUpColor) {
				modifiedColor = modifiedColor.lighten(step);
			} else {
				modifiedColor = modifiedColor.darken(step);
			}
			currentContrastRatio = getContrastRatio(modifiedColor.toHexString(), color);
			steps++;
		}

		return modifiedColor.toHexString();
	}, [dependencyKey]); // Only recompute if color or contrastRatio changes

	const end = performance.now();
	let duration = end - start;
	if(duration>5) {
		console.log("WARNING - getLighterOrDarkerColorByContrast: color: ", color, "duration: ", duration, "ms", "contrastRatio: ", contrastRatio, "result: ", result, "steps: ", steps)
	}

	return result;

}

export enum ContrastThresholdSelectedItems {
    MaternaLandNiedersachsen = 1.9,
}

enum ContrastThreshold {
    MaternaLandNiedersachsen = 4.5,
    WCAG_AA = 3.0,
    WCAG_AAA = 7.0,
}

/**
 * Determines the most readable contrast color (either dark or light text) based on the provided background color.
 * The function first checks for a custom contrast color set in `ConfigHolder.plugin.customContrastColor`.
 * If not found, it calculates the contrast ratios for dark and light text against the background color.
 * The function adheres to contrast thresholds defined by Materna Land Niedersachsen and W3C WCAG AA.
 * It selects the text color (dark or light) that provides the best readability based on the current color mode (dark or light)
 * and the contrast thresholds.
 *
 * @param {string | undefined} trueBg - The background color for which the contrast color is to be calculated.
 * @param isDarkMode
 * @param contrastThreshold {number}
 * @returns {string} - The hex color code of the most readable contrast color (either dark or light text).
 */
const useMyContrastColorByColorMode = (trueBg: string | undefined | null, isDarkMode: boolean, contrastThreshold: ContrastThreshold) => {

	const start = performance.now();

	let result = useMemo(() => {
		const trueDarkText = '#000000';
		const trueLightText = '#FFFFFF';

		const darkTextContrast = getContrastRatio(trueBg, trueDarkText);
		const lightTextContrast = getContrastRatio(trueBg, trueLightText);

		// if dark mode, return light text if contrast is good enough
		if (isDarkMode && lightTextContrast >= contrastThreshold) {
			return trueLightText;
		}
		// if light mode, return dark text if contrast is good enough
		if (!isDarkMode && darkTextContrast >= contrastThreshold) {
			return trueDarkText;
		}
		// otherwise return the text color with the highest contrast
		return darkTextContrast > lightTextContrast ? trueDarkText : trueLightText;
	}, [trueBg, isDarkMode, contrastThreshold]); // Dependencies

	const end = performance.now();
	let duration = end - start;

	if(duration>5) {
		console.warn("useMyContrastColorByColorMode: trueBg: ", trueBg, "duration: ", duration, "ms")
	}

	return result
};

export function useViewBackgroundColor(theme: Theme) {
	const backgroundColor = theme?.background;
	const asHex = getColorAsHex(backgroundColor);
	return asHex
}

/**
 * Custom hook that returns the most readable contrast color for a given background color,
 * taking into account the current theme mode (dark or light).
 * It delegates the decision of contrast color to `useMyContrastColorByColorMode` function
 * based on the value of `isDarkTheme`.
 *
 * @param {string | undefined} trueBg - The background color for which the contrast color is to be calculated.
 * @returns {string} - The hex color code of the most readable contrast color, suitable for the current theme mode.
 */
export function useMyContrastColor(trueBg: string | undefined | null, theme: Theme, isDarkMode: boolean) {
	const viewBackgroundColor = useViewBackgroundColor(theme)
	if (trueBg==='transparent') {
		trueBg = viewBackgroundColor;
	}
	return useMyContrastColorByColorMode(trueBg, isDarkMode, ContrastThreshold.MaternaLandNiedersachsen);
}



/**
 * Determines the most readable contrast color (black or white) based on WCAG contrast ratio.
 * @param {string | undefined} trueBg - The background color.
 * @param {boolean} isDarkMode - Whether dark mode is enabled.
 * @param {number} contrastThreshold - The contrast ratio threshold.
 * @returns {string} The most readable contrast color (black or white).
 */
function getContrastColorByMode(
  trueBg: string | undefined | null,
  isDarkMode: boolean,
  contrastThreshold: number
) {
  const trueDarkText = '#000000';
  const trueLightText = '#FFFFFF';

  const darkTextContrast = getContrastRatio(trueBg, trueDarkText);
  const lightTextContrast = getContrastRatio(trueBg, trueLightText);

  if (isDarkMode && lightTextContrast >= contrastThreshold)
    return trueLightText;
  if (!isDarkMode && darkTextContrast >= contrastThreshold) return trueDarkText;

  return darkTextContrast > lightTextContrast ? trueDarkText : trueLightText;
}

/**
 * Modifies a color to increase contrast using lighten/darken methods.
 * @param {string | undefined} color - The base color.
 * @param {number} contrastRatio - The contrast ratio threshold.
 * @param {boolean} lightenUpColor - Whether to lighten or darken the color.
 * @returns {string} The adjusted color in HEX format.
 */
function adjustColorForContrast(
  color: string | undefined,
  contrastRatio: number,
  lightenUpColor: boolean
): string {
  if (!color) return 'transparent';

  let modifiedColor = Color(color).clone();
  let steps = 0;
  let step = 1; // Fine-tuning adjustment step.
  let currentContrastRatio = getContrastRatio(
    modifiedColor.toHexString(),
    color
  );

  while (currentContrastRatio < contrastRatio) {
    if (steps > 100) break; // Prevent infinite loops.

    modifiedColor = lightenUpColor
      ? modifiedColor.lighten(step)
      : modifiedColor.darken(step);
    currentContrastRatio = getContrastRatio(modifiedColor.toHexString(), color);
    steps++;
  }

  return modifiedColor.toHexString();
}

/**
 * Retrieves the view background color based on the theme.
 * @param {Theme} theme - Theme object.
 * @returns {string | undefined} Background color in HEX format.
 */
function getViewBackgroundColor(theme: Theme): string | undefined {
  return getColorAsHex(theme?.background);
}

/**
 * Determines the most readable contrast color for a given background, considering theme mode.
 * @param {string | undefined | null} trueBg - The background color.
 * @param {Theme} theme - Theme object.
 * @param {boolean} isDarkMode - Whether dark mode is enabled.
 * @returns {string} The most readable contrast color.
 */
export function myContrastColor(
  trueBg: string | undefined | null,
  theme: Theme,
  isDarkMode: boolean
) {
  const viewBackgroundColor = getViewBackgroundColor(theme);

  if (trueBg === 'transparent') {
    trueBg = viewBackgroundColor;
  }

  return getContrastColorByMode(
    trueBg,
    isDarkMode,
    ContrastThreshold.MaternaLandNiedersachsen
  );
}
