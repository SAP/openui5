/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/Change", "sap/ui/fl/DefaultVariant",  "sap/ui/fl/StandardVariant", "sap/ui/fl/Utils", "jquery.sap.global", "sap/ui/fl/ChangePersistenceFactory"
], function(Change, defaultVariant, standardVariant, Utils, $, ChangePersistenceFactory) {

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

		this._sStableIdPropertyName = sStableIdPropertyName || 'id';
		this._sStableId = this._getStableId();

		this._sComponentName = Utils.getComponentClassName(oControl);
		if (!this._sComponentName) {
			Utils.log.error("The Control does not belong to an SAPUI5 component. Variants and Changes for this control might not work as expected.");
		}
		this._oAppDescriptor = Utils.getAppDescriptor(oControl);
		this._sSiteId = Utils.getSiteId(oControl);

		this._oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(this._oControl);
		this._oChanges = {};
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
	 * Calls the back end asynchronously and fetches all changes and variants in the same component pointing to this control.
	 *
	 * @see sap.ui.fl.Change
	 * @returns {Promise} with parameter <code>aResults</code> which is a map with key changeId and value instance of sap.ui.fl.Change
	 * @public
	 */
	Persistence.prototype.getChanges = function() {
		var mPropertyBag = {
			appDescriptor: this._oAppDescriptor,
			siteId: this._sSiteId,
			includeVariants: true
		};

		if (!jQuery.isEmptyObject(this._oChanges)) {
			return Promise.resolve(this._oChanges);
		}
		return this._oChangePersistence.getChangesForVariant(this._sStableIdPropertyName, this._sStableId, mPropertyBag).then(function(oChanges) {
			this._oChanges = oChanges;
			return this._oChanges;
		}.bind(this));
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
		return this._oChangePersistence.addChangeForVariant(this._sStableIdPropertyName, this._sStableId, mParameters);
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
		var sChangeId = oChange.getId();
		this._oChanges[sChangeId] = oChange;
		return oChange;
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
		var sChangeId = oChange.getId();
		this._oChanges[sChangeId] = oChange;
		return oChange;
	};

	/**
	 * Saves/flushes all current changes to the back end.
	 *
	 * @returns {Promise} resolving with an array of responses or rejecting with the first error
	 * @public
	 */
	Persistence.prototype.saveAll = function() {
		return this._oChangePersistence.saveAllChangesForVariant(this._sStableId);
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
