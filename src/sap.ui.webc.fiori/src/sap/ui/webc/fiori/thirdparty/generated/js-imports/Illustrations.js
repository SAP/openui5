sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations"], function (_exports, _Illustrations) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.loadIllustration = void 0;
  const loadIllustration = async illustrationName => {
    const collectionAndPrefix = "V4/";
    const cleanIllustrationName = illustrationName.startsWith(collectionAndPrefix) ? illustrationName.replace(collectionAndPrefix, "") : illustrationName;
    switch (cleanIllustrationName) {
      case "AddColumn":
        return (await Promise.resolve().then(() => require("../../illustrations/AddColumn"))).default;
      case "AddDimensions":
        return (await Promise.resolve().then(() => require("../../illustrations/AddDimensions"))).default;
      case "AddPeople":
        return (await Promise.resolve().then(() => require("../../illustrations/AddPeople"))).default;
      case "BalloonSky":
        return (await Promise.resolve().then(() => require("../../illustrations/BalloonSky"))).default;
      case "BeforeSearch":
        return (await Promise.resolve().then(() => require("../../illustrations/BeforeSearch"))).default;
      case "Connection":
        return (await Promise.resolve().then(() => require("../../illustrations/Connection"))).default;
      case "EmptyCalendar":
        return (await Promise.resolve().then(() => require("../../illustrations/EmptyCalendar"))).default;
      case "EmptyList":
        return (await Promise.resolve().then(() => require("../../illustrations/EmptyList"))).default;
      case "EmptyPlanningCalendar":
        return (await Promise.resolve().then(() => require("../../illustrations/EmptyPlanningCalendar"))).default;
      case "ErrorScreen":
        return (await Promise.resolve().then(() => require("../../illustrations/ErrorScreen"))).default;
      case "FilterTable":
        return (await Promise.resolve().then(() => require("../../illustrations/FilterTable"))).default;
      case "GroupTable":
        return (await Promise.resolve().then(() => require("../../illustrations/GroupTable"))).default;
      case "NoActivities":
        return (await Promise.resolve().then(() => require("../../illustrations/NoActivities"))).default;
      case "NoColumnsSet":
        return (await Promise.resolve().then(() => require("../../illustrations/NoColumnsSet"))).default;
      case "NoData":
        return (await Promise.resolve().then(() => require("../../illustrations/NoData"))).default;
      case "NoDimensionsSet":
        return (await Promise.resolve().then(() => require("../../illustrations/NoDimensionsSet"))).default;
      case "NoEntries":
        return (await Promise.resolve().then(() => require("../../illustrations/NoEntries"))).default;
      case "NoFilterResults":
        return (await Promise.resolve().then(() => require("../../illustrations/NoFilterResults"))).default;
      case "NoMail":
        return (await Promise.resolve().then(() => require("../../illustrations/NoMail"))).default;
      case "NoMail_v1":
        return (await Promise.resolve().then(() => require("../../illustrations/NoMail_v1"))).default;
      case "NoNotifications":
        return (await Promise.resolve().then(() => require("../../illustrations/NoNotifications"))).default;
      case "NoSavedItems":
        return (await Promise.resolve().then(() => require("../../illustrations/NoSavedItems"))).default;
      case "NoSavedItems_v1":
        return (await Promise.resolve().then(() => require("../../illustrations/NoSavedItems_v1"))).default;
      case "NoSearchResults":
        return (await Promise.resolve().then(() => require("../../illustrations/NoSearchResults"))).default;
      case "NoTasks":
        return (await Promise.resolve().then(() => require("../../illustrations/NoTasks"))).default;
      case "NoTasks_v1":
        return (await Promise.resolve().then(() => require("../../illustrations/NoTasks_v1"))).default;
      case "PageNotFound":
        return (await Promise.resolve().then(() => require("../../illustrations/PageNotFound"))).default;
      case "ReloadScreen":
        return (await Promise.resolve().then(() => require("../../illustrations/ReloadScreen"))).default;
      case "ResizeColumn":
        return (await Promise.resolve().then(() => require("../../illustrations/ResizeColumn"))).default;
      case "SearchEarth":
        return (await Promise.resolve().then(() => require("../../illustrations/SearchEarth"))).default;
      case "SearchFolder":
        return (await Promise.resolve().then(() => require("../../illustrations/SearchFolder"))).default;
      case "SimpleBalloon":
        return (await Promise.resolve().then(() => require("../../illustrations/SimpleBalloon"))).default;
      case "SimpleBell":
        return (await Promise.resolve().then(() => require("../../illustrations/SimpleBell"))).default;
      case "SimpleCalendar":
        return (await Promise.resolve().then(() => require("../../illustrations/SimpleCalendar"))).default;
      case "SimpleCheckMark":
        return (await Promise.resolve().then(() => require("../../illustrations/SimpleCheckMark"))).default;
      case "SimpleConnection":
        return (await Promise.resolve().then(() => require("../../illustrations/SimpleConnection"))).default;
      case "SimpleEmptyDoc":
        return (await Promise.resolve().then(() => require("../../illustrations/SimpleEmptyDoc"))).default;
      case "SimpleEmptyList":
        return (await Promise.resolve().then(() => require("../../illustrations/SimpleEmptyList"))).default;
      case "SimpleError":
        return (await Promise.resolve().then(() => require("../../illustrations/SimpleError"))).default;
      case "SimpleMagnifier":
        return (await Promise.resolve().then(() => require("../../illustrations/SimpleMagnifier"))).default;
      case "SimpleMail":
        return (await Promise.resolve().then(() => require("../../illustrations/SimpleMail"))).default;
      case "SimpleNoSavedItems":
        return (await Promise.resolve().then(() => require("../../illustrations/SimpleNoSavedItems"))).default;
      case "SimpleNotFoundMagnifier":
        return (await Promise.resolve().then(() => require("../../illustrations/SimpleNotFoundMagnifier"))).default;
      case "SimpleReload":
        return (await Promise.resolve().then(() => require("../../illustrations/SimpleReload"))).default;
      case "SimpleTask":
        return (await Promise.resolve().then(() => require("../../illustrations/SimpleTask"))).default;
      case "SleepingBell":
        return (await Promise.resolve().then(() => require("../../illustrations/SleepingBell"))).default;
      case "SortColumn":
        return (await Promise.resolve().then(() => require("../../illustrations/SortColumn"))).default;
      case "SuccessBalloon":
        return (await Promise.resolve().then(() => require("../../illustrations/SuccessBalloon"))).default;
      case "SuccessCheckMark":
        return (await Promise.resolve().then(() => require("../../illustrations/SuccessCheckMark"))).default;
      case "SuccessHighFive":
        return (await Promise.resolve().then(() => require("../../illustrations/SuccessHighFive"))).default;
      case "SuccessScreen":
        return (await Promise.resolve().then(() => require("../../illustrations/SuccessScreen"))).default;
      case "Survey":
        return (await Promise.resolve().then(() => require("../../illustrations/Survey"))).default;
      case "Tent":
        return (await Promise.resolve().then(() => require("../../illustrations/Tent"))).default;
      case "UnableToLoad":
        return (await Promise.resolve().then(() => require("../../illustrations/UnableToLoad"))).default;
      case "UnableToLoadImage":
        return (await Promise.resolve().then(() => require("../../illustrations/UnableToLoadImage"))).default;
      case "UnableToUpload":
        return (await Promise.resolve().then(() => require("../../illustrations/UnableToUpload"))).default;
      case "UploadCollection":
        return (await Promise.resolve().then(() => require("../../illustrations/UploadCollection"))).default;
      case "UploadToCloud":
        return (await Promise.resolve().then(() => require("../../illustrations/UploadToCloud"))).default;
      default:
        throw new Error("[Illustrations] Illustration not found: " + illustrationName);
    }
  };
  _exports.loadIllustration = loadIllustration;
  const loadAndCheck = async illustrationName => {
    const data = await loadIllustration(illustrationName);
    return data;
  };
  ["AddColumn", "AddDimensions", "AddPeople", "BalloonSky", "BeforeSearch", "Connection", "EmptyCalendar", "EmptyList", "EmptyPlanningCalendar", "ErrorScreen", "FilterTable", "GroupTable", "NoActivities", "NoColumnsSet", "NoData", "NoDimensionsSet", "NoEntries", "NoFilterResults", "NoMail", "NoMail_v1", "NoNotifications", "NoSavedItems", "NoSavedItems_v1", "NoSearchResults", "NoTasks", "NoTasks_v1", "PageNotFound", "ReloadScreen", "ResizeColumn", "SearchEarth", "SearchFolder", "SimpleBalloon", "SimpleBell", "SimpleCalendar", "SimpleCheckMark", "SimpleConnection", "SimpleEmptyDoc", "SimpleEmptyList", "SimpleError", "SimpleMagnifier", "SimpleMail", "SimpleNoSavedItems", "SimpleNotFoundMagnifier", "SimpleReload", "SimpleTask", "SleepingBell", "SortColumn", "SuccessBalloon", "SuccessCheckMark", "SuccessHighFive", "SuccessScreen", "Survey", "Tent", "UnableToLoad", "UnableToLoadImage", "UnableToUpload", "UploadCollection", "UploadToCloud"].forEach(illustrationName => (0, _Illustrations.registerIllustrationLoader)(`V4/${illustrationName}`, loadAndCheck));
});