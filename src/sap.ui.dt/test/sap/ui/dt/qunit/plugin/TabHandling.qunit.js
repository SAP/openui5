/* global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/plugin/TabHandling",
	"sap/m/Button",
	"sap/ui/layout/VerticalLayout"
],
function(
	jQuery,
	DesignTime,
	TabHandling,
	Button,
	VerticalLayout
) {
	"use strict";

	QUnit.module("Given that the design time is active ", {
		beforeEach: function(assert) {
			this.oButton1 = new Button();
			this.oButton2 = new Button();
			this.oLayout = new VerticalLayout({
				content: [
					this.oButton1,
					this.oButton2
				]
			});
			this.oLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oTabHandling = new TabHandling();

			var done = assert.async();

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout],
				plugins: [
					this.oTabHandling
				]
			});

			this.oDesignTime.attachEventOnce("synced", function () {
				sap.ui.getCore().applyChanges();
				done();
			});
		},
		afterEach: function() {
			this.oLayout.destroy();
			this.oDesignTime.destroy();
		}
	}, function () {
		QUnit.test("when the TabHandling plugin is loaded", function (assert) {
			assert.strictEqual(this.oLayout.$().find(":focusable:not([tabindex=-1])").length, 0, "then no UI5 controls are tabable");
		});

		QUnit.test("when the TabHandling plugin is loaded and destroyed afterwards", function (assert) {
			this.oTabHandling.destroy();
			assert.strictEqual(this.oLayout.$().find(":focusable:not([tabindex=-1])").length, 2, "then the UI5 controls are tabable");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
