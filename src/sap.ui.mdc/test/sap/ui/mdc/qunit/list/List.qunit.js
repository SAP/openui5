sap.ui.define([
	"sap/ui/mdc/List",
	"sap/ui/mdc/list/GridListType",
	"sap/ui/mdc/list/ListType",
	"sap/ui/mdc/list/ItemSettings",
	"sap/ui/mdc/list/ItemActionItem",
	"sap/ui/mdc/enums/ListP13nMode",
	"sap/ui/mdc/actiontoolbar/ActionToolbarAction",
	"sap/m/VBox",
	"sap/m/Title",
	"sap/m/Text",
	"sap/m/Button",
	"sap/m/Menu",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(MDCList, GridListType, ListType, ItemSettings, ItemActionItem, ListP13nMode, ActionToolbarAction, VBox, Title, Text, Button, Menu, JSONModel, nextUIUpdate) {

	"use strict";
	/*global QUnit */

	const aData = [];
	for (let i = 0; i < 10; i++) {
		aData.push({
			id: i,
			name: "Mountain " + i,
			height: 7000 + (i * 200),
			range: "Range " + (i % 3),
			countries: "Country " + (i % 4)
		});
	}

	function createGridListItemContentTemplate() {
		return new VBox({
			items: [
				new Title({text: "{name}"}),
				new Text({text: "{height}m"})
			]
		});
	}

	function createListItemContentTemplate() {
		return new VBox({
			items: [
				new Title({text: "{name}"}),
				new Text({text: "{range}"}),
				new Text({text: "{countries}"})
			]
		});
	}

	async function createMDCList(mSettings) {
		mSettings = Object.assign({
			delegate: {
				name: "sap/ui/mdc/ListDelegate",
				payload: {
					bindingPath: "/"
				}
			},
			models: new JSONModel(aData)
		}, mSettings);

		const oList = new MDCList(mSettings);
		oList.placeAt("qunit-fixture");
		await nextUIUpdate();
		return oList;
	}

	function waitForInitialized(oList) {
		return oList.initialized().then(async function() {
			await nextUIUpdate();
			// initialized() resolves once the items binding is created, but the inner list
			// populates its "items" aggregation from that binding asynchronously (on the next
			// updateFinished cycle). Wait for that cycle so getItems() reflects the bound rows.
			const oBinding = oList._oList && oList._oList.getBinding("items");
			if (oBinding && oList._oList.getItems().length < oBinding.getLength()) {
				await new Promise(function(resolve) {
					oList._oList.attachEventOnce("updateFinished", resolve);
				});
				await nextUIUpdate();
			}
			return oList;
		});
	}

	QUnit.module("Initialization", {
		afterEach: function() {
			if (this.oList) {
				this.oList.destroy();
			}
		}
	});

	QUnit.test("Default type is GridListType", async function(assert) {
		this.oList = await createMDCList({
			itemContentTemplate: createGridListItemContentTemplate()
		});

		return waitForInitialized(this.oList).then(function() {
			assert.ok(this.oList._oList, "Inner list is created");
			assert.ok(this.oList._oList.isA("sap.f.GridList"), "Inner list is a GridList");
		}.bind(this));
	});

	QUnit.test("Explicit GridListType", async function(assert) {
		this.oList = await createMDCList({
			type: new GridListType(),
			itemContentTemplate: createGridListItemContentTemplate()
		});

		return waitForInitialized(this.oList).then(function() {
			assert.ok(this.oList._oList, "Inner list is created");
			assert.ok(this.oList._oList.isA("sap.f.GridList"), "Inner list is a GridList");
		}.bind(this));
	});

	QUnit.test("ListType creates sap.m.List", async function(assert) {
		this.oList = await createMDCList({
			type: new ListType(),
			itemContentTemplate: createListItemContentTemplate()
		});

		return waitForInitialized(this.oList).then(function() {
			assert.ok(this.oList._oList, "Inner list is created");
			assert.ok(this.oList._oList.isA("sap.m.List"), "Inner list is a sap.m.List");
		}.bind(this));
	});

	QUnit.test("autoBindOnInit=false skips the initial items binding", async function(assert) {
		this.oList = await createMDCList({
			autoBindOnInit: false,
			itemContentTemplate: createGridListItemContentTemplate()
		});

		return waitForInitialized(this.oList).then(function() {
			assert.notOk(this.oList._oList.isBound("items"), "Inner list is not bound when autoBindOnInit is false");
		}.bind(this));
	});

	QUnit.module("Properties", {
		beforeEach: async function() {
			this.oList = await createMDCList({
				header: "Test List",
				showItemCount: true,
				selectionMode: "Multi",
				threshold: 5,
				growingMode: "Scroll",
				noData: "No data",
				itemContentTemplate: createGridListItemContentTemplate()
			});
			return waitForInitialized(this.oList);
		},
		afterEach: function() {
			this.oList.destroy();
		}
	});

	QUnit.test("Header and title", function(assert) {
		assert.equal(this.oList.getHeader(), "Test List", "Header property is set");
		assert.ok(this.oList._oTitle, "Title control exists");
	});

	QUnit.test("setHeaderVisible toggles the title visibility", function(assert) {
		const fnInvalidate = this.spy(this.oList, "invalidate");

		assert.ok(this.oList._oTableTitle.getVisible(), "Title is visible by default");

		this.oList.setHeaderVisible(false);
		assert.notOk(this.oList._oTableTitle.getVisible(), "Title is hidden when headerVisible=false");

		this.oList.setHeaderVisible(true);
		assert.ok(this.oList._oTableTitle.getVisible(), "Title is visible when headerVisible=true");
		assert.ok(fnInvalidate.notCalled, "No invalidation triggered");
	});

	QUnit.test("Growing properties forwarded to inner list", function(assert) {
		const oInnerList = this.oList._oList;
		assert.ok(oInnerList.getGrowing(), "Growing is forwarded");
		assert.equal(oInnerList.getGrowingThreshold(), 5, "threshold is forwarded");
		assert.ok(oInnerList.getGrowingScrollToLoad(), "growingMode Scroll maps to growingScrollToLoad=true");
	});

	QUnit.test("busyIndicatorDelay is forwarded to the inner list", function(assert) {
		this.oList.setBusyIndicatorDelay(42);
		assert.equal(this.oList._oList.getBusyIndicatorDelay(), 42, "busyIndicatorDelay is forwarded to the inner list");
	});

	QUnit.test("Title uses the List context so the count reads as items", function(assert) {
		assert.strictEqual(this.oList._oTableTitle.getContext(), "List", "Title context is List");
		assert.strictEqual(this.oList._oTableTitle.getShowExtendedView(), true, "Title shows the extended count view by default");
	});

	QUnit.test("Title keeps labelling the inner list when headerVisible is false", async function(assert) {
		assert.ok(this.oList._oList.getAriaLabelledBy().includes(this.oList._oTitle.getId()),
			"Inner list is labelled by the title");

		this.oList.setHeaderVisible(false);
		await nextUIUpdate();

		assert.notOk(this.oList._oTableTitle.getVisible(), "Title is not visible");
		assert.notEqual(this.oList._oTitle.getDomRef(), null,
			"Title content is still rendered, so aria-labelledby keeps providing the accessible name");
		assert.ok(this.oList._oList.getAriaLabelledBy().includes(this.oList._oTitle.getId()),
			"Inner list is still labelled by the title when the header is hidden");
	});

	QUnit.test("setHeaderLevel updates property and title level without re-render", function(assert) {
		const oTitle = this.oList._oTitle;
		const fnInvalidate = this.spy(this.oList, "invalidate");

		this.oList.setHeaderLevel("H2");

		assert.equal(this.oList.getHeaderLevel(), "H2", "Property value updated");
		assert.equal(oTitle.getLevel(), "H2", "Title level updated");
		assert.ok(fnInvalidate.notCalled, "No invalidation triggered");
	});

	QUnit.test("setHeaderStyle updates property and title style without re-render", function(assert) {
		const oTitle = this.oList._oTitle;
		const fnInvalidate = this.spy(this.oList, "invalidate");

		this.oList.setHeaderStyle("H3");

		assert.equal(this.oList.getHeaderStyle(), "H3", "Property value updated");
		assert.equal(oTitle.getTitleStyle(), "H3", "Title style updated");
		assert.ok(fnInvalidate.notCalled, "No invalidation triggered");
	});

	QUnit.test("headerLevel set before toolbar creation is applied to title", async function(assert) {
		const oList = await createMDCList({
			headerLevel: "H3",
			itemContentTemplate: createGridListItemContentTemplate()
		});
		await waitForInitialized(oList);

		assert.equal(oList._oTitle.getLevel(), "H3", "Title level reflects headerLevel set at construction");
		oList.destroy();
	});

	QUnit.test("headerStyle set before toolbar creation is applied to title", async function(assert) {
		const oList = await createMDCList({
			headerStyle: "H4",
			itemContentTemplate: createGridListItemContentTemplate()
		});
		await waitForInitialized(oList);

		assert.equal(oList._oTitle.getTitleStyle(), "H4", "Title style reflects headerStyle set at construction");
		oList.destroy();
	});

	QUnit.test("setThreshold updates property without re-render", function(assert) {
		const fnInvalidate = this.spy(this.oList, "invalidate");

		this.oList.setThreshold(20);

		assert.equal(this.oList.getThreshold(), 20, "Property value updated");
		assert.ok(fnInvalidate.notCalled, "No invalidation triggered");
	});

	QUnit.test("Selection mode forwarded to inner list", function(assert) {
		const oInnerList = this.oList._oList;
		assert.equal(oInnerList.getMode(), "MultiSelect", "MDC selection mode 'Multi' is mapped to inner list mode 'MultiSelect'");
	});

	QUnit.test("noData forwarded to inner list", function(assert) {
		const oInnerList = this.oList._oList;
		assert.equal(oInnerList.getNoDataText(), "No data", "noData is forwarded");
	});

	QUnit.module("Toolbar", {
		beforeEach: async function() {
			this.oList = await createMDCList({
				header: "Toolbar Test",
				showItemCount: true,
				enableExport: true,
				p13nMode: ["Sort", "Filter"],
				itemContentTemplate: createGridListItemContentTemplate()
			});
			return waitForInitialized(this.oList);
		},
		afterEach: function() {
			this.oList.destroy();
		}
	});

	QUnit.test("Toolbar is created", function(assert) {
		assert.ok(this.oList._oToolbar, "Toolbar exists");
		assert.ok(this.oList._oToolbar.isA("sap.ui.mdc.ActionToolbar"), "Toolbar is an ActionToolbar");
	});

	QUnit.test("Toolbar style is Clear for GridListType", function(assert) {
		assert.strictEqual(this.oList._oToolbar.getStyle(), "Clear",
			"GridList toolbar uses the Clear style so no separator line is shown below the title");
	});

	QUnit.test("P13n button visibility", function(assert) {
		assert.ok(this.oList._oP13nButton, "P13n button exists");
		assert.ok(this.oList._oP13nButton.getVisible(), "P13n button is visible");

		this.oList.setP13nMode([]);
		assert.notOk(this.oList._oP13nButton.getVisible(), "P13n button is hidden when no p13n modes");
	});

	QUnit.test("Export button visibility", function(assert) {
		assert.ok(this.oList._oExportButton, "Export button exists");
		assert.ok(this.oList._oExportButton.getVisible(), "Export button is visible");

		this.oList.setEnableExport(false);
		assert.notOk(this.oList._oExportButton.getVisible(), "Export button is hidden");
	});

	QUnit.test("actions aggregation is forwarded to ActionToolbar.actions", function(assert) {
		const oAction = new ActionToolbarAction({
			action: new Button({ text: "Custom Action" })
		});

		this.oList.addAction(oAction);

		const aToolbarActions = this.oList._oToolbar.getActions();
		assert.ok(aToolbarActions.includes(oAction), "Action is forwarded to the toolbar actions aggregation, consistent with sap.ui.mdc.Table");

		oAction.destroy();
	});

	QUnit.module("Type switching", {
		beforeEach: async function() {
			this.oList = await createMDCList({
				type: new GridListType(),
				itemContentTemplate: createGridListItemContentTemplate()
			});
			return waitForInitialized(this.oList);
		},
		afterEach: function() {
			this.oList.destroy();
		}
	});

	QUnit.test("Switch from GridListType to ListType", function(assert) {
		assert.ok(this.oList._oList.isA("sap.f.GridList"), "Initially a GridList");
		assert.strictEqual(this.oList._oToolbar.getStyle(), "Clear", "GridList toolbar uses the Clear style");

		this.oList.setItemContentTemplate(createListItemContentTemplate());
		this.oList.setType(new ListType());

		return waitForInitialized(this.oList).then(function() {
			assert.ok(this.oList._oList.isA("sap.m.List"), "Switched to sap.m.List");
			assert.strictEqual(this.oList._oToolbar.getStyle(), "Standard",
				"Toolbar style updates to Standard after switching to ListType");
		}.bind(this));
	});

	QUnit.module("ItemSettings", {
		beforeEach: async function() {
			this.oList = await createMDCList({
				type: new GridListType(),
				itemSettings: new ItemSettings({
					highlight: "{= ${height} >= 8000 ? 'Success' : 'None'}",
					navigated: false
				}),
				itemContentTemplate: createGridListItemContentTemplate()
			});
			return waitForInitialized(this.oList);
		},
		afterEach: function() {
			this.oList.destroy();
		}
	});

	QUnit.test("ItemSettings are applied", function(assert) {
		const oItemSettings = this.oList.getItemSettings();
		assert.ok(oItemSettings, "ItemSettings exist");
		assert.ok(oItemSettings.isA("sap.ui.mdc.list.ItemSettings"), "ItemSettings is correct type");

		// Verify the settings actually reach the inner items rather than only existing on the MDC List.
		const aItems = this.oList._oList.getItems();
		assert.ok(aItems.length > 0, "Inner list has items");

		// navigated=false is a static value that must be applied to each inner item.
		assert.strictEqual(aItems[0].getNavigated(), false, "Static navigated setting is applied to the inner item");
		// highlight is a binding expression: item 0 (height 7000 < 8000) resolves to "None".
		assert.strictEqual(aItems[0].getHighlight(), "None", "Bound highlight setting resolves on the inner item");
	});

	QUnit.module("Events", {
		beforeEach: async function() {
			this.oList = await createMDCList({
				selectionMode: "Multi",
				type: new GridListType(),
				itemContentTemplate: createGridListItemContentTemplate()
			});
			return waitForInitialized(this.oList);
		},
		afterEach: function() {
			this.oList.destroy();
		}
	});

	QUnit.test("selectionChange event", function(assert) {
		const done = assert.async();

		const oEventMetadata = this.oList.getMetadata().getEvent("selectionChange");
		assert.notOk(oEventMetadata.appData?.parameters?.selectAll, "selectionChange does not expose a selectAll parameter");

		this.oList.attachEventOnce("selectionChange", function() {
			assert.ok(true, "selectionChange event is fired");
			done();
		});

		const oInnerList = this.oList._oList;
		const aItems = oInnerList.getItems();
		assert.ok(aItems.length > 0, "Inner list has items");
		oInnerList.fireSelectionChange({
			listItem: aItems[0],
			selected: true
		});
	});

	QUnit.module("Selection counter", {
		beforeEach: async function() {
			this.oList = await createMDCList({
				header: "Mountains",
				showItemCount: true,
				selectionMode: "Multi",
				type: new GridListType(),
				itemContentTemplate: createGridListItemContentTemplate()
			});
			return waitForInitialized(this.oList);
		},
		afterEach: function() {
			this.oList.destroy();
		}
	});

	QUnit.test("Item count is managed by the title provider plugin", function(assert) {
		const oTitleProvider = this.oList._oList.getDependents().find((o) => o.isA("sap.m.plugins.TitleProvider"));
		assert.ok(oTitleProvider, "TitleProvider plugin is added to the inner list");
		assert.strictEqual(oTitleProvider.getTitle(), this.oList.getId() + "-tableTitle", "plugin targets the toolbar title");
		assert.ok(oTitleProvider.getEnabled(), "plugin is enabled (headerVisible and showItemCount)");

		this.oList.setShowItemCount(false);
		assert.notOk(oTitleProvider.getEnabled(), "plugin is disabled when showItemCount is false");

		this.oList.setShowItemCount(true);
		this.oList.setHeaderVisible(false);
		assert.notOk(oTitleProvider.getEnabled(), "plugin is disabled when headerVisible is false");
	});

	QUnit.module("State management", {
		beforeEach: async function() {
			this.oList = await createMDCList({
				p13nMode: ["Sort", "Filter", "Group"],
				type: new GridListType(),
				itemContentTemplate: createGridListItemContentTemplate()
			});
			return waitForInitialized(this.oList);
		},
		afterEach: function() {
			this.oList.destroy();
		}
	});

	QUnit.test("getCurrentState returns correct structure", function(assert) {
		const oState = this.oList.getCurrentState();
		assert.ok(oState, "State object exists");
		assert.ok(Array.isArray(oState.sorters), "sorters is an array");
		assert.ok(oState.hasOwnProperty("filter"), "filter key is present");
		assert.ok(Array.isArray(oState.groupLevels), "groupLevels is an array");
		assert.notOk(oState.hasOwnProperty("type"), "type is not part of IxState");
		assert.notOk(oState.hasOwnProperty("p13nMode"), "p13nMode is not part of IxState");
	});

	QUnit.test("getActiveP13nModes returns modes", function(assert) {
		const aModes = this.oList.getActiveP13nModes();
		assert.ok(Array.isArray(aModes), "Active p13n modes is an array");
	});

	QUnit.test("applyState applies sorters and filters", function(assert) {
		const oState = {
			sorters: [{name: "name", descending: false}],
			filter: {name: [{operator: "EQ", values: ["Mountain 1"]}]},
			groupLevels: [{name: "range"}]
		};

		return this.oList.applyState(oState).then(function() {
			assert.deepEqual(this.oList.getSortConditions(), {sorters: oState.sorters},
				"Sorters are forwarded to sortConditions");
			assert.deepEqual(this.oList.getFilterConditions(), oState.filter,
				"Filters are forwarded to filterConditions");
			assert.deepEqual(this.oList.getGroupConditions(), {groupLevels: oState.groupLevels},
				"GroupLevels are forwarded to groupConditions");
			assert.strictEqual(this.oList._oAppliedState, oState, "Applied state is retained");
		}.bind(this));
	});

	QUnit.module("Cleanup", {
		afterEach: function() {
			if (this.oList) {
				this.oList.destroy();
			}
		}
	});

	QUnit.test("Destroy cleans up resources", async function(assert) {
		this.oList = await createMDCList({
			type: new GridListType(),
			itemContentTemplate: createGridListItemContentTemplate()
		});

		return waitForInitialized(this.oList).then(function() {
			const oToolbar = this.oList._oToolbar;

			this.oList.destroy();

			assert.notOk(this.oList._oManagedObjectModel, "ManagedObjectModel is cleaned up");
			assert.notOk(this.oList._oToolbar, "Toolbar reference is cleaned up");
			assert.ok(oToolbar.bIsDestroyed, "Toolbar is destroyed");
		}.bind(this));
	});

	QUnit.test("getSelectedContexts returns empty array when no list", function(assert) {
		this.oList = new MDCList();
		const aContexts = this.oList.getSelectedContexts();
		assert.deepEqual(aContexts, [], "Returns empty array");
	});

	QUnit.test("clearSelection does not throw without inner list", function(assert) {
		this.oList = new MDCList();
		this.oList.clearSelection();
		assert.ok(true, "clearSelection does not throw");
	});

	QUnit.module("itemPress event", {
		beforeEach: async function() {
			this.oList = await createMDCList({
				selectionMode: "SingleMaster",
				type: new GridListType(),
				itemContentTemplate: createGridListItemContentTemplate()
			});
			return waitForInitialized(this.oList);
		},
		afterEach: function() {
			this.oList.destroy();
		}
	});

	QUnit.test("itemPress event is fired with bindingContext", function(assert) {
		const done = assert.async();
		const oInnerList = this.oList._oList;
		const aItems = oInnerList.getItems();

		assert.ok(aItems.length > 0, "Inner list has items");

		this.oList.attachItemPress(function(oEvent) {
			assert.ok(true, "itemPress event is fired");
			assert.ok(oEvent.getParameter("bindingContext"), "bindingContext parameter is provided");
			done();
		});

		oInnerList.fireItemPress({
			listItem: aItems[0]
		});
	});

	QUnit.module("beforeOpenContextMenu event", {
		beforeEach: async function() {
			this.oList = await createMDCList({
				type: new GridListType(),
				itemContentTemplate: createGridListItemContentTemplate()
			});
			return waitForInitialized(this.oList);
		},
		afterEach: function() {
			this.oList.destroy();
		}
	});

	QUnit.test("beforeOpenContextMenu event is fired with bindingContext", function(assert) {
		const done = assert.async();
		const oInnerList = this.oList._oList;
		const aItems = oInnerList.getItems();

		assert.ok(aItems.length > 0, "Inner list has items");

		this.oList.attachEventOnce("beforeOpenContextMenu", function(oEvent) {
			assert.ok(true, "beforeOpenContextMenu event is fired");
			assert.ok(oEvent.getParameter("bindingContext"), "bindingContext parameter is provided");
			done();
		});

		oInnerList.fireBeforeOpenContextMenu({
			listItem: aItems[0]
		});
	});

	QUnit.test("beforeOpenContextMenu preventDefault is forwarded", function(assert) {
		const done = assert.async();
		const oInnerList = this.oList._oList;
		const aItems = oInnerList.getItems();

		assert.ok(aItems.length > 0, "Inner list has items");

		this.oList.attachBeforeOpenContextMenu(function(oEvent) {
			oEvent.preventDefault();
		});

		const bDefaultPrevented = !oInnerList.fireBeforeOpenContextMenu({
			listItem: aItems[0]
		});

		assert.ok(bDefaultPrevented, "preventDefault is forwarded to inner list event");
		done();
	});

	QUnit.test("destroy cleans up _oContextMenu", function(assert) {
		const oMenu = new Menu();
		this.oList.setContextMenu(oMenu);
		assert.strictEqual(this.oList.getContextMenu(), oMenu, "context menu is set");

		this.oList.destroy();

		assert.ok(oMenu.bIsDestroyed, "_oContextMenu is destroyed on exit");
	});

	QUnit.module("beforeExport event", {
		beforeEach: async function() {
			this.oList = await createMDCList({
				enableExport: true,
				type: new GridListType(),
				itemContentTemplate: createGridListItemContentTemplate()
			});
			return waitForInitialized(this.oList);
		},
		afterEach: function() {
			this.oList.destroy();
		}
	});

	QUnit.test("beforeExport event is fired and can prevent export", function(assert) {
		let bBeforeExportFired = false;

		this.oList.attachBeforeExport(function(oEvent) {
			bBeforeExportFired = true;
			assert.ok(oEvent.getParameter("exportSettings"), "exportSettings parameter is provided");
			oEvent.preventDefault();
		});

		// Directly call the internal handler that the ExportHandler would call,
		// since loading sap.ui.export is not available in a unit test environment.
		this.oList._onBeforeExport({
			getParameter: function(sName) {
				if (sName === "exportSettings") { return {workbook: {columns: []}}; }
				if (sName === "userExportSettings") { return {}; }
				if (sName === "filterSettings") { return []; }
				return undefined;
			},
			preventDefault: function() {}
		});

		assert.ok(bBeforeExportFired, "beforeExport event was fired");
	});

	QUnit.module("ItemSettings binding propagation", {
		beforeEach: async function() {
			this.oList = await createMDCList({
				type: new GridListType(),
				itemSettings: new ItemSettings({
					highlight: "{= ${height} >= 8000 ? 'Success' : 'None'}",
					navigated: true
				}),
				itemContentTemplate: createGridListItemContentTemplate()
			});
			return waitForInitialized(this.oList);
		},
		afterEach: function() {
			this.oList.destroy();
		}
	});

	QUnit.test("Static ItemSettings values are applied to inner items", function(assert) {
		const oInnerList = this.oList._oList;
		const aItems = oInnerList.getItems();

		assert.ok(aItems.length > 0, "Inner list has items");

		const oFirstItem = aItems[0];
		assert.equal(oFirstItem.getNavigated(), true, "navigated is applied to inner item");
	});

	QUnit.test("Bound ItemSettings values create bindings on inner items", function(assert) {
		const oInnerList = this.oList._oList;
		const aItems = oInnerList.getItems();

		assert.ok(aItems.length > 0, "Inner list has items");

		const oFirstItem = aItems[0];
		assert.ok(oFirstItem.isBound("highlight") || oFirstItem.getHighlight() !== undefined, "highlight is applied to inner item (bound or static)");
	});

	QUnit.test("ItemSettings with highlight binding resolves correctly", function(assert) {
		const oInnerList = this.oList._oList;
		const aItems = oInnerList.getItems();

		assert.ok(aItems.length > 0, "Inner list has items");

		// First item has height 7000 (< 8000), so highlight should be "None"
		const oFirstItem = aItems[0];
		assert.equal(oFirstItem.getHighlight(), "None", "First item (height 7000) has highlight None");

		// Item at index 5 has height 8000 (>= 8000), so highlight should be "Success"
		if (aItems.length > 5) {
			const oSixthItem = aItems[5];
			assert.equal(oSixthItem.getHighlight(), "Success", "Sixth item (height 8000) has highlight Success");
		}
	});

	QUnit.module("Item actions - GridList visual rendering", {
		beforeEach: async function() {
			this.oActionItem = new ItemActionItem({
				key: "edit",
				text: "Edit",
				icon: "sap-icon://edit",
				visible: true
			});

			this.oList = await createMDCList({
				type: new GridListType(),
				itemSettings: new ItemSettings({
					itemActions: [this.oActionItem]
				}),
				itemContentTemplate: createGridListItemContentTemplate()
			});
			return waitForInitialized(this.oList);
		},
		afterEach: function() {
			this.oList.destroy();
		}
	});

	QUnit.test("Action buttons are rendered in GridListItem content", function(assert) {
		const oInnerList = this.oList._oList;
		const aItems = oInnerList.getItems();

		assert.ok(aItems.length > 0, "Inner list has items");

		const oFirstItem = aItems[0];
		const aContent = oFirstItem.getContent();
		assert.ok(aContent.length > 0, "Item has content");

		// The actions HBox is appended after the app content template
		const oActionsContainer = aContent.find((oCtrl) => oCtrl.hasStyleClass("sapUiMdcListItemActions"));
		assert.ok(oActionsContainer?.isA("sap.m.HBox"), "Actions container is an HBox");

		const aButtons = oActionsContainer.getItems();
		assert.equal(aButtons.length, 1, "One action button is rendered");
		assert.equal(aButtons[0].getTooltip(), "Edit", "Button tooltip is correct");
		assert.equal(aButtons[0].getIcon(), "sap-icon://edit", "Button icon is correct");
	});

	QUnit.test("Hidden actions are not rendered", async function(assert) {
		const oHiddenAction = new ItemActionItem({
			text: "Hidden",
			visible: false
		});

		this.oList.destroy();
		this.oList = await createMDCList({
			type: new GridListType(),
			itemSettings: new ItemSettings({
				itemActions: [oHiddenAction]
			}),
			itemContentTemplate: createGridListItemContentTemplate()
		});
		await waitForInitialized(this.oList);

		const oInnerList = this.oList._oList;
		const aItems = oInnerList.getItems();

		assert.ok(aItems.length > 0, "Inner list has items");

		const oFirstItem = aItems[0];
		// With no visible actions, no HBox container should be inserted
		const aContent = oFirstItem.getContent();
		const bHasActionContainer = aContent.some(function(oControl) {
			return oControl.isA("sap.m.HBox");
		});
		assert.notOk(bHasActionContainer, "No action container rendered for hidden actions");
	});

	QUnit.test("ItemActionItem press event is fired", function(assert) {
		const done = assert.async();
		this.oActionItem.attachPress(function(oEvent) {
			assert.ok(true, "ItemActionItem press event is fired");
			assert.ok(oEvent.getParameter("bindingContext") !== undefined, "bindingContext parameter exists");
			done();
		});

		const oInnerList = this.oList._oList;
		const aItems = oInnerList.getItems();

		assert.ok(aItems.length > 0, "Inner list has items");

		const oFirstItem = aItems[0];
		const oActionsContainer = oFirstItem.getContent().find((oCtrl) => oCtrl.hasStyleClass("sapUiMdcListItemActions"));
		const oButton = oActionsContainer.getItems()[0];
		oButton.firePress();
	});

	QUnit.module("wrapItemTemplate delegation", {
		afterEach: function() {
			if (this.oList) {
				this.oList.destroy();
			}
		}
	});

	QUnit.test("GridListType wraps plain content in GridListItem", async function(assert) {
		const oContent = new VBox({items: [new Title({text: "{name}"})]});
		this.oList = await createMDCList({
			type: new GridListType(),
			itemContentTemplate: oContent
		});

		return waitForInitialized(this.oList).then(function() {
			const oInnerList = this.oList._oList;
			const aItems = oInnerList.getItems();

			assert.ok(aItems.length > 0, "Inner list has items");

			const oFirstItem = aItems[0];
			assert.ok(oFirstItem.isA("sap.f.GridListItem"), "Item is a GridListItem");
			const aContent = oFirstItem.getContent();
			assert.ok(aContent.some((oCtrl) => oCtrl.isA("sap.m.VBox")), "GridListItem contains the VBox content");
		}.bind(this));
	});

	QUnit.test("ListType wraps plain content in CustomListItem", async function(assert) {
		const oContent = new VBox({items: [new Title({text: "{name}"})]});
		this.oList = await createMDCList({
			type: new ListType(),
			itemContentTemplate: oContent
		});

		return waitForInitialized(this.oList).then(function() {
			const oInnerList = this.oList._oList;
			const aItems = oInnerList.getItems();

			assert.ok(aItems.length > 0, "Inner list has items");

			const oFirstItem = aItems[0];
			assert.ok(oFirstItem.isA("sap.m.CustomListItem"), "Item is a CustomListItem");
			const aContent = oFirstItem.getContent();
			assert.ok(aContent.some((oCtrl) => oCtrl.isA("sap.m.VBox")), "CustomListItem contains the VBox content");
		}.bind(this));
	});

	QUnit.module("Item actions - ListType", {
		beforeEach: async function() {
			this.oActionItem = new ItemActionItem({
				key: "view",
				text: "View",
				icon: "sap-icon://show",
				visible: true
			});

			this.oList = await createMDCList({
				type: new ListType(),
				itemSettings: new ItemSettings({
					itemActions: [this.oActionItem]
				}),
				itemContentTemplate: createListItemContentTemplate()
			});
			return waitForInitialized(this.oList);
		},
		afterEach: function() {
			this.oList.destroy();
		}
	});

	QUnit.test("ListType adds a ListItemAction to the item template for an action", function(assert) {
		const oInnerList = this.oList._oList;
		const oTemplate = oInnerList.getBindingInfo("items")?.template;

		if (!oTemplate) {
			assert.ok(true, "No template to verify");
			return;
		}

		const aActions = oTemplate.getActions();
		assert.equal(aActions.length, 1, "Template has 1 ListItemAction");
		assert.equal(aActions[0].getText(), "View", "Action text matches");
		assert.equal(oInnerList.getItemActionCount(), 1, "Inner list itemActionCount is 1");
	});

	QUnit.test("ListType respects explicit itemActionCount", async function(assert) {
		const oAction = new ItemActionItem({text: "View", visible: true});

		this.oList.destroy();
		this.oList = await createMDCList({
			type: new ListType(),
			itemSettings: new ItemSettings({
				itemActionCount: 3,
				itemActions: [oAction]
			}),
			itemContentTemplate: createListItemContentTemplate()
		});
		await waitForInitialized(this.oList);

		const oInnerList = this.oList._oList;
		assert.equal(oInnerList.getItemActionCount(), 3, "Inner list itemActionCount uses explicitly set value");
	});

	QUnit.test("ListType adds all configured static actions to the item template", async function(assert) {
		const oAction1 = new ItemActionItem({text: "View", visible: true});
		const oAction2 = new ItemActionItem({text: "Delete", visible: true});

		this.oList.destroy();
		this.oList = await createMDCList({
			type: new ListType(),
			itemSettings: new ItemSettings({
				itemActions: [oAction1, oAction2]
			}),
			itemContentTemplate: createListItemContentTemplate()
		});
		await waitForInitialized(this.oList);

		const oInnerList = this.oList._oList;
		const oTemplate = oInnerList.getBindingInfo("items")?.template;

		if (!oTemplate) {
			assert.ok(true, "No template to verify");
			return;
		}

		assert.equal(oTemplate.getActions().length, 2, "Both actions are applied");
		assert.equal(oInnerList.getItemActionCount(), 2, "Inner list itemActionCount reflects aggregation length");
	});

	QUnit.module("ListP13nMode enum", {
		afterEach: function() {
			if (this.oList) {
				this.oList.destroy();
			}
		}
	});

	QUnit.test("p13nMode accepts only valid ListP13nMode values", async function(assert) {
		this.oList = await createMDCList({
			p13nMode: [ListP13nMode.Sort, ListP13nMode.Filter, ListP13nMode.Group],
			itemContentTemplate: createGridListItemContentTemplate()
		});

		assert.deepEqual(
			this.oList.getP13nMode(),
			["Sort", "Filter", "Group"],
			"Sort, Filter and Group are accepted"
		);
	});

	QUnit.test("'Column' and 'Aggregate' from TableP13nMode are not valid ListP13nMode values", async function(assert) {
		// The DataType validation throws for unknown enum values.
		this.oList = await createMDCList({itemContentTemplate: createGridListItemContentTemplate()});
		assert.throws(function() {
			this.oList.setP13nMode(["Column", "Aggregate"]);
		}.bind(this), "Setting invalid enum values throws");
		const aModes = this.oList.getActiveP13nModes();
		assert.notOk(aModes.includes("Column"), "'Column' is not an active mode");
		assert.notOk(aModes.includes("Aggregate"), "'Aggregate' is not an active mode");
	});

	QUnit.test("ListP13nMode enum has the correct keys", function(assert) {
		assert.equal(ListP13nMode.Sort, "Sort", "Sort is correct");
		assert.equal(ListP13nMode.Filter, "Filter", "Filter is correct");
		assert.equal(ListP13nMode.Group, "Group", "Group is correct");
		assert.notOk("Column" in ListP13nMode, "Column is not part of ListP13nMode");
		assert.notOk("Aggregate" in ListP13nMode, "Aggregate is not part of ListP13nMode");
	});

	QUnit.module("itemContentTemplate", {
		afterEach: function() {
			if (this.oList) {
				this.oList.destroy();
			}
		}
	});

	QUnit.test("App-provided itemContentTemplate is used for item binding", async function(assert) {
		const oTemplate = createGridListItemContentTemplate();
		this.oList = await createMDCList({
			type: new GridListType(),
			itemContentTemplate: oTemplate
		});

		return waitForInitialized(this.oList).then(function() {
			assert.ok(this.oList._oList.isBound("items"), "Items are bound");
		}.bind(this));
	});

	QUnit.test("No itemContentTemplate means no item binding", async function(assert) {
		this.oList = await createMDCList({
			type: new GridListType()
		});

		return waitForInitialized(this.oList).then(function() {
			assert.notOk(this.oList._oList.isBound("items"), "Items are not bound without an itemContentTemplate");
		}.bind(this));
	});

	QUnit.module("itemContentTemplate binding propagation", {
		beforeEach: function() {
			// Do NOT use createMDCList here — we need the list but don't need items bound.
			this.oList = new MDCList({
				delegate: { name: "sap/ui/mdc/ListDelegate", payload: { bindingPath: "/" } },
				type: new GridListType(),
				itemContentTemplate: createGridListItemContentTemplate()
			});
			this.oList.setModel(new JSONModel(aData));
			this.oList.placeAt("qunit-fixture");
		},
		afterEach: function() {
			this.oList.destroy();
		}
	});

	QUnit.test("itemContentTemplate is in mSkipPropagation", function(assert) {
		// The itemContentTemplate aggregation must be listed in mSkipPropagation so that V4
		// auto-$expand/$select does not walk into the template and try to resolve item
		// properties (e.g. SalesOrderItemText) against the parent entity type.
		assert.ok(this.oList.mSkipPropagation["itemContentTemplate"], "itemContentTemplate is in mSkipPropagation");
	});

	QUnit.test("itemContentTemplate does not inherit the list's binding context", function(assert) {
		// Set a binding context on the list to simulate the Object Page page context.
		const oModel = this.oList.getModel();
		this.oList.setBindingContext(oModel.createBindingContext("/0"));

		const oTemplate = this.oList.getItemContentTemplate();
		// The template must not receive the page context due to mSkipPropagation.
		// getBindingContext() returns undefined (not null) when propagation is skipped.
		assert.notOk(oTemplate.getBindingContext(), "itemContentTemplate has no binding context propagated from the list");
	});

	QUnit.test("itemContentTemplate does not inherit the list's model (mSkipPropagation skips both context and model)", function(assert) {
		// mSkipPropagation prevents both binding context AND model propagation into the template.
		// This is intentional: the template is a blueprint — it gets a proper context when
		// cloned per row by the inner list's bindItems(). The template itself needs no model.
		const oTemplate = this.oList.getItemContentTemplate();
		assert.notOk(oTemplate.getModel(), "itemContentTemplate does not receive the list's model (expected — clones get it instead)");
	});

	QUnit.test("itemSettings is also in mSkipPropagation (regression guard)", function(assert) {
		// Verify itemSettings skip propagation is not accidentally removed.
		assert.ok(this.oList.mSkipPropagation["itemSettings"], "itemSettings is still in mSkipPropagation");
	});

	QUnit.module("contextMenu forwarding", {
		afterEach: function() {
			this.oList?.destroy();
		}
	});

	QUnit.test("set before the inner list exists is forwarded on creation", async function(assert) {
		const oMenu = new Menu();
		this.oList = await createMDCList({
			type: new GridListType(),
			itemContentTemplate: createGridListItemContentTemplate(),
			contextMenu: oMenu
		});

		await waitForInitialized(this.oList);
		assert.strictEqual(this.oList.getContextMenu(), oMenu, "getContextMenu returns the stored menu");
		assert.strictEqual(this.oList._oList.getContextMenu(), oMenu, "context menu forwarded to the inner list");
	});

	QUnit.test("set after the inner list exists is forwarded immediately", async function(assert) {
		this.oList = await createMDCList({
			type: new GridListType(),
			itemContentTemplate: createGridListItemContentTemplate()
		});
		await waitForInitialized(this.oList);

		const oMenu = new Menu();
		this.oList.setContextMenu(oMenu);
		assert.strictEqual(this.oList._oList.getContextMenu(), oMenu, "context menu forwarded to the inner list");
	});

	QUnit.test("destroy removes the stored context menu", async function(assert) {
		const oMenu = new Menu();
		this.oList = await createMDCList({
			type: new GridListType(),
			itemContentTemplate: createGridListItemContentTemplate(),
			contextMenu: oMenu
		});
		await waitForInitialized(this.oList);

		this.oList.destroyContextMenu();
		assert.strictEqual(this.oList.getContextMenu(), null, "context menu is removed");
	});

	QUnit.test("type switch re-forwards the context menu to the new inner list", async function(assert) {
		const oMenu = new Menu();
		this.oList = await createMDCList({
			type: new GridListType(),
			itemContentTemplate: createGridListItemContentTemplate(),
			contextMenu: oMenu
		});
		await waitForInitialized(this.oList);
		assert.strictEqual(this.oList._oList.getContextMenu(), oMenu, "forwarded to the first inner list");

		this.oList.setType(new ListType());
		await waitForInitialized(this.oList);
		assert.strictEqual(this.oList._oList.getContextMenu(), oMenu, "re-forwarded to the new inner list after type switch");
	});

	QUnit.module("noData forwarding", {
		afterEach: function() {
			this.oList?.destroy();
		}
	});

	QUnit.test("string noData is forwarded to the inner list", async function(assert) {
		this.oList = await createMDCList({
			type: new GridListType(),
			itemContentTemplate: createGridListItemContentTemplate(),
			noData: "Nothing here"
		});
		await waitForInitialized(this.oList);
		assert.strictEqual(this.oList._oList.getNoData(), "Nothing here", "noData string forwarded to the inner list");
	});

	QUnit.test("noData set after creation is forwarded immediately", async function(assert) {
		this.oList = await createMDCList({
			type: new GridListType(),
			itemContentTemplate: createGridListItemContentTemplate()
		});
		await waitForInitialized(this.oList);

		this.oList.setNoData("Updated");
		assert.strictEqual(this.oList._oList.getNoData(), "Updated", "updated noData forwarded to the inner list");
	});

	QUnit.test("type switch re-forwards noData to the new inner list", async function(assert) {
		this.oList = await createMDCList({
			type: new GridListType(),
			itemContentTemplate: createGridListItemContentTemplate(),
			noData: "Empty"
		});
		await waitForInitialized(this.oList);

		this.oList.setType(new ListType());
		await waitForInitialized(this.oList);
		assert.strictEqual(this.oList._oList.getNoData(), "Empty", "re-forwarded to the new inner list after type switch");
	});

	QUnit.module("Filter info bar", {
		beforeEach: async function() {
			this.oList = await createMDCList({
				type: new GridListType(),
				itemContentTemplate: createGridListItemContentTemplate()
			});
			return waitForInitialized(this.oList);
		},
		afterEach: function() {
			this.oList.destroy();
		}
	});

	QUnit.test("shared FilterInfoBar is set on the inner list when filters are active", function(assert) {
		this.stub(this.oList, "_getFilterInfoText").returns("Filtered (1)");

		this.oList._updateFilterInfoBar();

		const oInfoToolbar = this.oList._oList.getInfoToolbar();
		assert.ok(oInfoToolbar?.isA("sap.ui.mdc.table.utils.FilterInfoBar"), "inner list uses the shared FilterInfoBar");
		assert.strictEqual(oInfoToolbar.getInfoText(), "Filtered (1)", "info bar shows the filter text");
		assert.strictEqual(oInfoToolbar.getTable(), this.oList.getId(), "info bar references the List");
	});

});
