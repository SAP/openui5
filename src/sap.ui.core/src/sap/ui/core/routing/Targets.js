/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/base/EventProvider',
	'./Target',
	'./async/Targets',
	"sap/base/future",
	"sap/base/Log",
	"sap/base/util/deepExtend"
],
	function(EventProvider, Target, asyncTargets, future, Log, deepExtend) {
		"use strict";

		/**
		 * Constructor for a new Targets class.
		 *
		 * @class
		 * Provides a convenient way for placing views into the correct containers of your application.
		 *
		 * The main benefit of <code>Targets</code> is lazy loading: you do not have to create the views until you really need them.
		 * If you are using the mobile library, please use {@link sap.m.routing.Targets} instead of this class.
		 * @extends sap.ui.base.EventProvider
		 * @param {object} oOptions
		 * @param {sap.ui.core.routing.Views} oOptions.views the views instance will create the instances of all the targets defined, so if 2 targets have the same
		 *  <code>type</code> and <code>name</code> set, the same instance of the target will be displayed.
		 * @param {object} [oOptions.config] this config allows all the values oOptions.targets.anyName allows, these will be the default values for properties used in the target.<br/>
		 * For example if you are only using xmlViews in your app you can specify viewType="XML" so you don't have to repeat this in every target.<br/>
		 * If a target specifies viewType="JS", the JS will be stronger than the XML here is an example.
		 *
		 * <pre>
		 * <code>
		 * {
		 *     config: {
		 *         viewType : "XML"
		 *     }
		 *     targets : {
		 *         xmlTarget : {
		 *             ...
		 *         },
		 *         jsTarget : {
		 *             viewType : "JS"
		 *             ...
		 *         }
		 *     }
		 * }
		 * </code>
		 * </pre>
		 * Then the effective config that will be used looks like this:
		 * <pre>
		 * <code>
		 * {
		 *     xmlTarget : {
		 *         // coming from the defaults
		 *         viewType : "XML"
		 *         ...
		 *     },
		 *     jsTarget : {
		 *        // XML is overwritten by the "JS" of the targets property
		 *        viewType : "JS"
		 *       ...
		 *     }
		 * }
		 * </code>
		 * </pre>
		 *
		 * @param {string} [oOptions.config.rootView]
		 * The id of the rootView - This should be the id of the view that contains the control with the controlId
		 * since the control will be retrieved by calling the {@link sap.ui.core.mvc.View#byId} function of the rootView.
		 * If you are using a component and add the routing.targets <b>do not set this parameter</b>,
		 * since the component will set the rootView to the view created by the {@link sap.ui.core.UIComponent#createContent} function.
		 * If you specify the "parent" property of a target, the control will not be searched in the root view but in the view Created by the parent (see parent documentation).
		 * @param {boolean} [oOptions.config.async=false] @since 1.34 Whether the views which are created through this Targets are loaded asynchronously. This option can be set only when the Targets
		 * is used standalone without the involvement of a Router. Otherwise the async option is inherited from the Router.

		 * @param {Object<string,sap.ui.core.routing.$TargetSettings>} oOptions.targets One or multiple targets in a map.
		 *
		 * @since 1.28.1
		 * @public
		 * @alias sap.ui.core.routing.Targets
		 */
		var Targets = EventProvider.extend("sap.ui.core.routing.Targets", /** @lends sap.ui.core.routing.Targets.prototype */ {

			constructor : function(oOptions) {
				EventProvider.apply(this);

				this._mTargets = {};
				this._oLastTitleTarget = {};
				this._oConfig = oOptions.config;
				this._oCache = oOptions.cache || oOptions.views;

				// If no config is given, set the default value to sync
				if (!this._oConfig) {
					this._oConfig = {
						_async: false
					};
				}

				// temporarily: for checking the url param
				function checkUrl() {
					if (new URLSearchParams(window.location.search).get("sap-ui-xx-asyncRouting") === "true") {
						Log.warning("Activation of async view loading in routing via url parameter is only temporarily supported and may be removed soon", "Targets");
						return true;
					}
					return false;
				}

				// Config object doesn't have _async set which means the Targets is instantiated standalone by given a non-empty config object
				// Assign the oConfig.async to oConfig._async and set the default value to sync
				if (this._oConfig._async === undefined) {
					// temporarily: set the default value depending on the url parameter "sap-ui-xx-asyncRouting"
					this._oConfig._async = (this._oConfig.async === undefined) ? checkUrl() : this._oConfig.async;
				}

				// branch by abstraction
				var TargetsStub = this._oConfig._async ?  asyncTargets : undefined/*syncTargets*/;
				for (var fn in TargetsStub) {
					this[fn] = TargetsStub[fn];
				}

				Object.keys(oOptions.targets).forEach(function(sTargetName) {
					this._createTarget(sTargetName, oOptions.targets[sTargetName]);
				}.bind(this));

				Object.keys(this._mTargets).forEach(function(sTargetName) {
					this._addParentTo(this._mTargets[sTargetName]);
				}.bind(this));
			},

			/**
			 * Associate the Targets with a router. Once the Targets is already connected with a router, futher calls of
			 * this function is ignored
			 *
			 * @param {sap.ui.core.routing.Router} oRouter The router instance
			 * @returns {this} The Targets itself
			 * @private
			 */
			_setRouter: function(oRouter) {
				if (!this._oRouter) {
					this._oRouter = oRouter;
				} else {
					Log.warning("The Targets is already connected with a router and this call of _setRouter is ignored");
				}
				return this;
			},

			/**
			 * Destroys the targets instance and all created targets. Does not destroy the views instance passed to the constructor. It has to be destroyed separately.
			 * @public
			 * @returns {this} this for method chaining.
			 */
			destroy : function () {
				var sTargetName;
				EventProvider.prototype.destroy.apply(this);

				for (sTargetName in this._mTargets) {
					if (this._mTargets.hasOwnProperty(sTargetName)) {
						this._mTargets[sTargetName].destroy();
					}
				}

				this._mTargets = null;
				this._oCache = null;
				this._oConfig = null;
				this.bIsDestroyed = true;

				return this;
			},

			/**
			 * @typedef {object} sap.ui.core.routing.TargetInfo
			 * @description Object containing the target info for displaying targets
			 * @property {string} name Defines the name of the target that is going to be displayed
			 * @property {string} [prefix] A prefix that is used for reserving a dedicated section in the browser hash
			 *  for the router of this target. This needs to be set only for target that has type "Component"
			 * @property {boolean} [propagateTitle=false] Whether the titleChanged event from this target should be propagated to the parent or not
			 * @property {boolean} [routeRelevant=false] Whether the target is relevant to the current matched route or not. If 'true', then the dynamic target is linked to the route's life cycle.
			 *     When switching to a different route, then the dynamic target will be suspended.
			 * @property {boolean} [ignoreInitialHash=false] Since 1.90. Whether the router of the "Component" target ignores the browser hash when it's re-initialized.
			 *     This parameter only has effect when the target is of type "Component" and its router is currently stopped. It has no effect on the first call of
			 *     {@link sap.ui.core.routing.Router#initialize}, because this is done by the application and not by the UI5 routing.
			 * @protected
			 * @since 1.84.0
			 */

			/**
			 * Creates a view and puts it in an aggregation of the specified control.
			 *
			 * @param {string|string[]|sap.ui.core.routing.TargetInfo|sap.ui.core.routing.TargetInfo[]} vTargets Either the target name or a target info object. To display multiple targets you may also pass an array of target names or target info objects.
			 * @param {object} [oData] an object that will be passed to the display event in the data property. If the target has parents, the data will also be passed to them.
			 * @param {string} [sTitleTarget] the name of the target from which the title option is taken for firing the {@link sap.ui.core.routing.Targets#event:titleChanged titleChanged} event
			 * @public
			 * @returns {this|Promise<Array<{name: string, view: sap.ui.core.mvc.View, control: sap.ui.core.Control, targetInfo: sap.ui.core.routing.TargetInfo}>>} this pointer for chaining or a Promise
			 * @name sap.ui.core.routing.Targets#display
			 * @function
			 */

			/**
			 * Returns the views instance passed to the constructor
			 *
			 * @return {sap.ui.core.routing.Views} the views instance
			 * @public
			 */
			getViews : function () {
				return this._oCache;
			},

			getCache: function () {
				return this._oCache;
			},

			/**
			 * Returns a target by its name (if you pass myTarget: { view: "myView" }) in the config myTarget is the name.
			 *
			 * @param {string|string[]} vName the name of a single target or the name of multiple targets
			 * @param {boolean} [bSuppressNotFoundError=false] In case no target is found for the given name, the not found
			 *  error is supressed when this is set with true
			 * @returns {sap.ui.core.routing.Target|undefined|sap.ui.core.routing.Target[]} The target with the
			 * coresponding name or undefined. If an array was passed as name, this will return an array with all found
			 * targets. Non existing targets will not be returned and an error is logged when
			 * <code>bSuppressNotFoundError</code> param isn't set to <code>true</code>.
			 * @public
			 */
			getTarget : function (vName, bSuppressNotFoundError) {
				var that = this,
					aTargetsConfig = this._alignTargetsInfo(vName),
					aTargets;

				aTargets = aTargetsConfig.reduce(function (aAcc, oConfig) {
					var oTarget = that._mTargets[oConfig.name];

					if (oTarget) {
						aAcc.push(oTarget);
					} else if (!bSuppressNotFoundError){
						Log.error("The target you tried to get \"" + oConfig.name + "\" does not exist!", that);
					}
					return aAcc;
				}, []);

				// When there's only one target found, the target should be returned directly instead of an array
				// with this target.
				// When no target is found, undefined should be returned instead of an empty array
				return aTargets.length <= 1 ? aTargets[0] : aTargets;
			},

			/**
			 * Creates a target by using the given name and options.
			 *
			 * If there's already a target with the same name, the existing target is not overwritten and
			 * an error log will be written to the console.
			 *
			 * @param {string} sName Name of a target
			 * @param {sap.ui.core.routing.$TargetSettings} oTargetOptions Options of a target. The option names are the same as the ones in "oOptions.targets.anyName" of {@link #constructor}.
			 * @returns {this} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 *
			 */
			addTarget : function (sName, oTargetOptions) {
				var oOldTarget = this.getTarget(sName, true /* suppress not found error log*/),
					oTarget;

				if (oOldTarget) {
					future.errorThrows("Target with name " + sName + " already exists", this);
				} else {
					oTarget = this._createTarget(sName, oTargetOptions);
					this._addParentTo(oTarget);
				}

				return this;
			},

			/**
			 * Suspends the targets which are specified by the parameter
			 *
			 * @param {string|string[]|object|object[]} vTargets The key of the target
			 *  or an object which has the key of the target under property 'name' as
			 *  specified in the {@link #constructor}. To suspend multiple targets you
			 *  may also pass an array of keys or objects which have the key saved
			 *  under the 'name' property
			 * @return {sap.ui.core.routing.Targets} The 'this' for call chaining
			 * @private
			 */
			suspend : function (vTargets) {
				var aTargetsInfo = this._alignTargetsInfo(vTargets);

				aTargetsInfo.forEach(function(oTargetInfo) {
					var sTargetName = oTargetInfo.name;
					var oTarget = this.getTarget(sTargetName);

					if (oTarget) {
						oTarget.suspend();
					}
				}.bind(this));

				return this;
			},

			/**
			 * Resumes the targets which are specified by the parameter
			 *
			 * @param {string|string[]|object|object[]} vTargets The key of the target
			 *  or an object which has the key of the target under property 'name' as
			 *  specified in the {@link #constructor}. To suspend multiple targets you
			 *  may also pass an array of keys or objects which have the key saved
			 *  under the 'name' property
			 * @return {sap.ui.core.routing.Targets} The 'this' for call chaining
			 * @private
			 */
			resume : function (vTargets) {
				var aTargetsInfo = this._alignTargetsInfo(vTargets);

				aTargetsInfo.forEach(function(oTargetInfo) {
					var sTargetName = oTargetInfo.name;
					var oTarget = this.getTarget(sTargetName);

					if (oTarget) {
						oTarget.resume();
					}
				}.bind(this));

				return this;
			},

			/**
			 * Will be fired when a target is displayed.
			 *
			 * Could be triggered by calling the display function or by the {@link sap.ui.core.routing.Router} when a target is referenced in a matching route.
			 *
			 * @name sap.ui.core.routing.Targets#display
			 * @event
			 * @param {object} oEvent
			 * @param {sap.ui.base.EventProvider} oEvent.getSource
			 * @param {object} oEvent.getParameters
			 * @param {object} oEvent.getParameters.view The view that got displayed.
			 * @param {object} oEvent.getParameters.control The control that now contains the view in the controlAggregation
			 * @param {object} oEvent.getParameters.config The options object passed to the constructor {@link sap.ui.core.routing.Targets#constructor}
			 * @param {object} oEvent.getParameters.name The name of the target firing the event
			 * @param {object} oEvent.getParameters.data The data passed into the {@link sap.ui.core.routing.Targets#display} function
			 * @param {object} oEvent.getParameters.routeRelevant=false Whether the target is relevant to the matched route or not
			 * @public
			 */

			/**
			 * Attaches event handler <code>fnFunction</code> to the {@link #event:display display} event of this
			 * <code>sap.ui.core.routing.Targets</code>.
			 *
			 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
			 * if specified, otherwise it will be bound to this <code>sap.ui.core.routing.Targets</code> itself.
			 *
			 * @param {object}
			 *            [oData] An application-specific payload object that will be passed to the event handler
			 *            along with the event object when firing the event
			 * @param {function}
			 *            fnFunction The function to be called, when the event occurs
			 * @param {object}
			 *            [oListener] Context object to call the event handler with. Defaults to this
			 *            <code>sap.ui.core.routing.Targets</code> itself
			 *
			 * @returns {this} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 */
			attachDisplay : function(oData, fnFunction, oListener) {
				return this.attachEvent(this.M_EVENTS.DISPLAY, oData, fnFunction, oListener);
			},

			/**
			 * Detaches event handler <code>fnFunction</code> from the {@link #event:display display} event of this
			 * <code>sap.ui.core.routing.Targets</code>.
			 *
			 * The passed function and listener object must match the ones used for event registration.
			 *
			 * @param {function} fnFunction The function to be called, when the event occurs
			 * @param {object} [oListener] Context object on which the given function had to be called
			 * @returns {this} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 */
			detachDisplay : function(fnFunction, oListener) {
				return this.detachEvent(this.M_EVENTS.DISPLAY, fnFunction, oListener);
			},

			/**
			 * Fires event {@link #event:created created} to attached listeners.
			 *
			 * @param {object} [oParameters] Parameters to pass along with the event
			 * @returns {this} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 */
			fireDisplay : function(oParameters) {
				return this.fireEvent(this.M_EVENTS.DISPLAY, oParameters);
			},

			/**
			 * Will be fired when the title of the "TitleTarget" has been changed.
			 *
			 * A "TitleTarget" is resolved as the following:
			 * <ol>
			 *  <li>When the {@link sap.ui.core.routing.Targets#display display} is called with only one target,
			 *      the "TitleTarget" is resolved with this target when its {@link sap.ui.core.routing.Targets#constructor title}
			 *      options is set.</li>
			 *  <li>When the {@link sap.ui.core.routing.Targets#display display} is called with more than one target, the
			 *      "TitleTarget" is resolved by default with the first target which has a
			 *      {@link sap.ui.core.routing.Targets#constructor title} option.</li>
			 *  <li>When the <code>sTitleTarget</code> parameter of {@link sap.ui.core.routing.Targets#display display} is given,
			 *      this specific target is then used as the "TitleTarget".</li>
			 * </ol>
			 *
			 * @name sap.ui.core.routing.Targets#titleChanged
			 * @event
			 * @param {object} oEvent
			 * @param {sap.ui.base.EventProvider} oEvent.getSource
			 * @param {object} oEvent.getParameters
			 * @param {string} oEvent.getParameters.title The current displayed title
			 * @param {string} oEvent.getParameters.name The name of the displayed target
			 * @public
			 */

			/**
 			 * Attaches event handler <code>fnFunction</code> to the {@link #event:titleChanged titleChanged} event of
 			 * this <code>sap.ui.core.routing.Targets</code>.
 			 *
 			 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
 			 * if specified, otherwise it will be bound to this <code>sap.ui.core.routing.Targets</code> itself.
 			 *
 			 * @param {object}
 			 *            [oData] An application-specific payload object that will be passed to the event handler
 			 *            along with the event object when firing the event
 			 * @param {function}
 			 *            fnFunction The function to be called, when the event occurs
 			 * @param {object}
 			 *            [oListener] Context object to call the event handler with. Defaults to this
 			 *            <code>sap.ui.core.routing.Targets</code> itself
 			 *
 			 * @returns {this} Reference to <code>this</code> in order to allow method chaining
 			 * @public
 			 */
			attachTitleChanged : function(oData, fnFunction, oListener) {
				this.attachEvent(this.M_EVENTS.TITLE_CHANGED, oData, fnFunction, oListener);
				return this;
			},

			/**
			 * Detaches event handler <code>fnFunction</code> from the {@link #event:titleChanged titleChanged} event of this
			 * <code>sap.ui.core.routing.Targets</code>.
			 *
			 * The passed function and listener object must match the ones used for event registration.
			 *
			 * @param {function} fnFunction The function to be called, when the event occurs
			 * @param {object} [oListener] Context object on which the given function had to be called
			 * @returns {this} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 */
			detachTitleChanged : function(fnFunction, oListener) {
				return this.detachEvent(this.M_EVENTS.TITLE_CHANGED, fnFunction, oListener);
			},

			fireTitleChanged : function(oParameters) {
				// if the new target is different as the last target that changed the title or the title changed, fire a titleChanged event
				if (this._oLastTitleTarget.name !== oParameters.name || this._oLastTitleTarget.title !== oParameters.title) {
					// save the current target name
					this._oLastTitleTarget.name = oParameters.name;
					// save the current title name
					this._oLastTitleTarget.title = oParameters.title;
					this.fireEvent(this.M_EVENTS.TITLE_CHANGED, oParameters);
				}
				return this;
			},

			M_EVENTS : {
				DISPLAY : "display",
				TITLE_CHANGED : "titleChanged"
			},

			/**
			 * Converts the different format of targets info into the object format
			 * which has the key of a target saved under the "name" property
			 *
			 * @param {string|string[]|object|object[]} vTargetsInfo The key of the target or
			 *  an object which has the key of the target under property 'name' as specified
			 *  in the {@link #constructor} or an array of keys or objects
			 * @return {object[]} Array of objects and each of the objects contains at least
			 *  the key of the target under the "name" property
			 * @private
			 */
			_alignTargetsInfo: function(vTargetsInfo) {
				if (vTargetsInfo === undefined) {
					return [];
				}

				if (!Array.isArray(vTargetsInfo)) {
					return (typeof vTargetsInfo === "object") ?
						[vTargetsInfo] : [{ name: vTargetsInfo }];
				}

				return vTargetsInfo.map(function(vTargetInfo) {
					if (typeof vTargetInfo !== "object") {
						vTargetInfo = {
							name: vTargetInfo
						};
					}
					return vTargetInfo;
				});
			},

			/**
			 * Creates a target
			 *
			 * @param {string} sName The name of the target
			 * @param {object} oTargetOptions The options of the target
			 * @return {sap.ui.core.routing.Target} The created target object
			 * @private
			 */
			_createTarget : function (sName, oTargetOptions) {
				var oTarget,
					oOptions,
					oDefaults = {
						_name: sName
					};

				if (this._vRootViewId) {
					oDefaults.rootView = this._vRootViewId;
				}

				oOptions = deepExtend(oDefaults, this._oConfig, oTargetOptions);

				oTarget = this._constructTarget(oOptions);
				oTarget.attachDisplay(function (oEvent) {
					var oParameters = oEvent.getParameters();

					this.fireDisplay({
						name : sName,
						view : oParameters.view,
						object: oParameters.object,
						control : oParameters.control,
						config : oParameters.config,
						data: oParameters.data,
						routeRelevant: oParameters.routeRelevant
					});
				}, this);
				this._mTargets[sName] = oTarget;

				return oTarget;
			},

			/**
			 * Adds the parent target to the given <code>oTarget</code>
			 * @param {sap.ui.core.routing.Target} oTarget The target
			 * @private
			 */
			_addParentTo : function (oTarget) {
				var oParentTarget,
					sParent = oTarget._oOptions.parent;

				if (!sParent) {
					return;
				}

				oParentTarget = this._mTargets[sParent];

				if (!oParentTarget) {
					future.errorThrows("The target '" + oTarget._oOptions._name + "' has a parent '" + sParent + "' defined, but it was not found in the other targets", this);
					return;
				}

				oTarget._oParent = oParentTarget;
			},

			/**
			 * Hook for the mobile library
			 * @param {object} oOptions The target options
			 * @param {sap.ui.core.routing.Target} oParent The parent of this target
			 * @returns {sap.ui.core.routing.Target} the new target
			 * @private
 			 */
			_constructTarget : function (oOptions, oParent) {
				return new Target(oOptions, this._oCache, oParent);
			},

			/**
			 * Hook to distinguish between the router and an application calling this.
			 *
			 * @private
			 * @param {any} [vData] an object that will be passed to the display event in the data property.
			 * @name sap.ui.core.routing.Targets#_display
			 */

			/**
			 *
			 * @param {string} sName name of the single target
			 * @param {any} [vData] an object that will be passed to the display event in the data property.
			 * @private
			 * @name sap.ui.core.routing.Targets.#_displaySingleTarget
			 */

			/**
			 * Called by the UIComponent since the rootView id is not known in the constructor
			 *
			 * @param {string|Promise} vId The id of the root view or a promise which resolves with the id of the root view
			 * @private
			 */
			_setRootViewId: function (vId) {
				var sTargetName,
					oTargetOptions;

				for (sTargetName in this._mTargets) {
					if (this._mTargets.hasOwnProperty(sTargetName)) {
						oTargetOptions = this._mTargets[sTargetName]._oOptions;
						if (oTargetOptions.rootView === undefined) {
							oTargetOptions.rootView = vId;
						}
					}
				}

				// save the root view id for later added target
				this._vRootViewId = vId;
			},

			/*
			 * Calculate the name of TitleTarget based on the given parameters
			 */
			_getTitleTargetName: function(vTargetNames, sProvidedTitleTargetName) {
				var oTarget, sTitleTargetName;

				if (sProvidedTitleTargetName) {
					// when titleTarget is defined, we use it directly without looping
					// through the vTargetNames
					vTargetNames = [sProvidedTitleTargetName];
				}

				vTargetNames = this._alignTargetsInfo(vTargetNames);

				vTargetNames.some(function(sTargetName) {
					oTarget = this.getTarget(sTargetName);

					// find the first target along the parent chain which has title defined
					while (oTarget && !oTarget._oOptions.title) {
						// oTarget._oParent && oTarget._oParent._oOptions.title) {
						oTarget = oTarget._oParent;
					}

					if (oTarget) {
						// we found the TitleTarget
						sTitleTargetName = oTarget._oOptions._name;
						return true;
					}

				}.bind(this));

				return sTitleTargetName;
			},

			/*
			 * Forward the titleChange event from a Target to this Targets
			 */
			_forwardTitleChanged: function(oEvent) {
				this.fireTitleChanged({
					name: oEvent.getParameter("name"),
					title: oEvent.getParameter("title")
				});
			},

			/*
			 * Calculate the 'TitleTarget' based on the given parameters and register to the titleChanged event on the 'TitleTarget'
			 */
			_attachTitleChanged: function(vTargets, sTitleTarget) {
				var oTitleTarget, sCalculatedTargetName;

				sCalculatedTargetName = this._getTitleTargetName(vTargets, sTitleTarget);

				if (sCalculatedTargetName) {
					oTitleTarget = this.getTarget(sCalculatedTargetName);
				}

				if (this._oLastDisplayedTitleTarget) {
					this._oLastDisplayedTitleTarget.detachTitleChanged(this._forwardTitleChanged, this);
					this._oLastDisplayedTitleTarget._bIsDisplayed = false;
				}

				if (oTitleTarget) {
					oTitleTarget.attachTitleChanged({name:oTitleTarget._oOptions._name}, this._forwardTitleChanged, this);
					this._oLastDisplayedTitleTarget = oTitleTarget;
				} else if (sTitleTarget) {
					future.errorThrows("The target with the name \"" + sTitleTarget + "\" where the titleChanged event should be fired does not exist!", this);
				}
			}

		});

		return Targets;

	});
