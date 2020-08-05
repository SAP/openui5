sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/m/Panel',
    'sap/m/Text'
], function (Controller, Panel, Text) {
    "use strict";

    return Controller.extend("sap.m.sample.PageFloatingFooter.controller.PageFloatingFooter", {
        onInit: function () {
            this._Page = this.byId("floatingFooterPage");
            for (var i = 0; i < 15; i++) {
                this.addPanel();
            }
        },
        toggleVisibility: function () {
            this._Page.setShowFooter(!this._Page.getShowFooter());
        },
        toggleFooter: function () {
            this._Page.setFloatingFooter(!this._Page.getFloatingFooter());
        },
        addPanel: function () {
            var panelUnit = new Panel({
                content: new Text({
                    text: "Lorem ipsum dolor st amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat"
                })
            });
            this._Page.addContent(panelUnit);
        },
        removePanel: function () {
            this._Page.removeContent(4);
        }
    });
});
