/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/ResponsivePopover",
	"sap/m/Button",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/library",
	'sap/ui/Device',
	"sap/ui/core/Control",
	"sap/ui/core/Core",
	"sap/ui/core/library",
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
	library,
	Device,
	Control,
	Core,
	coreLibrary,
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

	// shortcut for sap.ui.core.aria.HasPopup
	var HasPopup = coreLibrary.aria.HasPopup;

	/**
	 * Constructor for a new Menu.
	 *
	 * @param {string} [sId] ID for the new Menu, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new Menu
	 *
	 * @class
	 * This Menu is a popover, intended to be used by a table.
	 * It serves as a entry point for the table personalization via the column headers.
	 * The Menu is separated into two sections: quick actions and menu items.
	 *
	 * The top section of the popover contains contextual quick actions for the column the menu was triggered from.
	 * The lower section contains menu items, which consist of generic and global table settings.
	 *
	 * There are control- and application-specific quick actions and menu items.
	 * Applications are able to add their own quick actions, actions and items.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @experimental
	 *
	 * @alias sap.m.table.columnmenu.Menu
	 */
	var Menu = Control.extend("sap.m.table.columnmenu.Menu", {
		metadata: {
			library: "sap.m",
			interfaces: ["sap.ui.core.IColumnHeaderMenu"],
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
			}
		},
		renderer: MenuRenderer
	});

	var DEFAULT_KEY = "$default";
	var ARIA_POPUP_TYPE = HasPopup.Dialog;
	var MENU_WIDTH = "500px";

	Menu.prototype.init = function() {
		this.fAnyEventHandlerProxy = jQuery.proxy(function(oEvent){
			if (!this._oPopover.isOpen() || !this.getDomRef() || (oEvent.type != "mousedown" && oEvent.type != "touchstart")) {
				return;
			}
			this.handleOuterEvent(this.getId(), oEvent);
		}, this);
	};

	Menu.prototype.applySettings = function (mSettings) {
		// Only works in JS views, but that's fine. This is only convenience for controls.
		if (mSettings) {
			this._addAllToPrivateAggregation(mSettings, "_quickActions");
			this._addAllToPrivateAggregation(mSettings, "_items");
		}
		Control.prototype.applySettings.apply(this, arguments);
	};

	/**
	 * Opens the popover at the specified target.
	 *
	 * @param {sap.ui.core.Control | HTMLElement} oAnchor This is the control or HTMLElement, where the popover will be placed at.
	 * @public
	 */
	Menu.prototype.openBy = function(oAnchor) {
		if (!this.getParent()) {
			Core.getUIArea(Core.getStaticAreaRef()).addContent(this, true);
		}

		this._initPopover();
		this._createQuickActionGrids();

		if (this._oItemsContainer) {
			this._oItemsContainer.destroy();
			this._oItemsContainer = null;
		}
		this._initItemsContainer();

		this._oPopover.openBy(oAnchor);
	};

	/**
	 * Returns the <code>sap.ui.core.aria.HasPopup<\code> type of the menu.
	 *
	 * @returns {sap.ui.core.aria.HasPopup} <code>sap.ui.core.aria.HasPopup<\code> type of the menu
	 * @public
	 * @since 1.98.0
	 */
	Menu.prototype.getAriaHasPopupType = function () {
		return ARIA_POPUP_TYPE;
	};

	/**
	 * Closes the popover.
	 *
	 * @public
	 */
	Menu.prototype.close = function () {
		this._previousView = null;
		if (this._oPopover) {
			this._oPopover.close();
		}
	};

	Menu.prototype.exit = function () {
		Control.prototype.exit.apply(this, arguments);
		if (this._oPopover) {
			delete this._oPopover;
		}
		if (this._oItemsContainer) {
			delete this._oItemsContainer;
		}
		ControlEvents.unbindAnyEvent(this.fAnyEventHandlerProxy);
	};

	Menu.prototype._addAllToPrivateAggregation = function (mSettings, sAggregationName) {
		if (mSettings[sAggregationName]) {
			mSettings[sAggregationName].forEach(function (oItem) {
				this.addAggregation(sAggregationName, oItem);
			}.bind(this));
			delete mSettings[sAggregationName];
		}
	};

	Menu.prototype._initPopover = function () {
		if (this._oPopover) {
			return;
		}

		this._oPopover = new ResponsivePopover({
			showArrow: false,
			showHeader: false,
			placement: library.PlacementType.Bottom,
			content: new AssociativeControl({control: this, height: true}),
			contentWidth: MENU_WIDTH,
			horizontalScrolling: false,
			verticalScrolling: false,
			afterClose: [this.close, this]
		});
		this.addDependent(this._oPopover);

		this._oPopover.addEventDelegate({
			"onAfterRendering": this._focusItem
		}, this);

		if (this.getItems().length === 0 && !this.getAggregation("_items")) {
			this._oPopover.attachAfterOpen(this._focusInitialQuickAction.bind(this));
		} else {
			// focus the first visible menu item
			this._oPopover.attachAfterOpen(function () {
				var oItem = this._oItemsContainer._getNavigationList().getItems().find(function (oItem) {
					return oItem.getVisible();
				});
				oItem && oItem.focus();
			}.bind(this));
		}
		this._oPopover._oControl.oPopup.setAutoClose(false);
	};

	Menu.prototype.onsapfocusleave = function(oEvent){
		if (!this._oPopover.isOpen()) {
			return;
		}
		this.handleOuterEvent(this.getId(), oEvent);
	};

	Menu.prototype.handleOuterEvent = function(oMenuId, oEvent) {
		var isInMenuHierarchy = false,
			touchEnabled = Device.support.touch || Device.system.combi;

		if (oEvent.type == "mousedown" || oEvent.type == "touchstart") {
			// Suppress the delayed mouse event from mobile browser
			if (touchEnabled && (oEvent.isMarked("delayedMouseEvent") || oEvent.isMarked("cancelAutoClose"))) {
				return;
			}

			if (!isInMenuHierarchy) {
				if (containsOrEquals(this.getDomRef(), oEvent.target)) {
					isInMenuHierarchy = true;
				}
			}
		} else if (oEvent.type == "sapfocusleave") {
			if (touchEnabled) {
				return;
			}

			if (oEvent.relatedControlId) {
				if (!isInMenuHierarchy) {
					if (containsOrEquals(this.getDomRef(), jQuery(document.getElementById(oEvent.relatedControlId)).get(0)) ||
						isInControlTree(this, Core.byId(oEvent.relatedControlId))) {
						isInMenuHierarchy = true;
					}
				}
			}
		}

		if (!isInMenuHierarchy) {
			this.close();
		}
	};

	function isInControlTree(oParent, oChild) {
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
				oRm.renderControl(sap.ui.getCore().byId(oControl.getControl()));
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
	};

	Menu.prototype._createItemsContainer = function () {
		var oMenu = this;

		this._oBtnCancel =  new Button({
			text: this._getResourceText("table.COLUMNMENU_CANCEL"),
			press: function () {
				var sKey = oMenu._oItemsContainer.getCurrentViewKey();
				if (oMenu._fireEvent(Core.byId(sKey), "cancel")) {
					oMenu.close();
				}
			}
		});
		this._oBtnOk = new Button({
			text: this._getResourceText("table.COLUMNMENU_CONFIRM"),
			type: library.ButtonType.Emphasized,
			press: function () {
				var sKey = oMenu._oItemsContainer.getCurrentViewKey();
				if (oMenu._fireEvent(Core.byId(sKey), "confirm")) {
					oMenu.close();
				}
			}
		});

		oMenu._oItemsContainer = new Container({
			listLayout: true,
			defaultView: DEFAULT_KEY,
			footer: new Toolbar({
				content: [
					new ToolbarSpacer(),
					this._oBtnOk,
					this._oBtnCancel
				]
			}),
			beforeViewSwitch: function (oEvent) {
				var mParameters = oEvent.getParameters();

				if (mParameters.target !== "$default") {
					var oContainerItem = oMenu._oItemsContainer.getView(mParameters.target);
					var oColumnMenuItem = oMenu._getItemFromContainerItem(oContainerItem);
					if (oColumnMenuItem && !oMenu._fireEvent(oColumnMenuItem, "press")) {
						oEvent.preventDefault();
					}
				}
			},
			afterViewSwitch: function (oEvent) {
				var mParameters = oEvent.getParameters();
				this.oLayout.setShowFooter(mParameters.target !== "$default");

				oMenu._previousView = mParameters.source;
				if (mParameters.target !== "$default") {
					var oContainerItem = oMenu._oItemsContainer.getView(mParameters.target);
					if (oContainerItem) {
						var oItem = oMenu._getItemFromContainerItem(oContainerItem);
						oMenu._updateButtonState(oItem);
						oMenu._focusItem();
					}
				} else {
					oMenu._focusItem();
					this._oPopover && this._oPopover.invalidate();
				}
			}
		});
		oMenu._oItemsContainer.getHeader().addContentRight(new Button({
			text: this._getResourceText("table.COLUMNMENU_RESET"),
			press: function () {
				oMenu._fireEvent(Core.byId(oMenu._oItemsContainer.getCurrentViewKey()), "reset", false);
			}
		}));
		this._oPopover.addDependent(oMenu._oItemsContainer);
		oMenu.addDependent(oMenu._oItemsContainer);
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

	Menu.prototype._getResourceText = function(sText, vValue) {
		this.oResourceBundle = this.oResourceBundle ? this.oResourceBundle : sap.ui.getCore().getLibraryResourceBundle("sap.m");
		return sText ? this.oResourceBundle.getText(sText, vValue) : this.oResourceBundle;
	};

	Menu.prototype._getAllEffectiveQuickActions = function() {
		var aQuickActions = (this.getAggregation("_quickActions") || []).concat(this.getQuickActions());
		return aQuickActions.reduce(function (a, oQuickAction) {
			return a.concat(oQuickAction.getEffectiveQuickActions());
		}, []).filter(function (oQuickAction) {
			return oQuickAction.getVisible();
		});
	};

	Menu.prototype._hasQuickActions = function() {
		return this._getAllEffectiveQuickActions().length > 0;
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
			var oItem = this._oItemsContainer._getNavigationList().getItems().find(function (oItem) {
				return oItem.getVisible() && oItem._key === this._previousView;
			}.bind(this));
			oItem && oItem.focus();
		}
	};

	Menu.prototype._focusInitialQuickAction = function () {
		// Does not work with content, which contains multiple items
		if (this.getItems().length === 0 && !this.getAggregation("_items")) {
			var aQuickActions = [];
			if (this.getAggregation("_quickActions")) {
				aQuickActions = this.getAggregation("_quickActions")[0].getEffectiveQuickActions();
			} else if (this.getQuickActions().length > 0) {
				aQuickActions = this.getQuickActions()[0].getEffectiveQuickActions();
			}
			aQuickActions.length > 0 && aQuickActions[0].getContent()[0].focus();
		}
	};

	Menu.prototype._setItemVisibility = function (oItem, bVisible) {
		var oList = this._oItemsContainer._getNavigationList().getItems();
		var oListItem = oList.find(function (oListItem) {
			return oListItem._key == oItem.getId();
		});
		oListItem && oListItem.setVisible(bVisible);
	};

	Menu.prototype._createQuickActionGrids = function () {
		var oFormContainer;
		if (this._oForm) {
			oFormContainer = this._oForm.getFormContainers()[0];
			oFormContainer.destroyFormElements();
		} else {
			oFormContainer = new FormContainer();
			this._oForm = new Form({
				layout: new ResponsiveGridLayout({
					labelSpanXL: 3,
					labelSpanL: 3,
					labelSpanM: 3,
					labelSpanS: 12,
					adjustLabelSpan: false
				}),
				editable: true,
				formContainers: oFormContainer
			});
		}

		var aEffectiveQuickActions = this._getAllEffectiveQuickActions();
		aEffectiveQuickActions.forEach(function (oEffectiveQuickAction) {
			if (!oEffectiveQuickAction.getVisible()) {
				return;
			}
			// Create label
			var oGridData = new GridData({span: "XL4 L4 M4 S12"});
			var oLabel = new Label({
				text: oEffectiveQuickAction.getLabel(),
				layoutData: oGridData,
				vAlign: sap.ui.core.VerticalAlign.Middle,
				wrapping: true
			}).setWidth("100%");
			oLabel.addStyleClass("sapMTCMenuQALabel");

			// Create content
			var aControls = [];
			var aContent = oEffectiveQuickAction.getContent();

			aContent.forEach(function (oItem) {
				if (oItem.getLayoutData()) {
					oGridData = oItem.getLayoutData().clone();
				} else {
					var iSpan = Math.floor(8 / aContent.length);
					var iSpanS = aContent.length > 2 ? 12 : Math.floor(12 / aContent.length);
					oGridData = new GridData({spanS: iSpanS, spanM: iSpan, spanL: iSpan, spanXL: iSpan});
				}
				var oControl = new AssociativeControl({control: oItem.setWidth("100%")});
				oControl.setLayoutData(oGridData);
				aControls.push(oControl);
			}, this);
			oFormContainer.addFormElement(new FormElement({label: oLabel, fields: aControls}));
		}, this);

		this.addDependent(this._oForm);
	};

	return Menu;
});