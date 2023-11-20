/* global QUnit */
sap.ui.define([
	"sap/m/p13n/PersistenceProvider",
	"sap/m/p13n/enum/PersistenceMode",
	"sap/ui/core/Core",
	"sap/ui/core/Control",
	"sap/ui/core/StaticArea"
], function (PersistenceProvider, mode, Core, Control, StaticArea) {
	"use strict";

	QUnit.module("PersistenceProvider tests (generic)", {
		beforeEach: function(){
			this.oPP = new PersistenceProvider();
			this.oPP.placeAt("qunit-fixture");
			Core.applyChanges();
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
		assert.ok(this.oPP, "Transient PP is instanciable");
		assert.equal(this.oPP.getMode(), mode.Transient, "Correct mode provided");
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
		assert.ok(this.oPP, "Global PP is instanciable");
		assert.equal(this.oPP.getMode(), mode.Global, "Correct mode provided");
	});

});
