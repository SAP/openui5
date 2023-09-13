/* global QUnit, sinon */
// These are some globals generated due to fl (signals, hasher) and m (hyphenation) libs.

sap.ui.define([
	"./QUnitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Core",
	"sap/ui/core/format/ListFormat",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/table/GridTableType",
	"sap/ui/mdc/table/ResponsiveTableType",
	"sap/ui/mdc/table/ResponsiveColumnSettings",
	"sap/ui/mdc/table/utils/Personalization",
	"sap/ui/mdc/FilterBar",
	"sap/m/Text",
	"sap/m/Button",
	'sap/m/MessageBox',
	"sap/ui/model/odata/v4/ODataListBinding",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/base/Event",
	"sap/ui/dom/containsOrEquals",
	"sap/ui/Device",
	"sap/m/VBox",
	"sap/m/Link",
	"sap/m/IllustratedMessage",
	"sap/m/IllustratedMessageType",
	"sap/ui/core/Control",
	"sap/ui/core/Popup",
	"sap/ui/core/library",
	"sap/m/library",
	"sap/ui/mdc/odata/TypeMap",
	"test-resources/sap/m/qunit/p13n/TestModificationHandler",
	"sap/ui/mdc/actiontoolbar/ActionToolbarAction",
	"sap/m/plugins/CopyProvider",
	"sap/m/plugins/PasteProvider",
	"../util/createAppEnvironment",
	"sap/ui/fl/write/api/ControlPersonalizationWriteAPI",
	"sap/m/plugins/DataStateIndicator",
	"sap/m/plugins/ColumnResizer",
	"sap/ui/core/message/Message",
	'sap/ui/core/Element',
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/core/theming/Parameters",
	"sap/ui/mdc/table/RowActionItem",
	"sap/ui/mdc/table/RowSettings",
	"sap/ui/thirdparty/jquery",
	"sap/ui/base/Event",
	"sap/base/util/Deferred",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/model/odata/type/String", // load used data types as in legacyFree UI5 they are not loaded automatically
	"sap/ui/model/odata/type/Byte",
	"sap/ui/model/odata/type/Boolean",
	"sap/ui/performance/trace/FESRHelper",
	"sap/m/table/Util",
	"sap/ui/mdc/enums/TableP13nMode",
	"sap/ui/mdc/enums/TableType",
	"sap/m/Menu",
	"sap/m/MenuItem"
], function(
	TableQUnitUtils,
	QUtils,
	KeyCodes,
	Core,
	ListFormat,
	Table,
	Column,
	GridTableType,
	ResponsiveTableType,
	ResponsiveColumnSettings,
	PersonalizationUtils,
	FilterBar,
	Text,
	Button,
	MessageBox,
	ODataListBinding,
	Sorter,
	Filter,
	JSONModel,
	UI5Event,
	containsOrEquals,
	Device,
	VBox,
	Link,
	IllustratedMessage,
	IllustratedMessageType,
	Control,
	Popup,
	CoreLibrary,
	MLibrary,
	ODataTypeMap,
	TestModificationHandler,
	ActionToolbarAction,
	CopyProvider,
	PasteProvider,
	createAppEnvironment,
	ControlPersonalizationWriteAPI,
	DataStateIndicator,
	ColumnResizer,
	Message,
	Element,
	ODataModel,
	ThemeParameters,
	RowActionItem,
	RowSettings,
	jQuery,
	Event,
	Deferred,
	ManagedObjectObserver,
	StringType,
	ByteType,
	BooleanType,
	FESRHelper,
	MTableUtil,
	TableP13nMode,
	TableType,
	Menu,
	MenuItem
) {
	"use strict";

	var HasPopup = CoreLibrary.aria.HasPopup;
	var aTestedTypes = ["Table", "ResponsiveTable"];
	var sDelegatePath = "test-resources/sap/ui/mdc/delegates/TableDelegate";

	var CustomFilterControl = Control.extend("sap.ui.mdc.table.qunit.CustomFilterControl", {
		metadata: {
			interfaces: ["sap.ui.mdc.IFilter"],
			properties: {
				customConditions: {type: "object"},
				customSearch: {type: "string", defaultValue: ""}
			},
			events: {
				search: {},
				filtersChanged: {}
			}
		},
		getConditions: function() {return this.getCustomConditions();},
		validate: function () {return Promise.resolve();},
		getSearch: function() {return this.getCustomSearch();}
	});

	function wait(iMilliseconds) {
		return new Promise(function(resolve) {
			setTimeout(resolve, iMilliseconds);
		});
	}



	function triggerDragEvent(sDragEventType, oControl) {
		var oJQueryDragEvent = jQuery.Event(sDragEventType);
		var oNativeDragEvent;

		if (typeof Event === "function") {
			oNativeDragEvent = new Event(sDragEventType, {
				bubbles: true,
				cancelable: true
			});
		} else { // IE
			oNativeDragEvent = document.createEvent("Event");
			oNativeDragEvent.initEvent(sDragEventType, true, true);
		}

		// Fake the DataTransfer object. This is the only cross-browser solution.
		oNativeDragEvent.dataTransfer = {
			dropEffect: "none",
			effectAllowed: "none",
			files: [],
			items: [],
			types: [],
			setDragImage: function() {
			},
			setData: function() {
			},
			getData: function() {
			}
		};

		oJQueryDragEvent.originalEvent = oNativeDragEvent;

		var oDomRef = oControl.getDomRef ? oControl.getDomRef() : oControl;
		if (oDomRef) {
			jQuery(oDomRef).trigger(oJQueryDragEvent);
		}
	}

	function getInnerColumnLabel(oColumn) {
		if (oColumn.isA("sap.ui.table.Column")) {
			return oColumn.getLabel().getLabel();
		} else if (oColumn.isA("sap.m.Column")) {
			return oColumn.getHeader().getLabel();
		} else {
			return oColumn._oColumnHeaderLabel.getLabel();
		}
	}

	QUnit.module("sap.ui.mdc.Table", {
		beforeEach: function() {
			this.oTable = new Table({
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "/testPath"
					}
				}
			});
			this.oTable.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oTable.destroy();
			TableQUnitUtils.restorePropertyInfos(this.oTable);
		}
	});

	QUnit.test("Instantiate", function(assert) {
		assert.ok(this.oTable.isA("sap.ui.mdc.IxState"));
	});

	QUnit.test("Rendering", function(assert) {
		return this.oTable.initialized().then(function() {
			assert.ok(!!this.oTable.getDomRef(), "Table is rendered.");
			assert.ok(this.oTable.$().hasClass("sapUiMdcTable"), "Table has class sapUiMdcTable");
			assert.equal(this.oTable.getDomRef().style.height, "100%", "Table has a default height");
			assert.ok(!this.oTable.getDomRef().style.width, "Table has a no default width");
			this.oTable.setWidth("200px");
			Core.applyChanges();
			assert.equal(this.oTable.getDomRef().style.width, "200px", "Table has a custom width");
		}.bind(this));
	});

	QUnit.test("Create UI5 Grid Table (default) after initialise", function(assert) {
		assert.ok(!this.oTable._oTable);
		assert.ok(!this.oTable._oRowTemplate);
		assert.ok(!this.oTable._oToolbar);

		return this.oTable.initialized().then(function() {
			assert.ok(this.oTable._oTable.isA("sap.ui.table.Table"));
			assert.ok(!this.oTable._oRowTemplate);
			assert.ok(this.oTable._oToolbar);
			assert.equal(this.oTable._oToolbar.getStyle(), "Clear", "Default toolbar style is set");
		}.bind(this));
	});

	QUnit.test("Columns added to inner table", function(assert) {
		this.oTable.addColumn(new Column({
			minWidth: 8.4,
			header: "Test1",
			template: new Text({
				text: "Test1"
			}),
			creationTemplate: new Text({
				text: "Test1"
			}),
			required: true
		}));
		this.oTable.insertColumn(new Column({
			minWidth: 8.5,
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}), 0);
		this.oTable.insertColumn(new Column({
			header: "Test2",
			template: new Text({
				text: "Test2"
			})
		}), 2);

		return this.oTable.initialized().then(function() {
			var aMDCColumns = this.oTable.getColumns();
			var aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getLabel().getText());
			assert.equal(aInnerColumns[0].getLabel().getText(), "Test", "column0: label is correct");
			assert.equal(aInnerColumns[0].getMinWidth(), 136, "column0: minWidth is correct");

			assert.equal(aInnerColumns[1].getLabel().getText(), "Test1", "column1: label is correct");
			assert.equal(aInnerColumns[1].getMinWidth(), 134, "column1: minWidth is correct");

			assert.ok(aInnerColumns[1].getLabel().getLabel().isRequired(), "column1: is required");
			assert.equal(aInnerColumns[2].getLabel().getText(), "Test2", "column1: label is correct");
			assert.equal(aInnerColumns[2].getMinWidth(), 128, "column2: minWidth is correct (default value)");

			assert.equal(aInnerColumns[0].getTemplate().getText(), "Test", "column0: template is correct");
			assert.equal(aInnerColumns[0].getTemplate().getWrapping(), false, "column0: template wrapping is disabled");
			assert.equal(aInnerColumns[0].getTemplate().getRenderWhitespace(), false, "column0: template renderWhitespace is disabled");
			assert.equal(aInnerColumns[1].getTemplate().getText(), "Test1", "column1: template is correct");
			assert.equal(aInnerColumns[0].getCreationTemplate(), null, "column0: creationTemplate is correct");
			assert.equal(aInnerColumns[1].getCreationTemplate().getText(), "Test1", "column1: creationTemplate is correct");
			assert.equal(aInnerColumns[1].getCreationTemplate().getWrapping(), false, "column1: creationTemplate wrapping is disabled");
			assert.equal(aInnerColumns[1].getCreationTemplate().getRenderWhitespace(), false, "column1: creationTemplate renderWhitespace is disabled");
		}.bind(this));
	});

	QUnit.test("Columns added to inner table - one by one E.g. pers", function(assert) {
		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}));

		return this.oTable.initialized().then(function() {
			var aMDCColumns = this.oTable.getColumns();
			var aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getLabel().getText());

			this.oTable.insertColumn(new Column({
				header: "Test2",
				template: new Text({
					text: "Test2"
				})
			}), 0);

			aMDCColumns = this.oTable.getColumns();
			aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getLabel().getText());
			assert.equal("Test2", aInnerColumns[0].getLabel().getText());
		}.bind(this));

	});

	QUnit.test("rows binding - manually after table creation", function(assert) {
		var oTable = this.oTable;

		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}));
		this.oTable.addColumn(new Column({
			header: "Test3",
			template: new Text({
				text: "Test3"
			})
		}));
		this.oTable.insertColumn(new Column({
			header: "Test2",
			template: new Text({
				text: "Test2"
			})
		}), 1);
		this.oTable.setAutoBindOnInit(false);

		return this.oTable._fullyInitialized().then(function() {
			var aMDCColumns = oTable.getColumns();
			var aInnerColumns = oTable._oTable.getColumns();

			oTable._rebind();

			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aInnerColumns[0].getLabel().getText(), "Test");
			assert.equal(aInnerColumns[1].getLabel().getText(), "Test2");
			assert.equal(aInnerColumns[2].getLabel().getText(), "Test3");
			assert.ok(oTable._oTable.isBound("rows"));
			assert.equal(oTable._oTable.getBindingInfo("rows").path, "/testPath");
		});
	});

	QUnit.test("rows binding if modifications are supported and autoBindOnInit=true", function(assert) {
		var oTable = this.oTable;
		var oRebindSpy = sinon.spy(oTable, "rebind");
		var oWaitForChanges = new Deferred();
		var oWaitForChangesStub = sinon.stub(oTable.getEngine(), "waitForChanges");
		var oIsModificationSupportedStub = sinon.stub(oTable.getEngine(), "isModificationSupported");

		oIsModificationSupportedStub.withArgs(oTable).returns(Promise.resolve(true));
		oWaitForChangesStub.withArgs(oTable).returns(oWaitForChanges.promise);

		return oTable._fullyInitialized().then(function() {
			assert.ok(oRebindSpy.notCalled, "Table#rebind not called during initialization");
			setTimeout(function() {
				oWaitForChanges.resolve();
			}, 100);
		}).then(function() {
			assert.ok(oRebindSpy.notCalled, "Table#rebind not called after initialization");
			return oTable.propertiesFinalized();
		}).then(function() {
			assert.ok(oRebindSpy.notCalled, "Table#rebind not called after property finalization");
			return oWaitForChanges.promise;
		}).then(function() {
			assert.equal(oRebindSpy.callCount, 1, "Table#rebind called once after changes have been applied");
			return TableQUnitUtils.waitForBindingInfo(oTable);
		}).then(function() {
			assert.ok(oTable._oTable.isBound("rows"), "Table is bound");
		}).finally(function() {
			oWaitForChangesStub.restore();
			oIsModificationSupportedStub.restore();
		});
	});

	QUnit.test("rows binding if modifications are not supported and autoBindOnInit=true", function(assert) {
		var oTable = this.oTable;
		var oRebindSpy = sinon.spy(oTable, "rebind");
		var oWaitForChanges = new Deferred();
		var oIsModificationSupportedStub = sinon.stub(oTable.getEngine(), "isModificationSupported");

		oIsModificationSupportedStub.withArgs(oTable).returns(Promise.resolve(false));
		oWaitForChanges.resolve();

		return oTable.initialized().then(function() {
			assert.ok(oRebindSpy.notCalled, "Table#rebind not called during initialization");
			return oTable.propertiesFinalized();
		}).then(function() {
			assert.ok(oRebindSpy.notCalled, "Table#rebind not called after property finalization");
		}).then(function() {
			return TableQUnitUtils.waitForBindingInfo(oTable);
		}).then(function() {
			assert.equal(oRebindSpy.callCount, 1, "Table#rebind called once after initialization");
			assert.ok(oTable._oTable.isBound("rows"), "Table is bound");
		}).finally(function() {
			oIsModificationSupportedStub.restore();
		});
	});

	QUnit.test("Destroy", function(assert) {
		return this.oTable.initialized().then(function() {
			var oToolbar = this.oTable._oToolbar;

			this.oTable.destroy();

			assert.ok(!this.oTable._oTable, "MDCTable's inner table is not available");
			assert.ok(!this.oTable._oRowTemplate, "There is no rowTemplate");
			assert.strictEqual(oToolbar.bIsDestroyed, true, "MDCTable toolbar has been destroied");
		}.bind(this));
	});

	QUnit.test("Destroy directly after creation", function(assert) {
		var done = assert.async();
		var oTableCreateContent = sinon.spy(this.oTable, "_createContent");
		this.oTable.destroy();

		setTimeout(function() {
			assert.equal(oTableCreateContent.callCount, 0, "_createContent has not been called");
			done();
		}, 100);
	});

	QUnit.test("Invalidate", function(assert) {
		return this.oTable.initialized().then(function() {
			var oInnerTableInvalidate = sinon.spy(this.oTable._oTable, "invalidate");

			this.oTable.invalidate();

			assert.equal(oInnerTableInvalidate.callCount, 0, "Inner table is not invalidated if the MDC Table is invalidated");
		}.bind(this));
	});

	QUnit.test("Create UI5 Responsive Table after initialise (model is set on the parent/control)", function(assert) {
		// Destroy the old/default table
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable"
		});
		this.oTable.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.ok(!this.oTable._oTable);
		assert.ok(!this.oTable._oRowTemplate);
		assert.ok(!this.oTable._oToolbar);

		return this.oTable.initialized().then(function() {
			assert.ok(this.oTable._oTable.isA("sap.m.Table"));
			assert.ok(this.oTable._oRowTemplate.isA("sap.m.ColumnListItem"));
			assert.ok(this.oTable._oTable.getAutoPopinMode(), "autoPopinMode is true");
			assert.strictEqual(this.oTable._oTable.getContextualWidth(), "Auto", "contextualWidth='Auto'");
			assert.ok(this.oTable._oToolbar);
			assert.equal(this.oTable._oToolbar.getStyle(), "Standard", "Default toolbar style is set");
		}.bind(this));
	});

	QUnit.test("Columns added to inner ResponsiveTable", function(assert) {
		var done = assert.async();
		// Destroy the old/default table
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable"
		});
		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		Core.applyChanges();

		this.oTable.addColumn(
			new Column({
				header: "Test",
				template: new Text({
					text: "Test"
				}),
				required: true,
				extendedSettings: new ResponsiveColumnSettings({
					importance: "High"
				})
			})
		);

		this.oTable.addColumn(
			new Column({
				header: "Test3",
				template: new Text({
					text: "Test3"
				}),
				extendedSettings: new ResponsiveColumnSettings({
					importance: "Low"
				})
			})
		);

		this.oTable.insertColumn(new Column({
			header: "Test2",
			minWidth: 8.5,
			template: new Text({
				text: "Test2"
			})
		}), 1);

		this.oTable.initialized().then(function() {
			var aMDCColumns = this.oTable.getColumns();
			var aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getHeader().getText());
			assert.equal(aInnerColumns[0].getHeader().getText(), "Test");
			assert.ok(aInnerColumns[0].getHeader().getLabel().getRequired(), "First column is required");
			assert.equal(getInnerColumnLabel(aInnerColumns[0]).getWrappingType(), "Hyphenated");
			assert.equal(aInnerColumns[0].getImportance(), "High");
			assert.equal(aInnerColumns[0].getAutoPopinWidth(), 8, "minWidth is not set, default value is 8");
			assert.equal(aInnerColumns[1].getHeader().getText(), "Test2");
			assert.equal(aInnerColumns[1].getImportance(), "None", "importance is not set, default value is None");
			assert.equal(aInnerColumns[1].getAutoPopinWidth(), 8.5, "autoPopinWidth is set properly");
			assert.equal(aInnerColumns[2].getHeader().getText(), "Test3");
			assert.equal(aInnerColumns[2].getImportance(), "Low");
			done();
		}.bind(this));
	});

	QUnit.test("Columns added to inner ResponsiveTable - one by one E.g. pers", function(assert) {
		// Destroy the old/default table
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable"
		});
		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		Core.applyChanges();

		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}));

		return this.oTable.initialized().then(function() {
			var aMDCColumns = this.oTable.getColumns();
			var aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getHeader().getText());

			this.oTable.insertColumn(new Column({
				header: "Test2",
				template: new Text({
					text: "Test2"
				})
			}), 0);

			this.oTable.addColumn(new Column({
				header: "Test3",
				template: new Text({
					text: "Test3"
				})
			}));

			aMDCColumns = this.oTable.getColumns();
			aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getHeader().getText());
			assert.equal("Test2", aInnerColumns[0].getHeader().getText());
			assert.equal(aMDCColumns[2].getHeader(), aInnerColumns[2].getHeader().getText());
			assert.equal("Test3", aInnerColumns[2].getHeader().getText());
		}.bind(this));
	});

	QUnit.test("rows binding - binds the inner ResponsiveTable - manually", function(assert) {

		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable",
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath"
				}
			}
		});

		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		Core.applyChanges();

		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}));
		this.oTable.addColumn(new Column({
			header: "Test3",
			template: new Text({
				text: "Test3"
			})
		}));
		this.oTable.insertColumn(new Column({
			header: "Test2",
			template: new Text({
				text: "Test2"
			})
		}), 1);
		this.oTable.setAutoBindOnInit(false);

		return this.oTable._fullyInitialized().then(function() {
			var aMDCColumns = this.oTable.getColumns();
			var aInnerColumns = this.oTable._oTable.getColumns();

			this.oTable.rebind();

			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aInnerColumns[0].getHeader().getText(), "Test");
			assert.equal(aInnerColumns[1].getHeader().getText(), "Test2");
			assert.equal(aInnerColumns[2].getHeader().getText(), "Test3");
			assert.ok(this.oTable._oTable.isBound("items"));
			assert.equal(this.oTable._oTable.getBindingInfo("items").path, "/testPath");
		}.bind(this));
	});

	QUnit.test("rows binding - binds the inner ResponsiveTable - via metadataInfo, before table creation", function(assert) {
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable",
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath"
				}
			}
		});

		return TableQUnitUtils.waitForBindingInfo(this.oTable).then(function() {
			assert.ok(this.oTable._oTable.isBound("items"));
			assert.strictEqual(this.oTable._oTable.getBindingInfo("items").path, "/testPath");
		}.bind(this));
	});

	QUnit.test("bindRows manually (Responsive)", function(assert) {
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable",
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath"
				}
			}
		});
		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}));
		this.oTable.addColumn(new Column({
			header: "Test3",
			template: new Text({
				text: "Test3"
			})
		}));
		this.oTable.insertColumn(new Column({
			header: "Test2",
			template: new Text({
				text: "Test2"
			})
		}), 1);
		this.oTable.setAutoBindOnInit(false);

		return this.oTable._fullyInitialized().then(function() {
			var aMDCColumns = this.oTable.getColumns();
			var aInnerColumns = this.oTable._oTable.getColumns();

			this.oTable.rebind();

			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aInnerColumns[0].getHeader().getText(), "Test");
			assert.equal(aInnerColumns[1].getHeader().getText(), "Test2");
			assert.equal(aInnerColumns[2].getHeader().getText(), "Test3");
			assert.ok(this.oTable._oTable.isBound("items"));
			assert.equal(this.oTable._oTable.getBindingInfo("items").path, "/testPath");
		}.bind(this));
	});

	QUnit.test("insertAggregation('cell') should be skiped for sap.m.GroupHeaderListItem", function(assert) {
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable",
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath"
				}
			},
			columns: [
				new Column({
					header: "Column1",
					template: new Text({
						text: "{cell1}"
					}),
					propertyKey: "column1"
				}), new Column({
					header: "Column2",
					template: new Text({
						text: "{cell2}"
					}),
					propertyKey: "column2"
				})
			],
			models: new JSONModel({
				testPath: new Array(10).fill({
					column1: "cell1",
					column2: "cell2",
					column3: "cell3"
				})
			})
		});

		TableQUnitUtils.stubPropertyInfos(this.oTable, [
			{
				name: "column1",
				path: "column1",
				label: "column1",
				dataType: "String"
			},
			{
				name: "column2",
				path: "column2",
				label: "column2",
				dataType: "String"
			},
			{
				name: "column3",
				path: "column3",
				label: "column3",
				dataType: "String"
			}
		]);

		return this.oTable._fullyInitialized().then(function() {
			this.oTable.setGroupConditions({
				groupLevels: [
					{name: "column1"}
				]
			});
			return TableQUnitUtils.waitForBindingInfo(this.oTable);
		}.bind(this)).then(function() {
			var aItems = this.oTable._oTable.getItems();
			assert.ok(aItems[0].isA("sap.m.GroupHeaderListItem"), "Grouping applied as expected");
			assert.strictEqual(aItems.length, 11, "1 group header item + 10 list items");

			var fnIsASpy = sinon.spy(aItems[0], "isA");

			// add a column
			this.oTable.insertColumn(new Column({
				header: "Column3",
				template: new Text({
					text: "{cell3}"
				}),
				propertyKey: "column3"
			}), 1);

			assert.ok(fnIsASpy.calledWith("sap.m.GroupHeaderListItem"), 10, "insertAggregation('cells') skipped for sap.m.GroupHeaderListItem");
		}.bind(this));
	});

	QUnit.test("Destroy - MTable - remove template", function(assert) {
		// Destroy the old/default table
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable"
		});
		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		Core.applyChanges();

		return this.oTable.initialized().then(function() {
			this.oTable.destroy();
			assert.ok(!this.oTable._oTable);
			assert.ok(!this.oTable._oRowTemplate);
		}.bind(this));
	});

	// Switch table type and test APIs
	QUnit.test("Switch table type and test APIs", function(assert) {
		var done = assert.async(), fInnerTableDestroySpy, fInnerTemplateDestroySpy;

		this.oTable.initialized().then(function() {
			fInnerTableDestroySpy = sinon.spy(this.oTable._oTable, "destroy");

			// Switch table
			assert.ok(fInnerTableDestroySpy.notCalled);
			this.oTable.setSelectionMode("Single");
			this.oTable.setThreshold(10);
			this.oTable.setType("ResponsiveTable");

			assert.ok(fInnerTableDestroySpy.calledOnce);

			this.oTable.initialized().then(function() {
				assert.ok(this.oTable._oTable.isA("sap.m.Table"));
				assert.ok(this.oTable._oRowTemplate);
				assert.ok(this.oTable._oRowTemplate.isA("sap.m.ColumnListItem"));
				assert.equal(this.oTable._oTable.getGrowingThreshold(), this.oTable.getThreshold());
				fInnerTableDestroySpy = sinon.spy(this.oTable._oTable, "destroy");
				fInnerTemplateDestroySpy = sinon.spy(this.oTable._oRowTemplate, "destroy");

				// Setting same table type does nothing
				this.oTable.setType("ResponsiveTable");
				this.oTable.setSelectionMode("Multi");

				assert.ok(fInnerTableDestroySpy.notCalled);
				assert.ok(fInnerTemplateDestroySpy.notCalled);
				assert.equal(this.oTable._oTable.getGrowingScrollToLoad(), false);

				this.oTable.setType(new ResponsiveTableType({
					growingMode: "Scroll"
				}));

				assert.ok(fInnerTableDestroySpy.calledOnce);
				assert.ok(fInnerTemplateDestroySpy.calledOnce);

				return this.oTable.initialized();
			}.bind(this)).then(function() {
				fInnerTableDestroySpy = sinon.spy(this.oTable._oTable, "destroy");
				fInnerTemplateDestroySpy = sinon.spy(this.oTable._oRowTemplate, "destroy");

				// growingScrollToLoad of the inner table will be set
				assert.equal(this.oTable._oTable.getGrowingScrollToLoad(), true);
				// growing of inner table is set
				assert.equal(this.oTable._oTable.getGrowing(), true);

				// Updating the table type will update the properties on the table
				this.oTable.getType().setGrowingMode("Basic");

				assert.ok(fInnerTableDestroySpy.notCalled);
				assert.ok(fInnerTemplateDestroySpy.notCalled);
				// growingScrollToLoad of the inner table will be reset
				assert.equal(this.oTable._oTable.getGrowingScrollToLoad(), false);
				// growing of inner table is set
				assert.equal(this.oTable._oTable.getGrowing(), true);

				// Updating the table type will update the properties on the table
				this.oTable.getType().setGrowingMode("None");

				assert.ok(fInnerTableDestroySpy.notCalled);
				assert.ok(fInnerTemplateDestroySpy.notCalled);
				// growingScrollToLoad of the inner table will be reset
				assert.equal(this.oTable._oTable.getGrowingScrollToLoad(), false);
				// growing of inner table is set
				assert.equal(this.oTable._oTable.getGrowing(), false);

				this.oTable.setType("Table");
				assert.ok(fInnerTableDestroySpy.calledOnce);
				assert.ok(fInnerTemplateDestroySpy.calledOnce);
				this.oTable.initialized().then(function() {
					assert.ok(this.oTable._oTable.isA("sap.ui.table.Table"));
					assert.ok(!this.oTable._oRowTemplate);
					assert.equal(this.oTable._oTable.getThreshold(), this.oTable.getThreshold());
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	// Switch table type immediately
	QUnit.test("Switch table type immediately after create", function(assert) {
		var done = assert.async(), fInnerTableDestroySpy, fInnerTemplateDestroySpy, fRowModeDestroySpy, bHideEmptyRows;

		// Switch table immediately
		this.oTable.setType("ResponsiveTable");

		this.oTable.initialized().then(function() {
			assert.ok(this.oTable._oTable.isA("sap.m.Table"));
			assert.ok(this.oTable._oRowTemplate.isA("sap.m.ColumnListItem"));
			fInnerTableDestroySpy = sinon.spy(this.oTable._oTable, "destroy");
			fInnerTemplateDestroySpy = sinon.spy(this.oTable._oRowTemplate, "destroy");

			// Setting same table type does nothing
			this.oTable.setType("ResponsiveTable");
			assert.ok(this.oTable._oTable.isA("sap.m.Table"));
			assert.ok(fInnerTableDestroySpy.notCalled);
			assert.ok(fInnerTemplateDestroySpy.notCalled);

			this.oTable.setType("Table");
			assert.ok(fInnerTableDestroySpy.calledOnce);
			assert.ok(fInnerTemplateDestroySpy.calledOnce);

			this.oTable.initialized().then(function() {
				assert.ok(this.oTable._oTable.isA("sap.ui.table.Table"));
				assert.ok(!this.oTable._oRowTemplate);
				assert.ok(this.oTable._oTable.getRowMode().isA("sap.ui.table.rowmodes.Auto"), "The inner GridTable has an auto row mode");
				assert.equal(this.oTable._oTable.getRowMode().getMinRowCount(), 10);

				fInnerTableDestroySpy = sinon.spy(this.oTable._oTable, "destroy");
				fRowModeDestroySpy = sinon.spy(this.oTable._oTable.getRowMode(), "destroy");
				bHideEmptyRows = this.oTable._oTable.getRowMode().getHideEmptyRows();

				this.oTable.setType(new GridTableType({
					rowCountMode: "Fixed"
				}));

				assert.ok(fInnerTableDestroySpy.calledOnce);
				assert.ok(fRowModeDestroySpy.calledOnce);

				return this.oTable.initialized();
			}.bind(this)).then(function() {
				fInnerTableDestroySpy = sinon.spy(this.oTable._oTable, "destroy");

				// inner table is updated
				assert.ok(this.oTable._oTable.getRowMode().isA("sap.ui.table.rowmodes.Fixed"), "The inner GridTable has a fixed row mode");
				assert.equal(this.oTable._oTable.getRowMode().getRowCount(), 10);
				assert.equal(this.oTable._oTable.getRowMode().getHideEmptyRows(), bHideEmptyRows);

				// Updating the table type instance also updates properties
				this.oTable.getType().setRowCount(3);

				assert.ok(fInnerTableDestroySpy.notCalled);
				// inner table is updated
				assert.ok(this.oTable._oTable.getRowMode().isA("sap.ui.table.rowmodes.Fixed"), "The inner GridTable has a fixed row mode");
				assert.equal(this.oTable._oTable.getRowMode().getRowCount(), 3);

				fRowModeDestroySpy = sinon.spy(this.oTable._oTable.getRowMode(), "destroy");
				bHideEmptyRows = !bHideEmptyRows;
				this.oTable._oTable.getRowMode().setHideEmptyRows(bHideEmptyRows);

				// Updating the table type instance also updates properties of the inner table
				this.oTable.getType().setRowCountMode("Auto");

				assert.ok(fInnerTableDestroySpy.notCalled);
				assert.ok(fRowModeDestroySpy.calledOnce);
				// inner table is updated
				assert.ok(this.oTable._oTable.getRowMode().isA("sap.ui.table.rowmodes.Auto"), "The inner GridTable has an auto row mode");
				assert.equal(this.oTable._oTable.getRowMode().getMinRowCount(), 3);
				assert.equal(this.oTable._oTable.getRowMode().getHideEmptyRows(), bHideEmptyRows);

				// Updating the table type instance also updates properties of the inner table
				this.oTable.getType().setRowCount(5);

				// inner table is updated
				assert.ok(this.oTable._oTable.getRowMode().isA("sap.ui.table.rowmodes.Auto"), "The inner GridTable has an auto row mode");
				assert.equal(this.oTable._oTable.getRowMode().getMinRowCount(), 5);

				// Updating the table type instance also updates properties of the inner table
				this.oTable.getType().setRowCountMode("Fixed");

				assert.ok(fInnerTableDestroySpy.notCalled);
				// inner table is updated
				assert.ok(this.oTable._oTable.getRowMode().isA("sap.ui.table.rowmodes.Fixed"), "The inner GridTable has a fixed row mode");
				assert.equal(this.oTable._oTable.getRowMode().getRowCount(), 5);

				fRowModeDestroySpy = sinon.spy(this.oTable._oTable.getRowMode(), "destroy");

				// Setting same table type only updates properties
				this.oTable.setType("Table");

				assert.ok(fInnerTableDestroySpy.calledOnce);
				assert.ok(fRowModeDestroySpy.calledOnce);

				return this.oTable.initialized();
			}.bind(this)).then(function() {
				assert.ok(this.oTable._oTable.getRowMode().isA("sap.ui.table.rowmodes.Auto"), "The inner GridTable has an auto row mode");
				assert.equal(this.oTable._oTable.getRowMode().getMinRowCount(), 10);
				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("bindRows with rowCount without wrapping dataReceived", function(assert) {
		this.oTable.destroy();
		this.oTable = new Table({
			header: "Test",
			showRowCount: true,
			type: "ResponsiveTable",
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath"
				}
			}
		});

		return TableQUnitUtils.waitForBindingInfo(this.oTable).then(function() {
			var oBindingInfo = this.oTable._oTable.getBindingInfo("items");
			var fDataReceived = oBindingInfo.events["dataReceived"];

			sinon.stub(this.oTable._oTable, "getBinding");

			var iCurrentLength = 10;
			var bIsLengthFinal = true;
			var oRowBinding = {
				getLength: function() {
					return iCurrentLength;
				},
				getCount: function() {
					return iCurrentLength;
				},
				isLengthFinal: function() {
					return bIsLengthFinal;
				},
				isA: function() {
					// Is not a TreeBinding
					return false;
				}
			};
			this.oTable._oTable.getBinding.returns(oRowBinding);

			assert.equal(this.oTable._oTitle.getText(), "Test");

			fDataReceived();
			assert.equal(this.oTable._oTitle.getText(), "Test (10)");
		}.bind(this));
	});

	QUnit.test("bindRows with rowCount with wrapping dataReceived", function(assert) {
		var fCustomDataReceived = sinon.spy();
		var fnOriginalUpdateBindingInfo;

		this.oTable.destroy();
		this.oTable = new Table({
			header: "Test",
			showRowCount: true,
			type: "Table",
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath"
				}
			}
		});

		return this.oTable.initialized().then(function() {
			fnOriginalUpdateBindingInfo = this.oTable.getControlDelegate().updateBindingInfo;
			this.oTable.getControlDelegate().updateBindingInfo = function(oTable, oBindingInfo) {
				fnOriginalUpdateBindingInfo.apply(this, arguments);
				oBindingInfo.events = {
					dataReceived: fCustomDataReceived
				};
			};
			return TableQUnitUtils.waitForBindingInfo(this.oTable);
		}.bind(this)).then(function() {
			var oRowBinding = sinon.createStubInstance(ODataListBinding);

			oRowBinding.isLengthFinal.returns(true);
			oRowBinding.getContexts.returns([]);

			sinon.stub(this.oTable._oTable, "getBinding");
			this.oTable._oTable.getBinding.returns(oRowBinding);

			var oBindingInfo = this.oTable._oTable.getBindingInfo("rows");
			var fDataReceived = oBindingInfo.events["dataReceived"];
			assert.equal(this.oTable._oTitle.getText(), "Test");

			assert.equal(this.oTable._oTitle.getText(), "Test");
			assert.ok(fCustomDataReceived.notCalled);

			oRowBinding.getCount.returns(undefined);
			fDataReceived(new UI5Event("dataReceived", oRowBinding));
			assert.equal(this.oTable._oTitle.getText(), "Test");

			oRowBinding.getCount.returns(10);
			fDataReceived(new UI5Event("dataReceived", oRowBinding));
			assert.equal(this.oTable._oTitle.getText(), "Test (10)");
			assert.ok(fCustomDataReceived.calledTwice);

			this.oTable.getControlDelegate().updateBindingInfo = fnOriginalUpdateBindingInfo;
		}.bind(this));
	});

	// General tests --> relevant for both table types
	QUnit.test("check for initial column index", function(assert) {
		this.oTable.destroy();
		this.oTable = new Table({
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath"
				}
			},
			type: "ResponsiveTable",
			columns: [
				new Column({
					id: "foo0",
					header: "Test0",
					template: new Text({
						text: "template0"
					})
				}),
				new Column({
					id: "foo1",
					header: "Test1",
					template: new Text({
						text: "template1"
					})
				})

			],
			models: new JSONModel({
				testPath: new Array(10).fill({})
			})
		});

		return TableQUnitUtils.waitForBinding(this.oTable).then(function() {
			var aMDCColumns = this.oTable.getColumns();
			var aInnerColumns = this.oTable._oTable.getColumns();
			var oInnerColumnListItem = this.oTable._oRowTemplate;
			var oFirstInnerItem = this.oTable._oTable.getItems()[0];

			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aInnerColumns[0].getHeader().getText(), "Test0");
			assert.equal(aInnerColumns[1].getHeader().getText(), "Test1");
			assert.equal(oInnerColumnListItem.getCells()[0].getText(), "template0");
			assert.equal(oInnerColumnListItem.getCells()[1].getText(), "template1");

			this.oTable.insertColumn(new Column({
				header: "Test2",
				template: new Text({
					text: "template2"
				})
			}), 1);
			aMDCColumns = this.oTable.getColumns();
			aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aInnerColumns[0].getHeader().getText(), "Test0");
			assert.equal(aInnerColumns[1].getHeader().getText(), "Test2");
			assert.equal(aInnerColumns[2].getHeader().getText(), "Test1");
			assert.equal(oInnerColumnListItem.getCells()[0].getText(), "template0");
			assert.equal(oInnerColumnListItem.getCells()[1].getText(), "template2");
			assert.equal(oInnerColumnListItem.getCells()[2].getText(), "template1");
			assert.equal(oFirstInnerItem.getCells().length, 3, "Inner items have 3 cells");
			assert.ok(oFirstInnerItem.getCells()[1].isA("sap.ui.core.InvisibleText"),
				"A placeholder cell is added to the inner items for the inserted column");

			this.oTable.removeColumn("foo0");
			aMDCColumns = this.oTable.getColumns();
			aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aInnerColumns[0].getHeader().getText(), "Test2");
			assert.equal(aInnerColumns[1].getHeader().getText(), "Test1");
			assert.equal(oInnerColumnListItem.getCells()[0].getText(), "template2");
			assert.equal(oInnerColumnListItem.getCells()[1].getText(), "template1");

			var oColumnDestroy = sinon.spy(this.oTable._oTable.getColumns()[1], "destroy");
			this.oTable.removeColumn("foo1");
			aMDCColumns = this.oTable.getColumns();
			aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aInnerColumns[0].getHeader().getText(), "Test2");
			assert.equal(oInnerColumnListItem.getCells()[0].getText(), "template2");
			assert.ok(oColumnDestroy.calledOnce, "Inner column destroyed");
		}.bind(this));
	});

	QUnit.test("bindAggregation for columns uses default behaviour", function(assert) {
		return this.oTable.initialized().then(function() {
			var sPath = "/columnPath";
			var oTemplate = new Column({
				header: '{name}'
			});
			this.oTable.bindAggregation("columns", {
				path: sPath,
				template: oTemplate
			});

			var oBindingInfo = this.oTable.getBindingInfo("columns");
			assert.equal(oBindingInfo.path, sPath);
			assert.equal(oBindingInfo.template, oTemplate);
		}.bind(this));
	});

	QUnit.test("sort indicator is set correctly at the inner grid table columns", function(assert) {
		this.oTable.addColumn(new Column({
			template: new Text(),
			propertyKey: "name"
		}));

		this.oTable.addColumn(new Column({
			template: new Text(),
			propertyKey: "age"
		}));

		TableQUnitUtils.stubPropertyInfos(this.oTable, [
			{
				name: "name",
				path: "name",
				label: "name",
				dataType: "String"
			},
			{
				name: "age",
				path: "age",
				label: "age",
				dataType: "String"
			}
		]);

		return this.oTable._fullyInitialized().then(function() {
			var oSortConditions = {
				sorters: [
					{name: "name", descending: true}
				]
			};
			var aInnerColumns = this.oTable._oTable.getColumns();

			this.oTable.setSortConditions(oSortConditions);
			this.oTable.rebind();

			assert.equal(aInnerColumns[0].getSorted(), true);
			assert.equal(aInnerColumns[0].getSortOrder(), "Descending");
			assert.equal(aInnerColumns[1].getSorted(), false);
		}.bind(this));
	});

	QUnit.test("sort indicator is set correctly at the inner mobile table columns", function(assert) {
		this.oTable.setType("ResponsiveTable");
		this.oTable.addColumn(new Column({
			template: new Text(),
			propertyKey: "name"
		}));

		this.oTable.addColumn(new Column({
			template: new Text(),
			propertyKey: "age"
		}));

		TableQUnitUtils.stubPropertyInfos(this.oTable, [
			{
				name: "name",
				path: "name",
				label: "name",
				dataType: "String"
			},
			{
				name: "age",
				path: "age",
				label: "age",
				dataType: "String"
			}
		]);

		return this.oTable._fullyInitialized().then(function() {
			var aInnerColumns = this.oTable._oTable.getColumns();

			this.oTable.setSortConditions({
				sorters: [
					{name: "age", descending: false}
				]
			});
			this.oTable.setGroupConditions({
				groupLevels: [
					{name: "name"}
				]
			});
			this.oTable.rebind();

			assert.equal(aInnerColumns[0].getSortIndicator(), "None");
			assert.equal(aInnerColumns[1].getSortIndicator(), "Ascending");
		}.bind(this));
	});

	QUnit.test("Sort Change triggered", function(assert) {
		var oTable = this.oTable;
		var done = assert.async();

		this.oTable.setP13nMode(["Sort"]);
		this.oTable.addColumn(new Column({
			template: new Text(),
			propertyKey: "name"
		}));
		this.oTable.addColumn(new Column({
			template: new Text(),
			propertyKey: "age"
		}));

		TableQUnitUtils.stubPropertyInfos(this.oTable, [{
			name: "name",
			label: "name",
			dataType: "String"
		}, {
			name: "age",
			label: "age",
			dataType: "String"
		}]);

		this.oTable.initialized().then(function() {
			oTable.setSortConditions({
				sorters: [
					{name: "name", descending: true}
				]
			});
		}).then(function () {

			this.oTable.getEngine().initAdaptation(this.oTable, "Sort").then(function() {
				var oTestModificationHandler = TestModificationHandler.getInstance();
				oTestModificationHandler.processChanges = function(aChanges) {
					assert.equal(aChanges.length, 2);
					assert.equal(aChanges[0].changeSpecificData.changeType, "removeSort");
					assert.equal(aChanges[0].changeSpecificData.content.name, "name");
					assert.equal(aChanges[0].changeSpecificData.content.descending, true);
					assert.equal(aChanges[1].changeSpecificData.changeType, "addSort");
					assert.equal(aChanges[1].changeSpecificData.content.name, "name");
					assert.equal(aChanges[1].changeSpecificData.content.descending, false);
					done();
				};
				this.oTable.getEngine()._setModificationHandler(this.oTable, oTestModificationHandler);

				PersonalizationUtils.createSortChange(oTable, {
					property: "name",
					sortOrder: "Ascending"
				});

			}.bind(this));

		}.bind(this));
	});

	QUnit.test("Set filter conditions", function(assert) {
		var oFilterConditions = {
			name: [
				{
					isEmpty: null,
					operator: "EQ",
					validated: "NotValidated",
					values: ["test"]
				}
			]
		};

		this.oTable.setFilterConditions(oFilterConditions);
		assert.deepEqual(this.oTable.getFilterConditions(), oFilterConditions, "Filter conditions set");

		this.oTable.setFilterConditions(null);
		assert.deepEqual(this.oTable.getFilterConditions(), {}, "Filter conditions removed");
	});

	QUnit.test("setThreshold", function(assert) {
		var done = assert.async();
		var setThresholdSpy = sinon.spy(this.oTable, "setThreshold");
		var invalidateSpy = sinon.spy(this.oTable, "invalidate");

		this.oTable.setThreshold(10);

		assert.equal(invalidateSpy.callCount, 0);
		assert.ok(setThresholdSpy.returned(this.oTable));

		this.oTable.initialized().then(function() {
			invalidateSpy.reset();
			assert.equal(this.oTable._oTable.getThreshold(), this.oTable.getThreshold());

			this.oTable.setThreshold(-1);
			assert.equal(this.oTable._oTable.getThreshold(), this.oTable._oTable.getMetadata().getProperty("threshold").defaultValue);

			this.oTable.setThreshold(20);
			assert.equal(this.oTable._oTable.getThreshold(), 20);

			this.oTable.setThreshold(undefined);
			assert.equal(this.oTable._oTable.getThreshold(), this.oTable._oTable.getMetadata().getProperty("threshold").defaultValue);
			assert.equal(invalidateSpy.callCount, 0);

			this.oTable.setThreshold(30);
			this.oTable.setType("ResponsiveTable");

			this.oTable.initialized().then(function() {
				invalidateSpy.reset();
				assert.equal(this.oTable._oTable.getGrowingThreshold(), 30);

				this.oTable.setThreshold(-1);
				assert.equal(this.oTable._oTable.getGrowingThreshold(), this.oTable._oTable.getMetadata().getProperty("growingThreshold").defaultValue);

				this.oTable.setThreshold(20);
				assert.equal(this.oTable._oTable.getGrowingThreshold(), 20);

				this.oTable.setThreshold(null);
				assert.equal(this.oTable._oTable.getGrowingThreshold(), this.oTable._oTable.getMetadata().getProperty("growingThreshold").defaultValue);
				assert.equal(invalidateSpy.callCount, 0);

				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("noDataAggregation", function(assert) {
		var done = assert.async();
		var setNoDataSpy = sinon.spy(this.oTable, "setNoData");
		var invalidateSpy = sinon.spy(this.oTable, "invalidate");
		var sNoDataText = "Some No Data text";
		this.oTable.setNoData(sNoDataText);

		assert.equal(invalidateSpy.callCount, 0);
		assert.ok(setNoDataSpy.returned(this.oTable));

		this.oTable.initialized().then(function() {
			invalidateSpy.reset();
			assert.equal(this.oTable._oTable.getNoData(), this.oTable.getNoData());
			assert.equal(this.oTable._oTable.getNoData(), sNoDataText);

			this.oTable.setNoData();
			assert.equal(this.oTable.getNoData(), null);

			this.oTable.setNoData("foo");
			assert.equal(this.oTable._oTable.getNoData(), "foo");

			this.oTable.setNoData(undefined);
			assert.equal(this.oTable._oTable.getNoData(), this.oTable._getNoDataText());
			assert.equal(invalidateSpy.callCount, 0);

			this.oTable.setNoData("test");
			this.oTable.setType("ResponsiveTable");

			this.oTable.initialized().then(function() {
				invalidateSpy.reset();
				assert.equal(this.oTable._oTable.getNoData(), "test");

				this.oTable.setNoData();
				assert.equal(this.oTable._oTable.getNoData(), this.oTable._getNoDataText());

				this.oTable.setNoData("another text");
				assert.equal(this.oTable._oTable.getNoData(), "another text");

				this.oTable.setNoData(null);
				assert.equal(this.oTable._oTable.getNoData(), this.oTable._getNoDataText());
				assert.equal(invalidateSpy.callCount, 0);

				invalidateSpy.resetHistory();

				var oNoData = new IllustratedMessage();
				var fnOpenSettingsDialogStub = sinon.stub(PersonalizationUtils, "openSettingsDialog");
				this.oTable.setNoData(oNoData);

				assert.ok(setNoDataSpy.returned(this.oTable));
				assert.equal(this.oTable._oTable.getNoData(), this.oTable.getNoData());
				assert.notOk(this.oTable._oTable.getNoData().getEnableVerticalResponsiveness());
				assert.ok(this.oTable._oTable.getAggregation("_noColumnsMessage"), "No columns illustration message is added");
				assert.ok(this.oTable._oTable.getAggregation("_noColumnsMessage").getAdditionalContent()[0].isA("sap.m.Button"));
				assert.equal(this.oTable._oTable.getAggregation("_noColumnsMessage").getAdditionalContent()[0].getIcon(), "sap-icon://action-settings");
				assert.notOk(this.oTable._oTable.getAggregation("_noColumnsMessage").getEnableVerticalResponsiveness());

				this.oTable._oTable.getAggregation("_noColumnsMessage").getAdditionalContent()[0].firePress();
				assert.ok(fnOpenSettingsDialogStub.calledOnce);
				assert.ok(fnOpenSettingsDialogStub.calledWith(this.oTable));
				fnOpenSettingsDialogStub.restore();

				oNoData.setTitle("Title");
				oNoData.setDescription("Description");

				assert.equal(this.oTable._oTable.getNoData().getTitle(), this.oTable.getNoData().getTitle());
				assert.equal(this.oTable._oTable.getNoData().getDescription(), this.oTable.getNoData().getDescription());

				this.oTable.setNoData("CustomText");
				assert.equal(this.oTable._oTable.getNoData(), this.oTable.getNoData());
				assert.equal(this.oTable._oTable.getNoData(), "CustomText");

				this.oTable.setNoData(oNoData).setType("Table");
				this.oTable.initialized().then(function() {
					assert.ok(this.oTable._oTable.getNoData().getEnableVerticalResponsiveness());
					assert.ok(this.oTable._oTable.getAggregation("_noColumnsMessage").getEnableVerticalResponsiveness());

					oNoData.destroy();
					assert.notOk(this.oTable.getNoData());
					assert.notOk(this.oTable._oTable.getNoData());

					this.oTable.setNoData("foo");
					assert.equal(this.oTable._oTable.getNoData(), "foo");
					this.oTable._oTable = null;
					this.oTable.destroyNoData();
					assert.equal(this.oTable.getNoData(), null);

					var oNodata = new Text("foo");
					this.oTable.setNoData(oNodata);
					assert.equal(this.oTable.getNoData(), oNodata);
					this.oTable._oTable = null;
					var oDestroyNodataSpy = sinon.spy(this.oTable._vNoData, "destroy");
					this.oTable.destroyNoData();
					assert.ok(oDestroyNodataSpy.calledOnce);
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("Header Visibility and Labelling", function(assert) {
		var done = assert.async();
		this.oTable.initialized().then(function() {
			var oTitle = this.oTable._oTitle;
			assert.ok(oTitle, "Title is available");
			assert.ok(!oTitle.getWidth(), "Title is shown");
			assert.equal(this.oTable._oTitle.getTitleStyle(), "H4", "Title style Property added");
			this.oTable.setHeaderVisible(false);
			assert.equal(oTitle.getWidth(), "0px", "Title is hidden due to width");

			assert.equal(this.oTable._oTable.getAriaLabelledBy().length, 1, "ARIA labelling available for inner table");
			assert.equal(this.oTable._oTable.getAriaLabelledBy()[0], oTitle.getId(), "ARIA labelling for inner table points to title");

			done();
		}.bind(this));
	});

	QUnit.test("Header count display", function(assert) {
		var done = assert.async();
		this.oTable.setShowRowCount(false);

		var iCount = 5;
		var oRowBinding = {
			getCount: function() {
				return iCount;
			}
		};
		var fnGetRowBindingStub = sinon.stub(this.oTable, "getRowBinding");
		fnGetRowBindingStub.returns(oRowBinding);

		this.oTable.initialized().then(function() {
			var oTitle = this.oTable._oTitle;
			var sHeaderText = "myTestHeader";
			this.oTable.setHeader(sHeaderText);
			assert.equal(oTitle.getText(), sHeaderText, "Header text is correct.");

			this.oTable.setShowRowCount(true);

			assert.equal(this.oTable.getHeader(), sHeaderText, "Header Property has not changed");
			assert.equal(oTitle.getText(), sHeaderText + " (5)", "Header has to contain row count");

			iCount = 0;
			this.oTable._updateHeaderText();
			assert.equal(oTitle.getText(), sHeaderText, "Header text does not contain row count when it is 0");

			fnGetRowBindingStub.restore();
			done();
		}.bind(this));
	});

	var fnRearrangeTest = function(iColumnIndexFrom, iColumnIndexTo) {
		return new Promise(function(resolve) {
			this.oTable.addColumn(new Column({
				propertyKey: "col0",
				header: "col0",
				template: new Text({
					text: "{col0}"
				})
			}));
			this.oTable.addColumn(new Column({
				propertyKey: "col1",
				header: "col1",
				template: new Text({
					text: "{col1}"
				})
			}));
			this.oTable.setP13nMode([
				"Column"
			]);

			Core.applyChanges();

			return this.oTable.initialized().then(function() {
				var aColumns = this.oTable.getColumns();
				var aInnerColumns = this.oTable._oTable.getColumns();

				Core.applyChanges();
				sap.ui.require([
					sDelegatePath
				], function(TableDelegate) {

					sinon.stub(this.oTable, "getCurrentState").returns({
						items: [
							{
								"name": aColumns[0].getPropertyKey(),
								"id": aColumns[0].getId(),
								"label": aColumns[0].getHeader()
							}, {
								"name": aColumns[1].getPropertyKey(),
								"id": aColumns[1].getId(),
								"label": aColumns[1].getHeader()
							}
						],
						sorters: []
					});

					triggerDragEvent("dragstart", aInnerColumns[iColumnIndexFrom]);
					triggerDragEvent("dragenter", aInnerColumns[iColumnIndexTo]);
					triggerDragEvent("drop", aInnerColumns[iColumnIndexTo]);

					this.oTable.getCurrentState.restore();
					resolve();

				}.bind(this));
			}.bind(this));
		}.bind(this));

	};

	QUnit.test("rearrange columns", function(assert) {
		var done = assert.async();
		var oCreateColumnReordeChangeSpy = sinon.spy(PersonalizationUtils, "createColumnReorderChange");
		//move from 0 --> 1
		fnRearrangeTest.bind(this)(0, 1).then(function() {
			assert.ok(oCreateColumnReordeChangeSpy.calledOnce);
			assert.ok(oCreateColumnReordeChangeSpy.calledWithExactly(this.oTable, {
				column: this.oTable.getColumns()[0],
				index: 1
			}));
			oCreateColumnReordeChangeSpy.restore();
			done();
		}.bind(this));
	});

	QUnit.test("rearrange columns (similar index) - no change should be created", function(assert) {
		var done = assert.async();
		var fCreateChanges = sinon.spy(this.oTable.getEngine(), "createChanges");
		//move from 0 --> 0
		fnRearrangeTest.bind(this)(0, 0).then(function() {
			assert.ok(fCreateChanges.notCalled);
			fCreateChanges.restore();
			done();
		});
	});

	QUnit.test("rearrange columns - ResponsiveTable", function(assert) {
		var oTable = new Table({
			type: "ResponsiveTable"
		});

		oTable.addColumn(new Column("test1", {
			header: "Test1",
			template: new Text({
				text: "Test1"
			})
		}));

		oTable.addColumn(new Column("test2", {
			header: "Test2",
			template: new Text({
				text: "Test2"
			})
		}));

		oTable.addColumn(new Column("test3", {
			header: "Test3",
			template: new Text({
				text: "Test3"
			})
		}));

		// place the table at the dom
		oTable.placeAt("qunit-fixture");
		Core.applyChanges();

		return oTable.initialized().then(function() {
			var oTest3MDCColumn = oTable.getColumns()[2];
			var oTest3InnerColumn = oTest3MDCColumn.getInnerColumn();
			var oTest3Cell = oTable._oRowTemplate.getCells()[oTable._oTable.indexOfColumn(oTest3InnerColumn)];
			assert.strictEqual(oTest3MDCColumn.getHeader(), "Test3");
			assert.strictEqual(oTable.indexOfColumn(oTest3MDCColumn), 2, "Column index is 2");
			assert.strictEqual(oTest3InnerColumn.getOrder(), 2, "inner column has the correct order");
			assert.strictEqual(oTest3Cell.getText(), "Test3", "correct cell template found");

			// trigger moveColumn - Test3 column is moved to index 0
			oTable.moveColumn(oTest3MDCColumn, 0);
			assert.strictEqual(oTable.indexOfColumn(oTest3MDCColumn), 0, "Test3 column is moved to index 0");
			assert.strictEqual(oTable._oTable.indexOfColumn(oTest3InnerColumn), 0, "Inner table column aggregation also updated");
			assert.strictEqual(oTest3InnerColumn.getOrder(), 0, "Test3 inner column is updated with the correct column order");

			oTable.destroy();
		});
	});

	QUnit.test("Selection - GridTable", function(assert) {
		function selectItem(oRow, bUser, bNoRowSelector) {
			if (bUser) {
				if (bNoRowSelector) {
					jQuery(oRow.getCells()[0].getDomRef()).trigger("tap");
				} else {
					jQuery(oRow.getDomRefs().rowSelector).trigger("tap");
				}
				return;
			}
			oRow.getParent().getPlugins()[0].setSelectedIndex(oRow.getIndex(), true);
		}

		var done = assert.async();

		var oModel = new JSONModel();
		oModel.setData({
			testPath: [
				{}, {}, {}, {}, {}
			]
		});

		this.oTable.destroy();
		this.oTable = new Table({
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath"
				}
			},
			type: new GridTableType()
		});

		this.oTable.setModel(oModel);
		this.oTable.addColumn(new Column({
			header: "test",
			template: new Text()
		}));

		this.oTable.placeAt("qunit-fixture");
		Core.applyChanges();

		this.oTable.initialized().then(function() {
			this.oTable._oTable.attachEventOnce("rowsUpdated", function() {
				var that = this;
				var oSelectionPlugin = this.oTable._oTable.getPlugins()[0];
				var iSelectionCount = -1;
				var bRowPressFired = false;

				this.oTable.attachSelectionChange(function() {
					iSelectionCount = this.oTable.getSelectedContexts().length;
				}.bind(this));

				that.oTable.attachRowPress(function() {
					bRowPressFired = true;
				});

				assert.ok(this.oTable._oTable.isA("sap.ui.table.Table"));
				assert.ok(this.oTable._oTable.isBound("rows"));
				assert.equal(this.oTable._oTable.getBinding().getLength(), 5, "Items available");

				assert.equal(this.oTable.getSelectionMode(), "None", "Selection Mode None - MDCTable");
				assert.equal(this.oTable._oTable.getSelectionMode(), "None", "Selection Mode None - Inner Table");
				Core.applyChanges();

				Promise.resolve().then(function() {
					return new Promise(function(resolve) {
						selectItem(that.oTable._oTable.getRows()[0], false);
						Core.applyChanges();
						assert.equal(iSelectionCount, -1, "No selection change event");
						resolve();
					});
				}).then(function() {
					return new Promise(function(resolve) {
						oSelectionPlugin.attachEventOnce("selectionChange", function() {
							assert.equal(that.oTable.getSelectedContexts().length, 1, "Item selected");
							assert.equal(iSelectionCount, 1, "Selection change event");
							resolve();
						});

						that.oTable.setSelectionMode("Single");
						assert.equal(that.oTable._oTable.getPlugins().length, 1, "Plugin available");
						assert.ok(that.oTable._oTable.getPlugins()[0].isA("sap.ui.table.plugins.MultiSelectionPlugin"), "Plugin is a MultiSelectionPlugin");
						assert.equal(that.oTable.getSelectionMode(), "Single", "Selection Mode Single - MDCTable");
						assert.equal(that.oTable._oTable.getPlugins()[0].getSelectionMode(), "Single", "Selection Mode Single - MultiSelectionPlugin");
						assert.equal(that.oTable._oTable.getSelectionBehavior(), "RowSelector", "Selection Behavior RowSelector");
						Core.applyChanges();

						selectItem(that.oTable._oTable.getRows()[0], true);
					});
				}).then(function() {
					return new Promise(function(resolve) {
						oSelectionPlugin.attachEventOnce("selectionChange", function() {
							assert.equal(iSelectionCount, 1, "Selection change event");
							resolve();
						});
						selectItem(that.oTable._oTable.getRows()[1], true);
					});
				}).then(function() {
					return new Promise(function(resolve) {
						iSelectionCount = -1;
						that.oTable.clearSelection();
						Core.applyChanges();

						assert.equal(iSelectionCount, -1, "No selection change event");
						assert.equal(that.oTable.getSelectedContexts().length, 0, "No Items selected");
						resolve();
					});
				}).then(function() {
					return new Promise(function(resolve) {
						oSelectionPlugin.attachEventOnce("selectionChange", function() {
							assert.equal(that.oTable.getSelectedContexts().length, 1, "Item selected");
							assert.equal(iSelectionCount, 1, "Selection change event");
							resolve();
						});

						that.oTable.setSelectionMode("SingleMaster");
						assert.equal(that.oTable.getSelectionMode(), "SingleMaster", "Selection Mode Single - MDCTable");
						assert.equal(that.oTable._oTable.getPlugins()[0].getSelectionMode(), "Single", "Selection Mode Single - MultiSelectionPlugin");
						assert.equal(that.oTable._oTable.getSelectionBehavior(), "RowOnly", "Selection Behavior RowOnly");
						Core.applyChanges();

						selectItem(that.oTable._oTable.getRows()[0], true, true);
					});
				}).then(function() {
					return new Promise(function(resolve) {
						oSelectionPlugin.attachEventOnce("selectionChange", function() {
							assert.equal(iSelectionCount, 1, "Selection change event");
							assert.ok(!bRowPressFired, "rowPress event not fired");
							resolve();
						});
						selectItem(that.oTable._oTable.getRows()[1], true, true);
					});
				}).then(function() {
					return new Promise(function(resolve) {
						iSelectionCount = -1;
						that.oTable.clearSelection();
						Core.applyChanges();

						assert.equal(iSelectionCount, -1, "No selection change event");
						assert.equal(that.oTable.getSelectedContexts().length, 0, "No Items selected");
						resolve();
					});
				}).then(function() {
					return new Promise(function(resolve) {
						oSelectionPlugin.attachEventOnce("selectionChange", function() {
							assert.equal(that.oTable.getSelectedContexts().length, 1, "Item selected");
							assert.equal(iSelectionCount, 1, "Selection change event");
							resolve();
						});

						that.oTable.setSelectionMode("Multi");
						assert.equal(that.oTable.getSelectionMode(), "Multi", "Selection Mode Multi - MDCTable");
						assert.equal(that.oTable._oTable.getSelectionMode(), "MultiToggle", "Selection Mode Multi - Inner Table");
						assert.equal(that.oTable._oTable.getSelectionBehavior(), "RowSelector", "Selection Behavior RowSelector");
						Core.applyChanges();
						assert.equal(that.oTable._oTable.getPlugins().length, 1, "Plugin available");
						assert.ok(that.oTable._oTable.getPlugins()[0].isA("sap.ui.table.plugins.MultiSelectionPlugin"), "Plugin is a MultiSelectionPlugin");

						selectItem(that.oTable._oTable.getRows()[0], true);
					});
				}).then(function() {
					return new Promise(function(resolve) {
						oSelectionPlugin.attachEventOnce("selectionChange", function() {
							assert.equal(iSelectionCount, 2, "Selection change event");
							resolve();
						});
						selectItem(that.oTable._oTable.getRows()[1], true);
					});
				}).then(function() {
					return new Promise(function(resolve) {
						oSelectionPlugin.attachEventOnce("selectionChange", function() {
							assert.equal(iSelectionCount, 3, "Selection change event");
							resolve();
						});
						selectItem(that.oTable._oTable.getRows()[2], true);
					});
				}).then(function() {
					return new Promise(function(resolve) {
						iSelectionCount = -1;
						that.oTable.clearSelection();
						Core.applyChanges();

						assert.equal(iSelectionCount, -1, "No selection change event");
						assert.equal(that.oTable.getSelectedContexts().length, 0, "No Items selected");
						resolve();
					});
				}).then(function() {
					return new Promise(function(resolve) {
						// Simulate enable notification scenario via selection over limit
						that.oTable.setSelectionMode("Multi");
						var oSelectionPlugin = that.oTable._oTable.getPlugins()[0];

						// reduce limit to force trigger error
						that.oTable.getType().setSelectionLimit(3);

						// check that notification is enabled
						assert.ok(oSelectionPlugin.getEnableNotification(), true);

						oSelectionPlugin.attachEventOnce("selectionChange", function() {
							assert.equal(iSelectionCount, 3, "Selection change event");
							assert.equal(that.oTable.getSelectedContexts().length, 3, "Items selected");
							resolve();
						});
						// select all existing rows
						oSelectionPlugin.setSelectionInterval(0, 4);
					});
				}).then(function() {
					done();
				});
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("Selection - ResponsiveTable", function(assert) {
		function checkSelectionMethods(oTable) {
			var fInnerTablegetSelectedContextsSpy = sinon.spy(oTable._oTable, "getSelectedContexts");
			var fInnerTableclearSelectionSpy = sinon.spy(oTable._oTable, "removeSelections");

			assert.ok(fInnerTablegetSelectedContextsSpy.notCalled);
			oTable.getSelectedContexts();
			assert.ok(fInnerTablegetSelectedContextsSpy.calledOnce);
			assert.ok(fInnerTableclearSelectionSpy.notCalled);
			oTable.clearSelection();
			assert.ok(fInnerTableclearSelectionSpy.calledOnce);

			fInnerTablegetSelectedContextsSpy.restore();
			fInnerTableclearSelectionSpy.restore();
		}

		function selectItem(oItem, bUser) {
			if (bUser) {
				oItem.setSelected(true);
				oItem.informList("Select", true);
				return;
			}
			oItem.getParent().setSelectedItem(oItem, true);
		}

		this.oTable.destroy();
		this.oTable = new Table({
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath"
				}
			}
		});
		this.oTable.setType("ResponsiveTable");
		this.oTable.addColumn(new Column({
			header: "test",
			template: new Text()
		}));
		this.oTable.setModel(new JSONModel({
			testPath: [
				{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}
			]
		}));

		return TableQUnitUtils.waitForBinding(this.oTable).then(function() {
			assert.equal(this.oTable._oTable.getItems().length, 20, "Items available");

			var iSelectionCount = -1;
			this.oTable.attachSelectionChange(function() {
				iSelectionCount = this.oTable.getSelectedContexts().length;
			}.bind(this));

			assert.equal(this.oTable.getSelectionMode(), "None", "Selection Mode None - MDCTable");
			assert.equal(this.oTable._oTable.getMode(), "None", "Selection Mode None - Inner Table");
			Core.applyChanges();
			selectItem(this.oTable._oTable.getItems()[0], false);
			assert.equal(iSelectionCount, -1, "No selection change event");

			this.oTable.setSelectionMode("Multi");
			assert.equal(this.oTable.getSelectionMode(), "Multi", "Selection Mode Multi - MDCTable");
			assert.equal(this.oTable._oTable.getMode(), "MultiSelect", "Selection Mode Multi - Inner Table");
			Core.applyChanges();
			checkSelectionMethods(this.oTable);
			selectItem(this.oTable._oTable.getItems()[0], false);
			assert.equal(this.oTable.getSelectedContexts().length, 1, "Item selected");
			assert.equal(iSelectionCount, -1, "No selection change event");
			selectItem(this.oTable._oTable.getItems()[1], true);
			assert.equal(iSelectionCount, 2, "Selection change event");
			selectItem(this.oTable._oTable.getItems()[2], true);
			assert.equal(iSelectionCount, 3, "Selection change event");

			iSelectionCount = -1;
			this.oTable.clearSelection();
			assert.equal(iSelectionCount, -1, "No selection change event");
			assert.equal(this.oTable.getSelectedContexts().length, 0, "No Items selected");

			this.oTable.setSelectionMode("Single");
			assert.equal(this.oTable.getSelectionMode(), "Single", "Selection Mode Single - MDCTable");
			assert.equal(this.oTable._oTable.getMode(), "SingleSelectLeft", "Selection Mode Single - Inner Table");
			Core.applyChanges();
			checkSelectionMethods(this.oTable);
			selectItem(this.oTable._oTable.getItems()[0], false);
			assert.equal(this.oTable.getSelectedContexts().length, 1, "Item selected");
			assert.equal(iSelectionCount, -1, "No selection change event");
			selectItem(this.oTable._oTable.getItems()[1], true);
			assert.equal(iSelectionCount, 1, "Selection change event");

			iSelectionCount = -1;
			this.oTable.clearSelection();
			assert.equal(iSelectionCount, -1, "No selection change event");
			assert.equal(this.oTable.getSelectedContexts().length, 0, "No Items selected");

			this.oTable.setSelectionMode("SingleMaster");
			assert.equal(this.oTable.getSelectionMode(), "SingleMaster", "Selection Mode SingleMaster - MDCTable");
			assert.equal(this.oTable._oTable.getMode(), "SingleSelectMaster", "Selection Mode SingleSelectMaster - Inner Table");
			Core.applyChanges();
			checkSelectionMethods(this.oTable);
			selectItem(this.oTable._oTable.getItems()[0], false);
			assert.equal(this.oTable.getSelectedContexts().length, 1, "Item selected");
			assert.equal(iSelectionCount, -1, "No selection change event");
			selectItem(this.oTable._oTable.getItems()[1], true);
			assert.equal(iSelectionCount, 1, "Selection change event");

			iSelectionCount = -1;
			this.oTable.clearSelection();
			assert.equal(iSelectionCount, -1, "No selection change event");
			assert.equal(this.oTable.getSelectedContexts().length, 0, "No Items selected");

			return new Promise(function(resolve) {
				var bRowPressFired = false;
				this.oTable.attachRowPress(function() {
					bRowPressFired = true;
				});

				this.oTable._oTable.attachItemPress(function() {
					assert.ok(!bRowPressFired, "rowPress event not fired");
					return resolve();
				});

				this.oTable._oTable.getItems()[1].setType("Active");
				jQuery(this.oTable._oTable.getItems()[1]).trigger("tap");
			}.bind(this)).then(function() {
				return new Promise(function(resolve) {
					// Simulate message scenario via SelectAll
					sap.ui.require([
						"sap/m/MessageToast"
					], function(MessageToast) {
						var fMessageSpy = sinon.stub(MessageToast, "show");
						assert.ok(fMessageSpy.notCalled);

						this.oTable.setSelectionMode("Multi");
						this.oTable._oTable.selectAll(true);

						assert.equal(iSelectionCount, 20, "Selection change event");
						assert.equal(this.oTable.getSelectedContexts().length, 20, "Items selected");
						// message is shown delayed due to a require
						fMessageSpy.callsFake(function() {
							assert.ok(fMessageSpy.calledOnce);
							fMessageSpy.restore();
						});
						resolve();
					}.bind(this));
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("Multiple Tables with different type - Columns added simultaneously to inner tables", function(assert) {
		var oTable2 = new Table({
			type: "ResponsiveTable"
		});

		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			}),
			creationTemplate: new Text({
				text: "Test"
			})
		}));
		this.oTable.insertColumn(new Column({
			header: "Test2",
			template: new Text({
				text: "Test2"
			})
		}), 0);

		oTable2.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			}),
			creationTemplate: new Text({
				text: "Test"
			})
		}));
		oTable2.insertColumn(new Column({
			header: "Test2",
			template: new Text({
				text: "Test2"
			})
		}), 0);

		return Promise.all([
			this.oTable.initialized(), oTable2.initialized()
		]).then(function() {
			this.oTable.addColumn(new Column({
				header: "Test3",
				template: new Text({
					text: "Test3"
				})
			}));

			oTable2.addColumn(new Column({
				header: "Test3",
				template: new Text({
					text: "Test3"
				})
			}));

			var aMDCColumns = this.oTable.getColumns();
			var aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getLabel().getText());
			assert.equal(aInnerColumns[0].isA("sap.ui.table.Column"), true);
			assert.equal(aInnerColumns[0].getLabel().getText(), "Test2", "column0: label is correct");
			assert.equal(aInnerColumns[1].isA("sap.ui.table.Column"), true);
			assert.equal(aInnerColumns[1].getLabel().getText(), "Test", "column1: label is correct");
			assert.equal(aInnerColumns[2].isA("sap.ui.table.Column"), true);
			assert.equal(aInnerColumns[2].getLabel().getText(), "Test3", "column1: label is correct");
			assert.equal(aInnerColumns[0].getTemplate().getText(), "Test2", "column0: template is correct");
			assert.equal(aInnerColumns[0].getTemplate().getWrapping(), false, "column0: template wrapping is disabled");
			assert.equal(aInnerColumns[0].getTemplate().getRenderWhitespace(), false, "column0: template renderWhitespace is disabled");
			assert.equal(aInnerColumns[1].getTemplate().getText(), "Test", "column1: template is correct");
			assert.equal(aInnerColumns[0].getCreationTemplate(), null, "column0: creationTemplate is correct");
			assert.equal(aInnerColumns[1].getCreationTemplate().getText(), "Test", "column1: creationTemplate is correct");
			assert.equal(aInnerColumns[1].getCreationTemplate().getWrapping(), false, "column1: creationTemplate wrapping is disabled");
			assert.equal(aInnerColumns[1].getCreationTemplate().getRenderWhitespace(), false, "column1: creationTemplate renderWhitespace is disabled");

			aMDCColumns = oTable2.getColumns();
			aInnerColumns = oTable2._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getHeader().getText());
			assert.equal(aInnerColumns[0].isA("sap.m.Column"), true);
			assert.equal(aInnerColumns[0].getHeader().getText(), "Test2", "column0: label is correct");
			assert.equal(getInnerColumnLabel(aInnerColumns[0]).getWrapping(), false);
			assert.equal(getInnerColumnLabel(aInnerColumns[0]).getWrappingType(), "Hyphenated");
			assert.equal(aInnerColumns[1].isA("sap.m.Column"), true);
			assert.equal(aInnerColumns[1].getHeader().getText(), "Test", "column1: label is correct");
			assert.equal(getInnerColumnLabel(aInnerColumns[1]).getWrapping(), false);
			assert.equal(getInnerColumnLabel(aInnerColumns[1]).getWrappingType(), "Hyphenated");
			assert.equal(aInnerColumns[2].isA("sap.m.Column"), true);
			assert.equal(aInnerColumns[2].getHeader().getText(), "Test3", "column1: label is correct");
			assert.equal(getInnerColumnLabel(aInnerColumns[2]).getWrapping(), false);
			assert.equal(getInnerColumnLabel(aInnerColumns[2]).getWrappingType(), "Hyphenated");
		}.bind(this));
	});

	QUnit.test("RowPress event test", function(assert) {
		function checkRowPress(bIsMTable, oTable, oRow) {
			var fRowPressSpy = sinon.spy(oTable, "fireRowPress");

			if (bIsMTable) {
				oTable._oTable.fireItemPress({
					listItem: oRow
				});
			} else {
				oTable._oTable.fireCellClick({
					rowBindingContext: oRow.getBindingContext()
				});
			}
			assert.ok(fRowPressSpy.calledOnce);
			fRowPressSpy.restore();
		}

		function checkRowActionPress(oTable, oRow) {
			var oRowAction = oTable._oTable.getRowActionTemplate();
			if (!oRowAction) {
				return false;
			}
			var oRowActionItem = oRowAction.getItems()[0];
			if (!oRowActionItem) {
				return false;
			}

			var fRowPressSpy = sinon.spy(oRowActionItem, "firePress");

			oRowActionItem.firePress({
				item: oRowActionItem,
				row: oRow
			});
			assert.ok(fRowPressSpy.calledOnce);

			fRowPressSpy.restore();
			return true;
		}

		this.oTable.destroy();
		this.oTable = new Table({
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath"
				}
			}
		});
		this.oTable.setType("ResponsiveTable");
		this.oTable.addColumn(new Column({
			header: "test",
			template: new Text()
		}));
		this.oTable.setModel(new JSONModel({
			testPath: [
				{}, {}, {}, {}, {}
			]
		}));

		this.oTable.placeAt("qunit-fixture");
		Core.applyChanges();

		var oTable = this.oTable;

		return this.oTable.initialized().then(function() {
			return new Promise(function(resolve) {
				oTable._oTable.attachEventOnce("updateFinished", resolve);
			});
		}).then(function() {
			checkRowPress(true, oTable, oTable._oTable.getItems()[0]);
			oTable.setType("Table");
			return oTable.initialized();
		}).then(function() {
			return new Promise(function(resolve) {
				oTable._oTable.attachEventOnce("rowsUpdated", resolve);
			});
		}).then(function() {
			checkRowPress(false, oTable, oTable._oTable.getRows()[0]);
			// no row action present
			assert.ok(!checkRowActionPress(oTable));

			var oRowSettings = new RowSettings();
			oRowSettings.addRowAction(new RowActionItem({
				type: "Navigation",
				text: "Navigation",
				visible: true
			}));
			oTable.setRowSettings(oRowSettings);

			// row action triggers same rowPress event
			assert.ok(checkRowActionPress(oTable, oTable._oTable.getRows()[1]));
		});
	});

	QUnit.test("MultiSelectionPlugin", function(assert) {
		this.oTable.setType(new GridTableType());
		return this.oTable.initialized().then(function() {
			var oMultiSelectionPlugin = this.oTable._oTable.getPlugins()[0];
			assert.ok(oMultiSelectionPlugin, "MultiSelectionPlugin is initialized");

			assert.equal(oMultiSelectionPlugin.getLimit(), 200, "default selection limit is correct");
			assert.ok(oMultiSelectionPlugin.getShowHeaderSelector(), "default value showHeaderSelector is correct");
			this.oTable.getType().setSelectionLimit(20);
			this.oTable.getType().setShowHeaderSelector(false);
			assert.equal(oMultiSelectionPlugin.getLimit(), 20, "MultiSelectionPlugin.limit is updated");
			assert.ok(!oMultiSelectionPlugin.getShowHeaderSelector(), "MultiSelectionPlugin.showHeaderSelector is updated");
		}.bind(this));
	});


	QUnit.test("Table with FilterBar", function(assert) {
		var oTable = this.oTable;
		var fBindRowsStub;

		this.oTable.setAutoBindOnInit(false);

		return this.oTable._fullyInitialized().then(function() {
			// simulate table is bound already
			var fStub = sinon.stub(oTable._oTable, "isBound");
			var oFilter = new FilterBar();

			fBindRowsStub = sinon.stub(oTable._oTable, "bindRows");
			fStub.withArgs("rows").returns(true);
			oTable.setFilter(oFilter);

			assert.strictEqual(oTable._oTable.getShowOverlay(), false);
			assert.ok(fBindRowsStub.notCalled);

			// simulate filtersChanged event
			oFilter.fireFiltersChanged();

			assert.strictEqual(oTable._oTable.getShowOverlay(), false);
			assert.ok(fBindRowsStub.notCalled);

			// simulate filtersChanged event
			oFilter.fireFiltersChanged({conditionsBased: false});

			assert.strictEqual(oTable._oTable.getShowOverlay(), false);
			assert.ok(fBindRowsStub.notCalled);

			// simulate filtersChanged event
			oFilter.fireFiltersChanged({conditionsBased: true});

			assert.strictEqual(oTable._oTable.getShowOverlay(), true);
			assert.ok(fBindRowsStub.notCalled);

			// simulate search event
			oFilter.fireSearch();
		}).then(function() {
			assert.strictEqual(oTable._oTable.getShowOverlay(), false);
			assert.ok(fBindRowsStub.calledOnce);

			// Test with empty
			oTable.setFilter();
			assert.ok(!oTable.getFilter());

			// Test with invalid control
			assert.throws(function() {
				oTable.setFilter(new Control());
			}, function(oError) {
				return oError instanceof Error && oError.message.indexOf("sap.ui.mdc.IFilter") > 0;
			});
			assert.ok(!oTable.getFilter());
		});
	});

	QUnit.test("noDataText - Table with FilterBar and not bound", function(assert) {
		this.oTable.setAutoBindOnInit(false);

		return this.oTable.initialized().then(function() {
			this.oTable.setFilter(new FilterBar());
			return wait(0);
		}.bind(this)).then(function() {
			var oRb = Core.getLibraryResourceBundle("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData(), oRb.getText("table.NO_DATA_WITH_FILTERBAR"),
				"'To start, set the relevant filters.' is displayed");
		}.bind(this));
	});

	QUnit.test("noData aggregation - Table with FilterBar and not bound", function(assert) {
		this.oTable.setAutoBindOnInit(false);
		this.oTable.setNoData(new IllustratedMessage());

		return this.oTable.initialized().then(function() {
			this.oTable.setFilter(new FilterBar());
			return wait(0);
		}.bind(this)).then(function() {
			var oRb = Core.getLibraryResourceBundle("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData().getTitle(), oRb.getText("table.NO_DATA_WITH_FILTERBAR"),
				"'To start, set the relevant filters.' is displayed");
			assert.strictEqual(this.oTable._oTable.getNoData().getIllustrationType(), IllustratedMessageType.SearchEarth);
		}.bind(this));
	});

	QUnit.test("noDataText - Table without FilterBar and not bound", function(assert) {
		this.oTable.setAutoBindOnInit(false);

		return this.oTable.initialized().then(function() {
			var oRb = Core.getLibraryResourceBundle("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData(), oRb.getText("table.NO_DATA"), "'No data available' is displayed");
		}.bind(this));
	});

	QUnit.test("noDataAggregation - Table without FilterBar and not bound", function(assert) {
		this.oTable.setAutoBindOnInit(false);
		this.oTable.setNoData(new IllustratedMessage());

		return this.oTable.initialized().then(function() {
			var oRb = Core.getLibraryResourceBundle("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData().getTitle(), oRb.getText("table.NO_DATA"), "'No data available' is displayed");
			assert.strictEqual(this.oTable._oTable.getNoData().getIllustrationType(), IllustratedMessageType.EmptyList);
		}.bind(this));
	});

	QUnit.test("noDataText - Table with FilterBar without any filters and the table is bound", function(assert) {
		this.oTable.setFilter(new FilterBar());

		return TableQUnitUtils.waitForBindingInfo(this.oTable).then(function() {
			var oRb = Core.getLibraryResourceBundle("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData(), oRb.getText("table.NO_DATA"),
				"'No data available' is displayed");
		}.bind(this));
	});

	QUnit.test("noDataAggregation - Table with FilterBar without any filters and the table is bound", function(assert) {
		this.oTable.setNoData(new IllustratedMessage());
		this.oTable.setFilter(new FilterBar());

		return TableQUnitUtils.waitForBindingInfo(this.oTable).then(function() {
			var oRb = Core.getLibraryResourceBundle("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData().getTitle(), oRb.getText("table.NO_DATA"),
				"'No data available' is displayed");
			assert.strictEqual(this.oTable._oTable.getNoData().getIllustrationType(), IllustratedMessageType.NoEntries);
		}.bind(this));
	});

	QUnit.test("noDataText - Table with FilterBar with filters and the table is bound", function(assert) {
		var oFilterBar = new FilterBar("FB1");

		sinon.stub(oFilterBar, "getConditions").returns({key: [{operator: "EQ", values: ["Pr"]}]});
		this.oTable.setFilter(oFilterBar);

		return TableQUnitUtils.waitForBindingInfo(this.oTable).then(function() {
			var oRb = Core.getLibraryResourceBundle("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData(), oRb.getText("table.NO_RESULTS"),
				"'No data available. Try adjusting the filter settings.' is displayed");
		}.bind(this));
	});

	QUnit.test("noDataAggregation - Table with FilterBar with filters and the table is bound", function(assert) {
		var oFilterBar = new FilterBar("FB2");

		sinon.stub(oFilterBar, "getConditions").returns({key: [{operator: "EQ", values: ["Pr"]}]});
		this.oTable.setFilter(oFilterBar);
		this.oTable.setNoData(new IllustratedMessage());

		return TableQUnitUtils.waitForBindingInfo(this.oTable).then(function() {
			var oRb = Core.getLibraryResourceBundle("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData().getTitle(), oRb.getText("table.NO_RESULTS_TITLE"),
				"'No data available.' is displayed");
			assert.strictEqual(this.oTable._oTable.getNoData().getDescription(), oRb.getText("table.NO_RESULTS_DESCRIPTION"),
				"'Try adjusting the filter settings.' is displayed");
			assert.strictEqual(this.oTable._oTable.getNoData().getIllustrationType(), IllustratedMessageType.NoFilterResults);
		}.bind(this));
	});

	QUnit.test("noDataText - Table without FilterBar but with internal filters and the table is bound", function(assert) {
		this.oTable.setFilterConditions({ key: [{ operator: "EQ", values: ["Pr"] }] });

		return TableQUnitUtils.waitForBindingInfo(this.oTable).then(function() {
			var oRb = Core.getLibraryResourceBundle("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData(), oRb.getText("table.NO_DATA"), "'No data available'");
		}.bind(this));
	});

	QUnit.test("noDataAggregation - Table without FilterBar but with internal filters and the table is bound", function(assert) {
		this.oTable.setNoData(new IllustratedMessage());
		this.oTable.setFilterConditions({ key: [{ operator: "EQ", values: ["Pr"] }] });

		return TableQUnitUtils.waitForBindingInfo(this.oTable).then(function() {
			var oRb = Core.getLibraryResourceBundle("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData().getTitle(), oRb.getText("table.NO_DATA"), "'No data available'");
		}.bind(this));
	});

	QUnit.test("noDataText - Table without FilterBar and internal filters and the table is bound", function(assert) {
		return TableQUnitUtils.waitForBindingInfo(this.oTable).then(function() {
			var oRb = Core.getLibraryResourceBundle("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData(), oRb.getText("table.NO_DATA"), "'No data available' is displayed");
		}.bind(this));
	});

	QUnit.test("noDataAggregation - Table without FilterBar and internal filters and the table is bound", function(assert) {
		this.oTable.setNoData(new IllustratedMessage());

		return TableQUnitUtils.waitForBindingInfo(this.oTable).then(function() {
			var oRb = Core.getLibraryResourceBundle("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData().getTitle(), oRb.getText("table.NO_DATA"), "'No data available' is displayed");
		}.bind(this));
	});

	QUnit.test("noDataText - Table with custom external filter control without filters, and the table is bound", function(assert) {
		this.oTable.setFilter(new CustomFilterControl());

		return TableQUnitUtils.waitForBindingInfo(this.oTable).then(function() {
			var oRb = Core.getLibraryResourceBundle("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData(), oRb.getText("table.NO_DATA"), "'No data available' is displayed");
		}.bind(this));
	});

	QUnit.test("noDataAggregation - Table with custom external filter control without filters, and the table is bound", function(assert) {
		this.oTable.setFilter(new CustomFilterControl());
		this.oTable.setNoData(new IllustratedMessage());

		return TableQUnitUtils.waitForBindingInfo(this.oTable).then(function() {
			var oRb = Core.getLibraryResourceBundle("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData().getTitle(), oRb.getText("table.NO_DATA"),
				"'No data available' is displayed");
			assert.strictEqual(this.oTable._oTable.getNoData().getTitle(), oRb.getText("table.NO_DATA"),
				"'No data available' is displayed");
		}.bind(this));
	});

	QUnit.test("noDataText - Table with custom external filter control with search string, and the table is bound", function(assert) {
		this.oTable.setFilter(new CustomFilterControl({customSearch: "found something?"}));

		return TableQUnitUtils.waitForBindingInfo(this.oTable).then(function() {
			var oRb = Core.getLibraryResourceBundle("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData(), oRb.getText("table.NO_RESULTS"),
				"'No data available. Try adjusting the filter settings.' is displayed");
		}.bind(this));
	});

	QUnit.test("noDataAggregation - Table with custom external filter control with search string, and the table is bound", function(assert) {
		this.oTable.setFilter(new CustomFilterControl({customSearch: "found something?"}));
		this.oTable.setNoData(new IllustratedMessage());

		return TableQUnitUtils.waitForBindingInfo(this.oTable).then(function() {
			var oRb = Core.getLibraryResourceBundle("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData().getTitle(), oRb.getText("table.NO_RESULTS_TITLE"),
				"'No data available.' is displayed");
			assert.strictEqual(this.oTable._oTable.getNoData().getDescription(), oRb.getText("table.NO_RESULTS_DESCRIPTION"),
				"'Try adjusting the filter settings.' is displayed");
		}.bind(this));
	});

	QUnit.test("noDataAggregation CustomText - Table with custom external filter control with search string, and the table is bound", function(assert) {
		this.oTable.setFilter(new CustomFilterControl({customSearch: "found something?"}));
		this.oTable.setNoData(new IllustratedMessage({title: "NoData Title", description: "NoData Description"}));

		return TableQUnitUtils.waitForBindingInfo(this.oTable).then(function() {
			assert.strictEqual(this.oTable._oTable.getNoData().getTitle(), "NoData Title");
			assert.strictEqual(this.oTable._oTable.getNoData().getDescription(), "NoData Description");
		}.bind(this));
	});

	QUnit.test("Table with VariantManagement and QuickFilter", function(assert) {
		var done = assert.async();

		this.oTable.initialized().then(function() {
			sap.ui.require([
				"sap/ui/fl/variants/VariantManagement", "sap/m/SegmentedButton", "sap/ui/core/Control"
			], function(VariantManagement, SegmentedButton, Control) {
				// Test with VariantManagement
				var oVariant = new VariantManagement(),
					oVariant2 = new VariantManagement(),
					oQuickFilter = new SegmentedButton(),
					oQuickFilter2 = new SegmentedButton();

				// Test Variant exists on toolbar
				this.oTable.setVariant(oVariant);
				assert.strictEqual(this.oTable.getVariant(), oVariant);
				assert.deepEqual(this.oTable._oToolbar.getBetween(), [oVariant]);

				// Test with setting same Variant on toolbar
				this.oTable.setVariant(oVariant);
				assert.strictEqual(this.oTable.getVariant(), oVariant);
				assert.deepEqual(this.oTable._oToolbar.getBetween(), [oVariant]);

				// Test Variant has been changed on toolbar
				this.oTable.setVariant(oVariant2);
				assert.strictEqual(this.oTable.getVariant(), oVariant2);
				assert.deepEqual(this.oTable._oToolbar.getBetween(), [oVariant2]);

				// Test with empty Variant
				this.oTable.setVariant(oVariant2);
				this.oTable.setVariant();
				assert.ok(!this.oTable.getVariant());
				assert.deepEqual(this.oTable._oToolbar.getBetween(), []);

				// Test with VariantManagement and QuickFilter
				this.oTable.setVariant(oVariant);
				this.oTable.setQuickFilter(oQuickFilter);
				assert.strictEqual(this.oTable.getQuickFilter(), oQuickFilter);
				assert.deepEqual(this.oTable._oToolbar.getBetween(), [oVariant, oQuickFilter]);

				// Test with only QuickFilter
				this.oTable.setVariant();
				assert.ok(!this.oTable.getVariant());
				assert.deepEqual(this.oTable._oToolbar.getBetween(), [oQuickFilter]);

				// Test with empty
				this.oTable.setQuickFilter();
				assert.ok(!this.oTable.getQuickFilter());
				assert.deepEqual(this.oTable._oToolbar.getBetween(), []);

				// Test with different QuickFilters
				this.oTable.setVariant(oVariant);
				this.oTable.setQuickFilter(oQuickFilter);
				this.oTable.setQuickFilter(oQuickFilter2);
				assert.strictEqual(this.oTable.getQuickFilter(), oQuickFilter2);
				assert.deepEqual(this.oTable._oToolbar.getBetween(), [oVariant, oQuickFilter2]);

				// Test destroying QuickFilter
				this.oTable.setQuickFilter(oQuickFilter);
				this.oTable.destroyQuickFilter();
				assert.ok(!this.oTable.getQuickFilter());
				assert.ok(oQuickFilter.bIsDestroyed);
				assert.deepEqual(this.oTable._oToolbar.getBetween(), [oVariant]);

				// Test destroying Variant
				this.oTable.destroyVariant();
				assert.ok(!this.oTable.getVariant());
				assert.ok(oVariant.bIsDestroyed);
				assert.deepEqual(this.oTable._oToolbar.getBetween(), []);

				// Test with invalid control for Variant
				assert.throws(function() {
					this.oTable.setVariant(new Control());
				}.bind(this), function(oError) {
					return oError instanceof Error && oError.message.indexOf("variant") > 0;
				});
				assert.ok(!this.oTable.getVariant());

				// Cleanup
				oVariant2.destroy();
				oQuickFilter2.destroy();

				// Finish
				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("Table busy state", function(assert) {
		return this.oTable.initialized().then(function() {
			assert.notOk(this.oTable.getBusy(), "sap.ui.mdc.Table busy state is false");
			assert.notOk(this.oTable._oTable.getBusy(), "Inner table busy state is false");

			this.oTable.setBusy(true);
			assert.ok(this.oTable.getBusy(), "sap.ui.mdc.Table busy state is true");
			assert.ok(this.oTable._oTable.getBusy(), "Inner table busy state is true");

			this.oTable._oTable.setBusy(false);
			assert.ok(this.oTable.getBusy(), "sap.ui.mdc.Table busy state remains true");
			assert.notOk(this.oTable._oTable.getBusy(), "Inner table busy state changed independently");

			this.oTable.setBusy(false);
			assert.notOk(this.oTable.getBusy(), "sap.ui.mdc.Table busy state is false");
			assert.notOk(this.oTable._oTable.getBusy(), "Inner table busy state is false");

			assert.strictEqual(this.oTable.getBusyIndicatorDelay(), 100, "sap.ui.mdc.Table - Default Busy Indicator Delay");
			assert.strictEqual(this.oTable._oTable.getBusyIndicatorDelay(), 100, "Inner table - Default Busy Indicator Delay");
			this.oTable.setBusyIndicatorDelay(200);
			assert.strictEqual(this.oTable.getBusyIndicatorDelay(), 200, "sap.ui.mdc.Table - Custom Busy Indicator Delay");
			assert.strictEqual(this.oTable._oTable.getBusyIndicatorDelay(), 200, "Inner table - Custom Busy Indicator Delay");
		}.bind(this));
	});

	QUnit.test("copyProvider", function(assert) {
		var oCopyProvider = new CopyProvider();
		this.oTable.setCopyProvider(oCopyProvider);

		return this.oTable._fullyInitialized().then(function() {
			assert.equal(this.oTable.getCopyProviderPluginOwner(), this.oTable._oTable, "The inner table is set as plugin owner for CopyProvider");

			var oColumn = new Column();
			var fnGetColumnClipboardSettingsSpy = sinon.spy(this.oTable.getPropertyHelper(), "getColumnClipboardSettings");
			this.oTable.getColumnClipboardSettings(oColumn);
			assert.ok(fnGetColumnClipboardSettingsSpy.calledWith(oColumn), "Table#getColumnClipboardSettings uses PropertyHelper#getColumnClipboardSettings");
			fnGetColumnClipboardSettingsSpy.restore();

			var oCopyButton = Core.byId(this.oTable.getId() + "-copy");
			assert.ok(oCopyButton, "Copy button is created");
			assert.equal(this.oTable._oToolbar.indexOfEnd(oCopyButton), 0, "Copy button is added to the toolbar, as a first element of the end aggreagtion");
		}.bind(this));
	});

	QUnit.test("showPasteButton", function(assert) {
		assert.notOk(this.oTable.getShowPasteButton(), "default value of showPasteButton=false");

		this.oTable.setShowPasteButton(true);
		assert.ok(this.oTable.getShowPasteButton(), "showPasteButton=true");

		return this.oTable.initialized().then(function() {
			assert.ok(this.oTable._oPasteButton, "Paste button created");
			assert.equal(FESRHelper.getSemanticStepname(this.oTable._oPasteButton, "press"), "mdc:tbl:paste", "Correct FESR StepName");

			Core.applyChanges();
			assert.ok(this.oTable._oPasteButton.getDomRef(), "Paste button is visible");

			Promise.resolve().then(function() {
				assert.ok(this.oTable._oPasteButton.getDependents()[0].isA("sap.m.plugins.PasteProvider"), "PasteProvider plugin is added to the paste button");
				assert.equal(this.oTable._oPasteButton.getDependents()[0].getPasteFor(), this.getId() + "-innerTable", "PasteProvider plugin is added to the paste button");

				this.oTable.setShowPasteButton();
				assert.notOk(this.oTable._oPasteButton.getVisible(), "Paste button is not visible");

				this.oTable.setShowPasteButton(true);
				assert.ok(this.oTable._oPasteButton.getVisible(), "Paste button is now visible");
			}.bind(this));

		}.bind(this));
	});

	QUnit.test("enablePaste with ShowPasteButton set to true", function(assert) {
		this.oTable.setShowPasteButton(true);
		var fPasteHandler = function(oEvent) {
			assert.ok(this.getEnablePaste(), "Paste event fired");
		};

		this.oTable.attachPaste(fPasteHandler);

		assert.ok(this.oTable.getEnablePaste(), "default value of enablePaste=true");
		return this.oTable.initialized().then(function() {
			assert.ok(this.oTable._oPasteButton.getVisible(), "pasteButton is visible");
			this.oTable._oTable.firePaste({data: [["111", "222", "333"], ["aaa", "bbb", "ccc"]]});
			this.oTable.setEnablePaste(false);
			assert.notOk(this.oTable.getEnablePaste(), "enablePaste=false");
			assert.notOk(this.oTable._oPasteButton.getEnabled(), "Paste button disabled");
			this.oTable._oTable.firePaste({data: [["111", "222", "333"], ["aaa", "bbb", "ccc"]]});

			this.oTable.setEnablePaste(true);
			assert.ok(this.oTable.getEnablePaste(), "enablePaste=true");
			assert.ok(this.oTable._oPasteButton.getEnabled(), "pasteButton enabled");
		}.bind(this));
	});


	QUnit.test("enablePaste with ShowPasteButton set to false", function(assert) {
		this.oTable.setShowPasteButton(false);
		assert.ok(this.oTable.getEnablePaste(), "default value of enablePaste=true");
		return this.oTable.initialized().then(function() {

			this.oTable.setEnablePaste(false);
			assert.notOk(this.oTable.getEnablePaste(), "enablePaste=false");
			assert.notOk(this.oTable._oPasteButton, "Paste button not created");

			this.oTable.setShowPasteButton(true);
			assert.notOk(this.oTable.getEnablePaste(), "enablePaste=false");
			assert.notOk(this.oTable._oPasteButton.getEnabled(), "Paste button disabled");

			this.oTable.setEnablePaste(true);
			assert.ok(this.oTable.getEnablePaste(), "enablePaste=true");
			assert.ok(this.oTable._oPasteButton.getEnabled(), "Paste button enabled");
		}.bind(this));
	});

	QUnit.test("Export button handling on initialization when export is disabled", function(assert) {
		var oTable = this.oTable;

		assert.notOk(oTable._oExportButton, "Export button does not exist before table initialization");

		return oTable.initialized().then(function() {
			assert.notOk(oTable._oExportButton, "Export button does not exist after table initialization");
		});
	});

	QUnit.test("Export button handling on initialization when export is enabled", function(assert) {
		var oTable = this.oTable;

		oTable.setEnableExport(true);
		assert.notOk(oTable._oExportButton, "Export button does not exist before table initialization");

		return oTable.initialized().then(function() {
			assert.ok(oTable._oExportButton, "Export button exists after initialization");
			assert.ok(oTable._oExportButton.isA("sap.m.MenuButton"), "Is a sap.m.MenuButton");
			assert.strictEqual(oTable._oExportButton.getParent(), oTable._oToolbar, "Is child of the toolbar");
			assert.ok(oTable._oExportButton.getVisible(), "Is visible");

			assert.equal(FESRHelper.getSemanticStepname(oTable._oExportButton, "defaultAction"), "OI:QE", "Correct FESR StepName");
			var oMenu = oTable._oExportButton.getMenu();
			assert.equal(oMenu.getItems().length, 2, "Export MenuButton has 2 actions");
			assert.equal(FESRHelper.getSemanticStepname(oMenu.getItems()[0], "press"), "OI:QE", "Correct FESR StepName - Menu Item 1");
			assert.equal(FESRHelper.getSemanticStepname(oMenu.getItems()[1], "press"), "OI:EXP:SETTINGS", "Correct FESR StepName - Menu Item 2");
		});
	});

	QUnit.test("Export button handling on initialization when export is enabled but not supported by the delegate", function(assert) {
		var oTable = this.oTable;

		oTable.setEnableExport(true);

		return oTable.awaitControlDelegate().then(function(oDelegate) {
			sinon.stub(oDelegate, "getSupportedFeatures").returns({ "export": false });
			return oTable.initialized();
		}).then(function() {
			assert.notOk(oTable._oExportButton, "Export button does not exist after table initialization");
			oTable.getControlDelegate().getSupportedFeatures.restore();
		});
	});

	QUnit.test("Export button handling when enabling/disabling export after initialization", function(assert) {
		var oTable = this.oTable;

		return oTable.initialized().then(function() {
			oTable.setEnableExport(true);
			assert.ok(oTable._oExportButton, "Enabled: Export button exists");
			assert.strictEqual(oTable._oExportButton.getParent(), oTable._oToolbar, "Enabled: Is child of the toolbar");
			assert.ok(oTable._oExportButton.getVisible(), "Enabled: Is visible");

			oTable.setEnableExport(false);
			assert.strictEqual(oTable._oExportButton.getParent(), oTable._oToolbar, "Disabled: Is child of the toolbar");
			assert.notOk(oTable._oExportButton.getVisible(), "Disabled: Is invisible");

			oTable.setEnableExport(true);
			assert.strictEqual(oTable._oExportButton.getParent(), oTable._oToolbar, "Enabled: Is child of the toolbar");
			assert.ok(oTable._oExportButton.getVisible(), "Enabled: Is visible");
		});
	});

	QUnit.test("Export button handling when enabling export after initialization but not supported by the delegate", function(assert) {
		var oTable = this.oTable;


		return oTable.awaitControlDelegate().then(function(oDelegate) {
			sinon.stub(oDelegate, "getSupportedFeatures").returns({ "export": false });
			return oTable.initialized();
		}).then(function() {
			oTable.setEnableExport(true);
			assert.notOk(oTable._oExportButton, "Export button does not exist");
			oTable.getControlDelegate().getSupportedFeatures.restore();
		});
	});

	QUnit.test("Export button handling when changing the table type", function(assert) {
		var oTable = this.oTable;
		var oExportButton;

		oTable.setEnableExport(true);

		return oTable.awaitControlDelegate().then(function(oDelegate) {
			sinon.stub(oDelegate, "getSupportedFeatures").returns({ "export": false });
			return oTable.initialized();
		}).then(function() {
			oTable.getControlDelegate().getSupportedFeatures.returns({ "export": true });
			oTable.setType(TableType.ResponsiveTable);
			return oTable.initialized();
		}).then(function() {
			oExportButton = oTable._oExportButton;
			assert.ok(oTable._oExportButton,
				"Export button exists after changing to a type for which the delegate does support export");
			assert.strictEqual(oTable._oExportButton.getParent(), oTable._oToolbar, "Export button is a child of the toolbar");
			assert.ok(oTable._oExportButton.getVisible(), "Export button is visible");

			oTable.getControlDelegate().getSupportedFeatures.returns({ "export": false });
			oTable.setType(TableType.Table);
			return oTable.initialized();
		}).then(function() {
			assert.notOk(oTable._oExportButton.getVisible(),
				"Export button is invisible after changing to a type for which the delegate does not support export");
			assert.strictEqual(oTable._oExportButton.getParent(), oTable._oToolbar, "Export button is a child of the toolbar");
			assert.equal(oExportButton, oTable._oExportButton, "Same button instance is used");

			oTable.getControlDelegate().getSupportedFeatures.returns({ "export": true });
			oTable.setType(TableType.ResponsiveTable);
			return oTable.initialized();
		}).then(function() {
			assert.ok(oTable._oExportButton.getVisible(),
				"Export button is visible after changing to a type for which the delegate supports export");
			assert.strictEqual(oTable._oExportButton.getParent(), oTable._oToolbar, "Export button is a child of the toolbar");
			assert.equal(oExportButton, oTable._oExportButton, "Same button instance is used");
		}).finally(function() {
			oTable.getControlDelegate().getSupportedFeatures.restore();
		});
	});

	QUnit.test("Export button initialization with toolbar actions", function(assert) {
		var oTable = this.oTable;

		// Aggregation forwarding will cause the creation of the ActionToolbar. The export button will not be added at this point, because
		// the delegate is not yet loaded. The button has to be added to the toolbar when the rest of the content is created.
		oTable.addAction(new Text());
		oTable.setEnableExport(true);

		return oTable.awaitControlDelegate().then(function(oDelegate) {
			sinon.stub(oDelegate, "getSupportedFeatures").returns({ "export": true });
			return oTable.initialized();
		}).then(function() {
			assert.ok(oTable._oExportButton, "Export button exists after initialization with toolbar actions");
			assert.strictEqual(oTable._oExportButton.getParent(), oTable._oToolbar, "Export button is a child of the toolbar");
			assert.ok(oTable._oExportButton.isA("sap.m.OverflowToolbarMenuButton"), "Export button is an OverflowToolbarMenuButton");
			assert.ok(oTable._oExportButton.getVisible(), "Export button is visible");
		}).finally(function() {
			oTable.getControlDelegate().getSupportedFeatures.restore();
		});
	});

	QUnit.test("trigger export - no visible columns", function(assert) {
		var done = assert.async();

		this.oTable.setEnableExport(true);
		Core.applyChanges();

		this.oTable.initialized().then(function() {
			// Initilaized has to be used again as the binding itself is done when the initialized Promise is fired
			this.oTable.initialized().then(function() {
				assert.strictEqual(this.oTable.getColumns().length, 0, "No columns in the table");
				var fnOnExport = sinon.spy(this.oTable, "_onExport");
				sap.ui.require([
					"sap/m/MessageBox"
				], function(MessageBox) {
					sinon.stub(MessageBox, "error").callsFake(function() {
						assert.ok(fnOnExport.calledOnce, "_onExport called");
						assert.ok(MessageBox.error.calledOnce);
						MessageBox.error.restore();
						done();
					});
					this.oTable._oExportButton.fireDefaultAction();
					Core.applyChanges();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("test Export as... via keyboard shortcut", function(assert) {
		return this.oTable.initialized().then(function() {
			sinon.stub(this.oTable, "_onExport");

			this.oTable.setEnableExport(true);
			Core.applyChanges();

			assert.notOk(this.oTable.getRowBinding(), "no binding so no binding length");
			assert.notOk(this.oTable._oExportButton.getEnabled(), "Button is disabled as binding length is 0");

			// trigger CTRL + SHIFT + E keyboard shortcut
			QUtils.triggerKeydown(this.oTable.getDomRef(), KeyCodes.E, true, false, true);
			assert.ok(this.oTable._onExport.notCalled, "Export button is disabled: Export not triggered");

			this.oTable._oExportButton.setEnabled(true);
			Core.applyChanges();

			// trigger CTRL + SHIFT + E keyboard shortcut
			QUtils.triggerKeydown(this.oTable.getDomRef(), KeyCodes.E, true, false, true);
			assert.ok(this.oTable._onExport.calledWith(true), "Export settings dialog opened");

			sinon.stub(this.oTable.getControlDelegate(), "getSupportedFeatures").returns({ "export": false });
			this.oTable.setType(TableType.ResponsiveTable);
			return this.oTable.initialized();
		}.bind(this)).then(function() {
			this.oTable._onExport.resetHistory();
			QUtils.triggerKeydown(this.oTable.getDomRef(), KeyCodes.E, true, false, true);
			assert.ok(this.oTable._onExport.notCalled, "Export is not supported by delegate: Export not triggered");
			this.oTable.getControlDelegate().getSupportedFeatures.restore();
		}.bind(this));
	});

	QUnit.test("test attachBeforeExport", function(assert) {
		var done, fnSetLabel, fnSetType, oFakeExportHandlerEvent, oTable;

		done = assert.async();
		oTable = this.oTable;
		fnSetLabel = sinon.stub();
		fnSetType = sinon.stub();
		oFakeExportHandlerEvent = sinon.createStubInstance(Event);
		oFakeExportHandlerEvent.getParameter.withArgs("exportSettings").returns({});
		oFakeExportHandlerEvent.getParameter.withArgs("userExportSettings").returns({
			splitCells: false,
			includeFilterSettings: true
		});
		oFakeExportHandlerEvent.getParameter.withArgs("filterSettings").returns([{
			getProperty: sinon.stub().returns("SampleField"),
			setLabel: fnSetLabel,
			setType: fnSetType
		}]);

		oTable.attachBeforeExport(function(oEvent) {
			var mExportSettings = oEvent.getParameter("exportSettings");
			var mUserSettings = oEvent.getParameter("userExportSettings");
			var aFilterSettings = oEvent.getParameter("filterSettings");

			assert.ok(mExportSettings, "Export settings defined");
			assert.ok(mUserSettings, "User settings defined");
			assert.ok(aFilterSettings, "Filter settings defined");
			assert.ok(Array.isArray(aFilterSettings), "Filter settings defined");

			assert.ok(fnSetLabel.called, "Filter#setLabel was called");
			assert.ok(fnSetLabel.calledWith("SampleLabel"), "Filter#setLabel was called with correct value");
			assert.ok(fnSetType.called, "Filter#setType was called");
			assert.ok(fnSetType.calledWith(oTable.getPropertyHelper().getProperty("SampleField").typeConfig.typeInstance), "Filter#setType was called with the expected type instance");

			done();
		});

		oTable.initialized().then(function() {
			TableQUnitUtils.stubPropertyInfos(oTable, [
				{
					name: "SampleField",
					path: "SampleField",
					label: "SampleLabel",
					dataType: "Edm.String"
				}
			], ODataTypeMap);

			assert.ok(fnSetLabel.notCalled, "setLabel function not called");
			assert.ok(fnSetType.notCalled, "setType function not called");

			return oTable._fullyInitialized();
		}).then(function() {
			oTable._onBeforeExport(oFakeExportHandlerEvent);
		});
	});

	QUnit.test("test _getExportHandler", function(assert) {
		var FakeExportHandler, fnCapabilities, fnRequire, oTable;

		oTable = this.oTable;
		fnRequire = sap.ui.require;

		/* Create fake ExportHandler class because dependency to sapui5.runtime is not possible */
		FakeExportHandler = function() {};
		FakeExportHandler.prototype.isA = function(sClass) { return sClass === "sap.ui.export.ExportHandler"; };
		FakeExportHandler.prototype.attachBeforeExport = sinon.stub();

		sinon.stub(sap.ui, "require").callsFake(function(aDependencies, fnCallback) {
			if (Array.isArray(aDependencies) && aDependencies.length === 1 && aDependencies[0] === "sap/ui/export/ExportHandler") {
				fnCallback(FakeExportHandler);
			} else {
				fnRequire(aDependencies, fnCallback);
			}
		});

		return oTable.initialized().then(function() {
			fnCapabilities = sinon.spy(oTable.getControlDelegate(), "fetchExportCapabilities");
			sinon.stub(oTable, "_loadExportLibrary").resolves();

			assert.ok(oTable._loadExportLibrary.notCalled, "Not called yet");
			assert.ok(fnCapabilities.notCalled, "Not called yet");
			assert.notOk(oTable._oExportHandler, "No cached instance");
		}).then(function() {
			return oTable._getExportHandler();
		}).then(function(oHandler) {
			assert.equal(oTable._loadExportLibrary.callCount, 1, "_loadExportLibrary has been called once");
			assert.equal(fnCapabilities.callCount, 1, "fetchExportCapabilities has been called once");
			assert.ok(oHandler, "Variable is defined");
			assert.ok(oTable._oExportHandler, "Cached instance available");
			assert.ok(oHandler.attachBeforeExport.calledOnce, "ExportHandler#attachBeforeExport has been called once");
			assert.ok(oHandler.attachBeforeExport.calledWith(oTable._onBeforeExport, oTable), "Table._onBeforeExport has been attached as event handler");
		}).then(function() {

			/* Reset spies */
			oTable._loadExportLibrary.reset();
			fnCapabilities.reset();
			assert.ok(oTable._loadExportLibrary.notCalled, "Not called yet");
			assert.ok(fnCapabilities.notCalled, "Not called yet");

			return oTable._getExportHandler();
		}).then(function(oHandler) {
			assert.ok(oTable._loadExportLibrary.notCalled, "Not called again");
			assert.ok(fnCapabilities.notCalled, "Not called again");
			assert.ok(oHandler, "Variable is defined");
			assert.ok(oHandler.isA("sap.ui.export.ExportHandler"), "Parameter is a sap.ui.export.ExportHandler");
			assert.equal(oHandler, oTable._oExportHandler, "Cached instance has been returned");
		}).finally(function() {
			oTable._loadExportLibrary.restore();
			fnCapabilities.restore();
			sap.ui.require.restore();
		});
	});

	QUnit.test("test _getExportHandler when sap.ui.export is missing", function(assert) {
		var oTable = this.oTable;
		assert.expect(2);

		sinon.stub(oTable, "_loadExportLibrary").returns(Promise.reject());
		sinon.stub(MessageBox, "error");

		return oTable.initialized().then(function() {
			var oExportHandler = oTable._getExportHandler();

			return oExportHandler.catch(function() {
				assert.ok(MessageBox.error.calledOnce, "MessageBox was called");
				assert.ok(MessageBox.error.calledWith(Core.getLibraryResourceBundle("sap.ui.mdc").getText("ERROR_MISSING_EXPORT_LIBRARY")), "Called with proper error message");

				oTable._loadExportLibrary().restore();
				MessageBox.error.restore();
			});
		}).catch(function() {});
	});

	QUnit.test("test _createExportColumnConfiguration", function(assert) {
		var done = assert.async();

		var sCollectionPath = "/foo";
		this.oTable.destroy();
		this.oTable = new Table({
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: sCollectionPath
				}
			}
		});

		this.oTable.setEnableExport(true);
		Core.applyChanges();
		assert.ok(this.oTable.getEnableExport(), "enableExport=true");

		this.oTable.addColumn(new Column({
			id: "firstNameColumn",
			header: "First name",
			width: "10rem",
			propertyKey: "firstName",
			template: new Text({
				text: "{firstName}"
			})
		}));

		this.oTable.addColumn(new Column({
			id: "lastNameColumn",
			header: "Last name",
			width: "10rem",
			propertyKey: "lastName",
			template: new Text({
				text: "{lastName}"
			})
		}));

		this.oTable.addColumn(new Column({
			id: "fullName",
			header: "Full name",
			width: "15rem",
			propertyKey: "fullName",
			template: new Text({
				text: "{lastName}, {firstName}"
			})
		}));

		this.oTable.addColumn(new Column({
			id: "fullNameExportSettings",
			header: "Full name 2",
			width: "15rem",
			propertyKey: "fullName2",
			template: new Text({
				text: "{lastName}, {firstName}"
			})
		}));

		this.oTable.addColumn(new Column({
			id: "ageColumn",
			header: "Age",
			hAlign: "Right",
			width: "8rem",
			propertyKey: "age",
			template: new Text({
				text: "{age}"
			})
		}));

		this.oTable.addColumn(new Column({
			id: "dobColumn",
			header: "Date of Birth",
			hAlign: "Right",
			width: "12rem",
			propertyKey: "dob",
			template: new Text({
				text: "{dob}"
			})
		}));

		this.oTable.addColumn(new Column({
			id: "salaryColumn",
			header: "Salary",
			hAlign: "Right",
			width: "12rem",
			propertyKey: "salary",
			template: new Text({
				text: "{salary}"
			})
		}));

		this.oTable.addColumn(new Column({
			id: "noDataColumn1",
			header: "NoDataColumn1",
			hAlign: "Begin",
			propertyKey: "noDataColumn1",
			template: new Button({
				text: "<"
			})
		}));

		this.oTable.addColumn(new Column({
			id: "noDataColumn2",
			header: "NoDataColumn2",
			hAlign: "Begin",
			propertyKey: "noDataColumn2",
			template: new Button({
				text: ">"
			})
		}));

		this.oTable.addColumn(new Column({
			id: "ignoreColumn",
			header: "IgnoreColumn",
			hAlign: "Begin",
			propertyKey: "ignoreColumn",
			template: new Text({
				text: "This text will not appear in the export"
			})
		}));

		var aExpectedOutput = [
			{
				columnId: "firstNameColumn",
				property: "firstName",
				type: "String",
				label: "First_Name",
				width: 19,
				textAlign: "Begin"
			},
			{
				columnId: "lastNameColumn",
				property: "lastName",
				type: "String",
				label: "Last name",
				width: 10,
				textAlign: "Begin"
			},
			{
				columnId: "fullName",
				label: "First_Name",
				property: "firstName",
				textAlign: "Begin",
				type: "String",
				width: 19
			},
			{
				columnId: "fullName-additionalProperty1",
				label: "Last name",
				property: "lastName",
				textAlign: "Begin",
				type: "String",
				width: 15
			},
			{
				columnId: "fullNameExportSettings",
				label: "Name",
				property: ["firstName", "lastName"],
				template: "{0}, {1}",
				textAlign: "Begin",
				type: "String",
				width: 15
			},
			{
				columnId: "ageColumn",
				property: "age",
				type: "Number",
				label: "Age",
				width: 8,
				textAlign: "Right"
			},
			{
				columnId: "dobColumn",
				property: "dob",
				type: "Date",
				label: "Date of Birth",
				width: 15,
				textAlign: "Right",
				template: "{0}",
				inputFormat: "YYYYMMDD"
			},
			{
				columnId: "salaryColumn",
				displayUnit: true,
				label: "Salary",
				property: "salary",
				template: "{0} {1}",
				textAlign: "Right",
				unitProperty: "currency",
				width: 10,
				type: "Currency"
			},
			{
				columnId: "noDataColumn1",
				label: "NoDataColumn1",
				property: "",
				textAlign: "Begin",
				type: "String",
				width: 5
			},
			{
				columnId: "noDataColumn2",
				label: "NoDataColumn2",
				property: "",
				textAlign: "Begin",
				type: "String",
				width: ""
			}
		];

		TableQUnitUtils.stubPropertyInfos(this.oTable, [
			{
				name: "firstName",
				path: "firstName",
				label: "First name",
				dataType: "String",
				exportSettings: {
					width: 19,
					type: "String",
					label: "First_Name"
				}
			}, {
				name: "lastName",
				path: "lastName",
				label: "Last name",
				dataType: "String"
			}, {
				name: "fullName", // complex PropertyInfo without exportSettings => 2 spreadsheet column configs will be created
				label: "Full name",
				propertyInfos: ["firstName", "lastName"]
			}, {
				name: "fullName2", // complex PropertyInfo with exportSettings => 1 spreadsheet column config will be created
				label: "Name",
				propertyInfos: ["firstName", "lastName"],
				exportSettings: {
					template: "{0}, {1}"
				}
			}, {
				name: "age",
				path: "age",
				label: "Age",
				dataType: "String",
				exportSettings: {
					type: "Number"
				}
			}, {
				name: "dob",
				path: "dob",
				label: "dob",
				dataType: "String",
				exportSettings: {
					label: "Date of Birth",
					type: "Date",
					inputFormat: "YYYYMMDD",
					width: 15,
					template: "{0}"
				}
			}, {
				name: "salary",
				path: "salary",
				label: "Salary",
				dataType: "String",
				exportSettings: {
					displayUnit: true,
					unitProperty: "currency",
					template: "{0} {1}",
					width: 10,
					type: "Currency"
				}
			}, {
				name: "currency",
				path: "currency",
				label: "Currency code",
				dataType: "String",
				exportSettings: {
					width: 5
				}
			}, {
				name: "noDataColumn1",
				label: "NoDataColumn1",
				sortable: false,
				filterable: false,
				dataType: "String",
				exportSettings: {
					width: 5
				}
			}, {
				name: "noDataColumn2",
				label: "NoDataColumn2",
				sortable: false,
				filterable: false,
				dataType: "String"
			}, {
				name: "ignoreColumn",
				label: "IgnoreColumn",
				exportSettings: null,
				dataType: "String"
			}
		]);

		this.oTable.initialized().then(function() {
			this.oTable._createExportColumnConfiguration({fileName: 'Table header'}).then(function(aActualOutput) {
				assert.deepEqual(aActualOutput[0], aExpectedOutput[0], "The export configuration was created as expected");
				done();
			});
		}.bind(this));
	});

	QUnit.test("Open the p13n dialog via button and shortcut", function(assert) {
		return this.oTable.initialized().then(function() {
			this.oTable.setP13nMode(["Column", "Sort"]);
			Core.applyChanges();

			var oOpenSettingsDialogStub = sinon.stub(PersonalizationUtils, "openSettingsDialog");

			this.oTable._oP13nButton.firePress();
			assert.ok(oOpenSettingsDialogStub.calledOnceWithExactly(this.oTable), "utils.Personalization.openSettingsDialog called");
			oOpenSettingsDialogStub.reset();

			QUtils.triggerKeydown(this.oTable.getDomRef(), KeyCodes.COMMA, false, false, true);
			assert.ok(oOpenSettingsDialogStub.calledOnceWithExactly(this.oTable), "utils.Personalization.openSettingsDialog called");
			oOpenSettingsDialogStub.reset();

			this.oTable._setShowP13nButton(false);
			Core.applyChanges();

			QUtils.triggerKeydown(this.oTable.getDomRef(), KeyCodes.COMMA, false, false, true);
			assert.ok(oOpenSettingsDialogStub.notCalled, "utils.Personalization.openSettingsDialog not called");
			oOpenSettingsDialogStub.reset();

			this.oTable.setP13nMode([]);
			this.oTable._setShowP13nButton(true);
			Core.applyChanges();

			QUtils.triggerKeydown(this.oTable.getDomRef(), KeyCodes.COMMA, false, false, true);
			assert.ok(oOpenSettingsDialogStub.notCalled, "utils.Personalization.openSettingsDialog not called");

			oOpenSettingsDialogStub.restore();
		}.bind(this));
	});

	QUnit.test("Focus Function", function(assert) {
		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}));

		var oButton = new Button();
		var oAction = new ActionToolbarAction({
			action: oButton
		});
		this.oTable.addAction(oAction);

		return this.oTable.initialized().then(function() {
			var fnFocusSpy = sinon.spy(this.oTable._oTable, "focus");
			var oFocusInfo = {
				targetInfo: new Message({
					message: "Error thrown",
					type: "Error"
				})
			};
			Core.applyChanges();

			oButton.focus();
			assert.ok(oButton.getFocusDomRef() === document.activeElement, "Correct DOM element focused");

			this.oTable.focus();
			assert.ok(fnFocusSpy.calledWith(), "Focus event called without any parameter");
			assert.ok(this.oTable._oTable.getFocusDomRef() === document.activeElement, "Correct DOM element focused");

			this.oTable.focus(oFocusInfo);
			assert.ok(fnFocusSpy.calledWith(oFocusInfo), "Focus event called with core:Message parameter");
			assert.ok(this.oTable._oTable.getFocusDomRef() === document.activeElement, "Correct DOM element focused");
		}.bind(this));
	});

	QUnit.test("test scrollToIndex", function(assert) {
		var oScrollStub;
		var oTable = this.oTable;

		function testScroll(iIndex) {
			return oTable.scrollToIndex(iIndex).then(function () {
				if (oTable._isOfType("Table", true) && iIndex === -1) {
					iIndex = 0;
				}

				assert.ok(oScrollStub.calledOnceWithExactly(iIndex), "Call to " + oScrollStub.propName + " with index " + iIndex);
				oScrollStub.resetHistory();
			});
		}

		return oTable.initialized().then(function() {
			oScrollStub = sinon.stub(oTable._oTable, "_setFirstVisibleRowIndex");
		}).then(function() {
			return testScroll(0);
		}).then(function () {
			return testScroll(5);
		}).then(function () {
			return testScroll(-1);
		}).then(function () {
			return testScroll(10000);
		}).then(function () {
			oTable.setType("ResponsiveTable");
			return oTable.initialized();
		}).then(function() {
			oScrollStub = sinon.stub(oTable._oTable, "scrollToIndex");
			oScrollStub.resolves();
		}).then(function() {
			return testScroll(0);
		}).then(function () {
			return testScroll(5);
		}).then(function () {
			return testScroll(-1);
		}).then(function () {
			return testScroll(10000);
		});
	});

	QUnit.test("test focusRow", function(assert) {
		var done = assert.async(), oScrollStub, oFocusStub, oTable = this.oTable, n = 0;

		function testFocusRow(iIndex, bFirstInteractiveElement) {
			return new Promise(function(resolve) {
				oTable.focusRow(iIndex, bFirstInteractiveElement).then(function () {
					n++;
					assert.ok(oFocusStub.called, oFocusStub.propName + " was called");
					assert.equal(oFocusStub.callCount, n, oFocusStub.propName + " was called only once");
					assert.ok(oFocusStub.calledWith(iIndex, bFirstInteractiveElement), oFocusStub.propName + " was called with the correct parameter");
					resolve();
				});
			});
		}

		oTable.initialized().then(function() {
			oFocusStub = sinon.stub(oTable._oTable, "_setFocus");
			oFocusStub.resolves();

			return new Promise(function(resolve) {
				resolve();
			}).then(function() {
				return testFocusRow(0, true);
			}).then(function () {
				return testFocusRow(5, true);
			}).then(function () {
				return testFocusRow(-1, false);
			}).then(function () {
				return testFocusRow(10000, false);
			}).then(function () {
				oFocusStub.restore();
				return Promise.resolve();
			});
		}).then(function() {
			oTable.setType("ResponsiveTable").initialized().then(function() {
				oFocusStub = sinon.stub(oTable._oTable, "_setFocus");
				oFocusStub.resolves();
				oScrollStub = sinon.stub(oTable._oTable, "scrollToIndex");
				oScrollStub.resolves();
				n = 0;

				return new Promise(function(resolve) {
					resolve();
				}).then(function() {
					return testFocusRow(0, false);
				}).then(function () {
					return testFocusRow(5, false);
				}).then(function () {
					return testFocusRow(-1, true);
				}).then(function () {
					return testFocusRow(10000, true);
				}).then(function () {
					oFocusStub.restore();
					oScrollStub.restore();
					done();
				});
			});
		});
	});

	QUnit.test("Paste with a grid table", function(assert) {
		var done = assert.async();

		var fPasteHandler = function(oEvent) {
			var aData = oEvent.getParameter("data");
			assert.ok(Array.isArray(aData));
			assert.ok(aData.length === 2);

			assert.ok(Array.isArray(aData[0]));
			assert.ok(aData[0].length === 3);
			assert.ok(aData[0][0] === "111");
			assert.ok(aData[0][1] === "222");
			assert.ok(aData[0][2] === "333");

			assert.ok(Array.isArray(aData[1]));
			assert.ok(aData[1].length === 3);
			assert.ok(aData[1][0] === "aaa");
			assert.ok(aData[1][1] === "bbb");
			assert.ok(aData[1][2] === "ccc");

			done();
		};

		this.oTable.attachPaste(fPasteHandler);
		this.oTable.initialized().then(function() {
			var oInnerTable = this.oTable._oTable;
			oInnerTable.firePaste({data: [["111", "222", "333"], ["aaa", "bbb", "ccc"]]});
		}.bind(this));
	});

	QUnit.test("Paste with a responsive table", function(assert) {
		var done = assert.async();

		// Destroy the default grid table and create a new responsive one
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable"
		});
		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		Core.applyChanges();

		var fPasteHandler = function(oEvent) {
			var aData = oEvent.getParameter("data");
			assert.ok(Array.isArray(aData));
			assert.ok(aData.length === 2);

			assert.ok(Array.isArray(aData[0]));
			assert.ok(aData[0].length === 3);
			assert.ok(aData[0][0] === "111");
			assert.ok(aData[0][1] === "222");
			assert.ok(aData[0][2] === "333");

			assert.ok(Array.isArray(aData[1]));
			assert.ok(aData[1].length === 3);
			assert.ok(aData[1][0] === "aaa");
			assert.ok(aData[1][1] === "bbb");
			assert.ok(aData[1][2] === "ccc");

			done();
		};

		this.oTable.attachPaste(fPasteHandler);
		this.oTable.initialized().then(function() {
			var oInnerTable = this.oTable._oTable;
			oInnerTable.firePaste({data: [["111", "222", "333"], ["aaa", "bbb", "ccc"]]});
		}.bind(this));
	});

	QUnit.test("ResponsiveTableType should have 'Inactive' row template when no rowPress event is attached", function(assert) {
		var done = assert.async();
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable"
		});

		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}));

		this.oTable.initialized().then(function() {
			assert.strictEqual(this.oTable._oRowTemplate.getType(), "Inactive", "row template is Inactive since no rowPress event is attached");
			done();
		}.bind(this));
	});

	QUnit.test("ResponsiveTableType should have 'Active' row template type when rowPress event is attached", function(assert) {
		var done = assert.async();
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable",
			rowPress: function() {
				return true;
			}
		});

		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}));

		this.oTable.initialized().then(function() {
			assert.strictEqual(this.oTable._oRowTemplate.getType(), "Active", "row template type is Active since rowPress event is attached");
			done();
		}.bind(this));
	});

	QUnit.test("Destroy immediately after create - destroys toolbar", function(assert) {
		// Destroy the old/default table, as this is not used for this test
		this.oTable.destroy();

		//Create a table (say grid table) and destroy it immediately
		var oTable = new Table();

		oTable.getActions(); //Leads to immediate creation of toolbar
		var oToolbar = oTable._oToolbar;
		oTable.destroy();

		assert.ok(!oTable._oTable);
		assert.ok(!oTable._oRowTemplate);
		assert.ok(!oTable._oToolbar);
		// Toolbar is destroyed
		assert.strictEqual(oToolbar.bIsDestroyed, true);
	});

	QUnit.test("No new toolbar created when the table is destroyed", function(assert) {
		var oText = new Text({
			text: "Sample Text"
		});

		this.oTable.addAction(oText);
		this.oTable.destroy();
		this.oTable.getActions();

		assert.notOk(this.oTable._oToolbar, "Toolbar not created by the getter of the action aggregation");
	});

	QUnit.test("Test enableAutoColumnWidth property", function(assert) {
		var oCanvasContext = document.createElement("canvas").getContext("2d");
		oCanvasContext.font = [
			parseFloat(ThemeParameters.get({ name: "sapMFontMediumSize" }) || "0.875rem") * parseFloat(MLibrary.BaseFontSize) + "px",
			ThemeParameters.get({ name: "sapUiFontFamily" }) || "Arial"
		].join(" ");

		var fPadding = 1.0625;
		this.oTable.setEnableAutoColumnWidth(true);
		Core.applyChanges();

		var check = function(sRefText, fOrigWidth, fRange) {
			// length of 5 chars  ~ 3.159rem
			// length of 10 chars ~ 6.318rem
			var fRefTextWidth = oCanvasContext.measureText(sRefText).width / 16;
			return Math.abs(fRefTextWidth - fOrigWidth) <= (fRange || 0.5);
		};

		this.oTable.addColumn(new Column({
			id: "firstName",
			width: "10rem",
			header: "First name",
			propertyKey: "firstName"
		}));

		this.oTable.addColumn(new Column({
			id: "lastName",
			header: "Last name",
			propertyKey: "lastName"
		}));

		this.oTable.addColumn(new Column({
			id: "fullName",
			header: "Full name",
			propertyKey: "fullName"
		}));

		this.oTable.addColumn(new Column({
			id: "numberValue",
			header: "Number value",
			propertyKey: "numberValue"
		}));

		this.oTable.addColumn(new Column({
			id: "booleanValue",
			header: "Boolean value",
			propertyKey: "booleanValue"
		}));

		this.oTable.addColumn(new Column({
			id: "columnGap1",
			header: "Test gap",
			propertyKey: "columnGap1"
		}));

		this.oTable.addColumn(new Column({
			id: "columnGap2",
			header: "Test gap",
			propertyKey: "columnGap2"
		}));

		this.oTable.addColumn(new Column({
			id: "noWidthCalculation",
			header: "No Width Calculation",
			propertyKey: "noWidthCalculation"
		}));

		this.oTable.addColumn(new Column({
			id: "complexNoWidthCalculation",
			header: "Complex No Width Calculation",
			propertyKey: "complexNoWidthCalculation"
		}));

		this.oTable.addColumn(new Column({
			id: "stringValue_nomaxlength",
			header: "stringValue_nomaxlength",
			propertyKey: "stringValue_nomaxlength"
		}));

		this.oTable.addColumn(new Column({
			id: "stringValue_bigmaxlength",
			header: "stringValue_bigmaxlength",
			propertyKey: "stringValue_bigmaxlength"
		}));

		this.oTable.addColumn(new Column({
			id: "stringValue_nolabeltruncate",
			header: "stringValue_nolabeltruncate",
			propertyKey: "stringValue_nolabeltruncate"
		}));

		this.oTable.addColumn(new Column({
			id: "column_required",
			header: "a",
			propertyKey: "a",
			required: true
		}));

		TableQUnitUtils.stubPropertyInfos(this.oTable, [
			{
				name: "firstName",
				path: "firstName",
				label: "First name",
				dataType: "Edm.String",
				constraints: {maxLength: 30},
				visualSettings: {
					widthCalculation: {
						minWidth: 4,
						maxWidth: 10
					}
				}
			}, {
				name: "lastName",
				path: "lastName",
				label: "Last name",
				dataType: "Edm.String",
				constraints: {maxLength: 30},
				visualSettings: {
					widthCalculation: {
						minWidth: 6,
						maxWidth: 8
					}
				}
			}, {
				name: "fullName",
				label: "Full name",
				propertyInfos: ["firstName", "lastName"],
				visualSettings: {
					widthCalculation: {
						verticalArrangement: true
					}
				}
			}, {
				name: "numberValue",
				label: "Number value",
				dataType: "Edm.Byte",
				visualSettings: {
					widthCalculation: {
						includeLabel: false
					}
				}
			}, {
				name: "booleanValue",
				label: "Boolean value",
				dataType: "Edm.Boolean",
				visualSettings: {
					widthCalculation: {
						includeLabel: false,
						minWidth: 1
					}
				}
			}, {
				name: "columnGap1",
				label: "Test gap",
				dataType: "Edm.String",
				constraints: {maxLength: 32},
				visualSettings: {
					widthCalculation: {
						gap: 2
					}
				}
			}, {
				name: "columnGap2",
				label: "Test gap",
				dataType: "Edm.String",
				constraints: {maxLength: 32}
			}, {
				name: "noWidthCalculation",
				label: "No Width Calculation",
				dataType: "Edm.String",
				visualSettings: {
					widthCalculation: null
				}
			}, {
				name: "complexNoWidthCalculation",
				label: "Complex with no width calculation",
				propertyInfos: ["lastName", "noWidthCalculation"],
				visualSettings: {
					widthCalculation: {
						includeLabel: false
					}
				}
			}, {
				name: "stringValue_nomaxlength",
				label: "String",
				dataType: "Edm.String"
			}, {
				name: "stringValue_bigmaxlength",
				label: "String",
				dataType: "Edm.String",
				constraints: {maxLength: 255}
			}, {
				name: "stringValue_nolabeltruncate",
				label: "stringValue_nolabeltruncate",
				dataType: "Edm.String",
				constraints: {maxLength: 5},
				visualSettings: {
					widthCalculation: {
						truncateLabel: false
					}
				}
			}, {
				name: "a",
				label: "a",
				dataType: "Edm.Boolean",
				visualSettings: {
					widthCalculation: {
						minWidth: 1
					}
				}
			}
		], ODataTypeMap);

		return this.oTable._fullyInitialized().then(function() {
			return this.oTable.propertiesFinalized();
		}.bind(this)).then(function() {
			var oPropertyHelper = this.oTable.getPropertyHelper();
			var aColumns = this.oTable.getColumns();
			var getInnerColumnWidth = function(oMDCColumn) {
				return oMDCColumn.getInnerColumn().getWidth();
			};

			// 1st column must have a width of 10rem due of its predefined
			assert.equal(parseFloat(getInnerColumnWidth(aColumns[0])) + "rem", "10rem", "Table inner column firstName width is 10rem");

			// 2nd column maxLength of 30 exceeds a maxWidth of 8
			assert.notOk(check("A".repeat(30), parseFloat(getInnerColumnWidth(aColumns[1]))), "Column lastName would exceed maxWidth of 8rem");
			assert.equal((parseFloat(getInnerColumnWidth(aColumns[1])) - fPadding) + "rem", "8rem", "Table inner column lastName width is 8rem");

			// 3th column is complex with vertical alignment and exceed maxWidth of 10rem of column firstName
			assert.notOk(check("A".repeat(30), parseFloat(getInnerColumnWidth(aColumns[2]))), "Column fullName would exceed maxWidth of 10rem");
			assert.equal((parseFloat(getInnerColumnWidth(aColumns[2])) - fPadding) + "rem", "10rem",
				"Table inner column fullName calculated width is 10rem");

			// 4th column width is 2rem, the default minWidth, due Edm.Byte has a limit of 3 chars ~ 1.459rem
			var sPropertyName = aColumns[3].getPropertyKey();
			var oProperty = oPropertyHelper.getProperty(sPropertyName);

			var sWidth = oPropertyHelper._calcColumnWidth(oProperty, aColumns[3]);
			assert.equal(sWidth, aColumns[3]._oSettingsModel.getProperty("/calculatedWidth"), "calculatedWidth for numberValue width is " + sWidth);
			assert.equal(sWidth, getInnerColumnWidth(aColumns[3]), "Column numberValue width is " + sWidth);

			// 5th column is in correct range due of type boolean
			assert.ok(check("Yes", parseFloat(getInnerColumnWidth(aColumns[4])) - fPadding),
				"Column booleanValue width calculated correctly");

			// by side of the gap, columnGap1 and columnGap2 are identical
			sPropertyName = aColumns[5].getPropertyKey();
			oProperty = oPropertyHelper.getProperty(sPropertyName);
			assert.equal(getInnerColumnWidth(aColumns[5]),
				parseFloat(getInnerColumnWidth(aColumns[6])) + oProperty.visualSettings.widthCalculation.gap + "rem",
				"Additional gap of " + oProperty.visualSettings.widthCalculation.gap + "rem for Column columnGap1 is calculated correctly");

			// visualSettings.widthCalculation=null
			assert.notOk(getInnerColumnWidth(aColumns[7]), "There is no width set since visualSettings.widthCalculation=null");

			// complex property with visualSettings.widthCalculation=null
			assert.equal(getInnerColumnWidth(aColumns[8]), getInnerColumnWidth(aColumns[1]), "Width calculation in complex property with visualSettings.widthCalculation=null is ignored");

			assert.equal(getInnerColumnWidth(aColumns[9]), 19 + fPadding + "rem", "String type without maxLength gets maxWidth");
			assert.equal(getInnerColumnWidth(aColumns[10]), 19 + fPadding + "rem", "String type with big maxLength gets maxWidth");

			assert.ok(check(aColumns[11].getHeader(), parseFloat(getInnerColumnWidth(aColumns[11])) - fPadding, 0), "The header is not truncated and the column width is as wide as the header");

			// 12th column. required "*" is added to column
			assert.ok(check("Yes*", parseFloat(getInnerColumnWidth(aColumns[12])) - fPadding - 0.125 /* subtract padding from marker */), "Heaeder has correct width when using 'required' property");
		}.bind(this));
	});

	QUnit.test("Test enableAutoColumnWidth for TreeTable type columns", function(assert) {
		TableQUnitUtils.stubPropertyInfos(Table.prototype, [{
			name: "firstName",
			path: "firstName",
			label: "First name",
			dataType: "Edm.String",
			constraints: {maxLength: 30}
		}, {
			name: "lastName",
			path: "lastName",
			label: "Last name",
			dataType: "Edm.String",
			constraints: {maxLength: 30}
		}], ODataTypeMap);

		function setupTable(oTable) {
			oTable.setEnableAutoColumnWidth(true);
			oTable.addColumn(new Column({
				header: "First name",
				propertyKey: "firstName"
			}));
			oTable.addColumn(new Column({
				header: "Last name",
				propertyKey: "lastName"
			}));
			return oTable;
		}

		setupTable(this.oTable);
		this.oTreeTable = setupTable(new Table({
			type: "TreeTable",
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath"
				}
			}
		}));
		this.oTreeTable.placeAt("qunit-fixture");
		Core.applyChanges();

		return Promise.all([
			this.oTable._fullyInitialized(),
			this.oTreeTable._fullyInitialized()
		]).then(function() {
			return Promise.all([
				this.oTable.propertiesFinalized(),
				this.oTreeTable.propertiesFinalized()
			]);
		}.bind(this)).then(function() {
			var aTreeTableColumns = this.oTreeTable.getColumns().map(function(oColumn) { return oColumn.getInnerColumn(); });
			var aTableColumns = this.oTable.getColumns().map(function(oColumn) { return oColumn.getInnerColumn(); });

			assert.ok(parseFloat(aTreeTableColumns[0].getWidth()) > parseFloat(aTableColumns[0].getWidth()), "The first tree column has larger width");
			assert.equal(aTreeTableColumns[1].getWidth(), aTableColumns[1].getWidth(), "The column width is not changed for the the second column");
			this.oTreeTable.destroy();
		}.bind(this)).finally(function() {
			TableQUnitUtils.restorePropertyInfos(Table.prototype);
		});
	});

	QUnit.test("Toolbar style", function(assert) {
		this.oTable.destroy();
		this.oTable = new Table();
		this.oTable.placeAt("qunit-fixture");
		Core.applyChanges();

		return this.oTable.initialized().then(function() {
			assert.strictEqual(this.oTable._oToolbar.getStyle(), "Clear", "Correct style applied to the toolbar according to the table type");
			// simulate change table type at runtime
			this.oTable.setType(new ResponsiveTableType());
			return this.oTable._fullyInitialized();
		}.bind(this)).then(function() {
			assert.strictEqual(this.oTable._oToolbar.getStyle(), "Standard", "Toolbar style updated after table type is changed to Responsive table");
		}.bind(this));
	});

	QUnit.test("Export Button ButtonType for different Themes", function (assert) {
		var iTimeout = QUnit.config.testTimeout;
		QUnit.config.testTimeout = 50000; //BCP: 2270148312
		var done = assert.async();
		//Default theme must not be first
		var aThemes = ["sap_horizon", "sap_horizon_dark", "sap_horizon_hcb", "sap_horizon_hcw", "sap_fiori_3", "sap_belize"];
		var fnGetExpectedTheme = function (sTheme) {
			switch (sTheme) {
				case "sap_horizon":
				case "sap_horizon_dark":
				case "sap_horizon_hcw":
				case "sap_horizon_hcb":
					return MLibrary.ButtonType["Transparent"];
				default:
					return MLibrary.ButtonType["Ghost"];
			}
		};

		assert.expect(aThemes.length);

		this.oTable.destroy();
		this.oTable = new Table({
			enableExport: true
		});
		this.oTable._createToolbar();

		var fnThemeChanged = function (oEvent) {
			var sTheme = oEvent.getParameter("theme");
			assert.deepEqual(this.oTable._oExportButton.getType(), fnGetExpectedTheme(sTheme), "Export button ButtonType equals to expected Theme styling, Theme: " + sTheme);
			if (sTheme === aThemes.at(-1)){
				Core.detachThemeChanged(fnThemeChanged);
				QUnit.config.testTimeout = iTimeout;
				done();
			} else {
				var iPosition = aThemes.indexOf(sTheme);
				Core.applyTheme(aThemes[iPosition + 1]);
			}
		}.bind(this);

		Core.attachThemeChanged(fnThemeChanged);

		Core.applyTheme(aThemes[0]);
	});

	QUnit.test("Export button state should be checked for bindingChange, if a row is added to the table", function(assert) {
		this.oTable.destroy();
		this.oTable = new Table({
			enableExport: true,
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath"
				}
			},
			columns: [
				new Column({
					propertyKey: "name",
					template: new Text({
						text: "{name}"
					})
				})
			],
			models: new JSONModel({
				testPath: []
			})
		});

		return TableQUnitUtils.waitForBinding(this.oTable).then(function() {
			assert.notOk(this.oTable._oExportButton.getEnabled(), "Export button is disabled since there are no rows");
			var oUpdateExportButtonSpy = sinon.spy(this.oTable, "_updateExportButton"),
				fGetLengthStub = sinon.stub(this.oTable.getRowBinding(), "getLength");
			fGetLengthStub.returns(1);

			// simulate binding change
			this.oTable.getRowBinding().fireEvent("change");
			assert.ok(oUpdateExportButtonSpy.calledOnce);
			assert.ok(this.oTable._oExportButton.getEnabled(), "Export button enabled, since binding change added a row to the table");

			fGetLengthStub.restore();
		}.bind(this));
	});

	QUnit.test("_setSelectedContexts", function(assert) {
		return this.oTable.initialized().then(() => {
			this.oTable.setType(new ResponsiveTableType());
			return this.oTable._fullyInitialized().then(() => {
				const oDelegate = this.oTable.getControlDelegate();
				sinon.spy(oDelegate, "setSelectedContexts");
				const aContexts = [];
				this.oTable._setSelectedContexts(aContexts);
				assert.ok(oDelegate.setSelectedContexts.calledWith(this.oTable, aContexts), "Calls Delegate.setSelectedContexts with correct parameters");
				oDelegate.setSelectedContexts.restore();
			});
		});
	});

	QUnit.test("_bindingChange", function (assert) {
		sinon.spy(this.oTable, "fireEvent");
		return this.oTable._fullyInitialized().then(() => {
			this.oTable._onBindingChange();
			assert.ok(this.oTable.fireEvent.calledWith("_bindingChange"), "Table fires expected event '_bindingChange'");
			this.oTable.fireEvent.restore();
		});
	});

	QUnit.test("_setInternalProperty", function(assert) {
		return this.oTable._fullyInitialized().then(() => {
			const oInnerTable = this.oTable._oTable;
			const oInnerTableMetadata = oInnerTable.getMetadata();
			sinon.spy(oInnerTableMetadata, "getProperty");
			sinon.spy(oInnerTable, "setSelectionBehavior");
			this.oTable._setInternalProperty("selectionBehavior", "Row");
			assert.ok(oInnerTableMetadata.getProperty.calledWithExactly("selectionBehavior"), "Determines mutator using metadata.");
			assert.ok(oInnerTable.setSelectionBehavior.calledWith("Row"), "Inner control's property mutator called correctly.");
			oInnerTableMetadata.getProperty.restore();
			oInnerTable.setSelectionBehavior.restore();
		});
	});

	QUnit.test("Context Menu", function(assert) {
		var done = assert.async();

		var oModel = new JSONModel();
		oModel.setData({
			testPath: [
				{}, {}, {}, {}, {}
			]
		});

		this.oTable.destroy();
		this.oTable = new Table({
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath"
				}
			},
			type: new GridTableType()
		});

		this.oTable.setModel(oModel);
		this.oTable.addColumn(new Column({
			header: "test",
			template: new Text()
		}));

		this.oTable.placeAt("qunit-fixture");
		Core.applyChanges();
		var oBeforeOpenContextMenuSpy = this.spy();
		this.oTable.attachEvent("beforeOpenContextMenu", oBeforeOpenContextMenuSpy);

		TableQUnitUtils.waitForBinding(this.oTable).then(function() {
			this.oTable.attachEventOnce("beforeOpenContextMenu", function(oEvent) {
				assert.equal(oEvent.getParameter("bindingContext"), this.oTable._oTable.getContextByIndex(0), "BeforeOpenContextMenu event fired with correct bindingContext parameters");
				assert.equal(oEvent.getParameter("column"), this.oTable.getColumns()[0], "BeforeOpenContextMenu event fired with correct column parameters");
				assert.equal(this.oTable._oTable.mEventRegistry.beforeOpenContextMenu.length, 1, "Only attached to event once");
				assert.equal(oBeforeOpenContextMenuSpy.callCount, 1, "beforeOpenContextMenu event fired once");

				var oDestroyContextmenuSpy = sinon.spy(this.oTable._oTable, "destroyContextMenu");

				this.oTable.getContextMenu().close();
				this.oTable.destroyContextMenu();

				assert.equal(this.oTable.getContextMenu(), null, "Context menu is set to null");
				assert.equal(this.oTable.getContextMenu(), this.oTable._oTable.getContextMenu(), "Context menu is set on inner table");
				this.oTable.setContextMenu(null);
				assert.notOk(this.oTable._oTable.mEventRegistry.beforeOpenContextMenu, "Deattached to event once");
				assert.ok(oDestroyContextmenuSpy.calledOnce, "Inner  table destroyContextMenu called once");

				this.oTable.setContextMenu(new Menu({
					items: [
						new MenuItem({text: "Test B"})
					]
				}));

				assert.equal(this.oTable.getContextMenu(), this.oTable._oTable.getContextMenu(), "Context menu is set on inner table and is same as MDC table");
				assert.equal(this.oTable.getContextMenu().getItems()[0].getText(), "Test B", "ContextMenu with text Test B is shown");
				assert.equal(this.oTable._oTable.mEventRegistry.beforeOpenContextMenu.length, 1, "Only attached to event once");

				this.oTable.attachEventOnce("beforeOpenContextMenu", function(oEvent) {
					assert.equal(oEvent.getParameter("bindingContext"), this.oTable._oTable.getContextByIndex(0), "BeforeOpenContextMenu event fired with correct bindingContext parameters");
					assert.equal(oEvent.getParameter("column"), this.oTable.getColumns()[0], "BeforeOpenContextMenu event fired with correct column parameters");
					assert.equal(oBeforeOpenContextMenuSpy.callCount, 2, "beforeOpenContextMenuSpy event fired once");
					this.oTable._oTable = null;
					this.oTable.destroyContextMenu();
					assert.equal(this.oTable.getContextMenu(), null);

					this.oTable.setContextMenu(new Menu({
						items: [
							new MenuItem({text: "Test A"})
						]
					}));
					this.oTable.setType("ResponsiveTable");
					assert.equal(this.oTable._oContextMenu.getItems()[0].getText(), "Test A", "ContextMenu is not destroyed");
					done();
				}.bind(this));

				this.oTable._oTable.attachEventOnce("rowsUpdated", function() {
					var oCell = this.oTable._oTable.getRows()[0].getDomRef("col0");
					oCell.focus();
					jQuery(oCell).trigger("contextmenu");
				}.bind(this));
			}.bind(this));

			this.oTable.setContextMenu(null);
			assert.equal(this.oTable.getContextMenu(), null, "Context menu is set to null on mdc table");

			this.oTable.setContextMenu(undefined);
			assert.equal(this.oTable.getContextMenu(), undefined, "Context menu is undefined on mdc table");

			var oMenu = new Menu({
				items: [
					new MenuItem({text: "Test A"})
				]
			});
			this.oTable.setContextMenu(oMenu);

			var oContextMenu = this.oTable.getContextMenu();
			assert.equal(oContextMenu, oMenu, "Context menu is set on mdc table");
			assert.equal(oContextMenu, this.oTable._oTable.getContextMenu(), "Context menu is set on mdc table and is same as inner table");
			assert.equal(oContextMenu.getItems()[0].getText(), "Test A", "ContextMenu with text Test A is shown");
			this.oTable._oTable.attachEventOnce("rowsUpdated", function() {
				var oCell = this.oTable._oTable.getRows()[0].getDomRef("col0");
				oCell.focus();
				jQuery(oCell).trigger("contextmenu");
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("Context Menu For ResponsiveTable type", function(assert) {
		var done = assert.async();

		var oModel = new JSONModel();
		oModel.setData({
			testPath: [
				{}, {}, {}, {}, {}
			]
		});

		this.oTable.destroy();
		this.oTable = new Table({
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath"
				}
			},
			type: new ResponsiveTableType()
		});

		this.oTable.setModel(oModel);
		this.oTable.addColumn(new Column({
			header: "test",
			template: new Text()
		}));

		this.oTable.placeAt("qunit-fixture");
		Core.applyChanges();

		this.oTable.setContextMenu(null);
		assert.equal(this.oTable.getContextMenu(), null, "Context menu is set to null on mdc table");

		this.oTable.setContextMenu(undefined);
		assert.equal(this.oTable.getContextMenu(), null, "Context menu is undefiend on mdc table");

		TableQUnitUtils.waitForBinding(this.oTable).then(function() {
			this.oTable.attachBeforeOpenContextMenu(function(oEvent) {
				assert.equal(oEvent.getParameter("bindingContext"), this.oTable._oTable.getItems()[0].getBindingContext(), "BeforeOpenContextMenu event fired with correct bindingContext parameters");
				assert.equal(oEvent.getParameter("column"), this.oTable.getColumns()[0], "BeforeOpenContextMenu event fired with correct column parameters");
			}.bind(this));

			var oMenu = new Menu({
				items: [
					new MenuItem({text: "Test A"})
				]
			});
			this.oTable.setContextMenu(oMenu);
			var oContextMenu = this.oTable.getContextMenu();
			assert.equal(oContextMenu, oMenu, "Context menu set on inner table is same on mdc table");
			assert.equal(oContextMenu, this.oTable._oTable.getContextMenu());
			assert.equal(oContextMenu.getItems()[0].getText(), "Test A", "ContextMenu with text Test A is shown");
			var oDestroyContextmenuSpy = sinon.spy(this.oTable._oTable, "destroyContextMenu");
			Core.applyChanges();

			oMenu = this.oTable._oTable.getContextMenu();
			var oCell = this.oTable._oTable.getItems()[0].getDomRef().querySelector(".sapMListTblCell");
			oCell.focus();
			jQuery(oCell).trigger("contextmenu");
			oMenu.close();

			this.oTable.destroyContextMenu();

			assert.equal(this.oTable.getContextMenu(), null, "Context menu is set to null on mdc table ");
			assert.equal(this.oTable.getContextMenu(), this.oTable._oTable.getContextMenu(), "Context menu set on inner table is same on mdc table");
			assert.ok(oDestroyContextmenuSpy.calledOnce, "Inner table destroyContextMenu called once");

			this.oTable.setContextMenu(new Menu({
				items: [
					new MenuItem({text: "Test B"})
				]
			}));

			oContextMenu = this.oTable.getContextMenu();
			assert.equal(oContextMenu, this.oTable._oTable.getContextMenu(), "Context menu set on inner table is same on mdc table");
			assert.equal(oContextMenu.getItems()[0].getText(), "Test B", "ContextMenu with text Test B is shown");
			TableQUnitUtils.waitForBinding(this.oTable).then(function() {
				oDestroyContextmenuSpy = sinon.spy(this.oTable._oContextMenu, "destroy");
				this.oTable.destroy();
				assert.ok(oDestroyContextmenuSpy.callCount, 2, "ContextMenu destroyed");
				assert.equal(this.oTable.getContextMenu(), null, "Contextmenu destroyed");
				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.module("Inbuilt filter initialization", {
		createTable: function(mSettings) {
			this.oTable = new Table(mSettings);
			this.oTable.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	var fnCheckInbuiltInitialization = function(bInbuiltShouldBeActivated, assert) {
		var done = assert.async();
		this.oTable._fullyInitialized().then(function(){
			if (bInbuiltShouldBeActivated) {
				assert.ok(this.oTable.getInbuiltFilter().isA("sap.ui.mdc.filterbar.FilterBarBase"), "Inbuilt filtering initialized");
			} else {
				assert.ok(!this.oTable.getInbuiltFilter(), "Inbuilt filtering must not be initialized");
			}
			done();
		}.bind(this));
	};

	QUnit.test("Check AdaptationFilterBar initialization with autoBindOnInit 'true'", function(assert){
		this.createTable({
			autoBindOnInit: true,
			p13nMode: ["Filter"],
			delegate: {
				name: sDelegatePath
			}
		});
		fnCheckInbuiltInitialization.call(this, true, assert);
	});

	QUnit.test("Check AdaptationFilterBar initialization with autoBindOnInit 'false'", function(assert){
		this.createTable({
			autoBindOnInit: false,
			p13nMode: ["Filter"],
			delegate: {
				name: sDelegatePath
			}
		});
		fnCheckInbuiltInitialization.call(this, true, assert);
	});

	QUnit.test("Check AdaptationFilterBar initialization with autoBindOnInit 'true' and inbuilt filtering disabled", function(assert){
		this.createTable({
			autoBindOnInit: true
		});
		fnCheckInbuiltInitialization.call(this, false, assert);
	});

	QUnit.test("Check AdaptationFilterBar initialization with autoBindOnInit 'false' and inbuilt filtering enabled", function(assert){
		this.createTable({
			autoBindOnInit: false
		});
		fnCheckInbuiltInitialization.call(this, false, assert);
	});

	QUnit.module("Filter info bar", {
		beforeEach: function() {
			this.oTable = new Table({
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "/testPath"
					}
				}
			});
			this.oTable.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oTable.destroy();
			TableQUnitUtils.restorePropertyInfos(this.oTable);
		},
		getFilterInfoBar: function(oMDCTable) {
			var oTable = this.oTable || oMDCTable;
			var oFilterInfoBar;

			if (oTable._isOfType(TableType.ResponsiveTable)) {
				oFilterInfoBar = oTable._oTable.getInfoToolbar();
			} else {
				oFilterInfoBar = oTable._oTable.getExtension()[1];
			}

			if (oFilterInfoBar && oFilterInfoBar.isA("sap.m.OverflowToolbar")) {
				return oFilterInfoBar;
			} else {
				return null;
			}
		},
		getFilterInfoText: function(oMDCTable) {
			var oTable = this.oTable || oMDCTable;
			var oFilterInfoBar = this.getFilterInfoBar(oTable);
			return oFilterInfoBar ? oFilterInfoBar.getContent()[0] : null;
		},
		hasFilterInfoBar: function(oMDCTable) {
			var oTable = this.oTable || oMDCTable;
			return this.getFilterInfoBar(oTable) !== null;
		},
		waitForFilterInfoBarRendered: function(oMDCTable) {
			var oTable = this.oTable || oMDCTable;

			return new Promise(function(resolve) {
				var oFilterInfoBar = this.getFilterInfoBar(oTable);

				if (!oFilterInfoBar.getDomRef()) {
					oFilterInfoBar.addEventDelegate({
						onAfterRendering: function() {
							oFilterInfoBar.removeEventDelegate(this);
							resolve();
						}
					});
				} else {
					resolve();
				}
			}.bind(this));
		}
	});

	QUnit.test("Filter info bar (filter disabled)", function(assert) {
		var that = this;

		TableQUnitUtils.stubPropertyInfos(this.oTable, [
			{
				name: "name",
				label: "NameLabel",
				dataType: "String"
			}
		]);

		return this.oTable.initialized().then(function() {
			assert.ok(!that.hasFilterInfoBar(), "No initial filter conditions: Filter info bar does not exist");
		}).then(function() {
			that.oTable.destroy();
			that.oTable = new Table({
				filterConditions: {
					name: [
						{
							isEmpty: null,
							operator: "EQ",
							validated: "NotValidated",
							values: ["test"]
						}
					]
				}
			});
			return that.oTable.initialized();
		}).then(function() {
			assert.ok(!that.hasFilterInfoBar(), "Initial filter conditions: Filter info bar does not exist");

			that.oTable.setFilterConditions({
				age: [
					{
						isEmpty: null,
						operator: "EQ",
						validated: "NotValidated",
						values: ["test"]
					}
				]
			});

			return wait(50);
		}).then(function() {
			assert.ok(!that.hasFilterInfoBar(), "Change filter conditions: Filter info bar does not exist");

			that.oTable.setP13nMode(["Filter"]);
			assert.ok(that.hasFilterInfoBar(), "Filtering enabled: Filter info bar exists");
			assert.ok(!that.getFilterInfoBar().getVisible(), "Filtering enabled: Filter info bar is invisible");
		});
	});

	aTestedTypes.forEach(function(sTableType) {
		QUnit.test("Filter info bar with table type = " + sTableType + " (filter enabled)", function(assert) {
			var that = this;
			var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc");
			var oListFormat = ListFormat.getInstance();

			this.oTable.destroy();
			TableQUnitUtils.stubPropertyInfos(Table.prototype, [
				{
					name: "name",
					label: "NameLabel",
					dataType: "String"
				}, {
					name: "age",
					label: "AgeLabel",
					dataType: "String"
				}, {
					name: "gender",
					label: "GenderLabel",
					dataType: "String"
				}
			]);

			this.oTable = new Table({
				type: sTableType,
				p13nMode: ["Filter"]
			});


			return this.oTable._fullyInitialized().then(function() {
				assert.ok(that.hasFilterInfoBar(), "No initial filter conditions: Filter info bar exists");
				assert.ok(!that.getFilterInfoBar().getVisible(), "No initial filter conditions: Filter info bar is invisible");
				assert.equal(that.oTable._oTable.getAriaLabelledBy().filter(function(sId) {
					return sId === that.oTable._oFilterInfoBarInvisibleText.getId();
				}).length, 1, "ariaLabelledBy of the inner table contains a reference to the invisible text");
				assert.equal(that.oTable._oFilterInfoBarInvisibleText.getText(), "", "The associated invisible text is empty");
			}).then(function() {
				that.oTable.destroy();
				that.oTable = new Table({
					columns: [
						new Column({
							template: new Text(),
							propertyKey: "name",
							header: "NameLabelColumnHeader"
						}),
						new Column({
							template: new Text(),
							propertyKey: "age",
							header: "AgeLabelColumnHeader"
						})
					],
					type: sTableType,
					p13nMode: ["Filter"],
					filterConditions: {
						name: [
							{
								isEmpty: null,
								operator: "EQ",
								validated: "NotValidated",
								values: ["test"]
							}
						]
					}
				});

				that.oTable.placeAt("qunit-fixture");
				Core.applyChanges();
				return that.oTable._fullyInitialized();
			}).then(function() {
				assert.ok(that.hasFilterInfoBar(), "Initial filter conditions: Filter info bar exists");
				assert.ok(that.getFilterInfoBar().getVisible(), "Initial filter conditions: Filter info bar is visible");
				assert.strictEqual(that.getFilterInfoText().getText(),
					oResourceBundle.getText("table.ONE_FILTER_ACTIVE", oListFormat.format(["NameLabel"])),
					"Initial filter conditions: The filter info bar text is correct (1 filter)");
				assert.equal(that.oTable._oFilterInfoBarInvisibleText.getText(), oResourceBundle.getText("table.ONE_FILTER_ACTIVE", oListFormat.format(["NameLabel"])), "The associated invisible text is correct");

				that.oTable.setFilterConditions({
					name: [
						{
							isEmpty: null,
							operator: "EQ",
							validated: "NotValidated",
							values: ["test"]
						}
					],
					age: [
						{
							isEmpty: null,
							operator: "EQ",
							validated: "NotValidated",
							values: ["test"]
						}
					]
				});

				return that.waitForFilterInfoBarRendered();
			}).then(function() {
				var oFilterInfoBar = that.getFilterInfoBar();

				assert.strictEqual(that.getFilterInfoText().getText(),
					oResourceBundle.getText("table.MULTIPLE_FILTERS_ACTIVE", [2, oListFormat.format(["NameLabel", "AgeLabel"])]),
					"Change filter conditions: The filter info bar text is correct (2 filters)");

				oFilterInfoBar.focus();
				assert.strictEqual(document.activeElement, oFilterInfoBar.getFocusDomRef(), "The filter info bar is focused");

				that.oTable.setFilterConditions({
					name: []
				});
				assert.ok(that.hasFilterInfoBar(), "Filter conditions removed: Filter info bar exists");
				assert.ok(!that.getFilterInfoBar().getVisible(), "Filter conditions removed: Filter info bar is invisible");
				assert.equal(that.oTable._oFilterInfoBarInvisibleText.getText(), "", "The associated invisible text is empty");
				assert.ok(that.oTable.getDomRef().contains(document.activeElement), "The table has the focus");

				that.oTable.setFilterConditions({
					name: [
						{
							isEmpty: null,
							operator: "EQ",
							validated: "NotValidated",
							values: ["test"]
						}
					],
					age: [
						{
							isEmpty: null,
							operator: "EQ",
							validated: "NotValidated",
							values: ["test"]
						}
					],
					gender: [
						{
							isEmpty: null,
							operator: "EQ",
							validated: "NotValidated",
							values: ["test"]
						}
					]
				});

				return wait(0);
			}).then(function() {
				assert.ok(that.getFilterInfoBar().getVisible(), "Set filter conditions: Filter info bar is visible");
				assert.strictEqual(that.getFilterInfoText().getText(),
					oResourceBundle.getText("table.MULTIPLE_FILTERS_ACTIVE", [3, oListFormat.format(["NameLabel", "AgeLabel", "GenderLabel"])]),
					"Set filter conditions: The filter info bar text is correct (3 filters)");
				assert.equal(that.oTable._oFilterInfoBarInvisibleText.getText(),
					oResourceBundle.getText("table.MULTIPLE_FILTERS_ACTIVE", [3, oListFormat.format(["NameLabel", "AgeLabel", "GenderLabel"])]),
					"The associated invisible text is correct");
			}).then(function() {
				return that.waitForFilterInfoBarRendered();
			}).then(function() {
				var oFilterInfoBar = that.getFilterInfoBar();

				that.oTable.setP13nMode();

				oFilterInfoBar.focus();
				assert.strictEqual(document.activeElement, oFilterInfoBar.getFocusDomRef(), "The filter info bar is focused");

				that.oTable.setP13nMode(["Column", "Sort"]);
				assert.ok(that.hasFilterInfoBar(), "Filter disabled: Filter info bar exists");
				assert.ok(!oFilterInfoBar.getVisible(), "Filter disabled: Filter info bar is invisible");
				assert.equal(that.oTable._oFilterInfoBarInvisibleText.getText(), "", "The associated invisible text is empty");
				Core.applyChanges();
				assert.ok(that.oTable.getDomRef().contains(document.activeElement), "The table has the focus");

				that.oTable.destroy();
				assert.ok(oFilterInfoBar.bIsDestroyed, "Filter info bar is destroyed when the table is destroyed");
				assert.equal(that.oTable._oFilterInfoBarInvisibleText, null, "The invisible text is set to null");
				TableQUnitUtils.restorePropertyInfos(Table.prototype);
			});
		});
	});

	QUnit.test("Filter info bar after changing table type", function(assert) {
		var that = this;

		this.oTable.destroy();
		this.oTable = new Table({
			p13nMode: ["Filter"],
			filterConditions: {
				name: [
					{
						isEmpty: null,
						operator: "EQ",
						validated: "NotValidated",
						values: ["test"]
					}
				]
			}
		});

		return this.oTable.initialized().then(function() {
			that.oTable.setType("ResponsiveTable");
			return that.oTable._fullyInitialized();
		}).then(function() {
			assert.ok(that.hasFilterInfoBar(), "Changed from \"Table\" to \"ResponsiveTable\": Filter info bar exists");
			assert.equal(that.oTable._oTable.getAriaLabelledBy().filter(function(sId) {
				return sId === that.oTable._oFilterInfoBarInvisibleText.getId();
			}).length, 1, "Changed from \"Table\" to \"ResponsiveTable\": The filter info bar text is in the \"ariaLabelledBy\" association of the"
						  + " table");
		}).then(function() {
			that.oTable.setType("Table");
			return that.oTable._fullyInitialized();
		}).then(function() {
			assert.ok(that.hasFilterInfoBar(), "Changed from \"ResponsiveTable\" to \"Table\": Filter info bar exists");
			assert.equal(that.oTable._oTable.getAriaLabelledBy().filter(function(sId) {
				return sId === that.oTable._oFilterInfoBarInvisibleText.getId();
			}).length, 1, "Changed from \"ResponsiveTable\" to \"Table\": The filter info bar text is in the \"ariaLabelledBy\" association of the"
						  + " table");
		});
	});

	QUnit.test("Press the filter info bar & focus handling with p13n dialog (TODO: SHOULD BE AN OPA TEST!)", function(assert) {
		var that = this;

		this.oTable.addColumn(new Column({
			template: new Text(),
			propertyKey: "name"
		}));
		this.oTable.setP13nMode(["Filter"]);

		TableQUnitUtils.stubPropertyInfos(this.oTable, [{
			name: "name",
			label: "NameLabel",
			dataType: "sap.ui.model.type.String"
		}]);

		return this.oTable.initialized().then(function() {
			that.oTable.setFilterConditions({
				name: [{
					isEmpty: null,
					operator: "EQ",
					validated: "NotValidated",
					values: ["test"]
				}]
			});

			return that.oTable.awaitPropertyHelper();
		}).then(function() {
			return that.waitForFilterInfoBarRendered();
		}).then(function() {
			var oOpenFilterDialogStub = sinon.stub(PersonalizationUtils, "openFilterDialog").resolves();
			var oFilterInfoBar = that.getFilterInfoBar();

			oFilterInfoBar.firePress();
			assert.ok(oOpenFilterDialogStub.calledOnceWith(that.oTable),
				"Pressing the filter info bar calls utils.Personalization.openFilterDialog with the correct arguments");
			oOpenFilterDialogStub.restore();

			// Simulate setting the focus when the filter dialog is closed and all filters have been removed.
			// The filter info bar will be hidden in this case. The focus should still be somewhere in the table and not on the document body.
			that.oTable.setFilterConditions({
				name: [{
					isEmpty: null,
					operator: "EQ",
					validated: "NotValidated",
					values: ["test"]
				}]
			});
			return that.waitForFilterInfoBarRendered();
		}).then(function() {
			var oFilterInfoBar = that.getFilterInfoBar();

			oFilterInfoBar.focus();
			oFilterInfoBar.firePress(); // Opens the filter dialog

			return TableQUnitUtils.waitForSettingsDialog(that.oTable);
		}).then(function(oP13nDialog) {
			return new Promise(function(resolve) {
				oP13nDialog.attachEventOnce("afterClose", function() {
					that.oTable.setFilterConditions({name: []}); // Hides the filter info bar
					Core.applyChanges();
					resolve();
				});
				oP13nDialog.getButtons()[0].firePress(); // Trigger press on the OK button in the sap.m.Dialog
			});
		}).then(function() {
			assert.ok(that.oTable.getDomRef().contains(document.activeElement),
				"After removing all filters in the dialog and closing it, the focus is in the table");
		});
	});

	aTestedTypes.forEach(function(sTableType) {
		QUnit.module("Row actions - " + sTableType, {
			beforeEach: function() {
				this.oTable = new Table({
					type: sTableType
				});
				this.oTable.placeAt("qunit-fixture");
				Core.applyChanges();
				return this.oTable.initialized();
			},
			afterEach: function() {
				this.oTable.destroy();
			},
			assertInnerTableAction: function(assert, oMDCTable, bIsBound) {
				var oTable = oMDCTable || this.oTable;

				switch (sTableType) {
					case "ResponsiveTable":
						assert.equal(oTable._oRowTemplate.getType(), "Navigation", "Type of the list item template");
						break;
					default:
						assert.ok(oTable._oTable.getRowActionTemplate(), "Row action template exists");
						if (bIsBound) {
							var oBindingInfo = oTable._oTable.getRowActionTemplate().getBindingInfo("items");
							assert.ok(oBindingInfo, "BindingInfo for items exist");
							assert.ok(oBindingInfo.template.getVisible(), "RowAction is visible");
							assert.ok(oBindingInfo.template.isBound("type"), "Type property is bound");
						} else {
							assert.equal(oTable._oTable.getRowActionTemplate().getItems().length, 1, "With one item");
							assert.equal(oTable._oTable.getRowActionTemplate().getItems()[0].getType(), "Navigation", "Of type 'Navigation'");
							assert.equal(oTable._oTable.getRowActionCount(), 1, "Row action count");
						}
				}
			},
			assertNoInnerTableAction: function(assert, oMDCTable) {
				var oTable = oMDCTable || this.oTable;

				switch (sTableType) {
					case "ResponsiveTable":
						assert.equal(oTable._oRowTemplate.getType(), "Inactive", "Type of the list item template");
						break;
					default:
						assert.notOk(oTable._oTable.getRowActionTemplate(), "Row action template does not exist");
						assert.equal(oTable._oTable.getRowActionCount(), 0, "Row action count");
				}
			},
			assertInnerTableActionFormatted: function(assert, oMDCTable, bIsBound) {
				var oTable = oMDCTable || this.oTable;

				switch (sTableType) {
					case "ResponsiveTable":
						assert.equal(oTable._oRowTemplate.getType(), "Navigation", "Type of the list item template");
						assert.ok(oTable._oRowTemplate.getBindingInfo("type").formatter, "Type has formatter");
						var sType = oTable._oRowTemplate.getBindingInfo("type").formatter("Test");
						assert.equal(sType, "Navigation", "Type is Navigation when boolean is true");
						sType = oTable._oRowTemplate.getBindingInfo("type").formatter("False");
						assert.equal(sType, "Inactive", "Type is Navigation when boolean is false");
						break;
					default:
						assert.ok(oTable._oTable.getRowActionTemplate(), "Row action template exists");
						if (bIsBound) {
							var oBindingInfo = oTable._oTable.getRowActionTemplate().getBindingInfo("items");
							assert.ok(oBindingInfo, "BindingInfo for items exist");
							assert.ok(oBindingInfo.template.getVisible(), "RowAction is visible");
							assert.ok(oBindingInfo.template.isBound("type"), "Type property is bound");
						} else {
							assert.equal(oTable._oTable.getRowActionTemplate().getItems().length, 1, "With one item");
							assert.equal(oTable._oTable.getRowActionTemplate().getItems()[0].getType(), "Navigation", "Of type 'Navigation'");
							assert.equal(oTable._oTable.getRowActionCount(), 1, "Row action count");
						}
				}
			}
		});

		QUnit.test("Initialize without actions", function(assert) {
			this.assertNoInnerTableAction(assert);
		});

		QUnit.test("Initialize with actions", function(assert) {
			var oRowSettings = new RowSettings({
				rowActions: [
					new RowActionItem({type: "Navigation"})
				]
			});

			var oTable = new Table({
				type: sTableType,
				rowSettings: oRowSettings
			});

			return oTable.initialized().then(function() {
				this.assertInnerTableAction(assert, oTable);
			}.bind(this));
		});

		QUnit.test("Row Actions initialization different scenarios", function(assert) {
			// Scenario 1: Static RowAction + Static Visibility. Expected: All Rows have navigation.
			var oRowSettings = new RowSettings({
				rowActions: [
					new RowActionItem({type: "Navigation"})
				]
			});
			this.oTable.setRowSettings(oRowSettings);
			this.assertInnerTableAction(assert);
			oRowSettings.removeAllRowActions();

			// Scenario 2: Static RowAction + Bound Visibility. Expected: Only rows with stock String "Test" should have Navigation.
			oRowSettings = new RowSettings({
				rowActions: [
					new RowActionItem({
						type: "Navigation",
						visible: {
							path: 'stock',
							type: 'sap.ui.model.type.Boolean',
							formatter: function (sString) {
								return sString === "Test";
							}
						}
					})
				]
			});
			this.oTable.setRowSettings(oRowSettings);
			this.assertInnerTableActionFormatted(assert);
			oRowSettings.removeAllRowActions();

			this.oTable.setModel(new JSONModel({
				data: [{
					type: "Navigation"
				}]
			}));

			// Scenario 3: Bound RowAction + Static Visibility. Expected: All rows have navigation.
			oRowSettings = new RowSettings({
				rowActions: {
					path: "/data",
					template: new RowActionItem({
						type: "{type}",
						visible: true
					})
				}
			});
			this.oTable.setRowSettings(oRowSettings);
			this.assertInnerTableAction(assert, null, true);
			oRowSettings.removeAllRowActions();

			// Scenario 4: Bound RowAction Type + Bound Visibility. Expected: Only rows with stock String "Test" have Navigation.
			oRowSettings = new RowSettings({
				rowActions: {
					path: "/data",
					template: new RowActionItem({
						type: "{type}",
						visible: {
							path: 'stock',
							type: 'sap.ui.model.type.Boolean',
							formatter: function (sString) {
								return sString === "Test";
							}
						}
					})
				}
			});
			this.oTable.setRowSettings(oRowSettings);
			this.assertInnerTableActionFormatted(assert, null, true);
			oRowSettings.removeAllRowActions();
		});

		QUnit.test("Add and remove actions", function(assert) {
			var oTableInvalidationSpy = sinon.spy(this.oTable, "invalidate");
			var oRowActionTemplateDestroySpy;
			var oRowSettings = new RowSettings({
				rowActions: [
					new RowActionItem({type: "Navigation"})
				]
			});

			this.oTable.setRowSettings(oRowSettings);
			assert.equal(oTableInvalidationSpy.callCount, 0, "MDCTable was not invalidated");
			this.assertInnerTableAction(assert);
			oTableInvalidationSpy.reset();

			if (sTableType === "GridTable") {
				oRowActionTemplateDestroySpy = sinon.spy(this.oTable._oTable.getRowActionTemplate(), "destroy");
			}

			oRowSettings.removeAllRowActions();
			this.oTable.setRowSettings(oRowSettings);
			// assert.equal(oTableInvalidationSpy.callCount, 0, "MDCTable was not invalidated"); // setting row settings invalidates the table, so probably remove this assertion?
			this.assertNoInnerTableAction(assert);

			if (sTableType === "GridTable") {
				assert.equal(oRowActionTemplateDestroySpy.callCount, 1, "Row action template was destroyed");
			}
		});
	});

	QUnit.module("p13nMode", {
		beforeEach: function() {
			this.oTable = new Table();
			this.oTable.setEnableColumnResize(false);
			return this.oTable.initialized();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		assertToolbarButtons: function(assert, oMDCTable, sTitle) {
			if (typeof oMDCTable === "string") {
				sTitle = oMDCTable;
				oMDCTable = undefined;
			}

			var oTable = oMDCTable || this.oTable;
			var aModes = oTable.getP13nMode();
			var sTitlePrefix = sTitle ? sTitle + ": " : "";

			assert.ok(oTable._oP13nButton, sTitlePrefix + " - Table settings button exists");
			assert.equal(oTable._oP13nButton.getAriaHasPopup(), HasPopup.Dialog, "button has correct ariaHasPopup value");
			assert.ok(oTable._oToolbar.indexOfEnd(oTable._oP13nButton) >= 0, sTitlePrefix + " - Table settings button is contained in the toolbar");
			assert.equal(oTable._oP13nButton.getVisible(), aModes.length > 0 && !oTable._bHideP13nButton, sTitlePrefix + " - Table settings button is visible");
			assert.equal(FESRHelper.getSemanticStepname(oTable._oP13nButton, "press"), "mdc:tbl:p13n", "Correct FESR StepName");
		},
		assertAPI: function(assert, oMDCTable) {
			var oTable = oMDCTable || this.oTable;
			var aModes = oTable.getP13nMode();

			assert.strictEqual(oTable.isSortingEnabled(), aModes.includes(TableP13nMode.Sort), "#isSortingEnabled");
			assert.strictEqual(oTable.isFilteringEnabled(), aModes.includes(TableP13nMode.Filter), "#isFilteringEnabled");
		},
		assertColumnDnD: function(assert, oMDCTable) {
			var oTable = oMDCTable || this.oTable;
			var bEnabled = oTable.getP13nMode().indexOf("Column") > -1;

			assert.equal(oTable._oTable.getDragDropConfig()[0].getEnabled(), bEnabled, "DragDropConfig for column reordering");
		}
	});

	QUnit.test("Initialize without active modes", function(assert) {
		this.assertToolbarButtons(assert);
		this.assertAPI(assert);
		this.assertColumnDnD(assert);
	});

	QUnit.test("Initialize with active modes", function(assert) {
		var oTable = new Table({
			p13nMode: ["Sort", "Column"]
		});

		return oTable.initialized().then(function() {
			this.assertToolbarButtons(assert, oTable);
			this.assertAPI(assert, oTable);
			this.assertColumnDnD(assert, oTable);
		}.bind(this));
	});

	QUnit.test("Activate and deactivate", function(assert) {
		this.oTable.setP13nMode(["Sort"]);
		this.assertToolbarButtons(assert, "Activate 'Sort'");
		this.assertAPI(assert);
		this.assertColumnDnD(assert);

		this.oTable.setP13nMode(["Sort", "Column"]);
		this.assertToolbarButtons(assert, "Activate 'Column'");
		this.assertAPI(assert);
		this.assertColumnDnD(assert);

		this.oTable.setP13nMode(["Sort", "Column", "Filter"]);
		this.assertToolbarButtons(assert, "Activate 'Filter'");
		this.assertAPI(assert);
		this.assertColumnDnD(assert);

		this.oTable.setP13nMode(["Sort", "Filter"]);
		this.assertToolbarButtons(assert, "Deactivate 'Column'");
		this.assertAPI(assert);
		this.assertColumnDnD(assert);

		this.oTable.setP13nMode();
		this.assertToolbarButtons(assert, "Deactivate 'Sort' and 'Filter'");
		this.assertAPI(assert);
		this.assertColumnDnD(assert);

		this.oTable.setP13nMode();
		this.oTable._setShowP13nButton(false);
		this.assertToolbarButtons(assert, "_setShowP13nButton = false + No P13n");
		this.assertAPI(assert);
		this.assertColumnDnD(assert);

		this.oTable.setP13nMode(["Sort"]);
		this.oTable._setShowP13nButton(false);
		this.assertToolbarButtons(assert, "_setShowP13nButton = false + P13n");
		this.assertAPI(assert);
		this.assertColumnDnD(assert);

		this.oTable.setP13nMode(["Sort"]);
		this.oTable._setShowP13nButton(true);
		this.assertToolbarButtons(assert, "_setShowP13nButton = true + P13n");
		this.assertAPI(assert);
		this.assertColumnDnD(assert);
	});

	QUnit.test("Avoid unnecessary update", function(assert) {
		var oTableInvalidationSpy = sinon.spy(this.oTable, "invalidate");
		var oInnerTableInvalidationSpy = sinon.spy(this.oTable._oTable, "invalidate");

		this.oTable.setP13nMode();
		assert.equal(oTableInvalidationSpy.callCount, 0, "Deactivate modes if no modes are active: MDCTable was not invalidated");
		assert.equal(oInnerTableInvalidationSpy.callCount, 0, "Deactivate modes if no modes are active: The inner table was not invalidated");

		this.oTable.setP13nMode(["Sort", "Column", "Filter"]);
		oTableInvalidationSpy.reset();
		oInnerTableInvalidationSpy.reset();

		var oToolbar = this.oTable._oToolbar;
		var aP13nButtons = oToolbar.getEnd();

		this.oTable.setP13nMode(["Column", "Sort", "Filter"]);
		assert.equal(oTableInvalidationSpy.callCount, 0, "Activate modes that are already active: MDCTable was not invalidated");
		assert.equal(oInnerTableInvalidationSpy.callCount, 0, "Activate modes that are already active: The inner table was not invalidated");

		assert.ok(aP13nButtons.every(function(oButton) {
			return oButton.bIsDestroyed !== true;
		}), "The p13n buttons were not destroyed");

		assert.ok(aP13nButtons.every(function(oButton) {
			return oToolbar.indexOfEnd(oButton) > -1;
		}), "The p13n buttons are still in the toolbar");
	});

	QUnit.test("Current state", function(assert) {
		var aSortConditions = [{
			name: "test",
			descending: true
		}];
		var oFilterConditions = {
			name: [{
				isEmpty: null,
				operator: "EQ",
				validated: "NotValidated",
				values: ["test"]
			}]
		};

		assert.deepEqual(this.oTable.getCurrentState(), {}, "No modes active");

		this.oTable.setP13nMode(["Column"]);
		assert.deepEqual(this.oTable.getCurrentState(), {
			items: []
		}, "Activate 'Column'");

		this.oTable.addColumn(new Column({
			propertyKey: "test"
		}));
		assert.deepEqual(this.oTable.getCurrentState(), {
			items: [{name: "test"}]
		}, "Add a column");

		this.oTable.setP13nMode(["Column", "Sort"]);
		assert.deepEqual(this.oTable.getCurrentState(), {
			items: [{name: "test"}],
			sorters: []
		}, "Activate 'Sort'");

		this.oTable.setSortConditions({
			sorters: aSortConditions
		});
		assert.deepEqual(this.oTable.getCurrentState(), {
			items: [{name: "test"}],
			sorters: aSortConditions
		}, "Set sort conditions");

		this.oTable.setP13nMode(["Column", "Sort", "Filter"]);
		assert.deepEqual(this.oTable.getCurrentState(), {
			items: [{name: "test"}],
			sorters: aSortConditions,
			filter:  {}
		}, "Activate 'Filter'");

		this.oTable.setFilterConditions(oFilterConditions);
		assert.deepEqual(this.oTable.getCurrentState(), {
			items: [{name: "test"}],
			sorters: aSortConditions,
			filter: oFilterConditions
		}, "Set filter conditions");

		this.oTable.setP13nMode(["Column", "Filter"]);
		assert.deepEqual(this.oTable.getCurrentState(), {
			items: [{
				name: "test"
			}],
			filter: oFilterConditions
		}, "Deactivate 'Sort'");

		this.oTable.setP13nMode();
		assert.deepEqual(this.oTable.getCurrentState(), {}, "Deactivate 'Column' and 'Filter'");
	});

	QUnit.module("showDetailsButton", {
		beforeEach: function() {
			var oModel = new JSONModel();
			oModel.setData({
				testPath: [
					{test: "Test1"}, {test: "Test2"}, {test: "Test3"}, {test: "Test4"}, {test: "Test5"}
				]
			});

			this.oTable = new Table({
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "/testPath"
					}
				},
				type: new ResponsiveTableType({
					showDetailsButton: true
				}),
				columns: [
					new Column({
						header: "Column A",
						hAlign: "Begin",
						template: new Text({
							text: "{test}"
						}),
						extendedSettings: new ResponsiveColumnSettings({
							importance: "High"
						})
					}),
					new Column({
						header: "Column B",
						hAlign: "Begin",
						template: new Text({
							text: "{test}"
						}),
						extendedSettings: new ResponsiveColumnSettings({
							importance: "High"
						})
					}),
					new Column({
						header: "Column C",
						hAlign: "Begin",
						template: new Text({
							text: "{test}"
						}),
						extendedSettings: new ResponsiveColumnSettings({
							importance: "Medium"
						})
					}),
					new Column({
						header: "Column D",
						hAlign: "Begin",
						template: new Text({
							text: "{test}"
						}),
						extendedSettings: new ResponsiveColumnSettings({
							importance: "Low"
						})
					}),
					new Column({
						header: "Column E",
						hAlign: "Begin",
						template: new Text({
							text: "{test}"
						}),
						extendedSettings: new ResponsiveColumnSettings({
							importance: "Low"
						})
					}),
					new Column({
						header: "Column F",
						hAlign: "Begin",
						template: new Text({
							text: "{test}"
						}),
						extendedSettings: new ResponsiveColumnSettings({
							importance: "High"
						})
					})
				]
			});

			this.oTable.setModel(oModel);
			this.oTable.placeAt("qunit-fixture");
			this.oType = this.oTable.getType();
			Core.applyChanges();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Button creation", function(assert) {
		return TableQUnitUtils.waitForBinding(this.oTable).then(function() {
			var clock = sinon.useFakeTimers();
			var oRb = Core.getLibraryResourceBundle("sap.ui.mdc");

			assert.ok(this.oType._oShowDetailsButton, "button is created");
			assert.notOk(this.oType._oShowDetailsButton.getVisible(), "button is hidden since there are no popins");
			assert.strictEqual(this.oType._oShowDetailsButton.getItems()[0].getIcon(), "sap-icon://detail-more", "correct icon is set on the button");
			assert.strictEqual(this.oType._oShowDetailsButton.getItems()[0].getTooltip(), oRb.getText("table.SHOWDETAILS_TEXT"), "Correct tooltip");
			assert.strictEqual(this.oType._oShowDetailsButton.getItems()[1].getIcon(), "sap-icon://detail-less", "correct icon is set on the button");
			assert.strictEqual(this.oType._oShowDetailsButton.getItems()[1].getTooltip(), oRb.getText("table.HIDEDETAILS_TEXT"), "Correct tooltip");

			this.oTable._oTable.setContextualWidth("600px");
			Core.applyChanges();
			assert.ok(this.oType._oShowDetailsButton.getVisible(), "button is visible since table has popins");
			assert.strictEqual(this.oType._oShowDetailsButton.getSelectedKey(), "hideDetails", "hideDetails button selected");

			this.oType._oShowDetailsButton.getItems()[0].firePress();
			assert.strictEqual(this.oType._oShowDetailsButton.getSelectedKey(), "showDetails", "showDetails button selected");

			this.oTable._oTable.setContextualWidth("4444px");
			clock.tick(1);
			assert.notOk(this.oType._oShowDetailsButton.getVisible(), "button is hidden there are no popins");

			clock.restore();
		}.bind(this));
	});

	QUnit.test("Button placement", function(assert) {
		var clock = sinon.useFakeTimers();

		return this.oTable.initialized().then(function() {
			this.oTable._oTable.setContextualWidth("Tablet");
			Core.applyChanges();
			clock.tick(1);
			var bButtonAddedToToolbar = this.oTable._oTable.getHeaderToolbar().getEnd().some(function(oControl) {
				return oControl.getId() === this.oType._oShowDetailsButton.getId();
			}, this);
			assert.ok(bButtonAddedToToolbar, "Button is correctly added to the table header toolbar");

			this.oType.setShowDetailsButton(false);
			Core.applyChanges();
			clock.tick(1);
			assert.notOk(this.oType.getShowDetailsButton(), "showDetailsButton = false");
			bButtonAddedToToolbar = this.oTable._oTable.getHeaderToolbar().getEnd().some(function(oControl) {
				return this.oType._oShowDetailsButton && oControl.getId() === this.oType._oShowDetailsButton.getId();
			}, this);
			assert.notOk(bButtonAddedToToolbar, "Button is removed from the table header toolbar");
			assert.ok(!this.oType._oShowDetailsButton, "Button does not exist anymore");

			clock.restore();
		}.bind(this));
	});

	QUnit.test("Inner table hiddenInPopin property in Desktop mode", function(assert) {
		return this.oTable.initialized().then(function() {
			assert.strictEqual(this.oTable._oTable.getHiddenInPopin().length, 1, "getHiddenInPopin() contains only 1 value");
			assert.strictEqual(this.oTable._oTable.getHiddenInPopin()[0], "Low", "Low importance is added to the hiddenInPopin property");
		}.bind(this));
	});

	QUnit.test("Inner table hiddenInPopin property in Phone mode", function(assert) {
		// save original state
		var bDesktop = Device.system.desktop;
		var bTablet = Device.system.tablet;
		var bPhone = Device.system.phone;

		// overwrite for our test case
		Device.system.desktop = false;
		Device.system.tablet = false;
		Device.system.phone = true;
		Core.applyChanges();

		return this.oTable.initialized().then(function() {
			assert.strictEqual(this.oTable._oTable.getHiddenInPopin().length, 2, "getHiddenInPopin() contains only 1 value");
			assert.strictEqual(this.oTable._oTable.getHiddenInPopin()[0], "Low", "Low importance is added to the hiddenInPopin property");
			assert.strictEqual(this.oTable._oTable.getHiddenInPopin()[1], "Medium", "Medium importance is added to the hiddenInPopin property");

			// reset original state
			Device.system.desktop = bDesktop;
			Device.system.tablet = bTablet;
			Device.system.phone = bPhone;
		}.bind(this));
	});

	QUnit.test("Button should be hidden with filtering leads to no data and viceversa", function(assert) {
		return TableQUnitUtils.waitForBinding(this.oTable).then(function() {
			this.oTable._oTable.setContextualWidth("600px");
			Core.applyChanges();
			assert.ok(this.oType._oShowDetailsButton.getVisible(), "button is visible since table has popins");

			this.oTable._oTable.getBinding("items").filter(new Filter("test", "EQ", "foo"));
			assert.notOk(this.oType._oShowDetailsButton.getVisible(), "button is hidden since there are no visible items");

			this.oTable._oTable.getBinding("items").filter();
			assert.ok(this.oType._oShowDetailsButton.getVisible(), "button is visible since table has visible items and popins");
		}.bind(this));
	});

	QUnit.test("test detailsButtonSetting - overwrite default configuration of showDetailsButton", function(assert) {
		var clock = sinon.useFakeTimers();

		// save original state
		var bDesktop = Device.system.desktop;
		var bTablet = Device.system.tablet;
		var bPhone = Device.system.phone;

		// overwrite for our test case
		Device.system.desktop = false;
		Device.system.tablet = false;
		Device.system.phone = true;

		this.oType.setDetailsButtonSetting(["Medium", "High"]);

		return this.oTable.initialized().then(function() {
			this.oType._oShowDetailsButton.getItems()[0].firePress();
			clock.tick(1);
			this.oType._oShowDetailsButton.getItems()[1].firePress();
			clock.tick(1);

			var aImportance = this.oTable._oTable.getHiddenInPopin();
			assert.strictEqual(aImportance.length, 2, "ResponsiveTable property hiddenInPopin.length = 2");
			assert.notEqual(aImportance[0], "Low", "Default importance 'Low' is overwritten");
			assert.notEqual(aImportance[1], "Medium", "Default importance 'Medium' is overwritten");
			assert.strictEqual(aImportance[0], "Medium", "ResponsiveTable property hiddenInPopin[0] = 'Medium'");
			assert.strictEqual(aImportance[1], "High", "ResponsiveTable property hiddenInPopin[1] = 'High'");

			// reset original state
			Device.system.desktop = bDesktop;
			Device.system.tablet = bTablet;
			Device.system.phone = bPhone;

			clock.restore();
		}.bind(this));
	});

	QUnit.test("test multiSelectMode - ResponsiveTable type (switch mode after table creation)", function(assert) {
		var done = assert.async();
		var oTable = new Table({
			selectionMode: "Multi",
			type: "ResponsiveTable"
		});

		oTable.initialized().then(function() {
			assert.equal(oTable.getMultiSelectMode(), "Default", "MultiSelectMode is set to 'Default' on MDC table");
			assert.equal(oTable._oTable.getMultiSelectMode(), "SelectAll", "MultiSelectMode is set to 'SelectAll' on the inner table");
			oTable.setMultiSelectMode("ClearAll");
			assert.equal(oTable._oTable.getMultiSelectMode(), "ClearAll", "MultiSelectMode to is set to 'ClearAll' on the inner table");
			oTable.destroy();
			done();
		});
	});

	QUnit.test("test multiSelectMode - ResponsiveTable type (before table creation)", function(assert) {
		var done = assert.async();
		var oTable = new Table({
			selectionMode: "Multi",
			multiSelectMode: "ClearAll",
			type: "ResponsiveTable"
		});

		oTable.initialized().then(function() {
			assert.equal(oTable._oTable.getMultiSelectMode(), "ClearAll", "MultiSelectMode is set to is set to ClearAll type on the inner table");
			oTable.destroy();
			done();
		});
	});

	QUnit.module("Column resize", {
		before: function() {
			TableQUnitUtils.stubPropertyInfos(Table.prototype, [
				{
					name: "Name",
					label: "Name",
					path: "Name",
					groupable: true,
					aggregatable: true,
					dataType: "String",
					extension: {
						customAggregate: {}
					}
				}, {
					name: "Country",
					label: "Country",
					path: "Country",
					groupable: true,
					aggregatable: true,
					dataType: "String",
					extension: {
						customAggregate: {}
					}
				},
				{name: "name_country", label: "Complex Title & Description", propertyInfos: ["Name", "Country"]},
				{name: "Name_2", label: "Name 2", propertyInfos: ["Name"]},
				{name: "Name_3", label: "Name 3", propertyInfos: ["Name"]}
			]);
		},
		beforeEach: function() {
			return this.createTestObjects();

		},
		after: function() {
			TableQUnitUtils.restorePropertyInfos(Table.prototype);
		},
		afterEach: function() {
			this.destroyTestObjects();
		},
		createTestObjects: function(mSettings) {
			mSettings = Object.assign({
				enableColumnResize: true
			}, mSettings);

			var sTableView =
				'<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.ui.mdc" xmlns:mdcTable="sap.ui.mdc.table">' +
				'<Table enableColumnResize="' + mSettings.enableColumnResize + '" id="table" delegate=\'\{name: "sap/ui/mdc/odata/v4/TableDelegate"\}\'>' +
				'<columns>' +
				'<mdcTable:Column id="myTable--column0" header="column 0" propertyKey="Name" />' +
				'<mdcTable:Column id="myTable--column1" header="column 1" propertyKey="Country" />' +
				'<mdcTable:Column id="myTable--column2" header="column 2" propertyKey="name_country" />' +
				'</columns>' +
				'<customData>' +
				'<core:CustomData key="xConfig"'
				+ ' value=\'\\{\"aggregations\":\\{\"columns\":\\{\"name_country\":\\{\"width\":\"199px\"\\},\"Name_2\":\\{\"width\":\"159px\"\\},\"Name_3\":\\{\"width\":\"149px\"\\}\\}\\}\\}\'/>' +
				'</customData>' +
				'</Table></mvc:View>';

			return createAppEnvironment(sTableView, "Table").then(function(mCreatedApp){
				this.oView = mCreatedApp.view;
				this.oUiComponentContainer = mCreatedApp.container;
				this.oUiComponentContainer.placeAt("qunit-fixture");
				this.oTable = this.oView.byId("table");
				Core.applyChanges();
				ControlPersonalizationWriteAPI.restore({
					selector: this.oTable
				});
			}.bind(this)).then(function() {
				return this.oTable.getEngine().getModificationHandler().waitForChanges({
					element: this.oTable
				});
			}.bind(this));
		},
		destroyTestObjects: function() {
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test("Enable/Disable column resize with ResponsiveTable (TODO: SHOULD BE AN OPA TEST!)", function(assert) {
		var oTable = this.oTable;

		sinon.stub(ColumnResizer, "_isInTouchMode").returns(true);
		oTable.setType("ResponsiveTable");
		Core.applyChanges();

		return oTable.initialized().then(function() {
			assert.ok(oTable._oTable.getDependents()[0].isA("sap.m.plugins.ColumnResizer"),
				"ColumnResizer plugin is added to the ResponsiveTable by default");

			oTable.setEnableColumnResize(false);
			assert.notOk(oTable._oTable.getDependents()[0].getEnabled(), "Disabling column resize disables the ColumnResizer plugin");
			assert.strictEqual(getInnerColumnLabel(oTable.getColumns()[0]).getWrapping(), true, "Wrapping enabled on column label control");

			oTable.setEnableColumnResize(true);
			assert.ok(oTable._oTable.getDependents()[0].getEnabled(), "Enabling column resize enables the ColumnResizer plugin");
			assert.strictEqual(getInnerColumnLabel(oTable.getColumns()[0]).getWrapping(), false, "Wrapping disabled on column label control");

			oTable._oColumnHeaderMenu.openBy(oTable._oTable.getColumns()[0]);
			return oTable._fullyInitialized().then(function() {
				return oTable.finalizePropertyHelper();
			});
		}).then(function() {
			var oMenu = oTable._oColumnHeaderMenu;
			var oColumnResizerButton = oMenu._getAllEffectiveQuickActions().find(function(oQuickAction) {
				return oQuickAction.getContent()[0].getText() === Core.getLibraryResourceBundle("sap.m").getText("table.COLUMNMENU_RESIZE");
			});
			assert.ok(oColumnResizerButton, "Column resize button found in column menu");
		}).finally(function() {
			ColumnResizer._isInTouchMode.restore();
		});
	});

	QUnit.test("Enable/Disable column resize with GridTable with enableColumnResize=true initially", function(assert) {
		return this.oTable.initialized().then(function() {
			assert.ok(this.oTable._oTable.getColumns()[0].getResizable(), "Resizable property of the inner column is set to true");
			assert.ok(this.oTable._oTable.getColumns()[0].getAutoResizable(), "AutoResizable property of the inner column is set to true");
			assert.strictEqual(getInnerColumnLabel(this.oTable.getColumns()[0]).getWrapping(), false, "Wrapping disabled on column label control");

			this.oTable.setEnableColumnResize(false);
			assert.notOk(this.oTable._oTable.getColumns()[0].getAutoResizable(), "AutoResizable property of the inner column is set to false");
			assert.notOk(this.oTable._oTable.getColumns()[0].getResizable(), "Resizable property of the inner column is set to false");
			assert.strictEqual(getInnerColumnLabel(this.oTable.getColumns()[0]).getWrapping(), false, "Wrapping disabled on column label control");
		}.bind(this));
	});

	QUnit.test("Enable/Disable column resize with GridTable with enableColumnResize=false initially", function(assert) {
		this.destroyTestObjects();

		return this.createTestObjects({enableColumnResize: false}).then(function() {
			return this.oTable.initialized();
		}.bind(this)).then(function() {
			assert.notOk(this.oTable._oTable.getColumns()[0].getAutoResizable(), "AutoResizable property of the inner column is set to false");
			assert.notOk(this.oTable._oTable.getColumns()[0].getResizable(), "Resizable property of the inner column is set to false");
			assert.strictEqual(getInnerColumnLabel(this.oTable.getColumns()[0]).getWrapping(), false, "Wrapping disabled on column label control");

			this.oTable.setEnableColumnResize(true);
			assert.ok(this.oTable._oTable.getColumns()[0].getResizable(), "Resizable property of the inner column is set to true");
			assert.ok(this.oTable._oTable.getColumns()[0].getAutoResizable(), "AutoResizable property of the inner column is set to true");
			assert.strictEqual(getInnerColumnLabel(this.oTable.getColumns()[0]).getWrapping(), false, "Wrapping disabled on column label control");
		}.bind(this));
	});

	QUnit.test("Apply initial column width changes", function(assert) {
		return this.oTable.initialized().then(function() {
			assert.strictEqual(this.oTable._oTable.getColumns()[2].getWidth(), "199px", "Initial column");

			this.oTable.addColumn(new Column({
				propertyKey: "Name_2",
				header: "Name_2"
			}));
			assert.strictEqual(this.oTable._oTable.getColumns()[3].getWidth(), "159px", "Added column");

			this.oTable.insertColumn(new Column({
				propertyKey: "Name_3",
				header: "Name_3"
			}), 0);
			assert.strictEqual(this.oTable._oTable.getColumns()[0].getWidth(), "149px", "Inserted column");
		}.bind(this));
	});

	QUnit.skip("Resize GridTable column", function(assert) {
		var oTable = this.oTable;

		return oTable.initialized().then(function() {
			var fOnModificationSpy = sinon.spy(oTable, "_onModifications");
			var oColumn = oTable._oTable.getColumns()[0];

			assert.ok(oTable.getEngine().getController(oTable, "ColumnWidth"), "ColumnWidth controller registered");
			assert.notOk(oTable.getCurrentState().xConfig.aggregations && oTable.getCurrentState().xConfig.aggregations.length, "xConfig is empty");

			oTable._oTable.fireColumnResize({
				column: oColumn,
				width: "200px"
			});

			return wait(0).then(function() {
				assert.strictEqual(oTable.getCurrentState().xConfig.aggregations.columns["Name"].width, "200px",
					"xConfig contains column width information");
				assert.strictEqual(fOnModificationSpy.callCount, 1, "Table#_onModifications called");
				assert.strictEqual(oTable._oTable.getColumns()[0].getWidth(), "200px", "Width of inner column");
				fOnModificationSpy.restore();
			});
		});
	});

	QUnit.skip("Resize ResponsiveTable column", function(assert) {
		var oTable = this.oTable;

		oTable.setType("ResponsiveTable");
		Core.applyChanges();

		return oTable.initialized().then(function() {
			var fOnModificationSpy = sinon.spy(oTable, "_onModifications");
			var oColumn = oTable._oTable.getColumns()[0];
			var oColumnResizer = oTable._oTable.getDependents()[0];

			assert.ok(oTable.getEngine().getController(oTable, "ColumnWidth"), "ColumnWidth controller registered");
			assert.notOk(oTable.getCurrentState().xConfig.aggregations && oTable.getCurrentState().xConfig.aggregations.length, "xConfig is empty");

			oColumnResizer.fireColumnResize({
				column: oColumn,
				width: "200px"
			});

			return wait(0).then(function() {
				assert.strictEqual(oTable.getCurrentState().xConfig.aggregations.columns["Name"].width, "200px",
					"xConfig contains column width information");
				assert.strictEqual(fOnModificationSpy.callCount, 1, "Table#_onModifications called");
				assert.strictEqual(oTable._oTable.getColumns()[0].getWidth(), "200px", "Width of inner column");
				fOnModificationSpy.restore();
			});
		});
	});

	QUnit.module("Accessibility", {
		beforeEach: function() {
			this.oTable = new Table();
		},
		afterEach: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
		}
	});

	QUnit.test("Header Level Property added", function(assert) {
		var done = assert.async();
		this.oTable.setType("ResponsiveTable");
		assert.strictEqual(this.oTable.getHeaderLevel(), "Auto", "Header level set to the header");
		this.oTable.setHeaderLevel("H2");
		this.oTable.setHeader("Test Table");

		this.oTable.initialized().then(function() {
			assert.strictEqual(this.oTable._oTable.getHeaderToolbar().getContent()[0].getLevel(), "H2", "Header level changed");
			done();
		}.bind(this));
	});

	QUnit.test("Header Style Property added", function(assert) {
		var done = assert.async();
		this.oTable.setType("ResponsiveTable");

		this.oTable.initialized().then(function() {
			assert.strictEqual(this.oTable._oTable.getHeaderToolbar().getContent()[0].getTitleStyle(), "H4", "Header style set to the header");
			this.oTable.setHeaderStyle("H2");
			this.oTable.setHeader("Test Table");
			assert.strictEqual(this.oTable._oTable.getHeaderToolbar().getContent()[0].getTitleStyle(), "H2", "Header style changed");
			this.oTable.setHeaderStyle(null);
			assert.strictEqual(this.oTable._oTable.getHeaderToolbar().getContent()[0].getTitleStyle(), "H4", "Header style set to the header");
			done();
		}.bind(this));
	});

	QUnit.test("ACC Announcement of table after a FilterBar search", function(assert) {
		this.oTable.destroy();
		this.oTable = new Table({
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath"
				}
			},
			p13nMode: ["Filter"],
			columns: [
				new Column({
					propertyKey: "name",
					template: new Text({
						text: "{name}"
					})
				})
			],
			models: new JSONModel({
				testPath: [
					{"name": "A"},
					{"name": "B"},
					{"name": "C"},
					{"name": "D"},
					{"name": "A"}
				]
			})
		});
		var oFilter = new FilterBar();
		var fnAnnounceTableUpdate = sinon.spy(MTableUtil, "announceTableUpdate");

		TableQUnitUtils.stubPropertyInfos(this.oTable, [{
			name: "name",
			label: "Name",
			dataType: "String"
		}]);

		this.oTable.setFilter(oFilter);

		return TableQUnitUtils.waitForBinding(this.oTable).then(function() {
			oFilter.fireSearch();
			assert.ok(true, "Search is triggered.");
			assert.equal(this.oTable._bAnnounceTableUpdate, true, "Table internal flag _bAnnounceTableUpdate is set to true");

			this.oTable.getRowBinding().fireDataReceived(); // invoke event handler manually since we have a JSONModel
			assert.ok(fnAnnounceTableUpdate.calledOnce, "MTableUtil.announceTableUpdate is called once.");

			this.oTable.getRowBinding().fireDataReceived();
			assert.ok(fnAnnounceTableUpdate.calledOnce, "MTableUtil.announceTableUpdate is not called if the dataReceived is not caused by a filterbar search.");

			oFilter.fireSearch();
			assert.ok(true, "Search is triggered.");
			assert.equal(this.oTable._bAnnounceTableUpdate, true, "Table internal flag _bAnnounceTableUpdate is set to true");
			this.oTable.getRowBinding()._fireChange();
			// in some cases OData V4 doesn't trigger a data request, but the binding context changes and the item count has to be announced
			assert.ok(fnAnnounceTableUpdate.calledTwice, "MTableUtil.announceTableUpdate is called on binding change even if no data request is sent.");
			TableQUnitUtils.restorePropertyInfos(this.oTable);
			fnAnnounceTableUpdate.restore();
		}.bind(this));
	});

	QUnit.test("Avoid ACC Announcement of table if dataReceived is not fired by the FilterBar", function(assert) {
		this.oTable.destroy();
		this.oTable = new Table({
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath"
				}
			},
			p13nMode: ["Filter"],
			columns: [
				new Column({
					propertyKey: "name",
					template: new Text({
						text: "{name}"
					})
				})
			],
			models: new JSONModel({
				testPath: [
					{"name": "A"},
					{"name": "B"},
					{"name": "C"},
					{"name": "D"},
					{"name": "A"}
				]
			})
		});
		var oFilter = new FilterBar();
		var fnOnDataReceived = sinon.spy(this.oTable, "_onDataReceived");
		var fnAnnounceTableUpdate = sinon.spy(MTableUtil, "announceTableUpdate");

		TableQUnitUtils.stubPropertyInfos(this.oTable, [{
			name: "name",
			label: "Name",
			dataType: "String"
		}]);

		this.oTable.setFilter(oFilter);

		return TableQUnitUtils.waitForBinding(this.oTable).then(function() {
			this.oTable.getRowBinding().fireDataReceived(); // invoke event handler manually since we have a JSONModel
			assert.ok(fnOnDataReceived.called, "Event dataReceived is fired.");
			assert.equal(this.oTable._bAnnounceTableUpdate, undefined, "Table internal flag _bAnnounceTableUpdate is undefined");
			assert.notOk(fnAnnounceTableUpdate.called, "Function announceTableUpdate is never called.");
			TableQUnitUtils.restorePropertyInfos(this.oTable);
			fnAnnounceTableUpdate.restore();
		}.bind(this));
	});

	QUnit.module("DataStateIndicator", {
		beforeEach: function() {
			this.oDataStateIndicator = new DataStateIndicator({
				filter: function(oMessage) {
					return oMessage.getType() === "Error";
				},
				enableFiltering: true
			});

			this.oModel = sinon.createStubInstance(ODataModel);
			this.oTable = new Table({
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "/foo"
					}
				},
				type: "ResponsiveTable",
				columns: [
					new Column({
						header: new Text({
							text: "Column A"
						}),
						hAlign: "Begin",
						template: new Text({
							text: "Column A"
						}),
						extendedSettings: new ResponsiveColumnSettings({
							importance: "High"
						})
					})
				],
				dataStateIndicator: this.oDataStateIndicator
			});
			this.oTable.placeAt("qunit-fixture");
			this.oType = this.oTable.getType();
			Core.applyChanges();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("DataStateIndicator", function(assert) {
		var done = assert.async();

		var aMessages = [
			new Message({
				message: "A message",
				fullTarget: "/apath/somesubpath",
				target: "/apath/somesubpath",
				type: "Error"
			}),
			new Message({
				message: "A message",
				fullTarget: "/apath/somesubpath",
				target: "/apath/somesubpath",
				type: "Warning"
			})
		];
		var oDataState = {
			getChanges: function(){
				return {messages: aMessages};
			},
			getMessages: function(){
				return aMessages;
			}
		};

		var oListBinding = sinon.createStubInstance(ODataListBinding);
		oListBinding.getPath = function() {return "/apath";};
		oListBinding.getDataState = function() {return oDataState;};


		this.oTable.initialized().then(function() {
			var oBindingStub = sinon.stub(this.oTable, "getRowBinding");
			oBindingStub.returns(oListBinding);

			var oInnerBindingStub = sinon.stub(this.oTable._oTable, "getBinding");
			oInnerBindingStub.returns(oListBinding);

			var oError = new Filter("Key1", "EQ", "11");
			var oWarning = new Filter("Key2", "EQ", "11");
			var pFilterMessageResolve = Promise.resolve(oError);
			oListBinding.requestFilterForMessages.returns(pFilterMessageResolve);

			// simulate error message
			oListBinding.fireEvent("AggregatedDataStateChange", {dataState: oDataState});
			setTimeout(function() {
				assert.notOk(this.oDataStateIndicator.isFiltering(), "Message filter is not active");
				this.oDataStateIndicator._oLink.firePress();

				this.oTable.initialized().then(function() {
					assert.deepEqual(this.oTable._oTable.getBindingInfo("items").filters[0], oError, "The table rebinds and dataStateIndicator Filter is set to the bindingInfo");

					this.oDataStateIndicator = new DataStateIndicator({
						filter: function(oMessage) {
							return oMessage.getType() === "Warning";
						},
						enableFiltering: true
					});

					pFilterMessageResolve = Promise.resolve(oWarning);
					oListBinding.requestFilterForMessages.returns(pFilterMessageResolve);
					this.oTable.setDataStateIndicator(this.oDataStateIndicator);
					oListBinding.fireEvent("AggregatedDataStateChange", {dataState: oDataState});

					setTimeout(function() {
						this.oDataStateIndicator._oLink.firePress();
						this.oTable.initialized().then(function() {
							assert.deepEqual(this.oTable._oTable.getBindingInfo("items").filters[0], oWarning, "dataStateIndicator Filter is set to the right bindingInfo");
							done();
						}.bind(this));
					}.bind(this), 0);
				}.bind(this));
			}.bind(this), 0);
		}.bind(this));
	});

	QUnit.module("PropertyInfo handling", {
		beforeEach: function() {
			this.aProperties = [{
				name: "firstname",
				path: "firstname",
				label: "First Name",
				dataType: "String",
				visualSettings: {
					widthCalculation: {
						minWidth: 22
					}
				}
			}, {
				name: "lastname",
				path: "lastname",
				label: "Last Name",
				dataType: "String",
				exportSettings: {
					property: "lastname",
					textAlign: "Center"
				}
			}, {
				name: "age",
				path: "age",
				dataType: "String",
				label: "Age"
			}];
			this.aInitialProperties = [{
				name: "lastname",
				label: "Last Name",
				path: "lastname",
				dataType: "String"
			}, {
				name: "age",
				path: "age",
				label: "Age",
				dataType: "String"
			}];
			TableQUnitUtils.stubPropertyInfos(Table.prototype, this.aProperties);
		},
		afterEach: function() {
			if (this.oTable) {
				this.oTable.destroy();
				this.oFinalizePropertyHelperSpy.restore();
			}
			if (this.oFetchPropertiesSpy) {
				this.oFetchPropertiesSpy.restore();
			}
			TableQUnitUtils.restorePropertyInfos(Table.prototype);
		},
		createTable: function(mSettings) {
			this.oTable = new Table(Object.assign({
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "/testPath"
					}
				},
				columns: [
					new Column({
						id: "lastnamecol",
						template: new Text(),
						propertyKey: "lastname"
					}),
					new Column({
						id: "agecol",
						template: new Text(),
						propertyKey: "age"
					})
				],
				propertyInfo: this.aInitialProperties
			}, mSettings));
			this.oFinalizePropertyHelperSpy = sinon.spy(this.oTable, "finalizePropertyHelper");
			this.oTable.placeAt("qunit-fixture");
			Core.applyChanges();

			return this.oTable.awaitControlDelegate().then(function(oDelegate) {
				this.oFetchPropertiesSpy = sinon.spy(oDelegate, "fetchProperties");
				return this.oTable._fullyInitialized();
			}.bind(this));
		}
	});

	QUnit.test("Initialization without initial property infos", function(assert) {
		return this.createTable({propertyInfo: undefined}).then(function(oTable) {
			assert.equal(this.oFetchPropertiesSpy.callCount, 1, "Delegate.fetchProperties called");
			assert.ok(oTable.getPropertyHelper(), "PropertyHelper exists");
			assert.ok(oTable.isPropertyHelperFinal(), "PropertyHelper is final");
		}.bind(this));
	});

	QUnit.test("Initialization with initial property infos", function(assert) {
		return this.createTable().then(function(oTable) {
			assert.equal(this.oFetchPropertiesSpy.callCount, 0, "Delegate.fetchProperties not called");
			assert.ok(oTable.getPropertyHelper(), "PropertyHelper exists");
			assert.notOk(oTable.isPropertyHelperFinal(), "PropertyHelper is not final");
			assert.equal(oTable.getPropertyHelper().getProperties().length, this.aInitialProperties.length, "PropertyHelper has initial properties");
		}.bind(this));
	});

	QUnit.test("Property finalization when triggering the export", function(assert) {
		return this.createTable({enableExport: true}).then(function(oTable) {
			return oTable._createExportColumnConfiguration();
		}).then(function(oExportConfig) {
			assert.equal(this.oFinalizePropertyHelperSpy.callCount, 1, "Table#finalizePropertyHelper called");
			assert.deepEqual(oExportConfig, [{
				columnId: "lastnamecol",
				label: "Last Name",
				property: "lastname",
				textAlign: "Center",
				type: "String",
				width: ""
			}, {
				columnId: "agecol",
				label: "Age",
				property: "age",
				textAlign: "Begin",
				type: "String",
				width: ""
			}], "Export config");
		}.bind(this));
	});

	QUnit.test("Property finalization when adding a column with width calculation", function(assert) {
		return this.createTable({enableAutoColumnWidth: true}).then(function(oTable) {
			oTable.addColumn(new Column({
				template: new Text(),
				propertyKey: "firstname"
			}));
			return new Promise(function(resolve) {
				new ManagedObjectObserver(function() {
					resolve();
				}).observe(oTable.getColumns()[2].getInnerColumn(), {
					properties: ["width"]
				});
			});
		}).then(function() {
			assert.equal(this.oFinalizePropertyHelperSpy.callCount, 1, "Table#finalizePropertyHelper called");
			assert.equal(this.oTable.getColumns()[2].getInnerColumn().getWidth(), "23.0625rem", "Inner column width");
		}.bind(this));
	});

	QUnit.module("expand/collapse all", {
		afterEach: function() {
			if (this.oTable) {
				this.oTable.destroy();
				this.oGetSupportedFeaturesStub.restore();
				this.oExpandAllSpy.restore();
				this.oCollapseAllSpy.restore();
			}
		},
		createTable: function(mSettings, bExpandCollapseSupported) {
			this.oTable = new Table(Object.assign({
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "/testPath"
					}
				},
				columns: [
					new Column({
						id: "lastnamecol",
						template: new Text(),
						propertyKey: "lastname"
					}),
					new Column({
						id: "agecol",
						template: new Text(),
						propertyKey: "age"
					})
				]
			}, mSettings));
			this.oFinalizePropertyHelperSpy = sinon.spy(this.oTable, "finalizePropertyHelper");
			this.oTable.placeAt("qunit-fixture");
			Core.applyChanges();

			return this.oTable.awaitControlDelegate().then(function(oDelegate) {
				this.oDelegate = oDelegate;
				this.oGetSupportedFeaturesStub = sinon.stub(oDelegate, "getSupportedFeatures");
				this.oGetSupportedFeaturesStub.returns({
					expandAll: bExpandCollapseSupported,
					collapseAll: bExpandCollapseSupported
				});
				this.oExpandAllSpy = sinon.spy(oDelegate, "expandAll");
				this.oCollapseAllSpy = sinon.spy(oDelegate, "collapseAll");
				return TableQUnitUtils.waitForBinding(this.oTable);
			}.bind(this));
		}
	});

	QUnit.test("Delegate supports expand/collapse all", function(assert) {
		return this.createTable({
			models: new JSONModel({ testPath: [ {"lastname": "A"}, {"age": "B"} ] })
		}, true).then(function() {
			Core.applyChanges();

			assert.ok(this.oTable._oExpandAllButton, "Expand All Button was created");
			FESRHelper.setSemanticStepname(this.oTable._oExpandAllButton, "press", "mdc:tbl:expandAll");
			assert.ok(this.oTable._oExpandAllButton.getVisible(), "Expand All Button is visible");
			assert.ok(this.oTable._oExpandAllButton.getEnabled(), "Expand All Button is enabled");
			assert.ok(this.oTable._oExpandAllButton.getDomRef(), "Expand All button DOM ref exists");

			assert.ok(this.oTable._oCollapseAllButton, "Collapse All Button was created");
			FESRHelper.setSemanticStepname(this.oTable._oCollapseAllButton, "press", "mdc:tbl:collapseAll");
			assert.ok(this.oTable._oCollapseAllButton.getVisible(), "Collapse All Button is visible");
			assert.ok(this.oTable._oCollapseAllButton.getEnabled(), "Collapse All Button is enabled");
			assert.ok(this.oTable._oCollapseAllButton.getDomRef(), "Collapse All button DOM ref exists");
		}.bind(this));
	});

	QUnit.test("Delegate supports expand/collapse all, but no data", function(assert) {
		return this.createTable({
			models: new JSONModel({ testPath: [] })
		}, true).then(function() {
			Core.applyChanges();

			assert.ok(this.oTable._oExpandAllButton, "Expand All Button was created");
			assert.ok(this.oTable._oExpandAllButton.getVisible(), "Expand All Button is visible");
			assert.notOk(this.oTable._oExpandAllButton.getEnabled(), "Expand All Button is not enabled");
			assert.ok(this.oTable._oExpandAllButton.getDomRef(), "Expand All button DOM ref exists");

			assert.ok(this.oTable._oCollapseAllButton, "Collapse All Button was created");
			assert.ok(this.oTable._oCollapseAllButton.getVisible(), "Collapse All Button is visible");
			assert.notOk(this.oTable._oCollapseAllButton.getEnabled(), "Collapse All Button is not enabled");
			assert.ok(this.oTable._oCollapseAllButton.getDomRef(), "Collapse All button DOM ref exists");
		}.bind(this));
	});

	QUnit.test("Delegate does not support expand/collapse all", function(assert) {
		return this.createTable({
			models: new JSONModel({ testPath: [ {"lastname": "A", "age": 10}, {"lastname": "B", "age": 20} ] })
		}, false).then(function() {
			Core.applyChanges();

			assert.notOk(this.oTable._oExpandAllButton, "Expand All Button was not created");
			assert.notOk(this.oTable._oCollapseAllButton, "Collapse All Button was not created");
		}.bind(this));
	});
});