sap.ui.define([
	"sap/f/DynamicPage",
	"sap/f/DynamicPageHeader",
	"sap/f/DynamicPageTitle",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/Select",
	"sap/m/OverflowToolbar",
	"sap/m/Title",
	"sap/m/ToolbarSpacer",
	"sap/ui/core/Item",
	"sap/ui/layout/Grid",
	"sap/ui/layout/VerticalLayout"
], function (DynamicPage, DynamicPageHeader, DynamicPageTitle, Button, Label, Select, OverflowToolbar, Title, ToolbarSpacer, Item, Grid, VerticalLayout) {
	"use strict";

	return {
		getLabel: function (sText, sLabelFor) {
			return new Label({
				wrapping: true,
				text: sText,
				labelFor: sLabelFor
			});
		},
		getSelectItem: function (iNumber) {
			return new Item({
				text: "Content " + ++iNumber,
				key: iNumber
			});
		},
		getSelect: function (iCount) {
			var aSelectItems = [];

			for (var i = 0; i < iCount; i++) {
				aSelectItems.push(this.getSelectItem(i));
			}

			return new Select({
				autoAdjustWidth: true,
				items: aSelectItems
			});
		},
		getLabelWithSelect: function (sValue) {
			var oSelect = this.getSelect(10);
			return new VerticalLayout({
				content: [this.getLabel(sValue, oSelect), oSelect]
			});
		},
		getLabelWithSelectCombo: function (iCount) {
			var aLabelCombos = [];

			for (var i = 0; i < iCount; i++) {
				aLabelCombos.push(this.getLabelWithSelect("Something Something" + i));
			}

			return aLabelCombos;
		},
		getHeader: function () {
			return new DynamicPageHeader({
				pinnable: true,
				content: [
					new Grid({
						content: this.getLabelWithSelectCombo(6),
						defaultSpan: "XL2 L3 M4 S6"
					})
				]
			});
		},
		getTitle: function(oToggleFooterButton) {
			return new DynamicPageTitle({
				heading: [new Title({text: "Some title", level: "H1", titleStyle: "H2", wrapping: true})],
				snappedContent: [this.getLabel("Filtered 1042 items based on 'unknown' criteria")],
				actions: [
					new ToolbarSpacer(),
					oToggleFooterButton,
					new Button({
						icon: "sap-icon://add",
						tooltip: "add"
					}),
					new Button({
						icon: "sap-icon://edit",
						tooltip: "edit"
					}),
					new Button({
						icon: "sap-icon://delete",
						tooltip: "delete"
					})
				]
			});
		},
		getFooter: function() {
			return new OverflowToolbar({
				content: [
					new ToolbarSpacer(),
					new Button({
						text: "Accept",
						type: "Accept"
					}),
					new Button({
						text: "Reject",
						type: "Reject"
					})
				]
			});
		},
		getDynamicPage: function(bPreserveHeader, oTitle, oHeader, oContent, oFooter) {
			return new DynamicPage({
				preserveHeaderStateOnScroll: bPreserveHeader,
				title: oTitle,
				header: oHeader,
				content: oContent,
				footer: oFooter
			});
		},
		getDynamicPageWithStickyHeader: function(bPreserveHeader, oTitle, oHeader, oContent, oFooter, oStickyHeaderProvider) {
			return new DynamicPage({
				preserveHeaderStateOnScroll: bPreserveHeader,
				stickySubheaderProvider: oStickyHeaderProvider.getId(),
				title: oTitle,
				header: oHeader,
				content: oContent,
				footer: oFooter
			});
		}
	};
});