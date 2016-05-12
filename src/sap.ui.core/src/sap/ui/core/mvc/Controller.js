/*!
 * ${copyright}
 */

// Provides base class for controllers (part of MVC concept)
sap.ui.define(['jquery.sap.global', 'sap/ui/base/EventProvider', 'sap/ui/base/ManagedObject'],
	function(jQuery, EventProvider, ManagedObject) {
	"use strict";



		var mRegistry = {};

		/**
		 * Instantiates a (MVC-style) controller. Consumers should call the constructor only in the
		 * typed controller scenario. In the generic controller use case, they should use
		 * {@link sap.ui.controller} instead.
		 *
		 * @class A generic controller implementation for the UI5 Model-View-Controller concept.
		 *
		 * Can either be used as a generic controller which is enriched on the fly with methods
		 * and properties (see {@link sap.ui.controller}) or  as a base class for typed controllers.
		 *
		 * @param {string|object[]} sName The name of the controller to instantiate. If a controller is defined as real sub-class,
		 *                                   the "arguments" of the sub-class constructor should be given instead.
		 * @public
		 * @alias sap.ui.core.mvc.Controller
		 * @extends sap.ui.base.EventProvider
		 */
		var Controller = EventProvider.extend("sap.ui.core.mvc.Controller", /** @lends sap.ui.core.mvc.Controller.prototype */ {

			constructor : function(sName) {
				var oToExtend = null;
				if (typeof (sName) == "string") {
					/* TODO the whole if block is unnecessary, if constructor is really private (as documented) */
					if (!mRegistry[sName]) {
						jQuery.sap.require({modName: sName, type: "controller"}); // maybe there is a controller definition, but it has not been loaded yet -> try to load

						if (!mRegistry[sName]) {
							throw new Error("Controller type " + sName + " is still undefined after trying to load it.");
						}
					}
					oToExtend = mRegistry[sName];
				}

				EventProvider.apply(this,arguments);

				if (oToExtend) {
					jQuery.extend(this, mRegistry[sName]);
				}

			}

		});

		// define call order of lifecycle methods for extensions
		// "true" means original before, "false" means original afterwards
		var mControllerLifecycleMethods = {
			"onInit": true,
			"onExit": false,
			"onBeforeRendering": false,
			"onAfterRendering": true
		};

		function mixinControllerDefinition(oController, oCustomControllerDef) {
			/*eslint-disable no-loop-func */
			for (var memberName in oCustomControllerDef) { // TODO: check whether it is a function? This does not happen until now, so rather not.

				if (mControllerLifecycleMethods[memberName] !== undefined) {
					// special handling for lifecycle methods
					var fnOri = oController[memberName];
					if (fnOri && typeof fnOri === "function") {
						// use closure to keep correct values inside overridden function
						(function(fnCust, fnOri, bOriBefore){
							oController[memberName] = function() {
								// call original function before or after the custom one
								// depending on the lifecycle method (see mControllerLifecycleMethods object above)
								if (bOriBefore) {
									fnOri.apply(oController, arguments);
									fnCust.apply(oController, arguments);
								} else {
									fnCust.apply(oController, arguments);
									fnOri.apply(oController, arguments);
								}
							};
						})(oCustomControllerDef[memberName], fnOri, mControllerLifecycleMethods[memberName]);
					} else {
						oController[memberName] = oCustomControllerDef[memberName];
					}

				} else {
					// other methods just override the original implementation
					oController[memberName] = oCustomControllerDef[memberName];
				}
			}
			/*eslint-enable no-loop-func */
		}

		/**
		 * This function can be used to extend a controller with controller
		 * extensions defined in the Customizing configuration or with the
		 * controller extensions returned by controller extension provider.
		 *
		 * @param {object|sap.ui.core.mvc.Controller} Controller to extend
		 * @param {string} Name of the controller
		 * @param {boolean} If set to true, extension will be run in async mode
		 * @return {sap.ui.core.mvc.Controller|Promise} A <code>Promise</code> in case of asynchronous extend
		 *           or the <code>controller</code> in case of synchronous extend
		 *
		 * @since 1.33.0
		 * @private
		 */
		Controller.extendIfRequired = function(oController, sName, bAsync) {
			var oCustomControllerDef;

			var CustomizingConfiguration = sap.ui.require('sap/ui/core/CustomizingConfiguration');
			if (CustomizingConfiguration) {
				var controllerExtensionConfig = CustomizingConfiguration.getControllerExtension(sName, ManagedObject._sOwnerId);
				if (controllerExtensionConfig) {
					var sExtControllerName = typeof controllerExtensionConfig === "string" ? controllerExtensionConfig : controllerExtensionConfig.controllerName;

					// create a list of controller names which will be used to extend this controller
					var aControllerNames = controllerExtensionConfig.controllerNames || [];
					if (sExtControllerName) {
						sExtControllerName && aControllerNames.unshift(sExtControllerName);
					}

					for (var i = 0, l = aControllerNames.length; i < l; i++) {
						var sControllerName = aControllerNames[i];

						// avoid null values for controllers to be handled here!
						if (typeof sControllerName === "string") {

							jQuery.sap.log.info("Customizing: Controller '" + sName + "' is now extended by '" + sControllerName + "'");

							// load controller definition if required; first check whether already available...
							if ( !mRegistry[sControllerName] && !jQuery.sap.getObject(sControllerName) ) {
								// ...if not, try to load an external controller definition module
								jQuery.sap.require({modName: sControllerName, type: "controller"});
							}
							if ( !mRegistry[sControllerName] && !jQuery.sap.getObject(sControllerName) ) {
								// still not defined? this means there was not the correct controller in the file
								jQuery.sap.log.error("Attempt to load Extension Controller " + sControllerName + " was not successful - is the Controller correctly defined in its file?");
							}

							if ((oCustomControllerDef = mRegistry[sControllerName]) !== undefined) { //variable init, not comparison!
								mixinControllerDefinition(oController, oCustomControllerDef);
							}// else {
								// FIXME: what to do for typed controllers?
							//}

						}

					}

				} else {
					jQuery.sap.log.debug("Customizing: no Controller extension found for Controller '" + sName + "'.");
				}

			}

			// coding extensibility via extension provider hook
			if (Controller._sExtensionProvider) {
				jQuery.sap.require(Controller._sExtensionProvider);
				var ExtensionProvider = jQuery.sap.getObject(Controller._sExtensionProvider);
				if (ExtensionProvider) {

					jQuery.sap.log.info("Customizing: Controller '" + sName + "' is now extended by Controller Extension Provider '" + Controller._sExtensionProvider + "'");

					var oExtensionProvider = new ExtensionProvider();
					var oExtensions = oExtensionProvider.getControllerExtensions(sName /* controller name */, ManagedObject._sOwnerId /* component ID / clarfiy if this is needed? */, bAsync);
					if (oExtensions instanceof Promise) {
						// in async mode, oExtensions has to be resolved before the controller extensions are mixed in
						return oExtensions.then(function(aControllerExtensions) {
							if (aControllerExtensions && aControllerExtensions.length) {
								for (var i = 0, l = aControllerExtensions.length; i < l; i++) {
									mixinControllerDefinition(oController, aControllerExtensions[i]);
								}
							}
							return oController;
						},function(err){
							jQuery.sap.log.error("Controller Extension Provider: Error '" + err + "' thrown in " + Controller._sExtensionProvider + "; extension provider ignored.");
							return oController;
						});
					} else {
						// in sync mode, oExtensions is an array of controller extensions
						if (oExtensions && oExtensions.length) {
							for (var i = 0, l = oExtensions.length; i < l; i++) {
								mixinControllerDefinition(oController, oExtensions[i]);
							}
						}
					}
				} else {
					jQuery.sap.log.error("Controller Extension Provider: Extension Provider " + Controller._sExtensionProvider + " could not be found");
				}
			}

			return oController;
		};

		/**
		 * Defines a controller class or creates an instance of an already defined controller class.
		 *
		 * When a name and a controller implementation object is given, a new controller class
		 * of the given name is created. The members of the implementation object will be copied
		 * into each new instance of that controller class (shallow copy).
		 * <b>Note</b>: as the members are shallow copied, controller instances will share all object values.
		 * This might or might not be what applications expect.
		 *
		 * If only a name is given, a new instance of the named controller class is returned.
		 *
		 * @param {string} sName The controller name
		 * @param {object} [oControllerImpl] An object literal defining the methods and properties of the controller
		 * @return {void | sap.ui.core.mvc.Controller} void or the new controller instance, depending on the use case
		 * @public
		 */
		sap.ui.controller = function(sName, oControllerImpl) {
			if (!sName) {
				throw new Error("Controller name ('sName' parameter) is required");
			}

			if (!oControllerImpl) {
				// controller *instantiation*

				// check if controller is available, either anonymous or typed
				if ( !mRegistry[sName] && !jQuery.sap.getObject(sName) ) {
					// if not, try to load an external controller definition module
					jQuery.sap.require({modName: sName, type: "controller"});
				}

				if ( mRegistry[sName] ) {
					// anonymous controller
					return new Controller(sName);
				} else {
					var CTypedController = jQuery.sap.getObject(sName);
					if ( typeof CTypedController === "function" && CTypedController.prototype instanceof Controller ) {
						// typed controller
						return new CTypedController();
					}
				}
				throw new Error("Controller " + sName + " couldn't be instantiated");

			} else {
				// controller *definition*
				mRegistry[sName] = oControllerImpl;
			}

		};

		/**
		 * Returns the view associated with this controller or undefined.
		 * @return {sap.ui.core.mvc.View} View connected to this controller.
		 * @public
		 */
		Controller.prototype.getView = function() {
			return this.oView;
		};

		/**
		 * Returns an Element of the connected view with the given local ID.
		 *
		 * Views automatically prepend their own ID as a prefix to created Elements
		 * to make the IDs unique even in the case of multiple view instances.
		 * This method helps to find an element by its local ID only.
		 *
		 * If no view is connected or if the view doesn't contain an element with
		 * the given local ID, undefined is returned.
		 *
		 * @param {string} sId View-local ID
		 * @return {sap.ui.core.Element} Element by its (view local) ID
		 * @public
		 */
		Controller.prototype.byId = function(sId) {
			return this.oView ? this.oView.byId(sId) : undefined;
		};


		/**
		 * Converts a view local ID to a globally unique one by prepending
		 * the view ID.
		 *
		 * If no view is connected, undefined is returned.
		 *
		 * @param {string} sId View-local ID
		 * @return {string} Prefixed ID
		 * @public
		 */
		Controller.prototype.createId = function(sId) {
			return this.oView ? this.oView.createId(sId) : undefined;
		};

		/**
		 * Gets the component of the controller's view
		 *
		 * If there is no Component connected to the view or the view is not connected to the controller,
		 * undefined is returned.
		 *
		 * @return {sap.ui.core.Component} Component instance
		 * @since 1.23.0
		 * @public
		 */
		Controller.prototype.getOwnerComponent = function () {
			var Component = sap.ui.requireSync("sap/ui/core/Component");
			return Component.getOwnerComponentFor(this.getView());
		};


		Controller.prototype.connectToView = function(oView) {
			this.oView = oView;

			if (this.onInit) {
				oView.attachAfterInit(this.onInit, this);
			}
			if (this.onExit) {
				oView.attachBeforeExit(this.onExit, this);
			}
			if (this.onAfterRendering) {
				oView.attachAfterRendering(this.onAfterRendering, this);
			}
			if (this.onBeforeRendering) {
				oView.attachBeforeRendering(this.onBeforeRendering, this);
			}
			//oView.addDelegate(this);
		};


		/**
		 * Global extension provider name which will be used to create the
		 * instance of the extension provider.
		 *
		 * @private
		 */
		Controller._sExtensionProvider = null;


		/**
		 * Registers a callback module, which provides code enhancements for the
		 * lifecycle and event handler functions of a specific controller. The code
		 * enhancements are returned either in sync or async mode.
		 *
		 * The extension provider module provides the <code>getControllerExtensions</code> function
		 * which returns either directly an array of objects or a Promise that returns an array
		 * of objects when it resolves. These objects are object literals defining the
		 * methods and properties of the controller in a similar way as {@link sap.ui.controller}.
		 *
		 *
		 * <b>Example for a callback module definition (sync):</b>
		 * <pre>
		 * sap.ui.define("my/custom/sync/ExtensionProvider", ['jquery.sap.global'], function(jQuery) {
		 *   var ExtensionProvider = function() {};
		 *   ExtensionProvider.prototype.getControllerExtensions = function(sControllerName, sComponentId, bAsync) {
		 *     if (!bAsync && sControllerName == "my.own.Controller") {
		 *       // IMPORTANT: only return extensions for a specific controller
		 *       return [{
		 *         onInit: function() {
		 *           // Do something here...
		 *         },
		 *         onAfterRendering: function() {
		 *           // Do something here...
		 *         },
		 *         onButtonClick: function(oEvent) {
		 *           // Handle the button click event
		 *         }
		 *       }
		 *     }];
		 *   };
		 *   return ExtensionProvider;
		 * }, true);
		 * </pre>
		 *
		 *
		 * <b>Example for a callback module definition (async):</b>
		 * <pre>
		 * sap.ui.define("my/custom/async/ExtensionProvider", ['jquery.sap.global'], function(jQuery) {
		 *   var ExtensionProvider = function() {};
		 *   ExtensionProvider.prototype.getControllerExtensions = function(sControllerName, sComponentId, bAsync) {
		 *     if (bAsync && sControllerName == "my.own.Controller") {
		 *       // IMPORTANT:
		 *       // only return a Promise for a specific controller since it
		 *       // requires the View/Controller and its parents to run in async
		 *       // mode!
		 *       return new Promise(function(fnResolve, fnReject) {
		 *         fnResolve([{
		 *           onInit: function() {
		 *             // Do something here...
		 *           },
		 *           onAfterRendering: function() {
		 *             // Do something here...
		 *           },
		 *           onButtonClick: function(oEvent) {
		 *             // Handle the button click event
		 *           }
		 *         }]);
		 *       }
		 *     };
		 *   };
		 *   return ExtensionProvider;
		 * }, true);
		 * </pre>
		 *
		 *
		 * The lifecycle functions <code>onInit</code>, <code>onExit</code>,
		 * <code>onBeforeRendering</code> and <code>onAfterRendering</code>
		 * are added before or after the lifecycle functions of the original
		 * controller. The event handler functions, such as <code>onButtonClick</code>,
		 * are replacing the original controller's function.
		 *
		 * When using an async extension provider you need to ensure that the
		 * view is loaded in async mode.
		 *
		 * In both cases, return <code>undefined</code> if no controller extension shall be applied.
		 *
		 * @param {string} sExtensionProvider the module name of the extension provider
		 *
		 * @see sap.ui.controller for an overview of the available functions for controllers
		 * @since 1.34.0
		 * @public
		 */
		Controller.registerExtensionProvider = function(sExtensionProvider) {
			Controller._sExtensionProvider = sExtensionProvider;
		};


		/**
		 * This method is called upon initialization of the View. The controller can perform its internal setup in
		 * this hook. It is only called once per View instance, unlike the onBeforeRendering and onAfterRendering
		 * hooks.
		 * (Even though this method is declared as "abstract", it does not need to be defined in controllers, if the
		 * method does not exist, it will simply not be called.)
		 *
		 * @function
		 * @name sap.ui.core.mvc.Controller.prototype.onInit
		 * @abstract
		 * @protected
		 */

		/**
		 * This method is called upon desctuction of the View. The controller should perform its internal destruction in
		 * this hook. It is only called once per View instance, unlike the onBeforeRendering and onAfterRendering
		 * hooks.
		 * (Even though this method is declared as "abstract", it does not need to be defined in controllers, if the
		 * method does not exist, it will simply not be called.)
		 *
		 * @function
		 * @name sap.ui.core.mvc.Controller.prototype.onExit
		 * @abstract
		 * @protected
		 */

		/**
		 * This method is called every time the View is rendered, before the Renderer is called and the HTML is placed in
		 * the DOM-Tree. It can be used to perform clean-up-tasks before re-rendering.
		 * (Even though this method is declared as "abstract", it does not need to be defined in controllers, if the
		 * method does not exist, it will simply not be called.)
		 *
		 * @see sap.ui.core.Control.prototype.onBeforeRendering
		 *
		 * @function
		 * @name sap.ui.core.mvc.Controller.prototype.onBeforeRendering
		 * @abstract
		 * @protected
		 */

		/**
		 * This method is called every time the View is rendered, after the HTML is placed in the DOM-Tree. It can be
		 * used to apply additional changes to the DOM after the Renderer has finished.
		 * (Even though this method is declared as "abstract", it does not need to be defined in controllers, if the
		 * method does not exist, it will simply not be called.)
		 *
		 * @see sap.ui.core.Control.prototype.onAfterRendering
		 *
		 * @function
		 * @name sap.ui.core.mvc.Controller.prototype.onAfterRendering
		 * @abstract
		 * @protected
		 */
	return Controller;

});
