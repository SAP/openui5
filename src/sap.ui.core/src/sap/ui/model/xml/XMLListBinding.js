/*!
 * ${copyright}
 */
/*eslint-disable max-len */
// Provides the XML model implementation of a list binding
sap.ui.define([
	'sap/ui/model/ChangeReason',
	'sap/ui/model/ClientListBinding',
	"sap/ui/util/XMLHelper",
	"sap/base/util/deepEqual",
	"sap/base/util/each"
],
	function(ChangeReason, ClientListBinding, XMLHelper, deepEqual, each) {
	"use strict";



	/**
	 *
	 * @class
	 * List binding implementation for XML format
	 *
	 * @param {sap.ui.model.xml.XMLModel} oModel
	 * @param {string} sPath
	 * @param {sap.ui.model.Context} oContext
	 * @param {sap.ui.model.Sorter|sap.ui.model.Sorter[]} [aSorters] initial sort order (can be either a sorter or an array of sorters)
	 * @param {sap.ui.model.Filter|sap.ui.model.Filter[]} [aFilters] predefined filter/s (can be either a filter or an array of filters)
	 * @param {object} [mParameters]
	 * @alias sap.ui.model.xml.XMLListBinding
	 * @extends sap.ui.model.ClientListBinding
	 */
	var XMLListBinding = ClientListBinding.extend("sap.ui.model.xml.XMLListBinding");

	/**
	 * Return contexts for the list or a specified subset of contexts
	 * @param {int} [iStartIndex=0] the startIndex where to start the retrieval of contexts
	 * @param {int} [iLength=length of the list] determines how many contexts to retrieve beginning from the start index.
	 * Default is the whole list length.
	 * @param {int} [iMaximumPrefetchSize]
	 *   Not used
	 * @param {boolean} [bKeepCurrent]
	 *   Whether this call keeps the result of {@link #getCurrentContexts} untouched; since 1.102.0.
	 * @return {sap.ui.model.Context[]} the contexts array
	 * @throws {Error}
	 *   If extended change detection is enabled and <code>bKeepCurrent</code> is set, or if
	 *   <code>iMaximumPrefetchSize</code> and <code>bKeepCurrent</code> are set
	 *
	 * @protected
	 */
	XMLListBinding.prototype.getContexts = function(iStartIndex, iLength, iMaximumPrefetchSize,
			bKeepCurrent) {
		var aContextData, aContexts, i;

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
			for (i = 0; i < aContexts.length; i++) {
				aContextData.push(this.getContextData(aContexts[i]));
			}
			//Check diff
			if (this.aLastContexts && iStartIndex < this.iLastEndIndex) {
				aContexts.diff = this.diffData(this.aLastContextData, aContextData);
			}
			this.iLastEndIndex = iStartIndex + iLength;
			this.aLastContexts = aContexts.slice(0);
			this.aLastContextData = aContextData.slice(0);
		}

		return aContexts;
	};

	XMLListBinding.prototype.getCurrentContexts = function() {
		if (this.bUseExtendedChangeDetection) {
			return this.aLastContexts || [];
		} else {
			return this.getContexts(this.iLastStartIndex, this.iLastLength);
		}
	};

	/**
	 * Returns the entry data as required for change detection/diff. For the XMLModel this is the
	 * node referenced by the context, serialized as XML.
	 *
	 * @param {sap.ui.model.Context} oContext The context to get the entry data from
	 *
	 * @returns {string} The entry data of the given context
	 *
	 * @private
	 */
	XMLListBinding.prototype.getEntryData = function(oContext) {
		return XMLHelper.serialize(oContext.getObject());
	};

	/**
	 * Update the list, indices array and apply sorting and filtering
	 * @private
	 */
	XMLListBinding.prototype.update = function(){
		var oList = this.oModel._getObject(this.sPath, this.oContext);
		if (oList) {
			this.oList = [];
			var that = this;
			if (this.bUseExtendedChangeDetection) {
				each(oList, function(sKey, oNode) {
					that.oList.push(oNode.cloneNode(true));
				});
			} else {
				this.oList = oList.slice(0);
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
	 * Checks whether this Binding would provide new values and in case it changed, fires a change
	 * event with change reason <code>Change</code>.
	 *
	 * @param {boolean} [bForceupdate]
	 *   Whether the change event is fired regardless of the binding's state
	 *
	 */
	XMLListBinding.prototype.checkUpdate = function(bForceupdate){
		var oList;

		if (this.bSuspended && !this.bIgnoreSuspend && !bForceupdate) {
			return;
		}

		if (!this.bUseExtendedChangeDetection) {
			oList = this.oModel._getObject(this.sPath, this.oContext) || [];
			if (oList.length != this.oList.length || bForceupdate) {
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


	return XMLListBinding;

});