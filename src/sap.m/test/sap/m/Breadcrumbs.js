sap.ui.define(
    [
        "sap/m/App",
        "sap/m/Page",
        "sap/m/Link",
        "sap/m/Breadcrumbs",
        "sap/m/MessageToast",
        "sap/m/Input",
        "sap/m/Label",
        "sap/m/Button",
        "sap/ui/layout/VerticalLayout",
        "sap/m/Slider",
        "sap/m/Panel",
        "sap/m/Select",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/Item",
		"sap/m/library"
    ],
    function (
        App,
        Page,
        Link,
        Breadcrumbs,
        MessageToast,
        Input,
        Label,
        Button,
        VerticalLayout,
        Slider,
        Panel,
        Select,
		JSONModel,
		Item,
		mLibrary
    ) {
        "use strict";

		var BreadcrumbsSeparatorStyle = mLibrary.BreadcrumbsSeparatorStyle;

		var fnLinkPressHandler = function (oEvent) {
                MessageToast.show(
                    oEvent.getSource().getText() + " has been activated"
                );
            },
            fnGetLink = function (sLinkText) {
                return new Link({
                    text: sLinkText,
                    press: fnLinkPressHandler
                });
            },
            fnLinkGenerator = function (iNumberOfLinks, sLinkText) {
                var aListOfLinks = [];
                sLinkText = sLinkText || "Link";

                for (var i = 1; i <= iNumberOfLinks; i++) {
                    aListOfLinks.push(fnGetLink(sLinkText + i));
                }

                return aListOfLinks;
            },
            fnUpdateBreadcrumbsWidth = function () {
                oBreadcrumbs.$().css("width", sBreadcrumbWidth);
            },
            oBreadcrumbsSeparatorStyle = [],
            oTestDataModel = new JSONModel({
                currentLocationText: "Current location",
                indexOfLinkToRemove: 0,
                items: []
            }),
            sBreadcrumbWidth = "auto",
            oBreadcrumbs = new Breadcrumbs({
                id: "breadcrumbs_0",
                currentLocationText: "{separatorData}",
                links: fnLinkGenerator(10, "NormalLink")
            }).addEventDelegate({ onAfterRendering: fnUpdateBreadcrumbsWidth }),
            oBreadcrumbsWithSelect = new Breadcrumbs("breadCrumbWithSelect", {
                currentLocationText: "currentLocationText",
                links: fnLinkGenerator(10, "NormalLink")
            }).addEventDelegate({
                onAfterRendering: function () {
                    oBreadcrumbsWithSelect.$().css("width", "100px");
                }
            }),
            oItemTemplate = new Item({
                key: "{text}",
                text: "{key}"
            }),
            oSeparatorSelect = new Select({
                id: "separator_select",
                items: {
                    path: "/items",
                    template: oItemTemplate
                },
                change: function (oControlEvent) {
                    oBreadcrumbs.setSeparatorStyle(
                        oControlEvent.getParameter("selectedItem").getKey()
                    );
                }
            }),
            oSeparatorSelectLabel = new Label({
                text: "Breadcrumbs separator style:",
                labelFor: "separator_select"
            }),
            oSeparatorVerticalLayout = new VerticalLayout({
                content: [oSeparatorSelectLabel, oSeparatorSelect]
            }),
            oApp = new App(),
            oAddLinkLabel = new Label({ text: "Link text:" }),
            oRemoveLinkAtIndexLabel = new Label({
                text: "Remove link at index:"
            }),
            oAddLinkInput = new Input(),
            oChangeCurrentLocationTextLabel = new Label({
                text: "Current location text:"
            }),
            oChangeCurrentLocationTextInput = new Input({
                value: "{currentLocationText}"
            }),
            oIndexOfLinkToRemoveInput = new Input({
                value: "{indexOfLinkToRemove}"
            }),
            oAddLinkButton = new Button({
                text: "Add a link",
                press: function () {
                    oBreadcrumbs.addLink(fnGetLink(oAddLinkInput.getValue()));
                }
            }),
            oRemoveAllLinksButton = new Button({
                text: "Remove all links",
                press: function () {
                    oBreadcrumbs.removeAllLinks();
                }
            }),
            oRemoveLinkAtIndexButton = new Button({
                text: "Remove link at index",
                press: function () {
                    var oLinkToRemove =
                        oBreadcrumbs.getLinks()[
                            oIndexOfLinkToRemoveInput.getValue()
                        ];
                    oBreadcrumbs.removeLink(oLinkToRemove);
                }
            }),
            fnSliderChangeHandler = function (oControlEvent) {
                sBreadcrumbWidth = oControlEvent.getParameter("value");
                if (sBreadcrumbWidth === 100) {
                    sBreadcrumbWidth = "auto";
                } else {
                    sBreadcrumbWidth += "%";
                }

                fnUpdateBreadcrumbsWidth();
            },
            oSlider = new Slider({
                value: 100,
                liveChange: fnSliderChangeHandler,
                change: fnSliderChangeHandler
            }),
            oVerticalLayoutAddLink = new VerticalLayout({
                content: [
                    oAddLinkLabel,
                    oAddLinkInput,
                    oAddLinkButton,
                    oRemoveAllLinksButton
                ]
            }),
            oVerticalLayoutEditCurrentLocation = new VerticalLayout({
                content: [
                    oChangeCurrentLocationTextLabel,
                    oChangeCurrentLocationTextInput
                ]
            });

        Object.keys(BreadcrumbsSeparatorStyle).forEach(function (item) {
            oBreadcrumbsSeparatorStyle.push({
                key: item,
                text: BreadcrumbsSeparatorStyle[item]
            });
        });

        oSeparatorSelect.setModel(oTestDataModel);

        oTestDataModel.setProperty("/items", oBreadcrumbsSeparatorStyle);

        oApp.addPage(
            new Page({
                title: "Breadcrumbs",
                content: [
                    new Panel({
                        content: [
                            oSeparatorVerticalLayout,
                            oBreadcrumbs,
                            oSlider,
                            oVerticalLayoutAddLink,
                            oVerticalLayoutEditCurrentLocation,
                            oRemoveLinkAtIndexLabel,
                            oIndexOfLinkToRemoveInput,
                            oRemoveLinkAtIndexButton,
                            oBreadcrumbsWithSelect
                        ]
                    })
                ]
            })
        ).placeAt("content");
    }
);
