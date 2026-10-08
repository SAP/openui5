/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/CommandExecution",
	"sap/ui/core/Lib",
	"sap/ui/core/util/ShortcutHelper"
],
	function(Log, CommandExecution, Library, ShortcutHelper) {
		"use strict";

		/**
		 * A helper class that provides the shortcut text by given control and config.
		 * @param {sap.ui.core.Control} oControl The control registered to display the shortcut
		 * @param {object} oConfig Settings object - it contains the hint provider method at least
		 * @param {string} oConfig.commandName The command name for which a shortcut is displayed
		 * @param {string} oConfig.message The message to be displayed as a shortcut hint. The message is used as-is; no additional localization or normalization is applied.
		 * @param {string} oConfig.messageBundleKey The key used to retrieve the message from the control library's message bundle. The returned text is used as-is; no additional localization or normalization is applied.
		 * @param {string} oConfig.shortcut The raw shortcut text, that will be normalized and localized and used as a shortcut hint
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
			} else if (this.oConfig.shortcut) {
				sText = this.oConfig.shortcut;
				sText = ShortcutHelper.localizeKeys(ShortcutHelper.normalizeShortcutText(sText));
			}

			return sText;
		};

		ShortcutHint.prototype._getShortcutHintFromCommandExecution = function(oControl, sCommandName) {
			try {
				const vShortcut = CommandExecution.find(oControl, sCommandName)._getCommandInfo().shortcut;
				const bMacLiteral = ShortcutHelper.isPlatformShortcutMacLiteral(vShortcut);
				const sShortcut = ShortcutHelper.getPlatformShortcut(vShortcut);
				return ShortcutHelper.localizeKeys(ShortcutHelper.normalizeShortcutText(sShortcut, bMacLiteral));
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