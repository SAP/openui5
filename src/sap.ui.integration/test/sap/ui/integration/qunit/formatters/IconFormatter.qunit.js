/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/integration/formatters/IconFormatter",
	"sap/ui/integration/util/Destinations"
],
function (
	IconFormatter,
	Destinations
) {
	"use strict";

	QUnit.module("General", {
		beforeEach: function () {
			this.oDestinationsStub = sinon.createStubInstance(Destinations);
			this.oIconFormatter = new IconFormatter(this.oDestinationsStub);
		},
		afterEach: function () {
			this.oIconFormatter.destroy();
			this.oIconFormatter = null;
		}
	});

	QUnit.test("Resolve icon src", function (assert) {
		var aSamples = [
				null,
				"",
				"./my/image.png",
				"../my/image.png",
				"http://my/image.png",
				"sap-icon://accept",
				"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
			],
			aExpected = [
				null,
				"",
				sap.ui.require.toUrl("test/app/id/my/image.png"),
				sap.ui.require.toUrl("test/app/id/my/image.png"),
				"http://my/image.png",
				"sap-icon://accept",
				"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
			];

		this.oDestinationsStub.hasDestination.returns(false);

		aSamples.forEach(function (sSample, iInd) {
			var sSrc = this.oIconFormatter.formatSrc(sSample, "test.app.id"),
				sExpected = aExpected[iInd];

			assert.strictEqual(sSrc, sExpected, "The image src is as expected.");
		}.bind(this));
	});

	QUnit.test("Resolve icon src with destination", function (assert) {
		var done = assert.async(),
			sImage = "./my/image.png",
			sSrcPromise,
			sExpectedSrc = "path/to/destination/image.png";

		this.oDestinationsStub.hasDestination.returns(true);
		this.oDestinationsStub.processString.returns(Promise.resolve(sExpectedSrc));

		sSrcPromise = this.oIconFormatter.formatSrc(sImage, "test.app.id");

		sSrcPromise.then(function (sSrc) {
			assert.strictEqual(sSrc, sExpectedSrc, "The image src is as expected.");
			done();
		});
	});
});
