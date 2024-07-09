/* eslint-disable max-nested-callbacks */
sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/Core',
	'sap/ui/model/json/JSONModel',
	'sap/ui/integration/widgets/Card',
	'sap/ui/core/IconPool',
	'sap/m/Text',
	'sap/ui/integration/Host',
	'sap/m/Dialog',
	'sap/ui/integration/designtime/editor/CardEditor',
	'sap/m/Button',
	'sap/ui/integration/util/DisplayVariants'
], function (Controller, Core, JSONModel, Card, IconPool, Text, Host, Dialog, Editor, Button, DisplayVariants) {
	"use strict";

	return Controller.extend("sap.ui.integration.sample.Progressive.Preview", {
		iconNames: IconPool.getIconNames(),
		microCharts: {
			"None": null,
			"Line": {
				"type": "Line",
				"leftTopLabel": "0",
				"rightTopLabel": "30",
				"maxXValue": 30,
				"maxYValue": 400,
				"minXValue": 0,
				"minYValue": 0,
				"leftBottomLabel": "June 1",
				"rightBottomLabel": "June 30",
				"lines": {
					"path": "/chart/4/Lines",
					"template": {
						"color": "{color}",
						"lineType": "{type}",
						"showPoints": true,
						"points": {
							"path": "Points",
							"template": {
								"x": "{X}",
								"y": "{Y}"
							}
						}
					}
				}
			},
			"Bullet": {
				"type": "Bullet",
				"minValue": 0,
				"maxValue": "{/chart/4/Expected}",
				"target": "{/chart/4/Target}",
				"value": "{/chart/4/Actual}",
				"scale": "€",
				"displayValue": "75 EUR",
				"color": "{/chart/4/color}"
			},
			"Radial": {
				"type": "Radial",
				"color": "Critical",
				"total": 200,
				"showPercentageSymbol": true,
				"percentage": 49,
				"fraction": 49
			},
			"HarveyBall": {
				"type": "HarveyBall",
				"color": "Critical",
				"total": 100,
				"totalScale": "Mrd",
				"showTotal": true,
				"percentage": 44,
				"fraction": 44,
				"fractionScale": "Mrd"
			},
			"StackedBar": {
				"type": "StackedBar",
				"displayValue": "{= ${/chart/4/Notebook13} + ${/chart/4/Notebook17}}K",
				"maxValue": "{/maxOverYears}",
				"bars": [
					{
						"value": "{/chart/4/Notebook13}",
						"displayValue": "{/legend/items/Notebook13}: {/chart/4/Notebook13}K",
						"legendTitle": "{/legend/items/Notebook13}"
					},
					{
						"value": "{/chart/4/Notebook17}",
						"displayValue": "{/legend/items/Notebook17}: {/chart/4/Notebook17}K",
						"legendTitle": "{/legend/items/Notebook17}"
					}
				]
			},
			"Column": {
				"type": "Column",
				"leftTopLabel": "0M",
				"maxVarightTopLabellue": "80M",
				"leftBottomLabel": "June 1",
				"rightBottomLabel": "June 30",
				"columns": {
					"path": "/chart/4/Columns",
					"template": {
						"color": "{color}",
						"value": "{value}"
					}
				}
			}
		},
		sideIndicators: {
			"None": null,
			"One": [
				{
					"title": "Target",
					"number": "{/kpiInfos/kpi/target/number}",
					"unit": "{/kpiInfos/kpi/target/unit}",
					"visible": "{size>/regular}"
				}
			],
			"Two": [
				{
					"title": "Target",
					"number": "{/kpiInfos/kpi/target/number}",
					"unit": "{/kpiInfos/kpi/target/unit}",
					"visible": "{size>/regular}"
				},
				{
					"title": "Deviation",
					"number": "{/kpiInfos/kpi/deviation/number}",
					"unit": "%",
					"visible": "{size>/regular}"
				}
			]
		},
		actionStatuses: {
			"None": null,
			"Action": null,
			"Status": {
				"text": "5 of 10"
			},
			"Both": {
				"text": "5 of 10"
			}
		},
		icons: {
			"ColorSquare": {
				"src": "sap-icon://palette",
				"backgroundColor": "Accent1",
				"shape": "Square"
			},
			"ColorCircle": {
				"src": "sap-icon://palette",
				"backgroundColor": "Accent1",
				"shape": "Circle"
			},
			"Transparent": {
				"src": "sap-icon://palette",
				"backgroundColor": "Transparent",
				"shape": "Circle"
			},
			"None": null
		},

		settings: new JSONModel({
			possibleVariants: [
				{ key: "TileStandard", text: "TileStandard", visible: true },
				{ key: "TileFlat", text: "TileFlat", visible: true },
				{ key: "TileFlatWide", text: "TileFlatWide", visible: true },
				{ key: "TileStandardWide", text: "TileStandardWide", visible: true },
				{ key: "CompactHeader", text: "CompactHeader", visible: true },
				{ key: "SmallHeader", text: "SmallHeader", visible: true },
				{ key: "StandardHeader", text: "StandardHeader", visible: true },
				{ key: "Standard", text: "Standard", visible: true },
				{ key: "Small", text: "Small", visible: true },
				{ key: "Large", text: "Large", visible: true }
			],
			type: "Default",
			display: "Default",
			variant: "Standard",
			actionStatus: "Action",
			icon: "Transparent",
			microChart: "HarveyBall",
			sideIndicator: "One"
		}),
		previewCard: null,
		numericCard: () => new Card({
			manifest: "./cardNumericManifest.json",
			baseUrl: "./",
			width: "600px",
			useProgressiveDisclosure: true
		}),
		defaultCard: () => new Card({
			manifest: "./cardDefaultManifest.json",
			baseUrl: "./",
			width: "600px",
			useProgressiveDisclosure: true
		}),
		componentCard: () => new Card({
			manifest: "./componentCard/manifest.json",
			width: "600px",
			useProgressiveDisclosure: true
		}),
		onInit: function () {
			this.getView().setModel(this.settings, "settings");
		},
		onAfterRendering: function () {
			this.update();
		},
		updateSizeMode: function (oEvent) {
			document.body.classList.remove("sapUiSizeCompact", "sapUiSizeCozy");
			document.body.classList.add("sapUiSize" + oEvent.getParameter("selectedItem").getKey());
		},
		update: function () {
			this.cardDisplay = this.getView().byId("displaySelect").getSelectedKey();
			this.settings.getData().possibleVariants.forEach((item, idx) => {
				if (item.key.indexOf("Tile") > -1 || item.key.indexOf("Header") > -1) {
					this.settings.setProperty("/possibleVariants/" + idx + "/visible", (this.cardDisplay !== "Default"));
				} else {
					this.settings.setProperty("/possibleVariants/" + idx + "/visible", (this.cardDisplay === "Default"));
				}
			});
			this.settings.checkUpdate(true, false);
			setTimeout(() => {
				this.showCard();
			}, 100);
		},

		showCard: function () {
			const layout = this.getView().byId("layout");
			layout.removeAllItems();
			this.previewCard = this.createCard();
			if (this.previewCard) {
				layout.addItem(this.previewCard);
				setTimeout(() => {
					this.cardVariant = this.getView().byId("variantSelect").getSelectedKey();
					if (this.cardVariant === "TileStandardWide" || this.cardVariant === "TileFlatWide" || this.cardVariant === "TileStandard" || this.cardVariant === "TileFlat") {
						this.getView().byId("widthSlider").setVisible(false);
						this.getView().byId("widthLine").setVisible(false);
						this.getView().byId("widthText").setVisible(true);
					} else {
						this.getView().byId("widthLine").setVisible(true);
						this.getView().byId("widthSlider").setVisible(true);
						this.getView().byId("widthText").setVisible(true);

						if (this.previewCard) {
							if (this.cardVariant === "StandardHeader") {
								this.previewCard.setWidth("600px");
							} else if (this.cardVariant === "SmallHeader") {
								this.previewCard.setWidth("500px");
							} else if (this.cardVariant === "CompactHeader") {
								this.previewCard.setWidth("350px");
							}
						}
					}
					setTimeout(() => this.updateSlider(), 100);
				}, 100);
			}
		},

		updateSlider: function (oEvent) {
			const slider = this.getView().byId("widthSlider");
			const widthText = this.getView().byId("widthText");
			if (oEvent) {
				this.previewCard.getDomRef().style.width = oEvent.getParameter("value") + "px";
			}
			slider.setMax(this.previewCard.getDomRef().parentNode.offsetWidth);
			slider.setMin(0);
			const width = this.previewCard.getDomRef().offsetWidth;
			slider.setValue(width);
			let text = "Width: tiny";
			if (DisplayVariants.determineSize("narrow", width)) {
				text = "Width: narrow";
			}
			if (DisplayVariants.determineSize("regular",width)) {
				text = "Width: regular";
			}
			if (DisplayVariants.determineSize("wide", width)) {
				text = "Width: wide";
			}
			if (DisplayVariants.determineSize("extraWide", width)) {
				text = "Width: extraWide";
			}
			if (slider.getVisible()) {
				widthText.removeStyleClass("sapUiSmallMarginTop");
			} else {
				widthText.addStyleClass("sapUiSmallMarginTop");
			}
			widthText.setText(text);
		},

		createCard: function () {

			this.cardVariant = this.settings.getProperty("/variant");
			if (!this.cardVariant) {
				return null;
			}
			let oCard = this.previewCard;
			if (!this._skipCreate) {
				this.previewCard?.destroy();

				const sHeaderType = this.settings.getProperty("/type");
				const sContentType = this.settings.getProperty("/contentType");

				if (sContentType === "Component") {
					oCard = this.componentCard();
				} else {
					oCard = sHeaderType === "Default" ? this.defaultCard() : this.numericCard();
				}

				oCard.setHost(this.getHost());
				const mChanges = {};

				if (sContentType === "Component") {
					mChanges["/sap.card/header/visible"] = false;
				} else {
					mChanges["/sap.card/extension"] = this.settings.getProperty("/actionStatus") === "Both" || this.settings.getProperty("/actionStatus") === "Action" ? "extension" : null;
					mChanges["/sap.card/header/icon"] = structuredClone(this.icons[this.settings.getProperty("/icon")]) || null;
					mChanges["/sap.card/header/status"] = structuredClone(this.actionStatuses[this.settings.getProperty("/actionStatus")]) || null;
					if (sHeaderType === "Numeric") {
						mChanges["/sap.card/header/chart"] = structuredClone(this.microCharts[this.settings.getProperty("/microChart")]) || null;
						mChanges["/sap.card/header/sideIndicators"] = structuredClone(this.sideIndicators[this.settings.getProperty("/sideIndicator")]) || null;
					}
				}

				oCard.setManifestChanges(
					[mChanges]
				);
			}
			this._skipCreate = false;

			oCard.setDisplayVariant(this.cardVariant);
			oCard.addStyleClass("sample" + this.cardVariant);
			oCard.refresh();
			return oCard;
		},

		getCurrentSettings: function () {
			return {
				type: this.settings.getProperty("/type"),
				contentType: this.settings.getProperty("/contentType"),
				display: this.settings.getProperty("/display"),
				variant: this.settings.getProperty("/variant"),
				actionStatus: this.settings.getProperty("/actionStatus"),
				icon: this.settings.getProperty("/icon"),
				microChart: this.settings.getProperty("/microChart"),
				sideIndicator: this.settings.getProperty("/sideIndicator")
			};
		},

		getCurrentSettingsAsString: function () {
			const settings = this.getCurrentSettings();
			return Object.keys(settings).map((key) => {
				return key + ": " + settings[key];
			}).join(", ");
		},

		clear: function () {
			if (this._saveSettings) {
				this.settings.setProperty("/type", this._saveSettings.type);
				this.settings.setProperty("/contentType", this._saveSettings.contentType);
				this.settings.setProperty("/display", this._saveSettings.display);
				this.settings.setProperty("/variant", this._saveSettings.variant);
				this.settings.setProperty("/actionStatus", this._saveSettings.actionStatus);
				this.settings.setProperty("/icon", this._saveSettings.icon);
				this.settings.setProperty("/microChart", this._saveSettings.microChart);
				this.settings.setProperty("/sideIndicator", this._saveSettings.sideIndicator);
			}
			this.getView().byId("toolbar").getContent().forEach((item) => {
				item.setVisible(true);
			});
			this.getView().byId("toolbar").getContent()[0].setVisible(false);
			this.getView().byId("widthText").setVisible(false);
			this.update();
		},

		generateAllHeaders: function () {
			this.getView().byId("widthSlider").setVisible(false);
			this.getView().byId("widthLine").setVisible(false);
			this.getView().byId("widthText").setVisible(false);
			this.getView().byId("toolbar").getContent().forEach((item) => {
				item.setVisible(false);
			});
			this.getView().byId("toolbar").getContent()[0].setVisible(true);
			const layout = this.getView().byId("layout");
			layout.removeAllItems();
			this._saveSettings = this.getCurrentSettings();
			this.settings.setProperty("/type", "Default");
			this.settings.setProperty("/contentType", "List");
			this.settings.setProperty("/display", "Header");
			this.settings.setProperty("/microChart", "None");
			this.settings.setProperty("/sideIndicator", "None");
			//permutations of the default card
			["TileStandard", "TileFlat", "TileFlatWide", "TileStandardWide", "CompactHeader", "SmallHeader", "StandardHeader"].forEach((variant) => {
				this.settings.setProperty("/variant", variant);
				Object.keys(this.icons).forEach((icon) => {
					this.settings.setProperty("/icon", icon);
					if (variant === "TileStandard" || variant === "TileFlat" || variant === "TileFlatWide" || variant === "TileStandardWide"  || variant === "CompactHeader") {
						this.addCardToLayout(layout);
					} else {
						Object.keys(this.actionStatuses).forEach((actionStatus) => {
							this.settings.setProperty("/actionStatus", actionStatus);
							this.addCardToLayout(layout);
						});
					}
				});
			});
			//permutations of the numeric card and display variants
			this.settings.setProperty("/type", "Numeric");
			this.settings.setProperty("/contentType", "List");
			this.settings.setProperty("/display", "Header");
			this.settings.setProperty("/microChart", "None");
			this.settings.setProperty("/sideIndicator", "None");

			["TileStandard", "TileFlat", "TileFlatWide", "TileStandardWide", "CompactHeader", "SmallHeader", "StandardHeader"].forEach((variant) => {
				this.settings.setProperty("/variant", variant);
				Object.keys(this.icons).forEach((icon) => {
					this.settings.setProperty("/icon", icon);
					if (variant === "TileStandard" || variant === "TileFlat" || variant === "CompactHeader") {
						this.addCardToLayout(layout);
					} else {
						Object.keys(this.microCharts).forEach((microChart) => {
							this.settings.setProperty("/microChart", microChart);
							Object.keys(this.sideIndicators).forEach((sideIndicator) => {
								this.settings.setProperty("/sideIndicator", sideIndicator);
								if (variant === "SmallHeader" || variant === "StandardHeader") {
									Object.keys(this.actionStatuses).forEach((actionStatus) => {
										this.settings.setProperty("/actionStatus", actionStatus);
										this.addCardToLayout(layout);
									});
								} else {
									this.addCardToLayout(layout);
								}
							});
						});
					}
				});
			});
		},

		addCardToLayout: function (layout) {
			const oCard = this.createCard();
			oCard.setHost(this.getHost());
			if (oCard) {
				layout.addItem(new Text({ text: this.getCurrentSettingsAsString()}).addStyleClass("sapUiSmallMarginTopBottom"));
				layout.addItem(oCard);
			}
		},

		getHost: function () {
			if (this._oHost) {
				return this._oHost;
			}
			this._oHost = new Host({
				action: (oEvent) => {
					if (oEvent.getParameter("type") === "Custom" && oEvent.getParameter("actionSource").getText() === "Configure") {
						var oCard = oEvent.getParameter("card");
						this.configureCard(oCard);
					}
				}
			});
			return this._oHost;
		},

		configureCard: function (oCard) {
			const aManifestChanges = oCard.getManifestChanges();
			if (aManifestChanges.length === 0) {
				aManifestChanges.push({});
			}
			if (this.cardVariant.indexOf("Tile") > -1) {
				aManifestChanges[0]["/sap.card/root/show"] = 'tile';
				aManifestChanges[0]["/sap.card/root/tileSize"] = this.cardVariant;
			} else if (this.cardVariant.indexOf("Header") > -1) {
				aManifestChanges[0]["/sap.card/root/show"] = 'header';
				aManifestChanges[0]["/sap.card/root/headerSize"] = this.cardVariant;
			} else {
				aManifestChanges[0]["/sap.card/root/show"] = "all";
				aManifestChanges[0]["/sap.card/root/contentSize"] = this.cardVariant;
			}
			aManifestChanges[0][":layer"] = 0; // @: this is a bug on the editor. to make sure the changes are applied
			oCard.setManifestChanges(aManifestChanges);
			const oEditor = new Editor({
				card: oCard
			});
			var oDialog = new Dialog({
				title: "Configure Card",
				contentWidth: "800px",
				resizable: true,
				draggable: true,
				content: [
					oEditor
				],
				beginButton: new Button({
					text: "Cancel",
					press: function () {
						oDialog.close();
					}
				}),
				endButton: new Button({
					text: "Apply",
					type: "Emphasized",
					press: function () {
						const mCurrentSettings = oEditor.getCurrentSettings();
						if (mCurrentSettings["/sap.card/root/show"] === 'tile') {
							this.settings.setProperty("/variant", mCurrentSettings["/sap.card/root/tileSize"]);
							this.settings.setProperty("/display", "Header");
						} else if (mCurrentSettings["/sap.card/root/show"] === 'header') {
							this.settings.setProperty("/variant", mCurrentSettings["/sap.card/root/headerSize"]);
							this.settings.setProperty("/display", "Header");
						} else if (mCurrentSettings["/sap.card/root/show"] === 'all') {
							this.settings.setProperty("/variant", mCurrentSettings["/sap.card/root/contentSize"]);
							this.settings.setProperty("/display", "Default");
						}
						oCard.setManifestChanges([mCurrentSettings]);
						this._skipCreate = true;
						this.update();
						oDialog.close();
					}.bind(this)
				})
			});
			oDialog.open();
		}
	});
});