/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils.ODataV2",
	"sap/ui/table/Table",
	"sap/ui/model/Filter",
	"sap/ui/core/Core"
], function(TableQUnitUtils, Table, Filter, Core) {
	"use strict";

	QUnit.module("API", {
		before: function() {
			this.oMockServer = TableQUnitUtils.startMockServer();
			this.oDataModel = TableQUnitUtils.createODataModel();

			return this.oDataModel.metadataLoaded();
		},
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rows: {path: "/Products"},
				models: this.oDataModel
			});

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		after: function() {
			this.oMockServer.destroy();
			this.oDataModel.destroy();
		}
	});

	QUnit.test("#_getTotalRowCount", function(assert){
		var oTable = this.oTable;

		assert.strictEqual(oTable._getTotalRowCount(), 16, "Binding#getLength defines the total row count in the table");

		oTable.bindRows({path: "/Products"});
		assert.strictEqual(oTable._getTotalRowCount(), 16, "On rebind, the last known binding length of the previous binding is returned");

		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.strictEqual(oTable._getTotalRowCount(), 16, "After rebind, the new binding length is returned");
			oTable.getBinding().refresh();
			assert.strictEqual(oTable._getTotalRowCount(), 16, "On refresh, the last known binding length is returned");
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.strictEqual(oTable._getTotalRowCount(), 16, "After refresh, the new binding length is returned");
			oTable.getBinding().filter(new Filter({
				path: "Category",
				operator: "EQ",
				value1: "GC"
			}));
			assert.strictEqual(oTable._getTotalRowCount(), 16, "On filter, the last known binding length is returned");
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.strictEqual(oTable._getTotalRowCount(), 3, "After filter, the new binding length is returned");
			oTable.bindRows({path: "/Products", length: 5});
			assert.strictEqual(oTable._getTotalRowCount(), 5, "The \"length\" parameter in the binding info overrides Binding#getLength");
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.strictEqual(oTable._getTotalRowCount(), 5, "After data is received, still the \"length\" parameter is returned");
			oTable.getBinding().refresh();
			assert.strictEqual(oTable._getTotalRowCount(), 5, "On refresh, still the \"length\" parameter is returned");
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.strictEqual(oTable._getTotalRowCount(), 5, "After refresh, still the \"length\" parameter is returned");

			var oModel = oTable.getModel();
			oTable.setModel(null);
			assert.strictEqual(oTable._getTotalRowCount(), 0, "Without a binding the total row count is 0, regardless of the binding info");

			oTable.unbindRows();
			oTable.setModel(oModel);
			assert.strictEqual(oTable._getTotalRowCount(), 0, "Without a binding or binding info the total row count is 0");
		});
	});

	QUnit.module("Get contexts", {
		before: function() {
			this.oMockServer = TableQUnitUtils.startMockServer();
			this.oDataModel = TableQUnitUtils.createODataModel();
			this.oGetContextsSpy = sinon.spy(Table.prototype, "_getContexts");

			TableQUnitUtils.setDefaultSettings({
				rows: {path: "/Products"},
				models: this.oDataModel
			});

			return this.oDataModel.metadataLoaded();
		},
		beforeEach: function() {
			this.oGetContextsSpy.resetHistory();
		},
		after: function() {
			this.oMockServer.destroy();
			this.oDataModel.destroy();
			this.oGetContextsSpy.restore();
			TableQUnitUtils.setDefaultSettings();
		}
	});

	QUnit.test("Initialization", function(assert) {
		var oTable = TableQUnitUtils.createTable();
		var oGetContextsSpy = this.oGetContextsSpy;

		// refreshRows, render, updateRows
		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.alwaysCalledWithExactly(oGetContextsSpy, 0, 10, 100);
			oTable.destroy();
		});
	});

	QUnit.test("Initialization; With fixed rows", function(assert) {
		var oTable = TableQUnitUtils.createTable({
			fixedRowCount: 1,
			fixedBottomRowCount: 1
		});
		var oGetContextsSpy = this.oGetContextsSpy;

		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(oGetContextsSpy.callCount, 4, "Call count of method to get contexts");

			// The initial getContexts call does not consider fixed row counts, because binding is initialized before properties for fixed row counts
			// are set (see ManagedObject#applySettings).

			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(0), 0, 10, 100); // refreshRows
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(1), 0, 9, 100); // render
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(2), 0, 9, 100); // updateRows
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(3), 15, 1, 0, true); // fixed bottom rows

			oTable.destroy();
		});
	});

	QUnit.test("Initialization; With fixed rows, firstVisibleRow = 1, threshold = 1", function(assert) {
		var oTable = TableQUnitUtils.createTable({
			visibleRowCount: 5,
			fixedRowCount: 1,
			fixedBottomRowCount: 1,
			firstVisibleRow: 1,
			threshold: 1
		});
		var oGetContextsSpy = this.oGetContextsSpy;

		return oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(oGetContextsSpy.callCount, 6, "Call count of method to get contexts");

			// The initial getContexts call does not consider fixed row counts and the threshold, because the binding is initialized before
			// the corresponding properties are set (see ManagedObject#applySettings).
			// Fixed bottom rows can't be requested if the count is unknown. As soon as the binding receives a getContexts call that triggers a
			// request, it ignores subsequent calls.

			// refreshRows
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(0), 0, 10, 100); // scrollable rows
			// render
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(1), 0, 1, 0, true); // fixed top rows
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(2), 2, 3, 3); // scrollable rows
			// updateRows: Received rows requested in refreshRows
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(3), 0, 1, 0, true); // fixed top rows
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(4), 2, 3, 3); // scrollable rows
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(5), 15, 1, 0, true); // fixed bottom rows

			oTable.destroy();
		});
	});

	QUnit.test("Refresh", function(assert) {
		var oTable = TableQUnitUtils.createTable();
		var oGetContextsSpy = this.oGetContextsSpy;

		return oTable.qunit.whenRenderingFinished().then(function() {
			oGetContextsSpy.resetHistory();
			oTable.getBinding().refresh();
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oGetContextsSpy.callCount, 2, "Call count of method to get contexts");
			sinon.assert.alwaysCalledWithExactly(oGetContextsSpy, 0, 10, 100);
			oTable.destroy();
		});
	});

	QUnit.test("Refresh; With fixed rows", function(assert) {
		var oTable = TableQUnitUtils.createTable({
			fixedRowCount: 1,
			fixedBottomRowCount: 1
		});
		var oGetContextsSpy = this.oGetContextsSpy;

		return oTable.qunit.whenRenderingFinished().then(function() {
			oGetContextsSpy.resetHistory();
			oTable.getBinding().refresh();
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oGetContextsSpy.callCount, 3, "Call count of method to get contexts");
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(0), 0, 9, 100);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(1), 0, 9, 100);
			sinon.assert.calledWithExactly(oGetContextsSpy.getCall(2), 15, 1, 0, true);
			oTable.destroy();
		});
	});

	QUnit.test("Refresh; With fixed rows, firstVisibleRow = 1, threshold = 1", function(assert) {
		var oTable = TableQUnitUtils.createTable({
			visibleRowCount: 5,
			fixedRowCount: 1,
			fixedBottomRowCount: 1,
			firstVisibleRow: 1,
			threshold: 1
		});
		var oGetContextsSpy = this.oGetContextsSpy;

		return oTable.qunit.whenRenderingFinished().then(function() {
			oGetContextsSpy.resetHistory();
			oTable.getBinding().refresh();
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			return new Promise(function(resolve) {
				setTimeout(function() {
					assert.equal(oGetContextsSpy.callCount, 11, "Call count of method to get contexts");
					// Fixed bottom rows can't be requested if the count is unknown, e.g. during refresh. As soon as the binding receives a
					// getContexts call that triggers a request, it ignores subsequent calls. Therefore, only fixed top rows are loaded initially.

					// refreshRows
					sinon.assert.calledWithExactly(oGetContextsSpy.getCall(0), 0, 1, 0, true); // fixed top rows
					sinon.assert.calledWithExactly(oGetContextsSpy.getCall(1), 2, 3, 3); // scrollable rows
					// updateRows: Received fixed top rows
					sinon.assert.calledWithExactly(oGetContextsSpy.getCall(2), 0, 1, 0, true); // fixed top rows
					sinon.assert.calledWithExactly(oGetContextsSpy.getCall(3), 2, 3, 3); // scrollable rows
					sinon.assert.calledWithExactly(oGetContextsSpy.getCall(4), 15, 1, 0, true); // fixed bottom rows
					// updateRows: Received scrollable rows
					sinon.assert.calledWithExactly(oGetContextsSpy.getCall(5), 0, 1, 0, true); // fixed top rows
					sinon.assert.calledWithExactly(oGetContextsSpy.getCall(6), 2, 3, 3); // scrollable rows
					sinon.assert.calledWithExactly(oGetContextsSpy.getCall(7), 15, 1, 0, true); // fixed bottom rows
					// updateRows: Received fixed bottom rows
					sinon.assert.calledWithExactly(oGetContextsSpy.getCall(8), 0, 1, 0, true); // fixed top rows
					sinon.assert.calledWithExactly(oGetContextsSpy.getCall(9), 2, 3, 3); // scrollable rows
					sinon.assert.calledWithExactly(oGetContextsSpy.getCall(10), 15, 1, 0, true); // fixed bottom rows

					oTable.destroy();
					resolve();
				}, 500);
			});
		});
	});

	QUnit.test("Sort", function(assert) {
		var oTable = TableQUnitUtils.createTable();
		var oGetContextsSpy = this.oGetContextsSpy;

		return oTable.qunit.whenRenderingFinished().then(function() {
			oGetContextsSpy.resetHistory();
			oTable.getBinding().sort();
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(oGetContextsSpy.callCount, 2, "Call count of method to get contexts");
			sinon.assert.alwaysCalledWithExactly(oGetContextsSpy, 0, 10, 100);
			oTable.destroy();
		});
	});

	QUnit.test("Sort; With fixed rows", function(assert) {
		var oTable = TableQUnitUtils.createTable({
			fixedRowCount: 1,
			fixedBottomRowCount: 1
		});
		var oGetContextsSpy = this.oGetContextsSpy;

		return oTable.qunit.whenRenderingFinished().then(function() {
			oGetContextsSpy.resetHistory();
			oTable.getBinding().sort();
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			return new Promise(function(resolve) {
				setTimeout(function() {
					assert.equal(oGetContextsSpy.callCount, 4, "Call count of method to get contexts");
					sinon.assert.calledWithExactly(oGetContextsSpy.getCall(0), 0, 9, 100);
					sinon.assert.calledWithExactly(oGetContextsSpy.getCall(1), 15, 1, 0, true);
					sinon.assert.calledWithExactly(oGetContextsSpy.getCall(2), 0, 9, 100);
					sinon.assert.calledWithExactly(oGetContextsSpy.getCall(3), 15, 1, 0, true);
					oTable.destroy();
					resolve();
				}, 500);
			});
		});
	});

	QUnit.test("Sort; With fixed rows, firstVisibleRow = 1, threshold = 1", function(assert) {
		var oTable = TableQUnitUtils.createTable({
			visibleRowCount: 5,
			fixedRowCount: 1,
			fixedBottomRowCount: 1,
			firstVisibleRow: 1,
			threshold: 1
		});
		var oGetContextsSpy = this.oGetContextsSpy;

		return oTable.qunit.whenRenderingFinished().then(function() {
			oGetContextsSpy.resetHistory();
			oTable.getBinding().sort();
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			return new Promise(function(resolve) {
				setTimeout(function() {
					assert.equal(oGetContextsSpy.callCount, 6, "Call count of method to get contexts");
					sinon.assert.calledWithExactly(oGetContextsSpy.getCall(0), 0, 4, 3); // refreshRows
					sinon.assert.calledWithExactly(oGetContextsSpy.getCall(1), 15, 1, 0, true); // fixed bottom contexts
					sinon.assert.calledWithExactly(oGetContextsSpy.getCall(2), 0, 4, 3); // updateRows
					sinon.assert.calledWithExactly(oGetContextsSpy.getCall(3), 15, 1, 0, true); // fixed bottom contexts
					sinon.assert.calledWithExactly(oGetContextsSpy.getCall(4), 0, 4, 3); // updateRows
					sinon.assert.calledWithExactly(oGetContextsSpy.getCall(5), 15, 1, 0, true); // fixed bottom contexts
					oTable.destroy();
					resolve();
				}, 500);
			});
		});
	});

	QUnit.module("BusyIndicator", {
		before: function() {
			this.oMockServer = TableQUnitUtils.startMockServer();
			this.oDataModel = TableQUnitUtils.createODataModel();

			TableQUnitUtils.setDefaultSettings({
				id: "table",
				models: this.oDataModel
			});

			return this.oDataModel.metadataLoaded();
		},
		afterEach: function() {
			this.getTable().destroy();
		},
		after: function() {
			this.oMockServer.destroy();
			this.oDataModel.destroy();
			TableQUnitUtils.setDefaultSettings();
		},
		assertState: function(assert, sMessage, mExpectation) {
			var oTable = this.getTable();

			assert.deepEqual({
				pendingRequests: oTable._hasPendingRequests(),
				busy: oTable.getBusy()
			}, mExpectation, sMessage);
		},
		getTable: function() {
			return Core.byId("table");
		}
	});

	QUnit.test("Initial request; Automatic BusyIndicator disabled", function(assert) {
		var done = assert.async();
		var that = this;

		assert.expect(4);

		TableQUnitUtils.createTable({
			busyStateChanged: function() {
				assert.ok(false, "The 'busyStateChanged' event should not be fired");
			},
			rows: {
				path: "/Products",
				events: {
					dataRequested: function() {
						that.assertState(assert, "On 'dataRequested'", {pendingRequests: true, busy: false});
					},
					dataReceived: function() {
						that.assertState(assert, "On 'dataReceived'", {pendingRequests: false, busy: false});

						setTimeout(function() {
							that.assertState(assert, "200ms after 'dataReceived'", {pendingRequests: false, busy: false});
							done();
						}, 200);
					}
				}
			}
		});

		this.assertState(assert, "After initialization", {pendingRequests: true, busy: false});
	});

	QUnit.test("Initial request; Automatic BusyIndicator enabled", function(assert) {
		var done = assert.async();
		var that = this;

		assert.expect(5);

		TableQUnitUtils.createTable({
			enableBusyIndicator: true,
			busyStateChanged: function(oEvent) {
				if (oEvent.getParameter("busy")) {
					that.assertState(assert, "On 'busyStateChanged' - State changed to true", {pendingRequests: true, busy: true});
				} else {
					that.assertState(assert, "On 'busyStateChanged' - State changed to false", {pendingRequests: false, busy: false});
					done();
				}
			},
			rows: {
				path: "/Products",
				events: {
					dataRequested: function() {
						that.assertState(assert, "On 'dataRequested'", {pendingRequests: true, busy: true});
					},
					dataReceived: function() {
						that.assertState(assert, "On 'dataReceived'", {pendingRequests: false, busy: true});
					}
				}
			}
		});

		this.assertState(assert, "After initialization", {pendingRequests: true, busy: true});
	});

	QUnit.test("Scroll after 'dataReceived'", function(assert) {
		var done = assert.async();
		var that = this;

		assert.expect(6);

		TableQUnitUtils.createTable({
			enableBusyIndicator: true,
			threshold: 0,
			busyStateChanged: function(oEvent) {
				if (oEvent.getParameter("busy")) {
					that.assertState(assert, "On 'busyStateChanged' - State changed to true", {pendingRequests: true, busy: true});
				} else {
					that.assertState(assert, "On 'busyStateChanged' - State changed to false", {pendingRequests: false, busy: false});
					done();
				}
			},
			rows: {
				path: "/Products",
				events: {
					dataRequested: function() {
						that.assertState(assert, "On 'dataRequested'", {pendingRequests: true, busy: true});
					},
					dataReceived: function() {
						that.assertState(assert, "On 'dataReceived'", {pendingRequests: false, busy: true});
						that.getTable().setFirstVisibleRow(1);
					}
				}
			}
		});
	});

	QUnit.test("Refresh the binding after 'dataReceived'", function(assert) {
		var done = assert.async();
		var that = this;
		var bRefreshed = false;

		assert.expect(6);

		TableQUnitUtils.createTable({
			enableBusyIndicator: true,
			busyStateChanged: function(oEvent) {
				if (oEvent.getParameter("busy")) {
					that.assertState(assert, "On 'busyStateChanged' - State changed to true", {pendingRequests: true, busy: true});
				} else {
					that.assertState(assert, "On 'busyStateChanged' - State changed to false", {pendingRequests: false, busy: false});
					done();
				}
			},
			rows: {
				path: "/Products",
				events: {
					dataRequested: function() {
						that.assertState(assert, "On 'dataRequested'", {pendingRequests: true, busy: true});
					},
					dataReceived: function() {
						that.assertState(assert, "On 'dataReceived'", {pendingRequests: false, busy: true});

						if (!bRefreshed) {
							bRefreshed = true;
							that.getTable().getBinding().refresh();
						}
					}
				}
			}
		});
	});

	QUnit.test("Rebind after 'dataRequested'", function(assert) {
		var done = assert.async();
		var that = this;
		var bRebound = false;

		assert.expect(5);

		TableQUnitUtils.createTable({
			enableBusyIndicator: true,
			busyStateChanged: function(oEvent) {
				if (oEvent.getParameter("busy")) {
					that.assertState(assert, "On 'busyStateChanged' - State changed to true", {pendingRequests: true, busy: true});
				} else {
					that.assertState(assert, "On 'busyStateChanged' - State changed to false", {pendingRequests: false, busy: false});
					done();
				}
			},
			rows: {
				path: "/Products",
				events: {
					dataRequested: function() {
						that.assertState(assert, "On 'dataRequested'", {pendingRequests: true, busy: true});

						if (!bRebound) {
							bRebound = true;
							that.getTable().bindRows(that.getTable().getBindingInfo("rows"));
						}
					},
					dataReceived: function() {
						that.assertState(assert, "On 'dataReceived'", {pendingRequests: false, busy: true});
					}
				}
			}
		});
	});

	QUnit.test("Unbind after 'dataRequested'", function(assert) {
		var done = assert.async();
		var that = this;

		assert.expect(3);

		TableQUnitUtils.createTable({
			enableBusyIndicator: true,
			busyStateChanged: function(oEvent) {
				if (oEvent.getParameter("busy")) {
					that.assertState(assert, "On 'busyStateChanged' - State changed to true", {pendingRequests: true, busy: true});
				} else {
					that.assertState(assert, "On 'busyStateChanged' - State changed to false", {pendingRequests: false, busy: false});
					done();
				}
			},
			rows: {
				path: "/Products",
				events: {
					dataRequested: function() {
						that.assertState(assert, "On 'dataRequested'", {pendingRequests: true, busy: true});
						setTimeout(function() {
							that.getTable().unbindRows();
						}, 0);
					},
					dataReceived: function() {
						that.assertState(assert, "On 'dataReceived'", {pendingRequests: false, busy: true});
					}
				}
			}
		});
	});

	QUnit.test("Enable automatic BusyIndicator after 'dataRequested'", function(assert) {
		var done = assert.async();
		var that = this;

		assert.expect(5);

		TableQUnitUtils.createTable({
			busyStateChanged: function(oEvent) {
				if (oEvent.getParameter("busy")) {
					that.assertState(assert, "On 'busyStateChanged' - State changed to true", {pendingRequests: true, busy: true});
				} else {
					that.assertState(assert, "On 'busyStateChanged' - State changed to false", {pendingRequests: false, busy: false});
					done();
				}
			},
			rows: {
				path: "/Products",
				events: {
					dataRequested: function() {
						that.assertState(assert, "On 'dataRequested'", {pendingRequests: true, busy: false});
						setTimeout(function() {
							that.getTable().setEnableBusyIndicator(true);
						}, 0);
					},
					dataReceived: function() {
						that.assertState(assert, "On 'dataReceived'", {pendingRequests: false, busy: true});
					}
				}
			}
		});

		this.assertState(assert, "After initialization", {pendingRequests: true, busy: false});
	});

	QUnit.test("Disable automatic BusyIndicator after 'dataRequested'", function(assert) {
		var done = assert.async();
		var that = this;

		assert.expect(5);

		TableQUnitUtils.createTable({
			enableBusyIndicator: true,
			busyStateChanged: function(oEvent) {
				if (oEvent.getParameter("busy")) {
					that.assertState(assert, "On 'busyStateChanged' - State changed to true", {pendingRequests: true, busy: true});
				} else {
					that.assertState(assert, "On 'busyStateChanged' - State changed to false", {pendingRequests: true, busy: false});
					done();
				}
			},
			rows: {
				path: "/Products",
				events: {
					dataRequested: function() {
						that.assertState(assert, "On 'dataRequested'", {pendingRequests: true, busy: true});
						setTimeout(function() {
							that.getTable().setEnableBusyIndicator(false);
						}, 0);
					},
					dataReceived: function() {
						that.assertState(assert, "On 'dataReceived'", {pendingRequests: false, busy: false});
					}
				}
			}
		});

		this.assertState(assert, "After initialization", {pendingRequests: true, busy: true});
	});

	QUnit.test("Scroll after state changed to not busy", function(assert) {
		var done = assert.async();
		var that = this;
		var bScrolled = false;

		assert.expect(8);

		TableQUnitUtils.createTable({
			enableBusyIndicator: true,
			threshold: 0,
			busyStateChanged: function(oEvent) {
				if (oEvent.getParameter("busy")) {
					that.assertState(assert, "On 'busyStateChanged' - State changed to true", {pendingRequests: true, busy: true});
				} else {
					that.assertState(assert, "On 'busyStateChanged' - State changed to false", {pendingRequests: false, busy: false});

					if (!bScrolled) {
						bScrolled = true;
						that.getTable().setFirstVisibleRow(1);
					} else {
						done();
					}
				}
			},
			rows: {
				path: "/Products",
				events: {
					dataRequested: function() {
						that.assertState(assert, "On 'dataRequested'", {pendingRequests: true, busy: true});
					},
					dataReceived: function() {
						that.assertState(assert, "On 'dataReceived'", {pendingRequests: false, busy: true});
					}
				}
			}
		});
	});

	QUnit.test("Multiple parallel requests", function(assert) {
		var done = assert.async();
		var that = this;
		var bSimulatingParallelRequests = false;

		assert.expect(10);

		TableQUnitUtils.createTable({
			enableBusyIndicator: true,
			busyStateChanged: function(oEvent) {
				if (oEvent.getParameter("busy")) {
					that.assertState(assert, "On 'busyStateChanged' - State changed to true", {pendingRequests: true, busy: true});
				} else {
					that.assertState(assert, "On 'busyStateChanged' - State changed to false", {pendingRequests: false, busy: false});
					done();
				}
			},
			rows: {
				path: "/Products",
				events: {
					dataRequested: function() {
						that.assertState(assert, "On 'dataRequested'", {pendingRequests: true, busy: true});

						if (!bSimulatingParallelRequests) {
							var oBinding = that.getTable().getBinding();

							bSimulatingParallelRequests = true;
							oBinding.fireDataRequested();
							oBinding.fireDataRequested();
							oBinding.fireDataReceived();
							oBinding.fireDataRequested();
							oBinding.fireDataReceived();
							oBinding.fireDataReceived();
							bSimulatingParallelRequests = false;
						}
					},
					dataReceived: function() {
						if (bSimulatingParallelRequests) {
							that.assertState(assert, "On 'dataReceived'", {pendingRequests: true, busy: true});
						} else {
							that.assertState(assert, "On 'dataReceived'", {pendingRequests: false, busy: true});
						}
					}
				}
			}
		});
	});

	QUnit.module("NoData", {
		before: function() {
			this.oMockServer = TableQUnitUtils.startMockServer();
			this.oDataModel = TableQUnitUtils.createODataModel();

			TableQUnitUtils.setDefaultSettings({
				rows: {path: "/Products"},
				columns: [
					TableQUnitUtils.createTextColumn()
				],
				models: this.oDataModel
			});

			return this.oDataModel.metadataLoaded();
		},
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable();
			this.iNoDataVisibilityChanges = 0;

			return this.oTable.qunit.whenRenderingFinished().then(function() {
				this.oObserver = new MutationObserver(function(aRecords) {
					var oRecord = aRecords[0];
					var bNoDataWasVisible = oRecord.oldValue.includes("sapUiTableEmpty");
					var bNoDataIsVisible = oRecord.target.classList.contains("sapUiTableEmpty");

					if (bNoDataWasVisible !== bNoDataIsVisible) {
						this.iNoDataVisibilityChanges++;
					}
				}.bind(this));

				this.oObserver.observe(this.oTable.getDomRef(), {attributes: true, attributeOldValue: true, attributeFilter: ["class"]});
			}.bind(this));
		},
		afterEach: function() {
			if (this.oObserver) {
				this.oObserver.disconnect();
			}
			this.oTable.destroy();
		},
		after: function() {
			this.oMockServer.destroy();
			this.oDataModel.destroy();
			TableQUnitUtils.setDefaultSettings();
		},
		assertNoDataVisibilityChangeCount: function(assert, iCount) {
			assert.equal(this.iNoDataVisibilityChanges, iCount, "Number of NoData visibility changes");
			this.resetNoDataVisibilityChangeCount();
		},
		resetNoDataVisibilityChangeCount: function() {
			this.iNoDataVisibilityChanges = 0;
		}
	});

	QUnit.test("After rendering with data", function(assert) {
		var pDone;

		this.oTable.destroy();
		this.oTable = TableQUnitUtils.createTable(function(oTable) {
			pDone = new Promise(function(resolve) {
				TableQUnitUtils.addDelegateOnce(oTable, "onAfterRendering", function() {
					TableQUnitUtils.assertNoDataVisible(assert, oTable, false);
					resolve();
				});
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				TableQUnitUtils.assertNoDataVisible(assert, oTable, false);
			});
		});

		return pDone;
	});

	QUnit.test("After rendering without data", function(assert) {
		var pDone;

		this.oTable.destroy();
		this.oTable = TableQUnitUtils.createTable({
			rows: {path: "/Products", filters: [new Filter({path: "Name", operator: "EQ", value1: "DoesNotExist"})]}
		}, function(oTable) {
			pDone = new Promise(function(resolve) {
				TableQUnitUtils.addDelegateOnce(oTable, "onAfterRendering", function() {
					TableQUnitUtils.assertNoDataVisible(assert, oTable, false);
					resolve();
				});
			}).then(oTable.qunit.whenRenderingFinished).then(function() {
				TableQUnitUtils.assertNoDataVisible(assert, oTable, true);
			});
		});

		return pDone;
	});

	QUnit.test("Filter", function(assert) {
		var that = this;

		this.oTable.getBinding().filter(new Filter({path: "Name", operator: "EQ", value1: "DoesNotExist"}));
		return this.oTable.qunit.whenRenderingFinished().then(function() {
			TableQUnitUtils.assertNoDataVisible(assert, that.oTable, true, "Filter");
			that.assertNoDataVisibilityChangeCount(assert, 1);
			that.oTable.getBinding().filter();
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			TableQUnitUtils.assertNoDataVisible(assert, that.oTable, false, "Remove filter");
			that.assertNoDataVisibilityChangeCount(assert, 1);
		});
	});

	QUnit.test("Rerender while filtering", function(assert) {
		var that = this;

		this.oTable.getBinding().filter(new Filter({path: "Name", operator: "EQ", value1: "DoesNotExist"}));
		this.oTable.rerender();
		return this.oTable.qunit.whenRenderingFinished().then(function() {
			TableQUnitUtils.assertNoDataVisible(assert, that.oTable, true, "Filter");
			that.assertNoDataVisibilityChangeCount(assert, 1);
			that.oTable.rerender();
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			TableQUnitUtils.assertNoDataVisible(assert, that.oTable, true, "Rerender");
			that.assertNoDataVisibilityChangeCount(assert, 0);
			that.oTable.getBinding().filter();
			that.oTable.rerender();
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			TableQUnitUtils.assertNoDataVisible(assert, that.oTable, false, "Remove Filter");
			that.assertNoDataVisibilityChangeCount(assert, 1);
			that.oTable.rerender();
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			TableQUnitUtils.assertNoDataVisible(assert, that.oTable, false, "Rerender");
			that.assertNoDataVisibilityChangeCount(assert, 0);
		});
	});

	QUnit.test("Bind/Unbind", function(assert) {
		var oBindingInfo = this.oTable.getBindingInfo("rows");
		var that = this;

		this.oTable.unbindRows();
		return this.oTable.qunit.whenRenderingFinished().then(function() {
			TableQUnitUtils.assertNoDataVisible(assert, that.oTable, true, "Unbind");
			that.assertNoDataVisibilityChangeCount(assert, 1);
			that.oTable.bindRows(oBindingInfo);
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			TableQUnitUtils.assertNoDataVisible(assert, that.oTable, false, "Bind");
			that.assertNoDataVisibilityChangeCount(assert, 1);
		});
	});

	QUnit.test("Rerender while binding/unbinding", function(assert) {
		var oBindingInfo = this.oTable.getBindingInfo("rows");
		var that = this;

		this.oTable.unbindRows();
		this.oTable.rerender();
		return this.oTable.qunit.whenRenderingFinished().then(function() {
			TableQUnitUtils.assertNoDataVisible(assert, that.oTable, true, "Unbind");
			that.assertNoDataVisibilityChangeCount(assert, 1);
			that.oTable.rerender();
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			TableQUnitUtils.assertNoDataVisible(assert, that.oTable, true, "Rerender");
			that.assertNoDataVisibilityChangeCount(assert, 0);
			that.oTable.bindRows(oBindingInfo);
			that.oTable.rerender();
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			TableQUnitUtils.assertNoDataVisible(assert, that.oTable, false, "Bind");
			that.assertNoDataVisibilityChangeCount(assert, 1);
			that.oTable.rerender();
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			TableQUnitUtils.assertNoDataVisible(assert, that.oTable, false, "Rerender");
			that.assertNoDataVisibilityChangeCount(assert, 0);
		});
	});
});