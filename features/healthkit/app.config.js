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
      supportsTablet: true
    },
    android: {
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
      ],
      [
        "@kingstinct/react-native-healthkit",
        {
          "NSHealthShareUsageDescription": "This app needs access to your health data to display your health metrics and track your progress.",
          "NSHealthUpdateUsageDescription": "This app needs permission to save health data to track your activities."
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
  }
};
