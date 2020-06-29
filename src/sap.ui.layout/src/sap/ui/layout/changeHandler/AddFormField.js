/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/fl/changeHandler/BaseAddViaDelegate"
], function (
	BaseAddViaDelegate
) {
	"use strict";

	/**
	 * Change handler for adding a SmartField or Something from a Delegate to a Form
	 *
	 * @constructor
	 *
	 * @alias sap.ui.layout.changeHandler.AddFormField
	 *
	 * @author SAP SE
	 *
	 * @version ${version}
	 *
	 * @experimental Since 1.50.0 This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var AddFormField = BaseAddViaDelegate.createAddViaDelegateChangeHandler({
		addProperty : function(mPropertyBag) {
			var mInnerControls = mPropertyBag.innerControls;
			var oModifier = mPropertyBag.modifier;
			var oView = mPropertyBag.view;
			var oAppComponent = mPropertyBag.appComponent;

			var oChange = mPropertyBag.change;
			var mChangeContent = oChange.getContent();
			var iIndex = mChangeContent.newFieldIndex;
			var mFieldSelector = mChangeContent.newFieldSelector;

			var oCreatedFormElement;

			// "layoutControl" property is present only when the control is returned from Delegate.createLayout()
			if (!mInnerControls.layoutControl) {
				oCreatedFormElement = oModifier.createControl(
					"sap.ui.layout.form.FormElement",
					oAppComponent,
					oView,
					mFieldSelector
				);
				oModifier.insertAggregation(oCreatedFormElement, "label", mInnerControls.label, 0, oView);
				oModifier.insertAggregation(oCreatedFormElement, "fields", mInnerControls.control, 0, oView);
			} else {
				oCreatedFormElement = mInnerControls.control;
			}

			var oParentFormContainer = oChange.getDependentControl("parentFormContainer", mPropertyBag);
			oModifier.insertAggregation(oParentFormContainer,
				"formElements",
				oCreatedFormElement,
				iIndex,
				oView
			);
			if (mInnerControls.valueHelp) {
				oModifier.insertAggregation(
					oParentFormContainer,
					"dependents",
					mInnerControls.valueHelp,
					0,
					oView
				);
			}
		},
		aggregationName: "formElements",
		parentAlias: "parentFormContainer",
		fieldSuffix: "-field",
		supportsDefault: true
	});
	return AddFormField;
},
/* bExport= */true);
