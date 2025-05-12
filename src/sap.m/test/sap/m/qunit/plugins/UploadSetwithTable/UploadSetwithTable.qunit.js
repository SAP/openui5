/*!
 * ${copyright}
 */
/* global QUnit, sinon */
sap.ui.define([
	"sap/m/Text",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/plugins/UploadSetwithTable",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/table/Column",
	"sap/ui/table/Table",
	"./templateHelper",
	"sap/m/upload/ActionsPlaceholder",
	"sap/m/OverflowToolbar",
	"sap/m/upload/UploaderTableItem",
	"sap/ui/model/type/Boolean",
	"sap/ui/base/Event",
	"sap/m/upload/UploadItem",
    "sap/m/library",
	"sap/base/Log",
	"sap/ui/base/Event",
	"sap/m/upload/UploadItemConfiguration",
	"sap/m/Dialog",
	"sap/m/upload/FilePreviewDialog",
	"sap/ui/codeeditor/CodeEditor",
	"sap/m/Button"
], function (Text, MTable, MColumn, ColumnListItem, UploadSetwithTable, MDCTable, MDCColumn, JSONModel,
			qutils, nextUIUpdate, GridColumn, GridTable, TemplateHelper, ActionsPlaceholder, OverflowToolbar,
			Uploader, Boolean, EventBase, UploadItem, mLibrary, Log, Event, UploadItemConfiguration, Dialog,
			FilePreviewDialog, CodeEditor, Button) {
	"use strict";

	const oJSONModel = new JSONModel();

	oJSONModel.loadData("test-resources/sap/m/qunit/plugins/UploadSetwithTable/data/documents.json");

	let fnPreviewHandler = function () {
		// placeholder for file preview handler
	};

	const getFilePreviewHandler = function () {
		return fnPreviewHandler;
	};

	const setFilePreviewHandler = function (fnHandler) {
		fnPreviewHandler = fnHandler;
	};

	async function createGridTable(oSettings = {}) {

		const mSettings = Object.assign({
			columns: [
				new GridColumn({ name: "File Name", template: TemplateHelper.getFileNameColumnTemplate() }),
				new GridColumn({ name: "ID", template: TemplateHelper.getIdColumnTemplate() }),
				new GridColumn({ name: "Status", template: TemplateHelper.getStatusColumnTemplate() })
			],
			rows: "{/documents}",
			models: oJSONModel
		}, oSettings);

		const oTable = new GridTable(mSettings);
		oTable.placeAt("qunit-fixture");

		await nextUIUpdate();
		return oTable;
	}

	async function createResponsiveTable(oSettings) {

		const mSettings = Object.assign({
			columns: [
				new MColumn({ header: new Text({text: "File Name"}) }),
				new MColumn({ header: new Text({text: "ID"}) }),
				new MColumn({ header: new Text({text: "Status"}) })
			],
			items: {
				path: "/documents",
				template : new ColumnListItem({
					cells: [
						TemplateHelper.getFileNameColumnTemplate(),
						TemplateHelper.getIdColumnTemplate(),
						TemplateHelper.getStatusColumnTemplate()
					],
					type: "Active"
				})
			},
			models: oJSONModel
		}, oSettings);

		const oTable = new MTable(mSettings);
		oTable.placeAt("qunit-fixture");

		await nextUIUpdate();
		return oTable;
	}

	async function createMDCTable(mSettings) {
		mSettings = Object.assign({
			type: "ResponsiveTable",
			delegate: {
				name: "test-resources/sap/m/qunit/plugins/UploadSetwithTable/delegates/JSONTableDelegate",
				payload: {
					bindingPath: '/documents'
				}
			},
			selectionMode: "Multi",
			columns: [
				new MDCColumn({
					header: "File Name",
					propertyKey: "fileName",
					template: TemplateHelper.getFileNameColumnTemplate(null, getFilePreviewHandler())
				}),
				new MDCColumn({
					header: "ID",
					propertyKey: "id",
					template: TemplateHelper.getIdColumnTemplate()
				}),
				new MDCColumn({
					header: "Status",
					propertyKey: "status",
					template: TemplateHelper.getStatusColumnTemplate()
				})
			],
			models: oJSONModel
		}, mSettings);

		const oTable = new MDCTable(mSettings);
		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		return oTable;
	}

	const NoopUploader = Uploader.extend("sap.m.qunit.upload.NoopUploader", {});
	NoopUploader.prototype.uploadItem = function (oItem, aHeaders) {};
	NoopUploader.prototype.downloadItem = function (oItem, aHeaders, bAskForLocation) {};

	// Test module for the plugin's general functionality and usage with Different Table types.
	QUnit.module("Plugin general functionality", {
		beforeEach: function() {
			this.oTable = null;

			this.oUploadSetwithTablePlugin = null;
		},
		afterEach: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
		}
	});

	QUnit.test("Plugin works with MDC table of Responsive Type", async function (assert) {
		// arrange
		const done = assert.async();

		this.oTable = await createMDCTable({
			type: "ResponsiveTable"
		});
		this.oTable.addDependent(new UploadSetwithTable());
		await this.oTable.initialized();

		this.oUploadSetwithTablePlugin = this.oTable?.getDependents()?.find((oPlugin) => oPlugin.isA("sap.m.plugins.UploadSetwithTable"));

		// act
		this.oTable._oTable.attachEventOnce("updateFinished", () => {
			const oBinding = this.oTable._oTable.getBinding("items");

			// assert
			assert.ok(oBinding, "MDC Table's items are bound");
			assert.ok(this.oUploadSetwithTablePlugin, "UploadSetwithTable plugin is available as table's dependent.");

			assert.equal(this.oUploadSetwithTablePlugin.getControl(), this.oTable, "The table is set as plugin owner for the UploadSetwithTable plugin");
			assert.ok(this.oUploadSetwithTablePlugin.getEnabled(), "UploadSetwithTable Plugin is enabled");
			assert.ok(this.oUploadSetwithTablePlugin.isActive(), "UploadSetwithTable is active");
			done();
		});
	});

	QUnit.test("Plugin works with MDC table of Grid Type", async function (assert) {
		// arrange
		const done = assert.async();

		this.oTable = await createMDCTable({
			type: "Table"
		});
		this.oTable.addDependent(new UploadSetwithTable());
		await this.oTable.initialized();

		this.oUploadSetwithTablePlugin = this.oTable?.getDependents()?.find((oPlugin) => oPlugin.isA("sap.m.plugins.UploadSetwithTable"));

		// act
		this.oTable._oTable.attachEventOnce("rowsUpdated", () => {
			const oBinding = this.oTable._oTable.getBinding("rows");

			// assert
			assert.ok(oBinding, "MDC Table's rows are bound");
			assert.ok(this.oUploadSetwithTablePlugin, "UploadSetwithTable plugin is available as table's dependent.");

			assert.equal(this.oUploadSetwithTablePlugin.getControl(), this.oTable, "The table is set as plugin owner for the UploadSetwithTable plugin");
			assert.ok(this.oUploadSetwithTablePlugin.getEnabled(), "UploadSetwithTable Plugin is enabled");
			assert.ok(this.oUploadSetwithTablePlugin.isActive(), "UploadSetwithTable is active");
			done();
		});
	});

	QUnit.test("Plugin works with Responsive Table", async function (assert) {
		// arrange
		const done = assert.async();

		this.oTable = await createResponsiveTable();
		this.oTable.addDependent(new UploadSetwithTable());

		this.oUploadSetwithTablePlugin = this.oTable?.getDependents()?.find((oPlugin) => oPlugin.isA("sap.m.plugins.UploadSetwithTable"));

		// act
		this.oTable.attachEventOnce("updateFinished", () => {
			const oBinding = this.oTable.getBinding("items");

			// assert
			assert.ok(oBinding, "Table's items are bound");
			assert.ok(this.oUploadSetwithTablePlugin, "UploadSetwithTable plugin is available as table's dependent.");

			assert.equal(this.oUploadSetwithTablePlugin.getControl(), this.oTable, "The table is set as plugin owner for the UploadSetwithTable plugin");
			assert.ok(this.oUploadSetwithTablePlugin.getEnabled(), "UploadSetwithTable Plugin is enabled");
			assert.ok(this.oUploadSetwithTablePlugin.isActive(), "UploadSetwithTable is active");
			done();
		});
	});

	QUnit.test("Plugin works with Grid Table", async function (assert) {
		// arrange
		const done = assert.async();

		this.oTable = await createGridTable();
		this.oTable.addDependent(new UploadSetwithTable());

		this.oUploadSetwithTablePlugin = this.oTable?.getDependents()?.find((oPlugin) => oPlugin.isA("sap.m.plugins.UploadSetwithTable"));

		// act
		this.oTable.attachEventOnce("rowsUpdated", () => {
			const oBinding = this.oTable.getBinding("rows");

			// assert
			assert.ok(oBinding, "Table's items are bound");
			assert.ok(this.oUploadSetwithTablePlugin, "UploadSetwithTable plugin is available as table's dependent.");

			assert.equal(this.oUploadSetwithTablePlugin.getControl(), this.oTable, "The table is set as plugin owner for the UploadSetwithTable plugin");
			assert.ok(this.oUploadSetwithTablePlugin.getEnabled(), "UploadSetwithTable Plugin is enabled");
			assert.ok(this.oUploadSetwithTablePlugin.isActive(), "UploadSetwithTable is active");
			done();
		});
	});

	QUnit.test("plugin to fire onActivated & exit events on need", async function (assert) {
		//arrange
		const oTable = await createMDCTable();
		const oUploadSetwithTablePlugin = new UploadSetwithTable();
		const oActivateSpy = this.spy(oUploadSetwithTablePlugin, "fireOnActivated");
		const oExitSpy = this.spy(oUploadSetwithTablePlugin, "exit");

		//act
		oTable.addDependent(oUploadSetwithTablePlugin);
		await oTable.initialized();

		assert.ok(oUploadSetwithTablePlugin.isActive(), "UploadSetwithTable is active");
		assert.ok(oActivateSpy.calledOnce, "onActivated event is fired");
		oTable.destroy();
		assert.ok(oExitSpy.calledOnce, "Table is destroyed & plugin exit is called");
		oUploadSetwithTablePlugin.destroy();
	});

	QUnit.test("Plugin to render upload button at desired position in the view with correct actions association configured", async function (assert) {

		/**
		 * MDC Table with ActionsPlaceholder
		 */

		// arrange
		const oMdcTable = await createMDCTable({
			actions: [
				new ActionsPlaceholder({ id:"uploadButton", placeholderFor:"UploadButtonPlaceholder"})
			]
		});

		const oUploadSetwithTablePlugin = new UploadSetwithTable({
			actions: ["uploadButton"]
		});

		// act
		oMdcTable.addDependent(oUploadSetwithTablePlugin);

		await oMdcTable.initialized();

		const oTargetAction = oMdcTable.getActions().find((oAction) => oAction?.getAction()?.isA("sap.m.upload.ActionsPlaceholder"));
		const oActionPlaceholderControl = oTargetAction?.getAction();

		// assert
		assert.ok(oActionPlaceholderControl?.getAggregation("_actionButton")?.isA("sap.ui.unified.FileUploader") , "MDC Table has upload button rendered");
		oMdcTable.destroy();

		/**
		 * Responsive Table with ActionsPlaceholder
		 */

		// arrange
		const oResposiveTable = await createResponsiveTable({
			headerToolbar: new OverflowToolbar({
				content: [
					new ActionsPlaceholder({ id:"uploadButton", placeholderFor:"UploadButtonPlaceholder"})
				]
			})
		});

		const oUploadPluginInstance = new UploadSetwithTable({
			actions: ["uploadButton"]
		});

		// act
		oResposiveTable.addDependent(oUploadPluginInstance);

		const oHeaderToolbar = oResposiveTable.getHeaderToolbar();

		const oUploadActionButton = oHeaderToolbar?.getContent()?.find((oAction) => oAction?.isA("sap.m.upload.ActionsPlaceholder"));

		// assert
		assert.ok(oUploadActionButton?.getAggregation("_actionButton")?.isA("sap.ui.unified.FileUploader") , "Responsive Table has upload button rendered");

		oResposiveTable.destroy();

		/**
		 * Grid Table with ActionsPlaceholder
		 */

		// arrange
		const oGridTable = await createGridTable({
			extension: [
				new ActionsPlaceholder({ id:"uploadButton", placeholderFor:"UploadButtonPlaceholder"})
			]
		});

		const ooGridTableUploadInstance = new UploadSetwithTable({
			actions: ["uploadButton"]
		});

		// act
		oGridTable.addDependent(ooGridTableUploadInstance);

		const oToolbar = oGridTable.getExtension();

		const oUploadButton = oToolbar?.find((oAction) => oAction?.isA("sap.m.upload.ActionsPlaceholder"));

		// assert
		assert.ok(oUploadButton?.getAggregation("_actionButton")?.isA("sap.ui.unified.FileUploader") , "Grid Table has upload button rendered");

		oGridTable.destroy();
	});

	QUnit.test("Plugin to render upload from cloud button at desired position in the view with correct actions association configured", async function (assert) {

		/**
		 * MDC Table with ActionsPlaceholder
		 */

		// arrange
		const oMdcTable = await createMDCTable({
			actions: [
				new ActionsPlaceholder({ id:"cloudUploadButton", placeholderFor:"CloudFilePickerButtonPlaceholder"})
			]
		});

		const oUploadSetwithTablePlugin = new UploadSetwithTable({
			cloudFilePickerEnabled: true,
			actions: ["cloudUploadButton"]
		});

		// act
		oMdcTable.addDependent(oUploadSetwithTablePlugin);

		await oMdcTable.initialized();

		const oEventDelegate = {
			"onAfterRendering": () => {
				const oTargetAction = oMdcTable.getActions().find((oAction) => oAction?.getAction()?.isA("sap.m.upload.ActionsPlaceholder"));
				const oActionPlaceholderControl = oTargetAction?.getAction();

				// assert
				assert.ok(oActionPlaceholderControl?.getAggregation("_actionButton")?.isA("sap.m.Button") , "MDC Table has cloud upload button rendered");
				oMdcTable.destroy();
			}
		};

		oMdcTable.addDelegate(oEventDelegate);


		/**
		 * Responsive Table with ActionsPlaceholder
		 */

		// arrange
		const oResposiveTable = await createResponsiveTable({
			headerToolbar: new OverflowToolbar({
				content: [
					new ActionsPlaceholder({ id:"cloudUploadButtonRes", placeholderFor:"CloudFilePickerButtonPlaceholder"})
				]
			})
		});

		const oUploadPluginInstance = new UploadSetwithTable({
			cloudFilePickerEnabled: true,
			actions: ["cloudUploadButtonRes"]
		});

		// act
		oResposiveTable.addDependent(oUploadPluginInstance);

		const oHeaderToolbar = oResposiveTable.getHeaderToolbar();

		const oUploadActionButton = oHeaderToolbar?.getContent()?.find((oAction) => oAction?.isA("sap.m.upload.ActionsPlaceholder"));

		// assert
		assert.ok(oUploadActionButton?.getAggregation("_actionButton")?.isA("sap.m.Button") , "Responsive Table has cloud upload button rendered");

		oResposiveTable.destroy();

		/**
		 * Grid Table with ActionsPlaceholder
		 */

		// arrange
		const oGridTable = await createGridTable({
			extension: [
				new ActionsPlaceholder({ id:"cloudUploadButtonGrid", placeholderFor:"CloudFilePickerButtonPlaceholder"})
			]
		});

		const ooGridTableUploadInstance = new UploadSetwithTable({
			cloudFilePickerEnabled: true,
			actions: ["cloudUploadButtonGrid"]
		});

		// act

		oGridTable.addDependent(ooGridTableUploadInstance);
		const oToolbar = oGridTable.getExtension();

		const oUploadButton = oToolbar?.find((oAction) => oAction?.isA("sap.m.upload.ActionsPlaceholder"));

		// assert
		assert.ok(oUploadButton?.getAggregation("_actionButton")?.isA("sap.m.Button") , "Grid Table has upload button rendered");

		oGridTable.destroy();


	});

	// Test to verify if dragdrop config is removed from the table when uploadEnabled is disabled.
	QUnit.test("Plugin to remove dragdrop config from table when uploadEnabled is disabled", async function (assert) {
		// arrange
		const oTable = await createMDCTable();
		const oUploadSetwithTablePlugin = new UploadSetwithTable({
			uploadEnabled: false
		});

		// act
		oTable.addDependent(oUploadSetwithTablePlugin);
		await oTable.initialized();

		// assert
		assert.ok(!oUploadSetwithTablePlugin.getUploadEnabled(), "UploadSetwithTable Plugin connected to MDC table - uploading is disabled");
		assert.ok(!oTable.getDragDropConfig().length, "DragDropConfig is not added to the table.");

		oTable.destroy();


		// write the same test for responsive table
		const oResponsiveTable = await createResponsiveTable();
		const oResponsiveUploadSetwithTablePlugin = new UploadSetwithTable({
			uploadEnabled: false
		});

		// act
		oResponsiveTable.addDependent(oResponsiveUploadSetwithTablePlugin);

		// assert
		assert.ok(!oResponsiveUploadSetwithTablePlugin.getUploadEnabled(), "UploadSetwithTable Plugin connected to Responsive table - uploading is disabled");
		assert.ok(!oResponsiveTable.getDragDropConfig().length, "DragDropConfig is not added to the table");

		oResponsiveTable.destroy();

		// write the same test for grid table
		const oGridTable = await createGridTable();
		const oGridUploadSetwithTablePlugin = new UploadSetwithTable({
			uploadEnabled: false
		});

		// act
		oGridTable.addDependent(oGridUploadSetwithTablePlugin);

		// assert
		assert.ok(!oGridUploadSetwithTablePlugin.getUploadEnabled(), "UploadSetwithTable Plugin coonected to grid table - uploading is disabled");
		assert.ok(!oGridTable.getDragDropConfig().length, "DragDropConfig is not added to the table");
	});

	// Test to verify if dragdrop config is added to the table when uploadEnabled is enabled.
	QUnit.test("Plugin to add dragdrop config to table when uploadEnabled is enabled", async function (assert) {
		// arrange
		const oTable = await createMDCTable();
		const oUploadSetwithTablePlugin = new UploadSetwithTable({
			uploadEnabled: true
		});

		// act
		oTable.addDependent(oUploadSetwithTablePlugin);
		await oTable.initialized();

		// assert
		const oInnerTable = oTable._oTable;
		assert.ok(oUploadSetwithTablePlugin.getUploadEnabled(), "UploadSetwithTable Plugin connnected to MDC table - upload is enabled");
		assert.ok(!!oInnerTable?.getDragDropConfig()?.length , "DragDropConfig is added to the table");

		oTable.destroy();

		// write the same test for responsive table
		const oResponsiveTable = await createResponsiveTable();
		const oResponsiveUploadSetwithTablePlugin = new UploadSetwithTable({
			uploadEnabled: true
		});

		// act
		oResponsiveTable.addDependent(oResponsiveUploadSetwithTablePlugin);

		// assert
		assert.ok(oResponsiveUploadSetwithTablePlugin.getUploadEnabled(), "UploadSetwithTable Plugin coonected to Responsive table - upload is enabled");
		assert.ok(oResponsiveTable.getDragDropConfig().length, "DragDropConfig is added to the table");

		oResponsiveTable.destroy();

		// same test for grid table
		const oGridTable = await createGridTable();
		const oGridUploadSetwithTablePlugin = new UploadSetwithTable({
			uploadEnabled: true
		});

		// act
		oGridTable.addDependent(oGridUploadSetwithTablePlugin);

		// assert
		assert.ok(oGridUploadSetwithTablePlugin.getUploadEnabled(), "UploadSetwithTable Plugin connected to Grid table - upload is enabled");
		assert.ok(oGridTable.getDragDropConfig().length, "DragDropConfig is added to the table");

		oGridTable.destroy();
	});

	// Test to verify if dragdrop config is removed from the table when uploadEnabled is toiggeled from enabled to disabled.
	QUnit.test("Plugin to remove dragdrop config from table when uploadEnabled is toggled from enabled to disabled", async function (assert) {
		// arrange
		const oTable = await createMDCTable();
		const oUploadSetwithTablePlugin = new UploadSetwithTable({
			uploadEnabled: true
		});
		this.spy(oUploadSetwithTablePlugin, "getConfig");

		// act
		oTable.addDependent(oUploadSetwithTablePlugin);
		await oTable.initialized();

		// assert
		assert.ok(oUploadSetwithTablePlugin.getUploadEnabled(), "UploadSetwithTable Plugin connected to MDC table - uploading is enabled");
		assert.ok(!!oTable?._oTable?.getDragDropConfig().length, "DragDropConfig is added to the table");

		oUploadSetwithTablePlugin.setUploadEnabled(false);

		// assert
		assert.ok(oUploadSetwithTablePlugin.getConfig.calledWithExactly("resetDragDropConfig", oTable, oUploadSetwithTablePlugin), "oTable Plugin resetDragDropConfig settings are set");
		assert.ok(!oUploadSetwithTablePlugin.getUploadEnabled(), "UploadSetwithTable Plugin connected to MDC table - uploading is disabled");
		assert.ok(!oTable.getDragDropConfig().length, "DragDropConfig is removed from the table");
		assert.ok(oUploadSetwithTablePlugin.getConfig.calledWithExactly("setPluginDefaultSettings", oTable, oUploadSetwithTablePlugin), "oTable Plugin setPluginDefaultSettings settings are set");

		oTable.destroy();

		// assert
		assert.ok(oUploadSetwithTablePlugin.getConfig.calledWithExactly("cleanupPluginInstanceSettings", oTable, oUploadSetwithTablePlugin), "oTable Plugin cleanupPluginInstanceSettings settings are set");

		// write the same test for responsive table
		const oResponsiveTable = await createResponsiveTable();
		const oResponsiveUploadSetwithTablePlugin = new UploadSetwithTable({
			uploadEnabled: true
		});
		this.spy(oResponsiveUploadSetwithTablePlugin, "getConfig");

		// act
		oResponsiveTable.addDependent(oResponsiveUploadSetwithTablePlugin);

		// assert
		assert.ok(oResponsiveUploadSetwithTablePlugin.getUploadEnabled(), "UploadSetwithTable Plugin connected to Responsive table - uploading is enabled");
		assert.ok(oResponsiveTable.getDragDropConfig().length, "DragDropConfig is added to the table");

		oResponsiveUploadSetwithTablePlugin.setUploadEnabled(false);

		// assert
		assert.ok(oResponsiveUploadSetwithTablePlugin.getConfig.calledWithExactly("resetDragDropConfig", oResponsiveTable, oResponsiveUploadSetwithTablePlugin), "oResponsiveTable Plugin resetDragDropConfig settings are set");
		assert.ok(!oResponsiveUploadSetwithTablePlugin.getUploadEnabled(), "UploadSetwithTable Plugin connected to Responsive table - uploading is disabled");
		assert.ok(!oResponsiveTable.getDragDropConfig().length, "DragDropConfig is removed from the table");
		assert.ok(oResponsiveUploadSetwithTablePlugin.getConfig.calledWithExactly("setPluginDefaultSettings", oResponsiveTable, oResponsiveUploadSetwithTablePlugin), "oResponsiveTable Plugin setPluginDefaultSettings settings are set");

		oResponsiveTable.destroy();

		// assert
		assert.ok(oResponsiveUploadSetwithTablePlugin.getConfig.calledWithExactly("cleanupPluginInstanceSettings", oResponsiveTable, oResponsiveUploadSetwithTablePlugin), "oResponsiveTable Plugin cleanupPluginInstanceSettings settings are set");

		// write the same test for grid table
		const oGridTable = await createGridTable();
		const oGridUploadSetwithTablePlugin = new UploadSetwithTable({
			uploadEnabled: true
		});
		this.spy(oGridUploadSetwithTablePlugin, "getConfig");

		// act
		oGridTable.addDependent(oGridUploadSetwithTablePlugin);

		// assert
		assert.ok(oGridUploadSetwithTablePlugin.getUploadEnabled(), "UploadSetwithTable Plugin connected to Grid table - uploading is enabled");
		assert.ok(oGridTable.getDragDropConfig().length, "DragDropConfig is added to the table");

		oGridUploadSetwithTablePlugin.setUploadEnabled(false);

		// assert
		assert.ok(oGridUploadSetwithTablePlugin.getConfig.calledWithExactly("resetDragDropConfig", oGridTable, oGridUploadSetwithTablePlugin), "oGridTable Plugin resetDragDropConfig settings are set");
		assert.ok(!oGridUploadSetwithTablePlugin.getUploadEnabled(), "UploadSetwithTable Plugin connected to Grid table - uploading is disabled");
		assert.ok(!oGridTable.getDragDropConfig().length, "DragDropConfig is removed from the table");
		assert.ok(oGridUploadSetwithTablePlugin.getConfig.calledWithExactly("setPluginDefaultSettings", oGridTable, oGridUploadSetwithTablePlugin), "oGridTable Plugin setPluginDefaultSettings settings are set");

		oGridTable.destroy();

		// assert
		assert.ok(oGridUploadSetwithTablePlugin.getConfig.calledWithExactly("cleanupPluginInstanceSettings", oGridTable, oGridUploadSetwithTablePlugin), "oGridTable Plugin cleanupPluginInstanceSettings settings are set");
	});

	QUnit.test("Plugin to fire fileTypeMismatch event when file type is not supported", async function (assert) {

		// arrange
		const oTable = await createMDCTable();
		const oUploadSetwithTablePlugin = new UploadSetwithTable({
			fileTypes: ["jpg", "png"]
		});

		oTable.addDependent(oUploadSetwithTablePlugin);
		await oTable.initialized();

		const oFile = new File([""], "test.txt", { type: "text/plain" });

		const oUploadSpy = this.spy(oUploadSetwithTablePlugin, "fireFileTypeMismatch");

		const oEvent = new EventBase("change", oUploadSetwithTablePlugin, {
			files: [oFile]
		});

		// act
		oUploadSetwithTablePlugin._onFileUploaderChange(oEvent);

		// assert
		assert.ok(oUploadSpy.calledOnce, "fileTypeMismatch event is fired when file type is not supported");

		oTable.destroy();
	});

	QUnit.test("Plugin to fire mediaTypeMismatch event when media type is not supported", async function (assert) {

		// arrange
		const oTable = await createMDCTable();
		const oUploadSetwithTablePlugin = new UploadSetwithTable({
			mediaTypes: ["image/*"]
		});

		oTable.addDependent(oUploadSetwithTablePlugin);
		await oTable.initialized();

		const oFile = new File([""], "test.txt", { type: "text/plain" });

		const oUploadSpy = this.spy(oUploadSetwithTablePlugin, "fireMediaTypeMismatch");

		const oEvent = new EventBase("change", oUploadSetwithTablePlugin, {
			files: [oFile]
		});

		// act
		oUploadSetwithTablePlugin._onFileUploaderChange(oEvent);

		// assert
		assert.ok(oUploadSpy.calledOnce, "mediaTypeMismatch event is fired when media type is not supported");

		oTable.destroy();
	});

	// write test case to check if custom classes added to sap.m.upload.ActionsPlaceholder are passed to the action control.
	QUnit.test("Plugin to pass custom style classes added to the placeholder control to the action control", async function (assert) {

		// arrange

		const oActionPlaceholder = new ActionsPlaceholder({
			id: "uploadButton",
			placeholderFor: "UploadButtonPlaceholder"
		});
		oActionPlaceholder.addStyleClass("customStyleClass");

		const oTable = await createMDCTable({
			actions: [
				oActionPlaceholder
			]
		});

		const oUploadSetwithTablePlugin = new UploadSetwithTable({
			actions: ["uploadButton"]
		});

		oTable.addDependent(oUploadSetwithTablePlugin);
		await oTable.initialized();

		const oTargetAction = oTable.getActions().find((oAction) => oAction?.getAction()?.isA("sap.m.upload.ActionsPlaceholder"));
		const oActionPlaceholderControl = oTargetAction?.getAction();

		// assert
		assert.ok(oActionPlaceholderControl?.hasStyleClass("customStyleClass"), "Custom class customClass1 is added to the action control");

		oTable.destroy();
	});

	QUnit.test("File rename must trigger itemRenamed event and must not trigger model updates", async function (assert) {

		const done = assert.async();

		// arrange
		const oTable = await createMDCTable();

		const oRow = new UploadItemConfiguration({
			fileNamePath: "fileName",
			urlPath: "imageUrl",
			mediaTypePath: "mediaType",
			fileSizePath: "size"
		});

		const oUploadSetwithTablePlugin = new UploadSetwithTable({
			rowConfiguration: oRow
		});

		oTable.addDependent(oUploadSetwithTablePlugin);
		await oTable.initialized();
		await nextUIUpdate();

		//act
		const oComputedItem = new UploadItem({
			fileName: "Invoice summary.doc",
			mediaType: "application/msword",
			fileSize: 200
		});
		this.stub(oUploadSetwithTablePlugin, "getItemForContext").returns(oComputedItem);
		const oDialog = oUploadSetwithTablePlugin._getFileRenameDialog(oComputedItem);

		const oInvalidateSpy = this.spy(oComputedItem, "invalidate");
		const oItemRenamedEventSpy = this.spy(oUploadSetwithTablePlugin, "fireItemRenamed");

		function fnRenamedHandler() {
			assert.ok(oItemRenamedEventSpy.called , "Item renamed event is fired successfully");
			assert.ok(oInvalidateSpy.notCalled, "Item model is not updated");
			done();
		}

		oDialog.attachAfterOpen(() => {

			oUploadSetwithTablePlugin.attachItemRenamed(fnRenamedHandler);

			const oInput = oDialog.getContent()[1];
			const oApplyBtn = oDialog.getBeginButton();

			// assert

			oInput.setValue(`Invoice summary test`);
			oInput.fireLiveChange({
				value: oInput.getValue()
			});

			oApplyBtn.firePress();

			// assert input should not have error state
			assert.ok(oInput.getValueState() === "None", "Input value state is set to none when valid characters are entered");

			oDialog.close();
			// done();
		});
		this.stub(oUploadSetwithTablePlugin, "_getFileRenameDialog").callsFake(function () {
			oDialog.open();
			return oDialog;
		});

		const oContext = oTable?._oTable?.getItems()[0]?.getBindingContext();
		oUploadSetwithTablePlugin.renameItem(oContext);
		oTable.destroy();

	});

	QUnit.test("Test for download API to download the file with current context passed.", async function (assert) {
		/**
		 * MDC Table with ActionsPlaceholder
		 */

		const oUploader = new Uploader();

		// set rowconfiguration aggregation for the plugin to get the binding context of the selected file using sap.m.upload.UploadItemConfiguration.
		const oRow = new UploadItemConfiguration({
			fileNamePath: "fileName",
			urlPath: "url",
			mediaTypePath: "mediaType",
			fileSizePath: "size"
		});

		const oUploadSetwithTablePlugin = new UploadSetwithTable({
			actions: ["uploadButtonSample"],
			rowConfiguration: oRow,
			uploader: oUploader
		});

		const oDownloadBtn = new Button({
			text: "Download",
			enabled: false
		});

		const oMdcTable = await createMDCTable({
			actions: [
				new ActionsPlaceholder({ id: "uploadButtonSample", placeholderFor: "UploadButtonPlaceholder" }),
				oDownloadBtn
			],
			selectionChange: function (oEvent) {
				const oSelectedContexts = oEvent?.getSource()?.getSelectedContexts();
				if (oSelectedContexts && oSelectedContexts.length) {
					oDownloadBtn.setEnabled(true);
				} else {
					oDownloadBtn.setEnabled(false);
				}
			}
		});

		oDownloadBtn.attachPress(function () {
			const oContexts = oMdcTable.getSelectedContexts();
			if (oContexts && oContexts.length) {
				oContexts.forEach((oContext) => oUploadSetwithTablePlugin.download(oContext, true));
			}
		});

		// act
		oMdcTable.addDependent(oUploadSetwithTablePlugin);

		oMdcTable.placeAt("qunit-fixture");
		await oMdcTable.initialized();
		await nextUIUpdate();

		// Check if the upload is enabled
		assert.ok(oUploadSetwithTablePlugin.getUploadEnabled(), "UploadSetwithTable Plugin is enabled for file uploads");

		// act
		oMdcTable._oTable.setSelectedItem(oMdcTable._oTable.getItems()[0], true, true);
		// fire selection change event
		const oDownloadBtnSpy = this.spy(oUploadSetwithTablePlugin, "download");
		this.stub(oUploader, "download").callsFake( function () {
			return true;
		}
		);
		assert.ok(oDownloadBtn.getEnabled(), "Download button is enabled after selecting an item");
		oDownloadBtn.firePress();

		assert.ok(oDownloadBtnSpy.calledOnce, "Download button was pressed");
		assert.ok(oDownloadBtnSpy.calledWith(oMdcTable._oTable.getItems()[0].getBindingContext()), "Download function was called with correct context");
	});

	QUnit.module("Plugin properties & aggregations", {
		beforeEach: function() {
			this.oTable = null;
			this.oUploadSetwithTablePlugin = null;
		},
		afterEach: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
		}
	});

	QUnit.test("Plugin properties defaults", async function (assert) {
		// arrange
		const oTable = await createMDCTable();
		const oUploadPluginInstance = new UploadSetwithTable();

		// act
		oTable.addDependent(oUploadPluginInstance);
		await oTable.initialized();

		//assert
		assert.ok(oUploadPluginInstance.getUploadEnabled(), "UploadSetwithTable Plugin is enabled by default");
		assert.equal(oUploadPluginInstance.getUploadUrl(), "", "UploadSetwithTable Plugin has no upload url initially");
		assert.deepEqual(oUploadPluginInstance.getActions(), [], "UploadSetwithTable Plugin has no actions association initially");
		assert.ok(!oUploadPluginInstance.getUploadButtonInvisible(), "UploadSetwithTable Plugin has upload button visible by default");
		assert.ok(!oUploadPluginInstance.getMultiple(), "UploadSetwithTable Plugin has multiple file upload disabled by default");
		assert.deepEqual(oUploadPluginInstance.getMediaTypes(), undefined, "UploadSetwithTable Plugin has no media types association initially");
		assert.equal(oUploadPluginInstance.getMaxFileSize(), 0, "UploadSetwithTable Plugin has no max file size limit initially");
		assert.equal(oUploadPluginInstance.getMaxFileNameLength(), 0, "UploadSetwithTable Plugin has no max file name length limit initially");
		assert.ok(!oUploadPluginInstance.getDirectory(), "UploadSetwithTable Plugin has directory upload disabled by default");
		assert.ok(!oUploadPluginInstance.getCloudFilePickerEnabled(), "UploadSetwithTable Plugin has cloud file picker disabled by default");
		assert.equal(oUploadPluginInstance.getCloudFilePickerServiceUrl(), "", "UploadSetwithTable Plugin has no cloud file picker service url initially");
		assert.equal(oUploadPluginInstance.getCloudFilePickerButtonText(), "", "UploadSetwithTable Plugin has no cloud file picker button text initially");
		assert.deepEqual(oUploadPluginInstance.getFileTypes(), undefined, "UploadSetwithTable Plugin has no file types association initially");
		assert.equal(oUploadPluginInstance.getHttpRequestMethod().toUpperCase(), "POST", "UploadSetwithTable Plugin has POST http request method by default");
		assert.equal(oUploadPluginInstance.getItemValidationHandler(), null, "UploadSetwithTable Plugin has no item validation handler initially");

		oTable.destroy();

	});

	QUnit.test("Plugin properties validation", async function (assert) {
		/**
		* Set properties check
		*/

		// arrange
		const fnValidationHandler = () => { };

		const oTable = await createMDCTable();
		const mSettings = {
			uploadEnabled: false,
			uploadUrl: "/upload",
			actions: ["uploadButton"],
			uploadButtonInvisible: true,
			multiple: true,
			mediaTypes: ["image/*"],
			maxFileSize: 1,
			maxFileNameLength: 10,
			cloudFilePickerEnabled: true,
			cloudFilePickerServiceUrl: "/cloudFiles/root/",
			cloudFilePickerButtonText: "Select from Cloud",
			fileTypes: ["jpg", "png"],
			httpRequestMethod: "Put",
			itemValidationHandler: fnValidationHandler
		};
		const oUploadSetwithTablePlugin = new UploadSetwithTable(mSettings);


		// act
		oTable.addDependent(oUploadSetwithTablePlugin);
		await oTable.initialized();


		// assert
		assert.step("Setting UploadSetwithTable Plugin properties with valid values");
		assert.ok(!oUploadSetwithTablePlugin.getUploadEnabled(), "UploadSetwithTable Plugin is disabled");
		assert.equal(oUploadSetwithTablePlugin.getUploadUrl(), "/upload", "UploadSetwithTable Plugin has upload url set");
		assert.deepEqual(oUploadSetwithTablePlugin.getActions(), ["uploadButton"], "UploadSetwithTable Plugin has actions association set");
		assert.ok(oUploadSetwithTablePlugin.getUploadButtonInvisible(), "UploadSetwithTable Plugin has upload button invisible");
		assert.ok(oUploadSetwithTablePlugin.getMultiple(), "UploadSetwithTable Plugin has multiple file upload enabled");
		assert.deepEqual(oUploadSetwithTablePlugin.getMediaTypes(), ["image/*"], "UploadSetwithTable Plugin has media types association set");
		assert.equal(oUploadSetwithTablePlugin.getMaxFileSize(), 1, "UploadSetwithTable Plugin has max file size limit set");
		assert.equal(oUploadSetwithTablePlugin.getMaxFileNameLength(), 10, "UploadSetwithTable Plugin has max file name length limit set");
		assert.ok(oUploadSetwithTablePlugin.getCloudFilePickerEnabled(), "UploadSetwithTable Plugin has cloud file picker enabled");
		assert.equal(oUploadSetwithTablePlugin.getCloudFilePickerServiceUrl(), "/cloudFiles/root/", "UploadSetwithTable Plugin has cloud file picker service url set");
		assert.equal(oUploadSetwithTablePlugin.getCloudFilePickerButtonText(), "Select from Cloud", "UploadSetwithTable Plugin has cloud file picker button text set");
		assert.deepEqual(oUploadSetwithTablePlugin.getFileTypes(), ["jpg", "png"], "UploadSetwithTable Plugin has file types association set");
		assert.equal(oUploadSetwithTablePlugin.getHttpRequestMethod().toUpperCase(), "PUT", "UploadSetwithTable Plugin has PUT http request method set");
		assert.equal(oUploadSetwithTablePlugin.getItemValidationHandler(), fnValidationHandler, "UploadSetwithTable Plugin has item validation handler set");
	});

	QUnit.test("Plugin aggregation defaults", async function (assert) {
		// arrange
		const oTable = await createMDCTable();
		const oUploadPluginInstance = new UploadSetwithTable();

		// act
		oTable.addDependent(oUploadPluginInstance);
		await oTable.initialized();

		//assert
		assert.equal(oUploadPluginInstance.getAggregation("headerFields"), undefined, "UploadSetwithTable Plugin has no headerFileds aggregation initially");
		assert.equal(oUploadPluginInstance.getAggregation("rowConfiguration"), undefined, "UploadSetwithTable Plugin has no rowConfiguration aggregation initially");
		assert.equal(oUploadPluginInstance.getAggregation("uploader"), undefined, "UploadSetwithTable Plugin has no uploader aggregation initially");
		assert.equal(oUploadPluginInstance.getAggregation("noDataIllustration"), undefined, "UploadSetwithTable Plugin has no noDataIllustration aggregation initially");

		oTable.destroy();
	});

	QUnit.test("Plugin association defaults", async function (assert) {
		// arrange
		const oTable = await createMDCTable();
		const oUploadPluginInstance = new UploadSetwithTable();

		// act
		oTable.addDependent(oUploadPluginInstance);
		await oTable.initialized();

		//assert
		assert.equal(oUploadPluginInstance.getActions()?.length, 0 , "UploadSetwithTable Plugin has no actions association initially");
		assert.equal(oUploadPluginInstance.getAssociation("previewDialog"), undefined, "UploadSetwithTable Plugin has no previewDialog association initially");

		oTable.destroy();
	});

	QUnit.test("File selection initiates upload & fires necessary events", async function (assert) {
		const done = assert.async();
		/**
		 * MDC Table with ActionsPlaceholder
		 */

		// arrange
		const oMdcTable = await createMDCTable({
			actions: [
				new ActionsPlaceholder({ id:"uploadButton", placeholderFor:"UploadButtonPlaceholder"})
			]
		});

		const oUploadSetwithTablePlugin = new UploadSetwithTable({
			actions: ["uploadButton"]
		});

		// act
		oMdcTable.addDependent(oUploadSetwithTablePlugin);

		oMdcTable.placeAt("qunit-fixture");
		await oMdcTable.initialized();
		await nextUIUpdate();

		const oTargetAction = oMdcTable.getActions().find((oAction) => oAction?.getAction()?.isA("sap.m.upload.ActionsPlaceholder"));
		const oActionPlaceholderControl = oTargetAction?.getAction();
		const oActionButton = oActionPlaceholderControl?.getAggregation("_actionButton");

		// Create a spy for the internal method
		const oSpy = sinon.spy(oUploadSetwithTablePlugin, "_processSelectedFileObjects");
		const oInitiateItemUploadSpy = sinon.spy(oUploadSetwithTablePlugin, "_initateItemUpload");

		// Check if the upload is enabled
		assert.ok(oUploadSetwithTablePlugin.getUploadEnabled(), "UploadSetwithTable Plugin is enabled for file uploads");

		oUploadSetwithTablePlugin.attachEvent("beforeInitiatingItemUpload", function (oEvent) {
			assert.ok(true, "beforeInitiatingItemUpload event should have been called just before initiaing upload.");
		}, oUploadSetwithTablePlugin);

		oUploadSetwithTablePlugin.attachEvent("uploadCompleted", function (oEvent) {
			assert.ok(true, "beforeInitiatingItemUpload event should have been called just before initiaing upload.");
		}, oUploadSetwithTablePlugin);

		// act
		// Simulate a file selection event on the action button
		const oFileList = {
			0: {
				name: "sample.txt",
				type: "text/plain",
				size: 404450
			},
			length: 1
		};
		oActionButton?.fireChange({id:'file-uploads', newValue:'', files:oFileList});

		// assert

		// Check if the internal method was called for processing the selected files
		assert.ok(oSpy.calledWith(oFileList), "Files selected are processed for upload");

		// if files selected are ok to upload then the upload intiated
		assert.ok(oInitiateItemUploadSpy.called, "Files selected are initiated for upload");

		oMdcTable.destroy();
		done();
	});

	QUnit.test("Plugin to set mediaType for vds files", async function (assert) {
		const done = assert.async();
		/**
		 * MDC Table with ActionsPlaceholder
		 */

		// arrange
		const oMdcTable = await createMDCTable({
			actions: [
				new ActionsPlaceholder({ id:"uploadButton", placeholderFor:"UploadButtonPlaceholder"})
			]
		});

		const oUploadSetwithTablePlugin = new UploadSetwithTable({
			actions: ["uploadButton"]
		});

		// act
		oMdcTable.addDependent(oUploadSetwithTablePlugin);

		oMdcTable.placeAt("qunit-fixture");
		await oMdcTable.initialized();
		await nextUIUpdate();

		const oTargetAction = oMdcTable.getActions().find((oAction) => oAction?.getAction()?.isA("sap.m.upload.ActionsPlaceholder"));
		const oActionPlaceholderControl = oTargetAction?.getAction();
		const oActionButton = oActionPlaceholderControl?.getAggregation("_actionButton");

		// Check if the upload is enabled
		assert.ok(oUploadSetwithTablePlugin.getUploadEnabled(), "UploadSetwithTable Plugin is enabled for file uploads");

		// act
		// Simulate a file selection event on the action button
		const oFileList = {
			0: {
				name: "sample.vds",
				type: "",
				size: 404450
			},
			length: 1
		};
		oActionButton?.fireChange({id:'file-uploads', newValue:'', files:oFileList});

		// assert

		// if files selected are ok to upload then the upload intiated
		oUploadSetwithTablePlugin.attachEvent("uploadCompleted", function (oEvent) {
			const oItemForUpload = oEvent.getParameter("item");
			assert.ok(oItemForUpload.getMediaType() === UploadItem.MEDIATYPES.VDS, "Media type is set to vds manually for vds files");
		}, oUploadSetwithTablePlugin);

		oMdcTable.destroy();
		done();
	});

	// create a new module to test plugin and file preview dialog association on mdc table
	QUnit.module("Plugin & File Preview Dialog", {
		beforeEach: function() {
			this.oTable = null;
			this.oUploadSetwithTablePlugin = null;
		},
		afterEach: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
		}
	});

	// Test case to check if the plugin is associated with the file preview dialog
	QUnit.test("Test to associate File preview dialog with Plugin", async function (assert) {
		// arrange
		const oTable = await createMDCTable();
		const oUploadPluginInstance = new UploadSetwithTable();
		const oPreviewDialog = new Dialog();

		// act
		oTable.addDependent(oUploadPluginInstance);
		oUploadPluginInstance.setAssociation("previewDialog", oPreviewDialog);
		await oTable.initialized();

		//assert
		assert.ok(oUploadPluginInstance.getAssociation("previewDialog"), "file preview dialog is associated with the UploadSetwithTable Plugin");

		oTable.destroy();
	});

	// test case to check if associated file preview dialog is opened on file selection
	QUnit.test("File Preview Dialog opens on file selection", async function (assert) {
		const done = assert.async();
		var oUploadSetwithTablePluginCarouselPlugin;
		/**
		 * MDC Table with ActionsPlaceholder
		 */

		// arrange

		const oPreviewDialog = new FilePreviewDialog();

		// set rowconfiguration aggregation for the plugin to get the binding context of the selected file using sap.m.upload.UploadItemConfiguration.
		const oRow = new UploadItemConfiguration({
			fileNamePath: "fileName",
			urlPath: "imageUrl",
			mediaTypePath: "mediaType",
			fileSizePath: "size"
		});

		const oUploadSetwithTablePlugin = new UploadSetwithTable({
			actions: ["uploadButton"],
			previewDialog: oPreviewDialog,
			rowConfiguration: oRow
		});

		this.spy(oUploadSetwithTablePlugin, "getConfig");

		// Simulate a file selection event on the action button
		fnPreviewHandler = function (oEvent) {
			const oSource = oEvent.getSource();
			const oBindingContext = oSource.getBindingContext();
			if (oBindingContext && oUploadSetwithTablePlugin) {
				oUploadSetwithTablePlugin.openFilePreview(oBindingContext);
			}
		};

		setFilePreviewHandler(fnPreviewHandler);

		const oMdcTable = await createMDCTable({
			actions: [
				new ActionsPlaceholder({ id:"uploadButton", placeholderFor:"UploadButtonPlaceholder"})
			]
		});

		// use sap.m.upload.FilePreviewDialog instance

		// act
		oMdcTable.addDependent(oUploadSetwithTablePlugin);

		oMdcTable.placeAt("qunit-fixture");
		await oMdcTable.initialized();
		await nextUIUpdate();

		// assert
		assert.ok(oUploadSetwithTablePlugin.getConfig.calledWithExactly("setPluginDefaultSettings", oMdcTable, oUploadSetwithTablePlugin), "Plugin setPluginDefaultSettings settings are set");

		// Check if the upload is enabled
		assert.ok(oUploadSetwithTablePlugin.getUploadEnabled(), "UploadSetwithTable Plugin is enabled for file uploads");

		// act

		// get Link control from the table and trigger press event
		const oLink = oMdcTable._oTable.getItems()[0]?.getCells()[0]?.getItems()[2]?.getItems()[0];
		if (!oLink) {
			assert.ok(false, "File preview link not found in the table");
		}
		oLink.firePress();

		// assert
		assert.ok(oUploadSetwithTablePlugin.getConfig.calledWithExactly("openFilePreview", oLink.getBindingContext(), oMdcTable, oUploadSetwithTablePlugin), "Plugin setPluginDefaultSettings settings are set");

		let oDialog;

		const afterDialogOpen = function (oEvent) {
			oDialog = oEvent.getSource();
			assert.ok(oDialog?.isOpen(), "File preview dialog is opened with the selected file");
			oDialog?.getButtons()[1].firePress();
			assert.ok(oUploadSetwithTablePluginCarouselPlugin.calledOnce, "DestroyPages is called");
			oUploadSetwithTablePluginCarouselPlugin.restore();
			oMdcTable.destroy();
			done();
		};

		oPreviewDialog.attachEventOnce("beforePreviewDialogOpen", (oEvent) => {
			oDialog = oEvent.getParameter("oDialog");
			oUploadSetwithTablePluginCarouselPlugin = this.spy(oUploadSetwithTablePlugin._filePreviewDialogControl._oCarousel, "destroyPages");
			oDialog.attachEventOnce("afterOpen", afterDialogOpen);
		});
	});

	// test case to check if associated file preview dialog is opened on file selection
	QUnit.test("File Preview Dialog opens on file selection", async function (assert) {
		const done = assert.async();
		var oUploadSetwithTablePluginCarouselPlugin;
		/**
		 * MDC Table with ActionsPlaceholder
		 */

		// arrange

		const oPreviewDialog = new FilePreviewDialog();

		// set rowconfiguration aggregation for the plugin to get the binding context of the selected file using sap.m.upload.UploadItemConfiguration.
		const oRow = new UploadItemConfiguration({
			fileNamePath: "fileName",
			urlPath: "imageUrl",
			mediaTypePath: "mediaType",
			fileSizePath: "fileSize"
		});

		const oUploadSetwithTablePlugin = new UploadSetwithTable({
			actions: ["uploadButton"],
			previewDialog: oPreviewDialog,
			rowConfiguration: oRow
		});

		// Simulate a file selection event on the action button
		fnPreviewHandler = function (oEvent) {
			const oSource = oEvent.getSource();
			const oBindingContext = oSource.getBindingContext();
			if (oBindingContext && oUploadSetwithTablePlugin) {
				oUploadSetwithTablePlugin.openFilePreview(oBindingContext);
			}
		};

		setFilePreviewHandler(fnPreviewHandler);

		const oMdcTable = await createMDCTable({
			actions: [
				new ActionsPlaceholder({ id:"uploadButton", placeholderFor:"UploadButtonPlaceholder"})
			]
		});

		// use sap.m.upload.FilePreviewDialog instance

		// act
		oMdcTable.addDependent(oUploadSetwithTablePlugin);

		oMdcTable.placeAt("qunit-fixture");
		await oMdcTable.initialized();
		await nextUIUpdate();

		// Check if the upload is enabled
		assert.ok(oUploadSetwithTablePlugin.getUploadEnabled(), "UploadSetwithTable Plugin is enabled for file uploads");

		// act

		// get Link control from the table and trigger press event
		const oLink = oMdcTable._oTable.getItems()[4]?.getCells()[0]?.getItems()[2]?.getItems()[0];
		if (!oLink) {
			assert.ok(false, "File preview link not found in the table");
		}
		oLink.firePress();

		let oDialog;

		const afterDialogOpen = function (oEvent) {
			oDialog = oEvent.getSource();
			assert.ok(oDialog?.isOpen(), "File preview dialog is opened with the selected file");
			assert.ok(oDialog.getContent()[0].getPages()[4].getAggregation("items")[0].hasStyleClass("image-scale"),"image has style to Fit within the viewport without cropping");
			oDialog?.getButtons()[1].firePress();
			assert.ok(oUploadSetwithTablePluginCarouselPlugin.calledOnce, "DestroyPages is called");
			oUploadSetwithTablePluginCarouselPlugin.restore();
			oMdcTable.destroy();
			done();
		};

		oPreviewDialog.attachEventOnce("beforePreviewDialogOpen", (oEvent) => {
			oDialog = oEvent.getParameter("oDialog");
			oUploadSetwithTablePluginCarouselPlugin = this.spy(oUploadSetwithTablePlugin._filePreviewDialogControl._oCarousel, "destroyPages");
			oDialog.attachEventOnce("afterOpen", afterDialogOpen);
		});
	});

	QUnit.test("File Preview Dialog moves to previous file on previous button press on carousel", async function (assert) {
		const done = assert.async();
		var oUploadSetwithTablePluginCarouselPlugin;
		/**
		 * MDC Table with ActionsPlaceholder
		 */

		// arrange

		const oPreviewDialog = new FilePreviewDialog();

		// set rowconfiguration aggregation for the plugin to get the binding context of the selected file using sap.m.upload.UploadItemConfiguration.
		const oRow = new UploadItemConfiguration({
			fileNamePath: "fileName",
			urlPath: "imageUrl",
			mediaTypePath: "mediaType",
			fileSizePath: "size"
		});

		const oUploadSetwithTablePlugin = new UploadSetwithTable({
			actions: ["uploadButton"],
			previewDialog: oPreviewDialog,
			rowConfiguration: oRow
		});

		// Simulate a file selection event on the action button
		fnPreviewHandler = function (oEvent) {
			const oSource = oEvent.getSource();
			const oBindingContext = oSource.getBindingContext();
			if (oBindingContext && oUploadSetwithTablePlugin) {
				oUploadSetwithTablePlugin.openFilePreview(oBindingContext);
			}
		};

		setFilePreviewHandler(fnPreviewHandler);

		const oMdcTable = await createMDCTable({
			actions: [
				new ActionsPlaceholder({ id:"uploadButton", placeholderFor:"UploadButtonPlaceholder"})
			]
		});

		// use sap.m.upload.FilePreviewDialog instance

		// act
		oMdcTable.addDependent(oUploadSetwithTablePlugin);

		oMdcTable.placeAt("qunit-fixture");
		await oMdcTable.initialized();
		await nextUIUpdate();

		// Check if the upload is enabled
		assert.ok(oUploadSetwithTablePlugin.getUploadEnabled(), "UploadSetwithTable Plugin is enabled for file uploads");

		// act

		// get Link control from the table and trigger press event
		const oLink = oMdcTable._oTable.getItems()[1]?.getCells()[0]?.getItems()[2]?.getItems()[0];
		if (!oLink) {
			assert.ok(false, "File preview link not found in the table");
		}
		oLink.firePress();

		let oDialog;

		const afterDialogOpen = function (oEvent) {
			oDialog = oEvent.getSource();
			assert.ok(oDialog?.isOpen(), "File preview dialog is opened with the selected file");
			oDialog?.getButtons()[1].firePress();

			const oCarousel = oUploadSetwithTablePlugin._filePreviewDialogControl._oCarousel;
			oCarousel.previous();
			const oDialogHeader = oDialog?.getCustomHeader()?.getContentLeft()[0];
			const sFileName = oDialogHeader?.getText();
			assert.ok(sFileName, "File preview dialog carousel moves to previous file");
			oDialog.close();

			assert.ok(oUploadSetwithTablePluginCarouselPlugin.calledOnce, "DestroyPages is called");
			oUploadSetwithTablePluginCarouselPlugin.restore();

			oMdcTable.destroy();
			done();
		};

		oPreviewDialog.attachEventOnce("beforePreviewDialogOpen", (oEvent) => {
			oDialog = oEvent.getParameter("oDialog");
			oUploadSetwithTablePluginCarouselPlugin = this.spy(oUploadSetwithTablePlugin._filePreviewDialogControl._oCarousel, "destroyPages");
			oDialog.attachEventOnce("afterOpen", afterDialogOpen);
		});

	});

	QUnit.test("File Preview Dialog moves to next file on next button press on carousel", async function (assert) {
		const done = assert.async();
		var oUploadSetwithTablePluginCarouselPlugin;
		/**
		 * MDC Table with ActionsPlaceholder
		 */

		// arrange

		const oPreviewDialog = new FilePreviewDialog();

		// set rowconfiguration aggregation for the plugin to get the binding context of the selected file using sap.m.upload.UploadItemConfiguration.
		const oRow = new UploadItemConfiguration({
			fileNamePath: "fileName",
			urlPath: "imageUrl",
			mediaTypePath: "mediaType",
			fileSizePath: "size"
		});

		const oUploadSetwithTablePlugin = new UploadSetwithTable({
			actions: ["uploadButton"],
			previewDialog: oPreviewDialog,
			rowConfiguration: oRow
		});

		// Simulate a file selection event on the action button
		fnPreviewHandler = function (oEvent) {
			const oSource = oEvent.getSource();
			const oBindingContext = oSource.getBindingContext();
			if (oBindingContext && oUploadSetwithTablePlugin) {
				oUploadSetwithTablePlugin.openFilePreview(oBindingContext);
			}
		};

		setFilePreviewHandler(fnPreviewHandler);

		const oMdcTable = await createMDCTable({
			actions: [
				new ActionsPlaceholder({ id: "uploadButton", placeholderFor: "UploadButtonPlaceholder" })
			]
		});

		// use sap.m.upload.FilePreviewDialog instance

		// act
		oMdcTable.addDependent(oUploadSetwithTablePlugin);

		oMdcTable.placeAt("qunit-fixture");
		await oMdcTable.initialized();
		await nextUIUpdate();

		// Check if the upload is enabled
		assert.ok(oUploadSetwithTablePlugin.getUploadEnabled(), "UploadSetwithTable Plugin is enabled for file uploads");

		// act

		// get Link control from the table and trigger press event
		const oLink = oMdcTable._oTable.getItems()[1]?.getCells()[0]?.getItems()[2]?.getItems()[0];
		if (!oLink) {
			assert.ok(false, "File preview link not found in the table");
		}
		oLink.firePress();

		let oDialog;

		const afterDialogOpen = function (oEvent) {
			oDialog = oEvent.getSource();
			assert.ok(oDialog?.isOpen(), "File preview dialog is opened with the selected file");
			oDialog?.getButtons()[1].firePress();

			const oCarousel = oUploadSetwithTablePlugin._filePreviewDialogControl._oCarousel;
			oCarousel.previous();
			const oDialogHeader = oDialog?.getCustomHeader()?.getContentLeft()[0];
			const sFileName = oDialogHeader?.getText();
			assert.ok(sFileName, "File preview dialog carousel moves to next file");
			oDialog.close();

			assert.ok(oUploadSetwithTablePluginCarouselPlugin.calledOnce, "DestroyPages is called");
			oUploadSetwithTablePluginCarouselPlugin.restore();

			oMdcTable.destroy();
			done();
		};

		oPreviewDialog.attachEventOnce("beforePreviewDialogOpen", (oEvent) => {
			oDialog = oEvent.getParameter("oDialog");
			oUploadSetwithTablePluginCarouselPlugin = this.spy(oUploadSetwithTablePlugin._filePreviewDialogControl._oCarousel, "destroyPages");
			oDialog.attachEventOnce("afterOpen", afterDialogOpen);
		});
    });

	// Write Qunit to test property CustomPageContentHandler of FilePreviewDialog control
	QUnit.test("File Preview Dialog to test custom page content handler", async function (assert) {
		const done = assert.async();
		var oUploadSetwithTablePluginCarouselPlugin;
		/**
		 * MDC Table with ActionsPlaceholder
		 */

		// arrange

		// create a custom page content which uses codeeditor control with sample xml content
		const customPageContent = new CodeEditor({
			type: "xml",
			value: "<?xml version='1.0' encoding='iso-8859-1'?>\n<mail>\n<from>user1</from>\n<to>user2</to>\n</mail>", // sample xml content
			editable: false,
			lineNumbers: true,
			height: "100%"
		});
		const oPreviewDialog = new sap.m.upload.FilePreviewDialog({
			customPageContentHandler: function (oItem) {
				return new Promise(function (resolve, reject) {
					if (oItem.getMediaType() === "application/xml") {
						resolve(customPageContent);
					} else {
						reject();
					}
				});
			}
		});

		const oCustomContentSpy = this.spy(oPreviewDialog, "getCustomPageContentHandler");

		// set rowconfiguration aggregation for the plugin to get the binding context of the selected file using sap.m.upload.UploadItemConfiguration.
		const oRow = new sap.m.upload.UploadItemConfiguration({
			fileNamePath: "fileName",
			urlPath: "imageUrl",
			mediaTypePath: "mediaType",
			fileSizePath: "size"
		});

		const oUploadSetwithTablePlugin = new UploadSetwithTable({
			actions: ["uploadButton"],
			previewDialog: oPreviewDialog,
			rowConfiguration: oRow
		});

		// Simulate a file selection event on the action button
		fnPreviewHandler = function (oEvent) {
			const oSource = oEvent.getSource();
			const oBindingContext = oSource.getBindingContext();
			if (oBindingContext && oUploadSetwithTablePlugin) {
				oUploadSetwithTablePlugin.openFilePreview(oBindingContext);
			}
		};

		setFilePreviewHandler(fnPreviewHandler);

		const oMdcTable = await createMDCTable({
			actions: [
				new ActionsPlaceholder({ id:"uploadButton", placeholderFor:"UploadButtonPlaceholder"})
			]
		});

		// use sap.m.upload.FilePreviewDialog instance

		// act
		oMdcTable.addDependent(oUploadSetwithTablePlugin);

		oMdcTable.placeAt("qunit-fixture");
		await oMdcTable.initialized();
		await nextUIUpdate();

		// Check if the upload is enabled
		assert.ok(oUploadSetwithTablePlugin.getUploadEnabled(), "UploadSetwithTable Plugin is enabled for file uploads");

		// act

		// get Link control from the table and trigger press event
		const lastItemIndex = oMdcTable._oTable.getItems().length - 1;
		const oLink = oMdcTable._oTable.getItems()[lastItemIndex].getCells()[0]?.getItems()[2]?.getItems()[0];
		if (!oLink) {
			assert.ok(false, "File preview link not found in the table");
		}
		oLink.firePress();

		assert.ok(true, `${oLink.getText()} link is pressed for preview.`);

		let oDialog;

		const afterDialogOpen = function (oEvent) {
			oDialog = oEvent.getSource();
			assert.ok(oDialog?.isOpen(), "File preview dialog is opened with the selected file and custom content with xml code editor is inserted");
			oDialog?.getButtons()[1].firePress();
			assert.ok(oUploadSetwithTablePluginCarouselPlugin.calledOnce, "DestroyPages is called");
			oUploadSetwithTablePluginCarouselPlugin.restore();
			oMdcTable.destroy();
			done();
		};

		oPreviewDialog.attachEventOnce("beforePreviewDialogOpen", (oEvent) => {
			oDialog = oEvent.getParameter("oDialog");
			assert.ok(oCustomContentSpy.called, "Custom page content handler is called");
			oUploadSetwithTablePluginCarouselPlugin = this.spy(oUploadSetwithTablePlugin._filePreviewDialogControl._oCarousel, "destroyPages");
			oDialog.attachEventOnce("afterOpen", afterDialogOpen);
		});
	});

	QUnit.test("File Preview Dialog - custompageConentHandler to display default illustration message on promise rejection", async function (assert) {
		const done = assert.async();
		var oUploadSetwithTablePluginCarouselPlugin;
		/**
		 * MDC Table with ActionsPlaceholder
		 */

		// arrange

		// create a custom page content which uses codeeditor control with sample xml content
		const customPageContent = new CodeEditor({
			type: "xml",
			value: "<?xml version='1.0' encoding='iso-8859-1'?>\n<mail>\n<from>user1</from>\n<to>user2</to>\n</mail>", // sample xml content
			editable: false,
			lineNumbers: true,
			height: "100%"
		});
		const oPreviewDialog = new sap.m.upload.FilePreviewDialog({
			customPageContentHandler: function (oItem) {
				return new Promise(function (resolve, reject) {
					if (oItem.getMediaType() === "application/xml") {
						resolve(customPageContent);
					} else {
						reject();
					}
				});
			}
		});

		const oCustomContentSpy = this.spy(oPreviewDialog, "getCustomPageContentHandler");

		// set rowconfiguration aggregation for the plugin to get the binding context of the selected file using sap.m.upload.UploadItemConfiguration.
		const oRow = new sap.m.upload.UploadItemConfiguration({
			fileNamePath: "fileName",
			urlPath: "imageUrl",
			mediaTypePath: "mediaType",
			fileSizePath: "size"
		});

		const oUploadSetwithTablePlugin = new UploadSetwithTable({
			actions: ["uploadButton"],
			previewDialog: oPreviewDialog,
			rowConfiguration: oRow
		});

		// Simulate a file selection event on the action button
		fnPreviewHandler = function (oEvent) {
			const oSource = oEvent.getSource();
			const oBindingContext = oSource.getBindingContext();
			if (oBindingContext && oUploadSetwithTablePlugin) {
				oUploadSetwithTablePlugin.openFilePreview(oBindingContext);
			}
		};

		setFilePreviewHandler(fnPreviewHandler);

		const oMdcTable = await createMDCTable({
			actions: [
				new ActionsPlaceholder({ id:"uploadButton", placeholderFor:"UploadButtonPlaceholder"})
			]
		});

		// use sap.m.upload.FilePreviewDialog instance

		// act
		oMdcTable.addDependent(oUploadSetwithTablePlugin);

		oMdcTable.placeAt("qunit-fixture");
		await oMdcTable.initialized();
		await nextUIUpdate();

		// Check if the upload is enabled
		assert.ok(oUploadSetwithTablePlugin.getUploadEnabled(), "UploadSetwithTable Plugin is enabled for file uploads");

		// act

		// get Link control from the table and trigger press event
		const oLink = oMdcTable._oTable.getItems()[0].getCells()[0]?.getItems()[2]?.getItems()[0];
		if (!oLink) {
			assert.ok(false, "File preview link not found in the table");
		}
		oLink.firePress();

		assert.ok(true, `${oLink.getText()} link is pressed for preview.`);

		let oDialog;

		const afterDialogOpen = function (oEvent) {
			oDialog = oEvent.getSource();
			assert.ok(oDialog?.isOpen(), "File preview dialog is opened with the selected file and custom content handler callback rejects the promise to display default illustration message");
			oDialog?.getButtons()[1].firePress();
			assert.ok(oUploadSetwithTablePluginCarouselPlugin.calledOnce, "DestroyPages is called");
			oUploadSetwithTablePluginCarouselPlugin.restore();
			oMdcTable.destroy();
			done();
		};

		oPreviewDialog.attachEventOnce("beforePreviewDialogOpen", (oEvent) => {
			oDialog = oEvent.getParameter("oDialog");
			assert.ok(oCustomContentSpy.called, "Custom page content handler is called");
			oUploadSetwithTablePluginCarouselPlugin = this.spy(oUploadSetwithTablePlugin._filePreviewDialogControl._oCarousel, "destroyPages");
			oDialog.attachEventOnce("afterOpen", afterDialogOpen);
		});
	});

    QUnit.module("Plugin Public API Tests");

	QUnit.test("Validating icons", async function (assert) {
		const done = assert.async();
		this.oTable = await createMDCTable({
			type: "ResponsiveTable"
		});
		this.oTable.addDependent(new UploadSetwithTable());
		await this.oTable.initialized();

		this.oUploadSetwithTablePlugin = this.oTable?.getDependents()?.find((oPlugin) => oPlugin.isA("sap.m.plugins.UploadSetwithTable"));

		const mockReturnValue = "sap-icon://pdf-attachment";
		const mediaType = "application/pdf";
		const fileName = "example.pdf";
		const result = UploadSetwithTable.getIconForFileType(mediaType, fileName);
		// act
		this.oTable._oTable.attachEventOnce("updateFinished", () => {
			assert.strictEqual(result, mockReturnValue, "getIconForFileType returns the expected icon");
			done();
		});
	});

	QUnit.test("Should not allow files exceeding the max file size limit", function (assert) {
        const iMaxFileSize = 2 * 1024 * 1024;
        const oUploadSetTable = new UploadSetwithTable({
            maxFileSize: iMaxFileSize
        });
        const oLargeFile = { name: "large-file.txt", size: iMaxFileSize + 1 };
        const bIsValid = oUploadSetTable.validateFileSize
            ? oUploadSetTable.validateFileSize(oLargeFile)
            : oLargeFile.size <= iMaxFileSize;
        assert.notOk(bIsValid, "File exceeding max file size should not be allowed.");
        oUploadSetTable.destroy();
	});

	QUnit.test("Should only allow specific file types", function (assert) {
        const aAllowedFileTypes = ["pdf", "jpg", "png"];
        const oUploadSetTable = new UploadSetwithTable({
            fileTypes: aAllowedFileTypes
        });
        const oValidFile = { name: "image.jpg", type: "image/jpeg" };
        const oInvalidFile = { name: "document.exe", type: "application/x-msdownload" };

        const bIsValidFile = oUploadSetTable.validateFileType
            ? oUploadSetTable.validateFileType(oValidFile)
            : aAllowedFileTypes.includes(oValidFile.name.split(".").pop().toLowerCase());

        const bIsInvalidFile = oUploadSetTable.validateFileType
            ? oUploadSetTable.validateFileType(oInvalidFile)
            : aAllowedFileTypes.includes(oInvalidFile.name.split(".").pop().toLowerCase());
        assert.ok(bIsValidFile, "Valid file type should be allowed.");
        assert.notOk(bIsInvalidFile, "Invalid file type should not be allowed.");

        oUploadSetTable.destroy();
	});

	QUnit.test("Should only allow files with specific media types", function (assert) {
        const aAllowedMediaTypes = ["image/png", "image/jpeg", "application/pdf"];
        const oUploadSetTable = new UploadSetwithTable({
            mediaTypes: aAllowedMediaTypes
        });

        const oValidFile = { name: "image.png", type: "image/png" };
        const oInvalidFile = { name: "script.js", type: "application/javascript" };

        const bIsValidFile = oUploadSetTable.validateMediaType
            ? oUploadSetTable.validateMediaType(oValidFile)
            : aAllowedMediaTypes.includes(oValidFile.type);

        const bIsInvalidFile = oUploadSetTable.validateMediaType
            ? oUploadSetTable.validateMediaType(oInvalidFile)
            : aAllowedMediaTypes.includes(oInvalidFile.type);

        assert.ok(bIsValidFile, "Valid media type should be allowed.");
        assert.notOk(bIsInvalidFile, "Invalid media type should not be allowed.");

        oUploadSetTable.destroy();
    });

	QUnit.test("Should not allow file names exceeding the max length", function (assert) {
        const iMaxFileNameLength = 20;
        const oUploadSetTable = new UploadSetwithTable({
            maxFileNameLength: iMaxFileNameLength
        });

        const oValidFile = { name: "short-name.pdf" };
        const oInvalidFile = { name: "this-is-a-very-long-file-name.pdf" };

        const bIsValidFile = oUploadSetTable.validateFileNameLength
            ? oUploadSetTable.validateFileNameLength(oValidFile)
            : oValidFile.name.length <= iMaxFileNameLength;

        const bIsInvalidFile = oUploadSetTable.validateFileNameLength
            ? oUploadSetTable.validateFileNameLength(oInvalidFile)
            : oInvalidFile.name.length <= iMaxFileNameLength;

        assert.ok(bIsValidFile, "Valid file name length should be allowed.");
        assert.notOk(bIsInvalidFile, "File name exceeding max length should not be allowed.");

        oUploadSetTable.destroy();
    });

	QUnit.test("getFileSizeWithUnits Test", function (assert) {
		const resultKB = UploadSetwithTable.getFileSizeWithUnits(512); // Below 1KB
		const resultKB2 = UploadSetwithTable.getFileSizeWithUnits(2048); // 2KB
		const resultMB = UploadSetwithTable.getFileSizeWithUnits(1048576); // 1MB
		const resultGB = UploadSetwithTable.getFileSizeWithUnits(1073741824); // 1GB
		const resultInvalid = UploadSetwithTable.getFileSizeWithUnits("invalid"); // Invalid input
		assert.strictEqual(resultKB, "0.50 KB", "512 bytes correctly converted to KB");
		assert.strictEqual(resultKB2, "2.00 KB", "2048 bytes correctly converted to KB");
		assert.strictEqual(resultMB, "1.00 MB", "1MB correctly converted");
		assert.strictEqual(resultGB, "1.00 GB", "1GB correctly converted");
		assert.strictEqual(resultInvalid, "invalid", "Non-numeric input should return the input itself");
	});

	QUnit.test("Upload item via URL", async function (assert) {
		const done = assert.async();

		this.oTable = await createMDCTable({
			type: "ResponsiveTable"
		});
		this.oTable.addDependent(new UploadSetwithTable());
		await this.oTable.initialized();
		this.oUploadSetwithTablePlugin = this.oTable?.getDependents()?.find((oPlugin) =>
			oPlugin.isA("sap.m.plugins.UploadSetwithTable")
		);
		const sName = "testFile.txt";
		const sUrl = "https://example.com/file.txt";
		const oMockPromise = new Promise((resolve) => {
			setTimeout(resolve, 100);
		});
		const oItem = this.oUploadSetwithTablePlugin.uploadItemViaUrl(sName, sUrl, oMockPromise);
		assert.ok(oItem, "Upload item is created");
		assert.strictEqual(oItem.getFileName(), sName, "File name is set correctly");
		assert.strictEqual(oItem.getUrl(), sUrl, "URL is set correctly");
		assert.strictEqual(oItem.getUploadState(), mLibrary.UploadState.Ready, "Upload state is Ready");
		oMockPromise.then(() => {
			this.oTable._oTable.attachEventOnce("updateFinished", () => {
				assert.ok(true, "Upload process was initiated");
			});
		});
		done();
	});

	QUnit.test("Upload item without file", async function (assert) {
		const done = assert.async();

		this.oTable = await createMDCTable({
			type: "ResponsiveTable"
		});
		this.oTable.addDependent(new UploadSetwithTable());
		await this.oTable.initialized();
		this.oUploadSetwithTablePlugin = this.oTable?.getDependents()?.find((oPlugin) =>
			oPlugin.isA("sap.m.plugins.UploadSetwithTable")
		);
		const oMockPromise = new Promise((resolve) => {
			setTimeout(resolve, 100);
		});
		const oItem = this.oUploadSetwithTablePlugin.uploadItemWithoutFile(oMockPromise);
		assert.ok(oItem, "Upload item is created");
		assert.strictEqual(oItem.getFileName(), "-", "File name is set correctly");
		assert.strictEqual(oItem.getUploadState(), mLibrary.UploadState.Ready, "Upload state is Ready");
		oMockPromise.then(() => {
			this.oTable._oTable.attachEventOnce("updateFinished", () => {
				assert.ok(true, "Upload process was initiated");
			});
		});
		done();
	});

	QUnit.test("Test for renaming the files", async function (assert) {
		const done = assert.async();
		this.oTable = await createMDCTable({
			type: "ResponsiveTable"
		});
		this.oTable.addDependent(new UploadSetwithTable());
		await this.oTable.initialized();
		this.oUploadSetwithTablePlugin = this.oTable?.getDependents()?.find((oPlugin) =>
			oPlugin.isA("sap.m.plugins.UploadSetwithTable")
		);
		const sName = "testFile.txt";
		const sNewName = "renamedFile.txt";
		const sUrl = "https://example.com/file.txt";
		const oMockPromise = new Promise((resolve) => {
			setTimeout(resolve, 100);
		});
		const oItem = this.oUploadSetwithTablePlugin.uploadItemViaUrl(sName, sUrl, oMockPromise);
		assert.strictEqual(oItem.getUploadState(), mLibrary.UploadState.Ready, "Upload state is Ready");
		this.oTable._oTable.attachEventOnce("updateFinished", () => {
			oItem.setFileName(sNewName);
			assert.strictEqual(oItem.getFileName(), sNewName, "File name was successfully updated");
			done();
		});
	});

	QUnit.test("getItemsMap resolves with items from contexts", function (assert) {
	    const done = assert.async();
	    const oUploadPlugin = new UploadSetwithTable();
	    oUploadPlugin.getItemForContext = function (oItemContext) {
	        return Promise.resolve({ id: oItemContext.id, name: oItemContext.name });
	    };
	    const aItemContexts = [
	        { id: "1", name: "File1" },
	        { id: "2", name: "File2" }
	    ];
	    oUploadPlugin.getItemsMap(aItemContexts).then(function (aItems) {
	        assert.equal(aItems.length, 2, "Correct number of items returned.");
	        assert.equal(aItems[0].name, "File1", "First item name is correct.");
	        assert.equal(aItems[1].name, "File2", "Second item name is correct.");
	        done();
	    });
	});

	QUnit.module("Plugin Download Tests", {
		beforeEach: function () {
			this.sandbox = sinon.createSandbox();
			this.uploadSetInstance = new UploadSetwithTable();
			this.sandbox.stub(Log, "error");
			this.sandbox.stub(this.uploadSetInstance, "getConfig");
		},
		afterEach: function () {
			this.sandbox.restore();
		}
	});

	QUnit.test("download should log an error when getRowConfiguration returns null", function (assert) {
		this.uploadSetInstance.getRowConfiguration = () => null;
		this.uploadSetInstance.download({}, true);
		assert.strictEqual(this.uploadSetInstance.getRowConfiguration(), null, "getRowConfiguration() should return null");
		assert.ok(Log.error.calledOnce, "Log.error was called once");
		assert.ok(
			Log.error.calledWith("Row configuration is not set for the plugin. Download is not possible."),
			"Correct error message logged"
		);
		assert.ok(this.uploadSetInstance.getConfig.notCalled, "getConfig was not called when row configuration is null");
	});

	QUnit.test("download should call getConfig with correct parameters when getRowConfiguration is defined", function (assert) {
		this.uploadSetInstance.getRowConfiguration = () => ({});
		const oBindingContext = { dummy: "data" };
		const bAskForLocation = true;
		this.uploadSetInstance.download(oBindingContext, bAskForLocation);
		assert.ok(this.uploadSetInstance.getConfig.calledOnce, "getConfig was called once");
		assert.ok(
			this.uploadSetInstance.getConfig.calledWithExactly("download", {
				oBindingContext: oBindingContext,
				bAskForLocation: bAskForLocation
			}, null, this.uploadSetInstance),
			"getConfig was called with correct arguments"
		);
	});

    QUnit.module("Plugin Drag and Drop Tests", {
        beforeEach: function () {
            this.sandbox = sinon.createSandbox();
            this.uploadSetInstance = new UploadSetwithTable();
            this.uploadSetInstance.handleDrop = this.uploadSetInstance.handleDrop || function () {};
            this.uploadSetInstance.handleDragOver = this.uploadSetInstance.handleDragOver || function () {};
            this.uploadSetInstance.handleDragEnter = this.uploadSetInstance.handleDragEnter || function () {};
            this.uploadSetInstance.handleDragLeave = this.uploadSetInstance.handleDragLeave || function () {};
            this.sandbox.stub(this.uploadSetInstance, "handleDrop");
            this.sandbox.stub(this.uploadSetInstance, "handleDragOver");
            this.sandbox.stub(this.uploadSetInstance, "handleDragEnter");
            this.sandbox.stub(this.uploadSetInstance, "handleDragLeave");
        },
        afterEach: function () {
            this.sandbox.restore();
        }
    });

    QUnit.test("Drag over event should trigger handleDragOver", function (assert) {
        const oEvent = new Event("dragover", {});
        this.uploadSetInstance.handleDragOver(oEvent);
        assert.ok(this.uploadSetInstance.handleDragOver.calledOnce, "handleDragOver was called once");
    });

    QUnit.test("Drag enter event should trigger handleDragEnter", function (assert) {
        const oEvent = new Event("dragenter", {});
        this.uploadSetInstance.handleDragEnter(oEvent);
        assert.ok(this.uploadSetInstance.handleDragEnter.calledOnce, "handleDragEnter was called once");
    });

    QUnit.test("Drag leave event should trigger handleDragLeave", function (assert) {
        const oEvent = new Event("dragleave", {});
        this.uploadSetInstance.handleDragLeave(oEvent);
        assert.ok(this.uploadSetInstance.handleDragLeave.calledOnce, "handleDragLeave was called once");
    });

    QUnit.test("Drop event should trigger handleDrop", function (assert) {
        const oEvent = new Event("drop", {
            originalEvent: {
                dataTransfer: {
                    files: [{ name: "test-file.txt", size: 1024 }]
                }
            }
        });
        this.uploadSetInstance.handleDrop(oEvent);
        assert.ok(this.uploadSetInstance.handleDrop.calledOnce, "handleDrop was called once");
	});

    QUnit.module("Plugin Row Item Configuration", {
        beforeEach: function () {
            this.sandbox = sinon.createSandbox();
            this.uploadSetInstance = new UploadSetwithTable();
            this.uploadSetInstance.rowItemConfiguration = this.uploadSetInstance.rowItemConfiguration || function () {};
        },
        afterEach: function () {
            this.sandbox.restore();
        }
    });

    QUnit.test("rowItemConfiguration should return correct configuration", function (assert) {
        const mockConfig = { column: "File Name", type: "text", visible: true };
        this.sandbox.stub(this.uploadSetInstance, "rowItemConfiguration").returns(mockConfig);
        const result = this.uploadSetInstance.rowItemConfiguration();
        assert.deepEqual(result, mockConfig, "rowItemConfiguration returned the expected object");
    });

    QUnit.test("rowItemConfiguration should be called once", function (assert) {
        this.sandbox.spy(this.uploadSetInstance, "rowItemConfiguration");
        this.uploadSetInstance.rowItemConfiguration();
        assert.ok(this.uploadSetInstance.rowItemConfiguration.calledOnce, "rowItemConfiguration was called once");
	});

	QUnit.test("rowItemConfiguration should return default configuration if none is set", function (assert) {
        this.sandbox.stub(this.uploadSetInstance, "rowItemConfiguration").returns(undefined);
        const result = this.uploadSetInstance.rowItemConfiguration();
        assert.strictEqual(result, undefined, "rowItemConfiguration returned undefined when no config is set");
    });

    QUnit.test("rowItemConfiguration should return different configurations for different columns", function (assert) {
        const columnConfig1 = { column: "File Name", type: "text", visible: true };
        const columnConfig2 = { column: "File Size", type: "number", visible: false };
        this.sandbox.stub(this.uploadSetInstance, "rowItemConfiguration")
            .onFirstCall().returns(columnConfig1)
            .onSecondCall().returns(columnConfig2);
        const result1 = this.uploadSetInstance.rowItemConfiguration();
        const result2 = this.uploadSetInstance.rowItemConfiguration();
        assert.deepEqual(result1, columnConfig1, "First call returned configuration for 'File Name'");
        assert.deepEqual(result2, columnConfig2, "Second call returned configuration for 'File Size'");
    });

    QUnit.test("rowItemConfiguration should not throw an error when called with invalid input", function (assert) {
        this.sandbox.stub(this.uploadSetInstance, "rowItemConfiguration").callsFake(function () {
            return { column: "Unknown", type: "unknown", visible: false };
        });
        const result = this.uploadSetInstance.rowItemConfiguration(null);
        assert.deepEqual(result, { column: "Unknown", type: "unknown", visible: false }, "rowItemConfiguration handled null input gracefully");
	});

	QUnit.module("Plugin visual and aggregation tests");

	QUnit.test("NoDataIllustration test", async function (assert) {
		const done = assert.async();
		const oMdcTable = await createMDCTable({
			actions: [
				new ActionsPlaceholder({ id: "uploadButton", placeholderFor: "UploadButtonPlaceholder" })
			]
		});
		var oEmptyModel = new sap.ui.model.json.JSONModel({});
		oMdcTable.setModel(oEmptyModel);
		const oUploadSetwithTablePlugin = new UploadSetwithTable({
			actions: ["uploadButton"]
		});
		oMdcTable.addDependent(oUploadSetwithTablePlugin);
		oUploadSetwithTablePlugin.setNoDataIllustration("sap-icon://document");
		oMdcTable.placeAt("qunit-fixture");
		await oMdcTable.initialized();
		await nextUIUpdate();
		// Ensure "No Data" illustration is correctly set
		assert.strictEqual(oUploadSetwithTablePlugin.getNoDataIllustration(), "sap-icon://document", "No Data Illustration is correctly set.");
		done();
	});

	QUnit.test("Upload enabled test", async function (assert) {
		const done = assert.async();
		const oMdcTable = await createMDCTable({
			actions: [
				new ActionsPlaceholder({ id: "myuploadButton", placeholderFor: "UploadButtonPlaceholder" })
			]
		});
		const oUploadSetwithTablePlugin = new UploadSetwithTable({
			actions: ["uploadButton"]
		});
		oMdcTable.addDependent(oUploadSetwithTablePlugin);
		oMdcTable.placeAt("qunit-fixture");
		await oMdcTable.initialized();
		await nextUIUpdate();
		oUploadSetwithTablePlugin.setUploadEnabled(false);
		var bIsUploadEnabled = oUploadSetwithTablePlugin.getUploadEnabled();
		assert.equal(false, bIsUploadEnabled, "Uploading is not allowed when setUploadEnabled is set to true");
		done();
	});

	QUnit.module("Plugin itemValidationHandler Tests", {
	    beforeEach: function () {
	        this.sandbox = sinon.createSandbox();
	        this.oUploadPlugin = new UploadSetwithTable();
	        this.oMockItem = new UploadItem({
	            fileName: "test-file.txt",
	            mediaType: "text/plain"
	        });
	    },
	    afterEach: function () {
	        this.sandbox.restore();
	        this.oUploadPlugin.destroy();
	    }
	});

	QUnit.test("Should invoke itemValidationHandler before upload", async function (assert) {
	    assert.expect(2);
	    const done = assert.async();
	    const validationHandler = sinon.stub().resolves();
	    this.oUploadPlugin.setItemValidationHandler(validationHandler);
	    const handlerFunction = this.oUploadPlugin.getItemValidationHandler();
	    if (handlerFunction) {
	        await handlerFunction(this.oMockItem);
	    }
	    assert.ok(validationHandler.calledOnce, "itemValidationHandler should be called once.");
	    assert.ok(validationHandler.calledWith(this.oMockItem), "itemValidationHandler called with correct item.");
	    done();
	});

	QUnit.test("Should prevent upload when itemValidationHandler rejects the promise", function (assert) {
	    const done = assert.async();
	    const validationHandler = sinon.stub().rejects(new Error("File not allowed"));
	    this.oUploadPlugin.setItemValidationHandler(validationHandler);
	    const handlerFunction = this.oUploadPlugin.getItemValidationHandler();
	    if (handlerFunction) {
	        handlerFunction(this.oMockItem).catch((error) => {
	            assert.ok(validationHandler.calledOnce, "itemValidationHandler was called.");
	            assert.strictEqual(error.message, "File not allowed", "Correct error message received.");
	            done();
	        });
	    }
	});

	QUnit.test("Should modify item before upload in itemValidationHandler", async function (assert) {
	    const done = assert.async();
	    const validationHandler = function (oItem) {
			oItem.setFileName("modified-file.txt");
			return Promise.resolve();
	    };
	    this.oUploadPlugin.setItemValidationHandler(validationHandler);
	    const handlerFunction = this.oUploadPlugin.getItemValidationHandler();
	    if (handlerFunction) {
	        await handlerFunction(this.oMockItem);
	    }
	    assert.strictEqual(this.oMockItem.getFileName(), "modified-file.txt", "File name was modified before upload.");
	    done();
	});

	QUnit.test("Should allow upload when itemValidationHandler is not set", function (assert) {
	    const handlerFunction = this.oUploadPlugin.getItemValidationHandler();
	    assert.ok(handlerFunction === undefined || handlerFunction === null, "No validation handler should be set.");
	});

	QUnit.module("Plugin Cloud File Picker Tests");

	QUnit.test("Cloud file picker correctly creates file with metadata", function (assert) {
	    const oUploadPlugin = new UploadSetwithTable();
	    const oCloudFile = {
	        getFileShareItemName: () => "sample.pdf",
	        getFileShareItemContentType: () => "application/pdf",
	        getFileShareItemContentSize: () => 1024,
	        mProperties: { cloudSource: "Google Drive" }
	    };
	    const oResult = oUploadPlugin._createFileFromCloudPickerFile(oCloudFile);
	    assert.equal(oResult.file.name, "sample.pdf", "File name is correctly set.");
	    assert.equal(oResult.file.type, "application/pdf", "File type is correctly set.");
	    assert.equal(oResult.fileShareProperties.cloudSource, "Google Drive", "Cloud source metadata is preserved.");
	});

	QUnit.test("Cloud file picker handles missing content type", function (assert) {
	    const oUploadPlugin = new UploadSetwithTable();
	    const oCloudFile = {
	        getFileShareItemName: () => "document.txt",
	        getFileShareItemContentType: () => null,
	        getFileShareItemContentSize: () => 2048,
	        mProperties: { cloudSource: "OneDrive" }
	    };
	    const oResult = oUploadPlugin._createFileFromCloudPickerFile(oCloudFile);
	    assert.equal(oResult.file.name, "document.txt");
	    assert.equal(oResult.file.type, "null");
	    assert.equal(oResult.fileShareProperties.cloudSource, "OneDrive");
	});

	QUnit.test("Cloud file picker handles missing metadata properties", function (assert) {
	    const oUploadPlugin = new UploadSetwithTable();
	    const oCloudFile = {
	        getFileShareItemName: () => "image.png",
	        getFileShareItemContentType: () => "image/png",
	        getFileShareItemContentSize: () => 3072
	    };
	    const oResult = oUploadPlugin._createFileFromCloudPickerFile(oCloudFile);
	    assert.equal(oResult.file.name, "image.png");
	    assert.equal(oResult.file.type, "image/png");
	    assert.deepEqual(oResult.fileShareProperties, undefined);
	});

	QUnit.test("Cloud picker file change triggers file creation and processing", function (assert) {
	    const oUploadPlugin = new UploadSetwithTable();
	    const oMockEvent = {
	        getParameters: () => ({
	            selectedFiles: [
	                {
	                    getFileShareItemName: () => "test1.docx",
	                    getFileShareItemContentType: () => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	                    getFileShareItemContentSize: () => 1024
	                },
	                {
	                    getFileShareItemName: () => "test2.xlsx",
	                    getFileShareItemContentType: () => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	                    getFileShareItemContentSize: () => 2048
	                }
	            ]
	        })
	    };
	    let aProcessedFiles = [];
	    oUploadPlugin._processNewCloudPickerFileObjects = function (aFiles) {
	        aProcessedFiles = aFiles;
	    };
	    oUploadPlugin._onCloudPickerFileChange(oMockEvent);
	    assert.equal(aProcessedFiles.length, 2);
	    assert.equal(aProcessedFiles[0].file.name, "test1.docx");
	    assert.equal(aProcessedFiles[1].file.name, "test2.xlsx");
	});

	QUnit.test("Cloud picker files are processed correctly", function (assert) {
	    const oUploadPlugin = new UploadSetwithTable();
	    const oMockFile1 = {
	        file: new File([""], "cloudfile1.pdf", { type: "application/pdf" }),
	        fileShareProperties: { source: "OneDrive" }
	    };
	    const oMockFile2 = {
	        file: new File([""], "cloudfile2.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }),
	        fileShareProperties: { source: "Google Drive" }
	    };
	    const aInitiatedUploads = [];
	    oUploadPlugin._initateItemUpload = function (oItem) {
	        aInitiatedUploads.push(oItem);
	    };
	    oUploadPlugin._processNewCloudPickerFileObjects([oMockFile1, oMockFile2]);
	    assert.equal(aInitiatedUploads.length, 2);
	    assert.equal(aInitiatedUploads[0].getFileName(), "cloudfile1.pdf");
	    assert.equal(aInitiatedUploads[1].getFileName(), "cloudfile2.docx");
	});

	QUnit.module("Multiple Table in single page", {
		beforeEach: function() {
			this.oTable = null;
			this.oUploadSetwithTablePlugin = null;
		},
		afterEach: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
		}
	});

	QUnit.test("File Preview Dialog opens on file selection for multiple tables", async function (assert) {
		const done = assert.async();
		// arrange
		const oPreviewDialog = new sap.m.upload.FilePreviewDialog();

		// set rowconfiguration aggregation for the plugin to get the binding context of the selected file using sap.m.upload.UploadItemConfiguration.
		const oRow1 = new sap.m.upload.UploadItemConfiguration({
			fileNamePath: "fileName",
			fileUrlPath: "imageUrl",
			fileTypePath: "mediaType",
			fileSizePath: "size",
			documentTypePath: "documentType"
		});

		const oRow2 = new sap.m.upload.UploadItemConfiguration({
			fileNamePath: "fileName",
			fileUrlPath: "imageUrl",
			fileTypePath: "mediaType",
			fileSizePath: "size",
			documentTypePath: "documentType"
		});

		const oUploadSetwithTablePluginTable1 = new UploadSetwithTable({
			actions: ["uploadButton1"],
			previewDialog: oPreviewDialog,
			rowConfiguration: oRow1
		});

		const oUploadSetwithTablePluginTable2 = new UploadSetwithTable({
			actions: ["uploadButton2"],
			previewDialog: oPreviewDialog,
			rowConfiguration: oRow2
		});

		this.spy(oUploadSetwithTablePluginTable1, "getConfig");
		this.spy(oUploadSetwithTablePluginTable2, "getConfig");

		// Simulate a file selection event on the action button
		fnPreviewHandler = function (oEvent) {
			const oSource = oEvent.getSource();
			const oBindingContext = oSource.getBindingContext();
			if (oBindingContext && oUploadSetwithTablePluginTable1 && oBindingContext.getPath().includes("0")) {
				oUploadSetwithTablePluginTable1.openFilePreview(oBindingContext);
			} else if (oBindingContext && oUploadSetwithTablePluginTable2) {
				oUploadSetwithTablePluginTable2.openFilePreview(oBindingContext);
			}
		};

		setFilePreviewHandler(fnPreviewHandler);

		const oMdcTable1 = await createMDCTable({
			actions: [
				new ActionsPlaceholder({ id:"uploadButton1", placeholderFor:"UploadButtonPlaceholder"})
			]
		});

		const oMdcTable2 = await createMDCTable({
			actions: [
				new ActionsPlaceholder({ id:"uploadButton2", placeholderFor:"UploadButtonPlaceholder"})
			]
		});

		// use sap.m.upload.FilePreviewDialog instance

		// act
		oMdcTable1.addDependent(oUploadSetwithTablePluginTable1);
		oMdcTable2.addDependent(oUploadSetwithTablePluginTable2);

		//oMdcTable1.placeAt("qunit-fixture");
		await oMdcTable1.initialized();
		await nextUIUpdate();

		//oMdcTable2.placeAt("qunit-fixture");
		await oMdcTable2.initialized();
		await nextUIUpdate();

		// act

		// get Link control from the table and trigger press event
		const oLink1 = oMdcTable1._oTable.getItems()[0]?.getCells()[0]?.getItems()[2]?.getItems()[0];
		if (!oLink1) {
			assert.ok(false, "File preview link not found in the table");
		}
		oLink1.firePress();

		let oDialog;

		// get Link control from the table and trigger press event
		const oLink2 = oMdcTable2._oTable.getItems()[1]?.getCells()[0]?.getItems()[2]?.getItems()[0];
		if (!oLink2) {
			assert.ok(false, "File preview link not found in the table");
		}
		oLink2.firePress();

		const afterDialogOpen = function (oEvent) {
			oDialog = oEvent.getSource();
			assert.ok(oUploadSetwithTablePluginTable1.getConfig.calledWithExactly("openFilePreview", oLink1.getBindingContext(), oMdcTable1, oUploadSetwithTablePluginTable1), "oMdcTable1 Plugin setPluginDefaultSettings settings are set");
			assert.ok(oUploadSetwithTablePluginTable2.getConfig.calledWithExactly("openFilePreview", oLink2.getBindingContext(), oMdcTable2, oUploadSetwithTablePluginTable2), "oMdcTable2 Plugin setPluginDefaultSettings settings are set");
			oDialog.close();
			oMdcTable1.destroy();
			oMdcTable2.destroy();
			done();
		};

		oPreviewDialog.attachEventOnce("beforePreviewDialogOpen", (oEvent) => {
			oDialog = oEvent.getParameter("oDialog");
			oDialog.attachEventOnce("afterOpen", afterDialogOpen);
		});
	});
});