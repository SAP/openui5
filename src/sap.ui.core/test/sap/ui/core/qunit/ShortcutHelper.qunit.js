/*global sinon, QUnit */
sap.ui.define([
	"sap/ui/Device",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/core/util/ShortcutHelper",
	"sap/ui/core/Component",
	"sap/ui/core/CommandExecution",
	"sap/ui/core/Control",
	"sap/m/Panel",
	"sap/ui/thirdparty/jquery"
], function(
	Device,
	QUtils,
	ShortcutHelper,
	Component,
	CommandExecution,
	Control,
	Panel,
	jQuery
) {
	"use strict";

	var oPanel, oControl, oCE, oStub, oFakeCommand, oOwnerComponentFake, originalMacintosh;

	function fnInitControlTree() {
		originalMacintosh = Device.os.macintosh;
		Device.os.macintosh = false; // Simulate Windows
		oPanel = new Panel();
		oControl = new Control({});
		oCE = new CommandExecution({command:"Save"});
		oPanel.addContent(oControl);
		oFakeCommand = {"Save":{shortcut:"Shift+s", fake:true}};
		oOwnerComponentFake = {getCommand: function(sCommand) {return oFakeCommand[sCommand];}};
		oStub = sinon.stub(Component, "getOwnerComponentFor").callsFake(
			function() {
				return oOwnerComponentFake;
			}
		);
	}

	function cleanup() {
		Device.os.macintosh = originalMacintosh;
		oCE.destroy();
		oPanel.destroy();
		oStub.restore();
	}

	QUnit.module("ShourtcutHelper API", {
		beforeEach: fnInitControlTree,
		afterEach: cleanup
	});

	QUnit.test("normalizeShortcutText", function(assert) {
		const aShortcuts = ["Ctrl+S+Shift", "ctrl+DEL+Alt", "alt+f4", "SPACE+Ctrl", "ctrl+PLUS"];
		const aNormalizedShortcuts = ["Ctrl+Shift+S", "Ctrl+Alt+DEL", "Alt+f4", "Ctrl+SPACE", "Ctrl+PLUS"];

		aShortcuts.forEach(function(sShortcut, index) {
			const sNormalized = ShortcutHelper.normalizeShortcutText(sShortcut);
			assert.strictEqual(sNormalized, aNormalizedShortcuts[index], "shortcut normalized correctly");
		});
	});

	QUnit.test("normalizeShortcutText - bMacLiteral parameter", function(assert) {
		const bOriginalMac = Device.os.macintosh;
		Device.os.macintosh = true; // Simulate macOS
		try {
			// Without bMacLiteral: "Ctrl+N" is remapped to "Cmd+N" on macOS
			assert.strictEqual(ShortcutHelper.normalizeShortcutText("Ctrl+N"), "Cmd+N",
				"Without bMacLiteral, Ctrl is remapped to Cmd on macOS");

			// With bMacLiteral=true: "Ctrl+N" stays "Ctrl+N" even on macOS
			assert.strictEqual(ShortcutHelper.normalizeShortcutText("Ctrl+N", true), "Ctrl+N",
				"With bMacLiteral=true, Ctrl stays Ctrl on macOS");

			// With bMacLiteral=true: "Option" stays "Option", "Ctrl" stays "Ctrl"
			assert.strictEqual(ShortcutHelper.normalizeShortcutText("Option+Ctrl+N", true), "Ctrl+Option+N",
				"With bMacLiteral=true, Option stays Option and Ctrl stays Ctrl");

			// With bMacLiteral=true: "Cmd+S" stays "Cmd+S"
			assert.strictEqual(ShortcutHelper.normalizeShortcutText("Cmd+S", true), "Cmd+S",
				"With bMacLiteral=true, Cmd stays Cmd");
		} finally {
			Device.os.macintosh = bOriginalMac;
		}
	});

	QUnit.test("getPlatformShortcut", function(assert) {
		const bOriginalMac = Device.os.macintosh;
		const oShortcut = { "default": "Ctrl+Alt+N", "macintosh": "Ctrl+Option+N" };
		try {
			assert.strictEqual(ShortcutHelper.getPlatformShortcut("Ctrl+S"), "Ctrl+S", "string is returned unchanged");

			Device.os.macintosh = false; // Simulate Windows
			assert.strictEqual(ShortcutHelper.getPlatformShortcut(oShortcut), "Ctrl+Alt+N", "default variant used on non-macOS");

			Device.os.macintosh = true; // Simulate macOS
			assert.strictEqual(ShortcutHelper.getPlatformShortcut(oShortcut), "Ctrl+Option+N", "macintosh variant used on macOS");
			assert.strictEqual(ShortcutHelper.getPlatformShortcut({ "default": "Ctrl+S" }), "Ctrl+S", "default used on macOS when no macintosh variant is defined");
		} finally {
			Device.os.macintosh = bOriginalMac;
		}
	});

	QUnit.test("isPlatformShortcutMacLiteral", function(assert) {
		const bOriginalMac = Device.os.macintosh;
		const oShortcut = { "default": "Ctrl+Alt+N", "macintosh": "Ctrl+N" };
		try {
			assert.strictEqual(ShortcutHelper.isPlatformShortcutMacLiteral("Ctrl+S"), false, "string is never mac literal");

			Device.os.macintosh = false; // Simulate Windows
			assert.strictEqual(ShortcutHelper.isPlatformShortcutMacLiteral(oShortcut), false, "not mac literal on Windows even with macintosh key");

			Device.os.macintosh = true; // Simulate macOS
			assert.strictEqual(ShortcutHelper.isPlatformShortcutMacLiteral(oShortcut), true, "mac literal on macOS when macintosh key is present");
			assert.strictEqual(ShortcutHelper.isPlatformShortcutMacLiteral({ "default": "Ctrl+S" }), false, "not mac literal when no macintosh key");
		} finally {
			Device.os.macintosh = bOriginalMac;
		}
	});

	QUnit.test("findShortcut", function(assert) {
		assert.expect(2);
		oPanel.addDependent(oCE);
		var oNormalizedShortcut = ShortcutHelper.getNormalizedShortcutSpec("Shift+s");
		var oShortcut = ShortcutHelper.findShortcut(oPanel, oNormalizedShortcut);
		assert.deepEqual(oShortcut.shortcutSpec, oNormalizedShortcut, "Shortcut found on scope control");
		assert.strictEqual(oShortcut.platformIndependentShortcutString, "shift+s", "Shjortcut string ok");
	});

	QUnit.test("getNormalizedShortcutSpec", function(assert) {
		assert.expect(3);
		var oExpectedSpec = {
			key: 's',
			ctrlKey: false,
			ctrlRequested: false,
			altKey: false,
			shiftKey: true,
			metaKey: false
		};
		var oShortcut = {
			key: 's',
			ctrl: false,
			alt: false,
			shift: true
		};

		var oInvalidShortcut = {
			key: 'selsrjtakfgj',
			ctrl: false,
			alt: false,
			shift: ""
		};

		var oNormalizedShortcut = ShortcutHelper.getNormalizedShortcutSpec("Shift+s");
		assert.deepEqual(oNormalizedShortcut, oExpectedSpec, "Shortcut normalized sucessfully from string");
		oNormalizedShortcut = ShortcutHelper.getNormalizedShortcutSpec(oShortcut);
		assert.deepEqual(oNormalizedShortcut, oExpectedSpec, "Shortcut normalized sucessfully from object");
		assert.throws(ShortcutHelper.getNormalizedShortcutSpec.bind(ShortcutHelper, oInvalidShortcut), "shortcut object invalid");
	});

	QUnit.test("getNormalizedShortcutSpec - platform object", function(assert) {
		// getNormalizedShortcutSpec resolves platform objects ({default, macintosh}) internally
		// and treats the macintosh variant as a literal shortcut (no Ctrl→Cmd remapping).
		const bOriginalMac = Device.os.macintosh;
		try {
			// On macOS: macintosh variant is used and "Ctrl" stays physical Control
			Device.os.macintosh = true;
			var oSpecMac = ShortcutHelper.getNormalizedShortcutSpec({ "default": "Ctrl+Alt+N", "macintosh": "Ctrl+N" });
			assert.strictEqual(oSpecMac.ctrlKey, true, "macintosh variant: Ctrl stays physical Control (ctrlKey=true)");
			assert.strictEqual(oSpecMac.metaKey, false, "macintosh variant: no Cmd remap (metaKey=false)");
			assert.strictEqual(oSpecMac.altKey, false, "macintosh variant: Alt not set");
			assert.strictEqual(oSpecMac.key, "n", "macintosh variant: key is 'n'");

			// On Windows: default variant is used with standard parsing
			Device.os.macintosh = false;
			var oSpecWin = ShortcutHelper.getNormalizedShortcutSpec({ "default": "Ctrl+Alt+N", "macintosh": "Ctrl+N" });
			assert.strictEqual(oSpecWin.ctrlKey, true, "default variant on Windows: ctrlKey=true");
			assert.strictEqual(oSpecWin.altKey, true, "default variant on Windows: altKey=true");
			assert.strictEqual(oSpecWin.metaKey, false, "default variant on Windows: metaKey=false");

			// On macOS without macintosh key: falls back to default with standard Ctrl→Cmd remap
			Device.os.macintosh = true;
			var oSpecFallback = ShortcutHelper.getNormalizedShortcutSpec({ "default": "Ctrl+S" });
			assert.strictEqual(oSpecFallback.ctrlKey, false, "no macintosh key on Mac: Ctrl remapped to Cmd (ctrlKey=false)");
			assert.strictEqual(oSpecFallback.metaKey, true, "no macintosh key on Mac: Ctrl remapped to Cmd (metaKey=true)");
		} finally {
			Device.os.macintosh = bOriginalMac;
		}
	});

	QUnit.test("parseShortcut", function(assert) {
		assert.expect(3);
		var oExpectedSpec = {
			key: 's',
			ctrlKey: false,
			ctrlRequested: false,
			altKey: true,
			shiftKey: true,
			metaKey: false
		};

		var oParsedSpec = ShortcutHelper.parseShortcut("Shift+Alt+S");
		assert.deepEqual(oParsedSpec, oExpectedSpec, "Shortcut parsed sucessfully");

		var oExpectedSpecSpace = {
			key: ' ',
			ctrlKey: false,
			ctrlRequested: false,
			altKey: false,
			shiftKey: true,
			metaKey: false
		};

		oParsedSpec = ShortcutHelper.parseShortcut("Shift+Space");
		assert.deepEqual(oParsedSpec, oExpectedSpecSpace, "Shortcut with 'Space' parsed sucessfully");

		var oExpectedSpecPlus = {
			key: '+',
			ctrlKey: false,
			ctrlRequested: false,
			altKey: false,
			shiftKey: true,
			metaKey: false
		};

		oParsedSpec = ShortcutHelper.parseShortcut("Shift+Plus");
		assert.deepEqual(oParsedSpec, oExpectedSpecPlus, "Shortcut with 'Plus' parsed sucessfully");
	});

	QUnit.test("parseShortcut - bMacLiteral parameter", function(assert) {
		// When bMacLiteral=true, the shortcut is in macOS format. Mac modifier names are
		// converted to Windows equivalents ("Option"->"Alt", "Cmd"->"Ctrl") and the Ctrl-to-Cmd
		// remapping is skipped because "Ctrl" means physical Control in a macOS shortcut.
		const oExpectedOptionCtrlN = {
			key: 'n',
			ctrlKey: true,
			ctrlRequested: true,
			altKey: true,
			shiftKey: false,
			metaKey: false
		};

		const bOriginalMac = Device.os.macintosh;
		try {
			Device.os.macintosh = false; // Simulate Windows
			assert.deepEqual(ShortcutHelper.parseShortcut("Option+Ctrl+N", true), oExpectedOptionCtrlN,
				"bMacLiteral=true: 'Option+Ctrl+N' parsed correctly on Windows (Option->Alt)");

			Device.os.macintosh = true; // Simulate macOS
			assert.deepEqual(ShortcutHelper.parseShortcut("Option+Ctrl+N", true), oExpectedOptionCtrlN,
				"bMacLiteral=true: 'Option+Ctrl+N' parsed correctly on macOS (Ctrl not remapped to Cmd)");

			// Without bMacLiteral: "Ctrl+N" gets Ctrl->Cmd remap on macOS
			var oParsedDefault = ShortcutHelper.parseShortcut("Ctrl+N");
			assert.strictEqual(oParsedDefault.ctrlKey, false, "Without bMacLiteral, ctrlKey is false (remapped to Cmd)");
			assert.strictEqual(oParsedDefault.metaKey, true, "Without bMacLiteral, metaKey is true (Ctrl remapped to Cmd)");

			// With bMacLiteral=true: "Ctrl+N" stays literal (even without Mac-specific modifiers)
			const oExpectedLiteral = {
				key: 'n',
				ctrlKey: true,
				ctrlRequested: true,
				altKey: false,
				shiftKey: false,
				metaKey: false
			};
			assert.deepEqual(ShortcutHelper.parseShortcut("Ctrl+N", true), oExpectedLiteral,
				"bMacLiteral=true: Ctrl stays physical Control on macOS");
		} finally {
			Device.os.macintosh = bOriginalMac;
		}
	});

	QUnit.test("translateRegisteredKeyToStandard", function(assert) {
		assert.expect(2);

		var sKey = ShortcutHelper.translateRegisteredKeyToStandard("space");
		assert.strictEqual(sKey, " ", "key translated correctly");
		sKey = ShortcutHelper.translateRegisteredKeyToStandard("plus");
		assert.strictEqual(sKey, "+", "key translated correctly");
	});

	QUnit.test("validateShortcutString", function(assert) {
		assert.expect(8);
		assert.throws(
			function() {
				ShortcutHelper.validateShortcutString("CTR+CTR+SLT+AA");
			},
			"Shortcut not valid"
		);
		assert.throws(
			function() {
				ShortcutHelper.validateShortcutString("CTRL++");
			},
			"Shortcut not valid"
		);
		assert.throws(
			function() {
				ShortcutHelper.validateShortcutString("CTRL+ ");
			},
			"Shortcut not valid"
		);
		//validation does not return a boolean, but throws an error when validation fails
		assert.equal(undefined, ShortcutHelper.validateShortcutString("CTRL+SPACE"), "Shortcut valid");
		assert.equal(undefined, ShortcutHelper.validateShortcutString("CTRL+PLUS"), "Shortcut valid");
		assert.equal(undefined, ShortcutHelper.validateShortcutString("CTRL+s"), "Shortcut valid");
		assert.equal(undefined, ShortcutHelper.validateShortcutString("CTRL+ALT+s"), "Shortcut valid");
		assert.equal(undefined, ShortcutHelper.validateShortcutString("CTRL+ALT+SHIFT+s"), "Shortcut valid");
	});

	QUnit.test("validateShortcutString - macOS modifiers", function(assert) {
		assert.expect(2);
		// "Option"/"Cmd" are validated against their Windows equivalents ("Alt"/"Ctrl")
		assert.equal(ShortcutHelper.validateShortcutString("Option+Ctrl+N"), undefined, "'Option+Ctrl+N' valid (validated as 'Ctrl+Alt+N')");
		assert.equal(ShortcutHelper.validateShortcutString("Cmd+S"), undefined, "'Cmd+S' valid (validated as 'Ctrl+S')");
	});

	QUnit.test("validateKeyCombination - macOS modifiers checked against disallowed list", function(assert) {
		assert.expect(3);
		// macOS-format shortcuts are always passed as platform objects so that
		// getNormalizedShortcutSpec resolves them through the macintosh-literal path
		// (converts mac modifiers to Windows equivalents before validation).
		const bOriginalMac = Device.os.macintosh;
		Device.os.macintosh = true; // Simulate macOS so macintosh variant is selected
		try {
			// "Option+Ctrl+N" -> "Ctrl+Alt+N": not disallowed, so it is allowed
			assert.equal(ShortcutHelper.validateKeyCombination(
				ShortcutHelper.getNormalizedShortcutSpec({ "default": "Ctrl+Alt+N", "macintosh": "Option+Ctrl+N" })
			), undefined, "'Option+Ctrl+N' allowed (maps to 'ctrl+alt+n')");

			// "Cmd+W" -> "Ctrl+W" (close tab): disallowed
			assert.throws(function() {
				ShortcutHelper.validateKeyCombination(
					ShortcutHelper.getNormalizedShortcutSpec({ "default": "Ctrl+W", "macintosh": "Cmd+W" })
				);
			}, "'Cmd+W' is disallowed (maps to 'ctrl+w')");

			// "Cmd+N" -> "Ctrl+N" (new window): disallowed
			assert.throws(function() {
				ShortcutHelper.validateKeyCombination(
					ShortcutHelper.getNormalizedShortcutSpec({ "default": "Ctrl+N", "macintosh": "Cmd+N" })
				);
			}, "'Cmd+N' is disallowed (maps to 'ctrl+n')");
		} finally {
			Device.os.macintosh = bOriginalMac;
		}
	});

	// forbidden shift and symbols combinations
	[".", ",", "-", "tab", "plus", "=", "*", "/"].forEach(function(sKey) {
		QUnit.test("validateKeyCombination for shift + '" + sKey + "'", function(assert) {
			assert.expect(1);
			var oSpec = ShortcutHelper.getNormalizedShortcutSpec("shift+" + sKey);
			assert.throws(
				function() {
					ShortcutHelper.validateKeyCombination(oSpec);
				},
				"validation failed"
			);
		});
	});

	// other forbidden shift combinations
	["s", "space", "h", "e", "7", "q", "M"].forEach(function(sKey) {
		QUnit.test("validateKeyCombination for shift + '" + sKey + "'", function(assert) {
			assert.expect(1);
			var oSpec = ShortcutHelper.getNormalizedShortcutSpec("shift+" + sKey);
			assert.equal(undefined, ShortcutHelper.validateKeyCombination(oSpec),"Shortcut validation ok");
		});
	});

	// forbidden 'ctrl' and 'a-z' combinations, e.g. ctrl+w (close tab in Chrome)
	["l", "n", "q", "t", "w"].forEach(function(sKey) {
		QUnit.test("validateKeyCombination for ctrl + '" + sKey + "'", function(assert) {
			assert.expect(1);
			var oSpec = ShortcutHelper.getNormalizedShortcutSpec("ctrl+" + sKey);
			assert.throws(
				function() {
					ShortcutHelper.validateKeyCombination(oSpec);
				},
				"validation failed"
			);
		});
	});

	// forbidden 'ctrl' and symbol combinations, e.g. ctrl+- (zoom out)
	["-", "plus", "tab", "0"].forEach(function(sKey) {
		QUnit.test("validateKeyCombination for ctrl + '" + sKey + "'", function(assert) {
			assert.expect(1);
			var oSpec = ShortcutHelper.getNormalizedShortcutSpec("ctrl+" + sKey);
			assert.throws(
				function() {
					ShortcutHelper.validateKeyCombination(oSpec);
				},
				"validation failed"
			);
		});
	});

	QUnit.test("getNormalizedShortcutString", function(assert) {
		assert.expect(1);

		var oSpec = ShortcutHelper.getNormalizedShortcutSpec("ctrl+shift+S");
		assert.strictEqual("ctrl+shift+s", ShortcutHelper.getNormalizedShortcutString(oSpec), "Spec successfully normalized to string");
	});

	["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp"].forEach(function(sKey) {
		QUnit.test("shortcutMayBeUsedHere for key '" + sKey + "'", function(assert) {
			assert.expect(2);
			var oSpec = ShortcutHelper.getNormalizedShortcutSpec("ctrl+shift+" + sKey);
			assert.ok(!ShortcutHelper.shortcutMayBeUsedHere(oSpec, document.createElement("input")));
			assert.ok(!ShortcutHelper.shortcutMayBeUsedHere(oSpec, document.createElement("textarea")));
		});
	});

	QUnit.test("handleKeydown", function(assert) {
		assert.expect(1);
		var e;
		var oSpec = ShortcutHelper.getNormalizedShortcutSpec("shift+S");

		e = jQuery.Event("keydown");
		e.key = 's';       // 's'
		e.ctrlKey = false;     // ctrl pressed
		e.altKey = false;     // alt pressed
		e.shiftKey = true;     // shift pressed
		e.metaKey = false;     // meta key
		e.srcElement = document.createElement("input");
		ShortcutHelper.handleKeydown(oSpec, "shift+S", function() {
			assert.ok(true, "shortcut triggered");
		}, e);
	});

	["Control", "Shift", "Alt", "AltGraph", "Meta"].forEach(function(sKey) {
		QUnit.test("handleKeydown", function(assert) {
			assert.expect(1);
			var e;
			var oSpec = ShortcutHelper.getNormalizedShortcutSpec("shift+S");

			e = jQuery.Event("keydown");
			e.key = sKey;       // sKey
			e.srcElement = document.createElement("input");

			assert.ok(!ShortcutHelper.handleKeydown(oSpec, "shift", function() {
				assert.ok(true, "shortcut should not be triggered");
			}, e), "Shortcut should not be triggered");
		});
	});

	QUnit.test("handleKeydown - Dead key fallback via event.code", function(assert) {
		assert.expect(1);
		// On macOS, Ctrl+Option+N produces event.key "Dead" with event.code "KeyN".
		// handleKeydown should fall back to event.code to identify the physical key.
		var bOriginalMac = Device.os.macintosh;
		Device.os.macintosh = true;

		var oSpec = ShortcutHelper.getNormalizedShortcutSpec({
			"default": "Ctrl+Alt+N",
			"macintosh": "Ctrl+Option+N"
		});

		// Simulate a left Alt keydown so that the AltGr guard (bLastAltWasLeftAlt) allows the shortcut
		document.dispatchEvent(new KeyboardEvent("keydown", { keyCode: 18, location: 1 }));

		var e = jQuery.Event("keydown");
		e.key = "Dead";       // macOS dead key
		e.code = "KeyN";      // physical key
		e.ctrlKey = true;
		e.altKey = true;
		e.shiftKey = false;
		e.metaKey = false;
		e.srcElement = document.createElement("div");

		ShortcutHelper.handleKeydown(oSpec, "Ctrl+Option+N", function() {
			assert.ok(true, "shortcut triggered despite Dead key");
		}, e);

		Device.os.macintosh = bOriginalMac;
	});
});
