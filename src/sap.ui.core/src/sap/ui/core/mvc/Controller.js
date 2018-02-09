/*!
 * ${copyright}
 */

// Provides base class for controllers (part of MVC concept)
sap.ui.define(['jquery.sap.global', 'sap/ui/base/EventProvider', 'sap/ui/base/ManagedObject'],
	function(jQuery, EventProvider, ManagedObject) {
	"use strict";



		var mRegistry = {};
		var mExtensionProvider = {};

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
		 *
		 * @public
		 * @alias sap.ui.core.mvc.Controller
		 * @extends sap.ui.base.EventProvider
		 */
		var Controller = EventProvider.extend("sap.ui.core.mvc.Controller", /** @lends sap.ui.core.mvc.Controller.prototype */ {

			constructor : function(sName) {
				var oToExtend = null;
				if (typeof (sName) == "string") {
					if (!mRegistry[sName]) {
						jQuery.sap.log.warning("Do not call sap.ui.core.mvc.Controller constructor for non typed scenario!");
					}
					oToExtend = mRegistry[sName];
				}
				EventProvider.apply(this,arguments);

				if (oToExtend) {
					jQuery.extend(this, mRegistry[sName]);
				}

				if (this.extension) {
					throw new Error("The keyword 'extension' cannot be used as a member of a controller");
				}

				this["_sapui_Extensions"] = [];
			},
			metadata: {
				publicMethods: [
					"byId",
					"getView"
				]
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

		/**
		 * extended lifecycle methods
		 *
		 * @param {string} sMemberName The name of the function
		 * @param {sap.ui.core.mvc.Controller} oController The controller to extend
		 * @param {sap.ui.core.mvc.ControllerExtension|object} oCustomControllerDef The controller extension
		 * @param {} ????
		 * @private
		 */
		function extendLifecycleMethod(sMemberName, oController, oCustomControllerDef, fn) {
			if (mControllerLifecycleMethods[sMemberName] !== undefined) {
				// special handling for lifecycle methods
				var fnOri = oController[sMemberName];
				if (fnOri && typeof fnOri === "function") {
					// use closure to keep correct values inside overridden function
					(function(fnCust, fnOri, bOriBefore){
						oController[sMemberName] = function() {
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
					})(fn || oCustomControllerDef[sMemberName], fnOri, mControllerLifecycleMethods[sMemberName]);
				}
				return true;
			}
			return false;
		}

		/**
		 * Apply extension to controller
		 *
		 * @param {sap.ui.core.mvc.Controller} oController The controller to extend
		 * @param {sap.ui.core.mvc.ControllerExtension|object} oCustomControllerDef The controller extension
		 * @param {string} [sLocalNamespace] Extensions could be applied to a local namespace. Do so if passed
		 * @private
		 */
		function applyExtension(oController, oExtension, sLocalNamespace) {
			//create the controller extension object
			var sNamespace = oExtension.getMetadata().getName();
			var aExtensions = oController["_sapui_Extensions"];
			var oExtensionInfo = {
				namespace: sNamespace,
				extension: oExtension,
				reloadNeeded: false
			};

			aExtensions.push(oExtensionInfo);

			var oExtensionInterface = oExtension.getInterface();

			oExtension._setController(oController.getInterface()); //only allow access to public methods of the main controller

			if (oExtension._hasOverrides()) {
				//override the original controller methods for the entries in the "override" setting of the controller extension
				var sExtensionOverride,
					oOverrides = oExtension._getOverrides();

				for (var sOverrideMember in oOverrides) {
					if (sOverrideMember in oExtension.base) {
						jQuery.sap.log.debug("Overriding  member '" + sOverrideMember + "' of original controller.");
						var vMember = oOverrides[sOverrideMember];
						var fnOriginal = oController[sOverrideMember];
						if (typeof fnOriginal == "object" && typeof vMember == "object") {
							//override extension member methods
							for (sExtensionOverride in vMember) {
								fnOriginal[sExtensionOverride] = vMember[sExtensionOverride].bind(oExtension);
							}
						} else {
							//override method runs in the context of the extension
							oController[sOverrideMember] = vMember.bind(oExtension);
						}
					}
				}
				if (oOverrides.extension) {
					//allow to override methods of other controller extensions
					for (var sExtensionNamespace in oOverrides.extension) {
						var oOrigExtension = jQuery.sap.getObject(sExtensionNamespace, null, oController.extension);
						var oExtensionOverrides = oOverrides.extension[sExtensionNamespace];
						for (sExtensionOverride in oExtensionOverrides) {
							oOrigExtension[sExtensionOverride]	= oExtensionOverrides[sExtensionOverride].bind(oExtension);
						}
					}
				}
				oExtensionInfo.reloadNeeded = true;
			}

			for (var sMember in oExtension) {
				var oMember =  oExtension[sMember];
				if (sMember in mControllerLifecycleMethods) {
					//extend lifecycle methods
					extendLifecycleMethod(sMember, oController, oExtension, oMember.bind(oExtension));
					oExtensionInfo.reloadNeeded = true;
				}
			}

			if (sLocalNamespace) {
				oExtensionInfo.location = sLocalNamespace;
				oController[sLocalNamespace] = oExtension.getInterface();
			} else {
				oExtensionInfo.location = "extension." + sNamespace;
				jQuery.sap.setObject("extension." + sNamespace, oExtensionInterface, oController);
			}
		}

		/*
		 * Mixin controller extensions
		 * @param {sap.ui.core.mvc.Controller} oController The controller to apply the extensions
		 * @param {object} oCustomControllerDef The controller extension definition
		 * @private
		 */
		function mixinControllerDefinition(oController, CustomControllerDef, sLocalNameSpace) {
			if (CustomControllerDef.getMetadata &&
				CustomControllerDef.getMetadata().isInstanceOf("sap.ui.core.mvc.IControllerExtension")) {
				//create ControllerExtension instance
				var oControllerExtension = new CustomControllerDef();
				applyExtension(oController, oControllerExtension, sLocalNameSpace);
			} else {
				for (var sMemberName in CustomControllerDef) { // TODO: check whether it is a function? This does not happen until now, so rather not.
					if (sMemberName in mControllerLifecycleMethods) {
						extendLifecycleMethod(sMemberName, oController, CustomControllerDef);
					} else {
						//default extension behavior
						oController[sMemberName] = CustomControllerDef[sMemberName];
					}
				}
			}
		}

		/* load controller class
		 *
		 * @param {string} sName the controller name
		 * @param {boolean} bAsync Load async or not
		 * @return {{sap.ui.core.mvc.Controller | Promise} oController <code>Promise</code> in case of asynchronous loading
		 *           or <code>undefined</code> in case of synchronous loading
		 */
		function loadControllerClass(sName, bAsync) {
			if (!sName) {
				throw new Error("Controller name ('sName' parameter) is required");
			}

			var sControllerName = sName.replace(/\./g, "/"),
				ControllerClass = resolveClass(sap.ui.require(sControllerName));

			function resolveClass(ControllerClass) {
				if (ControllerClass) {
					return ControllerClass;
				} else if (mRegistry[sName]) {
					return Controller;
				} else {
					//legacy controller
					return jQuery.sap.getObject(sName);
				}
			}

			sControllerName = sControllerName + ".controller";

			if (bAsync) {
				return new Promise(function(resolve, reject) {
					if (!ControllerClass) {
						sap.ui.require([sControllerName], function (ControllerClass) {
							resolve(resolveClass(ControllerClass));
						});
					} else {
						resolve(ControllerClass);
					}
				});
			} else if (!ControllerClass) {
				ControllerClass = sap.ui.requireSync(sControllerName);
				return resolveClass(ControllerClass);
			} else {
				return ControllerClass;
			}
		}

		/* load extension provider
		 *
		 * @param {sap.ui.core.mvc.Controller} oController The controller instance
		 * @param {boolean} bAsync Load async or not
		 * @return {ExtensionProvider|Promise|undefined} ExtensionProvider <code>Promise</code> in case of asynchronous loading
		 *           or the <code>ExtensionProvider</code> in case of synchronous loading or undefined in case no provider exists
		 */
		function loadExtensionProvider(oController, bAsync) {
			var sProviderName = Controller._sExtensionProvider.replace(/\./g, "/"),
				oProvider = mExtensionProvider[sProviderName];
			if (bAsync) {
				return new Promise(function(resolve, reject) {
					if (sProviderName) {
						if (oProvider){
							resolve(oProvider);
						} else {
							sap.ui.require([sProviderName], function(ExtensionProvider) {
								oProvider = new ExtensionProvider();
								mExtensionProvider[sProviderName] = oProvider;
								resolve(oProvider);
							});
						}
					} else {
						resolve();
					}
				});
			} else if (sProviderName) {
				if (oProvider) {
					return oProvider;
				} else {
					var ExtensionProvider = sap.ui.requireSync(sProviderName);
					oProvider = new ExtensionProvider();
					mExtensionProvider[sProviderName] = oProvider;
					return oProvider;
				}
			}
		}

		/*
		 * Instantiation of a controller
		 *
		 * @param {function} ControllerClass The controller constructor
		 * @param {string} sName the controller name
		 * @param {boolean} bAsync Load async or not
		 * @return {sap.ui.core.mvc.Controller|Promise} A <code>Promise</code> in case of asynchronous extend
		 *           or the <code>controller</code> in case of synchronous extend
		 *
		 */
		function instantiateController(ControllerClass, sName) {
			var oController;
			if (mRegistry[sName]) {
				oController = new ControllerClass(sName);
			} else {
				oController = new ControllerClass();
			}
			if (!oController) {
				throw new Error("Controller " + sName + " couldn't be instantiated");
			}
			return oController;
		}

		/**
		 * applay extension if passed as a member of the controller
		 * @param {sap.ui.core.mvc.Controller} oController The controller instance
		 * @param {boolean} bAsync Wether extend async or not
		 * @private
		 */
		Controller.extendByMember = function(oController, bAsync) {
			for (var sMember in oController) {
				if (oController[sMember] &&
					oController[sMember].getMetadata &&
					oController[sMember].getMetadata().isInstanceOf("sap.ui.core.mvc.IControllerExtension")) {
					mixinControllerDefinition(oController, oController[sMember], sMember);
				}
			}
			if (bAsync) {
				return Promise.resolve(oController);
			} else {
				return oController;
			}
		};

		/*
		 * This function can be used to extend a controller with controller
		 * extensions defined in the Customizing configuration.
		 *
		 * @param {object|sap.ui.core.mvc.Controller} Controller to extend
		 * @param {string} Name of the controller
		 * @param {boolean} If set to true, extension will be run in async mode
		 * @return {sap.ui.core.mvc.Controller|Promise} A <code>Promise</code> in case of asynchronous extend
		 *           or the <code>controller</code> in case of synchronous extend
		 *
		 * @private
		 */
		Controller.extendByCustomizing = function(oController, sName, bAsync) {
			var CustomizingConfiguration = sap.ui.require('sap/ui/core/CustomizingConfiguration');

			if (!CustomizingConfiguration) {
				return bAsync ? Promise.resolve(oController) : oController;
			}

			function extendAsync(sCustomControllerName, oController) {
				return loadControllerClass(sCustomControllerName, bAsync)
					.then(function(oCustomControllerDef) {
						if ((oCustomControllerDef = mRegistry[sCustomControllerName]) !== undefined) { //variable init, not comparison!
							mixinControllerDefinition(oController, oCustomControllerDef);
							return oController;
						}
					}, function(err) {
						jQuery.sap.log.error("Attempt to load Extension Controller " + sCustomControllerName + " was not successful - is the Controller correctly defined in its file?");
					});
			}

			var oCustomControllerDef,
				aControllerNames = [],
				sExtControllerName,
				vController = bAsync ? Promise.resolve(oController) : oController,
				controllerExtensionConfig = CustomizingConfiguration.getControllerExtension(sName, ManagedObject._sOwnerId);

			if (controllerExtensionConfig) {
				sExtControllerName = typeof controllerExtensionConfig === "string" ? controllerExtensionConfig : controllerExtensionConfig.controllerName;

				// create a list of controller names which will be used to extend this controller
				aControllerNames = controllerExtensionConfig.controllerNames || [];
				if (sExtControllerName) {
					aControllerNames.unshift(sExtControllerName);
				}
			}

			for (var i = 0, l = aControllerNames.length; i < l; i++) {
				var sControllerName = aControllerNames[i];

				// avoid null values for controllers to be handled here!
				if (typeof sControllerName === "string") {
					jQuery.sap.log.info("Customizing: Controller '" + sName + "' is now extended by '" + sControllerName + "'");

					if (bAsync) {
						//chain controllers as the order of processing is relevant
						vController = vController.then(extendAsync.bind(null, sControllerName, oController));
					} else {
						//load Controller extension
						if ( !mRegistry[sControllerName] && !sap.ui.require(sControllerName) ) {
							loadControllerClass(sControllerName);
						}
						if ((oCustomControllerDef = mRegistry[sControllerName]) !== undefined) { //variable init, not comparison!
							mixinControllerDefinition(oController, oCustomControllerDef);
						} else {
							jQuery.sap.log.error("Attempt to load Extension Controller " + sControllerName + " was not successful - is the Controller correctly defined in its file?");
						}
					}
				}
			}
			return vController;
		};

		/*
		 * This function can be used to extend a controller with controller
		 * extensions returned by controller extension provider.
		 *
		 * @param {object|sap.ui.core.mvc.Controller} Controller to extend
		 * @param {string} Name of the controller
		 * @param {boolean} If set to true, extension will be run in async mode
		 * @return {sap.ui.core.mvc.Controller|Promise} A <code>Promise</code> in case of asynchronous extend
		 *           or the <code>controller</code> in case of synchronous extend
		 * @private
		 */
		Controller.extendByProvider = function(oController, sName, sOwnerId, bAsync) {
			if (!Controller._sExtensionProvider) {
				return bAsync ? Promise.resolve(oController) : oController;
			}
			jQuery.sap.log.info("Customizing: Controller '" + sName + "' is now extended by Controller Extension Provider '" + Controller._sExtensionProvider + "'");

			var oExtensions,
				oExtensionProvider;

			if (bAsync) {
				return loadExtensionProvider(oController, bAsync)
					.then(function (oExtensionProvider) {
						return oExtensionProvider.getControllerExtensions(sName /* controller name */, sOwnerId /* component ID / clarfiy if this is needed? */, bAsync);
					})
					.then(function (aControllerExtensions) {
						if (aControllerExtensions && aControllerExtensions.length) {
							for (var i = 0, l = aControllerExtensions.length; i < l; i++) {
								mixinControllerDefinition(oController, aControllerExtensions[i]);
							}
						}
						return oController;
					}, function(err){
						jQuery.sap.log.error("Controller Extension Provider: Error '" + err + "' thrown in " + Controller._sExtensionProvider + "extension provider ignored.");
						return oController;
					});
			} else  {
				oExtensionProvider = loadExtensionProvider(oController, bAsync);
				oExtensions = oExtensionProvider.getControllerExtensions(sName /* controller name */, sOwnerId /* component ID / clarfiy if this is needed? */, bAsync);
				if (oExtensions && oExtensions.length) {
					// in sync mode, oExtensions is an array of controller extensions
					for (var i = 0, l = oExtensions.length; i < l; i++) {
						mixinControllerDefinition(oController, oExtensions[i]);
					}
				} else {
					jQuery.sap.log.error("Controller Extension Provider: Extension Provider " + oExtensionProvider + " could not be found");
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
		 * @param {boolean} bAsync Decides whether the controller gets loaded asynchronously or not
		 * @return {void | sap.ui.core.mvc.Controller | Promise} void, the new controller instance or a Promise
		 * 	resolving with the controller in async case
		 * @public
		 */
		sap.ui.controller = function (sName, oControllerImpl, bAsync) {

			var oController,
				ControllerClass,
				sOwnerId = ManagedObject._sOwnerId;

			if (typeof oControllerImpl === "boolean") {
				oControllerImpl = undefined;
			}

			if (!oControllerImpl) {
				// controller *instantiation*
				if (bAsync) {
					return loadControllerClass(sName, bAsync)
						.then(function(ControllerClass) {
							return instantiateController(ControllerClass, sName);
						})
						.then(function(oController) {
							return Controller.extendByMember(oController, bAsync);
						})
						.then(function(oController) {
							return Controller.extendByCustomizing(oController, sName, bAsync);
						})
						.then(function(oController) {
							return Controller.extendByProvider(oController, sName, sOwnerId, bAsync);
						});
				} else {
					ControllerClass = loadControllerClass(sName, bAsync);
					oController = instantiateController(ControllerClass, sName);
					oController = Controller.extendByMember(oController, bAsync);
					oController = Controller.extendByCustomizing(oController, sName, bAsync);
					oController = Controller.extendByProvider(oController, sName, sOwnerId, bAsync);
				}
				return oController;
			} else {
				// controller *definition*
				mRegistry[sName] = oControllerImpl;
			}
		};

		/**
		 * Returns a list of public methods of the controller. If <code>bWithExtensions</code> is
		 * set to true the public methods of the extensions are also returned
		 *
		 * @param {boolean} [bWithExtensions] Whether include the public extension methods
		 * @private
		 */
		Controller.prototype.getPublicMethods = function(bWithExtensions) {
			var mPublicFunctions = {};

			Object.keys(this.getInterface()).map(function(sMethod) {
				mPublicFunctions[sMethod] = {};
			});

			if (bWithExtensions) {
				var aExtensions = this["_sapui_Extensions"];
				aExtensions.map(function(oExtensionInfo) {
					Object.keys(oExtensionInfo.extension.getInterface()).map(function(sMethod) {
						mPublicFunctions[oExtensionInfo.location + "." + sMethod] = {
							reloadNeeded: oExtensionInfo.reloadNeeded
						};
					});
				});
			}
			return mPublicFunctions;
		};

		/**
		 * Fire event when destroying a controller to cleanup extensions
		 * @private
		 */
		Controller.prototype.destroy = function() {
			this["_sapui_Extensions"].forEach(function(oExtensionInfo) {
				jQuery.sap.setObject(oExtensionInfo.location, null, this);
			}.bind(this));
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
		 * See {@link sap.ui.controller} for an overview of the available functions for controllers.
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
