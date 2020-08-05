sap.ui.define([
	'sap/m/Button',
	'sap/m/CheckBox',
	'sap/m/Input',
	'sap/m/Text',
	'sap/ui/core/mvc/Controller',
	'sap/m/HBox',
	'sap/ui/layout/SplitterLayoutData',
	'sap/ui/core/library'
], function (Button, CheckBox, Input, Text, Controller, HBox, SplitterLayoutData, coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.Orientation
	var Orientation = coreLibrary.Orientation;

	return Controller.extend("sap.ui.layout.sample.Splitter.Splitter", {

		iResizes: 0,
		oSplitter: null,
		oOptions: null,

		onAfterRendering: function () {
			this.showLayoutOptions();
		},

		getSplitter: function () {
			if (!this.oSplitter) {
				this.oSplitter = this.byId("mainSplitter");
				this.oSplitter.attachResize(function (oEvent) {
					this.byId("eventStatus").setText(
						new Date().toLocaleString() +
						" - Resize # " + (++this.iResizes)
					);
					this.showLayoutOptions();
				}, this);
			}

			return this.oSplitter;
		},

		getOptionsLayout: function () {
			if (!this.oOptions) {
				this.oOptions = this.byId("mainOptions");
			}

			return this.oOptions;
		},

		showLayoutOptions: function () {
			var oOptionsLayout = this.getOptionsLayout();
			var oSplitter = this.getSplitter();

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

				var oOptions = new HBox({
					alignItems: "Center"
				});

				oOptions.addItem(
					new Text({
						text: "ContentArea #" + (i + 1)
					}).addStyleClass("optionTitle")
				);

				oOptions.addItem(new Text({ text: "Resizable: " }));
				oOptions.addItem(new CheckBox({
					selected: oLD.getResizable(),
					select: (function (oLayoutData) {
						return function (oEvent) {
							oLayoutData.setResizable(oEvent.getParameter("selected"));
						};
					})(oLD)
				}).addStyleClass("paddingRight"));

				oOptions.addItem(new Text({ text: "Size (CSS): " }));
				oOptions.addItem(new Input({
					value: oLD.getSize(),
					change: (function (oLayoutData) {
						return function (oEvent) {
							oLayoutData.setSize(oEvent.getParameter("value"));
						};
					})(oLD)
				}).addStyleClass("paddingRight"));

				/*eslint-disable no-loop-func */
				oOptions.addItem(new Text({ text: "Min-Size: (in px)" }));
				oOptions.addItem(new Input({
					value: oLD.getMinSize(),
					change: (function (oLayoutData) {
						return function (oEvent) {
							oLayoutData.setMinSize(parseInt(oEvent.getParameter("value")));
						};
					})(oLD)
				}));
				/*eslint-enable no-loop-func */
				oOptionsLayout.addContent(oOptions);
			}
		},

		createExampleContent: function () {
			var oLd = new SplitterLayoutData({
				resizable: true,
				size: Math.random() > 0.5 ? "auto" : 50 + Math.floor(Math.random() * 300) + "px",
				maxSize: Math.random() > 0.5 ? "0" : Math.floor(Math.random() * 100) + "px"
			});

			var oContent = new Button({
				width: "100%",
				height: "100%",
				text: "Content!",
				layoutData: oLd
			});

			return oContent;
		},

		btnAddContentArea: function () {
			this.getSplitter().addContentArea(this.createExampleContent());
			this.showLayoutOptions();
		},

		btnRemoveContentArea: function () {
			var oSplitter = this.getSplitter();

			var oLastContentArea = oSplitter.getContentAreas().pop();
			oSplitter.removeContentArea(oLastContentArea);
			oLastContentArea.destroy();
			this.showLayoutOptions();
		},

		btnInvalidateSplitter: function () {
			this.getSplitter().invalidate();
		},

		btnChangeOrientation: function () {
			var sOr = this.getSplitter().getOrientation();
			this.getSplitter().setOrientation(
				sOr === Orientation.Vertical
					? Orientation.Horizontal
					: Orientation.Vertical
			);
		}

	});
});