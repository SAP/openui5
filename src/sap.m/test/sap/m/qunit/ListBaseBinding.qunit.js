/*global QUnit, sinon*/
sap.ui.define([
	"sap/base/strings/capitalize",
	"sap/m/ColumnListItem",
	"sap/m/CustomListItem",
	"sap/m/Input",
	"sap/m/InputListItem",
	"sap/m/library",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/Text",
	"sap/m/VBox",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Element"
], function(
	capitalize,
	ColumnListItem,
	CustomListItem,
	Input,
	InputListItem,
	MLibrary,
	List,
	StandardListItem,
	Text,
	VBox,
	MockServer,
	Filter,
	FilterOperator,
	Sorter,
	JSONModel,
	ODataModel,
	nextUIUpdate,
	jQuery,
	Element
) {
	"use strict";

	const ListGrowingDirection = MLibrary.ListGrowingDirection;

	// global service URL keep the path relative not to have cross domain issue.
	const sServiceURI = "/service/";

	async function timeout(iDuration) {
		await new Promise(function(fnResolve) {
			window.setTimeout(fnResolve, iDuration);
		});
	}

	async function ui5Event(sEventName, oControl) {
		return await new Promise((fnResolve) => {
			oControl?.attachEventOnce(sEventName, fnResolve);
		});
	}

	function createODataModel(sURL, mSettings) {
		sURL = sURL || sServiceURI;
		const oModel = new ODataModel(sURL, true);

		mSettings = mSettings || {};
		jQuery.each(mSettings, function(sProperty, vValue) {
			oModel["set" + capitalize(sProperty)](vValue);
		});

		return oModel;
	}

	// convenience helper for synchronous ajax calls
	function syncFetch(options) {
		let oResult;
		jQuery.ajax(Object.assign(options, {
			async: false,
			success : function(data) {
				oResult = data;
			}
		}));
		return oResult;
	}

	function createJSONModel(oData) {
		oData = oData || {
			Products : syncFetch({
				url : "test-resources/sap/m/qunit/data/Product.json",
				dataType:"json"
			})
		};

		const oModel = new JSONModel();
		oModel.setData(oData);
		return oModel;
	}

	function startMockServer(iRespondAfter) {
		// configure respond to requests delay
		MockServer.config({
			autoRespond : true,
			autoRespondAfter : iRespondAfter || 10
		});

		// create mockserver
		const oMockServer = new MockServer({
			rootUri : sServiceURI
		});

		// start and return
		oMockServer.simulate("test-resources/sap/m/qunit/data/metadata.xml", "test-resources/sap/m/qunit/data");
		oMockServer.start();
		return oMockServer;
	}

	async function createList(oListConfig, oItemsBindingConfig) {
		const oBindingInfo = Object.assign({
			path : "/Products",
			template : new StandardListItem({
				title : "{Name}",
				description : "{Category}"
			})
		}, oItemsBindingConfig);
		const oControlMetadata = Object.assign({
			items: oBindingInfo
		}, oListConfig);
		const oList = new List(oControlMetadata);

		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		return oList;
	}

	const oModuleConfig = {
		before: function() {
			this.oMockServer = startMockServer();
		},
		beforeEach: async function() {
			this.oList = await createList();
		},
		afterEach: function() {
			this.oList.destroy();
		},
		after: function() {
			this.oMockServer.stop();
		}
	};

	QUnit.module("BusyIndicator", oModuleConfig);
	QUnit.test("List should show busy indicator during the binding update", async function(assert) {
		const oList = this.oList;
		const oModel = createODataModel();
		const updateStartedEvent = ui5Event("updateStarted", oList);

		oList.setBusyIndicatorDelay(0);
		oList.setModel(oModel);

		await updateStartedEvent;

		let $BusyIndicator = oList.$().find(".sapUiLocalBusyIndicator");
		assert.strictEqual($BusyIndicator.length, 1, "Busy indicator should be visible after update started");

		await ui5Event("updateFinished", oList);

		assert.ok(oList.getBusy(), "List is still busy in the updateFinishedEvent");

		await timeout();

		$BusyIndicator = oList.$().find(".sapUiLocalBusyIndicator");
		assert.strictEqual($BusyIndicator.length, 0, "Busy indicator should be removed after update finished");
	});


	QUnit.test("List should show busy indicator during the binding update when growing is true", async function(assert) {
		const oList = this.oList;
		const oModel = createODataModel();
		const updateStartedEvent = ui5Event("updateStarted", oList);

		oList.setBusyIndicatorDelay(0);
		oList.setGrowing(true);
		oList.setGrowingThreshold(10);
		oList.setModel(oModel);

		await updateStartedEvent;

		let $BusyIndicator = oList.$().find(".sapUiLocalBusyIndicator");
		assert.strictEqual($BusyIndicator.length, 1, "Busy indicator should be visible after update started");

		const oEvent = await ui5Event("updateFinished", oList);

		assert.strictEqual(oEvent.getParameter("actual"), 10, "Because of the growingThreshold we should see only first 10 items.");
		assert.ok(oList.getDomRef("listUl").classList.contains("sapMListHasGrowing"), "sapMListHasGrowing class is added");

		await timeout();

		$BusyIndicator = oList.$().find(".sapUiLocalBusyIndicator");
		assert.strictEqual($BusyIndicator.length, 0, "Busy indicator should be removed after update finished");
	});

	QUnit.test("List should show busy indicator when there is no data found", async function(assert) {
		const oList = this.oList;
		const oModel = createODataModel();

		oList.setBusyIndicatorDelay(0);
		oList.setModel(oModel);

		// Wait for the initial binding to be finished before applying a filter
		await ui5Event("updateFinished", oList);

		const updateStartedEvent = ui5Event("updateStarted", oList);

		oList.getBinding("items").filter(new Filter("Name", FilterOperator.EQ, "ThisTextShouldNotBeFound"));
		await updateStartedEvent;

		let $BusyIndicator = oList.$().find(".sapUiLocalBusyIndicator");
		assert.strictEqual($BusyIndicator.length, 1, "Busy indicator should be visible after update started");

		const oEvent = await ui5Event("updateFinished", oList);

		assert.strictEqual(oEvent.getParameter("total"), 0, "Because of the filter total binding length should be 0");
		assert.notOk(oList.getDomRef("listUl").classList.contains("sapMListHasGrowing"), "sapMListHasGrowing class is removed");

		await timeout();

		$BusyIndicator = oList.$().find(".sapUiLocalBusyIndicator");
		assert.strictEqual($BusyIndicator.length, 0, "Busy indicator should be removed after update finished");
	});

	QUnit.test("List should respect busyIndicatorDelay property to show busy indicator.", async function(assert) {
		const oList = this.oList;
		const oModel = createODataModel();
		const updateStartedEvent = ui5Event("updateStarted", oList);

		oList.setModel(oModel);

		await updateStartedEvent;

		let $BusyIndicator = oList.$().find(".sapUiLocalBusyIndicator");
		assert.strictEqual($BusyIndicator.length, 0, "Delay is longer than response time busy indicator should not be visible");

		await ui5Event("updateFinished", oList);

		$BusyIndicator = oList.$().find(".sapUiLocalBusyIndicator");
		assert.strictEqual($BusyIndicator.length, 0, "Busy indicator is not visible when update finished");
	});

	QUnit.test("List should respect enableBusyIndicator property to show busy indicator.", async function(assert) {
		const oList = this.oList;
		const oModel = createODataModel();
		const updateStartedEvent = ui5Event("updateStarted", oList);

		oList.setBusyIndicatorDelay(0);
		oList.setEnableBusyIndicator(false);
		oList.setModel(oModel);

		await updateStartedEvent;

		const $BusyIndicator = oList.$().find(".sapUiLocalBusyIndicator");
		assert.strictEqual($BusyIndicator.length, 0, "enableBusyIndicator is false List should not show busy indicator.");
	});

	QUnit.test("List should clear busy state when binding error has occured", async function(assert) {
		const oList = this.oList;
		const oModel = createODataModel();

		oList.setBusyIndicatorDelay(0);
		oList.setModel(oModel);

		// Wait for the initial binding to be finished before rebinding to am invalid path
		await ui5Event("updateFinished", oList);

		const updateStartedEvent = ui5Event("updateStarted", oList);
		oList.bindItems({
			path :"/ThereIsNoSuchPath",
			template : new StandardListItem({
				title : "{Name}",
				description : "{Category}"
			})
		});

		await updateStartedEvent;

		let $BusyIndicator = oList.$().find(".sapUiLocalBusyIndicator");
		assert.strictEqual($BusyIndicator.length, 1, "Busy indicator should be visible after update started");

		const oEvent = await ui5Event("updateFinished", oList);

		assert.strictEqual(oEvent.getParameter("total"), 0, "Because on error data is cleared, binding length should be 0");
		assert.strictEqual(oEvent.getParameter("actual"), 0, "Because on error data is cleared, current item count should be 0");
		assert.strictEqual(oList.$().find(".sapMListNoData").length, 1, "No Data indication is shown after error");

		await timeout();

		$BusyIndicator = oList.$().find(".sapUiLocalBusyIndicator");
		assert.strictEqual($BusyIndicator.length, 0, "Busy indicator should be removed after update finished");
	});

	QUnit.test("Growing List should clear busy state and all data when binding error has occured", async function(assert) {
		const oList = this.oList;
		const oModel = createODataModel();

		oList.setBusyIndicatorDelay(0);
		oList.setGrowing(true);
		oList.setGrowingThreshold(10);
		oList.setModel(oModel);

		await ui5Event("updateFinished", oList);
		await timeout(); // Apply timeout to ensure the busy indicator of the initial request has been removed

		let $BusyIndicator = oList.$().find(".sapUiLocalBusyIndicator");
		assert.strictEqual($BusyIndicator.length, 0, "Busy indicator should be removed after update finished");
		assert.strictEqual(oList.getItems().length, 10, "There are 10 items after initial loading");

		const oBinding = oList.getBinding("items");
		const updateStartedEvent = ui5Event("updateStarted", oList);

		oBinding.sort(new Sorter("NoSuchField"));

		await updateStartedEvent;

		$BusyIndicator = oList.$().find(".sapUiLocalBusyIndicator");
		assert.strictEqual($BusyIndicator.length, 1, "Busy indicator should be visible after update started");

		await ui5Event("updateFinished", oList);

		assert.strictEqual(oBinding.getLength(), 0, "Because on error data is cleared, binding length should be 0");
		assert.strictEqual(oList.getItems(true).length, 0, "Because on error data is cleared, current item count should be 0");
		assert.strictEqual(oList.$().find(".sapMListNoData").length, 1, "No Data indication is shown after error");

		await timeout();

		$BusyIndicator = oList.$().find(".sapUiLocalBusyIndicator");
		assert.strictEqual($BusyIndicator.length, 0, "Busy indicator should be removed after update finished");
	});

	QUnit.test("Update events should not be fired when metadata is not loaded", function(assert) {
		const oList = this.oList;
		const oModel = createODataModel("/there/is/no/such/service");
		const fnUpdateFinishedSpy = this.spy();
		const fnUpdateStartedSpy = this.spy();

		oList.attachUpdateStarted(fnUpdateStartedSpy);
		oList.attachUpdateFinished(fnUpdateFinishedSpy);
		oList.setModel(oModel);

		assert.strictEqual(fnUpdateStartedSpy.callCount, 0, "updateStarted is not fired because metadata is not loaded");
		assert.strictEqual(fnUpdateFinishedSpy.callCount, 0, "updateFinished is not fired because metadata is not loaded");
	});

	QUnit.test("Should not have a static position after busy", async function(assert) {
		const oList = this.oList;
		const oModel = createODataModel();

		oList.setGrowing(true);
		oList.setGrowingThreshold(10);
		oList.setBusyIndicatorDelay(0);
		oList.setModel(oModel);

		await ui5Event("updateFinished", oList);

		const sPosition = oList.$().css("position");
		assert.notStrictEqual(sPosition, "static", "position was not static but: " + sPosition);
	});

	QUnit.module("Abort", oModuleConfig);
	QUnit.test("List should abort multiple requests and runs only the last one", async function(assert) {
		const oList = this.oList;
		const oModel = createODataModel();
		const fnUpdateStartedSpy = this.spy();
		const fnUpdateFinishedSpy = this.spy();

		oList.setModel(oModel);
		await ui5Event("updateFinished", oList);

		oList.attachUpdateStarted(fnUpdateStartedSpy);
		oList.attachUpdateFinished(fnUpdateFinishedSpy);

		const oBinding = oList.getBinding("items");
		// sort and immediately filter then sort request should be aborted
		// but even though sort stays in the model and next filter should have sort info
		oBinding.sort(new Sorter("ProductId", true));
		oBinding.filter(new Filter("SupplierName", FilterOperator.Contains, "Very Best Screens"));
		await ui5Event("updateFinished", oList);

		assert.strictEqual(fnUpdateStartedSpy.callCount, 1, "update started event is called once");
		assert.strictEqual(fnUpdateFinishedSpy.callCount, 1, "update finished event is called once");
		assert.strictEqual(fnUpdateFinishedSpy.args[0][0].getParameter("total"), 3, "Event reported there are 3 records are found: Very Best Screens");
		assert.strictEqual(oList.getItems().length, 3, "List has 3 records: Very Best Screens");

		// find all product ids
		const sProductIds = oList.getItems().map(function(oItem) {
			return oItem.getBindingContext().getProperty("ProductId");
		}).join(" > ");

		assert.strictEqual(sProductIds, "id_13 > id_12 > id_11", "Aborted descending sort information is applied to the filter");
	});

	QUnit.module("CountMode", Object.assign({}, oModuleConfig, {
		beforeEach: async function() {
			this.oList = await createList(undefined, {
				parameters: {
					countMode: "None"
				}
			});
		},
		afterEach: function() {
			this.oList.destroy();
		}
	}));
	QUnit.test("CountMode.None should show growing indicator when list is not complete yet", async function(assert) {
		const oList = this.oList;
		const oModel = createODataModel();

		oList.setGrowing(true);
		oList.setGrowingThreshold(10);
		oList.setModel(oModel);

		const oEvent = await ui5Event("updateFinished", oList);
		assert.strictEqual(oEvent.getParameter("total") > oEvent.getParameter("actual"), true, "Total items is higher than actual items");

		await timeout();

		assert.ok(oList.$().find(".sapMGrowingList").is(":visible"), "Growing indicator is visible");
	});

	QUnit.test("CountMode.None should not show growing indicator when all items are shown", async function(assert) {
		const oList = this.oList;
		const oModel = createODataModel();

		oList.setGrowing(true);
		oList.setGrowingThreshold(20);
		oList.setModel(oModel);

		const oEvent = await ui5Event("updateFinished", oList);

		assert.strictEqual(oEvent.getParameter("total"), 16, "Total number equals amount of entries");
		assert.strictEqual(oEvent.getParameter("actual"), 16, "Actual number equals amount of entries");
		assert.ok(!oList.$().find(".sapMGrowingList").is(":visible"), "Growing indicator is not visible");
	});

	QUnit.module("NonAbsoluteAndUnresolveable Binding Path", {
		beforeEach: async function() {
			this.oList = await createList(undefined, {
				path: "nonAbsoluteAndUnresolveable"
			});
		},
		afterEach: function() {
			this.oList.destroy();
		}
	});
	QUnit.test("Should not fire update started if a binding cannot be resolved", async function(assert) {
		const oList = this.oList;
		const oModel = createODataModel();
		const fnUpdateStartedSpy = this.spy();

		oList.attachUpdateStarted(fnUpdateStartedSpy);
		oList.setModel(oModel);

		await timeout();

		assert.ok(fnUpdateStartedSpy.notCalled, "update started event was not fired");
		assert.ok(!oList.getBusy(), "List is not busy since the binding did not update");
	});

	QUnit.module("FocusAfterBindingUpdate", Object.assign({}, oModuleConfig, {
		beforeEach: async function() {
			this.oList = await createList(undefined, {
				template : new InputListItem({
					label: "Product Name",
					content : new Input({
						value: "{Name}"
					})
				})
			});
		},
		afterEach: function() {
			this.oList.destroy();
		}
	}));
	if (document.hasFocus()) {
		QUnit.test("Focus should be retained after binding update", async function(assert) {
			const oList = this.oList;
			const oModel = createODataModel();

			oList.setModel(oModel);
			await ui5Event("updateFinished", oList);

			// focus to the input field
			const sFocusedControlId = oList.$().find("input").eq(5).trigger("focus").attr("id");

			oList.invalidate();
			await nextUIUpdate();
			await timeout();

			assert.strictEqual(document.activeElement.id, sFocusedControlId, "Focus is retained after list rerender");

			oList.updateItems();
			await ui5Event("updateFinished", oList);

			assert.strictEqual(document.activeElement.id, sFocusedControlId, "Focus is retained after binding update");
		});
	}

	QUnit.module("Growing", oModuleConfig);
	QUnit.test("Last setGrowingThreshold should be respected before data fetching", async function(assert) {
		const oList = this.oList;
		const oModel = createODataModel();
		const iInitialThreshold = 5;
		const iUpdatedThreshold = 10;

		oList.setGrowing(true);
		oList.setGrowingThreshold(iInitialThreshold);
		oList.setModel(oModel);
		oList.setGrowingThreshold(iUpdatedThreshold); // Needs to be set after model is assigned

		const oEvent = await ui5Event("updateFinished", oList);

		assert.strictEqual(oEvent.getParameter("actual"), iUpdatedThreshold, "Last growing threshold is respected");
	});

	QUnit.module("Upwards Growing Direction", oModuleConfig);
	QUnit.test("Should fetch the data and render in reverse order", async function(assert) {
		const oList = this.oList;
		const oModel = createODataModel();
		const iGrowingThreshold = 5;

		oList.setGrowing(true);
		oList.setGrowingThreshold(iGrowingThreshold);
		oList.setGrowingDirection(ListGrowingDirection.Upwards);
		oList.setModel(oModel);

		await ui5Event("updateFinished", oList);

		let oNavigationRoot = oList.getNavigationRoot();
		const $GrowingButton = oList.$("trigger");

		assert.ok($GrowingButton.parent().next().get(0) === oList.getDomRef("before"), "Growing button is inserted before the first item.");
		assert.ok(oList.getItems().pop().getDomRef() === oNavigationRoot.children[0], "Last aggregation DOM is the first child of the list");

		if (document.hasFocus() && oList.getItemNavigation()) {
			oList.focus();
			assert.ok(document.activeElement === oNavigationRoot.children[iGrowingThreshold - 1], "First focus jumps to last item");
		}

		// Request new page
		$GrowingButton.trigger("focus").trigger("tap");

		await ui5Event("updateFinished", oList);

		oNavigationRoot = oList.getNavigationRoot();
		assert.ok(oList.getItems().pop().getDomRef() === oNavigationRoot.children[0], "Last aggregation DOM is the first child of the list");

		if (document.hasFocus()) {
			assert.ok(Element.closestTo(document.activeElement)?.isA("sap.m.ListItemBase"), "Focus moves to ListItem after growing");
		}
	});

	QUnit.module("TwoWayBinding And Growing", {
		before: function() {
			this.oMockServer = startMockServer();
		},
		after: function() {
			this.oMockServer.stop();
		}
	});
	QUnit.test("Property changes updates the list binding when growing feature is enabled", async function(assert) {
		const oList = await createList({ growing: true });
		const fnUpdateStartedSpy = this.spy();

		oList.setModel(createJSONModel());
		await ui5Event("updateFinished", oList);

		oList.attachUpdateStarted(fnUpdateStartedSpy);
		oList.getModel().setProperty("/Products/0/Name", ":(");

		await ui5Event("updateFinished", oList);

		assert.ok(fnUpdateStartedSpy.calledOnce, "Property update also updates the list binding");
		oList.destroy();
	});

	QUnit.test("Property changes should not update the list binding when unique key is defined", async function(assert) {
		const oList = await createList({ growing: true }, { key: "ProductId" });
		const fnUpdateStartedSpy = this.spy();

		oList.setModel(createJSONModel());

		await ui5Event("updateFinished", oList);

		oList.attachUpdateStarted(fnUpdateStartedSpy);
		oList.getModel().setProperty("/Products/0/Name", ":)");

		assert.ok(fnUpdateStartedSpy.notCalled, "Property update did not update the list binding.");
		oList.destroy();
	});

	QUnit.module("ExtendedChangeDetection", {
		before: function() {
			this.oMockServer = startMockServer();
		},
		after: function() {
			this.oMockServer.stop();
		}
	});
	QUnit.test("Replace option when template is available", async function(assert) {
		const oList = await createList({
			growing: true,
			growingThreshold: 4
		});

		oList.setModel(createODataModel());
		await ui5Event("updateFinished", oList);

		const oCreateListItemSpy = sinon.spy(StandardListItem.prototype, "init");
		const oSetBindingContextSpy = sinon.spy(StandardListItem.prototype, "setBindingContext");

		oList.getBinding("items").sort(new Sorter("ProductId", true));
		await ui5Event("updateFinished", oList);

		assert.equal(oCreateListItemSpy.callCount, 0, "No List Item is created because of sort");
		assert.equal(oSetBindingContextSpy.callCount, 4, "Only binding contexts are set for list items");

		// clean up
		oSetBindingContextSpy.restore();
		oCreateListItemSpy.restore();
	});

	QUnit.test("No replace option when factory is available", async function(assert) {
		const oList = await createList({
			growing: true,
			growingThreshold: 4
		},
		{
			template: null,
			factory: function() {
				return new StandardListItem({
					title : "{Name}",
					description : "{Category}"
				});
			}
		});

		oList.setModel(createODataModel());
		await ui5Event("updateFinished", oList);

		const oCreateListItemSpy = sinon.spy(StandardListItem.prototype, "init");

		oList.getBinding("items").sort(new Sorter("ProductId", true));
		await ui5Event("updateFinished", oList);

		assert.equal(oCreateListItemSpy.callCount, 4, "4 List Items are created");

		oCreateListItemSpy.restore();
		oList.destroy();
	});

	QUnit.module("Virtual Context", Object.assign({}, oModuleConfig, {
		testVirtualContext: async function(assert, bWithGrowing) {
			const oList = this.oList;
			const oModel = createJSONModel();

			oList.setGrowing(bWithGrowing);
			oList.setModel(oModel);
			await ui5Event("updateFinished", oList);

			const iInitialItemCount = oList.getItems().length;
			const oUpdateItemsSpy = sinon.spy(oList, "_updateFinished");
			const oInvalidateSpy = sinon.spy(oList, "invalidate");
			const oBinding = oList.getBinding("items");

			// Fake the virtual context process.

			oBinding.fireEvent("change", {
				detailedReason: "AddVirtualContext",
				reason: "change"
			});

			let oVirtualItem = oList._oVirtualItem;

			assert.ok(oInvalidateSpy.notCalled, "AddVirtualContext: List is not invalidated");
			assert.ok(oUpdateItemsSpy.notCalled, "AddVirtualContext: Update hook is not called");
			assert.ok(oList.indexOfDependent(oVirtualItem) >= 0, "AddVirtualContext: Virtual item added to dependents aggregation");
			assert.ok(oVirtualItem.getId().indexOf("virtual") > 0, "AddVirtualContext: Virtual item has the correct ID");
			assert.strictEqual(oList.getItems().length, iInitialItemCount, "AddVirtualContext: Number of items is correct");
			assert.strictEqual(oVirtualItem.getBindingContext(), oBinding.getContexts(0, 1)[0],
				"AddVirtualContext: Virtual item has the correct context");
			assert.notOk(oVirtualItem.bIsDestroyed, "AddVirtualContext: Virtual item is not destroyed");
			oInvalidateSpy.resetHistory();
			oUpdateItemsSpy.resetHistory();

			oBinding.fireEvent("change", {
				detailedReason: "RemoveVirtualContext",
				reason: "change"
			});

			assert.ok(oInvalidateSpy.notCalled, "RemoveVirtualContext: List is not invalidated");
			assert.ok(oUpdateItemsSpy.notCalled, "RemoveVirtualContext: Update hook is not called");
			assert.ok(oList.indexOfDependent(oVirtualItem) === -1, "RemoveVirtualContext: Virtual item removed from dependents aggregation");
			assert.strictEqual(oList.getItems().length, iInitialItemCount, "AddVirtualContext: Number of items is correct");
			assert.ok(oVirtualItem.bIsDestroyed, "RemoveVirtualContext: Virtual row is destroyed");
			assert.notOk("_oVirtualItem" in oList, "RemoveVirtualContext: Reference to virtual item removed from list");

			oBinding.fireEvent("change", {
				detailedReason: "AddVirtualContext",
				reason: "change"
			});
			oVirtualItem = oList._oVirtualItem;
			oList.bindItems(oList.getBindingInfo("items"));

			assert.ok(oList.indexOfDependent(oVirtualItem) === -1, "BindItems: Virtual item removed from dependents aggregation");
			assert.ok(oVirtualItem.bIsDestroyed, "BindItems: Virtual item is destroyed");
			assert.notOk("_oVirtualItem" in oList, "BindItems: Reference to virtual item removed from list");
		}
	}));

	QUnit.test("Virtual Context Handling - Without Growing", async function(assert) {
		await this.testVirtualContext(assert, false);
	});

	QUnit.test("Virtual Context Handling - With Growing", async function(assert) {
		await this.testVirtualContext(assert, true);
	});

	QUnit.test("Growing should reset if list contains items and there is a AddVirtualContext binding change", async function(assert) {
		const oList = this.oList;
		const oModel = createODataModel();

		oList.setGrowing(true);
		oList.setGrowingThreshold(5);
		oList.setModel(oModel);
		await ui5Event("updateFinished", oList);

		assert.strictEqual(oList._oGrowingDelegate._iLimit, 5, "GrowingDelegate limit is 5");
		oList.$("trigger").trigger("focus").trigger("tap");
		await ui5Event("updateFinished", oList);

		assert.strictEqual(oList._oGrowingDelegate._iLimit, 10, "GrowingDelegate limit is 10 due to growing");

		const oBinding = oList.getBinding("items");
		oBinding.fireEvent("change", {
			detailedReason: "AddVirtualContext",
			reason: "context"
		});
		oBinding.fireEvent("change", {
			detailedReason: "RemoveVirtualContext",
			reason: "change"
		});
		oBinding.refresh();
		await ui5Event("updateFinished", oList);

		assert.strictEqual(oList._oGrowingDelegate._iLimit, 5, "GrowingDelegate limit is 5, reset due to AddVirtualContext");
	});

	QUnit.module("Rebind", Object.assign({}, oModuleConfig, {
		beforeEach: async function() {
			this.oList = await createList();
			this.oList.setModel(createODataModel());
			await ui5Event("updateFinished", this.oList);
		}
	}));
	QUnit.test("List should not invalidate before update on rebind", async function(assert) {
		const oList = this.oList;
		const oInvalidateSpy = this.spy(oList, "invalidate");

		oList.bindItems(oList.getBindingInfo("items"));
		// We want to test that the control is not invalidated until updateItems is called
		await new Promise(function(fnResolve) {
			oList.updateItems = fnResolve;
		});

		assert.ok(oInvalidateSpy.notCalled, "The list is not invalidated");
	});

	QUnit.test("List should invalidate on update if all items are removed after rebind", async function(assert) {
		const oList = this.oList;
		const oInvalidateSpy = this.spy(oList, "invalidate");

		oList.getBindingInfo("items").filters = [new Filter("Name", FilterOperator.EQ, "ThisTextShouldNotBeFound")];
		oList.bindItems(oList.getBindingInfo("items"));
		await ui5Event("updateFinished", oList);

		assert.ok(oInvalidateSpy.calledOnce, "The list is invalidated");
	});

	QUnit.test("List should invalidate on update if items are updated after rebind", async function(assert) {
		const oList = this.oList;
		const oInvalidateSpy = this.spy(oList, "invalidate");

		oList.getBindingInfo("items").filters = [new Filter("Name", FilterOperator.EQ, "Gladiator MX")];
		oList.bindItems(oList.getBindingInfo("items"));
		await ui5Event("updateFinished", oList);

		assert.ok(oInvalidateSpy.calledOnce, "The list is invalidated");
	});

	QUnit.test("Growing list should invalidate on update if all items are removed after rebind", async function(assert) {
		const oList = this.oList;

		oList.setGrowing(true);
		await nextUIUpdate();

		const oInvalidateSpy = this.spy(oList, "invalidate");

		oList.getBindingInfo("items").filters = [new Filter("Name", FilterOperator.EQ, "ThisTextShouldNotBeFound")];
		oList.bindItems(oList.getBindingInfo("items"));
		await ui5Event("updateFinished", oList);

		assert.ok(oInvalidateSpy.calledOnce, "The list is invalidated");
	});

	QUnit.test("Growing list should not invalidate on update if items are updated after rebind", async function(assert) {
		const oList = this.oList;

		oList.setGrowing(true);
		await nextUIUpdate();

		const oInvalidateSpy = this.spy(oList, "invalidate");

		oList.getBindingInfo("items").filters = [new Filter("Name", FilterOperator.EQ, "Gladiator MX")];
		oList.bindItems(oList.getBindingInfo("items"));
		await ui5Event("updateFinished", oList);

		assert.ok(oInvalidateSpy.notCalled, "The list is not invalidated");
	});

	QUnit.module("ItemsPool", Object.assign({}, oModuleConfig, {
		beforeEach: async function() {
			this.oList = await createList({
				growing: true
			}, {
				template: new ColumnListItem({
					cells: [
						new Text({text: "{ProductId}"}),
						new Text({text: "{Name}"}),
						new Text({text: "{Category}"})
					]
				})
			});
		}
	}));
	QUnit.test("Array should be available", async function(assert) {
		const oList = this.oList;
		const oModel = createODataModel(sServiceURI, {useBatch: false});
		const updateStartedEvent = ui5Event("updateStarted", oList);

		oList.setGrowingThreshold(8);
		oList.setModel(oModel);

		const oEvent = await updateStartedEvent;
		const oControl = oEvent.getSource();

		assert.ok(oControl._oGrowingDelegate._aItemsPool, "itemsPool was created");
		oControl._oGrowingDelegate.fillItemsPool();
		assert.strictEqual(oControl._oGrowingDelegate._aItemsPool.length, 8, "8 items are available in the itemsPool");
		await timeout(100);

		oControl.getBindingInfo("items").template.removeCell(0);
		assert.strictEqual(oControl._oGrowingDelegate._aItemsPool.length, 0, "There is no item in the itemsPool");
	});

	QUnit.test("Array should be limited to 100 items", async function(assert) {
		const oList = this.oList;
		const oModel = createODataModel(sServiceURI, {useBatch: false});
		const updateStartedEvent = ui5Event("updateStarted", oList);

		oList.getBindingInfo("items").template = new CustomListItem({
			content: [
				new VBox({
					items: [
						new Text({text: "{ProductId}"}),
						new Text({text: "{Name}"}),
						new Text({text: "{Category}"})
					]
				})
			]
		});
		oList.setGrowingThreshold(200);
		oList.setModel(oModel);

		const oEvent = await updateStartedEvent;
		const oControl = oEvent.getSource();

		assert.ok(oControl._oGrowingDelegate._aItemsPool, "itemsPool was created");
		oControl._oGrowingDelegate.fillItemsPool();
		assert.strictEqual(oControl._oGrowingDelegate._aItemsPool.length, 100, "itemPool limited to 100 items, inspite of the growingThreshold=" + oControl.getGrowingThreshold());
	});
});