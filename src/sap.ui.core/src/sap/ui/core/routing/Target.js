/*!
 * ${copyright}
 */


sap.ui.define(['jquery.sap.global', 'sap/ui/base/EventProvider', 'sap/ui/core/routing/async/Target', 'sap/ui/core/routing/sync/Target'],
	function($, EventProvider, asyncTarget, syncTarget) {
		"use strict";

		/**
		 * Provides a convenient way for placing views into the correct containers of your application.<br/>
		 * The main benefit of Targets is lazy loading: you do not have to create the views until you really need them.<br/>
		 * <b>Don't call this constructor directly</b>, use {@link sap.ui.core.routing.Targets} instead, it will create instances of a Target.<br/>
		 * If you are using the mobile library, please use the {@link sap.m.routing.Targets} constructor, please read the documentation there.<br/>
		 *
		 * @class
		 * @param {object} oOptions all of the parameters defined in {@link sap.m.routing.Targets#constructor} are accepted here, except for children you need to specify the parent.
		 * @param {sap.ui.core.routing.Views} oViews All views required by this target will get created by the views instance using {@link sap.ui.core.routing.Views#getView}
		 * @param {sap.ui.core.routing.Target} [oParent] the parent of this target. Will also get displayed, if you display this target. In the config you have the fill the children property {@link sap.m.routing.Targets#constructor}
		 * @public
		 * @since 1.28.1
		 * @extends sap.ui.base.EventProvider
		 * @alias sap.ui.core.routing.Target
		 */
		var Target = EventProvider.extend("sap.ui.core.routing.Target", /** @lends sap.ui.core.routing.Target.prototype */ {

			constructor : function(oOptions, oViews) {
				// Set the default value to sync
				if (oOptions._async === undefined) {
					oOptions._async = false;
				}

				this._oOptions = oOptions;
				this._oViews = oViews;
				EventProvider.apply(this, arguments);

				// branch by abstraction
				var TargetStub = this._oOptions._async ?  asyncTarget : syncTarget;
				for (var fn in TargetStub) {
					this[fn] = TargetStub[fn];
				}
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
				this._oViews = null;
				EventProvider.prototype.destroy.apply(this, arguments);
				this.bIsDestroyed = true;

				return this;
			},

			/**
			 * Creates a view and puts it in an aggregation of a control that has been defined in the {@link #constructor}.
			 *
			 * @name sap.ui.core.routing.Target#display
			 * @param {*} [vData] an object that will be passed to the display event in the data property. If the target has parents, the data will also be passed to them.
			 * @return {Promise} resolves with {name: *, view: *, control: *} if the target can be successfully displayed otherwise it resolves with {name: *, error: *}
			 * @public
			 */

			/**
			 * Will be fired when a target is displayed
			 *
			 * Could be triggered by calling the display function or by the @link sap.ui.core.routing.Router when a target is referenced in a matching route.
			 *
			 * @param {object} oEvent
			 * @param {object} oEvent.getParameters
			 * @param {object} oEvent.getParameters.view The view that got displayed.
			 * @param {object} oEvent.getParameters.control The control that now contains the view in the controlAggregation
			 * @param {object} oEvent.getParameters.config The options object passed to the constructor {@link sap.ui.core.routing.Target#constuctor}
			 * @param {object} oEvent.getParameters.data The data passed into the {@link sap.ui.core.routing.Target#display} function
			 * @event
			 * @public
			 */

			/**
			 * Attach event-handler <code>fnFunction</code> to the 'display' event of this <code>sap.ui.core.routing.Target</code>.<br/>
			 * @param {object} [oData] The object, that should be passed along with the event-object when firing the event.
			 * @param {function} fnFunction The function to call, when the event occurs. This function will be called on the
			 * oListener-instance (if present) or in a 'static way'.
			 * @param {object} [oListener] Object on which to call the given function.
			 *
			 * @return {sap.ui.core.routing.Target} <code>this</code> to allow method chaining
			 * @public
			 */
			attachDisplay : function(oData, fnFunction, oListener) {
				return this.attachEvent(this.M_EVENTS.DISPLAY, oData, fnFunction, oListener);
			},

			/**
			 * Detach event-handler <code>fnFunction</code> from the 'display' event of this <code>sap.ui.core.routing.Target</code>.<br/>
			 *
			 * The passed function and listener object must match the ones previously used for event registration.
			 *
			 * @param {function} fnFunction The function to call, when the event occurs.
			 * @param {object} oListener Object on which the given function had to be called.
			 * @return {sap.ui.core.routing.Target} <code>this</code> to allow method chaining
			 * @public
			 */
			detachDisplay : function(fnFunction, oListener) {
				return this.detachEvent(this.M_EVENTS.DISPLAY, fnFunction, oListener);
			},

			/**
			 * Fire event created to attached listeners.
			 *
			 * @param {object} [mArguments] the arguments to pass along with the event.
			 * @return {sap.ui.core.routing.Target} <code>this</code> to allow method chaining
			 * @protected
			 */
			fireDisplay : function(mArguments) {
				return this.fireEvent(this.M_EVENTS.DISPLAY, mArguments);
			},

			_getEffectiveViewName : function (sViewName) {
				var sViewPath = this._oOptions.viewPath;

				if (sViewPath) {
					sViewName = sViewPath + "." + sViewName;
				}

				return sViewName;
			},

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
				DISPLAY : "display"
			}
		});

		return Target;

	});
