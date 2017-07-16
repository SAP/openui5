/*******************************************************************************
 * Note: This file intentionally contains errors for illustration purposes!    *
 *  The Troubleshooting Tutorial in the official UI5 documentation will show   *
 *  how to analyze and debug them with the support tools delivered by UI5.     *
 ******************************************************************************/
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/m/MessageBox',
    'jquery.sap.global'
], function (Controller, MessageBox, jQuery) {
    "use strict";

    return Controller.extend("sap.ui.demo.HeapOfShards.controller.App", {

        constructor: function () {
            jQuery.sap.require("jquery.sap.resources");
            var sLocale = sap.ui.getCore().getConfiguration().getLanguage();
            this.oBundle = jQuery.sap.resources({url: "i18n/i18n.properties", locale: sLocale});
        },

        onSelect: function (oEvent) {

            MessageBox.information(this.oBundle.getText("selectEventMessage", [oEvent.getId()]));
        }
    });
});