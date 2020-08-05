/*global QUnit */

sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/m/StandardTreeItem",
	"sap/m/Tree"
], function(createAndAppendDiv, qutils, MockServer, ODataModelV2, StandardTreeItem, Tree) {
	"use strict";
	createAndAppendDiv("content");
	var styleElement = document.createElement("style");
	styleElement.textContent =
		"#content {" +
		"	height: 100%;" +
		"}" +
		"#mSAPUI5SupportMessage {" +
		"	display: none !important;" +
		"}";
	document.head.appendChild(styleElement);



	QUnit.module("initial check", {
		beforeEach: function(){
			// create odata service
			var sMetaDataURI = "test-resources/sap/m/mockdata/";

			// configure respond to requests delay
			MockServer.config({
				autoRespond : true,
				autoRespondAfter : 1000
			});

			// create mockserver
			var oMockServer = new MockServer({
				rootUri : "/odataFake/"
			});
			this.oMockServer = oMockServer;

			// start mockserver
			this.oMockServer.simulate(sMetaDataURI + "treemetadata.xml", sMetaDataURI);
			this.oMockServer.start();

			// creat Tree ***************************************
			var oTemplate = new StandardTreeItem({
				title: "{odata>Description}"
			});

			var oTree = new Tree();

			var oModel = new ODataModelV2("/odataFake/", {useBatch:false});
			oTree.setModel(oModel, "odata");

			oTree.bindItems({
				path: "odata>/Nodes",
				template: oTemplate,
				parameters: {
					countMode: 'Inline'
				}
			});

			oTree.placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oTree = oTree;
		},

		afterEach: function(){
			this.oTree.destroy();
			this.oMockServer.stop();
			this.oMockServer.destroy();
		}
	});

	/*
	// ================================================================================
	// qunit checks
	// ================================================================================
	*/

	QUnit.test("initial", function(assert) {
		var done = assert.async();
		var that = this;

		this.oTree.attachUpdateFinished(function() {
			var aItems = that.oTree.getItems();
			assert.equal(aItems.length, 3, "the initial loading is done.");
			done();
		}

		);
	});

	QUnit.test("expand", function(assert) {
		var done = assert.async();

		var that = this;
		var fn1 = function() {
			that.oTree.detachUpdateFinished(fn1);

			that.oTree.attachUpdateFinished(fn2);

			var oArrowDomRef = that.oTree.getItems()[0].$().find(".sapMTreeItemBaseExpander");
			oArrowDomRef.trigger("click");
		};

		var fn2 = function() {
			that.oTree.detachUpdateFinished(fn2);

			// expand fires change event before data of children nodes is loaded
			// to render the expand icon immediately and not wait for the data loaded
			that.oTree.attachUpdateFinished(fn3);
		};

		var fn3 = function() {
			that.oTree.detachUpdateFinished(fn3);

			var aItems = that.oTree.getItems();
			assert.equal(aItems.length, 5, "expanding is done.");
			done();
		};

		that.oTree.attachUpdateFinished(fn1);
	});

	QUnit.test("collapse", function(assert) {
		var done = assert.async();

		var that = this;
		var fn1 = function() {
			that.oTree.detachUpdateFinished(fn1);

			that.oTree.attachUpdateFinished(fn2);

			var oArrowDomRef = that.oTree.getItems()[0].$().find(".sapMTreeItemBaseExpander");
			oArrowDomRef.trigger("click");
		};

		var fn2 = function() {
			that.oTree.detachUpdateFinished(fn2);

			// expand fires change event before data of children nodes is loaded
			// to render the expand icon immediately and not wait for the data loaded
			that.oTree.attachUpdateFinished(fn3);
		};

		var fn3 = function() {
			// expanded
			that.oTree.detachUpdateFinished(fn3);
			that.oTree.attachUpdateFinished(fn4);

			// trigger collapse
			var oArrowDomRef = that.oTree.getItems()[0].$().find(".sapMTreeItemBaseExpander");
			oArrowDomRef.trigger("click");
		};

		var fn4 = function() {
			that.oTree.detachUpdateFinished(fn4);

			var aItems = that.oTree.getItems();
			assert.equal(aItems.length, 3, "collapsing is done.");
			done();
		};

		that.oTree.attachUpdateFinished(fn1);
	});

	QUnit.test("expand/collapse multiple nodes", function(assert) {
		var done = assert.async();

		var that = this;
		var fn1 = function() {
			that.oTree.detachUpdateFinished(fn1);

			that.oTree.attachUpdateFinished(fn2);

			// trigger expand
			that.oTree.expand([0,1]);
		};

		var fn2 = function() {
			that.oTree.detachUpdateFinished(fn2);

			// expand fires change event before data of children nodes is loaded
			// to render the expand icon immediately and not wait for the data loaded
			that.oTree.attachUpdateFinished(fn3);
		};

		var fn3 = function() {
			// expanded
			that.oTree.detachUpdateFinished(fn3);

			var aItems = that.oTree.getItems();
			assert.equal(aItems.length, 8, "expanding multiple nodes is done.");

			that.oTree.attachUpdateFinished(fn4);

			// trigger collapse
			that.oTree.collapse([0,3]);
		};

		var fn4 = function() {
			that.oTree.detachUpdateFinished(fn4);

			var aItems = that.oTree.getItems();
			assert.equal(aItems.length, 3, "collapsing multiple nodes is done.");
			done();
		};

		that.oTree.attachUpdateFinished(fn1);

	});

});