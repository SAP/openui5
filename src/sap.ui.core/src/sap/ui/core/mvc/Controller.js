/*!
 * ${copyright}
 */

// Provides base class for controllers (part of MVC concept)
sap.ui.define([
	'jquery.sap.global',
	'sap/base/util/extend',
	'sap/ui/base/EventProvider',
	'sap/ui/base/ManagedObject',
	'sap/ui/core/mvc/ControllerExtension'
	], function(
		jQuery,
		extend,
		EventProvider,
		ManagedObject,
		ControllerExtension
	) {
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

				this["_sapui_Extensions"] = {};
				this["_sapui_Interface"] = this.getInterface();
				Controller.extendByMember(this, false);
			},
			metadata: {
				publicMethods: [
					"byId",
					"getView"
				]
			}

		});

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
			var oExtensions = oController["_sapui_Extensions"];
			var oInterface = oController["_sapui_Interface"];
			var oExtensionInfo = {
				namespace: sNamespace,
				extension: oExtension,
				reloadNeeded: false
			};

			oExtension._setController(oInterface); //only allow access to public methods of the main controller

			if (oExtension.getMetadata().hasOverrides()) {
				//override the original controller methods for the entries in the "override" setting of the controller extension
				var sExtensionOverride, oOrigExtensionInfo, oOrigExtensionMetadata, sOverrideMember,
					oOverrides = oExtension.getMetadata().getOverrides(),
					oStaticOverrides = oExtension.getMetadata().getStaticOverrides();

				for (sOverrideMember in oStaticOverrides) {
					oOrigExtensionMetadata = oExtension.getMetadata();
					if (!oOrigExtensionMetadata.isMethodFinal(sOverrideMember)) {
						ControllerExtension.overrideMethod(sOverrideMember, oExtension, oStaticOverrides, oExtension, oOrigExtensionMetadata.getOverrideExecution(sOverrideMember));
					}  else {
						jQuery.sap.log.error("Method '" + sOverrideMember + "' of extension '" + sNamespace + "' is flagged final and cannot be overridden by calling 'override'");
					}

				}
				for (sOverrideMember in oOverrides) {
					if (sOverrideMember !== 'extension' && sOverrideMember in oExtension.base) {
						jQuery.sap.log.debug("Overriding  member '" + sOverrideMember + "' of original controller.");
						var vMember = oOverrides[sOverrideMember];
						var fnOriginal = oController[sOverrideMember];
						if (typeof fnOriginal == "object" && typeof vMember == "object") {
							oOrigExtensionInfo = oExtensions[sOverrideMember];
							oOrigExtensionMetadata = oOrigExtensionInfo.extension.getMetadata();

							for (sExtensionOverride in vMember) {
								if (!oOrigExtensionMetadata.isMethodFinal(sExtensionOverride)) {
									ControllerExtension.overrideMethod(sExtensionOverride, fnOriginal, vMember, oExtension, oOrigExtensionMetadata.getOverrideExecution(sExtensionOverride));
								}  else {
									jQuery.sap.log.error("Method '" + sExtensionOverride + "' of extension '" + oOrigExtensionInfo.namespace + "' is flagged final and cannot be overridden by extension '" + sNamespace + "'");
								}
							}
						} else {
							//override method runs in the context of the extension
							ControllerExtension.overrideMethod(sOverrideMember, oController, oOverrides, oExtension);
						}
					}
					if (oOverrides.extension) {
					//allow to override methods of other controller extensions
						for (var sExtensionNamespace in oOverrides.extension) {
							oOrigExtensionMetadata = oExtensions[sExtensionNamespace].extension.getMetadata();
							var oOrigExtension = jQuery.sap.getObject(sExtensionNamespace, null, oController.extension);
							var oExtensionOverrides = oOverrides.extension[sExtensionNamespace];
							for (sExtensionOverride in oExtensionOverrides) {
								if (!oOrigExtensionMetadata.isMethodFinal(sExtensionOverride)) {
									ControllerExtension.overrideMethod(sExtensionOverride, oOrigExtension, oExtensionOverrides, oExtension, oOrigExtensionMetadata.getOverrideExecution(sExtensionOverride));
								} else {
									jQuery.sap.log.error("Method '" + sExtensionOverride + "' of extension '" + sExtensionNamespace + "' is flagged final and cannot be overridden by extension '" + sNamespace + "'");
								}
							}
						}
					}
					oExtensionInfo.reloadNeeded = true;
				}
			}

			//extend controller lifecycle functions
			var oExtensionMetadata = oExtension.getMetadata();
			var mControllerLifecycleMethods = oExtensionMetadata.getLifecycleConfiguration();
			for (var sMember in mControllerLifecycleMethods) {
				ControllerExtension.overrideMethod(sMember, oController, oExtension, oExtension, mControllerLifecycleMethods[sMember]);
				oExtensionInfo.reloadNeeded = true;
			}

			var oExtensionInterface = oExtension.getInterface();

			if (sLocalNamespace) {
				oExtensions[sLocalNamespace] = oExtensionInfo;
				oExtensionInfo.location = sLocalNamespace;
				oController[sLocalNamespace] = oExtensionInterface;
				oInterface[sLocalNamespace] = oExtensionInterface;
			} else {
				oExtensions[sNamespace] = oExtensionInfo;
				oExtensionInfo.location = "extension." + sNamespace;
				jQuery.sap.setObject("extension." + sNamespace, oExtensionInterface, oController);
				jQuery.sap.setObject("extension." + sNamespace, oExtensionInterface, oInterface);
			}
		}

		/*
		 * Mixin controller extensions
		 * @param {sap.ui.core.mvc.Controller} oController The controller to apply the extensions
		 * @param {object} oCustomControllerDef The controller extension definition
		 * @private
		 */
		function mixinControllerDefinition(oController, CustomControllerDef, sLocalNameSpace) {
			if (CustomControllerDef instanceof ControllerExtension) {
				applyExtension(oController, CustomControllerDef, sLocalNameSpace);
			} else if (CustomControllerDef.getMetadata && CustomControllerDef.getMetadata().getStereotype() == "controllerextension") {
				//create ControllerExtension instance
				var oControllerExtension = new CustomControllerDef();
				applyExtension(oController, oControllerExtension, sLocalNameSpace);
			} else {
				//apply 'legacy' extension
				for (var sMemberName in CustomControllerDef) {
					ControllerExtension.overrideMethod(sMemberName, oController, CustomControllerDef, oController);
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
		 * apply extension if passed as a member of the controller
		 * @param {sap.ui.core.mvc.Controller} oController The controller instance
		 * @param {boolean} bAsync Wether extend async or not
		 * @private
		 */
		Controller.extendByMember = function(oController, bAsync) {
			var sMember;
			//create all member extension instances first
			for (sMember in oController) {
				if (oController[sMember] &&
					oController[sMember].getMetadata &&
					oController[sMember].getMetadata().getStereotype() == "controllerextension") {
					oController[sMember] = new oController[sMember]();
				}
			}
			//apply the extensions
			for (sMember in oController) {
				if (oController[sMember] &&
					oController[sMember].getMetadata &&
					oController[sMember].getMetadata().getStereotype() == "controllerextension") {
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
				if (oExtensions && Array.isArray(oExtensions)) {
					// in sync mode, oExtensions is an array of controller extensions
					for (var i = 0, l = oExtensions.length; i < l; i++) {
						mixinControllerDefinition(oController, oExtensions[i]);
					}
				} else {
					jQuery.sap.log.error("Controller Extension Provider: Error in ExtensionProvider.getControllerExtensions: " + Controller._sExtensionProvider + " - no valid extensions returned");
				}
			}

			return oController;
		};

		/**
		 * Creates an instance of controller class.
		 *
		 * @param {object} mOptions  A map containing the controller configuration options.
		 * @param {string} mOptions.name The controller name that corresponds to a JS module that can be loaded
	 	 * via the module system (mOptions.name + suffix ".controller.js")
		 * @return {Promise} the Promise resolves with a new instance of the controller
		 * @public
		 * @static
		 * @since 1.56.0
		 */
		Controller.create = function (mOptions) {
			return controllerFactory(mOptions.name, undefined, true);
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
		 * @static
		 * @deprecated since 1.56:
		 * <ul>
		 * <li>For controller instance creation use <code>Controller.create</code> instead.</li>
		 * <li>For defining controllers use <code>Controller.extend</code> instead.
		 * </ul>
		 * @public
		 */
		sap.ui.controller = function (sName, oControllerImpl, bAsync) {
			if (bAsync) {
				jQuery.sap.log.info("Do not use deprecated factory function 'sap.ui.controller(" + sName + ")'. Use 'sap.ui.core.mvc.Controller.create(...)' instead.");
			} else {
				jQuery.sap.log.warning("Do not use synchronous controller creation for controller '" + sName + "'! Use the new asynchronous factory 'sap.ui.core.mvc.Controller.create(...)' instead.");
			}
			return controllerFactory.apply(this, arguments);
		};

		/*
		 * Old controller factory implementation
		 */
		function controllerFactory(sName, oControllerImpl, bAsync) {
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
							return Controller.extendByCustomizing(oController, sName, bAsync);
						})
						.then(function(oController) {
							return Controller.extendByProvider(oController, sName, sOwnerId, bAsync);
						});
				} else {
					ControllerClass = loadControllerClass(sName, bAsync);
					oController = instantiateController(ControllerClass, sName);
					oController = Controller.extendByCustomizing(oController, sName, bAsync);
					oController = Controller.extendByProvider(oController, sName, sOwnerId, bAsync);
				}
				return oController;
			} else {
				// controller *definition*
				mRegistry[sName] = oControllerImpl;
				jQuery.sap.log.info("For defining controllers use Controller.extend instead");
			}
		}

		/**
		 * Returns a list of public methods of the controller. If <code>bWithExtensions</code> is
		 * set to true the public methods of the extensions are also returned
		 *
		 * @private
		 */
		Controller.prototype.getPublicMethods = function() {
			var mPublicFunctions = {},
				oInterface = this.getInterface();

			Object.keys(oInterface).forEach(function(sMethod) {
				mPublicFunctions[sMethod] = {'public':true, 'final':false, reloadNeeded: false};
			});

			//extensions member should not be exposed
			delete mPublicFunctions.extension;

			var oExtensions = this["_sapui_Extensions"];
			Object.keys(oExtensions).forEach(function(sNamespace) {
				var oExtensionInfo = oExtensions[sNamespace];
				var oExtensionInterface = oExtensionInfo.extension.getInterface();
				var mAllMethods = oExtensionInfo.extension.getMetadata().getAllMethods();
				Object.keys(oExtensionInterface).forEach(function(sMethod) {
					//extension member should not be exposed
					delete mPublicFunctions[oExtensionInfo.location];
					var oMethodMetadata = jQuery.extend(mAllMethods[sMethod], {reloadNeeded: oExtensionInfo.reloadNeeded});
					mPublicFunctions[oExtensionInfo.location + "." + sMethod] = oMethodMetadata;
				});
			});
			return mPublicFunctions;
		};

		/**
		 * Fire event when destroying a controller to cleanup extensions
		 * @private
		 */
		Controller.prototype.destroy = function() {
			Object.keys(this["_sapui_Extensions"]).forEach(function(oExtensionInfo) {
				jQuery.sap.setObject(oExtensionInfo.location, null, this);
			}.bind(this));
			delete this["_sapui_Extensions"];
			delete this["_sapui_Interface"];
			EventProvider.prototype.destroy.apply(this, arguments);
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
		 * <b>Note:</b> In component-based apps <code>this.getOwnerComponent().getModel()</code> should be used
		 * inside <code>onInit()</code> to get a model assigned to the component instead of using
		 * <code>this.getView().getModel()</code>. The latter call might return <code>undefined</code> because
		 * the view might not have been attached to a parent yet (i.e. the component), and thus the view
		 * can't inherit a model from that parent.
		 * You could also attach to the <code>modelContextChange</code> event. The event is fired when either
		 * the context or the model changes for the control.
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