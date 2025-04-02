/*
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Lib"
], function(Library) {
	"use strict";

	// Standarized SAP commands with their respective shortcuts and descriptions.
	const mSapCommands = {
		"sap:share": {
			shortcut: "Ctrl+Shift+S",
			description: "{{SAP_SHARE}}"
		},
		"sap:create": {
			shortcut: "Ctrl+Enter",
			description: "{{SAP_CREATE}}"
		},
		"sap:edit": {
			shortcut: "Ctrl+E",
			description: "{{SAP_EDIT}}"
		},
		"sap:save": {
			shortcut: "Ctrl+S",
			description: "{{SAP_SAVE}}"
		},
		"sap:delete": {
			shortcut: "Ctrl+D",
			description: "{{SAP_DELETE}}"
		}
	};

	const _rManifestTemplate = /\{\{([^\}\}]+)\}\}/g;

	/**
	 * Module for resolving command references in the manifest.
	 *
	 * The resolve function processes command references and resolves them with their predefined shortcuts
	 * if available in the SAP standard commands.
	 *
	 * @private
	 */
	return {
		/**
		 * Resolves command references in the given manifest object.
		 *
		 * @param  {sap.ui.core.Manifest} oManifest The manifest object containing command configurations.
		 * @throws {TypeError} Throws and error if an invalid command reference is encountered.
		 */
		resolve(oManifest) {
			const mCommands = oManifest.getEntry("/sap.ui5/commands") || {};

			Object.keys(mCommands).forEach((sCommand) => {
				const oObject = mCommands[sCommand];

				if (oObject.ref) {
					if (oObject.shortcut) {
						throw new TypeError(`If a command reference 'ref' is specified in the 'sap.ui5/commands' section of the manifest, the 'shortcut' property must be omitted.`);
					}

					const sValue = oObject.ref;
					const oSapCommand = mSapCommands[sValue];
					if (!oSapCommand) {
						throw new TypeError(`The given reference '${sValue}' in the 'sap.ui5/commands' section of the manifest is not valid.`);
					}
					oObject.ref = undefined; // resolve with shortcut
					oObject.shortcut = oSapCommand.shortcut;

					if (!oObject.description) { // Description from manifest always wins
						const oResourceBundle = Library.getResourceBundleFor("sap.ui.core");
						oObject.description = oSapCommand.description.replace(_rManifestTemplate, (sMatch, sI18nKey) => oResourceBundle.getText(sI18nKey));
					}
				}
			});
		}
	};
});
