/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/fieldhelp/FieldHelpCustomData"
], function (FieldHelpCustomData) {
	"use strict";

	/**
	 * Util class to set field help information for controls like filter fields that don't have OData property bindings.
	 *
	 * @alias module:sap/ui/core/fieldhelp/FieldHelpUtil
	 * @author SAP SE
	 * @class
	 *
	 * @hideconstructor
	 * @private
	 * @ui5-restricted sap.ui.comp.filterbar, sap.fe.templates.ListReport
	 * @since 1.126.0
	 * @see module:sap/ui/core/fieldhelp/FieldHelp
	 */
	class FieldHelpUtil {
		/**
		 * Sets the field help information for the given element as <code>sap-ui-DocumentationRef</code> custom data.
		 *
		 * @param {sap.ui.core.Element} oElement
		 *   The element on which to set the field help
		 * @param {string|string[]} vDocumentationRefs
		 *   The string value or an array of string values of
		 *   <code>com.sap.vocabularies.Common.v1.DocumentationRef</code> OData annotations
		 * @throws {Error}
		 *   If there is already a custom data with key <code>sap-ui-DocumentationRef</code> that is not of type
		 *   {@link module:sap/ui/core/fieldhelp/FieldHelpCustomData}
		 *
		 * @private
		 * @ui5-restricted sap.ui.comp.filterbar, sap.fe.templates.ListReport, sap.nw.core.appjobs.lib.reuse
		 */
		static setDocumentationRef(oElement, vDocumentationRefs) {
			const aValue = Array.isArray(vDocumentationRefs) ? vDocumentationRefs : [vDocumentationRefs];
			const sDocumentationRefKey = FieldHelpCustomData.DOCUMENTATION_REF_KEY;
			const oDocumentationRefCustomData = oElement.getCustomData().find((oCustomData) =>
				oCustomData.getKey() === sDocumentationRefKey
			);
			if (oDocumentationRefCustomData) {
				if (!(oDocumentationRefCustomData instanceof FieldHelpCustomData)) {
					throw new Error(`Unsupported custom data type for key "${sDocumentationRefKey}"`);
				}
				oDocumentationRefCustomData.setValue(aValue);
			} else {
				const oCustomData = new FieldHelpCustomData({
					key: FieldHelpCustomData.DOCUMENTATION_REF_KEY,
					value: aValue
				});
				oElement.addAggregation("customData", oCustomData, true);
			}
		}
	}

	return FieldHelpUtil;
});
