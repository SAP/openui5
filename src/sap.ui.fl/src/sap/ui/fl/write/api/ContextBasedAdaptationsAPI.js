/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/fl/write/api/Adaptations",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Utils",
	"sap/ui/fl/initial/_internal/FlexInfoSession",
	"sap/ui/fl/write/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/compVariants/CompVariantMerger",
	"sap/ui/fl/write/_internal/flexState/compVariants/CompVariantState",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/model/json/JSONModel"
], function(
	Lib,
	Adaptations,
	FeaturesAPI,
	FlexObjectFactory,
	ManifestUtils,
	ControlVariantApplyAPI,
	Layer,
	LayerUtils,
	FlexUtils,
	FlexInfoSession,
	FlexObjectState,
	CompVariantMerger,
	CompVariantState,
	VariantManagementState,
	Storage,
	Versions,
	JSONModel
) {
	"use strict";

	var _mInstances = {};

	var _oResourceBundle;
	var aMigrationLayers = [Layer.VENDOR, Layer.PARTNER, Layer.CUSTOMER_BASE, Layer.CUSTOMER];

	/**
	 * Provides an API for creating and managing context-based adaptation.
	 *
	 * @namespace sap.ui.fl.write.api.ContextBasedAdaptationsAPI
	 * @since 1.106
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	var ContextBasedAdaptationsAPI = /** @lends sap.ui.fl.write.api.ContextBasedAdaptationsAPI */ {};

	function getFlexReferenceForControl(oControl) {
		var sReference = ManifestUtils.getFlexReferenceForControl(oControl);
		if (!sReference) {
			throw Error("The application ID could not be determined");
		}
		return sReference;
	}

	/**
	 * Processing the response to create/read/update/delete adaptations if the expected status is contained in the response object
	 * In case of a deletion the version list is reloaded because the draft might have been deleted on the backend
	 * @param {object} oResponse - Object with response data
	 * @param {number} oResponse.status - HTTP response code
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.appId - Reference of the application
	 * @param {string} mPropertyBag.layer - Layer
	 * @param {boolean} [bDelete=false] - Indicator whether the response was from a delete
	 * @returns {Promise<object>} Object with response data
	 */
	function handleResponseForVersioning(oResponse, mPropertyBag, bDelete) {
		if (bDelete) {
			return Versions.updateModelFromBackend({
				reference: mPropertyBag.appId,
				layer: mPropertyBag.layer
			}).then(function() {
				return oResponse;
			});
		}
		Versions.onAllChangesSaved({
			reference: mPropertyBag.appId,
			layer: mPropertyBag.layer,
			contextBasedAdaptation: true
		});
		return Promise.resolve(oResponse);
	}

	/**
	 * Initializes the context-based adaptations for a given control and layer
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer
	 * @returns {Promise<sap.ui.model.json.JSONModel>} Model of adaptations enhanced with additional properties
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	ContextBasedAdaptationsAPI.initialize = function(mPropertyBag) {
		_oResourceBundle ||= Lib.getResourceBundleFor("sap.ui.fl");
		if (!mPropertyBag.layer) {
			return Promise.reject("No layer was provided");
		}
		if (!mPropertyBag.control) {
			return Promise.reject("No control was provided");
		}
		var sReference = getFlexReferenceForControl(mPropertyBag.control);
		mPropertyBag.reference = sReference;
		var sLayer = mPropertyBag.layer;
		if (_mInstances && _mInstances[sReference] && _mInstances[sReference][sLayer]) {
			return Promise.resolve(_mInstances[sReference][sLayer]);
		}
		var bContextBasedAdaptationsEnabled;
		return FeaturesAPI.isContextBasedAdaptationAvailable(sLayer)
		.then(function(bContextBasedAdaptationsEnabledResponse) {
			bContextBasedAdaptationsEnabled = bContextBasedAdaptationsEnabledResponse;
			var oAdaptationsPromise = bContextBasedAdaptationsEnabled ? ContextBasedAdaptationsAPI.load(mPropertyBag) : Promise.resolve({adaptations: []});
			return oAdaptationsPromise;
		})
		.then(function(oAdaptations) {
			// Determine displayed adaptation
			// Flex Info Session returns currently shown one based on Flex Data response
			// If no longer available switch to highest ranked one
			var oFlexInfoSession = FlexInfoSession.getByReference(mPropertyBag.reference);
			var oDisplayedAdaptation = oAdaptations.adaptations[0];
			if (oFlexInfoSession.adaptationId) {
				oDisplayedAdaptation = oAdaptations.adaptations.find(function(oAdaptation) {
					return oAdaptation.id === oFlexInfoSession.adaptationId;
				}) || oDisplayedAdaptation;
			}

			return ContextBasedAdaptationsAPI.createModel(oAdaptations.adaptations, oDisplayedAdaptation, bContextBasedAdaptationsEnabled);
		})
		.then(function(oModel) {
			_mInstances[sReference] ||= {};
			_mInstances[sReference][sLayer] ||= {};
			_mInstances[sReference][sLayer] = oModel;
			return _mInstances[sReference][sLayer];
		});
	};

	/**
	 * Initializes and creates an new adaptation Model
	 * @param {object[]} aAdaptations - List of adaptations from backend
	 * @param {object} oDisplayedAdaptation - Adaptation to be set as displayedAdaptation
	 * @param {boolean} bContextBasedAdaptationsEnabled - Whether the feature is enabled
	 * @returns {sap.ui.model.json.JSONModel} Model of adaptations enhanced with additional properties
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	ContextBasedAdaptationsAPI.createModel = function(aAdaptations, oDisplayedAdaptation, bContextBasedAdaptationsEnabled) {
		if (!Array.isArray(aAdaptations)) {
			throw Error("Adaptations model can only be initialized with an array of adaptations");
		}
		if (bContextBasedAdaptationsEnabled && !oDisplayedAdaptation) {
			throw Error("Invalid call, must pass displayed adaptation");
		}
		if (!bContextBasedAdaptationsEnabled && aAdaptations.length) {
			throw Error("Invalid call, must not pass adaptations if feature is disabled");
		}

		// TODO Extract class
		var oModel = new JSONModel({
			allAdaptations: [],
			adaptations: [],
			count: 0,
			displayedAdaptation: {},
			contextBasedAdaptationsEnabled: bContextBasedAdaptationsEnabled
		});
		oModel.updateAdaptations = function(aAdaptations) {
			var aContextBasedAdaptations = aAdaptations.filter(function(oAdaptation, iIndex) {
				oAdaptation.rank = iIndex + 1; // initialize ranks
				return oAdaptation.type !== Adaptations.Type.Default;
			});
			oModel.setProperty("/adaptations", aContextBasedAdaptations);
			oModel.setProperty("/allAdaptations", aAdaptations);
			oModel.setProperty("/count", aContextBasedAdaptations.length);

			// update displayed adaptation
			var oDisplayedAdaptation = oModel.getProperty("/displayedAdaptation");
			var oCorrespondingAdaptation = aAdaptations.find(function(oAdaptation) {
				return !!oDisplayedAdaptation && oAdaptation.id === oDisplayedAdaptation.id;
			});
			if (oCorrespondingAdaptation) {
				oDisplayedAdaptation = Object.assign({}, oCorrespondingAdaptation);
				oModel.setProperty("/displayedAdaptation", oDisplayedAdaptation);
			}
			oModel.updateBindings(true);
		};
		oModel.insertAdaptation = function(oNewAdaptation) {
			var aAdaptations = oModel.getProperty("/allAdaptations");
			aAdaptations.splice(oNewAdaptation.priority, 0, oNewAdaptation);
			delete oNewAdaptation.priority;
			oModel.updateAdaptations(aAdaptations);
		};
		oModel.deleteAdaptation = function() {
			var iIndex = oModel.getProperty("/displayedAdaptation").rank - 1;
			var aAdaptations = oModel.getProperty("/adaptations");
			var iModelCount = oModel.getProperty("/count");
			var sToBeDisplayedAdaptationId;
			if (iModelCount > 1) {
				sToBeDisplayedAdaptationId = aAdaptations[iIndex + ((iIndex === iModelCount - 1) ? -1 : 1)].id;
			}
			aAdaptations.splice(iIndex, 1);
			var oDefaultAdaptation = oModel.getProperty("/allAdaptations").pop();
			aAdaptations.push(oDefaultAdaptation);
			oModel.updateAdaptations(aAdaptations);
			return sToBeDisplayedAdaptationId;
		};
		oModel.switchDisplayedAdaptation = function(sAdaptationId) {
			var iIndex = oModel.getIndexByAdaptationId(sAdaptationId);
			var oNewDisplayedAdaptation = iIndex ? oModel.getProperty("/allAdaptations")[iIndex] : oModel.getProperty("/allAdaptations")[0];
			oModel.setProperty("/displayedAdaptation", oNewDisplayedAdaptation);
			oModel.updateBindings(true);
		};
		oModel.updateAdaptationContent = function(oContextBasedAdaptation) {
			var aAdaptations = oModel.getProperty("/allAdaptations");
			var oAdaptationForUpdate = aAdaptations.find(function(oAdaptation) {
				return oContextBasedAdaptation.adaptationId === oAdaptation.id;
			});
			oAdaptationForUpdate.title = oContextBasedAdaptation.title;
			oAdaptationForUpdate.contexts = oContextBasedAdaptation.contexts;
			var iIndex = oAdaptationForUpdate.rank - 1;
			if (iIndex !== oContextBasedAdaptation.priority) {
				var aDisplayedAdaptation = aAdaptations.splice(iIndex, 1);
				aAdaptations.splice(oContextBasedAdaptation.priority, 0, aDisplayedAdaptation[0]);
			}
			oModel.updateAdaptations(aAdaptations);
		};
		oModel.getIndexByAdaptationId = function(sAdaptationId) {
			var aAdaptations = oModel.getProperty("/allAdaptations");
			var iAdaptationIndex = aAdaptations.findIndex(function(oAdaptation) {
				return oAdaptation.id === sAdaptationId;
			});
			return (iAdaptationIndex > -1) ? iAdaptationIndex : undefined;
		};
		if (aAdaptations.length > 0) {
			oModel.updateAdaptations(aAdaptations);
			oModel.setProperty("/displayedAdaptation", oDisplayedAdaptation);
		}
		return oModel;
	};

	/**
	 * Returns adaptations model given reference id and layer.
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer
	 * @returns {sap.ui.model.json.JSONModel} Model of adaptations enhanced with additional properties
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	ContextBasedAdaptationsAPI.getAdaptationsModel = function(mPropertyBag) {
		if (!mPropertyBag.layer) {
			throw Error("No layer was provided");
		}
		if (!mPropertyBag.control) {
			throw Error("No control was provided");
		}
		mPropertyBag.reference = getFlexReferenceForControl(mPropertyBag.control);
		var sReference = mPropertyBag.reference;
		var sLayer = mPropertyBag.layer;
		if (!ContextBasedAdaptationsAPI.hasAdaptationsModel(mPropertyBag)) {
			throw Error(`Adaptations model for reference '${sReference}' and layer '${sLayer}' were not initialized.`);
		}
		return _mInstances[sReference][sLayer];
	};

	/**
	 * Returns displayed adaptation id given layer and control for setting the adaptationId in changes etc.
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer
	 * @returns {string} - Displayed adaptation id, undefined for DEFAULT adaptation
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	ContextBasedAdaptationsAPI.getDisplayedAdaptationId = function(mPropertyBag) {
		var adaptationId = this.getAdaptationsModel(mPropertyBag).getProperty("/displayedAdaptation/id");
		return adaptationId !== Adaptations.Type.Default ? adaptationId : undefined;
	};

	/**
	 * Checks if adaptations model for a given reference and layer exists.
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.reference - ID of the application for which the versions are requested
	 * @param {string} mPropertyBag.layer - Layer
	 * @returns {boolean} checks if an adaptation model exists for this reference and layer
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	ContextBasedAdaptationsAPI.hasAdaptationsModel = function(mPropertyBag) {
		var sReference = mPropertyBag.reference;
		var sLayer = mPropertyBag.layer;
		return _mInstances[sReference] && _mInstances[sReference][sLayer];
	};

	/**
	 * Checks if an adaptation for a given reference and layer exists.
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.reference - ID of the application for which the versions are requested
	 * @param {string} mPropertyBag.layer - Layer
	 * @returns {boolean} checks if at least one adaptation exists for this reference and layer
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	ContextBasedAdaptationsAPI.adaptationExists = function(mPropertyBag) {
		var sReference = mPropertyBag.reference;
		var sLayer = mPropertyBag.layer;
		return this.hasAdaptationsModel({reference: sReference, layer: sLayer}) && _mInstances[sReference][sLayer].getProperty("/count") > 0;
	};

	ContextBasedAdaptationsAPI.clearInstances = function() {
		_mInstances = {};
	};

	/**
	 * Discards the model, initializes it again and returns the displayed adaptation.
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer
	 * @returns {string} Displayed adaptation id of the refreshed model
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	ContextBasedAdaptationsAPI.refreshAdaptationModel = function(mPropertyBag) {
		this.clearInstances();
		return this.initialize(mPropertyBag)
		.then(function(oModel) {
			return oModel.getProperty("/displayedAdaptation/id");
		});
	};

	function getNewVariantId(mFileNames, sOldVariantId) {
		return mFileNames.get(sOldVariantId) || sOldVariantId;
	}

	/**
	 * Creates a new context-based adaptation
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.layer - Target layer
	 * @param {string} mPropertyBag.appId - Reference of the application
	 * @param {object} mPropertyBag.control - Control to fetch app reference
	 * @param {object} oContextBasedAdaptation - Parameters for new adaptation
	 * @param {object} oContextBasedAdaptation.id - ID of new context-based adaptation
	 * @param {object} oContextBasedAdaptation.title - Title of new context-based adaptation
	 * @param {object} oContextBasedAdaptation.contexts - Contexts of new context-based adaptation
	 * @param {object} oContextBasedAdaptation.priority - Priority of new context-based adaptation
	 * @returns {Promise<void>} Resolves when done
	 */
	function createContextBasedAdaptation(mPropertyBag, oContextBasedAdaptation) {
		return Storage.contextBasedAdaptation.create({
			layer: mPropertyBag.layer,
			flexObject: oContextBasedAdaptation,
			appId: mPropertyBag.appId,
			parentVersion: getParentVersion(mPropertyBag)
		}).then(function(oResponse) {
			var oModel = this.getAdaptationsModel(mPropertyBag);
			oModel.insertAdaptation(oContextBasedAdaptation);
			return handleResponseForVersioning(oResponse, mPropertyBag);
		}.bind(this));
	}

	/**
	 * Write changes to backend
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.parentVersion - Indicates if changes should be written as a draft and on which version the changes should be based on
	 * @param {string} mPropertyBag.layer - Target Layer
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aFlexObjects - Array containing FlexObjects
	 * @returns {Promise} Returns a promise that resolves as soon as the writing was completed or rejects in case of an error
	 */
	function writeChangesToBackend(mPropertyBag, aFlexObjects) {
		return Storage.write({
			layer: mPropertyBag.layer,
			flexObjects: aFlexObjects,
			transport: "",
			isLegacyVariant: false,
			parentVersion: getParentVersion(mPropertyBag)
		});
	}

	/**
	 * CompVariant FlexObjects are already in final state with changes applied, but Fl vars are not and we have to fetch it
	 * @param {object[]} aFlVariantsFinalState FlVariant final states from Variant Management
	 * @param {object[]} aFlexObjects All Flex Objects
	 * @param {object} oVariant Comp or Fl Variant
	 * @returns {object} Comp variant or Fl variant from final states
	 */
	function getFinalState(aFlVariantsFinalState, aFlexObjects, oVariant) {
		if (oVariant.isA("sap.ui.fl.apply._internal.flexObjects.CompVariant")) {
			var aVariantChanges = aFlexObjects.filter(function(oFlexObject) {
				return oFlexObject.getChangeType() === "updateVariant" && oFlexObject.getSelector().variantId === oVariant.getId();
			});

			// Clone it, to avoid that we modify the original and that modifying the original affects the state
			var oClone = oVariant.clone();
			aVariantChanges.forEach(CompVariantMerger.applyChangeOnVariant.bind(CompVariantMerger, oClone));
			// Avoid garbage
			oClone.removeAllChanges();
			oClone.destroy();
			return oClone.mProperties;
		}

		return aFlVariantsFinalState.find(function(oFlVariant) {
			return oFlVariant.key === oVariant.getId();
		});
	}

	/**
	 * Builds a map containing unique contextKeys (as key) with their respective variants and variants changes and a list of unrestricted views.
	 * @param {sap.ui.fl.apply._internal.flexObjects.Variant[]} aVariants - Variants object
	 * @param {object[]} oFinalStates - Final states of variants
	 * @returns {object} An object with both results
	 */
	function groupVariantsByContextEntry(aVariants, oFinalStates) {
		var mUniqueContexts = {};
		var aUnrestrictedViews = [];
		aVariants.forEach(function(oVariant) {
			var oFinalState = oFinalStates[oVariant.getId()];
			// We do not need to copy invisible variants
			if (oFinalState.visible) {
				var bUnrestricted = true;
				// TODO Needs to be enhanced if there can be multiple context types in parallel
				var aContextKeys = Object.keys(oFinalState.contexts);
				aContextKeys.forEach(function(sKey) {
					var aContexts = Array.from(oFinalState.contexts[sKey]);

					aContexts.forEach(function(sContext) {
						bUnrestricted = false;
						if (mUniqueContexts[sContext]) {
							mUniqueContexts[sContext].variants.push(oVariant);
						} else {
							mUniqueContexts[sContext] = {
								contextBasedAdaptationId: FlexUtils.createDefaultFileName(),
								variants: [oVariant]
							};
						}
					});
				});
				if (bUnrestricted) {
					aUnrestrictedViews.push(oVariant);
				}
			}
		});
		return {uniqueContexts: mUniqueContexts, unrestrictedViews: aUnrestrictedViews};
	}

	/**
	 * Creates set visible false changes for restricted variants from layers below Customer.
	 * @param {sap.ui.fl.apply._internal.flexObjects.Variant} oVariant - Variant flex object
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.appId - App reference
	 * @param {string} mPropertyBag.layer - Working layer
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} [contextBasedAdaptationId] - ID of the context-based adaption
	 * @returns {object} Returns the change as JSON object
	 */
	function createChangeSetVisibleFalseToRestrictedVariant(oVariant, mPropertyBag, contextBasedAdaptationId) {
		if (oVariant.isA("sap.ui.fl.apply._internal.flexObjects.CompVariant")) {
			var sPersistencyKey = oVariant.getPersistencyKey();
			oVariant = CompVariantState.updateVariant({
				reference: mPropertyBag.appId,
				persistencyKey: sPersistencyKey,
				id: oVariant.getId(),
				layer: mPropertyBag.layer,
				visible: false,
				adaptationId: contextBasedAdaptationId,
				forceCreate: true
			});
			return oVariant.getChanges().reverse()[0].convertToFileContent();
		}
		// Fl variant
		var oAppComponent = FlexUtils.getAppComponentForControl(mPropertyBag.control);
		var oModel = oAppComponent.getModel(ControlVariantApplyAPI.getVariantModelName());
		var oChange = oModel.createVariantChange(
			oVariant.getVariantManagementReference(),
			{
				changeType: "setVisible",
				visible: false,
				variantReference: oVariant.getId(),
				layer: mPropertyBag.layer,
				appComponent: oAppComponent,
				adaptationId: contextBasedAdaptationId
			}
		);
		return oChange.convertToFileContent();
	}

	function getObjectsByLayerAndType(aFlexObjects, sChangesLayer, bVariants) {
		var aVariants = aFlexObjects.filter(function(oFlexObject) {
			return (bVariants === oFlexObject.isA("sap.ui.fl.apply._internal.flexObjects.Variant")) && oFlexObject.getLayer() === sChangesLayer;
		});
		return aVariants;
	}

	function getVariantReference(oChange) {
		var sFileType = oChange.getFileType();
		if (sFileType === "change") {
			if (oChange.getSelector().variantId) {
				// selector of a change links to a CompVariant
				return oChange.getSelector().variantId;
			}
			// references to a FLVariant (variant dependent change)
			if (oChange.getVariantReference()) {
				return oChange.getVariantReference();
			}
		} else if (sFileType === "ctrl_variant_change" && oChange.getSelector().id) {
			return oChange.getSelector().id;
		}
		return undefined;
	}

	function isSetContextChange(oChange) {
		if (oChange.getFileType() === "ctrl_variant_change" && oChange.getChangeType() === "setContexts") {
			return true;
		}
		return false;
	}

	/**
	 * Filter all changes that are relevant to be copied for an adaptation during migration.
	 * All non variant changes are taken over. Variant dependent changes are filtered depending on the variant
	 * Changes for variants that will not be taken over into this adaptation will be removed
	 * Also removes setContext changes for FLVariants
	 * @param {array<string>} aIgnoredVariantIds - IDs of variants that are out of scope
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aChanges - Array of flex objects
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} A list of changes that are relevant
	 */
	function filterChangesForAdaptation(aIgnoredVariantIds, aChanges) {
		return aChanges.filter(function(oChange) {
			var sVariantId = getVariantReference(oChange);
			if (isSetContextChange(oChange)) {
				return false;
			}
			// Either independent or related to variant in scope
			return (!sVariantId || aIgnoredVariantIds.indexOf(sVariantId) < 0);
		});
	}

	/**
	 * Copies existing changes.
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aFlexObjects - Array of flex objects changes and variants
	 * @param {string} sContextBasedAdaptationId - ID of the adaptation to be created
	 * @returns {object[]} Returns a list of copied changes and variant as JSON object
	 */
	function copyVariantsAndChanges(aFlexObjects, sContextBasedAdaptationId) {
		var aVariants = [];
		var aChanges = [];
		var mFileNames = new Map();
		aFlexObjects.forEach(function(oFlexObject) {
			if (oFlexObject.isA("sap.ui.fl.apply._internal.flexObjects.Variant")) {
				aVariants.push(oFlexObject);
			} else {
				aChanges.push(oFlexObject);
			}
		});
		var aCopiedVariants = copyVariants(aVariants, mFileNames, sContextBasedAdaptationId);
		var aCopiedChanges = copyChanges(aChanges, mFileNames, sContextBasedAdaptationId);
		return aCopiedVariants.concat(aCopiedChanges).map(function(oFlexObject) {
			return oFlexObject.convertToFileContent();
		});
	}

	/**
	 * Copies CompVariants and FLVariants and sets adaptationId.
	 * @param {sap.ui.fl.apply._internal.flexObjects.Variant[]} aVariants - Variants to be copied
	 * @param {map} mFileNames - Mapping from old variants ID to new variants ID for changes
	 * @param {string} sContextBasedAdaptationId - Context-based adaptation ID
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} Returns an array of copied variants as FlexObject
	 */
	function copyVariants(aVariants, mFileNames, sContextBasedAdaptationId) {
		var aCopiedFlexObjects = [];
		aVariants.forEach(function(oVariant) {
			var oCopiedVariant = FlexObjectFactory.createFromFileContent(oVariant.cloneFileContentWithNewId());
			oCopiedVariant.setAdaptationId(sContextBasedAdaptationId);
			oCopiedVariant.setContexts();
			// Remember mapping of original variant ID to ID of copy
			mFileNames.set(oVariant.getId(), oCopiedVariant.getId());
			aCopiedFlexObjects.push(oCopiedVariant);
		});
		return aCopiedFlexObjects;
	}

	/**
	 * Copies changes and sets adaptationId.
	 * Variant references are updated where needed in case the variant has been copied.
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aChanges - Changes to be copied
	 * @param {map} mFileNames - Mapping from variants ID to new variants ID
	 * @param {string} sContextBasedAdaptationId - Context-based adaptation ID
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} Returns an array of copied FlexObjects
	 */
	function copyChanges(aChanges, mFileNames, sContextBasedAdaptationId) {
		var aCopiedFlexObjects = [];
		aChanges.forEach(function(oChange) {
			var oCopiedChange = FlexObjectFactory.createFromFileContent(oChange.cloneFileContentWithNewId());
			var oCopiedChangeContent = oCopiedChange.getContent();
			var oCopiedChangeSelector = oCopiedChange.getSelector();
			if (oChange.getFileType() === "change") {
				if (oChange.getSelector().variantId) {
					// selector of a change links to a CompVariant
					oCopiedChangeSelector.variantId = getNewVariantId(mFileNames, oCopiedChange.getSelector().variantId);
					oCopiedChange.setSelector(oCopiedChangeSelector);
				} else if (oChange.getContent().defaultVariantName) {
					// change references to a defaultVariant
					oCopiedChangeContent.defaultVariantName = getNewVariantId(mFileNames, oCopiedChange.getContent().defaultVariantName);
					oCopiedChange.setContent(oCopiedChangeContent);
				}
				// references to a FLVariant (variant dependent change)
				if (oChange.getVariantReference()) {
					oCopiedChange.setVariantReference(getNewVariantId(mFileNames, oCopiedChange.getVariantReference()));
				}
				// Avoid adding a context for Comp again
				if (oChange.getChangeType() === "updateVariant") {
					delete oCopiedChange.getContent().contexts;
					if (!Object.keys(oCopiedChange.getContent()).length) {
						// Change got empty, not needed anymore
						return;
					}
				}
			} else if (oChange.getFileType() === "ctrl_variant_change" && oChange.getSelector().id) {
				oCopiedChangeSelector.id = getNewVariantId(mFileNames, oCopiedChange.getSelector().id);
				oCopiedChange.setSelector(oCopiedChangeSelector);
			} else if (oChange.getFileType() === "ctrl_variant_management_change" && oChange.getContent().defaultVariant) {
				oCopiedChangeContent.defaultVariant = getNewVariantId(mFileNames, oCopiedChange.getContent().defaultVariant);
				oCopiedChange.setContent(oCopiedChangeContent);
			}
			oCopiedChange.setAdaptationId(sContextBasedAdaptationId);
			aCopiedFlexObjects.push(oCopiedChange);
		});
		return aCopiedFlexObjects;
	}

	/**
	 * Get the parent version
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.appId - Reference app ID
	 * @param {string} mPropertyBag.layer - Layer
	  * @returns {string} Returns the currently displayed version id
	 */
	function getParentVersion(mPropertyBag) {
		return Versions.getVersionsModel({ layer: mPropertyBag.layer, reference: mPropertyBag.appId }).getProperty("/persistedVersion");
	}

	/**
	 * Prepares data for migration of variants. Context-based adaptations don't support context-dependent
	 * variants. Therefore, a migration must be done. During the migration process, variants and changes are copied for each unique context,
	 * and added to a context-based adaptation. These context-based adaptations have one context.
	 * @param {sap.ui.fl.apply._internal.flexObjects.Variant[]} aVariants - Variants from all layers that are relevant to be copied
	 * @param {object[]} aFlVariantsFinalState - FL Variants from VariantManagementState holding final state
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject[]} aChanges - Changes from customer layer that need to be copied
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {string} mPropertyBag.appId - App reference
	 * @param {string} mPropertyBag.layer - Working layer
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @returns {object} Returns a object containing context-based adaptations and changes/variants as FlexObjects that must be migrated
	 */
	function prepareMigrationData(aVariants, aFlVariantsFinalState, aChanges, mPropertyBag) {
		var oMigrationData = {
			contextBasedAdaptations: [],
			flexObjects: []
		};

		// Calculate final states for all variants by merging all changes and cache it
		var oFinalStates = {};
		aVariants.forEach(function(oVariant) {
			oFinalStates[oVariant.getId()] = getFinalState(aFlVariantsFinalState, aChanges, oVariant);
		});

		// Group variants by their corresponding unique context for all layers {key: context, value: variants}
		var oGrouped = groupVariantsByContextEntry(aVariants, oFinalStates);
		var mUniqueContexts = oGrouped.uniqueContexts;
		var aUnrestrictedViews = oGrouped.unrestrictedViews;

		// Iterate over each unique context to copy context related variants and changes (for both: customer layer only), as well as to create context based adaptation
		Object.entries(mUniqueContexts).forEach(function(aEntry) {
			var sContext = aEntry[0];
			var oUniqueContext = aEntry[1];
			// add unrestricted variants
			oUniqueContext.variants = oUniqueContext.variants.concat(aUnrestrictedViews);

			// Prepare adaptation
			var sContextBasedAdaptationId = oUniqueContext.contextBasedAdaptationId;
			var oContextBasedAdaptation = {
				id: sContextBasedAdaptationId,
				title: _oResourceBundle.getText("CBA_MIGRATED_ADAPTATION_TITLE", sContext),
				contexts: {
					role: [sContext]
				},
				priority: 0
			};
			oMigrationData.contextBasedAdaptations.push(oContextBasedAdaptation);

			// Filter variants for customer layer. Only customer layer variants must be copied
			var aCustomerLayerVariants = oUniqueContext.variants.filter(function(oVariant) {
				return oVariant.getLayer() === Layer.CUSTOMER;
			});
			var mFileNames = new Map();
			var aCopiedVariants = copyVariants(aCustomerLayerVariants, mFileNames, sContextBasedAdaptationId);
			// Add copied variants to migration data
			aCopiedVariants.forEach(function(oContextRelevantVariant) {
				oMigrationData.flexObjects.push(oContextRelevantVariant.convertToFileContent());
			});

			// Find variant relevant changes
			var aUniqueContextVariantIds = oUniqueContext.variants.map(function(oVariant) {
				return oVariant.getId();
			});
			var aVariantIdsNotInUniqueContext = aVariants.map(function(oVariant) {
				return oVariant.getId();
			}).filter(function(sVariantId) {
				return aUniqueContextVariantIds.indexOf(sVariantId) < 0;
			});
			var aChangesToCopy = filterChangesForAdaptation(aVariantIdsNotInUniqueContext, aChanges);
			var aCopiedChanges = copyChanges(aChangesToCopy, mFileNames, sContextBasedAdaptationId);
			aCopiedChanges.forEach(function(oCopiedChange) {
				oMigrationData.flexObjects.push(oCopiedChange.convertToFileContent());
			});

			// Hide variants from lower layers if not in scope
			aVariants.forEach(function(oVariant) {
				if (oVariant.getLayer() !== Layer.CUSTOMER && aUniqueContextVariantIds.indexOf(oVariant.getId()) < 0) {
					oMigrationData.flexObjects.push(
						createChangeSetVisibleFalseToRestrictedVariant(oVariant, mPropertyBag, sContextBasedAdaptationId)
					);
				}
			});
		});

		// Hide all variants restricted in default adaptation if not already hidden
		aVariants.forEach(function(oVariant) {
			var oFinalState = oFinalStates[oVariant.getId()];
			var bRestricted = aUnrestrictedViews.indexOf(oVariant) < 0;
			if (oFinalState.visible === true && bRestricted) {
				oMigrationData.flexObjects.push(
					createChangeSetVisibleFalseToRestrictedVariant(oVariant, mPropertyBag, undefined)
				);
			}
		});

		return oMigrationData;
	}

	 /**
	 * Migrate variants to use context-based adaptations by creating context-based adaptations for single unique context.
	 * This is done by retrieving unique contexts, and grouping variants by unique contexts.
	 * For each unique context a new context-based adaptation is created that contains one unique context.
	 * Hereby, we can restrict context-based adaptations in the same way as variants used to be.
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer
	 * @returns {Promise} Promise that resolves with the context-based adaptation
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	ContextBasedAdaptationsAPI.migrate = function(mPropertyBag) {
		mPropertyBag.appId = getFlexReferenceForControl(mPropertyBag.control);
		var sParentVersion = getParentVersion(mPropertyBag);
		mPropertyBag.parentVersion = sParentVersion;

		var aFlexObjectsData = [];

		var aFlVariantsFinalState = VariantManagementState.getAllVariants(ManifestUtils.getFlexReferenceForControl(mPropertyBag.control));

		var oMigrationData = {
			contextBasedAdaptation: [],
			flexObjects: []
		};

		return FlexObjectState.getFlexObjects({
			selector: mPropertyBag.control,
			invalidateCache: false,
			includeCtrlVariants: true,
			includeDirtyChanges: true
		})
		.then(function(aFlexObjects) {
			aMigrationLayers.forEach(function(sLayer) {
				aFlexObjectsData.push(getObjectsByLayerAndType(aFlexObjects, sLayer, /* bVariants */true));
			});
			aFlexObjectsData.push(getObjectsByLayerAndType(aFlexObjects, Layer.CUSTOMER, /* Variants */false));

			return Promise.all(aFlexObjectsData);
		})
		.then(function(aFlexObjects) {
			var aChanges = aFlexObjects.pop();
			var aVariants = aFlexObjects.flat();
			oMigrationData = prepareMigrationData(aVariants, aFlVariantsFinalState, aChanges, mPropertyBag);

			// Create adaptations sequentially because backend does not support parallel calls
			var oPromise = Promise.resolve();
			oMigrationData.contextBasedAdaptations.forEach(function(contextBasedAdaptation) {
				oPromise = oPromise.then(createContextBasedAdaptation.bind(this, mPropertyBag, contextBasedAdaptation));
			}.bind(this));
			return oPromise;
		}.bind(this))
		.then(function() {
			if (oMigrationData.flexObjects.length > 0) {
				return writeChangesToBackend(mPropertyBag, oMigrationData.flexObjects);
			}
			return Promise.resolve();
		})
		.then(function() {
			return this.refreshAdaptationModel({control: mPropertyBag.control, layer: mPropertyBag.layer});
		}.bind(this));
	};

	/**
	 * Check whether a migration of context-related variants can be performed. A migration must only be
	 * enabled if no context-based adaptations and at least one context-related variant exists.
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer
	 * @returns {Promise<boolean>} Returns a Promise that resolves with true if variants can be migrated.
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	ContextBasedAdaptationsAPI.canMigrate = function(mPropertyBag) {
		var oContextBasedAdaptationModel = ContextBasedAdaptationsAPI.getAdaptationsModel(mPropertyBag);
		if (oContextBasedAdaptationModel.getProperty("/count") !== 0) {
			return Promise.resolve(false);
		}
		return FlexObjectState.getFlexObjects({
			selector: mPropertyBag.control,
			invalidateCache: false,
			includeCtrlVariants: true,
			includeDirtyChanges: true
		})
		.then(function(aFlexObjects) {
			// Filter FlexObjects for migration relevant objects
			var aFilteredFlexObjects = [];
			aMigrationLayers.forEach(function(sLayer) {
				aFilteredFlexObjects.push(getObjectsByLayerAndType(aFlexObjects, sLayer, true));
			});
			aFilteredFlexObjects = aFilteredFlexObjects.flat();
			// Called after getFlexObjects which seems to ensure that it is initialized
			var aFlVariantsFinalState = VariantManagementState.getAllVariants(ManifestUtils.getFlexReferenceForControl(mPropertyBag.control));
			return aFilteredFlexObjects.some(function(oFlexObject) {
				var oFinalState = getFinalState(aFlVariantsFinalState, aFlexObjects, oFlexObject);

				return oFinalState.visible === true && Object.keys(oFinalState.contexts).some(function(sKey) {
					return oFinalState.contexts[sKey].length !== 0;
				});
			});
		});
	};

	/**
	 * Create new context-based adaptation and saves it in the backend
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer
	 * @param {object} mPropertyBag.contextBasedAdaptation - Parameters for new adaptation
	 * @param {string} mPropertyBag.contextBasedAdaptation.title - Title of the new adaptation
	 * @param {object} mPropertyBag.contextBasedAdaptation.contexts - Contexts of the new adaptation, for example roles for which the adaptation is created
	 * @param {object} mPropertyBag.contextBasedAdaptation.priority - Priority of the new adaptation
	 * @returns {Promise} Promise that resolves with the context-based adaptation
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	ContextBasedAdaptationsAPI.create = function(mPropertyBag) {
		if (!mPropertyBag.layer) {
			return Promise.reject("No layer was provided");
		}
		if (!mPropertyBag.control) {
			return Promise.reject("No control was provided");
		}
		if (!mPropertyBag.contextBasedAdaptation) {
			return Promise.reject("No contextBasedAdaptation was provided");
		}
		mPropertyBag.contextBasedAdaptation.id = FlexUtils.createDefaultFileName();
		mPropertyBag.appId = getFlexReferenceForControl(mPropertyBag.control);

		return createContextBasedAdaptation.call(this, mPropertyBag, mPropertyBag.contextBasedAdaptation)
		.then(function() {
			return FlexObjectState.getFlexObjects({
				selector: mPropertyBag.control,
				invalidateCache: false,
				includeCtrlVariants: true,
				includeDirtyChanges: true,
				currentLayer: Layer.CUSTOMER
			});
		}).then(function(aFlexObjects) {
			// currently getFlexObjects contains also VENDOR layer ctrl variant changes which need to be removed before copy
			// TODO refactor when FlexObjectState.getFlexObjects will be refactored
			var aCustomerFlexObjects = LayerUtils.filterChangeOrChangeDefinitionsByCurrentLayer(aFlexObjects, Layer.CUSTOMER);
			var aCopiedChanges = copyVariantsAndChanges(aCustomerFlexObjects, mPropertyBag.contextBasedAdaptation.id);
			return writeChangesToBackend(mPropertyBag, aCopiedChanges);
		});
	};

	/**
	 * Updates existing context-based adaptation and saves it in the backend
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer
	 * @param {object} mPropertyBag.contextBasedAdaptation - Parameters
	 * @param {string} mPropertyBag.contextBasedAdaptation.title - Title of the updated adaptation
	 * @param {object} mPropertyBag.contextBasedAdaptation.contexts - Contexts of the updated adaptation, for example roles for which the adaptation is created
	 * @param {object} mPropertyBag.contextBasedAdaptation.priority - Priority of the updated adaptation
	 * @returns {Promise} Promise that resolves with the context-based adaptation
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	ContextBasedAdaptationsAPI.update = function(mPropertyBag) {
		if (!mPropertyBag.layer) {
			return Promise.reject("No layer was provided");
		}
		if (!mPropertyBag.control) {
			return Promise.reject("No control was provided");
		}
		if (!mPropertyBag.contextBasedAdaptation) {
			return Promise.reject("No contextBasedAdaptation was provided");
		}
		if (!mPropertyBag.adaptationId) {
			return Promise.reject("No adaptationId was provided");
		}
		mPropertyBag.appId = getFlexReferenceForControl(mPropertyBag.control);
		return Storage.contextBasedAdaptation.update({
			layer: mPropertyBag.layer,
			flexObject: mPropertyBag.contextBasedAdaptation,
			appId: mPropertyBag.appId,
			adaptationId: mPropertyBag.adaptationId,
			parentVersion: getParentVersion(mPropertyBag)
		}).then(function(oResponse) {
			return handleResponseForVersioning(oResponse, mPropertyBag);
		});
	};

	/**
	 * Reorder context-based adaptations based on their priorities
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer
	 * @param {object} mPropertyBag.parameters - Parameters
	 * @param {string[]} mPropertyBag.parameters.priorities - Priority list
	 * @returns {Promise} Promise that resolves with the context-based adaptation
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	ContextBasedAdaptationsAPI.reorder = function(mPropertyBag) {
		if (!mPropertyBag.layer) {
			return Promise.reject("No layer was provided");
		}
		if (!mPropertyBag.control) {
			return Promise.reject("No control was provided");
		}
		if (!mPropertyBag.parameters || !mPropertyBag.parameters.priorities) {
			return Promise.reject("No valid priority list was provided");
		}
		mPropertyBag.appId = getFlexReferenceForControl(mPropertyBag.control);
		return Storage.contextBasedAdaptation.reorder({
			layer: mPropertyBag.layer,
			flexObjects: mPropertyBag.parameters,
			appId: mPropertyBag.appId,
			parentVersion: getParentVersion(mPropertyBag)
		}).then(function(oResponse) {
			return handleResponseForVersioning(oResponse, mPropertyBag);
		});
	};

	/**
	 * Load list of context-based adaptations with priority
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer
	 * @returns {Promise<object>} Promise that resolves with the list of context-based adaptations
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	ContextBasedAdaptationsAPI.load = function(mPropertyBag) {
		if (!mPropertyBag.layer) {
			return Promise.reject("No layer was provided");
		}
		if (!mPropertyBag.control) {
			return Promise.reject("No control was provided");
		}
		mPropertyBag.appId = getFlexReferenceForControl(mPropertyBag.control);
		return Storage.contextBasedAdaptation.load({
			layer: mPropertyBag.layer,
			appId: mPropertyBag.appId,
			version: getParentVersion(mPropertyBag)
		}).then(function(oAdaptations) {
			oAdaptations ||= { adaptations: [] };
			return oAdaptations;
		});
	};

	/**
	 * Deletes existing context-based adaptation
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Control} mPropertyBag.control - Control for which the request is done
	 * @param {string} mPropertyBag.layer - Layer
	 * @param {string} mPropertyBag.appId - Reference of the application
	 * @returns {Promise} Promise that resolves with the context-based adaptation
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.rta
	 */
	ContextBasedAdaptationsAPI.remove = function(mPropertyBag) {
		if (!mPropertyBag.layer) {
			return Promise.reject("No layer was provided");
		}
		if (!mPropertyBag.control) {
			return Promise.reject("No control was provided");
		}
		if (!mPropertyBag.adaptationId) {
			return Promise.reject("No adaptationId was provided");
		}
		mPropertyBag.appId = getFlexReferenceForControl(mPropertyBag.control);
		return Storage.contextBasedAdaptation.remove({
			layer: mPropertyBag.layer,
			appId: mPropertyBag.appId,
			adaptationId: mPropertyBag.adaptationId,
			parentVersion: getParentVersion(mPropertyBag)
		}).then(function(oResponse) {
			return handleResponseForVersioning(oResponse, mPropertyBag, true);
		});
	};

	return ContextBasedAdaptationsAPI;
});