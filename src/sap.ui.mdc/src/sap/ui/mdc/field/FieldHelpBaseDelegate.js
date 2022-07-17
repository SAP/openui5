/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to execute model specific logic in FieldBase
// ---------------------------------------------------------------------------------------

sap.ui.define([
], function(
) {
	"use strict";
	/**
	 * @class Delegate class for sap.ui.mdc.field.FieldHelpBase.<br>
	 * <b>Note:</b> The class is experimental and the API/behavior is not finalized and hence this should not be used for productive usage.
	 *
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldHelpBase
	 * @experimental As of version 1.77
	 * @since 1.77.0
	 * @alias sap.ui.mdc.field.FieldHelpBaseDelegate
	 */
	var FieldHelpBaseDelegate = {

			/**
			 * Requests the content of the field help.
			 *
			 * This function is called when the field help is opened or a key or description is requested.
			 *
			 * So, depending on the field help control used, all content controls and data need to be assigned.
			 * Once they are assigned and the data is set, the returned <code>Promise</code> needs to be resolved.
			 * Only then does the field help continue opening or reading data.
			 *
			 * @param {object} oPayload Payload for delegate
			 * @param {sap.ui.mdc.base.FieldHelpBase} oFieldHelp Field help instance
			 * @param {boolean} bSuggestion Field help is called for suggestion
			 * @param {object} oProperties Properties depending on the used FieldHelp (e.g. FieldValueHelp)
			 * @returns {Promise} Promise that is resolved if all content is available
			 * @private
			 * @ui5-restricted sap.fe
			 * @MDC_PUBLIC_CANDIDATE
			 */
			contentRequest: function(oPayload, oFieldHelp, bSuggestion, oProperties) {

			}

	};

	return FieldHelpBaseDelegate;

});
