import Log from "sap/base/Log";
import Core from "sap/ui/core/Core";
import CommandExecution from "sap/ui/core/CommandExecution";
var ShortcutHint = function (oControl, oConfig) {
    this.oControl = oControl;
    this.oConfig = oConfig;
};
ShortcutHint.prototype._getShortcutText = function () {
    var sText;
    if (this.oConfig.commandName) {
        sText = this._getShortcutHintFromCommandExecution(this.oControl, this.oConfig.commandName);
    }
    else if (this.oConfig.message) {
        sText = this.oConfig.message;
    }
    else if (this.oConfig.messageBundleKey) {
        sText = this._getShortcutHintFromMessageBundle(this.oControl, this.oConfig.messageBundleKey);
    }
    return sText;
};
ShortcutHint.prototype._getShortcutHintFromCommandExecution = function (oControl, sCommandName) {
    try {
        return CommandExecution.find(oControl, sCommandName)._getCommandInfo().shortcut;
    }
    catch (e) {
        Log.error("Error on retrieving command shortcut. Command " + sCommandName + " was not found!");
    }
};
ShortcutHint.prototype._getShortcutHintFromMessageBundle = function (oControl, sMessageBundleKey) {
    var oResourceBundle = Core.getLibraryResourceBundle(oControl.getMetadata().getLibraryName());
    return oResourceBundle.getText(sMessageBundleKey);
};