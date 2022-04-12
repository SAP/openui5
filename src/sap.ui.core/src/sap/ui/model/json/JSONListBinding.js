/*!
 * ${copyright}
 */
/*eslint-disable max-len */
// Provides the JSON model implementation of a list binding
sap.ui.define([
	"sap/base/Log",
	"sap/base/util/deepEqual",
	"sap/base/util/deepExtend",
	"sap/base/util/each",
	"sap/base/util/extend",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/ClientListBinding"
], function(Log, deepEqual, deepExtend, each, extend, ChangeReason, ClientListBinding) {
	"use strict";

	/**
	 * Creates a new JSONListBinding.
	 *
	 * This constructor should only be called by subclasses or model implementations, not by application or control code.
	 * Such code should use {@link sap.ui.model.json.JSONModel#bindList JSONModel#bindList} on the corresponding model instance instead.
	 *
	 * @param {sap.ui.model.json.JSONModel} oModel Model instance that this binding is created for and that it belongs to
	 * @param {string} sPath Binding path to be used for this binding
	 * @param {sap.ui.model.Context} oContext Binding context relative to which a relative binding path will be resolved
	 * @param {sap.ui.model.Sorter|sap.ui.model.Sorter[]} [aSorters] Initial sort order (can be either a sorter or an array of sorters)
	 * @param {sap.ui.model.Filter|sap.ui.model.Filter[]} [aFilters] Predefined filter/s (can be either a filter or an array of filters)
	 * @param {object} [mParameters] Map of optional parameters as defined by subclasses; this class does not introduce any own parameters
	 * @throws {Error} When one of the filters uses an operator that is not supported by the underlying model implementation
	 *
	 * @class
	 * List binding implementation for JSON format.
	 *
	 * @alias sap.ui.model.json.JSONListBinding
	 * @extends sap.ui.model.ClientListBinding
	 * @protected
	 */
	var JSONListBinding = ClientListBinding.extend("sap.ui.model.json.JSONListBinding");

	/**
	 * Return contexts for the list or a specified subset of contexts
	 * @param {int} [iStartIndex=0] the startIndex where to start the retrieval of contexts
	 * @param {int} [iLength=length of the list] determines how many contexts to retrieve beginning from the start index.
	 * Default is the whole list length.
	 * @param {int} [iMaximumPrefetchSize]
	 *   Not used
	 * @param {boolean} [bKeepCurrent]
	 *   Whether this call keeps the result of {@link #getCurrentContexts} untouched; since 1.102.0.
	 * @return {sap.ui.model.Context[]}
	 *   The array of contexts for each row of the bound list
	 * @throws {Error}
	 *   If extended change detection is enabled and <code>bKeepCurrent</code> is set, or if
	 *   <code>iMaximumPrefetchSize</code> and <code>bKeepCurrent</code> are set
	 *
	 * @protected
	 */
	JSONListBinding.prototype.getContexts = function (iStartIndex, iLength, iMaximumPrefetchSize,
			bKeepCurrent) {
		var aContextData, aContexts;

		this._updateLastStartAndLength(iStartIndex, iLength, iMaximumPrefetchSize, bKeepCurrent);
		if (!iStartIndex) {
			iStartIndex = 0;
		}
		if (!iLength) {
			iLength = Math.min(this.iLength, this.oModel.iSizeLimit);
		}

		aContexts = this._getContexts(iStartIndex, iLength);

		if (this.bUseExtendedChangeDetection) {
			aContextData = [];
			// Use try/catch to detect issues with cyclic references in JS objects,
			// in this case diff will be disabled.
			try {
				for (var i = 0; i < aContexts.length; i++) {
					aContextData.push(this.getContextData(aContexts[i]));
				}

				//Check diff
				if (this.aLastContextData && iStartIndex < this.iLastEndIndex) {
					aContexts.diff = this.diffData(this.aLastContextData, aContextData);
				}

				this.iLastEndIndex = iStartIndex + iLength;
				this.aLastContexts = aContexts.slice(0);
				this.aLastContextData = aContextData.slice(0);
			} catch (oError) {
				this.bUseExtendedChangeDetection = false;
				Log.warning("JSONListBinding: Extended change detection has been disabled as JSON data could not be serialized.");
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
	 * Get indices of the list
	 */
	JSONListBinding.prototype.updateIndices = function() {
		var i;

		this.aIndices = [];
		if (Array.isArray(this.oList)) {
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
			if (Array.isArray(oList)) {
				if (this.bUseExtendedChangeDetection) {
					this.oList = deepExtend([], oList);
				} else {
					this.oList = oList.slice(0);
				}
			} else {
				this.oList = this.bUseExtendedChangeDetection
					? deepExtend({}, oList) : extend({}, oList);
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
	 * Check whether this Binding would provide new values and in case it changed, fire a change
	 * event with change reason <code>sap.ui.model.ChangeReason.Change</code>.
	 *
	 * @param {boolean} [bForceupdate]
	 *   Whether the change event will be fired regardless of the bindings state
	 *
	 */
	JSONListBinding.prototype.checkUpdate = function(bForceupdate){
		var oList;

		if (this.bSuspended && !this.bIgnoreSuspend && !bForceupdate) {
			return;
		}

		if (!this.bUseExtendedChangeDetection) {
			oList = this.oModel._getObject(this.sPath, this.oContext) || [];
			if (!deepEqual(this.oList, oList) || bForceupdate) {
				this.update();
				this._fireChange({reason: ChangeReason.Change});
			}
		} else {
			var bChangeDetected = false;
			var that = this;

			//If the list has changed we need to update the indices first
			oList = this.oModel._getObject(this.sPath, this.oContext) || [];
			if (this.oList.length != oList.length) {
				bChangeDetected = true;
			}
			if (!deepEqual(this.oList, oList)) {
				this.update();
			}

			//Get contexts for visible area and compare with stored contexts
			var aContexts = this._getContexts(this.iLastStartIndex, this.iLastLength);
			if (this.aLastContexts) {
				if (this.aLastContexts.length != aContexts.length) {
					bChangeDetected = true;
				} else {
					each(this.aLastContextData, function(iIndex, oLastData) {
						var oCurrentData = that.getContextData(aContexts[iIndex]);
						if (oCurrentData !== oLastData) {
							bChangeDetected = true;
							return false;
						}
						return true;
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