import { MD3DarkTheme, MD3LightTheme, configureFonts } from 'react-native-paper';

// MD3 타입스케일 기준 regular(400)/medium(500) 굵기에 맞춰 Pretendard 파일을 매칭
const fontConfig = {
  displayLarge: { fontFamily: 'Pretendard-Regular' },
  displayMedium: { fontFamily: 'Pretendard-Regular' },
  displaySmall: { fontFamily: 'Pretendard-Regular' },
  headlineLarge: { fontFamily: 'Pretendard-Regular' },
  headlineMedium: { fontFamily: 'Pretendard-Regular' },
  headlineSmall: { fontFamily: 'Pretendard-Regular' },
  titleLarge: { fontFamily: 'Pretendard-Regular' },
  titleMedium: { fontFamily: 'Pretendard-Medium' },
  titleSmall: { fontFamily: 'Pretendard-Medium' },
  labelLarge: { fontFamily: 'Pretendard-Medium' },
  labelMedium: { fontFamily: 'Pretendard-Medium' },
  labelSmall: { fontFamily: 'Pretendard-Medium' },
  bodyLarge: { fontFamily: 'Pretendard-Regular' },
  bodyMedium: { fontFamily: 'Pretendard-Regular' },
  bodySmall: { fontFamily: 'Pretendard-Regular' },
};

const fonts = configureFonts({ config: fontConfig });

export const paperLightTheme = {
  ...MD3LightTheme,
  fonts,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#C4622D',
    secondary: '#7A5C3E',
    background: '#FAF7F2',
    surface: '#FFFFFF',
    surfaceVariant: '#F1E7DA',
  },
};

export const paperDarkTheme = {
  ...MD3DarkTheme,
  fonts,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#E8935F',
    secondary: '#D6B996',
    background: '#181411',
    surface: '#211C18',
    surfaceVariant: '#332A22',
  },
};
