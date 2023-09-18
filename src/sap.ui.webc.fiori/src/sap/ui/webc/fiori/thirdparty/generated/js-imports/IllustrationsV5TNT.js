sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations"], function (_exports, _Illustrations) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.loadIllustration = void 0;
  const loadIllustration = async illustrationName => {
    const collectionAndPrefix = "V5/Tnt";
    const cleanIllustrationName = illustrationName.startsWith(collectionAndPrefix) ? illustrationName.replace(collectionAndPrefix, "") : illustrationName;
    switch (cleanIllustrationName) {
      case "ChartArea":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/ChartArea"))).default;
      case "ChartArea2":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/ChartArea2"))).default;
      case "ChartBPMNFlow":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/ChartBPMNFlow"))).default;
      case "ChartBar":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/ChartBar"))).default;
      case "ChartBullet":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/ChartBullet"))).default;
      case "ChartDoughnut":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/ChartDoughnut"))).default;
      case "ChartFlow":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/ChartFlow"))).default;
      case "ChartGantt":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/ChartGantt"))).default;
      case "ChartOrg":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/ChartOrg"))).default;
      case "ChartPie":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/ChartPie"))).default;
      case "CodePlaceholder":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/CodePlaceholder"))).default;
      case "Company":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/Company"))).default;
      case "Components":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/Components"))).default;
      case "EmptyContentPane":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/EmptyContentPane"))).default;
      case "ExternalLink":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/ExternalLink"))).default;
      case "FaceID":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/FaceID"))).default;
      case "Fingerprint":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/Fingerprint"))).default;
      case "Lock":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/Lock"))).default;
      case "Mission":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/Mission"))).default;
      case "NoApplications":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/NoApplications"))).default;
      case "NoFlows":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/NoFlows"))).default;
      case "NoUsers":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/NoUsers"))).default;
      case "Radar":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/Radar"))).default;
      case "Secrets":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/Secrets"))).default;
      case "Services":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/Services"))).default;
      case "SessionExpired":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/SessionExpired"))).default;
      case "SessionExpiring":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/SessionExpiring"))).default;
      case "Success":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/Success"))).default;
      case "SuccessfulAuth":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/SuccessfulAuth"))).default;
      case "Systems":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/Systems"))).default;
      case "Teams":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/Teams"))).default;
      case "Tools":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/Tools"))).default;
      case "UnSuccessfulAuth":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/UnSuccessfulAuth"))).default;
      case "Unlock":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/Unlock"))).default;
      default:
        throw new Error("[Illustrations] Illustration not found: " + illustrationName);
    }
  };
  _exports.loadIllustration = loadIllustration;
  const loadAndCheck = async illustrationName => {
    const data = await loadIllustration(illustrationName);
    return data;
  };
  ["ChartArea", "ChartArea2", "ChartBPMNFlow", "ChartBar", "ChartBullet", "ChartDoughnut", "ChartFlow", "ChartGantt", "ChartOrg", "ChartPie", "CodePlaceholder", "Company", "Components", "EmptyContentPane", "ExternalLink", "FaceID", "Fingerprint", "Lock", "Mission", "NoApplications", "NoFlows", "NoUsers", "Radar", "Secrets", "Services", "SessionExpired", "SessionExpiring", "Success", "SuccessfulAuth", "Systems", "Teams", "Tools", "UnSuccessfulAuth", "Unlock"].forEach(illustrationName => (0, _Illustrations.registerIllustrationLoader)(`V5/Tnt${illustrationName}`, loadAndCheck));
});