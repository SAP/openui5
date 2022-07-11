sap.ui.define(['require', "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (require, _Icons) {
  "use strict";

  const loadIconsBundle = async () => {
    const iconData = (await Promise.resolve().then(() => new Promise(resolve => require(["../generated/assets/SAP-icons-TNT.json"], resolve)))).default;

    if (typeof iconData === "string" && iconData.endsWith(".json")) {
      throw new Error("[icons-tnt] Invalid bundling detected - dynamic JSON imports bundled as URLs. Switch to inlining JSON files from the build or use `import \"@ui5/webcomponents-icons-tnt/dist/Assets-static.js\". Check the \"Assets\" documentation for more information.");
    }

    return iconData;
  };

  (0, _Icons.registerIconLoader)("tnt", loadIconsBundle);
});