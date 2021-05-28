/*
 * ! ${copyright}
 */
sap.ui.define([
    "sap/ui/mdc/ui/Container",
    "sap/m/Bar",
    "sap/m/Button",
    "sap/m/List",
    "sap/m/IconTabBar",
    "sap/m/IconTabFilter",
    "sap/ui/mdc/ui/ContainerItem",
    "sap/ui/Device",
    "sap/m/library",
    "sap/m/StandardListItem"
], function (Container, Bar, Button, List, IconTabBar, IconTabFilter, ContainerItem, Device, mLibrary, StandardListItem) {
    "use strict";

    // shortcut for sap.m.ButtonType
	var ButtonType = mLibrary.ButtonType;

    // shortcut for sap.m.ListType
	var ListItemType = mLibrary.ListType;

    /**
     * Constructor for a new Wrapper. The Wrapper can be used
     * to dynamically add personalization content to a switchable
     * layout container, by allowing to switch the content using
     * an <code>IconTabBar</code> or a <code>List</code> control,
     * depending on the desired layout mode.
     *
     * @class
     * @extends sap.ui.mdc.ui.Container
     *
     * @author SAP SE
     * @version ${version}
     *
     * @private
     * @ui5-restricted sap.ui.mdc
     * @experimental
     * @since 1.90
     * @alias sap.ui.mdc.p13n.panels.Wrapper
     */
    var Wrapper = Container.extend("sap.ui.mdc.p13n.panels.Wrapper", {
        metadata: {
            library: "sap.ui.mdc",
            properties: {
                listLayout: {
                    type: "Boolean",
                    defaultValue: false
                }
            }
        },
        renderer: {}
    });

    Wrapper.prototype.DEFAULT_KEY = "$default";

    Wrapper.prototype.init = function () {
        Container.prototype.init.apply(this, arguments);
        this.addStyleClass("sapUiMDCP13nWrapper");
        this.setListLayout(Device.system.phone);
    };

    Wrapper.prototype.setListLayout = function (bListLayout) {
        this.setProperty("listLayout", bListLayout);

        //clear existing navigation items
        this._getTabBar().removeAllItems();
        this._getNavigationList().removeAllItems();
        var oHeaderContent = [];

        //update navigator control
        if (bListLayout) {
            this._getTabBar().setVisible(false);
            this._getNavigationList();
            this.switchView(this.DEFAULT_KEY);
            oHeaderContent.push(this._getNavBackBtn());
        } else {
            this._getTabBar().setVisible(true);
            var aViews = this.getViews();
            if (aViews.length > 1) {
                //0 is $default, use index 1 as the first "custom" added view
                this.switchView(aViews[1].getKey());
            }
            oHeaderContent.push(this._getTabBar());
        }

        var oBar = new Bar({
            contentLeft: oHeaderContent
        });
        this.setHeader(oBar);

        //recreate the navigation items
        this.getViewMap().forEach(function (mView) {
            this._addToNavigator(mView.key);
        }.bind(this));

        return this;
    };

    Wrapper.prototype._getTabBar = function () {
        if (!this._oTabBar) {
            this._oTabBar = new IconTabBar({
                expandable: false,
                expanded: true,
                select: function (oEvt) {
                    this.switchView(oEvt.getParameter("key"));
                }.bind(this)
            });
            this.addDependent(this._oTabBar);
        }
        return this._oTabBar;
    };

    Wrapper.prototype._getNavigationList = function () {
        if (!this._oNavigationList) {
            this._oNavigationList = new List({
                itemPress: function (oEvt) {
                    var oItem = oEvt.getParameter("listItem");
                    var sKey = oItem.getTitle();
                    this.switchView(sKey);
                }.bind(this)
            }).addStyleClass("wrapperDefaultList");
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

    Wrapper.prototype._getNavBackBtn = function () {
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

    Wrapper.prototype.addPanel = function (oPanel, sKey, sTab) {
        var oContainerItem = new ContainerItem({
            key: sKey,
            content: oPanel
        });

        this._addToNavigator(sKey, sTab);

        this.addView(oContainerItem);
    };

    Wrapper.prototype.switchView = function (sKey) {
        Container.prototype.switchView.apply(this, arguments);
        this.oLayout.setShowHeader(sKey !== this.DEFAULT_KEY); //Don't show header in dafault view (avoid empty space),
        this._getTabBar().setSelectedKey(sKey);
        this._getNavBackBtn().setVisible(sKey !== this.DEFAULT_KEY);
        this._getNavBackBtn().setText(sKey);
    };

    Wrapper.prototype._addToNavigator = function (sKey, sText) {

        if (sKey == this.DEFAULT_KEY) {
            return;
        }

        if (this.getListLayout()) {
            this.getView(this.DEFAULT_KEY);
            this._getNavigationList().addItem(new StandardListItem({
                type: ListItemType.Navigation,
                title: sText
            }));
        } else {
            this._getTabBar().addItem(new IconTabFilter({
                key: sKey,
                text: sText || sKey
            }));
        }
    };

    Wrapper.prototype.exit = function () {
        Container.prototype.exit.apply(this, arguments);
        this._oTabBar = null;
        this._oNavigationList = null;
        this._oNavBackBtn = null;
    };

    return Wrapper;

});