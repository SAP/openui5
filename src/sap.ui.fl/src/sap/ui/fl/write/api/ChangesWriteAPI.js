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
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/Utils"
], function(
	ChangesController,
	DescriptorInlineChangeFactory,
	DescriptorChangeFactory,
	Log,
	Component,
	Element,
	includes,
	JsControlTreeModifier,
	flexUtils
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
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {object} mPropertyBag.changeSpecificData - Property bag holding the change information {@see sap.ui.fl.Change#createInitialFileContent}
		 * The property "mPropertyBag.changeSpecificData.packageName" is set to $TMP and internally since flex changes are always local when they are created.
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Managed Object or selector object
		 *
		 * @returns {Promise | sap.ui.fl.Change} If descriptor change then a promise resolves to the created change.
		 * For flex change the created change object is returned.
		 * @public
		 */
		create: function(mPropertyBag) {
			var oFlexController;
			// descriptor change
			if (includes(DescriptorInlineChangeFactory.getDescriptorChangeTypes(), mPropertyBag.changeSpecificData.changeType)) {
				oFlexController = ChangesController.getDescriptorFlexControllerInstance(mPropertyBag.selector);
				var sReference = oFlexController.getComponentName();
				var sLayer;
				if (mPropertyBag.changeSpecificData.layer) {
					// Smart business must pass the layer as a part of ChangeSpecificData
					// If not passed, layer CUSTOMER will be set
					sLayer = mPropertyBag.changeSpecificData.layer;
					delete mPropertyBag.changeSpecificData.layer;
				}

				return DescriptorInlineChangeFactory.createDescriptorInlineChange(
					mPropertyBag.changeSpecificData.changeType, mPropertyBag.changeSpecificData.content, mPropertyBag.changeSpecificData.texts
				)
					.then(function (oAppDescriptorChangeContent) {
						return new DescriptorChangeFactory().createNew(
							sReference, oAppDescriptorChangeContent, sLayer, mPropertyBag.selector
						);
					})
					.catch(function(oError) {
						Log.error("the change could not be created.", oError.message);
						throw oError;
					});
			}

			// flex change
			oFlexController = ChangesController.getFlexControllerInstance(mPropertyBag.selector);
			// if a component instance is passed only a base change is created
			if (mPropertyBag.selector instanceof Component) {
				return oFlexController.createBaseChange(mPropertyBag.changeSpecificData, mPropertyBag.selector);
			}
			// in other cases if a control instance or selector is passed then change handler's completeChangeContent() is called
			return oFlexController.createChange(mPropertyBag.changeSpecificData, mPropertyBag.selector);
		},

		/**
		 * Applying a specific change on the passed control, if it is not already applied.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Change} mPropertyBag.change - Change object which should be applied on the passed control
		 * @param {sap.ui.core.Element} mPropertyBag.element - Element instance on which change should be applied
		 * @param {object} [mPropertyBag.modifier] - Modifier used to apply change
		 * @param {object} mPropertyBag.appDescriptor - App descriptor containing the metadata of the current application
		 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Returns promise that is resolved after all changes were reverted in asynchronous case or FakePromise for the synchronous processing scenario
		 * @public
		 */
		apply: function(mPropertyBag) {
			var oFlexController = ChangesController.getFlexControllerInstance(mPropertyBag.element);
			mPropertyBag.appComponent = ChangesController.getAppComponentForSelector(mPropertyBag.element);
			if (!mPropertyBag.modifier) {
				mPropertyBag.modifier = JsControlTreeModifier;
			}
			var bDependenciesExist = oFlexController.checkForOpenDependenciesForControl(mPropertyBag.change.getSelector(), mPropertyBag.modifier, mPropertyBag.appComponent);
			if (!bDependenciesExist && mPropertyBag.element instanceof Element) {
				return oFlexController.checkTargetAndApplyChange(mPropertyBag.change, mPropertyBag.element, flexUtils.omit(mPropertyBag, ["element", "change"]));
			}
			// TODO: Descriptor apply function
			return Promise.reject(new Error("The following Change cannot be applied because of a dependency: " + mPropertyBag.change.getId()));
		},

		/**
		 * Reverting a specific change on the passed control, if it is already applied or is in the process of being applied.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Change} mPropertyBag.change - Change object which should be applied on the passed control
		 * @param {sap.ui.core.Element} mPropertyBag.element - Element instance on which change should be reverted
		 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Returns promise that is resolved after all changes were reverted in asynchronous case or FakePromise for the synchronous processing scenario
		 * @public
		 */
		revert: function(mPropertyBag) {
			var oAppComponent = ChangesController.getAppComponentForSelector(mPropertyBag.element);
			var mRevertSettings = {
				modifier: JsControlTreeModifier,
				appComponent: oAppComponent
			};
			return ChangesController.getFlexControllerInstance(mPropertyBag.element)
				._revertChange(mPropertyBag.change, mPropertyBag.element, mRevertSettings);
		},

		/**
		 * Check if change handler applicable to the passed change and control has revertChange().
		 * If no change handler is given it will get the change handler from the change and control.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector object
		 * @param {sap.ui.fl.Change} mPropertyBag.change - Change object
		 *
		 * @returns {boolean} Returns true if change handler has revertChange function
		 * @private
		 */
		_isChangeHandlerRevertible: function(mPropertyBag) {
			// TODO: Remove function after RTA undo logic is removed
			var oFlexController = ChangesController.getFlexControllerInstance(mPropertyBag.selector);
			var sControlType = JsControlTreeModifier.getControlType(mPropertyBag.selector);
			var mControl = oFlexController._getControlIfTemplateAffected(mPropertyBag.change, mPropertyBag.selector, sControlType, {
				modifier: JsControlTreeModifier,
				appComponent: ChangesController.getAppComponentForSelector(mPropertyBag.selector)
			});
			return oFlexController.isChangeHandlerRevertible(mPropertyBag.change, mControl.control);
		}
	};
	return ChangesWriteAPI;
}, true);