/*
 * ! ${copyright}
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
    "sap/m/MessageBox"
], function (SelectionPanel, ColumnListItem, HBox, VBox, Link, Text, Icon, mLibrary, MessageBox) {
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
				new VBox({
					items: [
						new Link({
							tooltip: "{" + this.P13N_MODEL + ">tooltip}",
							text: "{" + this.P13N_MODEL + ">text}",
                            href: "{" + this.P13N_MODEL + ">href}",
                            target: "{" + this.P13N_MODEL + ">target}",
                            press: this._onLinkPressed.bind(this)
						}),
                        new Text({
                            text: "{" + this.P13N_MODEL + ">description}",
                            visible: "{= ${" + this.P13N_MODEL + ">description} ? true:false}"
                        })
					]
				})
			]
		});
	};

    LinkSelectionPanel.prototype._onLinkPressed = function(oEvent) {
        this.fireLinkPressed(oEvent);
    };

    LinkSelectionPanel.prototype.setMultiSelectMode = function(sMultiSelectMode) {
        this._oListControl.setMultiSelectMode(sMultiSelectMode);
    };

    return LinkSelectionPanel;

});