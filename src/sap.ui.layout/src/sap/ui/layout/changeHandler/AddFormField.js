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
			var oParentFormContainer;

			return Promise.resolve()
				.then(function(){
					// "layoutControl" property is present only when the control is returned from Delegate.createLayout()
					if (!mInnerControls.layoutControl) {
						return Promise.resolve()
							.then(oModifier.createControl.bind(oModifier, "sap.ui.layout.form.FormElement", oAppComponent, oView, mFieldSelector))
							.then(function(oCreatedControl) {
								oCreatedFormElement = oCreatedControl;
								return Promise.all([
									oModifier.insertAggregation(oCreatedFormElement, "label", mInnerControls.label, 0, oView),
									oModifier.insertAggregation(oCreatedFormElement, "fields", mInnerControls.control, 0, oView)
								]);
							});
					}
					oCreatedFormElement = mInnerControls.control;
					return undefined;
				})
				.then(function(){
					oParentFormContainer = oChange.getDependentControl("parentFormContainer", mPropertyBag);
					return oModifier.insertAggregation(oParentFormContainer,
						"formElements",
						oCreatedFormElement,
						iIndex,
						oView
					);
				})
				.then(function(){
					if (mInnerControls.valueHelp) {
						return oModifier.insertAggregation(
							oParentFormContainer,
							"dependents",
							mInnerControls.valueHelp,
							0,
							oView
						);
					}
					return undefined;
				});

		},
		aggregationName: "formElements",
		parentAlias: "parentFormContainer",
		fieldSuffix: "-field"
	});
	return AddFormField;
});
