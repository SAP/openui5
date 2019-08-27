/*
 * ! ${copyright}
 */
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/model/base/ManagedObjectModel',
	'sap/m/Toolbar',
	'sap/m/ResponsivePopover',
	'sap/m/Button',
	'sap/m/ToggleButton',
	'sap/m/ToolbarSpacer',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/ui/dom/containsOrEquals',
	'sap/m/ColumnPopoverItem',
	'sap/m/StandardListItem',
	'sap/m/List'
], function(
	Control,
	ManagedObjectModel,
	Toolbar,
	ResponsivePopover,
	Button,
	ToggleButton,
	ToolbarSpacer,
	Filter,
	FilterOperator,
	containsOrEquals,
	ColumnPopoverItem,
	StandardListItem,
	List
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
				/**
				 * Note that the content created inside ColumnPopoverCustomItem can not be used more than once.
				 */
				items: {type : "sap.m.ColumnPopoverItem",  multiple : true, singularName : "item", bindable: true},
				_popover: {type : "sap.m.ResponsivePopover", multiple : false, visibility : "hidden"}
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
	};

	ColumnHeaderPopover.prototype._createPopover = function() {
		var that = this;
		this._oShownCustomContent = null;
		var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
			sCloseText = oBundle.getText("COLUMNHEADERPOPOVER_CLOSE_BUTTON");

		var oPopover = new ResponsivePopover({
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
				that._cleanSelection(this);
			}
		});

		this.setAggregation("_popover", oPopover);

		var oToolbar = new Toolbar();
		// enable the diff calculation on the toolbar control
		// this flag is required by the ManagedObject.prototype.updateAggregation
		// the diff calculation is needed to avoid destroying all buttons, which causes auto close of popover
		oToolbar.bUseExtendedChangeDetection = true;
		oPopover.addContent(oToolbar);

		var oFilter = new Filter({
			path: "visible",
			operator: FilterOperator.EQ,
			value1: true
		});

		var fnFactory = function(id, oContext) {
			var oItem = oContext.getObject();
			var oButton;
			if (oItem.isA("sap.m.ColumnPopoverActionItem")) {
				oButton = that._createActionItem(id, oItem);
			} else if (oItem.isA("sap.m.ColumnPopoverCustomItem")) {
				oButton = that._createCustomItem(id, oItem);
			} else if (oItem.isA("sap.m.ColumnPopoverSortItem")) {
				oButton = that._createSortItem(id, oItem);
			}

			oItem._sRelatedId = oButton.sId;
			oButton._sContentId = oItem._sContentId;

			oButton.destroy = function() {
				var oDomRef = this.getDomRef();
				if (oDomRef && containsOrEquals(oDomRef, document.activeElement)) {
					oPopover.focus();
					oPopover.removeContent(that._oShownCustomContent);

				}

				this.constructor.prototype.destroy.apply(this, arguments);
			};

			return oButton;
		};

		oToolbar.bindAggregation("content",{
			path: '/items',
			filters: [oFilter],
			length: 5,
			factory: fnFactory
		});

		oToolbar.updateAggregation = function(sAggregationName) {
				// clear _oShownCustomContent
				if (this._oShownCustomContent) {
					this._oShownCustomContent = null;
				}

				Toolbar.prototype.updateAggregation.apply(this, arguments);

				var aContent = this.getContent();
				if (aContent.length <= 2 || !(aContent[aContent.length - 2] instanceof ToolbarSpacer)) {
					this.addContent(new ToolbarSpacer());
					this.addContent(new Button({
						type: "Transparent",
						icon: "sap-icon://decline",
						tooltip: sCloseText,
						press: [
							oPopover.close, oPopover
						]
					}));
				}

		};

		var oModel = new ManagedObjectModel(this);

		oToolbar.setModel(oModel);

	};

	ColumnHeaderPopover.prototype._createActionItem = function(id, oItem) {
		var that = this;

		return new Button(id, {
			icon: "{icon}",
			tooltip: "{text}",
			type: "Transparent",
			press: function() {
				var oPopover = that.getAggregation("_popover");

				if (that._oShownCustomContent) {
					that._oShownCustomContent.setVisible(false);
					that._oShownCustomContent = null;

					// set other buttons unpressed
					that._cleanSelection(oPopover, this);
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
			oItem._sContentId = oContent.sId;
		}
		oPopover.addContent(oContent);

		return new ToggleButton(id, {
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
					that._cleanSelection(oPopover, this);

					oItem.fireBeforeShowContent();
					if (oContent) {
						oContent.setVisible(true);
						that._oShownCustomContent = oContent;
					}

				} else {
					if (oContent) {
						oContent.setVisible(false);
						that._oShownCustomContent = null;
					}
				}

			}
		});

	};

	ColumnHeaderPopover.prototype._createSortItem = function(id, oItem) {
		var that = this;
		var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
			sSortText = oBundle.getText("COLUMNHEADERPOPOVER_SORT_BUTTON");
		var aSortChildren = oItem.getSortChildren();

		if (aSortChildren.length > 1) {
			var oPopover = this.getAggregation("_popover");
			var oList = new List();

			for (var i = 0; i < aSortChildren.length; i++) {
				var oListItem = new StandardListItem({
					title: aSortChildren[i].getText(),
					type: "Active"
				});

				oList.addItem(oListItem);
				oListItem.data("key", aSortChildren[i].getKey());
			}

			oList.attachEvent( "itemPress", function(oEvent) {
				// close the popover first to prevent focus lost
				oPopover.close();

				var oListItem = oEvent.getParameter("listItem");
				oItem.fireSort({
					property: oListItem.data("key")
				});
			});
			oList.setVisible(false);
			oPopover.addContent(oList);

			return new ToggleButton(id, {
				icon: "sap-icon://sort",
				type: "Transparent",
				tooltip: sSortText,
				press: function() {
					// between two custom items
					if (that._oShownCustomContent) {
						that._oShownCustomContent.setVisible(false);
					}
					if (this.getPressed()) {
						// set other buttons unpressed
						that._cleanSelection(oPopover, this);

						if (oList) {
							oList.setVisible(true);
							that._oShownCustomContent = oList;
						}

					} else {
						if (oList) {
							oList.setVisible(false);
							that._oShownCustomContent = null;
						}
					}

				}
			});

		} else {

			return new Button(id, {
				icon: "sap-icon://sort",
				type: "Transparent",
				tooltip: sSortText,
				press: function() {
					var oPopover = that.getAggregation("_popover");

					if (that._oShownCustomContent) {
						that._oShownCustomContent.setVisible(false);
						that._oShownCustomContent = null;

						// set other buttons unpressed
						that._cleanSelection(oPopover, this);
					}

					// close the popover first to prevent focus lost
					oPopover.close();
					oItem.fireSort({
						property: aSortChildren[0] ? aSortChildren[0].getKey() : null
					});
				}
			});
		}
	};

	ColumnHeaderPopover.prototype._cleanSelection = function(oPopover, oButton) {
		var oContent = oPopover.getContent()[0],
			aButtons;
		aButtons = oContent.getContent();

		if (aButtons) {

			aButtons.forEach(function(oBtn) {
				if ((!oButton || oBtn !== oButton)
						&& oBtn.getPressed
							&& oBtn.getPressed()) {
					oBtn.setPressed(false);
					}

			});

		}

	};

	ColumnHeaderPopover.prototype.openBy = function(oControl) {

		if (!this._bPopoverCreated) {
			this._createPopover();
			this._bPopoverCreated = true;
		}

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
			oPopover.setContentWidth(oOpenerDomRef.clientWidth > 128 ? oOpenerDomRef.clientWidth + "px" : "128px");
		}

		oPopover.openBy(oControl);
	};

	ColumnHeaderPopover.prototype.invalidate = function(oOrigin) {
		var oPopover = this.getAggregation("_popover");

		// Pop the invalidate call up to the control tree only when the call
		// comes from the internal popover
		// If the call is triggered by this control itself, it does nothing to
		// prevent the renderer of this control to be called.
		if (oOrigin === oPopover) {
			Control.prototype.invalidate.apply(this, arguments);
		}

		return this;
	};

	ColumnHeaderPopover.prototype.addAssociation = function(sAssociationName, sId, bSuppressInvalidate) {
		if (sAssociationName === "ariaLabelledBy") {
			// get internal responsive popover control
			var oRPopoverControl = this.getAggregation("_popover");
			// forward the ariaLabelledBy association of the inner control to the ColumnHeaderPopover control
			oRPopoverControl && oRPopoverControl.addAssociation(sAssociationName, sId, bSuppressInvalidate);
		}
		return Control.prototype.addAssociation.apply(this, arguments);
	};

	ColumnHeaderPopover.prototype.removeAssociation = function(sAssociationName, vObject, bSuppressInvalidate) {
		if (sAssociationName === "ariaLabelledBy") {
			// get internal responsive popover control
			var oRPopoverControl = this.getAggregation("_popover");
			// forward the ariaLabelledBy association of the inner control to the ColumnHeaderPopover control
			oRPopoverControl && oRPopoverControl.removeAssociation(sAssociationName, vObject, bSuppressInvalidate);
		}
		return Control.prototype.removeAssociation.apply(this, arguments);
	};

	ColumnHeaderPopover.prototype.removeAllAssociation = function(sAssociationName, bSuppressInvalidate) {
		if (sAssociationName === "ariaLabelledBy") {
			// get internal responsive popover control
			var oRPopoverControl = this.getAggregation("_popover");
			// forward the ariaLabelledBy association of the inner control to the ColumnHeaderPopover control
			oRPopoverControl && oRPopoverControl.removeAllAssociation(sAssociationName, bSuppressInvalidate);
		}
		return Control.prototype.removeAllAssociation.apply(this, arguments);
	};

	return ColumnHeaderPopover;
});