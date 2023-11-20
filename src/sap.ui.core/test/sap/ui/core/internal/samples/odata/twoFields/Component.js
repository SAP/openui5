/*!
 * ${copyright}
 */

/**
 * @fileOverview
 *   Application component to test the two field solution for the unit and currency types
 * @version @version@
 */
 sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
	"use strict";

	/* global URLSearchParams */

	return UIComponent.extend("sap.ui.core.internal.samples.odata.twoFields.Component", {
		metadata : {
			manifest : "json"
		},

		init : function () {
			var oUrlSearchParams = new URLSearchParams(window.location.search),
				bCurrency = oUrlSearchParams.has("currency"),
				bInitPanelExpanded = !bCurrency && !oUrlSearchParams.has("unit")
					&& !oUrlSearchParams.has("value"),
				oUnit = parseUriParameter(bCurrency ? "currency" : "unit"),
				oValue = parseUriParameter("value");

			/**
			 * Parses the value of the given URL parameter which describes the value and the
			 * readonly resp. disabled state for the unit or value field.
			 * Sample: "EUR~readonly" leads to a readonly currency field with content "EUR".
			 *
			 * @param {string} sParameter The parameter name
			 * @returns {object}
			 *   An object with the boolean properties editable and enabled denoting the
			 *   corresponding properties of the input field and a content property with the input
			 *   field's initial value.
			 */
			function parseUriParameter(sParameter) {
				var sParameterValue = oUrlSearchParams.get(sParameter),
					aValues = sParameterValue ? sParameterValue.split("~") : [];

				return {
					content : aValues[0] || null,
					editable : aValues[1] !== "readonly",
					enabled : aValues[1] !== "disabled"
				};
			}

			UIComponent.prototype.init.apply(this, arguments);

			this.setModel(new JSONModel({
				initialUnit : oUnit,
				initialValue : oValue,
				isCurrency : bCurrency,
				isPanelExpanded : bInitPanelExpanded
			}), "init");
		}
	});
});
