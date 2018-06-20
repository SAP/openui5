/*!
 * ${copyright}
 */
/*global QUnit*/
// QUnit script for DataBinding Messages
sap.ui.require([
    "sap/ui/model/odata/v2/ODataModel"
],
function(
    ODataModel
    /*sinon*/
) {
	"use strict";

    sinon.config.useFakeTimers = false;

    var sServiceUri = "http://services.odata.org/V3/Northwind/Northwind.svc/";
	sServiceUri = "/proxy/http/" + sServiceUri.replace("http://","");

    /**
	 * Removes all shared Metadata
	 */
	function cleanSharedData() {
		sap.ui.model.odata.v2.ODataModel.mSharedData = {server: {}, service: {}, meta: {}};
	}

    QUnit.module("Technical error", {
		beforeEach: function() {
            cleanSharedData();
		},
		afterEach: function() {
		}
	});

    QUnit.test("ListBinding error message", function(assert) {
        assert.expect(4);
        var done = assert.async();
        var oModel = new ODataModel(sServiceUri, {tokenHandling: false, useBatch:false, json:false, defaultCountMode:"None"});
        oModel.metadataLoaded().then(function() {
            var oListBinding = oModel.bindList("/Products", null, null, null, {custom: {Error500:true}});
            //attach change to register binding at model
            oListBinding.attachChange(function(oEvent) {
            });
            oListBinding.attachAggregatedDataStateChange(function(oEvent) {
                var oDataState = oEvent.getParameter("dataState");
                var changes = oDataState.getChanges();
                assert.ok(changes, 'datastate has changes');
                assert.ok(changes.messages, 'datastate has changes with messages');
                assert.equal(changes.messages.value.length, 1, 'one message propagated');
                assert.equal(changes.messages.value[0].technical, true, "message flagged technical");
                done();
            });
            oListBinding.initialize();
            oListBinding.getContexts();
        });
    });
    QUnit.test("ContextBinding error message", function(assert) {
        assert.expect(4);
        var done = assert.async();
        var oModel = new ODataModel(sServiceUri, {tokenHandling: false, useBatch:false, json:false, defaultCountMode:"None"});
        oModel.metadataLoaded().then(function() {
            var oContextBinding = oModel.bindContext("/Products(2)", null, {custom: {Error500:true}});
            //attach change to register binding at model
            oContextBinding.attachChange(function(oEvent) {
            });
            oContextBinding.attachAggregatedDataStateChange(function(oEvent) {
                var oDataState = oEvent.getParameter("dataState");
                var changes = oDataState.getChanges();
                assert.ok(changes, 'datastate has changes');
                assert.ok(changes.messages, 'datastate has changes with messages');
                assert.equal(changes.messages.value.length, 1, 'one message propagated');
                assert.equal(changes.messages.value[0].technical, true, "message flagged technical");
                done();
            });
            oContextBinding.initialize();
        });
    });
    QUnit.test("TreeBinding error message", function(assert) {
       assert.expect(4);
        var done = assert.async();
        var oModel = new ODataModel(sServiceUri, {tokenHandling: false, useBatch:false, json:false});
        oModel.metadataLoaded().then(function() {
            var oTreeBinding = oModel.bindTree("/Products", null, null, {custom: {Error500:true}});
            //attach change to register binding at model
            oTreeBinding.attachChange(function(oEvent) {
            });
            oTreeBinding.attachAggregatedDataStateChange(function(oEvent) {
                var oDataState = oEvent.getParameter("dataState");
                var changes = oDataState.getChanges();
                assert.ok(changes, 'datastate has changes');
                assert.ok(changes.messages, 'datastate has changes with messages');
                assert.equal(changes.messages.value.length, 1, 'one message propagated');
                assert.equal(changes.messages.value[0].technical, true, "message flagged technical");
                done();
            });
            oTreeBinding.initialize();
            oTreeBinding.getContexts();
        });
    });
});
