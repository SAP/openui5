/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/ApplyStrategyFactory",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
],
function (
	ApplyStrategyFactory,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();


	QUnit.module("ApplyStrategyFactory", {
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when getting runtime strategy", function (assert) {
			var RuntimeStrategy = ApplyStrategyFactory.getRuntimeStrategy();

			assert.ok(RuntimeStrategy.registry);
			assert.ok(RuntimeStrategy.handleError);
			assert.ok(RuntimeStrategy.processTexts);
			return RuntimeStrategy.registry().then(function(Registry) {
				assert.ok(Registry["appdescr_ui5_addLibraries"], "runtime registry contains runtime mergers");
				assert.notOk(Registry["appdescr_app_changeDataSource"], "runtime registry does not contain build merger");
			});
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
