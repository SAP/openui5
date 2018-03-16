sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/BindingMode",
    "sap/ui/core/message/Message",
    "sap/ui/core/MessageType",
    "sap/ui/core/ValueState",
    "sap/m/MessageToast"
], function(Controller, JSONModel, BindingMode, Message, MessageType, ValueState, MessageToast) {
    "use strict";

    return Controller.extend("sap.ui.core.sample.MessageManager.BasicMessages.Controller", {

        onInit : function () {
            var oMessageManager, oModel, oView;

            oView = this.getView();

            // set message model
            oMessageManager = sap.ui.getCore().getMessageManager();
            oView.setModel(oMessageManager.getMessageModel(), "message");

            // or just do it for the whole view
            oMessageManager.registerObject(oView, true);

            // create a default model with somde demo data
            oModel = new JSONModel({
                MandatoryInputValue: "",
                DateValue: null,
                IntegerValue: undefined,
                Dummy: ""
            });
            oModel.setDefaultBindingMode(BindingMode.TwoWay);
            oView.setModel(oModel);

        },

        onMessagePopoverPress : function (oEvent) {
            this._getMessagePopover().openBy(oEvent.getSource());
        },

        onSuccessPress : function(){
            var oMessage = new Message({
                message: "My generated success message",
                type: MessageType.Success,
                target: "/Dummy",
                processor: this.getView().getModel()
            });
            sap.ui.getCore().getMessageManager().addMessages(oMessage);
        },

        onErrorPress : function(){
            var oMessage = new Message({
                message: "My generated error message",
                type: MessageType.Error,
                target: "/Dummy",
                processor: this.getView().getModel()
            });
            sap.ui.getCore().getMessageManager().addMessages(oMessage);
        },

        onWarningPress : function(){
            var oMessage = new Message({
                message: "My generated warning message",
                type: MessageType.Warning,
                target: "/Dummy",
                processor: this.getView().getModel()
            });
            sap.ui.getCore().getMessageManager().addMessages(oMessage);
        },

        onInfoPress : function(){
            var oMessage = new Message({
                message: "My generated info message",
                type: MessageType.Information,
                target: "/Dummy",
                processor: this.getView().getModel()
            });
            sap.ui.getCore().getMessageManager().addMessages(oMessage);
        },

        onValueStatePress : function(){
            var oInput = this.getView().byId("valuesStateOnly");
            oInput.setValueState(ValueState.Error);
            oInput.setValueStateText("My ValueState text for Error");
        },

        onClearPress : function(){
            // does not remove the manually set ValueStateText we set in onValueStatePress():
            sap.ui.getCore().getMessageManager().removeAllMessages();
        },

        //################ Private APIs ###################

        _getMessagePopover : function () {
            // create popover lazily (singleton)
            if (!this._oMessagePopover) {
                this._oMessagePopover = sap.ui.xmlfragment(this.getView().getId(),"sap.ui.core.sample.MessageManager.BasicODataMessages.MessagePopover", this);
                this.getView().addDependent(this._oMessagePopover);
            }
            return this._oMessagePopover;
        }

    });

});
