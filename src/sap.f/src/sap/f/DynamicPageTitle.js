/*!
 * ${copyright}
 */

// Provides control sap.f.DynamicPageTitle.
sap.ui.define([
    "./library",
    "sap/ui/core/Control",
    "sap/ui/base/ManagedObjectObserver",
    "sap/m/library",
    "sap/m/Toolbar",
    "sap/m/ToolbarSeparator",
    "sap/m/OverflowToolbar",
    "sap/m/Button",
    "sap/ui/core/InvisibleText",
    "./DynamicPageTitleRenderer"
], function(
    library,
	Control,
	ManagedObjectObserver,
	mobileLibrary,
	Toolbar,
	ToolbarSeparator,
	OverflowToolbar,
	Button,
	InvisibleText,
	DynamicPageTitleRenderer
) {
	"use strict";

	// shortcut for sap.f.DynamicPageTitleArea
	var DynamicPageTitleArea = library.DynamicPageTitleArea,
		ToolbarStyle = mobileLibrary.ToolbarStyle;
	var oCore = sap.ui.getCore();

	/**
	 * Constructor for a new <code>DynamicPageTitle</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Title of the {@link sap.f.DynamicPage}.
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>DynamicPageTitle</code> control is part of the {@link sap.f.DynamicPage}
	 * family and is used to serve as title of the {@link sap.f.DynamicPage DynamicPage}.
	 *
	 * <h3>Usage</h3>
	 *
	 * The <code>DynamicPageTitle</code> can hold any control and displays the most important
	 * information regarding the object that will always remain visible while scrolling.
	 *
	 * <b>Note:</b> The <code>actions</code> aggregation accepts any UI5 control, but it`s
	 * recommended to use controls, suitable for {@link sap.m.Toolbar} and {@link sap.m.OverflowToolbar}.
	 *
	 * If the <code>toggleHeaderOnTitleClick</code> property of the {@link sap.f.DynamicPage DynamicPage}
	 * is set to <code>true</code>, the user can switch between the expanded/collapsed states of the
	 * {@link sap.f.DynamicPageHeader DynamicPageHeader} by clicking on the <code>DynamicPageTitle</code>
	 * or by using the expand/collapse visual indicators, positioned at the bottom of the
	 * <code>DynamicPageTitle</code> and the <code>DynamicPageHeader</code>.
	 *
	 * If set to <code>false</code>, the <code>DynamicPageTitle</code> is not clickable,
	 * the visual indicators are not available, and the app must provide other means for
	 * expanding/collapsing the <code>DynamicPageHeader</code>, if necessary.
	 *
	 * <h3>Responsive Behavior</h3>
	 *
	 * The responsive behavior of the <code>DynamicPageTitle</code> depends on the behavior of the
	 * content that is displayed.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.42
	 * @alias sap.f.DynamicPageTitle
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DynamicPageTitle = Control.extend("sap.f.DynamicPageTitle", /** @lends sap.f.DynamicPageTitle.prototype */ {
		metadata: {
			library: "sap.f",
			properties: {
				/**
				* Determines which of the <code>DynamicPageTitle</code> areas (Begin, Middle) is primary.
				*
				* <b>Note:</b> The primary area is shrinking at lower rate, remaining visible as much as it can.
				*
				* @since 1.50
				* @deprecated Since version 1.54. Please use the <code>areaShrinkRatio</code> property instead.
				* The value of <code>areaShrinkRatio</code> must be set in <code>Heading:Content:Actions</code> format
				* where Heading, Content and Actions are numbers greater than or equal to 0. The greater value a
				* section has the faster it shrinks when the screen size is being reduced.
				*
				* <code>primaryArea=Begin</code> can be achieved by setting a low number for the Heading area to
				* <code>areaShrinkRatio</code>, for example <code>1:1.6:1.6</code>.
				*
				* <code>primaryArea=Middle</code> can be achieved by setting a low number for the Content area to
				* <code>areaShrinkRatio</code>, for example <code>1.6:1:1.6</code>.
				*/
				primaryArea : {type: "sap.f.DynamicPageTitleArea", group: "Appearance", defaultValue: DynamicPageTitleArea.Begin},

				/**
				 * Assigns shrinking ratio to the <code>DynamicPageTitle</code> areas (Heading, Content, Actions).
				 * The greater value a section has the faster it shrinks when the screen size is being reduced.
				 *
				 * The value must be set in <code>Heading:Content:Actions</code> format where Title, Content and Actions
				 * are numbers greater than or equal to 0. If set to 0, the respective area will not shrink.
				 *
				 * For example, if <code>2:7:1</code> is set, the Content area will shrink seven times faster than
				 * the Actions area. So, when all three areas have width of 500px and the available space is reduced by 100px
				 * the Title area will reduced by 20px, the Content area - by 70px and the Actions area - by 10px.
				 *
				 * If all the areas have assigned values greater than 1, the numbers are scaled so that at least one of them
				 * is equal to 1. For example, value of <code>2:4:8</code> is equal to <code>1:2:4</code>.
				 *
				 * <Note:> When this property is set the <code>primaryArea</code> property has no effect.
				 *
				 * @since 1.54
				 */
				areaShrinkRatio : {type: "sap.f.DynamicPageTitleShrinkRatio", group: "Appearance", defaultValue: "1:1.6:1.6"}
			},
			aggregations: {

				/**
				 * The <code>heading</code> is positioned in the <code>DynamicPageTitle</code> left area
				 * and is displayed in both expanded and collapsed (snapped) states of the header.
				 * Use this aggregation to display a title (or any other UI5 control that serves
				 * as a heading) that has to be present in both expanded and collapsed states of the header.
				 *
				 * <b>Note:</b> <code>heading</code> is mutually exclusive with <code>snappedHeading</code>
				 * and <code>expandedHeading</code>. If <code>heading</code> is provided, both
				 * <code>snappedHeading</code> and <code>expandedHeading</code> are ignored.
				 * <code>heading</code> is useful when the content of <code>snappedHeading</code> and
				 * <code>expandedHeading</code> needs to be the same as it replaces them both.
				 */
				heading: {type: "sap.ui.core.Control", multiple: false, defaultValue: null},

				/**
				 * The <code>snappedHeading</code> is positioned in the <code>DynamicPageTitle</code> left area
				 * and is displayed when the header is in collapsed (snapped) state only.
				 * Use this aggregation to display a title (or any other UI5 control that serves
				 * as a heading) that has to be present in collapsed state only.
				 *
				 * <b>Note:</b> In order for <code>snappedHeading</code> to be taken into account,
				 * <code>heading</code> has to be empty. Combine <code>snappedHeading</code> with
				 * <code>expandedHeading</code> to switch content when the header switches state.
				 * @since 1.52
				 */
				snappedHeading: {type: "sap.ui.core.Control", multiple: false, defaultValue: null},

				/**
				 * The <code>expandedHeading</code> is positioned in the <code>DynamicPageTitle</code> left area
				 * and is displayed when the header is in expanded state only.
				 * Use this aggregation to display a title (or any other UI5 control that serves
				 * as a heading) that has to be present in expanded state only.
				 *
				 * <b>Note:</b> In order for <code>expandedHeading</code> to be taken into account,
				 * <code>heading</code> has to be empty. Combine <code>expandedHeading</code> with
				 * <code>snappedHeading</code> to switch content when the header switches state.
				 * @since 1.52
				 */
				expandedHeading: {type: "sap.ui.core.Control", multiple: false, defaultValue: null},

				/**
				 * The <code>DynamicPageTitle</code> actions.
				 * <br><b>Note:</b> The <code>actions</code> aggregation accepts any UI5 control, but it`s recommended to use controls,
				 * suitable for {@link sap.m.Toolbar} and {@link sap.m.OverflowToolbar}.
				 */
				actions: {type: "sap.ui.core.Control", multiple: true, singularName: "action"},

				/**
				 * The <code>DynamicPageTitle</code> navigation actions.
				 *
				 * <b>Note:</b> The <code>navigationActions</code> position depends on the control size.
				 * If the control size is 1280px or bigger, they are rendered right next to the <code>actions</code>.
				 * Otherwise, they are rendered in the top-right area, above the <code>actions</code>.
				 * If a large number of elements(buttons) are used, there could be visual degradations
				 * as the space for the <code>navigationActions</code> is limited.
				 * @since 1.52
				 */
				navigationActions: {type: "sap.m.Button", multiple: true, singularName: "navigationAction"},

				/**
				* The content is positioned in the <code>DynamicPageTitle</code> middle area
				* and displayed in both expanded and collapsed (snapped) states.
				* @since 1.50
				*/
				content: {type: "sap.ui.core.Control", multiple: true},

				/**
				 * The content that is displayed in the <code>DynamicPageTitle</code> in collapsed (snapped) state.
				 */
				snappedContent: {type: "sap.ui.core.Control", multiple: true},

				/**
				 * The content that is displayed in the <code>DynamicPageTitle</code> in expanded state.
				 */
				expandedContent: {type: "sap.ui.core.Control", multiple: true},

				/**
				 * The breadcrumbs displayed in the <code>DynamicPageTitle</code> top-left area.
				 * @since 1.52
				 */
				breadcrumbs: {type: "sap.m.IBreadcrumbs", multiple: false},

				/**
				 * Internal <code>OverflowToolbar</code> for the <code>DynamicPageTitle</code> actions.
				 */
				_actionsToolbar: {type: "sap.m.OverflowToolbar", multiple: false, visibility: "hidden"},

				/**
				 * Internal <code>Toolbar</code> for the <code>DynamicPageTitle</code> navigation actions.
				 * @since 1.52
				 */
				_navActionsToolbar: {type: "sap.m.Toolbar", multiple: false, visibility: "hidden"},

				/**
				 * Internal <code>ToolbarSeparator</code> to separate the <code>actions</code> and <code>navigationActions</code>.
				 * @since 1.52
				 */
				_navActionsToolbarSeparator: {type: "sap.m.ToolbarSeparator", multiple: false, visibility: "hidden"},

				/**
				 * Visual indication for expanding.
				 * @since 1.52
				 */
				_expandButton: {type: "sap.m.Button", multiple: false,  visibility: "hidden"}
			},
			events: {
				/**
				 * Fired when the title state (expanded/collapsed) is toggled by user interaction.
				 * For example, scrolling, title clicking/tapping, using expand/collapse button.
				 *
				 * Also fired when the developer toggles the title state by programmatically
				 * changing the scroll position of the scrollbar of <code>DynamicPage</code>.
				 *
				 * @since 1.54
				 */
				stateChange: {
					parameters: {
						/**
						 * Whether the title was expanded (true) or collapsed (false).
						 */
						isExpanded: {type : "boolean"}
					}
				}
			},
			designtime: "sap/f/designtime/DynamicPageTitle.designtime"
		}
	});

	function exists(vObject) {
		if (arguments.length === 1) {
			// Check if vObject is an Array or jQuery empty object,
			// by looking for the inherited property "length" via the "in" operator.
			// If yes - check if the "length" is positive.
			// If not - cast the vObject to Boolean.
			return vObject && ("length" in vObject) ? vObject.length > 0 : !!vObject;
		}

		return Array.prototype.slice.call(arguments).every(function (oObject) {
			return exists(oObject);
		});
	}

	/* ========== STATIC MEMBERS  ========== */

	DynamicPageTitle.NAV_ACTIONS_PLACEMENT_BREAK_POINT = 1280; // px.

	DynamicPageTitle.PRIMARY_AREA_MIDDLE_SHRINK_FACTORS = {
		headingAreaShrinkFactor: 1.6,
		contentAreaShrinkFactor: 1,
		actionsAreaShrinkFactor: 1.6
	};

	DynamicPageTitle.TOGGLE_HEADER_TEXT_ID = InvisibleText.getStaticId("sap.f", "TOGGLE_HEADER");
	DynamicPageTitle.EXPANDED_HEADER_TEXT_ID = InvisibleText.getStaticId("sap.f", "EXPANDED_HEADER");
	DynamicPageTitle.COLLAPSED_HEADER_TEXT_ID = InvisibleText.getStaticId("sap.f", "SNAPPED_HEADER");

	/**
	 * Flushes the given control into the given container.
	 * @param {Element} oContainerDOM
	 * @param {sap.ui.core.Control} oControlToRender
	 * @private
	 */
	DynamicPageTitle._renderControl = function (oContainerDOM, oControlToRender) {
		var oRenderManager;

		if (!oControlToRender || !oContainerDOM) {
			return;
		}

		oRenderManager = oCore.createRenderManager();
		oRenderManager.renderControl(oControlToRender);
		oRenderManager.flush(oContainerDOM);
		oRenderManager.destroy();
	};


	function isFunction(oObject) {
		return typeof oObject === "function";
	}

	/* ========== LIFECYCLE METHODS  ========== */

	DynamicPageTitle.prototype.init = function () {
		this._bExpandedState = true;
		this._bShowExpandButton = false;
		this._bIsFocusable = true;
		this._fnActionSubstituteParentFunction = function () {
			return this;
		}.bind(this);

		this._bNavigationActionsInTopArea = false;
		this._oRB = oCore.getLibraryResourceBundle("sap.f");

		this._oObserver = new ManagedObjectObserver(DynamicPageTitle.prototype._observeChanges.bind(this));
		this._oObserver.observe(this, {
			aggregations: [
				"content",
				"_actionsToolbar"
			]
		});

		this._oRB = sap.ui.getCore().getLibraryResourceBundle("sap.f");
	};

	DynamicPageTitle.prototype.onBeforeRendering = function () {
		this._getActionsToolbar();
		this._observeControl(this.getBreadcrumbs());
	};

	DynamicPageTitle.prototype.onAfterRendering = function () {
		this._cacheDomElements();
		this._toggleState(this._bExpandedState);
		this._doNavigationActionsLayout();
	};

	DynamicPageTitle.prototype.exit = function () {
		if (this._oObserver) {
			this._oObserver.disconnect();
			this._oObserver = null;
		}
	};

	/* ========== PUBLIC METHODS  ========== */

	DynamicPageTitle.prototype.setPrimaryArea = function (sArea) {
		var sAreaShrinkRatio = this.getAreaShrinkRatio(),
			oShrinkFactorsInfo = this._getShrinkFactorsObject(),
			sAreaShrinkRatioDefaultValue = this.getMetadata().getProperty("areaShrinkRatio").getDefaultValue();

		if (!this.getDomRef()) {
			return this.setProperty("primaryArea", sArea, true);
		}

		if (sAreaShrinkRatio !== sAreaShrinkRatioDefaultValue) {
			return this.setProperty("primaryArea", sArea, true);
		}

		// areaShrinkRatio is not set and primaryArea is set to Begin - use areaShrinkRatio default values
		if (sArea === DynamicPageTitleArea.Begin) {
			this._setShrinkFactors(oShrinkFactorsInfo.headingAreaShrinkFactor,
									oShrinkFactorsInfo.contentAreaShrinkFactor,
									oShrinkFactorsInfo.actionsAreaShrinkFactor);
		} else { // areaShrinkRatio is not set and primaryArea is set to Middle - use primaryArea values
			this._setShrinkFactors(DynamicPageTitle.PRIMARY_AREA_MIDDLE_SHRINK_FACTORS.headingAreaShrinkFactor,
									DynamicPageTitle.PRIMARY_AREA_MIDDLE_SHRINK_FACTORS.contentAreaShrinkFactor,
									DynamicPageTitle.PRIMARY_AREA_MIDDLE_SHRINK_FACTORS.actionsAreaShrinkFactor);
		}

		return this.setProperty("primaryArea", sArea, true);
	};

	/**
	 * Sets the value of the <code>areaShrinkRatio</code> property.
	 *
	 * @param {sap.f.DynamicPageTitleShrinkRatio} sAreaShrinkRatio - new value of the <code>areaShrinkRatio</code>
	 * @return {sap.f.DynamicPageTitle} <code>this</code> to allow method chaining
	 * @public
	 * @since 1.54
	 */
	DynamicPageTitle.prototype.setAreaShrinkRatio = function (sAreaShrinkRatio) {
		sAreaShrinkRatio = this.validateProperty("areaShrinkRatio", sAreaShrinkRatio);

		// suppress control invalidation and only update the CSS flex-shrink values
		this.setProperty("areaShrinkRatio", sAreaShrinkRatio, true);

		var oShrinkFactorsInfo = this._getShrinkFactorsObject();

		if (this.getPrimaryArea() === DynamicPageTitleArea.Middle) {
			jQuery.sap.log.warning("DynamicPageTitle :: Property primaryArea is disregarded when areaShrinkRatio is set.", this);
		}

		// scale priority factors
		if (oShrinkFactorsInfo.headingAreaShrinkFactor > 1 && oShrinkFactorsInfo.contentAreaShrinkFactor > 1 && oShrinkFactorsInfo.actionsAreaShrinkFactor > 1) {
			jQuery.sap.log.warning("DynamicPageTitle :: One of the shrink factors should be set to 1.", this);
		}

		this._setShrinkFactors(oShrinkFactorsInfo.headingAreaShrinkFactor,
								oShrinkFactorsInfo.contentAreaShrinkFactor,
								oShrinkFactorsInfo.actionsAreaShrinkFactor);

		return this;
	};

	/**
	 * Fires the <code>DynamicPageTitle</code> press event.
	 * @param {jQuery.Event} oEvent The <code>tap</code> event object
	 */
	DynamicPageTitle.prototype.ontap = function (oEvent) {
		var oSrcControl = oEvent.srcControl;

		if (oSrcControl === this
			|| oSrcControl === this.getAggregation("_actionsToolbar")
			|| oSrcControl === this.getAggregation("breadcrumbs")) {
			this.fireEvent("_titlePress");
		}
	};

	DynamicPageTitle.prototype.onmouseover = function () {
		this.fireEvent("_titleMouseOver");
	};

	DynamicPageTitle.prototype.onmouseout = function () {
		this.fireEvent("_titleMouseOut");
	};

	/**
	 * Fires the <code>DynamicPageTitle</code> press event.
	 * @param {jQuery.Event} oEvent The SPACE keyboard key press event object
	 */
	DynamicPageTitle.prototype.onsapspace = function (oEvent) {
		this.onsapenter(oEvent);
	};

	/**
	 * Fires the <code>DynamicPageTitle</code> press event.
	 * @param {jQuery.Event} oEvent The ENTER keyboard key press event object
	 */
	DynamicPageTitle.prototype.onsapenter = function (oEvent) {
		if (oEvent.srcControl === this) {
			this.fireEvent("_titlePress");
		}
	};

	/* ========== DynamicPageTitle actions aggregation methods ========== */

	["addAction", "insertAction", "removeAction", "indexOfAction", "removeAllActions", "destroyActions", "getActions"]
		.forEach(function (sMethod) {
			DynamicPageTitle.prototype[sMethod] = function (oControl) {
				var oToolbar = this._getActionsToolbar(),
					sToolbarMethod = sMethod.replace(/Actions?/, "Content"),
					bSeparatorVisibilityUpdateNeeded = true,
					vResult;

				if (sMethod === "addAction" || sMethod === "insertAction") {
					if (!this._actionExists(oControl, "actions")) {
						oToolbar[sToolbarMethod].apply(oToolbar, arguments);
						this._preProcessAction(oControl, "actions");
					}
					vResult = this;
				} else if (sMethod === "removeAction") {
					this._postProcessAction(oControl);
				} else if (sMethod === "removeAllActions") {
					this.getActions().forEach(this._postProcessAction, this);
				} else if (sMethod === "destroyActions") {
					this.getActions().forEach(this._postProcessAction, this);
					oToolbar[sToolbarMethod].apply(oToolbar, arguments);
					vResult = this;
				} else if (sMethod === "getActions") {
					bSeparatorVisibilityUpdateNeeded = false;
				}

				vResult = vResult || oToolbar[sToolbarMethod].apply(oToolbar, arguments);

				bSeparatorVisibilityUpdateNeeded && this._updateSeparatorVisibility();

				return vResult;
			};
		});

	/* ========== DynamicPageTitle navigationActions aggregation methods ========== */

	[
		"addNavigationAction",
		"insertNavigationAction",
		"removeNavigationAction",
		"indexOfNavigationAction",
		"removeAllNavigationActions",
		"destroyNavigationActions",
		"getNavigationActions"
	].forEach(function (sMethod) {
			DynamicPageTitle.prototype[sMethod] = function (oControl) {
				var oToolbar = this._getNavigationActionsToolbar(),
					sToolbarMethod = sMethod.replace(/NavigationActions?/, "Content"),
					bTopAreaVisibilityUpdateNeeded = true,
					vResult;

				if (sMethod === "addNavigationAction" || sMethod === "insertNavigationAction") {
					if (!this._actionExists(oControl, "navigationActions")) {
						oToolbar[sToolbarMethod].apply(oToolbar, arguments);
						this._preProcessAction(oControl, "navigationActions");
					}
					vResult = this;
				} else if (sMethod === "removeNavigationAction") {
					this._postProcessAction(oControl);
				} else if (sMethod === "removeAllNavigationActions") {
					this.getNavigationActions().forEach(this._postProcessAction, this);
				} else if (sMethod === "destroyNavigationActions") {
					this.getNavigationActions().forEach(this._postProcessAction, this);
					oToolbar[sToolbarMethod].apply(oToolbar, arguments);
					vResult = this;
				} else if (sMethod === "getNavigationActions") {
					bTopAreaVisibilityUpdateNeeded = false;
				}

				vResult = vResult || oToolbar[sToolbarMethod].apply(oToolbar, arguments);

				bTopAreaVisibilityUpdateNeeded && this._updateTopAreaVisibility();

				return vResult;
			};
		});

	/* ========== PRIVATE METHODS  ========== */

	/**
	 * Checks if an action already exists in <code>DynamicPageTitle</code> actions/navigationActions.
	 * @param {sap.ui.core.Control} oAction
	 * @param {String} sAggregationName
	 * @returns {Boolean}
	 * @private
	 */
	DynamicPageTitle.prototype._actionExists = function (oAction, sAggregationName) {
		return this.getMetadata().getAggregation(sAggregationName).get(this).indexOf(oAction) > -1;
	};

	/**
	 * Caches the DOM elements in a jQuery wrapper for later reuse.
	 * @private
	 */
	DynamicPageTitle.prototype._cacheDomElements = function () {
		this.$topNavigationActionsArea = this.$("topNavigationArea");
		this.$mainNavigationActionsArea = this.$("mainNavigationArea");
		this.$beginArea = this.$("left-inner");
		this.$middleArea = this.$("content");
		this.$snappedHeadingWrapper = this.$("snapped-heading-wrapper");
		this.$expandHeadingWrapper = this.$("expand-heading-wrapper");
		this.$snappedWrapper = this.$("snapped-wrapper");
		this.$expandWrapper = this.$("expand-wrapper");
	};

	/**
	 * Lazily retrieves the internal <code>_actionsToolbar</code> aggregation.
	 * @returns {sap.m.OverflowToolbar}
	 * @private
	 */
	DynamicPageTitle.prototype._getActionsToolbar = function () {
		if (!this.getAggregation("_actionsToolbar")) {
			this.setAggregation("_actionsToolbar", new OverflowToolbar({
				id: this.getId() + "-_actionsToolbar",
				style: ToolbarStyle.Clear
			}).addStyleClass("sapFDynamicPageTitleActionsBar"), true); // suppress invalidate, as this is always called onBeforeRendering
		}

		return this.getAggregation("_actionsToolbar");
	};

	/**
	 * Lazily retrieves the internal <code>_navActionsToolbar</code> aggregation.
	 * @returns {sap.m.Toolbar}
	 * @private
	 */
	DynamicPageTitle.prototype._getNavigationActionsToolbar = function () {
		if (!this.getAggregation("_navActionsToolbar")) {
			this.setAggregation("_navActionsToolbar", new Toolbar({
				id: this.getId() + "-navActionsToolbar",
				style: ToolbarStyle.Clear
			}).addStyleClass("sapFDynamicPageTitleActionsBar"), true);
		}

		return this.getAggregation("_navActionsToolbar");
	};

	/**
	 * Lazily retrieves the internal <code>_navActionsToolbarSeparator</code> aggregation.
	 * @returns {sap.m.Toolbar}
	 * @private
	 */
	DynamicPageTitle.prototype._getToolbarSeparator = function () {
		if (!this.getAggregation("_navActionsToolbarSeparator")) {
			this.setAggregation("_navActionsToolbarSeparator", new ToolbarSeparator({
				id: this.getId() + "-separator"
			}), true);
		}

		return this.getAggregation("_navActionsToolbarSeparator");
	};

	/**
	 * Toggles the <code>DynamicPageTitle</code>'s <code>tabindex</code> according to the provided state.
	 * @param {Boolean} bFocusable
	 * @private
	 */
	DynamicPageTitle.prototype._toggleFocusableState = function (bFocusable) {
		var $oTitle = this.$();

		this._bIsFocusable = bFocusable;
		bFocusable ? $oTitle.attr("tabindex", 0) : $oTitle.removeAttr("tabindex");
	};

	/* ========== DynamicPageTitle actions and navigationActions processing ========== */

	/**
	 * Pre-processes a <code>DynamicPageTitle</code> action before inserting it in the aggregation.
	 * The action would returns the <code>DynamicPageTitle</code> as its parent, rather than its real parent (the <code>OverflowToolbar</code>).
	 * This way, it looks like the <code>DynamicPageTitle</code> aggregates the actions.
	 * @param {sap.ui.core.Control} oAction
	 * @param {string} sParentAggregationName
	 * @private
	 */
	DynamicPageTitle.prototype._preProcessAction = function (oAction, sParentAggregationName) {
		if (isFunction(oAction._fnOriginalGetParent)) {
			return;
		}

		this._observeControl(oAction);

		oAction._fnOriginalGetParent = oAction.getParent;
		oAction.getParent = this._fnActionSubstituteParentFunction;

		oAction._sOriginalParentAggregationName = oAction.sParentAggregationName;
		oAction.sParentAggregationName = sParentAggregationName;
	};

	/**
	 * Post-processes a <code>DynamicPageTitle</code> action before removing it from the aggregation, so it returns its real parent (the <code>OverflowToolbar</code>),
	 * thus allowing proper processing by the framework.
	 * @param {sap.ui.core.Control} oAction
	 * @private
	 */
	DynamicPageTitle.prototype._postProcessAction = function (oAction) {
		if (!isFunction(oAction._fnOriginalGetParent)) {
			return;
		}

		this._unobserveControl(oAction);

		// The runtime adaptation tipically removes and then adds aggregations multiple times.
		// That is why we need to make sure that the controls are in their previous state
		// when preprocessed. Otherwise the wrong parent aggregation name is passed
		oAction.getParent = oAction._fnOriginalGetParent;
		oAction._fnOriginalGetParent = null;

		oAction.sParentAggregationName = oAction._sOriginalParentAggregationName;
		oAction._sOriginalParentAggregationName = null;
	};

	/**
	 * Starts observing the <code>visible</code> property.
	 * @param {sap.ui.core.Control} oControl
	 * @private
	 */
	DynamicPageTitle.prototype._observeControl = function(oControl) {
		this._oObserver.observe(oControl, {
			properties: ["visible"]
		});
	};

	/**
	 * Stops observing the <code>visible</code> property.
	 * @param {sap.ui.core.Control} oControl
	 * @private
	 */
	DynamicPageTitle.prototype._unobserveControl = function(oControl) {
		this._oObserver.unobserve(oControl, {
			properties: ["visible"]
		});
	};

	/* ========== DynamicPageTitle navigationActions placement methods ========== */

	/**
	 * Renders the <code>navigationActions</code>, depending on the <code>DynamicPageTitle</code> width.
	 * <b>Note</b> The controls are rendered either in the <code>DynamicPageTitle</code> top-right area
	 * or <code>DynamicPageTitle</code> main area.
	 * The method is called <code>onAfterRendering</code>.
	 * @private
	 */
	DynamicPageTitle.prototype._doNavigationActionsLayout = function () {
		var bRenderNavigationActionsInTopArea,
			oNavigationActionsContainerDOM,
			oNavigationActionsBar;

		if (this.getNavigationActions().length === 0) {
			return;
		}

		oNavigationActionsBar = this._getNavigationActionsToolbar();
		bRenderNavigationActionsInTopArea = this._shouldRenderNavigationActionsInTopArea();

		if (bRenderNavigationActionsInTopArea) {
			oNavigationActionsContainerDOM = this.$topNavigationActionsArea[0]; // Element should be rendered and cached already.
		} else {
			oNavigationActionsContainerDOM = this.$mainNavigationActionsArea[0]; // Element should be rendered and cached already.
		}

		this._bNavigationActionsInTopArea = bRenderNavigationActionsInTopArea;

		DynamicPageTitle._renderControl(oNavigationActionsContainerDOM, oNavigationActionsBar);
		this._updateSeparatorVisibility();
	};

	/**
	 * Toggles navigation actions placement change if certain preconditions are met.
	 *
	 * @param {Number} iCurrentWidth
	 * @private
	 */
	DynamicPageTitle.prototype._updateTopAreaVisibility = function (iCurrentWidth) {
		var bNavigationActionsAreInTopArea = this._areNavigationActionsInTopArea(),
			bNavigationActionsShouldBeInTopArea = this._shouldRenderNavigationActionsInTopArea(iCurrentWidth),
			bHasVisibleBreadcrumbs = this.getBreadcrumbs() && this.getBreadcrumbs().getVisible(),
			bShoudShowTopArea = bHasVisibleBreadcrumbs || bNavigationActionsShouldBeInTopArea,
			bShouldChangeNavigationActionsPlacement = this.getNavigationActions().length > 0 && (bNavigationActionsShouldBeInTopArea ^ bNavigationActionsAreInTopArea);

		this._toggleTopAreaVisibility(bShoudShowTopArea);

		if (bShouldChangeNavigationActionsPlacement) {
			this._toggleNavigationActionsPlacement(bNavigationActionsShouldBeInTopArea);
		} else {
			this._updateSeparatorVisibility();
		}
	};

	/**
	 * Handles control re-sizing.
	 * <b>Note:</b> The method is called by the parent <code>DynamicPage</code>.
	 * @param {Number} iCurrentWidth
	 * @private
	 */
	DynamicPageTitle.prototype._onResize = function (iCurrentWidth) {
		this._updateTopAreaVisibility(iCurrentWidth);
	};

	/**
	 * Updates the <code>navigationActions</code> position.
	 * The action will be either placed in the <code>DynamicPageTitle</code> top-right area or in the main-right area.
	 * @param {boolean} bShowActionsInTopArea
	 * @private
	 */
	DynamicPageTitle.prototype._toggleNavigationActionsPlacement = function (bShowActionsInTopArea) {
		this["_showNavigationActionsIn" + (bShowActionsInTopArea ? "Top" : "Main") +  "Area"]();
		this._updateSeparatorVisibility();
	};

	/**
	 * Shows the <code>navigationActions</code> in the <code>DynamicPageTitle</code> top-right area.
	 * @private
	 */
	DynamicPageTitle.prototype._showNavigationActionsInTopArea = function () {
		var oNavigationBar = this._getNavigationActionsToolbar();

		if (this.$topNavigationActionsArea && this.$topNavigationActionsArea.length > 0) {
			this.$topNavigationActionsArea.html(oNavigationBar.$());
		}

		this._bNavigationActionsInTopArea = true;
	};

	/**
	 * Shows the <code>navigationActions</code> in the <code>DynamicPageTitle</code> main right area.
	 * @private
	 */
	DynamicPageTitle.prototype._showNavigationActionsInMainArea = function () {
		var oNavigationBar = this._getNavigationActionsToolbar();

		if (this.$mainNavigationActionsArea && this.$mainNavigationActionsArea.length > 0) {
			this.$mainNavigationActionsArea.html(oNavigationBar.$());
		}

		this._bNavigationActionsInTopArea = false;
	};

	DynamicPageTitle.prototype._areNavigationActionsInTopArea = function () {
		return this._bNavigationActionsInTopArea;
	};

	/**
	 * Updates the <code>ToolbarSeparator</code> visibility.
	 * The <code>ToolbarSeparator</code> separates the <code>actions</code> and the <code>navigationActions</code>.
	 * @private
	 */
	DynamicPageTitle.prototype._updateSeparatorVisibility = function() {
		if (this.getDomRef()) {
			this._getToolbarSeparator().toggleStyleClass("sapUiHidden", !this._shouldShowSeparator());
		}
	};

	/**
	 * Updates the top title area visibility.
	 *
	 * @param {Boolean} bShoudShowTopArea
	 * @private
	 */
	DynamicPageTitle.prototype._toggleTopAreaVisibility = function(bShoudShowTopArea) {
		if (this.getDomRef()) {
			this.$("top").toggleClass("sapUiHidden", !bShoudShowTopArea);
		}
	};

	/**
	 * Determines if the <code>ToolbarSeparator</code> should be displayed.
	 * @returns {Boolean}
	 * @private
	 */
	DynamicPageTitle.prototype._shouldShowSeparator = function() {
		var bHasVisibleActions,
			bHasVisibleNavigationActions;

		if (this._bNavigationActionsInTopArea) {
			return false;
		}

		bHasVisibleActions = this._getVisibleActions().length > 0;
		bHasVisibleNavigationActions = this._getVisibleNavigationActions().length > 0;

		return bHasVisibleActions && bHasVisibleNavigationActions;
	};

	/**
	 * Returns an array of the visible <code>actions</code>.
	 * @returns {Array}
	 * @private
	 */
	DynamicPageTitle.prototype._getVisibleActions = function() {
		return this.getActions().filter(function(oAction){
			return oAction.getVisible();
		});
	};

	/**
	 * Returns an array of the visible <code>navigationActions</code>.
	 * @returns {Array}
	 * @private
	 */
	DynamicPageTitle.prototype._getVisibleNavigationActions = function() {
		return this.getNavigationActions().filter(function(oAction){
			return oAction.getVisible();
		});
	};

	/**
	 * Sets flex-shrink CSS style to the Heading, Content and Actions areas
	 * @param {Number} fHeadingFactor - Heading shrink factor
	 * @param {Number} fContentFactor - Content shrink factor
	 * @param {Number} fActionsFactor - Actions shrink factor
	 * @private
	 */
	DynamicPageTitle.prototype._setShrinkFactors = function(fHeadingFactor, fContentFactor, fActionsFactor) {
		this.$("left-inner").css("flex-shrink", fHeadingFactor);
		this.$("content").css("flex-shrink", fContentFactor);
		this.$("mainActions").css("flex-shrink", fActionsFactor);
	};

	/**
	 * Determines if the <code>navigationActions</code> should be rendered in the top area.
	 * @param {Number} iCurrentWidth
	 * @returns {Boolean}
	 * @private
	 */
	DynamicPageTitle.prototype._shouldRenderNavigationActionsInTopArea = function (iCurrentWidth) {
		var iWidth,
			bHasVisibleActions,
			bHasVisibleBreadcrumbs;

		if (this._getVisibleNavigationActions().length === 0) {
			return false;
		}

		iWidth = iCurrentWidth ? iCurrentWidth : this._getWidth();
		bHasVisibleActions = this._getVisibleActions().length > 0;
		bHasVisibleBreadcrumbs = this.getBreadcrumbs() && this.getBreadcrumbs().getVisible();

		return iWidth < DynamicPageTitle.NAV_ACTIONS_PLACEMENT_BREAK_POINT && (bHasVisibleBreadcrumbs || bHasVisibleActions);
	};

	/* ========== DynamicPageTitle expand and snapped content ========== */

	/**
	 * Toggles the title state to expanded (if bExpanded=true) or to snapped otherwise
	 * @param bExpanded
	 * @param {boolean} bUserInteraction - indicates if toggleState was caused by user interaction (scroll, collapse button press, etc.)
	 * @private
	 */
	DynamicPageTitle.prototype._toggleState = function (bExpanded, bUserInteraction) {
		var oldExpandedState = this._bExpandedState;

		this._bExpandedState = bExpanded;

		// Snapped content
		if (exists(this.getSnappedContent())) {
			this.$snappedWrapper.toggleClass("sapUiHidden", bExpanded);
			this.$snappedWrapper.parent().toggleClass("sapFDynamicPageTitleMainSnapContentVisible", !bExpanded);
		}

		// Snapped heading
		if (exists(this.getSnappedHeading())) {
			this.$snappedHeadingWrapper.toggleClass("sapUiHidden", bExpanded);
		}

		// Expanded content
		if (exists(this.getExpandedContent())) {
			this.$expandWrapper.toggleClass("sapUiHidden", !bExpanded);
			this.$expandWrapper.parent().toggleClass("sapFDynamicPageTitleMainExpandContentVisible", bExpanded);
		}

		// Expanded heading
		if (exists(this.getExpandedHeading())) {
			this.$expandHeadingWrapper.toggleClass("sapUiHidden", !bExpanded);
		}

		if (bUserInteraction && oldExpandedState !== bExpanded) {
			this.fireEvent("stateChange", {isExpanded: bExpanded});
		}
	};

	/* ========== DynamicPageTitle expand indicator ========== */

	/**
	 * Lazily retrieves the <code>expandButton</code> aggregation.
	 * @returns {sap.m.Button}
	 * @private
	 */
	DynamicPageTitle.prototype._getExpandButton = function () {
		if (!this.getAggregation("_expandButton")) {
			var oExpandButton = new Button({
				id: this.getId() + "-expandBtn",
				icon: "sap-icon://slim-arrow-down",
				press: this._onExpandButtonPress.bind(this),
				tooltip: this._oRB.getText("EXPAND_HEADER_BUTTON_TOOLTIP")
			}).addStyleClass("sapFDynamicPageToggleHeaderIndicator sapUiHidden");
			this.setAggregation("_expandButton", oExpandButton, true);
		}

		return this.getAggregation("_expandButton");
	};

	/**
	 * Handles <code>expandButton</code> press.
	 * @private
	 */
	DynamicPageTitle.prototype._onExpandButtonPress = function () {
		this.fireEvent("_titleVisualIndicatorPress");
	};

	/**
	 * Toggles the <code>expandButton</code> visibility.
	 * @param {boolean} bToggle
	 * @private
	 */
	DynamicPageTitle.prototype._toggleExpandButton = function (bToggle) {
		this._setShowExpandButton(bToggle);
		this._getExpandButton().$().toggleClass("sapUiHidden", !bToggle);
	};

	/**
	 * Returns the private <code>bShowExpandButton</code> property.
	 * @returns {boolean}
	 * @private
	 */
	DynamicPageTitle.prototype._getShowExpandButton = function () {
		return this._bShowExpandButton;
	};

	/**
	 * Sets the private <code>bShowExpandButton</code> property.
	 * @param {boolean} bValue
	 * @private
	 */
	DynamicPageTitle.prototype._setShowExpandButton = function (bValue) {
		this._bShowExpandButton = !!bValue;
	};

	/**
	 * Focuses the <code>expandButton</code> button.
	 * @private
	 */
	DynamicPageTitle.prototype._focusExpandButton = function () {
		this._getExpandButton().$().focus();
	};

	/**
	 * Returns the <code>DynamicPageTitle</code> width
	 * @returns {number}
	 * @private
	 */
	DynamicPageTitle.prototype._getWidth = function () {
		return this.$().outerWidth();
	};

	/**
	* Determines the <code>DynamicPageTitle</code> state.
	* @returns {Object}
	* @private
	*/
	DynamicPageTitle.prototype._getState = function () {
		var bHasActions = this.getActions().length > 0,
			bHasNavigationActions = this.getNavigationActions().length > 0,
			aContent = this.getContent(),
			aSnapContent = this.getSnappedContent(),
			aExpandContent = this.getExpandedContent(),
			bHasExpandedContent = aExpandContent.length > 0,
			bHasSnappedContent = aSnapContent.length > 0,
			oShrinkFactorsInfo = this._getShrinkFactorsObject(),
			oExpandButton = this._getExpandButton(),
			oBreadcrumbs = this.getBreadcrumbs(),
			bHasTopContent = oBreadcrumbs || bHasNavigationActions,
			bHasOnlyBreadcrumbs = !!(oBreadcrumbs && !bHasNavigationActions),
			bHasOnlyNavigationActions = bHasNavigationActions && !oBreadcrumbs,
			sAreaShrinkRatioDefaultValue = this.getMetadata().getProperty("areaShrinkRatio").getDefaultValue(),
			oParent = this.getParent(),
			bIsToggleable = isFunction(oParent.getToggleHeaderOnTitleClick) ? oParent.getToggleHeaderOnTitleClick() : false;

		// if areaShrinkRatio is set to default value (or not set at all) and primaryArea is set,
		// use shrink factors defined for primaryArea
		if (this.getAreaShrinkRatio() === sAreaShrinkRatioDefaultValue && this.getPrimaryArea() === DynamicPageTitleArea.Middle) {
			oShrinkFactorsInfo.headingAreaShrinkFactor = DynamicPageTitle.PRIMARY_AREA_MIDDLE_SHRINK_FACTORS.headingAreaShrinkFactor;
			oShrinkFactorsInfo.contentAreaShrinkFactor = DynamicPageTitle.PRIMARY_AREA_MIDDLE_SHRINK_FACTORS.contentAreaShrinkFactor;
			oShrinkFactorsInfo.actionsAreaShrinkFactor = DynamicPageTitle.PRIMARY_AREA_MIDDLE_SHRINK_FACTORS.actionsAreaShrinkFactor;
		}

		oExpandButton.toggleStyleClass("sapUiHidden", !this._getShowExpandButton());

		return {
			id: this.getId(),
			actionBar: this._getActionsToolbar(),
			navigationBar: this._getNavigationActionsToolbar(),
			hasActions: bHasActions,
			hasNavigationActions: bHasNavigationActions,
			content: aContent,
			hasContent: aContent.length > 0,
			heading: this.getHeading(),
			snappedHeading: this.getSnappedHeading(),
			expandedHeading: this.getExpandedHeading(),
			expandButton: oExpandButton,
			snappedContent: aSnapContent,
			expandedContent: aExpandContent,
			hasSnappedContent:bHasSnappedContent,
			hasExpandedContent: bHasExpandedContent,
			hasAdditionalContent: bHasExpandedContent || bHasSnappedContent,
			isSnapped: !this._bExpandedState,
			headingAreaShrinkFactor: oShrinkFactorsInfo.headingAreaShrinkFactor,
			contentAreaShrinkFactor: oShrinkFactorsInfo.contentAreaShrinkFactor,
			actionsAreaShrinkFactor: oShrinkFactorsInfo.actionsAreaShrinkFactor,
			ariaLabelledByIDs: bIsToggleable ? this._getARIALabelReferences(this._bExpandedState) : "",
			breadcrumbs: this.getBreadcrumbs(),
			separator: this._getToolbarSeparator(),
			hasTopContent: bHasTopContent,
			hasOnlyBreadcrumbs: bHasOnlyBreadcrumbs,
			hasOnlyNavigationActions: bHasOnlyNavigationActions,
			contentAreaFlexBasis: this._sContentAreaFlexBasis,
			actionsAreaFlexBasis: this._sActionsAreaFlexBasis,
			isFocusable: this._bIsFocusable
		};
	};

	/**
	 * Returns the value of the <code>areaShrinkRatio</code> property in the format of an Object.
	 *
	 * @returns {Object} Object with 3 fields representing the shrink factors of the 3 areas in the DynamicPageTitle
	 * @private
	 */
	DynamicPageTitle.prototype._getShrinkFactorsObject = function() {
		var oResult = {},
			aAreaShrinkFactors = this.getAreaShrinkRatio().split(":");

		oResult.headingAreaShrinkFactor = parseFloat(aAreaShrinkFactors[0]);
		oResult.contentAreaShrinkFactor = parseFloat(aAreaShrinkFactors[1]);
		oResult.actionsAreaShrinkFactor = parseFloat(aAreaShrinkFactors[2]);

		return oResult;
	};

	/**
	 * Called whenever the content, actions or navigationActions aggregation are mutated.
	 * @param oChanges
	 * @private
	 */
	DynamicPageTitle.prototype._observeChanges = function (oChanges) {
		var oObject = oChanges.object,
			sChangeName = oChanges.name;

		if (oObject === this) {// changes on DynamicPageTitle level

			if (sChangeName === "content" || sChangeName === "_actionsToolbar") { // change of the content or _actionsToolbar aggregation
				this._observeContentChanges(oChanges);
			}

		} else if (sChangeName === "visible") { // change of the actions or navigationActions elements` visibility
			this._updateTopAreaVisibility();
		}
	};

	/**
	* Called whenever the content aggregation is mutated
	* @param {Object} oChanges
	* @private
	*/
	DynamicPageTitle.prototype._observeContentChanges = function (oChanges) {
		var oControl = oChanges.child,
			sMutation = oChanges.mutation;

		// Only overflow toolbar is supported as of now
		if (!(oControl instanceof OverflowToolbar)) {
			return;
		}

		if (sMutation === "insert") {
			oControl.attachEvent("_contentSizeChange", this._onContentSizeChange, this);
		} else if (sMutation === "remove") {
			oControl.detachEvent("_contentSizeChange", this._onContentSizeChange, this);
			this._setContentAreaFlexBasis(0, oControl.$().parent());
		}
	};

	/**
	 * Called whenever the content size of an overflow toolbar, used in the content aggregation, changes.
	 * Content size is defined as the total width of the toolbar's overflow-enabled content, not the toolbar's own width.
	 * @param oEvent
	 * @private
	 */
	DynamicPageTitle.prototype._onContentSizeChange = function (oEvent) {
		var iContentSize = oEvent.getParameter("contentSize");
		this._setContentAreaFlexBasis(iContentSize, oEvent.getSource().$().parent());
	};

	/**
	 * Sets (if iContentSize is non-zero) or resets (otherwise) the flex-basis of the HTML element where the
	 * content aggregation is rendered.
	 * @param iContentSize - the total width of the overflow toolbar's overflow-enabled content (items that can overflow)
	 * @param $node - the DOM node to which flex-basis style will be set
	 * @private
	 */
	DynamicPageTitle.prototype._setContentAreaFlexBasis = function (iContentSize, $node) {
		var sFlexBasis,
			sFlexBasisCachedValue;

		iContentSize = parseInt(iContentSize, 10);
		sFlexBasis = iContentSize ? iContentSize + "px" : "auto";

		sFlexBasisCachedValue = sFlexBasis !== "auto" ? sFlexBasis : undefined;

		$node.css({ "flex-basis": sFlexBasis });

		if ($node.hasClass("sapFDynamicPageTitleMainContent")) {
			this._sContentAreaFlexBasis = sFlexBasisCachedValue;
		} else if ($node.hasClass("sapFDynamicPageTitleMainActions")) {
			this._sActionsAreaFlexBasis = sFlexBasisCachedValue;
		}
	};

	DynamicPageTitle.prototype._updateARIAState = function (bHeaderExpanded, bToggleHeaderOnTitleClick) {
		var sARIAText = bToggleHeaderOnTitleClick ? this._getARIALabelReferences(bHeaderExpanded) : "";

		this.$().attr("aria-labelledby", sARIAText);
		return this;
	};

	DynamicPageTitle.prototype._getARIALabelReferences = function (bHeaderExpanded) {
		var sReferences = "";

		sReferences += bHeaderExpanded ? DynamicPageTitle.EXPANDED_HEADER_TEXT_ID : DynamicPageTitle.COLLAPSED_HEADER_TEXT_ID;
		sReferences += " " + DynamicPageTitle.TOGGLE_HEADER_TEXT_ID;

		return sReferences;
	};

	return DynamicPageTitle;
});
