/* global QUnit */
sap.ui.define([
    "sap/ui/mdc/p13n/PersistenceProvider",
    "sap/ui/mdc/enum/PersistenceMode"
], function (PersistenceProvider, mode) {
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
		},
		afterEach: function(){
            this.oPP.destroy();
		}
	});

	QUnit.test("instantiate PersistenceProvider", function(assert){
        assert.ok(this.oPP, "Silent VM is instanciable");
    });

    QUnit.test("PersistenceProvider is placed in the static area", function(assert){
        var aStaticAreaContent = sap.ui.getCore().getUIArea(sap.ui.getCore().getStaticAreaRef()).getContent();

        assert.ok(aStaticAreaContent[0].isA("sap.ui.fl.variants.VariantManagement"), "VM has been placed in the static area");
    });

    QUnit.test("PersistenceProvider created an inner fl.VariantManagement", function(assert){
        assert.ok(this.oPP._oVM, "VM created");
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
        var aStaticAreaContent = sap.ui.getCore().getUIArea(sap.ui.getCore().getStaticAreaRef()).getContent();

        assert.equal(aStaticAreaContent.length, 0, "No VM in static area");
    });

    QUnit.test("PersistenceProvider did not create an inner fl.VariantManagement", function(assert){
        assert.ok(!this.oPP._oVM, "No VM created");
    });

});
