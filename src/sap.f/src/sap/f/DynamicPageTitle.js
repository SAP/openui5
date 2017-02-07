/*!
 * ${copyright}
 */

// Provides control sap.f.DynamicPageTitle.
sap.ui.define(["jquery.sap.global", "./library", "sap/ui/core/Control", "sap/m/OverflowToolbar"
], function (jQuery, library, Control, OverflowToolbar) {
	"use strict";

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
	 * {@link sap.f.DynamicPageHeader DynamicPageHeader} by clicking on the <code>DynamicPageTitle</code>.
	 * If set to <code>false</code>, the <code>DynamicPageTitle</code> is not clickable and the app must
	 * provide other means for expanding/collapsing the <code>DynamicPageHeader</code>, if necessary.
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
			aggregations: {

				/**
				 * The title or any other UI5 control that serves as a heading for the object.
				 */
				heading: {type: "sap.ui.core.Control", multiple: false, defaultValue: null},

				/**
				 * The <code>DynamicPageTitle</code> actions.
				 * <br><b>Note:</b> The <code>actions</code> aggregation accepts any UI5 control, but it`s recommended to use controls,
				 * suitable for {@link sap.m.Toolbar} and {@link sap.m.OverflowToolbar}.
				 */
				actions: {type: "sap.ui.core.Control", multiple: true, singularName: "action"},

				/**
				 * The content that is displayed in the <code>DynamicPageTitle</code> in collapsed (snapped) state.
				 */
				snappedContent: {type: "sap.ui.core.Control", multiple: true},

				/**
				 * The content that is displayed in the <code>DynamicPageTitle</code> in expanded state.
				 */
				expandedContent: {type: "sap.ui.core.Control", multiple: true},

				/**
				 * Internal <code>OverflowToolbar</code> for the <code>DynamicPageTitle</code> actions.
				 */
				_overflowToolbar: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"}

			}
		}
	});

	function isFunction(oObject) {
		return typeof oObject === "function";
	}

	DynamicPageTitle.prototype.init = function () {
		this._bShowSnappedContent = false;
		this._bShowExpandContent = true;
		this._fnActionSubstituteParentFunction = function () {
			return this;
		}.bind(this);
	};

	DynamicPageTitle.prototype.onBeforeRendering = function () {
		this._getOverflowToolbar();
	};

	DynamicPageTitle.prototype.onAfterRendering = function () {
		this._cacheDomElements();
		this._setShowSnapContent(this._getShowSnapContent());
		this._setShowExpandContent(this._getShowExpandContent());
	};

	/**
	 * Fires the <code>DynamicPageTitle</code> press event.
	 * @param {jQuery.Event} oEvent
	 */
	DynamicPageTitle.prototype.ontap = function (oEvent) {
		if (oEvent.srcControl === this || this.getAggregation("_overflowToolbar") === oEvent.srcControl) {
			this.fireEvent("_titlePress");
		}
	};

	/**
	 * Caches the DOM elements in a jQuery wrapper for later reuse.
	 * @private
	 */
	DynamicPageTitle.prototype._cacheDomElements = function () {
		this.$snappedWrapper = this.$("snapped-wrapper");
		this.$expandWrapper = this.$("expand-wrapper");
	};

	/**
	 * Lazily retrieves the internal <code>OverflowToolbar</code> aggregation.
	 * @returns {sap.m.OverflowToolbar}
	 * @private
	 */
	DynamicPageTitle.prototype._getOverflowToolbar = function () {
		if (!this.getAggregation("_overflowToolbar")) {
			this.setAggregation("_overflowToolbar", new OverflowToolbar({
				id: this.getId() + "-overflowToolbar"
			}).addStyleClass("sapFDynamicPageTitleOverflowToolbar"));
		}

		return this.getAggregation("_overflowToolbar");
	};

	/**
	 * Pre-processes a <code>DynamicPageTitle</code> action before inserting it in the aggregation.
	 * The action would returns the <code>DynamicPageTitle</code> as its parent, rather than its real parent (the <code>OverflowToolbar</code>).
	 * This way, it looks like the <code>DynamicPageTitle</code> aggregates the actions.
	 * @param oAction
	 * @private
	 */
	DynamicPageTitle.prototype._preProcessAction = function (oAction) {
		if (isFunction(oAction._fnOriginalGetParent)) {
			return;
		}

		oAction._fnOriginalGetParent = oAction.getParent;
		oAction.getParent = this._fnActionSubstituteParentFunction;
	};

	/**
	 * Post-processes a <code>DynamicPageTitle</code> action before removing it from the aggregation, so it returns its real parent (the <code>OverflowToolbar</code>),
	 * thus allowing proper processing by the framework.
	 * @param oAction
	 * @private
	 */
	DynamicPageTitle.prototype._postProcessAction = function (oAction) {
		if (!isFunction(oAction._fnOriginalGetParent)) {
			return;
		}

		oAction.getParent = oAction._fnOriginalGetParent;
	};

	/**
	 * Proxies the <code>DynamicPageTitle</code> action aggregation's methods to the <code>OverflowToolbar</code> content aggregation.
	 * @override
	 * @private
	 */
	["addAction", "insertAction", "removeAction", "indexOfAction", "removeAllActions", "destroyActions", "getActions"]
		.forEach(function (sMethod) {
			DynamicPageTitle.prototype[sMethod] = function (oControl) {
				var oToolbar = this._getOverflowToolbar(),
					sToolbarMethod = sMethod.replace(/Actions?/, "Content"),
					vResult;

				if (sMethod === "addAction" || sMethod === "insertAction") {
					vResult = oToolbar[sToolbarMethod].apply(oToolbar, arguments);
					this._preProcessAction(oControl);
					return vResult;
				} else if (sMethod === "removeAction") {
					this._postProcessAction(oControl);
				} else if (sMethod === "removeAllActions" || sMethod === "destroyActions") {
					this.getActions().forEach(this._postProcessAction, this);
				}

				return oToolbar[sToolbarMethod].apply(oToolbar, arguments);
			};
		});

	/**
	 * Shows/hides the <code>DynamicPageTitle</code> snapped content without re-rendering.
	 * @param {boolean} bValue - to show or to hide the content
	 * @private
	 */
	DynamicPageTitle.prototype._setShowSnapContent = function (bValue) {
		this._bShowSnappedContent = bValue;
		this.$snappedWrapper.toggleClass("sapUiHidden", !bValue);
		this.$snappedWrapper.parent().toggleClass("sapFDynamicPageSnapContentVisible", bValue);
	};

	/**
	 * Determines if the <code>DynamicPageTitle</code> snapped content is currently displayed.
	 * @returns {boolean}
	 * @private
	 */
	DynamicPageTitle.prototype._getShowSnapContent = function () {
		return this._bShowSnappedContent;
	};

	/**
	 * Shows/hides the <code>DynamicPageTitle</code> expanded content without re-rendering.
	 * @param {boolean} bValue - to show or to hide the content
	 * @private
	 */
	DynamicPageTitle.prototype._setShowExpandContent = function (bValue) {
		this._bShowExpandContent = bValue;
		this.$expandWrapper.toggleClass("sapUiHidden", !bValue);
		this.$snappedWrapper.parent().toggleClass("sapFDynamicPageExpandContentVisible", bValue);
	};

	/**
	 * Determines if the <code>DynamicPageTitle</code> expanded content is currently displayed.
	 * @returns {boolean}
	 * @private
	 */
	DynamicPageTitle.prototype._getShowExpandContent = function () {
		return this._bShowExpandContent;
	};

	return DynamicPageTitle;
}, /* bExport= */ false);
