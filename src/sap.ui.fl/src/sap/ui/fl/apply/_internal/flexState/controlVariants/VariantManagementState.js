/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/util/restricted/_pick",
	"sap/base/util/includes",
	"sap/base/util/isEmptyObject",
	"sap/base/util/merge",
	"sap/base/util/ObjectPath",
	"sap/base/util/each",
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/apply/_internal/controlVariants/Utils",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/Change",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Utils",
	"sap/ui/fl/Variant"
], function(
	_omit,
	_pick,
	includes,
	isEmptyObject,
	merge,
	ObjectPath,
	each,
	Log,
	JsControlTreeModifier,
	VariantsApplyUtil,
	FlexState,
	Change,
	LayerUtils,
	Utils,
	Variant
) {
	"use strict";

	/**
	 * Handler class to manipulate control variant changes in a variants map. See also {@link sap.ui.fl.variants.VariantManagement}.
	 *
	 * @namespace sap.ui.fl.apply._internal.flexState.controlVariants.VariantManagementState
	 * @experimental Since 1.74
	 * @since 1.74
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */
	var VariantManagementState = {};

	var _mFakedStandardVariants = {};

	function getReferencedChanges(mPropertyBag) {
		var aReferencedVariantChanges = [];
		if (mPropertyBag.variantData.content.variantReference) {
			aReferencedVariantChanges = VariantManagementState.getControlChangesForVariant(Object.assign(
				mPropertyBag, {
					vReference: mPropertyBag.variantData.content.variantReference,
					changeInstance: true
				}));
			return aReferencedVariantChanges.filter(function(oReferencedChange) {
				return LayerUtils.compareAgainstCurrentLayer(oReferencedChange.getDefinition().layer, mPropertyBag.variantData.content.layer) === -1; /* Referenced change layer below current layer*/
			});
		}
		return aReferencedVariantChanges;
	}

	function getVariants(mPropertyBag) {
		var oVariantsMap = VariantManagementState.getContent(mPropertyBag.reference);
		var aVariants = ObjectPath.get([mPropertyBag.vmReference, "variants"], oVariantsMap);
		return aVariants || [];
	}

	function addChangeContentToVariantMap(oVariantObject, oChangeContent, bAdd) {
		var sChangeType = oChangeContent.changeType;
		if (!oVariantObject) {
			oVariantObject = {};
		}
		if (!oVariantObject[sChangeType]) {
			oVariantObject[sChangeType] = [];
		}
		if (bAdd) {
			oVariantObject[sChangeType].push(oChangeContent);
			return true;
		}
		return oVariantObject[sChangeType].some(function(oExistingContent, iIndex) {
			if (oExistingContent.fileName === oChangeContent.fileName) {
				oVariantObject[sChangeType].splice(iIndex, 1);
				return true;
			}
		});
	}

	function addChange(oChangeContent, oFlexObjects) {
		var sChangeCategory = getVariantChangeCategory(oChangeContent);
		oFlexObjects[sChangeCategory].push(oChangeContent);
	}

	function deleteChange(oChangeContent, oFlexObjects) {
		var sChangeCategory = getVariantChangeCategory(oChangeContent);
		var iChangeContentIndex = -1;
		oFlexObjects[sChangeCategory].some(function(oExistingChangeContent, iIndex) {
			if (oExistingChangeContent.fileName === oChangeContent.fileName) {
				iChangeContentIndex = iIndex;
				return true;
			}
		});
		if (iChangeContentIndex > -1) {
			oFlexObjects[sChangeCategory].splice(iChangeContentIndex, 1);
		}
	}

	function getVariantChangeCategory(oChangeContent) {
		switch (oChangeContent.fileType) {
			case "change":
				return "variantDependentControlChanges";
			case "ctrl_variant":
				return "variants";
			case "ctrl_variant_change":
				return "variantChanges";
			case "ctrl_variant_management_change":
				return "variantManagementChanges";
			default:
		}
	}

	/**
	 * Returns variant management state for the passed component reference.
	 *
	 * @param {string} sReference - Component reference
	 *
	 * @returns {object} Variant management state
	 * @private
	 * @ui5-restricted
	 */
	VariantManagementState.getContent = function(sReference) {
		var oVariantsState = FlexState.getVariantsState(sReference);
		each(_mFakedStandardVariants[sReference], function(sVariantManagementReference, oContent) {
			if (!oVariantsState[sVariantManagementReference]) {
				oVariantsState[sVariantManagementReference] = oContent;
			}
		});
		return oVariantsState;
	};

	VariantManagementState.addFakeStandardVariant = function(sReference, oStandardVariant) {
		var oVariantsMap = VariantManagementState.getContent(sReference);
		if (!oVariantsMap[Object.keys(oStandardVariant)[0]]) {
			merge(oVariantsMap, oStandardVariant);

			_mFakedStandardVariants[sReference] = _mFakedStandardVariants[sReference] || {};
			merge(_mFakedStandardVariants[sReference], oStandardVariant);
		} else {
			Log.error("Error in VariantManagementState.addFakeStandardVariant: Variant already in map");
		}
	};

	VariantManagementState.clearFakedStandardVariants = function(sReference) {
		delete _mFakedStandardVariants[sReference];
	};

	/**
	 * Resets variant management state
	 *
	 * @param {string} sReference - Component reference
	 *
	 * @private
	 * @ui5-restricted
	 */
	VariantManagementState.resetContent = function(sReference) {
		// reset on component destroy() should be handled more centrally
		// once all maps are prepared in flex state
		FlexState.clearFilteredResponse(sReference);
	};

	/**
	 * Returns control changes for a given variant reference.
	 *
	 * @param {object} mPropertyBag Object with the necessary properties
	 * @param {String} mPropertyBag.vmReference - Variant management reference
	 * @param {String} mPropertyBag.vReference - ID of the variant
	 * @param {string} mPropertyBag.reference - Component reference
	 * @param {boolean} [mPropertyBag.changeInstance] <code>true</code> if each change has to be an instance of <code>sap.ui.fl.Change</code>
	 *
	 * @returns {object[]|sap.ui.fl.Change[]} All changes of the variant
	 * @private
	 * @ui5-restricted
	 */
	VariantManagementState.getControlChangesForVariant = function(mPropertyBag) {
		var aResult = [];
		var oVariant = VariantManagementState.getVariant(mPropertyBag);
		if (oVariant) {
			aResult = oVariant.controlChanges;
			if (!mPropertyBag.changeInstance) {
				aResult = aResult.map(function(oChange) {
					return oChange.getDefinition();
				});
			}
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
	 * @param {string} [mPropertyBag.vReference] - Variant reference
	 *
	 * @returns {object | undefined} Variant object if found
	 * @private
	 * @ui5-restricted
	 */
	VariantManagementState.getVariant = function(mPropertyBag) {
		var oVariant;
		var oVariantsMap = VariantManagementState.getContent(mPropertyBag.reference);
		mPropertyBag.vReference = mPropertyBag.vReference || oVariantsMap[mPropertyBag.vmReference].defaultVariant;
		var aVariants = getVariants(mPropertyBag);
		aVariants.some(function(oCurrentVariant) {
			if (oCurrentVariant.content.fileName === mPropertyBag.vReference) {
				oVariant = oCurrentVariant;
				return true;
			}
		});
		return oVariant;
	};

	/**
	 * Returns the current variant reference for a given variant management reference.
	 *
	 * @param {object} mPropertyBag - Object with the necessary properties
	 * @param {String} mPropertyBag.vmReference - Variant management reference
	 * @param {string} mPropertyBag.reference - Component reference
	 * @returns {string} Reference of the current variant
	 */
	VariantManagementState.getCurrentVariantReference = function(mPropertyBag) {
		var oVariantsMap = VariantManagementState.getContent(mPropertyBag.reference);
		var oVariantManagementSection = oVariantsMap[mPropertyBag.vmReference];
		return oVariantManagementSection.currentVariant || oVariantManagementSection.defaultVariant;
	};

	/**
	 * Returns the variant management references saved in the FlexState.
	 *
	 * @param {string} sReference Flexreference of the current app
	 * @returns {string[]} Array of flexreferences
	 */
	VariantManagementState.getVariantManagementReferences = function(sReference) {
		var oVariantsMap = VariantManagementState.getContent(sReference);
		return Object.keys(oVariantsMap);
	};

	/**
	 * Adds a variant to a variant management reference.
	 *
	 * @param {object} mPropertyBag - Object with the necessary properties
	 * @param {object} mPropertyBag.variantData - Variant data to be added
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {string} mPropertyBag.reference - Component reference
	 *
	 * @returns {int} Index at which the variant was added
	 * @private
	 * @ui5-restricted
	 */
	VariantManagementState.addVariantToVariantManagement = function(mPropertyBag) {
		var oVariantsMap = VariantManagementState.getContent(mPropertyBag.reference);
		var aVariants = oVariantsMap[mPropertyBag.vmReference].variants.slice().splice(1);
		var iIndex = VariantsApplyUtil.getIndexToSortVariant(aVariants, mPropertyBag.variantData);

		//Set the whole list of changes to the variant
		if (mPropertyBag.variantData.content.variantReference) {
			var aReferencedVariantChanges = getReferencedChanges(mPropertyBag);
			mPropertyBag.variantData.controlChanges = aReferencedVariantChanges.concat(mPropertyBag.variantData.controlChanges);
		}

		//Skipping standard variant with iIndex + 1
		oVariantsMap[mPropertyBag.vmReference].variants.splice(iIndex + 1, 0, mPropertyBag.variantData);
		return iIndex + 1;
	};

	/**
	 * Removes a variant from a variant management reference.
	 *
	 * @param {object} mPropertyBag - Object with the necessary properties
	 * @param {sap.ui.fl.Variant} mPropertyBag.variant - Variant to be removed
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {string} mPropertyBag.reference - Component reference
	 *
	 * @returns {int} Index from which the variant was removed
	 * @private
	 * @ui5-restricted
	 */
	VariantManagementState.removeVariantFromVariantManagement = function(mPropertyBag) {
		var iIndex;
		var oVariantsMap = VariantManagementState.getContent(mPropertyBag.reference);
		var bFound = oVariantsMap[mPropertyBag.vmReference].variants.some(
			function(oCurrentVariantContent, index) {
				var oCurrentVariant = new Variant(oCurrentVariantContent); //why?
				if (oCurrentVariant.getId() === mPropertyBag.variant.getId()) {
					iIndex = index;
					return true;
				}
			});
		if (bFound) {
			oVariantsMap[mPropertyBag.vmReference].variants.splice(iIndex, 1);
		}
		return iIndex;
	};

	/**
	 * Sorts and re-orders the passed variant object in the variants map
	 *
	 * @param {object} mPropertyBag - Object with the necessary properties
	 * @param {object} mPropertyBag.variantData - Variant data
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {string} mPropertyBag.reference - Component reference
	 * @param {int} mPropertyBag.previousIndex - Previous index of variant object
	 *
	 * @returns {int} The updated index for the passed variant data
	 * @private
	 * @ui5-restricted
	 */
	VariantManagementState.setVariantData = function(mPropertyBag) {
		var oVariantsMap = VariantManagementState.getContent(mPropertyBag.reference);
		var aVariants = oVariantsMap[mPropertyBag.vmReference].variants;
		var oVariantData = aVariants[mPropertyBag.previousIndex];
		Object.keys(mPropertyBag.variantData).forEach(function(sProperty) {
			if (oVariantData.content.content[sProperty]) {
				oVariantData.content.content[sProperty] = mPropertyBag.variantData[sProperty];
			}
		});

		//Standard variant should always be at the first position, all others are sorted alphabetically
		if (oVariantData.content.fileName !== mPropertyBag.vmReference) {
			//remove element
			aVariants.splice(mPropertyBag.previousIndex, 1);

			//slice to skip first element, which is the standard variant
			var iSortedIndex = VariantsApplyUtil.getIndexToSortVariant(aVariants.slice(1), oVariantData);

			//add at sorted index (+1 to accommodate standard variant)
			aVariants.splice(iSortedIndex + 1, 0, oVariantData);

			return iSortedIndex + 1;
		}

		aVariants.splice(mPropertyBag.previousIndex, 1, oVariantData);
		return mPropertyBag.previousIndex;
	};

	/**
	 * Add a control change to a variant.
	 *
	 * @param {object} mPropertyBag - Object with the necessary properties
	 * @param {sap.ui.fl.Change} mPropertyBag.change - Control change
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {string} mPropertyBag.vReference - Variant reference
	 * @param {string} mPropertyBag.reference - Component reference
	 *
	 * @returns {boolean} Indicates if change was added
	 * @private
	 * @ui5-restricted
	 */
	VariantManagementState.addChangeToVariant = function(mPropertyBag) {
		var aExistingChanges = VariantManagementState.getControlChangesForVariant(Object.assign(mPropertyBag, {changeInstance: true}));
		var aChangeFileNames = aExistingChanges.map(function(oChange) {
			return oChange.getDefinition().fileName;
		});

		if (!includes(aChangeFileNames, mPropertyBag.change.getDefinition().fileName)) {
			var oVariant = VariantManagementState.getVariant(mPropertyBag);
			oVariant.controlChanges = aExistingChanges.concat([mPropertyBag.change]);
			return true;
		}
		return false;
	};

	/**
	 * Removes a control change from a variant.
	 *
	 * @param {object} mPropertyBag - Object with the necessary properties
	 * @param {sap.ui.fl.Change} mPropertyBag.change - Control change
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {string} mPropertyBag.vReference - Variant reference
	 * @param {string} mPropertyBag.reference - Component reference
	 *
	 * @returns {boolean} Indicates if change was removed
	 * @private
	 * @ui5-restricted
	 */
	VariantManagementState.removeChangeFromVariant = function(mPropertyBag) {
		var aControlChanges = VariantManagementState.getControlChangesForVariant(Object.assign(mPropertyBag, {changeInstance: true}));
		var oVariant = VariantManagementState.getVariant(mPropertyBag);
		var bChangeFound = false;

		if (oVariant) {
			oVariant.controlChanges = aControlChanges.filter(function(oCurrentChange) {
				if (!bChangeFound && oCurrentChange.getId() === mPropertyBag.change.getId()) {
					bChangeFound = true;
					return false;
				}
				return true;
			});
		}
		return bChangeFound;
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
	 * @param {boolean} [mPropertyBag.changeInstance] <code>true</code> if each change has to be an instance of <code>sap.ui.fl.Change</code>
	 *
	 * @returns {Array} All changes of current or default variants
	 * @private
	 * @ui5-restricted
	 */
	VariantManagementState.getInitialChanges = function(mPropertyBag) {
		var oVariantsMap = VariantManagementState.getContent(mPropertyBag.reference);
		return Object.keys(oVariantsMap).reduce(function(aInitialChanges, sVMReference) {
			if (
				(mPropertyBag.vmReference && mPropertyBag.vmReference === sVMReference)
				|| !mPropertyBag.vmReference
			) {
				var sCurrentVReference = oVariantsMap[sVMReference].currentVariant ? "currentVariant" : "defaultVariant";
				var mArguments = {
					vmReference: sVMReference,
					vReference: oVariantsMap[sVMReference][sCurrentVReference],
					reference: mPropertyBag.reference,
					changeInstance: mPropertyBag.changeInstance
				};

				// Concatenate with the previous flex changes
				return aInitialChanges.concat(VariantManagementState.getControlChangesForVariant(Object.assign({}, mPropertyBag, mArguments)));
			}
			return aInitialChanges;
		}, []);
	};

	/**
	 * Returns prepared variant model data based on the passed component reference.
	 *
	 * @param {object} mPropertyBag - Object with the necessary properties
	 * @param {string} mPropertyBag.reference - Component reference
	 *
	 * @returns {object} Prepared variant model data
	 * @private
	 * @ui5-restricted
	 */
	VariantManagementState.fillVariantModel = function(mPropertyBag) {
		var oVariantsMap = VariantManagementState.getContent(mPropertyBag.reference);
		return Object.keys(oVariantsMap).reduce(
			function(oVariantData, sVMReference) {
				oVariantData[sVMReference] = {
					//in case of no variant management change the standard variant is set as default
					defaultVariant: oVariantsMap[sVMReference].defaultVariant,
					variants: []
				};
				//if a current variant is set in the map, it should be set in the model
				if (oVariantsMap[sVMReference].currentVariant) {
					oVariantData[sVMReference].currentVariant = oVariantsMap[sVMReference].currentVariant;
				}
				getVariants(Object.assign(mPropertyBag, {vmReference: sVMReference}))
					.forEach(function(oVariant, index) {
						oVariantData[sVMReference].variants[index] =
							//JSON.parse(JSON.stringify()) used to remove undefined properties e.g. standard variant layer
							JSON.parse(
								JSON.stringify({
									key: oVariant.content.fileName,
									title: oVariant.content.content.title,
									layer: oVariant.content.layer,
									favorite: oVariant.content.content.favorite,
									executeOnSelect: oVariant.content.content.executeOnSelect,
									visible: oVariant.content.content.visible,
									author: ObjectPath.get("content.support.user", oVariant)
								})
							);
					});
				return oVariantData;
			}, {});
	};

	/**
	 * Adds or deletes a variant or variant management change for a variant management reference for the passed variants map.
	 *
	 * @param {object} mPropertyBag - Object with the necessary properties
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {object} mPropertyBag.changeContent - Change content to be added or deleted
	 * @param {string} mPropertyBag.reference - Component reference
	 * @param {boolean} [mPropertyBag.add] - Indicates if change should be added
	 *
	 * @private
	 * @ui5-restricted
	 */
	VariantManagementState.updateChangesForVariantManagementInMap = function(mPropertyBag) {
		var oVariantsMap = VariantManagementState.getContent(mPropertyBag.reference);
		var oVariantManagement = oVariantsMap[mPropertyBag.vmReference];
		if (mPropertyBag.changeContent.fileType === "ctrl_variant_change") {
			oVariantManagement.variants.some(function(oVariant) {
				if (oVariant.content.fileName === mPropertyBag.changeContent.selector.id) {
					addChangeContentToVariantMap(oVariant.variantChanges, mPropertyBag.changeContent, mPropertyBag.add);
				}
			});
		} else if (mPropertyBag.changeContent.fileType === "ctrl_variant_management_change") {
			addChangeContentToVariantMap(oVariantManagement.variantManagementChanges, mPropertyBag.changeContent, mPropertyBag.add);
		}
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
		var oVariantsMap = VariantManagementState.getContent(mPropertyBag.reference);
		if (ObjectPath.get([mPropertyBag.vmReference], oVariantsMap)) {
			oVariantsMap[mPropertyBag.vmReference].currentVariant = mPropertyBag.newVReference;
		}
	};

	/**
	 * Updates the variants state and optionally also adds or deletes a flex object from the flex state
	 *
	 * @param {object} mPropertyBag - Object with the necessary properties
	 * @param {string} mPropertyBag.reference - Flex reference
	 * @param {string} mPropertyBag.content - Variant section content
	 * @param {sap.ui.fl.Change | sap.ui.fl.Variant} mPropertyBag.changeToBeAddedOrDeleted - Flex object to be added or deleted
	 *
	 * @private
	 * @ui5-restricted
	 */
	VariantManagementState.updateVariantsState = function(mPropertyBag) {
		var oVariantsMap = VariantManagementState.getContent(mPropertyBag.reference);

		if (isEmptyObject(oVariantsMap)) {
			// at this point the variants map should be filled,
			// at least through model._ensureStandardVariantExists(),
			// if no variants exist in response
			Log.error("Variant state is not initialized yet");
			return;
		}

		var oFlexObjects = FlexState.getFlexObjectsFromStorageResponse(mPropertyBag.reference);

		if (mPropertyBag.changeToBeAddedOrDeleted) {
			switch (mPropertyBag.changeToBeAddedOrDeleted.getPendingAction()) {
				case "NEW":
					addChange(mPropertyBag.changeToBeAddedOrDeleted.getDefinition(), oFlexObjects);
					break;
				case "DELETE":
					deleteChange(mPropertyBag.changeToBeAddedOrDeleted.getDefinition(), oFlexObjects);
					break;
				default:
			}
		}
	};

	/**
	 * Calls <code>waitForChangesToBeApplied</code> with all the controls that have changes in the initial variant.
	 *
	 * @param {object} mPropertyBag - Object with necessary parameters
	 * @param {string} mPropertyBag.vmReference - Variant management reference
	 * @param {string} mPropertyBag.reference - Component reference
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - App component instance
	 * @param {sap.ui.fl.FlexController} mPropertyBag.flexController - FlexControllerinstance
	 * @returns {Promise} Promise that resolves when all changes for the initial variant are applied
	 */
	VariantManagementState.waitForInitialVariantChanges = function(mPropertyBag) {
		var aCurrentVariantChanges = VariantManagementState.getInitialChanges({
			vmReference: mPropertyBag.vmReference,
			reference: mPropertyBag.reference,
			changeInstance: true
		});
		var aSelectors = aCurrentVariantChanges.reduce(function(aCurrentSelectors, oChange) {
			if (Utils.indexOfObject(aCurrentSelectors, oChange.getSelector()) === -1) {
				aCurrentSelectors.push(oChange.getSelector());
			}
			return aCurrentSelectors;
		}, []);
		var aControls = [];
		aSelectors.map(function(oSelector) {
			var oControl = JsControlTreeModifier.bySelector(oSelector, mPropertyBag.appComponent);
			if (oControl) {
				aControls.push(oControl);
			}
		});

		return mPropertyBag.flexController.waitForChangesToBeApplied(aControls);
	};

	return VariantManagementState;
});