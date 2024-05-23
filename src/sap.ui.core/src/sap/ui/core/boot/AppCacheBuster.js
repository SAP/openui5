/*!
 * ${copyright}
 */

/**
 * Initialize AppCacheBuster
 *
 * @private
 * @ui5-restricted sap.ui.core
 */
sap.ui.define([
	"sap/base/config",
    "sap/base/util/Deferred"
], (
	config,
    Deferred
) => {
	"use strict";

    let pLoaded = Promise.resolve();

    const aACBConfig = config.get({
        name: "sapUiAppCacheBuster",
        type: config.Type.StringArray,
        external: true,
        freeze: true
    });

    if (aACBConfig && aACBConfig.length > 0) {
        pLoaded = new Promise((resolve, reject) => {
            sap.ui.require(["sap/ui/core/AppCacheBuster"], (AppCacheBuster) => {
                const pBoot = new Deferred();
                AppCacheBuster.boot(aACBConfig, pBoot);
                pBoot.promise.then(resolve);
            }, reject);
        });
    }

    return {
        run: () => {
            return pLoaded;
        }
    };
});