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