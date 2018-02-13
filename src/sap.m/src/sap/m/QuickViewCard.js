/*
 * ! ${copyright}
 */

// Provides control sap.m.QuickViewCard.
sap.ui.define([
	'./library',
	'./QuickViewBase',
	'./NavContainer',
	'./Page',
	'./ScrollContainer',
	'./QuickViewCardRenderer'
],
	function(
	library,
	QuickViewBase,
	NavContainer,
	Page,
	ScrollContainer,
	QuickViewCardRenderer
	) {
	"use strict";

	/**
	 * Constructor for a new QuickViewCard.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class The QuickViewCard control displays information of an object in a business-card format.
	 * It also allows this object to be linked to another object using one of the links.
	 * Clicking that link updates the information with the data of the linked object.
	 * Unlimited number of objects can be linked.
	 *
	 * @extends sap.m.QuickViewBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.28.11
	 * @alias sap.m.QuickViewCard
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var QuickViewCard = QuickViewBase.extend("sap.m.QuickViewCard", /** @lends sap.m.QuickViewCard.prototype */ {
				metadata: {
					library : "sap.m",
					properties : {
						/**
						 * Determines whether the browser displays the vertical scroll bar or simply cuts the content of the QuickViewCard.
						 */
						showVerticalScrollBar : {
							type : "boolean",
							group : "Behavior",
							defaultValue : true
						}
					},
					designtime: "sap/m/designtime/QuickViewCard.designtime"

				}
			});

		/**
		 * Initialize the control.
		 *
		 * @private
		 */
		QuickViewCard.prototype.init = function() {

			var oNavConfig = {
				pages: [new Page()],
				navigate: this._navigate.bind(this),
				afterNavigate: this._afterNavigate.bind(this)
			};

			this._oNavContainer = new NavContainer(oNavConfig);
		};

		QuickViewCard.prototype.onBeforeRendering = function() {
			this._initPages();
		};

		QuickViewCard.prototype.onAfterRendering = function() {
			this._setLinkWidth();
		};

		QuickViewCard.prototype.exit = function() {
			if (this._oNavContainer) {
				this._oNavContainer.destroy();
			}
		};

		QuickViewCard.prototype.onkeydown = function(oEvent) {
			this._processKeyboard(oEvent);
		};

		/**
		 * Creates a new {@link sap.m.ScrollContainer} and adds content to it.
		 * @param {sap.m.QuickViewPage} oQuickViewPage The object that contains the data that has to be displayed.
		 * @returns {sap.m.ScrollContainer} The ScrollContainer that is added to the QuickViewCard
		 * @private
		 */
		QuickViewCard.prototype._createPage = function(oQuickViewPage) {

			var mContent = oQuickViewPage._createPageContent();

			// don't store the content for destroying, the nav container will destroy all the pages
			oQuickViewPage._mPageContent = null;

			var oContainer = new ScrollContainer(this.getId() + '-' + oQuickViewPage.getPageId(), {
				horizontal : false,
				vertical : false
			});

			if (mContent.header) {
				oContainer.addContent(mContent.header);
			}

			oContainer.addContent(mContent.form);

			oContainer.addStyleClass('sapMQuickViewPage');

			return oContainer;
		};

		/**
		 * Sets the correct length of the links inside the QuickViewCard. This is done to overwrite the styles set by the ResponsiveGridLayout
		 * @private
		 */
		QuickViewCard.prototype._setLinkWidth = function() {
			this.$().find(".sapMLnk").css("width", "auto");
		};


	return QuickViewCard;

});
