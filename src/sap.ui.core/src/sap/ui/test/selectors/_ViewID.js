/*!
 * ${copyright}
 */

sap.ui.define([
    "sap/ui/test/selectors/_Selector",
    "sap/ui/base/ManagedObjectMetadata"
], function (_Selector, ManagedObjectMetadata) {
	"use strict";

     /**
     * Selector generator for controls with extractable viewName and non-generated relative ID
     * @class Control selector generator: ViewId
     * @extends sap.ui.test.selectors._Selector
     * @alias sap.ui.test.selectors._ViewID
     * @private
     */
	var _ViewID = _Selector.extend("sap.ui.test.selectors._ViewID", {

         /**
         * @param {object} oControl the control for which to generate a selector
         * @returns {object} a plain object representation of a control. Contains viewName and view relative ID.
         * If the selector cannot be constructed, undefined is returned.
         * @private
         */
        _generate: function (oControl) {
            var sControlId = oControl.getId();
            var sViewName = this._getControlViewName(oControl);

            if (!ManagedObjectMetadata.isGeneratedId(sControlId)) {
                var sViewNameWithSeparator = sViewName + "--";
                var iViewNameIndex = sControlId.indexOf(sViewNameWithSeparator);

                if (iViewNameIndex > -1) {
                    var sViewRelativeId = sControlId.substring(iViewNameIndex + sViewNameWithSeparator.length);

                    if (!sViewRelativeId.indexOf("-") > -1 && !sViewRelativeId.match(/[0-9]$/)) {
                        this._oLogger.debug("Control with ID " + sControlId + " belongs to view with viewName " + sViewName +
                        " and has relative ID " + sViewRelativeId);

                        return {
                            viewName: sViewName,
                            id: sViewRelativeId,
                            skipBasic: true
                        };
                    }
                } else {
                    this._oLogger.debug("Control " + oControl + " does not belong to a view");
                }
            }
        }
    });

    return _ViewID;
});
