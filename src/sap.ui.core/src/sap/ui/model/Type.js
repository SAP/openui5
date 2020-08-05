/*!
 * ${copyright}
 */

// Provides the base implementation for all type implementations
sap.ui.define(['sap/ui/base/Object'],
	function (BaseObject) {
	"use strict";

	/**
	 * Constructor for a new Type.
	 *
	 * @abstract
	 * @alias sap.ui.model.Type
	 * @author SAP SE
	 * @class This is an abstract base class for type objects.
	 *
	 * @extends sap.ui.base.Object
	 * @public
	 * @version ${version}
	 */
	var Type = BaseObject.extend("sap.ui.model.Type", /** @lends sap.ui.model.Type.prototype */ {

		constructor : function () {
			BaseObject.apply(this, arguments);
			this.sName = "Type";
		},

		metadata : {
			"abstract" : true
		}
	});

	/**
	 * Overrides the {@link sap.ui.base.Object#getInterface} to avoid creating an
	 * <code>Interface</code> object for types.
	 *
	 * @returns {object} this
	 * @public
	 */
	Type.prototype.getInterface = function () {
		return this;
	};

	/**
	 * Returns the name of this type.
	 *
	 * @return {string} The name of this type
	 *
	 * @public
	 */
	Type.prototype.getName = function () {
		return this.sName;
	};

	/**
	 * Returns a simple string representation of this type. Mainly useful for tracing purposes.
	 *
	 * @return {string} A string description of this type
	 *
	 * @public
	 */
	Type.prototype.toString = function () {
		return "Type " + this.getMetadata().getName();
	};

	return Type;
});