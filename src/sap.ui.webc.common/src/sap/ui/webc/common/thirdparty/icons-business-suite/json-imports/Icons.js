sap.ui.define(['require', "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (require, _Icons) {
  "use strict";

  const loadIconsBundle = async collection => {
    let iconData;
    if (collection === "business-suite-v1") {
      iconData = (await Promise.resolve().then(() => new Promise(resolve => require(["../generated/assets/v1/SAP-icons-business-suite.json"], resolve)))).default;
    } else {
      iconData = (await Promise.resolve().then(() => new Promise(resolve => require(["../generated/assets/v2/SAP-icons-business-suite.json"], resolve)))).default;
    }
    if (typeof iconData === "string" && iconData.endsWith(".json")) {
      throw new Error("[icons-business-suite] Invalid bundling detected - dynamic JSON imports bundled as URLs. Switch to inlining JSON files from the build or use `import \"@ui5/webcomponents-icons-business-suite/dist/Assets-static.js\". Check the \"Assets\" documentation for more information.");
    }
    return iconData;
  };
  const registerLoaders = () => {
    (0, _Icons.registerIconLoader)("business-suite-v1", loadIconsBundle);
    (0, _Icons.registerIconLoader)("business-suite-v2", loadIconsBundle);
  };
  registerLoaders();
});