/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/base/ManagedObject",
	"sap/ui/fl/Utils",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/registry/Settings",
	"sap/base/Log",
	"sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory",
	"sap/base/util/includes"
], function (
	jQuery,
	ManagedObject,
	Utils,
	LayerUtils,
	Settings,
	Log,
	DescriptorInlineChangeFactory,
	includes
) {
	"use strict";

	/**
	 * Flexibility change class. Stores change content and related information.
	 *
	 * @param {object} oFile - File content and admin data
	 *
	 * @class sap.ui.fl.Change
	 * @extends sap.ui.base.ManagedObject
	 * @private
	 * @ui5-restricted
	 * @experimental Since 1.25.0
	 */
	var Change = ManagedObject.extend("sap.ui.fl.Change", /** @lends sap.ui.fl.Change.prototype */ {
		constructor : function(oFile) {
			ManagedObject.apply(this);

			if (!jQuery.isPlainObject(oFile)) {
				Log.error("Constructor : sap.ui.fl.Change : oFile is not defined");
			}

			this._oDefinition = oFile;
			this._sRequest = '';
			this._bUserDependent = (oFile.layer === "USER");
			this._vRevertData = null;
			this._aUndoOperations = null;
			this.setState(Change.states.NEW);
			this.setModuleName(oFile.moduleName);
			this.setInitialApplyState();
			this._oChangeProcessingPromises = {};
		},
		metadata : {
			properties : {
				state : {
					type: "string"
				},
				moduleName: {
					type: "string"
				},
				/**
				 * Describes the current state of the change regarding the application and reversion of changes.
				 * To change or retrieve the state, use the getters and setters defined in this class.
				 * Initially the state is <code>Change.applyState.INITIAL</code>.
				 */
				applyState: {
					type: "int"
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

	Change.applyState = {
		INITIAL: 0,
		APPLYING: 1,
		APPLY_FINISHED: 2,
		REVERTING: 3,
		REVERT_FINISHED: 4
	};

	Change.operations = {
		APPLY: 0,
		REVERT: 1
	};

	Change.prototype.setState = function(sState) {
		if (this._isValidState(sState)) {
			this.setProperty("state", sState);
		}
		return this;
	};

	Change.prototype.setQueuedForRevert = function() {
		this._aQueuedProcesses.unshift(Change.operations.REVERT);
	};

	Change.prototype.isQueuedForRevert = function() {
		return this._aQueuedProcesses.indexOf(Change.operations.REVERT) > -1;
	};

	Change.prototype.setQueuedForApply = function() {
		this._aQueuedProcesses.unshift(Change.operations.APPLY);
	};

	Change.prototype.isQueuedForApply = function() {
		return this._aQueuedProcesses.indexOf(Change.operations.APPLY) > -1;
	};

	Change.prototype.setInitialApplyState = function() {
		this._aQueuedProcesses = [];
		this.setApplyState(Change.applyState.INITIAL);
	};

	Change.prototype.startApplying = function() {
		this.setApplyState(Change.applyState.APPLYING);
	};

	Change.prototype.markFinished = function(oResult) {
		this._aQueuedProcesses.pop();
		this._resolveChangeProcessingPromiseWithError(Change.operations.APPLY, oResult);
		this.setApplyState(Change.applyState.APPLY_FINISHED);
	};

	Change.prototype.startReverting = function() {
		this.setApplyState(Change.applyState.REVERTING);
	};

	Change.prototype.markRevertFinished = function(oResult) {
		this._aQueuedProcesses.pop();
		this._resolveChangeProcessingPromiseWithError(Change.operations.REVERT, oResult);
		this.setApplyState(Change.applyState.REVERT_FINISHED);
	};

	Change.prototype.hasApplyProcessStarted = function() {
		return this.getApplyState() === Change.applyState.APPLYING;
	};

	Change.prototype.isApplyProcessFinished = function() {
		return this.getApplyState() === Change.applyState.APPLY_FINISHED;
	};

	Change.prototype.hasRevertProcessStarted = function() {
		return this.getApplyState() === Change.applyState.REVERTING;
	};

	Change.prototype.isRevertProcessFinished = function() {
		return this.getApplyState() === Change.applyState.REVERT_FINISHED;
	};

	Change.prototype.isCurrentProcessFinished = function() {
		return this._aQueuedProcesses.length === 0;
	};

	/**
	 * Adds and returns a promise that resolves as soon as
	 * <code>resolveChangeProcessingPromise</code> or <code>resolveChangeProcessingPromiseWithError</code> is called.
	 * The promise will always resolve, either without a parameter or with an object and an <code>error</code> parameter inside.
	 * At any time, there is only one object for 'apply' or 'revert'. If this function is called multiple times for the same key, only the current promise will be returned.
	 *
	 * 	_oChangeProcessingPromises: {
	 * 		Change.operations.APPLY: {
	 * 			promise: <Promise>,
	 * 			resolveFunction: {}
	 * 		},
	 * 		Change.operations.REVERT: {
	 * 			promise: <Promise>,
	 * 			resolveFunction: {}
	 * 		}
	 * 	}
	 *
	 * @param {string} sKey - Current process, should be either <code>Change.operations.APPLY</code> or <code>Change.operations.REVERT</code>
	 * @returns {Promise} Promise
	 */
	Change.prototype.addChangeProcessingPromise = function(sKey) {
		if (!this._oChangeProcessingPromises[sKey]) {
			this._oChangeProcessingPromises[sKey] = {};
			this._oChangeProcessingPromises[sKey].promise = new Promise(function(resolve) {
				this._oChangeProcessingPromises[sKey].resolveFunction = {
					resolve: resolve
				};
			}.bind(this));
		}
		return this._oChangeProcessingPromises[sKey].promise;
	};

	/**
	 * Calls <code>addChangeProcessingPromise</code> for all currently queued processes.
	 *
	 * @returns {Promise[]} Array with all promises for every process
	 */
	Change.prototype.addChangeProcessingPromises = function() {
		var aReturn = [];
		this._aQueuedProcesses.forEach(function(sProcess) {
			aReturn.push(this.addChangeProcessingPromise(sProcess));
		}, this);
		return aReturn;
	};

	Change.prototype.addPromiseForApplyProcessing = function() {
		return this.addChangeProcessingPromise(Change.operations.APPLY);
	};

	Change.prototype._resolveChangeProcessingPromiseWithError = function(sKey, oResult) {
		if (this._oChangeProcessingPromises[sKey]) {
			this._oChangeProcessingPromises[sKey].resolveFunction.resolve(oResult);
			delete this._oChangeProcessingPromises[sKey];
		}
	};

	/**
	 * Validates if the new state of the change has a valid value.
	 * The new state value has to be in the <code>Change.states</code> list.
	 * Moving a state directly from <code>Change.states.NEW</code> to <code>Change.states.DIRTY</code> is not allowed.
	 * @param {string} sState - Value of the target state
	 * @returns {boolean} - <code>true</code> if the new state is valid
	 * @private
	 */
	Change.prototype._isValidState = function(sState) {
		//new state have to be in the Change.states value list
		var bStateFound = false;
		Object.keys(Change.states).some(function(sKey) {
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
	 * Returns if the change is valid
	 * @returns {boolean} <code>true</code> if the change is valid (all mandatory fields are filled, etc.)
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
	 * Returns if the type of the change is <code>variant</code>.
	 * @returns {boolean} <code>true</code> if the <code>fileType</code> of the change file is a variant
	 *
	 * @public
	 */
	Change.prototype.isVariant = function () {
		return this._oDefinition.fileType === "variant";
	};

	/**
	 * Returns the change type.
	 *
	 * @returns {String} Change type of the file, for example <code>LabelChange</code>
	 * @public
	 */
	Change.prototype.getChangeType = function () {
		if (this._oDefinition) {
			return this._oDefinition.changeType;
		}
	};

	/**
	 * Returns the file name.
	 *
	 * @returns {String} <code>fileName</code> of the file
	 * @public
	 */
	Change.prototype.getFileName = function () {
		if (this._oDefinition) {
			return this._oDefinition.fileName;
		}
	};

	/**
	 * Returns the file type.
	 *
	 * @returns {String} <code>fileType</code> of the file
	 * @public
	 */
	Change.prototype.getFileType = function () {
		if (this._oDefinition) {
			return this._oDefinition.fileType;
		}
	};

	/**
	 * Returns the original language in ISO 639-1 format.
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
	 * Returns the context in which the change should be applied.
	 *
	 * @returns {Object[]} context - List of objects to determine the context
	 * @returns {string} selector  - Key of the context
	 * @returns {string} operator - Instructions on how the values should be compared
	 * @returns {Object} value - Values given for comparison
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
	 * Returns the ABAP package name.
	 * @returns {string} ABAP package that the change is assigned to
	 *
	 * @public
	 */
	Change.prototype.getPackage = function () {
		return this._oDefinition.packageName;
	};

	/**
	 * Returns the namespace. The namespace of the change is also the namespace of the change file in the repository.
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
	 * @param {string} sNamespace - Namespace of the change file
	 *
	 * @public
	 */
	Change.prototype.setNamespace = function (sNamespace) {
		this._oDefinition.namespace = sNamespace;
	};

	/**
	 * Returns the project ID of the change. There might be multiple projects adapting a base application. The project ID helps to see where the change is coming from. If no <code>projectIDid</code> is specified, it is the <code>sap.app/id</code>.
	 *
	 * @returns {String} Project ID of the change file
	 *
	 * @public
	 */
	Change.prototype.getProjectId = function () {
		return this._oDefinition.projectId;
	};

	/**
	 * Sets the project ID.
	 *
	 * @param {string} sProjectId - Project ID of the change file
	 *
	 * @public
	 */
	Change.prototype.setProjectId = function (sProjectId) {
		this._oDefinition.projectId = sProjectId;
	};

	/**
	 * Returns the ID of the change.
	 * @returns {string} ID of the change file
	 *
	 * @public
	 */
	Change.prototype.getId = function () {
		return this._oDefinition.fileName;
	};

	/**
	 * Returns the content section of the change.
	 * @returns {string} Content of the change file. The content structure can be any JSON.
	 *
	 * @public
	 */
	Change.prototype.getContent = function () {
		return this._oDefinition.content;
	};

	/**
	 * Sets the object of the content attribute.
	 *
	 * @param {object} oContent - Content of the change file. Can be any JSON object.
	 *
	 * @public
	 */
	Change.prototype.setContent = function (oContent) {
		this._oDefinition.content = oContent;
		this.setState(Change.states.DIRTY);
	};

	/**
	 * Returns the variant reference of the change.
	 * @returns {string} Variant reference of the change.
	 *
	 * @public
	 */
	Change.prototype.getVariantReference = function () {
		return this._oDefinition.variantReference || "";
	};

	/**
	 * Sets the variant reference of the change.
	 *
	 * @param {object} sVariantReference - Variant reference of the change
	 *
	 * @public
	 */
	Change.prototype.setVariantReference = function (sVariantReference) {
		this._oDefinition.variantReference = sVariantReference;
		this.setState(Change.states.DIRTY);
	};

	/**
	 * Returns the selector from the file content.
	 * @returns {object} Selector in the following format <code>selectorPropertyName:selectorPropertyValue</code>
	 *
	 * @public
	 */
	Change.prototype.getSelector = function () {
		return this._oDefinition.selector;
	};

	/**
	 * Returns the source system of the change.
	 *
	 * @returns {String} Source system of the change file
	 *
	 * @public
	 */
	Change.prototype.getSourceSystem = function () {
		return this._oDefinition.sourceSystem;
	};

	/**
	 * Returns the source client of the change.
	 *
	 * @returns {String} Source client of the change file
	 *
	 * @public
	 */
	Change.prototype.getSourceClient = function () {
		return this._oDefinition.sourceClient;
	};

	/**
	 * Returns the user ID of the owner.
	 * @returns {string} ID of the owner
	 *
	 * @public
	 */
	Change.prototype.getOwnerId = function () {
		return this._oDefinition.support ? this._oDefinition.support.user : "";
	};

	/**
	 * Returns the text in the current language for a given ID.
	 *
	 * @param {string} sTextId - Text ID which was used as part of the <code>oTexts</code> object
	 * @returns {string} The text for the given text ID
	 *
	 * @function
	 */
	Change.prototype.getText = function (sTextId) {
		if (typeof (sTextId) !== "string") {
			Log.error("sap.ui.fl.Change.getTexts : sTextId is not defined");
		}
		if (this._oDefinition.texts) {
			if (this._oDefinition.texts[sTextId]) {
				return this._oDefinition.texts[sTextId].value;
			}
		}
		return "";
	};

	/**
	 * Sets the new text for the given text ID.
	 *
	 * @param {string} sTextId - Text ID which was used as part of the <code>oTexts</code> object
	 * @param {string} sNewText - New text for the given text ID
	 *
	 * @public
	 */
	Change.prototype.setText = function (sTextId, sNewText) {
		if (typeof (sTextId) !== "string") {
			Log.error("sap.ui.fl.Change.setTexts : sTextId is not defined");
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
	 * Returns <code>true</code> if the current layer is the same as the layer in which the change was created, or if the change is from the end-user layer and was ceated for this user.
	 * @returns {boolean} <code>true</code> if the change file is read only
	 *
	 * @public
	 */
	Change.prototype.isReadOnly = function () {
		return this._isReadOnlyDueToLayer() || this._isReadOnlyWhenNotKeyUser() || this.isChangeFromOtherSystem();
	};

	/**
	 * Checks if the change is read only, because the current user is not a key user and the change is "shared".
	 * @returns {boolean} <code>true</code> if the change is read only
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
		// a key user can edit changes
		return !oSettings.isKeyUser();
	};

	/**
	 * Returns <code>true</code> if the label is read only. The label might be read only because of the current layer or because the logon language differs from the original language of the change file.
	 *
	 * @returns {boolean} <code>true</code> if the label is read only
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
	 * Checks if the layer allows modifying the file.
	 * @returns {boolean} <code>true</code> if the change is read only
	 *
	 * @private
	 */
	Change.prototype._isReadOnlyDueToLayer = function () {
		var sCurrentLayer;
		sCurrentLayer = LayerUtils.getCurrentLayer(this._bUserDependent);
		return (this._oDefinition.layer !== sCurrentLayer);
	};

	/**
	 * Checks if change is read only because of its source system.
	 * @returns {boolean} <code>true</code> if the change is from another system
	 *
	 * @public
	 */
	Change.prototype.isChangeFromOtherSystem = function () {
		var sSourceSystem = this.getSourceSystem();
		var sSourceClient = this.getSourceClient();
		if (!sSourceSystem || !sSourceClient) {
			return false;
		}
		var oSettings = Settings.getInstanceOrUndef();
		if (!oSettings) {
			return true; // without settings the right to edit or delete a change cannot be determined
		}
		var sSystem = oSettings.getSystem();
		var sClient = oSettings.getClient();
		if (!sSystem || !sClient) {
			return false;
		}
		return (sSourceSystem !== sSystem || sSourceClient !== sClient);
	};

	/**
	 * A change can only be modified if the current language equals the original language.
	 * Returns <code>false</code> if the current language does not equal the original language of the change file.
	 * Returns <code>false</code> if the original language is initial.
	 *
	 * @returns {boolean} <code>true</code> if the current logon language equals the original language of the change file
	 *
	 * @private
	 */
	Change.prototype._isReadOnlyDueToOriginalLanguage = function () {
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
	 * Marks the current change to be deleted persistently.
	 *
	 * @public
	 */
	Change.prototype.markForDeletion = function () {
		this.setState(Change.states.DELETED);
	};

	/**
	 * Sets the transport request.
	 *
	 * @param {string} sRequest - Transport request
	 *
	 * @public
	 */
	Change.prototype.setRequest = function (sRequest) {
		if (typeof (sRequest) !== "string") {
			Log.error("sap.ui.fl.Change.setRequest : sRequest is not defined");
		}
		this._sRequest = sRequest;
	};

	/**
	 * Gets the transport request.
	 * @returns {string} Transport request
	 *
	 * @public
	 */
	Change.prototype.getRequest = function () {
		return this._sRequest;
	};

	/**
	 * Gets the layer type for the change.
	 * @returns {string} Layer of the change file
	 *
	 * @public
	 */
	Change.prototype.getLayer = function () {
		return this._oDefinition.layer;
	};

	/**
	 * Gets the component for the change.
	 * @returns {string} SAPUI5 component that this change is assigned to
	 *
	 * @public
	 */
	Change.prototype.getComponent = function () {
		return this._oDefinition.reference;
	};

	/**
	 * Sets the component.
	 *
	 * @param {string} sComponent - ID of the app or app variant
	 *
	 * @public
	 */
	Change.prototype.setComponent = function (sComponent) {
		this._oDefinition.reference = sComponent;
	};

	/**
	 * Sets valid app versions for an app(variant).
	 *
	 * @param {string} mValidAppVersions - Object with parameters as properties
	 * @param {string} mValidAppVersions.creation - Creation app(variant) version
	 * @param {string} mValidAppVersions.from - From app(variant) version
	 * @param {string} [mValidAppVersions.to] - To app(variant) version
	 * @public
	 */
	Change.prototype.setValidAppVersions = function (mValidAppVersions) {
		this._oDefinition.validAppVersions = mValidAppVersions;
	};

	/**
	 * Gets the creation timestamp.
	 *
	 * @returns {String} Creation timestamp
	 *
	 * @public
	 */
	Change.prototype.getCreation = function () {
		return this._oDefinition.creation;
	};

	/**
	 * Returns <code>true</code> if the change is user dependent
	 * @returns {boolean} <code>true</code> if the change is only relevant for the current user
	 *
	 * @public
	 */
	Change.prototype.isUserDependent = function () {
		return (this._bUserDependent);
	};

	/**
	 * Returns the pending action on the change item.
	 * @returns {string} One of the following values: DELETE/NEW/UPDATE/NONE
	 *
	 * @public
	 */
	Change.prototype.getPendingAction = function () {
		return this.getState();
	};

	/**
	 * Gets the JSON definition of the change.
	 * @returns {object} Content of the change file
	 *
	 * @public
	 */
	Change.prototype.getDefinition = function () {
		return this._oDefinition;
	};

	/**
	 * Sets the response from the back end after the change is saved.
	 * @param {object} oResponse - Content of the change file
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
	 * @param {(string|sap.ui.core.Control|string[]|sap.ui.core.Control[])} vControl - SAPUI5 control, or ID string, or array of SAPUI5 controls, for which the selector should be determined
	 * @param {string} sAlias - Alias under which the dependent object is saved
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Modifier for the controls
	 * @param {sap.ui.core.Component} [mPropertyBag.appComponent] - Application component; only needed if <code>vControl</code> is a string or an XML node
	 * @param {object} [mAdditionalSelectorInformation] - Additional mapped data which is added to the selector
	 *
	 * @throws {Exception} oException If <code>sAlias</code> already exists
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

		//remove dependency list so that it will be created again in method getDependentSelectorList
		delete this._aDependentSelectorList;
	};

	/**
	 * Returns the control or array of controls saved under the passed alias.
	 *
	 * @param {string} sAlias - Retrieves the selectors that have been saved under this alias
	 * @param {object} mPropertyBag - Property bag
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Modifier for the controls
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Application component needed to retrieve the control from the selector
	 * @param {Node} mPropertyBag.view - For XML processing: XML node of the view
	 *
	 * @returns {array|object} Dependent selector list in <code>selectorPropertyName:selectorPropertyValue</code> format, or the selector saved under the alias
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
		}

		return oModifier.bySelector(oDependentSelector, oAppComponent, mPropertyBag.view);
	};

	/**
	 * Returns all dependent selectors, including the selector from the selector of the change.
	 *
	 * @returns {array} Dependent selector list
	 * @public
	 */
	Change.prototype.getDependentSelectorList = function () {
		var that = this;
		var aDependentSelectors = [this.getSelector()];

		if (!this._aDependentSelectorList) {
			if (this._oDefinition.dependentSelector) {
				Object.keys(this._oDefinition.dependentSelector).forEach(function(sAlias) {
					var aCurrentSelector = that._oDefinition.dependentSelector[sAlias];
					if (!Array.isArray(aCurrentSelector)) {
						aCurrentSelector = [aCurrentSelector];
					}

					aCurrentSelector.forEach(function(oCurrentSelector) {
						if (oCurrentSelector && Utils.indexOfObject(aDependentSelectors, oCurrentSelector) === -1) {
							aDependentSelectors.push(oCurrentSelector);
						}
					});
				});
			}
			this._aDependentSelectorList = aDependentSelectors;
		}

		return this._aDependentSelectorList;
	};

	/**
	 * Returns a list of selectors of the controls that the change depends on, excluding the selector of the change.
	 *
	 * @returns {array} List of selectors that the change depends on
	 * @public
	 */
	Change.prototype.getDependentControlSelectorList = function () {
		var aDependentSelectors = this.getDependentSelectorList().concat();

		if (aDependentSelectors.length > 0) {
			var oSelector = this.getSelector();
			var iIndex = Utils.indexOfObject(aDependentSelectors, oSelector);
			if (iIndex > -1) {
				aDependentSelectors.splice(iIndex, 1);
			}
		}

		return aDependentSelectors;
	};

	/**
	 * Returns the revert-specific data.
	 *
	 * @returns {*} Revert-specific data
	 * @public
	 */
	Change.prototype.getRevertData = function() {
		return this._vRevertData;
	};

	/**
	 * Checks if the change has revert data and returns a boolean;
	 * For falsy revert data also true is returned.
	 *
	 * @returns {boolean} Returns wheather the change has revert data
	 */
	Change.prototype.hasRevertData = function() {
		return this._vRevertData !== null;
	};

	/**
	 * Sets the revert-specific data.
	 *
	 * @param {*} vData - Revert-specific data
	 * @public
	 */
	Change.prototype.setRevertData = function(vData) {
		this._vRevertData = vData;
	};

	/**
	 * Resets the revert-specific data.
	 * @public
	 */
	Change.prototype.resetRevertData = function() {
		this.setRevertData(null);
	};

	/**
	 * Returns the undo operations.
	 *
	 * @returns {Array<*>} Array of undo operations
	 * @public
	 */
	Change.prototype.getUndoOperations = function() {
		return this._aUndoOperations;
	};

	/**
	 * Sets the undo operations.
	 *
	 * @param {Array<*>} aData - Undo operations
	 * @public
	 */
	Change.prototype.setUndoOperations = function(aData) {
		this._aUndoOperations = aData;
	};

	/**
	 * Resets the undo operations
	 * @public
	 */
	Change.prototype.resetUndoOperations = function() {
		this.setUndoOperations(null);
	};

	/**
	 * Creates and returns an instance of a change instance.
	 *
	 * @param {Object}  [oPropertyBag] - Property bag
	 * @param {String}  [oPropertyBag.service] - Name of the OData service
	 * @param {String}  [oPropertyBag.changeType] - Type of the change
	 * @param {Object}  [oPropertyBag.texts] - Map object with all referenced texts within the file; these texts will be connected to the translation process
	 * @param {Object}  [oPropertyBag.content] - Content of the new change
	 * @param {Boolean} [oPropertyBag.isVariant] - Indicates whether the change is a variant
	 * @param {String}  [oPropertyBag.packageName] - ABAP package name
	 * @param {Object}  [oPropertyBag.selector] - Name-value pair of the attribute and value
	 * @param {String}  [oPropertyBag.id] - Name/ID of the file; if it's not set, it's created implicitly
	 * @param {Boolean} [oPropertyBag.isVariant] - Name of the component
	 * @param {Boolean} [oPropertyBag.isUserDependent] - <code>true</code> in case of end user changes
	 * @param {String}  [oPropertyBag.context] - ID of the context
	 * @param {Object}  [oPropertyBag.dependentSelector] - List of selectors saved under an alias for creating the dependencies between changes
	 * @param {Object}  [oPropertyBag.validAppVersions] - Application versions where the change is active
	 * @param {String}  [oPropertyBag.reference] - Application component name
	 * @param {String}  [oPropertyBag.namespace] - Namespace of the change file
	 * @param {String}  [oPropertyBag.projectId] - Project ID of the change file
	 * @param {String}  [oPropertyBag.moduleName] - Name of the module which this changes refers to (XML or JS)
	 * @param {String}  [oPropertyBag.generator] - Tool that is used to generate the change file
	 * @param {Boolean}  [oPropertyBag.jsOnly] - Indicates that the change can only be applied with the JS modifier
	 * @param {Object}  [oPropertyBag.oDataInformation] - Object with information about the oData service
	 * @param {String}  [oPropertyBag.oDataInformation.propertyName] - Name of the OData property
	 * @param {String}  [oPropertyBag.oDataInformation.entityType] - Name of the OData entity type that the property belongs to
	 * @param {String}  [oPropertyBag.oDataInformation.oDataServiceUri] - URI of the OData service
	 * @param {String}  [oPropertyBag.variantReference] - Variant reference of a change belonging to a variant
	 * @param {String}  [oPropertyBag.support.sourceChangeFileName] - File name of the source change in case of a copied change
	 * @param {String}  [oPropertyBag.support.compositeCommand] - Unique ID that defines which changes belong together in a composite command
	 *
	 * @returns {Object} Content of the change file
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

		var oNewFile = {
			fileName: oPropertyBag.id || Utils.createDefaultFileName(oPropertyBag.changeType),
			fileType: sFileType,
			changeType: oPropertyBag.changeType || "",
			moduleName: oPropertyBag.moduleName || "",
			reference: oPropertyBag.reference || "",
			packageName: oPropertyBag.packageName || "",
			content: oPropertyBag.content || {},
			// TODO: Is an empty selector allowed?
			selector: oPropertyBag.selector || { id: "" },
			layer: oPropertyBag.layer || LayerUtils.getCurrentLayer(oPropertyBag.isUserDependent),
			texts: oPropertyBag.texts || {},
			namespace: oPropertyBag.namespace || Utils.createNamespace(oPropertyBag, "changes"), //TODO: we need to think of a better way to create namespaces from Adaptation projects.
			projectId: oPropertyBag.projectId || (oPropertyBag.reference && oPropertyBag.reference.replace(".Component", "")) || "",
			creation: "",
			originalLanguage: Utils.getCurrentLanguage(),
			conditions: {},
			context: oPropertyBag.context || "",
			support: {
				generator: oPropertyBag.generator || "Change.createInitialFileContent",
				service: oPropertyBag.service || "",
				user: "",
				sapui5Version: sap.ui.version,
				sourceChangeFileName: oPropertyBag.support && oPropertyBag.support.sourceChangeFileName || "",
				compositeCommand: oPropertyBag.support && oPropertyBag.support.compositeCommand || ""
			},
			oDataInformation: oPropertyBag.oDataInformation || {},
			dependentSelector: oPropertyBag.dependentSelector || {},
			validAppVersions: oPropertyBag.validAppVersions || {},
			jsOnly: oPropertyBag.jsOnly || false,
			variantReference: oPropertyBag.variantReference || "",
			// since not all storage implementations know about all app descriptor change types, we store a flag if this change type changes a descriptor
			appDescriptorChange: includes(DescriptorInlineChangeFactory.getDescriptorChangeTypes(), oPropertyBag.changeType)
		};

		return oNewFile;
	};

	return Change;
}, true);
