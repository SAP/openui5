/*!
 * ${copyright}
 */
/*eslint-disable max-len */
// Provides a static binding.
sap.ui.define([
	"./ChangeReason",
	"./PropertyBinding"
],
	function(ChangeReason, PropertyBinding) {
	"use strict";


	/**
	 * Constructor for StaticBinding
	 *
	 * @class
	 * The <code>StaticBinding</code> allows to define static values within a
	 * {@link sap.ui.model.CompositeBinding}. It behaves like a property binding but always returns
	 * the value that is stored in the binding itself. The binding does not have a
	 * {@link sap.ui.model.Context}, a {@link sap.ui.model.Model} or a path.
	 *
	 * @param {any} vValue The static value of this binding
	 *
	 * @public
	 * @alias sap.ui.model.StaticBinding
	 * @extends sap.ui.model.PropertyBinding
	 */

	var StaticBinding = PropertyBinding.extend("sap.ui.model.StaticBinding", /** @lends sap.ui.model.StaticBinding.prototype */ {

		constructor : function (vValue) {
			PropertyBinding.apply(this, [null,""]);
			this.vValue = vValue;
		}
	});

	StaticBinding.prototype.getPath = function() {
		return null;
	};

	StaticBinding.prototype.getModel = function() {
		return null;
	};

	StaticBinding.prototype.getContext = function() {
		return null;
	};

	StaticBinding.prototype.updateRequired = function() {
		// Static binding does never need to be updated, when models change
		return true;
	};

	StaticBinding.prototype.getValue = function() {
		return this.vValue;
	};

	StaticBinding.prototype.setValue = function(vValue) {
		if (vValue !== this.vValue) {
			this.vValue = vValue;
			this._fireChange({reason: ChangeReason.Change});
		}
	};

	StaticBinding.prototype.attachChange = function(fnFunction, oListener) {
		this.attachEvent("change", fnFunction, oListener);
	};

	StaticBinding.prototype.detachChange = function(fnFunction, oListener) {
		this.detachEvent("change", fnFunction, oListener);
	};

	return StaticBinding;
});
