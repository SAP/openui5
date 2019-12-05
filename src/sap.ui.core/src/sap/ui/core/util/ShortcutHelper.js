/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/Device',
	'sap/ui/events/jquery/EventExtension'
], function(
		Device
		/*jQuery*/
	) {
	"use strict";

	// translates from shortcut specification term in the API to the string given in the event.key property
	var mKeyDefinitionFix = {
		plus: "+",
		space: " "
	};

	// for NumPad Decimal key, find out whether the user has a comma or dot there
	var decimalTest = 1.1;
	var sDecimalSeparator = decimalTest.toLocaleString().substring(1, 2);

	// translates key strings from broken browsers (mostly IE11 and older Edge versions) to standard strings
	var mEventKeyFix = {
		Win: "Meta",
		Scroll: "ScrollLock", // also for Edge
		Spacebar: " ",
		Down: "ArrowDown",
		Left: "ArrowLeft",
		Right: "ArrowRight",
		Up: "ArrowUp",
		Del: "Delete",
		Apps: "ContextMenu",
		Esc: "Escape",
		Multiply: "*",
		Decimal: sDecimalSeparator, // LOCALE-DEPENDENT!!
		OS: "Meta" // Firefox only
	};

	// a very incomplete list of shortcuts which are a bad idea to register and are hence not allowed
	var mDisallowedShortcuts = {
		// a-z
		"ctrl+l": "jump to address bar",
		"ctrl+n": "new window, cannot be registered in Chrome",
		"ctrl+shift+n": "new incognito window, cannot be registered in Chrome",
		"ctrl+alt+shift+p": "UI5 Technical Info",
		"ctrl+q": "quit Chrome in Mac",
		"ctrl+alt+shift+s": "UI5 Support Popup",
		"ctrl+t": "new tab, cannot be registered in Chrome",
		"ctrl+shift+t": "reopen last tab, cannot be registered in Chrome",
		"ctrl+w": "close tab, cannot be registered in Chrome",
		"ctrl+shift+w": "close window, cannot be registered in Chrome",

		// 0-9
		"ctrl+0": "reset zoom",

		// .,-*/=+
		"ctrl+-": "zoom out",
		"ctrl++": "zoom in",
		"ctrl+shift+=": "cannot be handled",

		// Tab|Space|Enter
		"tab": "TAB-based keyboard navigation",
		"shift+tab": "TAB-based keyboard navigation",
		"ctrl+tab": "cycling through tabs, cannot be registered in Chrome",
		"ctrl+shift+tab": "cycling through tabs, cannot be registered in Chrome",

		// Backspace|Home|Delete|End|Pageup|Pagedown|Escape
		"ctrl+alt+delete": "nice try",
		"ctrl+pageup": "cycling through tabs, cannot be registered in Chrome",
		"ctrl+pagedown": "cycling through tabs, cannot be registered in Chrome",

		// ArrowUp|ArrowDown|ArrowLeft|ArrowRight
		"ctrl+alt+left": "cannot be handled in IE",
		"ctrl+alt+right": "cannot be handled in IE",

		// F1-12
		"ctrl+f1": "always opens help menu in IE",
		"ctrl+f4": "always closes tab in IE",
		"f6": "F6-based group navigation",
		"f11": "fullscreen, cannot be registered in Chrome",
		"f12": "browser dev tools"
	};

	// make detectable at any time whether the last time the Alt key was pressed it was the left one or it was AltGr
	var bLastAltWasLeftAlt = false;
	document.addEventListener('keydown', function(e) {
		try {
			if (e.keyCode === 18) { // 'alt' Key
				bLastAltWasLeftAlt = (typeof e.location !== "number" /* location isn't supported */ || e.location === 1 /* left */);
				return;
			}
		} catch (err) {
			// ignore any errors
		}
	});

	var oShortcutHelper = {
		/**
		 * Returns the existing registered matching shortcut on this control or undefined
		 *
		 * @param {sap.ui.core.Control} oScopeControl the control/region at which the shortcut was registered
		 * @param {object} oNormalizedShortcutSpec the normalized shortcut information
		 *
		 * @return {object} Shortcut data
		 * @private
		 */
		findShortcut: function(oScopeControl, oNormalizedShortcutSpec) {
			var aRegisteredShortcutData = oScopeControl.data("sap.ui.core.Shortcut");
			if (!aRegisteredShortcutData) {
				return;
			}

			var aMatching = aRegisteredShortcutData.filter(function(oData){
				var bMatches =
					oData.shortcutSpec.key === oNormalizedShortcutSpec.key &&
					oData.shortcutSpec.ctrlKey === oNormalizedShortcutSpec.ctrlKey &&
					oData.shortcutSpec.altKey === oNormalizedShortcutSpec.altKey &&
					oData.shortcutSpec.shiftKey === oNormalizedShortcutSpec.shiftKey &&
					oData.shortcutSpec.metaKey === oNormalizedShortcutSpec.metaKey;
				return bMatches;
			});
			return aMatching[0]; // there is either 0 or 1 matching shortcut;
		},

		/**
		 * Parses and normalizes the shortcut being registered
		 *
		 * @param {object|string} vShortcut the shortcut to normalize.
		 *
		 * @returns {object} normalized shortcut spec
		 * @private
		 */
		getNormalizedShortcutSpec: function(vShortcut) {
			var oNormalizedShortcutSpec;
			if (typeof vShortcut === "string") {
				oNormalizedShortcutSpec = oShortcutHelper.parseShortcut(vShortcut);

			} else { // spec object
				var key = vShortcut.key;
				var bValidShortcut = /^([a-z0-9\.,\-\*\/= +]|Tab|Enter|Backspace|Home|Delete|End|Pageup|Pagedown|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Escape|F[1-9]|F1[0-2])$/i.test(key);
				if (!bValidShortcut) {
					throw new Error("Shortcut key '" + key + "' is not a valid shortcut key. It must match /^([a-z0-9\.,\-\*\/= +]|Tab|Enter|Backspace|Home|Delete|End|Pageup|Pagedown|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Escape|F[1-9]|F1[0-2])$/i");
				}
				oNormalizedShortcutSpec = {
					key: oShortcutHelper.translateRegisteredKeyToStandard(key).toLowerCase(),
					ctrlKey: Device.os.macintosh ? false : !!vShortcut.ctrl,
					ctrlRequested: vShortcut.ctrl,
					altKey: !!vShortcut.alt,
					shiftKey: !!vShortcut.shift,
					metaKey: Device.os.macintosh ? !!vShortcut.ctrl : false
				};
			}
			return oNormalizedShortcutSpec;
		},

		/**
		 * Parse shortcut string to shortcut object
		 *
		 * e.g.: 'CTRL + S' --> {key:'S', ctrlRequested:true, ...}
		 *
		 * @param {string} sShortcut A Shortcut string
		 * @private
		 */
		parseShortcut: function(sShortcut) {
			this.validateShortcutString(sShortcut);

			var aParts = sShortcut.toLowerCase().split("+");
			return {
				key: oShortcutHelper.translateRegisteredKeyToStandard(aParts.pop()),
				ctrlKey: Device.os.macintosh ? false : aParts.indexOf("ctrl") > -1,
				ctrlRequested: aParts.indexOf("ctrl") > -1,
				altKey: aParts.indexOf("alt") > -1,
				shiftKey: aParts.indexOf("shift") > -1,
				metaKey: Device.os.macintosh ? aParts.indexOf("ctrl") > -1 : false
			};
		},

		/**
		 * Convert shortcut key part to 'real' event.key character
		 *
		 * e.g.: 'Ctrl + Plus' --> 'Ctrl + +' - the same applies for 'Space'
		 *
		 * @param {string} sKeySpec The shortcut key in lower-case, e.g. "space" or "plus"
		 *
		 * @returns {string} Converted key character
		 * @private
		 */
		translateRegisteredKeyToStandard: function(sKeySpec) {
			return mKeyDefinitionFix.hasOwnProperty(sKeySpec) ? mKeyDefinitionFix[sKeySpec] : sKeySpec;
		},

		/**
		 * Check whether the key combination to be registered is allowed.
		 *
		 * @param {string} sShortcut The shortcut string
		 * @throws {Error} Throws an Error if shortcut string is not valid
		 * @private
		 */
		validateShortcutString: function(sShortcut) {
			var bValidShortcut = /^((Ctrl|Shift|Alt)\+){0,3}([a-z0-9\.,\-\*\/=]|Plus|Tab|Space|Enter|Backspace|Home|Delete|End|Pageup|Pagedown|Escape|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|F[1-9]|F1[0-2])$/i.test(sShortcut);
			if (!bValidShortcut) {
				throw new Error("Shortcut '" + sShortcut + "' is not a valid shortcut string. It must be a '+'-separated list of modifier keys and the actual key, like 'Ctrl+Alt+S'. Or more generally, it must match the expression /^((Ctrl|Shift|Alt)\+){0,3}([a-z0-9\.,\-\*\/=]|Plus|Tab|Space|Enter|Backspace|Home|Delete|End|Pageup|Pagedown|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Escape|F[1-9]|F1[0-2])$/i.");
			}
		},

		/**
		 * Check whether the key combination to be registered is allowed.
		 *
		 * @param {object} oNormalizedShortcutSpec Normalized shortcut data
		 * @throws {Error} Throws an Error if shortcut is not allowed
		 * @private
		 */
		validateKeyCombination: function(oNormalizedShortcutSpec) {
			var sNormalizedShortcut = oNormalizedShortcutSpec.ctrlRequested ? "ctrl+" : ""; // whether ctrl was registered, not the platform-dependent modifier
			sNormalizedShortcut += oNormalizedShortcutSpec.altKey ? "alt+" : "";
			sNormalizedShortcut += oNormalizedShortcutSpec.shiftKey ? "shift+" : "";
			sNormalizedShortcut += oNormalizedShortcutSpec.key;

			if (mDisallowedShortcuts[sNormalizedShortcut]) {
				throw new Error("Registering the shortcut '" + sNormalizedShortcut + "' is not allowed (" + mDisallowedShortcuts[sNormalizedShortcut] + ").");
			}

			// disallow all combinations of "Shift" with those keys which are turened into something different when Shift is pressed (or where Shift is required)
			if ([".", ",", "-", "+", "=", "*", "/"].indexOf(oNormalizedShortcutSpec.key) > -1 && sNormalizedShortcut.indexOf("shift") > -1) {
				throw new Error("Registering the shortcut '" + sNormalizedShortcut + "' is not allowed because the 'Shift' modifier changes the meaning of the " + oNormalizedShortcutSpec.key + " key on many keyboards.");
			}
		},

		/**
		 * Returns normalized shortcut string from shortcut data object.
		 *
		 * e.g.: {key:'s', ctrlRequested:true, altKey:false, shiftKey:true} --> 'ctrl+shift+s'
		 *
		 * @param {object} oNormalizedShortcutSpec Normalized shortcut data
		 *
		 * @returns {string} The normalized shortcut string
		 * @private
		 */
		getNormalizedShortcutString: function(oNormalizedShortcutSpec) {
			var sNormalizedShortcut = oNormalizedShortcutSpec.ctrlRequested ? "ctrl+" : ""; // whether ctrl was registered, not the platform-dependent modifier
			sNormalizedShortcut += oNormalizedShortcutSpec.altKey ? "alt+" : "";
			sNormalizedShortcut += oNormalizedShortcutSpec.shiftKey ? "shift+" : "";
			sNormalizedShortcut += oNormalizedShortcutSpec.key;
			return sNormalizedShortcut;
		},

		/**
		 * Check if shortcut key may be normally used for this kind of DOM node.
		 *
		 * e.g.: Arrow keys are normally used in inputs or textareas and shouldn' be used for shortcuts
		 *
		 * @param {object} oShortcutSpec Normalized shortcut data object
		 * @param {object} oDomElement A DOM node
		 *
		 * @return {boolean} true if shortcut shouldn't be used
		 * @private
		 */
		shortcutMayBeUsedHere: function(oShortcutSpec, oDomElement) {
			var sTagName = oDomElement.tagName.toLowerCase();
			if ((sTagName === "input" || sTagName === "textarea") &&
					oShortcutSpec.key.includes("arrow")
				) {
				return false;
			}
			return true;
		},

		/**
		 * The handler executed for ALL keydown events passing a shortcut region
		 *
		 * @param {object} oShortcutSpec The normalized shortcut data object
		 * @param {string|object} vOriginalShortcut The original shortcut data passed from the caller
		 * @param {function} fnCallback The callback function to execute
		 * @param {object} oEvent The keydown browser event
		 *
		 * @private
		 */
		handleKeydown: function(oShortcutSpec, vOriginalShortcut, fnCallback, oEvent) {
			// do not react to keydown of modifier keys
			if (oEvent.key === "Control" || oEvent.key === "Shift" || oEvent.key === "Alt" || oEvent.key === "AltGraph" || oEvent.key === "Meta") {
				return;
			}

			// do not react when the event has already been handled by a control
			if (oEvent.isMarked()) {
				return;
			}

			// at least in IE with German and Polish languages, AltGr triggers "Ctrl" and "Alt" flags on events, but we don't want AltGr to do the same as Ctrl+Alt
			if (oEvent.altKey && !bLastAltWasLeftAlt) { // Alt is active, but it was actually the AltGr key; we don't support any AltGr shortcuts
				return;
			}

			// handle some browser differences regarding reported keys
			var key = mEventKeyFix.hasOwnProperty(oEvent.key) ? mEventKeyFix[oEvent.key] : oEvent.key;
			key = key.toLowerCase(); // TODO: validate usage of toLowerCase

			// check whether the shortcut matches
			if (key !== oShortcutSpec.key ||
				oEvent.ctrlKey !== oShortcutSpec.ctrlKey ||
				oEvent.altKey !== oShortcutSpec.altKey ||
				oEvent.shiftKey !== oShortcutSpec.shiftKey ||
				oEvent.metaKey !== oShortcutSpec.metaKey) {
				return; // do not react if key or modifiers don't match
			}

			// some keys may not be consumed here depending on the event target (e.g. arrow keys inside input fields)
			if (!oShortcutHelper.shortcutMayBeUsedHere(oShortcutSpec, oEvent.target || oEvent.srcElement)) {
				return;
			}

			// now we know this event matches the registered shortcut and should be handled

			// do not trigger the browser default action for this shortcut or other UI5 actions
			oEvent.preventDefault();
			oEvent.setMarked();
			oEvent.stopPropagation();

			// the information passed into the callback
			var oShortcutInfo = {
				registeredShortcut: vOriginalShortcut,
				originalBrowserEvent: oEvent.originalEvent || oEvent
			};

			// trigger the callback
			fnCallback(oShortcutInfo);
		}
	};
	return oShortcutHelper;
});
