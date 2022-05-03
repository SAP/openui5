/*!
 * ${copyright}
 */
/*eslint-disable max-len */
// Provides the JSON model implementation of a list binding
sap.ui.define([
	"sap/base/strings/hash",
	"sap/base/util/deepEqual",
	"sap/base/util/deepExtend",
	"sap/base/util/each",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/ClientListBinding"
], function(hash, deepEqual, deepExtend, each, ChangeReason, ClientListBinding) {
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

	/*
	 * Define the symbol function when extended change detection is enabled.
	 * @override
	 */
	MessageListBinding.prototype.enableExtendedChangeDetection = function() {
		ClientListBinding.prototype.enableExtendedChangeDetection.apply(this, arguments);
		this.oExtendedChangeDetectionConfig = this.oExtendedChangeDetectionConfig || {};
		this.oExtendedChangeDetectionConfig.symbol = function (vContext) {
			if (typeof vContext !== "string") {
				return this.getContextData(vContext); // objects require JSON string representation
			}
			return hash(vContext); // string use hash codes
		}.bind(this);
	};

	/**
	 * Treats the context's object as sap/ui/core/message/Message.
	 * Its processor is removed, it is serialized and then the processor is re-added.
	 * This is required to avoid circular references when using <code>JSON.stringify</code>
	 * Note: The processor is not required for diff comparison.
	 *
	 * @private
	 * @param {sap.ui.model.Context} oContext object which is used for serialization.
	 * @returns {string} string representation of the context's object.
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
				this.oList = deepExtend([], oList);
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
	 * @param {boolean} [bForceupdate]
	 *   Whether interested parties should be informed regardless of the bindings state
	 *
	 */
	MessageListBinding.prototype.checkUpdate = function(bForceupdate){
		var oList;

		if (this.bSuspended && !this.bIgnoreSuspend) {
			return;
		}

		if (!this.bUseExtendedChangeDetection) {
			oList = this.oModel._getObject(this.sPath, this.oContext);
			if (!deepEqual(this.oList, oList) || bForceupdate) {
				this.update();
				this._fireChange({reason: ChangeReason.Change});
			}
		} else {
			var bChangeDetected = false;
			var that = this;

			//If the list has changed we need to update the indices first.
			oList = this.oModel._getObject(this.sPath, this.oContext);
			if (!deepEqual(this.oList, oList)) {
				this.update();
			}

			//Get contexts for visible area and compare with stored contexts.
			var aContexts = this._getContexts(this.iLastStartIndex, this.iLastLength);
			if (this.aLastContexts) {
				if (this.aLastContexts.length != aContexts.length) {
					bChangeDetected = true;
				} else {
					each(this.aLastContextData, function(iIndex, oLastData) {
						if (that.getContextData(aContexts[iIndex]) !== oLastData) {
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

	return MessageListBinding;
});