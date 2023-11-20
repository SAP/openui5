sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations"], function (_exports, _Illustrations) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.loadIllustration = void 0;
  const loadIllustration = async illustrationName => {
    const collectionAndPrefix = "V5/HC/Tnt";
    const cleanIllustrationName = illustrationName.startsWith(collectionAndPrefix) ? illustrationName.replace(collectionAndPrefix, "") : illustrationName;
    switch (cleanIllustrationName) {
      case "ChartArea":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/ChartArea"))).default;
      case "ChartArea2":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/ChartArea2"))).default;
      case "ChartBPMNFlow":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/ChartBPMNFlow"))).default;
      case "ChartBar":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/ChartBar"))).default;
      case "ChartBullet":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/ChartBullet"))).default;
      case "ChartDoughnut":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/ChartDoughnut"))).default;
      case "ChartFlow":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/ChartFlow"))).default;
      case "ChartGantt":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/ChartGantt"))).default;
      case "ChartOrg":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/ChartOrg"))).default;
      case "ChartPie":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/ChartPie"))).default;
      case "CodePlaceholder":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/CodePlaceholder"))).default;
      case "Company":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/Company"))).default;
      case "Components":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/Components"))).default;
      case "EmptyContentPane":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/EmptyContentPane"))).default;
      case "ExternalLink":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/ExternalLink"))).default;
      case "FaceID":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/FaceID"))).default;
      case "Fingerprint":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/Fingerprint"))).default;
      case "Lock":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/Lock"))).default;
      case "Mission":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/Mission"))).default;
      case "NoApplications":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/NoApplications"))).default;
      case "NoFlows":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/NoFlows"))).default;
      case "NoUsers":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/NoUsers"))).default;
      case "Radar":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/Radar"))).default;
      case "Secrets":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/Secrets"))).default;
      case "Services":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/Services"))).default;
      case "SessionExpired":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/SessionExpired"))).default;
      case "SessionExpiring":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/SessionExpiring"))).default;
      case "Success":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/Success"))).default;
      case "SuccessfulAuth":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/SuccessfulAuth"))).default;
      case "Systems":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/Systems"))).default;
      case "Teams":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/Teams"))).default;
      case "Tools":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/Tools"))).default;
      case "UnSuccessfulAuth":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/UnSuccessfulAuth"))).default;
      case "Unlock":
        return (await Promise.resolve().then(() => require("../../illustrations-v5/tnt/hc/Unlock"))).default;
      default:
        throw new Error("[Illustrations] Illustration not found: " + illustrationName);
    }
  };
  _exports.loadIllustration = loadIllustration;
  const loadAndCheck = async illustrationName => {
    const data = await loadIllustration(illustrationName);
    return data;
  };
  ["ChartArea", "ChartArea2", "ChartBPMNFlow", "ChartBar", "ChartBullet", "ChartDoughnut", "ChartFlow", "ChartGantt", "ChartOrg", "ChartPie", "CodePlaceholder", "Company", "Components", "EmptyContentPane", "ExternalLink", "FaceID", "Fingerprint", "Lock", "Mission", "NoApplications", "NoFlows", "NoUsers", "Radar", "Secrets", "Services", "SessionExpired", "SessionExpiring", "Success", "SuccessfulAuth", "Systems", "Teams", "Tools", "UnSuccessfulAuth", "Unlock"].forEach(illustrationName => (0, _Illustrations.registerIllustrationLoader)(`V5/HC/Tnt${illustrationName}`, loadAndCheck));
});