/*
 * ! ${copyright}
 */

// Provides control sap.m.QuickView.
sap.ui.define([
	'jquery.sap.global', './library', 'sap/ui/core/Control', './ResponsivePopover', './NavContainer',
			'./PlacementType', './Page'],
	function(jQuery, library, Control, ResponsivePopover, NavContainer, PlacementType, Page) {
	"use strict";

	/**
	 * Constructor for a new QuickView.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The QuickView control renders a responsive popover (sap.m.Popover or sap.m.Dialog)
	 * and displays information of an object in a business-card format. It also allows this object to be linked to
	 * another object using one of the links in the responsive popover. Clicking that link updates the information in the
	 * popover with the data of the linked object. Unlimited number of objects can be linked.
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @constructor
	 * @public
	 * @alias sap.m.QuickView
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var QuickView = Control.extend("sap.m.QuickView",
			{
				metadata: {

					library: "sap.m",
					properties: {
						/**
						 * This property is reused from sap.m.Popover and only takes effect when running on desktop or tablet. Please refer the documentation of the placement property of sap.m.Popover.
						 */
						placement : {
							type : "sap.m.PlacementType",
							group : "Misc",
							defaultValue : PlacementType.Right
						}
					},
					defaultAggregation: "cards",
					aggregations: {

						/**
						 * Displays a page header, object icon or image, object name with short description, and object information divided in groups
						 */
						cards: {
							type: "sap.m.QuickViewCard",
							multiple: true,
							singularName: "card",
							bindable: "bindable"
						}
					},
					events: {
						/**
						 * This event fires after the QuickView is opened.
						 */
						afterOpen: {
							parameters: {
								/**
								 * This parameter refers to the control, which opens the QuickView.
								 */
								openBy: {
									type: "sap.ui.core.Control"
								}
							}
						},

						/**
						 * This event fires after the QuickView is closed.
						 */
						afterClose: {
							parameters: {
								/**
								 * This parameter refers to the control, which opens the QuickView.
								 */
								openBy: {
									type: "sap.ui.core.Control"
								},

								/**
								 * This parameter contains the control,
								 * which triggers the close of the QuickView.
								 * It is undefined when running on desktop or tablet.
								 */
								origin : {
									type : "sap.m.Button"
								}
							}
						},

						/**
						 * This event fires before the QuickView is opened.
						 */
						beforeOpen: {
							parameters: {
								/**
								 * This parameter refers to the control, which opens the QuickView.
								 */
								openBy: {
									type: "sap.ui.core.Control"
								}
							}
						},

						/**
						 * This event fires before the QuickView is closed.
						 */
						beforeClose: {
							parameters: {
								/**
								 * This parameter refers to the control, which opens the QuickView.
								 */
								openBy: {
									type: "sap.ui.core.Control"
								},

								/**
								 * This parameter contains the control,
								 * which triggers the close of the QuickView.
								 * It is undefined when running on desktop or tablet.
								 */
								origin : {
									type : "sap.m.Button"
								}
							}
						}
					}
				}
			});

	/**
	 * Initialize the control.
	 *
	 * @private
	 */
	QuickView.prototype.init = function() {

		var oNavConfig = {
			pages: [new Page()],
			afterNavigate: this._afterNavigate.bind(this)
		};

		if (!sap.ui.Device.system.phone) {
			oNavConfig.width = "320px";
		}

		this._oNavContainer = new NavContainer(oNavConfig);

		var that = this;

		this._oPopover = new ResponsivePopover({
			placement: this.getPlacement(),
			content: [this._oNavContainer],
			showHeader: false,
			showCloseButton : false,
			afterOpen: function (oEvent) {
				that._afterOpen(oEvent);
				that.fireAfterOpen({
					openBy: oEvent.getParameter("openBy")
				});
			},
			afterClose: function (oEvent) {
				that.fireAfterClose({
					openBy: oEvent.getParameter("openBy"),
					origin: that.getCloseButton()
				});
			},
			beforeOpen: function (oEvent) {
				that.fireBeforeOpen({
					openBy: oEvent.getParameter("openBy")
				});
			},
			beforeClose: function (oEvent) {
				that.fireBeforeClose({
					openBy: oEvent.getParameter("openBy"),
					origin: that.getCloseButton()
				});
			}
		});

		var oPopupControl = this._oPopover.getAggregation("_popup");
		oPopupControl.addEventDelegate({
			onBeforeRendering: this.onBeforeRenderingPopover,
			onkeydown: this._onPopupKeyDown
		}, this);

		var that = this;
		var fnSetArrowPosition = oPopupControl._fnSetArrowPosition;

		if (fnSetArrowPosition) {
			oPopupControl._fnSetArrowPosition = function () {
				fnSetArrowPosition.apply(oPopupControl, arguments);

				that._adjustContainerHeight();
			};
		}

		this._oPopover.addStyleClass("sapMQuickView");
	};

	QuickView.prototype.onBeforeRenderingPopover = function() {
		var aCards = this.getAggregation("cards");
		if (!aCards) {
			return;
		}

		var oNavContainer = this._oNavContainer;

		// clear nav container
		oNavContainer.destroyPages();
		oNavContainer.init();

		// create
		for (var i = 0; i < aCards.length; i++) {
			var oQuickViewCard = aCards[i];

			oQuickViewCard._hasBackButton = i > 0;
			oQuickViewCard._oPopover = this._oPopover;
			oQuickViewCard._oNavContainer = oNavContainer;

			var oCard = oQuickViewCard._createCard();
			this._oNavContainer.addPage(oCard);
		}
	};

	QuickView.prototype.exit = function() {
		if (this._oPopover) {
			this._oPopover.destroy();
		}
	};

	QuickView.prototype._onPopupKeyDown = function(oEvent) {
		if (oEvent.shiftKey && oEvent.which === jQuery.sap.KeyCodes.ENTER) {

			if (!this._oNavContainer.currentPageIsTopPage()) {
				this._oNavContainer.back();
			}

			oEvent.preventDefault();
		}
	};

	QuickView.prototype._afterOpen = function(oEvent) {
		if (sap.ui.Device.system.phone) {
			this._restoreFocus();
		}
	};

	QuickView.prototype._adjustContainerHeight = function() {
		var oPopupControl = this._oPopover.getAggregation("_popup");
		var $container = oPopupControl.$().find('.sapMPopoverCont');

		if ($container[0] && !$container[0].style.height) {
			$container[0].style.height = $container.height() + 'px';
		}
	};

	QuickView.prototype._afterNavigate = function(oEvent) {

		// Just wait for the next tick to apply the focus
		jQuery.sap.delayedCall(0, this, this._restoreFocus);
	};

	QuickView.prototype._restoreFocus = function() {
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

	/**
	 * Returns this button, which closes the QuickView.
	 * On desktop or tablet, this method returns undefined.
	 * @private
	 */
	QuickView.prototype.getCloseButton = function() {
		if (!sap.ui.Device.system.phone) {
			return undefined;
		}

		var cardPage = this._oNavContainer.getCurrentPage();
		var button = cardPage.getCustomHeader().getContentRight()[0];

		return button;
	};

	/**
	 * The method sets placement position of the QuickView.
	 *
	 * @param {sap.m.PlacementType} sPlacement Placement type
	 * @returns {QuickView} this pointer for chaining
	 */
	QuickView.prototype.setPlacement = function (sPlacement) {
		this.setProperty("placement", sPlacement, true); // no re-rendering
		this._oPopover.setPlacement(sPlacement);

		return this;
	};

	/**
	 * Opens the QuickView
	 *
	 * @param {sap.ui.core.Control} oControl Control which opens the QuickView
	 * @returns {QuickView} this pointer for chaining
	 * @public
	 */
	QuickView.prototype.openBy = function(oControl) {
		this._oPopover.openBy(oControl);

		return this;
	};

	return QuickView;

}, /* bExport= */true);
