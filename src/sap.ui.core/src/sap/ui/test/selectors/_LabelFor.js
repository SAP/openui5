/*!
 * ${copyright}
 */

sap.ui.define([
    "sap/ui/test/selectors/_Selector",
    "sap/ui/core/LabelEnablement"
], function (_Selector, LabelEnablement) {
	"use strict";

    /**
     * Selector generator for controls with associated label
     * @class Control selector generator: LabelFor
     * @extends sap.ui.test.selectors._Selector
     * @alias sap.ui.test.selectors._LabelFor
     * @private
     */
    var _LabelFor = _Selector.extend("sap.ui.test.selectors._LabelFor", {

        /**
         * Generates control selector with label text, if there is a label associated with the control
         * @param {object} oControl the control for which to generate a selector
         * @returns {object} a plain object representation of a control. Contains the text of the 'first' associated label.
         * Undefined, if there are no associated labels for the control
         * @private
         */
        _generate: function (oControl) {
            var aLabelId = LabelEnablement.getReferencingLabels(oControl);
            if (aLabelId.length) {
                // TODO: return selector for each label
                var oLabel = sap.ui.getCore().byId(aLabelId[0]);
                this._oLogger.debug("Control " + oControl + " has an associated label with ID " + aLabelId[0]);

                return {
                    labelFor: {
                        text: oLabel.getText()
                    }
                };
            } else {
                this._oLogger.debug("Control " + oControl + " has no associated labels");
            }
        }
    });

    return _LabelFor;
});
