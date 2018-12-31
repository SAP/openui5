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

		//add static methods to allow expected and provided to be used
		Class.expected = this.expected;
		Class.provided = this.provided;
		Class.promise = this.promise;
		return Class;
	};

	Service.prototype.getInterface = function () {
		return this;
	};
	/**
	 * Mandatory method to allow a consumer to register to a service.
	 * With the <code>oConsumerInterface</code> object the consumer passes, the methods that will be called by the consumer on the service.
	 * Methods in the interface can be either provided or expected.
	 * - provided: the method is provided by the consumer and can be called (passed as a function in <code>oInterface</code>)
	 *             the service can call this methods. If the consumer did not provide the method and calls it an error is thrown.
	 *             It is up to the service implementation to decide to silently fail, handle or terminate the execution in this case.
	 * - expected: the method is expected by the consumer. If the service does not implement this method it will pass an notImplemented function that
	 *             throws an error. It is up to the consumer to decide to silently fail, handle or terminate the execution in this case.
	 *
	 * @param {object} oConsumerInterface the interface object of the consumer
	 * @returns {Promise} a promise that resolves after the service is ready to be used.
	 */
	Service.prototype.registerDependency = function (oConsumerInterface) {
		this._oConsumerInterface = oConsumerInterface;
		for (var n in oConsumerInterface) {
			connectInterface(this, n, oConsumerInterface);
		}
		return Promise.resolve();
	};
	Service.prototype.registerService = Service.prototype.registerDependency;


	//private functions
	/**
	 * Connects a <code>oConsumerInterface</code> to the service instance methods

	 * @param {Service} oInstance the instance of the service
	 * @param {string} sName the name of the property in the consumer interface to connect
	 * @param {object} oConsumerInterface the consumers interface object
	 */
	function connectInterface(oInstance, sName, oConsumerInterface) {
		if (oInstance.constructor.prototype[sName] === provided) {
			if (typeof oConsumerInterface[sName] === "function") {
				oInstance[sName] = oConsumerInterface[sName];
			} else {
				oConsumerInterface[sName] = provided.bind(oInstance, sName);
			}
		} else if (typeof oInstance[sName] === "function") {
			oConsumerInterface[sName] = oInstance[sName].bind(oInstance);
		} else {
			oConsumerInterface[sName] = expected.bind(oInstance, sName);
		}
	}

	function provided(sName) {
		throw new Error("Function '" + sName + "' was not provided by the consumer of the service. " +
			"The interface object oInterface of registerDependency needs to pass a function '" + sName + "'");
	}

	function expected(sName) {
		throw new Error("Function '" + sName + "' was expected to be implemented by this service.");
	}

	/**
	 * Can be used as placeholders for provided and expected functionality
	 * These 3 methods are implicitly added to the derived class as static methods for convenience in the derived implementation
	 *
	 */
	Service.provided = provided;
	Service.expected = expected;
	Service.promise = {
		notAvailable: function () { return Promise.reject(new Error("Not Available")); }
	};


	return Service;
});
