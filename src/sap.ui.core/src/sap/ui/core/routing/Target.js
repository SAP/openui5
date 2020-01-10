/*!
 * ${copyright}
 */


sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/base/EventProvider',
	'sap/ui/core/mvc/View',
	'sap/ui/core/routing/async/Target',
	'sap/ui/core/routing/sync/Target',
	"sap/base/util/UriParameters",
	"sap/base/Log"
],
	function(
		Control,
		EventProvider,
		View,
		asyncTarget,
		syncTarget,
		UriParameters,
		Log
	) {
		"use strict";

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
					if (UriParameters.fromQuery(window.location.search).get("sap-ui-xx-asyncRouting") === "true") {
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
				var TargetStub = this._oOptions._async ?  asyncTarget : syncTarget;
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
			 * @param {*} [vData] an object that will be passed to the display event in the data property. If the target has parents, the data will also be passed to them.
			 * @return {Promise} resolves with {name: *, view: *, control: *} if the target can be successfully displayed otherwise it resolves with {name: *, error: *}
			 * @public
			 */

			/**
			 * Will be fired when a target is displayed
			 *
			 * Could be triggered by calling the display function or by the @link sap.ui.core.routing.Router when a target is referenced in a matching route.
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
			 * @returns {sap.ui.core.routing.Target} Reference to <code>this</code> in order to allow method chaining
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
			 * @returns {sap.ui.core.routing.Target} Reference to <code>this</code> in order to allow method chaining
			 * @public
			 */
			detachDisplay : function(fnFunction, oListener) {
				return this.detachEvent(this.M_EVENTS.DISPLAY, fnFunction, oListener);
			},

			/**
			 * Fires event {@link #event:created created} to attached listeners.
			 *
			 * @param {object} [oParameters] Parameters to pass along with the event
			 * @returns {sap.ui.core.routing.Target} Reference to <code>this</code> in order to allow method chaining
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
			 * @returns {sap.ui.core.routing.Target} Reference to <code>this</code> in order to allow method chaining
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
			 * @returns {sap.ui.core.routing.Target} Reference to <code>this</code> in order to allow method chaining
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

			_updateOptions: function (oOptions) {
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

					if (oOptions.viewPath) {
						oOptions.path = oOptions.viewPath;
					}

					if (oOptions.viewId) {
						oOptions.id = oOptions.viewId;
					}
				}

				this._oOptions = oOptions;
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

				if (this._oTarget._bIsDisplayed) {
					this._oTarget.fireTitleChanged({
						name: this._oTarget._oOptions._name,
						title: sTitle
					});
				}
			}
		});

		return Target;

	});
