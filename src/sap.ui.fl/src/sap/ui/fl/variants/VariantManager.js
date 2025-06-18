/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_difference",
	"sap/base/util/merge",
	"sap/base/util/ObjectPath",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Element",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/write/_internal/controlVariants/ControlVariantWriteUtils",
	"sap/ui/fl/write/_internal/flexState/changes/UIChangeManager",
	"sap/ui/fl/write/_internal/flexState/FlexObjectManager",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils"
], function(
	_difference,
	merge,
	ObjectPath,
	JsControlTreeModifier,
	Element,
	Applier,
	Reverter,
	FlexObjectFactory,
	States,
	VariantManagementState,
	FlexObjectState,
	ControlVariantApplyAPI,
	ControlVariantWriteUtils,
	UIChangeManager,
	FlexObjectManager,
	ContextBasedAdaptationsAPI,
	Layer,
	Utils
) {
	"use strict";

	/**
	 * Manager for all FlVariant related tasks that are triggered by a user interaction.
	 *
	 * @namespace sap.ui.fl.variants.VariantManager
	 * @since 1.132
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	var VariantManager = {};

	function getVariantModel(oControl) {
		const oAppComponent = Utils.getAppComponentForControl(oControl);
		return oAppComponent.getModel(ControlVariantApplyAPI.getVariantModelName());
	}

	/**
	 * Removes passed control changes which are in DIRTY state from the variant state and flex controller.
	 *
	 * @param {object} mPropertyBag - Object with properties
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} mPropertyBag.changes - Array of control changes
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {string} mPropertyBag.vReference - Variant reference to remove dirty changes from
	 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant model instance
	 * @param {boolean} [mPropertyBag.revert] - Revert the given changes
	 *
	 * @returns {Promise<undefined>} Resolves when changes have been erased
	 */
	async function eraseDirtyChanges(mPropertyBag) {
		var aVariantDirtyChanges = mPropertyBag.model._getDirtyChangesFromVariantChanges(mPropertyBag.changes);
		aVariantDirtyChanges = aVariantDirtyChanges.reverse();

		if (mPropertyBag.revert) {
			await Reverter.revertMultipleChanges(aVariantDirtyChanges, {
				appComponent: mPropertyBag.model.oAppComponent,
				modifier: JsControlTreeModifier,
				reference: mPropertyBag.model.sFlexReference
			});
		}
		FlexObjectManager.deleteFlexObjects({
			reference: mPropertyBag.model.sFlexReference,
			flexObjects: aVariantDirtyChanges
		});
	}

	/**
	 * Adds the passed function to the variant switch promise and returns the whole promise chain.
	 *
	 * @param {function():Promise} fnCallback - Callback function returning a promise
	 * @param {sap.ui.fl.variants.VariantModel} oModel - Variant model
	 * @param {string} sVMReference - Variant Management reference
	 * @returns {Promise<undefined>} Resolves when the variant model is not busy anymore
	 * @private
	 */
	function executeAfterSwitch(fnCallback, oModel) {
		// if there are multiple switches triggered very quickly this makes sure that they are being executed one after another
		oModel._oVariantSwitchPromise = oModel._oVariantSwitchPromise
		.catch(function() {})
		.then(fnCallback);
		VariantManagementState.setVariantSwitchPromise(oModel.sFlexReference, oModel._oVariantSwitchPromise);
		return oModel._oVariantSwitchPromise;
	}

	async function handleDirtyChanges(aDirtyChanges, sVariantManagementReference, oAppComponent, oVariantModel) {
		if (!oVariantModel._bDesignTimeMode) {
			const oResponse = await FlexObjectManager.saveFlexObjects({ flexObjects: aDirtyChanges, selector: oAppComponent });
			if (oResponse) {
				const oVariantFlexObject = oResponse.response.find((oFlexObject) => oFlexObject.fileType === "ctrl_variant");
				const oAffectedVariant = oVariantModel.oData[sVariantManagementReference].variants
				.find((oVariant) => oVariant.key === oVariantFlexObject.fileName);
				const oSupportInformation = oAffectedVariant.instance.getSupportInformation();
				oSupportInformation.user = oVariantFlexObject.support.user;
				oAffectedVariant.instance.setSupportInformation(oSupportInformation);
			}

			// TODO: as soon as the invalidation is done automatically this can be removed
			oVariantModel.invalidateMap();
		}
	}

	function getAdaptationId(sLayer, oControl, sFlexReference) {
		var mContextBasedAdaptationBag = {
			layer: sLayer,
			control: oControl,
			reference: sFlexReference
		};
		// the VariantManager uses the ContextBasedAdaptationsAPI to fetch the adaptation id,
		// and the ContextBasedAdaptationsAPI uses the VariantManager to create changes
		// TODO: the logic needs to be refactored to get rid of this circular dependency
		var bHasAdaptationsModel = ContextBasedAdaptationsAPI.hasAdaptationsModel(mContextBasedAdaptationBag);
		return bHasAdaptationsModel && ContextBasedAdaptationsAPI.getDisplayedAdaptationId(mContextBasedAdaptationBag);
	}

	/**
	 * Handler for "select" event fired from a variant management control. Adds to the variant switch promise chain,
	 * resolving when new variant (if applicable) has been switched and all source variant dirty changes have been removed.
	 *
	 * @param {sap.ui.base.Event} oEvent - Event object
	 * @param {object} mPropertyBag - Object with properties
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {sap.ui.fl.variants.VariantModel} mPropertyBag.model - Variant model instance
	 * @returns {Promise<undefined>} Resolves with undefined
	 */
	VariantManager.handleSelectVariant = function(oEvent, mPropertyBag) {
		return executeAfterSwitch(async function(mParameters, mVariantProperties) {
			var oModel = mVariantProperties.model;
			var sVMReference = mVariantProperties.vmReference;
			var bVariantSwitch = false;
			var bOldVariantWasModified = ObjectPath.get([sVMReference, "modified"], oModel.oData);
			var sTargetVReference = mParameters.key;
			var sSourceVReference = mParameters.key;
			// for standard variants 'currentVariant' property is not set
			// e.g. variants generated through _ensureStandardVariantExists()
			if (
				ObjectPath.get([sVMReference, "currentVariant"], oModel.oData)
				&& oModel.oData[sVMReference].currentVariant !== sTargetVReference
			) {
				sSourceVReference = oModel.oData[sVMReference].currentVariant;
				bVariantSwitch = true;
				await oModel.updateCurrentVariant({
					variantManagementReference: sVMReference,
					newVariantReference: sTargetVReference,
					appComponent: oModel.oAppComponent,
					internallyCalled: true
				});
			}
			if (bOldVariantWasModified) {
				var aControlChanges = VariantManagementState.getControlChangesForVariant({
					reference: oModel.sFlexReference,
					vmReference: sVMReference,
					vReference: sSourceVReference
				});
				await eraseDirtyChanges({
					changes: aControlChanges,
					vmReference: sVMReference,
					vReference: sSourceVReference,
					revert: !bVariantSwitch,
					model: oModel
				});
			}
			// the variant switch already calls the listeners
			if (!bVariantSwitch) {
				oModel.callVariantSwitchListeners(sVMReference, oModel.oData[sVMReference].currentVariant);
			}
		}.bind(null, oEvent.getParameters(), mPropertyBag), mPropertyBag.model);
	};

	VariantManager.handleManageEvent = async function(oEvent, oData, oVariantModel) {
		const sVMReference = oData.variantManagementReference;
		if (!oVariantModel.getData()) {
			return;
		}
		const {
			changes: aConfigurationChangesContent,
			variantsToBeDeleted: aVariantsToBeDeleted
		} = oVariantModel._collectModelChanges(sVMReference, Layer.USER, oEvent);

		if (!aConfigurationChangesContent.length && !aVariantsToBeDeleted.length) {
			return;
		}

		if (aConfigurationChangesContent.some((oChange) => {
			return oChange.visible === false
			&& oChange.variantReference === oVariantModel.getCurrentVariantReference(sVMReference);
		})) {
			await oVariantModel.updateCurrentVariant({
				variantManagementReference: sVMReference,
				newVariantReference: sVMReference
			});
		}

		aConfigurationChangesContent.forEach(function(oChangeProperties) {
			oChangeProperties.appComponent = oVariantModel.oAppComponent;
		});

		const aNewVariantChanges = VariantManager.addVariantChanges(sVMReference, aConfigurationChangesContent);
		const aVariantDeletionChanges = aVariantsToBeDeleted
		.map((sVariantKey) => {
			const oVariant = VariantManagementState.getVariant({
				reference: oVariantModel.sFlexReference,
				vmReference: sVMReference,
				vReference: sVariantKey
			});
			if (oVariant.layer === Layer.USER) {
				return ControlVariantWriteUtils.deleteVariant(oVariantModel.sFlexReference, sVMReference, sVariantKey);
			}
			return [];
		})
		.flat();
		// Save all changes unless they were just added and then removed immediately
		// or are deleted and still dirty and were thus directly removed from the state
		const aChanges = [
			..._difference(aNewVariantChanges, aVariantDeletionChanges),
			...aVariantDeletionChanges.filter((oChange) => oChange.getState() !== States.LifecycleState.NEW)
		];
		// From the lowest to the highest layer, save the changes separately to ensure that the condense route is used.
		const aLayers = Object.values(Layer).reverse();
		for (const sCurrentLayer of aLayers) {
			const aChangesOnLayer = aChanges.filter((oChange) => oChange.getLayer() === sCurrentLayer);
			if (aChangesOnLayer.length > 0) {
				// Always pass the pre-defined changes here to avoid that UI changes that are part of the FlexState
				// are also persisted during variant manage save
				await FlexObjectManager.saveFlexObjects({
					flexObjects: aChangesOnLayer,
					selector: oVariantModel.oAppComponent
				});
			}
		}
	};

	VariantManager.handleSaveEvent = async function(oVariantManagementControl, mParameters, oVariantModel) {
		var oAppComponent = Utils.getAppComponentForControl(oVariantManagementControl);
		var sVMReference = oVariantModel.getLocalId(oVariantManagementControl.getId(), oAppComponent);
		var aNewVariantDirtyChanges;

		await executeAfterSwitch(async function(sVariantManagementReference, oAppComponent, mParameters) {
			var sSourceVariantReference = oVariantModel.getCurrentVariantReference(sVariantManagementReference);
			var aSourceVariantChanges = VariantManagementState.getControlChangesForVariant({
				reference: oVariantModel.sFlexReference,
				vmReference: sVariantManagementReference,
				vReference: sSourceVariantReference
			});

			if (mParameters.overwrite) {
				// handle triggered "Save" button
				// Includes special handling for PUBLIC variant which requires changing all the dirty changes to PUBLIC layer before saving
				aNewVariantDirtyChanges = oVariantModel._getDirtyChangesFromVariantChanges(aSourceVariantChanges);
				if (oVariantModel.getVariant(sSourceVariantReference, sVariantManagementReference).layer === Layer.PUBLIC) {
					aNewVariantDirtyChanges.forEach((oChange) => oChange.setLayer(Layer.PUBLIC));
				}
				const oResponse = await FlexObjectManager.saveFlexObjects({
					flexObjects: aNewVariantDirtyChanges,
					selector: oAppComponent
				});
				// TODO: as soon as the invalidation is done automatically this can be removed
				oVariantModel.invalidateMap();
				return oResponse;
			}

			var sVariantLayer = mParameters.layer || (mParameters.public ? Layer.PUBLIC : Layer.USER);
			var sVariantChangeLayer = mParameters.layer || Layer.USER;

			// handle triggered "SaveAs" button
			var sNewVariantReference = mParameters.newVariantReference || Utils.createDefaultFileName("flVariant");
			var mPropertyBag = {
				variantManagementReference: sVariantManagementReference,
				appComponent: oAppComponent,
				layer: sVariantLayer,
				title: mParameters.name,
				contexts: mParameters.contexts,
				sourceVariantReference: sSourceVariantReference,
				newVariantReference: sNewVariantReference,
				generator: mParameters.generator,
				additionalVariantChanges: [],
				adaptationId: getAdaptationId(sVariantChangeLayer, oAppComponent, oVariantModel.sFlexReference),
				executeOnSelection: mParameters.execute
			};

			var oBaseChangeProperties = {
				content: {},
				reference: oVariantModel.sFlexReference,
				generator: mPropertyBag.generator,
				layer: sVariantChangeLayer,
				adaptationId: mPropertyBag.adaptationId
			};

			if (mParameters.def) {
				var mPropertyBagSetDefault = merge({
					changeType: "setDefault",
					content: {
						defaultVariant: sNewVariantReference
					},
					fileType: "ctrl_variant_management_change",
					selector: JsControlTreeModifier.getSelector(sVariantManagementReference, mPropertyBag.appComponent)
				}, oBaseChangeProperties);
				mPropertyBag.additionalVariantChanges.push(FlexObjectFactory.createVariantManagementChange(mPropertyBagSetDefault));
			}

			const aCopiedVariantDirtyChanges = await VariantManager.copyVariant(mPropertyBag);
			aNewVariantDirtyChanges = aCopiedVariantDirtyChanges;
			// unsaved changes on the source variant are removed before copied variant changes are saved
			await eraseDirtyChanges({
				changes: aSourceVariantChanges,
				vmReference: sVariantManagementReference,
				vReference: sSourceVariantReference,
				model: oVariantModel
			});
			return handleDirtyChanges(
				aNewVariantDirtyChanges,
				sVariantManagementReference,
				oAppComponent,
				oVariantModel
			);
		}.bind(oVariantModel, sVMReference, oAppComponent, mParameters), oVariantModel);
		return aNewVariantDirtyChanges;
	};

	/**
	 * Adds and applies the given changes.
	 *
	 * @param {Array<sap.ui.fl.apply._internal.flexObjects.FlexObject>} aChanges Changes to be applied
	 * @param {sap.ui.core.Control} oControl - Control instance to fetch the variant model
	 * @returns {Promise<undefined>} Promise resolving when all changes are applied
	 */
	VariantManager.addAndApplyChangesOnVariant = function(aChanges, oControl) {
		const oVariantModel = getVariantModel(oControl);
		const aAddedChanges = UIChangeManager.addDirtyChanges(oVariantModel.sFlexReference, aChanges, oVariantModel.oAppComponent);
		return aAddedChanges.reduce(async function(oPreviousPromise, oChange) {
			await oPreviousPromise;
			const oControl = Element.getElementById(
				JsControlTreeModifier.getControlIdBySelector(oChange.getSelector(), oVariantModel.oAppComponent)
			);
			const oReturn = await Applier.applyChangeOnControl(oChange, oControl, {
				modifier: JsControlTreeModifier,
				appComponent: oVariantModel.oAppComponent,
				view: Utils.getViewForControl(oControl)
			});
			if (!oReturn.success) {
				var oException = oReturn.error || new Error("The change could not be applied.");
				FlexObjectManager.deleteFlexObjects({
					reference: oVariantModel.sFlexReference,
					flexObjects: [oChange]
				});
				throw oException;
			}
		}, Promise.resolve());
	};

	/**
	 * Erases dirty changes on a given variant and returns the dirty changes.
	 *
	 * @param {string} sVariantManagementReference - Variant management reference
	 * @param {string} sVariantReference - Variant reference to remove dirty changes from
	 * @param {sap.ui.core.Control} oControl - Control instance to fetch the variant model
	 * @returns {Promise<sap.ui.fl.apply._internal.flexObjects.FlexObject[]>} Resolves with the removed dirty changes
	 */
	VariantManager.eraseDirtyChangesOnVariant = async function(sVariantManagementReference, sVariantReference, oControl) {
		const oVariantModel = getVariantModel(oControl);
		var aSourceVariantChanges = VariantManagementState.getControlChangesForVariant({
			reference: oVariantModel.sFlexReference,
			vmReference: sVariantManagementReference,
			vReference: sVariantReference
		});

		var aSourceVariantDirtyChanges = oVariantModel._getDirtyChangesFromVariantChanges(aSourceVariantChanges);

		await eraseDirtyChanges({
			changes: aSourceVariantChanges,
			vmReference: sVariantManagementReference,
			vReference: sVariantReference,
			model: oVariantModel,
			revert: true
		});
		return aSourceVariantDirtyChanges;
	};

	/**
	 * Copies a variant.
	 *
	 * @param {object} mPropertyBag - Map of properties
	 * @param {string} mPropertyBag.variantManagementReference - Variant management reference
	 * @param {string} mPropertyBag.title - Title for the variant
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Model's app component
	 * @param {string} mPropertyBag.layer - Layer on which the new variant should be created
	 * @param {string} mPropertyBag.newVariantReference - <code>variantReference</code> for the new variant
	 * @param {string} mPropertyBag.sourceVariantReference - <code>variantReference</code> of the source variant
	 * @param {string} mPropertyBag.generator - Information about who created the change
	 * @param {object} mPropertyBag.contexts - Context structure containing roles and countries
	 * @param {boolean} mPropertyBag.executeOnSelection - Apply automatically the content of the variant
	 * @param {sap.ui.core.Control} oControl - Control instance to fetch the variant model
	 * @returns {Promise<sap.ui.fl.apply._internal.flexObjects.FlexObject[]>} Resolves with dirty changes created during variant copy
	 * @private
	 */
	VariantManager.copyVariant = async function(mPropertyBag) {
		const oVariantModel = getVariantModel(mPropertyBag.appComponent);
		var oDuplicateVariantData = oVariantModel._duplicateVariant(mPropertyBag);
		oDuplicateVariantData.generator = mPropertyBag.generator;

		oVariantModel.oData[mPropertyBag.variantManagementReference].variants.push({
			key: oDuplicateVariantData.instance.getId(),
			rename: true,
			change: true,
			remove: true,
			sharing: mPropertyBag.layer === Layer.USER
				? oVariantModel.sharing.PRIVATE
				: oVariantModel.sharing.PUBLIC
		});

		var aChanges = [];

		// when created a new public variant other users do not see the new public variant
		if (mPropertyBag.layer === Layer.PUBLIC) {
			oDuplicateVariantData.instance.setFavorite(false);
			var oChangeProperties = {
				variantId: mPropertyBag.newVariantReference,
				changeType: "setFavorite",
				fileType: "ctrl_variant_change",
				generator: mPropertyBag.generator,
				layer: Layer.USER,
				reference: oVariantModel.sFlexReference,
				content: {favorite: true}
			};
			aChanges.push(FlexObjectFactory.createVariantChange(oChangeProperties));
		}

		// sets copied variant and associated changes as dirty
		aChanges = FlexObjectManager.addDirtyFlexObjects(
			oVariantModel.sFlexReference,
			aChanges
			.concat([oDuplicateVariantData.instance]
			.concat(oDuplicateVariantData.controlChanges)
			.concat(mPropertyBag.additionalVariantChanges))
		);

		await oVariantModel.updateCurrentVariant({
			variantManagementReference: mPropertyBag.variantManagementReference,
			newVariantReference: oDuplicateVariantData.instance.getId(),
			appComponent: mPropertyBag.appComponent,
			internallyCalled: true,
			scenario: "saveAs"
		});
		return aChanges;
	};

	VariantManager.removeVariant = async function(mPropertyBag) {
		const oVariantModel = getVariantModel(mPropertyBag.appComponent);
		var aChangesToBeDeleted = FlexObjectState.getDirtyFlexObjects(oVariantModel.sFlexReference)
		.filter(function(oChange) {
			return (oChange.getVariantReference && oChange.getVariantReference() === mPropertyBag.variant.getId()) ||
				oChange.getId() === mPropertyBag.variant.getId();
		});

		await oVariantModel.updateCurrentVariant({
			variantManagementReference: mPropertyBag.variantManagementReference,
			newVariantReference: mPropertyBag.sourceVariantReference,
			appComponent: mPropertyBag.component
		});
		FlexObjectManager.deleteFlexObjects({
			reference: oVariantModel.sFlexReference,
			flexObjects: aChangesToBeDeleted
		});
	};

	/**
	 * Sets the variant properties and adds a variant change
	 *
	 * @param {string} sVariantManagementReference - Variant management reference
	 * @param {object} mPropertyBag - Map of properties
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject} Created Change object
	 */
	VariantManager.addVariantChange = function(sVariantManagementReference, mPropertyBag) {
		const oVariantModel = getVariantModel(mPropertyBag.appComponent);
		var oChange = VariantManager.createVariantChange(sVariantManagementReference, mPropertyBag);
		FlexObjectManager.addDirtyFlexObjects(oVariantModel.sFlexReference, [oChange]);

		return oChange;
	};

	/**
	 * Sets the variant properties and adds variant changes
	 * @param {string} sVariantManagementReference - Variant management reference
	 * @param {object[]} aChangePropertyMaps - Array of property maps optionally including the adaptation ID
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} Created Change objects
	 */
	VariantManager.addVariantChanges = function(sVariantManagementReference, aChangePropertyMaps) {
		const oVariantModel = getVariantModel(aChangePropertyMaps[0].appComponent);
		var aChanges = aChangePropertyMaps.map(function(mProperties) {
			return VariantManager.createVariantChange(sVariantManagementReference, mProperties);
		});
		FlexObjectManager.addDirtyFlexObjects(oVariantModel.sFlexReference, aChanges);

		return aChanges;
	};

	/**
	 * Sets the variant properties and deletes a variant change
	 *
	 * @param {string} sVariantManagementReference - Variant management reference
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Variant change to be deleted
	 */
	VariantManager.deleteVariantChange = function(sVariantManagementReference, mPropertyBag, oChange) {
		const oVariantModel = getVariantModel(mPropertyBag.appComponent);
		oVariantModel.setVariantProperties(sVariantManagementReference, mPropertyBag);
		FlexObjectManager.deleteFlexObjects({
			reference: oVariantModel.sFlexReference,
			flexObjects: [oChange]
		});
	};

	/**
	 * Sets the variant properties and creates a variant change
	 *
	 * @param {string} sVariantManagementReference - Variant management reference
	 * @param {object} mPropertyBag - Map of properties
	 * @param {string} [mPropertyBag.adaptationId] - Adaptation ID to set which overrules the currently display adaptation
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject} Created Change object
	 */
	VariantManager.createVariantChange = function(sVariantManagementReference, mPropertyBag) {
		const oVariantModel = getVariantModel(mPropertyBag.appComponent);
		var mAdditionalChangeContent = oVariantModel.setVariantProperties(sVariantManagementReference, mPropertyBag);

		var mNewChangeData = {
			changeType: mPropertyBag.changeType,
			layer: mPropertyBag.layer,
			generator: mPropertyBag.generator,
			reference: oVariantModel.sFlexReference
		};

		if (mPropertyBag.adaptationId !== undefined) {
			mNewChangeData.adaptationId = mPropertyBag.adaptationId;
		} else {
			mNewChangeData.adaptationId = getAdaptationId(mPropertyBag.layer, mPropertyBag.appComponent, oVariantModel.sFlexReference);
		}

		let oChange;
		if (mPropertyBag.changeType === "setDefault") {
			mNewChangeData.fileType = "ctrl_variant_management_change";
			mNewChangeData.selector = JsControlTreeModifier.getSelector(sVariantManagementReference, mPropertyBag.appComponent);
			oChange = FlexObjectFactory.createVariantManagementChange(mNewChangeData);
		} else {
			mNewChangeData.fileType = "ctrl_variant_change";
			mNewChangeData.variantId = mPropertyBag.variantReference;
			oChange = FlexObjectFactory.createVariantChange(mNewChangeData);
		}

		// update change with additional content
		oChange.setContent(mAdditionalChangeContent);
		if (mPropertyBag.changeType === "setTitle") {
			oChange.setText("title", mPropertyBag.title, "XFLD");
		}

		return oChange;
	};

	/**
	 * Opens the <i>Manage Views</i> dialog.
	 * Returns a promise which resolves to changes made from the manage dialog, based on the parameters passed.
	 *
	 * @param {sap.ui.fl.variants.VariantManagement} oVariantManagementControl - Variant management control
	 * @param {string} sVMReference - Variant management reference
	 * @param {string} sLayer - Current layer
	 * @param {string} sClass - Style class assigned to the management dialog
	 * @param {Promise<sap.ui.core.ComponentContainer>} oContextSharingComponentPromise - Promise resolving with the ComponentContainer
	 * @returns {Promise<void>} Resolves when "manage" event is fired from the variant management control
	 * @private
	 * @ui5-restricted
	 */
	VariantManager.manageVariants = function(oVariantManagementControl, sVMReference, sLayer, sClass, oContextSharingComponentPromise) {
		const oVariantModel = getVariantModel(oVariantManagementControl);
		// called from the ControlVariant plugin in Adaptation mode
		return new Promise(function(resolve) {
			oVariantManagementControl.attachEventOnce("manage", {
				resolve,
				variantManagementReference: sVMReference,
				layer: sLayer
			}, oVariantModel.fnManageClickRta, oVariantModel);
			oVariantManagementControl.openManagementDialog(true, sClass, oContextSharingComponentPromise);
		});
	};

	return VariantManager;
});
