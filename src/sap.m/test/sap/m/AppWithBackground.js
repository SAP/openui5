sap.ui.define(
    [
        "sap/m/App",
        "sap/m/Page",
        "sap/m/Button",
        "sap/m/Select",
        "sap/m/Slider",
        "sap/ui/core/Item",
        "sap/ui/core/Element"
    ],
    function (App, Page, Button, Select, Slider, Item, Element) {
        "use strict";
        var app = new App("myApp", {
            initialPage: "page1"
        });

        var page1 = new Page("page1", {
            title: "Page 1",
            content: [
                new Button({
                    text: "To Page 2",
                    press: function () {
                        app.to("page2");
                    }
                }),

                // background image switches
                new Button({
                    id: "streched-cheetah-btn",
                    text: "Stretched Cheetah",
                    press: function () {
                        app.setBackgroundImage(
                            "images/demo/nature/huntingLeopard.jpg"
                        );
                        app.setBackgroundColor("");
                        app.setBackgroundOpacity(1);
                        Element.getElementById("opacitySlider").setValue(1);
                        app.setBackgroundRepeat(false);
                        Element.getElementById("repeatSelect").setSelectedKey(
                            "stretch"
                        );
                    }
                }),

                new Button({
                    id: "repeating-translucent-cheetah-btn",
                    text: "Repeating translucent Cheetah",
                    press: function () {
                        app.setBackgroundImage(
                            "images/demo/nature/huntingLeopard.jpg"
                        );
                        app.setBackgroundColor("#f00");
                        app.setBackgroundOpacity(0.6);
                        Element.getElementById("opacitySlider").setValue(0.6);
                        app.setBackgroundRepeat(true);
                        Element.getElementById("repeatSelect").setSelectedKey(
                            "repeat"
                        );
                    }
                }),

                new Button({
                    text: "Clear Background",
                    press: function () {
                        app.setBackgroundImage("");
                        app.setBackgroundColor("");
                        app.setBackgroundOpacity(1);
                        Element.getElementById("opacitySlider").setValue(1);
                        app.setBackgroundRepeat(false);
                        Element.getElementById("repeatSelect").setSelectedKey(
                            "stretch"
                        );
                    }
                }),

                new Select("repeatSelect", {
                    items: [
                        new Item({
                            text: "Stretch background",
                            key: "stretch"
                        }),
                        new Item({ text: "Repeat background", key: "tile" })
                    ],
                    change: function (oEvent) {
                        var selectedItem = oEvent.getParameter("selectedItem");
                        app.setBackgroundRepeat(
                            selectedItem.getKey() === "stretch" ? false : true
                        );
                    }
                }),

                new Slider("opacitySlider", {
                    width: "50%",
                    min: 0,
                    max: 1,
                    step: 0.01,
                    liveChange: function (oEvent) {
                        var value = oEvent.getParameter("value");
                        app.setBackgroundOpacity(value);
                    }
                })
            ]
        });

        var page2 = new Page("page2", {
            title: "Page 2",
            showNavButton: true,
            navButtonText: "Page 1",
            navButtonPress: function () {
                app.back();
            },
            content: [
                new Button({
                    text: "Back to Page 1",
                    press: function () {
                        app.back();
                    }
                })
            ]
        });
        app.addPage(page1).addPage(page2);

        app.placeAt("body");
    }
);
