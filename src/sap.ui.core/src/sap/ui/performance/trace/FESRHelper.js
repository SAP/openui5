/*!
 * ${copyright}
 */

sap.ui.define([], function () {
"use strict";

	/**
	 * FESRHelper API
	 * Provides helper functionality for FESR and consumers of FESR
	 *
	 * @namespace
	 * @since 1.100
	 * @alias module:sap/ui/performance/trace/FESRHelper
	 * @static
	 * @public
	 */
    var FESRHelper = {
        /**
         * This namespace is only used inside the FESRHelper.
         *
         * @const
         * @private
         */
        FESR_NAMESPACE: "http://schemas.sap.com/sapui5/extension/sap.ui.core.FESR/1",

        /**
         * Add semantic stepname for an event of a given element used for FESR.
         *
         * @param {sap.ui.core.Element} oElement The element the semantic stepname should be applied to
         * @param {string} sEventId The event ID the semantic stepname is valid for
         * @param {string} sStepname The semantic stepname
         *
         * @public
         * @since 1.100
         */
        setSemanticStepname: function (oElement, sEventId, sStepname) {
            var oCustomData = oElement.data("sap-ui-custom-settings");
            if (oCustomData === null) {
                oCustomData = {};
            }
            if (!oCustomData[this.FESR_NAMESPACE]) {
                oCustomData[this.FESR_NAMESPACE] = {};
            }
            oCustomData[this.FESR_NAMESPACE][sEventId] = sStepname;
            oElement.data("sap-ui-custom-settings", oCustomData);
        },


        /**
         * Get semantic stepname for an event of a given element used for FESR.
         *
         * @param {sap.ui.core.Element} oElement The element conatining the semantic stepname
         * @param {string} sEventId The event ID of the semantic stepname
         * @returns {string} The semantic stepname for the given event ID
         *
         * @public
         * @since 1.100
         */
        getSemanticStepname: function (oElement, sEventId) {
            var oCustomFesrData = oElement && oElement.data("sap-ui-custom-settings") && oElement.data("sap-ui-custom-settings")[this.FESR_NAMESPACE];
            if (!oCustomFesrData) {
                return;
            }
            return oCustomFesrData[sEventId];
        }
    };

    return FESRHelper;
});