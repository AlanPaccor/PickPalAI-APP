/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#1E90FF';
const tintColorDark = '#3BB9FF';

export default {
  light: {
    text: '#000000',
    background: '#FFFFFF',
    tint: tintColorLight,
    tabIconDefault: '#8E8E93',
    tabIconSelected: tintColorLight,
    tabBar: '#FFFFFF',
  },
  dark: {
    text: '#FFFFFF',
    background: '#000010',
    tint: tintColorDark,
    tabIconDefault: '#1E90FF90',
    tabIconSelected: tintColorDark,
    tabBar: '#151718',
  },
};
