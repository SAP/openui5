/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/ResponsivePopover",
	"sap/m/Button",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/ScrollContainer",
	"sap/m/library",
	"sap/ui/Device",
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/core/StaticArea",
	"sap/ui/thirdparty/jquery",
	"sap/ui/dom/containsOrEquals",
	"sap/ui/events/ControlEvents",
	"sap/base/strings/capitalize",
	"sap/m/p13n/AbstractContainerItem",
	"sap/m/p13n/Container",
	"sap/m/table/columnmenu/MenuRenderer",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/GridData",
	"sap/ui/layout/form/ResponsiveGridLayout",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/m/Label"
], function (
	ResponsivePopover,
	Button,
	Toolbar,
	ToolbarSpacer,
	ScrollContainer,
	library,
	Device,
	Control,
	Element,
	Library,
	coreLibrary,
	StaticArea,
	jQuery,
	containsOrEquals,
	ControlEvents,
	capitalize,
	AbstractContainerItem,
	Container,
	MenuRenderer,
	Form,
	GridData,
	ResponsiveGridLayout,
	FormContainer,
	FormElement,
	Label
) {
	"use strict";

	var HasPopup = coreLibrary.aria.HasPopup;
	var VerticalAlign = coreLibrary.VerticalAlign;
	var Category = library.table.columnmenu.Category;

	/**
	 * Constructor for a new <code>Menu</code>.
	 *
	 * @param {string} [sId] ID for the new <code>Menu</code>, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new <code>Menu</code>
	 *
	 * @class
	 * The <code>Menu</code> control is a popover, intended to be used by a table.
	 * It serves as an entry point for the table personalization via the column headers.
	 * The menu is separated into two sections: quick actions and menu items.
	 *
	 * The top section of the popover contains contextual quick actions for the column the menu was triggered from.
	 * The lower section contains menu items related to generic and global table settings.
	 *
	 * There are control- and application-specific quick actions and menu items.
	 * Applications can add their own quick actions and items.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.110
	 *
	 * @alias sap.m.table.columnmenu.Menu
	 */
	var Menu = Control.extend("sap.m.table.columnmenu.Menu", {

		metadata: {
			library: "sap.m",
			interfaces: ["sap.ui.core.IColumnHeaderMenu"],
			defaultAggregation: "quickActions",
			aggregations: {
				/**
				 * Defines the quick actions of the column menu.
				 */
				quickActions: { type: "sap.m.table.columnmenu.QuickActionBase" },

				/**
				 * Defines the items of the column menu.
				 */
				items: { type: "sap.m.table.columnmenu.ItemBase" },

				/**
				 * Defines quick actions that are control-specific.
				 * @private
				 */
				_quickActions: { type: "sap.m.table.columnmenu.QuickActionBase", visibility: "hidden" },

				/**
				 * Defines menu items that are control-specific.
				 * @private
				 */
				_items: { type: "sap.m.table.columnmenu.ItemBase", visibility: "hidden" }
			},
			events: {
				/**
				 * Fired before the column menu is opened
				 */
				beforeOpen: {
					allowPreventDefault : true,
					parameters : {
						/**
						 * The element for which the menu is opened. If it is an <code>HTMLElement</code>, the closest control is passed for this event
						 * (if it exists).
						 */
						openBy : {type : "sap.ui.core.Element"}
					}
				},
				/**
				 * Fires after the column menu is closed
				 * @since 1.112
				 */
				afterClose: {
				}
			}
		},
		renderer: MenuRenderer
	});

	var DEFAULT_KEY = "$default";
	var ARIA_POPUP_TYPE = HasPopup.Dialog;

	Menu.prototype.init = function() {
		this.fAnyEventHandlerProxy = jQuery.proxy(function(oEvent){
			if (!this.isOpen() || !this.getDomRef() || (oEvent.type != "mousedown" && oEvent.type != "touchstart")) {
				return;
			}
			this.handleOuterEvent(this.getId(), oEvent);
		}, this);
	};

	/**
	 * Opens the popover at the specified target.
	 *
	 * @param {sap.ui.core.Control | HTMLElement} oAnchor This is the control or HTMLElement where the popover is placed.
	 * @param {boolean} [bSuppressEvent] Whether to suppress the beforeOpen event.
	 * @public
	 */
	Menu.prototype.openBy = function(oAnchor, bSuppressEvent) {
		if (this.isOpen() && oAnchor === this._oIsOpenBy) {
			return;
		}

		var bExecuteDefault = true;
		var oControl = oAnchor;
		if (!(oAnchor instanceof Element)) {
			oControl = Element.closestTo(oAnchor, true);
		}

		if (!bSuppressEvent) {
			bExecuteDefault = this.fireBeforeOpen({
				openBy: oControl
			});
		}

		if (!bExecuteDefault) {
			return;
		}

		this._initPopover();

		if (this._oQuickActionContainer) {
			this._oQuickActionContainer.destroy();
			this._oQuickActionContainer = null;
		}
		this._initQuickActionContainer();

		if (this._oItemsContainer) {
			this._oItemsContainer.destroy();
			this._oItemsContainer = null;
		}
		this._initItemsContainer();

		if (!this.getParent()) {
			StaticArea.getUIArea().addContent(this, true);
		}

		this._oPopover.openBy(oAnchor);
		this._oIsOpenBy = oAnchor;
		ControlEvents.bindAnyEvent(this.fAnyEventHandlerProxy);
	};

	/**
	 * Returns the <code>sap.ui.core.aria.HasPopup<\code> type of the menu.
	 *
	 * @returns {sap.ui.core.aria.HasPopup} <code>sap.ui.core.aria.HasPopup</code> type of the menu
	 * @public
	 * @since 1.98.0
	 */
	Menu.prototype.getAriaHasPopupType = function () {
		return ARIA_POPUP_TYPE;
	};

	/**
	 * Determines whether the menu is open.
	 *
	 * @returns {boolean} Whether the menu is open.
	 */
	Menu.prototype.isOpen = function () {
		return this._oPopover ? this._oPopover.isOpen() : false;
	};

	/**
	 * Closes the popover.
	 *
	 * @public
	 */
	Menu.prototype.close = function () {
		this._previousView = null;
		if (this._oPopover && this._oPopover.isOpen()) {
			if (this._oQuickActionContainer) {
				this._oQuickActionContainer.destroyFormContainers();
			}
			if (this._oItemsContainer) {
				this._oItemsContainer.destroy();
				this._oItemsContainer = null;
			}

			StaticArea.getUIArea().removeContent(this, true);
			this._oPopover.close();
			ControlEvents.unbindAnyEvent(this.fAnyEventHandlerProxy);
		}
	};

	Menu.prototype._onPopoverAfterClose = function () {
		this.fireAfterClose();
	};

	Menu.prototype.exit = function () {
		Control.prototype.exit.apply(this, arguments);
		if (this._oPopover) {
			delete this._oPopover;
		}
		if (this._oQuickActionContainer) {
			delete this._oQuickActionContainer;
		}
		if (this._oItemsContainer) {
			delete this._oItemsContainer;
		}
		if (this._oIsOpenBy) {
			delete this._oIsOpenBy;
		}
		ControlEvents.unbindAnyEvent(this.fAnyEventHandlerProxy);
	};

	Menu.prototype._initPopover = function () {
		if (this._oPopover) {
			return;
		}

		this._oPopover = new ResponsivePopover({
			title: this._getResourceText("table.COLUMNMENU_TITLE"),
			ariaLabelledBy: this.getId() + "-menuDescription",
			showArrow: false,
			showHeader: Device.system.phone,
			placement: library.PlacementType.VerticalPreferredBottom,
			content: new AssociativeControl({control: this, height: true}),
			horizontalScrolling: false,
			verticalScrolling: true, //Temporary Solution until UX design for a proper overflow of all areas in the menu exists
			afterClose: [this._onPopoverAfterClose, this]
		});
		this.addDependent(this._oPopover);
		this._oPopover.addStyleClass("sapMTCMenuPopup");

		this._oPopover.addEventDelegate({
			"onAfterRendering": this._focusItem
		}, this);

		this._oPopover.addEventDelegate({
			"onsapfocusleave": this.handleFocusLeave
		}, this);

		this._oPopover._oControl.oPopup.setAutoClose(false);
	};

	Menu.prototype.handleFocusLeave = function(oEvent){
		if (!this.isOpen()) {
			return;
		}

		if (oEvent.relatedControlId &&
			(!containsOrEquals(this.getDomRef(), jQuery(document.getElementById(oEvent.relatedControlId)).get(0)) && !isInControlTree(this, Element.getElementById(oEvent.relatedControlId)))) {
			this.close();
		}
	};

	Menu.prototype.handleOuterEvent = function(oMenuId, oEvent) {
		var touchEnabled = Device.support.touch || Device.system.combi;

		if (touchEnabled && (oEvent.isMarked("delayedMouseEvent") || oEvent.isMarked("cancelAutoClose"))) {
			return;
		}

		if (oEvent.type == "mousedown" || oEvent.type == "touchstart") {
			if (!containsOrEquals(this.getDomRef(), oEvent.target) && !containsOrEquals(StaticArea.getDomRef(), oEvent.target) && !isInControlTree(this, Element.closestTo(oEvent.target))) {
				this.close();
			}
		}
	};

	function isInControlTree(oParent, oChild) {
		if (!oParent || !oChild) {
			return false;
		}
		var temp = oChild.getParent();
		if (!temp) {
			return false;
		} else if (temp === oParent) {
			return true;
		}
		return isInControlTree(oParent, temp);
	}

	Menu.prototype._initItemsContainer = function () {
		var aMenuItems = this._getAllEffectiveItems();
		var bHasQuickActions = this._hasQuickActions();
		var bHasitems =  this._hasItems();

		if (!this._oItemsContainer) {
			this._createItemsContainer();
		}

		aMenuItems.forEach(function (oColumnMenuItem, iIndex) {
			this._addView(oColumnMenuItem);

			if (bHasQuickActions && bHasitems && iIndex === 0) {
				this._oItemsContainer.addSeparator();
			}
		}.bind(this));
	};

	var AssociativeControl = Control.extend("sap.m.table.columnmenu.AssociativeControl", {
		metadata: {
			"final": true,
			properties: {
				height: {type: "boolean", defaultValue: false}
			},
			associations: {
				control: {type: "sap.ui.core.Control"}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function (oRm, oControl) {
				oRm.openStart("div", oControl);
				oControl.getHeight() && oRm.style("height", "100%");
				oRm.openEnd();
				oRm.renderControl(Element.getElementById(oControl.getControl()));
				oRm.close("div");
			}
		}
	});

	Menu.prototype._addView = function (oMenuItem) {
		var oItem = new AbstractContainerItem({
			content: new AssociativeControl({
				control: oMenuItem.getContent(),
				height: true
			}),
			key: oMenuItem.getId(),
			text: oMenuItem.getLabel(),
			icon: oMenuItem.getIcon()
		});

		this._oItemsContainer.addView(oItem);
		this._setItemVisibility(oMenuItem, oMenuItem.getVisible());
		oMenuItem.getScrollDelegate = function() {
			return oItem.getParent().getLayout().getScrollDelegate();
		};
	};

	Menu.prototype._createItemsContainer = function () {
		this._oBtnCancel = new Button({
			text: this._getResourceText("table.COLUMNMENU_CANCEL"),
			press: [function () {
				var sKey = this._oItemsContainer.getCurrentViewKey();
				if (this._fireEvent(Element.getElementById(sKey), "cancel")) {
					this.close();
				}
			}, this]
		});
		this._oBtnOk = new Button({
			text: this._getResourceText("table.COLUMNMENU_CONFIRM"),
			type: library.ButtonType.Emphasized,
			press: [function () {
				var sKey = this._oItemsContainer.getCurrentViewKey();
				if (this._fireEvent(Element.getElementById(sKey), "confirm")) {
					this.close();
				}
			}, this]
		});

		this._oItemsContainer = new Container({
			listLayout: true,
			defaultView: DEFAULT_KEY,
			footer: new Toolbar({
				content: [
					new ToolbarSpacer(),
					this._oBtnOk,
					this._oBtnCancel
				]
			}),
			beforeViewSwitch: [function (oEvent) {
				var mParameters = oEvent.getParameters();
				this.invalidate();
				if (mParameters.target !== "$default") {
					var oContainerItem = this._oItemsContainer.getView(mParameters.target);
					var oColumnMenuItem = this._getItemFromContainerItem(oContainerItem);
					if (oColumnMenuItem && !this._fireEvent(oColumnMenuItem, "press")) {
						oEvent.preventDefault();
					}
				}
			}, this],
			afterViewSwitch: [function (oEvent) {
				var aDependents = this.getDependents();
				if (aDependents) {
					aDependents.forEach(function (oDependent) {
						if (oDependent && oDependent.isA("sap.ui.core.Control")) {
							oDependent.invalidate();
						}
					});
				}
				var mParameters = oEvent.getParameters();
				this._oItemsContainer.getLayout().setShowFooter(mParameters.target !== "$default");

				this._previousView = mParameters.source;
				if (mParameters.target !== "$default") {
					var oContainerItem = this._oItemsContainer.getView(mParameters.target);
					if (oContainerItem) {
						var oItem = this._getItemFromContainerItem(oContainerItem);
						this._updateButtonState(oItem);
						this._focusItem();
					}
				} else {
					this._focusItem();
				}
			}, this]
		});
		this._oItemsContainer.getHeader().addContentRight(new Button({
			text: this._getResourceText("table.COLUMNMENU_RESET"),
			press: [function () {
				this._fireEvent(Element.getElementById(this._oItemsContainer.getCurrentViewKey()), "reset", false);
			}, this]
		}));
		this._oItemsContainer?._getNavigationList().addAriaLabelledBy(this.getId() + "-itemContainerDescription");
		this._oPopover.addDependent(this._oItemsContainer);
		this.addDependent(this._oItemsContainer);
	};

	Menu.prototype._fireEvent = function (oEntry, sEventType, bAllowPreventDefault) {
		var fnHook = oEntry["on" + capitalize(sEventType)];
		if (bAllowPreventDefault !== false) {
			var oEvent = jQuery.Event(sEventType);
			fnHook.call(oEntry, oEvent);
			return !oEvent.isDefaultPrevented();
		} else {
			fnHook.call(oEntry);
			return true;
		}
	};

	Menu.prototype._getResourceText = function(sText, aValue) {
		this.oResourceBundle = this.oResourceBundle ? this.oResourceBundle : Library.getResourceBundleFor("sap.m");
		return sText ? this.oResourceBundle.getText(sText, aValue) : this.oResourceBundle;
	};

	var mSortOrder = {};
	mSortOrder[Category.Sort] = 0;
	mSortOrder[Category.Filter] = 1;
	mSortOrder[Category.Group] = 2;
	mSortOrder[Category.Aggregate] = 3;
	mSortOrder[Category.Generic] = 4;

	Menu.prototype._getAllEffectiveQuickActions = function(bSkipImplicitSorting) {
		var aQuickActions = (this.getAggregation("_quickActions") || []).concat(this.getQuickActions());

		aQuickActions = aQuickActions.reduce(function(aQuickActions, oQuickAction) {
			return aQuickActions.concat(oQuickAction ? oQuickAction.getEffectiveQuickActions() : []);
		}, []);

		if (!bSkipImplicitSorting) {
			aQuickActions.sort(function(oLeftQuickAction, oRightQuickAction) {
				return mSortOrder[oLeftQuickAction.getCategory()] - mSortOrder[oRightQuickAction.getCategory()];
			});
		}

		return aQuickActions;
	};

	Menu.prototype._hasQuickActions = function() {
		return this._getAllEffectiveQuickActions(true).length > 0;
	};

	Menu.prototype._getAllEffectiveItems = function() {
		var aItems = (this.getAggregation("_items") || []).concat(this.getItems());
		return aItems.reduce(function(a, oItem) {
			return a.concat(oItem.getEffectiveItems());
		}, []).filter(function (oItem) {
			return oItem.getVisible();
		});
	};

	Menu.prototype._hasItems = function() {
		return this._getAllEffectiveItems().length > 0;
	};

	Menu.prototype._getItemFromContainerItem = function (oContainerItem) {
		// Low performance as linear search has to be done
		return this._getAllEffectiveItems().find(function(item) {
			return item.getId() === oContainerItem.getKey();
		});
	};

	Menu.prototype._updateButtonState = function (oItem) {
		if (!this._oItemsContainer) {
			return;
		}
		if (this._oItemsContainer.getCurrentViewKey() === DEFAULT_KEY) {
			return;
		}
		this._oItemsContainer.getHeader().getContentRight()[0].setVisible(oItem.getButtonSettings()["reset"]["visible"]);
		this._oItemsContainer.getHeader().getContentRight()[0].setEnabled(oItem.getButtonSettings()["reset"]["enabled"]);
		this._oBtnOk.setVisible(oItem.getButtonSettings()["confirm"]["visible"]);
		this._oBtnCancel.setVisible(oItem.getButtonSettings()["cancel"]["visible"]);
	};

	Menu.prototype._focusItem = function () {
		if (this._previousView == DEFAULT_KEY) {
			this._oItemsContainer._getNavBackBtn().focus();
		} else {
			var oItem = this._oItemsContainer?._getNavigationList().getItems().find(function (oItem) {
				return oItem.getVisible() && oItem._key === this._previousView;
			}.bind(this));
			oItem && oItem.focus();
		}
	};

	Menu.prototype._setItemVisibility = function (oItem, bVisible) {
		if (!this._oItemsContainer) {
			return;
		}

		var oList = this._oItemsContainer?._getNavigationList().getItems();
		var oListItem = oList.find(function (oListItem) {
			return oListItem._key == oItem.getId();
		});
		oListItem?.setVisible(bVisible);
	};

	Menu.prototype._initQuickActionContainer = function () {
		var oFormContainer = new FormContainer();

		if (!this._oQuickActionContainer) {
			this._oQuickActionContainer = new Form({
				layout: new ResponsiveGridLayout({
					breakpointM: 600,
					labelSpanXL: 4,
					labelSpanL: 4,
					labelSpanM: 4,
					labelSpanS: 12,
					columnsL: 1,
					columnsM: 1,
					adjustLabelSpan: false
				}),
				editable: true
			});

			this._oQuickActionContainer.addStyleClass("sapMTCMenuQAForm");
			this._oQuickActionContainer.addAriaLabelledBy(this.getId() + "-actionContainerDescription");
			this._oQuickActionContainer.addEventDelegate({
				onAfterRendering: function() {
					this.getDomRef().classList.remove("sapUiFormLblColon");
				}
			}, this._oQuickActionContainer);
		} else {
			this._oQuickActionContainer.destroyFormContainers();
		}

		this._oQuickActionContainer.addFormContainer(oFormContainer);

		this._getAllEffectiveQuickActions().forEach(function(oQuickAction) {
			if (!oQuickAction.getVisible()) {
				return;
			}

			// Create label
			var oGridData = new GridData({span: "XL4 L4 M4 S12"});
			var sQuickActionLabel = oQuickAction.getLabel();
			var oLabel = new Label({
				text: sQuickActionLabel,
				layoutData: oGridData,
				vAlign: VerticalAlign.Middle,
				wrapping: true,
				width: "100%",
				showColon: sQuickActionLabel !== ""
							&& !(oQuickAction.getParent() && oQuickAction.getParent().isA("sap.m.table.columnmenu.QuickSortItem"))
							&& oQuickAction._bHideLabelColon !== true
			});
			oLabel.addStyleClass("sapMTCMenuQALabel");

			// Create content
			var aControls = [];
			var aContent = oQuickAction.getContent() || [];

			aContent.forEach(function(oItem, iIndex) {
				var oGridData, sSpan, sIndent, oControl;

				if (oItem.getLayoutData()) {
					oGridData = oItem.getLayoutData().clone();
				} else {
					sSpan = "L8 M8 S12";
					sIndent = "";

					if (iIndex > 0 || (iIndex == 0 && aContent.length > 1)) {
						sSpan = "L4 M4 S6";

						if (iIndex != 0 && (iIndex + 1) % 2 > 0) {
							sIndent = "L4 M4 S0";
						}
					}
					oGridData = new GridData({span: sSpan, indent: sIndent});
				}
				oItem.removeAllAssociation("ariaLabelledBy");
				oItem.addAssociation("ariaLabelledBy", oLabel.getId());
				oControl = new AssociativeControl({control: oItem.setWidth("100%")});
				oControl.setLayoutData(oGridData);
				aControls.push(oControl);
			}, this);
			oFormContainer.addFormElement(new FormElement({label: oLabel, fields: aControls}));
		}, this);

		this.addDependent(this._oQuickActionContainer);
	};

	return Menu;
});