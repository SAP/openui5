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
], (SelectionPanel, ColumnListItem, HBox, VBox, Link, Text, Icon, mLibrary, OverflowToolbar, Filter, CustomData) => {
	"use strict";

	// shortcut for sap.m.ListType
	const { ListType } = mLibrary;

	// shortcut for sap.m.MultiSelectMode
	const { MultiSelectMode } = mLibrary;

	const LinkSelectionPanel = SelectionPanel.extend("sap.ui.mdc.p13n.panels.LinkSelectionPanel", {
		metadata: {
			properties: {
				/**
				 * Defines the multi-selection mode for the inner list control.
				 */
				multiSelectMode: {
					type: "sap.m.MultiSelectMode",
					defaultValue: MultiSelectMode.Default
				},
				/**
				 * This function is called when a Link on the SelectionPanel is pressed.
				 */
				linkPressed: {
					type: "object"
				}
			},
			library: "sap.ui.mdc"
		},
		renderer: {
			apiVersion: 2
		}
	});

	LinkSelectionPanel.prototype._getListTemplate = function() {
		const oLink = new Link({
			tooltip: "{" + this.P13N_MODEL + ">tooltip}",
			text: "{" + this.P13N_MODEL + ">text}",
			href: "{" + this.P13N_MODEL + ">href}",
			target: "{" + this.P13N_MODEL + ">target}",
			customData: new CustomData({
				key: "internalHref",
				value: "{" + this.P13N_MODEL + ">internalHref}"
			}),
			wrapping: true
		});
		const fnLinkPressed = this.getLinkPressed();
		if (fnLinkPressed) {
			oLink.attachPress(fnLinkPressed);
		}

		return new ColumnListItem({
			selected: "{" + this.P13N_MODEL + ">" + this.PRESENCE_ATTRIBUTE + "}",
			type: ListType.Active,
			cells: [
				new HBox({
					items: [
						new VBox({
							items: [
								oLink,
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
		if (bShowHeader) {
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
		const oSearchField = SelectionPanel.prototype._getSearchField.apply(this, arguments);

		oSearchField.getLayoutData().setMaxWidth(undefined);

		return oSearchField;
	};

	LinkSelectionPanel.prototype._filterList = function(bShowSelected, sSearch) {
		let oSearchFilter = [],
			oSelectedFilter = [];
		if (bShowSelected) {
			oSelectedFilter = new Filter(this.PRESENCE_ATTRIBUTE, "EQ", true);
		}
		if (sSearch) {
			oSearchFilter = new Filter("text", "Contains", sSearch);
		}
		this._oListControl.getBinding("items").filter(new Filter([].concat(oSelectedFilter, oSearchFilter), true));
	};

	return LinkSelectionPanel;

});