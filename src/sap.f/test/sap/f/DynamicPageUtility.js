(function () {
	"use strict";

	function getLabel(sText, sLabelFor) {
		if (sLabelFor) {
			return new sap.m.Label({
				text: sText,
				labelFor: sLabelFor
			});
		} else {
			return new sap.m.Label({
				text: sText
			});
		}
	}

	function getSelectItem(iNumber) {
		return new sap.ui.core.Item({
			text: "Content " + ++iNumber,
			key: iNumber
		});
	}

	function getSelect(iCount) {
		var aSelectItems = [];

		for (var i = 0; i < iCount; i++) {
			aSelectItems.push(getSelectItem(i));
		}

		return new sap.m.Select({
			autoAdjustWidth: true,
			items: aSelectItems
		});
	}

	function getLabelWithSelect(sValue) {
		var oSelect = getSelect(10);
		return new sap.ui.layout.VerticalLayout({
			content: [getLabel(sValue, oSelect), oSelect]
		});
	}

	function getLabelWithSelectCombo (iCount) {
		var aLabelCombos = [];

		for (var i = 0; i < iCount; i++) {
			aLabelCombos.push(getLabelWithSelect("Something Something" + i));
		}

		return aLabelCombos;
	}

	window.getHeader = function () {
		return new sap.f.DynamicPageHeader({
			pinnable: true,
			content: [
				new sap.ui.layout.Grid({
					content: getLabelWithSelectCombo(6),
					defaultSpan: "XL2 L3 M4 S6"
				})
			]
		});
	};

	window.getTitle = function(oToggleFooterButton) {
		return new sap.f.DynamicPageTitle({
			heading: [new sap.m.Title({text: "Some title"})],
			snappedContent: [getLabel("Filtered 1042 items based on 'unknown' criteria")],
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
	};

	window.getFooter = function() {
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
	};

	window.getDynamicPage = function(bPreserveHeader, oTitle, oHeader, oContent, oFooter) {
		return new sap.f.DynamicPage({
			preserveHeaderStateOnScroll: bPreserveHeader,
			title: oTitle,
			header: oHeader,
			content: oContent,
			footer: oFooter
		});
	};
}());