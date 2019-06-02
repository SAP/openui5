/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/write/ChangesController",
	"sap/ui/fl/Utils",
	"sap/ui/fl/Change",
	"sap/ui/core/Component",
	"sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory",
	"sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory",
	"sap/ui/core/Element",
	"sap/base/util/includes"
], function(
	ChangesController,
	Utils,
	Change,
	Component,
	DescriptorInlineChangeFactory,
	DescriptorChangeFactory,
	Element,
	includes
) {
	"use strict";
	/**
	 * Provides an API to handle functionality for {@link sap.ui.fl.Changes} on a Flex Persistence instance.
	 *
	 * @namespace
	 * @name sap.ui.fl.write.ChangesWriteAPI
	 * @author SAP SE
	 * @experimental Since 1.68
	 * @since 1.68
	 * @version ${version}
	 * @public
	 *
	 */
	var ChangesWriteAPI = {
		/**
		 * Create a change on the flex persistence.
		 *
		 * @param {object} oChangeSpecificData - Property bag holding the change information {@see sap.ui.fl.Change#createInitialFileContent}
		 * The property "oChangeSpecificData.packageName" is set to $TMP and internally since flex changes are always local when they are created.
		 * @param {sap.ui.base.ManagedObject | object} vSelector - Managed Object or selector object
		 * @param {string} [oControl.id] - ID of the control if a selector object is passed
		 * @param {sap.ui.core.Component} [oControl.appComponent] - Application component of the control at runtime if a selector object is passed
		 * @param {string} [oControl.controlType] - Control type of the control iif a selector object is passed
		 *
		 * @returns {Promise | sap.ui.fl.Change} If descriptor change then a promise resolves to the created change.
		 * For flex change the created change object is returned.
		 * @public
		 */
		create: function(oChangeSpecificData, vSelector) {
			// descriptor change
			if (includes(DescriptorInlineChangeFactory.getDescriptorChangeTypes(), oChangeSpecificData.changeType)) {
				return DescriptorInlineChangeFactory.createDescriptorInlineChange(
					oChangeSpecificData.changeType, oChangeSpecificData.content, oChangeSpecificData.texts
				)
					.then(function (oAppDescriptorChangeContent) {
						return new DescriptorChangeFactory().createNew(
							oChangeSpecificData.reference, oAppDescriptorChangeContent, oChangeSpecificData.layer, vSelector
						);
					});
			}

			// flex change
			var oFlexController = ChangesController.getFlexControllerInstance(vSelector.appComponent || vSelector);
			if (vSelector instanceof Component) {
				return oFlexController.createBaseChange(oChangeSpecificData, vSelector);
			}
			return oFlexController.createChange(oChangeSpecificData, vSelector);
		},

		/**
		 * Check if change handler applicable to the passed change and control has revertChange().
		 * If no change handler is given it will get the change handler from the change and control.
		 *
		 * @param {sap.ui.fl.Change} oChange - Change object
		 * @param {sap.ui.core.Control | object} vSelector - Control instance or selector object
		 * @param {string} [oControl.id] - ID of the control if a selector object is passed
		 * @param {sap.ui.core.Component} [oControl.appComponent] - Application component of the control at runtime if a selector object is passed
		 * @param {string} [oControl.controlType] - Control type of the control iif a selector object is passed
		 *
		 * @returns {boolean} Returns true if change handler has revertChange function
		 * @public
		 */
		isChangeHandlerRevertible: function(oChange, vSelector) {
			return ChangesController.getFlexControllerInstance(vSelector.appComponent || vSelector)
				.isChangeHandlerRevertible(oChange, vSelector);
		},


		/**
		 * Returns the control map containing control and control type
		 *

		 * @param {map} mPropertyBag - contains additional data that are needed for reading of changes
		 * @param {sap.ui.fl.Change} mPropertyBag.change - Change to be evaluated if template is affected
		 * @params {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - The control tree modifier
		 * @params {sap.ui.core.Component} mPropertyBag.appComponent - app component instance that is currently loading
		 * @param {string} [mPropertyBag.view] - For XML processing only: XML node of the view
		 * @param {sap.ui.core.Control} oControl - Control which is the target of the passed change
		 *
		 * @returns {object} Returns an object containing control, control type and if template was affected
		 * @public
		 */
		getControlIfTemplateAffected: function(mPropertyBag, oControl) {
			return ChangesController.getFlexControllerInstance(mPropertyBag.appComponent)
			// TODO: parameters should be change internally
				._getControlIfTemplateAffected(mPropertyBag.change, oControl, oControl.getMetadata().getName(), mPropertyBag);
		},

		/**
		 * Determines if user specific changes or variants are present in the flex persistence.
		 *
		 * @param {map} [mPropertyBag] - Contains additional data needed for checking personalization, will be passed to FlexController.getComponentChanges
		 * @param {string} [mPropertyBag.upToLayer] - layer to compare with
		 * @param {boolean} [mPropertyBag.ignoreMaxLayerParameter] - Indicates that personalization shall be checked without max layer filtering
		 * @param {sap.ui.base.ManagedObject} oManagedObject - To retrieve the associated flex persistence
		 * @returns {Promise} Resolves with a boolean; true if a personalization change created during runtime is active in the application
		 * @public
		 */
		hasHigherLayerChanges: function (mPropertyBag, oManagedObject) {
			return ChangesController.getFlexControllerInstance(oManagedObject)
				.hasHigherLayerChanges(mPropertyBag);
		},

		/**
		 * Applying a specific change on the passed control, if it is not already applied.
		 *
		 * @param {sap.ui.fl.Change} oChange - Change object which should be applied on the passed control
		 * @param {sap.ui.core.Control} oControl - Control which is the target of the passed change
		 * @param {object} mPropertyBag - Change application properties
		 * @param {object} mPropertyBag.modifier - Polymorph reuse operations handling the changes on the given view type
		 * @param {object} mPropertyBag.appDescriptor - App descriptor containing the metadata of the current application
		 * @param {object} mPropertyBag.appComponent - Component instance that is currently loading
		 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Returns promise that is resolved after all changes were reverted in asynchronous case or FakePromise for the synchronous processing scenario
		 * @public
		 */
		apply: function(oChange, oControl, mPropertyBag) {
			var oFlexController = ChangesController.getFlexControllerInstance(mPropertyBag.appComponent);
			var bDependenciesExist = oFlexController.checkForOpenDependenciesForControl(oChange.getSelector(), mPropertyBag.modifier, mPropertyBag.appComponent);
			if (!bDependenciesExist && oControl instanceof Element) {
				return oFlexController.checkTargetAndApplyChange(oChange, oControl, mPropertyBag);
			}
			// TODO: Descriptor apply function
			return Promise.reject(new Error("The following Change cannot be applied because of a dependency: " + oChange.getId()));
		}
	};
	return ChangesWriteAPI;
}, true);