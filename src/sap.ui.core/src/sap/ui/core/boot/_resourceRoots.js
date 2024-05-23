/*!
 * ${copyright}
 */

/**
 * Helper for evaluating and registering resourceRoots
 * To load a splash screen as well as a boot manifest eraly
 * resource roots must be registered at twice:
 *  - before boot starts (global config only) to load boot.json and splash.
 *  - After config phase to ensure all providers are registered before starting to boot.
 *
 * @private
 * @ui5-restricted sap.ui.core
 */
sap.ui.define([
	"sap/base/config"
], (
	config
) => {
	"use strict";

    return {
        register: () => {
            const mPaths = {};

            function ui5ToRJS(sName) {
                if ( /^jquery\.sap\./.test(sName) ) {
                    return sName;
                }
                return sName.replace(/\./g, "/");
            }

            let sInitModule = config.get({
                name: "sapUiOnInit",
                type: config.Type.String
            });

            const mResourceRoots = config.get({
                name: "sapUiResourceRoots",
                type: config.Type.MergedObject
            });

            if (mResourceRoots) {
                for (const n in mResourceRoots) {
                    mPaths[ui5ToRJS(n)] = mResourceRoots[n] || ".";
                }
            }

            // resource path from onInit
            if (sInitModule) {
                const aParts = sInitModule.split("@");
                const rModule = /^.*[\/\\]/;
                let sModulePath;
                if (aParts.length > 1) {
                    sInitModule = aParts[0];
                    const aResult = /^module\:((?:[_$.\-a-zA-Z0-9]+\/)*[_$.\-a-zA-Z0-9]+)$/.exec(sInitModule);
                    if (aResult && aResult[1]) {
                        sModulePath = rModule.exec(aResult[1])[0];
                    } else {
                        sModulePath = rModule.exec(aParts[0])[0];
                    }
                    sModulePath = sModulePath.substr(0, sModulePath.length - 1);
                    mPaths[sModulePath] = aParts[1];
                }
            }

            // register path mappings
            sap.ui.loader.config({
                paths: mPaths
            });

            return mResourceRoots;
        }
    };
});