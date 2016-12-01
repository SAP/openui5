/*!
 * ${copyright}
 */

// Provides control sap.f.FlexibleColumnLayout.
sap.ui.define([
	"jquery.sap.global",
	"./library",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/Control",
	"sap/m/Button",
	"sap/m/NavContainer"
], function (jQuery, library, ResizeHandler, Control, Button, NavContainer) {
	"use strict";


	/**
	 * Constructor for a new Flexible Column Layout.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The FlexibleColumnLayout control implements the master-detail-detail paradigm by allowing the user to display up to three pages at a time.
	 * Disclaimer: this control is in beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.46
	 * @alias sap.f.FlexibleColumnLayout
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FlexibleColumnLayout = Control.extend("sap.f.FlexibleColumnLayout", {
		metadata: {
			properties: {

				/**
				 * Determines the layout of the control - number of columns and their relative sizes
				 */
				layout: {type: "sap.f.LayoutType", defaultValue: sap.f.LayoutType.OneColumn},

				/**
				 * Forces the control to only show two columns at a time on Desktop (as it would normally on Tablet).
				 */
				twoColumnLayoutOnDesktop: {type: "boolean", group: "Behavior", defaultValue: false},

				/**
				 * Determines the default three-column layout: MidColumnEmphasized (25/50/25) or EndColumnEmphasized (25/25/50).
				 */
				threeColumnLayoutType: {type: "sap.f.ThreeColumnLayoutType", group: "Behavior", defaultValue: sap.f.ThreeColumnLayoutType.MidColumnEmphasized},

				/**
				 * Determines whether the user can switch between the MidColumnEmphasized (25/50/25) and EndColumnEmphasized (25/25/50) three-column layouts with the use of an additional navigation button.
				 */
				threeColumnLayoutTypeFixed: {type: "boolean", group: "Behavior", defaultValue: true},

				/**
				 * Determines the type of the transition/animation to apply for the <code>Begin</code> column when <code>to()</code> is called without defining the
				 * transition to use. The default is <code>slide</code>, other options are <code>fade</code>, <code>show</code>, and the names of any registered custom transitions.
				 */
				defaultTransitionNameBeginColumn : {type : "string", group : "Appearance", defaultValue : "slide"},

				/**
				 * Determines the type of the transition/animation to apply for the <code>Mid</code> column when <code>to()</code> is called without defining the
				 * transition to use. The default is <code>slide</code>, other options are <code>fade</code>, <code>show</code>, and the names of any registered custom transitions.
				 */
				defaultTransitionNameMidColumn : {type : "string", group : "Appearance", defaultValue : "slide"},

				/**
				 * Determines the type of the transition/animation to apply for the <code>End</code> column when <code>to()</code> is called without defining the
				 * transition to use. The default is <code>slide</code>, other options are <code>fade</code>, <code>show</code>, and the names of any registered custom transitions.
				 */
				defaultTransitionNameEndColumn : {type : "string", group : "Appearance", defaultValue : "slide"}

			},
			aggregations: {
				/**
				 * The content entities between which the <code>FlexibleColumnLayout</code> navigates in the <code>Begin</code> column.
				 *
				 * These should be any control with page semantics.
				 * These aggregated controls will receive navigation events like {@link sap.m.NavContainerChild#beforeShow beforeShow}, they are documented in the pseudo interface {@link sap.m.NavContainerChild sap.m.NavContainerChild}.
				 */
				beginColumnPages: {type: "sap.ui.core.Control", multiple: true},
				/**
				 * The content entities between which the <code>FlexibleColumnLayout</code> navigates in the <code>Mid</code> column.
				 *
				 * These should be any control with page semantics.
				 * These aggregated controls will receive navigation events like {@link sap.m.NavContainerChild#beforeShow beforeShow}, they are documented in the pseudo interface {@link sap.m.NavContainerChild sap.m.NavContainerChild}.
				 */
				midColumnPages: {type: "sap.ui.core.Control", multiple: true},
				/**
				 * The content entities between which the <code>FlexibleColumnLayout</code> navigates in the <code>End</code> column.
				 *
				 * These should be any control with page semantics.
				 * These aggregated controls will receive navigation events like {@link sap.m.NavContainerChild#beforeShow beforeShow}, they are documented in the pseudo interface {@link sap.m.NavContainerChild sap.m.NavContainerChild}.
				 */
				endColumnPages: {type: "sap.ui.core.Control", multiple: true},

				_beginColumnNav: {type : "sap.m.NavContainer", multiple : false, visibility : "hidden"},
				_midColumnNav: {type : "sap.m.NavContainer", multiple : false, visibility : "hidden"},
				_endColumnNav: {type : "sap.m.NavContainer", multiple : false, visibility : "hidden"},

				_beginColumnBackArrow: {type: "sap.m.Button", multiple: false, visibility: "hidden"},
				_midColumnForwardArrow: {type: "sap.m.Button", multiple: false, visibility: "hidden"},
				_midColumnBackArrow: {type: "sap.m.Button", multiple: false, visibility: "hidden"},
				_endColumnForwardArrow: {type: "sap.m.Button", multiple: false, visibility: "hidden"}
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
				 * Fired when there is any change in the layout of the columns.
				 *
				 * <ul>The interactions that may lead to a layout change are:
				 *  <li>the user collapsed/expanded a column by clicking a navigation arrow</li>
				 *  <li>the user resized the browser</li>
				 *  <li>columns were shown/hidden via the control's API</li>
				 *  <li>the public method <code>setLayout</code> was called</li></ul>
				 *
				 *  <ul>The possible combinations of <code>beginColumnWidth</code>, <code>midColumnWidth</code>, and <code>endColumnWidth</code> are:
				 *  <li>one active column: 100/0/0, 0/100/0, 0/0/100</li>
				 *  <li>two active columns: 0/67/33, 33/67/0, 67/33/0</li>
				 *  <li>three active columns: 25/25/50, 25/50/25</li></ul>
				 */
				layoutChange: {
					parameters: {
						/**
						 * The width (as percentage) of the <code>Begin</code> column.
						 *
						 * Possible values are: 0, 25, 33, 67, 100.
						 */
						beginColumnWidth: {
							type: "int"
						},
						/**
						 * The width (as percentage) of the <code>Mid</code> column.
						 *
						 * Possible values are: 0, 25, 33, 50, 67, 100.
						 */
						midColumnWidth: {
							type: "int"
						},
						/**
						 * The width (as percentage) of the <code>End</code> column.
						 *
						 * Possible values are: 0, 25, 33, 50, 67, 100.
						 */
						endColumnWidth: {
							type: "int"
						},
						/**
						 * The maximum number of columns that can be displayed at once based on the available screen size and control settings.
						 *
						 * <ul>Possible values are:
						 * <li>3 for desktop (1280px or more)</li>
						 * <li>2 for tablet (between 960px and 1280px) or for desktop with <code>twoColumnLayoutOnDesktop</code> set to <code>true</code></li>
						 * <li>1 for phone (less than 960px)</li></ul>
						 */
						maxColumnsCount: {
							type: "int"
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
				}
			}
		}
	});

	FlexibleColumnLayout.prototype.init = function () {

		// Create the expand/collapse arrows
		this._initButtons();

		// Holds the current width of the control - set on onAfterRendering, updated on resize
		this._iControlWidth = null;

		// Holds the current layout of the control
		this._sColumnWidthDistribution = null;

		this._sLastLayout = null;
		this._aLayoutHistory = [];

		// The first NavContainer should always be created in advance - it cannot be hidden
		this.setAggregation("_beginColumnNav", this._createNavContainer("begin"));
	};

	/**
	 * One-time nav container creation method
	 * @param sColumn - the column for which a nav container must be created
	 * @returns {*}
	 * @private
	 */
	FlexibleColumnLayout.prototype._createNavContainer = function (sColumn) {
		var sColumnCap = sColumn.charAt(0).toUpperCase() + sColumn.slice(1);

		return new NavContainer(this.getId() + "-" + sColumn + "ColumnNav", {
			navigate: function(oEvent){
				this._handleNavigationEvent(oEvent, false, sColumn);
			}.bind(this),
			afterNavigate: function(oEvent){
				this._handleNavigationEvent(oEvent, true, sColumn);
			}.bind(this),
			defaultTransitionName: this["getDefaultTransitionName" + sColumnCap + "Column"]()
		});
	};

	/**
	 * Proxies the navigation events from the internal nav containers to the app
	 * @param oEvent
	 * @param bAfter
	 * @param sColumn
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
	 * Getter for the Begin column nav container - this one is always eagerly created, thus returned directly
	 * @returns {*}
	 * @private
	 */
	FlexibleColumnLayout.prototype._getBeginColumn = function () {
		return this.getAggregation("_beginColumnNav");
	};

	/**
	 * Getter for the Mid column nav container - lazily created
	 * @returns {*}
	 * @private
	 */
	FlexibleColumnLayout.prototype._getMidColumn = function () {
		var oMidColumn = this.getAggregation("_midColumnNav");

		if (!oMidColumn) {
			oMidColumn = this._createNavContainer("mid");
			this.setAggregation("_midColumnNav", oMidColumn, true);
			this._flushColumnContent("mid", oMidColumn);
		}

		return oMidColumn;
	};

	/**
	 * Getter for the End column nav container - lazily created
	 * @returns {*}
	 * @private
	 */
	FlexibleColumnLayout.prototype._getEndColumn = function () {
		var oEndColumn = this.getAggregation("_endColumnNav");

		if (!oEndColumn) {
			oEndColumn = this._createNavContainer("end");
			this.setAggregation("_endColumnNav", oEndColumn, true);
			this._flushColumnContent("end", oEndColumn);
		}

		return oEndColumn;
	};

	/**
	 * Updates the content of a column by flushing its container div only
	 * @param sColumn
	 * @param oControl
	 * @private
	 */
	FlexibleColumnLayout.prototype._flushColumnContent = function (sColumn, oControl) {
		var oRm;

		if (!this.getDomRef()) {
			return;
		}

		oRm = sap.ui.getCore().createRenderManager();
		oRm.renderControl(oControl);
		oRm.flush(this._$columns[sColumn][0], undefined, true);
		oRm.destroy();
	};



	FlexibleColumnLayout.prototype.setLayout = function (sNewLayout, bIsNavigationArrow){
		var sCurrentLayout = this.getLayout();

		if (sCurrentLayout === sNewLayout) {
			return this;
		}

		this._sLastLayout = sCurrentLayout;
		if (typeof sNewLayout !== "undefined") {
			this._aLayoutHistory.push(sNewLayout);
		}

		var vResult = this.setProperty("layout", sNewLayout, true);
		if (typeof this._$columns === "undefined") {
			return vResult;
		}

		this._applyLayoutChanges(bIsNavigationArrow);
		return vResult;
	};

	/**
	 * Setter for property twoColumnLayoutOnDesktop
	 * @param oControl
	 * @returns {*}
	 */
	FlexibleColumnLayout.prototype.setTwoColumnLayoutOnDesktop = function (bValue) {

		var vResult = this.setProperty("twoColumnLayoutOnDesktop", bValue, true);
		if (typeof this._$columns === "undefined") {
			return vResult;
		}

		this._applyLayoutChanges();
		return vResult;
	};

	FlexibleColumnLayout.prototype.onBeforeRendering = function () {
		this._deregisterResizeHandler();
	};

	FlexibleColumnLayout.prototype.onAfterRendering = function () {

		this._registerResizeHandler();

		this._cacheDOMElements();
		this._iControlWidth = this.$().width();

		this._applyLayoutChanges();
		this._hideShowArrows(); // Arrows need to be explicitly fixed after rerendering as the layout didn't actually change
	};

	FlexibleColumnLayout.prototype.exit = function () {
		this._deregisterResizeHandler();
	};

	FlexibleColumnLayout.prototype._registerResizeHandler = function () {
		jQuery.sap.assert(!this._iResizeHandlerId, "Resize handler already registered");
		this._iResizeHandlerId = ResizeHandler.register(this, this._onResize.bind(this));
	};

	FlexibleColumnLayout.prototype._deregisterResizeHandler = function () {
		if (this._iResizeHandlerId) {
			ResizeHandler.deregister(this._iResizeHandlerId);
			this._iResizeHandlerId = null;
		}
	};

	/**
	 * Creates the buttons for the arrows, which are initially hidden and will only be shown on demand without rerendering
	 * @private
	 */
	FlexibleColumnLayout.prototype._initButtons = function () {
		var oBeginColumnBackArrow = new Button(this.getId() + "-beginBack", {
			icon: "sap-icon://slim-arrow-left",
			press: this._onArrowClick.bind(this, "left")
		}).addStyleClass("sapFFCLNavigationButton").addStyleClass("sapFFCLNavigationButtonRight");
		this.setAggregation("_beginColumnBackArrow", oBeginColumnBackArrow, true);

		var oMidColumnForwardArrow = new Button(this.getId() + "-midForward", {
			icon: "sap-icon://slim-arrow-right",
			press: this._onArrowClick.bind(this, "right")
		}).addStyleClass("sapFFCLNavigationButton").addStyleClass("sapFFCLNavigationButtonLeft");
		this.setAggregation("_midColumnForwardArrow", oMidColumnForwardArrow, true);

		var oMidColumnBackArrow = new Button(this.getId() + "-midBack", {
			icon: "sap-icon://slim-arrow-left",
			press: this._onArrowClick.bind(this, "left")
		}).addStyleClass("sapFFCLNavigationButton").addStyleClass("sapFFCLNavigationButtonRight");
		this.setAggregation("_midColumnBackArrow", oMidColumnBackArrow, true);

		var oEndColumnForwardArrow = new Button(this.getId() + "-endForward", {
			icon: "sap-icon://slim-arrow-right",
			press: this._onArrowClick.bind(this, "right")
		}).addStyleClass("sapFFCLNavigationButton").addStyleClass("sapFFCLNavigationButtonLeft");
		this.setAggregation("_endColumnForwardArrow", oEndColumnForwardArrow, true);
	};

	/**
	 * Saves the DOM references of the columns and arrows
	 * @private
	 */
	FlexibleColumnLayout.prototype._cacheDOMElements = function () {
		this._cacheColumns();

		if (!sap.ui.Device.system.phone) {
			this._cacheArrows();
		}
	};

	FlexibleColumnLayout.prototype._cacheColumns = function () {
		this._$columns = {
			begin: this.$("beginColumn"),
			mid: this.$("midColumn"),
			end: this.$("endColumn")
		};
	};

	FlexibleColumnLayout.prototype._cacheArrows = function () {
		this._$columnButtons = {
			beginBack: this.$("beginBack"),
			midForward: this.$("midForward"),
			midBack: this.$("midBack"),
			endForward: this.$("endForward")
		};
	};

	/**
	 * Returns the number of columns that have width > 0
	 * @returns {Array.<string>}
	 * @private
	 */
	FlexibleColumnLayout.prototype._getVisibleColumnsCount = function () {
		return ["begin", "mid", "end"].filter(function (sColumn) {
			return this._getColumnSize(sColumn) > 0;
		}, this).length;
	};

	/**
	 * Changes the width and margins of the columns according to the current layout
	 * @private
	 */
	FlexibleColumnLayout.prototype._resizeColumns = function () {
		var iPercentWidth,
			sNewWidth,
			iTotalMargin,
			iAvailableWidth,
			bNeedsMargin = false,
			aColumns = ["begin", "mid", "end"],
			bRtl = sap.ui.getCore().getConfiguration().getRTL(),
			aActiveColumns;

		// Stop here if the control isn't rendered yet
		if (typeof this._$columns === "undefined") {
			return;
		}

		// Calculate the total margin between columns (f.e. for 3 columns - 2 * 8px)
		iTotalMargin = (this._getVisibleColumnsCount() - 1) * FlexibleColumnLayout.COLUMN_MARGIN;

		// Calculate the width available for the columns
		iAvailableWidth = this._iControlWidth - iTotalMargin;

		aColumns.forEach(function (sColumn) {
			iPercentWidth = this._getColumnSize(sColumn);

			// Add the left margin if the column has width and there was already a non-zero width column before it (bNeedsMargin = true)
			this._$columns[sColumn].toggleClass("sapFFCLColumnMargin", bNeedsMargin && iPercentWidth > 0);

			// Add the active class to the column if it shows something
			this._$columns[sColumn].toggleClass("sapFFCLColumnActive", iPercentWidth > 0);

			// Remove all the classes that are used for HCB theme borders, they will be set again later
			this._$columns[sColumn].removeClass("sapFFCLColumnOnlyActive");
			this._$columns[sColumn].removeClass("sapFFCLColumnLastActive");
			this._$columns[sColumn].removeClass("sapFFCLColumnFirstActive");

			// Change the width of the column
			if ([100, 0].indexOf(iPercentWidth) !== -1) {
				sNewWidth = iPercentWidth + "%";
			} else {
				sNewWidth = Math.round(iAvailableWidth * (iPercentWidth / 100)) + "px";
			}
			this._$columns[sColumn].width(sNewWidth);

			// After the first non-zero width column is shown, set the flag to enable margins for all other non-zero width columns that will follow
			if (iPercentWidth > 0) {
				bNeedsMargin = true;
			}

		}, this);

		aActiveColumns = aColumns.filter(function (sColumn) {
			return this._getColumnSize(sColumn) > 0;
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

	/**
	 * Gets the size (in %) of a column based on the current layout
	 * @param sColumn - string: begin/mid/end
	 * @returns {*}
	 * @private
	 */
	FlexibleColumnLayout.prototype._getColumnSize = function (sColumn) {
		var aSizes = this._sColumnWidthDistribution.split("/"),
			aMap = {
				begin: 0,
				mid: 1,
				end: 2
			},
			sSize = aSizes[aMap[sColumn]];

		return parseInt(sSize, 10);
	};

	FlexibleColumnLayout.prototype._getColumnSizeForLayout = function (sColumn, sLayout) {
		var sColumnWidthDistribution = this._getColumnWidthDistributionForLayout(sLayout),
			aSizes = sColumnWidthDistribution.split("/"),
			aMap = {
				begin: 0,
				mid: 1,
				end: 2
			},
			sSize = aSizes[aMap[sColumn]];

		return parseInt(sSize, 10);
	};

	FlexibleColumnLayout.prototype._onResize = function (oEvent) {
		var iNewWidth = oEvent.size.width;

		// If the size didn't change or the control is resized to 0, don't do anything
		if (iNewWidth === 0 || iNewWidth === this._iControlWidth) {
			return;
		}

		this._iControlWidth = oEvent.size.width;

		this._applyLayoutChanges();
	};

	/**
	 * Called when the navigation arrows were clicked
	 * @param sShiftDirection - left/right (direction of the arrow)
	 * @private
	 */
	FlexibleColumnLayout.prototype._onArrowClick = function (sShiftDirection) {

		var sLayout = this.getLayout(),
			oMap;

		oMap = {
			TwoColumnsBeginEmphasized: {
				"left": "TwoColumnsMidEmphasized"
			},
			TwoColumnsMidEmphasized: {
				"right": "TwoColumnsBeginEmphasized"
			},
			ThreeColumnsMidEmphasized: {
				"left": "ThreeColumnsEndEmphasized",
				"right": "ThreeColumnsMidEmphasizedEndHidden"
			},
			ThreeColumnsEndEmphasized: {
				"right": "ThreeColumnsMidEmphasized"
			},
			ThreeColumnsMidEmphasizedEndHidden: {
				"left": "ThreeColumnsMidEmphasized",
				"right": "ThreeColumnsBeginEmphasizedEndHidden"
			},
			ThreeColumnsBeginEmphasizedEndHidden: {
				"left": "ThreeColumnsMidEmphasizedEndHidden"
			}
		};

		oMap.TwoColumnsDefault =  oMap.TwoColumnsBeginEmphasized;
		oMap.ThreeColumnsDefault = this.getThreeColumnLayoutType() === library.ThreeColumnLayoutType.EndColumnEmphasized ?
			oMap.ThreeColumnsEndEmphasized : oMap.ThreeColumnsMidEmphasized;

		sLayout = oMap[sLayout][sShiftDirection];

		this.setLayout(sLayout, true);
	};

	FlexibleColumnLayout.prototype._getColumnWidthDistributionForLayout = function (sLayout) {
		var iMaxColumns = this._getMaxColumnsCount(),
			oMap;

		oMap = {
			OneColumn: "100/0/0",
			MidFullScreen: "0/100/0",
			EndFullScreen: "0/0/100"
		};

		if (iMaxColumns === 1) {

			oMap.TwoColumnsBeginEmphasized = "0/100/0";
			oMap.TwoColumnsMidEmphasized =  "0/100/0";
			oMap.ThreeColumnsMidEmphasized =  "0/0/100";
			oMap.ThreeColumnsEndEmphasized =  "0/0/100";
			oMap.ThreeColumnsMidEmphasizedEndHidden =  "0/0/100";
			oMap.ThreeColumnsBeginEmphasizedEndHidden =  "0/0/100";

		} else {

			oMap.TwoColumnsBeginEmphasized = "67/33/0";
			oMap.TwoColumnsMidEmphasized =  "33/67/0";
			oMap.ThreeColumnsMidEmphasized =  iMaxColumns === 2 ? "0/67/33" : "25/50/25";
			oMap.ThreeColumnsEndEmphasized =  iMaxColumns === 2 ? "0/33/67" : "25/25/50";
			oMap.ThreeColumnsMidEmphasizedEndHidden =  "33/67/0";
			oMap.ThreeColumnsBeginEmphasizedEndHidden =  "67/33/0";
		}

		oMap.TwoColumnsDefault =  oMap.TwoColumnsBeginEmphasized;
		oMap.ThreeColumnsDefault = this.getThreeColumnLayoutType() === library.ThreeColumnLayoutType.EndColumnEmphasized ?
			oMap.ThreeColumnsEndEmphasized : oMap.ThreeColumnsMidEmphasized;

		return oMap[sLayout];
	};

	/**
	 * Checks if the given layout (sNewLayout) is valid in the current state and applies it (if yes)
	 * @param sNewLayout - the layout we're trying to set
	 * @param sShiftDirection - returns the previous/next layout in the list, closest to sNewLayout
	 * @returns {*}
	 * @private
	 */
	FlexibleColumnLayout.prototype._applyLayoutChanges = function (bIsNavigationArrow) {
		var sLayout = this.getLayout(),
			sCurrentColumnWidthDistribution = this._sColumnWidthDistribution;

		this._sColumnWidthDistribution = this._getColumnWidthDistributionForLayout(sLayout);

		// Always resize columns (even if the layout did not change as columns have exact pixel widths)
		this._resizeColumns();

		// Only manage arrows and fire event if the layout actually changed as result of the operation
		if (this._sColumnWidthDistribution !== sCurrentColumnWidthDistribution) {
			this._hideShowArrows();

			this.fireLayoutChange({
				beginColumnWidth: this._getColumnSize("begin"),
				midColumnWidth: this._getColumnSize("mid"),
				endColumnWidth: this._getColumnSize("end"),
				maxColumnsCount: this._getMaxColumnsCount(),
				isNavigationArrow: bIsNavigationArrow,
				layout: this.getLayout()
			});
		}
	};

	/**
	 * Updates the visibility of the arrows according to the current layout
	 * @private
	 */
	FlexibleColumnLayout.prototype._hideShowArrows = function () {
		var sLayout = this.getLayout(),
			iMaxColumns = this._getMaxColumnsCount(),
			bThreeColumnLayoutTypeFixed = this.getThreeColumnLayoutTypeFixed(),
			oMap = {},
			aNeededArrows = [];

		// Stop here if the control isn't rendered yet
		if (typeof this._$columns === "undefined" || sap.ui.Device.system.phone) {
			return;
		}

		if (iMaxColumns === 3) {
			oMap.TwoColumnsBeginEmphasized = ["beginBack"];
			oMap.TwoColumnsMidEmphasized =  ["midForward"];
			oMap.ThreeColumnsMidEmphasized =  bThreeColumnLayoutTypeFixed ? ["midForward"] : ["midForward", "midBack"];
			oMap.ThreeColumnsEndEmphasized =  ["endForward"];
			oMap.ThreeColumnsMidEmphasizedEndHidden =  ["midForward", "midBack"];
			oMap.ThreeColumnsBeginEmphasizedEndHidden =  ["beginBack"];
		}

		if (iMaxColumns === 2) {
			oMap.TwoColumnsBeginEmphasized =  ["beginBack"];
			oMap.TwoColumnsMidEmphasized =  ["midForward"];
			oMap.ThreeColumnsMidEmphasized = ["midForward", "midBack"];
			oMap.ThreeColumnsEndEmphasized =  ["endForward"];
			oMap.ThreeColumnsMidEmphasizedEndHidden =  ["midForward", "midBack"];
			oMap.ThreeColumnsBeginEmphasizedEndHidden =  ["beginBack"];
		}

		oMap.TwoColumnsDefault = oMap.TwoColumnsBeginEmphasized;
		oMap.ThreeColumnsDefault = this.getThreeColumnLayoutType() === library.ThreeColumnLayoutType.EndColumnEmphasized ?
			oMap.ThreeColumnsEndEmphasized : oMap.ThreeColumnsMidEmphasized;

		if (typeof oMap[sLayout] === "object") {
			aNeededArrows = oMap[sLayout];
		}

		this._toggleButton("beginBack", aNeededArrows.indexOf("beginBack") !== -1);
		this._toggleButton("midForward", aNeededArrows.indexOf("midForward") !== -1);
		this._toggleButton("midBack", aNeededArrows.indexOf("midBack") !== -1);
		this._toggleButton("endForward", aNeededArrows.indexOf("endForward") !== -1);
	};

	/**
	 * Changes the visibility of a navigation button
	 * @param sButton
	 * @param bShow
	 * @private
	 */
	FlexibleColumnLayout.prototype._toggleButton = function (sButton, bShow) {
		this._$columnButtons[sButton].toggle(bShow);
	};

	/**
	 * Returns the maximum number of columns that can be displayed at once based on the control size and settings
	 * @returns {number}
	 * @private
	 */
	FlexibleColumnLayout.prototype._getMaxColumnsCount = function () {
		if (this._iControlWidth >= FlexibleColumnLayout.DESKTOP_BREAKPOINT) {
			if (this.getTwoColumnLayoutOnDesktop()) {
				return 2;
			}
			return 3;
		}

		if (this._iControlWidth >= FlexibleColumnLayout.TABLET_BREAKPOINT && this._iControlWidth < FlexibleColumnLayout.DESKTOP_BREAKPOINT) {
			return 2;
		}

		return 1;
	};

	// Begin column proxies

	FlexibleColumnLayout.prototype.getBeginColumnPages = function () {
		return this._getBeginColumn().getPages();
	};

	FlexibleColumnLayout.prototype.addBeginColumnPage = function (oPage) {
		this._getBeginColumn().addPage(oPage);
		return this;
	};

	FlexibleColumnLayout.prototype.insertBeginColumnPage = function (oPage, iIndex) {
		this._getBeginColumn().insertPage(oPage, iIndex);
		return this;
	};

	FlexibleColumnLayout.prototype.removeBeginColumnPage = function(oPage) {
		this._getBeginColumn().removePage(oPage);
		return this;
	};

	FlexibleColumnLayout.prototype.removeAllBeginColumnPages = function() {
		return this._getBeginColumn().removeAllPages();
	};

	// Mid column proxies

	FlexibleColumnLayout.prototype.getMidColumnPages = function () {
		return this.getAggregation("_midColumnNav") ? this._getMidColumn().getPages() : [];
	};

	FlexibleColumnLayout.prototype.addMidColumnPage = function (oPage) {
		this._getMidColumn().addPage(oPage);
		return this;
	};

	FlexibleColumnLayout.prototype.insertMidColumnPage = function (oPage, iIndex) {
		this._getMidColumn().insertPage(oPage, iIndex);
		return this;
	};

	FlexibleColumnLayout.prototype.removeMidColumnPage = function(oPage) {
		this._getMidColumn().removePage(oPage);
		return this;
	};

	FlexibleColumnLayout.prototype.removeAllMidColumnPages = function() {
		return this._getMidColumn().removeAllPages();
	};

	// End column proxies

	FlexibleColumnLayout.prototype.getEndColumnPages = function () {
		return this.getAggregation("_endColumnNav") ? this._getEndColumn().getPages() : [];
	};

	FlexibleColumnLayout.prototype.addEndColumnPage = function (oPage) {
		this._getEndColumn().addPage(oPage);
		return this;
	};

	FlexibleColumnLayout.prototype.insertEndColumnPage = function (oPage, iIndex) {
		this._getEndColumn().insertPage(oPage, iIndex);
		return this;
	};

	FlexibleColumnLayout.prototype.removeEndColumnPage = function(oPage) {
		this._getEndColumn().removePage(oPage);
		return this;
	};

	FlexibleColumnLayout.prototype.removeAllEndColumnPages = function() {
		return this._getEndColumn().removeAllPages();
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
	 * @param {string} sTransitionName
	 *         The type of the transition/animation to apply. This parameter can be omitted; then the default value is "slide" (horizontal movement from the right).
	 *         Other options are: "fade", "flip", and "show" and the names of any registered custom transitions.
	 *
	 *         None of the standard transitions is currently making use of any given transition parameters.
	 * @param {object} oData
	 *         This optional object can carry any payload data which should be made available to the target page. The beforeShow event on the target page will contain this data object as data property.
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
	 * @type sap.f.FlexibleColumnLayout
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FlexibleColumnLayout.prototype.to = function(pageId, transitionName, data, oTransitionParameters) {
		if (this._getBeginColumn().getPage(pageId)) {
			this._getBeginColumn().to(pageId, transitionName, data, oTransitionParameters);
		} else if (this._getMidColumn().getPage(pageId)) {
			this._getMidColumn().to(pageId, transitionName, data, oTransitionParameters);
		} else {
			this._getEndColumn().to(pageId, transitionName, data, oTransitionParameters);
		}
	};

	/**
	 * Navigates back to a page in the FlexibleColumnLayout.
	 * Columns are scanned for the page in the following order: <code>Begin</code>, <code>Mid</code>, <code>End</code>.
	 *
	 * Calling this navigation method, first triggers the (cancelable) navigate event on the SplitContainer,
	 * then the beforeHide pseudo event on the source page, beforeFirstShow (if applicable),
	 * and beforeShow on the target page. Later, after the transition has completed,
	 * the afterShow pseudo event is triggered on the target page and afterHide - on the page, which has been left.
	 * The given backData object is available in the beforeFirstShow, beforeShow, and afterShow event objects as data
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
	 * @type sap.f.FlexibleColumnLayout
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FlexibleColumnLayout.prototype.backToPage = function(pageId, backData, oTransitionParameters) {
		if (this._getBeginColumn().getPage(pageId)) {
			this._getBeginColumn().backToPage(pageId, backData, oTransitionParameters);
		} else if (this._getMidColumn().getPage(pageId)) {
			this._getMidColumn().backToPage(pageId, backData, oTransitionParameters);
		} else {
			this._getEndColumn().backToPage(pageId, backData, oTransitionParameters);
		}
	};

	/**
	 * Navigates to a given Begin column page.
	 *
	 * @param {string} sPageId
	 *         The screen to which drilldown should happen. The ID or the control itself can be given.
	 * @param {string} sTransitionName
	 *         The type of the transition/animation to apply. This parameter can be omitted; then the default value is "slide" (horizontal movement from the right).
	 *         Other options are: "fade", "flip", and "show" and the names of any registered custom transitions.
	 *
	 *         None of the standard transitions is currently making use of any given transition parameters.
	 * @param {object} oData
	 *         This optional object can carry any payload data which should be made available to the target page. The beforeShow event on the target page will contain this data object as data property.
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
	 * @type sap.f.FlexibleColumnLayout
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FlexibleColumnLayout.prototype.toBeginColumnPage = function(pageId, transitionName, data, oTransitionParameters) {
		this._getBeginColumn().to(pageId, transitionName, data, oTransitionParameters);
	};

	/**
	 * Navigates to a given Mid column page.
	 *
	 * @param {string} sPageId
	 *         The screen to which drilldown should happen. The ID or the control itself can be given.
	 * @param {string} sTransitionName
	 *         The type of the transition/animation to apply. This parameter can be omitted; then the default value is "slide" (horizontal movement from the right).
	 *         Other options are: "fade", "flip", and "show" and the names of any registered custom transitions.
	 *
	 *         None of the standard transitions is currently making use of any given transition parameters.
	 * @param {object} oData
	 *         This optional object can carry any payload data which should be made available to the target page. The beforeShow event on the target page will contain this data object as data property.
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
	 * @type sap.f.FlexibleColumnLayout
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FlexibleColumnLayout.prototype.toMidColumnPage = function(pageId, transitionName, data, oTransitionParameters) {
		this._getMidColumn().to(pageId, transitionName, data, oTransitionParameters);
	};

	/**
	 * Navigates to a given End column page.
	 *
	 * @param {string} sPageId
	 *         The screen to which drilldown should happen. The ID or the control itself can be given.
	 * @param {string} sTransitionName
	 *         The type of the transition/animation to apply. This parameter can be omitted; then the default value is "slide" (horizontal movement from the right).
	 *         Other options are: "fade", "flip", and "show" and the names of any registered custom transitions.
	 *
	 *         None of the standard transitions is currently making use of any given transition parameters.
	 * @param {object} oData
	 *         This optional object can carry any payload data which should be made available to the target page. The beforeShow event on the target page will contain this data object as data property.
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
	 * @type sap.f.FlexibleColumnLayout
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FlexibleColumnLayout.prototype.toEndColumnPage = function(pageId, transitionName, data, oTransitionParameters) {
		this._getEndColumn().to(pageId, transitionName, data, oTransitionParameters);
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
	 * @param {object} oTransitionParameter
	 *         This optional object can give additional information to the transition function, like the DOM element which triggered the transition or the desired transition duration.
	 *         The animation type can NOT be selected here - it is always the inverse of the "to" navigation.
	 *
	 *         In order to use the transitionParameters property, the data property must be used (at least "null" must be given) for a proper parameter order.
	 *
	 *         NOTE: it depends on the transition function how the object should be structured and which parameters are actually used to influence the transition.
	 * @type sap.ui.core.Control
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FlexibleColumnLayout.prototype.backToTopBeginColumn = function(backData, oTransitionParameters) {
		this._getBeginColumn().backToTop(backData, oTransitionParameters);
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
	 * @param {object} oTransitionParameter
	 *         This optional object can give additional information to the transition function, like the DOM element which triggered the transition or the desired transition duration.
	 *         The animation type can NOT be selected here - it is always the inverse of the "to" navigation.
	 *
	 *         In order to use the transitionParameters property, the data property must be used (at least "null" must be given) for a proper parameter order.
	 *
	 *         NOTE: it depends on the transition function how the object should be structured and which parameters are actually used to influence the transition.
	 * @type sap.ui.core.Control
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FlexibleColumnLayout.prototype.backToTopMidColumn = function(backData, oTransitionParameters) {
		this._getMidColumn().backToTop(backData, oTransitionParameters);
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
	 * @param {object} oTransitionParameter
	 *         This optional object can give additional information to the transition function, like the DOM element which triggered the transition or the desired transition duration.
	 *         The animation type can NOT be selected here - it is always the inverse of the "to" navigation.
	 *
	 *         In order to use the transitionParameters property, the data property must be used (at least "null" must be given) for a proper parameter order.
	 *
	 *         NOTE: it depends on the transition function how the object should be structured and which parameters are actually used to influence the transition.
	 * @type sap.ui.core.Control
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FlexibleColumnLayout.prototype.backToTopEndColumn = function(backData, oTransitionParameters) {
		this._getEndColumn().backToTop(backData, oTransitionParameters);
	};

	/**
	 * Returns the currently displayed Begin column page.
	 *
	 * @type sap.ui.core.Control
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FlexibleColumnLayout.prototype.getCurrentBeginColumnPage = function() {
		return this._getBeginColumn().getCurrentPage();
	};

	/**
	 * Returns the currently displayed Mid column page.
	 *
	 * @type sap.ui.core.Control
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FlexibleColumnLayout.prototype.getCurrentMidColumnPage = function() {
		return this._getMidColumn().getCurrentPage();
	};

	/**
	 * Returns the currently displayed End column page.
	 *
	 * @type sap.ui.core.Control
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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

		// Only update the nav container, if already created - else, the property will be applied on creation
		if (this.getAggregation("_midColumnNav")) {
			this._getMidColumn().setDefaultTransitionName(sTransition);
		}

		return this;
	};

	FlexibleColumnLayout.prototype.setDefaultTransitionNameEndColumn = function(sTransition) {
		this.setProperty("defaultTransitionNameEndColumn", sTransition, true);

		// Only update the nav container, if already created - else, the property will be applied on creation
		if (this.getAggregation("_endColumnNav")) {
			this._getEndColumn().setDefaultTransitionName(sTransition);
		}

		return this;
	};

	// STATIC MEMBERS

	// The margin between columns in pixels
	FlexibleColumnLayout.COLUMN_MARGIN = 8;

	// The width above which (inclusive) we are in desktop mode
	FlexibleColumnLayout.DESKTOP_BREAKPOINT = 1280;

	// The width above which (inclusive) we are in tablet mode
	FlexibleColumnLayout.TABLET_BREAKPOINT = 960;

	// Timeout of the adjust layout debounce function
	FlexibleColumnLayout.ADJUST_LAYOUT_TIMEOUT = 10;

	return FlexibleColumnLayout;

}, /* bExport= */ false);