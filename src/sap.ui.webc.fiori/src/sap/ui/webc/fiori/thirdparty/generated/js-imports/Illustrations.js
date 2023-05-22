sap.ui.define(["sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations"], function (_Illustrations) {
  "use strict";

  const loadIllustration = async illustrationName => {
    switch (illustrationName) {
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
      case "TntChartArea":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/ChartArea"))).default;
      case "TntChartArea2":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/ChartArea2"))).default;
      case "TntChartBPMNFlow":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/ChartBPMNFlow"))).default;
      case "TntChartBar":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/ChartBar"))).default;
      case "TntChartBullet":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/ChartBullet"))).default;
      case "TntChartDoughnut":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/ChartDoughnut"))).default;
      case "TntChartFlow":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/ChartFlow"))).default;
      case "TntChartGantt":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/ChartGantt"))).default;
      case "TntChartOrg":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/ChartOrg"))).default;
      case "TntChartPie":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/ChartPie"))).default;
      case "TntCodePlaceholder":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/CodePlaceholder"))).default;
      case "TntCompany":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/Company"))).default;
      case "TntComponents":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/Components"))).default;
      case "TntExternalLink":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/ExternalLink"))).default;
      case "TntFaceID":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/FaceID"))).default;
      case "TntFingerprint":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/Fingerprint"))).default;
      case "TntLock":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/Lock"))).default;
      case "TntMission":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/Mission"))).default;
      case "TntNoApplications":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/NoApplications"))).default;
      case "TntNoFlows":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/NoFlows"))).default;
      case "TntNoUsers":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/NoUsers"))).default;
      case "TntRadar":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/Radar"))).default;
      case "TntSecrets":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/Secrets"))).default;
      case "TntServices":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/Services"))).default;
      case "TntSessionExpired":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/SessionExpired"))).default;
      case "TntSessionExpiring":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/SessionExpiring"))).default;
      case "TntSuccess":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/Success"))).default;
      case "TntSuccessfulAuth":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/SuccessfulAuth"))).default;
      case "TntSystems":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/Systems"))).default;
      case "TntTeams":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/Teams"))).default;
      case "TntTools":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/Tools"))).default;
      case "TntUnableToLoad":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/UnableToLoad"))).default;
      case "TntUnlock":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/Unlock"))).default;
      case "TntUnsuccessfulAuth":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/UnsuccessfulAuth"))).default;
      case "TntUser2":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/User2"))).default;
      default:
        throw new Error("[Illustrations] Illustration not found: " + illustrationName);
    }
  };
  const loadAndCheck = async illustrationName => {
    const data = await loadIllustration(illustrationName);
    return data;
  };
  ["AddColumn", "AddDimensions", "AddPeople", "BalloonSky", "BeforeSearch", "Connection", "EmptyCalendar", "EmptyList", "EmptyPlanningCalendar", "ErrorScreen", "FilterTable", "GroupTable", "NoActivities", "NoColumnsSet", "NoData", "NoDimensionsSet", "NoEntries", "NoFilterResults", "NoMail", "NoMail_v1", "NoNotifications", "NoSavedItems", "NoSavedItems_v1", "NoSearchResults", "NoTasks", "NoTasks_v1", "PageNotFound", "ReloadScreen", "ResizeColumn", "SearchEarth", "SearchFolder", "SimpleBalloon", "SimpleBell", "SimpleCalendar", "SimpleCheckMark", "SimpleConnection", "SimpleEmptyDoc", "SimpleEmptyList", "SimpleError", "SimpleMagnifier", "SimpleMail", "SimpleNoSavedItems", "SimpleNotFoundMagnifier", "SimpleReload", "SimpleTask", "SleepingBell", "SortColumn", "SuccessBalloon", "SuccessCheckMark", "SuccessHighFive", "SuccessScreen", "Survey", "Tent", "UnableToLoad", "UnableToLoadImage", "UnableToUpload", "UploadCollection", "UploadToCloud"].forEach(illustrationName => (0, _Illustrations.registerIllustrationLoader)(illustrationName, loadAndCheck));
  ["TntChartArea", "TntChartArea2", "TntChartBPMNFlow", "TntChartBar", "TntChartBullet", "TntChartDoughnut", "TntChartFlow", "TntChartGantt", "TntChartOrg", "TntChartPie", "TntCodePlaceholder", "TntCompany", "TntComponents", "TntExternalLink", "TntFaceID", "TntFingerprint", "TntLock", "TntMission", "TntNoApplications", "TntNoFlows", "TntNoUsers", "TntRadar", "TntSecrets", "TntServices", "TntSessionExpired", "TntSessionExpiring", "TntSuccess", "TntSuccessfulAuth", "TntSystems", "TntTeams", "TntTools", "TntUnableToLoad", "TntUnlock", "TntUnsuccessfulAuth", "TntUser2"].forEach(illustrationName => (0, _Illustrations.registerIllustrationLoader)(illustrationName, loadAndCheck));
});