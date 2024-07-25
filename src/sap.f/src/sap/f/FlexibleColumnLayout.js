/*!
 * ${copyright}
 */

// Provides control sap.f.FlexibleColumnLayout.
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/AnimationMode",
	"sap/ui/core/ControlBehavior",
	"sap/ui/core/Lib",
	"sap/ui/core/RenderManager",
	"sap/ui/thirdparty/jquery",
	"./library",
	"sap/ui/core/library",
	"sap/ui/Device",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/Control",
	"sap/ui/util/Storage",
	"sap/m/library",
	"sap/m/NavContainer",
	'sap/ui/dom/units/Rem',
	"./FlexibleColumnLayoutRenderer",
	"sap/base/Log",
	"sap/base/assert",
	"sap/base/util/isEmptyObject",
	"sap/base/util/merge",
	"sap/ui/core/InvisibleMessage",
	// provides jQuery.fn.firstFocusableDomRef
	"sap/ui/dom/jquery/Focusable"
], function(
	Localization,
	AnimationMode,
	ControlBehavior,
	Library,
	RenderManager,
	jQuery,
	library,
	coreLibrary,
	Device,
	ResizeHandler,
	Control,
	Storage,
	mobileLibrary,
	NavContainer,
	DomUnitsRem,
	FlexibleColumnLayoutRenderer,
	Log,
	assert,
	isEmptyObject,
	merge,
	InvisibleMessage
) {
	"use strict";


	// shortcut for sap.f.LayoutType
	var LT = library.LayoutType;

	// shortcut for sap.ui.core.InvisibleMessageMode
	var InvisibleMessageMode = coreLibrary.InvisibleMessageMode;

	/**
	 * Constructor for a new <code>sap.f.FlexibleColumnLayout</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Implements the list-detail-detail paradigm by displaying up to three pages in separate columns.
	 *
	 * <h3>Overview</h3>
	 *
	 * The control is logically similar to {@link sap.m.SplitContainer} with the difference that it capable of handling
	 * three columns (referred to as <code>Begin</code>, <code>Mid</code> and <code>End</code>) rather than two
	 * (<code>Master</code>, <code>Detail</code>). The width of the three columns is variable.
	 *
	 * There are several possible layouts that can be changed either with the control's API, or by the user with the help of the draggable column separators.
	 * The draggable column separators allow the user to customize the column widths for the current layout, or to switch to a new layout (if the user drags the column separator past a breakpoint that delimits two different layouts).
	 * After the user customized the column widths for a given layout, these user preferences are internally saved and automatically re-applied whenever the user re-visits the same layout.
	 *
	 * Internally the control makes use of three instances of {@link sap.m.NavContainer}, thus forming the three columns.
	 *
	 * <h3>Usage</h3>
	 *
	 * Use this control for applications that need to display several logical levels of related information side by side (e.g. list of items, item, sub-item, etc.).
	 * The control is flexible in a sense that the application can focus the user's attention on one particular column by making it larger or even fullscreen.
	 *
	 * The columns are accessible with the <code>beginColumnPages</code>, <code>midColumnPages</code> and <code>endColumnPages</code> aggregations.
	 *
	 * The relative sizes and the visibility of the three columns are determined based on the value of the {@link sap.f.LayoutType layout} property.
	 *
	 * Changes to the layout due to user interaction are communicated to the app with the <code>stateChange</code> event.
	 *
	 * <ul><b>Notes:</b>
	 * <li>To easily implement the recommended UX design of a <code>sap.f.FlexibleColumnLayout</code>-based app,
	 * you can use the <code>sap.f.FlexibleColumnLayoutSemanticHelper</code> class.</li>
	 * <li>To facilitate the navigation and view loading, you can use the {@link sap.f.routing.Router} </li></ul>
	 *
	 * <h3>Responsive Behavior</h3>
	 *
	 * The control automatically displays the maximum possible number of columns based on the device size and current <code>layout</code>.
	 * The app does not need to take into consideration the current device/screen size, but only to add content to the
	 * columns and change the value of the <code>layout</code> property.
	 *
	 * For detailed information, see {@link sap.f.LayoutType LayoutType} enumeration.
	 *
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.46
	 * @alias sap.f.FlexibleColumnLayout
	 * @see {@link topic:59a0e11712e84a648bb990a1dba76bc7 Flexible Column Layout}
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/flexible-column-layout/ Flexible Column Layout}
	 */
	var FlexibleColumnLayout = Control.extend("sap.f.FlexibleColumnLayout", {
		metadata: {
			interfaces: [
				"sap.ui.core.IPlaceholderSupport"
			],
			properties: {

				/**
				 * Determines whether the initial focus is set automatically on first rendering and after navigating to a new page.
				 *
				 * For more information, see {@link sap.m.NavContainer#autoFocus}.
				 * @since 1.76
				 */
				autoFocus: {type: "boolean", group: "Behavior", defaultValue: true},

				/**
				 * Determines the layout of the control - number of visible columns and their relative sizes.
				 *
				 * For more details, see {@link topic:3b9f760da5b64adf8db7f95247879086 Types of Layout} in the documentation.
				 */
				layout: {type: "sap.f.LayoutType", defaultValue: LT.OneColumn},

				/**
				 * Determines the type of the transition/animation to apply for the <code>Begin</code> column when <code>to()</code> is called without defining the
				 * transition to use. The default is <code>slide</code>, other options are <code>fade</code>, <code>flip</code>, <code>show</code>, and the names of any registered custom transitions.
				 */
				defaultTransitionNameBeginColumn : {type : "string", group : "Appearance", defaultValue : "slide"},

				/**
				 * Determines the type of the transition/animation to apply for the <code>Mid</code> column when <code>to()</code> is called without defining the
				 * transition to use. The default is <code>slide</code>, other options are <code>fade</code>, <code>flip</code>, <code>show</code>, and the names of any registered custom transitions.
				 */
				defaultTransitionNameMidColumn : {type : "string", group : "Appearance", defaultValue : "slide"},

				/**
				 * Determines the type of the transition/animation to apply for the <code>End</code> column when <code>to()</code> is called without defining the
				 * transition to use. The default is <code>slide</code>, other options are <code>fade</code>, <code>flip</code>, <code>show</code>, and the names of any registered custom transitions.
				 */
				defaultTransitionNameEndColumn : {type : "string", group : "Appearance", defaultValue : "slide"},

				/**
				 * Specifies the background color of the content. The visualization of the different options depends on the used theme.
				 * @since 1.54
				 */
				backgroundDesign: {type: "sap.m.BackgroundDesign",  group: "Appearance", defaultValue: mobileLibrary.BackgroundDesign.Transparent},

				/**
				 * Determines whether the focus is restored to the last known when navigating back to a prevously
				 * opened column, for example, upon closing of the end column and being transfered back to the mid column.
				 * @since 1.77
				 */
				restoreFocusOnBackNavigation: {type: "boolean",  group: "Behavior", defaultValue: false}
			},
			aggregations: {
				/**
				 * The content entities between which the <code>FlexibleColumnLayout</code> navigates in the <code>Begin</code> column.
				 *
				 * These should be any control with page semantics.
				 * These aggregated controls will receive navigation events like {@link sap.m.NavContainerChild#event:BeforeShow BeforeShow}, they are documented in the pseudo interface {@link sap.m.NavContainerChild sap.m.NavContainerChild}.
				 */
				beginColumnPages: {type: "sap.ui.core.Control", multiple: true, forwarding: {getter: "_getBeginColumn", aggregation: "pages"}},
				/**
				 * The content entities between which the <code>FlexibleColumnLayout</code> navigates in the <code>Mid</code> column.
				 *
				 * These should be any control with page semantics.
				 * These aggregated controls will receive navigation events like {@link sap.m.NavContainerChild#event:BeforeShow BeforeShow}, they are documented in the pseudo interface {@link sap.m.NavContainerChild sap.m.NavContainerChild}.
				 */
				midColumnPages: {type: "sap.ui.core.Control", multiple: true, forwarding: {getter: "_getMidColumn", aggregation: "pages"}},
				/**
				 * The content entities between which the <code>FlexibleColumnLayout</code> navigates in the <code>End</code> column.
				 *
				 * These should be any control with page semantics.
				 * These aggregated controls will receive navigation events like {@link sap.m.NavContainerChild#event:BeforeShow BeforeShow}, they are documented in the pseudo interface {@link sap.m.NavContainerChild sap.m.NavContainerChild}.
				 */
				endColumnPages: {type: "sap.ui.core.Control", multiple: true, forwarding: {getter: "_getEndColumn", aggregation: "pages"}},
				/**
				 * Accessible landmark settings to be applied on the containers of the <code>sap.f.FlexibleColumnLayout</code> control.
				 *
				 * If not set, no landmarks will be written.
				 * @since 1.95
				 */
				landmarkInfo : {type : "sap.f.FlexibleColumnLayoutAccessibleLandmarkInfo", multiple : false},

				_beginColumnNav: {type : "sap.m.NavContainer", multiple : false, visibility : "hidden"},
				_midColumnNav: {type : "sap.m.NavContainer", multiple : false, visibility : "hidden"},
				_endColumnNav: {type : "sap.m.NavContainer", multiple : false, visibility : "hidden"}
			},
			associations : {

				/**
				 * Sets the initial <code>Begin</code> column page, which is displayed on application launch.
				 */
				initialBeginColumnPage: {type : "sap.ui.core.Control", multiple : false},
				/**
				 * Sets the initial <code>Mid</code> column page, which is displayed on application launch.
				 */
				initialMidColumnPage: {type : "sap.ui.core.Control", multiple : false},
				/**
				 * Sets the initial <code>End</code> column page, which is displayed on application launch.
				 */
				initialEndColumnPage: {type : "sap.ui.core.Control", multiple : false}
			},
			events: {
				/**
				 * Fired when there is a change in the <code>layout</code> property or in the maximum number of columns that can be displayed at once.
				 * <br/></br>
				 * <ul>The interactions that may lead to a state change are:
				 *  <li>The property <code>layout</code> was changed indirectly by the user dragging the column separator or clicking on its arrow (where arrow is available).</li>
				 *  <li>The user resized the browser window beyond a breakpoint, thus changing the maximum number of columns that can be displayed at once.</li></ul>
				 * <br/><br/>
				 * <b>Note: </b>The event is suppressed while the control has zero width and will be fired the first time it gets a non-zero width
				 *
				 */
				stateChange: {
					parameters: {
						/**
						 * The value of the <code>layout</code> property
						 */
						layout: {
							type: "sap.f.LayoutType"
						},
						/**
						 * The maximum number of columns that can be displayed at once based on the available screen size and control settings.
						 *
						 * <ul>Possible values are:
						 * <li>3 for browser size of 1280px or more</li>
						 * <li>2 for browser size between 960px and 1280px</li>
						 * <li>1 for browser size less than 960px</li></ul>
						 */
						maxColumnsCount: {
							type: "int"
						},
						/**
						 * Indicates whether the layout changed as a result of the user clicking a column separator's arrow or dragging the column separators
						 */
						isNavigationArrow: {
							type: "boolean"
						},
						/**
						 * Indicates whether the maximum number of columns that can be displayed at once changed due to resize of the entire browser window
						 */
						isResize: {
							type: "boolean"
						}

					}
				},

				/**
				 * Fires when navigation between two pages in the <code>Begin</code> column has been triggered. The transition (if any) to the new page has not started yet.
				 * This event can be aborted by the application with preventDefault(), which means that there will be no navigation.
				 */
				beginColumnNavigate : {
					allowPreventDefault : true,
					parameters : {

						/**
						 * The page, which was displayed before the current navigation.
						 */
						from : {type : "sap.ui.core.Control"},

						/**
						 * The ID of the page, which was displayed before the current navigation.
						 */
						fromId : {type : "string"},

						/**
						 * The page, which will be displayed after the current navigation.
						 */
						to : {type : "sap.ui.core.Control"},

						/**
						 * The ID of the page, which will be displayed after the current navigation.
						 */
						toId : {type : "string"},

						/**
						 * Determines whether the "to" page (more precisely: a control with the ID of the page,
						 * which is currently being navigated to) has not been displayed/navigated to before.
						 */
						firstTime : {type : "boolean"},

						/**
						 * Determines whether this is a forward navigation, triggered by to().
						 */
						isTo : {type : "boolean"},

						/**
						 * Determines whether this is a back navigation, triggered by back().
						 */
						isBack : {type : "boolean"},

						/**
						 * Determines whether this is a navigation to the root page, triggered by backToTop().
						 */
						isBackToTop : {type : "boolean"},

						/**
						 * Determines whether this was a navigation to a specific page, triggered by backToPage().
						 */
						isBackToPage : {type : "boolean"},

						/**
						 * Determines how the navigation was triggered, possible values are "to", "back", "backToPage", and "backToTop".
						 */
						direction : {type : "string"}
					}
				},

				/**
				 * Fires when navigation between two pages in the <code>Begin</code> column has completed.
				 *
				 * NOTE: In case of animated transitions this event is fired with some delay after the navigate event.
				 */
				afterBeginColumnNavigate : {
					parameters : {

						/**
						 * The page, which had been displayed before navigation.
						 */
						from : {type : "sap.ui.core.Control"},

						/**
						 * The ID of the page, which had been displayed before navigation.
						 */
						fromId : {type : "string"},

						/**
						 * The page, which is now displayed after navigation.
						 */
						to : {type : "sap.ui.core.Control"},

						/**
						 * The ID of the page, which is now displayed after navigation.
						 */
						toId : {type : "string"},

						/**
						 * Whether the "to" page (more precisely: a control with the ID of the page, which has been navigated to)
						 * has not been displayed/navigated to before.
						 */
						firstTime : {type : "boolean"},

						/**
						 * Determines whether was a forward navigation, triggered by to().
						 */
						isTo : {type : "boolean"},

						/**
						 * Determines whether this was a back navigation, triggered by back().
						 */
						isBack : {type : "boolean"},

						/**
						 * Determines whether this was a navigation to the root page, triggered by backToTop().
						 */
						isBackToTop : {type : "boolean"},

						/**
						 * Determines whether this was a navigation to a specific page, triggered by backToPage().
						 */
						isBackToPage : {type : "boolean"},

						/**
						 * Determines how the navigation was triggered, possible values are "to", "back", "backToPage", and "backToTop".
						 */
						direction : {type : "string"}
					}
				},

				/**
				 * Fires when navigation between two pages in the <code>Mid</code> column has been triggered. The transition (if any) to the new page has not started yet.
				 * This event can be aborted by the application with preventDefault(), which means that there will be no navigation.
				 */
				midColumnNavigate : {
					allowPreventDefault : true,
					parameters : {

						/**
						 * The page, which was displayed before the current navigation.
						 */
						from : {type : "sap.ui.core.Control"},

						/**
						 * The ID of the page, which was displayed before the current navigation.
						 */
						fromId : {type : "string"},

						/**
						 * The page, which will be displayed after the current navigation.
						 */
						to : {type : "sap.ui.core.Control"},

						/**
						 * The ID of the page, which will be displayed after the current navigation.
						 */
						toId : {type : "string"},

						/**
						 * Determines whether the "to" page (more precisely: a control with the ID of the page,
						 * which is currently being navigated to) has not been displayed/navigated to before.
						 */
						firstTime : {type : "boolean"},

						/**
						 * Determines whether this is a forward navigation, triggered by to().
						 */
						isTo : {type : "boolean"},

						/**
						 * Determines whether this is a back navigation, triggered by back().
						 */
						isBack : {type : "boolean"},

						/**
						 * Determines whether this is a navigation to the root page, triggered by backToTop().
						 */
						isBackToTop : {type : "boolean"},

						/**
						 * Determines whether this was a navigation to a specific page, triggered by backToPage().
						 */
						isBackToPage : {type : "boolean"},

						/**
						 * Determines how the navigation was triggered, possible values are "to", "back", "backToPage", and "backToTop".
						 */
						direction : {type : "string"}
					}
				},

				/**
				 * Fires when navigation between two pages in the <code>Mid</code> column has completed.
				 *
				 * NOTE: In case of animated transitions this event is fired with some delay after the navigate event.
				 */
				afterMidColumnNavigate : {
					parameters : {

						/**
						 * The page, which had been displayed before navigation.
						 */
						from : {type : "sap.ui.core.Control"},

						/**
						 * The ID of the page, which had been displayed before navigation.
						 */
						fromId : {type : "string"},

						/**
						 * The page, which is now displayed after navigation.
						 */
						to : {type : "sap.ui.core.Control"},

						/**
						 * The ID of the page, which is now displayed after navigation.
						 */
						toId : {type : "string"},

						/**
						 * Whether the "to" page (more precisely: a control with the ID of the page, which has been navigated to)
						 * has not been displayed/navigated to before.
						 */
						firstTime : {type : "boolean"},

						/**
						 * Determines whether was a forward navigation, triggered by to().
						 */
						isTo : {type : "boolean"},

						/**
						 * Determines whether this was a back navigation, triggered by back().
						 */
						isBack : {type : "boolean"},

						/**
						 * Determines whether this was a navigation to the root page, triggered by backToTop().
						 */
						isBackToTop : {type : "boolean"},

						/**
						 * Determines whether this was a navigation to a specific page, triggered by backToPage().
						 */
						isBackToPage : {type : "boolean"},

						/**
						 * Determines how the navigation was triggered, possible values are "to", "back", "backToPage", and "backToTop".
						 */
						direction : {type : "string"}
					}
				},

				/**
				 * Fires when navigation between two pages in the <code>End</code> column has been triggered. The transition (if any) to the new page has not started yet.
				 * This event can be aborted by the application with preventDefault(), which means that there will be no navigation.
				 */
				endColumnNavigate : {
					allowPreventDefault : true,
					parameters : {

						/**
						 * The page, which was displayed before the current navigation.
						 */
						from : {type : "sap.ui.core.Control"},

						/**
						 * The ID of the page, which was displayed before the current navigation.
						 */
						fromId : {type : "string"},

						/**
						 * The page, which will be displayed after the current navigation.
						 */
						to : {type : "sap.ui.core.Control"},

						/**
						 * The ID of the page, which will be displayed after the current navigation.
						 */
						toId : {type : "string"},

						/**
						 * Determines whether the "to" page (more precisely: a control with the ID of the page,
						 * which is currently being navigated to) has not been displayed/navigated to before.
						 */
						firstTime : {type : "boolean"},

						/**
						 * Determines whether this is a forward navigation, triggered by to().
						 */
						isTo : {type : "boolean"},

						/**
						 * Determines whether this is a back navigation, triggered by back().
						 */
						isBack : {type : "boolean"},

						/**
						 * Determines whether this is a navigation to the root page, triggered by backToTop().
						 */
						isBackToTop : {type : "boolean"},

						/**
						 * Determines whether this was a navigation to a specific page, triggered by backToPage().
						 */
						isBackToPage : {type : "boolean"},

						/**
						 * Determines how the navigation was triggered, possible values are "to", "back", "backToPage", and "backToTop".
						 */
						direction : {type : "string"}
					}
				},

				/**
				 * Fires when navigation between two pages in the <code>End</code> column has completed.
				 *
				 * NOTE: In case of animated transitions this event is fired with some delay after the navigate event.
				 */
				afterEndColumnNavigate : {
					parameters : {

						/**
						 * The page, which had been displayed before navigation.
						 */
						from : {type : "sap.ui.core.Control"},

						/**
						 * The ID of the page, which had been displayed before navigation.
						 */
						fromId : {type : "string"},

						/**
						 * The page, which is now displayed after navigation.
						 */
						to : {type : "sap.ui.core.Control"},

						/**
						 * The ID of the page, which is now displayed after navigation.
						 */
						toId : {type : "string"},

						/**
						 * Whether the "to" page (more precisely: a control with the ID of the page, which has been navigated to)
						 * has not been displayed/navigated to before.
						 */
						firstTime : {type : "boolean"},

						/**
						 * Determines whether was a forward navigation, triggered by to().
						 */
						isTo : {type : "boolean"},

						/**
						 * Determines whether this was a back navigation, triggered by back().
						 */
						isBack : {type : "boolean"},

						/**
						 * Determines whether this was a navigation to the root page, triggered by backToTop().
						 */
						isBackToTop : {type : "boolean"},

						/**
						 * Determines whether this was a navigation to a specific page, triggered by backToPage().
						 */
						isBackToPage : {type : "boolean"},

						/**
						 * Determines how the navigation was triggered, possible values are "to", "back", "backToPage", and "backToTop".
						 */
						direction : {type : "string"}
					}
				},

				/**
				 * Fired when resize of each column has completed.
				 * @since 1.76
				 */
				columnResize : {
					parameters : {
						/**
						 * Determines whether <code>beginColumn</code> resize has completed.
						 */
						beginColumn : {type : "boolean"},
						/**
						 * Determines whether <code>midColumn</code> resize has completed.
						 */
						midColumn : {type : "boolean"},
						/**
						 * Determines whether <code>endColumn</code> resize has completed.
						 */
						endColumn : {type : "boolean"}
					}
				}
			}
		},

		renderer: FlexibleColumnLayoutRenderer
	});

	FlexibleColumnLayout.DEFAULT_COLUMN_LABELS = {
		"FirstColumn" : "FCL_BEGIN_COLUMN_REGION_TEXT",
		"MiddleColumn" : "FCL_MID_COLUMN_REGION_TEXT",
		"LastColumn" : "FCL_END_COLUMN_REGION_TEXT"
	};

	FlexibleColumnLayout.COLUMN_RESIZING_ANIMATION_DURATION = 560; // ms
	FlexibleColumnLayout.PINNED_COLUMN_CLASS_NAME = "sapFFCLPinnedColumn";
	FlexibleColumnLayout.ANIMATED_COLUMN_CLASS_NAME = "sapFFCLAnimatedColumn";
	FlexibleColumnLayout.COLUMN_ORDER = ["begin", "mid", "end"]; // natural order of the columns in FCL
	// synced with @_sap_f_FCL_SeparatorWidth in base less file
	FlexibleColumnLayout.COLUMN_SEPARATOR_WIDTH = DomUnitsRem.toPx("1rem");

	FlexibleColumnLayout.prototype.init = function () {
		this._iWidth = 0;

		// Used to store the last focused DOM element of any of the columns
		this._oColumnFocusInfo = {
			begin: {},
			mid: {},
			end: {}
		};

		// Create the 3 nav containers
		this._initNavContainers();

		// Holds an object, responsible for saving and searching the layout history
		this._oLayoutHistory = new LayoutHistory();

		this._oAnimationEndListener = new AnimationEndListener();

		// Indicates if there are rendered pages inside columns
		this._oRenderedColumnPagesBoolMap = {};

		this._oColumnWidthInfo = {
			begin: 0,
			mid: 0,
			end: 0
		};

		// Create bound listener functions for keyboard event handling
		this._keyListeners = {
			increase     : this._resizeColumnOnKeypress.bind(this, "inc", 1),
			decrease     : this._resizeColumnOnKeypress.bind(this, "dec", 1),
			increaseMore : this._resizeColumnOnKeypress.bind(this, "incMore", 2),
			decreaseMore : this._resizeColumnOnKeypress.bind(this, "decMore", 2),
			max          : this._resizeColumnOnKeypress.bind(this, "max", 1),
			min          : this._resizeColumnOnKeypress.bind(this, "min", 1)
		};
		this._enableKeyboardListeners();

		this._oInvisibleMessage = null;
		this._boundColumnSeparatorMove = this._onColumnSeparatorMove.bind(this);
		this._boundColumnSeparatorMoveEnd = this._onColumnSeparatorMoveEnd.bind(this);
		this._oLocalStorage = {};
		this._bNeverRendered = true;
	};

	FlexibleColumnLayout.prototype._getLocalStorage = function (iMaxColumnsCount) {
		if (!iMaxColumnsCount) {
			iMaxColumnsCount = this.getMaxColumnsCount();
		}
		var sKey = (iMaxColumnsCount === 3) ? "desktop" : "tablet";
		if (!this._oLocalStorage[sKey]) {
			var sPrefix = sKey === 'desktop' ?
				FlexibleColumnLayout.STORAGE_PREFIX_DESKTOP :
				FlexibleColumnLayout.STORAGE_PREFIX_TABLET;
			this._oLocalStorage[sKey] = new Storage(Storage.Type.local, sPrefix);
		}
		return this._oLocalStorage[sKey];
	};

	FlexibleColumnLayout.prototype._announceMessage = function (sResourceBundleKey) {
		var sText = FlexibleColumnLayout._getResourceBundle().getText(sResourceBundleKey);

		if (this._oInvisibleMessage) {
			this._oInvisibleMessage.announce(sText, InvisibleMessageMode.Polite);
		}
	};

	/**
	 * Connects the keyboard event listeners so resizing via keyboard will be possible
	 */
	FlexibleColumnLayout.prototype._enableKeyboardListeners = function() {
		this.onsaprightmodifiers     = this._keyListeners.increase;
		this.onsapleftmodifiers      = this._keyListeners.decrease;
		this.onsapright              = this._keyListeners.increaseMore;
		this.onsapleft               = this._keyListeners.decreaseMore;
		this.onsapend                = this._keyListeners.max;
		this.onsaphome               = this._keyListeners.min;

		this._keyboardEnabled = true;
	};

	/**
	 * Called on after rendering of the internal <code>NavContainer</code> instances to check their rendered pages
	 * @private
	 */
	FlexibleColumnLayout.prototype._onNavContainerRendered = function (oEvent) {

		var oColumnNavContainer = oEvent.srcControl,
			bHasPages = oColumnNavContainer.getPages().length > 0,
			bHadAnyColumnPagesRendered = this._hasAnyColumnPagesRendered();

		this._setColumnPagesRendered(oColumnNavContainer.getId(), bHasPages);

		if (this._hasAnyColumnPagesRendered() !== bHadAnyColumnPagesRendered) {
			this._hideShowColumnSeparators();
			this._updateSeparatorsAriaPositionInfo();
		}
	};

	/**
	 * Instantiates a nav container for the column and binds events
	 * @param {string} sColumn - the column for which a nav container must be created
	 * @returns {*}
	 * @private
	 */
	FlexibleColumnLayout.prototype._createNavContainer = function (sColumn) {
		var sColumnCap = sColumn.charAt(0).toUpperCase() + sColumn.slice(1);
		var oNavContainer = new NavContainer(this.getId() + "-" + sColumn + "ColumnNav", {
			autoFocus: this.getAutoFocus(),
			navigate: function(oEvent){
				this._handleNavigationEvent(oEvent, false, sColumn);
			}.bind(this),
			afterNavigate: function(oEvent){
				this._handleNavigationEvent(oEvent, true, sColumn);
			}.bind(this),
			defaultTransitionName: this["getDefaultTransitionName" + sColumnCap + "Column"]()
		});

		oNavContainer.addDelegate({"onAfterRendering": this._onNavContainerRendered}, this);

		this["_" + sColumn + 'ColumnFocusOutDelegate'] = {
			onfocusout: function(oEvent) {
				this._oColumnFocusInfo[sColumn] = oEvent.target;
			}
		};

		oNavContainer.addEventDelegate(this["_" + sColumn + 'ColumnFocusOutDelegate'], this);

		return oNavContainer;
	};

	/**
	 * Formats <code>FlexibleColumnLayoutAccessibleLandmarkInfo</code> role and label of the provided <code>FlexibleColumnLayout</code> column.
	 *
	 * @param {sap.f.FlexibleColumnLayoutAccessibleLandmarkInfo} oLandmarkInfo FlexibleColumnLayout LandmarkInfo
	 * @param {string} sColumnName column of the layout
	 * @returns {sap.f.FlexibleColumnLayoutAccessibleLandmarkInfo} The formatted landmark info
	 * @private
	 */
	 FlexibleColumnLayout.prototype._formatColumnLandmarkInfo = function (oLandmarkInfo, sColumnName) {
		var sLabel = null;
		if (oLandmarkInfo) {
			sLabel = oLandmarkInfo["get" + sColumnName + "Label"]();
		}

		return {
			role: "region",
			label: sLabel || FlexibleColumnLayout._getResourceBundle().getText(FlexibleColumnLayout.DEFAULT_COLUMN_LABELS[sColumnName])
		};
	};

	/**
	 * Proxies the navigation events from the internal nav containers to the app.
	 * @param oEvent
	 * @param {boolean} bAfter
	 * @param {string} sColumn
	 * @private
	 */
	FlexibleColumnLayout.prototype._handleNavigationEvent = function(oEvent, bAfter, sColumn){
		var sEventName,
			bContinue;

		if (bAfter) {
			sEventName = "after" + (sColumn.charAt(0).toUpperCase() + sColumn.slice(1)) + "ColumnNavigate";
		} else {
			sEventName = sColumn + "ColumnNavigate";
		}

		bContinue = this.fireEvent(sEventName, oEvent.mParameters, true);
		if (!bContinue) {
			oEvent.preventDefault();
		}
	};

	/**
	 * Getter for a Column by its string name
	 * @param {string} sColumnName
	 * @returns {object} oColumn
	 * @private
	 */
	FlexibleColumnLayout.prototype._getColumnByStringName = function (sColumnName) {
		if (sColumnName === 'end') {
			return this._getEndColumn();
		} else if (sColumnName === 'mid') {
			return this._getMidColumn();
		} else {
			return this._getBeginColumn();
		}
	};

	/**
	 * Getter for the Begin column nav container
	 * @returns {*}
	 * @private
	 */
	FlexibleColumnLayout.prototype._getBeginColumn = function () {
		return this.getAggregation("_beginColumnNav");
	};

	/**
	 * Getter for the Mid column nav container
	 * @returns {*}
	 * @private
	 */
	FlexibleColumnLayout.prototype._getMidColumn = function () {
		return this.getAggregation("_midColumnNav");
	};

	/**
	 * Getter for the End column nav container
	 * @returns {*}
	 * @private
	 */
	FlexibleColumnLayout.prototype._getEndColumn = function () {
		return this.getAggregation("_endColumnNav");
	};

	/**
	 * Updates the content of a column by flushing its container div only
	 * @param {string} sColumn
	 * @private
	 */
	FlexibleColumnLayout.prototype._flushColumnContent = function (sColumn) {
		var oControl = this.getAggregation("_" + sColumn + "ColumnNav"),
			oRm = new RenderManager().getInterface();

		oRm.renderControl(oControl);
		oRm.flush(this._$columns[sColumn].find(".sapFFCLColumnContent")[0], undefined, true);
		oRm.destroy();
	};

	FlexibleColumnLayout.prototype.setLayout = function (sNewLayout) {
		sNewLayout = this.validateProperty("layout", sNewLayout);

		var sCurrentLayout = this.getLayout();

		if (sCurrentLayout === sNewLayout) {
			return this;
		}

		var vResult = this.setProperty("layout", sNewLayout, true);
		this._oLayoutHistory.addEntry(sNewLayout);
		this._resizeColumns();

		return vResult;
	};

	FlexibleColumnLayout.prototype.setAutoFocus = function (bNewAutoFocus) {
		bNewAutoFocus = this.validateProperty("autoFocus", bNewAutoFocus);

		var bCurrentAutoFocus = this.getAutoFocus();

		if (bCurrentAutoFocus === bNewAutoFocus) {
			return this;
		}

		this._getNavContainers().forEach(function (oNavContainer) {
			oNavContainer.setAutoFocus(bNewAutoFocus);
		});

		return this.setProperty("autoFocus", bNewAutoFocus, true);
	};

	FlexibleColumnLayout.prototype.onBeforeRendering = function () {
		var oColumns = this._$columns;
		if (!this._oInvisibleMessage) {
			this._oInvisibleMessage = InvisibleMessage.getInstance();
		}

		this._deregisterResizeHandler();
		this._oAnimationEndListener.cancelAll();

		if (this.$().length) {
			FlexibleColumnLayout.COLUMN_ORDER.slice().forEach(function (sColumn) {
				oColumns && oColumns[sColumn] && oColumns[sColumn].removeClass(FlexibleColumnLayout.ANIMATED_COLUMN_CLASS_NAME);
			});
		}
	};

	FlexibleColumnLayout.prototype.onAfterRendering = function () {
		this._measureControlWidth();

		this._registerResizeHandler();

		this._cacheDOMElements();

		this._resizeColumns();

		this._flushColumnContent("begin");
		this._flushColumnContent("mid");
		this._flushColumnContent("end");

		this._fireStateChange(false, false);
		this._bNeverRendered = false;
	};

	FlexibleColumnLayout.prototype.onmousedown = function (oEvent) {
		if (this._ignoreMouse) {
			return;
		}
		var oTarget = this._getColumnSeparator(oEvent.target);

		if (!oTarget) {
			return;
		}
		this._ignoreTouch = true;
		this._onColumnSeparatorMoveStart(oEvent, oTarget);
	};

	FlexibleColumnLayout.prototype.ontouchstart = function (oEvent) {
		if (this._ignoreTouch) {
			return;
		}
		var oTarget = this._getColumnSeparator(oEvent.target);

		if (!oTarget) {
			return;
		}
		if (!oEvent.changedTouches || !oEvent.changedTouches[0]) {
			// No touch in event
			return;
		}
		this._ignoreMouse = true;
		this._onColumnSeparatorMoveStart(oEvent.changedTouches[0], oTarget, true);
	};

	/**
	 * Restores the focus to the last known focused element of the current column.
	 * @private
	 */
	FlexibleColumnLayout.prototype._restoreFocusToColumn = function (sCurrentColumn) {
		var oElement = this._oColumnFocusInfo[sCurrentColumn],
			oCurrentColumn = this._getColumnByStringName(sCurrentColumn);
		if (this._isFocusInCurrentColumn(oCurrentColumn)) {
			return;
		}

		if (!oElement || isEmptyObject(oElement)) {
			// if no element was stored, get first focusable
			oElement = this._getFirstFocusableElement(sCurrentColumn);
		}

		jQuery(oElement).trigger("focus");
	};

	/**
	 *
	 * Returns the first focusable element inside the current page in the corresponding nav container
	 * @param {string} sColumn
	 * @return {jQuery|Element|null}
	 * @private
	 */
	FlexibleColumnLayout.prototype._getFirstFocusableElement = function (sColumn) {
		var oCurrentColumn = this._getColumnByStringName(sColumn),
			oCurrentPage = oCurrentColumn.getCurrentPage();

		if (oCurrentPage) {
			return oCurrentPage.$().firstFocusableDomRef();
		}

		return null;
	};

	/**
	 * Checks whether or not the focus is in some columns that are previous to the current
	 * column. For example, if the current is "end", checks if the focus is
	 * in "mid" or "begin" columns.
	 * @param {sap.f.LayoutType} sLayout the layout to check
	 * @returns {boolean} whether or not the focus is in columns that are previous to the current column
	 * @private
	 */
	FlexibleColumnLayout.prototype._isFocusInSomeOfThePreviousColumns = function (sLayout) {
		var sLastVisibleColumn = this._getLastVisibleColumnForLayout(sLayout),
			iIndex = FlexibleColumnLayout.COLUMN_ORDER.indexOf(sLastVisibleColumn) - 1,
			oCurrentColumn;

		for (; iIndex >= 0; iIndex--) {
			oCurrentColumn = this._getColumnByStringName(FlexibleColumnLayout.COLUMN_ORDER[iIndex]);
			if (oCurrentColumn && oCurrentColumn._isFocusInControl(oCurrentColumn)) {
				return true;
			}
		}

		return false;
	};

	/**
	 * Checks whether or not the focus is already in the current column
	 * @param {Object} oCurrentColumn the current column
	 * @returns {boolean} whether or not the focus is in the current column
	 * @private
	 */
	FlexibleColumnLayout.prototype._isFocusInCurrentColumn = function (oCurrentColumn) {
		return oCurrentColumn._isFocusInControl(oCurrentColumn);
	};

	FlexibleColumnLayout.prototype._getControlWidth = function () {
		// There is a case when we are still in app initialization phase and some containers
		// are changing their visibility, at this point we need to obtain the width directly
		// from the DOM and do not wait for the ResizeHandler update as it comes later.
		if (this._iWidth === 0) {
			this._measureControlWidth();
		}

		return this._iWidth;
	};

	FlexibleColumnLayout.prototype._measureControlWidth = function () {
		if (this.$().is(":visible")) {
			this._iWidth = this.$().width();
		} else {
			this._iWidth = 0;
		}
	};

	FlexibleColumnLayout.prototype.exit = function () {
		this._removeNavContainersFocusOutDelegate();
		this._oRenderedColumnPagesBoolMap = null;
		this._oColumnFocusInfo = null;
		this._oLocalStorage = null;
		this._deregisterResizeHandler();
		this._handleEvent(jQuery.Event("Destroy"));
		this._detachMoveListeners();
	};

	FlexibleColumnLayout.prototype._removeNavContainersFocusOutDelegate = function () {
		FlexibleColumnLayout.COLUMN_ORDER.forEach(function(sColumnName) {
			this._getColumnByStringName(sColumnName).removeEventDelegate(this["_" + sColumnName + "ColumnFocusOutDelegate"]);
		}, this);
	};

	FlexibleColumnLayout.prototype._registerResizeHandler = function () {
		assert(!this._iResizeHandlerId, "Resize handler already registered");
		this._iResizeHandlerId = ResizeHandler.register(this, this._onResize.bind(this));
	};

	FlexibleColumnLayout.prototype._deregisterResizeHandler = function () {
		if (this._iResizeHandlerId) {
			ResizeHandler.deregister(this._iResizeHandlerId);
			this._iResizeHandlerId = null;
		}
	};

	/**
	 * Creates the nav containers
	 * @private
	 */
	FlexibleColumnLayout.prototype._initNavContainers = function () {
		this.setAggregation("_beginColumnNav", this._createNavContainer("begin"), true);
		this.setAggregation("_midColumnNav", this._createNavContainer("mid"), true);
		this.setAggregation("_endColumnNav", this._createNavContainer("end"), true);
	};

	/**
	 * Return array containing the nav containers
	 * @return {Array.<object>}
	 * @private
	 */
	FlexibleColumnLayout.prototype._getNavContainers = function () {
		return [this._getBeginColumn(), this._getMidColumn(), this._getEndColumn()];
	};

	/**
	 * Saves the DOM references of the columns and column separators.
	 * @private
	 */
	FlexibleColumnLayout.prototype._cacheDOMElements = function () {
		this._cacheColumns();

		if (!Device.system.phone) {
			this._cacheColumnSeparators();
			this._$overlay = this.$("overlay");
			this._$overlaySeparator = this.$("overlaySeparator");
		}
	};

	FlexibleColumnLayout.prototype._cacheColumns = function () {
		this._$columns = {
			begin: this.$("beginColumn"),
			mid: this.$("midColumn"),
			end: this.$("endColumn")
		};
	};

	FlexibleColumnLayout.prototype._cacheColumnSeparators = function () {
		this._oColumnSeparators = {
			begin: this.$("separator-begin"),
			end: this.$("separator-end")
		};
	};

	/**
	 * Returns the number of columns that have width > 0
	 * @param {sap.f.LayoutType} sLayout the layout to check
	 * @returns {number} the count
	 * @private
	 */
	FlexibleColumnLayout.prototype._getVisibleColumnsCount = function (sLayout) {
		return this._getVisibleColumnsForLayout(sLayout).length;
	};

	/**
	 * Returns the names of columns that have width > 0
	 * @param {sap.f.LayoutType} sLayout the layout to check
	 * @returns {Array.<string>} the column names
	 * @private
	 */
	FlexibleColumnLayout.prototype._getVisibleColumnsForLayout = function (sLayout) {
		return FlexibleColumnLayout.COLUMN_ORDER.filter(function (sColumn) {
			// Different than 0, as when we are storing the begin column size, it may happen that it's too big, leading to a negative size of the mid column
			return this._getColumnSizeForLayout(sColumn, sLayout) !== 0;
		}, this);
	};

	/**
	 * Returns the number of columns that have width > 0.
	 * @returns {number} the count
	 * @private
	 */
	FlexibleColumnLayout.prototype._getVisibleColumnSeparatorsCount = function () {
		if (!this._oColumnSeparators) {
			return 0;
		}

		return Object.keys(this._oColumnSeparators).filter(function (sName) {
			return this._oColumnSeparators[sName].data("visible");
		}, this).length;
	};

	/**
	 * Returns the total width available for the columns.
	 * @param {sap.f.LayoutType} sLayout the layout t ckeck
	 * @returns {number} the width in px
	 * @private
	 */
	FlexibleColumnLayout.prototype._getTotalColumnsWidth = function (sLayout) {
		var iSeparatorsCount = this._getRequiredColumnSeparatorsForLayout(sLayout).length;
		return this._getControlWidth() - iSeparatorsCount * FlexibleColumnLayout.COLUMN_SEPARATOR_WIDTH;
	};

	/**
	 * Changes the width of the columns
	 * @param {object} [oOptions] custom resize options (the custom sizes on interactive resize). If not
	 * provided, the default options returned from <code>_getDefaultResizeOptions</code> will be taken.
	 * @param {Object<string,number>} [oOptions.columnWidths] the column widths. If not provided, the default widths
	 * for the current layout will be taken
	 * @param {int} [oOptions.columnWidths.begin] the width of the 'begin' column in px
	 * @param {int} [oOptions.columnWidths.mid] the width of the 'mid' column in px
	 * @param {int} [oOptions.columnWidths.end] the width of the 'end' column in px
	 * @param {sap.f.LayoutType} [oOptions.layout] the current layout type
	 * @param {sap.f.LayoutType} [oOptions.previousLayout] the current layout type. If not provided,
	 * the previous entry from the <code>sap.f.FlexibleColumnLayout.LayoutHistory</code> will be taken.
	 * @param {boolean} oOptions.restoreFocusOnBackNavigation if focus should be restored upon
	 * resize that  corresponds to back navigation
	 * @param {boolean} oOptions.updateDetailedActiveClasses specifies if the CSS classes
	 * 'sapFFCLColumnOnlyActive', sapFFCLColumnFirstActive, sapFFCLColumnLastActive should be updated
	 * @param {boolean} oOptions.updateContextualSettings specifies if the contextual settings (for the
	 * new widths) should be propagated to the controls inside the columns
	 * @param {boolean} oOptions.updateMediaCSSClases specifies if the CSS classes for the media
	 * corresponsing to the current columns' width should be set to the columns
	 * @param {boolean} oOptions.hasAnimations specifies if animations are enabled
	 * @private
	 */
	FlexibleColumnLayout.prototype._resizeColumns = function (oOptions) {
		var aColumns = FlexibleColumnLayout.COLUMN_ORDER.slice(),
			bHasAnimations,
			sLayout,
			sPreviousLayout,
			iVisibleColumnsCount,
			oColumnWidths,
			sLastVisibleColumn,
			bInsetMidColumn,
			bRestoreFocusOnBackNavigation,
			oPendingAnimationEnd;

		// Stop here if the control isn't rendered yet
		if (!this.isActive()) {
			return;
		}

		oOptions = merge(this._getDefaultResizeOptions(), oOptions);
		sLayout = oOptions.layout;
		iVisibleColumnsCount = this._getVisibleColumnsCount(sLayout);

		if (iVisibleColumnsCount === 0) {
			return;
		}

		bHasAnimations = oOptions.hasAnimations;
		sPreviousLayout = oOptions.previousLayout;
		bInsetMidColumn = (iVisibleColumnsCount === 3) && (sLayout === LT.ThreeColumnsEndExpanded);
		oColumnWidths = oOptions.columnWidths || this._getAllColumnSizesForLayout(sLayout, true);
		sLastVisibleColumn = this._getLastVisibleColumnForLayout(sLayout);
		bRestoreFocusOnBackNavigation = oOptions.restoreFocusOnBackNavigation &&
			sPreviousLayout &&
			this._isNavigatingBackward(sLayout, sPreviousLayout) &&
			!this._isFocusInSomeOfThePreviousColumns(sPreviousLayout);
		oPendingAnimationEnd = (bHasAnimations && sPreviousLayout) ?
			// checks if the previous animation completed
			this._getAnimationEndStatusForColumns() : {};


		// Animations on - Before resizing pin the columns that should not be animated in order to create the reveal/conceal effect
		if (bHasAnimations && sPreviousLayout) {
			 this._pinColumnsBeforeResize(sLayout, sPreviousLayout, oColumnWidths);

			// detach all listeners to any previous unfinished animation
			this._oAnimationEndListener.cancelAll();
		}

		aColumns.slice().forEach(function (sColumn) {
			this._$columns[sColumn].removeClass(FlexibleColumnLayout.ANIMATED_COLUMN_CLASS_NAME);
		}.bind(this));

		// update separator visibility only after pinning the columns
		// to prevent unnecessary resize in the concealed column due to
		// change of its width upon hiding its preceding separator
		this._hideShowColumnSeparators();


		aColumns.forEach(function (sColumn) {

			var iWidth = oColumnWidths[sColumn],
				bShouldRevealColumn = bHasAnimations
					&& this._shouldRevealColumn(sColumn, sLayout, sPreviousLayout),
					//&& this._$columns[sColumn].width() < FlexibleColumnLayout.COLUMN_MIN_WIDTH,
				bShouldConcealColumn = bHasAnimations
					&& this._shouldConcealColumn(sColumn, sLayout, sPreviousLayout);

			this._resizeColumn(sColumn, {
				width: iWidth,

				shouldRestoreFocus: bRestoreFocusOnBackNavigation &&
					(sColumn === sLastVisibleColumn),

				shouldInsetColumn: bInsetMidColumn && (sColumn === "mid"),

				shouldRevealColumn: bShouldRevealColumn,
				shouldConcealColumn: bShouldConcealColumn,

				// is hidden both before and after the resize
				hidden: iWidth === 0 && this._oColumnWidthInfo[sColumn] === 0,
				autoSize: iWidth > 0 && (sColumn === "mid"),

				hasAnimations: bHasAnimations,
				previousAnimationCompleted: !oPendingAnimationEnd[this._$columns[sColumn]],
				updateContextualSettings: oOptions.updateContextualSettings,
				updateMediaCSSClases: oOptions.updateMediaCSSClases
			});
		}, this);

		if (oOptions.updateDetailedActiveClasses) {
			this._addDetailedActiveClasses(sLayout);
		}

		if (bHasAnimations) {
			this._attachAfterAllColumnsResizedOnce(this._updateSeparatorsAriaPositionInfo.bind(this));
		} else {
			this._updateSeparatorsAriaPositionInfo();
		}
	};

	/**
	 * Changes the width of the given column
	 * @param {"begin" | "mid" | "end"} sColumn the column name
	 * @param {object} oColumnConfig resize options
	 * @param {int} oColumnConfig.width the width of the column in px
	 * @param {boolean} oColumnConfig.shouldInsetColumn if CSS class "sapFFCLColumnInset"
	 * should be set
	 * @param {boolean} oColumnConfig.autoSize if autoSize, the it should NOT set a fixed width
	 * (in px) to the column, to allow the default width of "100%" take effect. As a result,
	 * the column will take the space that remains after sizing its sibling columns
	 * @param {boolean} oColumnConfig.shouldRestoreFocus if focus should be restored after resize
	 * @param {boolean} oColumnConfig.shouldRevealColumn if the column should be resized with
	 * reveal effect
	 * @param {boolean} oColumnConfig.shouldConcealColumn if the column should be resized with
	 * conceal effect
	 * @param {boolean} oColumnConfig.updateContextualSettings specifies if the contextual settings (for the
	 * new widths) should be propagated to the controls inside the column
	 * @param {boolean} oColumnConfig.updateMediaCSSClases specifies if the CSS classes for the media
	 * corresponsing to the current width should be set to the column
	 * @param {boolean} oColumnConfig.hasAnimations specifies if animations are enabled
	 * @private
	 */
	FlexibleColumnLayout.prototype._resizeColumn = function (sColumn, oColumnConfig) {
		var $column = this._$columns[sColumn],
			oColumnDomRef = $column.get(0),
			iNewWidth = oColumnConfig.width,
			sNewWidth = convertPxToCSSSizeString(iNewWidth, this._getControlWidth(), oColumnConfig.shouldInsetColumn),
			bAutoSize = oColumnConfig.autoSize,
			bAnimationsEnabled = oColumnConfig.hasAnimations,
			bHidden = !iNewWidth,
			bResizeColumnWithAnimation = this._canResizeColumnWithAnimation(sColumn, oColumnConfig),
			bSuspendResizeHandler = bAnimationsEnabled,
			fnAfterResizeCallback = this._afterColumnResize.bind(this, sColumn, merge(oColumnConfig, {
				resumeResizeHandler: bSuspendResizeHandler && !bHidden // toggle back after resize
			})),
			fnResizeErrorCallback = function() {
				ResizeHandler.resume(oColumnDomRef);
				oColumnDomRef.querySelector(".sapFFCLColumnContent").style.width = "";
			};

			if (bAutoSize) {
				// do not set a fixed size to allow the default width:100% take effect
				sNewWidth = "";
			}

			// Add the active class to the column if it shows something
			// the concealed column should remain visible until the end of animations for other columns
			$column.toggleClass("sapFFCLColumnActive", iNewWidth > 0 || oColumnConfig.shouldConcealColumn);
			$column.toggleClass("sapFFCLColumnInset", oColumnConfig.shouldInsetColumn);
			// Remove all the classes that are used for HCB theme borders, they will be set again later
			$column.removeClass("sapFFCLColumnHidden sapFFCLColumnOnlyActive sapFFCLColumnLastActive sapFFCLColumnFirstActive");

			// Suspend ResizeHandler while animation is running
			if (bSuspendResizeHandler) {
				ResizeHandler.suspend(oColumnDomRef);
			}

			if (bResizeColumnWithAnimation) {
				$column.addClass(FlexibleColumnLayout.ANIMATED_COLUMN_CLASS_NAME);
				$column.width(sNewWidth);
				this._attachAfterColumnResizedOnce(sColumn, fnAfterResizeCallback, fnResizeErrorCallback);

			} else if (bAutoSize && bAnimationsEnabled){
				$column.width(sNewWidth);
				this._attachAfterAllColumnsResizedOnce(fnAfterResizeCallback, fnResizeErrorCallback);

			} else {
				$column.width(sNewWidth);
				fnAfterResizeCallback();
			}

			// For tablet and desktop - notify child controls to render with reduced container size, if they need to
			if (oColumnConfig.updateContextualSettings && !Device.system.phone && iNewWidth) {
				this._updateColumnContextualSettings(sColumn, iNewWidth);
			}
			if (oColumnConfig.updateMediaCSSClases && !Device.system.phone && iNewWidth) {
				this._updateColumnCSSClasses(sColumn, iNewWidth);
			}
	};

	/**
	 * Adjusts the column after resize
	 *
	 * @param {"begin" | "mid" | "end"} sColumn the column name
	 * @param {object} oOptions the resize options
	 * @param {int} oOptions.width the width of the column in px
	 * @param {boolean} oOptions.shouldRestoreFocus if focus should be restored after resize
	 * @param {boolean} oOptions.shouldRevealColumn if the column is being resized with reveal effect
	 * @param {boolean} oOptions.shouldConcealColumn if the column is being resized with conceal effect
	 * @param {boolean} oOptions.resumeResizeHandler if the <code>ResizeHandler.resume</code> should
	 * be called for the column's DOM elemnt after the resize
	 * @private
	 */
	FlexibleColumnLayout.prototype._afterColumnResize = function (sColumn, oOptions) {
		var oColumn = this._$columns[sColumn],
			bShouldRevealColumn = oOptions.shouldRevealColumn,
			bShouldConcealColumn = oOptions.shouldConcealColumn,
			iNewWidth = oOptions.width,
			bShouldRestoreFocus = oOptions.shouldRestoreFocus;

		//BCP: 1980006195
		oColumn.toggleClass("sapFFCLColumnHidden", iNewWidth === 0);

		if (bShouldRevealColumn || bShouldConcealColumn || oOptions.autoSize) {
			oColumn[0].querySelector(".sapFFCLColumnContent").style.width = "";
		}
		oColumn.toggleClass(FlexibleColumnLayout.PINNED_COLUMN_CLASS_NAME, false);
		oColumn.toggleClass(FlexibleColumnLayout.ANIMATED_COLUMN_CLASS_NAME, false);

		if (bShouldConcealColumn) {
			// The column does not show anything anymore, so we can remove the active class
			oColumn.removeClass("sapFFCLColumnActive");
		}

		if (oOptions.resumeResizeHandler) {
			ResizeHandler.resume(oColumn[0]);
		}

		this._cacheColumnWidth(sColumn, iNewWidth);
		if (bShouldRestoreFocus) {
			this._restoreFocusToColumn(sColumn);
		}
	};

	FlexibleColumnLayout.prototype._pinColumnsBeforeResize = function (sLayout, sPreviousLayout, oColumnWidths) {
		FlexibleColumnLayout.COLUMN_ORDER.slice().forEach(function (sColumn) {
			var bShouldConcealColumn = this._shouldConcealColumn(sColumn, sLayout, sPreviousLayout),
				bShouldRevealColumn = this._shouldRevealColumn(sColumn, sLayout, sPreviousLayout),
				bShouldPin = bShouldConcealColumn || bShouldRevealColumn,
				oColumn = this._$columns[sColumn],
				oColumnDomRef = oColumn[0];

			if (bShouldRevealColumn) {
				oColumnDomRef.querySelector(".sapFFCLColumnContent").style.width = oColumnWidths[sColumn] + "px";
			} else if (bShouldConcealColumn) {
				oColumnDomRef.querySelector(".sapFFCLColumnContent").style.width = oColumnDomRef.offsetWidth + "px";
			}

			oColumn.toggleClass(FlexibleColumnLayout.PINNED_COLUMN_CLASS_NAME, bShouldPin);

		}, this);
	};

	FlexibleColumnLayout.prototype._getAnimationEndStatusForColumns = function () {
		var oPendingAnimationEnd = {};
		// check if the previous animation completed
		FlexibleColumnLayout.COLUMN_ORDER.slice().forEach(function(sColumn) {
			oPendingAnimationEnd[sColumn] = this._oAnimationEndListener.isWaitingForColumnResizeEnd(this._$columns[sColumn]);
		}, this);
		return oPendingAnimationEnd;
	};

	FlexibleColumnLayout.prototype._getAllColumnSizesForLayout = function (sLayout, bNormalizeWidths) {
		var oSizes = {};
		FlexibleColumnLayout.COLUMN_ORDER.slice().forEach(function(sColumn) {
			var iPercentSize = this._getColumnSizeForLayout(sColumn, sLayout),
				iPxSize = this._convertColumnPercentWidthToPx(iPercentSize, sLayout);
			oSizes[sColumn] = iPxSize;
		}, this);

		///needed to cover the case when the custom column sizes (in %) were saved
		// when using a *larger* screen size, to prevent too narrow columns if the same sizes (in %)
		// are applied on the smaller screen size
		if (bNormalizeWidths) {
			this._normalizeColumnWidths(oSizes, this._getVisibleColumnsForLayout(sLayout));
		}
		return oSizes;
	};

	FlexibleColumnLayout.prototype._getDefaultResizeOptions = function () {
		var sAnimationMode = ControlBehavior.getAnimationMode();
		return {
			layout: this.getLayout(),
			previousLayout: this._getPreviousLayout(),
			restoreFocusOnBackNavigation: this.getRestoreFocusOnBackNavigation(),
			updateDetailedActiveClasses: true,
			updateContextualSettings: true,
			updateMediaCSSClases: true,
			hasAnimations: sAnimationMode !== AnimationMode.none && sAnimationMode !== AnimationMode.minimal
		};
	};

	FlexibleColumnLayout.prototype._getPreviousLayout = function () {
		return this._getLayoutHistory().getEntry(1, true /* recent first */) || LT.OneColumn;
	};

	FlexibleColumnLayout.prototype._addDetailedActiveClasses = function (sLayout) {
		var aColumns = FlexibleColumnLayout.COLUMN_ORDER.slice(),
			bRtl = Localization.getRTL(),
			aActiveColumns = aColumns.filter(function (sColumn) {
				return this._getColumnSizeForLayout(sColumn, sLayout) > 0;
			}, this);

		if (bRtl) {
			aColumns.reverse();
		}

		if (aActiveColumns.length === 1) {
			this._$columns[aActiveColumns[0]].addClass("sapFFCLColumnOnlyActive");
		}

		if (aActiveColumns.length > 1) {
			this._$columns[aActiveColumns[0]].addClass("sapFFCLColumnFirstActive");
			this._$columns[aActiveColumns[aActiveColumns.length - 1]].addClass("sapFFCLColumnLastActive");
		}
	};

	FlexibleColumnLayout.prototype._resizeColumnOnKeypress = function (sType, iStepSize, oEvent) {

		var oSeparator = this._getColumnSeparator(oEvent.target),
			iStartX, iEndX;

		if (!oSeparator) {
			return;
		}

		var iBigStep  = this._getControlWidth();

		var iStep = 0;
		switch (sType) {
			case "inc":
				iStep = iStepSize;
				break;

			case "incMore":
				iStep = iStepSize * 10;
				break;

			case "dec":
				iStep = 0 - iStepSize;
				break;

			case "decMore":
				iStep = 0 - iStepSize * 10;
				break;

			case "max":
				iStep = iBigStep;
				break;

			case "min":
				iStep = 0 - iBigStep;
				break;

			default:
				Log.warn("[FlexibleColumnLayout] Invalid keyboard resize type");
				break;
		}

		iStartX = oSeparator && oSeparator.getBoundingClientRect().x;
		iEndX = iStartX + iStep;

		this._onColumnSeparatorMoveStart({pageX: iStartX}, oSeparator);
		this._onColumnSeparatorMove({pageX: iEndX});
		this._onColumnSeparatorMoveEnd({pageX: iEndX});
	};

	FlexibleColumnLayout.prototype._onColumnSeparatorMoveStart = function (oEvent, oSeparator, bTouch) {
		// needed to position the separator presizely
		var bRtl = Localization.getRTL(),
			iStartOffset = this._getDraggedSeparatorStartOffset(oSeparator, bRtl);

		this._oMoveInfo = {
			cursorStartX: oEvent.pageX,
			cursorX: oEvent.pageX, // the mouse/finger position-x
			columnWidths: {
				begin: this._$columns.begin.get(0).offsetWidth,
				mid: this._$columns.mid.get(0).offsetWidth,
				end: this._$columns.end.get(0).offsetWidth
			},
			separator: oSeparator,
			separatorPosition: {
				x: iStartOffset,
				direction: bRtl ? "right" : "left"
			},
			layout: this.getLayout(),
			rtl: bRtl
		};

		this._enterInteractiveResizeMode(bTouch);
	};

	FlexibleColumnLayout.prototype._getDraggedSeparatorStartOffset = function (oSeparator, bRtl) {
		if (bRtl) {
			return this.getDomRef().clientWidth - oSeparator.offsetLeft - oSeparator.offsetWidth;
		}
		return oSeparator.offsetLeft;
	};

	FlexibleColumnLayout.prototype._onColumnSeparatorMove = function (oEvent) {
		if (oEvent.preventDefault && !(oEvent.changedTouches)) {
			oEvent.preventDefault(); // Do not select text
		}

		var iCursonX = getCursorPositionX(oEvent);
		this._previewResizedColumnsOnMoveSeparator(iCursonX);
	};

	FlexibleColumnLayout.prototype._onColumnSeparatorMoveEnd = function (oEvent) {
		var iCursonX = getCursorPositionX(oEvent);
		this._previewResizedColumnsOnMoveSeparator(iCursonX, true /* resize end */);
		this._saveResizedColumWidths();

		if (this._oMoveInfo.layout !== this.getLayout()) {
			this.setLayout(this._oMoveInfo.layout);
			this._fireStateChange(true, false);
		}

		this._exitInteractiveResizeMode();
	};

	/**
	 * Returns the separator for the given target. If there isn't such, null is returned
	 * @param {HTMLElement} oTarget The target
	 * @returns {HTMLElement|null} The found bar or null
	 */
	FlexibleColumnLayout.prototype._getColumnSeparator = function (oTarget) {
		var oSeparator = oTarget,
			sId = this.getId();

		if (oSeparator.classList.contains("sapFFCLColumnSeparatorGripIcon")) {
			oSeparator = oTarget.parentElement;
		}

		if (oSeparator.classList.contains("sapFFCLColumnSeparatorDecorationBefore")
			|| oSeparator.classList.contains("sapFFCLColumnSeparatorDecorationAfter")
			|| oSeparator.classList.contains("sapFFCLColumnSeparatorGrip")) {
				oSeparator = oSeparator.parentElement;
		}

		if (!oSeparator.id || oSeparator.id.indexOf(sId + "-separator") !== 0) {
			// The clicked element was not one of my splitter bars
			return null;
		}
		return oSeparator;
	};

	FlexibleColumnLayout.prototype._enterInteractiveResizeMode = function (bTouch) {
		var oSeparatorPosition = this._oMoveInfo.separatorPosition;

		this.toggleStyleClass("sapFFLActiveResize", true);
		this._$overlaySeparator.css(oSeparatorPosition.direction, oSeparatorPosition.x);
		this._oMoveInfo.separator.style.visibility = "hidden";
		this._attachMoveListeners(bTouch);
	};

	FlexibleColumnLayout.prototype._exitInteractiveResizeMode = function () {
		this.toggleStyleClass("sapFFLActiveResize", false);
		this._oMoveInfo.separator.style.visibility = "";
		this._oMoveInfo.separator.focus();
		this._updateAriaPositionInfo(this._oMoveInfo.separator);
		this._ignoreMouse = false;
		this._ignoreTouch = false;
		this._oMoveInfo = null;
		this._detachMoveListeners();
	};

	FlexibleColumnLayout.prototype._attachMoveListeners = function (bTouch) {
		if (bTouch) {
			document.addEventListener("touchend", this._boundColumnSeparatorMoveEnd);
			document.addEventListener("touchmove", this._boundColumnSeparatorMove);
		} else {
			document.addEventListener("mouseup", this._boundColumnSeparatorMoveEnd);
			document.addEventListener("mousemove", this._boundColumnSeparatorMove);
		}
	};

	FlexibleColumnLayout.prototype._detachMoveListeners = function () {
		document.removeEventListener("mouseup", this._boundColumnSeparatorMoveEnd);
		document.removeEventListener("mousemove", this._boundColumnSeparatorMove);
		document.removeEventListener("touchend", this._boundColumnSeparatorMoveEnd);
		document.removeEventListener("touchmove", this._boundColumnSeparatorMove);
	};

	FlexibleColumnLayout.prototype._previewResizedColumnsOnMoveSeparator = function (cursorX, bIsResizeEnd) {
		var getPositionOffset = function (iOldCursorX) {
			var iOffset = cursorX - iOldCursorX;
			return this._oMoveInfo.rtl ?  -iOffset : iOffset;
		}.bind(this);

		this._oMoveInfo.offsetFromPreviousPosition = getPositionOffset(this._oMoveInfo.cursorX);
		this._oMoveInfo.offsetFromStartPosition = getPositionOffset(this._oMoveInfo.cursorStartX);
		this._oMoveInfo.cursorX = cursorX;

		if (!this._oMoveInfo.offsetFromStartPosition) {
			return;
		}

		if (!this._oMoveInfo.offsetFromPreviousPosition && !bIsResizeEnd) {
			return;
		}

		var aResizedColumns = getInteractivelyResizedColumns(this._oMoveInfo.separator, this._oMoveInfo.layout, this.getMaxColumnsCount()),
			sSeparator = getSeparatorName(this._oMoveInfo.separator),
			bForwardResizeDirection = this._oMoveInfo.offsetFromStartPosition > 0,
			sColumnEnlargedByDragging = aResizedColumns[bForwardResizeDirection ? 0 : 1],
			sInitiallyHiddenColumn = aResizedColumns.find((sColumn) => this._oMoveInfo.columnWidths[sColumn] === 0),
			iSeparatorsCount = this._getVisibleColumnSeparatorsCount(),
			iSeparatorsCountDiff = 0,
			iOffsetOnSeparatorsCountChange = 0,
			iOffsetOnColumnWidthNormalization,
			sPreviousLayout = this._oMoveInfo.layout,
			sLayout,
			bLayoutChange,
			oNewColumnWidths,
			bResizeWithPinning;

		if (sInitiallyHiddenColumn && sInitiallyHiddenColumn !== sColumnEnlargedByDragging) {
			return; // atempt to resize in direction that is not allowed
		}

		this._oMoveInfo.columnWidths[aResizedColumns[0]] += this._oMoveInfo.offsetFromPreviousPosition;
		this._oMoveInfo.columnWidths[aResizedColumns[1]] -= this._oMoveInfo.offsetFromPreviousPosition;
		this._oMoveInfo.columnEnlargedByDragging = sColumnEnlargedByDragging;

		oNewColumnWidths = merge({}, this._oMoveInfo.columnWidths);

		// if some column is below min allowed width => expand it
		this._normalizeColumnWidths(oNewColumnWidths, aResizedColumns);

		// if normalization led to width change of some column => the column separator will be offset
		iOffsetOnColumnWidthNormalization = this._oMoveInfo.columnWidths[aResizedColumns[1]] - oNewColumnWidths[aResizedColumns[1]];

		// update the dragged separator to match the new mouse/touch position
		this._offsetDraggedColumnSeparator(this._oMoveInfo.offsetFromPreviousPosition + iOffsetOnColumnWidthNormalization);

		// if the user drags to expand a hidden column, show its content
		this._toggleColumnVisibility(sColumnEnlargedByDragging, true);

		sLayout = this._getNextLayoutOnResizeByDrag(oNewColumnWidths, sPreviousLayout, sSeparator, bForwardResizeDirection, bIsResizeEnd);
		bLayoutChange = sLayout !== sPreviousLayout;

		if (bLayoutChange) {
			this._hideShowColumnSeparators(sLayout);
			iSeparatorsCountDiff = iSeparatorsCount - this._getRequiredColumnSeparatorsForLayout(sLayout).length;
			if (iSeparatorsCountDiff) {
				iOffsetOnSeparatorsCountChange = FlexibleColumnLayout.COLUMN_SEPARATOR_WIDTH * iSeparatorsCountDiff;
				oNewColumnWidths.mid += iOffsetOnSeparatorsCountChange;
			}

			bResizeWithPinning = FlexibleColumnLayout.COLUMN_ORDER.some(function(sColumnName) {
				return this._shouldRevealColumn(sColumnName, sLayout, sPreviousLayout)
					|| this._shouldConcealColumn(sColumnName, sLayout, sPreviousLayout);
			}, this);

			oNewColumnWidths = this._mergeColumnWidthsOnInteractiveLayoutChange({
				oldWidths: this._getAllColumnSizesForLayout(sLayout, true),
				newWidths: {
					[aResizedColumns[0]]: oNewColumnWidths[aResizedColumns[0]],
					[aResizedColumns[1]]: oNewColumnWidths[aResizedColumns[1]]
				},
				layout: sLayout,
				columnEnlargedByDragging: sColumnEnlargedByDragging
			});

			this._oMoveInfo.layout = sLayout;
			// allow compute dragging direction relative to the last layout
			this._oMoveInfo.cursorStartX = cursorX;
		}

		this._oMoveInfo.columnWidths = oNewColumnWidths;

		if (bResizeWithPinning || bIsResizeEnd) {
			// call the dedicated function in order to resize with reveal/conceal effect
			// or update CSS classes on resizeEnd
			this._resizeColumns({
				columnWidths: oNewColumnWidths,
				layout: sLayout,
				previousLayout: sPreviousLayout,
				updateMediaCSSClases: bIsResizeEnd,
				updateDetailedActiveClasses: bIsResizeEnd,
				restoreFocusOnBackNavigation: false
			});
		} else {
			// only offset the rendered columns
			// skip mid column as it has width: 100% by default (to allow the mid column
			// take the space that remains after sizing its sibling columns)
			this._$columns.begin.css("width", this._oMoveInfo.columnWidths.begin + "px");
			this._$columns.end.css("width", this._oMoveInfo.columnWidths.end + "px");
			aResizedColumns.forEach(function(sColumn) {
				this._updateColumnContextualSettings(sColumn, this._oMoveInfo.columnWidths[sColumn]);
			}, this);
		}

		if (bLayoutChange) {
			this.fireEvent("_liveStateChange", {
				layout: sLayout,
				maxColumnsCount: this.getMaxColumnsCount()
			});
		}
	};

	/**
	 * Merges the default (or previously saved) column widths [for the given layout]
	 * with the updated column widths upon interactive resize [when the user dragged
	 * the column separators]
	 * @param {object} oOptions the oprions
	 * @param {Object<string,number>} oOptions.oldWidths the default (or previously saved) column widths
	 * for the given layout
	 * @param {Object<string,number>} oOptions.newWidths the new  column widths produced
	 * upon interactive resize, when the user dragged the column separators
	 * @param {sap.f.LayoutType} oOptions.sLayout the layout
	 * @param {"begin"|"mid"|"end"} oOptions.columnEnlargedByDragging the name of the column
	 * enlarged during interactive resize
	 * @returns {Object<string,number>} the merged widths
	 */
	FlexibleColumnLayout.prototype._mergeColumnWidthsOnInteractiveLayoutChange = function (oOptions) {
		var oOldWidths = oOptions.oldWidths,
			oNewWidths = oOptions.newWidths,
			sLayout = oOptions.layout,
			sColumnEnlargedByDragging = oOptions.columnEnlargedByDragging,
			aResizedColumnNames = Object.keys(oNewWidths),
			iAvailableWidth = this._getTotalColumnsWidth(sLayout),
			isFullyVisible = function(sColumn) {
				return oNewWidths[sColumn] >= FlexibleColumnLayout.COLUMN_MIN_WIDTH;
			},
			autosizeMid = function(oColumnWidths) {
				// the mid column takes the remaining space after begin and end are sized
				oColumnWidths.mid = iAvailableWidth - oColumnWidths.begin - oColumnWidths.end;
				return oColumnWidths;
			},
			sColumnToUpdate;

		if (aResizedColumnNames.indexOf("mid") > -1) {
			// the other resized column is either 'begin' or 'end' =>
			// to reflect the update in the widths, it is enough to
			// merge the width of the column closer to the edge ('begin' or 'end')
			// and allow the size of the 'mid' column be the space that is left by the other two columns
			sColumnToUpdate = aResizedColumnNames.find((sColumn) => sColumn !== "mid");
		} else {
			sColumnToUpdate = sColumnEnlargedByDragging; // covers the known cases
		}

		if (!isFullyVisible(sColumnToUpdate)) {
			// this is the case where the user is revealing a column by dragging,
			// but stopped dragging before the full size of the column was reached
			// => complete the user action => render that column in its required width
			// using its previously saved width
			return oOldWidths;
		}

		return autosizeMid(merge(oOldWidths, {
			[sColumnToUpdate]: oNewWidths[sColumnToUpdate]
		}));
	};

	FlexibleColumnLayout.prototype._offsetDraggedColumnSeparator = function (iOffset) {
		this._oMoveInfo.separatorPosition.x += iOffset;
		this._$overlaySeparator.css(this._oMoveInfo.separatorPosition.direction,
			this._oMoveInfo.separatorPosition.x);
	};

	FlexibleColumnLayout.prototype._toggleColumnVisibility = function (sColumn, bShow) {
		this._$columns[sColumn].toggleClass("sapFFCLColumnHidden", !bShow);
		this._$columns[sColumn].toggleClass("sapFFCLColumnActive", bShow);
	};

	/**
	 * Applies predefined contraints to the column widths.
	 * Currently checks if the <code>FlexibleColumnLayout.COLUMN_MIN_WIDTH</code>
	 * constraint is satisfied and corrects the width if not satisfied.
	 * @param {Object<string,number>} oColumnWidths the column widths
	 * @param {array} aVisibleColumns the names of the visible columns
	 */
	FlexibleColumnLayout.prototype._normalizeColumnWidths = function (oColumnWidths, aVisibleColumns) {
		var iVisibleColumnsCount = aVisibleColumns.length;
		if (iVisibleColumnsCount < 2) { // fullscreen case
			return;
		}

		var fnNormalizeColumnWidth = function (sColumn) {
			if (this._isColumnAllowedToHaveBelowMinWidth(sColumn)) {
				return;
			}

			var iOffset = oColumnWidths[sColumn] - FlexibleColumnLayout.COLUMN_MIN_WIDTH,
				sSiblingColumn,
				iSiblingColumnWidth;
			if (iOffset < 0) { // column is smaller than min-width
				oColumnWidths[sColumn] = FlexibleColumnLayout.COLUMN_MIN_WIDTH;
				sSiblingColumn = getSiblingColumn(sColumn);
				iSiblingColumnWidth = oColumnWidths[sSiblingColumn];
				oColumnWidths[sSiblingColumn] = iSiblingColumnWidth - Math.abs(iOffset);
			}
		}.bind(this);

		function getSiblingColumn(sColumn) {
			if (iVisibleColumnsCount === 2) {
				return aVisibleColumns.find(function(sNextColumn) {
					return sNextColumn !== sColumn;
				});
			}
			// all three columns are visible
			if (["begin", "end"].indexOf(sColumn) > -1) {
				return "mid";
			}
			// get sibling for 'mid'
			return (oColumnWidths.begin > oColumnWidths.end) ? "begin" : "end";
		}

		aVisibleColumns.forEach(fnNormalizeColumnWidth);
	};

	/**
	 * Checks if the column is allowed to be displayed with a width smaller then
	 * the minimal required by <code>FlexibleColumnLayout.COLUMN_MIN_WIDTH</code>.
	 *
	 * This is needed only during interactive resize, when a column can temporarily
	 * have a smaller width while the user drags and before the user releases the mouse.
	 * @param {"begin"|"mid"|"end"} sColumn the column name
	 * @returns {boolean} the flag
	 */
	FlexibleColumnLayout.prototype._isColumnAllowedToHaveBelowMinWidth = function (sColumn) {
		if (!this._oMoveInfo) {
			// outside interactive resize the min-width restriction should always be valid
			return false;
		}

		if (sColumn === this._oMoveInfo.columnEnlargedByDragging) {
			// the user us revealing a hidden column by dragging
			// its ajacent separator => do not yet expand the column to min-width
			// untill the user stops dragging, to prevent undesired visual jump
			return true;
		}

		// allow a column NOT adjacent to the dragged column-separator
		// to be indirectly shrinked (needed on tablet upon shifts
		// between ThreeColumnsMidExpanded and ThreeColumnsEndExpanded)
		return !this._isColumnAdjacentToDraggedSeparator(sColumn);
	};

	FlexibleColumnLayout.prototype._convertColumnPercentWidthToPx = function (iPercentWidth, sLayout) {
		if (!iPercentWidth) {
			return 0;
		}

		// Calculate the width available for the columns
		var iAvailableWidth = this._getTotalColumnsWidth(sLayout);

		return Math.round(iAvailableWidth * iPercentWidth / 100);
	};

	FlexibleColumnLayout.prototype._convertColumnPxWidthToPercent = function (vPx, sLayout) {
		if (!vPx) {
			return 0;
		}

		var iAvailableWidth = this._getTotalColumnsWidth(sLayout),
			fnConvert = function(vPx) {
				return vPx / iAvailableWidth * 100;
			};

		if (typeof vPx === "number") {
			return fnConvert(vPx);
		}

		if (typeof vPx === "object") {
			var oColumnPercentWidths = Object.assign({}, vPx);
			Object.keys(oColumnPercentWidths).forEach(function(sColumnName) {
				var iColumnWidth = oColumnPercentWidths[sColumnName];
				if (iColumnWidth) {
					oColumnPercentWidths[sColumnName] = fnConvert(iColumnWidth);
				}
			}, this);
			return oColumnPercentWidths;
		}
		return null;
	};

	FlexibleColumnLayout.prototype._isValidWidthDistributionForLayout = function(sNewWidthsDistribution, sLayout) {
		var aPercentWidths = sNewWidthsDistribution.split("/").map((x) => parseFloat(x)),
			iSum = aPercentWidths.reduce(function(i, sum) {
				return parseFloat(i) + sum;
			}),
			aPxWidths;

		if (Math.round(iSum) !== 100) {
			return false;
		}

		aPxWidths = aPercentWidths.map(function(iPercentWidth) {
			return this._convertColumnPercentWidthToPx(iPercentWidth, sLayout);
		}, this);

		if (aPxWidths.some(function(iPxWidth) {
			return (iPxWidth > 0) && (iPxWidth < FlexibleColumnLayout.COLUMN_MIN_WIDTH);
		})) {
			return false;
		}

		return this._verifyColumnWidthsMatchLayout({
			begin: aPxWidths[0],
			mid: aPxWidths[1],
			end: aPxWidths[2]
		}, sLayout);
	};

	FlexibleColumnLayout.prototype._saveResizedColumWidths = function() {
		var sNewLayout = this._oMoveInfo.layout,
			oColumnPercentWidths = this._convertColumnPxWidthToPercent(this._oMoveInfo.columnWidths, sNewLayout),
			sNewWidthsDistribution = Object.values(oColumnPercentWidths).join("/");

		if (this._isValidWidthDistributionForLayout(sNewWidthsDistribution, sNewLayout)) {
			this._getLocalStorage().put(sNewLayout, sNewWidthsDistribution);
			this._getLocalStorage().put("begin", oColumnPercentWidths.begin);
		}
	};

	FlexibleColumnLayout.prototype._getNextLayoutOnResizeByDrag = function (oColumnWidths,
		sPreviousLayout, sSeparator, bForwardDirection, bResizeEnd) {
			function dragged(oOptions) {
				return oOptions.from === sPreviousLayout &&
					oOptions.separator === sSeparator &&
					oOptions.forward === bForwardDirection;
			}

			var iBeginWidth = oColumnWidths.begin,
				iBeginPercentWidth = Math.ceil(this._convertColumnPxWidthToPercent(iBeginWidth, sPreviousLayout)),
				iMaxColumnsCount = this.getMaxColumnsCount(),
				bTablet = iMaxColumnsCount === 2;

			if (dragged({
				from: LT.TwoColumnsMidExpanded,
				separator: "begin",
				forward: true
			}) && (oColumnWidths.begin >= oColumnWidths.mid)) {
				return LT.TwoColumnsBeginExpanded;
			}

			if (dragged({
				from: LT.TwoColumnsBeginExpanded,
				separator: "begin",
				forward: false
			}) && (oColumnWidths.begin < oColumnWidths.mid)) {
				return LT.TwoColumnsMidExpanded;
			}

			if (dragged({
				from: LT.ThreeColumnsMidExpanded,
				separator: "begin",
				forward: true
			}) && iBeginPercentWidth >= 33) {
				return LT.ThreeColumnsMidExpandedEndHidden;
			}

			if (dragged({
				from: LT.ThreeColumnsMidExpandedEndHidden,
				separator: "begin",
				forward: false
			}) && iBeginPercentWidth < 33) {
				return LT.ThreeColumnsMidExpanded;
			}

			if (dragged({
				from: LT.ThreeColumnsMidExpandedEndHidden,
				separator: "end",
				forward: false
			}) && ((oColumnWidths.end >= FlexibleColumnLayout.COLUMN_MIN_WIDTH) || bResizeEnd)) {
				return LT.ThreeColumnsMidExpanded;
			}

			if (dragged({
				from: LT.ThreeColumnsMidExpanded,
				separator: "end",
				forward: false
			}) && oColumnWidths.mid < oColumnWidths.end) {
				return LT.ThreeColumnsEndExpanded;
			}

			if (dragged({
				from: LT.ThreeColumnsEndExpanded,
				separator: "end",
				forward: true
			}) && oColumnWidths.mid >= oColumnWidths.end) {
				return LT.ThreeColumnsMidExpanded;
			}

			if (dragged({
				from: LT.ThreeColumnsMidExpandedEndHidden,
				separator: "begin",
				forward: true
			}) && oColumnWidths.begin >= oColumnWidths.mid) {
				return LT.ThreeColumnsBeginExpandedEndHidden;
			}

			if (dragged({
				from: LT.ThreeColumnsBeginExpandedEndHidden,
				separator: "begin",
				forward: false
			}) && oColumnWidths.begin < oColumnWidths.mid) {
				return LT.ThreeColumnsMidExpandedEndHidden;
			}

			if (dragged({
				from: LT.ThreeColumnsMidExpanded,
				separator: "begin",
				forward: true
			}) && bTablet && ((iBeginWidth >= FlexibleColumnLayout.COLUMN_MIN_WIDTH) || bResizeEnd)) {
				return LT.ThreeColumnsMidExpandedEndHidden;
			}

			if (dragged({
				from: LT.TwoColumnsMidExpandedEndHidden,
				separator: "end",
				forward: false
			}) && bTablet && ((oColumnWidths.end >= FlexibleColumnLayout.COLUMN_MIN_WIDTH) || bResizeEnd)) {
				return LT.ThreeColumnsMidExpanded;
			}

			return sPreviousLayout; // no layout change
	};

	FlexibleColumnLayout.prototype._verifyColumnWidthsMatchLayout = function (oColumnWidths, sLayout) {
		var iMaxColumnsCount = this.getMaxColumnsCount(),
			iBeginWidth = oColumnWidths.begin,
			iBeginPercentWidth = Math.ceil(this._convertColumnPxWidthToPercent(iBeginWidth, sLayout)),
			oLayoutMatchers =  {
				[LT.TwoColumnsBeginExpanded]: function() {
					return oColumnWidths.begin >= oColumnWidths.mid;
				},
				[LT.TwoColumnsMidExpanded]: function() {
					return oColumnWidths.mid > oColumnWidths.begin;
				},
				[LT.ThreeColumnsEndExpanded]: function() {
					return (oColumnWidths.end > oColumnWidths.mid) && (iBeginPercentWidth < 33);
				},
				[LT.ThreeColumnsBeginExpandedEndHidden]: function() {
					return (oColumnWidths.begin >= oColumnWidths.mid) && oColumnWidths.end === 0;
				},
				[LT.ThreeColumnsMidExpanded]: function() {
					return (oColumnWidths.mid >= oColumnWidths.end) &&
					(((iMaxColumnsCount === 3) && iBeginPercentWidth < 33) // desktop
					|| ((iMaxColumnsCount === 2) && iBeginPercentWidth === 0)); // tablet
				},
				[LT.ThreeColumnsMidExpandedEndHidden]: function() {
					return (oColumnWidths.mid > oColumnWidths.begin) &&
						oColumnWidths.end === 0 &&
						((iMaxColumnsCount === 3 && iBeginPercentWidth >= 33)
						|| (iMaxColumnsCount === 2 && iBeginWidth >= FlexibleColumnLayout.COLUMN_MIN_WIDTH));
				}
			};
		return oLayoutMatchers[sLayout]();
	};

	/**
	 * Obtains the range of the possible possitions along the X-axis of this separator (allowed by the current layout)
	 * where the start of the axis is the edge of the FlexibleColumnLayout closest to the begin column.
	 * @param {object} oSeparator the separator HTML element
	 * @returns {object} the start and end positions
	 */
	FlexibleColumnLayout.prototype._getSeparatorMovementRange = function (oSeparator) {
		var sSeparator = getSeparatorName(oSeparator),
			sLayout = this.getLayout(),
			iMaxColumnsForWidth = this.getMaxColumnsCount(),
			iMaxColumnsForLayoutType = this._getMaxColumnsCountForLayout(sLayout, FlexibleColumnLayout.DESKTOP_BREAKPOINT),
			bDesktop = iMaxColumnsForWidth === 3,
			bTablet = iMaxColumnsForWidth === 2,
			bIsThreeColumnLayout = iMaxColumnsForLayoutType === 3,
			iTotalSpace = this._iWidth,
			iSpaceBeforeRange = FlexibleColumnLayout.COLUMN_MIN_WIDTH, // space for the preceding column
			iSpaceAfterRange = FlexibleColumnLayout.COLUMN_MIN_WIDTH, // space for the suceeding column
			iRangeLength;

		if (bDesktop && sSeparator === "end") {
			// (the width of the 'begin' column is fixed, as the user cannot resize it by moving the 'end' separator)
			iSpaceBeforeRange = this._$columns["begin"].get(0).offsetWidth + FlexibleColumnLayout.COLUMN_MIN_WIDTH; // space for the preceding columns
			if (sLayout === LT.ThreeColumnsMidExpandedEndHidden) {
				iSpaceAfterRange = 0; // the 'end' separator is adjacent to the FCL edge, nothing follows it
			}
		}

		if (bTablet) {
			if (sSeparator === "begin" & bIsThreeColumnLayout) {
				iSpaceBeforeRange = 0; // the 'begin' separator is adjacent to the FCL edge, nothing precedes it
			}
			if (sSeparator === "end" && sLayout === LT.ThreeColumnsMidExpandedEndHidden) {
				iSpaceAfterRange = 0; // the 'end' separator is adjacent to the FCL edge, nothing follows it
			}
		}

		// provision space to render the separator itself
		iSpaceAfterRange += FlexibleColumnLayout.COLUMN_SEPARATOR_WIDTH;

		iRangeLength = iTotalSpace - iSpaceBeforeRange - iSpaceAfterRange;

		return {
			from: iSpaceBeforeRange,
			to: iSpaceBeforeRange + iRangeLength
		};
	};

	FlexibleColumnLayout.prototype._updateAriaPositionInfo = function (oSeparator) {
		// obtain the range [fromX ... toX] of the possible positions along the X-axis
		// of this separator (as allowed by the current layout)
		var oRange = this._getSeparatorMovementRange(oSeparator),
			iRangeLength = oRange.to - oRange.from,
			iSeparatorEarliestPossibleX = oRange.from,
			iSeparatorCurrentX = oSeparator.offsetLeft,
			iSeparatorAdvanceInsideRange = iSeparatorCurrentX - iSeparatorEarliestPossibleX,
			 // convert to value inside [0, ..., 100] interval
			iSeparatorRelativePositionInsideRange = iSeparatorAdvanceInsideRange / iRangeLength * 100,
			sSeparatorRelativePositionInsideRange = iSeparatorRelativePositionInsideRange.toFixed(2);
		oSeparator.setAttribute("aria-valuenow", sSeparatorRelativePositionInsideRange);
	};

	FlexibleColumnLayout.prototype._updateSeparatorsAriaPositionInfo = function () {
		if (!this._oColumnSeparators) {
			return;
		}
		Object.values(this._oColumnSeparators).forEach(function($separator) {
			if ($separator.get(0).style.display !== "none") {
				this._updateAriaPositionInfo($separator.get(0));
			}
		}, this);
	};

	/**
	 * Obtains the current width of a column
	 *
	 * @param {string} sColumn the column name
	 * @private
	 */
	FlexibleColumnLayout.prototype._getColumnWidth = function (sColumn) {
		var oColumn = this._$columns[sColumn].get(0),
			sCssWidth = oColumn.style.width,
			iCssWidth = parseInt(sCssWidth),
			bPercentWidth;

		if (/px$/.test(sCssWidth)) {
			return iCssWidth;
		}

		bPercentWidth = /%$/.test(sCssWidth);
		if (bPercentWidth && (iCssWidth === 100)) {
			return this._getControlWidth();
		}

		if (bPercentWidth && (iCssWidth === 0)) {
			return 0;
		}

		return oColumn.offsetWidth;
	};

	/**
	 * Caches the new width of the column and fires an event if
	 * width changed compared to previous cached value
	 *
	 * @param {string} sColumn the column name
	 * @param {number} iNewWidth the new column width
	 * @private
	 */
	FlexibleColumnLayout.prototype._cacheColumnWidth = function(sColumn, iNewWidth) {
		var oEventColumnInfo;

		if (this._oColumnWidthInfo[sColumn] !== iNewWidth) {
			oEventColumnInfo = {};
			FlexibleColumnLayout.COLUMN_ORDER.forEach(function(sNextColumn) {
				// indicate that the curent column is resized
				oEventColumnInfo[sNextColumn + "Column"] = sNextColumn === sColumn;
			});
			this.fireColumnResize(oEventColumnInfo);
		}

		this._oColumnWidthInfo[sColumn] = iNewWidth;
	};

	/**
	 * Returns the name of the last visible column for the given layout
	 * @param {sap.f.LayoutType} sLayout the layout
	 * @returns {string} the column name
	 */
	FlexibleColumnLayout.prototype._getLastVisibleColumnForLayout = function (sLayout) {
		var aColumns = FlexibleColumnLayout.COLUMN_ORDER.slice(),
			iVisibleColumnsCount = this._getMaxColumnsCountForLayout(sLayout, FlexibleColumnLayout.DESKTOP_BREAKPOINT);
		if (iVisibleColumnsCount > 1) {
			return aColumns[iVisibleColumnsCount - 1];
		}
		if (sLayout === LT.OneColumn) {
			return "begin";
		}
		if (sLayout === LT.MidColumnFullScreen) {
			return "mid";
		}
		if (sLayout === LT.EndColumnFullScreen) {
			return "end";
		}
	};

	FlexibleColumnLayout.prototype._isNavigatingBackward = function (sLayout, sPreviousLayout) {
		return ([LT.MidColumnFullScreen, LT.EndColumnFullScreen].indexOf(sPreviousLayout) > -1) ||
			FlexibleColumnLayout.COLUMN_ORDER.indexOf(this._getLastVisibleColumnForLayout(sPreviousLayout)) >
			FlexibleColumnLayout.COLUMN_ORDER.indexOf(this._getLastVisibleColumnForLayout(sLayout));
	};

	/**
	 *  Decides whether or not a given column should be revealed - another column slide out on top of it).
	 *
	 * @param {"begin"|"mid"|"end"} sColumn the column name
	 * @param {sap.f.LayoutType} sLayout the new layout
	 * @param {sap.f.LayoutType} sPreviousLayout the previous layout
	 * @returns {boolean} the flag
	 * @private
	 */
	FlexibleColumnLayout.prototype._shouldRevealColumn = function (sColumn, sLayout, sPreviousLayout) {
		var iVisibleColumnsCount = this._getMaxColumnsCountForLayout(sLayout, FlexibleColumnLayout.DESKTOP_BREAKPOINT),
			sLastVisibleColumn = this._getLastVisibleColumnForLayout(sLayout),
			bIsLastColumn = sColumn === sLastVisibleColumn,
			sPreviousLastVisibleColumn = this._getLastVisibleColumnForLayout(sPreviousLayout),
			iPreviousVisibleColumnsCount = this._getMaxColumnsCountForLayout(sPreviousLayout, FlexibleColumnLayout.DESKTOP_BREAKPOINT),
			bWasFullScreen = this._isFullScreenLayout(sPreviousLayout),
			bIsFullscreen = this._isFullScreenLayout(sLayout);

		return ((iVisibleColumnsCount > iPreviousVisibleColumnsCount)
			&& !(sPreviousLayout === LT.MidColumnFullScreen || sPreviousLayout === LT.EndColumnFullScreen)
			&& bIsLastColumn
			|| (bWasFullScreen && bIsFullscreen && sPreviousLastVisibleColumn !== sColumn && bIsLastColumn));
	};

	FlexibleColumnLayout.prototype._isFullScreenLayout = function (sLayout) {
		return sLayout === LT.OneColumn || sLayout === LT.MidColumnFullScreen || sLayout === LT.EndColumnFullScreen;
	};

	FlexibleColumnLayout.prototype._isInteractivelyResizedColumn = function (sColumn) {
		return this._oMoveInfo && this._isColumnAdjacentToDraggedSeparator(sColumn);
	};

	FlexibleColumnLayout.prototype._isColumnAdjacentToDraggedSeparator = function (sColumn) {
		return this._oMoveInfo &&
			this._oMoveInfo.separator &&
			(this._$columns[sColumn][0] === this._oMoveInfo.separator.previousElementSibling ||
			 this._$columns[sColumn][0] === this._oMoveInfo.separator.nextElementSibling);
	};

	/**
	 * Decides whether or not a given column should be concealed - another column should slide in on top of it.
	 *
	 * @param {"begin"|"mid"|"end"} sColumn the column name
	 * @param {sap.f.LayoutType} sLayout the new layout
	 * @param {sap.f.LayoutType} sPreviousLayout the previous layout
	 * @returns {boolean} the flag
	 * @private
	 */
	FlexibleColumnLayout.prototype._shouldConcealColumn = function (sColumn, sLayout, sPreviousLayout) {
		var iVisibleColumnsCount = this._getMaxColumnsCountForLayout(sLayout, FlexibleColumnLayout.DESKTOP_BREAKPOINT),
			iPreviousVisibleColumnsCount = this._getMaxColumnsCountForLayout(sPreviousLayout, FlexibleColumnLayout.DESKTOP_BREAKPOINT),
			sPreviousLastVisibleColumn = this._getLastVisibleColumnForLayout(sPreviousLayout),
			sLastVisibleColumn = this._getLastVisibleColumnForLayout(sLayout),
			bWasFullScreen = this._isFullScreenLayout(sPreviousLayout),
			bIsFullscreen = this._isFullScreenLayout(sLayout);

		return ((iVisibleColumnsCount < iPreviousVisibleColumnsCount
			&& sColumn === sPreviousLastVisibleColumn
			&& !(sPreviousLayout === LT.MidColumnFullScreen || sPreviousLayout === LT.EndColumnFullScreen)
			&& this._getColumnSizeForLayout(sColumn, sLayout) === 0)
			|| (bWasFullScreen && bIsFullscreen && sColumn !== sLastVisibleColumn && sPreviousLastVisibleColumn === sColumn));
	};

	/**
	 * Checks if a column can be resized with an animation
	 *
	 * @param {"begin"|"mid"|"end"} sColumn the column name
	 * @param {object} oOptions the column resize options
	 * @param {number} oOptions.width the column width in px
	 * @param {boolean} oOptions.hasAnimations if animations are enabled
	 * @param {boolean} oOptions.hidden if the column has 0 width (as it is not required
	 * to be shown by the current layout)
	 * @param {boolean} oOptions.previousAnimationCompleted if the previous resize animation
	 * fuly completed before staring the current one
	 * @returns {boolean} the flag
	 * @private
	 */
	FlexibleColumnLayout.prototype._canResizeColumnWithAnimation = function(sColumn, oOptions) {
		var oColumn,
			iNewWidth = oOptions.width,
			bHasAnimations = oOptions.hasAnimations,
			bHidden = oOptions.hidden,
			bWasPartiallyResized = !oOptions.previousAnimationCompleted;

		if (!bHasAnimations || bHidden) {
			return false;
		}

		if (this._isInteractivelyResizedColumn(sColumn)) { // user is dragging to resize it
			return false;
		}

		oColumn = this._$columns[sColumn];
		if (bWasPartiallyResized) {
			return oColumn.width() !== iNewWidth;
		}

		if (this._bNeverRendered || oOptions.autoSize) {
			return false; // initial rendering or autosized
		}

		return this._getColumnWidth(sColumn) !== iNewWidth;
	};

	/**
	 * Contextual settings should not be propagated to the nav containers. They only get contextual settings on resize.
	 *
	 * @private
	 */
	FlexibleColumnLayout.prototype._propagateContextualSettings = function () {};

	FlexibleColumnLayout.prototype._updateColumnContextualSettings = function (sColumn, iWidth) {
		var oColumn,
			oContextualSettings;

		oColumn = this.getAggregation("_" + sColumn + "ColumnNav");
		if (!oColumn) {
			return;
		}

		oContextualSettings = oColumn._getContextualSettings();
		if (!oContextualSettings || oContextualSettings.contextualWidth !== iWidth) {
			oColumn._applyContextualSettings({
				contextualWidth: iWidth
			});
		}
	};


	FlexibleColumnLayout.prototype._updateColumnCSSClasses = function (sColumn, iWidth) {
		var sNewClassName = "";

		this._$columns[sColumn].removeClass("sapUiContainer-Narrow sapUiContainer-Medium sapUiContainer-Wide sapUiContainer-ExtraWide");
		if (iWidth < Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[0]) {
			sNewClassName = "Narrow";
		} else if (iWidth < Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[1]) {
			sNewClassName = "Medium";
		} else if (iWidth < Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[2]) {
			sNewClassName = "Wide";
		} else {
			sNewClassName = "ExtraWide";
		}

		this._$columns[sColumn].addClass("sapUiContainer-" + sNewClassName);
	};

	/**
	 * Gets the size (in %) of a column based on the current layout
	 * @param {"begin"|"mid"|"end"} sColumn - string: begin/mid/end
	 * @param {sap.f.LayoutType} sLayout the layout
	 * @returns {number} the size
	 * @private
	 */
	FlexibleColumnLayout.prototype._getColumnSizeForLayout = function (sColumn, sLayout) {
		var sColumnWidthDistribution = this._getColumnWidthDistributionForLayout(sLayout),
			aSizes = sColumnWidthDistribution.split("/"),
			aMap = {
				begin: 0,
				mid: 1,
				end: 2
			},
			sSize = aSizes[aMap[sColumn]];

		return parseFloat(sSize);
	};



	/**
	 * Returns the maximum number of columns that can be displayed at once based on the control width
	 * @returns {number} The maximum number of columns
	 * @public
	 */
	FlexibleColumnLayout.prototype.getMaxColumnsCount = function () {
		return this._getMaxColumnsCountForWidth(this._getControlWidth());
	};

	/**
	 * Returns the maximum number of columns that can be displayed at once for a certain control width
	 * @param {int} iWidth
	 * @returns {number}
	 * @private
	 */
	FlexibleColumnLayout.prototype._getMaxColumnsCountForWidth = function (iWidth) {
		if (iWidth >= FlexibleColumnLayout.DESKTOP_BREAKPOINT) {
			return 3;
		}

		if (iWidth >= FlexibleColumnLayout.TABLET_BREAKPOINT && iWidth < FlexibleColumnLayout.DESKTOP_BREAKPOINT) {
			return 2;
		}

		if (iWidth > 0) {
			return 1;
		}

		return 0;
	};

	/**
	 * Returns the maximum number of columns that can be displayed for given layout and control width.
	 * @param {sap.f.LayoutType} sLayout the layout
	 * @param {int} iWidth the <code>sap.f.FlexibleColumnLayout</code> control width
	 * @returns {number} the count
	 * @private
	 */
	FlexibleColumnLayout.prototype._getMaxColumnsCountForLayout = function (sLayout, iWidth) {
		var iColumnCount = this._getMaxColumnsCountForWidth(iWidth),
			sColumnWidthDistribution = this._getColumnWidthDistributionForLayout(sLayout, false, iColumnCount),
			aSizes = sColumnWidthDistribution.split("/"),
			aMap = {
				begin: 0,
				mid: 1,
				end: 2
			},
			sSize,
			iSize,
			iCount = 0;

		Object.keys(aMap).forEach(function(sColumn) {
			sSize = aSizes[aMap[sColumn]];
			iSize = parseInt(sSize);
			if (iSize) {
				iCount++;
			}
		});

		return iCount;
	};

	FlexibleColumnLayout.prototype._onResize = function (oEvent) {
		var iOldWidth = oEvent.oldSize.width,
			iNewWidth = oEvent.size.width,
			iOldMaxColumnsCount,
			iMaxColumnsCount;

		this._iWidth = iNewWidth;

		// If the control is resized to 0, don't do anything
		if (iNewWidth === 0) {
			return;
		}

		iOldMaxColumnsCount = this._getMaxColumnsCountForWidth(iOldWidth);
		iMaxColumnsCount = this._getMaxColumnsCountForWidth(iNewWidth);

		// Always resize the columns when the browser is resized
		this._resizeColumns();

		// only fire the event if the maximum number of columns that can be shown has changed
		if (iMaxColumnsCount !== iOldMaxColumnsCount) {
			this._fireStateChange(false, true);
		}
	};

	/**
	 * Sets a flag if the given <code>NavContainers</code> has pages rendered in DOM
	 * @param sId the container Id
	 * @param {boolean} bHasPages flag
	 * @private
	 */
	FlexibleColumnLayout.prototype._setColumnPagesRendered = function (sId, bHasPages) {
		this._oRenderedColumnPagesBoolMap[sId] = bHasPages;
	};

	/**
	 * Checks if any of the internal <code>NavContainer</code> instances has pages rendered in DOM
	 * @returns {boolean}
	 * @private
	 */
	FlexibleColumnLayout.prototype._hasAnyColumnPagesRendered = function () {
		return Object.keys(this._oRenderedColumnPagesBoolMap).some(function(sKey) {
			return this._oRenderedColumnPagesBoolMap[sKey];
		}, this);
	};

	/**
	 * Obtains the names of the required column separators for the given layout.
	 * @param {string} sLayout the layout
	 * @returns {array} the names of the required separators
	 * @private
	 */
	FlexibleColumnLayout.prototype._getRequiredColumnSeparatorsForLayout = function (sLayout) {
		var oMap = {},
			aNeededSeparators = [],
			iMaxColumnsCount;

		if (Device.system.phone) {
			return [];
		}

		iMaxColumnsCount = this.getMaxColumnsCount();

		// Only show separators if 2 or 3 columns can be displayed at a time
		if (iMaxColumnsCount > 1) {
			oMap[LT.TwoColumnsBeginExpanded] = ["begin"];
			oMap[LT.TwoColumnsMidExpanded] = ["begin"];
			oMap[LT.ThreeColumnsMidExpanded] = ["begin", "end"];
			oMap[LT.ThreeColumnsEndExpanded] = ["end"];
			oMap[LT.ThreeColumnsMidExpandedEndHidden] = ["begin", "end"];
			oMap[LT.ThreeColumnsBeginExpandedEndHidden] = ["begin"];

			if (typeof oMap[sLayout] === "object") {
				aNeededSeparators = oMap[sLayout];
			}
		}

		return aNeededSeparators;
	};

	/**
	 * Updates the visibility of the column separators according to the given layout.
	 * @param {string} [sLayout] the layout. If not provided, the current layout is taken
	 * @private
	 */
	FlexibleColumnLayout.prototype._hideShowColumnSeparators = function (sLayout) {
		var aNeededSeparators = [],
			bIsNavContainersContentRendered;

		// Stop here if the control isn't rendered yet or in phone mode, where separators aren't necessary
		if (!this.isActive() || Device.system.phone) {
			return;
		}

		sLayout || (sLayout = this.getLayout());

		aNeededSeparators = this._getRequiredColumnSeparatorsForLayout(sLayout);

		bIsNavContainersContentRendered = this._hasAnyColumnPagesRendered();

		Object.keys(this._oColumnSeparators).forEach(function (key) {
			this._toggleSeparator(key, aNeededSeparators.indexOf(key) !== -1, bIsNavContainersContentRendered);
		}, this);
	};

	/**
	 * Changes the visibility of a separator.
	 * @param {string} sKey, the separator name
	 * @param {boolean} bShow
	 * @param {boolean} bReveal
	 * @private
	 */
	FlexibleColumnLayout.prototype._toggleSeparator = function (sKey, bShow, bReveal) {
		this._oColumnSeparators[sKey].toggle(bShow && bReveal);
		this._oColumnSeparators[sKey].data("visible", bShow);
	};

	FlexibleColumnLayout.prototype._fireStateChange = function (bIsColumnSeparatorInteraction, bIsResize) {

		// The event should not be fired if the control has zero width as all relevant layout calculations are size-based
		if (this._getControlWidth() === 0) {
			return;
		}

		this.fireStateChange({
			isNavigationArrow: bIsColumnSeparatorInteraction,
			isResize: bIsResize,
			layout: this.getLayout(),
			maxColumnsCount: this.getMaxColumnsCount()
		});
	};


	// Association proxies

	FlexibleColumnLayout.prototype.setInitialBeginColumnPage = function(sPage) {
		this._getBeginColumn().setInitialPage(sPage);
		this.setAssociation('initialBeginColumnPage', sPage, true);
		return this;
	};

	FlexibleColumnLayout.prototype.setInitialMidColumnPage = function(sPage) {
		this._getMidColumn().setInitialPage(sPage);
		this.setAssociation('initialMidColumnPage', sPage, true);
		return this;
	};

	FlexibleColumnLayout.prototype.setInitialEndColumnPage = function(sPage) {
		this._getEndColumn().setInitialPage(sPage);
		this.setAssociation('initialEndColumnPage', sPage, true);
		return this;
	};


	//**************************************************************
	//* START - Public methods
	//**************************************************************


	/**
	 * Navigates to the given page inside the FlexibleColumnLayout.
	 * Columns are scanned for the page in the following order: <code>Begin</code>, <code>Mid</code>, <code>End</code>.
	 *
	 * @param {string} sPageId
	 *         The screen to which we are navigating to. The ID or the control itself can be given.
	 * @param {string} [sTransitionName=slide]
	 *         The type of the transition/animation to apply. Options are: "slide" (horizontal movement from the right), "fade", "flip", and "show"
	 *         and the names of any registered custom transitions.
	 *
	 *         None of the standard transitions is currently making use of any given transition parameters.
	 * @param {object} oData
	 *         This optional object can carry any payload data which should be made available to the target page. The BeforeShow event on the target page will contain this data object as data property.
	 *
	 *         Use case: in scenarios where the entity triggering the navigation can or should not directly initialize the target page, it can fill this object and the target page itself (or a listener on it) can take over the initialization, using the given data.
	 *
	 *         When the transitionParameters object is used, this "data" object must also be given (either as object or as null) in order to have a proper parameter order.
	 * @param {object} oTransitionParameters
	 *         This optional object can contain additional information for the transition function, like the DOM element which triggered the transition or the desired transition duration.
	 *
	 *         For a proper parameter order, the "data" parameter must be given when the transitionParameters parameter is used (it can be given as "null").
	 *
	 *         NOTE: It depends on the transition function how the object should be structured and which parameters are actually used to influence the transition.
	 *         The "show", "slide" and "fade" transitions do not use any parameter.
	 * @public
	 * @returns {this} The <code>sap.f.FlexibleColumnLayout</code> instance
	 */
	FlexibleColumnLayout.prototype.to = function(sPageId, sTransitionName, oData, oTransitionParameters) {
		if (this._getBeginColumn().getPage(sPageId)) {
			this._getBeginColumn().to(sPageId, sTransitionName, oData, oTransitionParameters);
		} else if (this._getMidColumn().getPage(sPageId)) {
			this._getMidColumn().to(sPageId, sTransitionName, oData, oTransitionParameters);
		} else {
			this._getEndColumn().to(sPageId, sTransitionName, oData, oTransitionParameters);
		}

		return this;
	};

	/**
	 * Navigates back to a page in the <code>FlexibleColumnLayout</code>.
	 * Columns are scanned for the page in the following order: <code>Begin</code>, <code>Mid</code>, <code>End</code>.
	 *
	 * Calling this navigation method, first triggers the (cancelable) navigate event on the SplitContainer,
	 * then the BeforeHide pseudo event on the source page, BeforeFirstShow (if applicable),
	 * and BeforeShow on the target page. Later, after the transition has completed,
	 * the AfterShow pseudo event is triggered on the target page and AfterHide - on the page, which has been left.
	 * The given backData object is available in the BeforeFirstShow, BeforeShow, and AfterShow event objects as data
	 * property. The original "data" object from the "to" navigation is also available in these event objects.
	 *
	 * @param {string} sPageId
	 *         The screen to which is being navigated to. The ID or the control itself can be given.
	 * @param {object} oBackData
	 *         This optional object can carry any payload data which should be made available to the target page of the back navigation.
	 *         The event on the target page will contain this data object as backData property. (the original data from the to() navigation will still be available as data property).
	 *
	 *         In scenarios, where the entity triggering the navigation can't or shouldn't directly initialize the target page, it can fill this object and the target page itself (or a listener on it) can take over the initialization, using the given data.
	 *         For back navigation this can be used, for example, when returning from a detail page to transfer any settings done there.
	 *
	 *         When the transitionParameters object is used, this data object must also be given (either as object or as null) in order to have a proper parameter order.
	 * @param {object} oTransitionParameters
	 *         This optional object can give additional information to the transition function, like the DOM element, which triggered the transition or the desired transition duration.
	 *         The animation type can NOT be selected here - it is always the inverse of the "to" navigation.
	 *
	 *         In order to use the transitionParameters property, the data property must be used (at least "null" must be given) for a proper parameter order.
	 *
	 *         NOTE: it depends on the transition function how the object should be structured and which parameters are actually used to influence the transition.
	 * @public
	 * @returns {this} The <code>sap.f.FlexibleColumnLayout</code> instance
	 */
	FlexibleColumnLayout.prototype.backToPage = function(sPageId, oBackData, oTransitionParameters) {
		if (this._getBeginColumn().getPage(sPageId)) {
			this._getBeginColumn().backToPage(sPageId, oBackData, oTransitionParameters);
		} else if (this._getMidColumn().getPage(sPageId)) {
			this._getMidColumn().backToPage(sPageId, oBackData, oTransitionParameters);
		} else {
			this._getEndColumn().backToPage(sPageId, oBackData, oTransitionParameters);
		}

		return this;
	};

	/**
	 * Proxy to the _safeBackToPage methods of the internal nav containers
	 * @param pageId
	 * @param transitionName
	 * @param backData
	 * @param oTransitionParameters
	 * @private
	 */
	FlexibleColumnLayout.prototype._safeBackToPage = function(pageId, transitionName, backData, oTransitionParameters) {
		if (this._getBeginColumn().getPage(pageId)) {
			this._getBeginColumn()._safeBackToPage(pageId, transitionName, backData, oTransitionParameters);
		} else if (this._getMidColumn().getPage(pageId)) {
			this._getMidColumn()._safeBackToPage(pageId, transitionName, backData, oTransitionParameters);
		} else {
			this._getEndColumn()._safeBackToPage(pageId, transitionName, backData, oTransitionParameters);
		}
	};

	/**
	 * Navigates to a given Begin column page.
	 *
	 * @param {string} sPageId
	 *         The screen to which drilldown should happen. The ID or the control itself can be given.
	 * @param {string} [sTransitionName=slide]
	 *         The type of the transition/animation to apply. Options are: "slide" (horizontal movement from the right), "fade", "flip", and "show"
	 *         and the names of any registered custom transitions.
	 *
	 *         None of the standard transitions is currently making use of any given transition parameters.
	 * @param {object} oData
	 *         This optional object can carry any payload data which should be made available to the target page. The BeforeShow event on the target page will contain this data object as data property.
	 *
	 *         Use case: in scenarios where the entity triggering the navigation can't or shouldn't directly initialize the target page, it can fill this object and the target page itself (or a listener on it) can take over the initialization, using the given data.
	 *
	 *         When the transitionParameters object is used, this data object must also be given (either as object or as null) in order to have a proper parameter order.
	 * @param {object} oTransitionParameters
	 *         This optional object can contain additional information for the transition function, like the DOM element, which triggered the transition or the desired transition duration.
	 *
	 *         For a proper parameter order, the data parameter must be given when the transitionParameters parameter is used (it can be given as "null").
	 *
	 *         NOTE: it depends on the transition function how the object should be structured and which parameters are actually used to influence the transition.
	 *         The "show", "slide" and "fade" transitions do not use any parameter.
	 * @public
	 * @returns {this} The <code>sap.f.FlexibleColumnLayout</code> instance
	 */
	FlexibleColumnLayout.prototype.toBeginColumnPage = function(sPageId, sTransitionName, oData, oTransitionParameters) {
		this._getBeginColumn().to(sPageId, sTransitionName, oData, oTransitionParameters);
		return this;
	};

	/**
	 * Navigates to a given Mid column page.
	 *
	 * @param {string} sPageId
	 *         The screen to which drilldown should happen. The ID or the control itself can be given.
	 * @param {string} [sTransitionName=slide]
	 *         The type of the transition/animation to apply. Options are: "slide" (horizontal movement from the right), "fade", "flip", and "show"
	 *         and the names of any registered custom transitions.
	 *
	 *         None of the standard transitions is currently making use of any given transition parameters.
	 * @param {object} oData
	 *         This optional object can carry any payload data which should be made available to the target page. The BeforeShow event on the target page will contain this data object as data property.
	 *
	 *         Use case: in scenarios where the entity triggering the navigation can't or shouldn't directly initialize the target page, it can fill this object and the target page itself (or a listener on it) can take over the initialization, using the given data.
	 *
	 *         When the transitionParameters object is used, this data object must also be given (either as object or as null) in order to have a proper parameter order.
	 * @param {object} oTransitionParameters
	 *         This optional object can contain additional information for the transition function, like the DOM element, which triggered the transition or the desired transition duration.
	 *
	 *         For a proper parameter order, the data parameter must be given when the transitionParameters parameter is used (it can be given as "null").
	 *
	 *         NOTE: it depends on the transition function how the object should be structured and which parameters are actually used to influence the transition.
	 *         The "show", "slide" and "fade" transitions do not use any parameter.
	 * @public
	 * @returns {this} The <code>sap.f.FlexibleColumnLayout</code> instance
	 */
	FlexibleColumnLayout.prototype.toMidColumnPage = function(sPageId, sTransitionName, oData, oTransitionParameters) {
		this._getMidColumn().to(sPageId, sTransitionName, oData, oTransitionParameters);
		return this;
	};

	/**
	 * Navigates to a given End column page.
	 *
	 * @param {string} sPageId
	 *         The screen to which drilldown should happen. The ID or the control itself can be given.
	 * @param {string} [sTransitionName=slide]
	 *         The type of the transition/animation to apply. Options are: "slide" (horizontal movement from the right), "fade", "flip", and "show"
	 *         and the names of any registered custom transitions.
	 *
	 *         None of the standard transitions is currently making use of any given transition parameters.
	 * @param {object} oData
	 *         This optional object can carry any payload data which should be made available to the target page. The BeforeShow event on the target page will contain this data object as data property.
	 *
	 *         Use case: in scenarios where the entity triggering the navigation can't or shouldn't directly initialize the target page, it can fill this object and the target page itself (or a listener on it) can take over the initialization, using the given data.
	 *
	 *         When the transitionParameters object is used, this data object must also be given (either as object or as null) in order to have a proper parameter order.
	 * @param {object} oTransitionParameters
	 *         This optional object can contain additional information for the transition function, like the DOM element, which triggered the transition or the desired transition duration.
	 *
	 *         For a proper parameter order, the data parameter must be given when the transitionParameters parameter is used (it can be given as "null").
	 *
	 *         NOTE: it depends on the transition function how the object should be structured and which parameters are actually used to influence the transition.
	 *         The "show", "slide" and "fade" transitions do not use any parameter.
	 * @public
	 * @returns {this} The <code>sap.f.FlexibleColumnLayout</code> instance
	 */
	FlexibleColumnLayout.prototype.toEndColumnPage = function(sPageId, sTransitionName, oData, oTransitionParameters) {
		this._getEndColumn().to(sPageId, sTransitionName, oData, oTransitionParameters);
		return this;
	};

	FlexibleColumnLayout.prototype.backBeginColumn = function(backData, oTransitionParameters) {
		return this._getBeginColumn().back(backData, oTransitionParameters);
	};

	FlexibleColumnLayout.prototype.backMidColumn = function(backData, oTransitionParameters) {
		return this._getMidColumn().back(backData, oTransitionParameters);
	};

	FlexibleColumnLayout.prototype.backEndColumn = function(backData, oTransitionParameters) {
		return this._getEndColumn().back(backData, oTransitionParameters);
	};

	FlexibleColumnLayout.prototype.backBeginColumnToPage = function(pageId, backData, oTransitionParameters) {
		return this._getBeginColumn().backToPage(pageId, backData, oTransitionParameters);
	};

	FlexibleColumnLayout.prototype.backMidColumnToPage = function(pageId, backData, oTransitionParameters) {
		return this._getMidColumn().backToPage(pageId, backData, oTransitionParameters);
	};

	FlexibleColumnLayout.prototype.backEndColumnToPage = function(pageId, backData, oTransitionParameters) {
		return this._getEndColumn().backToPage(pageId, backData, oTransitionParameters);
	};

	/**
	 * Navigates back to the initial/top level of Begin column (this is the element aggregated as "initialPage", or the first added element).
	 * NOTE: If already on the initial page, nothing happens.
	 * The transition effect which had been used to get to the current page is inverted and used for this navigation.
	 *
	 * @param {object} oBackData
	 *         This optional object can carry any payload data which should be made available to the target page of the back navigation. The event on the target page will contain this data object as "backData" property. (The original data from the "to()" navigation will still be available as "data" property.)
	 *
	 *         In scenarios where the entity triggering the navigation can or should not directly initialize the target page, it can fill this object and the target page itself (or a listener on it) can take over the initialization, using the given data.
	 *         For back navigation this can be used e.g. when returning from a detail page to transfer any settings done there.
	 *
	 *         When the "transitionParameters" object is used, this "data" object must also be given (either as object or as null) in order to have a proper parameter order.
	 * @param {object} oTransitionParameters
	 *         This optional object can give additional information to the transition function, like the DOM element which triggered the transition or the desired transition duration.
	 *         The animation type can NOT be selected here - it is always the inverse of the "to" navigation.
	 *
	 *         In order to use the transitionParameters property, the data property must be used (at least "null" must be given) for a proper parameter order.
	 *
	 *         NOTE: it depends on the transition function how the object should be structured and which parameters are actually used to influence the transition.
	 * @public
	 * @returns {this} The <code>sap.f.FlexibleColumnLayout</code> instance
	 */
	FlexibleColumnLayout.prototype.backToTopBeginColumn = function(oBackData, oTransitionParameters) {
		this._getBeginColumn().backToTop(oBackData, oTransitionParameters);
		return this;
	};

	/**
	 * Navigates back to the initial/top level of Mid column (this is the element aggregated as "initialPage", or the first added element).
	 * NOTE: If already on the initial page, nothing happens.
	 * The transition effect which had been used to get to the current page is inverted and used for this navigation.
	 *
	 * @param {object} oBackData
	 *         This optional object can carry any payload data which should be made available to the target page of the back navigation. The event on the target page will contain this data object as "backData" property. (The original data from the "to()" navigation will still be available as "data" property.)
	 *
	 *         In scenarios where the entity triggering the navigation can or should not directly initialize the target page, it can fill this object and the target page itself (or a listener on it) can take over the initialization, using the given data.
	 *         For back navigation this can be used e.g. when returning from a detail page to transfer any settings done there.
	 *
	 *         When the "transitionParameters" object is used, this "data" object must also be given (either as object or as null) in order to have a proper parameter order.
	 * @param {object} oTransitionParameters
	 *         This optional object can give additional information to the transition function, like the DOM element which triggered the transition or the desired transition duration.
	 *         The animation type can NOT be selected here - it is always the inverse of the "to" navigation.
	 *
	 *         In order to use the transitionParameters property, the data property must be used (at least "null" must be given) for a proper parameter order.
	 *
	 *         NOTE: it depends on the transition function how the object should be structured and which parameters are actually used to influence the transition.
	 * @public
	 * @returns {this} The <code>sap.f.FlexibleColumnLayout</code> instance
	 */
	FlexibleColumnLayout.prototype.backToTopMidColumn = function(oBackData, oTransitionParameters) {
		this._getMidColumn().backToTop(oBackData, oTransitionParameters);
		return this;
	};


	/**
	 * Navigates back to the initial/top level of End column (this is the element aggregated as "initialPage", or the first added element).
	 * NOTE: If already on the initial page, nothing happens.
	 * The transition effect which had been used to get to the current page is inverted and used for this navigation.
	 *
	 * @param {object} oBackData
	 *         This optional object can carry any payload data which should be made available to the target page of the back navigation. The event on the target page will contain this data object as "backData" property. (The original data from the "to()" navigation will still be available as "data" property.)
	 *
	 *         In scenarios where the entity triggering the navigation can or should not directly initialize the target page, it can fill this object and the target page itself (or a listener on it) can take over the initialization, using the given data.
	 *         For back navigation this can be used e.g. when returning from a detail page to transfer any settings done there.
	 *
	 *         When the "transitionParameters" object is used, this "data" object must also be given (either as object or as null) in order to have a proper parameter order.
	 * @param {object} oTransitionParameters
	 *         This optional object can give additional information to the transition function, like the DOM element which triggered the transition or the desired transition duration.
	 *         The animation type can NOT be selected here - it is always the inverse of the "to" navigation.
	 *
	 *         In order to use the transitionParameters property, the data property must be used (at least "null" must be given) for a proper parameter order.
	 *
	 *         NOTE: it depends on the transition function how the object should be structured and which parameters are actually used to influence the transition.
	 * @public
	 * @returns {this} The <code>sap.f.FlexibleColumnLayout</code> instance
	 */
	FlexibleColumnLayout.prototype.backToTopEndColumn = function(oBackData, oTransitionParameters) {
		this._getEndColumn().backToTop(oBackData, oTransitionParameters);
		return this;
	};

	/**
	 * Returns the currently displayed Begin column page.
	 *
	 * @public
	 * @returns {sap.ui.core.Control} The UI5 control in the Begin column
	 */
	FlexibleColumnLayout.prototype.getCurrentBeginColumnPage = function() {
		return this._getBeginColumn().getCurrentPage();
	};

	/**
	 * Returns the currently displayed Mid column page.
	 *
	 * @public
	 * @returns {sap.ui.core.Control} The UI5 control in the Mid column
	 */
	FlexibleColumnLayout.prototype.getCurrentMidColumnPage = function() {
		return this._getMidColumn().getCurrentPage();
	};

	/**
	 * Returns the currently displayed End column page.
	 *
	 * @public
	 * @returns {sap.ui.core.Control} The UI5 control in the End column
	 */
	FlexibleColumnLayout.prototype.getCurrentEndColumnPage = function() {
		return this._getEndColumn().getCurrentPage();
	};

	FlexibleColumnLayout.prototype.setDefaultTransitionNameBeginColumn = function(sTransition) {
		this.setProperty("defaultTransitionNameBeginColumn", sTransition, true);
		this._getBeginColumn().setDefaultTransitionName(sTransition);
		return this;
	};

	FlexibleColumnLayout.prototype.setDefaultTransitionNameMidColumn = function(sTransition) {
		this.setProperty("defaultTransitionNameMidColumn", sTransition, true);
		this._getMidColumn().setDefaultTransitionName(sTransition);
		return this;
	};

	FlexibleColumnLayout.prototype.setDefaultTransitionNameEndColumn = function(sTransition) {
		this.setProperty("defaultTransitionNameEndColumn", sTransition, true);
		this._getEndColumn().setDefaultTransitionName(sTransition);
		return this;
	};

	//******************************************************** PROTECTED MEMBERS **************************************/

	/**
	 * Returns the layout history object
	 * @returns {sap.f.FlexibleColumnLayout.LayoutHistory}
	 * @private
	 * @ui5-restricted sap.f.FlexibleColumnLayoutSemanticHelper
	 */
	FlexibleColumnLayout.prototype._getLayoutHistory = function () {
		return this._oLayoutHistory;
	};

	/**
	 * Returns a string, representing the relative percentage sizes of the columns for the given layout in the format "begin/mid/end" (f.e. "33/67/0")
	 * @param {string} sLayout - the layout
	 * @param {boolean} bAsIntArray - return an array in the format [33, 67, 0] instead of a string "33/67/0"
	 * @param {number} [iMaxColumnsCount] the maximun number of columns. If not provided, the result of
	 * <code>getMaxColumnsCount</code> will be taken
	 * @returns {string|array}
	 * @private
	 * @ui5-restricted sap.f.FlexibleColumnLayoutSemanticHelper
	 */
	FlexibleColumnLayout.prototype._getColumnWidthDistributionForLayout = function (sLayout, bAsIntArray, iMaxColumnsCount) {
		var sColumnWidthDistribution = this._getLocalStorage(iMaxColumnsCount).get(sLayout),
			iBeginWidth = this._getLocalStorage(iMaxColumnsCount).get("begin"),
			vResult,
			vResultAsArray;

		iMaxColumnsCount || (iMaxColumnsCount = this.getMaxColumnsCount());

		if (iMaxColumnsCount === 0) {

			vResult = "0/0/0";

		} else if (iMaxColumnsCount > 1
			&& sColumnWidthDistribution) {
			vResult = sColumnWidthDistribution;
		} else {
			vResult = this._getDefaultColumnWidthDistributionForLayout(sLayout, iMaxColumnsCount);
		}

		vResultAsArray = vResult.split("/");

		iBeginWidth = normalizeBeginColumnWidth(iBeginWidth, sLayout);

		// Used stored begin column width, if not fullscreen layout and the begin column should be shown
		if (iBeginWidth && !this._isFullScreenLayout(sLayout) && parseInt(vResultAsArray[0]) !== 0) {
			vResultAsArray[0] = iBeginWidth;
			vResultAsArray = vResultAsArray.map(function (sColumnWidth) {
				return parseFloat(sColumnWidth);
			});
			normalizeColumnPercentWidths(vResultAsArray);
		}

		if (bAsIntArray) {
			vResult = vResultAsArray.map(function (sColumnWidth) {
				return Math.round(parseFloat(sColumnWidth));
			});
			normalizeColumnPercentWidths(vResult);
		}

		if (bAsIntArray) {
			return vResult;
		} else {
			return vResultAsArray.join("/");
		}
	};

	/**
	 * Returns a string, representing the default relative percentage sizes of the columns
	 * for the given layout
	 * @param {sap.f.LayoutType} sLayout the layout
	 * @param {number} iMaxColumnsCount the maximun available number of columns
	 * @returns {string} a representation in the format "begin/mid/end" (f.e. "33/67/0")
	 */
	FlexibleColumnLayout.prototype._getDefaultColumnWidthDistributionForLayout = function (sLayout, iMaxColumnsCount) {
		var oMap = {};
		// Layouts with the same distribution for all cases
		oMap[LT.OneColumn] = "100/0/0";
		oMap[LT.MidColumnFullScreen] = "0/100/0";
		oMap[LT.EndColumnFullScreen] = "0/0/100";

		if (iMaxColumnsCount === 1) {

			// On 1 column, all have fullscreen mapping
			oMap[LT.TwoColumnsBeginExpanded] = "0/100/0";
			oMap[LT.TwoColumnsMidExpanded] = "0/100/0";
			oMap[LT.ThreeColumnsMidExpanded] = "0/0/100";
			oMap[LT.ThreeColumnsEndExpanded] = "0/0/100";
			oMap[LT.ThreeColumnsMidExpandedEndHidden] = "0/0/100";
			oMap[LT.ThreeColumnsBeginExpandedEndHidden] = "0/0/100";

		} else {

			// On 2 and 3 columns, the only difference is in the modes where all 3 columns are visible
			oMap[LT.TwoColumnsBeginExpanded] = "67/33/0";
			oMap[LT.TwoColumnsMidExpanded] = "33/67/0";
			oMap[LT.ThreeColumnsMidExpanded] = iMaxColumnsCount === 2 ? "0/67/33" : "25/50/25";
			oMap[LT.ThreeColumnsEndExpanded] = iMaxColumnsCount === 2 ? "0/33/67" : "25/25/50";
			oMap[LT.ThreeColumnsMidExpandedEndHidden] = "33/67/0";
			oMap[LT.ThreeColumnsBeginExpandedEndHidden] = "67/33/0";
		}

		return oMap[sLayout];
	};

	FlexibleColumnLayout.prototype._attachAfterColumnResizedOnce = function (sColumn, fnSuccessCallback, fnErrorCallback) {
		this._oAnimationEndListener.waitForColumnResizeEnd(this._$columns[sColumn])
			.then(fnSuccessCallback)
			.catch(function() {
				fnErrorCallback && fnErrorCallback();
			});
	};

	FlexibleColumnLayout.prototype._attachAfterAllColumnsResizedOnce = function (fnSuccessCallback, fnErrorCallback) {
		this._oAnimationEndListener.waitForAllColumnsResizeEnd()
			.then(fnSuccessCallback)
			.catch(function() {
				fnErrorCallback && fnErrorCallback();
			});
	};


	//******************************************************** STATIC MEMBERS *****************************************/

	// The width above which (inclusive) we are in desktop mode
	FlexibleColumnLayout.DESKTOP_BREAKPOINT = 1280;

	// The width above which (inclusive) we are in tablet mode
	FlexibleColumnLayout.TABLET_BREAKPOINT = 960;

	FlexibleColumnLayout.COLUMN_MIN_WIDTH = 312; // px, obtained as 25% of (DESKTOP_BREAKPOINT - 2 * COLUMN_SEPARATOR_WIDTH)

	FlexibleColumnLayout.STORAGE_PREFIX_TABLET = "sap-f-fcl-tablet-column-width-distributions";
	FlexibleColumnLayout.STORAGE_PREFIX_DESKTOP = "sap-f-fcl-desktop-column-width-distributions";

	/**
	 * Retrieves the resource bundle for the <code>sap.f</code> library.
	 * @static
	 * @private
	 * @returns {Object} the resource bundle object
	 */
	FlexibleColumnLayout._getResourceBundle = function () {
		return Library.getResourceBundleFor("sap.f");
	};


	/**
	 * Shows the placeholder on the corresponding column for the provided aggregation name.
	 *
	 * @param {object} mSettings Object containing the aggregation name
	 * @param {string} mSettings.aggregation The aggregation name to decide on which column/container the placeholder should be shown
	 * @private
	 * @ui5-restricted SAPUI5 Distribution Layer Libraries
	 * @since 1.91
	 */
	FlexibleColumnLayout.prototype.showPlaceholder = function(mSettings) {
		var Placeholder = sap.ui.require("sap/ui/core/Placeholder");

		if (!Placeholder || !Placeholder.isEnabled()) {
			return;
		}

		switch (mSettings && mSettings.aggregation) {
			case "beginColumnPages":
				return this.getAggregation("_beginColumnNav").showPlaceholder(mSettings);
			case "midColumnPages":
				return this.getAggregation("_midColumnNav").showPlaceholder(mSettings);
			default:
				return this.getAggregation("_endColumnNav").showPlaceholder(mSettings);
		}
	};

	/**
	 * Hides the placeholder on the corresponding column for the provided aggregation name.
	 *
	 * @param {object} mSettings Object containing the aggregation name
	 * @param {string} mSettings.aggregation The aggregation name to decide on which column/container the placeholder should be hidden
	 * @private
	 * @ui5-restricted SAP internal apps
	 * @since 1.91
	 */
	FlexibleColumnLayout.prototype.hidePlaceholder = function(mSettings) {
		switch (mSettings.aggregation) {
			case "beginColumnPages":
				this.getAggregation("_beginColumnNav").hidePlaceholder(mSettings);
				break;
			case "midColumnPages":
				this.getAggregation("_midColumnNav").hidePlaceholder(mSettings);
				break;
			default:
				this.getAggregation("_endColumnNav").hidePlaceholder(mSettings);
		}
	};

	/**
	 * Checks whether a placeholder is needed by comparing the currently displayed page with
	 * the page object that is going to be displayed. If they are the same, no placeholder needs
	 * to be shown.
	 *
	 * @param {string} sAggregationName The aggregation name for the corresponding column
	 * @param {sap.ui.core.Control} oObject The page object to be displayed
	 * @returns {boolean} Whether placeholder is needed or not
	 * @private
	 * @ui5-restricted sap.ui.core.routing
	 */
	FlexibleColumnLayout.prototype.needPlaceholder = function(sAggregationName, oObject) {
		var oContainer;

		switch (sAggregationName) {
			case "beginColumnPages":
				oContainer = this.getAggregation("_beginColumnNav");
				break;
			case "midColumnPages":
				oContainer = this.getAggregation("_midColumnNav");
				break;
			default:
				oContainer = this.getAggregation("_endColumnNav");
		}

		return !oObject || (oContainer.getCurrentPage() !== oObject);
	};

	/**
	 * Layout history helper class.
	 * @constructor
	 * @alias sap.f.FlexibleColumnLayout.LayoutHistory
	 * @private
	 * @ui5-restricted sap.f.FlexibleColumnLayoutSemanticHelper
	 */
	function LayoutHistory () {
		this._aLayoutHistory = [];
	}

	/**
	 * Adds a new entry to the history
	 * @param {string} sLayout
	 */
	LayoutHistory.prototype.addEntry = function (sLayout) {
		if (typeof sLayout !== "undefined") {
			this._aLayoutHistory.push(sLayout);
		}
	};

	/**
	 * Retrieves the etry at the given index
	 * @param {*} iIndex ihe index
	 * @param {*} bRecentFirst if the history should be ordered from the most recent to the most old
	 * @returns {string} the entry at the given index
	 */
	LayoutHistory.prototype.getEntry = function (iIndex, bRecentFirst) {
		var aHistory = this._aLayoutHistory;
		if (bRecentFirst) {
			aHistory = this._aLayoutHistory.slice().reverse();
		}
		return aHistory[iIndex];
	};

	/**
	 * Searches the history for the most recent layout that matches any of the aLayouts entries
	 * @param aLayouts - a list of layouts
	 * @returns {*}
	 */
	LayoutHistory.prototype.getClosestEntryThatMatches = function (aLayouts) {
		var i;

		for (i = this._aLayoutHistory.length - 1; i >= 0; i--) {
			if (aLayouts.indexOf(this._aLayoutHistory[i]) !== -1) {
				return this._aLayoutHistory[i];
			}
		}
	};

	/**
	 * AnimationEndListener helper class
	 * @constructor
	 * @private
	 */
	function AnimationEndListener () {
		this._oListeners = {};
		this._aPendingPromises = [];
		this._oPendingPromises = {};
		this._oCancelPromises = {};
		this._oPendingPromiseAll = null;
	}

	/**
	 * Attaches a <code>transitionend</code> listener to the given column element.
	 * @param $column - a jQuery object
	 * @returns {Promise}
	 * @private
	 */
	AnimationEndListener.prototype.waitForColumnResizeEnd = function ($column) {
		var sId = $column.get(0).id,
			oPromise;

		if (!this._oPendingPromises[sId]) {
			oPromise = new Promise(function(resolve, reject) {

				Log.debug("FlexibleColumnLayout", "wait for column " + sId + " to resize");
				this._attachTransitionEnd($column, function() {
					Log.debug("FlexibleColumnLayout", "completed column " + sId + " resize");
					this._cleanUp($column);
					resolve();
				}.bind(this));

				this._oCancelPromises[sId] = {
					cancel: function() {
						Log.debug("FlexibleColumnLayout", "cancel column " + sId + " resize");
						this._cleanUp($column);
						reject();
					}.bind(this)
				};

			}.bind(this));

			this._aPendingPromises.push(oPromise);
			this._oPendingPromises[sId] = oPromise;
		}

		return this._oPendingPromises[sId];
	};

	/**
	 * Waits until *all* <code>transitionend</code> listeners
	 * attached from <code>AnimationEndListener.prototype.waitForColumnResizeEnd</code> are fired.
	 * Note that this function must be called synchonously with the mentioned calls to
	 * <code>AnimationEndListener.prototype.waitForColumnResizeEnd</code>, so that it knows the
	 * total number of columns that will resize with animation. (This introduces some tighter coupling
	 * with the calling <code>FlexibleColumnLayout.prototype._resizeColumns</code>function, but since
	 * the API is private and used only in this context, it is left like this for simplicity.
	 * @returns {Promise}
	 * @private
	 */
	AnimationEndListener.prototype.waitForAllColumnsResizeEnd = function () {
		if (!this._oPendingPromiseAll) {
			this._oPendingPromiseAll = new Promise(function (resolve, reject) {
				this.iTimer = setTimeout(function () { // set a timeout of 0 to execute the following *after*
					// all promises for resize of the individual columns were created
					// so that <code>this._aPendingPromises</code> is completely filled
					Promise.all(this._aPendingPromises).then(function () {
						Log.debug("FlexibleColumnLayout", "completed all columns resize");
						resolve();
					}, 0).catch(function() {
						reject();
					});
					this.iTimer = null;
				}.bind(this));
			}.bind(this));
		}
		return this._oPendingPromiseAll;
	};

	/**
	 * Checks if <code>transitionend</code> listener on the given column element is
	 * already attached and waiting.
	 * @param $column - a jQuery object
	 * @returns {Promise}
	 * @private
	 */
	AnimationEndListener.prototype.isWaitingForColumnResizeEnd = function ($column) {
		var sId = $column.get(0).id;
		return !!this._oListeners[sId];
	};

	/**
	 * Deregisters all <code>transitionend</code> listeners.
	 * @returns {Promise}
	 * @private
	 */
	AnimationEndListener.prototype.cancelAll = function () {
		Object.keys(this._oCancelPromises).forEach(function(sId) {
			// this will call <code>reject</code> from the promise
			// to notify those that wait for the promise to complete
			this._oCancelPromises[sId].cancel();
		}, this);
		this._oPendingPromises = {};
		this._aPendingPromises = [];
		this._oCancelPromises = {};
		this._oPendingPromiseAll = null;
		this._oListeners = {};
		if (this.iTimer) {
			clearTimeout(this.iTimer);
			this.iTimer = null;
		}
		Log.debug("FlexibleColumnLayout", "detached all listeners for columns resize");
	};

	AnimationEndListener.prototype._attachTransitionEnd = function ($column, fnCallback) {
		var sId = $column.get(0).id;
		if (!this._oListeners[sId]) {
			$column.on("webkitTransitionEnd transitionend", fnCallback);
			this._oListeners[sId] = fnCallback;
		}
	};

	AnimationEndListener.prototype._detachTransitionEnd = function ($column) {
		var sId = $column.get(0).id;
		if (this._oListeners[sId]) {
			$column.off("webkitTransitionEnd transitionend", this._oListeners[sId]);
			this._oListeners[sId] = null;
		}
	};

	AnimationEndListener.prototype._cleanUp = function ($column) {
		if ($column.length) {
			var sId = $column.get(0).id;
			this._detachTransitionEnd($column);
			delete this._oPendingPromises[sId];
			delete this._oCancelPromises[sId];
		}
	};

	//utils
	function convertPxToCSSSizeString(iPxSize, iTotalPzSize, bIsInsetColumn) {
		var iContentSize;
		if (iPxSize === iTotalPzSize) {
			return "100%";
		}
		iContentSize = bIsInsetColumn ? (iPxSize - FlexibleColumnLayout.COLUMN_SEPARATOR_WIDTH) : iPxSize;

		return iContentSize + "px";
	}

	function getSeparatorName(oColumnSeparator) {
		return oColumnSeparator.classList.contains("sapFFCLColumnSeparatorBegin") ?
			"begin" : "end";
	}

	function getInteractivelyResizedColumns(oColumnSeparator, sLayout, iMaxColumnsCount) {
		var bIsBeginSeparator = oColumnSeparator.classList.contains("sapFFCLColumnSeparatorBegin");

		if (iMaxColumnsCount === 2 && sLayout == LT.ThreeColumnsMidExpandedEndHidden) {
			return (bIsBeginSeparator) ? ["begin", "mid"] : ["begin", "end"];
		}

		if (iMaxColumnsCount === 2 && sLayout == LT.ThreeColumnsMidExpanded) {
			return (bIsBeginSeparator) ? ["begin", "end"] : ["mid", "end"];
		}
		return (bIsBeginSeparator) ? ["begin", "mid"] : ["mid", "end"];
	}

	function getCursorPositionX (oEvent) {
		var oConfig = oEvent;
		if (oEvent.changedTouches && oEvent.changedTouches[0]) {
			oConfig = oConfig.changedTouches[0];
		}
		return oConfig.pageX;
	}

	/**
	 * Ensures the sum of all column percent widths is 100.
	 * (Used after converting all the column widths from floats to integers,
	 * to avoid inconsistency of the final sum due to rounding.)
	 *
	 * @param {object} aColumnPercentWidths the percent widths of all three columns
	 */
	function normalizeColumnPercentWidths(aColumnPercentWidths) {
		var oColumnIndex = {
			begin: 0,
			mid: 1,
			end: 2
		},
		iSum = aColumnPercentWidths.reduce((a, b) => a + b, 0);
		if (iSum !== 100) {
			// the CSS of the mid column always causes it take the space that remained
			// after sizing the begin and end columns
			aColumnPercentWidths[oColumnIndex.mid] = 100 -
			(aColumnPercentWidths[oColumnIndex.begin] + aColumnPercentWidths[oColumnIndex.end]);
		}
	}

	/**
	 * Ensures width of begin column is correct for specific layouts
	 *
	 * @param {number} iBeginWidth
	 * @param {string} sLayout
	 */
	function normalizeBeginColumnWidth(iBeginWidth, sLayout) {
		if ((sLayout === LT.ThreeColumnsMidExpanded ||  sLayout == LT.ThreeColumnsEndExpanded) && Math.floor(iBeginWidth) >= 33) {
			return 32;
		}

		return iBeginWidth;
	}

	return FlexibleColumnLayout;

});
