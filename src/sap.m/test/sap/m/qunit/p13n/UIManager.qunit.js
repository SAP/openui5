/* global QUnit */
sap.ui.define([
    "sap/m/p13n/modules/AdaptationProvider",
    "sap/m/p13n/modules/UIManager",
    "sap/ui/core/Control"
], function (AdaptationProvider, UIManager, Control) {
	"use strict";

	QUnit.module("Basics", {
		beforeEach: function() {
			this.oAdaptationProvider = new AdaptationProvider();
            this.oControl = new Control();

            this.oAdaptationProvider.initAdaptation = function() {
                return Promise.resolve();
            };

            this.oAdaptationProvider.getUISettings = function() {
                return {
                    Test: {}
                };
            };

            this.oUIManager = UIManager.getInstance(this.oAdaptationProvider);
		},
		afterEach: function() {
			this.oAdaptationProvider.destroy();
            this.oControl.destroy();
            this.oUIManager.destroy();
		}
	});

    //----- note: most of the functionality is covered in Engine.qunit tests ----

    QUnit.test("Check 'reset' method triggered in open dialog (default) --> all open panels should be propagated to reset", function(assert){

        var done = assert.async();

        this.oAdaptationProvider.reset = function(oControl, aPanelKeys) {
            assert.deepEqual(oControl, this.oControl, "Control instance provided");
            assert.deepEqual(aPanelKeys, ["Test"], "Correct key propagated for reset");
            done();
        }.bind(this);

        this.oUIManager.show(this.oControl, ["Test"])
        .then(function(oPopup){
            var fnReset = oPopup.getParent().getReset();
            fnReset();
            oPopup.getParent().destroy();
        });
    });

    QUnit.test("Check 'reset' method triggered in open dialog (custom) --> control specific reset handling", function(assert){

        var done = assert.async();

        this.oAdaptationProvider.reset = function(oControl, aPanelKeys) {
            assert.ok(false, "This method should not be called if a custom reset handler has been provided");
        };

        this.oUIManager.show(this.oControl, ["Test"], {
            reset: function(oControl, aPanelKeys) {
                assert.deepEqual(oControl, this.oControl, "Control instance provided");
                assert.deepEqual(aPanelKeys, ["Test"], "Correct key propagated for reset");
                done();
            }.bind(this)
        })
        .then(function(oPopup){
            var fnReset = oPopup.getParent().getReset();
            fnReset();
            oPopup.getParent().destroy();
        });
    });

    QUnit.test("Check 'show' method with configuration", function(assert){

        return this.oUIManager.show(this.oControl, ["Test"], {
            contentHeight: "25rem",
            contentWidth: "20rem",
            showReset: false
        })
        .then(function(oPopup){
            assert.notOk(oPopup.getParent().getReset(), "Reset is disabled");
            assert.equal(oPopup.getContentHeight(), "25rem", "Height properly provided");
            assert.equal(oPopup.getContentWidth(), "20rem", "Width properly provided");

            oPopup.getParent().fireClose();
        });
    });

    QUnit.test("Check 'validateP13n' method is properly called when switching the view", async function(assert){

        const done = assert.async();

        this.oAdaptationProvider.validateP13n = (oControl, sKey, oPanel) => {
            assert.equal(oControl, this.oControl, "Correct control provided");
            assert.equal(sKey, "Test", "Correct key provided");
            done();
        };

        const popup = (await this.oUIManager.show(this.oControl, ["Test"], {
            contentHeight: "25rem",
            contentWidth: "20rem",
            showReset: false
        })).getParent();

        popup._getContainer().fireAfterViewSwitch({
            target: "Test"
        });
    });

});