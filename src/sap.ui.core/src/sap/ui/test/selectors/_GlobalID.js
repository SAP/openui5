/*!
 * ${copyright}
 */

sap.ui.define([
    "sap/ui/test/selectors/_Selector",
    "sap/ui/base/ManagedObjectMetadata"
], function (_Selector, ManagedObjectMetadata) {
	"use strict";

    /**
     * Selector generator for controls with non-generated global ID
     * @class Control selector generator: globalID
     * @extends sap.ui.test.selectors._Selector
     * @alias sap.ui.test.selectors._GlobalID
     * @private
     */
	var _GlobalID = _Selector.extend("sap.ui.test.selectors._GlobalID", {

         /**
         * @param {object} oControl the control for which to generate a selector
         * @returns {object} a plain object representation of a control. Contains unique global ID.
         * Undefined, if the selector cannot be constructed
         * @private
         */
        _generate: function (oControl) {
            var sControlId = oControl.getId();

            if (ManagedObjectMetadata.isGeneratedId(sControlId)) {
                this._oLogger.debug("Control ID " + sControlId + " is generated");
            } else {
                this._oLogger.debug("Control ID " + sControlId + " is not generated");
                return {
                    id: sControlId,
                    skipBasic: true
                };
            }
        }
    });

    return _GlobalID;
});
