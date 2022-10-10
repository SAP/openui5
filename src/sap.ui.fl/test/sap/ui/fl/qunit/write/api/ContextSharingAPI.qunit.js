/* global QUnit */
sap.ui.define([
	"sap/ui/fl/write/api/ContextSharingAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/registry/Settings",
	"sap/ui/core/Core",
	"sap/ui/thirdparty/sinon-4"
], function(
	ContextSharingAPI,
	Layer,
	WriteStorage,
	Settings,
	oCore,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	function renderComponentContainer(oCompContainer) {
		this.oCompCont = oCompContainer;
		this.oCompCont.placeAt("qunit-fixture");
		oCore.applyChanges();
		return this.oCompCont.getComponentInstance().getRootControl().loaded();
	}

	QUnit.module("Given ContextSharingAPI.createComponent is called", {
		beforeEach: function() {
			sandbox.stub(WriteStorage, "loadContextDescriptions").resolves({});
		},
		afterEach: function () {
			sandbox.restore();
			if (this.oCompCont) {
				this.oCompCont.destroy();
			}
		}
	}, function() {
		QUnit.test("with connector that does not support context sharing", function(assert) {
			var oSettings = {
				isContextSharingEnabled: false,
				isContextSharingEnabledForComp: false
			};
			sandbox.stub(Settings, "getInstance").resolves(new Settings(oSettings));

			return ContextSharingAPI.createComponent({layer: Layer.CUSTOMER}).then(function(oCompContainer) {
				this.oCompCont = oCompContainer;
				assert.equal(oCompContainer, undefined, "then component is undefined");
			}.bind(this));
		});

		QUnit.test("with connector and layer that support context sharing", function(assert) {
			var oSettings = {
				isContextSharingEnabled: true,
				isContextSharingEnabledForComp: false
			};
			sandbox.stub(Settings, "getInstance").resolves(new Settings(oSettings));

			return ContextSharingAPI.createComponent({layer: Layer.CUSTOMER})
				.then(renderComponentContainer.bind(this))
				.then(function() {
					assert.deepEqual(this.oCompCont.getComponentInstance().getSelectedContexts().role, [], "then component data for selected roles is correct");
				}.bind(this));
		});

		QUnit.test("with connector and layer that does not support context sharing for comp", function(assert) {
			var oSettings = {
				isContextSharingEnabled: true,
				isContextSharingEnabledForComp: false
			};
			sandbox.stub(Settings, "getInstance").resolves(new Settings(oSettings));

			return ContextSharingAPI.createComponent({layer: Layer.CUSTOMER, isComp: true}).then(function(oCompContainer) {
				this.oCompCont = oCompContainer;
				assert.equal(oCompContainer, undefined, "then component is undefined");
			}.bind(this));
		});

		QUnit.test("with connector and layer that support context sharing for comp", function(assert) {
			var oSettings = {
				isContextSharingEnabled: true,
				isContextSharingEnabledForComp: true
			};
			sandbox.stub(Settings, "getInstance").resolves(new Settings(oSettings));

			return ContextSharingAPI.createComponent({layer: Layer.CUSTOMER, isComp: true})
				.then(renderComponentContainer.bind(this))
				.then(function() {
					assert.deepEqual(this.oCompCont.getComponentInstance().getSelectedContexts().role, [], "then component data for selected roles is correct");
				}.bind(this));
		});

		QUnit.test("with connector and layer that support context sharing with duplicate create call", function(assert) {
			var oSettings = {
				isContextSharingEnabled: true,
				isContextSharingEnabledForComp: false
			};
			sandbox.stub(Settings, "getInstance").resolves(new Settings(oSettings));

			return ContextSharingAPI.createComponent({layer: Layer.CUSTOMER})
				.then(renderComponentContainer.bind(this))
				.then(function() {
					assert.deepEqual(this.oCompCont.getComponentInstance().getSelectedContexts().role, [], "then component data for selected roles is correct");
				}.bind(this)).then(function() {
					return ContextSharingAPI.createComponent({layer: Layer.CUSTOMER});
				});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});