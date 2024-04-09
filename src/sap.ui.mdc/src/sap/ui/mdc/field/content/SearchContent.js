/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/field/content/DefaultContent",
	"sap/ui/model/BindingMode",
	'sap/ui/model/ParseException',
	'sap/ui/model/ValidateException'
], (DefaultContent, BindingMode, ParseException, ValidateException) => {
	"use strict";

	/**
	 * Object-based definition of the search content type that is used in the {@link sap.ui.mdc.field.content.ContentFactory}.
	 * This defines which controls to load and create for a given {@link sap.ui.mdc.enums.ContentMode}.
	 * @namespace
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.87
	 * @alias sap.ui.mdc.field.content.SearchContent
	 * @extends sap.ui.mdc.field.content.DefaultContent
	 */
	const SearchContent = Object.assign({}, DefaultContent, {
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
		getUseDefaultValueHelp: function() {
			return false;
		},
		createEdit: function(oContentFactory, aControlClasses, sId) {
			const SearchField = aControlClasses[0];
			const oConditionsType = oContentFactory.getConditionsType();
			oContentFactory.setHideOperator(true);
			oContentFactory.updateConditionType(); // to update HideOperator

			/* In SearchField the value property is updated while typing. So a live-change triggers a update of the property.
			 * If TwoWay-Binding would be used to bind the value property on conditions, the conditions would be updated on every typing, this is not wanted.
			 * To prevent this the value property is bound to conditions using OneWay-Binding. So an update on the condition triggers an update on the value property.
			 * To update the conditions the Change-event of the SearchField is used. Here we simulate TwoWay-Binding using setExternalValue. This triggers the update of
			 * the conditions. (Like it would happen in TwoWay-Binding.) To inform the Binding about the success or failure of the update the ValidationSuccess, ValidationError
			 * and ParseError events are used. (Like it would happen on TwoWay-Binding.)
			 */
			const oControl = new SearchField(sId, {
				value: { path: "$field>/conditions", type: oConditionsType, mode: BindingMode.OneWay }, // oneWay as SearchField updates "value" while typing
				placeholder: "{$field>/placeholder}",
				width: "100%",
				tooltip: "{$field>/tooltip}",
				search: function(oEvent) { // submit event should be fired on Enter and not via the clear-icon or esc-key
					if (oEvent.getParameters().clearButtonPressed || oEvent.getParameters().escPressed) {
						return;
					}
					oContentFactory.getHandleEnter().call(this, oEvent);
				},
				change: function(oEvent) {
					const oSource = oEvent.getSource();
					const sValue = oEvent.getParameter("value");
					const oBinding = oSource.getBinding("value");
					try {
						oBinding.setExternalValue(sValue); // as not automatically triggered for OneWay binding
						const mSuccessParameters = {
							element: oSource,
							property: "value",
							type: oBinding.getType(),
							newValue: sValue,
							oldValue: "" // TODO
						};
						oSource.fireValidationSuccess(mSuccessParameters, false, true); // bAllowPreventDefault, bEnableEventBubbling
					} catch (oException) {
						const mErrorParameters = {
							element: oSource,
							property: "value",
							type: oBinding.getType(),
							newValue: sValue,
							oldValue: "", // TODO
							exception: oException,
							message: oException.message
						};
						if (oException instanceof ParseException) {
							oSource.fireParseError(mErrorParameters, false, true); // mParameters, bAllowPreventDefault, bEnableEventBubbling
						} else if (oException instanceof ValidateException) {
							oSource.fireValidationError(mErrorParameters, false, true); // mParameters, bAllowPreventDefault, bEnableEventBubbling
						} else {
							throw oException;
						}
					}

					oContentFactory.getHandleContentChange().call(this, oEvent);
				},
				liveChange: oContentFactory.getHandleContentLiveChange()
			});

			oContentFactory.setAriaLabelledBy(oControl);

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