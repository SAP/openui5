/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/fieldhelp/FieldHelpCustomData"
], function (FieldHelpCustomData) {
	"use strict";

	/**
	 * Utility class to set field help information for controls for which field help information cannot be deduced
	 * automatically from OData metadata or for which the automatically deduced field help needs to be overwritten.
	 * These can be controls like filter fields that don't have OData property bindings.
	 *
	 * @alias module:sap/ui/core/fieldhelp/FieldHelpUtil
	 * @author SAP SE
	 * @class
	 *
	 * @hideconstructor
	 * @public
	 * @since 1.133.0
	 */
	class FieldHelpUtil {
		/**
		 * Sets the field help information for the given element as <code>sap-ui-DocumentationRef</code> custom data.
		 * Note that field help inferred from data bindings of control properties is overwritten by this method unless
		 * an empty array is given in parameter <code>vDocumentationRefs</code>.
		 *
		 * @param {sap.ui.core.Element} oElement
		 *   The element on which to set the field help
		 * @param {string|string[]} vDocumentationRefs
		 *   The string value or an array of string values of
		 *   <code>com.sap.vocabularies.Common.v1.DocumentationRef</code> OData annotations, for example
		 *   <code>"urn:sap-com:documentation:key?=type=DE&id=MY_ID&origin=MY_ORIGIN"</code>"
		 * @throws {Error}
		 *   If there is already a custom data with key <code>sap-ui-DocumentationRef</code> that is not of type
		 *   {@link module:sap/ui/core/fieldhelp/FieldHelpCustomData}
		 *
		 * @public
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
