/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/_LogCollector",
	"sap/base/Log",
	"sap/base/strings/capitalize",
	"sap/ui/thirdparty/jquery"
], function (_LogCollector, Log, capitalize, jQueryDOM) {
	"use strict";
	var oLogger = Log.getLogger("sap.ui.test.matchers.Properties");

	/**
	 * @class
	 * Checks if a control's properties have the provided values - all properties have to match their values.
	 *
	 * As of version 1.72, it is available as a declarative matcher with the following syntax:
	 * <code><pre>{
	 *     properties: {
	 *         propertyName: "propertyValue"
	 *     }
	 * }
	 * </code></pre>
	 * @sine 1.74, you can use regular expressions in declarative syntax:
	 * <code><pre>{
	 *     properties: {
	 *         propertyName: {
	 *             regex: {
	 *                 source: "propertyValue$",
	 *                 flags: "ig"
	 *             }
	 *         }
	 *     }
	 * }
	 * </code></pre>
	 * @param {object} oProperties the object with the properties to be checked. Example:
	 * <pre>
	 * // Would filter for an enabled control with the text "Accept".
	 * new Properties({
	 *     // The property text has the exact value "Accept"
	 *     text: "Accept",
	 *     // The property enabled also has to be true
	 *     enabled: true
	 * })
	 * </pre>
	 * If the value is a RegExp, it tests the RegExp with the value. RegExp only works with string properties.
	 * @public
	 * @name sap.ui.test.matchers.Properties
	 * @author SAP SE
	 * @since 1.27
	 */

	return function (oProperties) {
		return function (oControl) {
			var bIsMatching = true;
			jQueryDOM.each(oProperties, function(sPropertyName, oPropertyValue) {
				var fnProperty = oControl["get" + capitalize(sPropertyName, 0)];

				if (!fnProperty) {
					bIsMatching = false;
					oLogger.error("Control '" + oControl + "' does not have a property '" + sPropertyName + "'");
					return false;
				}

				var vCurrentPropertyValue = fnProperty.call(oControl);
				// propertyValue is set in parent frame (on matcher instantiation), so match it against the parent's RegExp constructor
				if (oPropertyValue instanceof RegExp) {
					bIsMatching = oPropertyValue.test(vCurrentPropertyValue);
				} else if (jQueryDOM.isPlainObject(oPropertyValue) && oPropertyValue.regex && oPropertyValue.regex.source) {
					// declarative syntax
					var oRegExp = new RegExp(oPropertyValue.regex.source, oPropertyValue.regex.flags);
					bIsMatching = oRegExp.test(vCurrentPropertyValue);
				} else {
					bIsMatching = vCurrentPropertyValue === oPropertyValue;
				}

				if (!bIsMatching) {
					oLogger.debug("Control '" + oControl + "' property '" + sPropertyName +
						"' has value '" + vCurrentPropertyValue + "' but should have value '" + oPropertyValue + "'");
					return false;
				}
			});

			return bIsMatching;
		};
	};

}, /* bExport= */ true);