/*global QUnit */

sap.ui.define([
	"sap/m/StandardTreeItem",
	"sap/m/Tree",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(StandardTreeItem, Tree, MockServer, ODataModelV2, createAndAppendDiv, nextUIUpdate) {
	"use strict";

	createAndAppendDiv("content").style.height = "100%";

	QUnit.module("initial check", {
		beforeEach: async function() {
			// create odata service
			const sMetaDataURI = "test-resources/sap/m/mockdata/";

			// configure respond to requests delay
			MockServer.config({
				autoRespond : true,
				autoRespondAfter : 1000
			});

			// create mockserver
			const oMockServer = new MockServer({
				rootUri : "/odataFake/"
			});
			this.oMockServer = oMockServer;

			// start mockserver
			this.oMockServer.simulate(sMetaDataURI + "treemetadata.xml", sMetaDataURI);
			this.oMockServer.start();

			// creat Tree ***************************************
			const oTemplate = new StandardTreeItem({
				title: "{odata>Description}"
			});

			const oTree = new Tree();

			const oModel = new ODataModelV2("/odataFake/", { useBatch:false });
			oTree.setModel(oModel, "odata");

			oTree.bindItems({
				path: "odata>/Nodes",
				template: oTemplate,
				parameters: {
					countMode: 'Inline'
				}
			});

			oTree.placeAt("content");
			await nextUIUpdate();

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

	QUnit.test("initial", async function(assert) {
		const oTree = this.oTree;

		await new Promise((fnResolve) => {
			oTree.attachEventOnce("updateFinished", fnResolve);
		});

		const aItems = oTree.getItems();
		assert.equal(aItems.length, 3, "the initial loading is done.");
	});

	QUnit.test("expand", async function(assert) {
		const oTree = this.oTree;

		await new Promise((fnResolve) => {
			oTree.attachEventOnce("updateFinished", fnResolve);
		});

		const oArrowDomRef = oTree.getItems()[0].$().find(".sapMTreeItemBaseExpander");
			oArrowDomRef.trigger("click");

		// expand fires change event before data of children nodes is loaded
		// to render the expand icon immediately and not wait for the data loaded
		await new Promise((fnResolve) => {
			oTree.attachEventOnce("updateFinished", fnResolve);
		});

		await new Promise((fnResolve) => {
			oTree.attachEventOnce("updateFinished", fnResolve);
		});

		const aItems = oTree.getItems();
		assert.equal(aItems.length, 5, "expanding is done.");
	});

	QUnit.test("collapse", async function(assert) {
		const oTree = this.oTree;

		await new Promise((fnResolve) => {
			oTree.attachEventOnce("updateFinished", fnResolve);
		});

		let oArrowDomRef = oTree.getItems()[0].$().find(".sapMTreeItemBaseExpander");
		oArrowDomRef.trigger("click");

		// expand fires change event before data of children nodes is loaded
		// to render the expand icon immediately and not wait for the data loaded
		await new Promise((fnResolve) => {
			oTree.attachEventOnce("updateFinished", fnResolve);
		});

		await new Promise((fnResolve) => {
			oTree.attachEventOnce("updateFinished", fnResolve);
		});

		// trigger collapse
		oArrowDomRef = oTree.getItems()[0].$().find(".sapMTreeItemBaseExpander");
		oArrowDomRef.trigger("click");

		await new Promise((fnResolve) => {
			oTree.attachEventOnce("updateFinished", fnResolve);
		});

		const aItems = oTree.getItems();
		assert.equal(aItems.length, 3, "collapsing is done.");
	});

	QUnit.test("expand/collapse multiple nodes", async function(assert) {
		const oTree = this.oTree;

		await new Promise((fnResolve) => {
			oTree.attachEventOnce("updateFinished", fnResolve);
		});

		// trigger expand
		oTree.expand([0,1]);

		// expand fires change event before data of children nodes is loaded
		// to render the expand icon immediately and not wait for the data loaded
		await new Promise((fnResolve) => {
			oTree.attachEventOnce("updateFinished", fnResolve);
		});

		await new Promise((fnResolve) => {
			oTree.attachEventOnce("updateFinished", fnResolve);
		});

		let aItems = oTree.getItems();
		assert.equal(aItems.length, 8, "expanding multiple nodes is done.");

		// trigger collapse
		oTree.collapse([0,3]);

		await new Promise((fnResolve) => {
			oTree.attachEventOnce("updateFinished", fnResolve);
		});

		aItems = oTree.getItems();
		assert.equal(aItems.length, 3, "collapsing multiple nodes is done.");
	});
});