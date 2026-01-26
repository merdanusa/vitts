import * as Notifications from "expo-notifications";
import { saveFcmToken } from "./api";

export const registerFcmToken = async () => {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    const res = await Notifications.requestPermissionsAsync();
    if (res.status !== "granted") {
      console.log("[FCM] Permission denied");
      return;
    }
  }

  const token = (await Notifications.getDevicePushTokenAsync()).data;
  console.log("[FCM] Device token:", token);

  await saveFcmToken(token);
};