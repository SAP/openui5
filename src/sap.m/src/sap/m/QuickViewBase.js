/*
 * ! ${copyright}
 */

// Provides control sap.m.QuickViewBase.
sap.ui.define([
	'jquery.sap.global', './library', 'sap/ui/core/Control', './NavContainer', './Page'],
	function(jQuery, library, Control, NavContainer, Page) {
	"use strict";

	/**
	 * Constructor for a new QuickViewBase.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class QuickViewBase class provides base functionality for QuickView and QuickViewCard.
	 * Do not use it directly.
	 *
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @constructor
	 * @public
	 * @alias sap.m.QuickViewBase
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var QuickViewBase = Control.extend("sap.m.QuickViewBase",
			{
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
						 * This event can be aborted by the application with preventDefault(),
						 * which means that there will be no navigation.
						 */
						navigate: {
							allowPreventDefault : true,
							parameters : {

								/**
								 * The page which was shown before the current navigation.
								 */
								from : {
									type : "sap.ui.core.Control"
								},

								/**
								 * The ID of the page which was shown before the current navigation.
								 */
								fromId : {
									type : "string"
								},

								/**
								 * The page which will be shown after the current navigation.
								 */
								to : {
									type : "sap.ui.core.Control"
								},

								/**
								 * The ID of the page which will be shown after the current navigation.
								 */
								toId : {
									type : "string"
								},

								/**
								 * Whether the "to" page (more precisely: a control with the ID of the page
								 * which is currently navigated to) has not been shown/navigated to before.
								 */
								firstTime : {
									type : "boolean"
								},

								/**
								 * Whether this is a forward navigation.
								 */
								isTo : {
									type : "boolean"
								},

								/**
								 * Whether this is a back navigation.
								 */
								isBack : {
									type : "boolean"
								},

								/**
								 * Whether this is a navigation to the root page.
								 */
								isBackToTop : {
									type : "boolean"
								},

								/**
								 * Whether this was a navigation to a specific page.
								 */
								isBackToPage : {
									type : "boolean"
								},

								/**
								 * How the navigation was triggered, possible values are
								 * "to", "back", "backToPage", and "backToTop".
								 */
								direction : {
									type : "string"
								}
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
								 * The page which had been shown before navigation.
								 */
								from : {
									type : "sap.ui.core.Control"
								},

								/**
								 * The ID of the page which had been shown before navigation.
								 */
								fromId : {
									type : "string"
								},

								/**
								 * The page which is now shown after navigation.
								 */
								to : {
									type : "sap.ui.core.Control"
								},

								/**
								 * The ID of the page which is now shown after navigation.
								 */
								toId : {
									type : "string"
								},

								/**
								 * Whether the "to" page (more precisely: a control with the ID of
								 * the page which has been navigated to) had not been shown/navigated to before.
								 */
								firstTime : {
									type : "boolean"
								},

								/**
								 * Whether was a forward navigation.
								 */
								isTo : {
									type : "boolean"
								},

								/**
								 * Whether this was a back navigation.
								 */
								isBack : {
									type : "boolean"
								},

								/**
								 * Whether this was a navigation to the root page.
								 */
								isBackToTop : {
									type : "boolean"
								},

								/**
								 * Whether this was a navigation to a specific page.
								 */
								isBackToPage : {
									type : "boolean"
								},

								/**
								 * How the navigation was triggered, possible values are
								 * "to", "back", "backToPage", and "backToTop".
								 */
								direction : {
									type : "string"
								},

								/**
								 * Whether this is a navigation to the top page.
								 */
								isTopPage: {
									type: "boolean"
								}
							}
						}
					}
				}
			});

		QuickViewBase.prototype.navigateBack = function() {
			if (!this._oNavContainer.currentPageIsTopPage()) {
				this._oNavContainer.back();
			}
		};

		QuickViewBase.prototype.getNavContainer = function() {
			return this._oNavContainer;
		};

		/**
		 * Initialize pages.
		 * @private
		 */
		QuickViewBase.prototype._initPages = function() {

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

				// create and set navigation information to the page
				var mNavContext = {
					hasBackButton : i > 0,
					popover : this._oPopover,
					navContainer : oNavContainer,
					quickViewId : sId
				};

				oQuickViewPage.setNavContext(mNavContext);

				var oPage = this._createPage(oQuickViewPage);
				this._oNavContainer.addPage(oPage);
			}
		};

		QuickViewBase.prototype._processKeyboard = function(oEvent) {
			if (oEvent.shiftKey && oEvent.which === jQuery.sap.KeyCodes.ENTER) {

				this.navigateBack();

				oEvent.preventDefault();
			}
		};

		QuickViewBase.prototype._createPage = function(oQuickViewPage) {
			return oQuickViewPage;
		};

		QuickViewBase.prototype._navigate = function(oEvent) {
			var oToPage = oEvent.getParameter('to');
			var oFromPage = oEvent.getParameter('from');

			var sToPageId = oEvent.getParameter('toId');
			var sFromPageId = oEvent.getParameter('fromId');

			var iFromPageIndex = jQuery('#' + sFromPageId).index();
			var iToPageIndex = jQuery('#' + sToPageId).index();

			if (iToPageIndex == -1 || iToPageIndex > iFromPageIndex) {
				oToPage.addStyleClass('sapMNavItemOffset');
			} else {
				oFromPage.addStyleClass('sapMNavItemOffset');
			}

			this.fireNavigate(oEvent.getParameters());
		};

		QuickViewBase.prototype._afterNavigate = function(oEvent) {
			var oToPage = oEvent.getParameter('to');
			var oFromPage = oEvent.getParameter('from');

			var sToPageId = oEvent.getParameter('toId');
			var sFromPageId = oEvent.getParameter('fromId');

			var iFromPageIndex = jQuery('#' + sFromPageId).index();
			var iToPageIndex = jQuery('#' + sToPageId).index();

			if (iToPageIndex > iFromPageIndex) {
				oToPage.removeStyleClass('sapMNavItemOffset');
			} else {
				oFromPage.removeStyleClass('sapMNavItemOffset');
			}

			var mParams = oEvent.getParameters();
			mParams.isTopPage = this._oNavContainer.currentPageIsTopPage();
			this.fireAfterNavigate(mParams);

			// Just wait for the next tick to apply the focus
			jQuery.sap.delayedCall(0, this, this._restoreFocus);
		};

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
				jQuery.sap.focus(oFocusDomRef);
			}
		};


		return QuickViewBase;

}, /* bExport= */true);
