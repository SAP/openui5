/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/CommandExecution",
	"sap/ui/core/Lib"
],
	function(Log, CommandExecution, Library) {
		"use strict";

		/**
		 * A helper class that provides the shortcut text by given control and config.
		 * @param {sap.ui.core.Control} oControl The control registered to display the shortcut
		 * @param {object} oConfig Settings object - it contains the hint provider method at least
		 * @param {string} oConfig.commandName The command name for which a shortcut is displayed
		 * @param {string} oConfig.messageBundleKey The messagebundle key that will be translated and used as a shortcut hint
		 * @private
		 */
		var ShortcutHint = function(oControl, oConfig) {
			this.oControl = oControl;
			this.oConfig = oConfig;
		};

		ShortcutHint.prototype._getShortcutText = function() {
			var sText;
			if (this.oConfig.commandName) {
				sText = this._getShortcutHintFromCommandExecution(this.oControl, this.oConfig.commandName);
			} else if (this.oConfig.message) {
				sText = this.oConfig.message;
			} else if (this.oConfig.messageBundleKey) {
				sText = this._getShortcutHintFromMessageBundle(this.oControl, this.oConfig.messageBundleKey);
			}

			return sText;
		};

		ShortcutHint.prototype._getShortcutHintFromCommandExecution = function(oControl, sCommandName) {
			try {
				return CommandExecution.find(oControl, sCommandName)
					._getCommandInfo().shortcut;
			} catch (e) {
				Log.error("Error on retrieving command shortcut. Command "
					+ sCommandName + " was not found!");
			}
		};

		ShortcutHint.prototype._getShortcutHintFromMessageBundle = function(oControl, sMessageBundleKey) {
			var oResourceBundle = Library.getResourceBundleFor(oControl.getMetadata().getLibraryName());

			return oResourceBundle.getText(sMessageBundleKey);
		};

		return ShortcutHint;
	}
);