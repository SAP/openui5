/*!
 * ${copyright}
 */

sap.ui.define([
		"sap/ui/fl/Utils",
		"sap/ui/fl/changeHandler/ChangeHandlerMediator"
	], function(Utils, ChangeHandlerMediator) {
		"use strict";

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
		 * @param {sap.ui.fl.Change} oChange Change wrapper object with instructions to be applied on the control map
		 * @param {sap.ui.layout.form.FormContainer} oFormContainer FormContainer that matches the change selector for applying the change
		 * @param {object} mPropertyBag Property bag containing the modifier and the view
		 * @param {object} mPropertyBag.modifier Modifier for the controls
		 * @param {object} mPropertyBag.view Application view
		 * @return {boolean} True if successful
		 * @public
		 */
		AddFormField.applyChange = function(oChange, oFormContainer, mPropertyBag) {
			var oChangeDefinition = oChange.getDefinition();
			var oView = mPropertyBag.view;
			var iIndex = oChangeDefinition.content.newFieldIndex;
			var oModifier = mPropertyBag.modifier;
			var oParentFormContainer = oChange.getDependentControl("parentFormContainer", mPropertyBag);
			var mChangeHandlerSettings = ChangeHandlerMediator.getChangeHandlerSettings({
				"scenario" : "addODataFieldWithLabel",
				"oDataServiceVersion" : oChangeDefinition.content && oChangeDefinition.content.oDataServiceVersion
			});

			var fnChangeHandlerCreateFunction = mChangeHandlerSettings
				&& mChangeHandlerSettings.content
				&& mChangeHandlerSettings.content.createFunction;

			var fnCheckChangeDefinition = function(oChangeDefinition) {
				var bContentPresent = oChangeDefinition.content;
				var bMandatoryContentPresent = false;

				if (bContentPresent) {
					bMandatoryContentPresent = oChangeDefinition.content.newFieldSelector
						&& (oChangeDefinition.content.newFieldIndex !== undefined)
						&& oChangeDefinition.content.bindingPath
						&& oChangeDefinition.content.oDataServiceVersion
						&& fnChangeHandlerCreateFunction;
				}

				return  bContentPresent && bMandatoryContentPresent;
			};

			if (fnCheckChangeDefinition(oChangeDefinition)) {
				var oChangeContent = oChangeDefinition.content;

				var mFieldSelector = oChangeContent.newFieldSelector;
				var mSmartFieldSelector = jQuery.extend({}, oChangeContent.newFieldSelector);
				mSmartFieldSelector.id = mSmartFieldSelector.id + "-field";
				var sBindingPath = oChangeContent.bindingPath;

				var mCreateProperties = {
					"appComponent" : mPropertyBag.appComponent,
					"view" : mPropertyBag.view,
					"fieldSelector" : mSmartFieldSelector,
					"bindingPath" : sBindingPath
				};

				var oCreatedControls = fnChangeHandlerCreateFunction(oModifier, mCreateProperties),
				    oCreatedFormElement = oModifier.createControl("sap.ui.layout.form.FormElement", mPropertyBag.appComponent, oView, mFieldSelector);

				oModifier.insertAggregation(oCreatedFormElement, "label", oCreatedControls.label, 0, oView);
				oModifier.insertAggregation(oCreatedFormElement, "fields", oCreatedControls.control, 0, oView);

				oModifier.insertAggregation(oParentFormContainer, "formElements", oCreatedFormElement, iIndex, oView);

				return true;
			} else {
				Utils.log.error("Change does not contain sufficient information to be applied or ChangeHandlerMediator could not be retrieved: [" + oChangeDefinition.layer + "]"
					+ oChangeDefinition.namespace + "/"
					+ oChangeDefinition.fileName + "."
					+ oChangeDefinition.fileType);
				//however subsequent changes should be applied
			}
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
		AddFormField.completeChangeContent = function(oChange, oSpecificChangeInfo, mPropertyBag) {

			var oAppComponent = mPropertyBag.appComponent;
			var oChangeDefinition = oChange.getDefinition();

			if (!oChangeDefinition.content) {
				oChangeDefinition.content = {};
			}

			if (oSpecificChangeInfo.parentId){
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

		return AddFormField;
	},
	/* bExport= */true);