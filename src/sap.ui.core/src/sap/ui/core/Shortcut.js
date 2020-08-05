/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/util/ShortcutHelper",
	'sap/base/assert',
	'sap/ui/dom/jquery/control'
], function(
		ShortcutHelper,
		assert,
		jQuery
	) {
	"use strict";

	/**
	 * Shortcut is a static class providing means to register shortcut key combinations at certain regions of the UI.
	 *
	 * @private
	 */
	var Shortcut = {
		/**
		 * Registers a shortcut key combination at the region defined by the given control.
		 *
		 * IMPORTANT:
		 * - THIS API DOES NOT GUARANTEE THAT A REGISTERED SHORTCUT WILL WORK IN ALL BROWSER/OPERATING
		 *   SYSTEM/KEYBOARD/LOCALE COMBINATIONS. IT ALSO DOES NOT GUARANTEE THAT A SHORTCUT, WHICH WORKED
		 *   INITIALLY, WILL REMAIN WORKING IN THE FUTURE. BUG REPORTS RELATED TO SPECIFIC KEY COMBINATIONS
		 *   WILL NOT BE HANDLED. BY USING THIS API, YOU AGREE TO THESE TERMS.
		 *
		 * Reason for this strict rule is that some key combinations are simply not available in certain
		 * browsers or browser-OS combinations and that browsers can at any time define new built-in shortcuts
		 * which break this API, without a chance for a workaround.
		 *
		 * Note:
		 * - When a shortcut involving the "Ctrl" key is registered, the shortcut will instead use the "Cmd" key
		 *   on Macs. Example: when "Ctrl+I" is registered, the key combination to press on Macs is "Cmd+I",
		 *   while it is "Ctrl+I" on Windows, Linux and everywhere else.
		 * - When the scope/region control is cloned, the clones will also have the same shortcut registered.
		 * - Shortcut handlers will only be triggered when the keydown event has not already been handled by a child control.
		 * - When the AltGr key is involved, no shortcut handler will be triggered.
		 * - Shortcuts ate not active when the scope/region control is busy or blocked.
		 * - Even though some shortcut key combinations known to be used by browsers are actively blocked, there
		 *   is -as stated above - no guarantee that a successfully registered shortcut will work in all browsers
		 *   and on all platforms and combined with all types of keyboards or will remain working.
		 *
		 * https://www.w3.org/TR/uievents-key/#named-key-attribute-value
		 *
		 * @param {sap.ui.core.Control} oScopeControl the control within which the shortcut key combination should
		 * trigger the callback
		 *
		 * @param {string|object} vShortcut the shortcut key combination, either as human-readable string like
		 * "Ctrl+Alt+Shift+T" ("+"-separated list of optional modifiers, followed by the actual key to press)
		 * or as object with the string "key" and the boolean flags "ctrl", "alt" and "shift".
		 * The string is case-insensitive and the "key" can in both variants be any string matching the following expression:
		 *
		 * /^([a-z0-9\.,\-\*\/=]|Plus|Tab|Space|Enter|Backspace|Home|Delete|End|Pageup|Pagedown|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Escape|F[1-9]|F1[0-2])$/i
		 *
		 * These key names comply with the specification at https://www.w3.org/TR/uievents-key/#named-key-attribute-value
		 *
		 * @param {function} fnCallback the function to be called when the shortcut is pressed by the user.
		 * This callback receives one argument with the following properties:
		 * - registeredShortcut: the vShortcut object or string as given when the shortcut was registered
		 * - originalBrowserEvent: the original keyboard event from the browser. Be careful when using this,
		 * as all browser and platform differences are exposed!
		 *
		 * @throws an exception when the same shortcut is already registered or when a shortcut is attempted to be
		 * registered which is disallowed from being used (because it is known to be already used by browser/OS and
		 * hence in some cases even impossible to register).
		 *
		 * @private
		 */
		register: function(oScopeControl, vShortcut, fnCallback) {
			if (!oScopeControl) {
				throw new Error("Shortcut.register: oScopeControl must be given.");
			}
			if (typeof fnCallback !== "function") {
				throw new Error("Shortcut.register: a function fnCallback must be given.");
			}

			// the platform-dependent shortcut definition
			var oNormalizedShortcutSpec = ShortcutHelper.getNormalizedShortcutSpec(vShortcut);

			// make sure that known "bad" shortcuts are not registered
			ShortcutHelper.validateKeyCombination(oNormalizedShortcutSpec);

			// prevent that a shortcut is used twice in the same scope.
			var existingShortcut = ShortcutHelper.findShortcut(oScopeControl, oNormalizedShortcutSpec);
			if (existingShortcut) {
				throw new Error("Same shortcut is already registered on this element");
			}

			// wrap callback to also trigger a blur on focused control.
			function wrapCallback() {
				var oFocusedElement = document.activeElement,
					oSpan = document.createElement("span"),
					oStaticUiAreaDomRef = sap.ui.getCore().getStaticAreaRef();

				oSpan.setAttribute("tabindex", 0);
				oSpan.setAttribute("id", "sap-ui-shortcut-focus");
				oSpan.style.position = "absolute";
				oSpan.style.top = "50%";
				oSpan.style.bottom = "50%";
				oSpan.style.left = "50%";
				oSpan.style.right = "50%";

				// add span to static-ui-area
				oStaticUiAreaDomRef.appendChild(oSpan);

				// set focus on span to enforce blur - e.g. data of input field needs to get peristed
				oSpan.focus();

				// restore old focus
				oFocusedElement.focus();

				// cleanup DOM
				oStaticUiAreaDomRef.removeChild(oSpan);

				// trigger callback
				fnCallback.apply(null, arguments);

			}

			var oDelegate = {};
			oDelegate["onkeydown"] = ShortcutHelper.handleKeydown.bind(null, oNormalizedShortcutSpec, vShortcut, wrapCallback);

			// listen to keydown events
			oScopeControl.addEventDelegate(oDelegate);

			// store knowledge about this shortcut/delegate, so it can be unregistered again
			var aData = oScopeControl.data("sap.ui.core.Shortcut");
			if (!aData) {
				aData = [];
				oScopeControl.data("sap.ui.core.Shortcut", aData);
			}
			aData.push({
				shortcutSpec: oNormalizedShortcutSpec, // platform-dependent!
				platformIndependentShortcutString: ShortcutHelper.getNormalizedShortcutString(oNormalizedShortcutSpec),
				delegate: oDelegate
			});
		},

		/**
		 * Returns true if the given shortcut is already registered on the given area
		 * @param {sap.ui.core.Control} oScopeControl The control/region at which the shortcut was registered
		 * @param {object|string} vShortcut The shortcut to check. The syntax options are the same as in
		 * register(). It is not required to use the same syntax here.
		 *
		 * @return {boolean} true if the given shortcut is registered on the given control
		 * @private
		 */
		isRegistered: function(oScopeControl, vShortcut) {
			assert(oScopeControl, "Shortcut.isRegistered: oScopeControl must be given.");
			var oNormalizedShortcutSpec = ShortcutHelper.getNormalizedShortcutSpec(vShortcut); // the platform-dependent shortcut definition

			return !!ShortcutHelper.findShortcut(oScopeControl, oNormalizedShortcutSpec);
		},

		/**
		 * Unregisters the given shortcut from the given scope/region control.
		 * This does not unregister the shortcut from any clone of the scope/region control.
		 *
		 * @param {sap.ui.core.Control} oScopeControl the control/region at which the shortcut was registered
		 * @param {object|string} vShortcut the shortcut to unregister. The syntax options are the same as in register(). It is not required to use the same syntax here.
		 * @return {boolean} true if a shortcut was found and unregistered
		 * @private
		 */
		unregister: function(oScopeControl, vShortcut) {
			assert(oScopeControl, "Shortcut.unregister: oScopeControl must be given.");

			// the platform-dependent shortcut definition
			var oNormalizedShortcutSpec = ShortcutHelper.getNormalizedShortcutSpec(vShortcut);

			var oShortcutData = ShortcutHelper.findShortcut(oScopeControl, oNormalizedShortcutSpec);
			if (oShortcutData) {
				// remove delegate
				oScopeControl.removeEventDelegate(oShortcutData.delegate);

				// also remove the shortcut data
				var aData = oScopeControl.data("sap.ui.core.Shortcut");
				var index = aData.indexOf(oShortcutData);
				aData.splice(index, 1);
				return true;
			}
			return false;
		}
	};

	return Shortcut;
});