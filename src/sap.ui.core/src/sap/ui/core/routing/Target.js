/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/base/EventProvider'],
	function(EventProvider) {
		"use strict";

		//TODO: make public later
		/**
		 * Don't call this constructor directly, use {@link sap.ui.core.routing.Targets} instead, it will create instances of a Target
		 * If you are using the mobile library, please use the {@link sap.m.routing.Targets} constructor.
		 *
		 * @class provides a convenient way for placing views into the correct containers of your application
		 * @extends sap.ui.base.EventProvider
		 * @param {object} oOptions all of the parameters here are also allowed in Targets.
		 * @param {string} [oOptions.view] The name of a view that will be created, the first time this route will be matched. To place the view into a Control use the targetAggregation and targetControl. Views will only be created once per Router.</li>
		 * @param {string} [oOptions.viewType] The type of the view that is going to be created. eg: "XML", "JS"</li>
		 * @param {string} [oOptions.viewPath] A prefix that will be prepended in front of the view eg: view is set to "myView" and viewPath is set to "myApp" - the created view will be "myApp.myView".</li>
		 * @param {string} [oOptions.targetParent] the id of the parent of the targetControl - This should be the id view your targetControl is located in. By default, this will be the view created by a component, or if the Route is a subroute the view of the parent route is taken. You only need to specify this, if you are not using a router created by a component on your top level routes.</li>
		 * @param {string} [oOptions.targetControl] Views will be put into a container Control, this might be a {@link sap.ui.ux3.Shell} control or a {@link sap.m.NavContainer} if working with mobile, or any other container. The id of this control has to be put in here.</li>
		 * @param {string} [oOptions.targetAggregation] The name of an aggregation of the targetControl, that contains views. Eg: a {@link sap.m.NavContainer} has an aggregation "pages", another Example is the {@link sap.ui.ux3.Shell} it has "content".</li>
		 * @param {boolean} [oOptions.clearTarget] Defines a boolean that can be passed to specify if the aggregation should be cleared before adding the View to it. When using a {@link sap.ui.ux3.Shell} this should be true. For a {@link sap.m.NavContainer} it should be false.</li>
		 * @param {sap.ui.core.routing.Views} oViews
		 * @param {sap.ui.core.routing.Target} [oParent]
		 * @private
		 * @since 1.28
		 * @alias sap.ui.core.routing.Target
		 */
		return EventProvider.extend("sap.ui.core.routing.Target", {

			constructor : function(oOptions, oViews, oParent) {

				this._oParent = oParent;
				this._oOptions = oOptions;
				this._oViews = oViews;
				EventProvider.apply(this, arguments);

			},

			/**
			 * Destroy the target
			 *
			 * @public
			 * @returns { sap.ui.core.routing.Target } this for chaining.
			 */
			destroy : function () {
				this._oParent = null;
				this._oOptions = null;
				this._oViews = null;
				this.bIsDestroyed = true;

				return this;
			},

			/***
			 * Creates a view and puts it in an aggregation of a control that has been defined in the {@link #constructor}.
			 *
			 * @param {any} [vData] an object that will be passed to the display event in the data property. If the target has parents, the data will also be passed to them.
			 * @public
			 */
			display : function (vData) {
				this._display(vData);
			},

			_display : function (vData) {
				var oParentInfo;

				if (this._oParent) {
					oParentInfo = this._oParent._display(vData);
				}

				return this._place(oParentInfo, vData);
			},

			_place : function (oParentInfo, vData) {
				var oOptions = this._oOptions;
				oParentInfo = oParentInfo || {};

				var oView,
					oTargetControl = oParentInfo.oTargetControl,
					oTargetParent = oParentInfo.oTargetParent;

				if ((oTargetControl || oOptions.targetControl) && oOptions.targetAggregation) {
					//no parent view - see if there is a targetParent in the config
					if (!oTargetParent) {

						if (oOptions.targetParent) {
							oTargetParent = sap.ui.getCore().byId(oOptions.targetParent);

							if (!oTargetParent) {
								jQuery.sap.log.error("Did not find the target parent with the id " + oOptions.targetParent, "sap.ui.core.routing.Target");
								return;
							}

							oTargetControl = oTargetParent.byId(oOptions.targetControl);
						}

					} else {
						//target control was specified - ask the parents view for it
						if (oOptions.targetControl) {
							oTargetControl = oTargetParent.byId(oOptions.targetControl);
						}
					}

					if (!oTargetControl) {
						//Test if control exists in core (without prefix)
						oTargetControl =  sap.ui.getCore().byId(oOptions.targetControl);
					}

					if (oTargetControl) {
						var oAggregationInfo = oTargetControl.getMetadata().getJSONKeys()[oOptions.targetAggregation];
						if (oAggregationInfo) {
							//Set view for content
							var sViewName = oOptions.view;
							if (oOptions.viewPath) {
								sViewName = oOptions.viewPath + "." + sViewName;
							}
							oView = this._oViews.getView({
								viewName : sViewName,
								type : oOptions.viewType,
								id : oOptions.viewId
							});
							if (oOptions.clearTarget === true) {
								oTargetControl[oAggregationInfo._sRemoveAllMutator]();
							}

							oTargetControl[oAggregationInfo._sMutator](oView);
						} else {
							jQuery.sap.log.error("Control " + oOptions.targetControl + " does not has an aggregation called " + oOptions.targetAggregation, "sap.ui.core.routing.Target");
						}
					} else {
						jQuery.sap.log.error("Control with ID " + oOptions.targetControl + " could not be found", "sap.ui.core.routing.Target");
					}
				}

				this.fireDisplay({
					view : oView,
					targetControl : oTargetControl,
					config : oOptions,
					data: vData
				});

				return {
					oTargetParent : oView,
					oTargetControl : oTargetControl
				};
			},

			/**
			 * Will be fired when a target is displayed
			 *
			 * Could be triggered by calling the display function or by the @link sap.ui.core.routing.Router when a target is referenced in a matching route.
			 *
			 * @param {object} oEvent
			 * @param {object} oEvent.getParameters
			 * @param {object} oEvent.getParameters.view The view that got displayed.
			 * @param {object} oEvent.getParameters.targetControl The control that now contains the view in the targetAggregation
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
			 * Detach event-handler <code>fnFunction</code> from the 'created' event of this <code>sap.ui.core.routing.Views</code>.<br/>
			 *
			 * The passed function and listener object must match the ones previously used for event registration.
			 *
			 * @param {function} fnFunction The function to call, when the event occurs.
			 * @param {object} oListener Object on which the given function had to be called.
			 * @return {sap.ui.core.routing.Target} <code>this</code> to allow method chaining
			 */
			detachDisplay : function(fnFunction, oListener) {
				return this.detachEvent(this.M_EVENTS.DISPLAY, fnFunction, oListener);
			},

			/**
			 * Fire event created to attached listeners.
			 *
			 * @param {object} [mArguments] the arguments to pass along with the event.
			 * @return {sap.ui.core.routing.Target} <code>this</code> to allow method chaining
			 */
			fireDisplay : function(mArguments) {
				return this.fireEvent(this.M_EVENTS.DISPLAY, mArguments);
			},

			M_EVENTS : {
				DISPLAY : "display"
			}
		});

	}, /* bExport= */ true);
