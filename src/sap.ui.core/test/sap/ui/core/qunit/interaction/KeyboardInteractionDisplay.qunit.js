/*global sinon, QUnit */
sap.ui.define([
	"sap/ui/Device",
	"sap/ui/core/Lib",
	"sap/ui/util/XMLHelper",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/interaction/KeyboardInteractionDisplay"
], function (Device, Library, XMLHelper, jQuery, KeyboardInteractionDisplay) {
	"use strict";

	QUnit.module("KeyboardInteractionDisplay Utilities", {
		beforeEach: function() {
			this.originalMac = Device.os.macintosh;
			Device.os.macintosh = false; // Simulate Win device
		},
		afterEach: function() {
			Device.os.macintosh = this.originalMac;
		}
	});

	QUnit.test("getNormalizedShortcutString - handles Win and Mac modifier keys", function (assert) {
		Device.os.macintosh = false;
		assert.strictEqual(
			KeyboardInteractionDisplay._.getNormalizedShortcutString("Ctrl+Alt+S"),
			"Ctrl+Alt+S",
			"Correctly normalized for non-Mac"
		);

		Device.os.macintosh = true;
		assert.strictEqual(
			KeyboardInteractionDisplay._.getNormalizedShortcutString("Ctrl+Shift+K"),
			"Cmd+Shift+K",
			"Correctly normalized for Mac"
		);
	});

	QUnit.test("translateShortcut", function (assert) {
		const bundle = {
			getText: (key) => {
				if (key === "Keyboard.Shortcut.Ctrl") { return "Strg"; }
				if (key === "Keyboard.Shortcut.S") { return "S"; }

				return key;
			}
		};

		const getResourceBundleForStub = sinon.stub(Library, "getResourceBundleFor").returns(bundle);
		const sResult = KeyboardInteractionDisplay._.translateShortcut("Ctrl+S");
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

		const annotated = KeyboardInteractionDisplay._.annotateAndTranslateKbdTags(div);
		const kbd = annotated.querySelector("kbd");

		assert.strictEqual(kbd.getAttribute("data-sap-ui-kbd-raw"), "Ctrl+S", "Attribute is set correctly.");
		assert.strictEqual(kbd.textContent, "Strg+S", "Text is translated correctly");

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
		const interactions = KeyboardInteractionDisplay._.getInteractions("sap.ui.test.Dummy", xml);
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
