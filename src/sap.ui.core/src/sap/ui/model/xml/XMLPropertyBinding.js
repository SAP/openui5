/*!
 * ${copyright}
 */

// Provides the XML model implementation of a property binding
sap.ui.define([
	'sap/ui/model/ChangeReason',
	'sap/ui/model/ClientPropertyBinding',
	"sap/base/util/deepEqual"
],
	function(ChangeReason, ClientPropertyBinding, deepEqual) {
	"use strict";


	/**
	 *
	 * @class
	 * Property binding implementation for XML format
	 *
	 * @param {sap.ui.model.xml.XMLModel} oModel
	 * @param {string} sPath
	 * @param {sap.ui.model.Context} oContext
	 * @param {object} [mParameters]
	 * @alias sap.ui.model.xml.XMLPropertyBinding
	 * @extends sap.ui.model.ClientPropertyBinding
	 */
	var XMLPropertyBinding = ClientPropertyBinding.extend("sap.ui.model.xml.XMLPropertyBinding");

	/**
	 * @see sap.ui.model.PropertyBinding.prototype.setValue
	 */
	XMLPropertyBinding.prototype.setValue = function(oValue){
		if (this.bSuspended) {
			return;
		}

		if (this.oValue != oValue) {
			if (this.oModel.setProperty(this.sPath, oValue, this.oContext, true)) {
				this.oValue = oValue;
				this.oModel.firePropertyChange({reason: ChangeReason.Binding, path: this.sPath, context: this.oContext, value: oValue});
			}
		}
	};

	/**
	 * Check whether this Binding would provide new values and in case it changed,
	 * inform interested parties about this.
	 *
	 * @param {boolean} bForceupdate
	 *
	 */
	XMLPropertyBinding.prototype.checkUpdate = function(bForceupdate){
		if (this.bSuspended && !bForceupdate) {
			return;
		}

		var oValue = this._getValue();
		if (!deepEqual(oValue, this.oValue) || bForceupdate) {// optimize for not firing the events when unneeded
			this.oValue = oValue;
			this._fireChange({reason: ChangeReason.Change});
		}
	};

	return XMLPropertyBinding;

});