import library from "sap/ui/core/library";
import Log from "sap/base/Log";
import LabelEnablement from "sap/ui/core/LabelEnablement";
var ValueState = library.ValueState;
var MessageMixin = function () {
    this.refreshDataState = refreshDataState;
    this.fnDestroy = this.destroy;
    this.destroy = destroy;
};
function refreshDataState(sName, oDataState) {
    if (oDataState.getChanges().messages && this.getBinding(sName) && this.getBinding(sName).isA("sap.ui.model.PropertyBinding")) {
        var aMessages = oDataState.getMessages();
        var aLabels = LabelEnablement.getReferencingLabels(this);
        var sLabelId = aLabels[0];
        var bForceUpdate = false;
        aMessages.forEach(function (oMessage) {
            if (aLabels && aLabels.length > 0) {
                var oLabel = sap.ui.getCore().byId(sLabelId);
                if (oLabel.getMetadata().isInstanceOf("sap.ui.core.Label") && oLabel.getText && oMessage.getAdditionalText() !== oLabel.getText()) {
                    oMessage.setAdditionalText(oLabel.getText());
                    bForceUpdate = true;
                }
                else {
                    Log.warning("sap.ui.core.message.Message: Can't create labelText." + "Label with id " + sLabelId + " is no valid sap.ui.core.Label.", this);
                }
            }
            if (oMessage.getControlId() !== this.getId()) {
                oMessage.addControlId(this.getId());
                bForceUpdate = true;
            }
        }.bind(this));
        var oMessageModel = sap.ui.getCore().getMessageManager().getMessageModel();
        oMessageModel.checkUpdate(bForceUpdate, true);
        if (aMessages && aMessages.length > 0) {
            var oMessage = aMessages[0];
            if (ValueState[oMessage.type]) {
                this.setValueState(oMessage.type);
                this.setValueStateText(oMessage.message);
            }
        }
        else {
            this.setValueState(ValueState.None);
            this.setValueStateText("");
        }
    }
}
function destroy() {
    var sControlId = this.getId();
    function removeControlID(oMessage) {
        oMessage.removeControlId(sControlId);
    }
    for (var sName in this.mBindingInfos) {
        var oBindingInfo = this.mBindingInfos[sName];
        if (oBindingInfo.binding) {
            var oDataState = oBindingInfo.binding.getDataState();
            var aMessages = oDataState.getMessages();
            aMessages.forEach(removeControlID);
        }
    }
    this.fnDestroy.apply(this, arguments);
}