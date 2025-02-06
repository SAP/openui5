/*global QUnit */

sap.ui.define([
	"sap/m/Text",
	"sap/ui/core/hyphenation/Hyphenation",
	"sap/ui/test/utils/nextUIUpdate"
], function(Text, Hyphenation, nextUIUpdate) {
	"use strict";

	QUnit.module("Hyphenation", {
		beforeEach: async function() {
			this.oHyphenation = Hyphenation.getInstance();

			this.text = new Text({
				text: 'pneumonoultramicroscopicsilicovolcanoconiosis',
				wrapping: true,
				wrappingType: 'Hyphenated'
			});
			this.text.placeAt('content');
			await nextUIUpdate();
		}
	});

	QUnit.test("hyphenate example words", function (assert) {
		var done = assert.async();

		this.oHyphenation.initialize('en-us', {"hyphen": "-"}).then(function () {
			var domText = this.text.getDomRef().innerText;

			assert.notOk(this.text.$().hasClass('sapUiHyphenation'), 'hyphenation class is not added');
			assert.equal(domText, this.text.getText(), 'text is not hyphenated');

			done();
		}.bind(this));
	});
});
