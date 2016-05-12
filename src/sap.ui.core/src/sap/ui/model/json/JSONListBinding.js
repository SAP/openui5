/*!
 * ${copyright}
 */

// Provides the JSON model implementation of a list binding
sap.ui.define(['jquery.sap.global', 'sap/ui/model/ChangeReason', 'sap/ui/model/ClientListBinding'],
	function(jQuery, ChangeReason, ClientListBinding) {
	"use strict";



	/**
	 *
	 * @class
	 * List binding implementation for JSON format
	 *
	 * @param {sap.ui.model.json.JSONModel} oModel
	 * @param {string} sPath
	 * @param {sap.ui.model.Context} oContext
	 * @param {sap.ui.model.Sorter|sap.ui.model.Sorter[]} [aSorters] initial sort order (can be either a sorter or an array of sorters)
	 * @param {sap.ui.model.Filter|sap.ui.model.Filter[]} [aFilters] predefined filter/s (can be either a filter or an array of filters)
	 * @param {object} [mParameters]
	 * @alias sap.ui.model.json.JSONListBinding
	 * @extends sap.ui.model.ClientListBinding
	 */
	var JSONListBinding = ClientListBinding.extend("sap.ui.model.json.JSONListBinding");

	/**
	 * Return contexts for the list or a specified subset of contexts
	 * @param {int} [iStartIndex=0] the startIndex where to start the retrieval of contexts
	 * @param {int} [iLength=length of the list] determines how many contexts to retrieve beginning from the start index.
	 * Default is the whole list length.
	 *
	 * @return {Array} the contexts array
	 * @protected
	 */
	JSONListBinding.prototype.getContexts = function(iStartIndex, iLength) {
		this.iLastStartIndex = iStartIndex;
		this.iLastLength = iLength;

		if (!iStartIndex) {
			iStartIndex = 0;
		}
		if (!iLength) {
			iLength = Math.min(this.iLength, this.oModel.iSizeLimit);
		}

		var aContexts = this._getContexts(iStartIndex, iLength),
			aContextData = [];

		if (this.bUseExtendedChangeDetection) {
			// Use try/catch to detect issues with cyclic references in JS objects,
			// in this case diff will be disabled.
			try {
				for (var i = 0; i < aContexts.length; i++) {
					aContextData.push(this.getContextData(aContexts[i]));
				}

				//Check diff
				if (this.aLastContextData && iStartIndex < this.iLastEndIndex) {
					aContexts.diff = jQuery.sap.arraySymbolDiff(this.aLastContextData, aContextData);
				}

				this.iLastEndIndex = iStartIndex + iLength;
				this.aLastContexts = aContexts.slice(0);
				this.aLastContextData = aContextData.slice(0);
			} catch (oError) {
				this.bUseExtendedChangeDetection = false;
				jQuery.sap.log.warning("JSONListBinding: Extended change detection has been disabled as JSON data could not be serialized.");
			}
		}

		return aContexts;
	};

	JSONListBinding.prototype.getCurrentContexts = function() {
		if (this.bUseExtendedChangeDetection) {
			return this.aLastContexts || [];
		} else {
			return this.getContexts(this.iLastStartIndex, this.iLastLength);
		}
	};

	/**
	 * Returns the context data as required for change detection/diff. This may not contain
	 * all of the data, but just the key property
	 *
	 * @private
	 */
	JSONListBinding.prototype.getContextData = function(oContext) {
		if (this.fnGetEntryKey && !this.bDetectUpdates) {
			return this.fnGetEntryKey(oContext);
		} else {
			return JSON.stringify(oContext.getObject());
		}
	};

	/**
	 * Get indices of the list
	 */
	JSONListBinding.prototype.updateIndices = function() {
		var i;

		this.aIndices = [];
		if (jQuery.isArray(this.oList)) {
			for (i = 0; i < this.oList.length; i++) {
				this.aIndices.push(i);
			}
		} else {
			for (i in this.oList) {
				this.aIndices.push(i);
			}
		}
	};

	/**
	 * Update the list, indices array and apply sorting and filtering
	 * @private
	 */
	JSONListBinding.prototype.update = function(){
		var oList = this.oModel._getObject(this.sPath, this.oContext);
		if (oList) {
			if (jQuery.isArray(oList)) {
				if (this.bUseExtendedChangeDetection) {
					this.oList = jQuery.extend(true, [], oList);
				} else {
					this.oList = oList.slice(0);
				}
			} else {
				this.oList = jQuery.extend(this.bUseExtendedChangeDetection, {}, oList);
			}
			this.updateIndices();
			this.applyFilter();
			this.applySort();
			this.iLength = this._getLength();
		} else {
			this.oList = [];
			this.aIndices = [];
			this.iLength = 0;
		}
	};

	/**
	 * Check whether this Binding would provide new values and in case it changed,
	 * inform interested parties about this.
	 *
	 * @param {boolean} bForceupdate
	 *
	 */
	JSONListBinding.prototype.checkUpdate = function(bForceupdate){

		if (this.bSuspended && !this.bIgnoreSuspend && !bForceupdate) {
			return;
		}

		if (!this.bUseExtendedChangeDetection) {
			var oList = this.oModel._getObject(this.sPath, this.oContext);
			if (!jQuery.sap.equal(this.oList, oList) || bForceupdate) {
				this.update();
				this._fireChange({reason: ChangeReason.Change});
			}
		} else {
			var bChangeDetected = false;
			var that = this;

			//If the list has changed we need to update the indices first
			var oList = this.oModel._getObject(this.sPath, this.oContext);
			if (oList && this.oList.length != oList.length) {
				bChangeDetected = true;
			}
			if (!jQuery.sap.equal(this.oList, oList)) {
				this.update();
			}

			//Get contexts for visible area and compare with stored contexts
			var aContexts = this._getContexts(this.iLastStartIndex, this.iLastLength);
			if (this.aLastContexts) {
				if (this.aLastContexts.length != aContexts.length) {
					bChangeDetected = true;
				} else {
					jQuery.each(this.aLastContextData, function(iIndex, oLastData) {
						var oCurrentData = that.getContextData(aContexts[iIndex]);
						if (oCurrentData !== oLastData) {
							bChangeDetected = true;
							return false;
						}
					});
				}
			} else {
				bChangeDetected = true;
			}
			if (bChangeDetected || bForceupdate) {
				this._fireChange({reason: ChangeReason.Change});
			}
		}
	};


	return JSONListBinding;

});
