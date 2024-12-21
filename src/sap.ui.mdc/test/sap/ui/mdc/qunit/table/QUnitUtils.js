/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/Element",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/mdc/enums/TableType"
], function(
	ManagedObjectObserver,
	Element,
	qutils,
	KeyCodes,
	TableType
) {
	"use strict";

	function getRowsAggregationName(oTable) {
		return oTable._isOfType(TableType.Table, true) ? "rows" : "items";
	}

	const QUnitUtils = {};

	QUnitUtils.waitForBindingInfo = function(oTable) {
		const sRowsAggregationName = getRowsAggregationName(oTable);
		let oObserver;

		return oTable.initialized().then(function() {
			return new Promise(function(resolve) {
				const oInnerTable = oTable._oTable;

				if (oInnerTable.getBindingInfo(sRowsAggregationName)) {
					resolve();
					return;
				}

				oObserver = new ManagedObjectObserver(function(oChange) {
					if (oChange.mutation === "prepare") {
						resolve();
					}
				}).observe(oInnerTable, {
					bindings: [sRowsAggregationName]
				});
			});
		}).finally(function() {
			if (oObserver) {
				oObserver.disconnect();
			}
		});
	};

	QUnitUtils.waitForBinding = function(oTable) {
		const sRowsAggregationName = getRowsAggregationName(oTable);
		let oObserver;

		return oTable.initialized().then(function() {
			return new Promise(function(resolve) {
				const oInnerTable = oTable._oTable;

				if (oInnerTable.getBinding(sRowsAggregationName)) {
					resolve();
					return;
				}

				oObserver = new ManagedObjectObserver(function(oChange) {
					if (oChange.mutation === "ready") {
						resolve();
					}
				}).observe(oInnerTable, {
					bindings: [sRowsAggregationName]
				});
			});
		}).finally(function() {
			if (oObserver) {
				oObserver.disconnect();
			}
		});
	};

	QUnitUtils.waitForBindingUpdate = function(oTable) {
		return oTable.awaitControlDelegate().then(function(oDelegate) {
			return new Promise(function(resolve) {
				const fnOriginalUpdateBinding = oDelegate.updateBinding;
				oDelegate.updateBinding = function() {
					fnOriginalUpdateBinding.apply(this, arguments);
					oDelegate.updateBinding = fnOriginalUpdateBinding;
					resolve();
				};
			});
		});
	};

	QUnitUtils.openColumnMenu = function(oTable, iColumnIndex) {
		return oTable.initialized().then(function() {
			const oColumn = oTable._oTable.getColumns()[iColumnIndex];
			const oColumnDomRef = oColumn.getDomRef();
			const oMenu = Element.getElementById(oColumn.getHeaderMenu());
			const fnOpenBy = oMenu.openBy;

			return new Promise(function(resolve) {
				oMenu.openBy = function(oAnchor, bSuppressEvent) {
					fnOpenBy.apply(this, arguments);

					if (bSuppressEvent) {
						if (oMenu.isOpen()) {
							resolve();
						} else {
							oMenu._oPopover.attachEventOnce("afterOpen", function() {
								resolve();
							});
						}
					}
				};
				oColumnDomRef.focus();
				qutils.triggerMouseEvent(oColumnDomRef, "mousedown", null, null, null, null, 0);
				qutils.triggerMouseEvent(oColumnDomRef, "click");
			}).then(function() {
				oMenu.openBy = fnOpenBy;
			});
		});
	};

	QUnitUtils.closeColumnMenu = function(oTable) {
		return new Promise(function(resolve) {
			oTable._oColumnHeaderMenu.attachEventOnce("afterClose", function() {
				resolve();
			});
			oTable._oColumnHeaderMenu.close();
		});
	};

	QUnitUtils.waitForP13nPopup = function(oTable) {
		let oObserver;

		return new Promise(function(resolve) {
			oObserver = new ManagedObjectObserver(function(oChange) {
				if (oChange.mutation === "insert" && oChange.child.isA("sap.m.p13n.Popup")) {
					const fnOriginalOpen = oChange.child.open;
					oChange.child.open = function() {
						fnOriginalOpen.apply(this, arguments);
						resolve(oChange.child);
					};
				}
			}).observe(oTable, {
				aggregations: ["dependents"]
			});
		}).finally(function() {
			if (oObserver) {
				oObserver.disconnect();
			}
		});
	};

	QUnitUtils.closeP13nPopup = function(oTable) {
		const oP13nPopup = oTable.getDependents().find(function(oDependent) {
			return oDependent.isA("sap.m.p13n.Popup");
		});

		if (!oP13nPopup) {
			return Promise.resolve();
		}

		return new Promise(function(resolve) {
			oP13nPopup._oPopup.attachEventOnce("afterClose", function() {
				resolve();
			});
			qutils.triggerKeydown(oP13nPopup.getPanels()[0].getDomRef(), KeyCodes.ESCAPE);
		});
	};

	return QUnitUtils;
});