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

	var TYPING_DELAY = 200; // ms

	return BaseController.extend("sap.ui.demo.theming.controller.Overview", {

		formatter: formatter,
		/* =========================================================== */
		/* lifecycle methods                                           */
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
				sFragment ="sap.ui.demo.theming.view.Desktop";
			}
			else if (sap.ui.Device.system.phone){
				sFragment ="sap.ui.demo.theming.view.Phone";
        	}
			else {
				sFragment ="sap.ui.demo.theming.view.Tablet";
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
						},
						]};
			oComboBoxModel.setData(mData);

			this.getView().setModel(oComboBoxModel);
			var oValue= "Details for ''Belize''";
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

			for(var sName in oParams) {

				switch(sName) {
				//Class 1
				case "sapUiSelected":
					var sClass = "1";
					var sTheming = "Base";
					var sParameter = "Color";
					break;
				case "sapUiActive":
					var sClass = "1";
					var sTheming = "Base";
					var sParameter = "Color";
					break;
				case "sapUiHighlightTextColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Content";
					var sParameter = "Color";
					var sParameter1 = "Font";
					break;
				case "sapUiTextTitle":
					var sClass = "1";
					var sTheming = "Base";
					var sParameter = "Color";
					var sParameter1 = "Font";
					break;
				case "sapUiContentIconColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Content";
					var sParameter= "Color";
					break;
				case "sapUiContentContrastIconColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Content";
					var sParameter = "Color";
					break;
				case "sapUiContentNonInteractiveIconColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Content";
					var sParameter = "Color";
					break;
				case "sapUiContentFocusColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Content";
					var sParameter = "Color";
					break;
				case "sapUiContentContrastFocusColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Content";
					var sParameter = "Color";
					break;
				case "sapUiContentShadowColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Content";
					var sParameter = "Color";
					break;
				case "sapUiContentContrastShadowColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Content";
					var sParameter = "Color";
					break;
				case "sapUiContentSearchHighlightColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Content";
					var sParameter = "Color";
					break;
				case "sapUiContentHelpColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Content";
					var sParameter = "Color";
					break;
				case "sapUiContentLabelColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Content";
					var sParameter = "Color";
					var sParameter1 = "Font";
					break;
				case "sapUiContentDisabledTextColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Content";
					var sParameter = "Color";
					var sParameter1 = "Font";
					break;
				case "sapUiContentDisabledOpacity":
					var sClass = "1";
					break;
				case "sapUiContentContrastTextThreshold":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Content";
					var sParameter1 = "Font";
					break;
				case "sapUiContentContrastTextColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Content";
					var sParameter = "Color";
					var sParameter1 = "Font";
					break;
				case "sapUiContentForegroundColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Content";
					var sParameter = "Color";
					break;
				case "sapUiContentForegroundBorderColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Content";
					var sParameter = "Color";
					break;
				case "sapUiContentForegroundTextColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Content";
					var sParameter = "Color";
					var sParameter1 = "Font";
					break;
				case "sapUiShellBackgroundGradient":
					var sClass = "1";
					var sTheming ="Base";
					var sControlGroup = "Shell";
					var sProtected = "Protected";
					break;
				case "sapUiShellBackground":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Shell";
					var sParameter = "Color";
					break;
				case "sapUiShellBorderColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Shell";
					var sParameter = "Color";
					break;
				case "sapUiShellTextColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Shell";
					var sParameter = "Color";
					var sParameter1 = "Font";
					break;
				case "sapUiButtonBackground":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Button";
					var sParameter = "Color";
					break;
				case "sapUiButtonBorderColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Button";
					var sParameter = "Color";
					break;
				case "sapUiButtonTextColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Button";
					var sParameter = "Color";
					var sParameter1 = "Font";
					break;
				case "sapUiButtonHoverBackground":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Button";
					var sParameter = "Color";
					break;
				case "sapUiButtonHoverBorderColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Button";
					var sParameter = "Color";
					break;
				case "sapUiButtonHoverTextColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Button";
					var sParameter = "Color";
					var sParameter1 = "Font";
					break;
				case "sapUiButtonEmphasizedBackground":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Button";
					var sParameter = "Color";
					break;
				case "sapUiButtonEmphasizedBorderColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Button";
					var sParameter = "Color";
					break;
				case "sapUiButtonEmphasizedTextColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Button";
					var sParameter = "Color";
					var sParameter1 = "Font";
					break;
				case "sapUiButtonRejectBackground":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Button";
					var sParameter = "Color";
					break;
				case "sapUiButtonAcceptBackground":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Button";
					var sParameter = "Color";
					break;
				case "sapUiFieldBackground":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Field";
					var sParameter = "Color";
					break;
				case "sapUiFieldBorderColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Field";
					var sParameter = "Color";
					break;
				case "sapUiFieldHelpBackground":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Field";
					var sParameter = "Color";
					break;
				case "sapUiFieldHoverBackground":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Field";
					var sParameter = "Color";
					break;
				case "sapUiFieldHoverBorderColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Field";
					var sParameter = "Color";
					break;
				case "sapUiFieldHoverHelpBackground":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Field";
					var sParameter = "Color";
					break;
				case "sapUiFieldFocusBackground":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Field";
					var sParameter = "Color";
					break;
				case "sapUiFieldFocusBorderColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Field";
					var sParameter = "Color";
					break;
				case "sapUiFieldFocusHelpBackground":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Field";
					var sParameter = "Color";
					break;
				case "sapUiFieldReadOnlyBackground":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Field";
					var sParameter = "Color";
					break;
				case "sapUiFieldReadOnlyBorderColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Field";
					var sParameter = "Color";
					break;
				case "sapUiFieldReadOnlyHelpBackground":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Field";
					var sParameter = "Color";
					break;
				case "sapUiFieldRequiredColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Field";
					var sParameter = "Color";
					break;
				case "sapUiFieldInvalidColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Field";
					var sParameter = "Color";
					break;
				case "sapUiFieldInvalidBackground":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Field";
					var sParameter = "Color";
					break;
				case "sapUiFieldWarningColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Field";
					var sParameter = "Color";
					break;
				case "sapUiFieldWarningBackground":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Field";
					var sParameter = "Color";
					break;
				case "sapUiFieldSuccessColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Field";
					var sParameter = "Color";
					break;
				case "sapUiFieldSuccessBackground":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Field";
					var sParameter = "Color";
					break;
				case "sapUiGroupTitleBorderColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Group";
					var sParameter = "Color";
					break;
				case "sapUiGroupTitleTextColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Group";
					var sParameter = "Color";
					var sParameter1 = "Font";
					break;
				case "sapUiGroupContentBackground":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Group";
					var sParameter = "Color";
					break;
				case "sapUiGroupContentBorderColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Group";
					var sParameter = "Color";
					break;
				case "sapUiGroupFooterBackground":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Group";
					var sParameter = "Color";
					var sProtected = "Protected";
					break;
				case "sapUiToolbarBackground":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Toolbar";
					var sParameter = "Color";
					break;
				case "sapUiToolbarSeparatorColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Toolbar";
					var sParameter = "Color";
					break;
				case "sapUiListHeaderBackground":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "List";
					var sParameter = "Color";
					break;
				case "sapUiListHeaderBorderColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "List";
					var sParameter = "Color";
					break;
				case "sapUiListHeaderTextColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "List";
					var sParameter = "Color";
					var sParameter1 ="Font";
					break;
				case "sapUiListBorderColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "List";
					var sParameter = "Color";
					break;
				case "sapUiListHighlightColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "List";
					var sParameter = "Color";
					break;
				case "sapUiListSelectionBackgroundColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "List";
					var sParameter = "Color";
					break;
				case "sapUiListBackground":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "List";
					var sParameter = "Color";
					break;
				case "sapUiListHoverBackground":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "List";
					var sParameter = "Color";
					break;
				case "sapUiScrollBarFaceColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "ScrollBar";
					var sParameter = "Color";
					break;
				case "sapUiScrollBarTrackColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "ScrollBar";
					var sParameter = "Color";
					break;
				case "sapUiScrollBarBorderColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "ScrollBar";
					var sParameter = "Color";
					break;
				case "sapUiScrollBarSymbolColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "ScrollBar";
					var sParameter = "Color";
					break;
				case "sapUiScrollBarHoverFaceColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "ScrollBar";
					var sParameter = "Color";
					break;
				case "sapUiPageHeaderBackground":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Page";
					var sParameter = "Color";
					break;
				case "sapUiPageHeaderBorderColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Page";
					var sParameter = "Color";
					break;
				case "sapUiPageHeaderTextColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Page";
					var sParameter = "Color";
					var sParameter1 ="Font";
					break;
				case "sapUiPageFooterBackground":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Page";
					var sParameter = "Color";
					break;
				case "sapUiPageFooterTextColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Page";
					var sParameter = "Color";
					var sParameter1 ="Font";
					break;
				case "sapUiInfobarBackground":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Page";
					var sParameter = "Color";
					break;
				case "sapUiObjectHeaderBackground":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Page";
					var sParameter = "Color";
					break;
				case "sapUiBlockLayerBackground":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Page";
					var sParameter = "Color";
					break;
				case "sapUiTileBackground":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Tile";
					var sParameter = "Color";
					break;
				case "sapUiTileBorderColor":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Tile";
					var sParameter = "Color";
					break;
				case "sapUiChart1":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Chart";
					var sParameter = "Color";
					break;
				case "sapUiChart2":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Chart";
					var sParameter = "Color";
					break;
				case "sapUiChart3":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Chart";
					var sParameter = "Color";
					break;
				case "sapUiChart4":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Chart";
					var sParameter = "Color";
					break;
				case "sapUiChart5":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Chart";
					var sParameter = "Color";
					break;
				case "sapUiChart6":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Chart";
					var sParameter = "Color";
					break;
				case "sapUiChart7":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Chart";
					var sParameter = "Color";
					break;
				case "sapUiChart8":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Chart";
					var sParameter = "Color";
					break;
				case "sapUiChart9":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Chart";
					var sParameter = "Color";
					break;
				case "sapUiChart10":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Chart";
					var sParameter = "Color";
					break;
				case "sapUiChart11":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Chart";
					var sParameter = "Color";
					break;
				case "sapUiChartBad":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Chart";
					var sParameter = "Color";
					break;
				case "sapUiChartCritical":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Chart";
					var sParameter = "Color";
					break;
				case "sapUiChartGood":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Chart";
					var sParameter = "Color";
					break;
				case "sapUiChartNeutral":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Chart";
					var sParameter = "Color";
					break;
				case "sapUiChartSequence1":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Chart";
					var sParameter = "Color";
					break;
				case "sapUiChartSequence2":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Chart";
					var sParameter = "Color";
					break;
				case "sapUiChartSequence3":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Chart";
					var sParameter = "Color";
					break;
				case "sapUiChartSequenceNeutral":
					var sClass = "1";
					var sTheming = "Base";
					var sControlGroup = "Chart";
					var sParameter = "Color";
					break;
				case "sapUiErrorBG":
					var sClass = "1";
					break;
				case "sapUiWarningBG":
					var sClass = "1";
					break;
				case "sapUiSuccessBG":
					var sClass = "1";
					break;
				case "sapUiNeutralBG":
					var sClass = "1";
					break;
				case "sapUiErrorBorder":
					var sClass = "1";
					break;
				case "sapUiWarningBorder":
					var sClass = "1";
					break;
				case "sapUiSuccessBorder":
					var sClass = "1";
					break;
				case "sapUiNeutralBorder":
					var sClass = "1";
					break;
				case "sapUiNegativeElement":
					var sClass = "1";
					break;
				case "sapUiCriticalElement":
					var sClass = "1";
					break;
				case "sapUiPositiveElement":
					var sClass = "1";
					break;
				case "sapUiNeutralElement":
					var sClass = "1";
					break;
				case "sapUiNegativeText":
					var sClass = "1";
					break;
				case "sapUiCriticalText":
					var sClass = "1";
					break;
				case "sapUiPositiveText":
					var sClass = "1";
					break;
					//Class 2
				case "sapUiChartLabelHoverColor":
					var sClass = "2";
					break;
				case "sapUiChartLabelPressedColor":
					var sClass = "2";
					break;
				case "sapUiChartCategoryAxisLabelFontColor":
					var sClass = "2";
					break;
				case "sapUiChartValueAxisLabelFontColor":
					var sClass = "2";
					break;
				case "sapUiChartCategoryAxisLabelFontSize":
					var sClass = "2";
					break;
				case "sapUiChartValueAxisLabelFontSize":
					var sClass = "2";
					break;
				case "sapUiChartCategoryAxisLineColor":
					var sClass = "2";
					break;
				case "sapUiChartValueAxisLineColor":
					var sClass = "2";
					break;
				case "sapUiChartCategoryAxisTickColor":
					var sClass = "2";
					break;
				case "sapUiChartValueAxisTickColor":
					var sClass = "2";
					break;
				case "sapUiChartBackgroundColor":
					var sClass = "2";
					break;
				case "sapUiChartLabelFontWeight":
					var sClass = "2";
					break;
				case "sapUiChartLegendLabelFontColor":
					var sClass = "2";
					break;
				case "sapUiChartLegendTitleFontColor":
					var sClass = "2";
					break;
				case "sapUiChartLegendTitleFontSize":
					var sClass = "2";
					break;
				case "sapUiChartLegendLabelFontSize":
					var sClass = "2";
					break;
				case "sapUiChartPaletteUndefinedColor":
					var sClass = "2";
					break;
				case "sapUiChartGridlineColor":
					var sClass = "2";
					break;
				case "sapUiChartReferenceLineColor":
					var sClass = "2";
					break;
				case "sapUiChartDataLabelFontColor":
					var sClass = "2";
					break;
				case "sapUiChartReferenceLineLabelColor":
					var sClass = "2";
					break;
				case "sapUiChartDataLabelFontSize":
					var sClass = "2";
					break;
				case "sapUiChartPopoverDataItemFontColor":
					var sClass = "2";
					break;
				case "sapUiChartPopoverGroupFontColor":
					var sClass = "2";
					break;
				case "sapUiChartPopoverDataItemFontSize":
					var sClass = "2";
					break;
				case "sapUiChartPopoverGroupFontSize":
					var sClass = "2";
					break;
				case "sapUiChartPopoverGroupFontWeight":
					var sClass = "2";
					break;
				case "sapUiChartScrollBarThumbColor":
					var sClass = "2";
					break;
				case "sapUiChartScrollBarTrackColor":
					var sClass = "2";
					break;
				case "sapUiChartScrollBarThumbHoverColor":
					var sClass = "2";
					break;
				case "sapUiChartMainTitleFontColor":
					var sClass = "2";
					break;
				case "sapUiChartAxisTitleFontColor":
					var sClass = "2";
					break;
				case "sapUiChartMainTitleFontSize":
					var sClass = "2";
					break;
				case "sapUiChartAxisTitleFontSize":
					var sClass = "2";
					break;
				case "sapUiChartTitleFontWeight":
					var sClass = "2";
					break;
				case "sapUiChartLightText":
					var sClass = "2";
					break;
				case "sapUiChartZeroAxisColor":
					var sClass = "2";
					break;
				case "sapUiChartDataPointBorderColor":
					var sClass = "2";
					break;
				case "sapUiChartDataPointBorderHoverSelectedColor":
					var sClass = "2";
					break;
				case "sapUiChartDataPointNotSelectedBackgroundOpacity":
					var sClass = "2";
					break;
				case "sapUiChartValueAxisLineOpacity":
					var sClass = "2";
					break;
				case "sapUiChartCategoryAxisLabelFontHoverColor":
					var sClass = "2";
					break;
				case "sapUiChartCategoryAxisLabelFontPressedColor":
					var sClass = "2";
					break;
				case "sapUiChartTargetColor":
					var sClass = "2";
					break;
				case "sapUiChartTargetShadowColor":
					var sClass = "2";
					break;
				case "sapUiChartBubbleBGOpacity":
					var sClass = "2";
					break;
				case "sapUiChartScrollbarBorderColor":
					var sClass = "2";
					break;
				case "sapUiChartScrollbarBorderSize":
					var sClass = "2";
					break;
				case "sapUiChartScrollbarThumbPadding":
					var sClass = "2";
					break;
				case "sapUiChartNegativeLargeText":
					var sClass = "2";
					break;
				case "sapUiChartCriticalLargeText":
					var sClass = "2";
					break;
				case "sapUiChartPositiveLargeText":
					var sClass = "Class: 2";
					break;
				case "sapUiChartNeutralLargeText":
					var sClass = "2";
					break;
				case "sapUiChartDataPointBG":
					var sClass = "2";
					break;
				case "sapUiChartDataPointBGBorderColor":
					var sClass = "2";
					break;
				case "sapUiChartDataLineColorWithBG":
					var sClass = "2";
					break;
				case "sapUiChartDataLineColor":
					var sClass = "2";
					break;
				case "sapUiChartRadialRemainingCircle":
					var sClass = "2";
					break;
				case "sapUiChartRadialRemainingCircleBorderColor":
					var sClass = "2";
					break;
				case "sapUiChartRadialBG":
					var sClass = "2";
					break;
				case "sapUiChartPaletteQualitativeHue1":
					var sClass = "2";
					break;
				case "sapUiChartPaletteQualitativeHue2":
					var sClass = "2";
					break;
				case "sapUiChartPaletteQualitativeHue3":
					var sClass = "2";
					break;
				case "sapUiChartPaletteQualitativeHue4":
					var sClass = "2";
					break;
				case "sapUiChartPaletteQualitativeHue5":
					var sClass = "2";
					break;
				case "sapUiChartPaletteQualitativeHue6":
					var sClass = "2";
					break;
				case "sapUiChartPaletteQualitativeHue7":
					var sClass = "2";
					break;
				case "sapUiChartPaletteQualitativeHue8":
					var sClass = "2";
					break;
				case "sapUiChartPaletteQualitativeHue9":
					var sClass = "2";
					break;
				case "sapUiChartPaletteQualitativeHue10":
					var sClass = "2";
					break;
				case "sapUiChartPaletteQualitativeHue11":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSemanticBadLight1":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSemanticBadLight2":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSemanticBadLight3":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSemanticBad":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSemanticBadDark1":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSemanticBadDark2":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSemanticCriticalLight1":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSemanticCriticalLight2":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSemanticCriticalLight3":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSemanticCritical":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSemanticCriticalDark1":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSemanticCriticalDark2":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSemanticGoodLight1":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSemanticGoodLight2":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSemanticGoodLight3":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSemanticGood":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSemanticGoodDark1":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSemanticGoodDark2":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSemanticNeutralLight1":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSemanticNeutralLight2":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSemanticNeutralLight3":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSemanticNeutral":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSemanticNeutralDark1":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSemanticNeutralDark2":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue1Light1":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue1Light2":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue1Light3":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue1":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue1Dark1":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue1Dark2":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue2Light1":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue2Light2":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue2Light3":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue2":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue2Dark1":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue2Dark2":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue3Light1":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue3Light2":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue3Light3":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue3":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue3Dark1":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSequentialHue3Dark2":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSequentialNeutralLight1":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSequentialNeutralLight2":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSequentialNeutralLight3":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSequentialNeutral":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSequentialNeutralDark1":
					var sClass = "2";
					break;
				case "sapUiChartPaletteSequentialNeutralDark2":
					var sClass = "2";
					break;
				case "sapUiChoroplethBG":
					var sClass = "2";
					break;
				case "sapUiChoroplethRegionBorder":
					var sClass = "2";
					break;
				case "sapUiChoroplethRegionBG":
					var sClass = "2";
					break;
				case "sapUiMapLegendBG":
					var sClass = "2";
					break;
				case "sapUiMapLegendBorderColor":
					var sClass = "2";
					break;
				case "sapUiShellHoverBackground":
					var sClass = "2";
					break;
				case "sapUiShellActiveBackground":
					var sClass = "2";
					var sTheming ="Quick";
					var sParameter= "Color";
					var sProtected = "Protected";
					break;
				case "sapUiShellActiveTextColor":
					var sClass = "2";
					break;
				case "sapUiShellHoverToggleBackground":
					var sClass = "2";
					break;
				case "sapUiUx3ShellHeaderColor":
					var sClass = "2";
					break;
				case "sapUiUx3ShellBackgroundColor":
					var sClass = "2";
					break;
				case "sapUiUx3ShellHoverColor":
					var sClass = "2";
					break;
				case "sapUiUx3ShellGradientBottom":
					var sClass = "2";
					break;
				case "sapUiUx3ShellGradientTop":
					var sClass = "2";
					break;
				case "sapUiUx3ShellToolPaletteIconFontColor":
					var sClass = "2";
					break;
				case "sapUiUx3ExactLstExpandOffset":
					var sClass = "2";
					break;
				case "sapUiUx3ExactLstRootExpandOffset":
					var sClass = "2";
					break;
				case "sapUiUx3ExactLstContentTop":
					var sClass = "2";
					break;
				case "sapUiLinkActive":
					var sClass = "2";
					break;
				case "sapUiLinkVisited":
					var sClass = "2";
					break;
				case "sapUiLinkHover":
					var sClass = "2";
					break;
				case "sapUiLinkInverted":
					var sClass = "2";
					break;
				case "sapUiNotificationBarBG":
					var sClass = "2";
					break;
				case "sapUiNotifierSeparator":
					var sClass = "2";
					break;
				case "sapUiNotifierSeparatorWidth":
					var sClass = "2";
					break;
				case "sapUiUx3ToolPopupInverted":
					var sClass = "2";
					break;
				case "sapUiUx3ToolPopupArrowRightMarginCorrection":
					var sClass = "2";
					break;
				case "sapUiUx3ToolPopupShadow":
					var sClass = "2";
					break;
				case "sapUiCalloutShadow":
					var sClass = "2";
					break;
				case "sapUiButtonIconColor":
					var sClass = "2";
					break;
				case "sapUiButtonActiveBackground":
					var sClass = "2";
					break;
				case "sapUiButtonActiveBorderColor":
					var sClass = "2";
					break;
				case "sapUiButtonActiveTextColor":
					var sClass = "2";
					break;
				case "sapUiButtonEmphasizedHoverBackground":
					var sClass = "2";
					break;
				case "sapUiButtonEmphasizedHoverBorderColor":
					var sClass = "2";
					break;
				case "sapUiButtonEmphasizedActiveBackground":
					var sClass = "2";
					break;
				case "sapUiButtonEmphasizedActiveBorderColor":
					var sClass = "2";
					break;
				case "sapUiButtonEmphasizedTextShadow":
					var sClass = "2";
					break;
				case "sapUiContentContrastTextThreshold":
					var sClass = "2";
					break;
				case "sapUiButtonAcceptBorderColor":
					var sClass = "2";
					break;
				case "sapUiButtonAcceptHoverBackground":
					var sClass = "2";
					break;
				case "sapUiButtonAcceptHoverBorderColor":
					var sClass = "2";
					break;
				case "sapUiButtonAcceptActiveBackground":
					var sClass = "2";
					break;
				case "sapUiButtonAcceptActiveBorderColor":
					var sClass = "2";
					break;
				case "sapUiButtonAcceptTextColor":
					var sClass = "2";
					break;
				case "sapUiButtonRejectBorderColor":
					var sClass = "2";
					break;
				case "sapUiButtonRejectHoverBackground":
					var sClass = "2";
					break;
				case "sapUiButtonRejectHoverBorderColor":
					var sClass = "2";
					break;
				case "sapUiButtonRejectActiveBackground":
					var sClass = "2";
					break;
				case "sapUiButtonRejectActiveBorderColor":
					var sClass = "2";
					break;
				case "sapUiButtonRejectTextColor":
					var sClass = "2";
					break;
				case "sapUiButtonLiteBackground":
					var sClass = "2";
					break;
				case "sapUiButtonLiteBorderColor":
					var sClass = "2";
					break;
				case "sapUiButtonLiteTextColor":
					var sClass = "2";
					break;
				case "sapUiButtonLiteHoverBackground":
					var sClass = "2";
					break;
				case "sapUiButtonLiteHoverBorderColor":
					var sClass = "2";
					break;
				case "sapUiButtonLiteActiveBackground":
					var sClass = "2";
					break;
				case "sapUiButtonLiteActiveBorderColor":
					var sClass = "2";
					break;
				case "sapUiButtonHeaderTextColor":
					var sClass = "2";
					break;
				case "sapUiButtonHeaderDisabledTextColor":
					var sClass = "2";
					break;
				case "sapUiButtonFooterTextColor":
					var sClass = "2";
					break;
				case "sapUiButtonFooterHoverBackground":
					var sClass = "2";
					break;
				case "sapUiButtonActionSelectBackground":
					var sClass = "2";
					break;
				case "sapUiButtonActionSelectBorderColor":
					var sClass = "2";
					break;
				case "sapUiButtonLiteActionSelectHoverBackground":
					var sClass = "2";
					break;
				case "sapUiToggleButtonPressedBackground":
					var sClass = "2";
					break;
				case "sapUiToggleButtonPressedBorderColor":
					var sClass = "2";
					break;
				case "sapUiToggleButtonPressedTextColor":
					var sClass = "2";
					break;
				case "sapUiContentContrastTextThreshold":
					var sClass = "2";
					break;
				case "sapUiToggleButtonPressedHoverBackground":
					var sClass = "2";
					break;
				case "sapUiToggleButtonPressedHoverBorderColor":
					var sClass = "2";
					break;
				case "sapUiToggleButtonPressedDisabledBackground":
					var sClass = "2";
					break;
				case "sapUiToggleButtonPressedDisabledBorderColor":
					var sClass = "2";
					break;
				case "sapUiToggleButtonPressedDisabledTextColor":
					var sClass = "2";
					break;
				case "sapUiSegmentedButtonBackground":
					var sClass = "2";
					break;
				case "sapUiSegmentedButtonBorderColor":
					var sClass = "2";
					break;
				case "sapUiSegmentedButtonTextColor":
					var sClass = "2";
					break;
				case "sapUiSegmentedButtonHoverBackground":
					var sClass = "2";
					break;
				case "sapUiSegmentedButtonActiveBackground":
					var sClass = "2";
					break;
				case "sapUiSegmentedButtonActiveTextColor":
					var sClass = "2";
					break;
				case "sapUiContentContrastTextThreshold":
					var sClass = "2";
					break;
				case "sapUiSegmentedButtonSelectedBackground":
					var sClass = "2";
					break;
				case "sapUiSegmentedButtonSelectedTextColor":
					var sClass = "2";
					break;
				case "sapUiContentContrastTextThreshold":
					var sClass = "2";
					break;
				case "sapUiSegmentedButtonSelectedHoverBackground":
					var sClass = "2";
					break;
				case "sapUiSegmentedButtonSelectedHoverBorderColor":
					var sClass = "2";
					break;
				case "sapUiSegmentedButtonIconColor":
					var sClass = "2";
					break;
				case "sapUiContentContrastTextThreshold":
					var sClass = "2";
					break;
				case "sapUiSegmentedButtonActiveIconColor":
					var sClass = "2";
					break;
				case "sapUiContentContrastTextThreshold":
					var sClass = "2";
					break;
				case "sapUiSegmentedButtonSelectedIconColor":
					var sClass = "2";
					break;
				case "sapUiContentContrastTextThreshold":
					var sClass = "2";
					break;
				case "sapUiSegmentedButtonFooterBorderColor":
					var sClass = "2";
					break;
				case "sapUiSegmentedButtonFooterHoverBackground":
					var sClass = "2";
					break;
				case "sapUiFieldTextColor":
					var sClass = "2";
					var sTheming = "Base";
					var sControlGroup = "Field";
					var sParameter = "Color";
					var sParameter1 = "Font";
					break;
				case "sapUiFieldActiveBackground":
					var sClass = "2";
					break;
				case "sapUiFieldActiveBorderColor":
					var sClass = "2";
					break;
				case "sapUiFieldActiveTextColor":
					var sClass = "2";
					break;
				case "sapUiFieldPlaceholderTextColor":
					var sClass = "2";
					break;
				case "sapUiListTextColor":
					var sClass = "2";
					break;
				case "sapUiListVerticalBorderColor":
					var sClass = "2";
					break;
				case "sapUiListActiveBackground":
					var sClass = "2";
					break;
				case "sapUiListActiveTextColor":
					var sClass = "2";
					break;
				case "sapUiListSelectionHoverBackground":
					var sClass = "2";
					break;
				case "sapUiListFooterBackground":
					var sClass = "2";
					break;
				case "sapUiListFooterTextColor":
					var sClass = "2";
					break;
					case "sapUiListGroupHeaderBackground":
					var sClass = "2";
					break;
				case "sapUiListTableGroupHeaderBackground":
					var sClass = "2";
					break;
				case "sapUiListTableGroupHeaderBorderColor":
					var sClass = "2";
					break;
				case "sapUiListTableGroupHeaderTextColor":
					var sClass = "2";
					break;
				case "sapUiContentContrastTextThreshold":
					var sClass = "2";
					break;
				case "sapUiListTableFooterBorder":
					var sClass = "2";
					break;
				case "sapUiListTableFixedBorder":
					var sClass = "2";
					break;
				case "sapUiListTableTextSize":
					var sClass = "2";
					break;
				case "sapUiListTableIconSize":
					var sClass = "2";
					break;
				case "sapUiPageFooterBorderColor":
					var sClass = "2";
					break;
				case "sapUiInfobarHoverBackground":
					var sClass = "2";
					break;
				case "sapUiInfobarActiveBackground":
					var sClass = "2";
					break;
				case "sapUiCalendarColorToday":
					var sClass = "2";
					break;
				case "sapUiShadowLevel0":
					var sClass = "2";
					break;
				case "sapUiShadowLevel1":
					var sClass = "2";
					break;
				case "sapUiShadowLevel2":
					var sClass = "2";
					break;
				case "sapUiShadowLevel3":
					var sClass = "2";
					break;
				case "sapUiShadowText":
					var sClass = "2";
					break;
				case "sapUiShadowHeader":
					var sClass = "2";
					break;
				case "sapUiUx3ShellHeaderImageURL":
					var sClass = "2";
					break;
				case "sapUiUx3ShellApplicationImageURL":
					var sClass = "2";
					break;
					//Class 3
				case "sapUiBrand":
					var sClass = "3";
					var sTheming = "Quick";
					var sParameter = "Color";
					break;
				case "sapUiHighlight":
					var sClass = "3";
					var sTheming = "Quick";
					var sControlGroup ="Content";
					var sParameter = "Color";
					break;
				case "sapUiBaseColor":
					var sClass = "3";
					var sTheming = "Quick";
					var sParameter = "Color";
					break;
				case "sapUiShellColor":
					var sClass = "3";
					break;
				case "sapUiBaseBG":
					var sClass = "3";
					var sTheming = "Quick";
					var sParameter = "Color";
					break;
				case "sapUiGlobalBackgroundColor":
					var sClass = "3";
					var sTheming = "Quick";
					var sParameter = "Color";
					break;
				case "sapUiBaseText":
					var sClass = "3";
					var sTheming = "Quick";
					var sControlGroup = "Content";
					var sParameter = "Color";
					var sParameter1 = "Font";
					break;
				case "sapUiLink":
					var sClass = "3";
					var sTheming = "Quick";
					var sControlGroup = "Content";
					var sParameter = "Color";
					var sParameter1 = "Font";
					var sParameter2 = "Link";
					break;
				case "sapUiGlobalLogo":
					var sClass = "3";
					break;
				case "sapUiGlobalBackgroundImage":
					var sClass = "3";
					break;
				case "sapUiBackgroundImage":
					var sClass = "3";
					break;
				case "sapUiUx3ShellBackgroundImageURL":
					var sClass = "3";
					break;
				case "sapUiGlobalBackgroundImageOpacity":
					var sClass = "3";
					break;
				case "sapUiGlobalBackgroundRepeat":
					var sClass = "3";
					break;
					//Class 4
				case "sapUiPrimary1":
					var sClass = "4";
					break;
				case "sapUiPrimary2":
					var sClass = "4";
					break;
				case "sapUiPrimary3":
					var sClass = "4";
					break;
				case "sapUiPrimary4":
					var sClass = "4";
					break;
				case "sapUiPrimary5":
					var sClass = "4";
					break;
				case "sapUiPrimary6":
					var sClass = "4";
					break;
				case "sapUiPrimary7":
					var sClass = "4";
					break;
				case "sapUiAccent1":
					var sClass = "4";
					break;
				case "sapUiAccent2":
					var sClass = "4";
					break;
				case "sapUiAccent3":
					var sClass = "4";
					break;
				case "sapUiAccent4":
					var sClass = "4";
					break;
				case "sapUiAccent5":
					var sClass = "4";
					break;
				case "sapUiAccent6":
					var sClass = "4";
					break;
				case "sapUiAccent7":
					var sClass = "4";
					break;
				case "sapUiAccent8":
					var sClass = "4";
					break;
				case "sapUiNegative":
					var sClass = "4";
					break;
				case "sapUiCritical":
					var sClass = "4";
					break;
				case "sapUiPositive":
					var sClass = "4";
					break;
				case "sapUiNeutral":
					var sClass = "4";
					break;
					// Class: 6
				case "sapUiGlobalBackgroundColorDefault":
					var sClass = "6";
					var sTheming = "Base";
					var sControlGroup = "Content";
					var sParameter = "Color";
					var sProtected = "Protected";
					break;
				case "sapUiContentMarkerIconColor":
					var sClass = "6";
					var sTheming = "Base";
					var sControlGroup = "Content";
					var sParameter = "Color";
					break;
				case "sapUiContentMarkerTextColor":
					var sClass = "6";
					var sTheming = "Base";
					var sControlGroup = "Content";
					var sParameter = "Color";
					var sParameter1 = "Font";
					break;
				case "sapUiContentImagePlaceholderBackground":
					var sClass = "6";
					var sTheming = "Base";
					var sControlGroup = "Content";
					var sParameter = "Color";
					break;
				case "sapUiContentImagePlaceholderForegroundColor":
					var sClass = "6";
					var sTheming = "Base";
					var sControlGroup = "Content";
					var sParameter = "Color";
					break;
				case "sapUiShellBackgroundImage":
					var sClass = "6";
					var sTheming = "Base";
					var sControlGroup = "Shell";
					var sParameter = "Image";
					var sParameter3 = "URI";
					break;
				case "sapUiShellBackgroundImageOpacity":
					var sClass = "6";
					var sTheming = "Quick";
					var sParameter = "Opacity";
					break;
				case "sapUiShellBackgroundImageRepeat":
					var sClass = "6";
					var sTheming = "Quick";
					break;
				case "sapUiShellBackgroundPatternColor":
					var sClass = "6";
					var sTheming = "Base";
					var sControlGroup = "Shell";
					var sParameter = "Color";
					break;
				case "sapUiShellFavicon":
					var sClass = "6";
					var sTheming = "Base";
					var sControlGroup = "Shell";
					var sParameter3 = "URI";
					var sParameter = "Image";
					break;
				case "sapUiGroupTitleBackground":
					var sClass = "6";
					var sTheming ="Base";
					var sControlGroup ="Group";
					var sParameter = "Color";
					break;
				case "sapUiTileTitleTextColor":
					var sClass = "6";
					var sTheming ="Base";
					var sControlGroup ="Tile";
					var sParameter = "Color";
					var sParameter1 = "Font";
					break;
				case "sapUiTileTextColor":
					var sClass = "6";
					var sTheming ="Base";
					var sControlGroup ="Tile";
					var sParameter = "Color";
					var sParameter1 = "Font";
					break;
				case "sapUiTileIconColor":
					var sClass = "6";
					var sTheming ="Base";
					var sControlGroup ="Content";
					var sParameter = "Color";
					break;
					// default
				default:
					var sClass = "5";
					var sControlGroup ="";
					var sTheming = "";
					var sParameter ="";
				}

				if (jQuery.sap.startsWithIgnoreCase(sName, "sapui")) {
					if (sap.ui.core.CSSColor.isValid(oParams[sName])) {
						var oEntry = {name : sName, color : oParams[sName], colors: oParams[sName], class : sClass, controlgroup : sControlGroup, theming :sTheming, parameter:sParameter};
						oData.Data.push(oEntry);
					} else {
						var oEntry = {name : sName, color : oParams[sName], colors : undefined, class : sClass, controlgroup : sControlGroup, theming :sTheming, parameter:sParameter};
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
				this._oTableFilterState.aControlgroup = [new Filter("controlgroup", FilterOperator.EQ, "Button")]
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
				this._oTableFilterState.aControlgroup = [new Filter("controlgroup", FilterOperator.EQ, "Chart")]
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
				this._oTableFilterState.aControlgroup = [new Filter("controlgroup", FilterOperator.EQ, "Content")]
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
				this._oTableFilterState.aControlgroup = [new Filter("controlgroup", FilterOperator.EQ, "Field")]
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
				this._oTableFilterState.aControlgroup = [new Filter("controlgroup", FilterOperator.EQ, "Group")]
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
				this._oTableFilterState.aControlgroup = [new Filter("controlgroup", FilterOperator.EQ, "Link")]
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
				this._oTableFilterState.aControlgroup = [new Filter("controlgroup", FilterOperator.EQ, "list")]
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
				this._oTableFilterState.aControlgroup = [new Filter("controlgroup", FilterOperator.EQ, "Page")]
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
				this._oTableFilterState.aControlgroup = [new Filter("controlgroup", FilterOperator.EQ, "Scrollbar")]
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
				this._oTableFilterState.aControlgroup = [new Filter("controlgroup", FilterOperator.EQ, "Shell")]
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
				this._oTableFilterState.aControlgroup = [new Filter("controlgroup", FilterOperator.EQ, "Tile")]
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
				this._oTableFilterState.aControlgroup = [new Filter("controlgroup", FilterOperator.EQ, "Toolbar")]
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
				this._oTableFilterState.aCharacteristic = [new Filter("parameter", FilterOperator.EQ, "Color")]
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
				this._oTableFilterState.aCharacteristic = [new Filter("parameter", FilterOperator.EQ, "Dimension")]
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
				this._oTableFilterState.aCharacteristic = [new Filter("parameter", FilterOperator.EQ, "Image")]
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
				this._oTableFilterState.aCharacteristic = [new Filter("parameter", FilterOperator.EQ, "Opacity")]
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
				this._oTableFilterState.aTheming = [new Filter("theming", FilterOperator.EQ, "Base")]
			} else {
				this._oTableFilterState.aTheming = [];
			}
			this._applyFilterSearch();
		},

		onPressQuick: function(evt){
			if (evt.getSource().getPressed()) {
				sap.ui.getCore().byId("tbExpert").setPressed();
				this._oTableFilterState.aTheming = [new Filter("theming", FilterOperator.EQ, "Quick")]
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
			switch(value){
			case "Belize":
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
				this._oTableFilterState.aSearch = [new Filter("name", FilterOperator.Contains, sQuery)]
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
			}
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
			var oData = this._applyFilterSearch();
			oModel.setData(oData);
		}
	});
});