/*global sinon, QUnit */
sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/Lib",
	"sap/ui/util/XMLHelper",
	"sap/ui/core/interaction/KeyboardInteractionDisplay"
], function (Device, Library, XMLHelper, KeyboardInteractionDisplay) {
	"use strict";

	const annotateAndTranslateKbdTags = KeyboardInteractionDisplay._.annotateAndTranslateKbdTags;
	const getNormalizedShortcutString = KeyboardInteractionDisplay._.getNormalizedShortcutString;
	const getInteractions = KeyboardInteractionDisplay._.getInteractions;
	const localizeKeys = KeyboardInteractionDisplay._.localizeKeys;
	const translateInteractionXML = KeyboardInteractionDisplay._.translateInteractionXML;

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
			"Cmd+Alt+S",
			"'Ctrl+Alt+S' correctly normalized to 'Cmd+Alt+S' for Mac"
		);

		assert.strictEqual(
			getNormalizedShortcutString("ctrl+Alt+ s"),
			"Cmd+Alt+S",
			"'ctrl+Alt+ s' correctly normalized to 'Cmd+Alt+S' for Mac"
		);

		assert.strictEqual(
			getNormalizedShortcutString("Alt+ ctrl+ s"),
			"Cmd+Alt+S",
			"'Alt+ ctrl+ s' correctly normalized to 'Cmd+Alt+S' for Mac"
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
});
