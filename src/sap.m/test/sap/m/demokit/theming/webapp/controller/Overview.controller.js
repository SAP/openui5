sap.ui.define([
	"sap/ui/core/Theming",
	"sap/ui/demo/theming/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/ui/demo/theming/model/formatter",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/theming/Parameters",
	"sap/ui/core/library",
	"sap/ui/core/Fragment"
], function(
	Theming,
	BaseController,
	JSONModel,
	Filter,
	FilterOperator,
	Sorter,
	formatter,
	MessageToast,
	MessageBox,
	jQuery,
	Parameters,
	coreLibrary,
	Fragment
) {
	"use strict";

	// list of available themes
	const mThemes = {
		"sap_horizon": {
			"text": "Morning Horizon"
		},
		"sap_horizon_dark": {
			"text": "Evening Horizon"
		},
		"sap_horizon_hcb": {
			"text": "Horizon High Contrast Black"
		},
		"sap_horizon_hcw": {
			"text": "Horizon High Contrast White"
		},
		"sap_fiori_3": {
			"text": "Quartz Light"
		},
		"sap_fiori_3_dark": {
			"text": "Quartz Dark"
		},
		"sap_fiori_3_hcb": {
			"text": "Quartz High Contrast Black"
		},
		"sap_fiori_3_hcw": {
			"text": "Quartz High Contrast White"
		},
		"sap_belize": {
			"text": "Belize",
			"deprecated": true
		},
		"sap_belize_plus": {
			"text": "Belize Deep",
			"deprecated": true
		},
		"sap_belize_hcb": {
			"text": "Belize High Contrast Black",
			"deprecated": true
		},
		"sap_belize_hcw": {
			"text": "Belize High Contrast White",
			"deprecated": true
		},
		"sap_bluecrystal": {
			"text": "Blue Crystal",
			"deprecated": true
		},
		"sap_hcb": {
			"text": "High Contrast Black",
			"deprecated": true
		}
	};

	return BaseController.extend("sap.ui.demo.theming.controller.Overview", {

		formatter: formatter,
		/* =========================================================== */
		/* lifecycle methods										   */
		/* =========================================================== */

		/**
		 * Called when the overview controller is instantiated.
		 * @public
		 */
		onInit: function () {
			var oTable = this.byId("table");
			var oTableItem = this.byId("oTableItem");
			this._oTable = oTable;
			this._oCurrentQueryContext = null;

			//Keeps the filter and search state
			this._oTableFilterState = {
				aFilter: [],
				aCPFilter: [],
				aSearch: [],
				aControlgroup: [],
				aTheming: [],
				aCharacteristic: [],
				aText: []
			};
			var oModel = new JSONModel();
			var oComboBoxModel = new JSONModel();

			//Contains the Data for the ComboBox
			var mData = {
				"items": Object.keys(mThemes).map((theme) => Object.assign({
					theme
				}, mThemes[theme]))
			};
			oComboBoxModel.setData(mData);

			// set the default values
			var sCurrentTheme = Theming.getTheme();
			var oComboBox = this.getView().byId("comboBox");
			oComboBox.setModel(oComboBoxModel);
			oComboBox.setSelectedKey(sCurrentTheme);
			this.byId("title").setText(`Details for ''${mThemes[sCurrentTheme].text}''`);

			this.getView().setModel(oModel);
			oModel.setSizeLimit(100000);

			oTable.bindAggregation("items", "/Data", oTableItem);

			// cache the parameter metadata
			let aParameterMetadata = [];
			this.getParameterMetadata().then((aLoadedParameterMetadata) => {
				aParameterMetadata = aLoadedParameterMetadata;
				var oData = this.createDataStructure(aParameterMetadata);
				oModel.setData(oData);
			});

			this.byId("colTP").setVisible(false);
			this._oTableFilterState.aCPFilter = [
				new Filter("cp", FilterOperator.EQ, true)
			];
			this._applyFilterSearch();
		},
		getParameterMetadata: async function () {
			const [baseLessResponse, globalLessResponse, skeletonLessResponse] = await Promise.all([
				fetch(`${sap.ui.require.toUrl("sap/ui/core")}/themes/base/base.less`),
				fetch(`${sap.ui.require.toUrl("sap/ui/core")}/themes/base/global.less`),
				fetch(`${sap.ui.require.toUrl("sap/ui/core")}/themes/base/skeleton.less`)
			]);

			const data = await baseLessResponse.text();
			const namedata = await globalLessResponse.text();
			const skeletondata = await skeletonLessResponse.text();

			const patternTPMB = /\/\/.*(?:\n\/\/.*)*\n(@.*(?:\n@.*)*)/g;
			const patternTP = /^(@[^:]+):\s([^;]+)/gmi,
				  patternTPl = /^(@[^:]+):\s([^;]+)/i,
				  patternCP = /(--[^:]+):\s(@[^;]+)/gmi,
				  patternCPl = /(--[^:]+):\s(@[^;]+)/i;

			// find all theme parameter metadata blocks in the base.less
			// and extract the theme parameters incl. metadata
			const oMetadata = {};
			let matchTPMB;
			while ((matchTPMB = patternTPMB.exec(data)) !== null) {
				const metadata = {};
				const block = matchTPMB[0];
				block.split("\n").forEach((line) => {
					const matchMD = /\/\/ \[(.*?) "(.*?)"\]/.exec(line);
					if (matchMD) {
						if (matchMD[1] === "Tags" || matchMD[1] === "Category") {
							let entries = matchMD[2].split('", "');
							entries = (entries || []).filter((t) => t !== "Protected");
							metadata[matchMD[1]] = entries;
						} else if (matchMD[1] !== "Protected") {
							metadata[matchMD[1]] = matchMD[2];
						}
					} else {
						const matchTP = /^(@[^:]+):\s([^;]+);/.exec(line);
						// the parameter is already found => let's ignore the rest
						// as this is only controlling the protected info for HCW theme
						if (matchTP && !oMetadata[matchTP[1]]) {
							oMetadata[matchTP[1]] = metadata;
						}
					}
				});
			}

			const aCustomProperties = skeletondata.match(patternCP);
			const mCustomProperties = {};
			aCustomProperties.forEach((customProp) => {
				const match = patternCPl.exec(customProp);
				if (match) {
					mCustomProperties[match[2]] = match[1];
				}
			});

			const aThemeParameters = namedata.match(patternTP);
			/*
			const mThemeParameters = {};
			aThemeParameters.forEach((customProp) => {
				const match = patternTPl.exec(customProp);
				if (match) {
					mThemeParameters[match[1]] = match[2];
				}
			});
			*/

			const aParameterMetadata = [];
			aThemeParameters.forEach((themeParam) => {
				const match = patternTPl.exec(themeParam);
				if (match) {
					const name = match[1];
					const value = match[2];

					aParameterMetadata.push({
						name: name.substr(1), // remove the leading @
						value,
						nameTP: name,
						nameCP: mCustomProperties[value],
						label: oMetadata[value]?.Label,
						desc: oMetadata[value]?.Description,
						trans: oMetadata[value]?.TranslationKey,
						tags: oMetadata[value]?.Tags
					});
				}
			});

			return aParameterMetadata;
		},

		//Creates the Data Structure for the table
		createDataStructure: function (aParameterMetadata) {
			const oData = {};
			const oClass = this.getView().getModel('class').getData();
			const oThemeParameters = Parameters.get();

			// create the Data structure for the table
			oData.Data = aParameterMetadata.map((oParam) => {
				const { name, nameTP, nameCP, label, desc, tags } = oParam;
				const sThemeParameterValue = oThemeParameters[name];

				return {
					name,
					nameTP,
					nameCP,
					cp: !!nameCP, // flag for being a custom property
					label,
					color: sThemeParameterValue,
					colors: coreLibrary.CSSColor.isValid(sThemeParameterValue) ? sThemeParameterValue : undefined,
					'class': oClass[name],
					controlgroup: tags?.find((tag) => [
						"Button", "Chart", "Content", "Field", "Group", "Link",
						"List",	"Page", "Scrollbar", "Shell", "Tile", "Toolbar"
					].includes(tag)),
					theming: tags?.find((tag) => ["Expert", "Quick"].includes(tag)),
					parameter /* characteristic */: tags?.find((tag) => [
						"Color", "Dimension", "Image", "Opacity"
					].includes(tag)),
					text: tags?.includes("Font") ? "Text" : "",
					description: desc
				};
			});

			return oData;
		},
		//Sets the other Control Group ToggleButtons to unpressed
		//Sets a new filter (Control Group)

		onPressButton: function (evt) {
			if (evt.getSource().getPressed()) {
				this.byId("tbChart").setPressed();
				this.byId("tbContent").setPressed();
				this.byId("tbField").setPressed();
				this.byId("tbGroup").setPressed();
				this.byId("tbLink").setPressed();
				this.byId("tbList").setPressed();
				this.byId("tbPage").setPressed();
				this.byId("tbScrollbar").setPressed();
				this.byId("tbShell").setPressed();
				this.byId("tbTile").setPressed();
				this.byId("tbToolbar").setPressed();
				this._oTableFilterState.aControlgroup = [new Filter("controlgroup", FilterOperator.EQ, "Button")];
			} else {
				this._oTableFilterState.aControlgroup = [];
			}
			this._applyFilterSearch();
		},

		onPressChart: function (evt) {
			if (evt.getSource().getPressed()) {
				this.byId("tbButton").setPressed();
				this.byId("tbContent").setPressed();
				this.byId("tbField").setPressed();
				this.byId("tbGroup").setPressed();
				this.byId("tbLink").setPressed();
				this.byId("tbList").setPressed();
				this.byId("tbPage").setPressed();
				this.byId("tbScrollbar").setPressed();
				this.byId("tbShell").setPressed();
				this.byId("tbTile").setPressed();
				this.byId("tbToolbar").setPressed();
				this._oTableFilterState.aControlgroup = [new Filter("controlgroup", FilterOperator.EQ, "Chart")];
			} else {
				this._oTableFilterState.aControlgroup = [];
			}
			this._applyFilterSearch();
		},

		onPressContent: function (evt) {
			if (evt.getSource().getPressed()) {
				this.byId("tbButton").setPressed();
				this.byId("tbChart").setPressed();
				this.byId("tbField").setPressed();
				this.byId("tbGroup").setPressed();
				this.byId("tbLink").setPressed();
				this.byId("tbList").setPressed();
				this.byId("tbPage").setPressed();
				this.byId("tbScrollbar").setPressed();
				this.byId("tbShell").setPressed();
				this.byId("tbTile").setPressed();
				this.byId("tbToolbar").setPressed();
				this._oTableFilterState.aControlgroup = [new Filter("controlgroup", FilterOperator.EQ, "Content")];
			} else {
				this._oTableFilterState.aControlgroup = [];
			}
			this._applyFilterSearch();
		},

		onPressField: function (evt) {
			if (evt.getSource().getPressed()) {
				this.byId("tbButton").setPressed();
				this.byId("tbChart").setPressed();
				this.byId("tbContent").setPressed();
				this.byId("tbGroup").setPressed();
				this.byId("tbLink").setPressed();
				this.byId("tbList").setPressed();
				this.byId("tbPage").setPressed();
				this.byId("tbScrollbar").setPressed();
				this.byId("tbShell").setPressed();
				this.byId("tbTile").setPressed();
				this.byId("tbToolbar").setPressed();
				this._oTableFilterState.aControlgroup = [new Filter("controlgroup", FilterOperator.EQ, "Field")];
			} else {
				this._oTableFilterState.aControlgroup = [];
			}
			this._applyFilterSearch();
		},

		onPressGroup: function (evt) {
			if (evt.getSource().getPressed()) {
				this.byId("tbButton").setPressed();
				this.byId("tbChart").setPressed();
				this.byId("tbContent").setPressed();
				this.byId("tbField").setPressed();
				this.byId("tbLink").setPressed();
				this.byId("tbList").setPressed();
				this.byId("tbPage").setPressed();
				this.byId("tbScrollbar").setPressed();
				this.byId("tbShell").setPressed();
				this.byId("tbTile").setPressed();
				this.byId("tbToolbar").setPressed();
				this._oTableFilterState.aControlgroup = [new Filter("controlgroup", FilterOperator.EQ, "Group")];
			} else {
				this._oTableFilterState.aControlgroup = [];
			}
			this._applyFilterSearch();
		},

		onPressLink: function (evt) {
			if (evt.getSource().getPressed()) {
				this.byId("tbButton").setPressed();
				this.byId("tbChart").setPressed();
				this.byId("tbContent").setPressed();
				this.byId("tbField").setPressed();
				this.byId("tbGroup").setPressed();
				this.byId("tbList").setPressed();
				this.byId("tbPage").setPressed();
				this.byId("tbScrollbar").setPressed();
				this.byId("tbShell").setPressed();
				this.byId("tbTile").setPressed();
				this.byId("tbToolbar").setPressed();
				this._oTableFilterState.aControlgroup = [new Filter("controlgroup", FilterOperator.EQ, "Link")];
			} else {
				this._oTableFilterState.aControlgroup = [];
			}
			this._applyFilterSearch();
		},

		onPressList: function (evt) {
			if (evt.getSource().getPressed()) {
				this.byId("tbButton").setPressed();
				this.byId("tbChart").setPressed();
				this.byId("tbContent").setPressed();
				this.byId("tbField").setPressed();
				this.byId("tbGroup").setPressed();
				this.byId("tbLink").setPressed();
				this.byId("tbPage").setPressed();
				this.byId("tbScrollbar").setPressed();
				this.byId("tbShell").setPressed();
				this.byId("tbTile").setPressed();
				this.byId("tbToolbar").setPressed();
				this._oTableFilterState.aControlgroup = [new Filter("controlgroup", FilterOperator.EQ, "list")];
			} else {
				this._oTableFilterState.aControlgroup = [];
			}
			this._applyFilterSearch();
		},

		onPressPage: function (evt) {
			if (evt.getSource().getPressed()) {
				this.byId("tbButton").setPressed();
				this.byId("tbChart").setPressed();
				this.byId("tbContent").setPressed();
				this.byId("tbField").setPressed();
				this.byId("tbGroup").setPressed();
				this.byId("tbLink").setPressed();
				this.byId("tbList").setPressed();
				this.byId("tbScrollbar").setPressed();
				this.byId("tbShell").setPressed();
				this.byId("tbTile").setPressed();
				this.byId("tbToolbar").setPressed();
				this._oTableFilterState.aControlgroup = [new Filter("controlgroup", FilterOperator.EQ, "Page")];
			} else {
				this._oTableFilterState.aControlgroup = [];
			}
			this._applyFilterSearch();
		},

		onPressScrollbar: function (evt) {
			if (evt.getSource().getPressed()) {
				this.byId("tbButton").setPressed();
				this.byId("tbChart").setPressed();
				this.byId("tbContent").setPressed();
				this.byId("tbField").setPressed();
				this.byId("tbGroup").setPressed();
				this.byId("tbLink").setPressed();
				this.byId("tbList").setPressed();
				this.byId("tbPage").setPressed();
				this.byId("tbShell").setPressed();
				this.byId("tbTile").setPressed();
				this.byId("tbToolbar").setPressed();
				this._oTableFilterState.aControlgroup = [new Filter("controlgroup", FilterOperator.EQ, "Scrollbar")];
			} else {
				this._oTableFilterState.aControlgroup = [];
			}
			this._applyFilterSearch();
		},

		onPressShell: function (evt) {
			if (evt.getSource().getPressed()) {
				this.byId("tbButton").setPressed();
				this.byId("tbChart").setPressed();
				this.byId("tbContent").setPressed();
				this.byId("tbField").setPressed();
				this.byId("tbGroup").setPressed();
				this.byId("tbLink").setPressed();
				this.byId("tbList").setPressed();
				this.byId("tbPage").setPressed();
				this.byId("tbScrollbar").setPressed();
				this.byId("tbTile").setPressed();
				this.byId("tbToolbar").setPressed();
				this._oTableFilterState.aControlgroup = [new Filter("controlgroup", FilterOperator.EQ, "Shell")];
			} else {
				this._oTableFilterState.aControlgroup = [];
			}
			this._applyFilterSearch();
		},

		onPressTile: function (evt) {
			if (evt.getSource().getPressed()) {
				this.byId("tbButton").setPressed();
				this.byId("tbChart").setPressed();
				this.byId("tbContent").setPressed();
				this.byId("tbField").setPressed();
				this.byId("tbGroup").setPressed();
				this.byId("tbLink").setPressed();
				this.byId("tbList").setPressed();
				this.byId("tbPage").setPressed();
				this.byId("tbScrollbar").setPressed();
				this.byId("tbShell").setPressed();
				this.byId("tbToolbar").setPressed();
				this._oTableFilterState.aControlgroup = [new Filter("controlgroup", FilterOperator.EQ, "Tile")];
			} else {
				this._oTableFilterState.aControlgroup = [];
			}
			this._applyFilterSearch();
		},

		onPressToolbar: function (evt) {
			if (evt.getSource().getPressed()) {
				this.byId("tbButton").setPressed();
				this.byId("tbChart").setPressed();
				this.byId("tbContent").setPressed();
				this.byId("tbField").setPressed();
				this.byId("tbGroup").setPressed();
				this.byId("tbLink").setPressed();
				this.byId("tbList").setPressed();
				this.byId("tbPage").setPressed();
				this.byId("tbScrollbar").setPressed();
				this.byId("tbShell").setPressed();
				this.byId("tbTile").setPressed();
				this._oTableFilterState.aControlgroup = [new Filter("controlgroup", FilterOperator.EQ, "Toolbar")];
			} else {
				this._oTableFilterState.aControlgroup = [];
			}
			this._applyFilterSearch();
		},

		//Sets a new filter (text)
		onPressText: function (evt) {
			if (evt.getSource().getPressed()) {
				this._oTableFilterState.aText = [new Filter("text", FilterOperator.EQ, "Text")];
			} else {
				this._oTableFilterState.aText = [];
			}
			this._applyFilterSearch();
		},

		//Sets the other parameter ToggleButtons to unpressed
		//Sets a new filter (parameter)
		onPressColor: function (evt) {
			if (evt.getSource().getPressed()) {
				this.byId("tbDimension").setPressed();
				this.byId("tbImage").setPressed();
				this.byId("tbOpacity").setPressed();
				this._oTableFilterState.aCharacteristic = [new Filter("parameter", FilterOperator.EQ, "Color")];
			} else {
				this._oTableFilterState.aCharacteristic = [];
			}
			this._applyFilterSearch();
		},
		onPressDimension: function (evt) {
			if (evt.getSource().getPressed()) {
				this.byId("tbColor").setPressed();
				this.byId("tbImage").setPressed();
				this.byId("tbOpacity").setPressed();
				this._oTableFilterState.aCharacteristic = [new Filter("parameter", FilterOperator.EQ, "Dimension")];
			} else {
				this._oTableFilterState.aCharacteristic = [];
			}
			this._applyFilterSearch();
		},

		onPressImage: function (evt) {
			if (evt.getSource().getPressed()) {
				this.byId("tbColor").setPressed();
				this.byId("tbDimension").setPressed();
				this.byId("tbOpacity").setPressed();
				this._oTableFilterState.aCharacteristic = [new Filter("parameter", FilterOperator.EQ, "Image")];
			} else {
				this._oTableFilterState.aCharacteristic = [];
			}
			this._applyFilterSearch();
		},

		onPressOpacity: function (evt) {
			if (evt.getSource().getPressed()) {
				this.byId("tbColor").setPressed();
				this.byId("tbDimension").setPressed();
				this.byId("tbImage").setPressed();
				this._oTableFilterState.aCharacteristic = [new Filter("parameter", FilterOperator.EQ, "Opacity")];
			} else {
				this._oTableFilterState.aCharacteristic = [];
			}
			this._applyFilterSearch();
		},

		//Sets the other theming ToggleButton to unpressed
		//Sets a new filter (theming)
		onPressExpert: function (evt) {
			if (evt.getSource().getPressed()) {
				this.byId("tbQuick").setPressed();
				this._oTableFilterState.aTheming = [new Filter("theming", FilterOperator.EQ, "Expert")];
			} else {
				this._oTableFilterState.aTheming = [];
			}
			this._applyFilterSearch();
		},

		onPressQuick: function (evt) {
			if (evt.getSource().getPressed()) {
				this.byId("tbExpert").setPressed();
				this._oTableFilterState.aTheming = [new Filter("theming", FilterOperator.EQ, "Quick")];
			} else {
				this._oTableFilterState.aTheming = [];
			}
			this._applyFilterSearch();
		},

		onPressLessParam: function (evt) {
			if (evt.getSource().getPressed()) {
				MessageBox.warning(this.getModel("i18n").getResourceBundle().getText("TextLessParamDeprecation"));
				this.byId("colTP").setVisible(true);
				this._oTableFilterState.aCPFilter = [];
			} else {
				this.byId("colTP").setVisible(false);
				this._oTableFilterState.aCPFilter = [
					new Filter("nameCP", FilterOperator.NE, "")
				];
			}
			this._applyFilterSearch();
		},

		//Event handler for the class information Button
		//Opens a QuickView with detailed information about the semantic parameter structure
		onPressInformation: function (oEvent) {
			var oButton = oEvent.getSource(),
				oView = this.getView();
			if (!this._pQuickView) {
				this._pQuickView = Fragment.load({
					id: oView.getId(),
					name: "sap.ui.demo.theming.view.QuickViewClass",
					controller: this
				}).then(function(oQuickView){
					oView.addDependent(oQuickView);
					return oQuickView;
				});
			}
			this._pQuickView.then(function(oQuickView){
				oQuickView.openBy(oButton);
			});
		},
		//Sets the app to busy, when selecting a new theme
		onAction: function (oEvt) {
			var oPanel = this.byId("page");
			oPanel.setBusy(true);

			// simulate delayed end of operation
			setTimeout(function () {
				oPanel.setBusy(false);
			}, 5000);
		},

		//Event handler for the ComboBox
		//Applies a new theme and sets the Text for the current theme

		onThemeChange: function (oEvent) {
			var theme = oEvent.getSource().getSelectedKey();
			var themeName = oEvent.getParameter("value");
			this.onAction();
			Theming.setTheme(theme);
			this.byId("title").setText(`Details for ''${themeName}''`);
			var isDeprecated = mThemes[theme].deprecated;
			if (isDeprecated) {
				this.byId("tbLessParam").setPressed();
				this.byId("tbLessParam").setEnabled(false);
				this.byId("colCP").setVisible(false);
				this.byId("colTP").setVisible(true);
				this._oTableFilterState.aCPFilter = [];
			} else {
				this.byId("tbLessParam").setEnabled(true);
				this.byId("colCP").setVisible(true);
				this.byId("colTP").setVisible(false);
				this._oTableFilterState.aCPFilter = [
					new Filter("cp", FilterOperator.EQ, true)
				];
			}
			this._applyFilterSearch();
		},
		// Event handler for pressing the copy to clipboard button
		// Copies the UI5 parameter to the clipboard
		onCopyCodeToClipboard: function (oEvt) {
			var sTheme = Theming.getTheme(),
				isDeprecated = mThemes[sTheme].deprecated,
				sString = oEvt.getSource().getParent().getCells()[isDeprecated ? 3 : 2].getText(),
				$temp = jQuery("<input>");
			if (!sString) {
				MessageToast.show("No UI5 Parameter to copy to clipboard");
				return;
			}
			try {
				jQuery("body").append($temp);
				$temp.val(sString).trigger("select");
				document.execCommand("copy");
				$temp.remove();
				MessageToast.show("UI5 Parameter " + sString + " copied to clipboard");
			} catch (oException) {
				MessageToast.show("UI5 Parameter " + sString + " not copied to clipboard");
			}
		},

		//Event handler for the Search Field
		onSearch: function (oEvt) {
			var sQuery = oEvt.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var sTheme = Theming.getTheme(),
					isDeprecated = mThemes[sTheme].deprecated;
				this._oTableFilterState.aFilter = [
					new Filter(isDeprecated ? "nameTP" : "nameCP", FilterOperator.Contains, sQuery)
					//new Filter("nameTP", FilterOperator.Contains, sQuery) // TODO: support filter of Custom Prop and Theme Param
				];
			} else {
				this._oTableFilterState.aFilter = [];
			}
			this._applyFilterSearch();
		},
		//Internal helper method to apply both filter and search state together on the list binding
		_applyFilterSearch: function () {
			var aFilters = this._oTableFilterState.aSearch.concat(
				this._oTableFilterState.aFilter, this._oTableFilterState.aCPFilter,
				this._oTableFilterState.aControlgroup, this._oTableFilterState.aCharacteristic,
				this._oTableFilterState.aTheming, this._oTableFilterState.aText
			);
			this._oTable.getBinding("items").filter(aFilters);
		},
		//Event handler for the class ToggleButton
		//Sorts the list ascending by class
		sortClass: function (oEvent) {
			var oTable = this.byId("table");
			var oTableItem = this.byId("oTableItem");
			if (oEvent.getSource().getPressed()) {
				var oClassSorter = new Sorter("class", false, function (oContext) {
					var sKey = oContext.getProperty("class");
					return {
						key: sKey,
						text: "Class: " + sKey
					};
				});
				oTable.bindAggregation("items", {
					path: "/Data",
					template: oTableItem,
					sorter: oClassSorter
				});
			} else {
				oTable.bindAggregation("items", {
					path: "/Data",
					template: oTableItem
				});
			}
			this._applyFilterSearch();
		}
	});
});