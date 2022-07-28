/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/isPlainObject",
	"sap/ui/base/ManagedObject",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/fl/LayerUtils",
	"sap/ui/fl/registry/Settings",
	"sap/base/Log",
	"sap/ui/fl/apply/_internal/appVariant/DescriptorChangeTypes",
	"sap/ui/fl/apply/_internal/flexObjects/States",
	"sap/base/util/includes"
], function (
	isPlainObject,
	ManagedObject,
	Layer,
	Utils,
	LayerUtils,
	Settings,
	Log,
	DescriptorChangeTypes,
	States,
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
		constructor: function(oFile) {
			ManagedObject.apply(this);

			if (!isPlainObject(oFile)) {
				Log.error("Constructor : sap.ui.fl.Change : oFile is not defined");
			}

			this._oDefinition = oFile;
			this._sRequest = '';
			this._bUserDependent = (oFile.layer === Layer.USER);
			this._vRevertData = null;
			this._aUndoOperations = null;
			this._oExtensionPointInfo = null;
			this.setState(Change.states.NEW);
			this._sPreviousState = null;
			this._oChangeProcessedPromise = null;
			this.setInitialApplyState();
			this._oChangeProcessingPromises = {};
		},
		metadata: {
			properties: {
				state: {
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
		NEW: States.NEW,
		PERSISTED: States.PERSISTED,
		DELETED: States.DELETED,
		DIRTY: States.DIRTY
	};

	Change.applyState = {
		INITIAL: 0,
		APPLYING: 1,
		APPLY_FINISHED: 2, // Deprecated
		REVERTING: 3,
		REVERT_FINISHED: 4,
		APPLY_SUCCESSFUL: 5,
		APPLY_FAILED: 6
	};

	Change.operations = {
		APPLY: 0,
		REVERT: 1
	};

	Change.prototype.setState = function(sState) {
		var sCurrentState = this.getState();
		if (sCurrentState !== sState && this._isValidState(sState)) {
			this._sPreviousState = sCurrentState;
			this.setProperty("state", sState);
		}
		return this;
	};

	Change.prototype.setQueuedForRevert = function() {
		if (this._aQueuedProcesses[this._aQueuedProcesses.length - 1] !== Change.operations.REVERT) {
			this._aQueuedProcesses.unshift(Change.operations.REVERT);
		}
	};

	Change.prototype.isQueuedForRevert = function() {
		return this._aQueuedProcesses.indexOf(Change.operations.REVERT) > -1;
	};

	Change.prototype.setQueuedForApply = function() {
		// Not optimized application code can result that the change applying call twice
		// So check if there was already APPLY operation to prevent permanent waitForChangeApplied issue
		// Same apply for setQueuedForRevert
		if (this._aQueuedProcesses[this._aQueuedProcesses.length - 1] !== Change.operations.APPLY) {
			this._aQueuedProcesses.unshift(Change.operations.APPLY);
		}
	};

	Change.prototype.isQueuedForApply = function() {
		return this._aQueuedProcesses.indexOf(Change.operations.APPLY) > -1;
	};

	Change.prototype.setInitialApplyState = function() {
		this._aQueuedProcesses = [];
		delete this._ignoreOnce;
		this.setApplyState(Change.applyState.INITIAL);
		this._oChangeProcessedPromise = {};
		this._oChangeProcessedPromise.promise = new Promise(function(resolve) {
			this._oChangeProcessedPromise.resolveFunction = {
				resolve: resolve
			};
		}.bind(this));
	};

	Change.prototype.isInInitialState = function() {
		return (this._aQueuedProcesses.length === 0) && (this.getApplyState() === Change.applyState.INITIAL);
	};

	Change.prototype.isValidForDependencyMap = function() {
		//Change without id in selector should be skipped from adding dependencies process
		return this.getSelector() && this.getSelector().id;
	};

	Change.prototype.startApplying = function() {
		this.setApplyState(Change.applyState.APPLYING);
	};

	// Deprecated, use markSuccessful or markFailed instead
	Change.prototype.markFinished = function(oResult, bApplySuccessful) {
		this._aQueuedProcesses.pop();
		this._resolveChangeProcessingPromiseWithError(Change.operations.APPLY, oResult);
		var sNewApplyState = bApplySuccessful !== false
			? Change.applyState.APPLY_SUCCESSFUL
			: Change.applyState.APPLY_FAILED;
		this.setApplyState(sNewApplyState);
	};

	Change.prototype.markSuccessful = function(oResult) {
		this.markFinished(oResult, true);
	};

	Change.prototype.markFailed = function(oResult) {
		this.markFinished(oResult, false);
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

	Change.prototype.isSuccessfullyApplied = function() {
		return this.getApplyState() === Change.applyState.APPLY_SUCCESSFUL;
	};

	Change.prototype.hasApplyProcessFailed = function() {
		return this.getApplyState() === Change.applyState.APPLY_FAILED;
	};

	Change.prototype.isApplyProcessFinished = function() {
		return this.isSuccessfullyApplied() || this.hasApplyProcessFailed();
	};

	Change.prototype.hasRevertProcessStarted = function() {
		return this.getApplyState() === Change.applyState.REVERTING;
	};

	Change.prototype.isRevertProcessFinished = function() {
		return this.getApplyState() === Change.applyState.REVERT_FINISHED;
	};

	Change.prototype.isCurrentProcessFinished = function() {
		return this._aQueuedProcesses.length === 0 && this.getApplyState() !== Change.applyState.INITIAL;
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
		if (this.getApplyState() === Change.applyState.INITIAL && this._oChangeProcessedPromise) {
			aReturn.push(this._oChangeProcessedPromise.promise);
		}
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
		if (this._oChangeProcessedPromise) {
			this._oChangeProcessedPromise.resolveFunction.resolve(oResult);
			this._oChangeProcessedPromise = null;
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
	 * Returns if the type of the change is <code>variant</code>.
	 * @returns {boolean} <code>true</code> if the <code>fileType</code> of the change file is a variant
	 *
	 * @public
	 */
	Change.prototype.isVariant = function () {
		return this.getFileType() === "variant";
	};

	/**
	 * Returns the change type.
	 *
	 * @returns {string} Change type of the file, for example <code>LabelChange</code>
	 * @public
	 */
	Change.prototype.getChangeType = function () {
		return this.getDefinition().changeType;
	};

	/**
	 * Returns the file name.
	 *
	 * @returns {string} <code>fileName</code> of the file
	 * @public
	 */
	Change.prototype.getFileName = function () {
		return this.getDefinition().fileName;
	};

	/**
	 * Returns the file type.
	 *
	 * @returns {string} <code>fileType</code> of the file
	 * @public
	 */
	Change.prototype.getFileType = function () {
		return this.getDefinition().fileType;
	};

	/**
	 * Returns the ABAP package name.
	 * @returns {string} ABAP package that the change is assigned to
	 *
	 * @public
	 */
	Change.prototype.getPackage = function () {
		return this.getDefinition().packageName;
	};

	/**
	 * Sets the ABAP package name.
	 *
	 * @param {string} sPackage - Package name
	 *
	 * @public
	 */
	Change.prototype.setPackage = function (sPackage) {
		if (typeof (sPackage) !== "string") {
			Log.error("sap.ui.fl.Change.setPackage : sPackage is not defined");
		}
		this._oDefinition.packageName = sPackage;
	};

	/**
	 * Returns the namespace. The namespace of the change is also the namespace of the change file in the repository.
	 *
	 * @returns {string} Namespace of the change file
	 *
	 * @public
	 */
	Change.prototype.getNamespace = function () {
		return this.getDefinition().namespace;
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
	 * Returns the name of module which this change refers to (XML or JS).
	 *
	 * @returns {string} Module name
	 *
	 * @public
	 */
	Change.prototype.getModuleName = function () {
		return this.getDefinition().moduleName;
	};

	/**
	 * Sets the module name.
	 *
	 * @param {string} sModuleName - Module name of the change file
	 *
	 * @public
	 */
	Change.prototype.setModuleName = function (sModuleName) {
		this._oDefinition.moduleName = sModuleName;
	};

	/**
	 * Returns the project ID of the change. There might be multiple projects adapting a base application. The project ID helps to see where the change is coming from. If no <code>projectIDid</code> is specified, it is the <code>sap.app/id</code>.
	 *
	 * @returns {string} Project ID of the change file
	 *
	 * @public
	 */
	Change.prototype.getProjectId = function () {
		return this.getDefinition().projectId;
	};

	/**
	 * Returns the ID of the change.
	 * @returns {string} ID of the change file
	 *
	 * @public
	 */
	Change.prototype.getId = function () {
		return this.getDefinition().fileName;
	};

	/**
	 * Returns the content section of the change.
	 * @returns {string} Content of the change file. The content structure can be any JSON.
	 *
	 * @public
	 */
	Change.prototype.getContent = function () {
		return this.getDefinition().content;
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
		return this.getDefinition().variantReference || "";
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
		return this.getDefinition().selector;
	};

	Change.prototype.setSelector = function (oSelector) {
		this._oDefinition.selector = oSelector;
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
		if (this.getDefinition().texts) {
			if (this.getDefinition().texts[sTextId]) {
				return this.getDefinition().texts[sTextId].value;
			}
		}
		return "";
	};

	/**
	 * Returns all texts.
	 *
	 * @returns {object} All texts
	 *
	 * @function
	 */
	Change.prototype.getTexts = function () {
		if (isPlainObject(this.getDefinition().texts)) {
			return Object.assign({}, this.getDefinition().texts);
		}
		return this.getDefinition().texts;
	};

	/**
	 * Sets the new text for the given text ID or creates new text with the given ID.
	 *
	 * @param {string} sTextId - Text ID which was used as part of the <code>oTexts</code> object
	 * @param {string} sNewText - New text for the given text ID
	 * @param {string} sType - Translation text type
	 *
	 * @public
	 */
	Change.prototype.setText = function (sTextId, sNewText, sType) {
		if (typeof (sTextId) !== "string") {
			Log.error("sap.ui.fl.Change.setTexts : sTextId is not defined");
			return;
		}
		this._oDefinition.texts = this.getDefinition().texts || {};
		if (this._oDefinition.texts) {
			if (this._oDefinition.texts[sTextId]) {
				this._oDefinition.texts[sTextId].value = sNewText;
			} else {
				this._oDefinition.texts[sTextId] = {
					value: sNewText,
					type: sType
				};
			}
			this.setState(Change.states.DIRTY);
		}
	};

	/**
	 * Returns the OData Information of the change.
	 * oDataInformation.propertyName - Name of the OData property
	 * oDataInformation.entityType - Name of the OData entity type that the property belongs to
	 * oDataInformation.oDataServiceUri - URI of the OData service
	 * @returns {object} OData Information of the change - propertyName, entityType and oDataServiceUri
	 *
	 * @function
	 */
	Change.prototype.getODataInformation = function () {
		return this.getDefinition().oDataInformation;
	};

	/**
	 * Checks if change is read only because of its source system.
	 * @returns {boolean} <code>true</code> if the change is from another system
	 *
	 * @public
	 */
	Change.prototype.isChangeFromOtherSystem = function () {
		var sSourceSystem = this._oDefinition.sourceSystem;
		var sSourceClient = this._oDefinition.sourceClient;
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
	 * Marks the current change to be deleted persistently.
	 *
	 * @public
	 */
	Change.prototype.markForDeletion = function () {
		this.setState(Change.states.DELETED);
	};

	Change.prototype.restorePreviousState = function () {
		if (this._sPreviousState) {
			this.setState(this._sPreviousState);
			delete this._sPreviousState;
		}
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
		return this.getDefinition().layer;
	};

	/**
	 * Gets the component for the change.
	 * @returns {string} SAPUI5 component that this change is assigned to
	 *
	 * @public
	 */
	Change.prototype.getComponent = function () {
		return this.getDefinition().reference;
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
	 * Gets the creation timestamp.
	 *
	 * @returns {string} Creation timestamp
	 *
	 * @public
	 */
	Change.prototype.getCreation = function () {
		return this.getDefinition().creation;
	};

	/**
	 * Sets the creation timestamp.
	 *
	 * @param {string} sCreation creation timestamp
	 *
	 * @public
	 */
	Change.prototype.setCreation = function (sCreation) {
		this._oDefinition.creation = sCreation;
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
	 * Gets the JSON definition of the change.
	 * @returns {object} Content of the change file
	 *
	 * @public
	 */
	Change.prototype.getDefinition = function () {
		return this._oDefinition;
	};

	// temporary function
	Change.prototype.convertToFileContent = function() {
		return this.getDefinition();
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
	 * Returns the 'originalSelector' from the dependent selectors. This is only set in case of changes on a template.
	 *
	 * @returns {sap.ui.fl.selector} the original selector if available
	 */
	Change.prototype.getOriginalSelector = function() {
		return this.getDefinition().dependentSelector && this.getDefinition().dependentSelector.originalSelector;
	};

	/**
	 * Gets the dependent selector.
	 *
	 * @returns {object|undefined} Dependent selector object if available
	 */
	Change.prototype.getDependentSelector = function() {
		return this.getDefinition().dependentSelector;
	};

	/**
	 * Sets the dependent selector.
	 *
	 * @param {object} oDependentSelector Dependent selector
	 */
	Change.prototype.setDependentSelector = function(oDependentSelector) {
		this._oDefinition.dependentSelector = oDependentSelector;
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
			if (this.getDefinition().dependentSelector) {
				Object.keys(this.getDefinition().dependentSelector).some(function(sAlias) {
					// if there is an 'originalSelector' as dependent the change is made inside a template; this means that the
					// dependent selectors point to the specific clones of the template; those clones don't go through the
					// propagation listener and will never be cleaned up from the dependencies, thus blocking the JS Change Applying
					// therefore all the dependents have to be ignored and the dependents reset to the initial state (only selector)
					if (sAlias === "originalSelector") {
						aDependentSelectors = [this.getSelector()];
						return true;
					}
					var aCurrentSelector = that.getDefinition().dependentSelector[sAlias];
					if (!Array.isArray(aCurrentSelector)) {
						aCurrentSelector = [aCurrentSelector];
					}

					aCurrentSelector.forEach(function(oCurrentSelector) {
						if (oCurrentSelector && Utils.indexOfObject(aDependentSelectors, oCurrentSelector) === -1) {
							aDependentSelectors.push(oCurrentSelector);
						}
					});
				}.bind(this));
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
		if (isPlainObject(this._vRevertData)) {
			return Object.assign({}, this._vRevertData);
		}
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
		if (vData === undefined) {
			throw new Error("Change cannot be applied in XML as revert data is not available yet. Retrying in JS.");
		}
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
	 * Gets the extension point information.
	 * @returns {*} Extension point information
	 */
	Change.prototype.getExtensionPointInfo = function() {
		if (isPlainObject(this._oExtensionPointInfo)) {
			return Object.assign({}, this._oExtensionPointInfo);
		}
		return this._oExtensionPointInfo;
	};

	/**
	 * Sets the extension point information.
	 * @param {*} oExtensionPointInfo Extension point information
	 */
	Change.prototype.setExtensionPointInfo = function(oExtensionPointInfo) {
		this._oExtensionPointInfo = oExtensionPointInfo;
	};

	/**
	 * Gets the support information.
	 * @returns {object} Support information
	 */
	Change.prototype.getSupportInformation = function() {
		return Object.assign({}, this._oDefinition.support);
	};

	/**
	 * Sets the support information.
	 * @param {object} oChangeSupportInformation Support information
	 */
	Change.prototype.setSupportInformation = function(oChangeSupportInformation) {
		this._oDefinition.support = oChangeSupportInformation;
	};

	/**
	 * Gets the JSOnly property.
	 * @returns {boolean} True if the change is JSOnly
	 */
	Change.prototype.getJsOnly = function() {
		return this.getDefinition().jsOnly;
	};

	/**
	 * Sets the JSOnly property.
	 * @param {boolean} bJsOnly Value to be set
	 */
	Change.prototype.setJsOnly = function(bJsOnly) {
		this._oDefinition.jsOnly = bJsOnly;
	};

	/**
	 * Returns the appDescriptorChange flag.
	 * @returns {boolean} True if the change is an appDescriptor change
	 */
	Change.prototype.isAppDescriptorChange = function() {
		return this.getDefinition().appDescriptorChange;
	};

	/**
	 * Creates and returns an instance of a change instance.
	 *
	 * @param {object}  [oPropertyBag] - Property bag
	 * @param {string}  [oPropertyBag.service] - Name of the OData service
	 * @param {string}  [oPropertyBag.changeType] - Type of the change
	 * @param {object}  [oPropertyBag.texts] - Map object with all referenced texts within the file; these texts will be connected to the translation process
	 * @param {object}  [oPropertyBag.content] - Content of the new change
	 * @param {boolean} [oPropertyBag.isVariant] - Indicates whether the change is a variant
	 * @param {string}  [oPropertyBag.packageName] - ABAP package name
	 * @param {object}  [oPropertyBag.selector] - Name-value pair of the attribute and value
	 * @param {string}  [oPropertyBag.id] - Name/ID of the file; if it's not set, it's created implicitly
	 * @param {boolean} [oPropertyBag.isVariant] - Name of the component
	 * @param {boolean} [oPropertyBag.isUserDependent] - <code>true</code> in case of end user changes
	 * @param {object}  [oPropertyBag.dependentSelector] - List of selectors saved under an alias for creating the dependencies between changes
	 * @param {string}  [oPropertyBag.reference] - Application component name
	 * @param {string}  [oPropertyBag.namespace] - Namespace of the change file
	 * @param {string}  [oPropertyBag.projectId] - Project ID of the change file
	 * @param {string}  [oPropertyBag.moduleName] - Name of the module which this changes refers to (XML or JS)
	 * @param {string}  [oPropertyBag.generator] - Tool that is used to generate the change file
	 * @param {boolean} [oPropertyBag.jsOnly] - Indicates that the change can only be applied with the JS modifier
	 * @param {object}  [oPropertyBag.oDataInformation] - Object with information about the oData service
	 * @param {string}  [oPropertyBag.oDataInformation.propertyName] - Name of the OData property
	 * @param {string}  [oPropertyBag.oDataInformation.entityType] - Name of the OData entity type that the property belongs to
	 * @param {string}  [oPropertyBag.oDataInformation.oDataServiceUri] - URI of the OData service
	 * @param {string}  [oPropertyBag.variantReference] - Variant reference of a change belonging to a variant
	 * @param {string}  [oPropertyBag.support.sourceChangeFileName] - File name of the source change in case of a copied change
	 * @param {string}  [oPropertyBag.support.compositeCommand] - Unique ID that defines which changes belong together in a composite command
	 *
	 * @returns {object} Content of the change file
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
			layer: oPropertyBag.layer || (oPropertyBag.isUserDependent ? Layer.USER : LayerUtils.getCurrentLayer()),
			texts: oPropertyBag.texts || {},
			namespace: oPropertyBag.namespace || Utils.createNamespace(oPropertyBag, sFileType), //TODO: we need to think of a better way to create namespaces from Adaptation projects.
			projectId: oPropertyBag.projectId || (oPropertyBag.reference && oPropertyBag.reference.replace(".Component", "")) || "",
			creation: "",
			originalLanguage: Utils.getCurrentLanguage() || "",
			support: {
				generator: oPropertyBag.generator || "Change.createInitialFileContent",
				service: oPropertyBag.service || "",
				user: "",
				sapui5Version: sap.ui.version,
				sourceChangeFileName: oPropertyBag.support && oPropertyBag.support.sourceChangeFileName || "",
				compositeCommand: oPropertyBag.support && oPropertyBag.support.compositeCommand || "",
				command: oPropertyBag.command || oPropertyBag.support && oPropertyBag.support.command || ""
			},
			oDataInformation: oPropertyBag.oDataInformation || {},
			dependentSelector: oPropertyBag.dependentSelector || {},
			jsOnly: oPropertyBag.jsOnly || false,
			variantReference: oPropertyBag.variantReference || "",
			// since not all storage implementations know about all app descriptor change types, we store a flag if this change type changes a descriptor
			appDescriptorChange: includes(DescriptorChangeTypes.getChangeTypes(), oPropertyBag.changeType)
		};

		return oNewFile;
	};

	return Change;
}, true);
