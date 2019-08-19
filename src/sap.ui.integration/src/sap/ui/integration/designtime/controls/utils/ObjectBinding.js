/*!
 * ${copyright}
 */
sap.ui.define([
    "sap/ui/base/ManagedObject",
    "sap/ui/base/BindingParser"
], function (
    ManagedObject,
    BindingParser
) {
    "use strict";

    /**
     * @private
     * @experimental
     */

    return ManagedObject.extend("sap.ui.integration.designtime.controls.utils.ObjectBinding", {
        constructor: function (oObject, oModel, sModelName) {
            this._aBindings = [];

            var updateObject = function(oContext, sPath, oPropertyBinding) {
                oContext[sPath] = oPropertyBinding.getValue();
                oModel.checkUpdate();
            };

            var createPropertyBindings = function(oObject) {
                Object.keys(oObject).forEach(function(sKey) {
                    if (typeof oObject[sKey] === "string") {
                        var oBindingInfo = BindingParser.simpleParser(oObject[sKey]);
                        if (oBindingInfo && oBindingInfo.model === sModelName) {
                            var oBinding = oModel.bindProperty(oBindingInfo.path);
                            updateObject(oObject, sKey, oBinding);
                            oBinding.attachChange(function(oEvent) {
                                updateObject(oObject, sKey, oBinding);
                            });
                            this._aBindings.push(oBinding);
                        }
                    } else if (oObject[sKey] && typeof oObject[sKey] === "object") {
                        createPropertyBindings(oObject[sKey]);
                    }
                }.bind(this));
            }.bind(this);

            createPropertyBindings(oObject);
        },
        exit: function() {
            this._aBindings.forEach(function(oBinding) {
                oBinding.destroy();
            });
        }
    });
});
