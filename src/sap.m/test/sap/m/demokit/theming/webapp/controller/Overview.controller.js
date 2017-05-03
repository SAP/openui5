sap.ui.define([
	"sap/ui/demo/theming/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/Device",
	"sap/ui/demo/theming/model/formatter",
	"sap/m/MessageToast"
], function (BaseController, JSONModel,Filter, FilterOperator, Device, formatter, MessageToast) {
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
			this.getView().byId("idPanel").addContent(sap.ui.xmlfragment(sFragment, this));

			//Keeps the filter and search state
			this._oTableFilterState = {
				aFilter : [],
				aSearch : [],
				aControlgroup : [],
				aTheming : [],
				aCharacteristic : []
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

			var oData = this.createDataStructure();
			oModel.setData(oData);

			//Called when the user chooses a new theme in the ComboBox
			//Creates a new Data Structure for the table including the updated theme data
			sap.ui.getCore().attachThemeChanged(function(){
				var oData = this.createDataStructure();
				oModel.setData(oData);
			},this);

		},
		//Creates the Data Structure for the table
		createDataStructure : function() {
			var oParams = sap.ui.core.theming.Parameters.get();
			var aBuffer = [];
			var oData = {Data:[]};
			var sDummyKey = "####";
			function appendColor(sName, sKey, sColor, aBuffer) {
				if (sap.ui.core.CSSColor.isValid(sColor) ||   sKey != sDummyKey ) {
					aBuffer.push("<span title='", sName, " : ", sColor, "' style='width: 100px; background-color:", sColor, ";'>-</span>");
					aBuffer.push("<span title='", sName, " : ", sColor, "' style='border-color:", sColor, ";'>", sName, " : ", sColor, "</span><br>");
				}
			}

			for (var sName in oParams) {
				var sClass,
					sTheming,
					sControlGroup,
					sParameter1,
					sParameter2,
					sParameter3,
					sProtected,
					sParameter;

				switch (sName) {
				//Class 1
				case "sapUiSelected":
					sClass = "1";
					sTheming = "Base";
					sParameter = "Color";
					break;
				case "sapUiActive":
					sClass = "1";
					sTheming = "Base";
					sParameter = "Color";
					break;
				case "sapUiHighlightTextColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Content";
					sParameter = "Color";
					sParameter1 = "Font";
					break;
				case "sapUiTextTitle":
					sClass = "1";
					sTheming = "Base";
					sParameter = "Color";
					sParameter1 = "Font";
					break;
				case "sapUiContentIconColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Content";
					sParameter = "Color";
					break;
				case "sapUiContentContrastIconColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Content";
					sParameter = "Color";
					break;
				case "sapUiContentNonInteractiveIconColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Content";
					sParameter = "Color";
					break;
				case "sapUiContentFocusColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Content";
					sParameter = "Color";
					break;
				case "sapUiContentContrastFocusColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Content";
					sParameter = "Color";
					break;
				case "sapUiContentShadowColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Content";
					sParameter = "Color";
					break;
				case "sapUiContentContrastShadowColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Content";
					sParameter = "Color";
					break;
				case "sapUiContentSearchHighlightColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Content";
					sParameter = "Color";
					break;
				case "sapUiContentHelpColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Content";
					sParameter = "Color";
					break;
				case "sapUiContentLabelColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Content";
					sParameter = "Color";
					sParameter1 = "Font";
					break;
				case "sapUiContentDisabledTextColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Content";
					sParameter = "Color";
					sParameter1 = "Font";
					break;
				case "sapUiContentDisabledOpacity":
					sClass = "1";
					break;
				case "sapUiContentContrastTextThreshold":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Content";
					sParameter1 = "Font";
					break;
				case "sapUiContentContrastTextColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Content";
					sParameter = "Color";
					sParameter1 = "Font";
					break;
				case "sapUiContentForegroundColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Content";
					sParameter = "Color";
					break;
				case "sapUiContentForegroundBorderColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Content";
					sParameter = "Color";
					break;
				case "sapUiContentForegroundTextColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Content";
					sParameter = "Color";
					sParameter1 = "Font";
					break;
				case "sapUiShellBackgroundGradient":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Shell";
					sProtected = "Protected";
					break;
				case "sapUiShellBackground":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Shell";
					sParameter = "Color";
					break;
				case "sapUiShellBorderColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Shell";
					sParameter = "Color";
					break;
				case "sapUiShellTextColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Shell";
					sParameter = "Color";
					sParameter1 = "Font";
					break;
				case "sapUiButtonBackground":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Button";
					sParameter = "Color";
					break;
				case "sapUiButtonBorderColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Button";
					sParameter = "Color";
					break;
				case "sapUiButtonTextColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Button";
					sParameter = "Color";
					sParameter1 = "Font";
					break;
				case "sapUiButtonHoverBackground":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Button";
					sParameter = "Color";
					break;
				case "sapUiButtonHoverBorderColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Button";
					sParameter = "Color";
					break;
				case "sapUiButtonHoverTextColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Button";
					sParameter = "Color";
					sParameter1 = "Font";
					break;
				case "sapUiButtonEmphasizedBackground":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Button";
					sParameter = "Color";
					break;
				case "sapUiButtonEmphasizedBorderColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Button";
					sParameter = "Color";
					break;
				case "sapUiButtonEmphasizedTextColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Button";
					sParameter = "Color";
					sParameter1 = "Font";
					break;
				case "sapUiButtonRejectBackground":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Button";
					sParameter = "Color";
					break;
				case "sapUiButtonAcceptBackground":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Button";
					sParameter = "Color";
					break;
				case "sapUiFieldBackground":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Field";
					sParameter = "Color";
					break;
				case "sapUiFieldBorderColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Field";
					sParameter = "Color";
					break;
				case "sapUiFieldHelpBackground":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Field";
					sParameter = "Color";
					break;
				case "sapUiFieldHoverBackground":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Field";
					sParameter = "Color";
					break;
				case "sapUiFieldHoverBorderColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Field";
					sParameter = "Color";
					break;
				case "sapUiFieldHoverHelpBackground":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Field";
					sParameter = "Color";
					break;
				case "sapUiFieldFocusBackground":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Field";
					sParameter = "Color";
					break;
				case "sapUiFieldFocusBorderColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Field";
					sParameter = "Color";
					break;
				case "sapUiFieldFocusHelpBackground":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Field";
					sParameter = "Color";
					break;
				case "sapUiFieldReadOnlyBackground":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Field";
					sParameter = "Color";
					break;
				case "sapUiFieldReadOnlyBorderColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Field";
					sParameter = "Color";
					break;
				case "sapUiFieldReadOnlyHelpBackground":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Field";
					sParameter = "Color";
					break;
				case "sapUiFieldRequiredColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Field";
					sParameter = "Color";
					break;
				case "sapUiFieldInvalidColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Field";
					sParameter = "Color";
					break;
				case "sapUiFieldInvalidBackground":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Field";
					sParameter = "Color";
					break;
				case "sapUiFieldWarningColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Field";
					sParameter = "Color";
					break;
				case "sapUiFieldWarningBackground":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Field";
					sParameter = "Color";
					break;
				case "sapUiFieldSuccessColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Field";
					sParameter = "Color";
					break;
				case "sapUiFieldSuccessBackground":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Field";
					sParameter = "Color";
					break;
				case "sapUiGroupTitleBorderColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Group";
					sParameter = "Color";
					break;
				case "sapUiGroupTitleTextColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Group";
					sParameter = "Color";
					sParameter1 = "Font";
					break;
				case "sapUiGroupContentBackground":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Group";
					sParameter = "Color";
					break;
				case "sapUiGroupContentBorderColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Group";
					sParameter = "Color";
					break;
				case "sapUiGroupFooterBackground":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Group";
					sParameter = "Color";
					sProtected = "Protected";
					break;
				case "sapUiToolbarBackground":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Toolbar";
					sParameter = "Color";
					break;
				case "sapUiToolbarSeparatorColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Toolbar";
					sParameter = "Color";
					break;
				case "sapUiListHeaderBackground":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "List";
					sParameter = "Color";
					break;
				case "sapUiListHeaderBorderColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "List";
					sParameter = "Color";
					break;
				case "sapUiListHeaderTextColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "List";
					sParameter = "Color";
					sParameter1 = "Font";
					break;
				case "sapUiListBorderColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "List";
					sParameter = "Color";
					break;
				case "sapUiListHighlightColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "List";
					sParameter = "Color";
					break;
				case "sapUiListSelectionBackgroundColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "List";
					sParameter = "Color";
					break;
				case "sapUiListBackground":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "List";
					sParameter = "Color";
					break;
				case "sapUiListHoverBackground":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "List";
					sParameter = "Color";
					break;
				case "sapUiScrollBarFaceColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "ScrollBar";
					sParameter = "Color";
					break;
				case "sapUiScrollBarTrackColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "ScrollBar";
					sParameter = "Color";
					break;
				case "sapUiScrollBarBorderColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "ScrollBar";
					sParameter = "Color";
					break;
				case "sapUiScrollBarSymbolColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "ScrollBar";
					sParameter = "Color";
					break;
				case "sapUiScrollBarHoverFaceColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "ScrollBar";
					sParameter = "Color";
					break;
				case "sapUiPageHeaderBackground":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Page";
					sParameter = "Color";
					break;
				case "sapUiPageHeaderBorderColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Page";
					sParameter = "Color";
					break;
				case "sapUiPageHeaderTextColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Page";
					sParameter = "Color";
					sParameter1 = "Font";
					break;
				case "sapUiPageFooterBackground":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Page";
					sParameter = "Color";
					break;
				case "sapUiPageFooterTextColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Page";
					sParameter = "Color";
					sParameter1 = "Font";
					break;
				case "sapUiInfobarBackground":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Page";
					sParameter = "Color";
					break;
				case "sapUiObjectHeaderBackground":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Page";
					sParameter = "Color";
					break;
				case "sapUiBlockLayerBackground":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Page";
					sParameter = "Color";
					break;
				case "sapUiTileBackground":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Tile";
					sParameter = "Color";
					break;
				case "sapUiTileBorderColor":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Tile";
					sParameter = "Color";
					break;
				case "sapUiChart1":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Chart";
					sParameter = "Color";
					break;
				case "sapUiChart2":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Chart";
					sParameter = "Color";
					break;
				case "sapUiChart3":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Chart";
					sParameter = "Color";
					break;
				case "sapUiChart4":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Chart";
					sParameter = "Color";
					break;
				case "sapUiChart5":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Chart";
					sParameter = "Color";
					break;
				case "sapUiChart6":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Chart";
					sParameter = "Color";
					break;
				case "sapUiChart7":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Chart";
					sParameter = "Color";
					break;
				case "sapUiChart8":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Chart";
					sParameter = "Color";
					break;
				case "sapUiChart9":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Chart";
					sParameter = "Color";
					break;
				case "sapUiChart10":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Chart";
					sParameter = "Color";
					break;
				case "sapUiChart11":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Chart";
					sParameter = "Color";
					break;
				case "sapUiChartBad":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Chart";
					sParameter = "Color";
					break;
				case "sapUiChartCritical":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Chart";
					sParameter = "Color";
					break;
				case "sapUiChartGood":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Chart";
					sParameter = "Color";
					break;
				case "sapUiChartNeutral":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Chart";
					sParameter = "Color";
					break;
				case "sapUiChartSequence1":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Chart";
					sParameter = "Color";
					break;
				case "sapUiChartSequence2":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Chart";
					sParameter = "Color";
					break;
				case "sapUiChartSequence3":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Chart";
					sParameter = "Color";
					break;
				case "sapUiChartSequenceNeutral":
					sClass = "1";
					sTheming = "Base";
					sControlGroup = "Chart";
					sParameter = "Color";
					break;
				case "sapUiErrorBG":
					sClass = "1";
					break;
				case "sapUiWarningBG":
					sClass = "1";
					break;
				case "sapUiSuccessBG":
					sClass = "1";
					break;
				case "sapUiNeutralBG":
					sClass = "1";
					break;
				case "sapUiErrorBorder":
					sClass = "1";
					break;
				case "sapUiWarningBorder":
					sClass = "1";
					break;
				case "sapUiSuccessBorder":
					sClass = "1";
					break;
				case "sapUiNeutralBorder":
					sClass = "1";
					break;
				case "sapUiNegativeElement":
					sClass = "1";
					break;
				case "sapUiCriticalElement":
					sClass = "1";
					break;
				case "sapUiPositiveElement":
					sClass = "1";
					break;
				case "sapUiNeutralElement":
					sClass = "1";
					break;
				case "sapUiNegativeText":
					sClass = "1";
					break;
				case "sapUiCriticalText":
					sClass = "1";
					break;
				case "sapUiPositiveText":
					sClass = "1";
					break;
					//Class 2
				case "sapUiChartLabelHoverColor":
					sClass = "2";
					break;
				case "sapUiChartLabelPressedColor":
					sClass = "2";
					break;
				case "sapUiChartCategoryAxisLabelFontColor":
					sClass = "2";
					break;
				case "sapUiChartValueAxisLabelFontColor":
					sClass = "2";
					break;
				case "sapUiChartCategoryAxisLabelFontSize":
					sClass = "2";
					break;
				case "sapUiChartValueAxisLabelFontSize":
					sClass = "2";
					break;
				case "sapUiChartCategoryAxisLineColor":
					sClass = "2";
					break;
				case "sapUiChartValueAxisLineColor":
					sClass = "2";
					break;
				case "sapUiChartCategoryAxisTickColor":
					sClass = "2";
					break;
				case "sapUiChartValueAxisTickColor":
					sClass = "2";
					break;
				case "sapUiChartBackgroundColor":
					sClass = "2";
					break;
				case "sapUiChartLabelFontWeight":
					sClass = "2";
					break;
				case "sapUiChartLegendLabelFontColor":
					sClass = "2";
					break;
				case "sapUiChartLegendTitleFontColor":
					sClass = "2";
					break;
				case "sapUiChartLegendTitleFontSize":
					sClass = "2";
					break;
				case "sapUiChartLegendLabelFontSize":
					sClass = "2";
					break;
				case "sapUiChartPaletteUndefinedColor":
					sClass = "2";
					break;
				case "sapUiChartGridlineColor":
					sClass = "2";
					break;
				case "sapUiChartReferenceLineColor":
					sClass = "2";
					break;
				case "sapUiChartDataLabelFontColor":
					sClass = "2";
					break;
				case "sapUiChartReferenceLineLabelColor":
					sClass = "2";
					break;
				case "sapUiChartDataLabelFontSize":
					sClass = "2";
					break;
				case "sapUiChartPopoverDataItemFontColor":
					sClass = "2";
					break;
				case "sapUiChartPopoverGroupFontColor":
					sClass = "2";
					break;
				case "sapUiChartPopoverDataItemFontSize":
					sClass = "2";
					break;
				case "sapUiChartPopoverGroupFontSize":
					sClass = "2";
					break;
				case "sapUiChartPopoverGroupFontWeight":
					sClass = "2";
					break;
				case "sapUiChartScrollBarThumbColor":
					sClass = "2";
					break;
				case "sapUiChartScrollBarTrackColor":
					sClass = "2";
					break;
				case "sapUiChartScrollBarThumbHoverColor":
					sClass = "2";
					break;
				case "sapUiChartMainTitleFontColor":
					sClass = "2";
					break;
				case "sapUiChartAxisTitleFontColor":
					sClass = "2";
					break;
				case "sapUiChartMainTitleFontSize":
					sClass = "2";
					break;
				case "sapUiChartAxisTitleFontSize":
					sClass = "2";
					break;
				case "sapUiChartTitleFontWeight":
					sClass = "2";
					break;
				case "sapUiChartLightText":
					sClass = "2";
					break;
				case "sapUiChartZeroAxisColor":
					sClass = "2";
					break;
				case "sapUiChartDataPointBorderColor":
					sClass = "2";
					break;
				case "sapUiChartDataPointBorderHoverSelectedColor":
					sClass = "2";
					break;
				case "sapUiChartDataPointNotSelectedBackgroundOpacity":
					sClass = "2";
					break;
				case "sapUiChartValueAxisLineOpacity":
					sClass = "2";
					break;
				case "sapUiChartCategoryAxisLabelFontHoverColor":
					sClass = "2";
					break;
				case "sapUiChartCategoryAxisLabelFontPressedColor":
					sClass = "2";
					break;
				case "sapUiChartTargetColor":
					sClass = "2";
					break;
				case "sapUiChartTargetShadowColor":
					sClass = "2";
					break;
				case "sapUiChartBubbleBGOpacity":
					sClass = "2";
					break;
				case "sapUiChartScrollbarBorderColor":
					sClass = "2";
					break;
				case "sapUiChartScrollbarBorderSize":
					sClass = "2";
					break;
				case "sapUiChartScrollbarThumbPadding":
					sClass = "2";
					break;
				case "sapUiChartNegativeLargeText":
					sClass = "2";
					break;
				case "sapUiChartCriticalLargeText":
					sClass = "2";
					break;
				case "sapUiChartPositiveLargeText":
					sClass = "Class: 2";
					break;
				case "sapUiChartNeutralLargeText":
					sClass = "2";
					break;
				case "sapUiChartDataPointBG":
					sClass = "2";
					break;
				case "sapUiChartDataPointBGBorderColor":
					sClass = "2";
					break;
				case "sapUiChartDataLineColorWithBG":
					sClass = "2";
					break;
				case "sapUiChartDataLineColor":
					sClass = "2";
					break;
				case "sapUiChartRadialRemainingCircle":
					sClass = "2";
					break;
				case "sapUiChartRadialRemainingCircleBorderColor":
					sClass = "2";
					break;
				case "sapUiChartRadialBG":
					sClass = "2";
					break;
				case "sapUiChartPaletteQualitativeHue1":
					sClass = "2";
					break;
				case "sapUiChartPaletteQualitativeHue2":
					sClass = "2";
					break;
				case "sapUiChartPaletteQualitativeHue3":
					sClass = "2";
					break;
				case "sapUiChartPaletteQualitativeHue4":
					sClass = "2";
					break;
				case "sapUiChartPaletteQualitativeHue5":
					sClass = "2";
					break;
				case "sapUiChartPaletteQualitativeHue6":
					sClass = "2";
					break;
				case "sapUiChartPaletteQualitativeHue7":
					sClass = "2";
					break;
				case "sapUiChartPaletteQualitativeHue8":
					sClass = "2";
					break;
				case "sapUiChartPaletteQualitativeHue9":
					sClass = "2";
					break;
				case "sapUiChartPaletteQualitativeHue10":
					sClass = "2";
					break;
				case "sapUiChartPaletteQualitativeHue11":
					sClass = "2";
					break;
				case "sapUiChartPaletteSemanticBadLight1":
					sClass = "2";
					break;
				case "sapUiChartPaletteSemanticBadLight2":
					sClass = "2";
					break;
				case "sapUiChartPaletteSemanticBadLight3":
					sClass = "2";
					break;
				case "sapUiChartPaletteSemanticBad":
					sClass = "2";
					break;
				case "sapUiChartPaletteSemanticBadDark1":
					sClass = "2";
					break;
				case "sapUiChartPaletteSemanticBadDark2":
					sClass = "2";
					break;
				case "sapUiChartPaletteSemanticCriticalLight1":
					sClass = "2";
					break;
				case "sapUiChartPaletteSemanticCriticalLight2":
					sClass = "2";
					break;
				case "sapUiChartPaletteSemanticCriticalLight3":
					sClass = "2";
					break;
				case "sapUiChartPaletteSemanticCritical":
					sClass = "2";
					break;
				case "sapUiChartPaletteSemanticCriticalDark1":
					sClass = "2";
					break;
				case "sapUiChartPaletteSemanticCriticalDark2":
					sClass = "2";
					break;
				case "sapUiChartPaletteSemanticGoodLight1":
					sClass = "2";
					break;
				case "sapUiChartPaletteSemanticGoodLight2":
					sClass = "2";
					break;
				case "sapUiChartPaletteSemanticGoodLight3":
					sClass = "2";
					break;
				case "sapUiChartPaletteSemanticGood":
					sClass = "2";
					break;
				case "sapUiChartPaletteSemanticGoodDark1":
					sClass = "2";
					break;
				case "sapUiChartPaletteSemanticGoodDark2":
					sClass = "2";
					break;
				case "sapUiChartPaletteSemanticNeutralLight1":
					sClass = "2";
					break;
				case "sapUiChartPaletteSemanticNeutralLight2":
					sClass = "2";
					break;
				case "sapUiChartPaletteSemanticNeutralLight3":
					sClass = "2";
					break;
				case "sapUiChartPaletteSemanticNeutral":
					sClass = "2";
					break;
				case "sapUiChartPaletteSemanticNeutralDark1":
					sClass = "2";
					break;
				case "sapUiChartPaletteSemanticNeutralDark2":
					sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue1Light1":
					sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue1Light2":
					sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue1Light3":
					sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue1":
					sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue1Dark1":
					sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue1Dark2":
					sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue2Light1":
					sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue2Light2":
					sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue2Light3":
					sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue2":
					sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue2Dark1":
					sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue2Dark2":
					sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue3Light1":
					sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue3Light2":
					sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue3Light3":
					sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue3":
					sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue3Dark1":
					sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue3Dark2":
					sClass = "2";
					break;
				case "sapUiChartPaletteSequentialNeutralLight1":
					sClass = "2";
					break;
				case "sapUiChartPaletteSequentialNeutralLight2":
					sClass = "2";
					break;
				case "sapUiChartPaletteSequentialNeutralLight3":
					sClass = "2";
					break;
				case "sapUiChartPaletteSequentialNeutral":
					sClass = "2";
					break;
				case "sapUiChartPaletteSequentialNeutralDark1":
					sClass = "2";
					break;
				case "sapUiChartPaletteSequentialNeutralDark2":
					sClass = "2";
					break;
				case "sapUiChoroplethBG":
					sClass = "2";
					break;
				case "sapUiChoroplethRegionBorder":
					sClass = "2";
					break;
				case "sapUiChoroplethRegionBG":
					sClass = "2";
					break;
				case "sapUiMapLegendBG":
					sClass = "2";
					break;
				case "sapUiMapLegendBorderColor":
					sClass = "2";
					break;
				case "sapUiShellHoverBackground":
					sClass = "2";
					break;
				case "sapUiShellActiveBackground":
					sClass = "2";
					sTheming = "Quick";
					sParameter = "Color";
					sProtected = "Protected";
					break;
				case "sapUiShellActiveTextColor":
					sClass = "2";
					break;
				case "sapUiShellHoverToggleBackground":
					sClass = "2";
					break;
				case "sapUiUx3ShellHeaderColor":
					sClass = "2";
					break;
				case "sapUiUx3ShellBackgroundColor":
					sClass = "2";
					break;
				case "sapUiUx3ShellHoverColor":
					sClass = "2";
					break;
				case "sapUiUx3ShellGradientBottom":
					sClass = "2";
					break;
				case "sapUiUx3ShellGradientTop":
					sClass = "2";
					break;
				case "sapUiUx3ShellToolPaletteIconFontColor":
					sClass = "2";
					break;
				case "sapUiUx3ExactLstExpandOffset":
					sClass = "2";
					break;
				case "sapUiUx3ExactLstRootExpandOffset":
					sClass = "2";
					break;
				case "sapUiUx3ExactLstContentTop":
					sClass = "2";
					break;
				case "sapUiLinkActive":
					sClass = "2";
					break;
				case "sapUiLinkVisited":
					sClass = "2";
					break;
				case "sapUiLinkHover":
					sClass = "2";
					break;
				case "sapUiLinkInverted":
					sClass = "2";
					break;
				case "sapUiNotificationBarBG":
					sClass = "2";
					break;
				case "sapUiNotifierSeparator":
					sClass = "2";
					break;
				case "sapUiNotifierSeparatorWidth":
					sClass = "2";
					break;
				case "sapUiUx3ToolPopupInverted":
					sClass = "2";
					break;
				case "sapUiUx3ToolPopupArrowRightMarginCorrection":
					sClass = "2";
					break;
				case "sapUiUx3ToolPopupShadow":
					sClass = "2";
					break;
				case "sapUiCalloutShadow":
					sClass = "2";
					break;
				case "sapUiButtonIconColor":
					sClass = "2";
					break;
				case "sapUiButtonActiveBackground":
					sClass = "2";
					break;
				case "sapUiButtonActiveBorderColor":
					sClass = "2";
					break;
				case "sapUiButtonActiveTextColor":
					sClass = "2";
					break;
				case "sapUiButtonEmphasizedHoverBackground":
					sClass = "2";
					break;
				case "sapUiButtonEmphasizedHoverBorderColor":
					sClass = "2";
					break;
				case "sapUiButtonEmphasizedActiveBackground":
					sClass = "2";
					break;
				case "sapUiButtonEmphasizedActiveBorderColor":
					sClass = "2";
					break;
				case "sapUiButtonEmphasizedTextShadow":
					sClass = "2";
					break;
				/*case "sapUiContentContrastTextThreshold":
					sClass = "2";
					break;*/
				case "sapUiButtonAcceptBorderColor":
					sClass = "2";
					break;
				case "sapUiButtonAcceptHoverBackground":
					sClass = "2";
					break;
				case "sapUiButtonAcceptHoverBorderColor":
					sClass = "2";
					break;
				case "sapUiButtonAcceptActiveBackground":
					sClass = "2";
					break;
				case "sapUiButtonAcceptActiveBorderColor":
					sClass = "2";
					break;
				case "sapUiButtonAcceptTextColor":
					sClass = "2";
					break;
				case "sapUiButtonRejectBorderColor":
					sClass = "2";
					break;
				case "sapUiButtonRejectHoverBackground":
					sClass = "2";
					break;
				case "sapUiButtonRejectHoverBorderColor":
					sClass = "2";
					break;
				case "sapUiButtonRejectActiveBackground":
					sClass = "2";
					break;
				case "sapUiButtonRejectActiveBorderColor":
					sClass = "2";
					break;
				case "sapUiButtonRejectTextColor":
					sClass = "2";
					break;
				case "sapUiButtonLiteBackground":
					sClass = "2";
					break;
				case "sapUiButtonLiteBorderColor":
					sClass = "2";
					break;
				case "sapUiButtonLiteTextColor":
					sClass = "2";
					break;
				case "sapUiButtonLiteHoverBackground":
					sClass = "2";
					break;
				case "sapUiButtonLiteHoverBorderColor":
					sClass = "2";
					break;
				case "sapUiButtonLiteActiveBackground":
					sClass = "2";
					break;
				case "sapUiButtonLiteActiveBorderColor":
					sClass = "2";
					break;
				case "sapUiButtonHeaderTextColor":
					sClass = "2";
					break;
				case "sapUiButtonHeaderDisabledTextColor":
					sClass = "2";
					break;
				case "sapUiButtonFooterTextColor":
					sClass = "2";
					break;
				case "sapUiButtonFooterHoverBackground":
					sClass = "2";
					break;
				case "sapUiButtonActionSelectBackground":
					sClass = "2";
					break;
				case "sapUiButtonActionSelectBorderColor":
					sClass = "2";
					break;
				case "sapUiButtonLiteActionSelectHoverBackground":
					sClass = "2";
					break;
				case "sapUiToggleButtonPressedBackground":
					sClass = "2";
					break;
				case "sapUiToggleButtonPressedBorderColor":
					sClass = "2";
					break;
				case "sapUiToggleButtonPressedTextColor":
					sClass = "2";
					break;
				/*case "sapUiContentContrastTextThreshold":
					sClass = "2";
					break;*/
				case "sapUiToggleButtonPressedHoverBackground":
					sClass = "2";
					break;
				case "sapUiToggleButtonPressedHoverBorderColor":
					sClass = "2";
					break;
				case "sapUiToggleButtonPressedDisabledBackground":
					sClass = "2";
					break;
				case "sapUiToggleButtonPressedDisabledBorderColor":
					sClass = "2";
					break;
				case "sapUiToggleButtonPressedDisabledTextColor":
					sClass = "2";
					break;
				case "sapUiSegmentedButtonBackground":
					sClass = "2";
					break;
				case "sapUiSegmentedButtonBorderColor":
					sClass = "2";
					break;
				case "sapUiSegmentedButtonTextColor":
					sClass = "2";
					break;
				case "sapUiSegmentedButtonHoverBackground":
					sClass = "2";
					break;
				case "sapUiSegmentedButtonActiveBackground":
					sClass = "2";
					break;
				case "sapUiSegmentedButtonActiveTextColor":
					sClass = "2";
					break;
				/*case "sapUiContentContrastTextThreshold":
					sClass = "2";
					break;*/
				case "sapUiSegmentedButtonSelectedBackground":
					sClass = "2";
					break;
				case "sapUiSegmentedButtonSelectedTextColor":
					sClass = "2";
					break;
				/*case "sapUiContentContrastTextThreshold":
					sClass = "2";
					break;*/
				case "sapUiSegmentedButtonSelectedHoverBackground":
					sClass = "2";
					break;
				case "sapUiSegmentedButtonSelectedHoverBorderColor":
					sClass = "2";
					break;
				case "sapUiSegmentedButtonIconColor":
					sClass = "2";
					break;
				/*case "sapUiContentContrastTextThreshold":
					sClass = "2";
					break;*/
				case "sapUiSegmentedButtonActiveIconColor":
					sClass = "2";
					break;
				/*case "sapUiContentContrastTextThreshold":
					sClass = "2";
					break;*/
				case "sapUiSegmentedButtonSelectedIconColor":
					sClass = "2";
					break;
				/*case "sapUiContentContrastTextThreshold":
					sClass = "2";
					break;*/
				case "sapUiSegmentedButtonFooterBorderColor":
					sClass = "2";
					break;
				case "sapUiSegmentedButtonFooterHoverBackground":
					sClass = "2";
					break;
				case "sapUiFieldTextColor":
					sClass = "2";
					sTheming = "Base";
					sControlGroup = "Field";
					sParameter = "Color";
					sParameter1 = "Font";
					break;
				case "sapUiFieldActiveBackground":
					sClass = "2";
					break;
				case "sapUiFieldActiveBorderColor":
					sClass = "2";
					break;
				case "sapUiFieldActiveTextColor":
					sClass = "2";
					break;
				case "sapUiFieldPlaceholderTextColor":
					sClass = "2";
					break;
				case "sapUiListTextColor":
					sClass = "2";
					break;
				case "sapUiListVerticalBorderColor":
					sClass = "2";
					break;
				case "sapUiListActiveBackground":
					sClass = "2";
					break;
				case "sapUiListActiveTextColor":
					sClass = "2";
					break;
				case "sapUiListSelectionHoverBackground":
					sClass = "2";
					break;
				case "sapUiListFooterBackground":
					sClass = "2";
					break;
				case "sapUiListFooterTextColor":
					sClass = "2";
					break;
					case "sapUiListGroupHeaderBackground":
					sClass = "2";
					break;
				case "sapUiListTableGroupHeaderBackground":
					sClass = "2";
					break;
				case "sapUiListTableGroupHeaderBorderColor":
					sClass = "2";
					break;
				case "sapUiListTableGroupHeaderTextColor":
					sClass = "2";
					break;
				/*case "sapUiContentContrastTextThreshold":
					sClass = "2";
					break;*/
				case "sapUiListTableFooterBorder":
					sClass = "2";
					break;
				case "sapUiListTableFixedBorder":
					sClass = "2";
					break;
				case "sapUiListTableTextSize":
					sClass = "2";
					break;
				case "sapUiListTableIconSize":
					sClass = "2";
					break;
				case "sapUiPageFooterBorderColor":
					sClass = "2";
					break;
				case "sapUiInfobarHoverBackground":
					sClass = "2";
					break;
				case "sapUiInfobarActiveBackground":
					sClass = "2";
					break;
				case "sapUiCalendarColorToday":
					sClass = "2";
					break;
				case "sapUiShadowLevel0":
					sClass = "2";
					break;
				case "sapUiShadowLevel1":
					sClass = "2";
					break;
				case "sapUiShadowLevel2":
					sClass = "2";
					break;
				case "sapUiShadowLevel3":
					sClass = "2";
					break;
				case "sapUiShadowText":
					sClass = "2";
					break;
				case "sapUiShadowHeader":
					sClass = "2";
					break;
				case "sapUiUx3ShellHeaderImageURL":
					sClass = "2";
					break;
				case "sapUiUx3ShellApplicationImageURL":
					sClass = "2";
					break;
					//Class 3
				case "sapUiBrand":
					sClass = "3";
					sTheming = "Quick";
					sParameter = "Color";
					break;
				case "sapUiHighlight":
					sClass = "3";
					sTheming = "Quick";
					sControlGroup = "Content";
					sParameter = "Color";
					break;
				case "sapUiBaseColor":
					sClass = "3";
					sTheming = "Quick";
					sParameter = "Color";
					break;
				case "sapUiShellColor":
					sClass = "3";
					break;
				case "sapUiBaseBG":
					sClass = "3";
					sTheming = "Quick";
					sParameter = "Color";
					break;
				case "sapUiGlobalBackgroundColor":
					sClass = "3";
					sTheming = "Quick";
					sParameter = "Color";
					break;
				case "sapUiBaseText":
					sClass = "3";
					sTheming = "Quick";
					sControlGroup = "Content";
					sParameter = "Color";
					sParameter1 = "Font";
					break;
				case "sapUiLink":
					sClass = "3";
					sTheming = "Quick";
					sControlGroup = "Content";
					sParameter = "Color";
					sParameter1 = "Font";
					sParameter2 = "Link";
					break;
				case "sapUiGlobalLogo":
					sClass = "3";
					break;
				case "sapUiGlobalBackgroundImage":
					sClass = "3";
					break;
				case "sapUiBackgroundImage":
					sClass = "3";
					break;
				case "sapUiUx3ShellBackgroundImageURL":
					sClass = "3";
					break;
				case "sapUiGlobalBackgroundImageOpacity":
					sClass = "3";
					break;
				case "sapUiGlobalBackgroundRepeat":
					sClass = "3";
					break;
					//Class 4
				case "sapUiPrimary1":
					sClass = "4";
					break;
				case "sapUiPrimary2":
					sClass = "4";
					break;
				case "sapUiPrimary3":
					sClass = "4";
					break;
				case "sapUiPrimary4":
					sClass = "4";
					break;
				case "sapUiPrimary5":
					sClass = "4";
					break;
				case "sapUiPrimary6":
					sClass = "4";
					break;
				case "sapUiPrimary7":
					sClass = "4";
					break;
				case "sapUiAccent1":
					sClass = "4";
					break;
				case "sapUiAccent2":
					sClass = "4";
					break;
				case "sapUiAccent3":
					sClass = "4";
					break;
				case "sapUiAccent4":
					sClass = "4";
					break;
				case "sapUiAccent5":
					sClass = "4";
					break;
				case "sapUiAccent6":
					sClass = "4";
					break;
				case "sapUiAccent7":
					sClass = "4";
					break;
				case "sapUiAccent8":
					sClass = "4";
					break;
				case "sapUiNegative":
					sClass = "4";
					break;
				case "sapUiCritical":
					sClass = "4";
					break;
				case "sapUiPositive":
					sClass = "4";
					break;
				case "sapUiNeutral":
					sClass = "4";
					break;
					// Class: 6
				case "sapUiGlobalBackgroundColorDefault":
					sClass = "6";
					sTheming = "Base";
					sControlGroup = "Content";
					sParameter = "Color";
					sProtected = "Protected";
					break;
				case "sapUiContentMarkerIconColor":
					sClass = "6";
					sTheming = "Base";
					sControlGroup = "Content";
					sParameter = "Color";
					break;
				case "sapUiContentMarkerTextColor":
					sClass = "6";
					sTheming = "Base";
					sControlGroup = "Content";
					sParameter = "Color";
					sParameter1 = "Font";
					break;
				case "sapUiContentImagePlaceholderBackground":
					sClass = "6";
					sTheming = "Base";
					sControlGroup = "Content";
					sParameter = "Color";
					break;
				case "sapUiContentImagePlaceholderForegroundColor":
					sClass = "6";
					sTheming = "Base";
					sControlGroup = "Content";
					sParameter = "Color";
					break;
				case "sapUiShellBackgroundImage":
					sClass = "6";
					sTheming = "Base";
					sControlGroup = "Shell";
					sParameter = "Image";
					sParameter3 = "URI";
					break;
				case "sapUiShellBackgroundImageOpacity":
					sClass = "6";
					sTheming = "Quick";
					sParameter = "Opacity";
					break;
				case "sapUiShellBackgroundImageRepeat":
					sClass = "6";
					sTheming = "Quick";
					break;
				case "sapUiShellBackgroundPatternColor":
					sClass = "6";
					sTheming = "Base";
					sControlGroup = "Shell";
					sParameter = "Color";
					break;
				case "sapUiShellFavicon":
					sClass = "6";
					sTheming = "Base";
					sControlGroup = "Shell";
					sParameter3 = "URI";
					sParameter = "Image";
					break;
				case "sapUiGroupTitleBackground":
					sClass = "6";
					sTheming = "Base";
					sControlGroup = "Group";
					sParameter = "Color";
					break;
				case "sapUiTileTitleTextColor":
					sClass = "6";
					sTheming = "Base";
					sControlGroup = "Tile";
					sParameter = "Color";
					sParameter1 = "Font";
					break;
				case "sapUiTileTextColor":
					sClass = "6";
					sTheming = "Base";
					sControlGroup = "Tile";
					sParameter = "Color";
					sParameter1 = "Font";
					break;
				case "sapUiTileIconColor":
					sClass = "6";
					sTheming = "Base";
					sControlGroup = "Content";
					sParameter = "Color";
					break;
					// default
				default:
					sClass = "5";
					sControlGroup = "";
					sTheming = "";
					sParameter = "";
				}

				// added to fix eslint errors, can be removed later when the big switch is gone
				sParameter1 += sParameter2 + sParameter3 + sProtected;

				if (jQuery.sap.startsWithIgnoreCase(sName, "sapui")) {
					var oEntry;
					if (sap.ui.core.CSSColor.isValid(oParams[sName])) {
						oEntry = {name : sName, color : oParams[sName], colors: oParams[sName], 'class' : sClass, controlgroup : sControlGroup, theming :sTheming, parameter:sParameter};
						oData.Data.push(oEntry);
					} else {
						oEntry = {name : sName, color : oParams[sName], colors : undefined, 'class' : sClass, controlgroup : sControlGroup, theming :sTheming, parameter:sParameter};
						oData.Data.push(oEntry);
					}
				}

				if (jQuery.inArray(sName) < 0) {
					appendColor(sName, sDummyKey, oParams[sName], aBuffer);
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
				this._oTableFilterState.aTheming = [new Filter("theming", FilterOperator.EQ, "Base")];
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

		//Event handler for the ComboBox
		//Applies a new theme and sets the Text for the current theme

		onThemeChange: function(oEvent) {

			var value = oEvent.getParameter("value");
			switch (value) {
			case "Belize":
			default:
				sap.ui.getCore().applyTheme("sap_belize");
				sap.ui.getCore().byId("title").setText("Details for ''Belize''");
				break;
			case "Blue Crystal":
				sap.ui.getCore().applyTheme("sap_bluecrystal");
				sap.ui.getCore().byId("title").setText("Details for ''Blue Crystal''");
				break;
			case "High Contrast White":
				sap.ui.getCore().applyTheme("sap_belize_hcw");
				sap.ui.getCore().byId("title").setText("Details for ''High Contrast White''");
				break;
			case "Belize Plus":
				sap.ui.getCore().applyTheme("sap_belize_plus");
				sap.ui.getCore().byId("title").setText("Details for ''Belize Plus''");
				break;
			case "High Contrast Black":
				sap.ui.getCore().applyTheme("sap_belize_hcb");
				sap.ui.getCore().byId("title").setText("Details for ''High Contrast Black''");
				break;
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
			var aFilters = this._oTableFilterState.aSearch.concat(this._oTableFilterState.aFilter,this._oTableFilterState.aControlgroup,this._oTableFilterState.aCharacteristic, this._oTableFilterState.aTheming);
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