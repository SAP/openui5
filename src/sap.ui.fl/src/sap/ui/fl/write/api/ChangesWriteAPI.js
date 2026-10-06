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
	"sap/ui/fl/apply/_internal/changeHandlers/ChangeHandlerStorage",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory",
	"sap/ui/fl/write/_internal/appVariant/AppVariantInlineChangeFactory",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/Utils",
	"sap/ui/fl/write/_internal/init"
], function(
	_omit,
	Log,
	JsControlTreeModifier,
	Component,
	Element,
	Lib,
	DescriptorChangeTypes,
	ChangeHandlerStorage,
	Applier,
	Reverter,
	ChangesUtils,
	FlexObjectFactory,
	States,
	FlexObjectState,
	ManifestUtils,
	DescriptorChangeFactory,
	AppVariantInlineChangeFactory,
	ContextBasedAdaptationsAPI,
	Utils
) {
	"use strict";

	/**
	 * Provides an API for tools like {@link sap.ui.rta} to create, apply
	 * and revert {@link sap.ui.fl.apply._internal.flexObjects.FlexObject}.
	 *
	 * @namespace
	 * @alias module:sap/ui/fl/write/api/ChangesWriteAPI
	 * @since 1.68
	 * @private
	 * @ui5-restricted sap.ui.rta, similar tools
	 */
	var ChangesWriteAPI = /** @lends sap.ui.fl.write.api.ChangesWriteAPI */ {};

	function createDescriptorChange(mPropertyBag) {
		let sLayer;
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

		if (mPropertyBag.changeSpecificData.support) {
			oInlineChange.support = {
				compositeCommand: mPropertyBag.changeSpecificData.support.compositeCommand || ""
			};
		}

		if (mPropertyBag.changeSpecificData.adaptationId) {
			oInlineChange.adaptationId = mPropertyBag.changeSpecificData.adaptationId;
		}

		return AppVariantInlineChangeFactory.createDescriptorInlineChange(oInlineChange)
		.then((oAppDescriptorChangeContent) => {
			return new DescriptorChangeFactory().createNew(
				mPropertyBag.changeSpecificData.reference,
				oAppDescriptorChangeContent,
				sLayer,
				mPropertyBag.appComponent,
				mPropertyBag.generator
			);
		})
		.catch((oError) => {
			Log.error("the change could not be created.", oError.message);
			throw oError;
		});
	}

	async function createAnnotationChange(mPropertyBag) {
		const oChangeHandler = await ChangeHandlerStorage.getAnnotationChangeHandler({
			changeType: mPropertyBag.changeSpecificData.changeType
		});
		const oFlexObject = FlexObjectFactory.createAnnotationChange(mPropertyBag.changeSpecificData);
		oChangeHandler.completeChangeContent(oFlexObject, mPropertyBag.changeSpecificData, {
			modifier: JsControlTreeModifier,
			appComponent: mPropertyBag.appComponent
		});
		return oFlexObject;
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
			const oChangeSpecificData = { ...mPropertyBag.changeSpecificData };

			return oChangeHandler.completeChangeContent(oFlexObject, oChangeSpecificData, {
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
	 * @param {string} mPropertyBag.changeSpecificData.changeType - Type of the change
	 * @param {string} mPropertyBag.changeSpecificData.layer - Layer in which the change should be created
	 * @param {string} mPropertyBag.changeSpecificData.reference - Flex reference of the application
	 * The property <code>mPropertyBag.changeSpecificData.packageName</code> is set to <code>$TMP</code>
	 * and internally since flex changes are always local when they are created.
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Managed object or selector object
	 *
	 * @returns {Promise|sap.ui.fl.apply._internal.flexObjects.FlexObject} Returns the FlexObject directly in case of a controller extension,
	 * otherwise the FlexObject is wrapped in a promise.
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta, similar tools
	 */
	ChangesWriteAPI.create = function(mPropertyBag) {
		const oChangeSpecificData = { ...mPropertyBag.changeSpecificData };
		const oSelector = mPropertyBag.selector;

		if (oChangeSpecificData.changeType === "codeExt") {
			return FlexObjectFactory.createControllerExtensionChange(oChangeSpecificData);
		}

		const oAppComponent = Utils.getAppComponentForSelector(oSelector.view || oSelector);
		if (oSelector?.appId || ManifestUtils.getFlexReferenceForControl(oAppComponent)) {
			oChangeSpecificData.reference = oSelector?.appId || ManifestUtils.getFlexReferenceForControl(oAppComponent);
		}

		const mContextBasedAdaptationBag = {
			layer: oChangeSpecificData.layer,
			control: oAppComponent,
			reference: oChangeSpecificData.reference
		};

		if (ContextBasedAdaptationsAPI.hasAdaptationsModel(mContextBasedAdaptationBag)) {
			oChangeSpecificData.adaptationId = ContextBasedAdaptationsAPI.getDisplayedAdaptationId(mContextBasedAdaptationBag);
		}

		if (DescriptorChangeTypes.getChangeTypes().includes(oChangeSpecificData.changeType)) {
			return createDescriptorChange({ ...mPropertyBag, changeSpecificData: oChangeSpecificData, appComponent: oAppComponent });
		}

		if (oChangeSpecificData.changeType === "deactivateChanges") {
			return FlexObjectFactory.createFlexObject(oChangeSpecificData);
		}

		if (mPropertyBag.annotationChange) {
			return createAnnotationChange({ ...mPropertyBag, changeSpecificData: oChangeSpecificData, appComponent: oAppComponent });
		}

		// if a component instance is passed only a base change is created
		if (oSelector instanceof Component) {
			return Promise.resolve(FlexObjectFactory.createUIChange(oChangeSpecificData));
		}

		// if a extension point selector is passed a change with an extension point selector is created
		if (oSelector.name && oSelector.view) {
			oChangeSpecificData.selector = {
				name: oSelector.name,
				viewSelector: JsControlTreeModifier.getSelector(oSelector.view.getId(), oAppComponent)
			};
			return createAndCompleteFlexObjectWithChangeHandlerInfo({ ...mPropertyBag, changeSpecificData: oChangeSpecificData, appComponent: oAppComponent });
		}

		// in other cases if a control instance or selector is passed then change handler's completeChangeContent() is called
		const sControlId = oSelector.id || oSelector.getId();
		oChangeSpecificData.selector = {
			...oChangeSpecificData.selector,
			...JsControlTreeModifier.getSelector(sControlId, oAppComponent)
		};

		const sControlType = oSelector.controlType || Utils.getControlType(oSelector);
		return createAndCompleteFlexObjectWithChangeHandlerInfo({ ...mPropertyBag, changeSpecificData: oChangeSpecificData, appComponent: oAppComponent, controlType: sControlType });
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
	 * @ui5-restricted sap.ui.fl, sap.ui.rta, similar tools
	 */
	ChangesWriteAPI.apply = function(mPropertyBag) {
		if (!(mPropertyBag.element instanceof Element)) {
			return Promise.reject(new Error("Please provide an Element"));
		}

		const oAppComponent = Utils.getAppComponentForSelector(mPropertyBag.element);
		const oModifier = mPropertyBag.modifier || JsControlTreeModifier;

		return Applier.applyChangeOnControl(mPropertyBag.change, mPropertyBag.element, {
			..._omit(mPropertyBag, ["element", "change"]),
			appComponent: oAppComponent,
			modifier: oModifier
		})
		.then(function(oResult) {
			var aDependentChanges = FlexObjectState.getOpenDependentChangesForControl(
				JsControlTreeModifier.getControlIdBySelector(mPropertyBag.change.getSelector(), oAppComponent),
				oAppComponent
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
	 * Reverts a change or an array of changes on the passed control if the changes have already been applied
	 * or are in the process of being applied. Make sure to provide the changes in the order that they
	 * were applied - this method executes the reversal in the reverse order.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject|sap.ui.fl.apply._internal.flexObjects.FlexObject[]} mPropertyBag.change - Change object that should be reverted from the passed element, or an array of changes
	 * @param {sap.ui.core.Element} mPropertyBag.element - Element instance on which the change should be reverted
	 * @returns {Promise|sap.ui.fl.Utils.FakePromise<sap.ui.core.Element|false>} Promise or fake promise resolving to the control on which a change was reverted successully, or false when unsuccessful, or an array with the return value of the revert call for each given change
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta, similar tools
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
	 * @param {boolean} [mPropertyBag.appDescriptorChange] - Indicates that the change is an app descriptor change
	 * @param {boolean} [mPropertyBag.annotationChange] - Indicates that the change is an annotation change
	 * @returns {Promise.<object>} Change handler object wrapped in a Promise
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta, similar tools
	 */
	ChangesWriteAPI.getChangeHandler = function(mPropertyBag) {
		var sControlType = mPropertyBag.controlType || mPropertyBag.modifier?.getControlType(mPropertyBag.element);
		return ChangesUtils.getChangeHandler({
			changeType: mPropertyBag.changeType,
			control: mPropertyBag.element,
			controlType: sControlType,
			modifier: mPropertyBag.modifier,
			layer: mPropertyBag.layer,
			appDescriptorChange: mPropertyBag.appDescriptorChange,
			annotationChange: mPropertyBag.annotationChange
		});
	};

	return ChangesWriteAPI;
});
