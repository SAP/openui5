/* global QUnit */
sap.ui.define([
	"delegates/odata/v4/FilterBarDelegate",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/core/util/MockServer",
	"sap/ui/mdc/FilterBar",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/mdc/odata/v4/TypeMap"
], function(FilterBarDelegate, ODataModel, MockServer, FilterBar, JsControlTreeModifier, ODataV4TypeMap) {
	'use strict';

	const createMockServer = function() {
		const oMockServer = new MockServer({
			rootUri: "/mdc.v4.FilterBarDelegate/"
		});

		MockServer.config({
			autoRespond: true,
			autoRespondAfter: 10
		});

		oMockServer.simulate(
			"test-resources/sap/ui/mdc/qunit/odata/v4/mockserver/metadata.xml",
			"test-resources/sap/ui/mdc/qunit/odata/v4/mockserver/");

		oMockServer.start();

		return oMockServer;
	};

	const createDataModel = function () {
		return new Promise(function(resolve, reject) {
			const mModelOptions = {
					serviceUrl: "/mdc.v4.FilterBarDelegate/",
					autoExpandSelect: true
			};
			resolve(new ODataModel(mModelOptions));
		});
	};

	QUnit.module("V4 FilterBarDelegate unit test", {
		before: function() {
			this.oMockServer = createMockServer();

			this._oFilterBar = new FilterBar({
				delegate : {'name' : 'delegates/odata/v4/FilterBarDelegate',
						   'payload' : {'modelName': 'sample',  'collectionName': 'TypeList'}}
			});
		},
		after: function() {
			this._oFilterBar.destroy();
			this.oMockServer.destroy();
		},
		beforeEach: function() {
		},
		afterEach: function() {
		}
	});

	QUnit.test('Check Delegate', function(assert) {
		const done = assert.async();

		this._oFilterBar.initControlDelegate().then(function(oDelegate) {
			assert.ok(oDelegate);
			done();
		});
	});

	QUnit.test('Check fetchProperties', function(assert) {
		const done = assert.async();

		createDataModel().then(function (oModel) {
			this._oFilterBar.setModel(oModel, "sample");
			FilterBarDelegate.fetchProperties(this._oFilterBar).then(function(aProperties) {
				assert.ok(aProperties);
				assert.equal(aProperties.length, 27);

				done();
			});
		}.bind(this));
	});

	QUnit.test('Check addItem', function(assert) {
		const done = assert.async();

		createDataModel().then(function (oModel) {
			this._oFilterBar.setModel(oModel, "sample");
			FilterBarDelegate.addItem("String", this._oFilterBar, { modifier: JsControlTreeModifier, appComponent: this._oFilterBar} ).then(function(oFilterField) {
				assert.ok(oFilterField);
				done();
			});
		}.bind(this));
	});

	QUnit.test('Check removeItem', function(assert) {
		const done = assert.async();

		createDataModel().then(function (oModel) {
			this._oFilterBar.setModel(oModel, "sample");
			FilterBarDelegate.removeItem().then(function(bValue) {
				assert.ok(bValue);
				done();
			});
		}.bind(this));
	});

	QUnit.test('Check ODataV4TypeMap', function(assert) {
		assert.ok(FilterBarDelegate.getTypeMap, "getTypeMap exists");
		assert.equal(FilterBarDelegate.getTypeMap(), ODataV4TypeMap, "getTypeMap returns v4 typemap instance");
	});

	QUnit.test('Check complex property ignored', function(assert) {
		const done = assert.async();

		createDataModel().then(function (oModel) {
			this._oFilterBar.setModel(oModel, "sample");
			FilterBarDelegate.fetchProperties(this._oFilterBar).then(function(aProperties) {
				assert.equal(aProperties.filter(function(oProperty) { return oProperty.name === "Complex"; }), 0);

				done();
			});
		}.bind(this));
	});
});
