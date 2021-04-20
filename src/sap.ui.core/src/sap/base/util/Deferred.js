/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * @class Creates a <code>Deferred</code> instance which represents a future value.
	 *
	 * While a <code>Promise</code> can only be resolved or rejected by calling the respective methods in its constructor, a <code>Deferred</code>
	 * can be resolved or rejected via <code>resolve</code> or <code>reject</code> methods at any point.
	 * A <code>Deferred</code> object creates a <code>Promise</code> instance which functions as a proxy for the future result.
	 * This <code>Promise</code> object can be accessed via the <code>promise</code> property of the <code>Deferred</code> object.
	 *
	 * @alias module:sap/base/util/Deferred
	 * @since 1.90
	 * @public
	 */
	var Deferred = function() {
		var that = this;

		/**
		 * Promise instance of the Deferred
		 *
		 * @type {Promise}
		 * @public
		 */
		this.promise = new Promise(function(resolve, reject) {
			that.resolve = resolve;
			that.reject = reject;
		});
	};

	/**
	 * Proxy call to the <code>resolve</code> method of the wrapped Promise
	 *
	 * @name module:sap/base/util/Deferred#resolve
	 * @param {any} [value] Fulfillment value
	 * @function
	 * @public
	 */

	/**
	 * Proxy call to the <code>reject</code> method of the wrapped Promise
	 *
	 * @name module:sap/base/util/Deferred#reject
	 * @param {any} [reason] Failure reason
	 * @function
	 * @public
	 */

	return Deferred;

});
