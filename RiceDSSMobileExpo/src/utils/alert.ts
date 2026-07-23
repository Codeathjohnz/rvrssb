import { Alert as RNAlert, Platform } from "react-native";


type Button = {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
};


// React Native's Alert.alert() is a silent no-op on web (react-native-web
// doesn't implement it) — buttons that call it appear completely
// unresponsive in a browser. This wrapper falls back to window.alert /
// window.confirm on web so every message and confirmation actually shows.
export function alert(title: string, message?: string, buttons?: Button[]) {

  if (Platform.OS !== "web") {

    RNAlert.alert(title, message, buttons);
    return;

  }

  const text = [title, message].filter(Boolean).join("\n\n");

  if (buttons && buttons.length > 1) {

    const cancelButton = buttons.find((b) => b.style === "cancel");
    const confirmButton = buttons.find((b) => b !== cancelButton) || buttons[buttons.length - 1];

    if (window.confirm(text)) {
      confirmButton?.onPress?.();
    } else {
      cancelButton?.onPress?.();
    }

    return;

  }

  window.alert(text);

  buttons?.[0]?.onPress?.();

}
