sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/core/sample/MessageManager/BasicODataMessages/localService/mockserver"
], function(Controller, ODataModel, mockserver) {
    "use strict";

    return Controller.extend("sap.ui.core.sample.MessageManager.BasicODataMessages.Controller", {

        onInit : function () {

            var sODataServiceUrl, oMessageManager;

            // set message model
            oMessageManager = sap.ui.getCore().getMessageManager();
            this.getView().setModel(oMessageManager.getMessageModel(), "message");

            // activate automatic message generation for complete view
            oMessageManager.registerObject(this.getView(), true);

            sODataServiceUrl = "/here/goes/your/odata/service/url/";

            // init our mock server
            mockserver.init(sODataServiceUrl);

            // Northwind service
            this.getView().setModel(
                new ODataModel(sODataServiceUrl, {
                    defaultBindingMode : "TwoWay"
                })
            );

            this.getView().bindElement("/Employees(1)");

        },

        onMessagePopoverPress : function (oEvent) {
            this._getMessagePopover().openBy(oEvent.getSource());
        },

        onDelete : function (oEvent) {
            var sPath = this.getView().getBindingContext().getPath();
            this.getView().getModel().remove(sPath);
        },

        onClearPress : function(){
            sap.ui.getCore().getMessageManager().removeAllMessages();
        },

        //################ Private APIs ###################

        _getMessagePopover : function () {
            // create popover lazily (singleton)
            if (!this._oMessagePopover) {
                // create popover lazily (singleton)
                this._oMessagePopover = sap.ui.xmlfragment(this.getView().getId(), "sap.ui.core.sample.MessageManager.BasicODataMessages.MessagePopover", this);
                this.getView().addDependent(this._oMessagePopover);
            }
            return this._oMessagePopover;
        }

    });

});
