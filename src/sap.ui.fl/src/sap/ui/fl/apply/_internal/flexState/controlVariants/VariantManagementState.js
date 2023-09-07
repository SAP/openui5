/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/util/restricted/_pick",
	"sap/base/util/ObjectPath",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexState/DataSelector",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Utils"
], function(
	_omit,
	_pick,
	ObjectPath,
	JsControlTreeModifier,
	VariantsApplyUtil,
	DataSelector,
	States,
	FlexState,
	LayerUtils,
	Utils
) {
	"use strict";

	/**
	 * Handler class to manipulate control variant changes in a variants map. See also {@link sap.ui.fl.variants.VariantManagement}.
	 *
	 * @namespace sap.ui.fl.apply._internal.flexState.controlVariants.VariantManagementState
	 * @since 1.74
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */
	var VariantManagementState = {};

	// Map that contains the IDs of selected current variants per flex reference and variant management
	// Might contain outdated entries if a different component with the same flex reference is loaded
	// However these outdated entries will be invalidated when the variant management map is built
	var mCurrentVariantReferences = {};

	function getInitialCurrentVariant(sReference, aCtrlVariantManagementChanges, aVariants) {
		var oComponentData = FlexState.getComponentData(sReference);
		var aVariantReferencesFromUrl = ObjectPath.get(
			["technicalParameters", VariantsApplyUtil.VARIANT_TECHNICAL_PARAMETER],
			oComponentData
		) || [];

		// Only visible variants can be current
		var aVariantKeys = aVariants.filter((oVariant) => {
			return oVariant.visible;
		})
		.map((oVariant) => {
			return oVariant.key;
		});

		// Check if variant is set via url parameter
		var sDesiredSelectedVariantId = aVariantKeys.find((sVariantKey) => {
			return aVariantReferencesFromUrl.includes(sVariantKey);
		});
		if (sDesiredSelectedVariantId) {
			return sDesiredSelectedVariantId;
		}

		// Determine latest current variant selection based on setDefault changes
		// Not used for setting the actual default variant because the initialCurrentVariant
		// check is only executed once and influenced by technical parameters
		// Default is set via applyVariantManagementChange instead
		return aCtrlVariantManagementChanges
		.reverse()
		.map((oVariantManagementChange) => {
			return oVariantManagementChange.getContent().defaultVariant;
		})
		.find((sDesiredDefaultVariantKey) => {
			return aVariantKeys.includes(sDesiredDefaultVariantKey);
		});
	}

	function createVariantManagement(aFlexObjects, sReference, sVMReference) {
		var sCurrentVariantReference = (mCurrentVariantReferences[sReference] || {})[sVMReference];
		return {
			defaultVariant: sVMReference,
			currentVariant: sCurrentVariantReference,
			variants: [],
			variantManagementChanges: aFlexObjects.filter(function(oFlexObject) {
				return (
					oFlexObject.getFileType() === "ctrl_variant_management_change"
					&& oFlexObject.getSelector().id === sVMReference
				);
			})
		};
	}

	function findVariantInFlexObjects(aFlexObjects, sId) {
		return aFlexObjects.find((oFlexObject) => {
			return oFlexObject.getId() === sId;
		});
	}

	function getAllReferencedVariantIds(aFlexObjects, oVariant) {
		const aVariants = [];
		let oCurrentVariant = oVariant;
		let oFoundVariant;
		do {
			oFoundVariant = findVariantInFlexObjects(aFlexObjects, oCurrentVariant.getVariantReference());
			if (oFoundVariant) {
				aVariants.push(oCurrentVariant);
				oCurrentVariant = oFoundVariant;
			}
		} while (oFoundVariant);
		return aVariants.map((oVariant) => oVariant.getId());
	}

	function createVariantEntry(aFlexObjects, oVariantInstance) {
		return {
			instance: oVariantInstance,
			variantChanges: aFlexObjects.filter(function(oFlexObject) {
				return (
					oFlexObject.getFileType() === "ctrl_variant_change"
					&& oFlexObject.getSelector().id === oVariantInstance.getId()
				);
			}),
			controlChanges: aFlexObjects.filter(function(oFlexObject) {
				var bCorrectFlexObjectType = oFlexObject.isA("sap.ui.fl.apply._internal.flexObjects.UIChange");
				if (!bCorrectFlexObjectType) {
					return false;
				}
				var bOwnControlChange = oFlexObject.getVariantReference() === oVariantInstance.getId();
				var aReferencedVariantIds = getAllReferencedVariantIds(aFlexObjects, oVariantInstance);
				var bControlChangeOfReferencedVariant = aReferencedVariantIds.indexOf(oFlexObject.getVariantReference()) > -1;
				var bLowerLayerChange = LayerUtils.compareAgainstCurrentLayer(oFlexObject.getLayer(), oVariantInstance.getLayer()) === -1;
				return bOwnControlChange || bControlChangeOfReferencedVariant && bLowerLayerChange;
			}),
			key: oVariantInstance.getId(),
			title: oVariantInstance.getName(),
			layer: oVariantInstance.getLayer(),
			favorite: oVariantInstance.getFavorite(),
			executeOnSelect: oVariantInstance.getExecuteOnSelection(),
			visible: oVariantInstance.getVisible(),
			author: oVariantInstance.getSupportInformation().user,
			contexts: oVariantInstance.getContexts(),
			isStandardVariant: oVariantInstance.getStandardVariant()
		};
	}

	function applyVariantChange(oVariantEntry, oVariantChange) {
		switch (oVariantChange.getChangeType()) {
			case "setTitle":
				oVariantEntry.title = oVariantChange.getText("title");
				break;
			case "setFavorite":
				oVariantEntry.favorite = oVariantChange.getContent().favorite;
				break;
			case "setExecuteOnSelect":
				oVariantEntry.executeOnSelect = oVariantChange.getContent().executeOnSelect;
				break;
			case "setVisible":
				oVariantEntry.visible = oVariantChange.getContent().visible;
				break;
			case "setContexts":
				oVariantEntry.contexts = oVariantChange.getContent().contexts;
				break;
			default:
				throw Error("Unknown ctrl_variant_change type");
		}
	}

	function applyVariantManagementChange(oVariantManagementEntry, oVariantManagementChange) {
		// Currently only setDefault
		var sDesiredDefaultVariant = oVariantManagementChange.getContent().defaultVariant;
		oVariantManagementEntry.variants.forEach((oVariant) => {
			// Only set default if the variant exists and was not removed
			if (
				oVariant.key === sDesiredDefaultVariant
				&& oVariant.visible
			) {
				oVariantManagementEntry.defaultVariant = sDesiredDefaultVariant;
			}
		});
	}

	function createVariantsMap(aFlexObjects, sReference) {
		const aVariants = aFlexObjects.filter((oFlexObject) => {
			return oFlexObject.getFileType() === "ctrl_variant";
		});

		const oVariantManagementsMap = {};
		aVariants.forEach((oVariantInstance) => {
			var sVMReference = oVariantInstance.getVariantManagementReference();
			oVariantManagementsMap[sVMReference] ||= createVariantManagement(aFlexObjects, sReference, sVMReference);
			oVariantManagementsMap[sVMReference].variants.push(
				createVariantEntry(aFlexObjects, oVariantInstance)
			);
		});

		aFlexObjects
		.filter((oFlexObject) => {
			return oFlexObject.getFileType() === "ctrl_variant_change";
		})
		.forEach((oVariantChange) => {
			const oVariantEntry = findVariant(oVariantManagementsMap, oVariantChange);
			if (oVariantEntry) {
				applyVariantChange(oVariantEntry, oVariantChange, sReference, oVariantManagementsMap);
			}
		});

		const aCtrlVariantManagementChanges = aFlexObjects
		.filter((oFlexObject) => {
			return oFlexObject.getFileType() === "ctrl_variant_management_change";
		});

		aCtrlVariantManagementChanges.forEach((oVariantManagementChange) => {
			const oVariantManagementEntry = oVariantManagementsMap[oVariantManagementChange.getSelector().id];
			if (oVariantManagementEntry) {
				applyVariantManagementChange(oVariantManagementEntry, oVariantManagementChange);
			}
		});

		Object.keys(oVariantManagementsMap).forEach((sVMReference) => {
			const oVariantManagement = oVariantManagementsMap[sVMReference];

			// If current variant is not already set, set initial current variant
			// Current variant might be unavailable due to layer filtering
			// or because a component with a different id but the same flex reference was initalized
			if (
				!oVariantManagement.currentVariant || !oVariantManagement.variants.some((oVariant) => {
					return oVariant.key === oVariantManagement.currentVariant;
				})
			) {
				const sCurrentVariant = getInitialCurrentVariant(
					sReference,
					aCtrlVariantManagementChanges,
					oVariantManagement.variants
				) || sVMReference;
				oVariantManagement.currentVariant = sCurrentVariant;
				ObjectPath.set(
					[sReference, sVMReference],
					sCurrentVariant,
					mCurrentVariantReferences
				);
			}

			// Standard variant should always be at the first position, all others are sorted alphabetically
			oVariantManagement.variants.sort((oVariant1, oVariant2) => {
				if (oVariant1.isStandardVariant) {
					return -1;
				}
				if (oVariant2.isStandardVariant) {
					return 1;
				}
				return oVariant1.title.toLowerCase() < oVariant2.title.toLowerCase() ? -1 : 1;
			});

			// Set modified flag
			var aCurrentVariantChanges = oVariantManagement.variants.find((oVariant) => {
				return oVariant.key === oVariantManagement.currentVariant;
			}).controlChanges;
			oVariantManagement.modified = aCurrentVariantChanges.some((oChange) => {
				return !oChange.isPersisted() && !oChange.getSavedToVariant();
			});

			// the default variant must always be a favorite
			// e.g. end user sets variant to default, then key user removes it from favorites
			oVariantManagement.variants.some((oVariant) => {
				if (!oVariant.favorite && oVariant.key === oVariantManagement.defaultVariant) {
					oVariant.favorite = true;
					return true;
				}
				return false;
			});
		});

		return oVariantManagementsMap;
	}

	function findVariant(oVariantsMap, oVariantChange) {
		var oFoundVariant;
		Object.values(oVariantsMap).some(function(oVariantsMapEntry) {
			return oVariantsMapEntry.variants.some(function(oVariant) {
				if (oVariantChange.getSelector().id === oVariant.key) {
					oFoundVariant = oVariant;
					return true;
				}
				return false;
			});
		});
		return oFoundVariant;
	}

	// DataSelectors

	var oVariantManagementMapDataSelector = new DataSelector({
		id: "variantManagementMap",
		parameterKey: "reference",
		parentDataSelector: FlexState.getFlexObjectsDataSelector(),
		executeFunction: createVariantsMap
	});

	var oVariantManagementsDataSelector = new DataSelector({
		id: "variantManagements",
		parameterKey: "variantManagementReference",
		parentDataSelector: oVariantManagementMapDataSelector,
		executeFunction(oVariantManagementsMap, sVMReference) {
			return oVariantManagementsMap[sVMReference];
		}
	});

	var oVariantsDataSelector = new DataSelector({
		id: "variants",
		parameterKey: "variantReference",
		parentDataSelector: oVariantManagementsDataSelector,
		executeFunction(oVariantManagement, sVariantReference) {
			return oVariantManagement.variants.find(function(oVariant) {
				return oVariant.instance.getId() === sVariantReference;
			});
		}
	});

	var oVariantDependentFlexObjectsDataSelector = new DataSelector({
		id: "variantDependentFlexObjects",
		parentDataSelector: FlexState.getFlexObjectsDataSelector(),
		executeFunction(aFlexObjects) {
			return aFlexObjects.filter(function(oFlexObject) {
				const sVariantReference = oFlexObject.getVariantReference?.();
				const bVariantRelatedChange = ["ctrl_variant", "ctrl_variant_change", "ctrl_variant_management_change"]
				.indexOf(oFlexObject.getFileType()) > -1;

				return bVariantRelatedChange || sVariantReference;
			});
		}
	});

	VariantManagementState.getVariantDependentFlexObjects = function(sReference) {
		return oVariantDependentFlexObjectsDataSelector.get({reference: sReference});
	};

	/**
	 * Removes the saved current variant from the internal map for the given reference
	 *
	 * @param {string} sReference - Flex Reference of the app
	 */
	VariantManagementState.resetCurrentVariantReference = function(sReference) {
		delete mCurrentVariantReferences[sReference];
		oVariantManagementMapDataSelector.checkUpdate({
			reference: sReference
		});
	};

	/**
	 * Access to the variant management map selector.
	 *
	 * @returns {object} The data selector for the variant management map
	 */
	VariantManagementState.getVariantManagementMap = function() {
		return oVariantManagementMapDataSelector;
	};

	/**
	 * Wrapper to add a runtime-steady object - that survives the invalidation of the FlexState
	 * For example: a fake standard variant for a variant management if none exists yet.
	 *
	 * @param {string} sReference - Flex reference of the app
	 * @param {string} sComponentId - ID of the component
	 * @param {object} oFlexObject - Flex object to be added as runtime-steady
	 *
	 */
	VariantManagementState.addRuntimeSteadyObject = function(sReference, sComponentId, oFlexObject) {
		FlexState.addRuntimeSteadyObject(sReference, sComponentId, oFlexObject);
	};

	/**
	 * Wrapper to clear the runtime-steady objects for the given component.
	 *
	 * @param {string} sReference - Flex reference of the app
	 * @param {string} sComponentId - ID of the component
	 */
	VariantManagementState.clearRuntimeSteadyObjects = function(sReference, sComponentId) {
		FlexState.clearRuntimeSteadyObjects(sReference, sComponentId);
	};

	/**
	 * Returns control changes for a given variant reference.
	 *
	 * @param {object} mPropertyBag Object with the necessary properties
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {string} mPropertyBag.vReference - ID of the variant
	 * @param {string} mPropertyBag.reference - Component reference
	 * @param {boolean} [mPropertyBag.includeDirtyChanges] - Whether dirty changes of the current session should be included, <code>true</code> by default
	 *
	 * @returns {object[]|sap.ui.fl.apply._internal.flexObjects.FlexObject[]} All changes of the variant
	 * @private
	 * @ui5-restricted
	 */
	VariantManagementState.getControlChangesForVariant = function(mPropertyBag) {
		var aResult = [];
		var oVariant = VariantManagementState.getVariant(mPropertyBag);
		if (oVariant) {
			aResult = oVariant.controlChanges.filter(function(oChange) {
				return (
					mPropertyBag.includeDirtyChanges !== false
					|| oChange.getState() === States.LifecycleState.PERSISTED
				);
			});
		}
		return aResult;
	};

	/**
	 * Returns all the variant changes that belong to the passed variant or default variant
	 *
	 * @param {object} mPropertyBag - Object with the necessary properties
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {string} mPropertyBag.reference - Component reference
	 * @param {string} [mPropertyBag.vReference] - Variant reference
	 * @returns {object} All variant changes of the variant
	 */
	VariantManagementState.getVariantChangesForVariant = function(mPropertyBag) {
		var oVariant = VariantManagementState.getVariant(mPropertyBag);
		return oVariant && oVariant.variantChanges || {};
	};

	/**
	 * Returns the variant object for the passed or default variant reference
	 *
	 * @param {object} mPropertyBag - Object with the necessary properties
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {string} mPropertyBag.reference - Component reference
	 * @param {string} [mPropertyBag.vReference] - Variant reference, default if omitted
	 *
	 * @returns {object | undefined} Variant object if found
	 * @private
	 * @ui5-restricted
	 */
	VariantManagementState.getVariant = function(mPropertyBag) {
		var sVReference = (
			mPropertyBag.vReference
			|| oVariantManagementsDataSelector.get({
				variantManagementReference: mPropertyBag.vmReference,
				reference: mPropertyBag.reference
			}).defaultVariant
		);
		return oVariantsDataSelector.get({
			variantManagementReference: mPropertyBag.vmReference,
			variantReference: sVReference,
			reference: mPropertyBag.reference
		});
	};

	/**
	 * Returns the current variant reference for a given variant management reference.
	 *
	 * @param {object} mPropertyBag - Object with the necessary properties
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {string} mPropertyBag.reference - Component reference
	 * @returns {string} Reference of the current variant
	 */
	VariantManagementState.getCurrentVariantReference = function(mPropertyBag) {
		var oVariantManagementSection = oVariantManagementsDataSelector.get({
			variantManagementReference: mPropertyBag.vmReference,
			reference: mPropertyBag.reference
		});
		return oVariantManagementSection.currentVariant;
	};

	/**
	 * Returns the variant management references saved in the FlexState.
	 *
	 * @param {string} sReference - Flex reference of the current app
	 * @returns {string[]} Array of flex references
	 */
	VariantManagementState.getVariantManagementReferences = function(sReference) {
		var oVariantsMap = oVariantManagementMapDataSelector.get({
			reference: sReference
		});
		return Object.keys(oVariantsMap);
	};

	/**
	 * Returns all variants saved in the FlexState.
	 *
	 * @param {string} sReference - Flex reference of the current app
	 * @returns {object[]} Array of variants
	 */
	VariantManagementState.getAllVariants = function(sReference) {
		var oVariantsMap = oVariantManagementMapDataSelector.get({
			reference: sReference
		});
		return Object.keys(oVariantsMap).reduce(function(aPrev, sCurr) {
			return aPrev.concat(oVariantsMap[sCurr].variants);
		}, []);
	};

	/**
	 * Loads the initial changes of all variant managements.
	 * If the application is started with valid variant references, they are used.
	 * If no references or invalid references were passed, the changes are loaded from the default variant.
	 * If a variant management reference is passed, only the changes for that control are returned.
	 *
	 * @param {object} mPropertyBag - Object with the necessary properties
	 * @param {string} mPropertyBag.reference - Component reference
	 * @param {string} [mPropertyBag.vmReference] - Variant management reference
	 *
	 * @returns {Array} All changes of current or default variants
	 * @private
	 * @ui5-restricted
	 */
	VariantManagementState.getInitialChanges = function(mPropertyBag) {
		var oVariantsMap = oVariantManagementMapDataSelector.get({
			reference: mPropertyBag.reference
		});
		return Object.keys(oVariantsMap).reduce(function(aInitialChanges, sVMReference) {
			if (
				(mPropertyBag.vmReference && mPropertyBag.vmReference === sVMReference)
				|| !mPropertyBag.vmReference
			) {
				var mArguments = Object.assign({}, mPropertyBag, {
					vmReference: sVMReference,
					vReference: oVariantsMap[sVMReference].currentVariant,
					includeDirtyChanges: false
				});

				// Concatenate with the previous flex changes
				return aInitialChanges.concat(VariantManagementState.getControlChangesForVariant(mArguments));
			}
			return aInitialChanges;
		}, []);
	};

	/**
	 * Sets the current variant for a variant management reference for the passed variants map.
	 *
	 * @param {object} mPropertyBag - Object with the necessary properties
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {string} mPropertyBag.newVReference - Variant reference to be set
	 * @param {string} mPropertyBag.reference - Component reference
	 *
	 * @private
	 * @ui5-restricted
	 */
	VariantManagementState.setCurrentVariant = function(mPropertyBag) {
		ObjectPath.set(
			[mPropertyBag.reference, mPropertyBag.vmReference],
			mPropertyBag.newVReference,
			mCurrentVariantReferences
		);
		oVariantManagementMapDataSelector.checkUpdate({
			reference: mPropertyBag.reference
		});
	};

	/**
	 * Calls <code>waitForChangesToBeApplied</code> with all the controls that have changes in the initial variant.
	 *
	 * @param {object} mPropertyBag - Object with necessary parameters
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {string} mPropertyBag.reference - Component reference
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - App component instance
	 * @param {sap.ui.fl.FlexController} mPropertyBag.flexController - FlexController instance
	 * @returns {Promise} Promise that resolves when all changes for the initial variant are applied
	 */
	VariantManagementState.waitForInitialVariantChanges = function(mPropertyBag) {
		var aCurrentVariantChanges = VariantManagementState.getInitialChanges({
			vmReference: mPropertyBag.vmReference,
			reference: mPropertyBag.reference
		});
		var aControls = aCurrentVariantChanges.reduce(function(aCurrentControls, oChange) {
			var oSelector = oChange.getSelector();
			var oControl = JsControlTreeModifier.bySelector(oSelector, mPropertyBag.appComponent);
			if (oControl && Utils.indexOfObject(aCurrentControls, { selector: oControl }) === -1) {
				aCurrentControls.push({ selector: oControl });
			}
			return aCurrentControls;
		}, []);

		return aControls.length ? mPropertyBag.flexController.waitForChangesToBeApplied(aControls) : Promise.resolve();
	};

	return VariantManagementState;
});