/*!
 * ${copyright}
 */

// Provides control sap.m.QuickViewBase.
sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery",
	// jQuery Plugin "firstFocusableDomRef"
	"sap/ui/dom/jquery/Focusable"
], function (library, Control, KeyCodes, jQuery) {
	"use strict";

	/**
	 * Constructor for a new QuickViewBase.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class QuickViewBase class provides base functionality for QuickView and QuickViewCard.
	 * Do not use it directly.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.28.11
	 * @alias sap.m.QuickViewBase
	 */
	var QuickViewBase = Control.extend("sap.m.QuickViewBase", /** @lends sap.m.QuickViewBase.prototype */ {
		metadata: {

			library: "sap.m",
			properties: {

			},
			defaultAggregation: "pages",
			aggregations: {

				/**
				 * Displays a page header, object icon or image, object name with short description,
				 * and object information divided in groups
				 */
				pages: {
					type: "sap.m.QuickViewPage",
					multiple: true,
					singularName: "page",
					bindable: "bindable"
				}
			},
			events: {

				/**
				 * The event is fired when navigation between two pages has been triggered.
				 * The transition (if any) to the new page has not started yet.
				 */
				navigate: {
					allowPreventDefault : true,
					parameters : {

						/**
						 * The page which was displayed before the current navigation.
						 */
						from : { type : "sap.ui.core.Control" },

						/**
						 * The ID of the page which was displayed before the current navigation.
						 */
						fromId : { type : "string" },

						/**
						 * The page which will be displayed after the current navigation.
						 */
						to : { type : "sap.ui.core.Control" },

						/**
						 * The ID of the page which will be displayed after the current navigation.
						 */
						toId : { type : "string" },

						/**
						 * Determines whether the "to" page (a control with the ID of the page
						 * which is currently navigated to) has not been displayed/navigated to before.
						 */
						firstTime : { type : "boolean" },

						/**
						 * Determines whether this is a forward navigation.
						 */
						isTo : { type : "boolean" },

						/**
						 * Determines whether this is a back navigation.
						 */
						isBack : { type : "boolean" },

						/**
						 * Determines  whether this is a navigation to the root page.
						 */
						isBackToTop : { type : "boolean" },

						/**
						 * Determines whether this was a navigation to a specific page.
						 */
						isBackToPage : { type : "boolean" },

						/**
						 * Determines how the navigation was triggered, possible values are
						 * "to", "back", "backToPage", and "backToTop".
						 */
						direction : { type : "string" },

						/**
						 * Determines which link initiated the navigation.
						 */
						navOrigin : { type : "sap.ui.core.Control" }
					}
				},

				/**
				 * The event is fired when navigation between two pages has completed.
				 * In case of animated transitions this event is fired with some delay
				 * after the "navigate" event.
				 */
				afterNavigate : {
					parameters : {

						/**
						 * Determines the page, which has been displayed before navigation.
						 */
						from : { type : "sap.ui.core.Control" },

						/**
						 * Determines the ID of the page, which has been displayed before navigation.
						 */
						fromId : { type : "string" },

						/**
						 * Determines the page, which is now displayed after navigation.
						 */
						to : { type : "sap.ui.core.Control" },

						/**
						 * Determines the ID of the page, which is now displayed after navigation.
						 */
						toId : { type : "string" },

						/**
						 * Determines whether the "to" page (a control with the ID of the page, which has been navigated to) has not been displayed/navigated to before.
						 */
						firstTime : { type : "boolean" },

						/**
						 * Determines whether this was a forward navigation.
						 */
						isTo : { type : "boolean" },

						/**
						 * Determines whether this was a back navigation.
						 */
						isBack : { type : "boolean" },

						/**
						 * Determines whether this was a navigation to the root page.
						 */
						isBackToTop : { type : "boolean" },

						/**
						 * Determines whether this was a navigation to a specific page.
						 */
						isBackToPage : { type : "boolean" },

						/**
						 * Determines  how the navigation was triggered, possible values are
						 * "to", "back", "backToPage", and "backToTop".
						 */
						direction : { type : "string" },

						/**
						 * Determines whether this is a navigation to the top page.
						 */
						isTopPage: { type: "boolean" },

						/**
						 * Determines which link initiated the navigation.
						 */
						navOrigin : { type : "sap.ui.core.Control" }
					}
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function () {}
		}
	});

	/**
	 * Navigates to the previous page if there is such.
	 * @public
	 */
	QuickViewBase.prototype.navigateBack = function () {
		if (!this._oNavContainer.currentPageIsTopPage()) {
			this._setNavOrigin(null);
			this._oNavContainer.back();
		}
	};

	/**
	 * Returns the NavContainer used in the QuickView.
	 * @returns {sap.m.NavContainer} The NavContainer used in the control
	 */
	QuickViewBase.prototype.getNavContainer = function () {
		return this._oNavContainer;
	};

	/**
	 * Initializes the pages of the QuickView.
	 * @private
	 */
	QuickViewBase.prototype._initPages = function () {
		var oNavContainer = this._oNavContainer;

		// clear nav container
		oNavContainer.destroyPages();
		oNavContainer.init();

		var aPages = this.getAggregation("pages");
		if (!aPages) {
			return;
		}

		var sId = this.getId();

		// create pages
		for (var i = 0; i < aPages.length; i++) {
			var oQuickViewPage = aPages[i];

			// clear the previously stored page
			oQuickViewPage._oPage = null;

			// create and set navigation information to the page
			var mNavContext = {
				hasBackButton : i > 0,
				popover : this._oPopover,
				navContainer : oNavContainer,
				quickViewId : sId,
				quickView : this
			};

			oQuickViewPage.setNavContext(mNavContext);

			var oPage = this._createPage(oQuickViewPage);
			this._oNavContainer.addPage(oPage);
		}
	};

	/**
	 * Helper function for processing keyboard events.
	 * @param {sap.ui.base.Event} oEvent The event object for this event
	 * @private
	 */
	QuickViewBase.prototype._processKeyboard = function (oEvent) {
		if (oEvent.shiftKey && oEvent.which === KeyCodes.ENTER) {
			this.navigateBack();
			oEvent.preventDefault();
		}
	};

	QuickViewBase.prototype._createPage = function (oQuickViewPage) {
		return oQuickViewPage;
	};

	/**
	 * Helper function, that adds class to the "From" or "To" page and fires navigate event.
	 * @param {sap.ui.base.Event} oEvent The event object for this event.
	 * @private
	 */
	QuickViewBase.prototype._navigate = function (oEvent) {
		var oToPage = oEvent.getParameter('to');
		var oFromPage = oEvent.getParameter('from');

		var sToPageId = oEvent.getParameter('toId');
		var sFromPageId = oEvent.getParameter('fromId');

		var iFromPageIndex = jQuery(document.getElementById(sFromPageId)).index();
		var iToPageIndex = jQuery(document.getElementById(sToPageId)).index();

		if (iToPageIndex == -1 || iToPageIndex > iFromPageIndex) {
			oToPage.addStyleClass('sapMNavItemOffset');
		} else {
			oFromPage.addStyleClass('sapMNavItemOffset');
		}

		oFromPage.$().parents('.sapMPanelContent').scrollTop(0);

		var mParams = oEvent.getParameters();

		if (this._navOrigin) {
			mParams.navOrigin = this._navOrigin;
		}

		this.fireNavigate(mParams);
	};

	/**
	 * Helper function, that adds class to the "From" or "To" page and fires after navigate event.
	 * @param {sap.ui.base.Event} oEvent - The event object for this event.
	 * @private
	 */
	QuickViewBase.prototype._afterNavigate = function(oEvent) {
		var oToPage = oEvent.getParameter('to');
		var oFromPage = oEvent.getParameter('from');

		var sToPageId = oEvent.getParameter('toId');
		var sFromPageId = oEvent.getParameter('fromId');

		var iFromPageIndex = jQuery(document.getElementById(sFromPageId)).index();
		var iToPageIndex = jQuery(document.getElementById(sToPageId)).index();

		if (iToPageIndex > iFromPageIndex) {
			oToPage.removeStyleClass('sapMNavItemOffset');
		} else {
			oFromPage.removeStyleClass('sapMNavItemOffset');
		}

		var mParams = oEvent.getParameters();
		mParams.isTopPage = this._oNavContainer.currentPageIsTopPage();

		if (this._navOrigin) {
			mParams.navOrigin = this._navOrigin;
		}

		this.fireAfterNavigate(mParams);

		this._setLinkWidth();

		// Just wait for the next tick to apply the focus
		setTimeout(this._restoreFocus.bind(this), 0);
	};

	/**
	 * Helper function, that sets the focus to the element, that was focused the previous time the page was opened or to the first focusable element.
	 * or to the first focusable element.
	 * @private
	 */
	QuickViewBase.prototype._restoreFocus = function() {
		var oPage = this._oNavContainer.getCurrentPage();
		var oFocusDomRef = this._oNavContainer._mFocusObject[oPage.getId()];

		if (!oFocusDomRef) {
			var oContent = oPage.getContent();
			if (oContent && oContent.length > 1) {
				oFocusDomRef = oContent[1].$().firstFocusableDomRef();
			}
		}

		if (oFocusDomRef) {
			oFocusDomRef.focus();
		}
	};

	/**
	 * Hook for classes extending QuickViewBase.
	 * @private
	 */
	QuickViewBase.prototype._setLinkWidth = function () {
	};

	QuickViewBase.prototype._setNavOrigin = function (oControl) {
		this._navOrigin = oControl;
	};

	return QuickViewBase;
});