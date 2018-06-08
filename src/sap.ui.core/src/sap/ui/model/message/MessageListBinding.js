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
	 * List binding implementation for Messages
	 *
	 * @param {sap.ui.model.message.MessageModel} oModel
	 * @param {string} sPath
	 * @param {sap.ui.model.Context} oContext
	 * @param {sap.ui.model.Sorter|sap.ui.model.Sorter[]} [aSorters] initial sort order (can be either a sorter or an array of sorters).
	 * @param {sap.ui.model.Filter|sap.ui.model.Filter[]} [aFilters] predefined filter/s (can be either a filter or an array of filters).
	 * @param {object} [mParameters]
	 * @alias sap.ui.model.message.MessageListBinding
	 * @extends sap.ui.model.ClientListBinding
	 */
	var MessageListBinding = ClientListBinding.extend("sap.ui.model.message.MessageListBinding");

	/**
	 * Return contexts for the list or a specified subset of contexts.
	 * @param {int} [iStartIndex=0] the startIndex where to start the retrieval of contexts.
	 * @param {int} [iLength=length of the list] determines how many contexts to retrieve beginning from the start index.
	 * Default is the whole list length.
	 *
	 * @return {Array} the contexts array
	 * @protected
	 */
	MessageListBinding.prototype.getContexts = function(iStartIndex, iLength) {
		this.iLastStartIndex = iStartIndex;
		this.iLastLength = iLength;

		if (!iStartIndex) {
			iStartIndex = 0;
		}
		if (!iLength) {
			iLength = Math.min(this.iLength, this.oModel.iSizeLimit);
		}

		var aContexts = this._getContexts(iStartIndex, iLength), aContextData = [];

		if (this.bUseExtendedChangeDetection) {

			for (var i = 0; i < aContexts.length; i++) {
				aContextData.push(this.getContextData(aContexts[i]));
			}

			//Check diff
			if (this.aLastContexts && iStartIndex < this.iLastEndIndex) {
				var that = this;
				aContexts.diff = jQuery.sap.arraySymbolDiff(this.aLastContextData, aContexts, function (vContext){
					if (typeof vContext !== "string") {
						return that.getContextData(vContext); // objects require JSON string representation
					}
					return jQuery.sap.hashCode(vContext); // string use hash codes
				});
			}
			this.iLastEndIndex = iStartIndex + iLength;
			this.aLastContexts = aContexts.slice(0);
			this.aLastContextData = aContextData.slice(0);
		}

		return aContexts;
	};

	/**
	 * Treats the context's object as sap/ui/core/message/Message.
	 * Its processor is removed, it is serialized and then the processor is re-added.
	 * This is required to avoid circular references when using <code>JSON.stringify</code>
	 * Note: The processor is not required for diff comparison.
	 *
	 * @private
	 * @param {sap.ui.model.Context} oContext object which is used for serialization.
	 * @returns string representation of the context's object.
	 */
	MessageListBinding.prototype.getEntryData = function(oContext) {
		var oObject = oContext.getObject();
		// remove processor, serialize and re-add processor
		// because processor contains a circular dependency and is not required for serialization
		var oProcessor = oObject.processor;
		delete oObject.processor;
		var sJsonResult = JSON.stringify(oObject);
		oObject.processor = oProcessor;
		return sJsonResult;
	};

	/**
	 * Update the list, indices array and apply sorting and filtering.
	 * @private
	 */
	MessageListBinding.prototype.update = function(){
		var oList = this.oModel._getObject(this.sPath, this.oContext);
		if (Array.isArray(oList)) {
			if (this.bUseExtendedChangeDetection) {
				this.oList = jQuery.extend(true, [], oList);
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
	 * Check whether this Binding would provide new values and in case it changed,
	 * inform interested parties about this.
	 *
	 * @param {boolean} bForceupdate
	 *
	 */
	MessageListBinding.prototype.checkUpdate = function(bForceupdate){

		if (this.bSuspended && !this.bIgnoreSuspend) {
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

			//If the list has changed we need to update the indices first.
			var oList = this.oModel._getObject(this.sPath, this.oContext);
			if (!jQuery.sap.equal(this.oList, oList)) {
				this.update();
			}

			//Get contexts for visible area and compare with stored contexts.
			var aContexts = this._getContexts(this.iLastStartIndex, this.iLastLength);
			if (this.aLastContexts) {
				if (this.aLastContexts.length != aContexts.length) {
					bChangeDetected = true;
				} else {
					jQuery.each(this.aLastContextData, function(iIndex, oLastData) {
						if (that.getContextData(aContexts[iIndex]) !== oLastData) {
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


	return MessageListBinding;

});
