/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Component",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/fl/apply/_internal/appVariant/DescriptorChangeTypes",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerStorage",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/write/_internal/appVariant/AppVariantInlineChangeFactory",
	"sap/ui/fl/Utils"
], function(
	_omit,
	Log,
	JsControlTreeModifier,
	Component,
	Element,
	Lib,
	DescriptorChangeTypes,
	Applier,
	Reverter,
	FlexObjectFactory,
	States,
	FlexObjectState,
	ManifestUtils,
	DescriptorChangeFactory,
	ChangeHandlerStorage,
	ContextBasedAdaptationsAPI,
	AppVariantInlineChangeFactory,
	Utils
) {
	"use strict";

	/**
	 * Provides an API for tools like {@link sap.ui.rta} to create, apply and revert {@link sap.ui.fl.apply._internal.flexObjects.FlexObject}.
	 *
	 * @namespace sap.ui.fl.write.api.ChangesWriteAPI
	 * @since 1.68
	 * @private
	 * @ui5-restricted sap.ui.rta, similar tools
	 *
	 */
	var ChangesWriteAPI = /** @lends sap.ui.fl.write.api.ChangesWriteAPI */ {};

	function createDescriptorChange(mPropertyBag) {
		var sLayer;
		if (mPropertyBag.changeSpecificData.layer) {
			// Smart business must pass the layer as a part of ChangeSpecificData
			// If not passed, layer CUSTOMER will be set
			sLayer = mPropertyBag.changeSpecificData.layer;
			delete mPropertyBag.changeSpecificData.layer;
		}

		const oInlineChange = {
			changeType: mPropertyBag.changeSpecificData.changeType,
			content: mPropertyBag.changeSpecificData.content
		};

		if (mPropertyBag.changeSpecificData.texts) {
			oInlineChange.texts = mPropertyBag.changeSpecificData.texts;
		}

		return AppVariantInlineChangeFactory.createDescriptorInlineChange(oInlineChange)
		.then((oAppDescriptorChangeContent) => {
			return new DescriptorChangeFactory().createNew(
				mPropertyBag.changeSpecificData.reference, oAppDescriptorChangeContent, sLayer, mPropertyBag.selector
			);
		})
		.catch((oError) => {
			Log.error("the change could not be created.", oError.message);
			throw oError;
		});
	}

	function createAndCompleteFlexObjectWithChangeHandlerInfo(mPropertyBag) {
		const oFlexObject = FlexObjectFactory.createUIChange(mPropertyBag.changeSpecificData);
		return ChangeHandlerStorage.getChangeHandler(
			oFlexObject.getChangeType(),
			mPropertyBag.controlType,
			mPropertyBag.selector,
			JsControlTreeModifier,
			oFlexObject.getLayer()
		)
		.then((oChangeHandler) => {
			return oChangeHandler.completeChangeContent(oFlexObject, mPropertyBag.changeSpecificData, {
				modifier: JsControlTreeModifier,
				appComponent: mPropertyBag.appComponent,
				view: Utils.getViewForControl(mPropertyBag.selector)
			});
		})
		.then(() => {
			// completeChangeContent changes the content and might make it dirty
			oFlexObject.setState(States.LifecycleState.NEW);
			return oFlexObject;
		});
	}

	/**
	 * Creates a change on the flex persistence.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {object} mPropertyBag.changeSpecificData - Property bag holding the change information
	 * The property <code>mPropertyBag.changeSpecificData.packageName</code> is set to <code>$TMP</code> and internally since flex changes are always local when they are created.
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Managed object or selector object
	 *
	 * @returns {Promise|sap.ui.fl.apply._internal.flexObjects.FlexObject} Returns the FlexObject directly In case of a controller extension,
	 * otherwise the FlexObject is wrapped in a promise
	 * @private
	 * @ui5-restricted
	 */
	ChangesWriteAPI.create = function(mPropertyBag) {
		if (mPropertyBag.changeSpecificData.changeType === "codeExt") {
			return FlexObjectFactory.createControllerExtensionChange(mPropertyBag.changeSpecificData);
		}

		const oAppComponent = Utils.getAppComponentForSelector(mPropertyBag.selector.view || mPropertyBag.selector);
		const sReference = mPropertyBag.selector.appId || ManifestUtils.getFlexReferenceForControl(oAppComponent);
		mPropertyBag.appComponent = oAppComponent;
		mPropertyBag.changeSpecificData.reference = sReference;

		if (DescriptorChangeTypes.getChangeTypes().includes(mPropertyBag.changeSpecificData.changeType)) {
			return createDescriptorChange(mPropertyBag);
		}

		const mContextBasedAdaptationBag = {
			layer: mPropertyBag.changeSpecificData.layer,
			control: oAppComponent,
			reference: sReference
		};
		if (ContextBasedAdaptationsAPI.hasAdaptationsModel(mContextBasedAdaptationBag)) {
			mPropertyBag.changeSpecificData.adaptationId = ContextBasedAdaptationsAPI.getDisplayedAdaptationId(mContextBasedAdaptationBag);
		}

		// if a component instance is passed only a base change is created
		if (mPropertyBag.selector instanceof Component) {
			return Promise.resolve(FlexObjectFactory.createUIChange(mPropertyBag.changeSpecificData));
		}

		// if a extension point selector is passed a change with an extension point selector is created
		if (mPropertyBag.selector.name && mPropertyBag.selector.view) {
			mPropertyBag.changeSpecificData.selector = {
				name: mPropertyBag.selector.name,
				viewSelector: JsControlTreeModifier.getSelector(mPropertyBag.selector.view.getId(), oAppComponent)
			};
			return createAndCompleteFlexObjectWithChangeHandlerInfo(mPropertyBag);
		}

		// in other cases if a control instance or selector is passed then change handler's completeChangeContent() is called
		const sControlId = mPropertyBag.selector.id || mPropertyBag.selector.getId();
		mPropertyBag.changeSpecificData.selector ||= {};
		Object.assign(mPropertyBag.changeSpecificData.selector, JsControlTreeModifier.getSelector(sControlId, oAppComponent));
		mPropertyBag.controlType = mPropertyBag.selector.controlType || Utils.getControlType(mPropertyBag.selector);
		return createAndCompleteFlexObjectWithChangeHandlerInfo(mPropertyBag);
	};

	/**
	 * Applies a specific change on the passed control if it is not already applied.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} mPropertyBag.change - Change object that should be applied to the passed control
	 * @param {sap.ui.core.Element} mPropertyBag.element - Element instance to which the change should be applied
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} [mPropertyBag.modifier] - Modifier used to apply the change; if not provided, {@link sap.ui.core.util.reflection.JsControlTreeModifier} is used
	 * @param {object} [mPropertyBag.appDescriptor] - App descriptor containing the metadata of the current application
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise} Promise that is resolved after all changes were applied in asynchronous case, or FakePromise for the synchronous processing scenario
	 * @private
	 * @ui5-restricted
	 */
	ChangesWriteAPI.apply = function(mPropertyBag) {
		if (!(mPropertyBag.element instanceof Element)) {
			return Promise.reject("Please provide an Element");
		}

		mPropertyBag.appComponent = Utils.getAppComponentForSelector(mPropertyBag.element);
		mPropertyBag.modifier ||= JsControlTreeModifier;
		// TODO: Descriptor apply function
		return Applier.applyChangeOnControl(mPropertyBag.change, mPropertyBag.element, _omit(mPropertyBag, ["element", "change"]))
		.then(function(oResult) {
			var aDependentChanges = FlexObjectState.getOpenDependentChangesForControl(
				JsControlTreeModifier.getControlIdBySelector(mPropertyBag.change.getSelector(), mPropertyBag.appComponent),
				mPropertyBag.appComponent
			);
			if (aDependentChanges.length > 0) {
				return ChangesWriteAPI.revert({
					change: mPropertyBag.change,
					element: mPropertyBag.element
				}).then(function() {
					var oFlResourceBundle = Lib.getResourceBundleFor("sap.ui.fl");
					var sDependentChangesFileNames = aDependentChanges.map(function(oChange) {
						return oChange.getId();
					}).join(", ");
					throw Error(
						oFlResourceBundle.getText(
							"MSG_DEPENDENT_CHANGE_ERROR",
							[mPropertyBag.change.getId(), sDependentChangesFileNames]
						)
					);
				});
			}
			return oResult;
		});
	};

	/**
	 * Reverts a change or an array of changes on the passed control if the changes have already been applied or are in the process of being applied.
	 * Make sure to provide the changes in the order that they were applied - this method executes the reversal in the reverse order.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject|sap.ui.fl.apply._internal.flexObjects.FlexObject[]} mPropertyBag.change - Change object that should be reverted from the passed element, or an array of changes
	 * @param {sap.ui.core.Element} mPropertyBag.element - Element instance on which the change should be reverted
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise<sap.ui.core.Element|false>} Promise or fake promise resolving to the control on which a change was reverted successully, or false when unsuccessful, or an array with the return value of the revert call for each given change
	 * @private
	 * @ui5-restricted
	 */
	ChangesWriteAPI.revert = function(mPropertyBag) {
		var oAppComponent = Utils.getAppComponentForSelector(mPropertyBag.element || {});
		var aResults = [];
		var mRevertSettings = {
			modifier: JsControlTreeModifier,
			appComponent: oAppComponent
		};

		// if the element is not present we just pass an empty object, so that revert will not throw an error
		// and the status of the change will be updated
		if (!Array.isArray(mPropertyBag.change)) {
			return Reverter.revertChangeOnControl(mPropertyBag.change, mPropertyBag.element, mRevertSettings);
		}

		// the given changes are reverted starting from the last one
		var aChanges = mPropertyBag.change.slice(0).reverse();
		return aChanges.reduce(function(oPreviousPromise, oChange) {
			return oPreviousPromise.then(function() {
				return Reverter.revertChangeOnControl(oChange, mPropertyBag.element, mRevertSettings)
				.then(function(vResult) {
					aResults.unshift(vResult);
				});
			});
		}, Promise.resolve())
		.then(function() {
			// the results are returned in the same order as they were passed to the method
			return aResults;
		});
	};

	/**
	 * Retrieves the change handler for the given control and change type.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Element} mPropertyBag.element - Element instance or XML node
	 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Layer to be considered when getting the change handlers
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Control tree modifier
	 * @param {string} mPropertyBag.changeType - Change type of a <code>sap.ui.fl.apply._internal.flexObjects.FlexObject</code> change
	 * @param {string} [mPropertyBag.controlType] - Type of the control. If not given will be derived from the element
	 * @returns {Promise.<object>} Change handler object wrapped in a Promise
	 */
	ChangesWriteAPI.getChangeHandler = function(mPropertyBag) {
		var sControlType = mPropertyBag.controlType || mPropertyBag.modifier.getControlType(mPropertyBag.element);
		return ChangeHandlerStorage.getChangeHandler(
			mPropertyBag.changeType,
			sControlType,
			mPropertyBag.element,
			mPropertyBag.modifier,
			mPropertyBag.layer
		);
	};

	return ChangesWriteAPI;
});
