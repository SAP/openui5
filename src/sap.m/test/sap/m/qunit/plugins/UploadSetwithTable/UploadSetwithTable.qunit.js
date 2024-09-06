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
	"sap/m/Dialog",
	"sap/m/upload/FilePreviewDialog",
	"sap/m/upload/UploadItemConfiguration"
], function(Text, MTable, MColumn, ColumnListItem, UploadSetwithTable, MDCTable, MDCColumn, JSONModel, qutils, nextUIUpdate, GridColumn, GridTable, TemplateHelper, ActionsPlaceholder, OverflowToolbar, Uploader, Dialog, FilePreviewDialog, UploadItemConfiguration) {
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
		assert.equal(oUploadPluginInstance.getHttpRequestMethod(), "POST", "UploadSetwithTable Plugin has POST http request method by default");
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
			httpRequestMethod: "PUT",
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
		assert.equal(oUploadSetwithTablePlugin.getHttpRequestMethod(), "PUT", "UploadSetwithTable Plugin has PUT http request method set");
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
		/**
		 * MDC Table with ActionsPlaceholder
		 */

		// arrange

		const oPreviewDialog = new FilePreviewDialog();

		// set rowconfiguration aggregation for the plugin to get the binding context of the selected file using sap.m.upload.UploadItemConfiguration.
		const oRow = new UploadItemConfiguration({
			fileNamePath: "fileName",
			fileUrlPath: "imageUrl",
			fileTypePath: "mediaType",
			fileSizePath: "size",
			documentTypePath: "documentType"
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
		const oLink = oMdcTable._oTable.getItems()[0]?.getCells()[0]?.getItems()[2]?.getItems()[0];
		if (!oLink) {
			assert.ok(false, "File preview link not found in the table");
		}
		oLink.firePress();

		let oDialog;

		const afterDialogOpen = function (oEvent) {
			oDialog = oEvent.getSource();
			assert.ok(oDialog?.isOpen(), "File preview dialog is opened with the selected file");
			oDialog?.close();
			oMdcTable.destroy();
			done();
		};

		oPreviewDialog.attachEventOnce("beforePreviewDialogOpen", (oEvent) => {
			oDialog = oEvent.getParameter("oDialog");
			oDialog.attachEventOnce("afterOpen", afterDialogOpen);
		});
	});

});