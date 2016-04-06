/*!
 * ${copyright}
 */

// Provides class sap.ui.core.service.ServiceFactory
sap.ui.define(['jquery.sap.global', 'sap/ui/base/Object', './Service'],
	function(jQuery, BaseObject, Service) {
	"use strict";


	/**
	 * Creates a Service Factory.
	 * @param {function} [fnService] A constructor function of a Service.
	 *
	 * @class
	 * A Service Factory is used to create Service instances for a specific context.
	 * The Service Factory needs to be registered in a central
	 * {@link sap.ui.core.service.ServiceFactoryRegistry Service Factory Registry}.
	 * Consumers of Services require the Service Factory to create Service instances.
	 * <p>
	 * The Service Factory base class can be used in a generic way to act as a
	 * Factory for any Service:
	 * <pre>
	 * sap.ui.core.service.ServiceFactoryRegistry.register(
	 *   new sap.ui.core.service.ServiceFactory(my.Service)
	 * );
	 * </pre>
	 * <p>
	 * Additionally a concrete Service Factory can be implemented by extending the
	 * Service Factory base class if additional functionality is needed when
	 * creating new instances for a specific context:
	 * <pre>
	 * sap.ui.core.service.ServiceFactory.extend("my.ServiceFactory", {
	 *   createInstance: function(oServiceContext) {
	 *     return Promise.resolve(new my.Service());
	 *   }
	 * });
	 * </pre>
	 * As <code>createInstance</code> returns a <code>Promise</code> e.g. the
	 * Service module can also be loaded asynchronously and resolve once the
	 * module has been loaded and instantiated.
	 *
	 * @extends sap.ui.base.Object
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.core.service.ServiceFactory
	 * @sap-restricted sap.ushell
	 * @private
	 * @since 1.37.0
	 */
	var ServiceFactory = BaseObject.extend("sap.ui.core.service.ServiceFactory", /** @lends sap.ui.service.ServiceFactory.prototype */ {

		metadata: {
			"library" : "sap.ui.core" // UI Library that contains this class
		},

		constructor : function(fnService) {

			BaseObject.apply(this);

			jQuery.sap.assert(!fnService || fnService && typeof fnService === "function", "The Service constructor either should be undefined or a constructor function!");

			this._fnService = fnService;

		}

	});


	/**
	 * Creates a new instance of a Service. When used as a generic Service Factory
	 * by providing a Service constructor function it will create a new Service
	 * instance otherwise the function will fail. For custom Service Factories
	 * this function has to be overridden and should return a Promise.
	 *
	 * @param {object} oServiceContext a Service context
	 * @param {object} oServiceContext.scopeObject the scope object (e.g. component instance)
	 * @param {object} oServiceContext.scopeType the scope type (e.g. component, ...)
	 * @return {Promise} A Promise which resolves with the new Service instance.
	 * @protected
	 */
	ServiceFactory.prototype.createInstance = function(oServiceContext) {
		if (typeof this._fnService === "function") {
			return Promise.resolve(new this._fnService(oServiceContext));
		} else {
			return Promise.reject(new Error("Usage of sap.ui.core.service.ServiceFactory requires a Service constructor function to create a new Service instance!"));
		}
	};


	return ServiceFactory;


});
