/* global QUnit */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/api/connectors/FileListBaseConnector",
	"sap/base/util/LoaderExtensions",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/thirdparty/sinon-4"
], function(
	merge,
	FileListBaseConnector,
	LoaderExtensions,
	StorageUtils,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	var aFilePaths = [
		"./test-resources/sap/ui/fl/qunit/testResources/changes/id_1445501120486_25_hideControl.change",
		"./test-resources/sap/ui/fl/qunit/testResources/changes/id_1445501120486_26_hideControl.change"
	];

	var oConnectorImplementation = merge({}, FileListBaseConnector, {
		getFileList: function () {
			return Promise.resolve(aFilePaths);
		}
	});


	QUnit.module("Given FileListBaseConnector without implementation", {
		beforeEach: function() {
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When loadFledData is called", function(assert) {
			assert.throws(
				FileListBaseConnector.loadFlexData({reference: "app.id"}),
				"the call is rejected"
			);
		});
	});

	QUnit.module("Given a ListConnector implementing the FileListBaseConnector", {
		beforeEach: function() {
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When", function(assert) {
			return oConnectorImplementation.loadFlexData({reference: "app.id"}).then(function(oFlexData) {
				assert.equal(oFlexData[0].changes.length, 2, "two changes were loaded");
				// just check a single property to ensure the correct file loading and sorting
				assert.equal(oFlexData[0].changes[0].fileName, "id_1445501120486_26", "the file was loaded correct");
				assert.equal(oFlexData[0].changes[1].fileName, "id_1445501120486_25", "the file was loaded correct");
			});
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
