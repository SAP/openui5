/* global QUnit */
sap.ui.define([
	"sap/m/p13n/PersistenceProvider",
	"sap/ui/mdc/enum/PersistenceMode", //TODO Change this
	"sap/ui/core/Core"
], function (PersistenceProvider, mode, oCore) {
	"use strict";

	QUnit.module("PersistenceProvider tests (generic)", {
		beforeEach: function(){
			this.oPP = new PersistenceProvider();
		},
		afterEach: function(){
			this.oPP.destroy();
		}
	});

	QUnit.test("Dynamic setting of a persistence mode is prohibited as the property is final", function(assert){
		assert.throws(function(){
			this.oPP.setmode(mode.Global);
		}, "Error thrown");
	});

	QUnit.module("PersistenceProvider tests (transient)", {
		beforeEach: function(){
			this.oPP = new PersistenceProvider({
				mode: mode.Transient
			});

			this.oPP.placeAt("qunit-fixture");
		},
		afterEach: function(){
			this.oPP.destroy();
		}
	});

	QUnit.test("instantiate PersistenceProvider", function(assert){
		assert.ok(this.oPP, "Silent VM is instanciable");
	});

	QUnit.test("PersistenceProvider is placed in the static area", function(assert){
		var aStaticAreaContent = oCore.getUIArea(oCore.getStaticAreaRef()).getContent();

		assert.ok(aStaticAreaContent[0].getContent()[0].isA("sap.ui.fl.variants.VariantManagement"), "VM has been placed in the static area");
	});

	QUnit.test("PersistenceProvider is wrapped by a container that sets aria-hidden after rendering", function(assert){
		var done = assert.async();
		var aStaticAreaContent = oCore.getUIArea(oCore.getStaticAreaRef()).getContent();

		this.oPP.onAfterRendering = function() {
			assert.equal(aStaticAreaContent[0].getDomRef().getAttribute("aria-hidden"), "true", "accWrapper container sets aria-hidden attribute");
			done();
		};

	});

	QUnit.test("PersistenceProvider created an inner fl.VariantManagement", function(assert){
		assert.ok(oCore.byId(this.oPP.getId() + "--vm"), "VM created");
	});

	QUnit.test("inner VM cleanup", function(assert){
		this.oPP.destroy();
		assert.ok(!this.oPP._oVM, "Inner VM cleaned up");
	});

	QUnit.module("PersistenceProvider tests (global)", {
		beforeEach: function(){
			this.oPP = new PersistenceProvider({
				mode: mode.Global
			});
		},
		afterEach: function(){
			this.oPP.destroy();
		}
	});

	QUnit.test("PersistenceProvider NOT is placed in the static area", function(assert){
		var aStaticAreaContent = oCore.getUIArea(oCore.getStaticAreaRef()).getContent();

		assert.equal(aStaticAreaContent.length, 0, "No VM in static area");
	});

	QUnit.test("PersistenceProvider did not create an inner fl.VariantManagement", function(assert){
		assert.ok(!this.oPP._oVM, "No VM created");
	});

});
