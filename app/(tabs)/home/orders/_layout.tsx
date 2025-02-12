// Expo
import { Tabs } from 'expo-router'

// Core
import { Platform, View, Text, Pressable } from 'react-native'

// Constants
import { Colors } from '@/lib/utils/constants/colors'

// Hooks
import { useColorScheme } from '@/lib/hooks/useColorScheme'
import { useTranslation } from 'react-i18next'

export default function Layout() {
  // Hooks
  const { t } = useTranslation()
  const colorScheme = useColorScheme()

  return (
    <Tabs
      // initialRouteName="processing"
      screenOptions={{
        tabBarIcon: () => null,
        tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].primary,
        headerShown: false,
        tabBarIconStyle: {
          display: 'none',
        },
        tabBarLabel: ({ children, focused }) => (
          <View
            className="w-full"
            style={{
              alignItems: 'center',
              borderBottomWidth: focused ? 2 : 0, // Bottom border when selected
              borderBottomColor:
                focused ? Colors[colorScheme ?? 'dark'].primary : 'transparent', // Black border for active tab
              paddingBottom: 8, // Space between text and border
            }}
          >
            <Text
              style={{
                color: focused ? 'black' : '#6B7280',
                fontWeight: 500,
                fontSize: 14,
                fontFamily: 'Inter',
              }}
            >
              {children}
            </Text>
          </View>
        ),

        tabBarButton: (props) => {
          return (
            <Pressable
              {...props}
              android_ripple={{ color: 'transparent' }} // Remove ripple on Android
              style={({ pressed }) => [
                props.style,
                { opacity: pressed ? 1 : 1 }, // Remove opacity change on iOS
              ]}
            />
          )
        },
        tabBarPosition: 'bottom',
        tabBarItemStyle: {
          height: 40,
          backgroundColor: 'transparent',
        },

        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            top: 0,
            height: 30,
            shadowColor: 'white',
            shadowOpacity: 0,
            paddingTop: 20,
          },
          android: {
            position: 'absolute',
            top: 0,
            height: 50,
            shadowColor: 'white',
            shadowOpacity: 0,
            paddingTop: 20,
            elevation: 0,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('New Orders'),
        }}
      />
      <Tabs.Screen
        name="processing"
        options={{
          title: t('Processing'),
        }}
      />
      <Tabs.Screen
        name="delivered"
        options={{
          title: t('Delivered'),
        }}
      />
    </Tabs>
  )
}
