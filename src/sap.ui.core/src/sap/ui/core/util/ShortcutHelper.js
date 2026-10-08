/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/Device',
	'sap/ui/core/Lib',
	'sap/ui/events/jquery/EventExtension'
], function(
		Device,
		Library
		/*jQuery*/
	) {
	"use strict";

	// translates from shortcut specification term in the API to the string given in the event.key property
	var mKeyDefinitionFix = {
		plus: "+",
		space: " "
	};

	// translates key strings from some browsers (currently only Firefox) to standard strings
	var mEventKeyFix = {
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

		// F1-12
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
		 * Resolves a command shortcut definition to the shortcut string for the current platform.
		 *
		 * A shortcut may be given as a plain string or as an object with a <code>default</code>
		 * and an optional <code>macintosh</code> variant. On macOS the <code>macintosh</code>
		 * variant is used if present, otherwise the <code>default</code>. A string is returned
		 * unchanged.
		 *
		 * @param {string|object} vShortcut The shortcut definition (string or {default, macintosh})
		 * @returns {string} The platform-specific shortcut string
		 * @private
		 */
		getPlatformShortcut: function(vShortcut) {
			if (vShortcut && typeof vShortcut === "object") {
				return (Device.os.macintosh && vShortcut.macintosh) ? vShortcut.macintosh : vShortcut["default"];
			}
			return vShortcut;
		},

		/**
		 * Whether the given shortcut definition resolves to a macOS-specific ("literal")
		 * shortcut on the current platform.
		 *
		 * Returns <code>true</code> when <code>vShortcut</code> is an object with a
		 * <code>macintosh</code> variant and the current platform is macOS. In that case
		 * the shortcut string is interpreted literally (no Ctrl-to-Cmd remapping).
		 *
		 * @param {string|object} vShortcut The shortcut definition (string or {default, macintosh})
		 * @returns {boolean} true if the macintosh variant is selected
		 * @private
		 */
		isPlatformShortcutMacLiteral: function(vShortcut) {
			return !!(vShortcut && typeof vShortcut === "object" && Device.os.macintosh && vShortcut.macintosh);
		},

		/**
		 * Converts macOS-specific modifier names in a shortcut string to their Windows
		 * equivalents (<code>Option</code> to <code>Alt</code>,
		 * <code>Cmd</code> to <code>Ctrl</code>). Modifier names are matched
		 * case-insensitively; the actual key and all other parts are left untouched.
		 *
		 * @param {string} sShortcut The shortcut string, e.g. "Ctrl+Option+N"
		 * @returns {string} The Windows-equivalent shortcut string, e.g. "Ctrl+Alt+N"
		 * @private
		 */
		convertToWindowsShortcutString: function(sShortcut) {
			var mMacToWindows = { option: "Alt", cmd: "Ctrl" };
			return sShortcut.split("+").map(function(sPart) {
				return mMacToWindows[sPart.trim().toLowerCase()] || sPart;
			}).join("+");
		},

		/**
		 * Parses and normalizes the shortcut being registered.
		 *
		 * Accepts three forms:
		 * <ul>
		 *   <li>A shortcut string, e.g. <code>"Ctrl+Alt+S"</code></li>
		 *   <li>A spec object with <code>key</code>, <code>ctrl</code>, <code>alt</code>,
		 *       <code>shift</code> flags</li>
		 *   <li>A platform object with <code>default</code> and optional <code>macintosh</code>
		 *       keys – the correct variant for the current platform is resolved internally
		 *       and the macintosh variant is treated as a literal shortcut (no Ctrl-to-Cmd
		 *       remapping)</li>
		 * </ul>
		 *
		 * @param {object|string} vShortcut the shortcut to normalize
		 * @returns {object} normalized shortcut spec
		 * @private
		 */
		getNormalizedShortcutSpec: function(vShortcut) {
			var oNormalizedShortcutSpec;

			if (typeof vShortcut === "string") {
				oNormalizedShortcutSpec = oShortcutHelper.parseShortcut(vShortcut);

			} else if (vShortcut && vShortcut["default"] !== undefined) {
				// Platform object: { "default": "...", "macintosh": "..." }
				var bMacLiteral = oShortcutHelper.isPlatformShortcutMacLiteral(vShortcut);
				var sResolved = oShortcutHelper.getPlatformShortcut(vShortcut);
				oNormalizedShortcutSpec = oShortcutHelper.parseShortcut(sResolved, bMacLiteral);

			} else { // spec object with { key, ctrl, alt, shift }
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
		 * @param {boolean} [bMacLiteral] When <code>true</code> the shortcut is in macOS format
		 *   (e.g. "Ctrl+Option+N"). It is converted to Windows format before parsing and
		 *   the Ctrl-to-Cmd remapping is skipped.
		 * @private
		 */
		parseShortcut: function(sShortcut, bMacLiteral) {
			this.validateShortcutString(sShortcut);

			// When bMacLiteral is set the shortcut is in macOS format (e.g. "Ctrl+Option+N").
			// Convert it to Windows format first ("Ctrl+Alt+N") so that the parsing below
			// only needs to handle the standard modifier names (Ctrl/Alt/Shift). The
			// Ctrl-to-Cmd remapping is skipped because "Ctrl" in a macOS shortcut means the
			// physical Control key.
			var sNormalized = bMacLiteral ? oShortcutHelper.convertToWindowsShortcutString(sShortcut) : sShortcut;
			var aParts = sNormalized.toLowerCase().split("+");
			var sKey = oShortcutHelper.translateRegisteredKeyToStandard(aParts.pop());
			var bCtrl = aParts.indexOf("ctrl") > -1;

			return {
				key: sKey,
				ctrlKey: (bMacLiteral || !Device.os.macintosh) ? bCtrl : false,
				ctrlRequested: bCtrl,
				altKey: aParts.indexOf("alt") > -1,
				shiftKey: aParts.indexOf("shift") > -1,
				metaKey: (!bMacLiteral && Device.os.macintosh) ? bCtrl : false
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
			// macOS-specific modifier names ("Option", "Cmd") are validated against their
			// Windows equivalents ("Alt", "Ctrl"), because the shortcut grammar only knows the
			// modifiers Ctrl/Shift/Alt.
			var sWindowsShortcut = oShortcutHelper.convertToWindowsShortcutString(sShortcut);
			var bValidShortcut = /^((Ctrl|Shift|Alt)\+){0,3}([a-z0-9\.,\-\*\/=]|Plus|Tab|Space|Enter|Backspace|Home|Delete|End|Pageup|Pagedown|Escape|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|F[1-9]|F1[0-2])$/i.test(sWindowsShortcut);
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
		 * Normalizes a shortcut string by trimming spaces, converting single character keys to uppercase,
		 * and adjusting modifier keys for the current platform (e.g., "Ctrl" to "Cmd" on Mac).
		 *
		 * @param {string} sShortcut The shortcut string to normalize, e.g., "ctrl+Alt+s" will be normalized to "Ctrl+Alt+S" on Windows and "Cmd+Option+S" on Mac.
		 * @param {boolean} [bMacLiteral] When <code>true</code> the shortcut is in macOS format
		 *   and "Ctrl" is kept as "Ctrl" instead of being remapped to "Cmd".
		 * @returns {string} Normalized shortcut string
		 */
		normalizeShortcutText: function(sShortcut, bMacLiteral) {
			const allParts = sShortcut.split('+').map((p) => p.trim());

			// When bMacLiteral is set the shortcut is in macOS format: "Option" stays
			// "Option" and "Ctrl" stays "Ctrl" (it is not remapped to "Cmd").
			const bIsMacLiteral = !!bMacLiteral;

			const modifiers = {
				ctrl: false,
				cmd: false,
				option: false,
				alt: false,
				shift: false
			};

			let key = null;

			for (const part of allParts) {
				const lower = part.toLowerCase();
				if (lower in modifiers) {
					modifiers[lower] = true;
				} else if (!key) {
					if (part.length === 1) {
						key = part.toUpperCase(); // Single character keys are transformed to uppercase
					} else {
						key = part;
					}
				}
			}

			const result = [];
			if (modifiers.ctrl) {
				result.push(!bIsMacLiteral && Device.os.macintosh ? 'Cmd' : 'Ctrl');
			}
			if (modifiers.cmd) {
				result.push('Cmd');
			}
			if (modifiers.option) {
				result.push('Option');
			}
			if (modifiers.alt) {
				result.push(Device.os.macintosh ? 'Option' : 'Alt');
			}
			if (modifiers.shift) {
				result.push('Shift');
			}
			if (key) {
				result.push(key);
			}

			return result.join('+');
		},

		/**
		 * Translates a keyboard shortcut string by localizing each key segment.
		 * The shortcut string is expected to use '+' as a delimiter (e.g., "Ctrl+Shift+S").
		 * If a translation is not found, the original key is used.
		 *
		 * @param {string} sShortcut The shortcut string
		 * @return {string} The translated shortcut string
		 */
		localizeKeys: (sShortcut) => {
			const oResourceBundle = Library.getResourceBundleFor("sap.ui.core");
			return sShortcut
				.split("+")
				.map((key) => {
					const sKey = key.trim();
					const sPropertiesKey = `Keyboard.Shortcut.${sKey}`;
					const sText = sKey.length > 1 ? oResourceBundle.getText(sPropertiesKey) : sKey;
					return sText === sPropertiesKey ? key.trim() : sText;
				}).join("+");
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
			// There are situations (SNOW: DINC0032372), where a keydown event is triggered which is no instance of "KeyboardEvent".
			// Hence, this explicit check is required.
			if (!oEvent.key) {
				return;
			}

			// do not react to keydown of modifier keys
			if (oEvent.key === "Control" || oEvent.key === "Shift" || oEvent.key === "Alt" || oEvent.key === "AltGraph" || oEvent.key === "Meta") {
				return;
			}

			// do not react when the event has already been handled by a control
			if (oEvent.isMarked()) {
				return;
			}

			// AltGr triggers "Ctrl" and "Alt" flags on events, but we don't want AltGr to do the same as Ctrl+Alt
			if (oEvent.altKey && !bLastAltWasLeftAlt) { // Alt is active, but it was actually the AltGr key; we don't support any AltGr shortcuts
				return;
			}

			// handle some browser differences regarding reported keys.
			// On macOS, Ctrl+Option+<letter> produces a "Dead" key (accent composition)
			// instead of the actual letter. Fall back to event.code which reports the
			// physical key (e.g. "KeyN" → "n", "Digit5" → "5").
			var key;
			if (oEvent.key === "Dead" && oEvent.code) {
				var sCode = oEvent.code;
				if (sCode.startsWith("Key")) {
					key = sCode.slice(3);
				} else if (sCode.startsWith("Digit")) {
					key = sCode.slice(5);
				} else {
					return; // unknown dead key, cannot resolve
				}
			} else {
				key = mEventKeyFix.hasOwnProperty(oEvent.key) ? mEventKeyFix[oEvent.key] : oEvent.key;
			}
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
