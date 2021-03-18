/*
 * ! ${copyright}
 */
sap.ui.define([
    "sap/ui/mdc/ui/Container",
    "sap/m/Bar",
    "sap/m/ToolbarSpacer",
    "sap/m/IconTabBar",
    "sap/m/IconTabFilter",
    "sap/ui/mdc/ui/ContainerItem"
], function(Container, Bar, ToolbarSpacer, IconTabBar, IconTabFilter, ContainerItem) {
    "use strict";

    /**
	 * Constructor for a new P13nWrapper. The P13nWrapper created a container
     * to display dynamic content to be switched using an IconTabBar.
	 *
	 * @class
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @experimental
	 * @since 1.90
	 * @alias sap.ui.mdc.p13n.Engine
	 */
	var P13nWrapper = Container.extend("sap.ui.mdc.p13n.panels.P13nWrapper", {
		metadata: {
            library: "sap.ui.mdc",
            properties: {}
        },
		renderer: {}
    });

    P13nWrapper.prototype.init = function() {
        Container.prototype.init.apply(this, arguments);
        this.addStyleClass("sapUiMDCP13nWrapper");
        var oTabBar = this._getTabBar();

        var oHeader = new Bar({
            contentLeft: [
                oTabBar
            ]
        });

        this.setHeader(oHeader);
    };

    P13nWrapper.prototype._getTabBar = function() {
        if (!this._oTabBar) {
            this._oTabBar = new IconTabBar({
                expandable: false,
                expanded: true,
                select: function(oEvt) {
                    this.switchView(oEvt.getParameter("key"));
                }.bind(this)
            });
        }
        return this._oTabBar;
    };

    //TBD: overwrite "addView" instead?..
    P13nWrapper.prototype.addPanel = function(oPanel, sKey) {
        var oContainerItem = new ContainerItem({
            key: sKey,
            content: oPanel
        });
        this._getTabBar().addItem(new IconTabFilter({
            key: sKey,
            text: sKey
        }));
        this.addView(oContainerItem);

        this._getTabBar().setSelectedKey(sKey);
        this.switchView(sKey);
    };

	return P13nWrapper;

});