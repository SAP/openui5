/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/includes",
	"sap/base/util/restricted/_omit",
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Component",
	"sap/ui/core/Element",
	"sap/ui/fl/apply/_internal/appVariant/DescriptorChangeTypes",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerStorage",
	"sap/ui/fl/write/_internal/appVariant/AppVariantInlineChangeFactory"
], function(
	includes,
	_omit,
	Log,
	JsControlTreeModifier,
	Component,
	Element,
	DescriptorChangeTypes,
	Applier,
	Reverter,
	FlexObjectFactory,
	ChangesController,
	DescriptorChangeFactory,
	ChangeHandlerStorage,
	AppVariantInlineChangeFactory
) {
	"use strict";

	/**
	 * Provides an API for tools like {@link sap.ui.rta} to create, apply and revert {@link sap.ui.fl.Change}.
	 *
	 * @namespace sap.ui.fl.write.api.ChangesWriteAPI
	 * @experimental Since 1.68
	 * @since 1.68
	 * @ui5-restricted sap.ui.rta, similar tools
	 *
	 */
	var ChangesWriteAPI = /** @lends sap.ui.fl.write.api.ChangesWriteAPI */{
		/**
		 * Creates a change on the flex persistence.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {object} mPropertyBag.changeSpecificData - Property bag holding the change information, see {@link sap.ui.fl.Change#createInitialFileContent}
		 * The property <code>mPropertyBag.changeSpecificData.packageName</code> is set to <code>$TMP</code> and internally since flex changes are always local when they are created.
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Managed object or selector object
		 *
		 * @returns {Promise|sap.ui.fl.Change} In case of a descriptor change, promise resolves to the created change.
		 * In case of a flex change, the created change object is returned.
		 * @private
		 * @ui5-restricted
		 */
		create: function(mPropertyBag) {
			var oFlexController;
			// descriptor change
			if (includes(DescriptorChangeTypes.getChangeTypes(), mPropertyBag.changeSpecificData.changeType)) {
				oFlexController = ChangesController.getDescriptorFlexControllerInstance(mPropertyBag.selector);
				var sReference = oFlexController.getComponentName();
				var sLayer;
				if (mPropertyBag.changeSpecificData.layer) {
					// Smart business must pass the layer as a part of ChangeSpecificData
					// If not passed, layer CUSTOMER will be set
					sLayer = mPropertyBag.changeSpecificData.layer;
					delete mPropertyBag.changeSpecificData.layer;
				}

				var oInlineChange = {
					changeType: mPropertyBag.changeSpecificData.changeType,
					content: mPropertyBag.changeSpecificData.content
				};

				if (mPropertyBag.changeSpecificData.texts) {
					oInlineChange.texts = mPropertyBag.changeSpecificData.texts;
				}

				return AppVariantInlineChangeFactory.createDescriptorInlineChange(oInlineChange)
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

			if (mPropertyBag.changeSpecificData.changeType === "codeExt") {
				return FlexObjectFactory.createControllerExtensionChange(mPropertyBag.changeSpecificData);
			}

			// flex change
			if (mPropertyBag.selector.name && mPropertyBag.selector.view) {
				oFlexController = ChangesController.getFlexControllerInstance(mPropertyBag.selector.view);
			} else {
				oFlexController = ChangesController.getFlexControllerInstance(mPropertyBag.selector);
			}

			// if a component instance is passed only a base change is created
			if (mPropertyBag.selector instanceof Component) {
				return oFlexController.createBaseChange(mPropertyBag.changeSpecificData, mPropertyBag.selector);
			}
			// if a extension point selector is passed a change with an extension point selector is created
			if (mPropertyBag.selector.name && mPropertyBag.selector.view) {
				return oFlexController.createChangeWithExtensionPointSelector(mPropertyBag.changeSpecificData, mPropertyBag.selector);
			}
			// in other cases if a control instance or selector is passed then change handler's completeChangeContent() is called
			return oFlexController.createChangeWithControlSelector(mPropertyBag.changeSpecificData, mPropertyBag.selector);
		},

		/**
		 * Applies a specific change on the passed control if it is not already applied.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Change} mPropertyBag.change - Change object that should be applied to the passed control
		 * @param {sap.ui.core.Element} mPropertyBag.element - Element instance to which the change should be applied
		 * @param {sap.ui.core.util.reflection.BaseTreeModifier} [mPropertyBag.modifier] - Modifier used to apply the change; if not provided, {@link sap.ui.core.util.reflection.JsControlTreeModifier} is used
		 * @param {object} mPropertyBag.appDescriptor - App descriptor containing the metadata of the current application
		 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Promise that is resolved after all changes were applied in asynchronous case, or FakePromise for the synchronous processing scenario
		 * @private
		 * @ui5-restricted
		 */
		apply: function(mPropertyBag) {
			if (!(mPropertyBag.element instanceof Element)) {
				return Promise.reject("Please provide an Element");
			}

			var oFlexController = ChangesController.getFlexControllerInstance(mPropertyBag.element);
			mPropertyBag.appComponent = ChangesController.getAppComponentForSelector(mPropertyBag.element);
			if (!mPropertyBag.modifier) {
				mPropertyBag.modifier = JsControlTreeModifier;
			}
			// TODO: Descriptor apply function
			return Applier.applyChangeOnControl(mPropertyBag.change, mPropertyBag.element, _omit(mPropertyBag, ["element", "change"]))
			.then(function(oResult) {
				var bDependenciesExist = oFlexController.checkForOpenDependenciesForControl(mPropertyBag.change.getSelector(), mPropertyBag.appComponent);
				if (bDependenciesExist) {
					return ChangesWriteAPI.revert({
						change: mPropertyBag.change,
						element: mPropertyBag.element
					}).then(function() {
						throw Error("The following Change cannot be applied because of a dependency: " + mPropertyBag.change.getId());
					});
				}
				return oResult;
			});
		},

		/**
		 * Reverting a specific change on the passed control if it has already been applied or is in the process of being applied.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Change} mPropertyBag.change - Change object that should be reverted from the passed element
		 * @param {sap.ui.core.Element} mPropertyBag.element - Element instance on which the change should be reverted
		 * @returns {Promise|sap.ui.fl.Utils.FakePromise<sap.ui.core.Element|false>} Promise or fake promise resolving to the control on which change was reverted successfully or false when unsuccessful
		 * @private
		 * @ui5-restricted
		 */
		revert: function(mPropertyBag) {
			var oAppComponent;
			if (mPropertyBag.element instanceof Element) {
				oAppComponent = ChangesController.getAppComponentForSelector(mPropertyBag.element);
			}
			var mRevertSettings = {
				modifier: JsControlTreeModifier,
				appComponent: oAppComponent
			};
			// if the element is not present we just pass an empty object, so that revert will not throw an error
			// and the status of the change will be updated
			return Reverter.revertChangeOnControl(mPropertyBag.change, mPropertyBag.element, mRevertSettings);
		},

		/**
		 * Retrieves the change handler for the given control and change type.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.core.Element} mPropertyBag.element - Element instance or XML node
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Layer to be considered when getting the change handlers
		 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Control tree modifier
		 * @param {string} mPropertyBag.changeType - Change type of a <code>sap.ui.fl.Change</code> change
		 * @param {string} [mPropertyBag.controlType] - Type of the control. If not given will be derived from the element
		 * @returns {Promise.<object>} Change handler object wrapped in a Promise
		 */
		getChangeHandler: function(mPropertyBag) {
			var sControlType = mPropertyBag.controlType || mPropertyBag.modifier.getControlType(mPropertyBag.element);
			return ChangeHandlerStorage.getChangeHandler(mPropertyBag.changeType, sControlType, mPropertyBag.element, mPropertyBag.modifier, mPropertyBag.layer);
		}
	};

	return ChangesWriteAPI;
});
