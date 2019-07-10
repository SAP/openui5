/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/fl/Change"], function(Change) {
	"use strict";

	/**
	 * DefaultVariant handles default variant changes without keeping control specific state.
	 *        It knows how to create a default variant change, how to retrieve the default variant id from a given list of changes, etc.
	 * @constructor
	 * @alias sap.ui.fl.DefaultVariant
	 * @author SAP SE
	 *
	 * @version ${version}
	 *
	 * @experimental Since 1.25.0
	 */
	var DefaultVariant = function() {

	};

	/**
	 * Returns the id of the default variant. Returns an empty string if there is no default variant.
	 *
	 * @param {object} mChanges Map containing multiple change files.
	 *
	 * @returns {String} default variant id
	 *
	 * @public
	 */
	DefaultVariant.prototype.getDefaultVariantId = function(mChanges) {
		var defaultVariantChange = this.getNewestDefaultVariantChangeDeleteTheRest(mChanges);

		if (defaultVariantChange) {
			return defaultVariantChange.getContent().defaultVariantName;
		}

		return "";
	};

	/**
	 * Returns the newest default variant change and marks the rest for deletion.
	 * A change with an empty string as creation is considered newer
	 * than a change with an iso date string. If multiple changes
	 * have an empty string, order is not guaranteed. That is a case
	 * that should not happen.
	 *
	 * @param {object} mChanges map containing multiple change files.
	 *
	 * @returns {array} default variant changes
	 *
	 * @public
	 */
	DefaultVariant.prototype.getNewestDefaultVariantChangeDeleteTheRest = function(mChanges) {
		var aChanges = this.getDefaultVariantChanges(mChanges).sort(function(a, b) {
			var aDate = new Date(a.getCreation());
			var bDate = new Date(b.getCreation());

			if (isNaN(aDate.getDate())) {
				return -1;
			}

			if (isNaN(bDate.getDate())) {
				return 1;
			}

			return bDate - aDate;
		});

		var oNewestChange = aChanges.shift();

		aChanges.forEach(function(oChange) {
			oChange.markForDeletion();
		});

		return oNewestChange;
	};

	/**
	 * Returns all default variant changes within the given map of changes
	 *
	 * @param {object} mChanges - map containing multiple change files.
	 *
	 * @returns {array} default variant changes
	 *
	 * @public
	 */
	DefaultVariant.prototype.getDefaultVariantChanges = function(mChanges) {
		if (!mChanges || typeof mChanges !== 'object') {
			return [];
		}

		return Object.keys(mChanges).map(changeIdsToChanges).filter(defaultVariantChanges);

		function changeIdsToChanges(sChangeId) {
			return mChanges[sChangeId];
		}

		function defaultVariantChanges(oChange) {
			return oChange.getChangeType() === 'defaultVariant';
		}
	};

	/**
	 * Updates the default variant id, if the given list of changes contains a default variant change.
	 * Only the newest is updated, the rest is marked for deletion.
	 *
	 * @param {object} mChanges map of changes
	 * @param {string} sNewDefaultVariantId the new default variant id
	 * @returns {object} the updated change, undefined if non was found
	 *
	 * @public
	 */
	DefaultVariant.prototype.updateDefaultVariantId = function(mChanges, sNewDefaultVariantId) {
		var oNewsetChange = this.getNewestDefaultVariantChangeDeleteTheRest(mChanges);

		if (oNewsetChange) {
			var oContent = oNewsetChange.getContent();
			oContent.defaultVariantName = sNewDefaultVariantId;
			oNewsetChange.setContent(oContent);
		}

		return oNewsetChange;
	};

	/**
	 * Creates the JSON content of a new change file, specifying the new default variant
	 *
	 * @param {object} mParameters map of parameters, see below
	 * @param {String} mParameters.defaultVariantId - id of the new default variant
	 * @param {String} mParameters.reference - name of the UI5 component
	 * @param {object} mParameters.selector - stable propertyName:propertyValue
	 * @param {Object} mParameters.validAppVersions - Application versions (format: major.minor.patch) where the context is active
	 * @param {String} mParameters.validAppVersions.creation - Original application version
	 * @param {String} mParameters.validAppVersions.from - Minimum application version
	 *
	 * @returns {Object} default variant change
	 *
	 * @private
	 */
	DefaultVariant.prototype._createChangeFile = function(mParameters) {
		var oFileData;

		mParameters.changeType = 'defaultVariant';

		oFileData = Change.createInitialFileContent(mParameters);

		oFileData.content.defaultVariantName = mParameters.defaultVariantId;
		oFileData.layer = 'USER';

		return oFileData;
	};

	/**
	 * Creates an instance of {sap.ui.fl.Change}, specifying the new default variant
	 *
	 * @param {object} mParameters - map of parameters, see below
	 * @param {String} mParameters.defaultVariantId - id of the new default variant
	 * @param {String} mParameters.reference - name of the UI5 component
	 * @param {object} mParameters.selector - stable propertyName:propertyValue
	 * @param {Object} mParameters.validAppVersions - Application versions (format: major.minor.patch) where the context is active
	 * @param {String} mParameters.validAppVersions.creation - Original application version
	 * @param {String} mParameters.validAppVersions.from - Minimum application version
	 * @returns {sap.ui.fl.Change} Change
	 *
	 * @public
	 */
	DefaultVariant.prototype.createChangeObject = function(mParameters) {
		var oFileContent;
		var oChange;

		oFileContent = this._createChangeFile(mParameters);
		oChange = new Change(oFileContent);

		return oChange;
	};

	return new DefaultVariant();
}, /* bExport= */true);