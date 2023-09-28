/*!
 * ${copyright}
 */


sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/base/EventProvider',
	'sap/ui/core/mvc/View',
	'sap/ui/core/routing/async/Target',
	"sap/base/Log"
],
	function(
		Control,
		EventProvider,
		View,
		asyncTarget,
		Log
	) {
		"use strict";

		/**
		 * This class resolves the property binding of the 'title' option.
		 *
		 * @class
		 * @param {object} mSettings configuration object for the TitleProvider
		 * @param {object} mSettings.target Target for which the TitleProvider is created
		 * @private
		 * @extends sap.ui.core.Control
		 */
		var TitleProvider = Control.extend("sap.ui.core.routing.Target.TitleProvider", /** @lends sap.ui.core.routing.TitleProvider.prototype */ {
			metadata: {
				library: "sap.ui.core",
				properties: {
					/**
					 * The title text provided by this class
					 */
					title: {
						type: "string",
						group: "Data",
						defaultValue: null
					}
				}
			},
			constructor: function(mSettings) {
				this._oTarget = mSettings.target;
				delete mSettings.target;
				Control.prototype.constructor.call(this, mSettings);
			},
			setTitle: function(sTitle) {
				// Setting title property should not trigger two way change in model
				this.setProperty("title", sTitle, true);

				if (this._oTarget._bIsDisplayed && sTitle) {
					this._oTarget.fireTitleChanged({
						name: this._oTarget._oOptions._name,
						title: sTitle
					});
				}
			}
		});

		/**
		 * Configuration object for a routing Target
		 *
		 * @typedef {object} sap.ui.core.routing.$TargetSettings
		 * @public
		 *
		 * @property {string} type Defines whether the target creates an instance of 'View' or 'Component'.
		 * @property {string} [name] Defines the name of the View or Component that will be
		 *  created. For type 'Component', use option 'usage' instead if an owner component exists.
		 *  To place the view or component into a Control, use the options <code>controlAggregation</code> and
		 *  <code>controlId</code>. Instance of View or Component will only be created once per <code>name</code> or
		 *  <code>usage</code> combined with <code>id</code>.
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
		 *         // If display("masterWelcome") is called, the view with name "Welcome" will be placed in the 'MasterPages' of a control with the ID splitContainter
		 *         masterWelcome: {
		 *             type: "View",
		 *             name: "Welcome",
		 *             id: "masterWelcome",
		 *             controlId: "splitContainer",
		 *             controlAggregation: "masterPages"
		 *         },
		 *         // If display("detailWelcome") is called after the "masterWelcome" target, a second instance of the same view with its own controller instance will be added in the detail pages.
		 *         detailWelcome: {
		 *             type: "View",
		 *             name: "Welcome",
		 *             // another instance will be created because a different ID is used
		 *             id: "detailWelcome",
		 *             controlId: "splitContainer",
		 *             controlAggregation: "detailPages"
		 *         }
		 *     }
		 * }
		 * </code>
		 * </pre>
		 *
		 *
		 * @property {string} [usage] Defines the 'usage' name for 'Component' target which refers to the '/sap.ui5/componentUsages' entry in the owner component's manifest.
		 * @property {string} [viewType] The type of the view that is going to be created. These are the supported types: {@link sap.ui.core.mvc.ViewType}.
		 * You always have to provide a viewType except it's defined in the shared <code>config</code> or when using {@link sap.ui.core.routing.Views#setView}.
		 * @property {string} [path]
		 * A prefix that will be prepended in front of the <code>name</code>.<br/>
		 * <b>Example:</b> <code>name</code> is set to "myView" and <code>path</code> is set to "myApp" - the created view's name will be "myApp.myView".
		 * @property {string} [id] The ID of the created instance.
		 * This is will be prefixed with the ID of the component set to the views instance provided in oOptions.views. For details see {@link sap.ui.core.routing.Views#getView}.
		 * @property {string} [targetParent]
		 * The ID of the parent of the controlId - This should be the ID of the view that contains your controlId,
		 * since the target control will be retrieved by calling the {@link sap.ui.core.mvc.View#byId} function of the targetParent. By default,
		 * this will be the view created by a component, so you do not have to provide this parameter.
		 * If you are using children, the view created by the parent of the child is taken.
		 * You only need to specify this, if you are not using a Targets instance created by a component
		 * and you should give the ID of root view of your application to this property.
		 * @property {string} [controlId] The ID of the control where you want to place the instance created by this target. You also need to set "controlAggregation" property to specify to which aggregation of the control should the created instance be added.
		 * An example for containers are {@link sap.ui.ux3.Shell} with the aggregation 'content' or a {@link sap.m.NavContainer} with the aggregation 'pages'.
		 *
		 * @property {string} [controlAggregation] The name of an aggregation of the controlId, where the created instance from the target will be added.
		 * Eg: a {@link sap.m.NavContainer} has an aggregation 'pages', another Example is the {@link sap.ui.ux3.Shell} it has 'content'.
		 * @property {boolean} [clearControlAggregation] Defines a boolean that can be passed to specify if the aggregation should be cleared
		 * - all items will be removed - before adding the View to it.
		 * When using a {@link sap.ui.ux3.Shell} this should be true. For a {@link sap.m.NavContainer} it should be false. When you use the {@link sap.m.routing.Router} the default will be false.
		 * @property {string} [parent] A reference to another target, using the name of the target.
		 * If you display a target that has a parent, the parent will also be displayed.
		 * Also the control you specify with the controlId parameter, will be searched inside of the created instance of the parent not in the rootView, provided in the config.
		 * The control will be searched using the byId function of a view. When it is not found, the global ID is checked.
		 * <br/>
		 * The main use case for the parent property is placing a view or component inside a smaller container of an instance, which is also created by targets.
		 * This is useful for lazy loading views or components, only if the user really navigates to this part of your application.
		 * <br/>
		 * <b>Example:</b>
		 * Our aim is to lazy load a tab of an IconTabBar (a control that displays a view initially and when a user clicks on it the view changes).
		 * It's a perfect candidate to lazy load something inside of it.
		 * <br/>
		 * <b>Example app structure:</b><br/>
		 * We have a rootView that is returned by the createContent function of our UIComponent. This view contains an sap.m.App control with the ID 'myApp'
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
		 * Now we need to define the routing config within "sap.ui5/routing" section in manifest.json of a Component:
		 * <pre>
		 * <code>
		 *     {
		 *         "config": {
		 *             // all of our views have that type
		 *             "viewType": "XML",
		 *             // a reference to the app control in the rootView created by our UIComponent
		 *             "controlId": "myApp",
		 *             // An app has a pages aggregation where the views need to be put into
		 *             "controlAggregation": "pages"
		 *         },
		 *         "targets": {
		 *             "detail": {
		 *                 "type": "View",
		 *                 "name": "Detail"
		 *             },
		 *             "secondTabContent": {
		 *                 // A reference to the detail target defined above
		 *                 "parent": "detail",
		 *                 // A reference to the second Tab container in the Detail view. Here the target does not look in the rootView, it looks in the Parent view (Detail).
		 *                 "controlId": "mySecondTab",
		 *                 // An IconTabFilter has an aggregation called content so we need to overwrite the pages set in the config as default.
		 *                 "controlAggregation": "content",
		 *                 // A view containing the content
		 *                 "type": "View",
		 *                 "name": "SecondTabContent"
		 *             }
		 *         }
		 *     }
		 * </code>
		 * </pre>
		 *
		 * Now if the target with name "secondTabContent" is displayed, 2 views will be created: Detail and SecondTabContent.
		 * The 'Detail' view will be put into the pages aggregation of the App. And afterwards the 'SecondTabContent' view will be put into the content Aggregation of the second IconTabFilter.
		 * So a parent will always be created before the target referencing it.
		 */


		/**
		 * <b>Don't call this constructor directly</b>, use {@link sap.ui.core.routing.Targets} instead, it will create instances of a Target.<br/>
		 * If you are using the mobile library, please use the {@link sap.m.routing.Targets} constructor, please read the documentation there.<br/>
		 *
		 * @class
		 * Provides a convenient way for placing views into the correct containers of your application.
		 *
		 * The main benefit of Targets is lazy loading: you do not have to create the views until you really need them.
		 * @param {object} oOptions all of the parameters defined in {@link sap.m.routing.Targets#constructor} are accepted here, except for children you need to specify the parent.
		 * @param {sap.ui.core.routing.TargetCache} oCache All views required by this target will get created by the views instance using {@link sap.ui.core.routing.Views#getView}
		 * @param {sap.ui.core.routing.Target} [oParent] the parent of this target. Will also get displayed, if you display this target. In the config you have the fill the children property {@link sap.m.routing.Targets#constructor}
		 * @public
		 * @since 1.28.1
		 * @extends sap.ui.base.EventProvider
		 * @alias sap.ui.core.routing.Target
		 */
		var Target = EventProvider.extend("sap.ui.core.routing.Target", /** @lends sap.ui.core.routing.Target.prototype */ {

			constructor : function(oOptions, oCache) {
				var sErrorMessage;
				// temporarily: for checking the url param
				function checkUrl() {
					if (new URLSearchParams(window.location.search).get("sap-ui-xx-asyncRouting") === "true") {
						Log.warning("Activation of async view loading in routing via url parameter is only temporarily supported and may be removed soon", "Target");
						return true;
					}
					return false;
				}
				// Set the default value to sync
				if (oOptions._async === undefined) {
					// temporarily: set the default value depending on the url parameter "sap-ui-xx-asyncRouting"
					oOptions._async = checkUrl();
				}

				if (oOptions.type === "Component" && !oOptions._async) {
					sErrorMessage = "sap.ui.core.routing.Target doesn't support loading component in synchronous mode, please switch routing to async";
					Log.error(sErrorMessage);
					throw new Error(sErrorMessage);
				}

				this._updateOptions(oOptions);

				this._oCache = oCache;
				EventProvider.apply(this, arguments);

				if (this._oOptions.title) {
					this._oTitleProvider = new TitleProvider({
						target: this
					});
				}

				// branch by abstraction
				var TargetStub = this._oOptions._async ?  asyncTarget : undefined/*syncTarget*/;
				for (var fn in TargetStub) {
					this[fn] = TargetStub[fn];
				}

				this._bIsDisplayed = false;
				this._bIsLoaded = false;
			},

			/**
			 * Destroys the target, will be called by {@link sap.m.routing.Targets} don't call this directly.
			 *
			 * @protected
			 * @returns { sap.ui.core.routing.Target } this for chaining.
			 */
			destroy : function () {
				this._oParent = null;
				this._oOptions = null;
				this._oCache = null;
				if (this._oTitleProvider) {
					this._oTitleProvider.destroy();
				}
				this._oTitleProvider = null;
				EventProvider.prototype.destroy.apply(this, arguments);
				this.bIsDestroyed = true;

				return this;
			},

			/**
			 * Creates a view and puts it in an aggregation of a control that has been defined in the {@link sap.ui.core.routing.Target#constructor}.
			 *
			 * @name sap.ui.core.routing.Target#display
			 * @function
			 * @param {object} [vData] an object that will be passed to the display event in the data property. If the target has parents, the data will also be passed to them.
			 * @return {Promise<{name: string, view: sap.ui.core.mvc.View, control: sap.ui.core.Control}>} resolves with {name: *, view: *, control: *} if the target can be successfully displayed otherwise it resolves with {name: *, error: *}
			 * @public
			 */

			/**
			 * Suspends the object which is loaded by the target.
			 *
			 * Currently this function stops the router of the component when the object which is loaded by this target
			 * is an instance of UIComponent. This is done only when the target is already loaded. When the target is
			 * not loaded yet or still being loaded, the router of the component isn't stopped.
			 *
			 * @return {sap.ui.core.routing.Target} The 'this' to chain the call
			 * @name sap.ui.core.routing.Target#suspend
			 * @function
			 * @public
			 */

			/**
			 * Will be fired when a target is displayed
			 *
			 * Could be triggered by calling the display function or by the {@link sap.ui.core.routing.Router} when a target is referenced in a matching route.
			 *
			 * @name sap.ui.core.routing.Target#display
			 * @event
			 * @param {object} oEvent
			 * @param {sap.ui.base.EventProvider} oEvent.getSource
			 * @param {object} oEvent.getParameters
			 * @param {object} oEvent.getParameters.view The view that got displayed.
			 * @param {object} oEvent.getParameters.control The control that now contains the view in the controlAggregation
			 * @param {object} oEvent.getParameters.config The options object passed to the constructor {@link sap.ui.core.routing.Target#constructor}
			 * @param {object} oEvent.getParameters.data The data passed into the {@link sap.ui.core.routing.Target#display} function
			 * @param {object} oEvent.getParameters.routeRelevant=false Whether the target is relevant to the matched route or not
			 * @public
			 */

			/**
			 * Attaches event handler <code>fnFunction</code> to the {@link #event:display display} event of this
			 * <code>sap.ui.core.routing.Target</code>.
			 *
			 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
			 * if specified, otherwise it will be bound to this <code>sap.ui.core.routing.Target</code> itself.
			 *
			 * @param {object}
			 *            [oData] An application-specific payload object that will be passed to the event handler along with the event object when firing the event
			 * @param {function}
			 *            fnFunction The function to be called, when the event occurs
			 * @param {object}
			 *            [oListener] Context object to call the event handler with. Defaults to this
			 *            <code>sap.ui.core.routing.Target</code> itself
			 *
			 * @returns {this} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 */
			attachDisplay : function(oData, fnFunction, oListener) {
				return this.attachEvent(this.M_EVENTS.DISPLAY, oData, fnFunction, oListener);
			},

			/**
			 * Detaches event handler <code>fnFunction</code> from the {@link #event:display display} event of this
			 * <code>sap.ui.core.routing.Target</code>.
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
			 * @protected
			 */
			fireDisplay : function(oParameters) {
				var sTitle = this._oTitleProvider && this._oTitleProvider.getTitle();
				if (sTitle) {
					this.fireTitleChanged({
						name: this._oOptions._name,
						title: sTitle
					});
				}

				this._bIsDisplayed = true;

				oParameters = oParameters || {};
				oParameters.config = this._oRawOptions;

				return this.fireEvent(this.M_EVENTS.DISPLAY, oParameters);
			},

			/**
			 * Will be fired when the title of this <code>Target</code> has been changed.
			 *
			 * @name sap.ui.core.routing.Target#titleChanged
			 * @event
			 * @param {object} oEvent
			 * @param {sap.ui.base.EventProvider} oEvent.getSource
			 * @param {object} oEvent.getParameters
			 * @param {string} oEvent.getParameters.title The name of this target
			 * @param {string} oEvent.getParameters.title The current displayed title
			 * @private
			 */

			/**
			 * Attaches event handler <code>fnFunction</code> to the {@link #event:titleChanged titleChanged} event of this
			 * <code>sap.ui.core.routing.Target</code>.
			 *
			 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code>
			 * if specified, otherwise it will be bound to this <code>sap.ui.core.routing.Target</code> itself.
			 *
			 * When the first event handler is registered later than the last title change, it's still called with the last changed title because
			 * when title is set with static text, the event is fired synchronously with the instantiation of this Target and the event handler can't
			 * be registered before the event is fired.
			 *
			 * @param {object}
			 *            [oData] An application-specific payload object that will be passed to the event handler along with the event object when firing the event
			 * @param {function}
			 *            fnFunction The function to be called, when the event occurs
			 * @param {object} [oListener]
			 *            Context object to call the event handler with. Defaults to this
			 *            <code>sap.ui.core.routing.Target</code> itself
			 *
			 * @returns {this} Reference to <code>this</code> in order to allow method chaining
			 * @private
			 */
			attachTitleChanged : function(oData, fnFunction, oListener) {
				var bHasListener = this.hasListeners("titleChanged"),
					sTitle = this._oTitleProvider && this._oTitleProvider.getTitle();

				this.attachEvent(this.M_EVENTS.TITLE_CHANGED, oData, fnFunction, oListener);
				// in case the title is changed before the first event listener is attached, we need to notify, too
				if (!bHasListener && sTitle && this._bIsDisplayed) {
					this.fireTitleChanged({
						name: this._oOptions._name,
						title: sTitle
					});
				}
				return this;
			},

			/**
			 * Detaches event handler <code>fnFunction</code> from the {@link #event:titleChanged titleChanged} event of this
			 * <code>sap.ui.core.routing.Target</code>.
			 *
			 * The passed function and listener object must match the ones used for event registration.
			 *
			 * @param {function} fnFunction The function to be called, when the event occurs
			 * @param {object} [oListener] Context object on which the given function had to be called
			 * @returns {this} Reference to <code>this</code> in order to allow method chaining
			 * @private
			 */
			detachTitleChanged : function(fnFunction, oListener) {
				return this.detachEvent(this.M_EVENTS.TITLE_CHANGED, fnFunction, oListener);
			},

			// private
			fireTitleChanged : function(oParameters) {
				return this.fireEvent(this.M_EVENTS.TITLE_CHANGED, oParameters);
			},

			_getEffectiveObjectName : function (sName) {
				var sPath = this._oOptions.path;

				if (sPath) {
					sName = sPath + "." + sName;
				}

				return sName;
			},

			_updateOptions: function (oOrigOptions) {
				var oOptions = Object.assign({}, oOrigOptions);
				// convert the legacy syntax to the new one
				// if "viewName" is set, it's converted to "type" and "name"
				// meanwhile, the "viewPath" is also set to "path" and the
				// "viewId" is also set to "id"
				if (oOptions.viewName) {
					// if the target's name is given under the "name" property,
					// copy it to "_name" before overwritting it with the "viewName"
					if (oOptions.name) {
						oOptions._name = oOptions.name;
					}
					oOptions.type = "View";
					oOptions.name = oOptions.viewName;
					// sync Target still only works with the legacy options
					if (oOptions._async) {
						delete oOptions.viewName;
					}
					if (oOptions.viewPath) {
						oOptions.path = oOptions.viewPath;
						// sync Target still only works with the legacy options
						if (oOptions._async) {
							delete oOptions.viewPath;
						}
					}

					if (oOptions.viewId) {
						oOptions.id = oOptions.viewId;
						// sync Target still only works with the legacy options
						if (oOptions._async) {
							delete oOptions.viewId;
						}
					}
				} else  if (!oOptions._async && oOptions.type) {
					// sync target still only works with the legacy option
					// and an error is logged here when sync routing uses the new options
					Log.error("Sync Target '" + oOptions._name + "' uses the new options which are only supported by async Target.");
				}

				this._oOptions = oOptions;
				this._oRawOptions = oOrigOptions;
			},

			_bindTitleInTitleProvider : function(oView) {
				if (this._oTitleProvider && oView instanceof View) {
					this._oTitleProvider.applySettings({
						title: this._oOptions.title
					}, oView.getController());
				}
			},

			_addTitleProviderAsDependent : function(oView) {
				if (!this._oTitleProvider) {
					return;
				}

				// Remove the title provider from the old parent manually before adding
				// it to the new view because the internal removal from old parent
				// currently causes rerendering of the old parent.
				var oOldParent = this._oTitleProvider.getParent();
				if (oOldParent) {
					oOldParent.removeDependent(this._oTitleProvider);
				}
				if (oView instanceof View) {
					oView.addDependent(this._oTitleProvider);
				}
			},

			/**
			 * This function is called between the target view is loaded and the view is added to the container.
			 *
			 * This function can be used for applying modification on the view or the container to make the rerendering occur
			 * together with the later aggregation change.
			 *
			 * @protected
			 * @param {object} mArguments the object containing the arguments
			 * @param {sap.ui.core.Control} mArguments.container the container where the view will be added
			 * @param {sap.ui.core.Control} mArguments.view the view which will be added to the container
			 * @param {object} [mArguments.data] the data passed from {@link sap.ui.core.routing.Target#display} method
			 * @since 1.46.1
			 */
			_beforePlacingViewIntoContainer : function(mArguments) {},

			/**
			 * Here the magic happens - recursion + placement + view creation needs to be refactored
			 *
			 * @name sap.ui.core.routing.Target#_place
			 * @param {object} [vData] an object that will be passed to the display event in the data property. If the
			 * 		target has parents, the data will also be passed to them.
			 * @param {Promise} oSequencePromise Promise chain for resolution in the correct order
			 * @return {Promise} resolves with {name: *, view: *, control: *} if the target can be successfully displayed otherwise it rejects with an error message
			 * @private
			 */

			/**
			 * Validates the target options, will also be called from the route but route will not log errors
			 *
			 * @name sap.ui.core.routing.Target#._isValid
			 * @param oParentInfo
			 * @returns {boolean|string} returns true if it's valid otherwise the error message
			 * @private
			 */

			M_EVENTS : {
				DISPLAY : "display",
				TITLE_CHANGED : "titleChanged"
			}
		});

		return Target;

	});
