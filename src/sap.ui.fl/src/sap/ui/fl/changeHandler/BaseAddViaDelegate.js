/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/Base",
	"sap/ui/fl/apply/api/DelegateMediatorAPI",
	"sap/base/util/merge",
	"sap/base/util/ObjectPath"
], function(
	Base,
	DelegateMediatorAPI,
	merge,
	ObjectPath
) {
	"use strict";

	function isFunction(fn) {
		return typeof fn === "function";
	}

	function getModelType(mChangeContent) {
		if (mChangeContent.modelType) {
			return mChangeContent.modelType;
		} else if (mChangeContent.oDataServiceVersion) {
			// fallback for changes created with old addODataProperty action
			// that was replaced by default OData V2 delegate
			return "sap.ui.model.odata.v2.ODataModel";
		}
	}

	/**
	 * Base Change Handler for AddViaDelegate
	 *
	 * @constructor
	 * @alias sap.ui.fl.changeHandler.BaseAddViaDelegate
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @experimental Since 1.81
	 */
	var BaseAddViaDelegate = {

		/**
		 * Returns an instance of the addViaDelegate change handler
		 * @param  {object} mAddViaDelegateSettings - The settings required for the addViaDelegate action
		 * @param  {function} mAddViaDelegateSettings.addProperty - Hook to actually add the controls from the delegate
		 * @param  {function} [mAddViaDelegateSettings.revertAdditionalControls] - Hook revert controls that will not automatically be removed by removing the new property
		 * @param  {string} mAddViaDelegateSettings.aggregationName - Aggregation name to be passed to the delegate
		 * @param  {string} mAddViaDelegateSettings.parentAlias - Alias for the parent control in the change
		 * @param  {function} [mAddViaDelegateSettings.mapParentIdIntoChange] - Option to store a different control as parent in the change
		 * @param  {string} mAddViaDelegateSettings.fieldSuffix - Aggregation name to be passed to the delegate
		 * @param  {boolean|function} [mAddViaDelegateSettings.skipCreateLabel] - Skip delegate method, is a function is passed it has to return a boolean
		 * @param  {boolean|function} [mAddViaDelegateSettings.skipCreateLayout] - Skip delegate method, is a function is passed it has to return a boolean
		 * @param  {boolean} [mAddViaDelegateSettings.supportsDefault] - Are default delegates supported?
		 * @return {any} The addViaDelegate change handler object
		 * @public
		 */
		createAddViaDelegateChangeHandler: function(mAddViaDelegateSettings) {
			/****************** Utility functions with access to mAddViaDelegateSettings ******************/

			function getNewFieldId(sNewPropertyId) {
				return sNewPropertyId + mAddViaDelegateSettings.fieldSuffix;
			}

			function skipCreateLabel(mChangeDefinition) {
				if (isFunction(mAddViaDelegateSettings.skipCreateLabel)) {
					return !!mAddViaDelegateSettings.skipCreateLabel({
						changeDefinition: mChangeDefinition
					});
				}
				return !!mAddViaDelegateSettings.skipCreateLabel;
			}

			function skipCreateLayout(mChangeDefinition) {
				if (isFunction(mAddViaDelegateSettings.skipCreateLayout)) {
					return !!mAddViaDelegateSettings.skipCreateLayout({
						changeDefinition: mChangeDefinition
					});
				}
				return !!mAddViaDelegateSettings.skipCreateLayout;
			}

			function getDelegateControlForPropertyAndLabel(mChangeDefinition, mDelegatePropertyBag, oDelegate) {
				var mDelegateSettings = merge({}, mDelegatePropertyBag);
				mDelegateSettings.fieldSelector.id = getNewFieldId(mDelegateSettings.fieldSelector.id);
				return oDelegate.createControlForProperty(mDelegateSettings)
					.then(function(mSpecificControlInfo) {
						if (skipCreateLabel(mChangeDefinition)) {
							return mSpecificControlInfo;
						}
						var sNewFieldId = mDelegatePropertyBag.modifier.getId(mSpecificControlInfo.control);
						mDelegatePropertyBag.labelFor = sNewFieldId;
						return oDelegate.createLabel(mDelegatePropertyBag).then(function(oLabel) {
							return {
								label: oLabel,
								control: mSpecificControlInfo.control,
								valueHelp: mSpecificControlInfo.valueHelp
							};
						});
					});
			}

			function getControlsFromDelegate(mChangeDefinition, mDelegate, mPropertyBag) {
				var mDelegatePropertyBag = merge({
					aggregationName: mAddViaDelegateSettings.aggregationName,
					payload: mDelegate.payload || {}
				}, mPropertyBag);
				var oDelegate = mDelegate.instance;

				return Promise.resolve()
					.then(function() {
						if (
							isFunction(oDelegate.createLayout)
							&& !skipCreateLayout(mChangeDefinition)
						) {
							return oDelegate.createLayout(mDelegatePropertyBag);
						}
					})
					.then(function(mLayoutControlInfo) {
						if (ObjectPath.get("control", mLayoutControlInfo)) {
							mLayoutControlInfo.layoutControl = true;
							return mLayoutControlInfo;
						}
						return getDelegateControlForPropertyAndLabel(mChangeDefinition, mDelegatePropertyBag, oDelegate);
					});
			}

			/****************** Change Handler ******************/
			return {
				/**
				 * Added a property from the model's metadata via delegate
				 *
				 * @param {sap.ui.fl.Change} oChange - change object with instructions to be applied on the control map
				 * @param {sap.ui.core.Control} oControl - Control that matches the change selector for applying the change
				 * @param {object} mPropertyBag - property bag
				 * @param {object} mPropertyBag.modifier - modifier for the controls
				 * @param {object} mPropertyBag.view - application view
				 * @returns {Promise<undefined>} to wait for execution
				 * @public
				 */
				applyChange : function(oChange, oControl, mPropertyBag) {
					var mChangeDefinition = oChange.getDefinition();
					var oAppComponent = mPropertyBag.appComponent;
					var mChangeContent = mChangeDefinition.content;
					var mFieldSelector = mChangeContent.newFieldSelector;
					var mCreateProperties = {
						appComponent: mPropertyBag.appComponent,
						view: mPropertyBag.view,
						fieldSelector: mFieldSelector,
						bindingPath: mChangeContent.bindingPath,
						modifier: mPropertyBag.modifier,
						element: oControl
					};
					// Check if the change is applicable
					if (mPropertyBag.modifier.bySelector(mFieldSelector, oAppComponent)) {
						return Base.markAsNotApplicable(
							"Control to be created already exists:" + (mFieldSelector.id || mFieldSelector),
							/*bAsync*/true
						);
					}
					var oRevertData = {
						newFieldSelector: mFieldSelector
					};
					//revert data will be enhanced later on, but should be attached to the change so that the addProperty-hook can access it and enhance it
					oChange.setRevertData(oRevertData);


					var sModelType = getModelType(mChangeContent);

					return DelegateMediatorAPI.getDelegateForControl({
						control: oControl,
						modifier: mPropertyBag.modifier,
						modelType: sModelType,
						supportsDefault: mAddViaDelegateSettings.supportsDefault
					}).then(function (mDelegate) {
						return getControlsFromDelegate(mChangeDefinition, mDelegate, mCreateProperties);
					}).then(function(mInnerControls) {
						var mAddPropertySettings = merge({},
							{
								control: oControl,
								innerControls: mInnerControls,
								change : oChange
							},
							mPropertyBag
						);
						//------------------------
						//Call 'addProperty' hook!
						//------------------------
						mAddViaDelegateSettings.addProperty(mAddPropertySettings);

						if (mInnerControls.valueHelp) {
							var oValueHelpSelector = mPropertyBag.modifier.getSelector(mPropertyBag.modifier.getId(mInnerControls.valueHelp), oAppComponent);
							oRevertData.valueHelpSelector = oValueHelpSelector;
						}
					});
				},

				/**
				 * Reverts an applied addViaDelegate Change
				 *
				 * @param {sap.ui.fl.Change} oChange change wrapper object with instructions to be applied on the control map
				 * @param {sap.ui.core.Control} oControl Control that matches the change selector for applying the change
				 * @param {object} mPropertyBag property bag
				 * @param {object} mPropertyBag.modifier modifier for the controls
				 * @param {object} mPropertyBag.appComponent Component in which the change should be applied
				 * @return {boolean} True if successful
				 * @public
				 */
				revertChange : function(oChange, oControl, mPropertyBag) {
					var oAppComponent = mPropertyBag.appComponent;
					var oModifier = mPropertyBag.modifier;
					var mFieldSelector = oChange.getRevertData().newFieldSelector;
					var mValueHelpSelector = oChange.getRevertData().valueHelpSelector;

					var oNewField = oModifier.bySelector(mFieldSelector, oAppComponent);

					var oParentControl = oChange.getDependentControl(mAddViaDelegateSettings.parentAlias, mPropertyBag)
						|| /*fallback and legacy changes*/ oControl;
					oModifier.removeAggregation(oParentControl, mAddViaDelegateSettings.aggregationName, oNewField);
					oModifier.destroy(oNewField);

					if (mValueHelpSelector) {
						var oValueHelp = oModifier.bySelector(mValueHelpSelector, oAppComponent);
						oModifier.removeAggregation(oParentControl, "dependents", oValueHelp);
						oModifier.destroy(oValueHelp);
					}
					var mAddPropertySettings = merge({},
						{
							control: oControl,
							change : oChange
						},
						mPropertyBag
					);

					if (isFunction(mAddViaDelegateSettings.revertAdditionalControls)) {
						//-------------------------------------
						//Call 'revertAdditionalControls' hook!
						//-------------------------------------
						mAddViaDelegateSettings.revertAdditionalControls(mAddPropertySettings);
					}

					oChange.resetRevertData();
					return true;
				},

				/**
				 * Completes the change by adding change handler specific content
				 *
				 * @param {sap.ui.fl.Change} oChange Change wrapper object to be completed
				 * @param {Object} mSpecificChangeInfo Information specific to this change
				 * @param {string} mSpecificChangeInfo.newControlId The control ID for the control to be added
				 * @param {string} mSpecificChangeInfo.bindingPath The binding path for the new control
				 * @param {string} mSpecificChangeInfo.parentId FormContainer where the new control will be added
				 * @param {number} mSpecificChangeInfo.index The index where the field will be added
				 * @param {string} [mSpecificChangeInfo.oDataServiceVersion] The OData service version
				 * @param {string} [mSpecificChangeInfo.modelType] Then UI5 model type name, only pass it if default delegate should be taken
				 * @param {Object} mPropertyBag The property bag containing the App Component
				 * @param {object} mPropertyBag.modifier Modifier for the controls
				 * @param {object} mPropertyBag.appComponent Application component
				 * @param {object} mPropertyBag.view Application view
				 * @public
				 */
				completeChangeContent : function(oChange, mSpecificChangeInfo, mPropertyBag) {
					var oAppComponent = mPropertyBag.appComponent;
					var mChangeDefinition = oChange.getDefinition();
					if (!mChangeDefinition.content) {
						mChangeDefinition.content = {};
					}
					if (mSpecificChangeInfo.parentId) {
						if (isFunction(mAddViaDelegateSettings.mapParentIdIntoChange)) {
							mAddViaDelegateSettings.mapParentIdIntoChange(oChange, mSpecificChangeInfo, mPropertyBag);
						} else {
							oChange.addDependentControl(mSpecificChangeInfo.parentId, mAddViaDelegateSettings.parentAlias, mPropertyBag);
						}
					} else {
						throw new Error("mSpecificChangeInfo.parentId attribute required");
					}
					if (mSpecificChangeInfo.bindingPath) {
						mChangeDefinition.content.bindingPath = mSpecificChangeInfo.bindingPath;
					} else {
						throw new Error("mSpecificChangeInfo.bindingPath attribute required");
					}
					if (mSpecificChangeInfo.newControlId) {
						mChangeDefinition.content.newFieldSelector = mPropertyBag.modifier.getSelector(mSpecificChangeInfo.newControlId, oAppComponent);
					} else {
						throw new Error("mSpecificChangeInfo.newControlId attribute required");
					}
					if (mSpecificChangeInfo.index === undefined) {
						throw new Error("mSpecificChangeInfo.targetIndex attribute required");
					} else {
						mChangeDefinition.content.newFieldIndex = mSpecificChangeInfo.index;
					}
					if (mSpecificChangeInfo.oDataServiceVersion) {
						//used to connect to change handler mediator
						mChangeDefinition.content.oDataServiceVersion = mSpecificChangeInfo.oDataServiceVersion;
					}
					if (mSpecificChangeInfo.modelType && mAddViaDelegateSettings.supportsDefault) {
						//used to connect to default delegate
						mChangeDefinition.content.modelType = mSpecificChangeInfo.modelType;
					}
				}
			};
		}
	};
	return BaseAddViaDelegate;
});
