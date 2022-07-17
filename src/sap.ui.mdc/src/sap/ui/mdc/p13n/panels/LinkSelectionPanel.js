/*!
 * ${copyright}
 */

sap.ui.define([
    "sap/m/p13n/SelectionPanel",
    "sap/m/ColumnListItem",
    "sap/m/HBox",
    "sap/m/VBox",
    "sap/m/Link",
    "sap/m/Text",
    "sap/ui/core/Icon",
    "sap/m/library",
    "sap/m/OverflowToolbar",
    "sap/ui/model/Filter",
    "sap/ui/core/CustomData"
], function (SelectionPanel, ColumnListItem, HBox, VBox, Link, Text, Icon, mLibrary, OverflowToolbar, Filter, CustomData) {
    "use strict";

    // shortcut for sap.m.ListType
    var ListType = mLibrary.ListType;

    var LinkSelectionPanel = SelectionPanel.extend("sap.ui.mdc.p13n.panels.LinkSelectionPanel", {
        metadata: {
			library: "sap.ui.mdc",
            /**
             * This event is fired when a Link on the SelectionPanel is pressed.
             */
            events: {
                linkPressed: {}
            }
        },
		renderer: {
			apiVersion: 2
		}
    });

    LinkSelectionPanel.prototype._getListTemplate = function() {
		return new ColumnListItem({
			selected: "{" + this.P13N_MODEL + ">" + this.PRESENCE_ATTRIBUTE + "}",
			type: ListType.Active,
			cells: [
                new HBox({
                    items: [
                        new VBox({
                            items: [
                                new Link({
                                    tooltip: "{" + this.P13N_MODEL + ">tooltip}",
                                    text: "{" + this.P13N_MODEL + ">text}",
                                    href: "{" + this.P13N_MODEL + ">href}",
                                    target: "{" + this.P13N_MODEL + ">target}",
                                    press: this._onLinkPressed.bind(this),
                                    customData: new CustomData({
                                        key: "internalHref",
                                        value: "{" + this.P13N_MODEL + ">internalHref}"
                                    })
                                }),
                                new Text({
                                    text: "{" + this.P13N_MODEL + ">description}",
                                    visible: "{= ${" + this.P13N_MODEL + ">description} ? true:false}"
                                })
                            ]
                        })
                    ]
                })
			]
		});
	};

    LinkSelectionPanel.prototype.setShowHeader = function(bShowHeader) {
		if (bShowHeader){
			this._oListControl.setHeaderToolbar(new OverflowToolbar({
				content: [
					this._getSearchField()
				]
			}));
		}
		this.setProperty("showHeader", bShowHeader);
		return this;
	};

    LinkSelectionPanel.prototype._getSearchField = function() {
		var oSearchField = SelectionPanel.prototype._getSearchField.apply(this, arguments);

		oSearchField.getLayoutData().setMaxWidth(undefined);

		return oSearchField;
	};

    LinkSelectionPanel.prototype._onLinkPressed = function(oEvent) {
        if (oEvent.getSource().getTarget() !== "_blank") {
            oEvent.preventDefault();
            this.fireLinkPressed(oEvent);
        }
    };

    LinkSelectionPanel.prototype.setMultiSelectMode = function(sMultiSelectMode) {
        this._oListControl.setMultiSelectMode(sMultiSelectMode);
    };

    LinkSelectionPanel.prototype._filterList = function(bShowSelected, sSarch) {
		var oSearchFilter = [], oSelectedFilter = [];
		if (bShowSelected) {
			oSelectedFilter = new Filter(this.PRESENCE_ATTRIBUTE, "EQ", true);
		}
		if (sSarch) {
			oSearchFilter = new Filter("text", "Contains", sSarch);
		}
		this._oListControl.getBinding("items").filter(new Filter([].concat(oSelectedFilter, oSearchFilter), true));
	};

    return LinkSelectionPanel;

});