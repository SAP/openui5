/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/base/EventProvider',
	'./Target',
	'./async/Targets',
	'./sync/Targets',
	"sap/base/util/UriParameters",
	"sap/base/Log",
	"sap/base/util/deepExtend"
],
	function(EventProvider, Target, asyncTargets, syncTargets, UriParameters, Log, deepExtend) {
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
		 * @param {sap.ui.core.routing.Views} oOptions.views the views instance will create the views of all the targets defined, so if 2 targets have the same viewName, the same instance of the view will be displayed.
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
		 * @param {boolean} [oOptions.config.async=false] @since 1.34 Whether the views which are created through this Targets are loaded asyncly. This option can be set only when the Targets
		 * is used standalone without the involvement of a Router. Otherwise the async option is inherited from the Router.

		 * @param {object} oOptions.targets One or multiple targets in a map.
		 * @param {object} oOptions.targets.anyName a new target, the key severs as a name. An example:
		 * <pre>
		 * <code>
		 * {
		 *     targets: {
		 *         welcome: {
		 *             type: "View",
		 *             name: "Welcome",
		 *             viewType: "XML",
		 *             ....
		 *             // Other target parameters
		 *         },
		 *         goodbye: {
		 *             type: "Component",
		 *             usage: "myreuse",
		 *             containerSettings: {
		 *                 // settings for the component container
		 *             }
		 *             ....
		 *             // Other target parameters
		 *         }
		 *     }
		 * }
		 * </code>
		 * </pre>
		 *
		 * This will create two targets named 'welcome' and 'goodbye' you can display both of them or one of them using the {@link #display} function.
		 *
		 * The 'welcome' target creates a View instance when it's displayed. The 'goodbye' target creates a Component instance.<br/>
		 *
		 * The settings for the Component are defined in the manifest of the owner component of the router under path '/sap.ui5/componentUsages' and it can be used in the target by setting the 'usage' option with the name in the 'componentUsages'.<br/>
		 * See the following manifest.json example of the owner component. There's a component settings object defined with name "myreuse" which can be used to set the "usage" option in a target's configuration.
		 * <pre>
		 * <code>
		 * {
		 *     "sap.ui5": {
		 *         "componentUsages": {
		 *             "myreuse": {
		 *                 "name": "reuse.component",
		 *                 "settings": {},
		 *                 "componentData": {},
		 *                 "lazy": false,
		 *             }
		 *         }
		 *     }
		 * }
		 * </code>
		 * </pre>
		 *
		 * @param {string} oOptions.targets.anyName.type Defines whether the target creates an instance of 'View' or 'Component'.
		 * @param {string} [oOptions.targets.anyName.name] Defines the name of the View or Component that will be created. For type 'Component', use option 'usage' instead if an owner component exists.
		 * To place the view or component into a Control, use the options 'controlAggregation' and 'controlId'. Instance of View or Component will only be created once per 'name' or 'usage' combined
		 * with 'id'.
		 * <pre>
		 * <code>
		 * {
		 *     targets: {
		 *         // If display("masterWelcome") is called, the master view will be placed in the 'MasterPages' of a control with the id splitContainter
		 *         masterWelcome: {
		 *             type: "View",
		 *             name: "Welcome",
		 *             controlId: "splitContainer",
		 *             controlAggregation: "masterPages"
		 *         },
		 *         // If display("detailWelcome") is called after the masterWelcome, the view will be removed from the master pages and added to the detail pages, since the same instance is used. Also the controls inside of the view will have the same state.
		 *         detailWelcome: {
		 *             // same view here, that's why the same instance is used
		 *             type: "View",
		 *             name: "Welcome",
		 *             controlId: "splitContainer",
		 *             controlAggregation: "detailPages"
		 *         }
		 *     }
		 * }
		 * </code>
		 * </pre>
		 *
		 *
		 * If you want to have a second instance of the 'welcome' view you can set different 'id' to the targets:
		 *
		 * <pre>
		 * <code>
		 * {
		 *     targets: {
		 *         // If display("masterWelcome") is called, the master viewName will be placed in the 'MasterPages' of a control with the id splitContainter
		 *         masterWelcome: {
		 *             type: "View",
		 *             name: "Welcome",
		 *             controlId: "splitContainer",
		 *             controlAggregation: "masterPages",
		 *             id: "masterWelcome",
		 *         },
		 *         // If display("detailWelcome") is called after the masterWelcome, a second instance with an own controller instance will be added in the detail pages.
		 *         detailWelcome: {
		 *             type: "View",
		 *             name: "WelcomeWithAlias",
		 *             controlId: "splitContainer",
		 *             controlAggregation: "detailPages",
		 *             id: "detailWelcome"
		 *         }
		 *     }
		 * }
		 * </code>
		 * </pre>
		 *
		 *
		 * @param {string} [oOptions.targets.anyName.usage] Defines the 'usage' name for 'Component' target which refers to the '/sap.ui5/componentUsages' entry in the owner component's manifest.
		 * @param {string} [oOptions.targets.anyName.viewType=oOptions.config.viewType] The type of the view that is going to be created. These are the supported types: {@link sap.ui.core.mvc.ViewType}.
		 * You always have to provide a viewType except if <code>oOptions.config.viewType</code> is set or when using {@link sap.ui.core.routing.Views#setView}.
		 * @param {string} [oOptions.targets.anyName.path]
		 * A prefix that will be prepended in front of the name.<br/>
		 * <b>Example:</b> name is set to "myView" and path is set to "myApp" - the created view name will be "myApp.myView".
		 * @param {string} [oOptions.targets.anyName.id] The ID of the created instance.
		 * This is will be prefixed with the id of the component set to the views instance provided in oOptions.views. For details see {@link sap.ui.core.routing.Views#getView}.
		 * @param {string} [oOptions.targets.anyName.targetParent]
		 * The id of the parent of the controlId - This should be the id of the view that contains your controlId,
		 * since the target control will be retrieved by calling the {@link sap.ui.core.mvc.View#byId} function of the targetParent. By default,
		 * this will be the view created by a component, so you do not have to provide this parameter.
		 * If you are using children, the view created by the parent of the child is taken.
		 * You only need to specify this, if you are not using a Targets instance created by a component
		 * and you should give the id of root view of your application to this property.
		 * @param {string} [oOptions.targets.anyName.controlId] The ID of the control where you want to place the instance created by this target. You also need to set "controlAggregation" property to specify to which aggregation of the control should the created instance be added.
		 * An example for containers are {@link sap.ui.ux3.Shell} with the aggregation 'content' or a {@link sap.m.NavContainer} with the aggregation 'pages'.
		 *
		 * @param {string} [oOptions.targets.anyName.controlAggregation] The name of an aggregation of the controlId, where the created instance from the target will be added.
		 * Eg: a {@link sap.m.NavContainer} has an aggregation 'pages', another Example is the {@link sap.ui.ux3.Shell} it has 'content'.
		 * @param {boolean} [oOptions.targets.anyName.clearControlAggregation] Defines a boolean that can be passed to specify if the aggregation should be cleared
		 * - all items will be removed - before adding the View to it.
		 * When using a {@link sap.ui.ux3.Shell} this should be true. For a {@link sap.m.NavContainer} it should be false. When you use the {@link sap.m.routing.Router} the default will be false.
		 * @param {string} [oOptions.targets.anyName.parent] A reference to another target, using the name of the target.
		 * If you display a target that has a parent, the parent will also be displayed.
		 * Also the control you specify with the controlId parameter, will be searched inside of the created instance of the parent not in the rootView, provided in the config.
		 * The control will be searched using the byId function of a view. When it is not found, the global id is checked.
		 * <br/>
		 * The main usecase for the parent property is placing a view or component inside a smaller container of an instance, which is also created by targets.
		 * This is useful for lazy loading views or components, only if the user really navigates to this part of your application.
		 * <br/>
		 * <b>Example:</b>
		 * Our aim is to lazy load a tab of an IconTabBar (a control that displays a view initially and when a user clicks on it the view changes).
		 * It's a perfect candidate to lazy load something inside of it.
		 * <br/>
		 * <b>Example app structure:</b><br/>
		 * We have a rootView that is returned by the createContent function of our UIComponent. This view contains an sap.m.App control with the id 'myApp'
		 * <pre>
		 * <code>
		 * &lt;View xmlns="sap.m"&gt;
		 *     &lt;App id="myApp"/&gt;
		 * &lt;/View&gt;
		 * </code>
		 * </pre>
		 * an xml view called 'Detail'
		 * <pre>
		 * <code>
		 * &lt;View xmlns="sap.m"&gt;
		 *     &lt;IconTabBar&gt;
		 *         &lt;items&gt;
		 *             &lt;IconTabFilter&gt;
		 *                 &lt;!-- content of our first tab --&gt;
		 *             &lt;IconTabFilter&gt;
		 *             &lt;IconTabFilter id="mySecondTab"&gt;
		 *                 &lt;!-- nothing here, since we will lazy load this one with a target --&gt;
		 *             &lt;IconTabFilter&gt;
		 *         &lt;/items&gt;
		 *     &lt;/IconTabBar&gt;
		 * &lt;/View&gt;
		 * </code>
		 * </pre>
		 * and a view called 'SecondTabContent', this one contains our content we want to have lazy loaded.
		 * Now we need to create our Targets instance with a config matching our app:
		 * <pre>
		 * <code>
		 *     new Targets({
		 *         //Creates our views except for root, we created this one before - when using a component you
		 *         views: new Views(),
		 *         config: {
		 *             // all of our views have that type
		 *             viewType: 'XML',
		 *             // a reference to the app control in the rootView created by our UIComponent
		 *             controlId: 'myApp',
		 *             // An app has a pages aggregation where the views need to be put into
		 *             controlAggregation: 'pages'
		 *         },
		 *         targets: {
		 *             detail: {
		 *                 type: "View",
		 *                 name: 'Detail'
		 *             },
		 *             secondTabContent: {
		 *                 // A reference to the detail target defined above
		 *                 parent: 'detail',
		 *                 // A reference to the second Tab container in the Detail view. Here the target does not look in the rootView, it looks in the Parent view (Detail).
		 *                 controlId: 'mySecondTab',
		 *                 // An IconTabFilter has an aggregation called content so we need to overwrite the pages set in the config as default.
		 *                 controlAggregation: 'content',
		 *                 // A view containing the content
		 *                 type: "View",
		 *                 name: 'SecondTabContent'
		 *             }
		 *         }
		 *     });
		 * </code>
		 * </pre>
		 *
		 * Now if we call <code> oTargets.display("secondTabContent") </code>, 2 views will be created: Detail and SecondTabContent.
		 * The 'Detail' view will be put into the pages aggregation of the App. And afterwards the 'SecondTabContent' view will be put into the content Aggregation of the second IconTabFilter.
		 * So a parent will always be created before the target referencing it.
		 *
		 * @since 1.28.1
		 * @public
		 * @alias sap.ui.core.routing.Targets
		 */
		var Targets = EventProvider.extend("sap.ui.core.routing.Targets", /** @lends sap.ui.core.routing.Targets.prototype */ {

			constructor : function(oOptions) {
				var sTargetOptions,
					sTargetName;

				EventProvider.apply(this);

				this._mTargets = {};
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
					if (UriParameters.fromQuery(window.location.search).get("sap-ui-xx-asyncRouting") === "true") {
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
				var TargetsStub = this._oConfig._async ?  asyncTargets : syncTargets;
				for (var fn in TargetsStub) {
					this[fn] = TargetsStub[fn];
				}

				for (sTargetOptions in oOptions.targets) {
					if (oOptions.targets.hasOwnProperty(sTargetOptions)) {
						this._createTarget(sTargetOptions, oOptions.targets[sTargetOptions]);
					}
				}

				for (sTargetName in this._mTargets) {
					if (this._mTargets.hasOwnProperty(sTargetName)) {
						this._addParentTo(this._mTargets[sTargetName]);
					}
				}

			},

			/**
			 * Destroys the targets instance and all created targets. Does not destroy the views instance passed to the constructor. It has to be destroyed separately.
			 * @public
			 * @returns { sap.ui.core.routing.Targets } this for chaining.
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
			 * Creates a view and puts it in an aggregation of the specified control.
			 *
			 * @param {string|string[]} vTargets Key of the target as specified in the {@link #constructor}. To display multiple targets you may also pass an array of keys.
			 * @param {object} [oData] an object that will be passed to the display event in the data property. If the target has parents, the data will also be passed to them.
			 * @param {string} [sTitleTarget] the name of the target from which the title option is taken for firing the {@link sap.ui.core.routing.Targets#event:titleChanged titleChanged} event
			 * @public
			 * @returns {sap.ui.core.routing.Targets|Promise} this pointer for chaining or a Promise
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
			 * @return {sap.ui.core.routing.Target|undefined|sap.ui.core.routing.Target[]} The target with the
			 * coresponding name or undefined. If an array way passed as name this will return an array with all found
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
			 * @param {object} oTargetOptions Options of a target. The option names are the same as the ones in "oOptions.targets.anyName" of {@link #constructor}.
			 * @returns {sap.ui.core.routing.Targets} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 *
			 */
			addTarget : function (sName, oTargetOptions) {
				var oOldTarget = this.getTarget(sName, true /* suppress not found error log*/),
					oTarget;

				if (oOldTarget) {
					Log.error("Target with name " + sName + " already exists", this);
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
					var oTarget = this.getTarget(oTargetInfo.name);

					if (oTarget) {
						oTarget.suspend();
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
			 * @returns {sap.ui.core.routing.Targets} Reference to <code>this</code> in order to allow method chaining
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
			 * @returns {sap.ui.core.routing.Targets} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 */
			detachDisplay : function(fnFunction, oListener) {
				return this.detachEvent(this.M_EVENTS.DISPLAY, fnFunction, oListener);
			},

			/**
			 * Fires event {@link #event:created created} to attached listeners.
			 *
			 * @param {object} [oParameters] Parameters to pass along with the event
			 * @returns {sap.ui.core.routing.Targets} Reference to <code>this</code> in order to allow method chaining
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
 			 * @returns {sap.ui.core.routing.Targets} Reference to <code>this</code> in order to allow method chaining
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
			 * @returns {sap.ui.core.routing.Targets} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 */
			detachTitleChanged : function(fnFunction, oListener) {
				return this.detachEvent(this.M_EVENTS.TITLE_CHANGED, fnFunction, oListener);
			},

			fireTitleChanged : function(oParameters) {
				// if the new title is different as the previous one, fire a titleChanged event
				if (oParameters.title !== this._sPreviousTitle) {
					// save the current title
					this._sPreviousTitle = oParameters.title;
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
					oOptions;

				oOptions = deepExtend({ _name: sName }, this._oConfig, oTargetOptions);
				oTarget = this._constructTarget(oOptions);
				oTarget.attachDisplay(function (oEvent) {
					var oParameters = oEvent.getParameters();

					this.fireDisplay({
						name : sName,
						view : oParameters.view,
						control : oParameters.control,
						config : oParameters.config,
						data: oParameters.data
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
					Log.error("The target '" + oTarget._oOptions._name + " has a parent '" + sParent + "' defined, but it was not found in the other targets", this);
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
			 * @param {string} sId The id of the root view
			 * @private
			 */
			_setRootViewId: function (sId) {
				var sTargetName,
					oTargetOptions;

				for (sTargetName in this._mTargets) {
					if (this._mTargets.hasOwnProperty(sTargetName)) {
						oTargetOptions = this._mTargets[sTargetName]._oOptions;
						if (oTargetOptions.rootView === undefined) {
							oTargetOptions.rootView = sId;
						}
					}
				}
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

				if (this._oLastTitleTarget) {
					this._oLastTitleTarget.detachTitleChanged(this._forwardTitleChanged, this);
					this._oLastTitleTarget._bIsDisplayed = false;
				}

				if (oTitleTarget) {
					oTitleTarget.attachTitleChanged({name:oTitleTarget._oOptions._name}, this._forwardTitleChanged, this);
					this._oLastTitleTarget = oTitleTarget;
				} else if (sTitleTarget) {
					Log.error("The target with the name \"" + sTitleTarget + "\" where the titleChanged event should be fired does not exist!", this);
				}
			}

		});

		return Targets;

	});
