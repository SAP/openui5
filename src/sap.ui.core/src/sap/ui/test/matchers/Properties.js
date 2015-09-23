/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";

	/**
	 * @class Properties - checks if a control's properties have the provided values - all properties have to match their values.
	 * @param {object} oProperties the object with the properties to be checked. Example:
	 * <pre><code>
	 * // Would filter for an enabled control with the text "Accept".
	 * new Properties({
	 *     // The property text has the exact value "Accept"
	 *     text: "Accept",
	 *     // The property enabled also has to be true
	 *     enabled: true
	 * })
	 * </code></pre>
	 * If the value is a RegExp, it tests the RegExp with the value. RegExp only works with string properties.
	 * @public
	 * @alias sap.ui.test.matchers.Properties
	 * @author SAP SE
	 * @since 1.27
	 */
	return function (oProperties) {
		return function(oControl) {
			var bIsMatching = true;
			jQuery.each(oProperties, function(sPropertyName, oPropertyValue) {
				var fnProperty = oControl["get" + jQuery.sap.charToUpperCase(sPropertyName, 0)];

				if (!fnProperty) {
					bIsMatching = false;
					jQuery.sap.log.error("Control " + oControl.sId + " does not have a property called: " + sPropertyName);
					return false;
				}

				var vCurrentPropertyValue = fnProperty.call(oControl);
				if (oPropertyValue instanceof RegExp) {
					bIsMatching = oPropertyValue.test(vCurrentPropertyValue);
				} else {
					bIsMatching = vCurrentPropertyValue === oPropertyValue;
				}

				if (!bIsMatching) {
					return false;
				}
			});

			return bIsMatching;
		};
	};

}, /* bExport= */ true);
