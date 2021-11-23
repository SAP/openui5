/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/core/routing/Targets', './TargetHandler', './Target', './async/Targets'],
	function(Targets, TargetHandler, Target, asyncTargets) {
		"use strict";

		/**
		 * Constructor for a new <code>Targets</code> class.
		 *
		 * @class
		 * Provides a convenient way for placing views into the correct containers of your app.
		 *
		 * The <code>sap.f</code> extension of <code>Targets</code> also handles the triggering
		 * of page navigation when the target control is an <code>{@link sap.f.FlexibleColumnLayout}</code>.
		 * Other controls are also allowed, but the extra parameters <code>level</code>,
		 * <code>transition</code>, and <code>transitionParameters</code> are ignored and it behaves as
		 * <code>{@link sap.ui.core.routing.Targets}</code>.
		 *
		 * When a target is displayed, dialogs are being closed. To change this, use
		 * <code>{@link #getTargetHandler}</code> and {@link sap.f.routing.TargetHandler#setCloseDialogs}.
		 *
		 * @extends sap.ui.core.routing.Targets
		 * @param {object} oOptions
		 * @param {sap.ui.core.routing.Views} oOptions.views the views instance will create the views of all the targets
		 * defined, so if 2 targets have the same name, the same instance of the view will be displayed.
		 * @param {object} [oOptions.config] This config allows all the values oOptions.targets.anyName allows,
		 * these will be the default values for properties used in the target.
		 *
		 * For example, if you are only using xmlViews in your app you can specify viewType="XML"
		 * so you don't have to repeat this in every target.
		 *
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
		 * The ID of the <code>rootView</code>.
		 *
		 * This should be the ID of the view that contains the control with the <code>controlId</code>
		 * since the control will be retrieved by calling the {@link sap.ui.core.mvc.View#byId}
		 * function of the rootView.
		 *
		 * If you are using a component and add the routing.targets, <b>do not set this parameter</b>,
		 * since the component will set the rootView to the view created by the
		 * {@link sap.ui.core.UIComponent#createContent} function.
		 *
		 * If you specify the "parent" property of a target, the control will not be searched
		 * in the root view but in the view created by the parent (see parent documentation).
		 *
		 * @param {boolean} [oOptions.config.async=false] Whether the views which are created through
		 * this <code>Targets</code> are loaded asynchronously. This option can be set only when the
		 * <code>Targets</code> is used standalone without the involvement of a Router.
		 * Otherwise, the async option is inherited from the Router.
		 * @param {object} oOptions.targets One or multiple targets in a map.
		 * @param {object} oOptions.targets.anyName A new target, the key severs as a name.
		 *
		 * Example:
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
		 *             type: "View",
		 *             name: "Bye",
		 *             viewType: "JS",
		 *             ....
		 *             // Other target parameters
		 *         }
		 *     }
		 * }
		 * </code>
		 * </pre>
		 *
		 * This creates two targets named 'welcome' and 'goodbye'. You can display both of them
		 * or one of them using the <code>{@link #display}</code> function.
		 *
		 * @param {string} oOptions.targets.anyName.type Defines whether the target creates an instance of 'View' or 'Component'.
		 * @param {string} [oOptions.targets.anyName.name] Defines the name of the View or Component that will be
		 * created. For type 'Component', use option <code>usage</code> instead if an owner component exists.
		 * To place the view or component into a Control, use the options <code>controlAggregation</code> and
		 * <code>controlId</code>. Instance of View or Component will only be created once per <code>name</code> or
		 * <code>usage</code> combined with <code>id</code>.
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
		 * If you want to have a second instance of the welcome view you can assign the targets with different ids:
		 *
		 * <pre>
		 * <code>
		 * {
		 *     targets: {
		 *         // If display("masterWelcome") is called, the "masterWelcome" view will be placed in the 'MasterPages' of a control with the id splitContainter
		 *         masterWelcome: {
		 *             type: "View",
		 *             name: "Welcome",
		 *             id: "masterWelcome",
		 *             controlId: "splitContainer",
		 *             controlAggregation: "masterPages"
		 *         },
		 *         // If display("detailWelcome") is called after the "masterWelcome", a second instance with an own controller instance will be added in the detail pages.
		 *         detailWelcome: {
		 *             type: "View",
		 *             name: "Welcome",
		 *             // another instance will be created because a different id is used
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
		 * @param {string} [oOptions.targets.anyName.usage] Defines the 'usage' name for 'Component' target which refers to the '/sap.ui5/componentUsages' entry in the owner component's manifest.
		 * @param {string} [oOptions.targets.anyName.viewType=oOptions.config.viewType] The type of the view that is going to be created. These are the supported types: {@link sap.ui.core.mvc.ViewType}.
		 * You always have to provide a viewType except if <code>oOptions.config.viewType</code> is set or when using {@link sap.ui.core.routing.Views#setView}.
		 *
		 * @param {string} [oOptions.targets.anyName.path]
		 * A prefix that is prepended in front of the <code>name</code>.
		 *
		 * <b>Example:</b> <code>name</code> is set to "myView" and <code>path</code> is set to "myApp" - the created view's name will be "myApp.myView".
		 *
		 * @param {string} [oOptions.targets.anyName.id] The ID of the created view or component.
		 * This is is prefixed with the ID of the component set to the views instance provided in <code>oOptions.views</code>.
		 * For details, see <code>{@link sap.ui.core.routing.Views#getView}</code>.
		 *
		 * @param {string} [oOptions.targets.anyName.targetParent]
		 * The ID of the parent of the <code>controlId</code>.
		 *
		 * This should be the ID of the view that contains your <code>controlId</code>
		 * since the target control is retrieved by calling the <code>{@link sap.ui.core.mvc.View#byId}</code>
		 * function of the <code>targetParent</code>. By default, this is the view created by a component,
		 * so you do not have to provide this parameter.
		 * If you are using children, the view created by the parent of the child is taken.
		 * You only need to specify this, if you are not using a <code>Targets</code> instance created by a component
		 * and you should give the ID of root view of your app to this property.
		 *
		 * @param {string} [oOptions.targets.anyName.controlId] The ID of the control where you want to place the view created by this target.
		 * The view of the target will be put into this container Control, using the controlAggregation property. You have to specify both properties or the target will not be able to place itself.
		 * An example for containers are {@link sap.ui.ux3.Shell} with the aggregation 'content' or a {@link sap.m.NavContainer} with the aggregation 'pages'.
		 *
		 * @param {string} [oOptions.targets.anyName.controlAggregation] The name of an aggregation of the <code>controlId</code>, that contains views.
		 * For example, an <code>{@link sap.m.NavContainer}</code> has a <code>pages</code> aggregation and an <code>{@link sap.ui.ux3.Shell}</code> it has a <code>content</code> aggregation.
		 *
		 * @param {boolean} [oOptions.targets.anyName.clearControlAggregation] Defines a boolean that can be passed to specify if the aggregation should be cleared
		 * - all items will be removed - before adding the View to it.
		 * When using a {@link sap.ui.ux3.Shell} this should be true. For a {@link sap.m.NavContainer} it should be false. When you use the {@link sap.f.routing.Router} the default will be false.
		 *
		 * @param {string} [oOptions.targets.anyName.parent] A reference to another target, using the name of the target.
		 * If you display a target that has a parent, the parent will also be displayed.
		 * Also the control you specify with the controlId parameter, will be searched inside of the view of the parent not in the rootView, provided in the config.
		 * The control will be searched using the byId function of a view. When it is not found, the global id is checked.
		 *
		 * The main usecase for the parent property is placing a view inside a smaller container of a view, which is also created by targets.
		 * This is useful for lazy loading views, only if the user really navigates to this part of your application.
		 *
		 * <b>Example:</b>
		 * Our aim is to lazy load a tab of an IconTabBar (a control that displays a view initially and when a user clicks on it the view changes).
		 * It's a perfect candidate to lazy load something inside of it.
		 *
		 * <b>Example app structure:</b>
		 *
		 * We have a <code>rootView</code> that is returned by the <code>createContent</code> function of our <code>UIComponent</code>.
		 * This view contains an <code>sap.m.App</code> control with the ID 'myApp'
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
		 * Now we need to create our <code>Targets</code> instance with a config matching our app:
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
		 *             controlAggregation: 'pages',
		 *             // all targets have type "View"
		 *             type: "View"
		 *         },
		 *         targets: {
		 *             detail: {
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
		 *                 name: 'SecondTabContent'
		 *             }
		 *         }
		 *     });
		 * </code>
		 * </pre>
		 *
		 * Now, if we call <code> oTargets.display("secondTabContent") </code>, 2 views will be created: Detail and SecondTabContent.
		 * The 'Detail' view will be put into the pages aggregation of the App. And afterwards the 'SecondTabContent' view will be put into the content Aggregation of the second IconTabFilter.
		 * So a parent will always be created before the target referencing it.
		 *
		 * @param {int} [oOptions.targets.anyName.level]
		 * If you are having an application that has a logical order of views (eg: a create account process, first provide user data, then review and confirm them).
		 * You always want to show a backwards transition if a navigation from the confirm to the userData page takes place.
		 * Therefore you may use the <code>level</code>. The <code>level</code> has to be an integer. The user data page should have a lower number than the confirm page.
		 * These levels should represent the user process of your application and they do not have to match the container structure of your Targets.
		 * If the user navigates between targets with the same <code>level</code>, a forward transition is taken.
		 * If you pass a direction into the display function, the <code>level</code> will be ignored.
		 *
		 * <b>Example:</b>
		 *
		 * <pre>
		 * <code>
		 *     {
		 *         targets: {
		 *             startPage: {
		 *                 level: 0
		 *                 // more properties
		 *             },
		 *             userData: {
		 *                 level: 1
		 *                 // more properties
		 *             },
		 *             confirmRegistration: {
		 *                 level: 2
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
		 *         If we navigate to 'startPage' the navContainer will show a backwards navigation, since the <code>level</code> is lower.
		 *     </li>
		 *     <li>
		 *         If we navigate to 'userData' the navContainer will show a forwards navigation, since the <code>level</code> is higher.
		 *     </li>
		 *     <li>
		 *         If we navigate to 'settings' the navContainer will show a forwards navigation, since the <code>level</code> is not defined and cannot be compared.
		 *     </li>
		 * </ul>
		 *
		 * @param {string} [oOptions.targets.anyName.transition] Defines which transition of the {@link sap.m.NavContainer} is applied when navigating. If it is not defined, the <code>NavContainer</code> take its default transition.
		 * @param {string} [oOptions.targets.anyName.transitionParameters] Defines the <code>transitionParameters</code> of the <code>{@link sap.m.NavContainer}</code>
		 *
		 * @since 1.46
		 * @public
		 * @alias sap.f.routing.Targets
		 */
		var MobileTargets = Targets.extend("sap.f.routing.Targets", /** @lends sap.f.routing.Targets.prototype */ {
			constructor: function(oOptions) {

				oOptions.config._async = true;

				if (oOptions.targetHandler) {
					this._oTargetHandler = oOptions.targetHandler;
				} else {
					this._oTargetHandler = new TargetHandler();
					this._bHasOwnTargetHandler = true;
				}

				Targets.prototype.constructor.apply(this, arguments);

				var TargetsStub = asyncTargets;

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
			 * Returns the <code>TargetHandler</code> instance.
			 *
			 * @return {sap.f.routing.TargetHandler} The <code>TargetHandler</code> instance
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
			 * @param {sap.f.routing.Target} oTarget The target from which the traverse starts to find the first defined view level
			 * @return {number} The view level
			 * @private
			 */
			_getLevel : function (oTarget) {
				var iLevel;
				do {
					iLevel = oTarget._oOptions.hasOwnProperty("level") ? oTarget._oOptions.level : oTarget._oOptions.viewLevel;
					if (iLevel !== undefined) {
						return iLevel;
					}
					oTarget = oTarget._oParent;
				} while (oTarget);

				return iLevel;
			}
		});

		return MobileTargets;
	});
