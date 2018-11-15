/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/EventProvider", "sap/ui/fl/Utils", "sap/ui/fl/registry/Settings"
], function (EventProvider, Utils, Settings) {

	"use strict";

	/**
	 * A change object based on the json data with dirty handling.
	 * @constructor
	 * @alias sap.ui.fl.Change
	 * @param {object} oFile - file content and admin data
	 * @experimental Since 1.25.0
	 * @author SAP SE
	 * @version ${version}
	 */
	var Change = function (oFile) {
		EventProvider.apply(this);
		if (typeof (oFile) !== "object") {
			Utils.log.error("Constructor : sap.ui.fl.Change : oFile is not defined");
		}

		this._oDefinition = oFile;
		this._oOriginDefinition = JSON.parse(JSON.stringify(oFile));
		this._sRequest = '';
		this._bIsDeleted = false;
		this._bUserDependent = (oFile.layer === "USER");
	};

	Change.events = {
		markForDeletion: "markForDeletion"
	};

	Change.prototype = jQuery.sap.newObject(EventProvider.prototype);

	/**
	 * Returns if the change protocol is valid
	 * @returns {boolean} Change is valid (mandatory fields are filled, etc)
	 *
	 * @public
	 */
	Change.prototype.isValid = function () {
		var bIsValid = true;

		if (typeof (this._oDefinition) !== "object") {
			bIsValid = false;
		}
		if (!this._oDefinition.fileType) {
			bIsValid = false;
		}
		if (!this._oDefinition.fileName) {
			bIsValid = false;
		}
		if (!this._oDefinition.changeType) {
			bIsValid = false;
		}
		if (!this._oDefinition.layer) {
			bIsValid = false;
		}
		if (!this._oDefinition.originalLanguage) {
			bIsValid = false;
		}

		return bIsValid;
	};

	/**
	 * Returns if the change is of type variant
	 * @returns {boolean} fileType of the change document is a variant
	 *
	 * @public
	 */
	Change.prototype.isVariant = function () {
		return this._oDefinition.fileType === "variant";
	};

	/**
	 * Returns the change type
	 *
	 * @returns {String} Changetype of the file, for example LabelChange
	 * @public
	 */
	Change.prototype.getChangeType = function () {
		if (this._oDefinition) {
			return this._oDefinition.changeType;
		}
	};

	/**
	 * Returns the the original language in ISO 639-1 format
	 *
	 * @returns {String} Original language
	 *
	 * @public
	 */
	Change.prototype.getOriginalLanguage = function () {
		if (this._oDefinition && this._oDefinition.originalLanguage) {
			return this._oDefinition.originalLanguage;
		}
		return "";
	};

	/**
	 * Returns the the context in which the change should be applied
	 *
	 * @returns {Object[]} context - List of objects determine the context
	 * @returns {string} selector  - names the key of the context
	 * @returns {string} operator - instruction how the values should be compared
	 * @returns {Object} value - values given to the comparison
	 *
	 * @public
	 */
	Change.prototype.getContext = function () {
		if (this._oDefinition && this._oDefinition.context) {
			return this._oDefinition.context;
		}
		return "";
	};

	/**
	 * Returns the abap package name
	 * @returns {string} ABAP package where the change is assigned to
	 *
	 * @public
	 */
	Change.prototype.getPackage = function () {
		return this._oDefinition.packageName;
	};

	/**
	 * Returns the namespace. The changes' namespace is
	 * also the namespace of the change file in the repository.
	 *
	 * @returns {String} Namespace of the change document
	 *
	 * @public
	 */
	Change.prototype.getNamespace = function () {
		return this._oDefinition.namespace;
	};

	/**
	 * Returns the id of the change
	 * @returns {string} Id of the change document
	 *
	 * @public
	 */
	Change.prototype.getId = function () {
		return this._oDefinition.fileName;
	};

	/**
	 * Returns the content section of the change
	 * @returns {string} Content of the change document. The content structure can be any JSON.
	 *
	 * @public
	 */
	Change.prototype.getContent = function () {
		return this._oDefinition.content;
	};

	/**
	 * Sets the object of the content attribute
	 *
	 * @param {object} oContent The content of the change document. Can be any JSON object.
	 *
	 * @public
	 */
	Change.prototype.setContent = function (oContent) {
		this._oDefinition.content = oContent;
	};

	/**
	 * Returns the selector from the file content
	 * @returns {object} selector in format selectorPropertyName:selectorPropertyValue
	 *
	 * @public
	 */
	Change.prototype.getSelector = function () {
		return this._oDefinition.selector;
	};

	/**
	 * Returns the user ID of the owner
	 * @returns {string} ID of the owner
	 *
	 * @public
	 */
	Change.prototype.getOwnerId = function () {
		return this._oDefinition.support ? this._oDefinition.support.user : "";
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
	Change.prototype.getText = function (sTextId) {
		if (typeof (sTextId) !== "string") {
			Utils.log.error("sap.ui.fl.Change.getTexts : sTextId is not defined");
		}
		if (this._oDefinition.texts) {
			if (this._oDefinition.texts[sTextId]) {
				return this._oDefinition.texts[sTextId].value;
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
	Change.prototype.setText = function (sTextId, sNewText) {
		if (typeof (sTextId) !== "string") {
			Utils.log.error("sap.ui.fl.Change.setTexts : sTextId is not defined");
			return;
		}
		if (this._oDefinition.texts) {
			if (this._oDefinition.texts[sTextId]) {
				this._oDefinition.texts[sTextId].value = sNewText;
			}
		}
	};

	/**
	 * Returns true if the current layer is the same as the layer
	 * in which the change was created or the change is from the
	 * end-user layer and for this user created.
	 * @returns {boolean} is the change document read only
	 *
	 * @public
	 */
	Change.prototype.isReadOnly = function () {
		var bIsReadOnly = this._isReadOnlyDueToLayer();
		if (!bIsReadOnly) {
			bIsReadOnly = this._isReadOnlyWhenNotKeyUser();
		}
		return bIsReadOnly;
	};

	/**
	 * Checks if the change is read-only
	 * because the current user is not a key user and the change is "shared"
	 * @returns {boolean} Flag whether change is read only
	 *
	 * @private
	 */
	Change.prototype._isReadOnlyWhenNotKeyUser = function () {
		var bIsReadOnly = false;
		if (!this.isUserDependent()) {
			var sReference = this.getDefinition().reference;
			if (sReference) {
				var oSettings = Settings.getInstanceOrUndef(sReference);
				if (oSettings) {
					var bIsKeyUser = oSettings.isKeyUser();
					if (bIsKeyUser === false) {
						bIsReadOnly = true;
					}
				}
			}
		}
		return bIsReadOnly;
	};

	/**
	 * Returns true if the label is read only. The label might be read only because of the current layer or because the logon language differs from the original language of the change document.
	 *
	 * @returns {boolean} is the label read only
	 *
	 * @public
	 */
	Change.prototype.isLabelReadOnly = function () {
		if (this._isReadOnlyDueToLayer()) {
			return true;
		}
		return this._isReadOnlyDueToOriginalLanguage();
	};

	/**
	 * Checks if the layer allows modifying the file
	 * @returns {boolean} Flag whether change is read only
	 *
	 * @private
	 */
	Change.prototype._isReadOnlyDueToLayer = function () {
		var sCurrentLayer;
		sCurrentLayer = Utils.getCurrentLayer(this._bUserDependent);
		return (this._oDefinition.layer !== sCurrentLayer);
	};

	/**
	 * A change can only be modified if the current language equals the original language.
	 * Returns false if the current language does not equal the original language of the change file.
	 * Returns false if the original language is initial.
	 *
	 * @returns {boolean} flag whether the current logon language differs from the original language of the change document
	 *
	 * @private
	 */
	Change.prototype._isReadOnlyDueToOriginalLanguage = function () {
		var sCurrentLanguage, sOriginalLanguage;

		sOriginalLanguage = this.getOriginalLanguage();
		if (!sOriginalLanguage) {
			return false;
		}

		sCurrentLanguage = Utils.getCurrentLanguage();
		return (sCurrentLanguage !== sOriginalLanguage);
	};

	/**
	 * Mark the current change to be deleted persistently
	 *
	 * @public
	 */
	Change.prototype.markForDeletion = function () {
		this._bIsDeleted = true;
	};

	/**
	 * Determines if the Change has to be updated to the backend
	 * @returns {boolean} content of the change document has changed (change is in dirty state)
	 * @private
	 */
	Change.prototype._isDirty = function () {
		var sCurrentDefinition = JSON.stringify(this._oDefinition);
		var sOriginDefinition = JSON.stringify(this._oOriginDefinition);

		return (sCurrentDefinition !== sOriginDefinition);
	};

	/**
	 * Sets the transport request
	 *
	 * @param {string} sRequest Transport request
	 *
	 * @public
	 */
	Change.prototype.setRequest = function (sRequest) {
		if (typeof (sRequest) !== "string") {
			Utils.log.error("sap.ui.fl.Change.setRequest : sRequest is not defined");
		}
		this._sRequest = sRequest;
	};

	/**
	 * Gets the transport request
	 * @returns {string} Transport request
	 *
	 * @public
	 */
	Change.prototype.getRequest = function () {
		return this._sRequest;
	};

	/**
	 * Gets the layer type for the change
	 * @returns {string} The layer of the change document
	 *
	 * @public
	 */
	Change.prototype.getLayer = function () {
		return this._oDefinition.layer;
	};

	/**
	 * Gets the component for the change
	 * @returns {string} The SAPUI5 component this change is assigned to
	 *
	 * @public
	 */
	Change.prototype.getComponent = function () {
		return this._oDefinition.reference;
	};

	/**
	 * Gets the creation timestamp
	 *
	 * @returns {String} creation timestamp
	 *
	 * @public
	 */
	Change.prototype.getCreation = function () {
		return this._oDefinition.creation;
	};

	/**
	 * Returns true if the change is user dependent
	 * @returns {boolean} Change is only relevant for the current user
	 *
	 * @public
	 */
	Change.prototype.isUserDependent = function () {
		return (this._bUserDependent);
	};

	/**
	 * Returns the pending action on the change item
	 * @returns {string} contains one of these values: DELETE/NEW/UPDATE/NONE
	 *
	 * @public
	 */
	Change.prototype.getPendingAction = function () {
		if (this._bIsDeleted) {
			return "DELETE";
		} else if (!this._oDefinition.creation) {
			return "NEW";
		} else if (this._isDirty() === true) {
			return "UPDATE";
		}
		return "NONE";
	};

	/**
	 * Gets the JSON definition of the change
	 * @returns {object} the content of the change document
	 *
	 * @public
	 */
	Change.prototype.getDefinition = function () {
		return this._oDefinition;
	};

	/**
	 * Set the response from the backend after saving the change
	 * @param {object} oResponse the content of the change document
	 *
	 * @public
	 */
	Change.prototype.setResponse = function (oResponse) {
		var sResponse = JSON.stringify(oResponse);
		if (sResponse) {
			this._oDefinition = JSON.parse(sResponse);
			this._oOriginDefinition = JSON.parse(sResponse);
		}
	};

	Change.prototype.getFullFileIdentifier = function () {
		var sLayer = this.getLayer();
		var sNamespace = this.getNamespace();
		var sFileName = this.getDefinition().fileName;
		var sFileType = this.getDefinition().fileType;

		return sLayer + "/" + sNamespace + "/" + sFileName + "." + sFileType;
	};

	/**
	 * Adds the selector to the dependent selector list.
	 *
	 * @param {(string|sap.ui.core.Control|string[]|sap.ui.core.Control[])} vControl - SAPUI5 control, or ID string,
	 * or array of SAPUI5 controls, for which the selector shall be determined
	 * @param {string} sAlias - Dependent object is saved under this alias
	 * @param {object} mPropertyBag
	 * @param {sap.ui.fl.changeHandler.BaseTreeModifier} mPropertyBag.modifier - Modifier for the controls
	 * @param {sap.ui.core.Component} (optional) mPropertyBag.appComponent - Application component; only needed if vControl is a string or an XML node
	 * @param {object} (optional) mAdditionalSelectorInformation - Additional mapped data which is added to the selector
	 *
	 * @throws {Exception} oException - If sAlias already exists, an error is thrown
	 * @public
	 */
	Change.prototype.addDependentControl = function (vControl, sAlias, mPropertyBag, mAdditionalSelectorInformation) {
		if (!vControl) {
			throw new Error("Parameter vControl is mandatory");
		}
		if (!sAlias) {
			throw new Error("Parameter sAlias is mandatory");
		}
		if (!mPropertyBag) {
			throw new Error("Parameter mPropertyBag is mandatory");
		}

		if (!this._oDefinition.dependentSelector) {
			this._oDefinition.dependentSelector = {};
		}

		if (this._oDefinition.dependentSelector[sAlias]) {
			throw new Error("Alias '" + sAlias + "' already exists in the change.");
		}

		var oModifier = mPropertyBag.modifier;
		var oAppComponent = mPropertyBag.appComponent;

		if (Array.isArray(vControl)) {
			var aSelector = [];
			vControl.forEach(function (oControl) {
				aSelector.push(oModifier.getSelector(oControl, oAppComponent, mAdditionalSelectorInformation));
			});
			this._oDefinition.dependentSelector[sAlias] = aSelector;
		} else {
			this._oDefinition.dependentSelector[sAlias] = oModifier.getSelector(vControl, oAppComponent, mAdditionalSelectorInformation);
		}

		//remove dependency list so that it will be created again in method getDependentIdList
		delete this._aDependentIdList;
	};

	/**
	 * Returns the control or array of controls saved under the passed alias.
	 *
	 * @param {string} sAlias - Used to retrieve the selectors that have been saved under this alias
	 * @param {object} mPropertyBag
	 * @param {sap.ui.fl.changeHandler.BaseTreeModifier} mPropertyBag.modifier - Modifier for the controls
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Application component, needed to retrieve the control from the selector
	 *
	 * @returns {array | object} dependent selector list in format selectorPropertyName:selectorPropertyValue or the selector saved under the alias
	 *
	 * @public
	 */
	Change.prototype.getDependentControl = function (sAlias, mPropertyBag) {
		var aDependentControls = [];
		var oDependentSelector;
		if (!sAlias) {
			throw new Error("Parameter sAlias is mandatory");
		}
		if (!mPropertyBag) {
			throw new Error("Parameter mPropertyBag is mandatory");
		}

		var oModifier = mPropertyBag.modifier;
		var oAppComponent = mPropertyBag.appComponent;

		if (!this._oDefinition.dependentSelector) {
			return undefined;
		}

		oDependentSelector = this._oDefinition.dependentSelector[sAlias];
		if (Array.isArray(oDependentSelector)) {
			oDependentSelector.forEach(function (oSelector) {
				aDependentControls.push(oModifier.bySelector(oSelector, oAppComponent));
			});
			return aDependentControls;
		} else {
			return oModifier.bySelector(oDependentSelector, oAppComponent);
		}
	};

	/**
	 * Returns all dependent global IDs, including the ID from selector of the changes.
	 *
	 * @param {sap.ui.core.Component} oAppComponent - Application component, needed to translate the local ID into a global ID
	 *
	 * @returns {array} dependent global ID list
	 *
	 * @public
	 */
	Change.prototype.getDependentIdList = function (oAppComponent) {
		var that = this;
		var sId;
		var aDependentSelectors = [this.getSelector()];
		var aDependentIds = [];

		if (!this._aDependentIdList) {
			if (this._oDefinition.dependentSelector){
				aDependentSelectors = Object.keys(this._oDefinition.dependentSelector).reduce(function(aDependentSelectors, sAlias){
					return aDependentSelectors.concat(that._oDefinition.dependentSelector[sAlias]);
				}, aDependentSelectors);
			}

			aDependentSelectors.forEach(function (oDependentSelector) {
				sId = oDependentSelector.id;
				if (oDependentSelector.idIsLocal) {
					sId = oAppComponent.createId(oDependentSelector.id);
				}
				if (aDependentIds.indexOf(sId) === -1) {
					aDependentIds.push(sId);
				}
			});

			this._aDependentIdList = aDependentIds;
		}

		return this._aDependentIdList;
	};

	/**
	 * Returns the change key
	 *
	 * @returns {String} Change key of the file which is a unique concatenation of fileName, layer and namespace
	 * @public
	 */
	Change.prototype.getKey = function () {
		return this._oDefinition.fileName + this._oDefinition.layer + this._oDefinition.namespace;
	};

	/**
	 * Creates and returns a instance of change instance
	 *
	 * @param {Object}  [oPropertyBag] property bag
	 * @param {String}  [oPropertyBag.service] name of the OData service
	 * @param {String}  [oPropertyBag.componentName] name of the component
	 * @param {String}  [oPropertyBag.changeType] type of the change
	 * @param {Object}  [oPropertyBag.texts] map object with all referenced texts within the file
	 *                                      these texts will be connected to the translation process
	 * @param {Object}  [oPropertyBag.content] content of the new change
	 * @param {Boolean} [oPropertyBag.isVariant] variant?
	 * @param {String}  [oPropertyBag.namespace] namespace
	 * @param {String}  [oPropertyBag.packageName] ABAP package name
	 * @param {Object}  [oPropertyBag.selector] name value pair of the attribute and value
	 * @param {String}  [oPropertyBag.id] name/id of the file. if not set implicitly created
	 * @param {Boolean} [oPropertyBag.isVariant] name of the component
	 * @param {Boolean} [oPropertyBag.isUserDependent] true for enduser changes
	 *
	 * @returns {Object} The content of the change file
	 *
	 * @public
	 */
	Change.createInitialFileContent = function (oPropertyBag) {

		if (!oPropertyBag) {
			oPropertyBag = {};
		}

		var oNewFile = {
			fileName: oPropertyBag.id || Utils.createDefaultFileName(oPropertyBag.changeType),
			fileType: (oPropertyBag.isVariant) ? "variant" : "change",
			changeType: oPropertyBag.changeType || "",
			reference: oPropertyBag.reference || "",
			packageName: oPropertyBag.packageName || "",
			content: oPropertyBag.content || {},
			selector: oPropertyBag.selector || {},
			layer: oPropertyBag.layer || Utils.getCurrentLayer(oPropertyBag.isUserDependent),
			texts: oPropertyBag.texts || {},
			namespace: oPropertyBag.namespace || Utils.createNamespace(oPropertyBag, "changes"),
			creation: "",
			originalLanguage: Utils.getCurrentLanguage(),
			conditions: {},
			context: oPropertyBag.context || "",
			support: {
				generator: "Change.createInitialFileContent",
				service: oPropertyBag.service || "",
				user: "",
				sapui5Version: sap.ui.version
			},
			dependentSelector: oPropertyBag.dependentSelector || {}
		};

		return oNewFile;
	};

	return Change;
}, true);
