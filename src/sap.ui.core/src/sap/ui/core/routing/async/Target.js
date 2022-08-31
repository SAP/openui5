/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/ManagedObjectMetadata",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Placeholder",
	"sap/ui/core/library",
	"sap/ui/core/Configuration"
], function(Log, ManagedObjectMetadata, ComponentContainer, Placeholder, coreLib, Configuration) {
	"use strict";

	// shortcut for sap.ui.core.ComponentLifecycle
	var ComponentLifecycle = coreLib.ComponentLifecycle;

	/**
	 * Provide methods for sap.ui.core.routing.Target in async mode
	 * @private
	 * @experimental
	 * @since 1.33
	 */
	return {

		/**
		 * Creates a view and puts it in an aggregation of a control that has been defined in the {@link #constructor}.
		 *
		 * This method can be used to display a target without changing the browser hash. If the browser hash should be changed,
		 *  the {@link sap.ui.core.routing.Router#navTo} method should be used instead
		 *
		 * @param {*} [vData] An object that will be passed to the display event in the data property. If the target has parents, the data will also be passed to them.
		 * @return {Promise} Resolves with {name: *, view: *, control: *} if the target can be successfully displayed otherwise it rejects with error information
		 * @private
		 */
		display: function (vData) {
			// Create an immediately resolving promise for parentless Target
			var oSequencePromise = Promise.resolve();
			return this._display(vData, oSequencePromise);
		},

		/**
		 * Creates a view and puts it in an aggregation of a control that has been defined in the {@link #constructor}.
		 *
		 * @param {*} [vData] An object that will be passed to the display event in the data property. If the target has parents, the data will also be passed to them.
		 * @param {Promise} oSequencePromise Promise chain for resolution in the correct order
		 * @param {object} [oTargetCreateInfo] Additional information  for the component creation. Currently the object only contains the prefix for the routerHashChanger
		 * @returns {Promise} Resolves with {name: *, view: *, control: *} if the target can be successfully displayed otherwise it rejects with error information
		 * @private
		 */
		_display: function (vData, oSequencePromise, oTargetCreateInfo) {
			if (this._oParent) {
				oSequencePromise = this._oParent._display(vData, oSequencePromise, Object.assign({}, oTargetCreateInfo));
			}
			return this._place(vData, oSequencePromise, oTargetCreateInfo);
		},

		/**
		 * Suspends the object which is loaded by the target.
		 *
		 * Currently this function stops the router of the component when
		 * the object which is loaded by this target is an instance of
		 * UIComponent. When the target is still being loaded or not loaded
		 * yet, this function has no effect.
		 *
		 * @return {sap.ui.core.routing.Target} The 'this' to chain the call
		 * @private
		 */
		suspend: function() {
			if (this._oParent) {
				this._oParent.suspend();
			}

			if (this._isLoaded()) {
				var oObject = this._get(),
					oRouter;

				if (oObject.isA("sap.ui.core.UIComponent") && (oRouter = oObject.getRouter()) && oObject.hasNativeRouter()) {
					oRouter.stop();
				}
			} else {
				Log.warning("The target with name '" + this._oOptions._name + "' can't be suspended because it's being loaded or not loaded yet");
			}

			return this;
		},

		/**
		 * Resumes the object which is loaded by the target.
		 *
		 * Currently this function initializes the router of the component without parsing the current hash when
		 * the object which is loaded by this target is an instance of
		 * UIComponent.
		 *
		 * @return {sap.ui.core.routing.Target} The 'this' to chain the call
		 * @private
		 */
		resume: function() {
			if (this._oParent) {
				this._oParent.resume();
			}

			if (this._isLoaded()) {
				var oObject = this._get(),
					oRouter;

				if (oObject.isA("sap.ui.core.UIComponent") && (oRouter = oObject.getRouter()) && oObject.hasNativeRouter()) {
					oRouter.initialize(true);
				}
			}

			return this;
		},

		/**
		 * Checks whether the object which this Target loads is already loaded
		 *
		 * @return {boolean} Whether the object which this Target loads is already loaded
		 * @private
		 */
		_isLoaded: function() {
			return this._bIsLoaded;
		},

		/**
		 * Retrieves addional target creation info based on the target type.
		 *
		 * @param {object} oTargetCreateInfo Additional information for the target creation.
		 *  Currently the object only contains the prefix for the routerHashChanger
		 * @return {object} Merged target creation info object
		 */
		_getCreateOptions: function(oTargetCreateInfo) {
			var sName = this._getEffectiveObjectName(this._oOptions.name),
				oOptions = this._oOptions,
				oCreateOptions;

				oTargetCreateInfo = oTargetCreateInfo || {};

			switch (oOptions.type) {
				case "View":
					oCreateOptions = {
						name: sName,
						type: oOptions.viewType,
						id: oOptions.id,
						async: true
					};
					break;
				case "Component":
					oCreateOptions = { id: oOptions.id };

					if (oOptions.usage) {
						oCreateOptions.usage = oOptions.usage;
					} else {
						oCreateOptions.name = sName;
					}

					oCreateOptions = Object.assign({}, oOptions.options || {}, oCreateOptions);
					break;
				default:
					throw new Error("The given type " + oOptions.type + " isn't support by sap.ui.core.routing.Target");
			}

			return oCreateOptions;
		},

		/**
		 * Get the target instance from the TargetCache.
		 *
		 * The difference between this function and the "_load" function is that this function returns the target
		 * instance directly if it's already loaded and returns a Promise during the loading of the target instance
		 * while the "_load" function always returns a promise no matter whether the target instance is loaded or not.
		 *
		 * @param {object} [oTargetCreateInfo] Additional information for the component creation. Currently the object
		 *  only contains the prefix for the routerHashChanger
		 * @returns {sap.ui.core.mvc.View|sap.ui.core.UIComponent|Promise} The target instance when it's already loaded
		 *  or a promise which resolves with the target instance during the loading of the target instance
		 * @private
		 */
		_get: function(oTargetCreateInfo) {
			var oCreateOptions = this._getCreateOptions(oTargetCreateInfo);

			return this._oCache._get(oCreateOptions, this._oOptions.type,
				// Hook in the route for deprecated global view id, it has to be supported to stay compatible
				this._bUseRawViewId, oTargetCreateInfo);
		},

		/**
		 * Loads the object from TargetCache.
		 *
		 * @param {object} [oTargetCreateInfo] Additional information for the component creation. Currently the object
		 *  only contains the prefix for the routerHashChanger
		 * @return {Promise} A promise which resolves with the loaded object of this Target
		 * @private
		 */
		_load: function(oTargetCreateInfo) {
			var oObject = this._get(oTargetCreateInfo),
				pLoaded;

			if (!(oObject instanceof Promise)) {
				if (oObject.isA("sap.ui.core.mvc.View")) {
					pLoaded = oObject.loaded();
				} else {
					pLoaded = Promise.resolve(oObject);
				}
			} else {
				pLoaded = oObject;
			}

			return pLoaded.then(function(oObject) {
				this._bIsLoaded = true;
				return oObject;
			}.bind(this));
		},

		/**
		 * Load the target and wait for the first <code>routeMatched</code> event if it's a Component target
		 *
		 * @param {object} oTargetCreateInfo The corresponding target create info
		 * @return {Promise} Promise resolving with the loaded target object and the promise that waits for the
		 *  <code>routeMatched</code> event in case of a Component target
		 * @private
		 */
		load: function(oTargetCreateInfo) {
			return this._load(oTargetCreateInfo)
				.then(function (oLoadedTarget) {
					return {
						object: oLoadedTarget,
						nestedComponentReady: this.waitForComponentTarget({
							target: oLoadedTarget,
							createInfo: oTargetCreateInfo
						})
					};
				}.bind(this));
		},

		/**
		 * Wait for the next <code>routeMatched</code> event from the Component target
		 *
		 * @param {object} mTargetOptions The option object that contains the loaded target object and the corresponding
		 *  target create info.
		 * @return {Promise} Promise resolving when the first <code>routeMatched</code> event is fired when the target
		 *  has type "Component" otherwise the Promise resolves immediately
		 * @private
		 */
		waitForComponentTarget: function(mTargetOptions) {
			return new Promise(function(resolve, reject) {
				var oLoadedTarget = mTargetOptions.target;
				var oTargetCreateInfo = mTargetOptions.createInfo;
				var bInstantResolve = true;

				if (oLoadedTarget.isA("sap.ui.core.UIComponent")) {
					var oRouter = oLoadedTarget.getRouter();
					if (oRouter && oLoadedTarget.hasNativeRouter()) {
						var sHash = oRouter.getHashChanger().getHash();
						var oRoute = oRouter.getRouteByHash(sHash);
						var bIgnoreInitialHash = oTargetCreateInfo && oTargetCreateInfo.ignoreInitialHash;

						if (!oRouter._oConfig.async){
							throw new Error("The router of component '" + oLoadedTarget.getId() +
								"' which is loaded via the target '" + this._oOptions._name +
								"' is defined as synchronous which is not supported using as a nested component.");
						}

						if (oRouter._oOwner && oTargetCreateInfo) {
							// update the flag once the component is displayed again after it's already loaded
							oRouter._oOwner._bRoutingPropagateTitle = oTargetCreateInfo.propagateTitle;
						}

						// TODO: offer getter for target info
						//
						// The router is normally initialized in the UIComponent.prototype.init function and the
						// init function should be already called before it reaches this place which means that the
						// router is initialized in most of the cases. If a router is already initialized, we still
						// need to check whether the route match process is finished. If it's not finished, we are
						// sure that there will be a "routeMatched" event fired and we can wait for it.
						if (!bIgnoreInitialHash && (!oRouter.isInitialized() || oRouter._bMatchingProcessStarted) && oRoute && oRoute._oConfig.target) {
							bInstantResolve = false;
							oRouter.attachRouteMatched(resolve);
						}
						if (oRouter.isStopped()) {
							// initialize the router in nested component
							// if it has been previously stopped
							oRouter.initialize(bIgnoreInitialHash);
						}
					}
				}

				if (bInstantResolve) {
					resolve();
				}
			}.bind(this));
		},

		/**
		 * Find the container control in the following order:
		 * <ul>
		 *   <li>Within the parent target in case <code>oParentInfo</code> is given</li>
		 *   <li>Within the root view of the owner component</li>
		 *   <li>Using the given control ID in the global scope</li>
		 * </ul>
		 *
		 * @param {object} [oParentInfo] The view information from the displayed parent target
		 * @return {Promise} Promise resolving with the container control
		 * @private
		 */
		resolveContainerControl: function(oParentInfo) {
			// use a Promise.resovle() to delay the container resolve to occur after the current call stack because the
			// oOptions.rootView can be available after the current call stack.
			return Promise.resolve().then(function() {
				oParentInfo = oParentInfo || {};

				var oOptions = this._oOptions;
				var vValid = this._isValid(oParentInfo);
				var sErrorMessage;

				// validate config and log errors if necessary
				if (vValid !== true) {
					sErrorMessage = vValid;
					return this._refuseInvalidTarget(oOptions._name, sErrorMessage);
				}

				var oViewContainingTheControl = oParentInfo.view,
					oControl = oParentInfo.control,
					pViewContainingTheControl,
					pContainerControl;

				// if the parent target loads a component, the oViewContainingTheControl is an instance of
				// ComponentContainer. The root control of the component should be retrieved and set as
				// oViewContainingTheControl
				if (oViewContainingTheControl && oViewContainingTheControl.isA("sap.ui.core.ComponentContainer")) {
					oViewContainingTheControl = oViewContainingTheControl.getComponentInstance().getRootControl();
				}

				//no parent view - see if container can be found by using oOptions.controlId under oOptions.rootView
				if (!oViewContainingTheControl && oOptions.rootView) {
					// oOptions.rootView can be either an id or a promise that resolves with the id
					pViewContainingTheControl = Promise.resolve(oOptions.rootView)
						.then(function(oRootViewId) {
							var oView;

							if (oRootViewId) {
								oView = sap.ui.getCore().byId(oRootViewId);
								oOptions.rootView = oRootViewId;
							}

							if (!oView) {
								sErrorMessage = "Did not find the root view with the id " + oOptions.rootView;
								return this._refuseInvalidTarget(oOptions._name, sErrorMessage);
							} else {
								return oView;
							}
						}.bind(this));
				} else {
					pViewContainingTheControl = Promise.resolve(oViewContainingTheControl);
				}

				pViewContainingTheControl = pViewContainingTheControl.then(function(oView) {
					if (oView && oView.isA("sap.ui.core.mvc.View")) {
						return oView.loaded();
					} else {
						return oView;
					}
				});

				if (oOptions.controlId) {
					pContainerControl = pViewContainingTheControl.then(function(oContainerView) {
						var oContainerControl;

						if (oContainerView) {
							oContainerControl = oContainerView.byId(oOptions.controlId);
						}

						if (!oContainerControl) {
							//Test if control exists in core (without prefix) since it was not found in the parent or root view
							oContainerControl =  sap.ui.getCore().byId(oOptions.controlId);
						}

						return oContainerControl;
					});
				} else {
					pContainerControl = Promise.resolve(oControl);
				}

				return pContainerControl.then(function(oContainerControl) {
					if (!oContainerControl) {
						sErrorMessage = "Control with ID " + oOptions.controlId + " could not be found";
						return this._refuseInvalidTarget(oOptions._name, sErrorMessage);
					} else {
						return oContainerControl;
					}
				}.bind(this));
			}.bind(this));
		},

		/**
		 * Create and display the placeholder on the respective container
		 *
		 * @param {object} oTargetCreateInfo Object containing the target create info
		 * @param {object} oContainerControl The container control
		 * @returns {object} the view info object
		 * @private
		 */
		displayPlaceholder: function(oTargetCreateInfo, oContainerControl) {
			var oObject,
				oOptions = this._oOptions,
				bIsComponentTarget = oOptions.type === "Component",
				bHasPlaceholderConfig = false,
				oPlaceholderConfig = oTargetCreateInfo.placeholder || oOptions.placeholder || {},
				pPlaceholder = Promise.resolve();

			if (Placeholder.hasProviders()) {
				Object.assign(oPlaceholderConfig, Placeholder.getPlaceholderFromProviders({
					name: oOptions.name,
					type: oOptions.type
				}));
			}

			if (Object.keys(oPlaceholderConfig).length > 0) {
				if (oPlaceholderConfig.autoClose === undefined) {
					oPlaceholderConfig.autoClose = true;
				}
				bHasPlaceholderConfig = true;
			}

			if (bIsComponentTarget) {
				var oOwnerComponent = this._oCache._oComponent;
				var sComponentContainerId = oTargetCreateInfo.componentId + "-container";

				oObject = (oOwnerComponent && oOwnerComponent.byId(sComponentContainerId))
					|| sap.ui.getCore().byId(sComponentContainerId);

				if (!oObject) {
					// defaults mixed in with configured settings
					var oContainerOptions = Object.assign({
						height: "100%",
						width: "100%",
						lifecycle: ComponentLifecycle.Application
					}, oOptions.containerOptions);

					if (oOwnerComponent) {
						oOwnerComponent.runAsOwner(function() {
							oObject = new ComponentContainer(oOwnerComponent.createId(sComponentContainerId), oContainerOptions);
						});
					} else {
						oObject = new ComponentContainer(sComponentContainerId, oContainerOptions);
					}
				}

				// set container object only if placeholder config is available
				if (bHasPlaceholderConfig) {
					oPlaceholderConfig.container = oObject;
				}
			}

			// for view targets use container control to display placeholder
			if (bHasPlaceholderConfig && oContainerControl.isA("sap.ui.core.IPlaceholderSupport")) {
				oPlaceholderConfig.container = oContainerControl;
			}

			// Placeholder creation
			if (oPlaceholderConfig.container && !oTargetCreateInfo.repeatedRoute) {
				oPlaceholderConfig.aggregation = this._oOptions.controlAggregation;

				var oCreateOptions = this._getCreateOptions(oTargetCreateInfo);
				var oCachedObject = this._oCache.fetch(oCreateOptions, this._oOptions.type);

				if (oCachedObject && bIsComponentTarget) {
					// for type "Component", the object that is saved in the placeholder config should be
					// the component container instead of the component
					oPlaceholderConfig.object = oObject;
				} else {
					oPlaceholderConfig.object = oCachedObject;
				}

				if (oPlaceholderConfig.html) {
					oPlaceholderConfig.placeholder = new Placeholder({
						html: oPlaceholderConfig.html
					});
				}

				if (oPlaceholderConfig.placeholder && Configuration.getPlaceholder()) {
					pPlaceholder = this.showPlaceholder(oPlaceholderConfig);
				}
			}

			// wait for placeholder to load
			return pPlaceholder.then(function(sPlaceholderContent) {
				// returning view info object
				return {
					containerControl: oContainerControl,
					object: oObject,
					placeholderConfig: oPlaceholderConfig,
					placeholderShown: !!sPlaceholderContent
				};
			});
		},

		/**
		 * Here the magic happens - recursion + placement + view creation needs to be refactored
		 *
		 * @param {object} [vData] an object that will be passed to the display event in the data property. If the
		 * 		target has parents, the data will also be passed to them.
		 * @param {Promise} oSequencePromise Promise chain for resolution in the correct order
		 * @param {object} oTargetCreateInfo Additional information  for the component creation. Currently the object only contains the prefix for the routerHashChanger
		 * @return {Promise} resolves with {name: *, view: *, control: *} if the target can be successfully displayed otherwise it rejects with an error message
		 * @private
		 */
		_place: function (vData, oSequencePromise, oTargetCreateInfo) {
			var oOptions = this._oOptions,
				that = this,
				sErrorMessage,
				bIsComponentTarget = oOptions.type === "Component";

			var pLoaded, /* target is loaded and promise for waiting on "routeMatched" event in nested component is ready*/
				pContainerReady; /* container control and placeholder ready */

			if (vData instanceof Promise) {
				oTargetCreateInfo = oSequencePromise;
				oSequencePromise = vData;
				vData = undefined;
			}

			oTargetCreateInfo = oTargetCreateInfo || {};

			if (bIsComponentTarget) {
				oTargetCreateInfo.componentId = oOptions.id || ManagedObjectMetadata.uid("uicomponent");
			}

			if ((oOptions.name || oOptions.usage) && oOptions.type) {
				// target loading
				pLoaded = this.load(oTargetCreateInfo);

				// Either if parent available, then we need to wait until the parent got displayed or
				// if no target info is given, then we need to wait for the oSequencePromise to be resolved
				if (this._oParent || oTargetCreateInfo.legacy) {
					// resolve container control and placeholder creation
					pContainerReady = oSequencePromise.then(this.resolveContainerControl.bind(this));
				} else {
					// no need to wait for oSequencePromise, resolve container control in parallel
					pContainerReady = this.resolveContainerControl();
				}

				pContainerReady = pContainerReady.then(this.displayPlaceholder.bind(this, oTargetCreateInfo));

				// when target information is given
				oSequencePromise = Promise.all([pLoaded, pContainerReady, oSequencePromise])
					// prepareTitleProvider
					.then(function(aArguments) {
						var oObject = aArguments[0].object,
							oViewInfo = aArguments[1],
							oView, oRootControl;

						oViewInfo.nestedComponentReady = aArguments[0].nestedComponentReady;

						if (bIsComponentTarget) {
							var fnOriginalDestroy = oObject.destroy;
							oObject.destroy = function () {
								if (fnOriginalDestroy) {
									fnOriginalDestroy.apply(this);
								}
								// destroy the component container when the component is destroyed
								oViewInfo.object.destroy();
							};
							oViewInfo.object.setComponent(oObject);

							oRootControl = oObject.getRootControl();
							if (oRootControl && oRootControl.isA("sap.ui.core.mvc.View")) {
								oView = oRootControl;
							}
						} else {
							// view
							oViewInfo.object = oObject;
							oView = oObject;
						}

						that._bindTitleInTitleProvider(oView);
						that._addTitleProviderAsDependent(oView);

						return oViewInfo;
					})
					// placing the view or component into container
					.then(function(oViewInfo) {
						var oContainerControl = oViewInfo.containerControl,
							oObject = oViewInfo.object;

						// adapt the container before placing the view into it to make the rendering occur together with the next
						// aggregation modification.
						that._beforePlacingViewIntoContainer({
							container: oContainerControl,
							view: oObject,
							data: vData
						});

						var oAggregationInfo = oContainerControl.getMetadata().getJSONKeys()[oOptions.controlAggregation];

						if (!oAggregationInfo) {
							sErrorMessage = "Control " + oOptions.controlId +
								" does not have an aggregation called " + oOptions.controlAggregation;
							return that._refuseInvalidTarget(oOptions._name, sErrorMessage);
						}

						if (oOptions.clearControlAggregation === true) {
							oContainerControl[oAggregationInfo._sRemoveAllMutator]();
						}

						Log.info("Did place the " + oOptions.type.toLowerCase() +
							" target '" + (oOptions.name ? that._getEffectiveObjectName(oOptions.name) : oOptions.usage) +
							"' with the id '" + oObject.getId() + "' into the aggregation '" + oOptions.controlAggregation +
							"' of a control with the id '" + oContainerControl.getId() + "'", that);

						// add oObject to oContainerControl's aggregation
						oContainerControl[oAggregationInfo._sMutator](oObject);

						return {
							name: oOptions._name,
							view: oObject,
							control: oContainerControl,
							nestedComponentReady: oViewInfo.nestedComponentReady,
							placeholderConfig: oViewInfo.placeholderConfig,
							placeholderShown: oViewInfo.placeholderShown
						};
					});
			} else {
				oSequencePromise = oSequencePromise.then(function() {
					return {
						name: oOptions._name
					};
				});
			}

			return oSequencePromise.then(function(oParams) {
				var pNestedComponentReady = oParams.nestedComponentReady || Promise.resolve();
				return pNestedComponentReady.then(function() {
					var oContainerControl = oParams.control,
						oObject = oParams.view,
						oPlaceholderConfig = oParams.placeholderConfig;

					if (oContainerControl && oObject) {
						that.fireDisplay({
							view : oObject.isA("sap.ui.core.mvc.View") ? oObject : undefined,
							object: oObject,
							control : oContainerControl,
							config : that._oOptions,
							data: vData,
							routeRelevant: oTargetCreateInfo.routeRelevant
						});
					}

					if (oPlaceholderConfig && oPlaceholderConfig.container &&
						oPlaceholderConfig.autoClose && that.hidePlaceholder) {
						that.hidePlaceholder(oPlaceholderConfig);
					}

					return oParams;
				});
			});
		},

		showPlaceholder: function(mSettings) {
			if (mSettings.container && mSettings.container.showPlaceholder) {
				return mSettings.container.showPlaceholder(mSettings);
			} else {
				return Promise.resolve();
			}
		},

		hidePlaceholder: function(mSettings) {
			if (mSettings.container.hidePlaceholder) {
				mSettings.container.hidePlaceholder();
			}
		},

		/**
		 * Validates the target options, will also be called from the route but route will not log errors
		 *
		 * @param {object} oParentInfo The parent info {name: *, view: *, control: *}
		 * @returns {boolean|string} returns true if it's valid otherwise the error message
		 * @private
		 */
		_isValid : function (oParentInfo) {
			var oOptions = this._oOptions,
				oControl = oParentInfo && oParentInfo.control,
				bHasTargetControl = (oControl || oOptions.controlId),
				bIsValid = true,
				sLogMessage = "";

			if (!bHasTargetControl) {
				sLogMessage = "The target " + oOptions._name + " has no controlId set and no parent so the target cannot be displayed.";
				bIsValid = false;
			}

			if (!oOptions.controlAggregation) {
				sLogMessage = "The target " + oOptions._name + " has a control id or a parent but no 'controlAggregation' was set, so the target could not be displayed.";
				bIsValid = false;
			}

			if (sLogMessage) {
				Log.error(sLogMessage, this);
			}

			return bIsValid || sLogMessage;
		},

		/**
		 * Refuses the target with the name <code>sName</code> by throwing an error asynchronously
		 *
		 * @param {string} sName The name of the target
		 * @param {string} sMessage The error message with more insights why the target is invalid
		 * @returns {Promise} The rejected promise
		 * @private
		 */
		_refuseInvalidTarget : function(sName, sMessage) {
			return Promise.reject(new Error(sMessage + " - Target: " + sName));
		}
	};
});
