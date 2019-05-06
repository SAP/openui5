/*global QUnit */
sap.ui.define([
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/core/util/MockServer",
    "sap/base/util/isEmptyObject"
], function (ODataModel, MockServer, isEmptyObject) {
    "use strict";

    var oCreateEntryProduct = {
        "ProductID": "AD-12345",
        "Name": "TestEntry"
    };


    QUnit.module("Get all pending changes deferred (group requests)", {
        before: function () { },
        after: function () { },
        beforeEach: function () {
            this.sServiceUri = "/SalesOrderSrv/";
            var sDataRootPath = "test-resources/sap/ui/core/qunit/testdata/SalesOrder/";

            this.oMockServer = new MockServer({
                rootUri: this.sServiceUri
            });
            this.oMockServer.simulate(sDataRootPath + "metadata.xml", sDataRootPath);
            this.oMockServer.start();
            this.oModel = new ODataModel(this.sServiceUri);

        },
        afterEach: function () {
            this.oModel.destroy();
        }
    });


    /**
     * Execute for all relevant CRUD (create/update/remove) operations
     */

    var aDeferredChanges = [
        {operation: "create", parameters : ["/ProductSet", oCreateEntryProduct, {groupId: "changes"}]},
        {operation: "update", parameters : ["/ProductSet('HT-1000')", oCreateEntryProduct, {groupId: "changes"}]},
        {operation: "remove", parameters : ["/ProductSet('HT-1000')", {groupId: "changes"}]}
    ];

    aDeferredChanges.forEach(function (oChange) {

        QUnit.test(oChange.operation + " with submitChanges", function (assert) {
            var done = assert.async();
            var that = this;
            that.oModel.metadataLoaded().then(function () {

                that.oModel[oChange.operation].apply(that.oModel, oChange.parameters);
                assert.ok(that.oModel.hasPendingChanges(true), "Pending changes detected.");
                assert.notOk(that.oModel.hasPendingChanges(), "Pending changes not relevant.");

                that.oModel.submitChanges({
                    success: function () {
                        assert.notOk(that.oModel.hasPendingChanges(true), "No pending changes (all).");
                        assert.notOk(that.oModel.hasPendingChanges(), "No pending changes.");
                        done();
                    }
                });
            });
        });

        QUnit.test(oChange.operation + " with manual abort", function (assert) {
            var done = assert.async();
            var that = this;
            that.oModel.metadataLoaded().then(function () {

                var oRequestHandle = that.oModel[oChange.operation].apply(that.oModel, oChange.parameters);
                assert.ok(that.oModel.hasPendingChanges(true), "Pending changes detected.");
                assert.notOk(that.oModel.hasPendingChanges(), "Pending changes not relevant.");

                oRequestHandle.abort();

                assert.notOk(that.oModel.hasPendingChanges(true), "No pending changes (all).");
                assert.notOk(that.oModel.hasPendingChanges(), "No pending changes.");
                assert.ok(oRequestHandle.abort, "Requesthandle created.");
                done();
            });
        });

        QUnit.test(oChange.operation + " executed twice with multiple manual abort", function (assert) {
            var done = assert.async();
            var that = this;
            that.oModel.metadataLoaded().then(function () {

                var oRequestHandle1 = that.oModel[oChange.operation].apply(that.oModel, oChange.parameters);
                var oRequestHandle2 = that.oModel[oChange.operation].apply(that.oModel, oChange.parameters);

                assert.ok(that.oModel.hasPendingChanges(true), "Pending changes detected.");
                assert.notOk(that.oModel.hasPendingChanges(), "Pending changes not relevant.");

                assert.ok(oRequestHandle1, "Requesthandle1 created.");
                assert.ok(oRequestHandle2, "Requesthandle2 created.");

                oRequestHandle1.abort();
                oRequestHandle1.abort();
                oRequestHandle2.abort();
                oRequestHandle2.abort();

                assert.notOk(that.oModel.hasPendingChanges(true), "No pending changes (all).");
                assert.notOk(that.oModel.hasPendingChanges(), "No pending changes.");
                assert.ok(oRequestHandle1.abort, "Requesthandle1 abort is valid.");
                assert.ok(oRequestHandle2.abort, "Requesthandle2 abort is valid.");
                done();
            });
        });

        QUnit.test(oChange.operation + " with failed xhr (status 404)", function (assert) {
            var done = assert.async();
            var that = this;
            that.oModel.setUseBatch(false);
            that.oModel.metadataLoaded().then(function () {

                var aParams = oChange.parameters.slice();
                var lastParameter = aParams[aParams.length - 1];
                lastParameter = Object.assign({}, lastParameter, {
                    groupId: "changes",
                    error: function () {
                        assert.notOk(that.oModel.hasPendingChanges(true), "Pending changes detected (all).");
                        assert.notOk(that.oModel.hasPendingChanges(), "Pending changes not relevant.");
                        done();
                    }
                });
                aParams[aParams.length - 1] = lastParameter;
                aParams[0] = "/ProductSetInvalid";

                that.oModel[oChange.operation].apply(that.oModel, aParams);
                assert.ok(that.oModel.hasPendingChanges(true), "Pending changes detected.");
                assert.notOk(that.oModel.hasPendingChanges(), "Pending changes not relevant.");
                that.oModel.submitChanges();
            });
        });


        QUnit.test(oChange.operation + " with resetChanges", function (assert) {
            var done = assert.async();
            var that = this;
            that.oModel.metadataLoaded().then(function () {

                var oRequestHandle = that.oModel[oChange.operation].apply(that.oModel, oChange.parameters);
                assert.ok(that.oModel.hasPendingChanges(true), "Pending changes detected.");
                assert.notOk(that.oModel.hasPendingChanges(), "Pending changes not relevant.");

                var fnOriginalAbort = oRequestHandle.abort;
                oRequestHandle.abort = function(){
                    fnOriginalAbort.apply(this, arguments);
                    assert.notOk(that.oModel.hasPendingChanges(true), "No pending changes (all).");
                    assert.notOk(that.oModel.hasPendingChanges(), "No pending changes.");
                    done();
                };

                // #abort() should be called on the request handle when resetting the changes
                that.oModel.resetChanges(undefined, true);
            });
        });

        QUnit.test(oChange.operation + " with resetChanges of path", function (assert) {
            var done = assert.async();
            var that = this;
            that.oModel.metadataLoaded().then(function () {

                var oRequestHandle = that.oModel[oChange.operation].apply(that.oModel, oChange.parameters);
                assert.ok(that.oModel.hasPendingChanges(true), "Pending changes detected.");
                assert.notOk(that.oModel.hasPendingChanges(), "Pending changes not relevant.");

                var fnOriginalAbort = oRequestHandle.abort;
                oRequestHandle.abort = function(){
                    fnOriginalAbort.apply(this, arguments);
                    assert.notOk(that.oModel.hasPendingChanges(true), "No pending changes (all).");
                    assert.notOk(that.oModel.hasPendingChanges(), "No pending changes.");
                    done();
                };

                // #abort() should be called on the request handle when resetting the changes
                that.oModel.resetChanges([oChange.parameters[0]], true);
            });
        });
    });

    // Staged changes

    QUnit.test("createEntry with submitChanges", function(assert) {
        var done = assert.async();
        var that = this;
        var oChangedEntities;
        that.oModel.metadataLoaded().then(function () {

            that.oModel.createEntry("/ProductSet('AD-1000')", {
                "properties":{
                    "Name" : "First try"
                }
            });

            oChangedEntities = that.oModel.getPendingChanges(true);

            assert.notOk(isEmptyObject(oChangedEntities), "there should be \"staged\" entries");

            that.oModel.submitChanges({
                success: function() {
                    oChangedEntities = that.oModel.getPendingChanges(true);
                    assert.ok(isEmptyObject(oChangedEntities), "there shouldn't be \"staged\" entries");
                    done();
                }
            });
        });
    });

    QUnit.test("Abort requests with same key only", function(assert) {
        var done = assert.async();
        var that = this;
        var bAborted = false;

        that.oModel.metadataLoaded().then(function () {

            that.oModel.read("/ProductSet('AD-1000')", {
                success: function(){
                    that.oModel.setProperty("/ProductSet('AD-1000')/Name", "newName");

                    that.oModel.submitChanges({success: function(){
                        assert.ok(!bAborted, "Not related change was not aborted.");
                        done();
                    }});

                    //Trigger other request with same change group, which shouldn't be aborted
                    that.oModel.update("/ProductSet('HT-1000')", {"Name": "Should not be aborted"}, {
                        groupId: "changes",
                        error: function(){
                            bAborted = true;
                        }
                    });
                }
            });

        });


    });

});