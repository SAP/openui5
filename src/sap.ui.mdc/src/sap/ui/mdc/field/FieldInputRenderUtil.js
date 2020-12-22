/*!
 * ${copyright}
 */

sap.ui.define([
		'sap/ui/core/InvisibleText'
	],
	function(
		InvisibleText
	) {
	"use strict";

	/**
	 * @class Functions uses in <code>FieldInputRenderer</code> and <code>FieldMultiInputRenderer</code> to adjust aria attributes.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.86.0
	 * @alias sap.ui.mdc.field.FieldInputRenderUtil
	 *
	 * @private
	 */
	var FieldInputRenderUtil = {

		getAriaRole: function (oInput, oRenderer) {

			var oAriaAttributes = oInput.getAriaAttributes();

			if (oAriaAttributes.role) {
				return oAriaAttributes.role;
			} else {
				return oRenderer.getAriaRole.apply(this, arguments);
			}

		},

		getAccessibilityState: function (oInput, oRenderer) {

			var oAriaAttributes = oInput.getAriaAttributes();
			var mAccessibilityState = oRenderer.getAccessibilityState.apply(this, arguments);

			// add aria attributes
			if (oAriaAttributes.aria) {
				for (var sAttribute in oAriaAttributes.aria) {
					mAccessibilityState[sAttribute] = oAriaAttributes.aria[sAttribute];
				}
			}

			if (!oAriaAttributes.valueHelpEnabled && mAccessibilityState.describedby) {
				// remove "value help enabled" text if not needed
				var sValueHelpEnabledID = InvisibleText.getStaticId("sap.m", "INPUT_VALUEHELP");
				var aIDs = mAccessibilityState.describedby.value.split(" ");
				var sIDs = "";
				for (var i = 0; i < aIDs.length; i++) {
					var sID = aIDs[i];
					if (sID !== sValueHelpEnabledID) {
						sIDs = sIDs ? sIDs + " " + sID : sID;
					}
				}
				if (sIDs) {
					mAccessibilityState.describedby.value = sIDs;
				} else {
					delete mAccessibilityState.describedby;
				}
			}

			return mAccessibilityState;

		},

		writeInnerAttributes: function(oRm, oInput, oRenderer) {

			oRenderer.writeInnerAttributes.apply(this, arguments);

			var oAriaAttributes = oInput.getAriaAttributes();

			// add all not aria specific attributes
			for (var sAttribute in oAriaAttributes) {
				if (sAttribute !== "aria" && sAttribute !== "role" && sAttribute !== "valueHelpEnabled") {
					oRm.attr(sAttribute, oAriaAttributes[sAttribute]);
				}
			}

		}
	};

	return FieldInputRenderUtil;
});
