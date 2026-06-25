import { CLIENT_CONFIG } from '../config/constants';

export const T = {
  en: {
    title: CLIENT_CONFIG.APP_NAME, // ⬅️ DYNAMIC NOW
    searchTarget: "Search Destination...",
    startRoute: "START ROUTE",
    endRoute: "END ROUTE",
    takeExit: "TAKE ME TO THE EXIT",
    editResidence: "EDIT RESIDENCE:",
    save: "SAVE",
    adminBanner: "ADMIN COMMAND CENTER ACTIVE",
    away: "m AWAY",
    speechExit: `Routing you to the ${CLIENT_CONFIG.SOCIETY_NAME} exit.` // ⬅️ DYNAMIC NOW
  },
  hi: {
    title: CLIENT_CONFIG.APP_NAME, // ⬅️ DYNAMIC NOW
    searchTarget: "मंजिल खोजें...",
    startRoute: "रास्ता शुरू करें",
    endRoute: "रास्ता समाप्त करें",
    takeExit: "मुझे बाहर ले चलो",
    editResidence: "निवास संपादित करें:",
    save: "सहेजें",
    adminBanner: "एडमिन कमांड सेंटर सक्रिय",
    away: "m दूर",
    speechExit: `आपको ${CLIENT_CONFIG.SOCIETY_NAME} के निकास की ओर ले जा रहा हूँ।` // ⬅️ DYNAMIC NOW
  }
};