/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Change", "sap/ui/fl/DefaultVariant",  "sap/ui/fl/StandardVariant", "sap/ui/fl/Utils", "jquery.sap.global", "sap/ui/fl/LrepConnector", "sap/ui/fl/Cache", "sap/ui/fl/registry/Settings"
], function(Change, defaultVariant, standardVariant, Utils, $, LRepConnector, Cache, Settings) {

	"use strict";
	/**
	 * Helper object to access a change from the back end. Access helper object for each change (and variant) which was fetched from the back end
	 *
	 * @constructor
	 * @param {sap.ui.core.Control} oControl - the control for which the changes should be fetched
	 * @param {string} [sStableIdPropertyName='id'] the stable id
	 * @alias sap.ui.fl.Persistence
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.25.0
	 */
	var Persistence = function(oControl, sStableIdPropertyName) {
		this._oControl = oControl;
		this._bHasLoadedChangesFromBackEnd = false;

		this._sStableIdPropertyName = sStableIdPropertyName || 'id';
		this._sStableId = this._getStableId();

		this._sComponentName = Utils.getComponentClassName(oControl);
		if (!this._sComponentName) {
			Utils.log.error("The Control does not belong to an SAPUI5 component. Variants and Changes for this control might not work as expected.");
		}
		this._oAppDescriptor = Utils.getAppDescriptor(oControl);
		this._sAppVersion = Utils.getAppVersionFromManifest(this._oAppDescriptor);
		this._sSiteId = Utils.getSiteId(oControl);

		this._oChanges = {};
		this._oMessagebundle = {};

		this._oConnector = this._createLrepConnector();
	};

	/**
	 * Return the name of the SAPUI5 component. All changes are assigned to 1 SAPUI5 component. The SAPUI5 component also serves as authorization
	 * object.
	 *
	 * @returns {String} component name
	 * @public
	 */
	Persistence.prototype.getComponentName = function() {
		return this._sComponentName;
	};

	/**
	 * Return the name of the SAPUI5 component. All changes are assigned to 1 SAPUI5 component. The SAPUI5 component also serves as authorization
	 * object.
	 *
	 * @param {string} sComponentName The name of the component
	 * @public
	 */
	Persistence.prototype.setComponentName = function(sComponentName) {
		this._sComponentName = sComponentName;
	};

	/**
	 * Creates a new instance of the LRepConnector
	 *
	 * @returns {sap.ui.fl.LrepConnector} LRep connector instance
	 * @private
	 */
	Persistence.prototype._createLrepConnector = function() {
		var sXsrfToken, mParams;
		sXsrfToken = Utils.getXSRFTokenFromControl(this._oControl);
		mParams = {
			XsrfToken: sXsrfToken
		};
		return LRepConnector.createConnector(mParams);
	};

	/**
	 * Determines the value of the stable id property of the control
	 *
	 * @returns {String} Stable Id. Empty string if stable id determination failed
	 * @private
	 */
	Persistence.prototype._getStableId = function() {
		if (!this._oControl) {
			return undefined;
		}

		if ((this._sStableIdPropertyName) && (this._sStableIdPropertyName !== 'id')) {
			var sStableId;
			try {
				sStableId = this._oControl.getProperty(this._sStableIdPropertyName);
			} catch (exception) {
				sStableId = "";
			}
			return sStableId;
		}

		if (typeof this._oControl.getId !== 'function') {
			return undefined;
		}

		return this._oControl.getId();
	};

	/**
	 * Checks for the existance of a variant within the vendor layer
	 *
	 * @returns {boolean} bExistChangeInVendorLayer
	 * @private
	 */
	Persistence.prototype._existVendorLayerChange = function() {
		var bExistChangeInVendorLayer = false;

		jQuery.each(this._oChanges, function(sChangeKey, oChange) {
			var oOriginDefinition = oChange._oOriginDefinition;
			if (oOriginDefinition.layer === "VENDOR") {
				bExistChangeInVendorLayer = true;
				return false; // break foreach;
			}
		});

		return bExistChangeInVendorLayer;
	};

	/**
	 * Searches for the ower (sap.ui.Component) of passed control
	 *
	 * @param {object} oControl a ui5Control
	 * @returns {sap.ui.Component} oOwnerComponent
	 * @private
	 */
	Persistence.prototype._getOwnerComponentOfControl = function(oControl) {
		if (!oControl) {
			return undefined;
		}

		var sOwnerId = sap.ui.core.Component.getOwnerIdFor(oControl);
		if (sOwnerId) {
			var oOwnerComponent = sap.ui.component(sOwnerId);
			return oOwnerComponent;
		}

		return this._getOwnerComponentOfControl(oControl.getParent());
	};

	/**
	 * Binds a json model to the component the first time a variant within the vendor layer was detected
	 *
	 * @private
	 */
	Persistence.prototype._checkForMessagebundleBinding = function() {
		if (this._existVendorLayerChange()) {
			var oOwner = this._getOwnerComponentOfControl(this._oControl);

			if (oOwner && !oOwner.getModel("i18nFlexVendor")) {
				var oModel = new sap.ui.model.json.JSONModel(this._oMessagebundle);
				oOwner.setModel(oModel, "i18nFlexVendor");
			}
		}
	};

	/**
	 * Calls the back end asynchronously and fetches all changes and variants in the same component pointing to this control.
	 *
	 * @see sap.ui.fl.Change
	 * @returns {Promise} with parameter <code>aResults</code> which is a map with key changeId and value instance of sap.ui.fl.Change
	 * @public
	 */
	Persistence.prototype.getChanges = function() {
		var that = this;
		var mPropertyBag = {
			appDescriptor: this._oAppDescriptor,
			siteId: this._sSiteId
		};

		if (this._bHasLoadedChangesFromBackEnd === true) {
			if (this._oMessagebundle) {
				this._checkForMessagebundleBinding();
			}
			return Promise.resolve(this._oChanges);
		}
		return Cache.getChangesFillingCache(this._oConnector, {name : this._sComponentName, appVersion: this._sAppVersion}, mPropertyBag).then(that._resolveFillingCacheWithChanges.bind(that));
	};

	/**
	 * Intern method of 'getChanges' to handle the resolution of the deferred returned from 'Cache.getChangesFillingCache'.
	 *
	 * @returns {object} this._oChanges relevant changes filled by internal processing
	 * @private
	 */
	Persistence.prototype._resolveFillingCacheWithChanges = function(oFile) {
		this._fillRelevantChanges(oFile);
        if (oFile.changes && oFile.changes.settings){
            Settings._storeInstance(oFile.changes.settings);
        }
		if (oFile && oFile.changes && oFile.changes.messagebundle) {
			this._oMessagebundle = oFile.changes.messagebundle;
			this._checkForMessagebundleBinding();
		}
		this._bHasLoadedChangesFromBackEnd = true;
		return this._oChanges;
	};

	/**
	 * Calls the back end asynchronously and fetches all changes and variants of the current component.
	 *
	 * @see sap.ui.fl.Change
	 * @returns {Promise} with parameter <code>aResults</code> which is a map with key changeId and value instance of sap.ui.fl.Change
	 * @public
	 */
	Persistence.prototype.getComponentChanges = function() {
		var that = this;
		var mPropertyBag = {
			appDescriptor: this._oAppDescriptor,
			siteId: this._sSiteId
		};
		return Cache.getChangesFillingCache(this._oConnector, {name : this._sComponentName, appVersion: this._sAppVersion}, mPropertyBag).then(function(oFile) {
			var bNoFilter = true;
			that._fillRelevantChanges(oFile, bNoFilter);
			return that._oChanges;
		});
	};

	/**
	 * Fill the map of <code>sap.ui.fl.Change</code> with all relevant changes
	 *
	 * @param {object} oFile content of Component-changes.json file
	 * @param {boolean} bNoFilter do not filter on stable ID
	 * @see sap.ui.fl.Change
	 * @private
	 */
	Persistence.prototype._fillRelevantChanges = function(oFile, bNoFilter) {
		var aChangeList, len, oChangeContent, oSelector, oChange, j, sChangeId;
		var that = this;

		var fLogError = function(key, text) {
			Utils.log.error("key : " + key + " and text : " + text.value);
		};

		var fAppendValidChanges = function(id, value) {
			// when filtering set to inactive: add all changes but still filter variants
			if (bNoFilter === true && oChangeContent.fileType === 'change' || that._sStableId === value) {
				oChange = new Change(oChangeContent);
				oChange.attachEvent(Change.events.markForDeletion, that._onDeleteChange.bind(that));
				oChange.setState(Change.states.PERSISTED);
				sChangeId = oChange.getId();
				if (oChange.isValid()) {
					if (that._oChanges[sChangeId] && oChange.isVariant()) {
						Utils.log.error("Id collision - two or more variant files having the same id detected: " + sChangeId);
						jQuery.each(oChange.getDefinition().texts, fLogError);
						Utils.log.error("already exists in variant : ");
						jQuery.each(that._oChanges[sChangeId].getDefinition().texts, fLogError);
					}

					that._oChanges[sChangeId] = oChange;
				}
				return false;
			}
		};

		if (oFile && oFile.changes && oFile.changes.changes) {
			aChangeList = oFile.changes.changes;
			len = aChangeList.length;
			for (j = 0; j < len; j++) {
				//filter out user changes and variants when no personalization was triggered
				if (!Utils.isOverMaxLayer(aChangeList[j].layer)){
					oChangeContent = aChangeList[j];
					oSelector = oChangeContent.selector;
					if (oSelector) {
						// filter out only controls of the current
						jQuery.each(oSelector, fAppendValidChanges);
					}
				}
			}
		}
	};

	/**
	 * Returns the change for the provided id.
	 *
	 * @see sap.ui.fl.Change
	 * @param {string} sChangeId - the id of the change to get
	 * @returns {sap.ui.fl.Change} the found change
	 * @public
	 */
	Persistence.prototype.getChange = function(sChangeId) {
		if (!sChangeId) {
			Utils.log.error("sap.ui.fl.Persistence.getChange : sChangeId is not defined");
			return undefined;
		}

		return this._oChanges[sChangeId];
	};

	/**
	 * Adds a new change (could be variant as well) and returns the id of the new change.
	 *
	 * @param {object} mParameters map of parameters, see below
	 * @param {string} mParameters.type - type <filterVariant, tableVariant, etc>
	 * @param {string} mParameters.ODataService - name of the OData service --> can be null
	 * @param {object} mParameters.texts - map object with all referenced texts within the file these texts will be connected to the translation
	 *        process
	 * @param {object} mParameters.content - content of the new change
	 * @param {boolean} mParameters.isVariant - indicates if the change is a variant
	 * @param {string} mParameters.packageName - <optional> package name for the new entity <default> is $tmp
	 * @param {boolean} mParameters.isUserDependent - indicates if a change is only valid for the current user
	 * @param {boolean} [mParameters.id] - id of the change. The id has to be globally unique and should only be set in exceptional cases for example
	 *        downport of variants
	 * @returns {string} the ID of the newly created change
	 * @public
	 */
	Persistence.prototype.addChange = function(mParameters) {
		var oFile, oInfo, mInternalTexts, oChange;

		if (!mParameters) {
			return undefined;
		}
		if (!mParameters.type) {
			Utils.log.error("sap.ui.fl.Persistence.addChange : type is not defined");
		}
		//if (!mParameters.ODataService) {
		//	Utils.log.error("sap.ui.fl.Persistence.addChange : ODataService is not defined");
		//}
		var sContentType = jQuery.type(mParameters.content);
		if (sContentType !== 'object' && sContentType !== 'array') {
			Utils.log.error("mParameters.content is not of expected type object or array, but is: " + sContentType, "sap.ui.fl.Persistence#addChange");
		}
		// convert the text object to the internal structure
		mInternalTexts = {};
		if (typeof (mParameters.texts) === "object") {
			jQuery.each(mParameters.texts, function(id, text) {
				mInternalTexts[id] = {
					value: text,
					type: "XFLD"
				};
			});
		}

		var oValidAppVersions = {
			creation: this._sAppVersion,
			from: this._sAppVersion
		};
		if (this._sAppVersion && mParameters.developerMode) {
			oValidAppVersions.to = this._sAppVersion;
		}

		oInfo = {
			changeType: mParameters.type,
			service: mParameters.ODataService,
			texts: mInternalTexts,
			content: mParameters.content,
			reference: this._sComponentName, //in this case the component name can also be the value of sap-app-id
			isVariant: mParameters.isVariant,
			packageName: mParameters.packageName,
			isUserDependent: mParameters.isUserDependent,
			validAppVersions: oValidAppVersions
		};

		oInfo.selector = this._getSelector();
		oFile = Change.createInitialFileContent(oInfo);

		// If id is provided, overwrite generated id
		if (mParameters.id) {
			oFile.fileName = mParameters.id;
		}

		oChange = this.addChangeFile(oFile);
		return oChange.getId();
	};

	/**
	 * Adds a new change (could be variant as well) and returns the id of the new change.
	 *
	 * @param {object} oChangeFile The complete and finalized JSON object representation the file content of the change
	 * @returns {sap.ui.fl.Change} the newly created change object
	 * @public
	 */
	Persistence.prototype.addChangeFile = function(oChangeFile) {
		var oChange, sChangeId;

		oChange = new Change(oChangeFile);
		oChange.attachEvent(Change.events.markForDeletion, this._onDeleteChange.bind(this));

		sChangeId = oChange.getId();
		this._oChanges[sChangeId] = oChange;
		return oChange;
	};

	Persistence.prototype.removeChangeFromPersistence = function(oChange) {
		if (oChange.getPendingAction() !== 'NEW') {
			return;
		}

		var sChangeToRemoveId = oChange.getId();
		delete this._oChanges[sChangeToRemoveId];
	};

	/**
	 * Puts an existing change into the persistence.
	 *
	 * @param {sap.ui.fl.Change} oChange object
	 * @public
	 */
	Persistence.prototype.putChange = function(oChange) {
		oChange.attachEvent(Change.events.markForDeletion, this._onDeleteChange.bind(this));
		var sChangeId = oChange.getId();
		this._oChanges[sChangeId] = oChange;
	};

	/**
	 * Returns a selector filled with the stableIdPropertyName and its value.
	 *
	 * @returns {Object} selector
	 * @private
	 */
	Persistence.prototype._getSelector = function() {
		var mSelector;
		mSelector = {};
		if (this._sStableIdPropertyName) {
			mSelector[this._sStableIdPropertyName] = this._sStableId;
		}
		return mSelector;
	};

	/**
	 * Retrieves the execute on select for the standard variant for the current control
	 *
	 * @returns {boolean} execute on select flag
	 * @public
	 */
	Persistence.prototype.getExecuteOnSelect = function() {
		return this.getChanges().then(function(oChanges) {
			return standardVariant.getExecuteOnSelect(oChanges);
		});
	};

	/**
	 * Retrieves the execute on select for the standard variant for the current control synchronously. WARNING: It is the responsibility of the consumer to make sure, that the
	 * changes have already been retrieved with getChanges. It's recommended to use the async API getExecuteOnSelect which works regardless of any
	 * preconditions.
	 *
	 * @returns {boolean} execute on select flag
	 * @public
	 */
	Persistence.prototype.getExecuteOnSelectSync = function() {
		return standardVariant.getExecuteOnSelect(this._oChanges);
	};

	/**
	 * Sets the execute on select for the standard variant for the current control. A new change object is created or an existing is updated. This change object is kept in
	 * memory and can be flushed using saveAll. WARNING: It is the responsibility of the consumer to make sure, that the changes have already been
	 * retrieved with getChanges. It's recommended to use the async API setExecuteOnSelect which works regardless of any preconditions.
	 *
	 * @param {boolean} bExecuteOnSelect the new execute on select flag for standard variant
	 * @returns {Object} the default variant change
	 * @public
	 */
	Persistence.prototype.setExecuteOnSelectSync = function(bExecuteOnSelect) {
		var mParameters, oChange;

		var selector = {};
		selector[this._sStableIdPropertyName] = this._sStableId;

		mParameters = {
			executeOnSelect: bExecuteOnSelect,
			reference: this._sComponentName,
			selector: selector
		};

		oChange = standardVariant.updateExecuteOnSelect(this._oChanges, bExecuteOnSelect);

		if (oChange) {
			return oChange;
		}

		oChange = standardVariant.createChangeObject(mParameters);
		oChange.attachEvent(Change.events.markForDeletion, this._onDeleteChange.bind(this));
		var sChangeId = oChange.getId();
		this._oChanges[sChangeId] = oChange;
		return oChange;
	};

	/**
	 * Sets the default variant for the current control. A new change object is created or an existing is updated. This change object is kept in
	 * memory and can be flushed using saveAll.
	 *
	 * @param {boolean} bExecuteOnSelect the new execute on select flag for standard variant
	 * @returns {Promise} the default variant change
	 * @public
	 */
	Persistence.prototype.setExecuteOnSelect = function(bExecuteOnSelect) {
		var mParameters, oChange;
		var that = this;

		return this.getChanges().then(function(oChanges) {
			var selector = {};
			selector[that._sStableIdPropertyName] = that._sStableId;

			mParameters = {
				executeOnSelect: bExecuteOnSelect,
				reference: that._sComponentName,
				selector: selector
			};

			oChange = standardVariant.updateExecuteOnSelect(oChanges, bExecuteOnSelect);

			if (oChange) {
				return oChange;
			}

			oChange = standardVariant.createChangeObject(mParameters);
			oChange.attachEvent(Change.events.markForDeletion, that._onDeleteChange.bind(that));
			oChanges[oChange.getId()] = oChange;
			return oChange;
		});
	};

	/**
	 * Retrieves the default variant for the current control
	 *
	 * @returns {String} id of the default variant
	 * @public
	 */
	Persistence.prototype.getDefaultVariantId = function() {
		return this.getChanges().then(function(oChanges) {
			return defaultVariant.getDefaultVariantId(oChanges);
		});
	};

	/**
	 * Retrieves the default variant for the current control synchronously. WARNING: It is the responsibility of the consumer to make sure, that the
	 * changes have already been retrieved with getChanges. It's recommended to use the async API getDefaultVariantId which works regardless of any
	 * preconditions.
	 *
	 * @returns {String} id of the default variant
	 * @public
	 */
	Persistence.prototype.getDefaultVariantIdSync = function() {
		return defaultVariant.getDefaultVariantId(this._oChanges);
	};

	/**
	 * Sets the default variant for the current control. A new change object is created or an existing is updated. This change object is kept in
	 * memory and can be flushed using saveAll. WARNING: It is the responsibility of the consumer to make sure, that the changes have already been
	 * retrieved with getChanges. It's recommended to use the async API setDefaultVariantId which works regardless of any preconditions.
	 *
	 * @param {string} sDefaultVariantId - the ID of the new default variant
	 * @returns {Object} the default variant change
	 * @public
	 */
	Persistence.prototype.setDefaultVariantIdSync = function(sDefaultVariantId) {
		var mParameters, oChange;

		var selector = {};
		selector[this._sStableIdPropertyName] = this._sStableId;

		mParameters = {
			defaultVariantId: sDefaultVariantId,
			reference: this._sComponentName,
			selector: selector
		};

		oChange = defaultVariant.updateDefaultVariantId(this._oChanges, sDefaultVariantId);

		if (oChange) {
			return oChange;
		}

		oChange = defaultVariant.createChangeObject(mParameters);
		oChange.attachEvent(Change.events.markForDeletion, this._onDeleteChange.bind(this));
		var sChangeId = oChange.getId();
		this._oChanges[sChangeId] = oChange;
		return oChange;
	};

	/**
	 * Sets the default variant for the current control. A new change object is created or an existing is updated. This change object is kept in
	 * memory and can be flushed using saveAll.
	 *
	 * @param {string} sDefaultVariantId - the ID of the new default variant
	 * @returns {Promise} the default variant change
	 * @public
	 */
	Persistence.prototype.setDefaultVariantId = function(sDefaultVariantId) {
		var mParameters, oChange;
		var that = this;

		return this.getChanges().then(function(oChanges) {
			var selector = {};
			selector[that._sStableIdPropertyName] = that._sStableId;

			mParameters = {
				defaultVariantId: sDefaultVariantId,
				reference: that._sComponentName,
				selector: selector
			};

			oChange = defaultVariant.updateDefaultVariantId(oChanges, sDefaultVariantId);

			if (oChange) {
				return oChange;
			}

			oChange = defaultVariant.createChangeObject(mParameters);
			oChange.attachEvent(Change.events.markForDeletion, that._onDeleteChange.bind(that));
			oChanges[oChange.getId()] = oChange;
			return oChange;
		});
	};

	/**
	 * Saves/flushes all current changes to the back end.
	 *
	 * @returns {Promise} resolving with an array of responses or rejecting with the first error
	 * @public
	 */
	Persistence.prototype.saveAll = function() {
		var aPromises = [];
		var that = this;
		jQuery.each(this._oChanges, function(id, oChange) {
			switch (oChange.getPendingAction()) {
				case "NEW":
					aPromises.push(that._oConnector.create(oChange.getDefinition(), oChange.getRequest(), oChange.isVariant()).then(function(result) {
						oChange.setResponse(result.response);
						if (Cache.isActive()) {
							Cache.addChange({ name: that._sComponentName, appVersion: that._sAppVersion}, result.response);
						}
						return result;
					}));
					break;
				case "UPDATE":
					aPromises.push(that._oConnector.update(oChange.getDefinition(), oChange.getId(), oChange.getRequest(), oChange.isVariant()).then(function(result) {
						oChange.setResponse(result.response);
						if (Cache.isActive()) {
							Cache.updateChange({ name: that._sComponentName, appVersion: that._sAppVersion}, result.response);
						}
						return result;
					}));
					break;
				case "DELETE":
					aPromises.push(that._oConnector.deleteChange({
						sChangeName: oChange.getId(),
						sLayer: oChange.getLayer(),
						sNamespace: oChange.getNamespace(),
						sChangelist: oChange.getRequest()
					}, oChange.isVariant()).then(function(result) {
						var sChangeId = oChange.getId();
						// remove change from all referring Persistence instances
						var mParameter = {
							id: sChangeId
						};
						oChange.fireEvent(Change.events.markForDeletion, mParameter);
						if (Cache.isActive()) {
							Cache.deleteChange({ name: that._sComponentName, appVersion: that._sAppVersion}, oChange.getDefinition());
						}
						return result;
					}));
					break;
				default:
					break;
			}
		});

		// TODO Consider not rejecting with first error, but wait for all promises and collect the results
		return Promise.all(aPromises);
	};

	/**
	 * Event Handler for deletion event of sap.ui.fl.Change. Removes the change from the internal changes map
	 *
	 * @param {object} oEvent - the event with parameters
	 * @private
	 */
	Persistence.prototype._onDeleteChange = function(oEvent) {
		var sChangeId;
		sChangeId = oEvent.getParameter("id");

		var oChange = this.getChange(sChangeId);
		if (oChange.getPendingAction() === "DELETE") {
			delete this._oChanges[sChangeId];
		}
	};

	/**
	 * Returns a flag whether the variant downport scenario is enabled or not. This scenario is only enabled if the current layer is the vendor layer
	 * and the url paramater hotfix is set to true.
	 *
	 * @returns {boolean} Flag whether the variant downport scenario is enabled
	 * @public
	 */
	Persistence.prototype.isVariantDownport = function() {
		var sLayer, bIsHotfix;
		sLayer = Utils.getCurrentLayer();
		bIsHotfix = Utils.isHotfixMode();

		return ((sLayer === 'VENDOR') && (bIsHotfix));
	};

	return Persistence;
}, true);
