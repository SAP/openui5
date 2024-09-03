/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_pick",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/apply/_internal/flexObjects/Variant",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Layer",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Utils"
], function(
	_pick,
	States,
	Variant,
	LayerUtils,
	Layer,
	Settings,
	Utils
) {
	"use strict";

	/**
	 * Flexibility CompVariant class. Stores variant content and related information.
	 *
	 * @param {object} mPropertyBag - Initial object properties
	 *
	 * @class CompVariant instance
	 * @extends sap.ui.fl.apply._internal.flexObjects.Variant
	 * @alias sap.ui.fl.apply._internal.flexObjects.CompVariant
	 * @since 1.103
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl, sap.ui.comp
	 */
	var CompVariant = Variant.extend("sap.ui.fl.apply._internal.flexObjects.CompVariant", /** @lends sap.ui.fl.apply._internal.flexObjects.CompVariant.prototype */ {
		metadata: {
			properties: {
				/**
				 * Indicates whether the variant is persisted
				 */
				persisted: {
					type: "boolean",
					defaultValue: true
				},
				/**
				 * Key used by SmartVariantManagement to access personalization data
				 */
				persistencyKey: {
					type: "string"
				}
			},
			aggregations: {
				/**
				 * Stores required data to revert variant updates.
				 */
				revertData: {
					type: "sap.ui.base.ManagedObject", // "sap.ui.fl.apply._internal.flexObjects.CompVariantRevertData"
					multiple: true,
					singularName: "revertData"
				},
				/**
				 * Changes belonging to the variant
				 */
				changes: {
					type: "sap.ui.base.ManagedObject", // "sap.ui.fl.apply._internal.flexObjects.FlexObject"
					multiple: true
				}
			}
		},
		// eslint-disable-next-line object-shorthand
		constructor: function(...aArgs) {
			const [mPropertyBag] = aArgs;
			Variant.apply(this, aArgs);

			// fileType "variant" is only for compVariant
			this.setFileType("variant");

			if (mPropertyBag.favorite !== undefined) {
				this.setFavorite(!!mPropertyBag.favorite);
			} else if (mPropertyBag.layer === Layer.VENDOR || mPropertyBag.layer === Layer.CUSTOMER_BASE) {
				this.setFavorite(true);
			}
		}
	});

	CompVariant.STANDARD_VARIANT_ID = "*standard*";

	/**
	 * Returns the mapping between flex object properties and file content properties in the back-end response.
	 * @returns {object} Mapping information
	 * @static
	 */
	 CompVariant.getMappingInfo = function() {
		return {
			...Variant.getMappingInfo(),
			persistencyKey: "selector.persistencyKey",
			standardVariant: "standardVariant",
			variantId: "variantId"
		};
	};

	/**
	 * Returns the mapping between flex object properties and file content properties in the back-end response.
	 * Can be overridden to avoid access of static mapping within base methods.
	 * @returns {object} Mapping information
	 */
	CompVariant.prototype.getMappingInfo = function() {
		return CompVariant.getMappingInfo();
	};

	function isUserAuthor(sAuthor) {
		var oSettings = Settings.getInstanceOrUndef();
		var vUserId = oSettings && oSettings.getUserId();
		return !vUserId || !sAuthor || vUserId.toUpperCase() === sAuthor.toUpperCase();
	}

	/**
	 * Checks if the the variant can be modified due to its layer and the user's authorization.
	 * @param {sap.ui.fl.Layer} sLayer - Layer of the variant
	 * @param {sap.ui.fl.Layer} [sActiveLayer] - Layer in which the operation may take place
	 * @param {string} sUserId - ID of the variants creator
	 * @returns {boolean} <code>true</code> if the variant is read only
	 */
	 function checkLayerAndUserAuthorization(sLayer, sActiveLayer, sUserId) {
		if (sActiveLayer) {
			return sLayer === sActiveLayer;
		} else if (sLayer === Layer.USER) {
			return true;
		}
		var oSettings = Settings.getInstanceOrUndef();

		if (LayerUtils.isSapUiLayerParameterProvided()) {
			sActiveLayer = LayerUtils.getCurrentLayer();
		} else {sActiveLayer ||= oSettings.isPublicLayerAvailable() ? Layer.PUBLIC : Layer.CUSTOMER;}
		var bLayerWritable = sLayer === sActiveLayer;
		var bUserAuthorized = oSettings.isKeyUser() || isUserAuthor(sUserId);

		return bLayerWritable && bUserAuthorized;
	}

	/**
	 * A variant can only be modified if the current language equals the original language.
	 * Returns <code>false</code> if the current language does not equal the original language of the variant file.
	 * Returns <code>false</code> if the original language is initial.
	 * @param {string} sOriginalLanguage - Language code of the language used on the variant creation
	 * @returns {boolean} <code>true</code> if the current logon language equals the original language of the variant file
	 */
	function isRenameEnableDueToOriginalLanguage(sOriginalLanguage) {
		return !sOriginalLanguage || Utils.getCurrentLanguage() === sOriginalLanguage;
	}

	function isOriginSystem(sSystem, sClient) {
		var oSettings = Settings.getInstanceOrUndef();
		if (!oSettings) {
			return true; // without settings the right to edit or delete a variant cannot be determined
		}
		if (!sSystem || !sClient) {
			return true;
		}

		var sCurrentSystem = oSettings.getSystem();
		var sCurrentClient = oSettings.getClient();
		return sCurrentSystem === sSystem && sClient === sCurrentClient;
	}

	/**
	 * Returns the package name of the variant.
	 * Used by the SmartVariantManagement control.
	 * @returns {string} Package name
	 */
	CompVariant.prototype.getPackage = function() {
		return this.getFlexObjectMetadata().packageName;
	};

	/**
	 * Checks if the object is a variant from smart variant management.
	 * Used by the SmartVariantManagement control.
	 * @returns {boolean} <code>true</code> if object is a variant
	 */
	CompVariant.prototype.isVariant = function() {
		return true;
	};

	/**
	 * Checks whenever the variant can be renamed updating the entity or crating an <code>updateChange</code>.
	 * @param {sap.ui.fl.Layer} [sLayer] - Layer in which the edition may take place
	 * @returns {boolean} <code>true</code> if the variant can be updated
	 */
	CompVariant.prototype.isRenameEnabled = function(sLayer) {
		return !this.getStandardVariant()
			&& this.isEditEnabled(sLayer)
			&& isRenameEnableDueToOriginalLanguage(this.getSupportInformation().originalLanguage);
	};

	/**
	 * Checks whenever the variant can be edited (a save operation) updating the entity or crating an <code>updateChange</code>.
	 * @param {sap.ui.fl.Layer} [sActiveLayer] - Layer in which the edition may take place
	 * @returns {boolean} <code>true</code> if the variant can be updated
	 */
	CompVariant.prototype.isEditEnabled = function(sActiveLayer) {
		var bDeveloperLayer = sActiveLayer && LayerUtils.isDeveloperLayer(sActiveLayer);
		var bOriginSystem = isOriginSystem(
			this.getSupportInformation().sourceSystem,
			this.getSupportInformation().sourceClient
		);
		var bUserAuthorized = checkLayerAndUserAuthorization(this.getLayer(), sActiveLayer, this.getOwnerId());
		return bDeveloperLayer || bOriginSystem && bUserAuthorized;
	};

	/**
	 * Checks whenever the variant can be deleted.
	 * @param {sap.ui.fl.Layer} [sLayer] - Layer in which the deletion may take place
	 * @returns {boolean} <code>true</code> if the variant file can be deleted
	 */
	CompVariant.prototype.isDeleteEnabled = function(sLayer) {
		var bOriginSystem = isOriginSystem(
			this.getSupportInformation().sourceSystem,
			this.getSupportInformation().sourceClient
		);
		return bOriginSystem
			&& checkLayerAndUserAuthorization(this.getLayer(), sLayer, this.getOwnerId())
			&& !this.getStandardVariant();
	};

	/**
	 * Sets the favorite flag of the runtime instance as well as the persistent representation.
	 * This results in setting the definition as well as flagging the entity as 'dirty'.
	 * @param {boolean} bFavorite - Boolean to which the favorite flag should be set
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	CompVariant.prototype.storeFavorite = function(bFavorite) {
		if (bFavorite !== this.getFavorite()) {
			this.setState(States.LifecycleState.UPDATED);
			this.setFavorite(bFavorite);
		}
	};

	/**
	 * Sets the 'visible' flag of the runtime instance as well as the persistent representation.
	 * This results in setting the definition as well as flagging the entity as 'dirty'.
	 * @param {boolean} bVisible - Boolean to which the 'visible' flag should be set
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	CompVariant.prototype.storeVisible = function(bVisible) {
		if (bVisible !== this.getVisible()) {
			this.setState(States.LifecycleState.UPDATED);
			this.setVisible(bVisible);
		}
	};

	/**
	 * Retrieves the owner ID (user)
	 * @returns {string} User ID
	 */
	CompVariant.prototype.getOwnerId = function() {
		return this.getSupportInformation().user || "";
	};

	/**
	 * Sets the content of the runtime instance as well as the persistent representation.
	 * This results in setting the definition as well as flagging the entity as 'dirty'.
	 * @param {object} [oContent={}] - Content object to be stored
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	CompVariant.prototype.storeContent = function(oContent) {
		// setContent() already sets the dirty state by default
		this.setContent(oContent);
	};

	/**
	 * Sets the e'Apply Automatically' flag of the runtime instance as well as the persistent representation.
	 * This results in setting the definition as well as flagging the entity as 'dirty'.
	 * @param {boolean} bExecuteOnSelection - Boolean to which the 'Apply Automatically' flag should be set
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	CompVariant.prototype.storeExecuteOnSelection = function(bExecuteOnSelection) {
		if (bExecuteOnSelection !== this.getExecuteOnSelection()) {
			this.setState(States.LifecycleState.UPDATED);
			this.setExecuteOnSelection(bExecuteOnSelection);
		}
	};

	/**
	 * Sets the name of the runtime instance as well as the persistent representation.
	 * This results in a entity within the texts section flagged as a field for translation.
	 * @param {string} sName - Name to be set
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	CompVariant.prototype.storeName = function(sName) {
		// setName() already sets the dirty state by default
		this.setName(sName);
	};

	/**
	 * Sets the object of the contexts attribute.
	 * @param {object} mContexts - Contexts of the variant file
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	CompVariant.prototype.storeContexts = function(mContexts) {
		this.setContexts(mContexts);
		this.setState(States.LifecycleState.UPDATED);
	};

	CompVariant.prototype.cloneFileContentWithNewId = function(...aArgs) {
		var mFileContent = Variant.prototype.cloneFileContentWithNewId.apply(this, aArgs);
		mFileContent.variantId = mFileContent.fileName;
		return mFileContent;
	};

	return CompVariant;
});