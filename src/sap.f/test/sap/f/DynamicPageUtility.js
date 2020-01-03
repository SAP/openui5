(function () {
	"use strict";

	// Should be global
	window.oDynamicPageUtil = {
		getLabel: function (sText, sLabelFor) {
			return new sap.m.Label({
				text: sText,
				labelFor: sLabelFor
			});
		},
		getSelectItem: function (iNumber) {
			return new sap.ui.core.Item({
				text: "Content " + ++iNumber,
				key: iNumber
			});
		},
		getSelect: function (iCount) {
			var aSelectItems = [];

			for (var i = 0; i < iCount; i++) {
				aSelectItems.push(this.getSelectItem(i));
			}

			return new sap.m.Select({
				autoAdjustWidth: true,
				items: aSelectItems
			});
		},
		getLabelWithSelect: function (sValue) {
			var oSelect = this.getSelect(10);
			return new sap.ui.layout.VerticalLayout({
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
			return new sap.f.DynamicPageHeader({
				pinnable: true,
				content: [
					new sap.ui.layout.Grid({
						content: this.getLabelWithSelectCombo(6),
						defaultSpan: "XL2 L3 M4 S6"
					})
				]
			});
		},
		getTitle: function(oToggleFooterButton) {
			return new sap.f.DynamicPageTitle({
				heading: [new sap.m.Title({text: "Some title", level: "H1", titleStyle: "H2"})],
				snappedContent: [this.getLabel("Filtered 1042 items based on 'unknown' criteria")],
				actions: [
					new sap.m.ToolbarSpacer(),
					oToggleFooterButton,
					new sap.m.Button({
						icon: "sap-icon://add",
						tooltip: "add"
					}),
					new sap.m.Button({
						icon: "sap-icon://edit",
						tooltip: "edit"
					}),
					new sap.m.Button({
						icon: "sap-icon://delete",
						tooltip: "delete"
					})
				]
			});
		},
		getFooter: function() {
			return new sap.m.OverflowToolbar({
				content: [
					new sap.m.ToolbarSpacer(),
					new sap.m.Button({
						text: "Accept",
						type: "Accept"
					}),
					new sap.m.Button({
						text: "Reject",
						type: "Reject"
					})
				]
			});
		},
		getDynamicPage: function(bPreserveHeader, oTitle, oHeader, oContent, oFooter) {
			return new sap.f.DynamicPage({
				preserveHeaderStateOnScroll: bPreserveHeader,
				title: oTitle,
				header: oHeader,
				content: oContent,
				footer: oFooter
			});
		},
		getDynamicPageWithStickyHeader: function(bPreserveHeader, oTitle, oHeader, oContent, oFooter, oStickyHeaderProvider) {
			return new sap.f.DynamicPage({
				preserveHeaderStateOnScroll: bPreserveHeader,
				stickySubheaderProvider: oStickyHeaderProvider.getId(),
				title: oTitle,
				header: oHeader,
				content: oContent,
				footer: oFooter
			});
		}
	};
}());