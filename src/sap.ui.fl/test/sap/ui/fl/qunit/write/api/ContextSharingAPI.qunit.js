/* global QUnit */
sap.ui.define([
	"sap/ui/fl/write/api/ContextSharingAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/core/Core",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	ContextSharingAPI,
	Layer,
	WriteStorage,
	FeaturesAPI,
	oCore,
	jQuery,
	sinon
) {
	"use strict";


	var sandbox = sinon.sandbox.create();

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
			sandbox.stub(FeaturesAPI, "isContextSharingEnabled").resolves(false);
			return ContextSharingAPI.createComponent({layer: Layer.CUSTOMER}).then(function(oCompContainer) {
				this.oCompCont = oCompContainer;
				assert.equal(oCompContainer, undefined, "then component is undefined");
			}.bind(this));
		});

		QUnit.test("with connector and layer that support context sharing", function(assert) {
			return ContextSharingAPI.createComponent({layer: Layer.CUSTOMER})
				.then(renderComponentContainer.bind(this))
				.then(function() {
					assert.deepEqual(this.oCompCont.getComponentInstance().getSelectedContexts().role, [], "then component data for selected roles is correct");
				}.bind(this));
		});

		QUnit.test("with connector and layer that support context sharing with duplicate create call", function(assert) {
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
		jQuery("#qunit-fixture").hide();
	});
});