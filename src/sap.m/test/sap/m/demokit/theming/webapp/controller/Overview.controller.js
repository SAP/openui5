sap.ui.define([
	"sap/ui/demo/theming/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/Device",
	"sap/ui/demo/theming/model/formatter",
	"sap/m/MessageToast",
	"jquery.sap.global"
], function (BaseController, JSONModel,Filter, FilterOperator, Device, formatter, MessageToast, $) {
	"use strict";

	//var TYPING_DELAY = 200; // ms

	return BaseController.extend("sap.ui.demo.theming.controller.Overview", {

		formatter: formatter,
		/* =========================================================== */
		/* lifecycle methods										   */
		/* =========================================================== */

		/**
		 * Called when the overview controller is instantiated.
		 * @public
		 */
		onInit : function () {
			var oTable = this.byId("oTable");
			var oTableItem = this.byId("oTableItem");
			this._oTable = oTable;
			this._oPreviousQueryContext = {};
			this._oCurrentQueryContext = null;
			//Chooses the right fragment depending on the device which is used
			var sFragment;
			if (sap.ui.Device.system.desktop){
				sFragment = "sap.ui.demo.theming.view.Desktop";
			} else if (sap.ui.Device.system.phone){
				sFragment = "sap.ui.demo.theming.view.Phone";
			} else {
				sFragment = "sap.ui.demo.theming.view.Tablet";
			}
			this.byId("idPanel").addContent(sap.ui.xmlfragment(sFragment, this));

			//Keeps the filter and search state
			this._oTableFilterState = {
				aFilter : [],
				aSearch : [],
				aControlgroup : [],
				aTheming : [],
				aCharacteristic : [],
				aText : []
			};
			var oModel = new sap.ui.model.json.JSONModel();
			var oComboBoxModel = new sap.ui.model.json.JSONModel();

			//Contains the Data for the ComboBox
			var mData = {
					"items": [
						{
							"key": "1",
							"text": "Belize"
						},
						{
							"key": "2",
							"text": "Belize Plus"
						},
						{
							"key": "3",
							"text": "High Contrast White"
						},
						{
							"key": "4",
							"text": "High Contrast Black"
						},
						{
							"key": "5",
							"text": "Blue Crystal"
						}
					]};
			oComboBoxModel.setData(mData);
			this.getView().setModel(oComboBoxModel);
			var oValue = "Details for ''Belize''";
			this.byId("title").setText(oValue);

			sap.ui.getCore().setModel(oModel,"myModel");
			oModel.setSizeLimit(100000);

			oTable.setModel(oModel);
			oTable.bindAggregation("items", "/Data", oTableItem);

			var that = this;
			this.getParameterMetadata(function(oParameterMetadata) {
				var oData = that.createDataStructure(oParameterMetadata);
				oModel.setData(oData);
			});

			//Called when the user chooses a new theme in the ComboBox
			//Creates a new Data Structure for the table including the updated theme data
			sap.ui.getCore().attachThemeChanged(function(){
				this.getParameterMetadata(function(oParameterMetadata) {
					var oData = that.createDataStructure(oParameterMetadata);
					oModel.setData(oData);
				});
			},this);
		},
		getParameterMetadata : function(fnCallback) {
			jQuery.ajax("../../../../../../resources/sap/ui/core/themes/sap_belize/base.less",{
				success: function(data){
					jQuery.ajax("../../../../../../resources/sap/ui/core/themes/sap_belize/global.less",{
						success: function(namedata){
							var oFileThemeParameters = data.replace("\\",""),
							oFileBelize = namedata.replace("\\",""),
							aBelizeMapping = [],
							aThemeParameters = [];
							var aBelize, oThemeParameter, sElement, aProperties, oThemeParameter, aAllThemes, oBelize;
							var pattern = /[^[\]]+(?=])/gmi,
							patternAnf = /"(.*?)"/gmi,
							patternTheme = /[^\@]+(?=:)/gmi,
							patternThemeUi = /[^\@]+(?=:)/gmi,
							patternThemeNormal = /[^\@]+(?=;)/gmi,
							patternThemeNormalKomma = /[^\@]+(?=,)/gmi,
							patternThemeFull = /\[([^;]+)/gmi,
							patternWithAt = /\@(.*?)\;/gmi;

							aAllThemes = oFileThemeParameters.match(patternThemeFull);

							aAllThemes.forEach(function (element, index) {
								oFileThemeParameters.indexOf(element);
								oThemeParameter = {};

								sElement = JSON.stringify(element);

								aProperties = sElement.match(pattern);

								aProperties.forEach(function (element, index) {
									element = element.replace(/\\/g,"");
									if (element.indexOf("Label") > -1) {
										oThemeParameter.label = element.substring(element.indexOf('"') + 1, element.lastIndexOf('"'));
									} else if (element.indexOf("Description") > -1) {
										oThemeParameter.desc = element.substring(element.indexOf('"') + 1, element.lastIndexOf('"'));
									} else if (element.indexOf("TranslationKey") > -1) {
										oThemeParameter.trans = element.substring(element.indexOf('"') + 1, element.lastIndexOf('"'));
									} else if (element.indexOf("Tags") > -1) {
										oThemeParameter.tags = element.match(patternAnf);
									}
								});
								oThemeParameter.themeName = sElement.match(patternTheme)[0];
								aThemeParameters.push(oThemeParameter);
							});
							aBelize = oFileBelize.match(patternWithAt);
							aBelize.forEach(function (element, index) {
								oBelize = {};
								if (element.indexOf(",") > -1) {
									oBelize.themeNameUI = element.substring(0, element.indexOf(",") + 1).match(patternThemeNormalKomma)[0];
								} else if (element.indexOf(":", element.indexOf(":") + 1)) {
									oBelize.themeNameUI = element.match(patternThemeUi)[0];
								} else {
									oBelize.themeNameUI = element.match(patternThemeNormal)[0];
								}
								oBelize.themeName = element.match(patternThemeNormal)[0];
								aBelizeMapping.push(oBelize);
							});
							for (var i = 0; i < aThemeParameters.length; i++) {
								for (var j = 0; j < aBelizeMapping.length; j++) {
									if (aBelizeMapping[j].themeName === aThemeParameters[i].themeName) {
										aThemeParameters[i].themeNameUI = aBelizeMapping[j].themeNameUI;
										break;
									}
								}
							}
							fnCallback(aThemeParameters);
						}
						});}
			});
		},

		//Creates the Data Structure for the table
		createDataStructure : function(oParameterMetadata) {
			var oParams = sap.ui.core.theming.Parameters.get();

			var oData = {Data:[]};
			for (var sName in oParams) {
				theming = "";
				characteristic = "";
				controlgroup = "";
				text = "";
				for ( var i = 0; i < oParameterMetadata.length - 1 ; i++){
					var description;
					var controlgroup;
					var theming;
					var tags;
					var text;
					var characteristic;
					if (oParameterMetadata[i].themeNameUI === sName) {
						description = oParameterMetadata[i].desc;
						tags = oParameterMetadata[i].tags;
						theming = "";
						characteristic = "";
						controlgroup = "";
						text = "";
						if (tags) {
							if (tags.indexOf('"Color"') > -1 ) {
								characteristic = "Color";
							} if (tags.indexOf('"Dimension"') > -1){
								characteristic = "Dimension";
							} if (tags.indexOf('"Image"') > -1){
								characteristic = "Image";
							} if (tags.indexOf('"Opacity"') > -1){
								characteristic = "Opacity";
							} if (tags.indexOf('"Base"') > -1){
								theming = "Expert";
							} if (tags.indexOf('"Quick"') > -1){
								theming = "Quick";
							} if (tags.indexOf('"Button"') > -1){
								controlgroup = "Button";
							} if (tags.indexOf('"Chart"') > -1){
								controlgroup = "Chart";
							} if (tags.indexOf('"Content"') > -1){
								controlgroup = "Content";
							} if (tags.indexOf('"Field"') > -1){
								controlgroup = "Field";
							} if (tags.indexOf('"Group"') > -1){
								controlgroup = "Group";
							} if (tags.indexOf('"Link"') > -1){
								controlgroup = "Link";
							} if (tags.indexOf('"List"') > -1){
								controlgroup = "List";
							} if (tags.indexOf('"Page"') > -1){
								controlgroup = "Page";
							} if (tags.indexOf('"Scrollbar"') > -1){
								controlgroup = "Scrollbar";
							} if (tags.indexOf('"Shell"') > -1){
								controlgroup = "Shell";
							} if (tags.indexOf('"Tile"') > -1){
								controlgroup = "Tile";
							} if (tags.indexOf('"Toolbar"') > -1){
								controlgroup = "Toolbar";
							} if (tags.indexOf('"Font"') > -1){
								text = "Text";
							}
						}
					}
				}
				var oClass = this.getView().getModel('class').getData();
				if (jQuery.sap.startsWithIgnoreCase(sName, "sapui")) {
					var oEntry;
					if (sap.ui.core.CSSColor.isValid(oParams[sName])){
						oEntry = {name : sName,color : oParams[sName], colors:oParams[sName], 'class' : oClass[sName], controlgroup : controlgroup, theming :theming, parameter:characteristic, text : text, description : description};
						oData.Data.push(oEntry);
					} else {
						oEntry = {name : sName, color :oParams[sName], colors : undefined, 'class' : oClass[sName], controlgroup : controlgroup, theming :theming, parameter:characteristic, text : text, description : description};
						oData.Data.push(oEntry);
					}
				}
			}
			return oData;
		},
		//Sets the other Control Group ToggleButtons to unpressed
		//Sets a new filter (Control Group)

		onPressButton: function(evt){
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

		onPressChart: function(evt){
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

		onPressContent: function(evt){
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

		onPressField: function(evt){
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

		onPressGroup: function(evt){
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

		onPressLink: function(evt){
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

		onPressList: function(evt){
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

		onPressPage: function(evt){
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

		onPressScrollbar: function(evt){
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

		onPressShell: function(evt){
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

		onPressTile: function(evt){
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

		onPressToolbar: function(evt){
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
		onPressText: function(evt){
			if (evt.getSource().getPressed()) {
				this._oTableFilterState.aText = [new Filter("text", FilterOperator.EQ, "Text")];
			} else {
				this._oTableFilterState.aText = [];
			}
			this._applyFilterSearch();
		},

		//Sets the other parameter ToggleButtons to unpressed
		//Sets a new filter (parameter)
		onPressColor: function(evt){
			if (evt.getSource().getPressed()) {
				sap.ui.getCore().byId("tbDimension").setPressed();
				sap.ui.getCore().byId("tbImage").setPressed();
				sap.ui.getCore().byId("tbOpacity").setPressed();
				this._oTableFilterState.aCharacteristic = [new Filter("parameter", FilterOperator.EQ, "Color")];
			} else {
				this._oTableFilterState.aCharacteristic = [];
			}
			this._applyFilterSearch();
		},
		onPressDimension: function(evt){
			if (evt.getSource().getPressed()) {
				sap.ui.getCore().byId("tbColor").setPressed();
				sap.ui.getCore().byId("tbImage").setPressed();
				sap.ui.getCore().byId("tbOpacity").setPressed();
				this._oTableFilterState.aCharacteristic = [new Filter("parameter", FilterOperator.EQ, "Dimension")];
			} else {
				this._oTableFilterState.aCharacteristic = [];
			}
			this._applyFilterSearch();
		},

		onPressImage: function(evt){
			if (evt.getSource().getPressed()) {
				sap.ui.getCore().byId("tbColor").setPressed();
				sap.ui.getCore().byId("tbDimension").setPressed();
				sap.ui.getCore().byId("tbOpacity").setPressed();
				this._oTableFilterState.aCharacteristic = [new Filter("parameter", FilterOperator.EQ, "Image")];
			} else {
				this._oTableFilterState.aCharacteristic = [];
			}
			this._applyFilterSearch();
		},

		onPressOpacity: function(evt){
			if (evt.getSource().getPressed()) {
				sap.ui.getCore().byId("tbColor").setPressed();
				sap.ui.getCore().byId("tbDimension").setPressed();
				sap.ui.getCore().byId("tbImage").setPressed();
				this._oTableFilterState.aCharacteristic = [new Filter("parameter", FilterOperator.EQ, "Opacity")];
			} else {
				this._oTableFilterState.aCharacteristic = [];
			}
			this._applyFilterSearch();
		},

		//Sets the other theming ToggleButton to unpressed
		//Sets a new filter (theming)
		onPressExpert: function(evt){
			if (evt.getSource().getPressed()) {
				sap.ui.getCore().byId("tbQuick").setPressed();
				this._oTableFilterState.aTheming = [new Filter("theming", FilterOperator.EQ, "Expert")];
			} else {
				this._oTableFilterState.aTheming = [];
			}
			this._applyFilterSearch();
		},

		onPressQuick: function(evt){
			if (evt.getSource().getPressed()) {
				sap.ui.getCore().byId("tbExpert").setPressed();
				this._oTableFilterState.aTheming = [new Filter("theming", FilterOperator.EQ, "Quick")];
			} else {
				this._oTableFilterState.aTheming = [];
			}
			this._applyFilterSearch();
		},
		//Event handler for the class information Button
		//Opens a QuickView with detailed information about the semantic parameter structure
		openQuickView: function (oEvent, oModel) {
			this.createPopover();
			this._oQuickView.setModel(oModel);

		//Delay because addDependent will do a async rerendering and the actionSheet will immediately close without it
			var oButton = oEvent.getSource();
			jQuery.sap.delayedCall(0, this, function () {
				this._oQuickView.openBy(oButton);
			});
		},
		onPressInformation: function (oEvent) {
			this.openQuickView(oEvent);
		},
		createPopover: function() {
			if (!this._oQuickView) {
				this._oQuickView = sap.ui.xmlfragment("sap.ui.demo.theming.view.QuickViewClass", this);
				this.getView().addDependent(this._oQuickView);
			}
		},

		//Sets the app to busy, when selecting a new theme
		onAction : function (oEvt) {
			var oPanel = this.byId("page");
			oPanel.setBusy(true);

			// simulate delayed end of operation
			jQuery.sap.delayedCall(5000, this, function () {
				oPanel.setBusy(false);
			});
		},

		//Event handler for the ComboBox
		//Applies a new theme and sets the Text for the current theme

		onThemeChange: function(oEvent) {
			var that = this;
			var value = oEvent.getParameter("value");
			switch (value) {
			case "Belize":
			default:
				that.onAction();
				sap.ui.getCore().applyTheme("sap_belize");
				this.byId("title").setText("Details for ''Belize''");
				break;
			case "Blue Crystal":
				that.onAction();
				sap.ui.getCore().applyTheme("sap_bluecrystal");
				this.byId("title").setText("Details for ''Blue Crystal''");
				break;
			case "High Contrast White":
				that.onAction();
				sap.ui.getCore().applyTheme("sap_belize_hcw");
				this.byId("title").setText("Details for ''High Contrast White''");
				break;
			case "Belize Plus":
				that.onAction();
				sap.ui.getCore().applyTheme("sap_belize_plus");
				this.byId("title").setText("Details for ''Belize Plus''");
				break;
			case "High Contrast Black":
				that.onAction();
				sap.ui.getCore().applyTheme("sap_belize_hcb");
				this.byId("title").setText("Details for ''High Contrast Black''");
				break;
			}
		},
		// Event handler for pressing the copy to clipboard button
		// Copies the UI5 parameter to the clipboard
		onCopyCodeToClipboard: function (oEvt) {
			var sString = oEvt.getSource().getParent().getCells()[2].getText(),
				$temp = $("<input>");
			try {
				$("body").append($temp);
				$temp.val(sString).select();
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
				this._oTableFilterState.aSearch = [new Filter("name", FilterOperator.Contains, sQuery)];
			} else {
				this._oTableFilterState.aSearch = [];
			}
			this._applyFilterSearch();
		},
		//Internal helper method to apply both filter and search state together on the list binding
		_applyFilterSearch : function () {
			var aFilters = this._oTableFilterState.aSearch.concat(this._oTableFilterState.aFilter,this._oTableFilterState.aControlgroup,this._oTableFilterState.aCharacteristic, this._oTableFilterState.aTheming,this._oTableFilterState.aText);
			this._oTable.getBinding("items").filter(aFilters);
		},
		//Event handler for the class ToggleButton
		//Sorts the list ascending by class
		sortClass : function(oEvent)  {
			var oTable = this.byId("oTable");
			var oTableItem = this.byId("oTableItem");
			if (oEvent.getSource().getPressed()) {
				var oClassSorter = new sap.ui.model.Sorter("class", false, function(oContext){
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