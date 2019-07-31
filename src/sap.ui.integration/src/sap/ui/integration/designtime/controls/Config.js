/*!
 * ${copyright}
 */

sap.ui.define([
    'sap/ui/base/ManagedObject',
    './DefaultConfig',
    'sap/base/util/merge'
], function (ManagedObject, oDefaultConfig, merge) {
    "use strict";

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
                    defaultValue: oDefaultConfig
                }
            }
        }
    });

    Config.prototype.getDefaultData = function () {
        return oDefaultConfig;
    };

    Config.prototype.setData = function (oData) {
        this.setProperty("data", merge({}, this.getDefaultData(), oData || {}));

        return this;
    };

    return Config;
}, /* bExport= */ true);