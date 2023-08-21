/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/p13n/AbstractContainer",
	"sap/m/Bar",
	"sap/m/Button",
	"sap/m/Title",
	"sap/m/List",
	"sap/m/IconTabBar",
	"sap/m/IconTabFilter",
	"sap/m/p13n/AbstractContainerItem",
	"sap/ui/Device",
	"sap/m/library",
	"sap/m/StandardListItem",
	"sap/ui/core/library"
], function (AbstractContainer, Bar, Button, Title, List, IconTabBar, IconTabFilter, ContainerItem, Device, mLibrary, StandardListItem, coreLibrary) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mLibrary.ButtonType;

	// shortcut for sap.m.ListType
	var ListItemType = mLibrary.ListType;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	/**
	 * Constructor for a new <code>Container</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Constructor for a new <code>Container</code>. The <code>Container</code> class can be used to dynamically add personalization content to a switchable
	 * layout container. The <code>Container</code> class provides an option for switching content by using an <code>IconTabBar</code> or a <code>List</code> control
	 * respectively, depending on the desired layout mode. See also {@link sap.m.p13n.AbstractContainer}.
	 *
	 * @extends sap.m.p13n.AbstractContainer
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @ui5-restricted
	 * @experimental Since 1.96.
	 * @since 1.96
	 * @alias sap.m.p13n.Container
	 */
	var Container = AbstractContainer.extend("sap.m.p13n.Container", {
		metadata: {
			library: "sap.m",
			properties: {
				listLayout: {
					type: "boolean",
					defaultValue: false
				}
			}
		},
		renderer: {
		  apiVersion: 2
		}
	});

	Container.prototype.DEFAULT_KEY = "$default";

	Container.prototype.init = function () {
		AbstractContainer.prototype.init.apply(this, arguments);
		this.addStyleClass("sapMP13nContainer");
		this.setListLayout(Device.system.phone);
	};

	/**
	 * Determines whether a <code>List</code> control or code>IconTabBar</code> is used as the inner layout to display the different views.
	 *
	 * @param {boolean} bListLayout Defines which layout mode is used
	 * @returns {sap.m.p13n.Container} The <code>Container</code> instance
	 */
	Container.prototype.setListLayout = function (bListLayout) {
		this.setProperty("listLayout", bListLayout);

		//clear existing navigation items
		this._getTabBar().removeAllItems();
		this._getNavigationList().removeAllItems();
		var oBackButton;
		var oHeaderText;
		var oHeaderContent;

		//update navigator control
		if (bListLayout) {
			this._getTabBar().setVisible(false);
			this._getNavigationList();
			this.switchView(this.DEFAULT_KEY);
			oBackButton = this._getNavBackBtn();
			oHeaderText = this._getHeaderText();
		} else {
			this._getTabBar().setVisible(true);
			var aViews = this.getViews();
			if (aViews.length > 1) {
				//0 is $default, use index 1 as the first "custom" added view
				this.switchView(aViews[1].getKey());
			}
			oHeaderContent = this._getTabBar();
		}

		var oHeader = this.getHeader();
		if (!oHeader) {
			var oBar = new Bar({
				contentLeft: oHeaderContent ? oHeaderContent : [oBackButton, oHeaderText]
			});
			this.setHeader(oBar);
		} else {
			oHeader.removeAllContentLeft();
			if (oHeaderContent) {
				oHeader.addContentLeft(oHeaderContent);
			} else {
				oHeader.addContentLeft(oBackButton);
				oHeader.addContentLeft(oHeaderText);
			}
		}

		//recreate the navigation items
		this.getViews().forEach(function (oView) {
			this._addToNavigator(oView);
		}.bind(this));

		return this;
	};

	/**
	 * @override
	 */
	Container.prototype.switchView = function (sKey) {
		AbstractContainer.prototype.switchView.apply(this, arguments);
		if (this._bPrevented) {
			return;
		}
		this.getLayout().setShowHeader(sKey !== this.DEFAULT_KEY); //Don't show header in default view
		this.getLayout().setShowFooter(sKey !== this.DEFAULT_KEY); //Don't show footer in default view
		this._getTabBar().setSelectedKey(sKey);
		this._getNavBackBtn().setVisible(sKey !== this.DEFAULT_KEY);
		this._getHeaderText().setText((this.getView(sKey) && this.getView(sKey).getText()) || sKey);
		this._getHeaderText().setVisible(this._getNavBackBtn().getVisible());
	};

	/**
	 * @override
	 */
	Container.prototype.addView = function (vContainerItem) {
		this._addToNavigator(typeof vContainerItem == "string" ? this.getView(vContainerItem) : vContainerItem);
		AbstractContainer.prototype.addView.apply(this, arguments);
		return this;
	};

	/**
	* @override
	*/
	Container.prototype.removeView = function (vContainerItem) {
		this._removeFromNavigator(typeof vContainerItem == "string" ? this.getView(vContainerItem) : vContainerItem);
		AbstractContainer.prototype.removeView.apply(this, arguments);
		return this;
	};

	/*
	 * This method can be used to add a separator line to the last added item.
	 * This will only take effect in the "list" mode.
	 *
	 * @returns {sap.m.p13n.Container} The Container instance
	 */
	Container.prototype.addSeparator = function () {
		if (!this.getProperty("listLayout")) {
			return;
		}

		var oItems = this._getNavigationList().getItems();
		var oLastItem = oItems[oItems.length - 1];
		oLastItem.addStyleClass("sapMMenuDivider");

		return this;
	};

	/**
	 * Returns the layout object.
	 *
	 * @returns {sap.m.Page} The layout object
	 * @ui5-restricted sap.m.table.columnmenu.Menu
	 */
	Container.prototype.getLayout = function () {
		return this.oLayout;
	};

	Container.prototype._getTabBar = function () {
		if (!this._oTabBar) {
			this._oTabBar = new IconTabBar({
				headerBackgroundDesign: "Transparent",
				applyContentPadding: false,
				select: function (oEvt) {
					this.switchView(oEvt.getParameter("key"));
				}.bind(this)
			});
			this.addDependent(this._oTabBar);
		}
		return this._oTabBar;
	};

	Container.prototype._getNavigationList = function () {
		if (!this._oNavigationList) {
			this._oNavigationList = new List({
				itemPress: function (oEvt) {
					var oItem = oEvt.getParameter("listItem");
					this.switchView(oItem._key);
				}.bind(this)
			}).addStyleClass("p13nContainerDefaultList");
			this.addDependent(this._oNavigationList);
		}
		if (!this.getView(this.DEFAULT_KEY)) {
			var oListContainer = new ContainerItem({
				key: this.DEFAULT_KEY,
				content: this._oNavigationList
			});
			this.addView(oListContainer);
		}

		return this._oNavigationList;
	};

	Container.prototype._getNavBackBtn = function () {
		if (!this._oNavBackBtn) {
			this._oNavBackBtn = new Button({
				type: ButtonType.Back,
				press: function (oEvt) {
					this.switchView(this.DEFAULT_KEY);
				}.bind(this)
			});
			this.addDependent(this._oNavBackBtn);
		}
		return this._oNavBackBtn;
	};

	Container.prototype._getHeaderText = function () {
		if (!this._oHeaderText) {
			this._oHeaderText = new Title({ level: Device.system.phone ? TitleLevel.H2 : TitleLevel.H1});
			this.addDependent(this._oHeaderText);
		}
		return this._oHeaderText;
	};

	Container.prototype._addToNavigator = function (oContainerItem) {

		var sKey = oContainerItem.getKey(), oContainerItemTextBindingInfo = oContainerItem.getBindingInfo("text"), vText = oContainerItem.getText(), sIcon = oContainerItem.getIcon();

		//In case the text of the Abstract container item is bound, the binding should be forwarded instead of the value
		if (oContainerItemTextBindingInfo && oContainerItemTextBindingInfo.parts) {
			vText = {
				parts: oContainerItemTextBindingInfo.parts
			};
		}

		if (sKey == this.DEFAULT_KEY) {
			return;
		}

		if (this.getListLayout()) {
			this.getView(this.DEFAULT_KEY);
			var oItem =  new StandardListItem({
				type: ListItemType.Navigation,
				icon: sIcon,
				title: vText
			});
			oItem._key = sKey;
			this._getNavigationList().addItem(oItem);
		} else {
			this._getTabBar().addItem(new IconTabFilter({
				key: sKey,
				text: vText || sKey
			}));
		}
	};

	Container.prototype._removeFromNavigator = function (oContainerItem) {

		var sKey = oContainerItem.getKey();

		if (sKey == this.DEFAULT_KEY) {
			return;
		}

		if (this.getListLayout()) {
			var oItem = this._getNavigationList().getItems().find(function(oListItem){
				return oListItem._key === sKey;
			});
			this._getNavigationList().removeItem(oItem);
		} else {
			var oTab = this._getTabBar().getItems().find(function(oTab){
				return oTab.getKey() === sKey;
			});
			this._getTabBar().removeItem(oTab);
		}
	};

	Container.prototype.exit = function () {
		AbstractContainer.prototype.exit.apply(this, arguments);
		if (this._oTabBar) {
			this._oTabBar.destroy();
			this._oTabBar = null;
		}
		if (this._oNavigationList) {
			this._oNavigationList.destroy();
			this._oNavigationList = null;
		}
		this._oNavBackBtn = null;
		this._oHeaderText = null;
	};

	return Container;

});