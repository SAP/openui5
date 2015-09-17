/*
 * ! ${copyright}
 */

// Provides control sap.m.QuickView.
sap.ui.define([
	'jquery.sap.global', './library', 'sap/ui/core/Control',
		'./QuickViewBase', './ResponsivePopover', './NavContainer',
		'./PlacementType', './Page', './Bar', './Button'],
	function(jQuery, library, Control,
			QuickViewBase, ResponsivePopover, NavContainer,
			PlacementType, Page, Bar, Button) {
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
	 * @extends sap.m.QuickViewBase
	 * @author SAP SE
	 * @constructor
	 * @public
	 * @alias sap.m.QuickView
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var QuickView = QuickViewBase.extend("sap.m.QuickView",
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
						},
						/**
						 * The width of the QuickView.
						 */
						width : {
							type : 'sap.ui.core.CSSSize',
							group : 'Dimension',
							defaultValue : '320px'
						}
					},
					aggregations: {
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
			navigate: this._navigate.bind(this),
			afterNavigate: this._afterNavigate.bind(this)
		};

		if (!sap.ui.Device.system.phone) {
			oNavConfig.width = this.getWidth();
		}

		this._oNavContainer = new NavContainer(oNavConfig);

		var that = this;

		this._oPopover = new ResponsivePopover(this.getId() + '-quickView', {
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

		this._oPopover.addStyleClass('sapMQuickView');

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

		this._bItemsChanged = true;

		this._oPopover.addStyleClass("sapMQuickView");
	};

	QuickView.prototype.onBeforeRenderingPopover = function() {

		this._bRendered = true;

		// Update pages only if items aggregation is changed
		if (this._bItemsChanged) {
			this._initPages();

			// add a close button on phone devices when there are no pages
			var aPages = this.getAggregation("pages");
			if (!aPages && sap.ui.Device.system.phone) {
				this._addEmptyPage();
			}

			this._bItemsChanged = false;
		}
	};

	QuickView.prototype.exit = function() {

		this._bRendered = false;
		this._bItemsChanged = true;

		if (this._oPopover) {
			this._oPopover.destroy();
		}
	};

	QuickView.prototype._createPage = function(oQuickViewPage) {
		return oQuickViewPage._createPage();
	};

	QuickView.prototype._onPopupKeyDown = function(oEvent) {
		this._processKeyboard(oEvent);
	};

	QuickView.prototype._afterOpen = function(oEvent) {
		if (sap.ui.Device.system.phone) {
			this._restoreFocus();
		}
	};

	QuickView.prototype._addEmptyPage = function() {
		var oPage = new Page({
			customHeader : new Bar()
		});

		var that = this;

		var oCustomHeader = oPage.getCustomHeader();
		oCustomHeader.addContentRight(
			new Button({
				icon : "sap-icon://decline",
				press : function() {
					that._oPopover.close();
				}
			})
		);

		oPage.addStyleClass('sapMQuickViewPage');
		this._oNavContainer.addPage(oPage);
	};

	QuickView.prototype._adjustContainerHeight = function() {
		var oPopupControl = this._oPopover.getAggregation("_popup");
		var $container = oPopupControl.$().find('.sapMPopoverCont');

		if ($container[0] && !$container[0].style.height) {
			$container[0].style.height = $container.height() + 'px';
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

		var oPage = this._oNavContainer.getCurrentPage();
		var oButton = oPage.getCustomHeader().getContentRight()[0];

		return oButton;
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
	 * The method sets the width of the QuickView.
	 *
	 * @param {sap.ui.core.CSSSize} sWidth The new width of the QuickView
	 * @returns {QuickView} this pointer for chaining
	 */
	QuickView.prototype.setWidth = function (sWidth) {
		if (this._oNavContainer) {
			this._oNavContainer.setWidth(sWidth);
			this.setProperty('width', sWidth, true);
		}

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

	["addStyleClass", "removeStyleClass", "toggleStyleClass", "hasStyleClass"].forEach(function(sName){
		QuickView.prototype[sName] = function() {
			if (this._oPopover && this._oPopover[sName]) {
				var res = this._oPopover[sName].apply(this._oPopover, arguments);
				return res === this._oPopover ? this : res;
			}
		};
	});

	["setModel", "bindAggregation", "setAggregation", "insertAggregation", "addAggregation",
		"removeAggregation", "removeAllAggregation", "destroyAggregation"].forEach(function (sFuncName) {
			QuickView.prototype["_" + sFuncName + "Old"] = QuickView.prototype[sFuncName];
			QuickView.prototype[sFuncName] = function () {
				var result = QuickView.prototype["_" + sFuncName + "Old"].apply(this, arguments);

				// Marks items aggregation as changed and invalidate popover to trigger rendering
				this._bItemsChanged = true;

				if (this._bRendered && this._oPopover) {
					this._oPopover.invalidate();
				}

				if (["removeAggregation", "removeAllAggregation"].indexOf(sFuncName) !== -1) {
					return result;
				}

				return this;
			};
		});

	return QuickView;

}, /* bExport= */true);
