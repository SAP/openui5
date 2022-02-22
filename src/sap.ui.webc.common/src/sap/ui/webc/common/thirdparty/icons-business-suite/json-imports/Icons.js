sap.ui.define(['require', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (require, Icons) { 'use strict';

    const loadIconsBundle = async () => {
    	const iconData =  (await new Promise(function (resolve, reject) { require(['../_chunks/SAP-icons-business-suite'], resolve, reject) })).default;
        if (typeof iconData === "string" && iconData.endsWith(".json")) {
            throw new Error("[icons-business-suite] Invalid bundling detected - dynamic JSON imports bundled as URLs. Switch to inlining JSON files from the build or use `import \"@ui5/webcomponents-icons-business-suite/dist/Assets-static.js\". Check the \"Assets\" documentation for more information.");
        }
        return iconData;
    };
    Icons.registerIconLoader("business-suite", loadIconsBundle);

});
