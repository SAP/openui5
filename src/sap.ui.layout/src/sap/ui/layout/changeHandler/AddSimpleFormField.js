/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/ChangeHandlerMediator",
	"sap/ui/fl/changeHandler/Base",
	"sap/base/Log"
], function(
	ChangeHandlerMediator,
	Base,
	Log
) {
	"use strict";

	/**
	 * Change handler for adding a SmartField to a SimpleForm
	 *
	 * @constructor
	 *
	 * @alias sap.ui.layout.changeHandler.AddSimpleFormField
	 *
	 * @author SAP SE
	 *
	 * @version ${version}
	 *
	 * @experimental Since 1.49.0 This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var AddSimpleFormField = {};

	var sTypeTitle = "sap.ui.core.Title";
	var sTypeToolBar = "sap.m.Toolbar";
	var sTypeLabel = "sap.m.Label";
	var sTypeSmartLabel = "sap.ui.comp.smartfield.SmartLabel";

	/**
	 * Adds a smart field
	 *
	 * @param {sap.ui.fl.Change} oChange Change wrapper object with instructions to be applied on the control map
	 * @param {sap.ui.layout.form.SimpleForm} oSimpleForm - Simple Form that matches the change selector for applying the change
	 * @param {object} mPropertyBag Property bag containing the modifier, the appComponent and the view
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @param {object} mPropertyBag.appComponent Component in which the change should be applied
	 * @param {object} mPropertyBag.view Application view
	 * @return {boolean} True if successful
	 * @public
	 */
	AddSimpleFormField.applyChange = function(oChange, oSimpleForm, mPropertyBag) {
		var oChangeDefinition = oChange.getDefinition();
		var oTargetContainerHeader = oChange.getDependentControl("targetContainerHeader", mPropertyBag);
		var oModifier = mPropertyBag.modifier;
		var oAppComponent = mPropertyBag.appComponent;
		var getChangeHandlerCreateFunction = function(mChangeHandlerSettings) {
			return mChangeHandlerSettings
				&& mChangeHandlerSettings.content
				&& mChangeHandlerSettings.content.createFunction;
		};
		var fnCheckChangeDefinition = function(oChangeDefinition, mChangeHandlerSettings) {
			return oChangeDefinition.content
				&& oChangeDefinition.content.newFieldSelector
				&& (oChangeDefinition.content.newFieldIndex !== undefined)
				&& oChangeDefinition.content.bindingPath
				&& oChangeDefinition.content.oDataServiceVersion
				&& !!getChangeHandlerCreateFunction(mChangeHandlerSettings);
		};

		return ChangeHandlerMediator.getChangeHandlerSettings({
			"scenario" : "addODataFieldWithLabel",
			"oDataServiceVersion" : oChangeDefinition.content && oChangeDefinition.content.oDataServiceVersion
		})
		.then(function(mChangeHandlerSettings) {
			if (fnCheckChangeDefinition(oChangeDefinition, mChangeHandlerSettings)) {
				var oChangeContent = oChangeDefinition.content;

				var oFieldSelector = oChangeContent.newFieldSelector;
				var sBindingPath = oChangeContent.bindingPath;
				var insertIndex = oChangeContent.newFieldIndex;

				var aContent = oModifier.getAggregation(oSimpleForm, "content");
				var aContentClone = aContent.slice();

				var iIndexOfHeader = aContent.indexOf(oTargetContainerHeader);
				var iNewIndex = 0;
				var iFormElementIndex = 0;
				var oCreatedControls, fnChangeHandlerCreateFunction;

				// This logic is for insertIndex being a desired index of a form element inside a container
				// However we cannot allow that new fields are added inside other FormElements, therefore
				// we must find the end of the FormElement to add the new FormElement there
				if (aContent.length === 1 || aContent.length === iIndexOfHeader + 1){
					// Empty container (only header or toolbar)
					iNewIndex = aContent.length;
				} else {
					var j = 0;
					for (j = iIndexOfHeader + 1; j < aContent.length; j++){
						var sControlType = oModifier.getControlType(aContent[j]);
						// When the next control is a label (= end of FormElement)
						if (sControlType === sTypeLabel || sControlType === sTypeSmartLabel ){
							if (iFormElementIndex == insertIndex){
								iNewIndex = j;
								break;
							}
							iFormElementIndex++;
						}
						// Next control is a title or toolbar (= end of container)
						if (sControlType === sTypeTitle || sControlType === sTypeToolBar){
							iNewIndex = j;
							break;
						}

						// If there are no more titles, toolbars or labels (= this is the last FormElement) -> insert at end
						if (j === (aContent.length - 1)){
							iNewIndex = aContent.length;
						}
					}
				}

				var mCreateProperties = {
					"appComponent" : oAppComponent,
					"view" : mPropertyBag.view,
					"fieldSelector" : oFieldSelector,
					"bindingPath" : sBindingPath
				};

				// Check if the change is applicable
				if	(oModifier.bySelector(oFieldSelector, oAppComponent)) {
					return Base.markAsNotApplicable("Control to be created already exists:" + oFieldSelector);
				}
				fnChangeHandlerCreateFunction = getChangeHandlerCreateFunction(mChangeHandlerSettings);
				oCreatedControls = fnChangeHandlerCreateFunction(oModifier, mCreateProperties);

				var mCreatedControlSelectors = {};
				if (oCreatedControls.label && oCreatedControls.control) {
					mCreatedControlSelectors.label = oModifier.getSelector(oCreatedControls.label, oAppComponent);
				}
				mCreatedControlSelectors.control = oModifier.getSelector(oCreatedControls.control, oAppComponent);
				oChange.setRevertData(mCreatedControlSelectors);

				aContentClone.splice(iNewIndex, 0, oCreatedControls.label, oCreatedControls.control);

				oModifier.removeAllAggregation(oSimpleForm, "content");
				for (var i = 0; i < aContentClone.length; ++i) {
					oModifier.insertAggregation(oSimpleForm, "content", aContentClone[i], i, mPropertyBag.view);
				}

				return true;
			} else {
				Log.error("Change does not contain sufficient information to be applied or ChangeHandlerMediator could not be retrieved: [" + oChangeDefinition.layer + "]"
					+ oChangeDefinition.namespace + "/"
					+ oChangeDefinition.fileName + "."
					+ oChangeDefinition.fileType);
				//however subsequent changes should be applied
			}
		});
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.Change} oChange Change wrapper object to be completed
	 * @param {Object} oSpecificChangeInfo - information specific to this change
	 * @param {string} oSpecificChangeInfo.newControlId - the control ID for the control to be added,
	 * @param {string} oSpecificChangeInfo.bindingPath - the binding path for the new control,
	 * @param {string} oSpecificChangeInfo.parentId - FormContainer where the new control will be added,
	 * @param {number} oSpecificChangeInfo.index - the index where the field will be added,
	 * @param {string} oSpecificChangeInfo.oDataServiceVersion - the OData service version.
	 * @param {Object} mPropertyBag The property bag containing the App Component
	 * @param {object} mPropertyBag.modifier - modifier for the controls
	 * @param {object} mPropertyBag.appComponent - application component
	 * @param {object} mPropertyBag.view - application view
	 * @public
	 */
	AddSimpleFormField.completeChangeContent = function(oChange, oSpecificChangeInfo, mPropertyBag) {
		var oAppComponent = mPropertyBag.appComponent;
		var oView = mPropertyBag.view;
		var oChangeDefinition = oChange.getDefinition();

		if (!oChangeDefinition.content) {
			oChangeDefinition.content = {};
		}
		if (oSpecificChangeInfo.parentId){
			var oFormContainer = mPropertyBag.modifier.bySelector(oSpecificChangeInfo.parentId, oAppComponent, oView);
			var oTitleOrToolbar = oFormContainer.getTitle() || oFormContainer.getToolbar();
			if (oTitleOrToolbar) {
				oChange.addDependentControl(oTitleOrToolbar.getId(), "targetContainerHeader", mPropertyBag);
			}
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
	 * @param {sap.ui.fl.Change} oChange Change wrapper object with instructions to be applied on the control map
	 * @param {sap.ui.layout.form.SimpleForm} oSimpleForm - Simple Form that matches the change selector for applying the change
	 * @param {object} mPropertyBag Property bag containing the modifier, the appComponent and the view
	 * @param {object} mPropertyBag.modifier Modifier for the controls
	 * @param {object} mPropertyBag.appComponent Component in which the change should be applied
	 * @param {object} mPropertyBag.view Application view
	 * @return {boolean} True if successful
	 * @public
	 */
	AddSimpleFormField.revertChange = function (oChange, oSimpleForm, mPropertyBag) {
		var oAppComponent = mPropertyBag.appComponent;
		var oView = mPropertyBag.view;
		var oModifier = mPropertyBag.modifier;
		var mCreatedControlSelectors = oChange.getRevertData();

		var oField = oModifier.bySelector(mCreatedControlSelectors.control, oAppComponent, oView);
		if (mCreatedControlSelectors.label) {
			var oLabel = oModifier.bySelector(mCreatedControlSelectors.label, oAppComponent, oView);
			oModifier.removeAggregation(oSimpleForm, "content", oLabel);
			oModifier.destroy(oLabel);
		}
		oModifier.removeAggregation(oSimpleForm, "content", oField);
		oModifier.destroy(oField);
		oChange.resetRevertData();

		return true;
	};

	return AddSimpleFormField;
},
/* bExport= */true);