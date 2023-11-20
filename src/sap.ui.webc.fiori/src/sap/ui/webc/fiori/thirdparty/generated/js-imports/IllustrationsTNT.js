sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations"], function (_exports, _Illustrations) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.loadIllustration = void 0;
  const loadIllustration = async illustrationName => {
    const collectionAndPrefix = "V4/Tnt";
    const cleanIllustrationName = illustrationName.startsWith(collectionAndPrefix) ? illustrationName.replace(collectionAndPrefix, "") : illustrationName;
    switch (cleanIllustrationName) {
      case "ChartArea":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/ChartArea"))).default;
      case "ChartArea2":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/ChartArea2"))).default;
      case "ChartBPMNFlow":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/ChartBPMNFlow"))).default;
      case "ChartBar":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/ChartBar"))).default;
      case "ChartBullet":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/ChartBullet"))).default;
      case "ChartDoughnut":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/ChartDoughnut"))).default;
      case "ChartFlow":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/ChartFlow"))).default;
      case "ChartGantt":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/ChartGantt"))).default;
      case "ChartOrg":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/ChartOrg"))).default;
      case "ChartPie":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/ChartPie"))).default;
      case "CodePlaceholder":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/CodePlaceholder"))).default;
      case "Company":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/Company"))).default;
      case "Components":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/Components"))).default;
      case "ExternalLink":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/ExternalLink"))).default;
      case "FaceID":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/FaceID"))).default;
      case "Fingerprint":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/Fingerprint"))).default;
      case "Lock":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/Lock"))).default;
      case "Mission":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/Mission"))).default;
      case "NoApplications":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/NoApplications"))).default;
      case "NoFlows":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/NoFlows"))).default;
      case "NoUsers":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/NoUsers"))).default;
      case "Radar":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/Radar"))).default;
      case "Secrets":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/Secrets"))).default;
      case "Services":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/Services"))).default;
      case "SessionExpired":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/SessionExpired"))).default;
      case "SessionExpiring":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/SessionExpiring"))).default;
      case "Success":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/Success"))).default;
      case "SuccessfulAuth":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/SuccessfulAuth"))).default;
      case "Systems":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/Systems"))).default;
      case "Teams":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/Teams"))).default;
      case "Tools":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/Tools"))).default;
      case "UnableToLoad":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/UnableToLoad"))).default;
      case "Unlock":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/Unlock"))).default;
      case "UnsuccessfulAuth":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/UnsuccessfulAuth"))).default;
      case "User2":
        return (await Promise.resolve().then(() => require("../../illustrations/tnt/User2"))).default;
      default:
        throw new Error("[Illustrations] Illustration not found: " + illustrationName);
    }
  };
  _exports.loadIllustration = loadIllustration;
  const loadAndCheck = async illustrationName => {
    const data = await loadIllustration(illustrationName);
    return data;
  };
  ["ChartArea", "ChartArea2", "ChartBPMNFlow", "ChartBar", "ChartBullet", "ChartDoughnut", "ChartFlow", "ChartGantt", "ChartOrg", "ChartPie", "CodePlaceholder", "Company", "Components", "ExternalLink", "FaceID", "Fingerprint", "Lock", "Mission", "NoApplications", "NoFlows", "NoUsers", "Radar", "Secrets", "Services", "SessionExpired", "SessionExpiring", "Success", "SuccessfulAuth", "Systems", "Teams", "Tools", "UnableToLoad", "Unlock", "UnsuccessfulAuth", "User2"].forEach(illustrationName => (0, _Illustrations.registerIllustrationLoader)(`V4/Tnt${illustrationName}`, loadAndCheck));
});