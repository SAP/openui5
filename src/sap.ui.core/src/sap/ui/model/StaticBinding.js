/*!
 * ${copyright}
 */

// Provides a static binding.
sap.ui.define([
	"./PropertyBinding",
	"./ChangeReason",
	"sap/base/assert",
	"sap/base/Log"
],
	function(
		PropertyBinding,
		ChangeReason,
		assert,
		Log
	) {
	"use strict";


	/**
	 * Constructor for StaticBinding
	 *
	 * @class
	 * The StaticBinding allows to define static values within a CompositeBinding. It behaves like a property
	 * binding but always returns the value, which is stored in the binding itself.
	 *
	 * @public
	 * @alias sap.ui.model.StaticBinding
	 * @extends sap.ui.model.PropertyBinding
	 */

	var StaticBinding = PropertyBinding.extend("sap.ui.model.StaticBinding", /** @lends sap.ui.model.StaticBinding.prototype */ {

		constructor : function (vValue) {
			PropertyBinding.apply(this, [null,""]);
			this.vValue = vValue;
		},
		metadata : {

		  publicMethods : [
				"attachChange", "detachChange"
		  ]
		}

	});

	StaticBinding.prototype.getPath = function() {
		assert(null, "Static Binding has no path!");
		return null;
	};

	StaticBinding.prototype.getModel = function() {
		assert(null, "Static Binding has no model!");
		return null;
	};

	StaticBinding.prototype.getContext = function() {
		assert(null, "Static Binding has no context!");
		return null;
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
