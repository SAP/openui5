sap.ui.define([
	"sap/ui/layout/Splitter",
	"sap/ui/layout/SplitterLayoutData",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/core/date/UI5Date",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Button",
	"sap/m/CheckBox",
	"sap/m/Input",
	"sap/m/Text",
	"sap/m/VBox",
	"sap/m/FlexItemData",
	"sap/ui/core/library"
], function (
	Splitter,
	SplitterLayoutData,
	HorizontalLayout,
	VerticalLayout,
	UI5Date,
	App,
	Page,
	Button,
	CheckBox,
	Input,
	Text,
	VBox,
	FlexItemData,
	coreLibrary
) {
	"use strict";

	var Orientation = coreLibrary.Orientation;

	function createExampleContent() {
		if (createExampleContent.called === undefined) {
			createExampleContent.called = 0;
		}
		++createExampleContent.called;

		var oLd = new SplitterLayoutData({
			resizable: true,
			size: Math.random() > 0.5 ? "auto" : 50 + Math.floor(Math.random() * 300) + "px",
			minSize: Math.random() > 0.5 ? 0 : Math.floor(Math.random() * 100)
		});

		switch (createExampleContent.called) {
			case 1:
				oLd.setSize("200px");
				break;
			case 2:
				oLd.setSize("auto");
				break;
			case 3:
				oLd.setSize("35%");
				break;
		}

		return new Text({
			text: "Content!",
			layoutData: oLd
		});
	}

	var oSplitter = new Splitter("mySplitter", {
		contentAreas: [
			new Text({
				text: "Content! size=auto; minSize=200",
				layoutData: new SplitterLayoutData({
					resizable: true,
					size: "auto",
					minSize: 200
				})
			}),
			new Text({
				text: "Content! size=350px; minSize=50",
				layoutData: new SplitterLayoutData({
					resizable: true,
					size: "350px",
					minSize: 50
				})
			}),
			new Splitter("nestedSplitter", {
				contentAreas: [new Button(), new Button()],
				orientation: "Vertical"
			})
		]
	});

	var oOptionsLayout = new VerticalLayout().addStyleClass("options");

	function showLayoutOptions() {
		// Remove all Options
		oOptionsLayout.destroyContent();

		var aContentAreas = oSplitter.getContentAreas();
		for (var i = 0; i < aContentAreas.length; ++i) {
			var oContentArea = aContentAreas[i];
			var oLD = oContentArea.getLayoutData();
			if (!oLD) {
				oLD = new SplitterLayoutData();
				oContentArea.setLayoutData(oLD);
			}

			var oOptions = new HorizontalLayout();
			oOptions.addContent(
				new Text({
					text: "ContentArea #" + (i + 1)
				}).addStyleClass("optionTitle")
			);

			oOptions.addContent(new Text({ text: "Resizable: " }));
			oOptions.addContent(new CheckBox({
				selected: oLD.getResizable(),
				select: (function (oLayoutData) {
					return function (oEvent) {
						oLayoutData.setResizable(oEvent.getParameter("selected"));
					};
				})(oLD)
			}));

			oOptions.addContent(new Text({ text: "Size (CSS): " }));
			oOptions.addContent(new Input({
				change: (function (oLayoutData) {
					return function (oEvent) {
						oLayoutData.setSize(oEvent.getParameter("value"));
					};
				})(oLD)
			}).setValue(oLD.getSize()));

			oOptions.addContent(new Text({ text: "Min-Size: (in px)" }));
			oOptions.addContent(new Input({
				change: (function (oLayoutData) {
					return function (oEvent) {
						oLayoutData.setMinSize(parseInt(oEvent.getParameter("value")));
					};
				})(oLD)
			}).setValue(oLD.getMinSize()));

			oOptionsLayout.addContent(oOptions);
		}
	}
	showLayoutOptions();

	var oButtonLayout = new HorizontalLayout().addStyleClass("buttons");

	var oAddContentBtn = new Button({
		text: "Add content area",
		press: function () {
			oSplitter.addContentArea(createExampleContent());
			showLayoutOptions();
		}
	});

	var oRemoveContentBtn = new Button({
		text: "Remove content area",
		press: function () {
			var oLastContentArea = oSplitter.getContentAreas().pop();
			oSplitter.removeContentArea(oLastContentArea);
			oLastContentArea.destroy();
			showLayoutOptions();
		}
	});

	var oInvalidateBtn = new Button({
		text: "Invalidate Splitter",
		press: function () {
			oSplitter.invalidate();
		}
	});

	var oResizeBtn = new Button({
		text: "Resize",
		press: function () {
			oSplitter.resetContentAreasSizes();
		}
	});

	var oSwitchOrientationBtn = new Button({
		text: "Change Orientation",
		press: function () {
			var sOr = oSplitter.getOrientation();
			oSplitter.setOrientation(
				sOr === Orientation.Vertical
					? Orientation.Horizontal
					: Orientation.Vertical
			);
		}
	});

	[oAddContentBtn, oRemoveContentBtn, oInvalidateBtn, oResizeBtn, oSwitchOrientationBtn].forEach(function (oBtn) { oButtonLayout.addContent(oBtn); });

	var oEventStatus = new Text({
		text: "Nothing happened so far."
	});
	var iEvents = 0;

	oSplitter.attachResize(function (oEvent) {
		oEventStatus.setText(
			UI5Date.getInstance().toLocaleString() + " - Resize # " + (++iEvents) + " fired by: " + oEvent.getSource().getId()
		);
		showLayoutOptions();
	});

	oSplitter.setLayoutData(new FlexItemData({
		growFactor: 1
	}));

	new App({
		pages: [
			new Page({
				title: "sap.ui.layout.Splitter",
				content: [
					new VBox({
						height: "100%",
						items: [
							oSplitter,
							new VBox({
								items: [
									oButtonLayout,
									oOptionsLayout,
									oEventStatus
								]
							})
						]
					})
				]
			})
		]
	}).placeAt("content");
});
