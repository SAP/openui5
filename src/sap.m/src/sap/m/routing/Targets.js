/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/routing/Targets', './TargetHandler', './Target', './async/Targets', './sync/Targets', "sap/base/Log", "sap/base/util/UriParameters"],
	function(Targets, TargetHandler, Target, asyncTargets, syncTargets, Log, UriParameters) {
		"use strict";

		/**
		 * Constructor for a new <code>Targets</code> class.
		 *
		 * @class
		 * Provides a convenient way for placing views into the correct containers of your app.
		 *
		 * The mobile extension of <code>Targets</code> also handles the triggering
		 * of page navigation when the target control is an <code>{@link sap.m.SplitContainer}</code>,
		 * an <code>{@link sap.m.NavContainer}</code> or a control which extends one of these.
		 * Other controls are also allowed, but the extra parameters <code>viewLevel</code>,
		 * <code>transition</code> and <code>transitionParameters</code> are ignored and it behaves
		 * as <code>{@link sap.ui.core.routing.Targets}</code>.
		 *
		 * When a target is displayed, dialogs will be closed. To change this use
		 * <code>{@link #getTargetHandler}</code> and <code>{@link sap.m.routing.TargetHandler#setCloseDialogs}</code>.
		 *
		 * @extends sap.ui.core.routing.Targets
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
		 *             viewName: "Welcome",
		 *             viewType: "XML",
		 *             ....
		 *             // Other target parameters
		 *         },
		 *         goodbye: {
		 *             viewName: "Bye",
		 *             viewType: "JS",
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
		 * @param {string} oOptions.targets.anyName.viewName The name of a view that will be created.
		 * To place the view into a Control use the controlAggregation and controlId. Views will only be created once per viewName.
		 * <pre>
		 * <code>
		 * {
		 *     targets: {
		 *         // If display("masterWelcome") is called, the master view will be placed in the 'MasterPages' of a control with the id splitContainter
		 *         masterWelcome: {
		 *             viewName: "Welcome",
		 *             controlId: "splitContainer",
		 *             controlAggregation: "masterPages"
		 *         },
		 *         // If display("detailWelcome") is called after the masterWelcome, the view will be removed from the master pages and added to the detail pages, since the same instance is used. Also the controls inside of the view will have the same state.
		 *         detailWelcome: {
		 *             // same view here, that's why the same instance is used
		 *             viewName: "Welcome",
		 *             controlId: "splitContainer",
		 *             controlAggregation: "detailPages"
		 *         }
		 *     }
		 * }
		 * </code>
		 * </pre>
		 *
		 * If you want to have a second instance of the welcome view you can use the following:
		 *
		 *
		 *
		 * <pre>
		 * <code>
		 * // Some code you execute before you display the taget named 'detailWelcome':
		 * var oView = sap.ui.view(({ viewName : "Welcome", type : sap.ui.core.mvc.ViewType.XML});
		 * oTargets.getViews().setView("WelcomeWithAlias", oView)
		 *
		 * {
		 *     targets: {
		 *         // If display("masterWelcome") is called, the master viewName will be placed in the 'MasterPages' of a control with the id splitContainter
		 *         masterWelcome: {
		 *             viewName: "Welcome",
		 *             controlId: "splitContainer",
		 *             controlAggregation: "masterPages"
		 *         },
		 *         // If display("detailWelcome") is called after the masterWelcome, a second instance with an own controller instance will be added in the detail pages.
		 *         detailWelcome: {
		 *             // same viewName here, that's why the same instance is used
		 *             viewName: "WelcomeWithAlias",
		 *             controlId: "splitContainer",
		 *             controlAggregation: "detailPages"
		 *         }
		 *     }
		 * }
		 * </code>
		 * </pre>
		 *
		 *
		 * @param {string} [oOptions.targets.anyName.viewType=oOptions.config.viewType] The type of the view that is going to be created. These are the supported types: {@link sap.ui.core.mvc.ViewType}.
		 * You always have to provide a viewType except if <code>oOptions.config.viewType</code> is set or using {@link sap.ui.core.routing.Views#setView}.
		 * @param {string} [oOptions.targets.anyName.viewPath]
		 * A prefix that will be prepended in front of the viewName.<br/>
		 * <b>Example:</b> viewName is set to "myView" and viewPath is set to "myApp" - the created viewName will be "myApp.myView".
		 * @param {string} [oOptions.targets.anyName.viewId] The id of the created view.
		 * This is will be prefixed with the id of the component set to the views instance provided in oOptions.views. For details see {@link sap.ui.core.routing.Views#getView}.
		 * @param {string} [oOptions.targets.anyName.targetParent]
		 * The id of the parent of the controlId - This should be the id of the view that contains your controlId,
		 * since the target control will be retrieved by calling the {@link sap.ui.core.mvc.View#byId} function of the targetParent. By default,
		 * this will be the view created by a component, so you do not have to provide this parameter.
		 * If you are using children, the view created by the parent of the child is taken.
		 * You only need to specify this, if you are not using a Targets instance created by a component
		 * and you should give the id of root view of your application to this property.
		 * @param {string} [oOptions.targets.anyName.controlId] The id of the control where you want to place the view created by this target.
		 * The view of the target will be put into this container Control, using the controlAggregation property. You have to specify both properties or the target will not be able to place itself.
		 * An example for containers are {@link sap.ui.ux3.Shell} with the aggregation 'content' or a {@link sap.m.NavContainer} with the aggregation 'pages'.
		 *
		 * @param {string} [oOptions.targets.anyName.controlAggregation] The name of an aggregation of the controlId, that contains views.
		 * Eg: a {@link sap.m.NavContainer} has an aggregation 'pages', another Example is the {@link sap.ui.ux3.Shell} it has 'content'.
		 * @param {boolean} [oOptions.targets.anyName.clearControlAggregation] Defines a boolean that can be passed to specify if the aggregation should be cleared
		 * - all items will be removed - before adding the View to it.
		 * When using a {@link sap.ui.ux3.Shell} this should be true. For a {@link sap.m.NavContainer} it should be false. When you use the {@link sap.m.routing.Router} the default will be false.
		 * @param {string} [oOptions.targets.anyName.parent] A reference to another target, using the name of the target.
		 * If you display a target that has a parent, the parent will also be displayed.
		 * Also the control you specify with the controlId parameter, will be searched inside of the view of the parent not in the rootView, provided in the config.
		 * The control will be searched using the byId function of a view. When it is not found, the global id is checked.
		 * <br/>
		 * The main usecase for the parent property is placing a view inside a smaller container of a view, which is also created by targets.
		 * This is useful for lazy loading views, only if the user really navigates to this part of your application.
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
		 *                 viewName: 'Detail'
		 *             },
		 *             secondTabContent: {
		 *                 // A reference to the detail target defined above
		 *                 parent: 'detail',
		 *                 // A reference to the second Tab container in the Detail view. Here the target does not look in the rootView, it looks in the Parent view (Detail).
		 *                 controlId: 'mySecondTab',
		 *                 // An IconTabFilter has an aggregation called content so we need to overwrite the pages set in the config as default.
		 *                 controlAggregation: 'content',
		 *                 // A view containing the content
		 *                 viewName: 'SecondTabContent'
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
		 *
		 * @param {int} [oOptions.targets.anyName.viewLevel]
		 * If you are having an application that has a logical order of views (eg: a create account process, first provide user data, then review and confirm them).
		 * You always want to show a backwards transition if a navigation from the confirm to the userData page takes place.
		 * Therefore you may use the viewLevel. The viewLevel has to be an integer. The user data page should have a lower number than the confirm page.
		 * These levels should represent the user process of your application and they do not have to match the container structure of your Targets.
		 * If the user navigates between views with the same viewLevel, a forward transition is taken. If you pass a direction into the display function, the viewLevel will be ignored.<br/>
		 * <b>Example:</b></br>
		 * <pre>
		 * <code>
		 *     {
		 *         targets: {
		 *             startPage: {
		 *                 viewLevel: 0
		 *                 // more properties
		 *             },
		 *             userData: {
		 *                 viewLevel: 1
		 *                 // more properties
		 *             },
		 *             confirmRegistration: {
		 *                 viewLevel: 2
		 *                 // more properties
		 *             },
		 *             settings: {
		 *                 //no view level here
		 *             }
		 *         }
		 *     }
		 * </code>
		 * </pre>
		 *
		 * Currently the 'userData' target is displayed.
		 * <ul>
		 *     <li>
		 *         If we navigate to 'startPage' the navContainer will show a backwards navigation, since the viewLevel is lower.
		 *     </li>
		 *     <li>
		 *         If we navigate to 'userData' the navContainer will show a forwards navigation, since the viewLevel is higher.
		 *     </li>
		 *     <li>
		 *         If we navigate to 'settings' the navContainer will show a forwards navigation, since the viewLevel is not defined and cannot be compared.
		 *     </li>
		 * </ul>
		 *
		 * @param {string} [oOptions.targets.anyName.transition] define which transition of the {@link sap.m.NavContainer} will be applied when navigating. If it is not defined, the nav container will take its default transition.
		 * @param {string} [oOptions.targets.anyName.transitionParameters] define the transitionParameters of the {@link sap.m.NavContainer}
		 *
		 * @since 1.28.1
		 * @public
		 * @alias sap.m.routing.Targets
		 */
		var MobileTargets = Targets.extend("sap.m.routing.Targets", /** @lends sap.m.routing.Targets.prototype */ {
			constructor: function(oOptions) {

				// If no config is given, set the default value to sync
				if (!oOptions.config) {
					oOptions.config = {
						_async: false
					};
				}

				// temporarily: for checking the url param
				function checkUrl() {
					if (UriParameters.fromQuery(window.location.search).get("sap-ui-xx-asyncRouting") === "true") {
						Log.warning("Activation of async view loading in routing via url parameter is only temporarily supported and may be removed soon", "MobileTargets");
						return true;
					}
					return false;
				}

				// Config object doesn't have _async set which means the Targets is instantiated standalone by given a non-empty config object
				// Assign the oConfig.async to oConfig._async and set the default value to sync
				if (oOptions.config._async === undefined) {
					// temporarily: set the default value depending on the url parameter "sap-ui-xx-asyncRouting"
					oOptions.config._async = (oOptions.config.async === undefined) ? checkUrl() : oOptions.config.async;
				}

				if (oOptions.targetHandler) {
					this._oTargetHandler = oOptions.targetHandler;
				} else {
					this._oTargetHandler = new TargetHandler();
					this._bHasOwnTargetHandler = true;
				}

				Targets.prototype.constructor.apply(this, arguments);

				var TargetsStub = oOptions.config._async ? asyncTargets : syncTargets;

				this._super = {};
				for (var fn in TargetsStub) {
					this._super[fn] = this[fn];
					this[fn] = TargetsStub[fn];
				}
			},

			destroy: function () {
				Targets.prototype.destroy.apply(this, arguments);

				if (this._bHasOwnTargetHandler) {
					this._oTargetHandler.destroy();
				}

				this._oTargetHandler = null;
			},

			/**
			 * Returns the TargetHandler instance.
			 *
			 * @return {sap.m.routing.TargetHandler} the TargetHandler instance
			 * @public
			 */
			getTargetHandler : function () {
				return this._oTargetHandler;
			},

			_constructTarget : function (oOptions, oParent) {
				return new Target(oOptions, this.getViews(), oParent, this._oTargetHandler);
			},

			/**
			 * Traverse up from the given target through the parent chain to find out the first target with a defined view level.
			 * @param {sap.m.routing.Target} oTarget the target from which the traverse starts to find the first defined view level
			 * @return {number} The view level
			 * @private
			 */
			_getViewLevel : function (oTarget) {
				var iViewLevel;
				do {
					iViewLevel = oTarget._oOptions.viewLevel;
					if (iViewLevel !== undefined) {
						return iViewLevel;
					}
					oTarget = oTarget._oParent;
				} while (oTarget);

				return iViewLevel;
			}
		});

		return MobileTargets;
	});