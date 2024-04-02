/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/changeHandler/condenser/Classification",
	"sap/ui/fl/changeHandler/Base",
	"sap/ui/fl/requireAsync",
	"sap/base/util/merge",
	"sap/base/util/ObjectPath"
], function(
	CondenserClassification,
	Base,
	requireAsync,
	merge,
	ObjectPath
) {
	"use strict";

	function isFunction(fn) {
		return typeof fn === "function";
	}

	/**
	 * Base Change Handler for AddViaDelegate
	 *
	 * @constructor
	 * @alias sap.ui.fl.changeHandler.BaseAddViaDelegate
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 */
	const BaseAddViaDelegate = {

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
		 * @return {any} The addViaDelegate change handler object
		 * @public
		 */
		createAddViaDelegateChangeHandler(mAddViaDelegateSettings) {
			/** **************** Utility functions with access to mAddViaDelegateSettings ******************/

			function getNewFieldId(sNewPropertyId) {
				return sNewPropertyId + mAddViaDelegateSettings.fieldSuffix;
			}

			function evaluateSettingsFlag(oChangeODataInformation, sSetting) {
				if (isFunction(mAddViaDelegateSettings[sSetting])) {
					return !!mAddViaDelegateSettings[sSetting](oChangeODataInformation);
				}
				return !!mAddViaDelegateSettings[sSetting];
			}

			function skipCreateLabel(oChangeODataInformation) {
				return evaluateSettingsFlag(oChangeODataInformation, "skipCreateLabel");
			}

			function skipCreateLayout(oChangeODataInformation) {
				return evaluateSettingsFlag(oChangeODataInformation, "skipCreateLayout");
			}

			async function checkCondensingEnabled(mChange, mPropertyBag) {
				// createLayout side effects might break condensing
				// Only enable condensing if the delegate doesn't create a layout
				// or the handler opts out

				const oControl = mPropertyBag.modifier.bySelector(mChange.getSelector(), mPropertyBag.appComponent);

				const DelegateMediatorAPI = await requireAsync("sap/ui/fl/apply/api/DelegateMediatorAPI");
				const oDelegate = await DelegateMediatorAPI.getWriteDelegateForControl({
					control: oControl,
					modifier: mPropertyBag.modifier
				});
				const bCondensingSupported = !isFunction(oDelegate.instance.createLayout);
				return bCondensingSupported || skipCreateLayout(mChange.getSupportInformation().oDataInformation);
			}

			async function getDelegateControlForPropertyAndLabel(oChangeODataInformation, mDelegatePropertyBag, oDelegate) {
				const mDelegateSettings = merge({}, mDelegatePropertyBag);
				mDelegateSettings.fieldSelector.id = getNewFieldId(mDelegateSettings.fieldSelector.id);
				const mSpecificControlInfo = await oDelegate.createControlForProperty(mDelegateSettings);
				if (skipCreateLabel(oChangeODataInformation)) {
					return mSpecificControlInfo;
				}
				const sNewFieldId = mDelegatePropertyBag.modifier.getId(mSpecificControlInfo.control);
				mDelegatePropertyBag.labelFor = sNewFieldId;
				const oLabel = await oDelegate.createLabel(mDelegatePropertyBag);
				return {
					label: oLabel,
					control: mSpecificControlInfo.control,
					valueHelp: mSpecificControlInfo.valueHelp
				};
			}

			async function getControlsFromDelegate(oChangeContent, mDelegate, mPropertyBag, oChangeODataInformation) {
				if (!mDelegate) {
					return undefined;
				}
				const mDelegatePropertyBag = merge({
					aggregationName: mAddViaDelegateSettings.aggregationName,
					payload: mDelegate.payload || {},
					parentSelector: oChangeContent.parentId
				}, mPropertyBag);
				const oDelegate = mDelegate.instance;
				let mLayoutControlInfo;
				if (
					isFunction(oDelegate.createLayout)
						&& !skipCreateLayout(oChangeODataInformation)
				) {
					mLayoutControlInfo = await oDelegate.createLayout(mDelegatePropertyBag);
				}
				if (ObjectPath.get("control", mLayoutControlInfo)) {
					mLayoutControlInfo.layoutControl = true;
					return mLayoutControlInfo;
				}
				return getDelegateControlForPropertyAndLabel(oChangeODataInformation, mDelegatePropertyBag, oDelegate);
			}

			/** **************** Change Handler ******************/
			return {
				/**
				 * Added a property from the model's metadata via delegate
				 *
				 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - change object with instructions to be applied on the control map
				 * @param {sap.ui.core.Control} oControl - Control that matches the change selector for applying the change
				 * @param {object} mPropertyBag - property bag
				 * @param {object} mPropertyBag.modifier - modifier for the controls
				 * @param {object} mPropertyBag.view - application view
				 * @returns {Promise<undefined>} to wait for execution
				 * @public
				 */
				async applyChange(oChange, oControl, mPropertyBag) {
					const oAppComponent = mPropertyBag.appComponent;
					const oChangeContent = oChange.getContent();
					const oChangeODataInformation = oChange.getSupportInformation().oDataInformation;
					const mFieldSelector = oChangeContent.newFieldSelector;
					const mCreateProperties = {
						appComponent: mPropertyBag.appComponent,
						view: mPropertyBag.view,
						fieldSelector: mFieldSelector,
						bindingPath: oChangeContent.bindingPath,
						modifier: mPropertyBag.modifier,
						element: oControl
					};
					// Check if the change is applicable
					if (mPropertyBag.modifier.bySelector(mFieldSelector, oAppComponent, mPropertyBag.view)) {
						await Base.markAsNotApplicable(
							`Control to be created already exists:${mFieldSelector.id || mFieldSelector}`,
							/* bAsync */true
						);
						return;
					}
					const oRevertData = {
						newFieldSelector: mFieldSelector
					};
					// revert data will be enhanced later on, but should be attached to the change
					// so that the addProperty-hook can access it and enhance it
					oChange.setRevertData(oRevertData);

					const DelegateMediatorAPI = await requireAsync("sap/ui/fl/apply/api/DelegateMediatorAPI");
					const mDelegate = await DelegateMediatorAPI.getWriteDelegateForControl({
						control: oControl,
						modifier: mPropertyBag.modifier
					});
					if (!mDelegate) {
						Base.markAsNotApplicable(
							`No delegate found for control ${mPropertyBag.modifier.getId(oControl)}`,
							/* bAsync */false
						);
					}
					const mInnerControls = await getControlsFromDelegate(
						oChangeContent,
						mDelegate,
						mCreateProperties,
						oChangeODataInformation
					);
					const mAddPropertySettings = merge({},
						{
							control: oControl,
							innerControls: mInnerControls,
							change: oChange
						},
						mPropertyBag
					);
					//------------------------
					// Call 'addProperty' hook!
					//------------------------
					await mAddViaDelegateSettings.addProperty(mAddPropertySettings);
					if (mInnerControls.valueHelp) {
						const oValueHelpSelector = mPropertyBag.modifier.getSelector(
							mPropertyBag.modifier.getId(mInnerControls.valueHelp),
							oAppComponent
						);
						const oRevertData = oChange.getRevertData();
						oRevertData.valueHelpSelector = oValueHelpSelector;
						oChange.setRevertData(oRevertData);
					}
				},

				/**
				 * Reverts an applied addViaDelegate Change
				 *
				 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange change wrapper object with instructions to be applied on the control map
				 * @param {sap.ui.core.Control} oControl Control that matches the change selector for applying the change
				 * @param {object} mPropertyBag property bag
				 * @param {object} mPropertyBag.modifier modifier for the controls
				 * @param {object} mPropertyBag.appComponent Component in which the change should be applied
				 * @return {boolean} True if successful
				 * @public
				 */
				async revertChange(oChange, oControl, mPropertyBag) {
					const oAppComponent = mPropertyBag.appComponent;
					const oModifier = mPropertyBag.modifier;
					const mFieldSelector = oChange.getRevertData().newFieldSelector;
					const mValueHelpSelector = oChange.getRevertData().valueHelpSelector;

					const oNewField = oModifier.bySelector(mFieldSelector, oAppComponent);

					const oParentControl = oChange.getDependentControl(mAddViaDelegateSettings.parentAlias, mPropertyBag)
						|| /* fallback and legacy changes */ oControl;

					await oModifier.removeAggregation(oParentControl, mAddViaDelegateSettings.aggregationName, oNewField);
					await oModifier.destroy(oNewField);
					if (mValueHelpSelector) {
						const oValueHelp = oModifier.bySelector(mValueHelpSelector, oAppComponent);
						await oModifier.removeAggregation(oParentControl, "dependents", oValueHelp);
						await oModifier.destroy(oValueHelp);
					}
					const mAddPropertySettings = merge({},
						{
							control: oControl,
							change: oChange
						},
						mPropertyBag
					);

					if (isFunction(mAddViaDelegateSettings.revertAdditionalControls)) {
						//-------------------------------------
						// Call 'revertAdditionalControls' hook!
						//-------------------------------------
						await mAddViaDelegateSettings.revertAdditionalControls(mAddPropertySettings);
						oChange.resetRevertData();
					}
				},

				/**
				 * Completes the change by adding change handler specific content
				 *
				 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange Change wrapper object to be completed
				 * @param {Object} mSpecificChangeInfo Information specific to this change
				 * @param {string} mSpecificChangeInfo.newControlId The control ID for the control to be added
				 * @param {string} mSpecificChangeInfo.bindingPath The binding path for the new control
				 * @param {string} mSpecificChangeInfo.parentId FormContainer where the new control will be added
				 * @param {number} mSpecificChangeInfo.index The index where the field will be added
				 * @param {string} [mSpecificChangeInfo.oDataServiceVersion] The OData service version
				 * @param {Object} mPropertyBag The property bag containing the App Component
				 * @param {object} mPropertyBag.modifier Modifier for the controls
				 * @param {object} mPropertyBag.appComponent Application component
				 * @param {object} mPropertyBag.view Application view
				 * @public
				 */
				completeChangeContent(oChange, mSpecificChangeInfo, mPropertyBag) {
					const oAppComponent = mPropertyBag.appComponent;
					const oContent = {};
					if (mSpecificChangeInfo.parentId) {
						if (isFunction(mAddViaDelegateSettings.mapParentIdIntoChange)) {
							mAddViaDelegateSettings.mapParentIdIntoChange(oChange, mSpecificChangeInfo, mPropertyBag);
						} else {
							oChange.addDependentControl(mSpecificChangeInfo.parentId, mAddViaDelegateSettings.parentAlias, mPropertyBag);
						}
						try {
							oContent.parentId = mPropertyBag.modifier.getSelector(mSpecificChangeInfo.parentId, oAppComponent);
						} catch (e) {
							// If the parentId is not stable, e.g. in the case of SimpleForm groups
							// don't set the parentId. This error is safe to ignore as a missing parentId
							// will disable condensing
						}
					} else {
						throw new Error("mSpecificChangeInfo.parentId attribute required");
					}
					if (mSpecificChangeInfo.bindingPath) {
						oContent.bindingPath = mSpecificChangeInfo.bindingPath;
					} else {
						throw new Error("mSpecificChangeInfo.bindingPath attribute required");
					}
					if (mSpecificChangeInfo.newControlId) {
						oContent.newFieldSelector = mPropertyBag.modifier.getSelector(mSpecificChangeInfo.newControlId, oAppComponent);
					} else {
						throw new Error("mSpecificChangeInfo.newControlId attribute required");
					}
					if (mSpecificChangeInfo.index === undefined) {
						throw new Error("mSpecificChangeInfo.targetIndex attribute required");
					} else {
						oContent.newFieldIndex = mSpecificChangeInfo.index;
					}
					if (mSpecificChangeInfo.oDataServiceVersion) {
						// used to connect to change handler mediator
						oContent.oDataServiceVersion = mSpecificChangeInfo.oDataServiceVersion;
					}
					oChange.setContent(oContent);
				},

				getChangeVisualizationInfo(oChange) {
					const oRevertData = oChange.getRevertData();
					if (oRevertData && oRevertData.labelSelector) {
						return {
							affectedControls: [oRevertData.labelSelector]
						};
					}
					return {
						affectedControls: [oChange.getContent().newFieldSelector]
					};
				},

				async getCondenserInfo(oChange, mPropertyBag) {
					const bCondensingEnabled = await checkCondensingEnabled(oChange, mPropertyBag);
					if (!bCondensingEnabled) {
						return undefined;
					}

					if (
						!oChange.getContent().newFieldSelector
							|| !oChange.getContent().parentId
							|| !mAddViaDelegateSettings.aggregationName
					) {
						return undefined;
					}

					return {
						affectedControl: oChange.getContent().newFieldSelector,
						classification: CondenserClassification.Create,
						targetContainer: oChange.getContent().parentId,
						targetAggregation: mAddViaDelegateSettings.aggregationName,
						setTargetIndex(oChange, iNewTargetIndex) {
							const oChangeContent = oChange.getContent();
							oChangeContent.newFieldIndex = iNewTargetIndex;
							oChange.setContent(oChangeContent);
						},
						getTargetIndex(oChange) {
							return oChange.getContent().newFieldIndex;
						}
					};
				}
			};
		}
	};
	return BaseAddViaDelegate;
});
