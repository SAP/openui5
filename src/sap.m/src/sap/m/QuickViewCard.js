/*
 * ! ${copyright}
 */

// Provides control sap.m.QuickViewCard.
sap.ui.define([
	'jquery.sap.global', './library', 'sap/ui/core/Control',
		'./QuickViewBase', './NavContainer', './Page', './ScrollContainer'],
	function(jQuery, library, Control,
			QuickViewBase, NavContainer, Page, ScrollContainer) {
	"use strict";

	/**
	 * Constructor for a new QuickViewCard.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class The QuickViewCard control displays information of an object in a business-card format.
	 * It also allows this object to be linked to another object using one of the links.
	 * Clicking that link updates the information with the data of the linked object.
	 * Unlimited number of objects can be linked.
	 *
	 * @extends sap.m.QuickViewBase
	 * @author SAP SE
	 * @constructor
	 * @public
	 * @alias sap.m.QuickViewCard
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var QuickViewCard = QuickViewBase.extend("sap.m.QuickViewCard",
			{
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
					}

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
			//Sets the correct length of the links inside the QuickView. This is done to overwrite the styles set by the ResponsiveGridLayout
			this.$().find(".sapMLnk").css("width", "auto");
		};

		QuickViewCard.prototype.exit = function() {
			if (this._oNavContainer) {
				this._oNavContainer.destroy();
			}
		};

		QuickViewCard.prototype.onkeydown = function(oEvent) {
			this._processKeyboard(oEvent);
		};

		QuickViewCard.prototype._createPage = function(oQuickViewPage) {

			var mContent = oQuickViewPage._createPageContent();

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


	return QuickViewCard;

}, /* bExport= */true);
