/*global QUnit, jQuery, sinon*/
sap.ui.define([
	"sap/ui/core/util/MockServer",
	"sap/ui/thirdparty/sinon-qunit",
	/*Sinon itself already part of MockServer*/
	"sap/ui/model/odata/v2/ODataModel",
	"sap/m/ListBase",
	"jquery.sap.strings",
	"jquery.sap.sjax",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/InputListItem",
	"sap/m/Input",
	"sap/ui/model/odata/ODataUtils",
	"jquery.sap.global"
], function(
	MockServer,
	SinonQUnit,
	ODataModel,
	ListBase,
	StringUtil,
	Sjax,
	FilterOperator,
	JSONModel,
	Filter,
	Sorter,
	List,
	StandardListItem,
	InputListItem,
	Input,
	ODataUtils
) {
	"use strict";

	// global service URL keep the path relative not to have cross domain issue.
	var sServiceURI = "/service/";

	function createODataModel(sURL, mSettings) {
		sURL = sURL || sServiceURI;
		var oModel = new ODataModel(sURL, true);

		mSettings = mSettings || {};
		jQuery.each(mSettings, function(sProperty, vValue) {
			sProperty = jQuery.sap.charToUpperCase(sProperty);
			oModel["set" + sProperty](vValue);
		});

		return oModel;
	}

	function createJSONModel(oData) {
		oData = oData || {
			Products : jQuery.sap.sjax({
				url : "test-resources/sap/m/qunit/data/Product.json",
				dataType:"json"
			}).data
		};

		var oModel = new JSONModel();
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
		var oMockServer = new MockServer({
			rootUri : sServiceURI
		});

		// start and return
		oMockServer.simulate("test-resources/sap/m/qunit/data/metadata.xml", "test-resources/sap/m/qunit/data");
		oMockServer.start();
		return oMockServer;
	}

	function createList(oListConfig, oBindConfig, oModel) {
		// init
		var oDeferred = jQuery.Deferred();
		var oList = new List(oListConfig || {});
		var oItemTemplate = new StandardListItem({
			title : "{Name}",
			description : "{Category}"
		});

		// render the list
		oList.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// set the list as a promise
		oDeferred.promise(oList);
		oList.attachUpdateFinished(oDeferred.resolve);

		// build binding confing
		oBindConfig = jQuery.extend({
			path : "/Products",
			template : oItemTemplate
		}, oBindConfig);

		// set model and bind items
		oModel = oModel || createODataModel();
		oList.setModel(oModel).bindItems(oBindConfig);

		return oList;
	}

	QUnit.module("BusyIndicator");
	QUnit.test("List should show busy indicator during the binding update", function(assert) {
		var done = assert.async();
		var oMockServer = startMockServer(0),
			oList = createList({
				busyIndicatorDelay: 0
			}, {
				events: {
					dataRequested: function() {
						var $BusyIndicator = jQuery(".sapUiLocalBusyIndicator");
						assert.strictEqual($BusyIndicator.length, 1, "Busy indicator should be visible after data has been requested");
					},
					dataReceived: function() {
						window.setTimeout(function() {
							var $BusyIndicator = oList.$().find(".sapUiLocalBusyIndicator");
							assert.strictEqual($BusyIndicator.length, 0, "Busy indicator should be removed after data has been received");
							done();
						}, 0);
					}
				}
			});

		// when initial binding is completed
		oList.done(function () {
			oMockServer.stop();
			oList.destroy();
		});
	});

	QUnit.test("List should show busy indicator during the binding update when growing is true", function(assert) {
		var done = assert.async();
		var oMockServer = startMockServer(),
			oList = createList({
				growing : true,
				growingThreshold : 10,
				busyIndicatorDelay : 0,
				updateFinished : function(oEvent) {
					assert.strictEqual(oEvent.getParameter("actual"), 10, "Because of the growingThreshold we should see only first 10 items.");
					assert.ok(oList.getDomRef("listUl").classList.contains("sapMListHasGrowing"), "sapMListHasGrowing class is added");
				}
			}, {
				events: {
					dataRequested: function() {
						var $BusyIndicator = jQuery(".sapUiLocalBusyIndicator");
						assert.strictEqual($BusyIndicator.length, 1, "Busy indicator should be visible after data has been requested");
					},
					dataReceived: function() {
						window.setTimeout(function() {
							var $BusyIndicator = oList.$().find(".sapUiLocalBusyIndicator");
							assert.strictEqual($BusyIndicator.length, 0, "Busy indicator should be removed after data has been received");
							done();
						}, 0);
					}
				}
			});

		// when initial binding is completed
		oList.done(function () {
			oMockServer.stop();
			oList.destroy();
		});
	});

	QUnit.test("List should show busy indicator when there is no data found", function(assert) {
		var done = assert.async();
		var oMockServer = startMockServer(),
			oList = createList({
				busyIndicatorDelay : 0,
				updateFinished : function(oEvent) {
					assert.strictEqual(oEvent.getParameter("total"), 0, "Because of the filter total binding length should be 0");
					assert.notOk(oList.getDomRef("listUl").classList.contains("sapMListHasGrowing"), "sapMListHasGrowing class is removed");
				}
			}, {
				filters : [new Filter("Name", FilterOperator.EQ, "ThisTextShouldNotBeFound")],
				events: {
					dataRequested: function() {
						var $BusyIndicator = jQuery(".sapUiLocalBusyIndicator");
						assert.strictEqual($BusyIndicator.length, 1, "Busy indicator should be visible after data has been requested");
					},
					dataReceived: function() {
						window.setTimeout(function() {
							var $BusyIndicator = oList.$().find(".sapUiLocalBusyIndicator");
							assert.strictEqual($BusyIndicator.length, 0, "Busy indicator should be removed after data has been received");
							done();
						}, 0);
					}
				}
			});

		// when initial binding is completed
		oList.done(function () {
			oMockServer.stop();
			oList.destroy();
		});
	});

	QUnit.test("List should respect busyIndicatorDelay property to show busy indicator.", function(assert) {
		var done = assert.async();
		var iRespondDelay = 10,
			oMockServer = startMockServer(iRespondDelay),
			oList = createList({
				busyIndicatorDelay : iRespondDelay + 1,
				updateStarted : function() {
					var $BusyIndicator = this.$().find(".sapUiLocalBusyIndicator");
					assert.strictEqual($BusyIndicator.length, 0, "Delay is longer than response time busy indicator should not be visible");
				}
			});

		// when initial binding is completed
		oList.done(function() {
			oMockServer.stop();
			oList.destroy();
			done();
		});
	});

	QUnit.test("List should respect enableBusyIndicator property to show busy indicator.", function(assert) {
		var done = assert.async();
		var oMockServer = startMockServer(),
			oList = createList({
				enableBusyIndicator : false,
				updateStarted : function() {
					var $BusyIndicator = this.$().find(".sapUiLocalBusyIndicator");
					assert.strictEqual($BusyIndicator.length, 0, "enableBusyIndicator is false List should not show busy indicator.");
				}
			});

		// when initial binding is completed
		oList.done(function() {
			oMockServer.stop();
			oList.destroy();
			done();
		});
	});

	QUnit.test("List should clear busy state when binding error has occured", function(assert) {
		var done = assert.async();
		var oMockServer = startMockServer(),
			oList = createList({
				busyIndicatorDelay : 0,
				updateFinished : function(oEvent) {
					assert.strictEqual(oEvent.getParameter("total"), 0, "Because on error data is cleared, binding length should be 0");
					assert.strictEqual(oEvent.getParameter("actual"), 0, "Because on error data is cleared, current item count should be 0");
					assert.strictEqual(this.$().find(".sapMListNoData").length, 1, "No Data indication is shown after error");
				}
			}, {
				path :"/ThereIsNoSuchPath",
				events: {
					dataRequested: function() {
						var $BusyIndicator = jQuery(".sapUiLocalBusyIndicator");
						assert.strictEqual($BusyIndicator.length, 1, "Busy indicator should be visible after data has been requested");
					},
					dataReceived: function() {
						window.setTimeout(function() {
							var $BusyIndicator = oList.$().find(".sapUiLocalBusyIndicator");
							assert.strictEqual($BusyIndicator.length, 0, "Busy indicator should be removed after data has been received");
							done();
						}, 0);
					}
				}
			});

		// when initial binding is completed
		oList.done(function () {
			oMockServer.stop();
			oList.destroy();
		});
	});

	QUnit.test("Growing List should clear busy state and all data when binding error has occured", function(assert) {
		var done = assert.async();
		var oMockServer = startMockServer(),
			oDeferred = jQuery.Deferred(),
			oList = createList({
				growing : true,
				growingThreshold : 10,
				busyIndicatorDelay : 0
			});

		// when initial binding is completed
		oList.done(function () {
			// attach to the update binding events
			oList.attachUpdateStarted(function(oEvent) {
				assert.strictEqual(oEvent.getParameter("actual"), 10, "There are 10 items after initial loading");
			}).attachUpdateFinished(function(oEvent) {
				assert.strictEqual(oEvent.getParameter("total"), 0, "Because on error data is cleared, binding length should be 0");
				assert.strictEqual(oEvent.getParameter("actual"), 0, "Because on error data is cleared, current item count should be 0");
				assert.strictEqual(this.$().find(".sapMListNoData").length, 1, "No Data indication is shown after error");
			});

			var oBinding = oList.getBinding("items");
			oBinding.attachEvents({
				dataRequested: function() {
					var $BusyIndicator = oList.$().find(".sapUiLocalBusyIndicator");
					assert.strictEqual($BusyIndicator.length, 1, "Busy indicator should be visible after data has been requested");
				},
				dataReceived: function() {
					window.setTimeout(function() {
						var $BusyIndicator = oList.$().find(".sapUiLocalBusyIndicator");
						assert.strictEqual($BusyIndicator.length, 0, "Busy indicator should be removed after data has been received");
						oDeferred.resolve();
					}, 0);
				}
			});

			window.setTimeout(function() { // first let the list finish rendering
				// create http error with unkown sorter field
				oBinding.sort(new Sorter("NoSuchField"));
			}, 0);
		});

		// when test is completed
		jQuery.when(oDeferred).done(function () {
			oMockServer.stop();
			oList.destroy();
			done();
		});
	});

	QUnit.test("Update events should not be fired when metadata is not loaded", function(assert) {
		var oMockServer = startMockServer(),
			oModel = createODataModel("/there/is/no/such/service"),
			fnUpdateFinishedSpy = this.spy(),
			fnUpdateStartedSpy = this.spy(),
			oList = createList({
				updateStarted : fnUpdateStartedSpy,
				updateFinished : fnUpdateFinishedSpy
			}, {}, oModel);

		assert.strictEqual(fnUpdateStartedSpy.callCount, 0, "updateStarted is not fired because metadata is not loaded");
		assert.strictEqual(fnUpdateFinishedSpy.callCount, 0, "updateFinished is not fired because metadata is not loaded");

		// cleanup
		oMockServer.stop();
		oModel.destroy();
		oList.destroy();
	});

	QUnit.test("Should not have a static after busy", function(assert) {
		var done = assert.async();
		// Arrange
		var oMockServer = startMockServer();

		// System under Test
		var oList = createList({
				growing : true,
				growingThreshold : 10,
				busyIndicatorDelay : 0
			});

		// Act
		oList.done(function () {
			var sPosition = oList.$().css("position");
			// Assert
			assert.notStrictEqual(sPosition, "static", "position was not static but: " + sPosition);

			// cleanup
			oMockServer.stop();
			oList.destroy();

			done();
		});
	});

	QUnit.module("Abort");
	QUnit.test("List should abort multiple requests and runs only the last one", function(assert) {
		var done = assert.async();

		// arrange
		var fnUpdateStartedSpy = this.spy(),
			fnUpdateFinishedSpy = this.spy(),
			oMockServer = startMockServer(),
			oDeferred = jQuery.Deferred(),
			oList = createList();

		// when initial binding is completed
		oList.done(function () {
			// attach to the update binding events
			oList.attachUpdateStarted(fnUpdateStartedSpy);
			oList.attachUpdateFinished(fnUpdateFinishedSpy);
			oList.attachUpdateFinished(oDeferred.resolve);

			// sort and immediately filter then sort request should be aborted
			// but even though sort stays in the model and next filter should have sort info
			this.getBinding("items").sort(new Sorter("ProductId", true));
			this.getBinding("items").filter(new Filter("SupplierName", FilterOperator.Contains, "Very Best Screens"));

		});

		// when all requests are completed
		jQuery.when(oDeferred).done(function () {
			// assert
			assert.strictEqual(fnUpdateStartedSpy.callCount, 1, "update started event is called once");
			assert.strictEqual(fnUpdateFinishedSpy.callCount, 1, "update finished event is called once");
			assert.strictEqual(fnUpdateFinishedSpy.args[0][0].getParameter("total"), 3, "Event reported there are 3 records are found: Very Best Screens");
			assert.strictEqual(oList.getItems().length, 3, "List has 3 records: Very Best Screens");

			// find all product ids
			var sProductIds = oList.getItems().map(function(oItem) {
				return oItem.getBindingContext().getProperty("ProductId");
			}).join(" > ");

			assert.strictEqual(sProductIds, "id_13 > id_12 > id_11", "Aborted descending sort information is applied to the filter");

			// clean up
			oMockServer.stop();
			oList.destroy();
			done();
		});
	});

	QUnit.module("CountMode");
	QUnit.test("CountMode.None should show growing indicator when list is not complete yet", function(assert) {
		var done = assert.async();
		var iThreshold = 10,
			oMockServer = startMockServer(),
			oList = createList({
				growing : true,
				growingThreshold : iThreshold,
				updateFinished : function(oEvent) {
					assert.strictEqual(oEvent.getParameter("total") > oEvent.getParameter("actual"), true, "Total items is higher than actual items");
					setTimeout(function() {
						assert.ok(oList.$().find(".sapMGrowingList").is(":visible"), "Growing indicator is visible");
					}, 0);
				}
			}, {
				parameters: {
					countMode: "None"
				}
			});

		// when initial binding is completed
		oList.done(function () {
			setTimeout(function() {
				oMockServer.stop();
				oList.destroy();
				done();
			}, 0);
		});
	});

	QUnit.test("CountMode.None should not show growing indicator when all items are shown", function(assert) {
		var done = assert.async();
		var iThreshold = 20,
			oMockServer = startMockServer(),
			oList = createList({
				growing : true,
				growingThreshold : iThreshold,
				updateFinished : function(oEvent) {
					assert.strictEqual(oEvent.getParameter("total"), 16, "Total number equals amount of entries");
					assert.strictEqual(oEvent.getParameter("actual"), 16, "Actual number equals amount of entries");
					assert.ok(!oList.$().find(".sapMGrowingList").is(":visible"), "Growing indicator is not visible");
				}
			}, {
				parameters: {
					countMode: "None"
				}
			});

		// when initial binding is completed
		oList.done(function () {
			oMockServer.stop();
			oList.destroy();
			done();
		});
	});

	QUnit.module("NonAbsoluteAndUnresolveable Binding Path");
	QUnit.test("Should not fire update started if a binding cannot be resolved", function(assert) {
		var oMockServer = startMockServer(),
			oList = createList({
				updateStarted : function () {
					assert.ok(false, "Started an update! Why should we? There should no request fired.");
				}
			}, {
				path : "nonAbsoluteAndUnresolveable"
			});

		assert.ok(!oList.getBusy(), "Why should the list be busy? There should not be any request");

		// clean up
		oMockServer.stop();
		oList.destroy();
	});

	QUnit.module("FocusAfterBindingUpdate");
	document.hasFocus() && QUnit.test("Focus should be retained after binding update", function(assert) {
		var done = assert.async();
		var sFocusedControlId,
			oMockServer = startMockServer(),
			oDeferred = jQuery.Deferred(),
			oList = createList({
				growing : false
			}, {
				template : new InputListItem({
					label: "Product Name",
					content : new Input({
						value: "{Name}"
					})
				})
			});

		// when initial binding is completed
		oList.done(function () {

			// focus to the input field
			sFocusedControlId = oList.$().find("input").eq(5).trigger("focus").attr("id");

			// rerender list
			oList.rerender();

			setTimeout(function() {
				// check focus after rerender
				assert.strictEqual(document.activeElement.id, sFocusedControlId, "Focus is retained after list rerender");

				// recheck focus after binding update
				oList.attachUpdateFinished(function(oEvent) {
					assert.strictEqual(document.activeElement.id, sFocusedControlId, "Focus is retained after binding update");
					oDeferred.resolve();
				});

				// update the list binding
				oList.updateItems();
			}, 0);

		});

		// when test is completed
		jQuery.when(oDeferred).done(function () {
			oMockServer.stop();
			oList.destroy();
			done();
		});
	});

	QUnit.test("Last setGrowingThreshold should be respected before data fetching", function(assert) {
		var done = assert.async();
		var iInitThreshold = 5,
			iLastThreshold = 10,
			oMockServer = startMockServer(),
			oList = createList({
				growing : true,
				growingThreshold : iInitThreshold,
				updateFinished : function(oEvent) {
					assert.strictEqual(oEvent.getParameter("actual"), iLastThreshold, "Last growing threshold is respected");
				}
			});

		oList.setGrowingThreshold(iLastThreshold);

		// when initial binding is completed
		oList.done(function () {
			oMockServer.stop();
			oList.destroy();
			done();
		});
	});

	QUnit.module("Upwards Growing Direction");
	QUnit.test("Should fetch the data and render in reverse order", function(assert) {
		var done = assert.async();
		var iThreshold = 5,
			oDeferred = jQuery.Deferred(),
			oMockServer = startMockServer(),
			oList = createList({
				growing : true,
				growingThreshold : iThreshold,
				growingDirection : "Upwards",
				updateFinished : function(oEvent) {
					var oNavigationRoot = oList.getNavigationRoot(),
						$GrowingButton = oList.$("trigger");

					assert.ok($GrowingButton.parent().next().get(0) === oList.getDomRef("before"), "Growing button is inserted before the first item.");
					assert.ok(oList.getItems().pop().getDomRef() === oNavigationRoot.children[0], "Last aggregation DOM is the first child of the list");

					if (document.hasFocus() && oList.getItemNavigation()) {
						oList.focus();
						assert.ok(document.activeElement === oNavigationRoot.children[iThreshold - 1], "First focus jumps to last item");
					}

					// act: request new page
					$GrowingButton.trigger("focus").trigger("tap");

					oList.attachUpdateFinished(function(oEvent) {
						oNavigationRoot = oList.getNavigationRoot();
						assert.ok(oList.getItems().pop().getDomRef() === oNavigationRoot.children[0], "Last aggregation DOM is the first child of the list");

						if (document.hasFocus()) {
							assert.ok(document.activeElement === $GrowingButton.get(0), "Focus is not changed after growing");
						}

						oDeferred.resolve();
					});
				}
			});

		// when test is completed
		jQuery.when(oDeferred).done(function () {
			oMockServer.stop();
			oList.destroy();
			done();
		});
	});

	QUnit.module("TwoWayBinding And Growing");
	QUnit.test("Property changes updates the list binding when growing feature is enabled", function(assert) {
		var done = assert.async();
		// arrange
		var fnUpdateStartedSpy = this.spy(),
			oMockServer = startMockServer(),
			oModel = createJSONModel(),
			oList = createList({
				growing: true
			}, {}, oModel);

		// when initial binding is completed
		oList.done(function () {
			oList.attachUpdateStarted(fnUpdateStartedSpy);

			oModel.setProperty("/Products/0/Name", ":(");
			assert.strictEqual(fnUpdateStartedSpy.callCount, 1, "Property update also updates the list binding");

			// clean up
			oMockServer.stop();
			oList.destroy();
			done();
		});
	});

	QUnit.test("Property changes should not update the list binding when unique key is defined", function(assert) {
		var done = assert.async();
		// arrange
		var fnUpdateStartedSpy = this.spy(),
			oMockServer = startMockServer(),
			oModel = createJSONModel(),
			oList = createList({
				growing: true
			}, {
				key: "ProductId"
			}, oModel);

		// when initial binding is completed
		oList.done(function () {
			oList.attachUpdateStarted(fnUpdateStartedSpy);

			oModel.setProperty("/Products/0/Name", ":)");
			assert.strictEqual(fnUpdateStartedSpy.callCount, 0, "Property update did not update the list binding.");

			// clean up
			oMockServer.stop();
			oList.destroy();
			done();
		});
	});

	QUnit.module("ExtendedChangeDetection");
	QUnit.test("Replace option when template is available", function(assert) {
		var done = assert.async();

		// arrange
		var oMockServer = startMockServer(),
			oDeferred = jQuery.Deferred(),
			oCreateListItemSpy,
			oSetBindingContextSpy,
			oList = createList({
				growing: true,
				growingThreshold: 4
			});

		// when initial binding has been completed
		oList.done(function () {
			oList.attachUpdateFinished(oDeferred.resolve);
			oCreateListItemSpy = sinon.spy(StandardListItem.prototype, "init");
			oSetBindingContextSpy = sinon.spy(StandardListItem.prototype, "setBindingContext");
			this.getBinding("items").sort(new Sorter("ProductId", true));
		});

		// when sorting has been completed
		jQuery.when(oDeferred).done(function () {

			assert.equal(oCreateListItemSpy.callCount, 0, "No List Item is created because of sort");
			assert.equal(oSetBindingContextSpy.callCount, 4, "Only binding contexts are set for list items");

			// clean up
			oSetBindingContextSpy.restore();
			oCreateListItemSpy.restore();
			oMockServer.stop();
			oList.destroy();
			done();
		});
	});

	QUnit.test("No replace option when factory is available", function(assert) {
		var done = assert.async();

		// arrange
		var oMockServer = startMockServer(),
			oDeferred = jQuery.Deferred(),
			oCreateListItemSpy,
			oList = createList({
				growing: true,
				growingThreshold: 4
			}, {
				template: null,
				factory: function() {
					return new StandardListItem({
						title : "{Name}",
						description : "{Category}"
					});
				}
			});

		// when initial binding has been completed
		oList.done(function () {
			oList.attachUpdateFinished(oDeferred.resolve);
			oCreateListItemSpy = sinon.spy(StandardListItem.prototype, "init");
			this.getBinding("items").sort(new Sorter("ProductId", true));
		});

		// when sorting has been completed
		jQuery.when(oDeferred).done(function () {

			assert.equal(oCreateListItemSpy.callCount, 4, "4 List Items are created");

			// clean up
			oCreateListItemSpy.restore();
			oMockServer.stop();
			oList.destroy();
			done();
		});
	});

	QUnit.module("Virtual Context", {
		beforeEach: function() {
		},

		afterEach: function() {
			this.list.destroy();
		},

		testVirtualContext: function(assert, bWithGrowing) {

			this.list = createList({growing: bWithGrowing}, null, createJSONModel());

			var iInitialItemCount = this.list.getItems().length;
			var oUpdateItemsSpy = sinon.spy(this.list, "_updateFinished");
			var oInvalidateSpy = sinon.spy(this.list, "invalidate");
			var oBinding = this.list.getBinding("items");

			// Fake the virtual context process.

			oBinding.fireEvent("change", {
				detailedReason: "AddVirtualContext",
				reason: "change"
			});

			var oVirtualItem = this.list._oVirtualItem;

			assert.ok(oInvalidateSpy.notCalled, "AddVirtualContext: List is not invalidated");
			assert.ok(oUpdateItemsSpy.notCalled, "AddVirtualContext: Update hook is not called");
			assert.ok(this.list.indexOfDependent(oVirtualItem) >= 0, "AddVirtualContext: Virtual item added to dependents aggregation");
			assert.ok(oVirtualItem.getId().indexOf("virtual") > 0, "AddVirtualContext: Virtual item has the correct ID");
			assert.strictEqual(this.list.getItems().length, iInitialItemCount, "AddVirtualContext: Number of items is correct");
			assert.strictEqual(oVirtualItem.getBindingContext(), oBinding.getContexts(0, 1)[0],
				"AddVirtualContext: Virtual item has the correct context");
			assert.notOk(oVirtualItem.bIsDestroyed, "AddVirtualContext: Virtual item is not destroyed");
			oInvalidateSpy.reset();
			oUpdateItemsSpy.reset();

			oBinding.fireEvent("change", {
				detailedReason: "RemoveVirtualContext",
				reason: "change"
			});

			assert.ok(oInvalidateSpy.notCalled, "RemoveVirtualContext: List is not invalidated");
			assert.ok(oUpdateItemsSpy.notCalled, "RemoveVirtualContext: Update hook is not called");
			assert.ok(this.list.indexOfDependent(oVirtualItem) === -1, "RemoveVirtualContext: Virtual item removed from dependents aggregation");
			assert.strictEqual(this.list.getItems().length, iInitialItemCount, "AddVirtualContext: Number of items is correct");
			assert.ok(oVirtualItem.bIsDestroyed, "RemoveVirtualContext: Virtual row is destroyed");
			assert.notOk("_oVirtualItem" in this.list, "RemoveVirtualContext: Reference to virtual item removed from list");

			oBinding.fireEvent("change", {
				detailedReason: "AddVirtualContext",
				reason: "change"
			});
			oVirtualItem = this.list._oVirtualItem;
			this.list.bindItems(this.list.getBindingInfo("items"));

			assert.ok(this.list.indexOfDependent(oVirtualItem) === -1, "BindItems: Virtual item removed from dependents aggregation");
			assert.ok(oVirtualItem.bIsDestroyed, "BindItems: Virtual item is destroyed");
			assert.notOk("_oVirtualItem" in this.list, "BindItems: Reference to virtual item removed from list");
		}
	});

	QUnit.test("Virtual Context Handling - Without Growing", function(assert) {
		this.testVirtualContext(assert, false);
	});

	QUnit.test("Virtual Context Handling - With Growing", function(assert) {
		this.testVirtualContext(assert, true);
	});

	QUnit.module("Rebind");
	QUnit.test("List should not invalidate before update on rebind", function(assert) {
		var oMockServer = startMockServer(0),
			oList = createList(),
			oInvalidateSpy = this.spy(oList, "invalidate");

		return new Promise(function(resolve) {
			oList.attachEventOnce("updateFinished", resolve);
		}).then(function() {
			oInvalidateSpy.reset();
			oList.bindItems(oList.getBindingInfo("items"));
			return new Promise(function(resolve) {
				oList.updateItems = resolve;
			});
		}).then(function() {
			assert.ok(oInvalidateSpy.notCalled, "The list is not invalidated");
			oList.destroy();
			oMockServer.stop();
		});
	});

	QUnit.test("List should invalidate on update if all items are removed after rebind", function(assert) {
		var oMockServer = startMockServer(0),
			oList = createList(),
			oInvalidateSpy = this.spy(oList, "invalidate");

		return new Promise(function(resolve) {
			oList.attachEventOnce("updateFinished", resolve);
		}).then(function() {
			oInvalidateSpy.reset();
			oList.getBindingInfo("items").filters = [new Filter("Name", FilterOperator.EQ, "ThisTextShouldNotBeFound")];
			oList.bindItems(oList.getBindingInfo("items"));
			return new Promise(function(resolve) {
				var fnUpdateItems = oList.updateItems;
				oList.updateItems = function() {
					fnUpdateItems.apply(oList, arguments);
					resolve();
				};
			});
		}).then(function() {
			assert.ok(oInvalidateSpy.called, "The list is invalidated");
			oList.destroy();
			oMockServer.stop();
		});
	});

	QUnit.test("List should invalidate on update if items are updated after rebind", function(assert) {
		var oMockServer = startMockServer(0),
			oList = createList(),
			oInvalidateSpy = this.spy(oList, "invalidate");

		return new Promise(function(resolve) {
			oList.attachEventOnce("updateFinished", resolve);
		}).then(function() {
			oInvalidateSpy.reset();
			oList.getBindingInfo("items").filters = [new Filter("Name", FilterOperator.EQ, "Gladiator MX")];
			oList.bindItems(oList.getBindingInfo("items"));
			return new Promise(function(resolve) {
				var fnUpdateItems = oList.updateItems;
				oList.updateItems = function() {
					fnUpdateItems.apply(oList, arguments);
					resolve();
				};
			});
		}).then(function() {
			assert.ok(oInvalidateSpy.called, "The list is invalidated");
			oList.destroy();
			oMockServer.stop();
		});
	});

	QUnit.test("Growing list should invalidate on update if all items are removed after rebind", function(assert) {
		var oMockServer = startMockServer(0),
			oList = createList({
				growing: true
			}),
			oInvalidateSpy = this.spy(oList, "invalidate");

		return new Promise(function(resolve) {
			oList.attachEventOnce("updateFinished", resolve);
		}).then(function() {
			oInvalidateSpy.reset();
			oList.getBindingInfo("items").filters = [new Filter("Name", FilterOperator.EQ, "ThisTextShouldNotBeFound")];
			oList.bindItems(oList.getBindingInfo("items"));
			return new Promise(function(resolve) {
				var fnUpdateItems = oList.updateItems;
				oList.updateItems = function() {
					fnUpdateItems.apply(oList, arguments);
					resolve();
				};
			});
		}).then(function() {
			assert.ok(oInvalidateSpy.called, "The list is invalidated");
			oList.destroy();
			oMockServer.stop();
		});
	});

	QUnit.test("Growing list should not invalidate on update if items are updated after rebind", function(assert) {
		var oMockServer = startMockServer(0),
			oList = createList({
				growing: true
			}),
			oInvalidateSpy = this.spy(oList, "invalidate");

		return new Promise(function(resolve) {
			oList.attachEventOnce("updateFinished", resolve);
		}).then(function() {
			oInvalidateSpy.reset();
			oList.getBindingInfo("items").filters = [new Filter("Name", FilterOperator.EQ, "Gladiator MX")];
			oList.bindItems(oList.getBindingInfo("items"));
			return new Promise(function(resolve) {
				var fnUpdateItems = oList.updateItems;
				oList.updateItems = function() {
					fnUpdateItems.apply(oList, arguments);
					resolve();
				};
			});
		}).then(function() {
			assert.ok(oInvalidateSpy.notCalled, "The list is not invalidated");
			oList.destroy();
			oMockServer.stop();
		});
	});
});