/*!
 * ${copyright}
 */

// Provides class sap.ui.core.service.Service
sap.ui.define(['jquery.sap.global', 'sap/ui/base/Interface', 'sap/ui/base/Object'],
	function(jQuery, Interface, BaseObject) {
	"use strict";


	/**
	 * Creates a service for the given context.
	 *
	 * @param {object} oServiceContext a Service context
	 * @param {object} oServiceContext.scopeObject the scope object (e.g. component instance)
	 * @param {object} oServiceContext.scopeType the scope type (e.g. component, ...)
	 *
	 * @class
	 * A Service provides a specific functionality. A Service instance can be obtained
	 * by a {@link sap.ui.core.service.ServiceFactory ServiceFactory} or at a Component
	 * via {@link sap.ui.core.Component#getService getService} function.
	 * <p>
	 * This class is the abstract base class for Services and needs to be extended:
	 * <pre>
	 * sap.ui.core.service.Service.extend("my.Service", {
	 *
	 *   init: function() {
	 *     // handle init lifecycle
	 *   },
	 *
	 *   exit: function() {
	 *     // handle exit lifecycle
	 *   },
	 *
	 *   doSomething: function() {
	 *     // some functionality
	 *   }
	 *
	 * });
	 * </pre>
	 * <p>
	 * A Service instance will have a Service context:
	 * <pre>
	 * {
	 *   "scopeObject": oComponent, // the Component instance
	 *   "scopeType": "component"   // the stereotype of the scopeObject
	 * }
	 * </pre>
	 * <p>
	 * The Service context can be retrieved with the function <code>getContext</code>.
	 * This function is private to the Service instance and will not be exposed via
	 * the Service interface.
	 * <p>
	 * For consumers of the Service it is recommended to provide the Service instance
	 * only - as e.g. the {@link sap.ui.core.Component#getService getService} function
	 * of the Component does. The Service interface can be accessed via the
	 * <code>getInterface</code> function.
	 * <p>
	 * Other private functions of the Service instance are the lifecycle functions.
	 * Currently there are two lifecycle functions: <code>init</code> and <code>exit</code>.
	 * In addition the <code>destroy</code> function will also by hidden to avoid
	 * the control of the Service lifecycle for Service interface consumers.
	 *
	 * @extends sap.ui.base.Object
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.core.service.Service
	 * @abstract
	 * @sap-restricted sap.ushell
	 * @private
	 * @since 1.37.0
	 */
	var Service = BaseObject.extend("sap.ui.core.service.Service", /** @lends sap.ui.service.Service.prototype */ {

		metadata: {
			"abstract" : true,
			"library" : "sap.ui.core" // UI Library that contains this class
		},

		constructor : function(oServiceContext) {

			BaseObject.apply(this);

			jQuery.sap.assert(oServiceContext && typeof oServiceContext.scopeObject === "object", "The service context requires a scope object!");
			jQuery.sap.assert(oServiceContext && typeof oServiceContext.scopeType === "string", "The service context requires a scope type!");

			this._oServiceContext = oServiceContext;

			// call the init lifecycle function
			if (typeof this.init === "function") {
				this.init();
			}

		}

	});


	/**
	 * Returns the public interface of the Service.
	 * <p>
	 * This function is not available on the Service interface.
	 *
	 * @return {sap.ui.base.Interface} the public interface of the Service
	 * @protected
	 */
	Service.prototype.getInterface = function() {
		// avoid adding lifecycle methods to Interface to e.g. prevent usage of destroy for consumers
		var aAllPublicMethods = this.getMetadata().getAllPublicMethods();
		aAllPublicMethods = aAllPublicMethods.filter(function(sMethod, iIndex) {
			return !sMethod.match(/^getContext$|^destroy$/);
		});
		// copied from @see sap.ui.base.Object#getInterface
		var oInterface = new Interface(this, aAllPublicMethods);
		this.getInterface = jQuery.sap.getter(oInterface);
		return oInterface;
	};

	/**
	 * Returns the context of the Service:
	 * <pre>
	 * {
	 *   "scopeObject": oComponent, // the Component instance
	 *   "scopeType": "component"   // the stereotype of the scopeObject
	 * }
	 * </pre>
	 * <p>
	 * This function is not available on the Service interface.
	 *
	 * @return {object} The context of the Service
	 * @protected
	 */
	Service.prototype.getContext = function() {
		return this._oServiceContext;
	};

	/**
	 * Lifecycle method to destroy the Service instance.
	 * <p>
	 * This function is not available on the Service interface.
	 *
	 * @protected
	 */
	Service.prototype.destroy = function() {

		// call the exit lifecycle function
		if (typeof this.exit === "function") {
			this.exit();
		}

		BaseObject.prototype.destroy.apply(this, arguments);
		delete this._oServiceContext;

	};


	/**
	 * Initializes the Service instance after creation.
	 *
	 * Applications must not call this hook method directly, it is called by the
	 * framework while the constructor of an Service is executed.
	 *
	 * Subclasses of Service should override this hook to implement any necessary
	 * initialization.
	 *
	 * @function
	 * @name sap.ui.core.service.Service.prototype.init
	 * @protected
	 */
	//Service.prototype.init = function() {};


	/**
	 * Cleans up the Service instance before destruction.
	 *
	 * Applications must not call this hook method directly, it is called by the
	 * framework when the element is {@link #destroy destroyed}.
	 *
	 * Subclasses of Service should override this hook to implement any necessary
	 * cleanup.
	 *
	 * @function
	 * @name sap.ui.core.service.Service.prototype.exit
	 * @protected
	 */
	//Service.prototype.exit = function() {};


	return Service;


});
