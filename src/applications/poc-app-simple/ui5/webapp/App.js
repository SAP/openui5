sap.ui.define(["poc/lib/Core"], function(Core) {
    sap.ui.require(["sap/ui/core/Control", "poc/lib/ES6Magic"], function(Control) {

        Core.attachInit(function() {

            class MyControl extends Control {
                onclick() {
                    this.fireClick();
                }
            };

            MyControl.describeClass("my.Control", {
                metadata: {
                    properties: {
                        text: "string"
                    },
                    events: {
                        click: "click"
                    }
                },
                renderer: {
                    apiVersion: 2,
                    render: function(rm, ctr) {
                        rm.openStart("button", ctr);
                        rm.class("myButton");
                        rm.openEnd();
                        rm.text(ctr.getText());
                        rm.close("button");
                    }
                }
            });

            new MyControl({
                text: "Hello World",
                click: function() {
                    alert(this.getText());
                }
            }).placeAt(document.body);
        });
    });
});
