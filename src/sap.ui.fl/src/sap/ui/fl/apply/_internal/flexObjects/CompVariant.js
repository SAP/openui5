/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/restricted/_pick",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/ui/fl/Change",
	"sap/ui/fl/Layer",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/Utils"
], function (
	_pick,
	States,
	Change,
	Layer,
	Settings,
	LayerUtils,
	Utils
) {
	"use strict";

	function isUserAuthor(oAuthor) {
		var oSettings = Settings.getInstanceOrUndef();
		var vUserId = oSettings && oSettings.getUserId();
		return !vUserId || vUserId.toUpperCase() === oAuthor.toUpperCase();
	}

	/**
	 * Checks if the the variant can be modified due to its layer and the user's authorization.
	 * @param {sap.ui.fl.Layer} sLayer - Layer of the variant
	 * @param {sap.ui.fl.Layer} [sActiveLayer] - Layer in which the operation may take place
	 * @param {string} sUserId - ID of the variants creator
	 * @returns {boolean} <code>true</code> if the variant is read only
	 *
	 * @private
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
		} else if (!sActiveLayer) {
			sActiveLayer = oSettings.isPublicLayerAvailable() ? Layer.PUBLIC : Layer.CUSTOMER;
		}
		var bLayerWritable = sLayer === sActiveLayer;
		var bUserAuthorized = oSettings.isKeyUser() || isUserAuthor(sUserId);

		return bLayerWritable && bUserAuthorized;
	}

	/**
	 * A variant can only be modified if the current language equals the original language.
	 * Returns <code>false</code> if the current language does not equal the original language of the variant file.
	 * Returns <code>false</code> if the original language is initial.
	 *
	 * @param {string} sOriginalLanguage - Language code of the language used on the variant creation
	 *
	 * @returns {boolean} <code>true</code> if the current logon language equals the original language of the variant file
	 *
	 * @private
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
	 * Flexibility CompVariant class. Stores variant content and related information.
	 *
	 * @param {object} oFile - File content and admin data
	 *
	 * @class sap.ui.fl.apply._internal.flexObjects.CompVariant
	 * @extends sap.ui.fl.Change
	 * @private
	 * @ui5-restricted
	 * @since 1.86.0
	 */
	var CompVariant = Change.extend("sap.ui.fl.apply._internal.flexObjects.Variant", /** @lends sap.ui.fl.apply._internal.flexObjects.CompVariant.prototype */ {
		metadata: {
			properties: {
				favorite: {
					type: "boolean",
					defaultValue: false
				},
				executeOnSelection: {
					type: "boolean",
					defaultValue: false
				},
				standardVariant: {
					type: "boolean",
					defaultValue: false
				},
				contexts: {
					type: "object",
					defaultValue: {}
				},
				persisted: {
					type: "boolean",
					defaultValue: true
				},
				name: {
					type: "string",
					defaultValue: ""
				},
				content: {
					type: "object",
					defaultValue: {}
				}
			},
			aggregations: {
				// TODO: change to revertData for alignment, but this will conflict with the derived Change.getRevertData as of today
				revertInfo: {
					type: "sap.ui.fl.apply._internal.flexObjects.CompVariantRevertData",
					multiple: true,
					singularName: "revertInfo",
					defaultValue: []
				},
				changes: {
					type: "sap.ui.fl.Change",
					multiple: true,
					defaultValue: []
				}
			}
		},

		constructor: function(oFile) {
			Change.apply(this, arguments);

			var bExecuteOnSelect = oFile.content && (oFile.content.executeOnSelect || oFile.content.executeOnSelection);

			// new property always overrules older content
			if (oFile.executeOnSelection !== undefined) {
				bExecuteOnSelect = oFile.executeOnSelection;
			}
			this.setExecuteOnSelection(bExecuteOnSelect);

			this.setContexts(oFile.contexts || {});
			this.setContent(oFile.content || {});

			this.setName(this.getText("variantName"));

			if (oFile.layer === Layer.VENDOR || oFile.layer === Layer.CUSTOMER_BASE) {
				this.setFavorite(true);
			}

			if (oFile.favorite !== undefined) {
				this.setFavorite(!!oFile.favorite);
			}

			if (oFile.persisted !== undefined) {
				this.setPersisted(!!oFile.persisted);
			}
		}
	});

	CompVariant.STANDARD_VARIANT_ID = "*standard*";

	/**
	 * Returns the id of the variant object
	 * @returns {string} the id of the variant object.
	 */
	CompVariant.prototype.getVariantId = function () {
		return this.getId();
	};

	/**
	 * Checks whenever the variant can be renamed updating the entity or crating an <code>updateChange</code>.
	 *
	 * @param {sap.ui.fl.Layer} [sLayer] - Layer in which the edition may take place
	 *
	 * @returns {boolean} <code>true</code> if the variant can be updated
	 *
	 * @public
	 */
	CompVariant.prototype.isRenameEnabled = function (sLayer) {
		return !this.getStandardVariant() && this.isEditEnabled(sLayer) && isRenameEnableDueToOriginalLanguage(this._oDefinition.content.originalLanguage);
	};

	/**
	 * Checks whenever the variant can be edited (a save operation) updating the entity or crating an <code>updateChange</code>.
	 *
	 * @param {sap.ui.fl.Layer} [sActiveLayer] - Layer in which the edition may take place
	 *
	 * @returns {boolean} <code>true</code> if the variant can be updated
	 *
	 * @public
	 */
	CompVariant.prototype.isEditEnabled = function (sActiveLayer) {
		var bDeveloperLayer = sActiveLayer && LayerUtils.isDeveloperLayer(sActiveLayer);
		var bOriginSystem = isOriginSystem(this._oDefinition.sourceSystem, this._oDefinition.sourceClient);
		var bUserAuthorized = checkLayerAndUserAuthorization(this.getLayer(), sActiveLayer, this.getOwnerId());
		return bDeveloperLayer || bOriginSystem && bUserAuthorized;
	};

	/**
	 * Checks whenever the variant can be deleted.
	 *
	 * @param {sap.ui.fl.Layer} [sLayer] - Layer in which the deletion may take place
	 *
	 * @returns {boolean} <code>true</code> if the variant file can be deleted
	 *
	 * @public
	 */
	CompVariant.prototype.isDeleteEnabled = function (sLayer) {
		return isOriginSystem(this._oDefinition.sourceSystem, this._oDefinition.sourceClient)
			&& checkLayerAndUserAuthorization(this.getLayer(), sLayer, this.getOwnerId())
			&& !this.getStandardVariant();
	};

	/**
	 * Sets the favorite flag of the runtime instance as well as the persistent representation.
	 * This results in setting the definition as well as flagging the entity as 'dirty'.
	 *
	 * @param {boolean} bFavorite - Boolean to which the favorite flag should be set
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	CompVariant.prototype.storeFavorite = function (bFavorite) {
		if (bFavorite !== undefined) {
			this._oDefinition.favorite = bFavorite;
		} else {
			delete this._oDefinition.favorite;
		}
		this.setState(States.DIRTY);
		this.setFavorite(bFavorite);
	};

	/**
	 * Sets the content of the runtime instance.
	 *
	 * @param {object} [oContent={}] - Content object to be set
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	CompVariant.prototype.setContent = function (oContent) {
		// TODO: remove after the extended Change.js does not overwrite the default setContent
		this.setProperty("content", oContent || {});
	};

	/**
	 * Sets the content of the runtime instance.
	 *
	 * @returns {object} Content object of the variant
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	CompVariant.prototype.getContent = function () {
		// TODO: remove after the extended Change.js does not overwrite the default getContent
		return this.getProperty("content");
	};


	CompVariant.prototype.getOwnerId = function() {
		return this._oDefinition.support ? this._oDefinition.support.user : "";
	};

	/**
	 * Sets the content of the runtime instance as well as the persistent representation.
	 * This results in setting the definition as well as flagging the entity as 'dirty'.
	 *
	 * @param {object} [oContent={}] - Content object to be stored
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	CompVariant.prototype.storeContent = function (oContent) {
		this._oDefinition.content = oContent || {};
		this.setState(States.DIRTY);
		this.setContent(oContent);
	};

	/**
	 * Sets the e'Apply Automatically' flag of the runtime instance as well as the persistent representation.
	 * This results in setting the definition as well as flagging the entity as 'dirty'.
	 *
	 * @param {boolean} bExecuteOnSelection - Boolean to which the 'Apply Automatically' flag should be set
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	CompVariant.prototype.storeExecuteOnSelection = function (bExecuteOnSelection) {
		if (bExecuteOnSelection !== undefined) {
			this._oDefinition.executeOnSelection = bExecuteOnSelection;
		} else {
			delete this._oDefinition.executeOnSelection;
		}
		delete this._oDefinition.content.executeOnSelection;
		this.setState(States.DIRTY);
		this.setExecuteOnSelection(bExecuteOnSelection);
	};

	/**
	 * Sets the name of the runtime instance as well as the persistent representation.
	 * This results in a entity within the texts section flagged as a field for translation.
	 *
	 * @param {string} sName - Name to be set
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	CompVariant.prototype.storeName = function (sName) {
		this._oDefinition.texts.variantName.value = sName;

		this.setState(States.DIRTY);
		this.setName(sName);
	};

	/**
	 * Sets the object of the contexts attribute.
	 *
	 * @param {object} mContexts - Contexts of the variant file
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	CompVariant.prototype.storeContexts = function (mContexts) {
		if (mContexts !== undefined) {
			this._oDefinition.contexts = mContexts;
		} else {
			delete this._oDefinition.contexts;
		}
		this.setContexts(mContexts);
		this.setState(States.DIRTY);
	};

	CompVariant.createInitialFileContent = function (oPropertyBag) {
		var oNewFile = Change.createInitialFileContent(oPropertyBag);
		if (oPropertyBag.contexts) {
			oNewFile.contexts = oPropertyBag.contexts;
		}
		if (oPropertyBag.favorite !== undefined) {
			oNewFile.favorite = oPropertyBag.favorite;
		}
		if (oPropertyBag.executeOnSelection !== undefined) {
			oNewFile.executeOnSelection = oPropertyBag.executeOnSelection;
		}

		// TODO: clean up the createInitialFileContent within the Change class plus create a base class FlexObject
		return _pick(oNewFile, [
			"changeType",
			"namespace",
			"service",
			"content",
			"reference",
			"fileName",
			"fileType",
			"packageName",
			"layer",
			"favorite",
			"executeOnSelection",
			"selector",
			"texts",
			"support",
			"contexts"
		]);
	};

	return CompVariant;
});
