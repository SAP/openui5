/* global QUnit */

sap.ui.define([
	"sap/ui/rta/toolbar/FioriLike",
	"sap/ui/core/Core",
	"sap/ui/core/Lib"
],
function(
	FioriLike,
	oCore,
	Lib
) {
	"use strict";

	QUnit.module("Given FioriLike toolbar is instantiated", {
		beforeEach() {
			oCore.applyChanges();
			this.oToolbar = new FioriLike({
				textResources: Lib.getResourceBundleFor("sap.ui.rta")
			});
			return this.oToolbar.onFragmentLoaded();
		},
		afterEach() {
			this.oToolbar.destroy();
		}
	}, function() {
		QUnit.test("when the toolbar gets opened", function(assert) {
			return this.oToolbar.show()
			.then(function() {
				var $fioriLikeToolbar = this.oToolbar.getDomRef();
				var $classList = $fioriLikeToolbar.classList;
				assert.ok($classList.contains("sapUiRtaToolbar"), "then rta toolbar is shown");
				assert.ok($classList.contains("type_fiori"), "then a fiori like styleclass is added to the toolbar");
			}.bind(this));
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});