/*
 * ! ${copyright}
 */
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/model/base/ManagedObjectModel',
	'sap/m/OverflowToolbar',
	'sap/m/ResponsivePopover',
	'sap/m/OverflowToolbarButton',
	'sap/m/OverflowToolbarToggleButton',
	'sap/m/ToolbarSpacer',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator'
], function(
	Control,
	ManagedObjectModel,
	OverflowToolbar,
	ResponsivePopover,
	OverflowToolbarButton,
	OverflowToolbarToggleButton,
	ToolbarSpacer,
	Filter,
	FilterOperator
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
			properties: {

			},
			aggregations: {
				items: {type : "sap.m.ColumnPopoverItem",  multiple : true, singularName : "item", bindable: true},
				_popover: {type : "sap.m.ResponsivePopover", multiple : false, visibility : "hidden"}
			}
		}
	});

	ColumnHeaderPopover.prototype.init = function() {
		var oModel = new ManagedObjectModel(this);
		var that = this;
		this._oShownCustomContent = null;

		var oPopover = new ResponsivePopover({
			showArrow: false,
			showHeader: false,
			placement: "Bottom",
			verticalScrolling: true,
			horizontalScrolling: false
		});

		this.setAggregation("_popover", oPopover);


		var oFilter = new Filter({
			path: "visible",
			operator: FilterOperator.EQ,
			value1: true
		});

		var fnFactory = function(id, oContext) {
			var oItem = oContext.getObject();
			if (oItem.isA("sap.m.ColumnPopoverActionItem")) {
				return that._createActionItem(id, oItem);
			} else if (oItem.isA("sap.m.ColumnPopoverCustomItem")) {
				return that._createCustomItem(id, oItem);
			}
		};

		var oToolbar = new OverflowToolbar({
			content: {
				path: '/items',
				filters: [oFilter],
				length: 5,
				factory: fnFactory
			}
		});

		oToolbar.updateAggregation = function() {
			// clear _oShownCustomContent
			if (this._oShownCustomContent) {
				this._oShownCustomContent = null;
			}

			OverflowToolbar.prototype.updateAggregation.apply(this, arguments);
			oToolbar.addContent(new ToolbarSpacer());
			oToolbar.addContent(new OverflowToolbarButton({
				type: "Transparent",
				icon: "sap-icon://decline",
				tooltip: "Close",
				press: [
					oPopover.close, oPopover
				]
			}));
		};

		oPopover.addContent(oToolbar);
		oPopover.setModel(oModel);
	};

	ColumnHeaderPopover.prototype._createActionItem = function(id, oItem) {
		var that = this;
		var oPopover = this.getAggregation("_popover");

		return new OverflowToolbarButton(id, {
			icon: "{icon}",
			tooltip: "{text}",
			type: "Transparent",
			press: function() {
				if (that._oShownCustomContent) {
					that._oShownCustomContent.setVisible(false);
					that._oShownCustomContent = null;

					// set other buttons unpressed
					that._cleanSelection(oPopover);
				}
				oItem.firePress();
			}
		});
	};

	ColumnHeaderPopover.prototype._createCustomItem = function(id, oItem) {
		var that = this;
		var oPopover = this.getAggregation("_popover");
		var oContent = oItem.getContent();
		if (oContent) {
			oContent.setVisible(false);
		}
		oPopover.addContent(oContent);

		return new OverflowToolbarToggleButton(id, {
			icon: "{icon}",
			type: "Transparent",
			tooltip: "{text}",
			press: function() {
				// between two custom items
				if (that._oShownCustomContent) {
					that._oShownCustomContent.setVisible(false);
				}
				if (this.getPressed()) {
					// set other buttons unpressed
					that._cleanSelection(oPopover);

					oItem.fireBeforeShowContent();
					oContent.setVisible(true);
					that._oShownCustomContent = oContent;
					oItem._sRelatedId = oContent.sId;
				} else {
					oContent.setVisible(false);
					that._oShownCustomContent = null;
				}

			}
		});

	};

	ColumnHeaderPopover.prototype._cleanSelection = function(oPopover) {
		var oContent = oPopover.getContent()[0],
			aButtons;

		if (oContent && oContent.isA("sap.m.OverflowToolbar") && oContent.getContent()) {
			aButtons = oContent.getContent();
		}

		if (aButtons) {
			for (var i = 0; i < aButtons.length; i++) {
				if (aButtons[i] !== this
					&& aButtons[i].getPressed
						&& aButtons[i].getPressed()) {
							aButtons[i].setPressed(false);
						}
			}
		}

	};

	ColumnHeaderPopover.prototype.updateAggregation = function() {
		var oPopover = this.getAggregation("_popover"),
			aContents;
		if (oPopover) {
			aContents = oPopover.getAggregation("content");
		}
		if (aContents) {
			for ( var i = 0; i < aContents.length; i++ ) {
				if (!aContents[i].isA("sap.m.OverflowToolbar")) {
					oPopover.removeAggregation("content", aContents[i]);
				}
			}
		}

		Control.prototype.updateAggregation.apply(this, arguments);

	};

	ColumnHeaderPopover.prototype.openBy = function(oControl) {
		var oPopover = this.getAggregation("_popover");
		if (!this._bAppendedToUIArea && !this.getParent()) {
			var oStatic = sap.ui.getCore().getStaticAreaRef();
			oStatic = sap.ui.getCore().getUIArea(oStatic);
			oStatic.addContent(this, true);
			this._bAppendedToUIArea = true;
		}

		var oOpenerDomRef = oControl.getFocusDomRef();
		if (oOpenerDomRef) {
			oPopover.setOffsetY(-oOpenerDomRef.clientHeight);
		}
		oPopover.openBy(oControl);
	};

	ColumnHeaderPopover.prototype.exit = function() {
		this._oShownCustomContent = null;
		var oPopover = this.getAggregation("_popover");
		if (oPopover.getContent()) {
			oPopover.destroyContent();
		}
	};


	return ColumnHeaderPopover;
});