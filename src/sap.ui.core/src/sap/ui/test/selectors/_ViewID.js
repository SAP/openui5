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
            var oView = this._getControlView(oControl);
            var mResult;

            if (oView) {
                var sViewId = oView.getId();
                var sViewName = oView.getViewName();
                var sViewRelativeId;
                var sValueWithSeparator = sViewId + "--";
                var iIndex = sControlId.indexOf(sValueWithSeparator);

                if (iIndex > -1) {
                    sViewRelativeId = sControlId.substring(iIndex + sValueWithSeparator.length);

                    if (sViewRelativeId.indexOf("-") === -1 && !sViewRelativeId.match(/[0-9]$/)) {
                        this._oLogger.debug("Control with ID " + sControlId + " has view-relative ID " + sViewRelativeId);

                        mResult = {
                            id: sViewRelativeId,
                            skipBasic: true
                        };

                        if (ManagedObjectMetadata.isGeneratedId(sViewId)) {
                            this._oLogger.debug("Control " + oControl + " has view with viewName " + sViewName);
                            mResult.viewName = sViewName;
                        } else {
                            this._oLogger.debug("Control " + oControl + " has view with stable ID " + sViewId);
                            mResult.viewId = sViewId;
                        }
                    }
                }
            } else {
                this._oLogger.debug("Control " + oControl + " does not belong to a view");
            }

            return mResult;
        }
    });

    return _ViewID;
});
