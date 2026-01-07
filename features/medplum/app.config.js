require('dotenv').config();

module.exports = {
  expo: {
    name: "SpeziVibe",
    slug: "spezivibe-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "spezivibe-app",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.example.spezivibe"
    },
    android: {
      package: "com.example.spezivibe",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000"
          }
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      backendType: process.env.EXPO_PUBLIC_BACKEND_TYPE,
      medplum: {
        baseUrl: process.env.EXPO_PUBLIC_MEDPLUM_BASE_URL,
        clientId: process.env.EXPO_PUBLIC_MEDPLUM_CLIENT_ID,
        projectId: process.env.EXPO_PUBLIC_MEDPLUM_PROJECT_ID,
      },
    }
  }
};
