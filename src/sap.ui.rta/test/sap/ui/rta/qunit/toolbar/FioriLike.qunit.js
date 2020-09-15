/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/rta/toolbar/FioriLike"
],
function(
	jQuery,
	FioriLike
) {
	'use strict';


	QUnit.module('Given FioriLike toolbar is instantiated', {
		beforeEach: function() {
			sap.ui.getCore().applyChanges();
			this.oToolbar = new FioriLike({
				textResources: sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta")
			});
		},
		afterEach: function() {
			this.oToolbar.destroy();
		}
	}, function() {
		QUnit.test("when the toolbar gets opened", function(assert) {
			return this.oToolbar.show()
				.then(function () {
					var $fioriLikeToolbar = this.oToolbar.getDomRef();
					var $classList = $fioriLikeToolbar.classList;
					assert.ok($classList.contains("sapUiRtaToolbar"), "then rta toolbar is shown");
					assert.ok($classList.contains("type_fiori"), "then a fiori like styleclass is added to the toolbar");
				}.bind(this));
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});