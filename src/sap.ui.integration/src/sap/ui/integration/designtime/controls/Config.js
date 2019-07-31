/*!
 * ${copyright}
 */

sap.ui.define([
    'sap/ui/base/ManagedObject',
    './DefaultConfig',
    'sap/base/util/merge'
], function (ManagedObject, oDefaultConfig, merge) {
    "use strict";

    var prepareConfig = function (oConfig) {
        if (!oConfig.i18n) {
            oConfig.i18n = [];
        } else if (!Array.isArray(oConfig.i18n)) {
            oConfig.i18n = [oConfig.i18n];
        }
    };

    /**
     * @constructor
     * @private
     * @experimental
     */

    var Config = ManagedObject.extend("sap.ui.integration.designtime.controls.Config", /** @lends sap.ui.integration.designtime.Config.prototype */ {
        metadata: {
            properties: {
                data: {
                    type: "any",
                    defaultValue: prepareConfig(oDefaultConfig)
                }
            }
        }
    });

    Config.prototype.getDefaultData = function () {
        return oDefaultConfig;
    };

    Config.prototype.setData = function (oData) {
        this.setProperty("data", merge({}, this.getDefaultData(), prepareConfig(oData || {})));

        return this;
    };

    return Config;
}, /* bExport= */ true);