/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/util/restricted/_pick",
	"sap/base/util/ObjectPath",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexState/changes/DependencyHandler",
	"sap/ui/fl/apply/_internal/flexState/DataSelector",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/LayerUtils"
], function(
	_omit,
	_pick,
	ObjectPath,
	VariantsApplyUtil,
	DependencyHandler,
	DataSelector,
	States,
	FlexState,
	LayerUtils
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
	const mCurrentVariantReferences = {};
	const mVariantSwitchPromises = {};

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
		.slice()
		.reverse()
		.map((oVariantManagementChange) => {
			return oVariantManagementChange.getContent().defaultVariant;
		})
		.find((sDesiredDefaultVariantKey) => {
			return aVariantKeys.includes(sDesiredDefaultVariantKey);
		});
	}

	function createVariantManagement(aCtrlVariantManagementChanges, sReference, sVMReference) {
		var sCurrentVariantReference = (mCurrentVariantReferences[sReference] || {})[sVMReference];
		return {
			defaultVariant: sVMReference,
			currentVariant: sCurrentVariantReference,
			variants: [],
			variantManagementChanges: aCtrlVariantManagementChanges.filter(function(oFlexObject) {
				return (oFlexObject.getSelector().id === sVMReference);
			})
		};
	}

	function findVariantInFlexObjects(aFlexObjects, sId) {
		return aFlexObjects.find((oFlexObject) => {
			return oFlexObject.getId() === sId;
		});
	}

	function getAllReferencedVariantIds(aVariants, oVariant) {
		const aFoundVariants = [];
		let oCurrentVariant = oVariant;
		let oFoundVariant;
		do {
			oFoundVariant = findVariantInFlexObjects(aVariants, oCurrentVariant.getVariantReference());
			if (oFoundVariant) {
				aFoundVariants.push(oCurrentVariant);
				oCurrentVariant = oFoundVariant;
			}
		} while (oFoundVariant);
		return aFoundVariants.map((oVariant) => oVariant.getId());
	}

	function createVariantEntry(oGroupedFlexObjects, oVariantInstance) {
		const aReferencedVariantIds = getAllReferencedVariantIds(oGroupedFlexObjects.variants, oVariantInstance);
		return {
			instance: oVariantInstance,
			variantChanges: oGroupedFlexObjects.variantChanges.filter(function(oFlexObject) {
				return oFlexObject.getSelector().id === oVariantInstance.getId();
			}),
			controlChanges: oGroupedFlexObjects.changes.filter(function(oFlexObject) {
				var bCorrectFlexObjectType = oFlexObject.isA("sap.ui.fl.apply._internal.flexObjects.UIChange");
				if (!bCorrectFlexObjectType) {
					return false;
				}
				var bOwnControlChange = oFlexObject.getVariantReference() === oVariantInstance.getId();
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
			author: oVariantInstance.getAuthor(),
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

	function groupFlexObjects(aFlexObjects) {
		const oGroupedFlexObjects = {
			variants: [],
			variantManagementChanges: [],
			changes: [],
			variantChanges: []
		};
		aFlexObjects.forEach((oFlexObject) => {
			switch (oFlexObject.getFileType()) {
				case "ctrl_variant":
					oGroupedFlexObjects.variants.push(oFlexObject);
					break;
				case "ctrl_variant_management_change":
					oGroupedFlexObjects.variantManagementChanges.push(oFlexObject);
					break;
				case "change":
					oGroupedFlexObjects.changes.push(oFlexObject);
					break;
				case "ctrl_variant_change":
					oGroupedFlexObjects.variantChanges.push(oFlexObject);
					break;
				default:
					break;
			}
		});
		return oGroupedFlexObjects;
	}

	function createVariantsMap(aFlexObjects) {
		const oGroupedFlexObjects = groupFlexObjects(aFlexObjects);
		const sReference = aFlexObjects[0]?.getFlexObjectMetadata().reference;

		const oVariantManagementsMap = {};
		oGroupedFlexObjects.variants.forEach((oVariantInstance) => {
			var sVMReference = oVariantInstance.getVariantManagementReference();
			oVariantManagementsMap[sVMReference] ||= createVariantManagement(
				oGroupedFlexObjects.variantManagementChanges, sReference, sVMReference
			);
			oVariantManagementsMap[sVMReference].variants.push(
				createVariantEntry(oGroupedFlexObjects, oVariantInstance)
			);
		});

		oGroupedFlexObjects.variantChanges.forEach((oVariantChange) => {
			const oVariantEntry = findVariant(oVariantManagementsMap, oVariantChange);
			if (oVariantEntry) {
				applyVariantChange(oVariantEntry, oVariantChange, sReference, oVariantManagementsMap);
			}
		});

		oGroupedFlexObjects.variantManagementChanges.forEach((oVariantManagementChange) => {
			const oVariantManagementEntry = oVariantManagementsMap[oVariantManagementChange.getSelector().id];
			if (oVariantManagementEntry) {
				applyVariantManagementChange(oVariantManagementEntry, oVariantManagementChange);
			}
		});

		Object.keys(oVariantManagementsMap).forEach((sVMReference) => {
			const oVariantManagement = oVariantManagementsMap[sVMReference];

			// If current variant is not already set, set initial current variant
			// Current variant might be unavailable due to layer filtering
			// or because a component with a different id but the same flex reference was initialized
			if (
				!oVariantManagement.currentVariant || !oVariantManagement.variants.some((oVariant) => {
					return oVariant.key === oVariantManagement.currentVariant;
				})
			) {
				const sCurrentVariant = getInitialCurrentVariant(
					sReference,
					oGroupedFlexObjects.variantManagementChanges,
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
		parentDataSelector: FlexState.getFlexObjectsDataSelector(),
		executeFunction: createVariantsMap,
		checkInvalidation(mParameters, oUpdateInfo) {
			if (oUpdateInfo.type === "switchVariant") {
				return true;
			}

			const aRelevantFlexObjectTypes = ["addFlexObject", "updateFlexObject", "removeFlexObject"];
			const bRelevantType = aRelevantFlexObjectTypes.includes(oUpdateInfo.type);
			const aRelevantVariantFileTypes = ["ctrl_variant", "ctrl_variant_change", "ctrl_variant_management_change"];
			const bRelevantVariantType = aRelevantVariantFileTypes.includes(oUpdateInfo.updatedObject?.getFileType?.());
			const bHasVariantReference = oUpdateInfo.updatedObject?.getVariantReference?.();
			return bRelevantType && (bRelevantVariantType || bHasVariantReference);
		}
	});

	var oVariantManagementsDataSelector = new DataSelector({
		id: "variantManagements",
		parameterKey: "variantManagementReference",
		parentDataSelector: oVariantManagementMapDataSelector,
		executeFunction(oVariantManagementsMap, mParameters) {
			return oVariantManagementsMap[mParameters.variantManagementReference];
		}
	});

	var oVariantsDataSelector = new DataSelector({
		id: "variants",
		parameterKey: "variantReference",
		parentDataSelector: oVariantManagementsDataSelector,
		executeFunction(oVariantManagement, mParameters) {
			return oVariantManagement.variants.find((oVariant) => {
				return oVariant.instance.getId() === mParameters.variantReference;
			});
		}
	});

	const oUIChangesDependencyMapDataSelector = new DataSelector({
		id: "vmDependentDependencyMap",
		parentDataSelector: oVariantManagementMapDataSelector,
		executeFunction(oVariantManagementsMap, mParameters) {
			let aAllUIChanges = [];
			Object.entries(oVariantManagementsMap).forEach(([sVariantManagementReference, oVariantManagement]) => {
				aAllUIChanges = aAllUIChanges.concat(VariantManagementState.getControlChangesForVariant({
					vmReference: sVariantManagementReference,
					vReference: oVariantManagement.currentVariant,
					reference: mParameters.reference
				}));
			});
			const oDependencyMap = DependencyHandler.createEmptyDependencyMap();
			const sComponentId = FlexState.getComponentIdForReference(mParameters.reference);
			aAllUIChanges.forEach((oFlexObject) => {
				DependencyHandler.addChangeAndUpdateDependencies(oFlexObject, sComponentId, oDependencyMap);
			});
			return oDependencyMap;
		},
		checkInvalidation(mParameters, oUpdateInfo) {
			if (oUpdateInfo.type === "switchVariant") {
				return true;
			}
			const bRelevantType = ["addFlexObject", "removeFlexObject"].includes(oUpdateInfo.type);
			const bRelevantFlexObjectType = oUpdateInfo.updatedObject.getFileType() === "change";
			const aCurrentVariants = Object.values((mCurrentVariantReferences[mParameters.reference] || {}));
			return bRelevantFlexObjectType && bRelevantType && aCurrentVariants.includes(oUpdateInfo.updatedObject.getVariantReference());
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

	VariantManagementState.getDependencyMap = function(sReference) {
		return oUIChangesDependencyMapDataSelector.get({reference: sReference});
	};

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
	 * Returns the instances of all current variants
	 *
	 * @param {string} sReference - Component reference
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlVariant[]} Array of current variant instances
	 */
	VariantManagementState.getAllCurrentVariants = function(sReference) {
		const oVariantsMap = oVariantManagementMapDataSelector.get({
			reference: sReference
		});
		return Object.entries(oVariantsMap).map((aEntry) => {
			const oCurrentVariant = VariantManagementState.getVariant({
				vmReference: aEntry[0],
				vReference: aEntry[1].currentVariant,
				reference: sReference
			}).instance;
			return oCurrentVariant;
		});
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
	 * @param {string} [mPropertyBag.includeDirtyChanges] - Whether dirty changes should be included
	 *
	 * @returns {Array} All changes of current or default variants
	 * @private
	 * @ui5-restricted
	 */
	VariantManagementState.getInitialUIChanges = function(mPropertyBag) {
		var oVariantsMap = oVariantManagementMapDataSelector.get({
			reference: mPropertyBag.reference
		});
		mPropertyBag.includeDirtyChanges = !!mPropertyBag.includeDirtyChanges;
		return Object.keys(oVariantsMap).reduce(function(aInitialChanges, sVMReference) {
			if (
				(mPropertyBag.vmReference && mPropertyBag.vmReference === sVMReference)
				|| !mPropertyBag.vmReference
			) {
				var mArguments = Object.assign({}, mPropertyBag, {
					vmReference: sVMReference,
					vReference: oVariantsMap[sVMReference].currentVariant
				});

				// Concatenate with the previous flex changes
				return aInitialChanges.concat(VariantManagementState.getControlChangesForVariant(mArguments));
			}
			return aInitialChanges;
		}, []);
	};

	/**
	 * Returns the following FlexObjects: All Variants and VariantManagementChanges, and all ControlChanges for the current variants.
	 *
	 * @param {object} mPropertyBag - Object with the necessary properties
	 * @param {string} mPropertyBag.reference - Component reference
	 *
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} All changes of current or default variants
	 * @private
	 * @ui5-restricted
	 */
	VariantManagementState.getAllCurrentFlexObjects = function(mPropertyBag) {
		const oVariantsMap = oVariantManagementMapDataSelector.get({
			reference: mPropertyBag.reference
		});
		return Object.keys(oVariantsMap).reduce(function(aInitialChanges, sVMReference) {
			if (
				(mPropertyBag.vmReference && mPropertyBag.vmReference === sVMReference)
				|| !mPropertyBag.vmReference
			) {
				const mArguments = Object.assign({}, mPropertyBag, {
					vmReference: sVMReference,
					vReference: oVariantsMap[sVMReference].currentVariant
				});
				const oVariant = VariantManagementState.getVariant(mArguments);
				return aInitialChanges
				.concat(oVariant.variantChanges)
				.concat(oVariant.controlChanges)
				.concat(oVariantsMap[sVMReference].variantManagementChanges)
				.concat(oVariantsMap[sVMReference].variants.map((oVariant) => oVariant.instance));
			}
			return aInitialChanges;
		}, []);
	};

	/**
	 * Takes an array of FlexObjects and filters out any hidden variant and changes on those hidden variants
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aFlexObjects - FlexObjects to be filtered
	 * @param {string} sReference - Flex reference of the application
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} Filtered list of FlexObjects
	 */
	VariantManagementState.filterHiddenFlexObjects = function(aFlexObjects, sReference) {
		const oVariantManagementState = oVariantManagementMapDataSelector.get({ reference: sReference });
		const aHiddenVariants = [];
		Object.values(oVariantManagementState).forEach((oVariantManagement) => {
			oVariantManagement.variants.forEach((oVariant) => {
				if (oVariant.visible === false) {
					aHiddenVariants.push(oVariant.key);
				}
			});
		});
		return aFlexObjects.filter((oFilteredFlexObject) => {
			const sVariantReference = {
				// eslint-disable-next-line camelcase
				ctrl_variant: () => (oFilteredFlexObject.getVariantId()),
				// eslint-disable-next-line camelcase
				ctrl_variant_change: () => (oFilteredFlexObject.getSelector().id),
				change: () => (oFilteredFlexObject.getVariantReference())
			}[oFilteredFlexObject.getFileType()]?.();
			return !aHiddenVariants.includes(sVariantReference);
		});
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
		oVariantManagementMapDataSelector.checkUpdate(
			{ reference: mPropertyBag.reference },
			[{ type: "switchVariant"}]
		);
	};

	/**
	 * Sets the promise for the variant switch for the given reference.
	 *
	 * @param {string} sReference - Flex reference of the app
	 * @param {Promise<undefined>} oPromise - Variant Switch Promise
	 */
	VariantManagementState.setVariantSwitchPromise = function(sReference, oPromise) {
		mVariantSwitchPromises[sReference] = oPromise;
	};

	/**
	 * Gets the promise for the variant switch for the given reference.
	 *
	 * @param {string} sReference - Flex reference of the app
	 * @returns {Promise<undefined>} Variant Switch Promise
	 */
	VariantManagementState.getVariantSwitchPromise = function(sReference) {
		return mVariantSwitchPromises[sReference];
	};

	return VariantManagementState;
});