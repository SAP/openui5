/*!
 * ${copyright}
 */

// Provides control sap.m.DynamicPageTitle.
sap.ui.define(["jquery.sap.global", "./library", "sap/ui/core/Control", "./OverflowToolbar"
], function (jQuery, library, Control, OverflowToolbar) {
	"use strict";

	/**
	 * Constructor for a new Dynamic Page Layout Title.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The DynamicPage title can hold any UI5 control. It holds the most important information regarding the object
	 * and will always remain visible while scrolling
	 * Disclaimer: this control is in beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.38
	 * @alias sap.m.DynamicPage
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DynamicPageTitle = Control.extend("sap.m.DynamicPageTitle", /** @lends sap.m.DynamicPageTitle.prototype */ {
		metadata: {
			library: "sap.m",
			aggregations: {

				/**
				 * The title or any other UI5 control that serves as a heading for the object.
				 */
				heading: {type: "sap.ui.core.Control", multiple: false, defaultValue: null},

				/**
				 * The Global Actions buttons.
				 */
				actions: {type: "sap.m.Button", multiple: true, singularName: "action"},

				/**
				 * The content that is displayed in the header in snapped mode.
				 */
				snappedContent: {type: "sap.ui.core.Control", multiple: true},

				/**
				 * The content that is displayed in the header in expanded mode.
				 */
				expandedContent: {type: "sap.ui.core.Control", multiple: true},

				/**
				 * Internal Overflow Toolbar for the global actions.
				 */
				_overflowToolbar: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"}

			}
		}
	});

	function isFunction(oObject) {
		return typeof oObject === "function";
	}

	DynamicPageTitle.prototype.init = function () {
		this._bShowAdditionalContent = false;
		this._fnActionSubstituteParentFunction = function () {
			return this;
		}.bind(this);
	};

	DynamicPageTitle.prototype.onBeforeRendering = function () {
		this._getOverflowToolbar();
	};

	DynamicPageTitle.prototype.onAfterRendering = function () {
		this._cacheDomElements();
	};

	/**
	 * Fires the title press event
	 * @param {jQuery.Event} oEvent
	 */
	DynamicPageTitle.prototype.ontap = function (oEvent) {
		if (oEvent.srcControl === this || this.getAggregation("_overflowToolbar") === oEvent.srcControl) {
			this.fireEvent("_titlePress");
		}
	};

	/**
	 * Caches the dom elements in a jQuery wrapper for later reuse
	 * @private
	 */
	DynamicPageTitle.prototype._cacheDomElements = function () {
		this.$snappedWrapper = this.$("snapped-wrapper");
		this.$expandWrapper = this.$("expand-wrapper");
	};

	/**
	 * Lazily retrieves the overflow toolbar.
	 * @returns {sap.m.OverflowToolbar}
	 * @private
	 */
	DynamicPageTitle.prototype._getOverflowToolbar = function () {
		if (!this.getAggregation("_overflowToolbar")) {
			this.setAggregation("_overflowToolbar", new OverflowToolbar({
				id: this.getId() + "-overflowToolbar"
			}).addStyleClass("sapMDynamicPageTitleOverflowToolbar"));
		}

		return this.getAggregation("_overflowToolbar");
	};

	/**
	 * Pre process an action before after inserting it in the aggregation so it returns the DynamicPageTitle as the
	 * parent rather than its real parent (the OverflowToolbar), so to the outside world it looks like the DynamicPageTitle aggregates the actions.
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
	 * Post process an action just before removing it from the aggregation so it returns its real parent (the OverflowToolbar),
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
	 * Proxy the action aggregation's methods to the overflowToolbar's content aggregation.
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
	 * Used to internally show/hide the snapped content without going through the rendering phase
	 * @param {boolean} bValue - to show or to hide the content
	 * @private
	 */
	DynamicPageTitle.prototype._setShowSnapContent = function (bValue) {
		this._bShowAdditionalContent = bValue;
		this.$snappedWrapper.toggleClass("sapUiHidden", !bValue);
		this.$snappedWrapper.parent().toggleClass("sapMDynamicPageSnapContentVisible", bValue);
	};

	/**
	 * Returns if the snapped content is currently shown.
	 * @returns {boolean}
	 * @private
	 */
	DynamicPageTitle.prototype._getShowSnapContent = function () {
		return this._bShowAdditionalContent;
	};

	/**
	 * Used to internally show/hide the expanded content without going through the rendering phase
	 * @param {boolean} bValue - to show or to hide the content
	 * @private
	 */
	DynamicPageTitle.prototype._setShowExpandContent = function (bValue) {
		this._bShowExpandContent = bValue;
		this.$expandWrapper.toggleClass("sapUiHidden", !bValue);
		this.$snappedWrapper.parent().toggleClass("sapMDynamicPageExpandContentVisible", bValue);
	};

	/**
	 * Returns if the expanded content is currently shown.
	 * @returns {boolean}
	 * @private
	 */
	DynamicPageTitle.prototype._getShowExpandContent = function () {
		return this._bShowExpandContent || false;
	};

	return DynamicPageTitle;
}, /* bExport= */ false);
