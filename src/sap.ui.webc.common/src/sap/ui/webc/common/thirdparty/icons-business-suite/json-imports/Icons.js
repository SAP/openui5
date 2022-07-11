sap.ui.define(['require', "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (require, _Icons) {
  "use strict";

  const loadIconsBundle = async () => {
    const iconData = (await Promise.resolve().then(() => new Promise(resolve => require(["../generated/assets/SAP-icons-business-suite.json"], resolve)))).default;

    if (typeof iconData === "string" && iconData.endsWith(".json")) {
      throw new Error("[icons-business-suite] Invalid bundling detected - dynamic JSON imports bundled as URLs. Switch to inlining JSON files from the build or use `import \"@ui5/webcomponents-icons-business-suite/dist/Assets-static.js\". Check the \"Assets\" documentation for more information.");
    }

    return iconData;
  };

  (0, _Icons.registerIconLoader)("business-suite", loadIconsBundle);
});