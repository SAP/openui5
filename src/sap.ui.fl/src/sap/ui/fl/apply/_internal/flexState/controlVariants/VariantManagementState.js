/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Variant",
	"sap/ui/fl/Change",
	"sap/base/util/ObjectPath",
	"sap/base/util/includes",
	"sap/base/util/restricted/_omit",
	"sap/base/Log",
	"sap/ui/fl/apply/_internal/controlVariants/URLHandler",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/base/util/restricted/_pick",
	"sap/ui/fl/apply/_internal/controlVariants/Utils"
], function(
	Variant,
	Change,
	ObjectPath,
	includes,
	_omit,
	Log,
	URLHandler,
	LayerUtils,
	FlexState,
	_pick,
	VariantsApplyUtil
) {
	"use strict";

	function _getReferencedChanges(mPropertyBag) {
		var aReferencedVariantChanges = [];
		if (mPropertyBag.variantData.content.variantReference) {
			aReferencedVariantChanges = VariantManagementState.getVariantChanges(Object.assign(
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

	function _getVariants(mPropertyBag) {
		var oVariantsMap = VariantManagementState.getContent(mPropertyBag.reference);
		var aVariants = ObjectPath.get([mPropertyBag.vmReference, "variants"], oVariantsMap);
		return aVariants || [];
	}

	function _addChangeContentToVariantMap (oVariantObject, oChangeContent, bAdd) {
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
		return oVariantObject[sChangeType].some(function (oExistingContent, iIndex) {
			if (oExistingContent.fileName === oChangeContent.fileName) {
				oVariantObject[sChangeType].splice(iIndex, 1);
				return true;
			}
		});
	}
	/**
	 * Handler class to manipulate control variant changes in a variants map. See also {@link sap.ui.fl.variants.VariantManagement}.
	 *
	 * @namespace sap.ui.fl.apply.api.apply._internal.flexState.controlVariants.VariantManagementState
	 * @experimental Since 1.74
	 * @since 1.74
	 * @version ${version}
	 * @private
	 * @ui5-restricted
	 */
	var VariantManagementState = {
		/**
		 * Returns variant management state for the passed component reference.
		 *
		 * @param {string} sReference - Component reference
		 *
		 * @returns {object} Variant management state
		 * @private
		 * @ui5-restricted
		 */
		getContent: function(sReference) {
			return FlexState.getVariantsState(sReference);
		},

		/**
		 * Returns control changes for a given variant reference.
		 *
		 * @param {String} mPropertyBag.vmReference - Variant management reference
		 * @param {String} mPropertyBag.vReference - ID of the variant
		 * @param {string} mPropertyBag.reference - Component reference
		 * @param {boolean} [mPropertyBag.changeInstance] <code>true</code> if each change has to be an instance of <code>sap.ui.fl.Change</code>
		 *
		 * @returns {Array} All changes of the variant
		 * @private
		 * @ui5-restricted
		 */
		getVariantChanges: function(mPropertyBag) {
			var oVariantsMap = VariantManagementState.getContent(mPropertyBag.reference);
			var sVReference = mPropertyBag.vReference || oVariantsMap[mPropertyBag.vmReference].defaultVariant;
			var aResult = [];
			if (sVReference && typeof sVReference === "string") {
				var oVariant = VariantManagementState.getVariant(Object.assign(mPropertyBag, {vReference: sVReference}));
				aResult = oVariant.controlChanges;

				if (mPropertyBag.changeInstance) {
					aResult = aResult.map(function (oChange, index) {
						var oChangeInstance;
						if (!oChange.getDefinition) {
							oChangeInstance = new Change(oChange);
							oVariant.controlChanges.splice(index, 1, oChangeInstance);
						} else {
							oChangeInstance = oChange;
						}
						return oChangeInstance;
					});
				}
			}
			return aResult;
		},

		/**
		 * Return variant data for the passed variant reference
		 *
		 * @param {object} mPropertyBag
		 * @param {string} mPropertyBag.vmReference - Variant management reference
		 * @param {string} mPropertyBag.reference - Component reference
		 * @param {string} mPropertyBag.vReference - Variant reference
		 *
		 * @returns {integer} Index at which the variant was added
		 * @private
		 * @ui5-restricted
		 */
		getVariant: function (mPropertyBag) {
			var oVariant;
			var aVariants = _getVariants(mPropertyBag);
			aVariants.some(function(oCurrentVariant) {
				if (oCurrentVariant.content.fileName === mPropertyBag.vReference) {
					oVariant = oCurrentVariant;
					return true;
				}
			});
			return oVariant;
		},

		/**
		 * Adds a variant to a variant management reference.
		 *
		 * @param {object} mPropertyBag
		 * @param {object} mPropertyBag.variantData - Variant data to be added
		 * @param {string} mPropertyBag.vmReference - Variant management reference
		 * @param {string} mPropertyBag.reference - Component reference
		 *
		 * @returns {integer} Index at which the variant was added
		 * @private
		 * @ui5-restricted
		 */
		addVariantToVariantManagement: function (mPropertyBag) {
			var oVariantsMap = VariantManagementState.getContent(mPropertyBag.reference);
			var aVariants = oVariantsMap[mPropertyBag.vmReference].variants.slice().splice(1);
			var iIndex = VariantsApplyUtil.getIndexToSortVariant(aVariants, mPropertyBag.variantData);

			//Set the whole list of changes to the variant
			if (mPropertyBag.variantData.content.variantReference) {
				var aReferencedVariantChanges = _getReferencedChanges(mPropertyBag);
				mPropertyBag.variantData.controlChanges = aReferencedVariantChanges.concat(mPropertyBag.variantData.controlChanges);
			}

			//Skipping standard variant with iIndex + 1
			oVariantsMap[mPropertyBag.vmReference].variants.splice(iIndex + 1, 0, mPropertyBag.variantData);
			return iIndex + 1;
		},

		/**
		 * Removes a variant from a variant management reference.
		 *
		 * @param {object} mPropertyBag
		 * @param {sap.ui.fl.Variant} mPropertyBag.variant - Variant to be removed
		 * @param {string} mPropertyBag.vmReference - Variant management reference
		 * @param {string} mPropertyBag.reference - Component reference
		 *
		 * @returns {integer} Index from which the variant was removed
		 * @private
		 * @ui5-restricted
		 */
		removeVariantFromVariantManagement: function(mPropertyBag) {
			var iIndex;
			var oVariantsMap = VariantManagementState.getContent(mPropertyBag.reference);
			var bFound = oVariantsMap[mPropertyBag.vmReference].variants.some(
				function (oCurrentVariantContent, index) {
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
		},

		/**
		 * Sorts and re-orders the passed variant object in the variants map
		 *
		 * @param {object} mPropertyBag
		 * @param {object} mPropertyBag.variantData - Variant data
		 * @param {string} mPropertyBag.vmReference - Variant management reference
		 * @param {string} mPropertyBag.reference - Component reference
		 *
		 * @returns {integer} The updated index for the passed variant data
		 * @private
		 * @ui5-restricted
		 */
		setVariantData: function(mPropertyBag) {
			var oVariantsMap = VariantManagementState.getContent(mPropertyBag.reference);
			var aVariants = oVariantsMap[mPropertyBag.vmReference].variants;
			var oVariantData = aVariants[mPropertyBag.previousIndex];
			Object.keys(mPropertyBag.variantData).forEach(function (sProperty) {
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
		},

		/**
		 * Add a control change to a variant.
		 *
		 * @param {object} mPropertyBag
		 * @param {sap.ui.fl.Change} mPropertyBag.change - Control change
		 * @param {string} mPropertyBag.vmReference - Variant management reference
		 * @param {string} mPropertyBag.vReference - Variant reference
		 * @param {string} mPropertyBag.reference - Component reference
		 *
		 * @returns {boolean} Indicates if change was added
		 * @private
		 * @ui5-restricted
		 */
		addChangeToVariant: function (mPropertyBag) {
			var aExistingChanges = VariantManagementState.getVariantChanges(Object.assign(mPropertyBag, {changeInstance: true}));
			var aChangeFileNames = aExistingChanges.map(function (oChange) {
				return oChange.getDefinition().fileName;
			});

			if (!includes(aChangeFileNames, mPropertyBag.change.getDefinition().fileName)) {
				var oVariant = VariantManagementState.getVariant(mPropertyBag);
				oVariant.controlChanges = aExistingChanges.concat([mPropertyBag.change]);
				return true;
			}
			return false;
		},

		/**
		 * Removes a control change from a variant.
		 *
		 * @param {object} mPropertyBag
		 * @param {sap.ui.fl.Change} mPropertyBag.change - Control change
		 * @param {string} mPropertyBag.vmReference - Variant management reference
		 * @param {string} mPropertyBag.vReference - Variant reference
		 * @param {string} mPropertyBag.reference - Component reference
		 *
		 * @returns {boolean} Indicates if change was removed
		 * @private
		 * @ui5-restricted
		 */
		removeChangeFromVariant: function (mPropertyBag) {
			var aControlChanges = VariantManagementState.getVariantChanges(Object.assign(mPropertyBag, {changeInstance: true}));
			var oVariant = VariantManagementState.getVariant(mPropertyBag);
			var bChangeFound = false;

			if (oVariant) {
				oVariant.controlChanges = aControlChanges.filter(function (oCurrentChange) {
					if (!bChangeFound && oCurrentChange.getId() === mPropertyBag.change.getId()) {
						bChangeFound = true;
						return false;
					}
					return true;
				});
			}
			return bChangeFound;
		},

		/**
		 * Loads the initial changes of all variant managements.
		 * If the application is started with valid variant references, they are used.
		 * If no references or invalid references were passed, the changes are loaded from the default variant.
		 *
		 * @param {object} mPropertyBag
		 * @param {string} mPropertyBag.reference - Component reference
		 *
		 * @returns {Array} All changes of current or default variants
		 * @private
		 * @ui5-restricted
		 */
		loadInitialChanges: function (mPropertyBag) {
			var oVariantsMap = VariantManagementState.getContent(mPropertyBag.reference);
			return Object.keys(oVariantsMap)
				.reduce(function (aInitialChanges, sVMReference) {
					var sCurrentVReference = oVariantsMap[sVMReference].currentVariant ? "currentVariant" : "defaultVariant";
					var mArguments = {
						vmReference: sVMReference,
						vReference: oVariantsMap[sVMReference][sCurrentVReference],
						reference: mPropertyBag.reference
					};

					// Concatenate with the previous flex changes
					return aInitialChanges.concat(
						VariantManagementState.getVariantChanges(Object.assign({}, mPropertyBag, mArguments)));
				}, []);
		},

		/**
		 * Returns prepared variant model data based on the passed component reference.
		 *
		 * @param {object} mPropertyBag
		 * @param {string} mPropertyBag.reference - Component reference
		 *
		 * @returns {object} Prepared variant model data
		 * @private
		 * @ui5-restricted
		 */
		fillVariantModel: function (mPropertyBag) {
			var oVariantsMap = VariantManagementState.getContent(mPropertyBag.reference);
			return Object.keys(oVariantsMap).reduce(
				function (oVariantData, sVMReference) {
					oVariantData[sVMReference] = {
						//in case of no variant management change the standard variant is set as default
						defaultVariant: oVariantsMap[sVMReference].defaultVariant,
						variants: []
					};
					//if a current variant is set in the map, it should be set in the model
					if (oVariantsMap[sVMReference].currentVariant) {
						oVariantData[sVMReference].currentVariant = oVariantsMap[sVMReference].currentVariant;
					}
					_getVariants(Object.assign(mPropertyBag, {vmReference: sVMReference}))
						.forEach(function (oVariant, index) {
							oVariantData[sVMReference].variants[index] =
								//JSON.parse(JSON.stringify()) used to remove undefined properties e.g. standard variant layer
								JSON.parse(
									JSON.stringify({
										key: oVariant.content.fileName,
										title: oVariant.content.content.title,
										layer: oVariant.content.layer,
										favorite: oVariant.content.content.favorite,
										visible: oVariant.content.content.visible,
										author: ObjectPath.get("content.support.user", oVariant)
									})
								);
						});
					return oVariantData;
				}, {});
		},

		/**
		 * Adds or deletes a variant or variant management change for a variant management reference for the passed variants map.
		 *
		 * @param {object} mPropertyBag
		 * @param {string} mPropertyBag.vmReference - Variant management reference
		 * @param {object} mPropertyBag.changeContent - Change content to be added or deleted
		 * @param {string} mPropertyBag.reference - Component reference
		 * @param {boolean} [mPropertyBag.add] - Indicates if change should be added
		 *
		 * @private
		 * @ui5-restricted
		 */
		updateChangesForVariantManagementInMap: function(mPropertyBag) {
			var oVariantsMap = VariantManagementState.getContent(mPropertyBag.reference);
			var oVariantManagement = oVariantsMap[mPropertyBag.vmReference];
			if (mPropertyBag.changeContent.fileType === "ctrl_variant_change") {
				oVariantManagement.variants.some(function(oVariant) {
					if (oVariant.content.fileName === mPropertyBag.changeContent.selector.id) {
						return _addChangeContentToVariantMap(oVariant.variantChanges, mPropertyBag.changeContent, mPropertyBag.add);
					}
				});
			} else if (mPropertyBag.changeContent.fileType === "ctrl_variant_management_change") {
				return _addChangeContentToVariantMap(oVariantManagement.variantManagementChanges, mPropertyBag.changeContent, mPropertyBag.add);
			}
		},

		/**
		 * Sets the current variant for a variant management reference for the passed variants map.
		 *
		 * @param {object} mPropertyBag
		 * @param {string} mPropertyBag.vmReference - Variant management reference
		 * @param {string} mPropertyBag.newVReference - Variant reference to be set
		 * @param {string} mPropertyBag.reference - Component reference
		 *
		 * @private
		 * @ui5-restricted
		 */
		setCurrentVariant: function(mPropertyBag) {
			var oVariantsMap = VariantManagementState.getContent(mPropertyBag.reference);
			oVariantsMap[mPropertyBag.vmReference].currentVariant = mPropertyBag.newVReference;
		}
	};
	return VariantManagementState;
}, true);