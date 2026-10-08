/*global sinon, QUnit */
sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/Lib",
	"sap/ui/util/XMLHelper",
	"sap/ui/core/util/ShortcutHelper",
	"sap/ui/core/interaction/KeyboardInteractionDisplay"
], function (Device, Library, XMLHelper, ShortcutHelper, KeyboardInteractionDisplay) {
	"use strict";

	const annotateAndTranslateKbdTags = KeyboardInteractionDisplay._.annotateAndTranslateKbdTags;
	const getInteractions = KeyboardInteractionDisplay._.getInteractions;
	const translateInteractionXML = KeyboardInteractionDisplay._.translateInteractionXML;
	const getCommandInfosFor = KeyboardInteractionDisplay._.getCommandInfosFor;
	const getNormalizedShortcutString = ShortcutHelper.normalizeShortcutText;
	const localizeKeys = ShortcutHelper.localizeKeys;

	QUnit.module("KeyboardInteractionDisplay Utilities", {
		beforeEach: function() {
			this.originalMac = Device.os.macintosh;
			Device.os.macintosh = false; // Simulate Win device
		},
		afterEach: function() {
			Device.os.macintosh = this.originalMac;
		}
	});

	QUnit.test("getNormalizedShortcutString (Win devices)", function (assert) {
		Device.os.macintosh = false;
		assert.strictEqual(
			getNormalizedShortcutString("Ctrl+Alt+S"),
			"Ctrl+Alt+S",
			"'Ctrl+Alt+S' correctly normalized to 'Ctrl+Alt+S'"
		);

		assert.strictEqual(
			getNormalizedShortcutString("ctrl+Alt+ s"),
			"Ctrl+Alt+S",
			"'ctrl+Alt+ s' correctly normalized to 'Ctrl+Alt+S'"
		);

		assert.strictEqual(
			getNormalizedShortcutString("Alt+ ctrl+ s"),
			"Ctrl+Alt+S",
			"'Alt+ ctrl+ s' correctly normalized to 'Ctrl+Alt+S'"
		);

		assert.strictEqual(
			getNormalizedShortcutString("Ctrl+Shift+K"),
			"Ctrl+Shift+K",
			"Correctly normalized"
		);

		assert.strictEqual(
			getNormalizedShortcutString("Shift"),
			"Shift",
			"Single 'Shift' key is correctly normalized"
		);

		assert.strictEqual(
			getNormalizedShortcutString("shift"),
			"Shift",
			"'shift' key is correctly normalized to 'Shift'"
		);

		assert.strictEqual(
			getNormalizedShortcutString("Ctrl"),
			"Ctrl",
			"Single 'Ctrl' key is correctly normalized"
		);
	});

	QUnit.test("getNormalizedShortcutString (Mac devices)", function (assert) {
		Device.os.macintosh = true;
		assert.strictEqual(
			getNormalizedShortcutString("Ctrl+Alt+S"),
			"Cmd+Option+S",
			"'Ctrl+Alt+S' correctly normalized to 'Cmd+Option+S' for Mac"
		);

		assert.strictEqual(
			getNormalizedShortcutString("ctrl+Alt+ s"),
			"Cmd+Option+S",
			"'ctrl+Alt+ s' correctly normalized to 'Cmd+Option+S' for Mac"
		);

		assert.strictEqual(
			getNormalizedShortcutString("Alt+ ctrl+ s"),
			"Cmd+Option+S",
			"'Alt+ ctrl+ s' correctly normalized to 'Cmd+Option+S' for Mac"
		);

		assert.strictEqual(
			getNormalizedShortcutString("Ctrl+Shift+K"),
			"Cmd+Shift+K",
			"'Ctrl+Shift+K' correctly normalized to 'Cmd+Shift+K' for Mac"
		);

		assert.strictEqual(
			getNormalizedShortcutString("Shift"),
			"Shift",
			"Single 'Shift' key is correctly normalized for Mac"
		);

		assert.strictEqual(
			getNormalizedShortcutString("shift"),
			"Shift",
			"'shift' key is correctly normalized to 'Shift' for Mac"
		);

		assert.strictEqual(
			getNormalizedShortcutString("Ctrl"),
			"Cmd",
			"Single 'Ctrl' key is correctly normalized to 'Cmd' for Mac"
		);

		assert.strictEqual(
			getNormalizedShortcutString("Ctrl+ArrowUp"),
			"Cmd+ArrowUp",
			"Single 'Ctrl+ArrowUp' key is correctly normalized to 'Cmd+ArrowUp' for Mac"
		);
	});

	QUnit.test("localizeKeys", function (assert) {
		const bundle = {
			getText: (key) => {
				if (key === "Keyboard.Shortcut.Ctrl") { return "Strg"; }
				if (key === "Keyboard.Shortcut.S") { return "S"; }

				return key;
			}
		};

		const getResourceBundleForStub = sinon.stub(Library, "getResourceBundleFor").returns(bundle);
		const sResult = localizeKeys("Ctrl+S");
		assert.strictEqual(sResult, "Strg+S", "Correctly translated shortcut text");

		getResourceBundleForStub.restore();
	});

	QUnit.test("annotateAndTranslateKbdTags", function (assert) {
		const bundle = {
			getText: (key) => {
				if (key === "Keyboard.Shortcut.Ctrl") { return "Strg"; }
				if (key === "Keyboard.Shortcut.S") { return "S"; }

				return key;
			}
		};

		const getResourceBundleForStub = sinon.stub(Library, "getResourceBundleFor").returns(bundle);
		const div = document.createElement("div");
		div.innerHTML = "<kbd>Ctrl+S</kbd>";

		const aKbds = annotateAndTranslateKbdTags(div.querySelectorAll("kbd"));
		assert.strictEqual(aKbds[0].getAttribute("data-sap-ui-kbd-raw"), "Ctrl+S", "Attribute is set correctly.");
		assert.strictEqual(aKbds[0].textContent, "Strg+S", "Text is translated correctly");

		getResourceBundleForStub.restore();
	});

	QUnit.test("getInteractions - extracts control interactions from XML", function (assert) {
		const bundle = {
			getText: (key) => {
				if (key === "Keyboard.Shortcut.Ctrl") { return "Strg"; }
				if (key === "Keyboard.Shortcut.Shift") { return "Umschalt"; }

				return key;
			}
		};
		const getResourceBundleForStub = sinon.stub(Library, "getResourceBundleFor").returns(bundle);
		const xmlString = `
			<interactionDoc>
				<control-interactions>
					<control name="sap.ui.test.Dummy">
						<interaction>
							<kbd>Ctrl+Q</kbd>
							<description>This is a <kbd>Ctrl+Q</kbd> shortcut</description>
						</interaction>
						<interaction>
							<kbd>Ctrl+Shift+S</kbd>
							<description>This is a <kbd>Ctrl+Shift+S</kbd> shortcut</description>
						</interaction>
					</control>
				</control-interactions>
			</interactionDoc>
		`;

		const xml = XMLHelper.parse(xmlString);

		const translatedXML = translateInteractionXML(xml);
		const interactions = getInteractions("sap.ui.test.Dummy", translatedXML);
		assert.ok(Array.isArray(interactions));
		assert.strictEqual(interactions.length, 2);
		assert.deepEqual(interactions[0].kbd[0], {
			raw: "Ctrl+Q",
			translated: "Strg+Q"
		}, "Correct kbd content");
		assert.deepEqual(interactions[1].kbd[0], {
			raw: "Ctrl+Shift+S",
			translated: "Strg+Umschalt+S"
		}, "Correct kbd content");
		assert.strictEqual(interactions[0].description, "This is a <kbd data-sap-ui-kbd-raw=\"Ctrl+Q\">Strg+Q</kbd> shortcut", "<kbd> node annotated correctly.");

		getResourceBundleForStub.restore();
	});

	QUnit.test("getCommandInfosFor - resolves platform-specific (object) command shortcut", function (assert) {
		// A control with a CommandExecution dependent whose command shortcut is defined per platform.
		function fnCreateControl(vShortcut) {
			const oCommandExecution = {
				isA: (sType) => sType === "sap.ui.core.CommandExecution",
				getVisible: () => true,
				getCommand: () => "Create",
				_getCommandInfo: () => ({ shortcut: vShortcut, description: "Create something" })
			};
			return {
				getDependents: () => [oCommandExecution]
			};
		}

		const oControl = fnCreateControl({ "default": "Ctrl+Alt+N", "macintosh": "Ctrl+Option+N" });

		// --- Win device: the "default" variant is used ---
		Device.os.macintosh = false;
		let aInfos = getCommandInfosFor(oControl);
		assert.strictEqual(aInfos.length, 1, "one command info returned");
		assert.strictEqual(aInfos[0].name, "Create", "command name resolved");
		assert.strictEqual(aInfos[0].kbd[0].raw, "Ctrl+Alt+N", "default variant normalized on Win device");

		// --- Mac device: the "macintosh" variant is used and interpreted literally ---
		Device.os.macintosh = true;
		aInfos = getCommandInfosFor(oControl);
		assert.strictEqual(aInfos[0].kbd[0].raw, "Ctrl+Option+N", "macintosh variant normalized literally on Mac device (Ctrl not remapped to Cmd)");
	});

	QUnit.module("Caching", {
		beforeEach: function() {
			KeyboardInteractionDisplay._.clearCache();
		}
	});

	QUnit.test("Cache failed requests of 'interaction.xml' files and to avoid retry attempts", async function (assert) {
		const oFetchStub = sinon.stub(window, 'fetch');
		oFetchStub.resolves({
			ok: false,
			status: 404,
			statusText: 'Not Found'
		});

		// Mock control and library
		const oMockControl = {
			getMetadata: () => ({
				getLibraryName: () => 'sap.ui.dummy'
			}),
			getParent: () => null
		};

		const oMockLibrary = {
			interactionDocumentation: true
		};
		const oLibraryGetStub = sinon.stub(Library, '_get').returns(oMockLibrary);

		try {
			const oAttempt1 = await KeyboardInteractionDisplay._.loadInteractionXMLFor(oMockControl);
			assert.strictEqual(oAttempt1, null, "First call should return null for 404");
			assert.equal(oFetchStub.callCount, 2, "Fetch should be called two times at first attempt (for libraries 'sap.ui.core' & 'sap.ui.dummy')");

			const sCacheKey = 'sap.ui.dummy:';
			assert.ok(KeyboardInteractionDisplay._.hasCacheEntry(sCacheKey), "Failed request should be cached");
			assert.strictEqual(KeyboardInteractionDisplay._.getInteractionXMLFromCache(sCacheKey), null, "Cached entry should be null");

			oFetchStub.resetHistory();

			const oAttempt2 = await KeyboardInteractionDisplay._.loadInteractionXMLFor(oMockControl);
			assert.strictEqual(oAttempt2, null, "Second call should return null from cache");
			assert.equal(oFetchStub.callCount, 0, "Fetch should not be called again");

		} finally {
			oLibraryGetStub.restore();
			oFetchStub.restore();
		}
	});
});
