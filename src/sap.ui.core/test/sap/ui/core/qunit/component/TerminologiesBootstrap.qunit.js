sap.ui.define([
	'sap/ui/core/Component'
], function(Component) {
	"use strict";
	/* global QUnit */

	QUnit.test("Propagate Terminologies via Configuration: No terminologies given via API", function (assert) {
		return Component.create({
			name: "testdata.terminologies",
			manifest: false
		}).then(function (oComponent) {
			this.oComponent = oComponent;

			// terminologies from configuration access
			assert.deepEqual(oComponent.getActiveTerminologies(), ["oil", "retail"], "The list of terminologies should be correctly taken from bootstrap configuration");

			var oUsage = {
				usage: "myReusedTerminologies"
			};

			return this.oComponent.createComponent(oUsage).then(function (oReuseComponent) {
				assert.ok(oReuseComponent, "Component should be loaded");
				// terminologies "inherited" via owner component
				assert.deepEqual(oReuseComponent.getActiveTerminologies(), ["oil", "retail"], "The list of terminologies should be correctly  passed to reuse component");
				return oReuseComponent;
			}).then(function (oReuseComponent) {
				oReuseComponent.destroy();
			});
		}.bind(this));
	});

	QUnit.test("Propagate Terminologies via API and Configuration: API has priority 1", function (assert) {
		return Component.create({
			name: "testdata.terminologies",
			manifest: false,
			activeTerminologies: ["fashion"]
		}).then(function (oComponent) {
			this.oComponent = oComponent;

			// terminologies from configuration access
			assert.deepEqual(oComponent.getActiveTerminologies(), ["fashion"], "The list of terminologies should be correctly taken from factory arguments");

			var oUsage = {
				usage: "myReusedTerminologies"
			};

			return this.oComponent.createComponent(oUsage).then(function (oReuseComponent) {
				assert.ok(oReuseComponent, "Component should be loaded");
				// terminologies "inherited" via owner component
				assert.deepEqual(oReuseComponent.getActiveTerminologies(), ["fashion"], "The list of terminologies should be correctly passed to reuse component");
				return oReuseComponent;
			}).then(function (oReuseComponent) {
				oReuseComponent.destroy();
			});
		}.bind(this));
	});

	QUnit.test("Propagate Terminologies via API and Configuration: API has priority 2", function (assert) {
		return Component.create({
			name: "testdata.terminologies",
			manifest: false,
			activeTerminologies: ["fashion"]
		}).then(function (oComponent) {
			this.oComponent = oComponent;

			// terminologies from configuration access
			assert.deepEqual(oComponent.getActiveTerminologies(), ["fashion"], "The list of terminologies should be correctly taken from factory arguments");

			var oUsage = {
				usage: "myReusedTerminologies"
			};

			return this.oComponent.createComponent(oUsage).then(function (oReuseComponent) {
				assert.ok(oReuseComponent, "Component should be loaded");
				// terminologies "inherited" via owner component
				assert.deepEqual(oReuseComponent.getActiveTerminologies(), ["fashion"], "The list of terminologies should be correctly taken from oOwner.createComponent factory");
				return oReuseComponent;
			}).then(function (oReuseComponent) {
				oReuseComponent.destroy();
			});
		}.bind(this));
	});

});
