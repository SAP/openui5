/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/field/content/DefaultContent",
	"sap/ui/model/BindingMode"
], function(DefaultContent, BindingMode) {
	"use strict";

	/**
	 * Object-based definition of the search content type that is used in the {@link sap.ui.mdc.field.content.ContentFactory}.
	 * This defines which controls to load and create for a given {@link sap.ui.mdc.enum.ContentMode}.
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @experimental As of version 1.87
	 * @since 1.87
	 * @alias sap.ui.mdc.field.content.SearchContent
	 * @extends sap.ui.mdc.field.content.DefaultContent
	 * @MDC_PUBLIC_CANDIDATE
	 */
	var SearchContent = Object.assign({}, DefaultContent, {
		getDisplayMultiValue: function() {
			return [null];
		},
		getDisplayMultiLine: function() {
			return [null];
		},
		getEdit: function() {
			return ["sap/m/SearchField"];
		},
		getEditMultiValue: function() {
			return [null];
		},
		getEditMultiLine: function() {
			return [null];
		},
		getEditForHelp: function() {
			return [null];
		},
		getUseDefaultEnterHandler: function() {
			return false;
		},
		getUseDefaultFieldHelp: function() {
			return false;
		},
		createEdit: function(oContentFactory, aControlClasses, sId) {
			var SearchField = aControlClasses[0];
			var oConditionsType = oContentFactory.getConditionsType();
			oContentFactory.setHideOperator(true);
			oContentFactory.updateConditionType(); // to update HideOperator

			var oControl = new SearchField(sId, {
				value: { path: "$field>/conditions", type: oConditionsType, mode: BindingMode.OneWay }, // oneWay as SearchField updates "value" while typing
				placeholder: "{$field>/placeholder}",
				width: "100%",
				tooltip: "{$field>/tooltip}",
				search: function(oEvent) { // submit event should be fired on Enter and not via the clear-icon
					if (oEvent.getParameters().clearButtonPressed) {
						return;
					}
					oContentFactory.getHandleEnter().call(this, oEvent);
				},
				change: oContentFactory.getHandleContentChange(),
				liveChange: oContentFactory.getHandleContentLiveChange()
			});

			oContentFactory.setAriaLabelledBy(oControl);
			oContentFactory.setBoundProperty("value");

			return [oControl];
		},
		createEditMultiValue: function() {
			throw new Error("sap.ui.mdc.field.content.SearchContent - createEditMultiValue not defined!");
		},
		createEditMultiLine: function() {
			throw new Error("sap.ui.mdc.field.content.SearchContent - createEditMultiLine not defined!");
		},
		createDisplayMultiValue: function() {
			throw new Error("sap.ui.mdc.field.content.SearchContent - createDisplayMultiValue not defined!");
		},
		createDisplayMultiLine: function() {
			throw new Error("sap.ui.mdc.field.content.SearchContent - createDisplayMultiLine not defined!");
		},
		createEditForHelp: function() {
			throw new Error("sap.ui.mdc.field.content.SearchContent - createEditForHelp not defined!");
		}
	});

	return SearchContent;
});