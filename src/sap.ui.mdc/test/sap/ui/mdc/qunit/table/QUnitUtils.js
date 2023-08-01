/*!
 * ${copyright}
 */
sap.ui.define([
	"../QUnitUtils",
	"sap/ui/core/Core",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/mdc/enums/TableType"
], function(
	MDCQUnitUtils,
	Core,
	ManagedObjectObserver,
	qutils,
	KeyCodes,
	TableType
) {
	"use strict";

	var QUnitUtils = Object.assign({}, MDCQUnitUtils);

	function getRowsAggregationName(oTable) {
		return oTable._isOfType(TableType.Table, true) ? "rows" : "items";
	}

	QUnitUtils.stubPropertyInfos = function(oTarget, aPropertyInfos, oTypeMap) {
		var fnOriginalGetControlDelegate = oTarget.getControlDelegate;
		var fnOriginalAwaitControlDelegate = oTarget.awaitControlDelegate;
		var oDelegate;
		var fnOriginalFetchProperties;
		var fnOriginalGetTypeMap;
		var bPropertyHelperExists;

		if (typeof fnOriginalGetControlDelegate !== "function") {
			throw new Error("The target cannot be stubbed. " + oTarget);
		}

		if (oTarget.__restorePropertyInfos) {
			throw new Error("The target is already stubbed. " + oTarget);
		}

		if (typeof oTarget.getPropertyHelper === "function") {
			bPropertyHelperExists = !!oTarget.getPropertyHelper();

			if (bPropertyHelperExists) {
				throw new Error("The target cannot be stubbed if the property helper is already initialized. " + oTarget);
			}
		}

		function getDelegate() {
			if (oDelegate) {
				return oDelegate;
			}

			oDelegate = fnOriginalGetControlDelegate.apply(this, arguments);
			fnOriginalFetchProperties = oDelegate.fetchProperties;

			oDelegate.fetchProperties = function() {
				fnOriginalFetchProperties.apply(this, arguments);
				return Promise.resolve(aPropertyInfos);
			};

			if (oTypeMap) {
				fnOriginalGetTypeMap = oDelegate.getTypeMap;
				oDelegate.getTypeMap = () => oTypeMap;
			}

			return oDelegate;
		}

		oTarget.getControlDelegate = function() {
			return getDelegate.call(this);
		};

		oTarget.awaitControlDelegate = function() {
			return fnOriginalAwaitControlDelegate.apply(this, arguments).then(function() {
				return getDelegate.call(this);
			}.bind(this));
		};

		oTarget.__restorePropertyInfos = function() {
			delete oTarget.__restorePropertyInfos;
			oTarget.getControlDelegate = fnOriginalGetControlDelegate;
			oTarget.awaitControlDelegate = fnOriginalAwaitControlDelegate;

			if (oDelegate) {
				oDelegate.fetchProperties = fnOriginalFetchProperties;

				if (fnOriginalGetTypeMap) {
					oDelegate.getTypeMap = fnOriginalGetTypeMap;
				}
			}
		};
	};

	QUnitUtils.restorePropertyInfos = function(oTarget) {
		if (oTarget.__restorePropertyInfos) {
			oTarget.__restorePropertyInfos();
		}
	};

	QUnitUtils.waitForBindingInfo = function(oTable) {
		var sRowsAggregationName = getRowsAggregationName(oTable);
		var oObserver;

		return oTable.initialized().then(function() {
			return new Promise(function(resolve) {
				var oInnerTable = oTable._oTable;

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
		var sRowsAggregationName = getRowsAggregationName(oTable);
		var oObserver;

		return oTable.initialized().then(function() {
			return new Promise(function(resolve) {
				var oInnerTable = oTable._oTable;

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
				var fnOriginalUpdateBinding = oDelegate.updateBinding;
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
			var oColumn = oTable._oTable.getColumns()[iColumnIndex];
			var oColumnDomRef = oColumn.getDomRef();
			var oMenu = Core.byId(oColumn.getHeaderMenu());
			var fnOpenBy = oMenu.openBy;

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

	QUnitUtils.waitForSettingsDialog = function(oTable) {
		var oObserver;

		return new Promise(function(resolve) {
			oObserver = new ManagedObjectObserver(function(oChange) {
				if (oChange.mutation === "insert" && oChange.child.isA("sap.m.p13n.Popup")) {
					var fnOriginalOpen = oChange.child.open;
					oChange.child.open = function() {
						fnOriginalOpen.apply(this, arguments);
						resolve(oChange.child._oPopup);
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

	QUnitUtils.closeSettingsDialog = function(oTable) {
		var oP13nPopup = oTable.getDependents().find(function(oDepentent) {
			return oDepentent.isA("sap.m.p13n.Popup");
		});

		if (!oP13nPopup) {
			return Promise.resolve();
		}

		return new Promise(function(resolve) {
			oP13nPopup._oPopup.attachEventOnce("afterClose", function() {
				resolve();
			});
			qutils.triggerKeydown(oP13nPopup._oPopup.getDomRef(), KeyCodes.ESCAPE);
		});
	};

	return QUnitUtils;
});