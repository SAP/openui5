/*
 * ! ${copyright}
 */

// Provides control sap.m.QuickView.
sap.ui.define([
	'./library',
	'sap/ui/Device',
	'sap/ui/core/IconPool',
	'./QuickViewBase',
	'./ResponsivePopover',
	'./NavContainer',
	'./Page',
	'./Bar',
	'./Button',
	'./QuickViewRenderer'
],
	function(
	library,
	Device,
	IconPool,
	QuickViewBase,
	ResponsivePopover,
	NavContainer,
	Page,
	Bar,
	Button,
	QuickViewRenderer
	) {
	"use strict";

	// shortcut for sap.m.PlacementType
	var PlacementType = library.PlacementType;

	/**
	 * Constructor for a new QuickView.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class A responsive popover that displays information on an object in a business-card format.
	 * <h3>Overview</h3>
	 * The quick view is used to show business information on either a person or an entity (e.g. a company). It uses a set of pre-defined controls.
	 * Objects can be linked together and you can navigate between several objects. An unlimited number of objects can be linked.
	 * <h3>Structure</h3>
	 * Each card is represented by a {@link sap.m.QuickViewPage} which holds all the information (icon, title, header, description) for the object.
	 * A single quick view can hold multiple objects, each showing information on a single entity.
	 * <h3>Usage</h3>
	 * <h4>When to use</h4>
	 * <ul>
	 * <li>You want to display a concise overview of an object (an employee or a company).</li>
	 * <li>Information on the object can be split into concrete groups.</li>
	 * </ul>
	 * <h4>When not to use</h4>
	 * <ul>
	 * <li>You want to display complex information about an object.</li>
	 * </ul>
	 * <h3>Responsive Behavior</h3>
	 * The quick view is displayed in a {@link sap.m.Popover popover} on desktop and a full-screen {@link sap.m.Dialog dialog} on mobile devices.
	 * @extends sap.m.QuickViewBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.28.11
	 * @alias sap.m.QuickView
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/quickview/ Quick View}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var QuickView = QuickViewBase.extend("sap.m.QuickView", /** @lends sap.m.QuickView.prototype */	{
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
						 * The width of the QuickView. The property takes effect only when running on desktop or tablet.
						 */
						width : {
							type : 'sap.ui.core.CSSSize',
							group : 'Dimension',
							defaultValue : '320px'
						}
					},
					aggregations: {
					},
					designtime: "sap/m/designtime/QuickView.designtime",
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

		this._oNavContainer = new NavContainer(oNavConfig);

		var that = this;

		this._oPopover = new ResponsivePopover(this.getId() + '-quickView', {
			placement: this.getPlacement(),
			content: [this._oNavContainer],
			contentWidth: this.getWidth(),
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
			onBeforeRendering: this._initializeQuickView,
			onAfterRendering: this._setLinkWidth,
			onkeydown: this._onPopupKeyDown
		}, this);

		var that = this;
		var fnSetArrowPosition = oPopupControl._fnAdjustPositionAndArrow;

		if (fnSetArrowPosition) {
			oPopupControl._fnAdjustPositionAndArrow = function () {
				fnSetArrowPosition.apply(oPopupControl, arguments);

				that._adjustContainerHeight();
			};
		}

		this._bItemsChanged = true;

		this._oPopover.addStyleClass("sapMQuickView");
	};

	/**
	 * Initialize the QuickView.
	 * @private
	 */
	QuickView.prototype._initializeQuickView = function() {

		this._bRendered = true;

		// Update pages only if items aggregation is changed
		if (this._bItemsChanged) {
			this._clearContainerHeight();
			this._initPages();

			// add a close button on phone devices when there are no pages
			var aPages = this.getAggregation("pages");
			if (!aPages && Device.system.phone) {
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
			this._oPopover = null;
		}
	};

	/**
	 * Invalidates the control.
	 */
	QuickView.prototype.invalidate = function() {
		// nothing this control should do here
		// changes are handled manually
	};

	/**
	 * Creates a new {@link sap.m.Page} that can be inserted in a QuickView.
	 * @param {sap.m.QuickViewPage} oQuickViewPage The object that contains the data to be displayed.
	 * @returns {sap.m.Page} The created page
	 * @private
	 */
	QuickView.prototype._createPage = function(oQuickViewPage) {
		return oQuickViewPage._createPage();
	};

	/**
	 * Keyboard handling function when the down arrow is pressed.
	 * @param {sap.ui.base.Event} oEvent The event object for this event.
	 * @private
	 */
	QuickView.prototype._onPopupKeyDown = function(oEvent) {
		this._processKeyboard(oEvent);
	};

	/**
	 * Helper function to restore the focus to the proper element after the QuickView is opened on phone.
	 * @private
	 */
	QuickView.prototype._afterOpen = function(oEvent) {
		if (Device.system.phone) {
			this._restoreFocus();
		}
	};

	/**
	 * Creates a new empty {@link sap.m.Page} and adds it to the QuickView.
	 * @private
	 */
	QuickView.prototype._addEmptyPage = function() {
		var oPage = new Page({
			customHeader : new Bar().addStyleClass("sapMQuickViewHeader")
		});

		var that = this;

		var oCustomHeader = oPage.getCustomHeader();
		oCustomHeader.addContentRight(
			new Button({
				icon : IconPool.getIconURI("decline"),
				press : function() {
					that._oPopover.close();
				}
			})
		);

		oPage.addStyleClass('sapMQuickViewPage');
		this._oNavContainer.addPage(oPage);
	};

	QuickView.prototype._clearContainerHeight = function() {
		var oPopupControl = this._oPopover.getAggregation("_popup");
		var $container = oPopupControl.$().find('.sapMPopoverCont');

		if ($container[0] && $container[0].style.height) {
			$container[0].style.height = '';
		}
	};

	/**
	 * Adjusts the popup height based on the QuickView's content.
	 * @private
	 */
	QuickView.prototype._adjustContainerHeight = function() {
		var oPopupControl = this._oPopover.getAggregation("_popup");
		var $container = oPopupControl.$().find('.sapMPopoverCont');

		if ($container[0] && !$container[0].style.height) {
			$container[0].style.height = $container.height() + 'px';
		}
	};

	/**
	 * Sets the correct length of the links inside the QuickView. This is done to overwrite the styles set by the ResponsiveGridLayout
	 * @private
	 */
	QuickView.prototype._setLinkWidth = function() {
		this._oPopover.$().find(".sapMLnk").css("width", "auto");
	};

	/**
	 * Returns the button, which closes the QuickView.
	 * On desktop or tablet, this method returns undefined.
	 * @returns {sap.ui.core.Control} The close button of the QuickView on phone or undefined on desktop and tablet.
	 * @private
	 */
	QuickView.prototype.getCloseButton = function() {
		if (!Device.system.phone) {
			return undefined;
		}

		var oPage = this._oNavContainer.getCurrentPage();
		var oButton = oPage.getCustomHeader().getContentRight()[0];

		return oButton;
	};

	/**
	 * The method sets placement position of the QuickView.
	 *
	 * @param {sap.m.PlacementType} sPlacement The side from which the QuickView appears relative to the control that opens it.
	 * @returns {sap.m.QuickView} Pointer to the control instance for chaining.
	 * @public
	 */
	QuickView.prototype.setPlacement = function (sPlacement) {
		this.setProperty("placement", sPlacement, true); // no re-rendering
		this._oPopover.setPlacement(sPlacement);

		return this;
	};

	/**
	 * The method sets the width of the QuickView.
	 * Works only on desktop or tablet.
	 * @param {sap.ui.core.CSSSize} sWidth The new width of the QuickView.
	 * @returns {sap.m.QuickView} Pointer to the control instance for chaining
	 * @public
	 */
	QuickView.prototype.setWidth = function (sWidth) {
		if (this._oPopover) {
			this._oPopover.setContentWidth(sWidth);
			this.setProperty('width', sWidth, true);
		}

		return this;
	};

	/**
	 * Opens the QuickView.
	 * @param {sap.ui.core.Control} oControl The control which opens the QuickView.
	 * @returns {sap.m.QuickView} Pointer to the control instance for chaining
	 * @public
	 */
	QuickView.prototype.openBy = function(oControl) {
		this._bItemsChanged = true;
		this._oPopover.openBy(oControl);

		return this;
	};

	QuickView.prototype.getDomRef = function (sSuffix) {
		return this._oPopover && this._oPopover.getAggregation("_popup").getDomRef(sSuffix);
	};

	["addStyleClass", "removeStyleClass", "toggleStyleClass", "hasStyleClass", "getBusyIndicatorDelay",
	"setBusyIndicatorDelay", "getVisible", "setVisible", "getFieldGroupIds", "setFieldGroupIds", "getBusy", "setBusy",
	"setTooltip", "getTooltip"].forEach(function(sName){
		QuickView.prototype[sName] = function() {
			if (this._oPopover && this._oPopover[sName]) {
				var res = this._oPopover.getAggregation("_popup")[sName].apply(this._oPopover.getAggregation("_popup"), arguments);
				return res === this._oPopover.getAggregation("_popup") ? this : res;
			}

		};
	});

	["setModel", "bindAggregation", "setAggregation", "insertAggregation", "addAggregation",
		"removeAggregation", "removeAllAggregation", "destroyAggregation"].forEach(function (sFuncName) {
			QuickView.prototype["_" + sFuncName + "Old"] = QuickView.prototype[sFuncName];
			QuickView.prototype[sFuncName] = function () {
				var newArgs,
					result;

				if (["removeAggregation", "removeAllAggregation", "destroyAggregation"].indexOf(sFuncName) !== -1) {
					newArgs = [arguments[0], true];
				} else {
					newArgs = [arguments[0], arguments[1], true];
				}

				result = QuickView.prototype["_" + sFuncName + "Old"].apply(this, newArgs);

				// Marks items aggregation as changed and invalidate popover to trigger rendering
				this._bItemsChanged = true;

				if (this._oPopover) {
					if (arguments[0] != "pages") {
						this._oPopover[sFuncName].apply(this._oPopover, arguments);
					}

					if (this._bRendered) {
						this._initializeQuickView();
					}
				}

				if (["removeAggregation", "removeAllAggregation"].indexOf(sFuncName) !== -1) {
					return result;
				}

				return this;
			};
		});

	return QuickView;

});
