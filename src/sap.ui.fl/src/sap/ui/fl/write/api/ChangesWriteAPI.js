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
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerStorage",
	"sap/ui/fl/write/_internal/appVariant/AppVariantInlineChangeFactory",
	"sap/ui/fl/write/_internal/controlVariants/ControlVariantWriteUtils",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/Layer",
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
	ChangesUtils,
	ControlVariantUtils,
	FlexObjectFactory,
	States,
	FlexObjectState,
	ManifestUtils,
	DescriptorChangeFactory,
	ChangeHandlerStorage,
	AppVariantInlineChangeFactory,
	ControlVariantWriteUtils,
	FlexObjectManager,
	ContextBasedAdaptationsAPI,
	VersionsAPI,
	Layer,
	Utils
) {
	"use strict";

	/**
	 * Provides an API for tools like {@link sap.ui.rta} to create, apply and revert {@link sap.ui.fl.apply._internal.flexObjects.FlexObject}.
	 *
	 * @namespace
	 * @alias module:sap/ui/fl/write/api/ChangesWriteAPI
	 * @since 1.68
	 * @private
	 * @ui5-restricted sap.ui.rta, similar tools
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
			// Copy the content properties into the change specific data so any change handler can use the "settings" change structure
			// TODO: consolidate in all commands/change handlers so the "content" structure is always used. todos#4
			if (oChangeSpecificData.content) {
				Object.keys(oChangeSpecificData.content).forEach((sKey) => {
					if (!oChangeSpecificData[sKey]) {
						oChangeSpecificData[sKey] = oChangeSpecificData.content[sKey];
					} else {
						Log.warning(`The property '${sKey}' is defined both in the change specific data and its content.`);
					}
				});
			}

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
	 * The property <code>mPropertyBag.changeSpecificData.packageName</code> is set to <code>$TMP</code> and internally since flex changes are always local when they are created.
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Managed object or selector object
	 *
	 * @returns {Promise|sap.ui.fl.apply._internal.flexObjects.FlexObject} Returns the FlexObject directly In case of a controller extension,
	 * otherwise the FlexObject is wrapped in a promise
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta, similar tools
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

		if (mPropertyBag.changeSpecificData.changeType === "deactivateChanges") {
			return FlexObjectFactory.createFlexObject(mPropertyBag.changeSpecificData);
		}

		if (mPropertyBag.annotationChange) {
			return createAnnotationChange(mPropertyBag);
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
	 * Creates a FlVariant with the passed properties.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector to retrieve the app component
	 * @param {object} mPropertyBag.variantManagementReference - Reference to the variant management control
	 * @param {object} mPropertyBag.title - Name of the new variant
	 * @param {object} [mPropertyBag.variantReference] - Reference to the variant the new one should be based on
	 * @param {object} [mPropertyBag.layer] - Layer of the new variant
	 * @param {object} [mPropertyBag.generator] - Generator of the new variant
	 * @param {object} [mPropertyBag.author] - Author of the variant
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlVariant} The created FlVariant
	 * @private
	 * @ui5-restricted SAP Business Network
	 */
	ChangesWriteAPI.createVariant = function(mPropertyBag) {
		const oAppComponent = Utils.getAppComponentForSelector(mPropertyBag.selector);
		const sReference = ManifestUtils.getFlexReferenceForControl(oAppComponent);
		const mProperties = {
			variantManagementReference: mPropertyBag.variantManagementReference,
			variantReference: mPropertyBag.variantReference || mPropertyBag.variantManagementReference,
			variantName: mPropertyBag.title,
			layer: mPropertyBag.layer || Layer.CUSTOMER,
			user: mPropertyBag.author || ControlVariantUtils.DEFAULT_AUTHOR,
			reference: sReference,
			generator: mPropertyBag.generator || "ChangesWriteAPI.createVariant"
		};

		return FlexObjectFactory.createFlVariant(mProperties);
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
			return Promise.reject("Please provide an Element");
		}

		mPropertyBag.appComponent = Utils.getAppComponentForSelector(mPropertyBag.element);
		mPropertyBag.modifier ||= JsControlTreeModifier;

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

	/**
	 * Deletes the variants and their related FlexObjects. Only variants that are in the draft or dirty state can be deleted,
	 * as they have no dependencies on them. Returns all FlexObjects that were deleted in the process.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.variantManagementControl - Variant management control
	 * @param {string[]} mPropertyBag.variants - Variant IDs to be deleted
	 * @param {string} mPropertyBag.layer - Layer to get the draft objects from
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} Array of deleted FlexObjects
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta, similar tools
	 */
	ChangesWriteAPI.deleteVariantsAndRelatedObjects = function(mPropertyBag) {
		if (!(mPropertyBag.variantManagementControl?.isA("sap.ui.fl.variants.VariantManagement"))) {
			throw new Error("Please provide a valid Variant Management control");
		}
		const oVariantManagementControl = mPropertyBag.variantManagementControl;
		const oAppComponent = Utils.getAppComponentForControl(oVariantManagementControl);
		const sVariantManagementReference = JsControlTreeModifier.getSelector(oVariantManagementControl, oAppComponent).id;
		const sFlexReference = ManifestUtils.getFlexReferenceForControl(oAppComponent);
		const aDraftFilenames = VersionsAPI.getDraftFilenames({
			control: oVariantManagementControl,
			layer: mPropertyBag.layer
		});
		const aDirtyFlexObjectIds = FlexObjectState.getDirtyFlexObjects(sFlexReference).map((oFlexObject) => (
			oFlexObject.getId()
		));
		const aVariantsToBeDeleted = mPropertyBag.variants.filter((sVariantID) => (
			aDraftFilenames.includes(sVariantID) || aDirtyFlexObjectIds.includes(sVariantID)
		));
		return aVariantsToBeDeleted
		.map((sVariantId) => (
			ControlVariantWriteUtils.deleteVariant(sFlexReference, sVariantManagementReference, sVariantId)
		))
		.flat();
	};

	/**
	 * Restores previously deleted FlexObjects. Objects are restored to the state they were in before deletion.
	 * If the flex object was not persisted, it is added as a dirty object again.
	 * Once the deletion is persisted, changes will not be restored.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.reference - Flex reference of the application
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} mPropertyBag.flexObjects - FlexObjects to be restored
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta, similar tools
	 */
	ChangesWriteAPI.restoreDeletedFlexObjects = function(mPropertyBag) {
		FlexObjectManager.restoreDeletedFlexObjects(mPropertyBag);
	};

	return ChangesWriteAPI;
});
