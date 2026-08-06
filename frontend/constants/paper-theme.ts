import { MD3DarkTheme, MD3LightTheme, configureFonts } from 'react-native-paper';

// 폰트 위계를 노션 스타일(Bold / SemiBold / Regular)로 세분화
const fontConfig = {
  displayLarge: { fontFamily: 'Pretendard-Bold' },
  displayMedium: { fontFamily: 'Pretendard-Bold' },
  displaySmall: { fontFamily: 'Pretendard-Bold' },
  headlineLarge: { fontFamily: 'Pretendard-Bold' },
  headlineMedium: { fontFamily: 'Pretendard-Bold' },
  headlineSmall: { fontFamily: 'Pretendard-SemiBold' },
  titleLarge: { fontFamily: 'Pretendard-Bold' },
  titleMedium: { fontFamily: 'Pretendard-SemiBold' },
  titleSmall: { fontFamily: 'Pretendard-Medium' },
  labelLarge: { fontFamily: 'Pretendard-SemiBold' },
  labelMedium: { fontFamily: 'Pretendard-Medium' },
  labelSmall: { fontFamily: 'Pretendard-Medium' },
  bodyLarge: { fontFamily: 'Pretendard-Regular' },
  bodyMedium: { fontFamily: 'Pretendard-Regular' },
  bodySmall: { fontFamily: 'Pretendard-Regular' },
};

const fonts = configureFonts({ config: fontConfig });

/**
 * Notion 스타일 라이트 테마 (Monochrome Minimal)
 */
export const paperLightTheme = {
  ...MD3LightTheme,
  fonts,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2F3437',           // 노션 시그니처 짙은 무채색 (강조, 버튼 등)
    onPrimary: '#FFFFFF',
    secondary: '#787774',         // 보조 텍스트 및 칼로리/시간 안내용 회색
    onSecondary: '#FFFFFF',
    background: '#FBFBFB',        // 단정하고 정갈한 노션 오프화이트 배경
    surface: '#FFFFFF',           // 카드 배경 (깔끔한 흰색)
    onSurface: '#191919',         // 메인 텍스트 (완전 검정 대신 진한 회색)
    surfaceVariant: '#F1F1EF',    // 노션 뱃지/칩 배경 (사이드 반찬용 연회색)
    onSurfaceVariant: '#5A5A58',  // 칩 내 텍스트 및 시간 표시
    outline: '#E9E9E7',           // 카드 테두리 및 구분선 (Divider)
  },
};

/**
 * Notion 스타일 다크 테마 (Dark Charcoal)
 */
export const paperDarkTheme = {
  ...MD3DarkTheme,
  fonts,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#EEEEEC',           // 노션 다크모드 메인 텍스트/포인트
    onPrimary: '#191919',
    secondary: '#9B9B97',         // 보조 회색
    onSecondary: '#191919',
    background: '#191919',        // 노션 다크모드 메인 배경
    surface: '#202020',           // 카드 배경
    onSurface: '#D3D3D3',
    surfaceVariant: '#2F2F2F',    // 칩/뱃지 배경
    onSurfaceVariant: '#A4A4A2',
    outline: '#2F2F2F',           // 테두리 구분선
  },
};