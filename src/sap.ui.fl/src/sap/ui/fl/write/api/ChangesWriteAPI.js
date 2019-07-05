/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/write/internal/ChangesController",
	"sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory",
	"sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory",
	"sap/base/Log",
	"sap/ui/core/Component",
	"sap/ui/core/Element",
	"sap/base/util/includes",
	"sap/ui/core/util/reflection/JsControlTreeModifier"
], function(
	ChangesController,
	DescriptorInlineChangeFactory,
	DescriptorChangeFactory,
	Log,
	Component,
	Element,
	includes,
	JsControlTreeModifier
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
		 * @param {sap.ui.fl.Selector} vSelector - Managed Object or selector object
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
					})
					.catch(function(oError) {
						Log.error("the change could not be created.", oError.message);
						throw oError;
					});
			}

			// flex change
			var oFlexController = ChangesController.getFlexControllerInstance(vSelector);
			// if a component instance is passed only a base change is created
			if (vSelector instanceof Component) {
				return oFlexController.createBaseChange(oChangeSpecificData, vSelector);
			}
			// in other cases if a control instance or selector is passed then change handler's completeChangeContent() is called
			return oFlexController.createChange(oChangeSpecificData, vSelector);
		},

		/**
		 * Applying a specific change on the passed control, if it is not already applied.
		 *
		 * @param {sap.ui.fl.Change} oChange - Change object which should be applied on the passed control
		 * @param {sap.ui.core.Element} oElement - Element instance on which change should be applied
		 * @param {object} mPropertyBag - Change application properties
		 * @param {object} mPropertyBag.modifier - Modifier used to apply change
		 * @param {object} mPropertyBag.appDescriptor - App descriptor containing the metadata of the current application
		 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Returns promise that is resolved after all changes were reverted in asynchronous case or FakePromise for the synchronous processing scenario
		 * @public
		 */
		apply: function(oChange, oElement, mPropertyBag) {
			var oFlexController = ChangesController.getFlexControllerInstance(oElement);
			mPropertyBag.appComponent = ChangesController.getAppComponentForSelector(oElement);
			var bDependenciesExist = oFlexController.checkForOpenDependenciesForControl(oChange.getSelector(), mPropertyBag.modifier, mPropertyBag.appComponent);
			if (!bDependenciesExist && oElement instanceof Element) {
				return oFlexController.checkTargetAndApplyChange(oChange, oElement, mPropertyBag);
			}
			// TODO: Descriptor apply function
			return Promise.reject(new Error("The following Change cannot be applied because of a dependency: " + oChange.getId()));
		},

		/**
		 * Reverting a specific change on the passed control, if it is already applied or is in the process of being applied.
		 *
		 * @param {sap.ui.fl.Change} oChange - Change object which should be applied on the passed control
		 * @param {sap.ui.core.Element} oElement - Element instance on which change should be reverted
		 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Returns promise that is resolved after all changes were reverted in asynchronous case or FakePromise for the synchronous processing scenario
		 * @public
		 */
		revert: function(oChange, oElement) {
			var oAppComponent = ChangesController.getAppComponentForSelector(oElement);
			var mPropertyBag = {
				modifier: JsControlTreeModifier,
				appComponent: oAppComponent
			};
			return ChangesController.getFlexControllerInstance(oElement)
				._revertChange(oChange, oElement, mPropertyBag);
		},

		/**
		 * Check if change handler applicable to the passed change and control has revertChange().
		 * If no change handler is given it will get the change handler from the change and control.
		 *
		 * @param {sap.ui.fl.Selector} vSelector - Selector object
		 * @param {sap.ui.fl.Change} oChange - Change object
		 *
		 * @returns {boolean} Returns true if change handler has revertChange function
		 * @private
		 */
		_isChangeHandlerRevertible: function(vSelector, oChange) {
			// TODO: Remove function after RTA undo logic is removed
			var oFlexController = ChangesController.getFlexControllerInstance(vSelector);
			var sControlType = JsControlTreeModifier.getControlType(vSelector);
			var mControl = oFlexController._getControlIfTemplateAffected(oChange, vSelector, sControlType, {
				modifier: JsControlTreeModifier,
				appComponent: ChangesController.getAppComponentForSelector(vSelector)
			});
			return oFlexController.isChangeHandlerRevertible(oChange, mControl.control);
		}
	};
	return ChangesWriteAPI;
}, true);