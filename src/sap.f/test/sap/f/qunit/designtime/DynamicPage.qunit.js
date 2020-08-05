sap.ui.define([
	"sap/ui/dt/enablement/elementDesigntimeTest",
	"sap/f/DynamicPage",
	"sap/f/DynamicPageTitle",
	"sap/f/DynamicPageHeader",
	"sap/m/Text",
	"sap/m/Title",
	"sap/m/OverflowToolbar",
	"sap/m/Button"
],
function (
	elementDesigntimeTest,
	DynamicPage,
	DynamicPageTitle,
	DynamicPageHeader,
	Text,
	Title,
	OverflowToolbar,
	Button
) {
	"use strict";

	return elementDesigntimeTest({
		type: "sap.f.DynamicPage",
		create: function () {
			return new DynamicPage({
				showFooter : true,
				title : new DynamicPageTitle({
					heading : new Title({text: "Title text"}),
					expandedContent : new Text({text: "Expanded subheading"}),
					snappedContent : new Text({text: "Collapsed subheading"}),
					actions : [
						new Button({text: "Action1"}),
						new Button({text: "Action2"})
					]
				}),
				header : new DynamicPageHeader({
						content : new Text({text: "Header content"})
				}),
				content : new Text({text: "Some sample content"}),
				footer : new OverflowToolbar({
					content : [
						new Button({text: "Footer Button"})
					]
				})
			});
		}
	});
});