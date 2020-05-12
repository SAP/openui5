/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/events/checkMouseEnterOrLeave",
	'sap/ui/dom/containsOrEquals',
	"sap/ui/core/Element",
	"sap/ui/core/CommandExecution"
],
	function(checkMouseEnterOrLeave, containsOrEquals, Element, CommandExecution) {
		"use strict";

		var oSingletonInstance = Object.create(null);
		oSingletonInstance.mRegisteredControls = {};

	/*
	 * A registry for all controls interested in showing command shortcuts.
	 * @private
	 */
		var CommandShortcutHints = function() {
			throw new Error();
		};

		/*
		 * Registers the control for showing a commands' shortcut hint on focus and
		 * on hover.
		 */
		CommandShortcutHints.register = function(oControl, sCommandName) {
			oSingletonInstance.mRegisteredControls[oControl.getId()] = sCommandName;

			oControl.addEventDelegate({
				"onfocusin": function(oEvent) {
					var oShortcutHintRef = oControl.getShortcutHintRef();

					if (!containsOrEquals(oShortcutHintRef, oEvent.target)) {
						return;
					}

					CommandShortcutHints.hideAll();

					oControl.updateAccessibilityLabel();
					oControl.showShortcutHint();
				}
			}, oControl);

			oControl.addEventDelegate({
				"onfocusout": function(oEvent) {
					var oShortcutHintRef = oControl.getShortcutHintRef();

					if (!containsOrEquals(oShortcutHintRef, oEvent.target)) {
						return;
					}

					var sShortcut = CommandExecution.find(oControl, sCommandName)._getCommandInfo().shortcut;
					oControl.hideShortcutHint(sShortcut);
				}
			}, oControl);

			oControl.addEventDelegate({
				"onmouseover": function(oEvent) {
					var oShortcutHintRef = oControl.getShortcutHintRef();

					if (!containsOrEquals(oShortcutHintRef, oEvent.target)) {
						return;
					}

					if (checkMouseEnterOrLeave(oEvent, oShortcutHintRef)) {
						CommandShortcutHints.hideAll();

						oControl.showShortcutHint();
					}
				}
			}, oControl);

			oControl.addEventDelegate({
				"onmouseout": function(oEvent) {
					var oShortcutHintRef = oControl.getShortcutHintRef();

					if (!containsOrEquals(oShortcutHintRef, oEvent.target)) {
						return;
					}

					if (checkMouseEnterOrLeave(oEvent, oShortcutHintRef)) {
						// do not hide if the element is focused
						if (containsOrEquals(oShortcutHintRef, document.activeElement)) {
							return;
						}

						var sShortcut = CommandExecution.find(oControl, sCommandName)._getCommandInfo().shortcut;
						oControl.hideShortcutHint(sShortcut);
					}
				}
			}, oControl);
		};

		/*
		 * Hides the shortcuts hints for all registered controls.
		 */
		CommandShortcutHints.hideAll = function() {
			var oControl;
			for (var sControlId in oSingletonInstance.mRegisteredControls) {
				oControl = Element.registry.get(sControlId);

				if (oControl) {
					oControl.hideShortcutHint();
				}
			}
		};

		/*
		 * Gets the command name and the shortcut for a control.
		 */
		CommandShortcutHints.getCommandForControl = function(sControlId) {
			var oControl = Element.registry.get(sControlId),
				sCommandName = oSingletonInstance.mRegisteredControls[sControlId];

			if (!sCommandName) {
				return;
			}

			return {
				commandName: sCommandName,
				shortcut: CommandExecution.find(oControl, sCommandName)._getCommandInfo().shortcut
			};
		};

		return CommandShortcutHints;
	}
);