/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/base/ManagedObject"],
	function (ManagedObject) {
		"use strict";

		/**
		 * Helper class for working with bindings.
		 *
		 * @author SAP SE
		 * @version ${version}
		 *
		 * @private
		 * @alias sap.f.cards.BindingHelper
		 */
		var BindingHelper = {};

		/**
		 * Tries to create a binding info object based on sPropertyValue.
		 * If succeeds the binding info will be used for property binding.
		 * Else sPropertyValue will be set directly on the item template.
		 *
		 * @private
		 * @param {sap.ui.core.Control} oControl The control which property should be bound.
		 * @param {string} sPropertyName The name of the property.
		 * @param {string} sPropertyValue The value of the property.
		 * @param {function} [fnFormatter] An optional property formatter.
		 */
		BindingHelper.bindProperty = function (oControl, sPropertyName, sPropertyValue, fnFormatter) {
			if (!sPropertyValue) {
				return;
			}

			var oBindingInfo = ManagedObject.bindingParser(sPropertyValue);
			if (oBindingInfo) {
				if (!oBindingInfo.formatter && fnFormatter) {
					oBindingInfo.formatter = fnFormatter;
				}
				oControl.bindProperty(sPropertyName, oBindingInfo);
			} else {
				var sFormattedValue = sPropertyValue;
				if (fnFormatter) {
					sFormattedValue = fnFormatter.call(oControl, sPropertyValue);
				}
				oControl.setProperty(sPropertyName, sFormattedValue);
			}
		};

		return BindingHelper;
	});

