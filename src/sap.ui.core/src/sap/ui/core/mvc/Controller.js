/*!
 * ${copyright}
 */

// Provides base class for controllers (part of MVC concept)
sap.ui.define([
	'sap/base/util/ObjectPath',
	'sap/base/util/extend',
	'sap/ui/base/EventProvider',
	'sap/ui/base/ManagedObject',
	'sap/ui/core/mvc/ControllerMetadata',
	'sap/ui/core/mvc/ControllerExtension',
	'sap/ui/core/mvc/ControllerExtensionProvider',
	'sap/ui/core/mvc/OverrideExecution',
	"sap/base/Log"
], function(
	ObjectPath,
	extend,
	EventProvider,
	ManagedObject,
	ControllerMetadata,
	ControllerExtension,
	ControllerExtensionProvider,
	OverrideExecution,
	Log
) {
	"use strict";

		var mRegistry = {};

		/**
		 * Instantiates a (MVC-style) controller.
		 *
		 * @class A generic controller implementation for the UI5 Model-View-Controller concept.
		 *
		 * Can be used as a base class for typed controllers.
		 *
		 * <b>Typed Controller Scenario</b>:
		 * <ul>
		 * <li>use {@link sap.ui.core.mvc.Controller.extend Controller.extend} to define the controller class</li>
		 * <li>use {@link sap.ui.core.mvc.Controller.create Controller.create} to create an instance</li>
		 * </ul>
		 *
		 * @param {string|object[]} sName The name of the controller to instantiate. If a controller is defined as real sub-class,
		 *                                    the "arguments" of the sub-class constructor should be given instead.
		 *
		 * @public
		 * @alias sap.ui.core.mvc.Controller
		 * @extends sap.ui.base.EventProvider
		 */
		var Controller = EventProvider.extend("sap.ui.core.mvc.Controller", /** @lends sap.ui.core.mvc.Controller.prototype */ {
			metadata: {
				stereotype: "controller",
				methods: {
					"byId": 				{"public": true, "final": true},
					"getView" : 			{"public": true, "final": true},
					"getInterface" : 		{"public": false, "final": true},
					"onInit": 				{"public": false, "final": false, "overrideExecution": OverrideExecution.After},
					"onExit":				{"public": false, "final": false, "overrideExecution": OverrideExecution.Before},
					"onBeforeRendering":	{"public": false, "final": false, "overrideExecution": OverrideExecution.Before},
					"onAfterRendering":		{"public": false, "final": false, "overrideExecution": OverrideExecution.After}
				}
			},
			constructor : function(sName) {
				var oToExtend = null;
				if (typeof (sName) == "string") {
					if (!mRegistry[sName]) {
						Log.warning("Do not call sap.ui.core.mvc.Controller constructor for non typed scenario!");
					}
					oToExtend = mRegistry[sName];
				}
				EventProvider.apply(this,arguments);

				if (oToExtend) {
					extend(this, mRegistry[sName]);
				}

				if (this.extension) {
					throw new Error("The keyword 'extension' cannot be used as a member of a controller");
				}

				this["_sapui_Extensions"] = {};
				Controller.extendByMember(this, false);
				this._sapui_isExtended = false;
				this._aDestroyables = [];
			},
			/**
			 * Wether a controller is extended or not
			 * @private
			 * @returns {boolean} Whether controller is extended or not
			 */
			_isExtended: function() {
				return this._sapui_isExtended;
			},
			/**
			 * Returns the public interface for this controller
			 *
			 * @returns {object} The public interface for this extension
			 * @private
			 */
			getInterface: function() {
				var mMethods = {};
				var oMetadata = this.getMetadata();
				var aPublicMethods = oMetadata.getAllPublicMethods();

				aPublicMethods.forEach(function(sMethod) {
					var fnFunction = this[sMethod];
					if (typeof fnFunction === 'function') {
						mMethods[sMethod] = function() {
							var tmp = fnFunction.apply(this, arguments);
							return (tmp instanceof Controller) ? tmp.getInterface() : tmp;
						}.bind(this);
					}
				}.bind(this));
				this.getInterface = function() {
					return mMethods;
				};
				return mMethods;
			}
		}, ControllerMetadata);

		/**
		 * Apply extension to controller
		 *
		 * @param {sap.ui.core.mvc.Controller} oController The controller to extend
		 * @param {sap.ui.core.mvc.ControllerExtension|object} oExtension The controller extension
		 * @param {string} [sLocalNamespace] Extensions could be applied to a local namespace. Do so if passed
		 * @private
		 */
		function applyExtension(oController, oExtension, sLocalNamespace) {
			//create the controller extension object
			var sNamespace = oExtension.getMetadata().getName();
			var oControllerMetadata = oController.getMetadata();
			var oExtensions = oController["_sapui_Extensions"];
			var oInterface = oController.getInterface();
			var mLifecycleConfig = ControllerExtension.getMetadata().getLifecycleConfiguration();

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

				//handle 'inline' overrides first
				for (sOverrideMember in oStaticOverrides) {
					oOrigExtensionMetadata = oExtension.getMetadata();
					if (!oOrigExtensionMetadata.isMethodFinal(sOverrideMember)) {
						ControllerExtension.overrideMethod(sOverrideMember, oExtension, oStaticOverrides, oExtension, oOrigExtensionMetadata.getOverrideExecution(sOverrideMember));
					}  else {
						Log.error("Method '" + sOverrideMember + "' of extension '" + sNamespace + "' is flagged final and cannot be overridden by calling 'override'");
					}
				}
				//handle 'normal' overrides
				for (sOverrideMember in oOverrides) {
					if (sOverrideMember !== 'extension') {
						//handle overrides on controller and member extensions
						if (sOverrideMember in oExtension.base) {
							Log.debug("Overriding  member '" + sOverrideMember + "' of original controller.");
							var vMember = oOverrides[sOverrideMember];
							var fnOriginal = oController[sOverrideMember];
							//check for member extension
							if (typeof fnOriginal == "object" && typeof vMember == "object") {
								oOrigExtensionInfo = oExtensions[sOverrideMember];
								oOrigExtensionMetadata = oOrigExtensionInfo.extension.getMetadata();
								for (sExtensionOverride in vMember) {
									if (!oOrigExtensionMetadata.isMethodFinal(sExtensionOverride)) {
										ControllerExtension.overrideMethod(sExtensionOverride, fnOriginal, vMember, oExtension, oOrigExtensionMetadata.getOverrideExecution(sExtensionOverride));
									}  else {
										Log.error("Method '" + sExtensionOverride + "' of extension '" + oOrigExtensionInfo.namespace + "' is flagged final and cannot be overridden by extension '" + sNamespace + "'");
									}
								}
							} else if (!oControllerMetadata.isMethodFinal(sOverrideMember)) {
								ControllerExtension.overrideMethod(sOverrideMember, oController, oOverrides, oExtension, oControllerMetadata.getOverrideExecution(sOverrideMember));
							} else {
								Log.error("Method '" + sOverrideMember + "' of controller '" + oController.getMetadata().getName() + "' is flagged final and cannot be overridden by extension '" + sNamespace + "'");
							}
						} else if (sOverrideMember in mLifecycleConfig) {
							//apply lifecycle hooks even if they don't exist on controller
							ControllerExtension.overrideMethod(sOverrideMember, oController, oOverrides, oExtension, oControllerMetadata.getOverrideExecution(sOverrideMember));
						/* legacy support: hooks defined as null instead of a function and starting with 'extHook' must not be ignored.
							Some legacy applications defined possible extension hooks in this way. As ControllerExtensions rely on Interface usage
							legacy scenarios will break. */
						} else if (sOverrideMember.startsWith("extHook") && oController[sOverrideMember] === null) {
							ControllerExtension.overrideMethod(sOverrideMember, oController, oOverrides, oExtension);
						} else {
							Log.error("Method '" + sOverrideMember + "' does not exist in controller " + oController.getMetadata().getName() + " and cannot be overridden");
						}
					}
					oExtensionInfo.reloadNeeded = true;
				}
				//handle non member extension overrides
				if (oOverrides && oOverrides.extension) {
					//allow to override methods of other controller extensions
					for (var sExtensionNamespace in oOverrides.extension) {
						oOrigExtensionMetadata = oExtensions[sExtensionNamespace].extension.getMetadata();
						var oOrigExtensionInterface = ObjectPath.create(sExtensionNamespace, oController.extension);
						var oOrigExtension = oExtensions[sExtensionNamespace].extension;
						var oExtensionOverrides = oOverrides.extension[sExtensionNamespace];
						for (sExtensionOverride in oExtensionOverrides) {
							if (!oOrigExtensionMetadata.isMethodFinal(sExtensionOverride)) {
								//override interface
								ControllerExtension.overrideMethod(sExtensionOverride, oOrigExtensionInterface, oExtensionOverrides, oExtension, oOrigExtensionMetadata.getOverrideExecution(sExtensionOverride));
								//override Extension so 'this' is working for overrides
								ControllerExtension.overrideMethod(sExtensionOverride, oOrigExtension, oExtensionOverrides, oExtension, oOrigExtensionMetadata.getOverrideExecution(sExtensionOverride));
							} else {
								Log.error("Method '" + sExtensionOverride + "' of extension '" + sExtensionNamespace + "' is flagged final and cannot be overridden by extension '" + sNamespace + "'");
							}
						}
					}
				}
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
				ObjectPath.set("extension." + sNamespace, oExtensionInterface, oController);
				ObjectPath.set("extension." + sNamespace, oExtensionInterface, oInterface);
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
				var mLifecycleConfig = ControllerExtension.getMetadata().getLifecycleConfiguration();
				for (var sMemberName in CustomControllerDef) {
					if (sMemberName in mLifecycleConfig) {
						ControllerExtension.overrideMethod(sMemberName, oController, CustomControllerDef, oController, mLifecycleConfig[sMemberName].overrideExecution);
					} else {
						//default extension behavior
						ControllerExtension.overrideMethod(sMemberName, oController, CustomControllerDef);
					}
				}
			}
		}

		/* load controller class
		 *
		 * @param {string} sName the controller name
		 * @param {boolean} bAsync Load async or not
		 * @return {sap.ui.core.mvc.Controller | Promise} oController <code>Promise</code> in case of asynchronous loading
		 *           or <code>undefined</code> in case of synchronous loading
		 */
		function loadControllerClass(sName, bAsync) {
			if (!sName) {
				throw new Error("Controller name ('sName' parameter) is required");
			}

			var sControllerName = sName.replace(/\./g, "/") + ".controller",
				ControllerClass = resolveClass(sap.ui.require(sControllerName));

			function resolveClass(ControllerClass) {
				if (ControllerClass) {
					return ControllerClass;
				} else if (mRegistry[sName]) {
					return Controller;
				} else {
					//legacy controller
					return ObjectPath.get(sName);
				}
			}

			if (bAsync) {
				return new Promise(function(resolve, reject) {
					if (!ControllerClass) {
						sap.ui.require([sControllerName], function (ControllerClass) {
							resolve(resolveClass(ControllerClass));
						}, reject);
					} else {
						resolve(ControllerClass);
					}
				});
			} else if (!ControllerClass) {
				ControllerClass = sap.ui.requireSync(sControllerName); // legacy-relevant: Sync path
				return resolveClass(ControllerClass);
			} else {
				return ControllerClass;
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
		 * Apply extension if passed as a member of the controller
		 *
		 * @param {sap.ui.core.mvc.Controller} oController The controller instance
		 * @param {boolean} bAsync Wether extend async or not
		 * @returns {Promise|sap.ui.core.mvc.Controller} If <code>bAsync</code> is <code>true</code> a promise which resolves with the extended <code>oController</code>, otherwise the extended <code>oController</code>
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
		* extensions returned by controller extension provider.
		*
		* @param {object|sap.ui.core.mvc.Controller} oController Controller to extend
		* @param {string} sName Name of the controller
		* @param {sap.ui.core.ID|undefined} sOwnerId the ID of the owner component to which this controller belongs,
		*                                            or undefined if the controller is not associated to a component
		* @param {sap.ui.core.ID|undefined} sViewId the ID of the corresponding View for <code>oController</code>, or undefined if the controller is created via the the factory
		* @param {boolean} bAsync If set to true, extension will be run in async mode
		* @return {sap.ui.core.mvc.Controller|Promise} A <code>Promise</code> in case of asynchronous extend
		*           or the <code>controller</code> in case of synchronous extend
		* @private
		*/
		Controller.applyExtensions = function(oController, sName, sOwnerId, sViewId, bAsync) {
			/**
			 * Retrieves the controller-extension with the given name
			 * @param {boolean} bAsync whether to retrieve the controller extension async or sync
			 * @param {string} sControllerName the extension controller class name
			 */
			function fnGetExtensionController(bAsync, sControllerName) {
				if (bAsync) {
					return loadControllerClass(sControllerName, true).then(function(oExtControllerDef) {
						// loadControllerClass resolves with the base sap/ui/core/mvc/Controller class,
						// in case 'sControllerName' is not a module but was defined with sap.ui.controller("...", {})
						oExtControllerDef = mRegistry[sControllerName] || oExtControllerDef;
						if (oExtControllerDef !== undefined) {
							if (oExtControllerDef.getMetadata && oExtControllerDef.getMetadata().isA("sap.ui.core.mvc.Controller")) {
								Log.warning("Attempt to load Extension Controller " + sControllerName + " was not successful", "Controller extension should be a plain object.", null, function() {
									return {
										type: "ControllerExtension",
										name: sControllerName
									};
								});
							}
							return oExtControllerDef;
						}

					}, function(err) {
						Log.error("Attempt to load Extension Controller " + sControllerName + " was not successful - is the Controller correctly defined in its file?");
					});
				} else {
					// sync load Controller extension if necessary
					if (!mRegistry[sControllerName] && !sap.ui.require(sControllerName)) {
						loadControllerClass(sControllerName);
					}

					// retrieve legacy controller from registry
					if (mRegistry[sControllerName] !== undefined) {
						return mRegistry[sControllerName];
					} else {
						/* eslint-disable no-loop-func */
						Log.error("Attempt to load Extension Controller " + sControllerName + " was not successful - is the Controller correctly defined in its file?", null, function() {
							return {
								type: "ControllerExtension",
								name: sControllerName
							};
						});
						/* eslint-enable no-loop-func */
						return {};
					}
				}
			}


			if (bAsync) {
				return ControllerExtensionProvider.getControllerExtensions(sName, sOwnerId, sViewId, bAsync)
					.then(function (mControllers) {
						// load customizing controllers async
						var aCustomizingControllerPromises = mControllers.customizingControllerNames.map(function(sControllerName) {
							return fnGetExtensionController(true, sControllerName);
						});

						return Promise.all(aCustomizingControllerPromises).then(function(aCustomizingControllers) {
							// order of extensions: 1. customizing, 2. provider
							// the order is fixed as defined in the manifest, and as returned by the external provider
							var aAllExtensions = aCustomizingControllers.concat(mControllers.providerControllers);

							for (var i = 0, l = aAllExtensions.length; i < l; i++) {
								mixinControllerDefinition(oController, aAllExtensions[i]);
							}

							return oController;
						});
					}, function(err){
						Log.error("Controller Extension Provider: Error '" + err + "' thrown in " + Controller._sExtensionProvider + "; extension provider ignored.");
						return oController;
					});
			} else {
				var mControllers = ControllerExtensionProvider.getControllerExtensions(sName, sOwnerId, sViewId, bAsync);

				// load and apply customizing controllers
				var aCustomizingControllers = mControllers.customizingControllerNames.map(fnGetExtensionController.bind(null, false));

				// apply controller-extensions from the external provider
				var aAllExtensions = aCustomizingControllers.concat(mControllers.providerControllers);
				for (var i = 0, l = aAllExtensions.length; i < l; i++) {
					mixinControllerDefinition(oController, aAllExtensions[i]);
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
			return controllerFactory(mOptions.name, undefined, true, mOptions._viewId);
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
		 * @param {boolean} [bAsync=false] Decides whether the controller gets loaded asynchronously or not
		 * @return {void | sap.ui.core.mvc.Controller | Promise} void, the new controller instance or a Promise
		 * 	resolving with the controller in async case
		 * @static
		 * @deprecated Since 1.56, use {@link sap.ui.core.mvc.Controller.extend Controller.extend} to define the controller class
		 * and {@link sap.ui.core.mvc.Controller.create Controller.create} to create controller instances. For further information, see {@link sap.ui.core.mvc.Controller}.
		 * @public
		 * @ui5-global-only
		 */
		sap.ui.controller = function (sName, oControllerImpl, bAsync, sViewId /* privately used view-id, internally used for instance-specific controller extensions */) {
			if (bAsync) {
				Log.info("Do not use deprecated factory function 'sap.ui.controller(" + sName + ")'. Use 'sap.ui.core.mvc.Controller.create(...)' instead.", "sap.ui.controller", null, function () {
					return {
						type: "sap.ui.controller",
						name: sName
					};
				});
			} else {
				Log.warning("Do not use synchronous controller creation for controller '" + sName + "'! Use the new asynchronous factory 'sap.ui.core.mvc.Controller.create(...)' instead.", "sap.ui.controller", null, function () {
					return {
						type: "sap.ui.controller",
						name: sName
					};
				});
			}
			return controllerFactory.apply(this, arguments);
		};

		/*
		 * Old controller factory implementation
		 */
		function controllerFactory(sName, oControllerImpl, bAsync, sViewId) {
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
							return Controller.applyExtensions(oController, sName, sOwnerId, sViewId, bAsync);
						})
						.then(function(oController) {
							oController._sapui_isExtended = true;
							return oController;
						});
				} else {
					ControllerClass = loadControllerClass(sName, bAsync);
					oController = instantiateController(ControllerClass, sName);
					oController = Controller.applyExtensions(oController, sName, sOwnerId, sViewId, bAsync);
					//if controller is created via the factory all extensions are already mixed in
					oController._sapui_isExtended = true;
				}
				return oController;
			} else {
				// controller *definition*
				mRegistry[sName] = oControllerImpl;
				Log.info("For defining controllers use Controller.extend instead");
			}
		}

		/**
		 * Returns a map of public methods of the controller. If <code>bWithExtensions</code> is
		 * set to <code>true</code> the public methods of the extensions are included in the result
		 *
		 * @private
		 * @returns {Map<string,object>} A map containing all methods (key) and their metadata
		 */
		Controller.prototype.getPublicMethods = function() {
			var mPublicFunctions = {},
				oControllerMetadata = this.getMetadata(),
				oControllerMethods = oControllerMetadata.getAllMethods(),
				oLifeCycleConfig = oControllerMetadata.getLifecycleConfiguration();

			Object.keys(oControllerMethods).forEach(function(sMethod) {
				if (oControllerMetadata.isMethodPublic(sMethod)) {
					mPublicFunctions[sMethod] = oControllerMethods[sMethod];
					mPublicFunctions[sMethod].reloadNeeded = !!(sMethod in oLifeCycleConfig);
				}
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
					var oMethodMetadata = extend({}, mAllMethods[sMethod], {reloadNeeded: oExtensionInfo.reloadNeeded});
					mPublicFunctions[oExtensionInfo.location + "." + sMethod] = oMethodMetadata;
				});
			});
			return mPublicFunctions;
		};

		/**
		 * Returns the list of Promises for which an automatic destroy is scheduled.
		 * Logs an error in case the application controller is missing a mandatory
		 * constructor super call.
		 * For compatibility reason we must not fail in this obviously broken scenario!
		 *
		 * @private
		 */
		Controller.prototype._getDestroyables = function() {
			if (!this._aDestroyables) {
				Log.error("Mandatory super constructor not called for Controller: '" + this.getMetadata().getName() + "'.",
					null,
					"sap.ui.support",
					function() {
						return { type: "missingSuperConstructor" };
					});
				this._aDestroyables = [];
			}
			return this._aDestroyables;
		};

		/**
		 * Takes care of async destruction of fragments created with {@link sap.ui.core.Controller.loadFragment loadFragment}
		 *
		 * @private
		 */
		Controller.prototype.destroyFragments = function() {
			function fnDestroy(vContent) {
				vContent = Array.isArray(vContent) ? vContent : [vContent];
				for (var i = 0; i < vContent.length; i++) {
					if (!vContent[i].isDestroyed()) {
						vContent[i].destroy();
					}
				}
			}
			// chain each cancelable to trigger an async destroy
			var aDestroyables = this._getDestroyables();
			for (var i = 0; i < aDestroyables.length; i++ ) {
				aDestroyables[i] = aDestroyables[i].then(fnDestroy);
			}
		};

		/**
		 * Fire event when destroying a controller to cleanup extensions
		 * @private
		 */
		Controller.prototype.destroy = function() {
			if (this["_sapui_Extensions"]) {
				Object.keys(this["_sapui_Extensions"]).forEach(function(sKey) {
					var oExtensionInfo = this["_sapui_Extensions"][sKey];
					ObjectPath.set(oExtensionInfo.location, null, this);
				}.bind(this));
				delete this["_sapui_Extensions"];
			}
			EventProvider.prototype.destroy.apply(this, arguments);
		};

		/**
		 * Returns the view associated with this controller or <code>undefined</code>.
		 * @returns {sap.ui.core.mvc.View|undefined} View connected to this controller.
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
		 * the given local ID, <code>undefined</code> is returned.
		 *
		 * @param {string} sId View-local ID
		 * @returns {sap.ui.core.Element|undefined} Element by its (view local) ID
		 * @public
		 */
		Controller.prototype.byId = function(sId) {
			return this.oView ? this.oView.byId(sId) : undefined;
		};


		/**
		 * Converts a view local ID to a globally unique one by prepending
		 * the view ID.
		 *
		 * If no view is connected, <code>undefined</code> is returned.
		 *
		 * @param {string} sId View-local ID
		 * @returns {string|undefined} Prefixed ID
		 * @public
		 */
		Controller.prototype.createId = function(sId) {
			return this.oView ? this.oView.createId(sId) : undefined;
		};

		/**
		 * Gets the component of the controller's view
		 *
		 * If there is no Component connected to the view or the view is not connected to the controller,
		 * <code>undefined</code> is returned.
		 *
		 * @return {sap.ui.core.Component|undefined} Component instance
		 * @since 1.23.0
		 * @public
		 */
		Controller.prototype.getOwnerComponent = function () {
			var Component = sap.ui.require("sap/ui/core/Component");
			if (Component) {
				return Component.getOwnerComponentFor(this.getView());
			} else {
				return undefined;
			}
		};


		Controller.prototype.connectToView = function(oView) {
			this.oView = oView;

			if (this.onInit) {
				oView.attachAfterInit(this.onInit, this);
			}
			if (this.onExit) {
				oView.attachBeforeExit(this.onExit, this);
			}
			if (oView.bControllerIsViewManaged) {
				oView.attachBeforeExit(this.destroyFragments, this);
			}
			if (this.onAfterRendering) {
				oView.attachAfterRendering(this.onAfterRendering, this);
			}
			if (this.onBeforeRendering) {
				oView.attachBeforeRendering(this.onBeforeRendering, this);
			}
		};

		/**
		 * Loads a Fragment by {@link sap.ui.core.Fragment.load}.
		 *
		 * The fragment content will be added to the <code>dependents</code> aggregation of the view by default.
		 * This behavior can be suppressed by setting <code>mOptions.addToDependents</code> to false.
		 *
		 * The controller is passed to the Fragment by default, so the (event handler) methods referenced in the
		 * Fragment will be called on this Controller.
		 *
		 * If the controller has an owner component, it is passed to the fragment content.
		 * By default the fragment content will be prefixed with the view ID to avoid duplicate ID issues.
		 * The prefixing can be switched off with the <code>autoPrefixId</code> option.
		 *
		 * When <code>autoPrefixId</code> is enabled, the fragment content can be accessed by calling
		 * {@link sap.ui.core.mvc.Controller.byId}.
		 *
		 * <b>Destroy behavior</b>:
		 * Different scenarios concerning the destruction of the fragment's content exist,
		 * of which some must be addressed by the caller, while others are handled automatically.
		 * <ul>
		 * <li>The controller instance is destroyed before the fragment content creation has finished:
		 *     In this case, the controller instance takes care of asynchronously destroying the fragment content</li>
		 * <li>The fragment content is aggregated within a control (e.g. <code>dependents</code> aggregation by default):
		 *     In this case, the content will be destroyed during the regular destroy lifecycle.</li>
		 * <li>The fragment content is not aggregated within a control:
		 *     In this case, <em>it must be destroyed manually</em> in the exit hook of the controller.</li>
		 * </ul>
		 *
		 * @example <caption>Loading a fragment with no <code>mOptions.id</code> given</caption>
		 * // In the following, "this" is an instance of sap.ui.core.mvc.Controller
		 * var pFragment = this.loadFragment({
		 *     name: "myFragment"
		 * }).then(function() {
		 *     var myControl = this.byId("myFragment");
		 * }.bind(this));
		 *
		 * @example <caption>Loading a fragment with an <code>mOptions.id</code> given</caption>
		 * // In the following, "this" is an instance of sap.ui.core.mvc.Controller
		 * var pFragment = this.loadFragment({
		 *     name: "myFragment",
		 *     id: "somePrefix"
		 * }).then(function() {
		 *     var myControl = this.byId("somePrefix--myFragment");
		 * }.bind(this));
		 *
		 * @param {object} mOptions Options regarding fragment loading
		 * @param {string} mOptions.name The Fragment name, which must correspond to a Fragment which can be loaded via the module system
		 *    (fragmentName + suffix ".fragment.[typeextension]") and which contains the Fragment definition.
		 * @param {boolean} [mOptions.addToDependents=true] Whether the fragment content should be added to the <code>dependents</code> aggregation of the view
		 * @param {boolean} [mOptions.autoPrefixId=true] Whether the IDs of the fragment content will be prefixed by the view ID
		 * @param {string} [mOptions.id] the ID of the Fragment
		 * @param {string} [mOptions.type=XML] the Fragment type, e.g. "XML", "JS", or "HTML" (see above). Default is "XML"
		 * @returns {Promise<sap.ui.core.Control|sap.ui.core.Control[]>} A Promise that resolves with the fragment content
		 *
		 * @since 1.93
		 * @public
		 */
		Controller.prototype.loadFragment = function(mOptions) {
			if (!this.getView()) {
				throw new Error("Calling 'loadFragment' without a view attached is not supported!");
			} else if (!mOptions || !mOptions.name) {
				throw new Error("oOptions must provide at least a fragment name!");
			}

			var oOwnerComponent = this.getOwnerComponent();
			var bAddToDependents = mOptions.addToDependents !== false;
			var bAutoPrefixId = mOptions.autoPrefixId !== false;

			var oFragmentOptions = {
				name: mOptions.name,
				type: mOptions.type,
				id: mOptions.id,
				controller: this
			};

			var aDestroyables = this._getDestroyables();

			var pRequire = new Promise(function(resolve, reject) {
				sap.ui.require(["sap/ui/core/Fragment"], function(Fragment) {
					resolve(Fragment);
				}, reject);
			}).then(function(Fragment) {
				if (!mOptions.id && bAutoPrefixId) {
					oFragmentOptions.id = this.getView().getId();
				} else if (bAutoPrefixId) {
					oFragmentOptions.id = this.createId(mOptions.id);
				}
				if (oOwnerComponent) {
					return oOwnerComponent.runAsOwner(function() {
						return Fragment.load(oFragmentOptions);
					});
				} else {
					return Fragment.load(oFragmentOptions);
				}
			}.bind(this)).then(function(vContent) {
				if (bAddToDependents) {
					this.getView().applySettings({"dependents": vContent});
				}
				/* if already resolved remove from bookkeeping. App needs to destroy or it is
				implicitly destroyed via the dependents (or other) aggregation */
				aDestroyables.splice(aDestroyables.indexOf(pRequire),1);
				return vContent;
			}.bind(this));
			aDestroyables.push(pRequire);
			return pRequire;
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
		 * methods and properties of the controller in a similar way as for {@link sap.ui.core.mvc.Controller Controller} subclasses.
		 *
		 *
		 * <b>Example for a callback module definition (sync):</b>
		 * <pre>
		 * sap.ui.define("my/custom/sync/ExtensionProvider", [], function() {
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
		 * });
		 * </pre>
		 *
		 *
		 * <b>Example for a callback module definition (async):</b>
		 * <pre>
		 * sap.ui.define("my/custom/async/ExtensionProvider", [], function() {
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
		 * });
		 * </pre>
		 *
		 *
		 * The lifecycle functions <code>onInit</code>, <code>onExit</code>,
		 * <code>onBeforeRendering</code> and <code>onAfterRendering</code>
		 * are added before or after the lifecycle functions of the original
		 * controller. The event handler functions, such as <code>onButtonClick</code>,
		 * are replacing the original controller's function.
		 *
		 * When using an async extension provider, you need to ensure that the
		 * view is loaded in async mode.
		 *
		 * In both cases, return <code>undefined</code> if no controller extension shall be applied.
		 *
		 * @param {string} sExtensionProvider the module name of the extension provider
		 *
		 * See {@link sap.ui.core.mvc.Controller} for an overview of the available functions for controllers.
		 * @since 1.34.0
		 * @public
		 */
		Controller.registerExtensionProvider = function(sExtensionProvider) {
			Controller._sExtensionProvider = sExtensionProvider;
			ControllerExtensionProvider.registerExtensionProvider(sExtensionProvider);
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