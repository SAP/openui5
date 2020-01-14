/*
 * ! ${copyright}
 */
sap.ui.define([
	'sap/ui/core/Control',
	'sap/m/Toolbar',
	'sap/m/Button',
	'sap/m/ResponsivePopover',
	'sap/m/ToolbarSpacer',
	'sap/ui/dom/containsOrEquals'
], function(
	Control,
	Toolbar,
	Button,
	ResponsivePopover,
	ToolbarSpacer,
	containsOrEquals
) {
	"use strict";

	/**
	 * Constructor for the control.
	 * @param {string} [sId] id for the new control.
	 * @param {string} [mSettings] initial settings for the new control.
	 *
	 * @class
	 * The <code>ColumnHeaderPopover</code> control provides the capabilities to perform sorting, filter and grouping on a table column.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @since 1.63
	 * @private
	 * @alias sap.m.ColumnHeaderPopover
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ColumnHeaderPopover = Control.extend("sap.m.ColumnHeaderPopover", /** @lends sap.m.ColumnHeaderPopover.prototype */
		{
			library: "sap.m",
			metadata: {
				properties: {},
				aggregations: {
					/**
					 * Note that the content created inside ColumnPopoverCustomItem can not be used more than once.
					 */
					items: {type: "sap.m.ColumnPopoverItem", multiple: true, singularName: "item", bindable: true},
					_popover: {type: "sap.m.ResponsivePopover", multiple: false, visibility: "hidden"}
				},
				defaultAggregation: "items",
				associations: {
					ariaLabelledBy: {
						type: "sap.ui.core.Control",
						multiple: true,
						singularName: "ariaLabelledBy"
					}
				}
			}
		});

	ColumnHeaderPopover.prototype.init = function() {
		this._bPopoverCreated = false;
		this._oShownCustomContent = null;
		var that = this;
		this._minWidthDelegate = function() {
			this.$().css("min-width", that.minWidth);
		};
	};

	ColumnHeaderPopover.prototype.exit = function() {
		if (this._oToolbar){
			this._oToolbar.destroy();
			this._oToolbar = null;
		}
		this._closeBtn = null;
		this._spacer = null;
		this._aButtons = null;
		this._oShownCustomContent = null;
	};

	ColumnHeaderPopover.prototype._createPopover = function() {
		var that = this;
		this._oShownCustomContent = null;
		var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
			sCloseText = oBundle.getText("COLUMNHEADERPOPOVER_CLOSE_BUTTON");

		var oPopover = new ResponsivePopover(this.getId() + "-popover", {
			showArrow: false,
			showHeader: false,
			placement: "Bottom",
			verticalScrolling: true,
			horizontalScrolling: false,
			ariaLabelledBy: this.getAriaLabelledBy(),
			beforeClose: function(oEvent) {
				if (that._oShownCustomContent) {
					that._oShownCustomContent.setVisible(false);
					that._oShownCustomContent = null;
				}
				that._cleanSelection();
			}
		});

		oPopover._oControl.addDelegate({"onAfterRendering": this._minWidthDelegate}, oPopover._oControl);
		this.setAggregation("_popover", oPopover);
		var oToolbar = new Toolbar(this.getId() + "-tb");
		this._spacer = new ToolbarSpacer();
		this._closeBtn = new Button(oToolbar.getId() + "-closeBtn", {
			type: "Transparent",
			icon: "sap-icon://decline",
			tooltip: sCloseText,
			press: [
				oPopover.close, oPopover
			]
		});
		oToolbar.addContent(this._spacer);
		oToolbar.addContent(this._closeBtn);

		oPopover.addContent(oToolbar);
		this._oToolbar = oToolbar;
	};

	ColumnHeaderPopover.prototype._cleanSelection = function(oButton) {
		var aButtons = this._aButtons;
		if (aButtons) {
			aButtons.forEach(function(oBtn) {
				if ((!oButton || oBtn !== oButton) && oBtn.getPressed && oBtn.getPressed()) {
					oBtn.setPressed(false);
				}
			});
		}
	};

	ColumnHeaderPopover.prototype.openBy = function(oControl) {
		// Create popover with empty toolbar inside once
		if (!this._bPopoverCreated) {
			this._createPopover();
			this._bPopoverCreated = true;
		} else {
			this._oToolbar.removeContent(this._spacer);
			this._oToolbar.removeContent(this._closeBtn);
			this._oToolbar.destroyContent();
		}

		var oPopover = this.getAggregation("_popover");
		var aButtons = [];
		var aItems = this.getItems();
		// Per Ux design the max number of the items (visible buttons) is 5 (plus spacer and the close button).
		// As soon as this number can be changed we will introduce  property or other possiblity to configure it.
		var iMaxNumOfItems = 5;
		for (var i = 0; (i < aItems.length) && (aButtons.length < iMaxNumOfItems); i++) {
			var oItem = aItems[i];
			if (oItem.getVisible()) {
				var oButton = oItem._createButton(this._oToolbar.getId() + "-btn_" + i, this);
				oButton._sContentId = oItem._sContentId; // used in custom item
				aButtons.push(oButton);
				this._oToolbar.insertContent(oButton, i);
			}
		}

		if (aButtons.length === 0) {
			return;
		}
		this._aButtons = aButtons;

		this._oToolbar.addContent(this._spacer);
		this._oToolbar.addContent(this._closeBtn);
		// Append to static area of the UIArea once
		if (!this._bAppendedToUIArea && !this.getParent()) {
			var oStatic = sap.ui.getCore().getStaticAreaRef();
			oStatic = sap.ui.getCore().getUIArea(oStatic);
			oStatic.addContent(this, true);
			this._bAppendedToUIArea = true;
		}

		var oOpenerDomRef = oControl.getFocusDomRef();
		if (oOpenerDomRef) {
			oPopover.setOffsetY(-oOpenerDomRef.clientHeight);
			this.minWidth = oOpenerDomRef.clientWidth;
		}
		oPopover.openBy(oControl);
	};

	ColumnHeaderPopover.prototype.invalidate = function(oOrigin) {
		var oPopover = this.getAggregation("_popover");
		// Calls invalidate for the control tree only when the call comes from the internal popover.
		// If the call is triggered by this control itself, it does nothing to prevent the renderer of this control to be called.
		// Note that due the following code ColumnHeaderPopover control is not immediately changed when it is currently opened.
		// The changes will only have effect for the next opening ( so, when the properties or aggregations are changed, for example,
		// a new item or it's propery has been changed during the popup is open).
		if (oOrigin === oPopover) {
			Control.prototype.invalidate.apply(this, arguments);
		}
		return this;
	};

	/*
	 *	Forward the ariaLabelledBy association of the inner control to the ColumnHeaderPopover control.
	 */
	ColumnHeaderPopover.prototype.addAriaLabelledBy = function(sId) {
		// get internal responsive popover control
		var oRPopoverControl = this.getAggregation("_popover");
		if (oRPopoverControl) {
			oRPopoverControl.addAriaLabelledBy(sId);
		}
		return this.addAssociation("ariaLabelledBy", sId);
	};

	ColumnHeaderPopover.prototype.removeAriaLabelledBy = function(vObject) {
		// get internal responsive popover control
		var oRPopoverControl = this.getAggregation("_popover");
		if (oRPopoverControl) {
			oRPopoverControl.removeAriaLabelledBy(vObject);
		}
		return this.removeAssociation("ariaLabelledBy", vObject);
	};

	ColumnHeaderPopover.prototype.removeAllAssociation = function(sAssociationName, bSuppressInvalidate) {
		if (sAssociationName === "ariaLabelledBy") {
			// get internal responsive popover control
			var oRPopoverControl = this.getAggregation("_popover");
			if (oRPopoverControl) {
				oRPopoverControl.removeAllAssociation(sAssociationName, bSuppressInvalidate);
			}
		}
		return Control.prototype.removeAllAssociation.apply(this, arguments);
	};

	return ColumnHeaderPopover;
});