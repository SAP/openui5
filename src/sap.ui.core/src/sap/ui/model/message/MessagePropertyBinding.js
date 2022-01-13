/*!
 * ${copyright}
 */
/*eslint-disable max-len */
// Provides the JSON model implementation of a property binding
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
	 * Property binding implementation for Messages
	 *
	 * @param {sap.ui.model.message.MessageModel} oModel
	 * @param {string} sPath
	 * @param {sap.ui.model.Context} oContext
	 * @param {object} [mParameters]
	 * @alias sap.ui.model.message.MessagePropertyBinding
	 * @extends sap.ui.model.ClientPropertyBinding
	 */
	var MessagePropertyBinding = ClientPropertyBinding.extend("sap.ui.model.message.MessagePropertyBinding");

	/*
	 * @see sap.ui.model.PropertyBinding.prototype.setValue
	 */
	MessagePropertyBinding.prototype.setValue = function(oValue){
		if (!deepEqual(this.oValue, oValue)) {
			// the binding value will be updated by the model. The model calls checkupdate on all bindings after updating its value.
			this.oModel.setProperty(this.sPath, oValue, this.oContext);
		}
	};

	/**
	 * Check whether this Binding would provide new values and in case it changed,
	 * inform interested parties about this.
	 *
	 * @param {boolean} [bForceupdate]
	 *   Whether interested parties should be informed regardless of the bindings state
	 */
	MessagePropertyBinding.prototype.checkUpdate = function(bForceupdate){
		var oValue = this._getValue();
		if (!deepEqual(oValue, this.oValue) || bForceupdate) {// optimize for not firing the events when unneeded
			this.oValue = oValue;
			this._fireChange({reason: ChangeReason.Change});
		}
	};

	return MessagePropertyBinding;

});