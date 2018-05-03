/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/base/ManagedObject",
	"sap/ui/fl/Utils",
	"sap/ui/fl/registry/Settings"
], function (
	jQuery,
	ManagedObject,
	Utils,
	Settings
) {

	"use strict";

	/**
	 * Flexibility change class. Stores change content and related information.
	 *
	 * @param {object} oFile - file content and admin data
	 *
	 * @class Change class.
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.fl.Change
	 * @experimental Since 1.25.0
	 */
	var Change = ManagedObject.extend("sap.ui.fl.Change", /** @lends sap.ui.fl.Change.prototype */
	{
		constructor : function(oFile){
			ManagedObject.apply(this);

			if (!jQuery.isPlainObject(oFile)) {
				Utils.log.error("Constructor : sap.ui.fl.Change : oFile is not defined");
			}

			this._oDefinition = oFile;
			this._sRequest = '';
			this._bUserDependent = (oFile.layer === "USER");
			this._vRevertData = null;
			this._aUndoOperations = null;
			this.setState(Change.states.NEW);
		},
		metadata : {
			properties : {
				state : {
					type: "string"
				}
			}
		}
	});

	Change.states = {
		NEW: "NEW",
		PERSISTED : "NONE",
		DELETED: "DELETE",
		DIRTY: "UPDATE"
	};

	Change.prototype.setState = function(sState) {
		if (this._isValidState(sState)) {
			this.setProperty("state", sState);
		}
		return this;
	};

	/**
	 * Validates if the new state of change has a valid value
	 * The new state value has to be in the <code>Change.states</code> list
	 * Moving of state directly from <code>Change.states.NEW</code> to <code>Change.states.DIRTY</code> is not allowed.
	 * @param {string} sState - value of target state
	 * @returns {boolean} - new state is valid
	 * @private
	 */
	Change.prototype._isValidState = function(sState) {
		//new state have to be in the Change.states value list
		var bStateFound = false;
		Object.keys(Change.states).some(function(sKey){
			if (Change.states[sKey] === sState) {
				bStateFound = true;
			}
			return bStateFound;
		});
		if (!bStateFound) {
			return false;
		}
		//change' state can not move from NEW to DIRTY directly
		if ((this.getState() === Change.states.NEW) && (sState === Change.states.DIRTY)) {
			return false;
		}
		return true;
	};

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
	 * @returns {boolean} fileType of the change file is a variant
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
	 * Returns the file type
	 *
	 * @returns {String} fileType of the file
	 * @public
	 */
	Change.prototype.getFileType = function () {
		if (this._oDefinition) {
			return this._oDefinition.fileType;
		}
	};

	/**
	 * Returns the original language in ISO 639-1 format
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
	 * Returns the context in which the change should be applied
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
	 * @returns {String} Namespace of the change file
	 *
	 * @public
	 */
	Change.prototype.getNamespace = function () {
		return this._oDefinition.namespace;
	};

	/**
	 * Sets the namespace.
	 *
	 * @param {string} sNamespace Namespace of the change file
	 *
	 * @public
	 */
	Change.prototype.setNamespace = function (sNamespace) {
		this._oDefinition.namespace = sNamespace;
	};

	/**
	 * Returns the project ID of the change. There might be multiple projects
	 * adapting a base application. The project ID helps to see where the
	 * change is coming from. If no projectIDid is specified, it is the
	 * sap.app/id
	 *
	 * @returns {String} Project id of the change file
	 *
	 * @public
	 */
	Change.prototype.getProjectId = function () {
		return this._oDefinition.projectId;
	};

	/**
	 * Sets the project ID.
	 *
	 * @param {string} sProjectId Project ID of the change file
	 *
	 * @public
	 */
	Change.prototype.setProjectId = function (sProjectId) {
		this._oDefinition.projectId = sProjectId;
	};

	/**
	 * Returns the ID of the change
	 * @returns {string} Id of the change file
	 *
	 * @public
	 */
	Change.prototype.getId = function () {
		return this._oDefinition.fileName;
	};

	/**
	 * Returns the content section of the change
	 * @returns {string} Content of the change file. The content structure can be any JSON.
	 *
	 * @public
	 */
	Change.prototype.getContent = function () {
		return this._oDefinition.content;
	};

	/**
	 * Sets the object of the content attribute
	 *
	 * @param {object} oContent The content of the change file. Can be any JSON object.
	 *
	 * @public
	 */
	Change.prototype.setContent = function (oContent) {
		this._oDefinition.content = oContent;
		this.setState(Change.states.DIRTY);
	};

	/**
	 * Returns the variant reference of the change
	 * @returns {string} variant reference of the change.
	 *
	 * @public
	 */
	Change.prototype.getVariantReference = function () {
		return this._oDefinition.variantReference || "";
	};

	/**
	 * Sets the variant reference of the change
	 *
	 * @param {object} sVariantReference The variant reference of the change.
	 *
	 * @public
	 */
	Change.prototype.setVariantReference = function (sVariantReference) {
		this._oDefinition.variantReference = sVariantReference;
		this.setState(Change.states.DIRTY);
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
				this.setState(Change.states.DIRTY);
			}
		}
	};

	/**
	 * Returns true if the current layer is the same as the layer
	 * in which the change was created or the change is from the
	 * end-user layer and for this user created.
	 * @returns {boolean} is the change file read only
	 *
	 * @public
	 */
	Change.prototype.isReadOnly = function () {
		return this._isReadOnlyDueToLayer() || this._isReadOnlyWhenNotKeyUser();
	};

	/**
	 * Checks if the change is read-only
	 * because the current user is not a key user and the change is "shared"
	 * @returns {boolean} Flag whether change is read only
	 *
	 * @private
	 */
	Change.prototype._isReadOnlyWhenNotKeyUser = function () {
		if (this.isUserDependent()) {
			return false; // the user always can edit its own changes
		}

		var sReference = this.getDefinition().reference;
		if (!sReference) {
			return true; // without a reference the right to edit or delete a change cannot be determined
		}

		var oSettings = Settings.getInstanceOrUndef();
		if (!oSettings) {
			return true; // without settings the right to edit or delete a change cannot be determined
		}

		return !oSettings.isKeyUser(); // a key user can edit changes
	};

	/**
	 * Returns true if the label is read only. The label might be read only because of the current layer or because the logon language differs from the original language of the change file.
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
	 * @returns {boolean} flag whether the current logon language differs from the original language of the change file
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
	 * Marks the current change to be deleted persistently
	 *
	 * @public
	 */
	Change.prototype.markForDeletion = function () {
		this.setState(Change.states.DELETED);
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
	 * @returns {string} The layer of the change file
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
	 * Sets the component.
	 *
	 * @param {string} sComponent ID of the app or app variant
	 *
	 * @public
	 */
	Change.prototype.setComponent = function (sComponent) {
		this._oDefinition.reference = sComponent;
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
		return this.getState();
	};

	/**
	 * Gets the JSON definition of the change
	 * @returns {object} the content of the change file
	 *
	 * @public
	 */
	Change.prototype.getDefinition = function () {
		return this._oDefinition;
	};

	/**
	 * Set the response from the back end after saving the change
	 * @param {object} oResponse the content of the change file
	 *
	 * @public
	 */
	Change.prototype.setResponse = function (oResponse) {
		var sResponse = JSON.stringify(oResponse);
		if (sResponse) {
			this._oDefinition = JSON.parse(sResponse);
			this.setState(Change.states.PERSISTED);
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
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Modifier for the controls
	 * @param {sap.ui.core.Component} [mPropertyBag.appComponent] - Application component; only needed if <code>vControl</code> is a string or an XML node
	 * @param {object} [mAdditionalSelectorInformation] - Additional mapped data which is added to the selector
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
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Modifier for the controls
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Application component, needed to retrieve the control from the selector
	 * @param {Node} mPropertyBag.view - only for xml processing: the xml node of the view
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
				aDependentControls.push(oModifier.bySelector(oSelector, oAppComponent, mPropertyBag.view));
			});
			return aDependentControls;
		} else {
			return oModifier.bySelector(oDependentSelector, oAppComponent, mPropertyBag.view);
		}
	};

	/**
	 * Returns all dependent global IDs, including the ID from the selector of the change.
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
				if (sId && aDependentIds.indexOf(sId) === -1) {
					aDependentIds.push(sId);
				}
			});

			this._aDependentIdList = aDependentIds;
		}

		return this._aDependentIdList;
	};

	/**
	 * Returns list of IDs of controls which the change depends on, excluding the ID from the selector of the change.
	 *
	 * @param {sap.ui.core.Component} oAppComponent - Application component, needed to create a global ID from the local ID
	 *
	 * @returns {array} List of control IDs which the change depends on
	 *
	 * @public
	 */
	Change.prototype.getDependentControlIdList = function (oAppComponent) {
		var sId;
		var aDependentIds = this.getDependentIdList().concat();

		if (aDependentIds.length > 0) {
			var oSelector = this.getSelector();
			sId = oSelector.id;
			if (oSelector.idIsLocal) {
				sId = oAppComponent.createId(oSelector.id);
			}
			var iIndex = aDependentIds.indexOf(sId);
			if (iIndex > -1) {
				aDependentIds.splice(iIndex, 1);
			}
		}

		return aDependentIds;
	};

	/**
	 * Returns the revert specific data
	 *
	 * @returns {*} revert specific data
	 * @public
	 */
	Change.prototype.getRevertData = function() {
		return this._vRevertData;
	};

	/**
	 * Sets the revert specific data
	 *
	 * @param {*} vData revert specific data
	 * @public
	 */
	Change.prototype.setRevertData = function(vData) {
		this._vRevertData = vData;
	};

	/**
	 * Reset the revert specific data
	 * @public
	 */
	Change.prototype.resetRevertData = function() {
		this.setRevertData(null);
	};

	/**
	 * Returns the undo operations
	 *
	 * @returns {Array<*>} Returns array of undo operations
	 * @public
	 */
	Change.prototype.getUndoOperations = function() {
		return this._aUndoOperations;
	};

	/**
	 * Sets the undo operations
	 *
	 * @param {Array<*>} aData undo operations
	 * @public
	 */
	Change.prototype.setUndoOperations = function(aData) {
		this._aUndoOperations = aData;
	};

	/**
	 * Reset the undo operations
	 * @public
	 */
	Change.prototype.resetUndoOperations = function() {
		this.setUndoOperations(null);
	};

	/**
	 * Creates and returns an instance of change instance
	 *
	 * @param {Object}  [oPropertyBag] property bag
	 * @param {String}  [oPropertyBag.service] name of the OData service
	 * @param {String}  [oPropertyBag.changeType] type of the change
	 * @param {Object}  [oPropertyBag.texts] map object with all referenced texts within the file
	 *                                      these texts will be connected to the translation process
	 * @param {Object}  [oPropertyBag.content] content of the new change
	 * @param {Boolean} [oPropertyBag.isVariant] variant?
	 * @param {String}  [oPropertyBag.packageName] ABAP package name
	 * @param {Object}  [oPropertyBag.selector] name value pair of the attribute and value
	 * @param {String}  [oPropertyBag.id] name/id of the file. if not set implicitly created
	 * @param {Boolean} [oPropertyBag.isVariant] name of the component
	 * @param {Boolean} [oPropertyBag.isUserDependent] true for enduser changes
	 * @param {String}  [oPropertyBag.context] ID of the context
	 * @param {Object}  [oPropertyBag.dependentSelector] List of selectors saved under an alias for creating the dependencies between changes
	 * @param {Object}  [oPropertyBag.validAppVersions] Application versions where the change is active
	 * @param {String}  [oPropertyBag.reference] Application component name
	 * @param {String}  [oPropertyBag.namespace] The namespace of the change file
	 * @param {String}  [oPropertyBag.projectId] The project id of the change file
	 * @param {String}  [oPropertyBag.generator] The tool which is used to generate the change file
	 * @param {Boolean}  [oPropertyBag.jsOnly] The change can only be applied with the JS modifier
	 *
	 * @returns {Object} The content of the change file
	 *
	 * @public
	 */
	Change.createInitialFileContent = function (oPropertyBag) {

		if (!oPropertyBag) {
			oPropertyBag = {};
		}

		var sFileType;
		if (oPropertyBag.fileType) {
			sFileType = oPropertyBag.fileType;
		} else {
			sFileType = oPropertyBag.isVariant ? "variant" : "change";
		}

		var sBaseId = oPropertyBag.reference && oPropertyBag.reference.replace(".Component", "") ||  "";

		var oNewFile = {
			fileName: oPropertyBag.id || Utils.createDefaultFileName(oPropertyBag.changeType),
			fileType: sFileType,
			changeType: oPropertyBag.changeType || "",
			reference: oPropertyBag.reference || "",
			packageName: oPropertyBag.packageName || "",
			content: oPropertyBag.content || {},
			// TODO: Is an empty selector allowed?
			selector: oPropertyBag.selector || {},
			layer: oPropertyBag.layer || Utils.getCurrentLayer(oPropertyBag.isUserDependent),
			texts: oPropertyBag.texts || {},
			namespace: oPropertyBag.namespace || Utils.createNamespace(oPropertyBag, "changes"), //TODO: we need to think of a better way to create namespaces from Adaptation projects.
			projectId: oPropertyBag.projectId || sBaseId,
			creation: "",
			originalLanguage: Utils.getCurrentLanguage(),
			conditions: {},
			context: oPropertyBag.context || "",
			support: {
				generator: oPropertyBag.generator || "Change.createInitialFileContent",
				service: oPropertyBag.service || "",
				user: "",
				sapui5Version: sap.ui.version
			},
			dependentSelector: oPropertyBag.dependentSelector || {},
			validAppVersions: oPropertyBag.validAppVersions || {},
			jsOnly: oPropertyBag.jsOnly || false
		};

		return oNewFile;
	};

	return Change;
}, true);
