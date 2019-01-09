/*!
 * ${copyright}
 */
sap.ui.define([], function () {
	"use strict";

	/**
	 * Base class for all services.
	 * To inherit use the extend method <code>Service.extend<code>
	 * @class Service
	 * @experimental
	 */
	var Service = function () {
	};

	/**
	 * Extends a given constructor function Class with the Services methods.
	 * The extend method is passed on to the newly derived class for later reuse to subclass Class.
	 *
	 * @param {function} [Class] A constructor function of a class that should be inherited from service, if not given a default constructor is created
	 * @returns {function} The constructor function of the class
	 */
	Service.extend = function (Class) {
		if (!Class) {
			var that = this;
			Class = function () {
				that.apply(this, arguments);
			};
		}
		Class.prototype = Object.create(this.prototype);
		Class.prototype.constructor = Class;
		Class.extend = this.extend.bind(Class);

		return Class;
	};

	/**
	 * Expected by a consumer of a Service to check whether a given <code>oDataContext</code> is valid.
	 * @param {string|object} oDataContext an object that gives the service information about the target. It is either a url string or a dataStructure
	 * @returns {Promise} A promise that resolves with true if the service is available.
	 * @abstract
	 */
	Service.prototype.enabled = function (oDataContext) {
		return Promise.resolve(false);
	};

	Service.prototype.getInterface = function () {
		return this;
	};

	return Service;
});
