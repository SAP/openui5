/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/fl/Change"], function(Change) {
	"use strict";

	/**
	 * StandardVariant handles the execute on select flag for the standard variant.
	 *        It knows how to create an execute on select for standard variant change, how to retrieve it from a given list of changes, etc.
	 * @constructor
	 * @alias sap.ui.fl.StandardVariant
	 * @author SAP SE
	 *
	 * @version ${version}
	 *
	 * @experimental Since 1.38.0
	 */
	var StandardVariant = function() {

	};

	/**
	 * Returns the execute on select flag of the standard variant. Returns <code>false</code> if there is no flag set.
	 *
	 * @param {object} mChanges Map containing multiple change files.
	 *
	 * @returns {boolean} execute on select for standard variant
	 *
	 * @public
	 */
	StandardVariant.prototype.getExecuteOnSelect = function(mChanges) {
		var StandardVariantChange = this.getNewestStandardVariantChangeDeleteTheRest(mChanges);

		if (StandardVariantChange) {
			return StandardVariantChange.getContent().executeOnSelect;
		}

		return null;
	};

	/**
	 * Returns the newest standard variant change and marks the rest for deletion.
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
	StandardVariant.prototype.getNewestStandardVariantChangeDeleteTheRest = function(mChanges) {
		var aChanges = this.getStandardVariantChanges(mChanges).sort(function(a, b) {
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
	 * Returns all standard variant changes within the given map of changes
	 *
	 * @param {object} mChanges - map containing multiple change files.
	 *
	 * @returns {array} default variant changes
	 *
	 * @public
	 */
	StandardVariant.prototype.getStandardVariantChanges = function(mChanges) {
		if (!mChanges || typeof mChanges !== 'object') {
			return [];
		}

		return Object.keys(mChanges).map(changeIdsToChanges).filter(StandardVariantChanges);

		function changeIdsToChanges(sChangeId) {
			return mChanges[sChangeId];
		}

		function StandardVariantChanges(oChange) {
			return oChange.getChangeType() === 'standardVariant';
		}
	};

	/**
	 * Updates the execute on select variant , if the given list of changes contains a default variant change.
	 * Only the newest is updated, the rest is marked for deletion.
	 *
	 * @param {object} mChanges map of changes
	 * @param {boolean} bNewExecuteOnSelect the new execute on select flag
	 * @returns {object} the updated change, undefined if non was found
	 *
	 * @public
	 */
	StandardVariant.prototype.updateExecuteOnSelect = function(mChanges, bNewExecuteOnSelect) {
		var oNewsetChange = this.getNewestStandardVariantChangeDeleteTheRest(mChanges);

		if (oNewsetChange) {
			var oContent = oNewsetChange.getContent();
			oContent.executeOnSelect = bNewExecuteOnSelect;
			oNewsetChange.setContent(oContent);
		}

		return oNewsetChange;
	};

	/**
	 * Creates the JSON content of a new change file, specifying the new standard variant
	 *
	 * @param {object} mParameters map of parameters, see below
	 * @param {boolean} mParameters.executeOnSelect - execute flag of the standard variant
	 * @param {String} mParameters.component - name of the UI5 component
	 * @param {object} mParameters.selector - stable propertyName:propertyValue
	 *
	 * @returns {Object} standard variant change
	 *
	 * @private
	 */
	StandardVariant.prototype._createChangeFile = function(mParameters) {
		var oFileData;

		mParameters.namespace = mParameters.component + '/changes/standard';
		mParameters.componentName = mParameters.component;
		mParameters.changeType = 'standardVariant';

		oFileData = Change.createInitialFileContent(mParameters);

		oFileData.content.executeOnSelect = mParameters.executeOnSelect;
		oFileData.layer = 'USER';

		return oFileData;
	};

	/**
	 * Creates an instance of {sap.ui.fl.Change}, specifying the new standard variant
	 *
	 * @param {object} mParameters - map of parameters, see below
	 * @param {boolean} mParameters.executeOnSelect - execute flag of the standard variant
	 * @param {String} mParameters.component - name of the UI5 component
	 * @param {object} mParameters.selector - stable propertyName:propertyValue
	 * @returns {sap.ui.fl.Change} Change
	 *
	 * @public
	 */
	StandardVariant.prototype.createChangeObject = function(mParameters) {
		var oFileContent;
		var oChange;

		oFileContent = this._createChangeFile(mParameters);
		oChange = new Change(oFileContent);

		return oChange;
	};

	return new StandardVariant();
}, /* bExport= */true);