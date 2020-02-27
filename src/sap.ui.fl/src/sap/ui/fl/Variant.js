/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/base/ManagedObject",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/registry/Settings",
	"sap/base/util/merge",
	"sap/base/Log"
], function (
	jQuery,
	ManagedObject,
	Layer,
	Utils,
	LayerUtils,
	Settings,
	merge,
	Log
) {
	"use strict";

	/**
	 * Flexibility variant class. Stores variant content, changes and related information.
	 *
	 * @param {object} oFile - variant's content, changes and admin data
	 *
	 * @class Variant class.
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.fl.Variant
	 * @experimental Since 1.52.0
	 */
	var Variant = ManagedObject.extend("sap.ui.fl.Variant", /** @lends sap.ui.fl.Variant.prototype */ {
		constructor : function(oFile) {
			ManagedObject.apply(this);

			if (!jQuery.isPlainObject(oFile)) {
				Log.error("Constructor : sap.ui.fl.Variant : oFile is not defined");
			}

			this._oDefinition = oFile;
			this._oOriginDefinition = merge({}, oFile);
			this._sRequest = '';
			this._bUserDependent = (oFile.content.layer === Layer.USER);
			this._vRevertData = null;
			this.setState(Variant.states.NEW);
		},
		metadata : {
			properties : {
				state : {
					type: "string"
				}
			}
		}
	});

	Variant.states = {
		NEW: "NEW",
		PERSISTED : "NONE",
		DELETED: "DELETE",
		DIRTY: "UPDATE"
	};

	Variant.events = {
		markForDeletion: "markForDeletion"
	};

	Variant.prototype.setState = function(sState) {
		if (this._isValidState(sState)) {
			this.setProperty("state", sState);
		}
		return this;
	};

	/**
	 * Validates if the new state of variant has a valid value
	 * The new state value has to be in the <code>Variant.states</code> list
	 * Moving of state directly from <code>Variant.states.NEW</code> to <code>Variant.states.DIRTY</code> is not allowed.
	 * @param {string} sState - value of target state
	 * @returns {boolean} - new state is valid
	 * @private
	 */
	Variant.prototype._isValidState = function(sState) {
		//new state have to be in the Variant.states value list
		var bStateFound = false;
		Object.keys(Variant.states).some(function(sKey) {
			if (Variant.states[sKey] === sState) {
				bStateFound = true;
			}
			return bStateFound;
		});
		if (!bStateFound) {
			return false;
		}
		//change' state can not move from NEW to DIRTY directly
		if ((this.getState() === Variant.states.NEW) && (sState === Variant.states.DIRTY)) {
			return false;
		}
		return true;
	};

	/**
	 * Returns if the variant protocol is valid
	 * @returns {boolean} Variant is valid (mandatory fields are filled, etc)
	 *
	 * @public
	 */
	Variant.prototype.isValid = function () {
		var bIsValid = true;

		if (typeof (this._oDefinition) !== "object") {
			bIsValid = false;
		}
		if (!this._oDefinition.content.fileType || this._oDefinition.content.fileType !== "ctrl_variant") {
			bIsValid = false;
		}
		if (!this._oDefinition.content.fileName) {
			bIsValid = false;
		}
		if (!this._oDefinition.content.content.title) {
			bIsValid = false;
		}
		if (!this._oDefinition.content.variantManagementReference) {
			bIsValid = false;
		}
		if (!this._oDefinition.content.layer) {
			bIsValid = false;
		}
		if (!this._oDefinition.content.originalLanguage) {
			bIsValid = false;
		}

		return bIsValid;
	};

	/**
	 * Returns if the variant is of type variant
	 * @returns {boolean} fileType of the ctrl_variant document is a variant
	 *
	 * @public
	 */
	Variant.prototype.isVariant = function () {
		return true;
	};

	Variant.prototype.getDefinitionWithChanges = function () {
		return this._oDefinition;
	};

	/**
	 * Returns the title
	 *
	 * @returns {String} Title of the variant
	 * @public
	 */
	Variant.prototype.getTitle = function () {
		if (this._oDefinition) {
			return this._oDefinition.content.content.title;
		}
	};

	/**
	 * Returns the file type
	 *
	 * @returns {String} fileType of the variant
	 * @public
	 */
	Variant.prototype.getFileType = function () {
		if (this._oDefinition) {
			return this._oDefinition.content.fileType;
		}
	};

	/**
	 * Returns variant changes
	 *
	 * @returns {array} Array of changes belonging to Variant
	 * @public
	 */
	Variant.prototype.getControlChanges = function () {
		return this._oDefinition.controlChanges;
	};

	/**
	 * Returns the original language in ISO 639-1 format
	 *
	 * @returns {String} Original language
	 *
	 * @public
	 */
	Variant.prototype.getOriginalLanguage = function () {
		if (this._oDefinition && this._oDefinition.content.originalLanguage) {
			return this._oDefinition.content.originalLanguage;
		}
		return "";
	};

	/**
	 * Returns the abap package name
	 * @returns {string} ABAP package where the variant is assigned to
	 *
	 * @public
	 */
	Variant.prototype.getPackage = function () {
		return this._oDefinition.content.packageName;
	};

	/**
	 * Returns the namespace. The variants' namespace is
	 * also the namespace of the change file in the repository.
	 *
	 * @returns {String} Namespace of the variants document
	 *
	 * @public
	 */
	Variant.prototype.getNamespace = function () {
		return this._oDefinition.content.namespace;
	};

	/**
	 * Sets the namespace.
	 *
	 * @param {string} sNamespace Namespace of the variants document
	 *
	 * @public
	 */
	Variant.prototype.setNamespace = function (sNamespace) {
		this._oDefinition.content.namespace = sNamespace;
	};

	/**
	 * Returns the id of the variant
	 * @returns {string} Id of the variant document
	 *
	 * @public
	 */
	Variant.prototype.getId = function () {
		return this._oDefinition.content.fileName;
	};

	/**
	 * Returns the content section of the variant
	 * @returns {string} Content of the variant document. The content structure can be any JSON.
	 *
	 * @public
	 */
	Variant.prototype.getContent = function () {
		return this._oDefinition.content.content;
	};

	/**
	 * Sets the object of the content attribute
	 *
	 * @param {object} oContent The content of the variant document. Can be any JSON object.
	 *
	 * @public
	 */
	Variant.prototype.setContent = function (oContent) {
		this._oDefinition.content.content = oContent;
		this.setState(Variant.states.DIRTY);
	};

	/**
	 * Returns the variant management reference of the variant
	 * @returns {string} variant management reference of the variant.
	 *
	 * @public
	 */
	Variant.prototype.getVariantManagementReference = function () {
		return this._oDefinition.content.variantManagementReference;
	};

	/**
	 * Returns the variant reference of the variant
	 * @returns {string} variant reference of the variant.
	 *
	 * @public
	 */
	Variant.prototype.getVariantReference = function () {
		return this._oDefinition.content.variantReference;
	};

	/**
	 * Returns the user ID of the owner
	 * @returns {string} ID of the owner
	 *
	 * @public
	 */
	Variant.prototype.getOwnerId = function () {
		return this._oDefinition.content.support ? this._oDefinition.content.support.user : "";
	};

	/**
	 * Returns the text in the current language for a given id
	 *
	 * @param {string} sTextId
	 *                text id which was used as part of the <code>oTexts</code> object
	 * @returns {string} The text for the given text id
	 *
	 * @function
	 */
	Variant.prototype.getText = function (sTextId) {
		if (typeof (sTextId) !== "string") {
			Log.error("sap.ui.fl.Variant.getTexts : sTextId is not defined");
		}
		if (this._oDefinition.content.texts) {
			if (this._oDefinition.content.texts[sTextId]) {
				return this._oDefinition.content.texts[sTextId].value;
			}
		}
		return "";
	};

	/**
	 * Sets the new text for the given text id
	 *
	 * @param {string} sTextId
	 *                text id which was used as part of the <code>oTexts</code> object
	 * @param {string} sNewText the new text for the given text id
	 *
	 * @public
	 */
	Variant.prototype.setText = function (sTextId, sNewText) {
		if (typeof (sTextId) !== "string") {
			Log.error("sap.ui.fl.Variant.setTexts : sTextId is not defined");
			return;
		}
		if (this._oDefinition.content.texts) {
			if (this._oDefinition.content.texts[sTextId]) {
				this._oDefinition.content.texts[sTextId].value = sNewText;
				this.setState(Variant.states.DIRTY);
			}
		}
	};

	/**
	 * Returns true if the current layer is the same as the layer
	 * in which the variant was created or the variant is from the
	 * end-user layer and for this user created.
	 * @returns {boolean} is the variant read only
	 *
	 * @public
	 */
	Variant.prototype.isReadOnly = function () {
		return this._isReadOnlyDueToLayer() || this._isReadOnlyWhenNotKeyUser();
	};

	/**
	 * Checks if the variant is read-only
	 * because the current user is not a key user and the change is "shared"
	 * @returns {boolean} Flag whether variant is read only
	 *
	 * @private
	 */
	Variant.prototype._isReadOnlyWhenNotKeyUser = function () {
		if (this.isUserDependent()) {
			return false; // the user always can edit its own variants
		}

		var sReference = this.getDefinition().reference;
		if (!sReference) {
			return true; // without a reference the right to edit or delete a variant cannot be determined
		}

		var oSettings = Settings.getInstanceOrUndef();
		if (!oSettings) {
			return true; // without settings the right to edit or delete a variant cannot be determined
		}

		return !oSettings.isKeyUser(); // a key user can edit changes
	};

	/**
	 * Checks if the layer allows modifying the file
	 * @returns {boolean} Flag whether variant is read only
	 *
	 * @private
	 */
	Variant.prototype._isReadOnlyDueToLayer = function () {
		var sCurrentLayer;
		sCurrentLayer = LayerUtils.getCurrentLayer(this._bUserDependent);
		return (this._oDefinition.content.layer !== sCurrentLayer);
	};

	/**
	 * A variant can only be modified if the current language equals the original language.
	 * Returns false if the current language does not equal the original language of the variant's change file.
	 * Returns false if the original language is initial.
	 *
	 * @returns {boolean} flag whether the current logon language differs from the original language of the variant's change document
	 *
	 * @private
	 */
	Variant.prototype._isReadOnlyDueToOriginalLanguage = function () {
		var sCurrentLanguage;
		var sOriginalLanguage;

		sOriginalLanguage = this.getOriginalLanguage();
		if (!sOriginalLanguage) {
			return false;
		}

		sCurrentLanguage = Utils.getCurrentLanguage();
		return (sCurrentLanguage !== sOriginalLanguage);
	};

	/**
	 * Marks the current variant to be deleted persistently
	 *
	 * @public
	 */
	Variant.prototype.markForDeletion = function () {
		this.setState(Variant.states.DELETED);
	};

	/**
	 * Sets the transport request
	 *
	 * @param {string} sRequest Transport request
	 *
	 * @public
	 */
	Variant.prototype.setRequest = function (sRequest) {
		if (typeof (sRequest) !== "string") {
			Log.error("sap.ui.fl.Variant.setRequest : sRequest is not defined");
		}
		this._sRequest = sRequest;
	};

	/**
	 * Gets the transport request
	 * @returns {string} Transport request
	 *
	 * @public
	 */
	Variant.prototype.getRequest = function () {
		return this._sRequest;
	};

	/**
	 * Gets the layer type for the variant
	 * @returns {string} The layer of the variant
	 *
	 * @public
	 */
	Variant.prototype.getLayer = function () {
		return this._oDefinition.content.layer;
	};

	/**
	 * Gets the component for the variant
	 * @returns {string} The SAPUI5 component this variant is assigned to
	 *
	 * @public
	 */
	Variant.prototype.getComponent = function () {
		return this._oDefinition.content.reference;
	};

	/**
	 * Sets the component for the variant
	 *
	 * @param {string} sComponent ID of the app or app variant
	 * @public
	 */
	Variant.prototype.setComponent = function (sComponent) {
		this._oDefinition.content.reference = sComponent;
	};

	/**
	 * Gets the creation timestamp
	 *
	 * @returns {String} creation timestamp
	 *
	 * @public
	 */
	Variant.prototype.getCreation = function () {
		return this._oDefinition.content.creation;
	};

	/**
	 * Returns true if the variant is user dependent
	 * @returns {boolean} Variant is only relevant for the current user
	 *
	 * @public
	 */
	Variant.prototype.isUserDependent = function () {
		return (this._bUserDependent);
	};

	/**
	 * Returns the pending action on the variant item
	 * @returns {string} contains one of these values: DELETE/NEW/UPDATE/NONE
	 *
	 * @public
	 */
	Variant.prototype.getPendingAction = function () {
		return this.getState();
	};

	/**
	 * Gets the JSON definition of the variant
	 * @returns {object} the content of the variant
	 *
	 * @public
	 */
	Variant.prototype.getDefinition = function () {
		return this._oDefinition.content;
	};

	/**
	 * Set the response from the back end after saving the variant
	 * @param {object} oResponse the content of the variant
	 *
	 * @public
	 */
	Variant.prototype.setResponse = function (oResponse) {
		var sResponse = JSON.stringify(oResponse);
		if (sResponse) {
			this._oDefinition = JSON.parse(sResponse);
			this._oOriginDefinition = JSON.parse(sResponse);
			this.setState(Variant.states.PERSISTED);
		}
	};

	Variant.prototype.getFullFileIdentifier = function () {
		var sLayer = this.getLayer();
		var sNamespace = this.getNamespace();
		var sFileName = this.getDefinition().content.fileName;
		var sFileType = this.getDefinition().content.fileType;

		return sLayer + "/" + sNamespace + "/" + sFileName + "." + sFileType;
	};

	/**
	 * Returns the revert specific data
	 *
	 * @returns {*} revert specific data
	 * @public
	 */
	Variant.prototype.getRevertData = function() {
		return this._vRevertData;
	};

	/**
	 * Sets the revert specific data
	 *
	 * @param {*} vData revert specific data
	 * @public
	 */
	Variant.prototype.setRevertData = function(vData) {
		this._vRevertData = vData;
	};

	/**
	 * Reset the revert specific data
	 * @public
	 */
	Variant.prototype.resetRevertData = function() {
		this.setRevertData(null);
	};

	/**
	 * Creates and returns an instance of change instance
	 *
	 * @param {Object}  [oPropertyBag] property bag
	 * @param {Object}  [oPropertyBag.content] content of the new change
	 * @param {String}  [oPropertyBag.content.fileName] name/id of the file. if not set implicitly created
	 * @param {String}  [oPropertyBag.content.content.title] title of the variant
	 * @param {String}  [oPropertyBag.content.fileType] file type of a variant
	 * @param {String}  [oPropertyBag.content.variantManagementReference] Reference to the variant management control
	 * @param {String}  [oPropertyBag.content.variantReference] Reference to another variant
	 * @param {String}  [oPropertyBag.content.reference] Application component name
	 * @param {String}  [oPropertyBag.content.packageName] Package name for transport
	 * @param {String}  [oPropertyBag.content.layer] Layer of the variant
	 * @param {Object}  [oPropertyBag.content.texts] map object with all referenced texts within the file
	 *                                               these texts will be connected to the translation process
	 * @param {String}  [oPropertyBag.content.namespace] The namespace of the change file
	 * @param {String}  [oPropertyBag.service] name of the OData service
	 * @param {Boolean} [oPropertyBag.isVariant] ctrl_variant?
	 * @param {Boolean} [oPropertyBag.isUserDependent] true for enduser changes
	 * @param {String}  !!!![oPropertyBag.context] ID of the context
	 * @param {Object}  [oPropertyBag.content.validAppVersions] Application versions where the change is active
	 * @param {String}  [oPropertyBag.generator] Tool which is used to generate the variant change file
	 *
	 * @returns {Object} The content of the change file
	 *
	 * @public
	 */
	Variant.createInitialFileContent = function (oPropertyBag) {
		if (!oPropertyBag) {
			oPropertyBag = {};
		}

		var sFileName = oPropertyBag.content.fileName || Utils.createDefaultFileName();
		var sNamespace = oPropertyBag.content.namespace || Utils.createNamespace(oPropertyBag.content, "variants");
		var oNewFile = {
			content : {
				fileName: sFileName,
				fileType: "ctrl_variant",
				variantManagementReference: oPropertyBag.content.variantManagementReference,
				variantReference: oPropertyBag.content.variantReference || "",
				reference: oPropertyBag.content.reference || "",
				packageName: oPropertyBag.content.packageName || "",
				content: {title: oPropertyBag.content.content.title || ""},
				self: sNamespace + sFileName + "." + "ctrl_variant",
				layer: oPropertyBag.content.layer || LayerUtils.getCurrentLayer(oPropertyBag.isUserDependent),
				texts: oPropertyBag.content.texts || {},
				namespace: sNamespace, //TODO: we need to think of a better way to create namespaces from Adaptation projects.
				creation: "",
				originalLanguage: Utils.getCurrentLanguage(),
				conditions: {},
				support: {
					generator: oPropertyBag.generator || "Change.createInitialFileContent",
					service: oPropertyBag.service || "",
					user: "",
					sapui5Version: sap.ui.version
				},
				validAppVersions: oPropertyBag.content.validAppVersions || {}
			},
			controlChanges: oPropertyBag.controlChanges || [],
			variantChanges: {} //should be empty for new variant
		};

		return oNewFile;
	};

	return Variant;
}, true);