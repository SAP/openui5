sap.ui.define(["sap/base/i18n/Localization", "sap/ui/thirdparty/jquery", "sap/m/library", "sap/m/ActionSheet", "sap/m/Button", "sap/m/MessageToast", "sap/ui/model/json/JSONModel", "sap/m/NumericContent", "sap/m/TileContent", "sap/m/GenericTile", "sap/m/NewsContent", "sap/m/FeedContent", "sap/suite/ui/microchart/ColumnMicroChart", "sap/suite/ui/microchart/ColumnMicroChartData", "sap/m/Input", "sap/m/Label", "sap/m/Slider", "sap/m/Select", "sap/ui/core/Item", "sap/m/CheckBox", "sap/ui/layout/Grid", "sap/ui/layout/form/SimpleForm", "sap/ui/core/Title", "sap/m/Page", "sap/m/App", "sap/ui/util/Mobile", "sap/base/util/UriParameters"], function(Localization, jQuery, mobileLibrary, ActionSheet, Button, MessageToast, JSONModel, NumericContent, TileContent, GenericTile, NewsContent, FeedContent, ColumnMicroChart, ColumnMicroChartData, Input, Label, Slider, Select, Item, CheckBox, Grid, SimpleForm, Title, Page, App, Mobile, UriParameters) {
    "use strict";

    // shortcut for sap.m.InputType
    const InputType = mobileLibrary.InputType;

    // shortcut for sap.m.WrappingType
    const WrappingType = mobileLibrary.WrappingType;

    // shortcut for sap.m.DeviationIndicator
    const DeviationIndicator = mobileLibrary.DeviationIndicator;

    // shortcut for sap.m.ValueColor
    const ValueColor = mobileLibrary.ValueColor;

    // shortcut for sap.m.GenericTileScope
    const GenericTileScope = mobileLibrary.GenericTileScope;

    // shortcut for sap.m.LoadState
    const LoadState = mobileLibrary.LoadState;

    // shortcut for sap.m.FrameType
    const FrameType = mobileLibrary.FrameType;

    // shortcut for sap.m.GenericTileMode
    const GenericTileMode = mobileLibrary.GenericTileMode;

    Mobile.init();

    var oGenericTileData = {
        mode: GenericTileMode.ContentMode,
        subheader: "Expenses By Region",
        header: "Comparative Annual Totals",
        tooltip: "",
        footerNum: "Actual and Target",
        footerComp: "Compare across regions",
        scale: "MM",
        unit: "EUR",
        value: "1700",
        width: 174,
        padding: true,
        frameType: FrameType.OneByOne,
        state: LoadState.Loaded,
        scope: GenericTileScope.Display,
        valueColor: ValueColor.Error,
        indicator: DeviationIndicator.Up,
        title: "US Profit Margin",
        footer: "Current Quarter",
        description: "Maximum deviation",
        imageDescription: "",
        backgroundImage: "images/NewsImage1.png",
        newsTileContent: [{
            footer: "August 21, 2013",
            contentText: "SAP Unveils Powerful New Player Comparison Tool Exclusively on NFL.com",
            subheader: "SAP News"
        }],
        feedTileContent: [{
            footer: "New Notifications",
            contentText: "@@notify Great outcome of the Presentation today. New functionality well received.",
            subheader: "About 1 minute ago in Computer Market"
        }],
        frameTypes: [FrameType.OneByOne, FrameType.TwoByOne],
        indicators: Object.keys(DeviationIndicator),
        modes: Object.keys(GenericTileMode),
        states: Object.keys(LoadState),
        scopes: Object.keys(GenericTileScope),
        wrappingTypes: Object.keys(WrappingType),
        wrappingType: WrappingType.Normal
    };

    var fnPress = function (oEvent) {
        if (oEvent.getParameter("scope") === GenericTileScope.Actions &&
                oEvent.getParameter("action") === "Press") {
            var oActionSheet = new ActionSheet({
                title: "Choose Your Action",
                showCancelButton: true,
                placement: "Bottom",
                buttons: [
                    new Button({
                        text: "Move"
                    }),
                    new Button({
                        text: "Whatever"
                    })
                ],
                afterClose: function () {
                    oActionSheet.destroy();
                }
            });
            oActionSheet.openBy(oEvent.getParameter("domRef"));
        } else {
            MessageToast.show("Action " + oEvent.getParameter("action") + " on " + oEvent.getSource().getId() + " pressed.");
        }
    };

    function setDefaultParameters(oData) {
        var sName;
        var oUriParameters = UriParameters.fromQuery(window.location.search);

        for (sName in oData) {
            if (oData.hasOwnProperty(sName) && typeof oData[sName] === 'string') {
                if (oUriParameters.get(sName) !== null) {
                    oData[sName] = oUriParameters.get(sName);
                }
            }
        }
    }

    setDefaultParameters(oGenericTileData);

    var oGenericTileModel = new JSONModel(oGenericTileData);

    var oNVConfContS = new NumericContent("numeric-cont-l", {
        value: "{/value}",
        scale: "{/scale}",
        indicator: "{/indicator}",
        formatterValue: "{/isFormatterValue}",
        truncateValueTo: "{/truncateValueTo}",
        valueColor: "{/valueColor}",
        icon:  "sap-icon://line-charts",
        withMargin: true,
        width: "100%"
    });

    var oNVConfS = new TileContent("numeric-tile-cont-l", {
        unit: "{/unit}",
        footer: "{/footerNum}",
        content: oNVConfContS
    });

    var oGenericTile1 = new GenericTile({
        mode: "{/mode}",
        subheader: "{/subheader}",
        frameType: "{/frameType}",
        header: "{/header}",
        tooltip: "{/tooltip}",
        state: "{/state}",
        scope: "{/scope}",
        headerImage: "{/headerImage}",
        wrappingType: "{/wrappingType}",
        imageDescription: "{/imageDescription}",
        press: fnPress,
        failedText: "{/failedText}",
        tileContent: [oNVConfS]
    });
    oGenericTile1.addStyleClass("sapUiTinyMargin");
    oGenericTile1.bindProperty("width", "/width", function (sValue) {
        return sValue + "px";
    });

    var oNumCnt2x1 = new NumericContent("numeric-cont-2x1", {
        value: "{/value}",
        scale: "{/scale}",
        indicator: "{/indicator}",
        // truncateValueTo : 14,
        valueColor: "{/valueColor}",
        icon:  "sap-icon://line-charts",
        withMargin: false,
        width: "100%"
    });

    var oTc2x1 = new TileContent("comp-tile-cont-2x1", {
        unit: "{/unit}",
        footer: "{/footerComp}",
        frameType: FrameType.TwoByOne,
        content: oNumCnt2x1
    });

    var oGenericTile2 = new GenericTile({
        mode: "{/mode}",
        tooltip: "{/tooltip}",
        subheader: "{/subheader}",
        frameType: FrameType.TwoByOne,
        header: "{/header}",
        state: "{/state}",
        scope: "{/scope}",
        headerImage: "{/headerImage}",
        imageDescription: "{/imageDescription}",
        wrappingType: "{/wrappingType}",
        press: fnPress,
        failedText: "{/failedText}",
        tileContent: [oTc2x1]
    });
    oGenericTile2.addStyleClass("sapUiTinyMargin");
    oGenericTile2.bindProperty("width", "/width", function (sValue) {
        return sValue + "px";
    });


    var oNewsTileContent = new TileContent("news-tile-cont-2x1", {
        footer: "{footer}",
        frameType: FrameType.TwoByOne,
        content: new NewsContent({
            contentText: "{contentText}",
            subheader: "{subheader}"
        })
    });

    var oGenericTile3 = new GenericTile({
        mode: "{/mode}",
        tooltip: "{/tooltip}",
        frameType: FrameType.TwoByOne,
        state: "{/state}",
        scope: "{/scope}",
        headerImage: "{/headerImage}",
        imageDescription: "{/imageDescription}",
        backgroundImage: "{/backgroundImage}",
        wrappingType: "{/wrappingType}",
        press: fnPress,
        failedText: "{/failedText}",
        tileContent: {
            template: oNewsTileContent,
            path: "/newsTileContent"
        }
    });
    oGenericTile3.addStyleClass("sapUiTinyMargin");
    oGenericTile3.bindProperty("width", "/width", function (sValue) {
        return sValue + "px";
    });

    var oFeedTileContent = new TileContent("feed-tile-cont-2x1", {
        footer: "{footer}",
        frameType: FrameType.TwoByOne,
        content: new FeedContent({
            contentText: "{contentText}",
            subheader: "{subheader}"
        })
    });

    var oGenericTile4 = new GenericTile({
        mode: "{/mode}",
        tooltip: "{/tooltip}",
        header: "{/header}",
        subheader: "{/subheader}",
        frameType: FrameType.TwoByOne,
        state: "{/state}",
        scope: "{/scope}",
        headerImage: "{/headerImage}",
        imageDescription: "{/imageDescription}",
        wrappingType: "{/wrappingType}",
        press: fnPress,
        failedText: "{/failedText}",
        tileContent: {
            template: oFeedTileContent,
            path: "/feedTileContent"
        }
    });

    var oGenericTile5 = new GenericTile({
        mode: "{/mode}",
        tooltip: "{/tooltip}",
        header: "{/header}",
        subheader: "{/subheader}",
        frameType: FrameType.TwoByOne,
        state: "{/state}",
        scope: "{/scope}",
        headerImage: "{/headerImage}",
        imageDescription: "{/imageDescription}",
        wrappingType: "{/wrappingType}",
        press: fnPress,
        failedText: "{/failedText}",
        tileContent: new TileContent({
            content: new ColumnMicroChart({
                size: "Responsive",
                columns: [
                    new ColumnMicroChartData({
                        value: 65,
                        color: "Error"
                    }),
                    new ColumnMicroChartData({
                        value: 30,
                        color: "Neutral"
                    }),
                    new ColumnMicroChartData({
                        value: 120,
                        color: "Neutral"
                    }),
                    new ColumnMicroChartData({
                        value: 5,
                        color: "Error"
                    }),
                    new ColumnMicroChartData({
                        value: 85,
                        color: "Error"
                    })
                ]
            })
        })
    });

    oGenericTile5.addStyleClass("sapUiTinyMargin");
    oGenericTile5.bindProperty("width", "/width", function (sValue) {
        return sValue + "px";
    });

    oGenericTile4.addStyleClass("sapUiTinyMargin");
    oGenericTile4.bindProperty("width", "/width", function (sValue) {
        return sValue + "px";
    });

    var oTitleInput = new Input("title-value", {
        type: InputType.Text,
        placeholder: 'Enter header ...'
    });
    oTitleInput.bindValue("/header");

    var oTooltipInput = new Input("tooltip-value", {
        type: InputType.Text,
        placeholder: 'Enter tooltip ...'
    });
    oTooltipInput.bindValue("/tooltip");

    // LANGUAGE

    var oWidthLabel = new Label({
        text: "Change width",
        labelFor: "width-change"
    });

    var oWidthSlider = new Slider({
        width: "100%",
        min: 174,
        step: 5,
        max: 600
    });

    oWidthSlider.bindProperty("value", "/width");

    var oLanguageLabel = new Label({
        text: "Change language",
        labelFor: "language-change"
    });

    var oUpdateLanguageSelect = new Select("language-change", {
        items: [
            new Item({key: "en-US", text: "en-US"}),
            new Item({key: "de_CH", text: "de_CH"}),
            new Item({key: "es", text: "es"}),
            new Item({key: "it_CH", text: "it_CH"}),
            new Item({key: "zh_CN", text: "zh_CN"}),
            new Item({key: "es", text: "es"})
        ],
        change: function (oEvent) {
            var sKey = oEvent.getParameter("selectedItem").getKey();
            Localization.setLanguage(sKey);
        }
    });


    var oUpdateValueLbl = new Label({
        text: "Update Value",
        labelFor: "update-value"
    });

    var oUpdateValueInput = new Input("update-value", {
        type: InputType.Text,
        placeholder: 'Enter value for update ...'
    });
    oUpdateValueInput.bindValue("/value");

    var oUpdateScaleLbl = new Label({
        text: "Update Scale",
        labelFor: "update-scale"
    });

    var oUpdateScaleInput = new Input("update-scale", {
        type: InputType.Text,
        placeholder: 'Enter value for scale ...'
    });
    oUpdateScaleInput.bindValue("/scale");

    var oUpdatePaddingLbl = new Label({
        text: "Create padding",
        labelFor: "update-padding"
    });

    var oUpdatePaddingCheckbox = new CheckBox("update-padding", {
        select: function (oEvent) {
            jQuery("body").toggleClass("sapTilePaddingTest");
        }
    });


    var oDescInput = new Input("desc-value", {
        type: InputType.Text,
        placeholder: 'Enter description ...'
    });
    oDescInput.bindValue("/subheader");

    var oFooterInputNum = new Input("footer-num-value", {
        type: InputType.Text,
        placeholder: 'Enter Numeric Footer ...'
    });
    oFooterInputNum.bindValue("/footerNum");

    var oFooterInputComp = new Input("footer-cmp-value", {
        type: InputType.Text,
        placeholder: 'Enter Comp Footer ...'
    });
    oFooterInputComp.bindValue("/footerComp");

    var oUnitInput = new Input("unit-value", {
        type: InputType.Text,
        placeholder: 'Enter Units ...'
    });
    oUnitInput.bindValue("/unit");

    var oFailedInput = new Input("failed-text", {
        type: InputType.Text,
        placeholder: 'Enter failed message...'
    });
    oFailedInput.bindValue("/failedText");


    var oControlForm = new Grid("numeric-content-form", {
        defaultSpan: "XL4 L4 M6 S12",
        content: [oGenericTile1, oGenericTile2, oGenericTile3, oGenericTile4, oGenericTile5]
    });

    var editableSimpleForm = new SimpleForm("controls", {
        maxContainerCols: 2,
        editable: true,
        content: [new Title({ // this starts a new group
            text: "Modify Tile"
        }), oWidthLabel, oWidthSlider, oLanguageLabel, oUpdateLanguageSelect, oUpdateValueLbl, oUpdateValueInput, oUpdateScaleLbl, oUpdateScaleInput, oUpdatePaddingLbl, oUpdatePaddingCheckbox]
    });

    var oPage = new Page("initial-page", {
        showHeader: false,
        content: [oControlForm, editableSimpleForm]
    });
    oPage.setModel(oGenericTileModel);

    //create a mobile App embedding the page and place the App into the HTML document
    new App("myApp", {
        pages: [oPage]
    }).placeAt("content");
});