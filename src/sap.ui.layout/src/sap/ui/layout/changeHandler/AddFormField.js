/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/fl/changeHandler/Base",
	"sap/ui/fl/changeHandler/ChangeHandlerMediator",
	"sap/base/Log",
	"sap/base/util/merge"
], function (
	Base,
	ChangeHandlerMediator,
	Log,
	merge
) {
	"use strict";

	function getChangeHandlerCreateFunction(mChangeHandlerSettings) {
		return mChangeHandlerSettings
			&& mChangeHandlerSettings.content
			&& mChangeHandlerSettings.content.createFunction;
	}

	function checkChangeDefinition(oChangeDefinition, mChangeHandlerSettings) {
		var bContentPresent = oChangeDefinition.content;
		if (bContentPresent) {
			return oChangeDefinition.content.newFieldSelector
				&& (oChangeDefinition.content.newFieldIndex !== undefined)
				&& oChangeDefinition.content.bindingPath
				&& oChangeDefinition.content.oDataServiceVersion
				&& !!getChangeHandlerCreateFunction(mChangeHandlerSettings);
		}
		return false;
	}

	function getControlsFromDelegate(mDelegate, mPropertyBag) {
		return new Promise(function (resolve) {
			sap.ui.require([mDelegate.name], resolve);
		}).then(function (oDelegate) {
			var mDelegatePropertyBag = merge({
				aggregationName: "formElements",
				payload: mDelegate.payload
			}, mPropertyBag);

			return oDelegate.createControlForProperty(mDelegatePropertyBag).then(function (mField) {
				var sNewFieldId = mPropertyBag.modifier.getId(mField.control);
				mDelegatePropertyBag.labelFor = sNewFieldId;

				return oDelegate.createLabel(mDelegatePropertyBag).then(function (oLabel) {
					//harmonize return values for mediator create function and delegate:
					return {
						label: oLabel,
						control: mField.control,
						valueHelp: mField.valueHelp
					};
				});
			});
		});
	}

	function getControlsFromChangeHandlerCreateFunction(oChangeDefinition, mPropertyBag) {
		return ChangeHandlerMediator.getChangeHandlerSettings({
			"scenario": "addODataFieldWithLabel",
			"oDataServiceVersion": oChangeDefinition.content && oChangeDefinition.content.oDataServiceVersion
		})
			.then(function (mChangeHandlerSettings) {
				if (checkChangeDefinition(oChangeDefinition, mChangeHandlerSettings)) {
					var fnChangeHandlerCreateFunction = getChangeHandlerCreateFunction(mChangeHandlerSettings);
					return fnChangeHandlerCreateFunction(mPropertyBag.modifier, mPropertyBag);
				} else {
					Log.error("Change does not contain sufficient information to be applied or ChangeHandlerMediator could not be retrieved: [" + oChangeDefinition.layer + "]"
						+ oChangeDefinition.namespace + "/"
						+ oChangeDefinition.fileName + "."
						+ oChangeDefinition.fileType);
					//however subsequent changes should be applied
				}
			});
	}


	/**
	 * Change handler for adding a SmartField to a Form
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
	var AddFormField = {};
	/**
	 * Adds a smart field
	 *
	 * @param {sap.ui.fl.Change} oChange Change wrapper object with instructions to be applied to the control map
	 * @param {sap.ui.layout.form.Form} oForm Form that matches the change selector for applying the change
	 * @param {object} mPropertyBag Property bag containing the modifier, the appComponent and the view
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @param {object} mPropertyBag.appComponent Component in which the change should be applied
	 * @param {object} mPropertyBag.view Application view
	 * @return {boolean} True if successful
	 * @public
	 */
	AddFormField.applyChange = function (oChange, oForm, mPropertyBag) {
		var oChangeDefinition = oChange.getDefinition();
		var oView = mPropertyBag.view;
		var iIndex = oChangeDefinition.content.newFieldIndex;
		var oAppComponent = mPropertyBag.appComponent;
		var oChangeContent = oChangeDefinition.content;
		var mFieldSelector = oChangeContent.newFieldSelector;
		var mSmartFieldSelector = merge({}, oChangeContent.newFieldSelector);
		mSmartFieldSelector.id = mSmartFieldSelector.id + "-field";
		var sBindingPath = oChangeContent.bindingPath;
		var mCreateProperties = {
			appComponent: mPropertyBag.appComponent,
			view: mPropertyBag.view,
			fieldSelector: mSmartFieldSelector,
			bindingPath: sBindingPath,
			modifier: mPropertyBag.modifier
		};
		// Check if the change is applicable
		if (mPropertyBag.modifier.bySelector(mFieldSelector, oAppComponent)) {
			return Base.markAsNotApplicable("Control to be created already exists:" + mFieldSelector);
		}
		var oRevertData = {
			newFieldSelector: mFieldSelector
		};

		var mDelegate = mPropertyBag.modifier.getFlexDelegate(oForm);

		var oWaitForInnerControls = mDelegate
			? getControlsFromDelegate(mDelegate, mCreateProperties)
			: getControlsFromChangeHandlerCreateFunction(oChangeDefinition, mCreateProperties);

		return oWaitForInnerControls
				.then(function (mInnerControls) {
					var oCreatedFormElement = mPropertyBag.modifier.createControl("sap.ui.layout.form.FormElement", oAppComponent, oView, mFieldSelector);
					mPropertyBag.modifier.insertAggregation(oCreatedFormElement, "label", mInnerControls.label, 0, oView);
					mPropertyBag.modifier.insertAggregation(oCreatedFormElement, "fields", mInnerControls.control, 0, oView);
					var oParentFormContainer = oChange.getDependentControl("parentFormContainer", mPropertyBag);
					mPropertyBag.modifier.insertAggregation(oParentFormContainer, "formElements", oCreatedFormElement, iIndex, oView);

					if (mInnerControls.valueHelp) {
						mPropertyBag.modifier.insertAggregation(oParentFormContainer, "dependents", mInnerControls.valueHelp, 0, oView);
						var oValueHelpSelector = mPropertyBag.modifier.getSelector(mPropertyBag.modifier.getId(mInnerControls.valueHelp), oAppComponent);
						oRevertData.valueHelpSelector = oValueHelpSelector;
					}
					oChange.setRevertData(oRevertData);
					return true;
				});
	};
	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.Change} oChange Change wrapper object to be completed
	 * @param {Object} oSpecificChangeInfo Information specific to this change
	 * @param {string} oSpecificChangeInfo.newControlId The control ID for the control to be added
	 * @param {string} oSpecificChangeInfo.bindingPath The binding path for the new control
	 * @param {string} oSpecificChangeInfo.parentId FormContainer where the new control will be added
	 * @param {number} oSpecificChangeInfo.index The index where the field will be added
	 * @param {string} oSpecificChangeInfo.oDataServiceVersion The OData service version
	 * @param {Object} mPropertyBag The property bag containing the App Component
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @param {object} mPropertyBag.appComponent Application component
	 * @param {object} mPropertyBag.view Application view
	 * @public
	 */
	AddFormField.completeChangeContent = function (oChange, oSpecificChangeInfo, mPropertyBag) {
		var oAppComponent = mPropertyBag.appComponent;
		var oChangeDefinition = oChange.getDefinition();
		if (!oChangeDefinition.content) {
			oChangeDefinition.content = {};
		}
		if (oSpecificChangeInfo.parentId) {
			oChange.addDependentControl(oSpecificChangeInfo.parentId, "parentFormContainer", mPropertyBag);
		} else {
			throw new Error("oSpecificChangeInfo.parentId attribute required");
		}
		if (oSpecificChangeInfo.bindingPath) {
			oChangeDefinition.content.bindingPath = oSpecificChangeInfo.bindingPath;
		} else {
			throw new Error("oSpecificChangeInfo.bindingPath attribute required");
		}
		if (oSpecificChangeInfo.newControlId) {
			oChangeDefinition.content.newFieldSelector = mPropertyBag.modifier.getSelector(oSpecificChangeInfo.newControlId, oAppComponent);
		} else {
			throw new Error("oSpecificChangeInfo.newControlId attribute required");
		}
		if (oSpecificChangeInfo.index === undefined) {
			throw new Error("oSpecificChangeInfo.targetIndex attribute required");
		} else {
			oChangeDefinition.content.newFieldIndex = oSpecificChangeInfo.index;
		}
		if (oSpecificChangeInfo.oDataServiceVersion === undefined) {
			throw new Error("oSpecificChangeInfo.oDataServiceVersion attribute required");
		} else {
			oChangeDefinition.content.oDataServiceVersion = oSpecificChangeInfo.oDataServiceVersion;
		}
	};
	/**
	 * Reverts the applied change
	 *
	 * @param {sap.ui.fl.Change} oChange Change wrapper object with instructions to be applied to the control map
	 * @param {sap.ui.layout.form.Form} oForm Form that matches the change selector for applying the change
	 * @param {object} mPropertyBag Property bag containing the modifier, the appComponent and the view
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @param {object} mPropertyBag.appComponent Component in which the change should be applied
	 * @param {object} mPropertyBag.view Application view
	 * @return {boolean} True if successful
	 * @public
	 */
	AddFormField.revertChange = function (oChange, oForm, mPropertyBag) {
		var oAppComponent = mPropertyBag.appComponent;
		var oView = mPropertyBag.view;
		var oModifier = mPropertyBag.modifier;
		var mFieldSelector = oChange.getRevertData().newFieldSelector;
		var mValueHelpSelector = oChange.getRevertData().valueHelpSelector;

		var oFormElement = oModifier.bySelector(mFieldSelector, oAppComponent, oView);
		var oParentFormContainer = oChange.getDependentControl("parentFormContainer", mPropertyBag);
		oModifier.removeAggregation(oParentFormContainer, "formElements", oFormElement);
		oModifier.destroy(oFormElement);

		if (mValueHelpSelector) {
			var oValueHelp = oModifier.bySelector(mValueHelpSelector, oAppComponent, oView);
			oModifier.removeAggregation(oParentFormContainer, "dependents", oValueHelp);
			oModifier.destroy(oValueHelp);
		}

		oChange.resetRevertData();
		return true;
	};
	return AddFormField;
},
/* bExport= */true);