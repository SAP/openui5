/*!
 * ${copyright}
 */


sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/EventProvider",
	"sap/ui/base/ManagedObjectMetadata",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Element",
	"sap/ui/core/Placeholder",
	"sap/ui/core/library",
	"sap/ui/core/mvc/View"
],
	function(
		Log,
		EventProvider,
		ManagedObjectMetadata,
		ComponentContainer,
		Element,
		Placeholder,
		coreLib,
		View
	) {
		"use strict";

		// shortcut for sap.ui.core.ComponentLifecycle
		var ComponentLifecycle = coreLib.ComponentLifecycle;

		/**
		 * This class resolves the property binding of the 'title' option.
		 *
		 * @class
		 * @param {object} mSettings configuration object for the TitleProvider
		 * @param {object} mSettings.target Target for which the TitleProvider is created
		 * @private
		 * @extends sap.ui.core.Element
		 */
		var TitleProvider = Element.extend("sap.ui.core.routing.Target.TitleProvider", /** @lends sap.ui.core.routing.TitleProvider.prototype */ {
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
				Element.prototype.constructor.call(this, mSettings);
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
				this._updateOptions(oOptions);

				this._oCache = oCache;
				EventProvider.apply(this, arguments);

				if (this._oOptions.title) {
					this._oTitleProvider = new TitleProvider({
						target: this
					});
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

				if (sPath && sName && !sName.startsWith("module:")) {
					sName = sPath + "." + sName;
				}

				return sName;
			},

			_updateOptions: function (oOrigOptions) {
				var oOptions = Object.assign({}, oOrigOptions);
				if (oOptions.viewName) {
					// if the target's name is given under the "name" property,
					// copy it to "_name" before overwritting it with the "viewName"
					if (oOptions.name) {
						oOptions._name = oOptions.name;
					}
					oOptions.type = "View";
					oOptions.name = oOptions.viewName;
					delete oOptions.viewName;
					if (oOptions.viewPath) {
						oOptions.path = oOptions.viewPath;
						delete oOptions.viewPath;
					}

					if (oOptions.viewId) {
						oOptions.id = oOptions.viewId;
						delete oOptions.viewId;
					}
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
			 * Creates a view and puts it in an aggregation of a control that has been defined in the {@link #constructor}.
			 *
			 * This method can be used to display a target without changing the browser hash. If the browser hash should be changed,
			 *  the {@link sap.ui.core.routing.Router#navTo} method should be used instead
			 *
			 * @param {object} [vData] an object that will be passed to the display event in the data property. If the target has parents, the data will also be passed to them.
			 * @return {Promise<{name: string, view: sap.ui.core.mvc.View, control: sap.ui.core.Control}>} resolves with {name: *, view: *, control: *} if the target can be successfully displayed otherwise it resolves with {name: *, error: *}
			 * @public
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
			 * @param {object} [oTargetCreateInfo] Additional information for the component creation.
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
			 * Currently this function stops the router of the component when the object which is loaded by this target
			 * is an instance of UIComponent. This is done only when the target is already loaded. When the target is
			 * not loaded yet or still being loaded, the router of the component isn't stopped.
			 *
			 * @return {sap.ui.core.routing.Target} The 'this' to chain the call
			 * @public
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
			 * Retrieves additional target creation info based on the target type.
			 *
			 * @return {object} Merged target creation info object
			 */
			_getCreateOptions: function() {
				var sName = this._getEffectiveObjectName(this._oOptions.name),
					oOptions = this._oOptions,
					oCreateOptions;

				switch (oOptions.type) {
					case "View":
						oCreateOptions = {
							name: sName,
							id: oOptions.id,
							async: true
						};

						if (!sName.startsWith("module:")) {
							oCreateOptions.type = oOptions.viewType;
						}
						break;
					case "Component":
						oOptions.id = oOptions.id || ManagedObjectMetadata.uid("uicomponent");

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
			 * @param {object} [oTargetCreateInfo] Additional information for the component creation.
			 * @returns {sap.ui.core.mvc.View|sap.ui.core.UIComponent|Promise} The target instance when it's already loaded
			 *  or a promise which resolves with the target instance during the loading of the target instance
			 * @private
			 */
			_get: function(oTargetCreateInfo) {
				var oCreateOptions = this._getCreateOptions();


				return this._oCache._get(oCreateOptions, this._oOptions.type,
					// Hook in the route for deprecated global view id, it has to be supported to stay compatible
					this._bUseRawViewId, oTargetCreateInfo);
			},

			/**
			 * Loads the object from TargetCache.
			 *
			 * @param {object} [oTargetCreateInfo] Additional information for the component creation.
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
			 * @param {object} oTargetCreateInfo The additional information for the component target creation.
			 * @return {Promise} Promise resolving with the loaded target object and the promise that waits for the
			 *  <code>routeMatched</code> event in case of a Component target
			 * @private
			 */
			load: function(oTargetCreateInfo) {
				return this._load(oTargetCreateInfo)
					.then(function(oLoadedTarget) {
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
									oView = Element.getElementById(oRootViewId);
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
								oContainerControl =  Element.getElementById(oOptions.controlId);
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
					var sComponentContainerId = oOptions.id + "-container";

					oObject = (oOwnerComponent && oOwnerComponent.byId(sComponentContainerId))
						|| Element.getElementById(sComponentContainerId);

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

					var oCreateOptions = this._getCreateOptions();
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

					if (oPlaceholderConfig.placeholder && Placeholder.isEnabled()) {
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
			 * @param {object} oTargetCreateInfo Additional information for the component creation.
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
					throw new Error(`${this}: ${sLogMessage}`);
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
			},

			M_EVENTS : {
				DISPLAY : "display",
				TITLE_CHANGED : "titleChanged"
			}
		});

		return Target;

	});
