import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
// react native paper 기본 아이콘 세트
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { paperDarkTheme, paperLightTheme } from '@/constants/paper-theme';

export const unstable_settings = {
  anchor: '(tabs)', // 네비게이션 기준점 설정
};

export default function RootLayout() {
  const colorScheme = useColorScheme(); // 사용자의 스마트폰 설정 감지
  const paperTheme = colorScheme === 'dark' ? paperDarkTheme : paperLightTheme;

  const [fontsLoaded] = useFonts({
    'Pretendard-Regular': require('@/assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium': require('@/assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('@/assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('@/assets/fonts/Pretendard-Bold.otf'),
  });

  if (!fontsLoaded) {
    return null; // 폰트 로드 전엔 아무것도 그리지 않음
  }

  // 앱의 최상위 레이어
  // 앱 전체에 테마와 아이콘 설정 적용
  // 메인화면 탭 등록 + 스마트폰 상태바 관리
  // papterTheme 테마 주입
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider
        theme={paperTheme}
        settings={{ icon: (props) => <MaterialCommunityIcons {...props} /> }}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
