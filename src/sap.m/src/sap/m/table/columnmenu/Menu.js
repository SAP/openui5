/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/ResponsivePopover",
	"sap/m/Button",
	"sap/m/OverflowToolbar",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/Title",
	"sap/m/List",
	"sap/m/InputListItem",
	"sap/m/CustomListItem",
	"sap/m/Label",
	"sap/m/IllustratedMessage",
	"sap/m/IllustratedMessageType",
	"sap/m/IllustratedMessageSize",
	"sap/m/library",
	"sap/ui/Device",
	"sap/ui/core/Control",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/core/StaticArea",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/FormElement",
	"sap/ui/layout/form/ResponsiveGridLayout",
	"sap/ui/layout/GridData",
	"sap/ui/thirdparty/jquery",
	"sap/ui/dom/containsOrEquals",
	"sap/ui/events/ControlEvents",
	"sap/base/strings/capitalize",
	"sap/m/p13n/AbstractContainerItem",
	"sap/m/p13n/Container",
	"sap/m/table/columnmenu/MenuBase",
	"sap/m/table/columnmenu/MenuRenderer"
], function (
	ResponsivePopover,
	Button,
	OverflowToolbar,
	Toolbar,
	ToolbarSpacer,
	Title,
	List,
	InputListItem,
	CustomListItem,
	Label,
	IllustratedMessage,
	IllustratedMessageType,
	IllustratedMessageSize,
	library,
	Device,
	Control,
	Element,
	Library,
	coreLibrary,
	StaticArea,
	Form,
	FormContainer,
	FormElement,
	ResponsiveGridLayout,
	GridData,
	jQuery,
	containsOrEquals,
	ControlEvents,
	capitalize,
	AbstractContainerItem,
	Container,
	MenuBase,
	MenuRenderer
) {
	"use strict";

	var HasPopup = coreLibrary.aria.HasPopup;
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
	 * @extends sap.m.table.columnmenu.MenuBase
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @since 1.110
	 *
	 * @alias sap.m.table.columnmenu.Menu
	 */
	var Menu = MenuBase.extend("sap.m.table.columnmenu.Menu", {

		metadata: {
			library: "sap.m",
			defaultAggregation: "quickActions",
			properties: {
				/**
				 * Specifies whether the table settings button is visible.
				 */
				showTableSettingsButton: { type: "boolean", defaultValue: false }
			},
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
				 * Fires when the table settings button is pressed.
				 */
				tableSettingsPressed: {}
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

		const fnOpen = () => {
			this._initPopover();

			if (this._oQuickSortList) {
				this._oQuickSortList.destroy();
				this._oQuickSortList = null;
			}
			this._oQuickSortList = this._initQuickActionList(Category.Sort);

			if (this._oQuickFilterList) {
				this._oQuickFilterList.destroy();
				this._oQuickFilterList = null;
			}
			this._oQuickFilterList = this._initQuickActionList(Category.Filter);

			if (this._oQuickGroupList) {
				this._oQuickGroupList.destroy();
				this._oQuickGroupList = null;
			}
			this._oQuickGroupList = this._initQuickActionList(Category.Group);

			if (this._oQuickAggregateList) {
				this._oQuickAggregateList.destroy();
				this._oQuickAggregateList = null;
			}
			this._oQuickAggregateList = this._initQuickActionList(Category.Aggregate);

			if (this._oQuickGenericList) {
				this._oQuickGenericList.destroy();
				this._oQuickGenericList = null;
			}
			this._oQuickGenericList = this._initQuickActionList(Category.Generic);

			if (this._oItemsContainer) {
				this._oItemsContainer.destroy();
				this._oItemsContainer = null;
			}
			this._initItemsContainer();

			if (!this.getParent()) {
				StaticArea.getUIArea().addContent(this, true);
			}

			if (this._getAllEffectiveQuickActions().length === 0 && this._getAllEffectiveItems().length === 0) {
				this._initIllustratedMessage();
			}

			this._oPopover.setInitialFocus(this._oQuickSortList || this._oQuickFilterList || this._oQuickGroupList || this._oQuickAggregateList || this._oQuickGenericList || this._oItemsContainer);
			this._oPopover.openBy(oAnchor);
			this._oIsOpenBy = oAnchor;
			ControlEvents.bindAnyEvent(this.fAnyEventHandlerProxy);
		};

		if (this.isOpen()) {
			// If the menu is already opened, close it before rerendering content and opening it at another position
			// Otherwise, there is a short time frame, where users can see the popover "flicker"
			this._oPopover.attachEventOnce("afterClose", fnOpen);
			this.close();
		} else {
			fnOpen();
		}
	};

	Menu.prototype.setShowTableSettingsButton = function(bShowTableSettingsButton) {
		this.setProperty("showTableSettingsButton", bShowTableSettingsButton, true);
		if (!this._oPopover) {
			return this;
		}

		if (this._oPopover.getEndButton() && !bShowTableSettingsButton) {
			this._oPopover.getEndButton().destroy();
			this._oPopover.setEndButton(null);
		} else {
			this._oPopover.setEndButton(createTableSettingsButton(this));
		}

		return this;
	};

	function createTableSettingsButton(oMenu) {
		return new Button({
			icon: "sap-icon://action-settings",
			tooltip: oMenu._getResourceText("table.COLUMNMENU_TABLE_SETTINGS"),
			press: () => {
				oMenu._oPopover.close();
				oMenu.fireTableSettingsPressed();
			}
		});
	}

	/**
	 * @inheritdoc
	 */
	Menu.prototype.getAriaHasPopupType = function () {
		return ARIA_POPUP_TYPE;
	};

	/**
	 * @inheritdoc
	 */
	Menu.prototype.isOpen = function () {
		return this._oPopover ? this._oPopover.isOpen() : false;
	};

	/**
	 * @inheritdoc
	 */
	Menu.prototype.close = function () {
		this._previousView = null;
		if (this._oPopover && this._oPopover.isOpen()) {
			if (this._oQuickSortList) {
				this._oQuickSortList.destroy();
				this._oQuickSortList = null;
			}

			if (this._oQuickFilterList) {
				this._oQuickFilterList.destroy();
				this._oQuickFilterList = null;
			}

			if (this._oQuickGroupList) {
				this._oQuickGroupList.destroy();
				this._oQuickGroupList = null;
			}

			if (this._oQuickAggregateList) {
				this._oQuickAggregateList.destroy();
				this._oQuickAggregateList = null;
			}

			if (this._oQuickGenericList) {
				this._oQuickGenericList.destroy();
				this._oQuickGenericList = null;
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
		MenuBase.prototype.exit.apply(this, arguments);
		if (this._oPopover) {
			delete this._oPopover;
		}
		if (this._oQuickSortList) {
			delete this._oQuickSortList;
		}
		if (this._oQuickFilterList) {
			delete this._oQuickFilterList;
		}
		if (this._oQuickGroupList) {
			delete this._oQuickGroupList;
		}
		if (this._oQuickAggregateList) {
			delete this._oQuickAggregateList;
		}
		if (this._oQuickGenericList) {
			delete this._oQuickGenericList;
		}
		if (this._oItemsContainer) {
			delete this._oItemsContainer;
		}
		if (this._oIsOpenBy) {
			delete this._oIsOpenBy;
		}
		if (this._oIllustratedMessage) {
			this._oIllustratedMessage.destroy();
			delete this._oIllustratedMessage;
		}
		ControlEvents.unbindAnyEvent(this.fAnyEventHandlerProxy);
	};

	Menu.prototype._initPopover = function () {
		if (this._oPopover) {
			return;
		}

		this._oPopover = new ResponsivePopover({
			showArrow: false,
			showHeader: Device.system.phone,
			placement: library.PlacementType.VerticalPreferredBottom,
			content: new AssociativeControl({control: this, height: true}),
			horizontalScrolling: false,
			verticalScrolling: true,
			afterClose: [this._onPopoverAfterClose, this],
			customHeader: new OverflowToolbar({
				content: [
					new Title({text: this._getResourceText("table.COLUMNMENU_TITLE")}),
					new ToolbarSpacer(),
					new Button({
						icon: "sap-icon://decline",
						tooltip: this._getResourceText("table.COLUMNMENU_CLOSE"),
						press: () => {
							this._oPopover.close();
						}
					})
				]
			}).addStyleClass("sapMTBHeader-CTX")
		});
		if (this.getShowTableSettingsButton()) {
			this._oPopover.setEndButton(createTableSettingsButton(this));
		}
		this.addDependent(this._oPopover);
		this._oPopover.addStyleClass("sapMTCMenuPopup");

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
		var bHasitems =  this._hasItems();

		if (bHasitems && !this._oItemsContainer) {
			this._createItemsContainer();
		}

		aMenuItems.forEach((oColumnMenuItem) => {
			this._addView(oColumnMenuItem);
		});
	};

	var AssociativeControl = Control.extend("sap.m.table.columnmenu.AssociativeControl", {
		metadata: {
			library: "sap.m",
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
		},
		addAriaLabelledBy: function(vAriaLabelledBy) {
			const oControl = Element.getElementById(this.getControl());
			oControl?.addAriaLabelledBy?.(vAriaLabelledBy);
			return this;
		},
		getAriaLabelledBy: function() {
			const oControl = Element.getElementById(this.getControl());
			return oControl?.getAriaLabelledBy?.() || [];
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
			icon: oMenuItem.getIcon(),
			type: oMenuItem.isA("sap.m.table.columnmenu.ActionItem") ? library.ListType.Active : library.ListType.Navigation
		});

		this._oItemsContainer.addView(oItem);
		this._setItemVisibility(oMenuItem, oMenuItem.getVisible());
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

		const sTitle = this._hasQuickActions() ?
					this._getResourceText("table.COLUMNMENU_LIST_ITEMS_TITLE") :
					this._getResourceText("table.COLUMNMENU_LIST_ITEMS_ONLY_TITLE");

		this._oItemsContainer.setListHeader(new OverflowToolbar({
			content: [
				new Title({text: sTitle})
			]
		}));
		this._oItemsContainer.getHeader().addContentRight(new Button({
			text: this._getResourceText("table.COLUMNMENU_RESET"),
			press: [function () {
				this._fireEvent(Element.getElementById(this._oItemsContainer.getCurrentViewKey()), "reset", false);
			}, this]
		}));

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

	function _hasNonGenericQuickActions() {
		return this._getAllEffectiveQuickActions(true).filter(function(oQuickAction) {
			return oQuickAction.getVisible() && oQuickAction.getCategory() !== Category.Generic;
		}).length > 0;
	}

	Menu.prototype._initQuickActionList = function (sCategory) {
		var oList;
		var aQuickActions = this._getAllEffectiveQuickActions().filter(function (oQuickAction) {
			return oQuickAction.getVisible() && oQuickAction.getCategory() === sCategory;
		});

		const sTitle = (sCategory === Category.Generic && !_hasNonGenericQuickActions.call(this)) ?
					this._getResourceText("table.COLUMNMENU_QUICK_GENERIC_ONLY_TITLE") :
					this._getResourceText("table.COLUMNMENU_QUICK_" + sCategory.toUpperCase() + "_TITLE");

		if (aQuickActions.length) {
			oList = new List({
				headerToolbar: new OverflowToolbar({
					content: [new Title({text: sTitle})]
				}),
				keyboardMode: "Edit",
				items: []
			});

			aQuickActions.map(function (oQuickAction) {
				if (oQuickAction.getContent()?.length === 1 && oQuickAction.getContent()[0].isA("sap.ui.core.IFormContent")) {
					oList.addItem(new InputListItem({
						contentSize: oQuickAction.getContentSize(),
						label: oQuickAction.getLabel(),
						content: createAssociativeControlWrapper([].concat(oQuickAction.getContent()))
					}));
				} else {
					oList.addItem(new CustomListItem({
						content: createAssociativeControlForm(oQuickAction)
					}));
				}
			});
		}
		this.addDependent(oList);
		return oList;
	};

	function createAssociativeControlForm(oQuickAction) {
		var oLabel = new Label({
			text: oQuickAction.getLabel(),
			layoutData: new GridData({span: "XL4 L4 M4 S12"}),
			wrapping: true,
			width: "100%"
		});

		// Create content
		var aContent = oQuickAction.getContent() || [];
		var oFormContainer = new FormContainer();
		var oForm = new Form({
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
			formContainers: [oFormContainer]
		});

		var aControls = [];
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
		return oForm;
	}

	function createAssociativeControlWrapper(aContent) {
		var aControls = [];

		aContent.forEach(function(oItem) {
			var oControl = new AssociativeControl({control: oItem});
			aControls.push(oControl);
		});
		return aControls;
	}

	Menu.prototype._initIllustratedMessage = function () {
		if (this._oIllustratedMessage) {
			return;
		}

		this._oIllustratedMessage = new IllustratedMessage({
			title: this._getResourceText("table.COLUMNMENU_EMPTY"),
			illustrationType: IllustratedMessageType.NoColumnsSet,
			illustrationSize: IllustratedMessageSize.Dot,
			enableDefaultTitleAndDescription: false
		});

		this.addDependent(this._oIllustratedMessage);
	};

	return Menu;
});