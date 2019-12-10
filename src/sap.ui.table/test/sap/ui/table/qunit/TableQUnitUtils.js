
sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Control",
	"sap/ui/table/library",
	"sap/ui/table/Table",
	"sap/ui/table/TreeTable",
	"sap/ui/table/AnalyticalTable",
	"sap/ui/table/Column",
	"sap/ui/table/RowAction",
	"sap/ui/table/RowActionItem",
	"sap/ui/table/utils/TableUtils"
], function(JSONModel, Control, TableLibrary, Table, TreeTable, AnalyticalTable, Column, RowAction, RowActionItem, TableUtils) {
	"use strict";

	var TableQUnitUtils = {}; // TBD: Move global functions to this object

	var mDefaultOptions = {};
	var iNumberOfDataRows = 8;

	var TestControl = Control.extend("sap.ui.table.test.TestControl", {
		metadata: {
			properties: {
				"text": "string",
				"src": "sap.ui.core.URI",
				"alt": "string",
				"visible": {type: "boolean", defaultValue: true},
				"focusable": {type: "boolean", defaultValue: false},
				"tabbable": {type: "boolean", defaultValue: false},
				"index": "int", // Results in different behavior of the control in different columns.
				"width": "sap.ui.core.CSSSize" // Table sets "width" for the title text.
			},
			associations: {
				"ariaLabelledBy": {type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"}
			}
		},

		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("span", oControl);
				if (oControl.getTabbable()) {
					oRm.attr("tabindex", "0");
				} else if (oControl.getFocusable()) {
					oRm.attr("tabindex", "-1");
				}
				if (!oControl.getVisible()) {
					oRm.style("display", "none");
				}
				oRm.openEnd();
				oRm.text(oControl.getText() || oControl.getAlt() || "");
				oRm.close("span");
			}
		}
	});

	var TestInputControl = Control.extend("sap.ui.table.test.TestInputControl", {
		metadata: {
			properties: {
				"text": "string",
				"visible": {type: "boolean", defaultValue: true},
				"tabbable": {type: "boolean", defaultValue: false},
				"index": "int", // Results in different behavior of the control in different columns.
				"type": "string"
			},
			associations: {
				"ariaLabelledBy": {type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"}
			}
		},

		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.voidStart("input", oControl);
				oRm.attr("type", oControl.getType() || "text");
				oRm.attr("value", oControl.getText() || "");
				if (oControl.getTabbable()) {
					oRm.attr("tabindex", "0");
				}
				if (!oControl.getVisible()) {
					oRm.style("display", "none");
				}
				oRm.voidEnd();
			}
		}
	});

	var HeightTestControl = Control.extend("sap.ui.table.test.HeightTestControl", {
		metadata: {
			properties: {
				height: "string"
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.style("height", oControl.getHeight() || "10px");
				oRm.style("width", "100px");
				oRm.style("background-color", "orange");
				oRm.style("box-sizing", "border-box");
				oRm.style("border-top", "2px solid blue");
				oRm.style("border-bottom", "2px solid blue");
				oRm.openEnd();
				oRm.close("div");
			}
		},
		setHeight: function(sHeight) {
			this.setProperty("height", sHeight, true);

			var oDomRef = this.getDomRef();
			if (oDomRef != null) {
				oDomRef.style.height = sHeight;
			}
		}
	});

	var oTableHelper = sap.ui.table.TableHelper = {
		createLabel: function(mConfig) {
			return new TestControl(mConfig);
		},
		createTextView: function(mConfig) {
			return new TestControl(mConfig);
		},
		addTableClass: function() {
			return "sapUiTableTest";
		},
		bFinal: true
	};

	[Table, TreeTable].forEach(function(TableClass) {
		TableClass.prototype.qunit = Object.create(TableClass.prototype);
		Object.defineProperty(TableClass.prototype.qunit, "columnCount", {
			get: function() {
				return this.getColumns().length;
			}
		});

		// TODO: Replace with above method.
		Object.defineProperty(TableClass.prototype, "columnCount", {
			get: function() {
				return this.getColumns().length;
			}
		});
	});

	function createTableConfig(TableClass, mOptions) {
		var oMetadata = TableClass.getMetadata();
		var aProperties = Object.keys(oMetadata.getAllProperties()).concat(Object.keys(oMetadata.getAllPrivateProperties()));
		var aAggregations = Object.keys(oMetadata.getAllAggregations()).concat(Object.keys(oMetadata.getAllPrivateAggregations()));
		var aAssociations = Object.keys(oMetadata.getAllAssociations()).concat(Object.keys(oMetadata.getAllPrivateAssociations()));
		var aAdditionalKeys = ["models"];
		var aAllMetadataKeys = aProperties.concat(aAggregations).concat(aAssociations).concat(aAdditionalKeys);

		return Object.keys(mOptions).reduce(function(oObject, sKey) {
			if (aAllMetadataKeys.indexOf(sKey) >= 0) {
				oObject[sKey] = mOptions[sKey];
			}
			return oObject;
		}, {});
	}

	function setExperimentalConfig(oTable, mOptions) {
		var aExperimentalProperties = ["_bVariableRowHeightEnabled", "_bLargeDataScrolling"];

		for (var sKey in mOptions) {
			if (aExperimentalProperties.indexOf(sKey) >= 0) {
				oTable[sKey] = mOptions[sKey];
			}
		}

		if ("rowMode" in mOptions) {
			oTable.setRowMode(mOptions.rowMode);
		}
	}

	function addAsyncHelpers(oTable) {
		oTable.qunit.fnResolveInitialRenderingFinished = null;
		oTable.qunit.pInitialRenderingFinished = new Promise(function(resolve) {
			oTable.qunit.fnResolveInitialRenderingFinished = resolve;
		});
		oTable.qunit.bInitialRenderingFinished = false;
		oTable.qunit.pInitialRenderingFinished.then(function() {
			oTable.qunit.bInitialRenderingFinished = true;
		});
		oTable.qunit.pRenderingFinished = null;

		function waitForUnpredictableEvents() {
			return new Promise(function(resolve) {
				window.requestAnimationFrame(function() {
					if (TableUtils.isVariableRowHeightEnabled(oTable)) {
						window.requestAnimationFrame(function() {
							setTimeout(resolve, 0);
						});
					} else {
						setTimeout(resolve, 0);
					}
				});
			});
		}

		/**
		 * Returns a promise that resolves when the next <code>_rowsUpdated</code> event is fired.
		 *
		 * @returns {Promise<Object>} A promise. Resolves with the event parameters.
		 */
		oTable.qunit.whenNextRowsUpdated = function() {
			return new Promise(function(resolve) {
				oTable.attachEventOnce("_rowsUpdated", function(oEvent) {
					resolve(oEvent.getParameters());
				});
			});
		};

		/**
		 * Returns a promise that resolves when the next rendering is finished. Includes row updates.
		 *
		 * @returns {Promise<Object>} A promise. Resolves with the event parameters.
		 */
		oTable.qunit.whenNextRenderingFinished = function() {
			return oTable.qunit.whenNextRowsUpdated().then(function(mParameters) {
				return waitForUnpredictableEvents().then(function() {
					return mParameters;
				});
			});
		};

		/**
		 * Returns a promise that resolves when the initial rendering is finished.
		 *
		 * @returns {Promise} A promise.
		 */
		oTable.qunit.whenInitialRenderingFinished = function() {
			return oTable.qunit.pInitialRenderingFinished;
		};
		if (oTable.getBinding("rows")) {
			oTable.qunit.whenNextRenderingFinished().then(oTable.qunit.fnResolveInitialRenderingFinished);
		} else {
			// A table without binding does not fire _rowsUpdated events.
			TableQUnitUtils.addEventDelegateOnce(oTable, "onAfterRendering", function() {
				if (!oTable.getBinding("rows")) {
					waitForUnpredictableEvents().then(oTable.qunit.fnResolveInitialRenderingFinished);
				} else {
					oTable.qunit.whenNextRenderingFinished().then(oTable.qunit.fnResolveInitialRenderingFinished);
				}
			});
		}

		/**
		 * Returns a promise that resolves when no rendering is to be expected or when an ongoing rendering is finished. Includes row updates.
		 *
		 * @returns {Promise} A promise.
		 */
		oTable.qunit.whenRenderingFinished = function() {
			if (!oTable.qunit.bInitialRenderingFinished) {
				return oTable.qunit.whenInitialRenderingFinished();
			} else if (oTable.qunit.pRenderingFinished != null) {
				return oTable.qunit.pRenderingFinished;
			} else if (oTable._getFirstRenderedRowIndex() !== oTable._iRenderedFirstVisibleRow) {
				return oTable.qunit.whenNextRenderingFinished();
			} else {
				return waitForUnpredictableEvents();
			}
		};
		function wrapForRenderingDetection(oObject, sFunctionName) {
			var fnOriginalFunction = oObject[sFunctionName];
			oObject[sFunctionName] = function() {
				if (oTable.qunit.pRenderingFinished == null && oTable.qunit.bInitialRenderingFinished) {
					if (oTable.getBinding("rows")) {
						oTable.qunit.pRenderingFinished = oTable.qunit.whenNextRenderingFinished();
					} else {
						// A table without binding does not fire _rowsUpdated events.
						oTable.qunit.pRenderingFinished = new Promise(function(resolve) {
							TableQUnitUtils.addEventDelegateOnce(oTable, "onAfterRendering", function() {
								if (!oTable.getBinding("rows")) {
									waitForUnpredictableEvents().then(resolve);
								} else {
									oTable.qunit.whenNextRenderingFinished().then(resolve);
								}
							});
						});
					}
					oTable.qunit.pRenderingFinished = oTable.qunit.pRenderingFinished.then(function() {
						oTable.qunit.pRenderingFinished = null;
					});
				}
				fnOriginalFunction.apply(oObject, arguments);
			};
		}
		// Wrap functions that inevitably trigger a "_rowsUpdated" event.
		wrapForRenderingDetection(oTable, "invalidate");
		wrapForRenderingDetection(oTable, "refreshRows");
		wrapForRenderingDetection(oTable, "updateRows");
		wrapForRenderingDetection(oTable, "unbindRows");

		/**
		 * Returns a promise that resolves when the next binding refresh event is fired.
		 *
		 * @returns {Promise} A promise.
		 */
		oTable.qunit.whenBindingRefresh = function() {
			var oBinding = oTable.getBinding("rows");

			if (!oBinding) {
				return Promise.resolve();
			}

			return new Promise(function(resolve) {
				oBinding.attachEventOnce("refresh", resolve);
			});
		};

		/**
		 * Returns a promise that resolves when the next binding change event is fired.
		 *
		 * @returns {Promise} A promise.
		 */
		oTable.qunit.whenBindingChange = function() {
			var oBinding = oTable.getBinding("rows");

			if (!oBinding) {
				return Promise.resolve();
			}

			return new Promise(function(resolve) {
				oBinding.attachEventOnce("change", resolve);
			});
		};

		/**
		 * Returns a promise that resolves when the next vertical scroll event is fired.
		 *
		 * @returns {Promise} A promise.
		 */
		oTable.qunit.whenVSbScrolled = function() {
			return new Promise(function(resolve) {
				var oVSb = oTable._getScrollExtension().getVerticalScrollbar();
				TableQUnitUtils.addEventListenerOnce(oVSb, "scroll", resolve);
			});
		};

		/**
		 * Returns a promise that resolves when the next horizontal scroll event is fired.
		 *
		 * @returns {Promise} A promise.
		 */
		oTable.qunit.whenHSbScrolled = function() {
			return new Promise(function(resolve) {
				var oHSb = oTable._getScrollExtension().getHorizontalScrollbar();
				TableQUnitUtils.addEventListenerOnce(oHSb, "scroll", resolve);
			});
		};

		/**
		 * Returns a promise that resolves when the next scroll event of the viewport is fired.
		 *
		 * @returns {Promise} A promise.
		 */
		oTable.qunit.whenViewportScrolled = function() {
			return new Promise(function(resolve) {
				TableQUnitUtils.addEventListenerOnce(oTable.getDomRef("tableCCnt"), "scroll", resolve);
			});
		};

		/**
		 * Returns a promise that resolves when the scrolling is performed and rendering is finished.
		 *
		 * @param {int} iScrollPosition The new vertical scroll position.
		 * @returns {Promise} A promise.
		 */
		oTable.qunit.scrollVSbTo = function(iScrollPosition) {
			var oVSb = oTable._getScrollExtension().getVerticalScrollbar();
			var iOldScrollTop = oVSb.scrollTop;

			oVSb.scrollTop = iScrollPosition;

			if (oVSb.scrollTop === iOldScrollTop) {
				return Promise.resolve();
			} else {
				// TODO: Make this work with large data scrolling.
				return oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
			}
		};

		/**
		 * Wrapper around #scrollVSbTo for easier promise chaining. Returns a function that returns a promise.
		 *
		 * @param {int} iScrollPosition The new vertical scroll position.
		 * @returns {function(): Promise} Wrapper function.
		 */
		oTable.qunit.$scrollVSbTo = function(iScrollPosition) {
			return function() {
				return oTable.qunit.scrollVSbTo(iScrollPosition);
			};
		};

		/**
		 * Returns a promise that resolves when the scrolling is performed and rendering is finished.
		 *
		 * @param {int} iDistance The distance to scroll.
		 * @returns {Promise} A promise.
		 */
		oTable.qunit.scrollVSbBy = function(iDistance) {
			var oVSb = oTable._getScrollExtension().getVerticalScrollbar();
			var iOldScrollTop = oVSb.scrollTop;

			oVSb.scrollTop += iDistance;

			if (oVSb.scrollTop === iOldScrollTop) {
				return Promise.resolve();
			} else {
				return oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
			}
		};

		/**
		 * Wrapper around #scrollVSbTo for easier promise chaining. Returns a function that returns a promise.
		 *
		 * @param {int} iDistance The distance to scroll.
		 * @returns {function(): Promise} Wrapper function.
		 */
		oTable.qunit.$scrollVSbBy = function(iDistance) {
			return function() {
				return oTable.qunit.scrollVSbBy(iDistance);
			};
		};

		/**
		 * Returns a promise that resolves when the height of the table's parent element is changed and rendering is finished.
		 *
		 * @param {Object} mSizes The new sizes.
		 * @param {string} [mSizes.height] The new height. Must be a valid CSSSize.
		 * @param {string} [mSizes.width] The new width. Must be a valid CSSSize.
		 * @returns {Promise} A promise.
		 */
		oTable.qunit.resize = function(mSizes) {
			var oDomRef = oTable.getDomRef();
			var oContainerElement = oDomRef ? oDomRef.parentNode : null;

			if (!oContainerElement) {
				return Promise.resolve();
			}

			var sOldHeight = oContainerElement.style.height;
			var sOldWidth = oContainerElement.style.width;

			if (oTable.qunit.sContainerOriginalHeight == null) {
				oTable.qunit.sContainerOriginalHeight = sOldHeight;
			}
			if (oTable.qunit.sContainerOriginalWidth == null) {
				oTable.qunit.sContainerOriginalWidth = sOldWidth;
			}

			if (mSizes.height != null) {
				oContainerElement.style.height = mSizes.height;
			}
			if (mSizes.width != null) {
				oContainerElement.style.width = mSizes.width;
			}

			if ((mSizes.height != null && mSizes.height != sOldHeight) || (mSizes.width != null && mSizes.width != sOldWidth)) {
				return new Promise(function(resolve) {
					var iVisibleRowCountBefore = oTable.getVisibleRowCount();

					TableQUnitUtils.wrapOnce(oTable, "_updateTableSizes", null, function() {
						var iVisibleRowCountAfter = oTable.getVisibleRowCount();

						if (iVisibleRowCountBefore !== iVisibleRowCountAfter) {
							oTable.qunit.whenNextRenderingFinished().then(resolve);
						} else {
							oTable.qunit.whenRenderingFinished().then(resolve);
						}
					});
				});
			} else {
				return Promise.resolve();
			}
		};

		/**
		 * Wrapper around #resize for easier promise chaining. Returns a function that returns a promise.
		 *
		 * @param {Object} mSizes The new sizes.
		 * @param {string} [mSizes.height] The new height. Must be a valid CSSSize.
		 * @param {string} [mSizes.width] The new width. Must be a valid CSSSize.
		 * @returns {function(): Promise} Wrapper function.
		 */
		oTable.qunit.$resize = function(mSizes) {
			return function() {
				return oTable.qunit.resize(mSizes);
			};
		};

		/**
		 * Returns a promise that resolves when the height of the table's parent element is changed to its original value and rendering is finished.
		 *
		 * @returns {Promise} A promise.
		 */
		oTable.qunit.resetSize = function() {
			return oTable.qunit.resize({
				height: oTable.qunit.sContainerOriginalHeight,
				width: oTable.qunit.sContainerOriginalWidth
			});
		};
	}

	function addHelpers(oTable) {
		/**
		 * Gets the data cell element.
		 *
		 * @param {int} iRowIndex Index of the row.
		 * @param {int} iColumnIndex Index of the column.
		 * @returns {HTMLElement} The cell DOM element.
		 */
		oTable.qunit.getDataCell = function(iRowIndex, iColumnIndex) {
			return oTable.getDomRef("rows-row" + iRowIndex + "-col" + iColumnIndex);
		};

		/**
		 * Gets the column header cell element. In case of multi-headers, the cell in the first header row is returned.
		 *
		 * @param {int} iColumnIndex Index of the column in the list of visible columns.
		 * @returns {HTMLElement} The cell DOM element.
		 */
		oTable.qunit.getColumnHeaderCell = function(iColumnIndex) {
			var sCellId = (oTable._getVisibleColumns()[iColumnIndex]).getId();
			return document.getElementById(sCellId);
		};

		/**
		 * Gets the row header cell element.
		 *
		 * @param {int} iRowIndex Index of the row the cell is inside.
		 * @returns {HTMLElement} The cell DOM element.
		 */
		oTable.qunit.getRowHeaderCell = function(iRowIndex) {
			return oTable.getDomRef("rowsel" + iRowIndex);
		};

		/**
		 * Gets the row action cell element.
		 *
		 * @param {int} iRowIndex Index of the row the cell is inside.
		 * @returns {HTMLElement} Returns the DOM element.
		 */
		oTable.qunit.getRowActionCell = function(iRowIndex) {
			return oTable.getDomRef("rowact" + iRowIndex);
		};

		/**
		 * Gets the selectAll cell element.
		 *
		 * @returns {HTMLElement} The cell DOM element.
		 */
		oTable.qunit.getSelectAllCell = function() {
			return oTable.getDomRef("selall");
		};
	}

	TableQUnitUtils.setDummyTableHelper = function() {
		sap.ui.table.TableHelper = oTableHelper;
	};

	TableQUnitUtils.getTestControl = function() {
		return TestControl;
	};

	TableQUnitUtils.getTestInputControl = function() {
		return TestInputControl;
	};

	TableQUnitUtils.getHeightTestControl = function() {
		return HeightTestControl;
	};

	TableQUnitUtils.setDefaultOptions = function(mOptions) {
		mOptions = Object.assign({}, mOptions);
		mDefaultOptions = mOptions;
	};

	TableQUnitUtils.getDefaultOptions = function() {
		return Object.create(mDefaultOptions);
	};

	TableQUnitUtils.createTable = function(TableClass, mOptions, fnBeforePlaceAt) {
		if (typeof TableClass === "function" && TableClass !== Table && TableClass !== TreeTable && TableClass !== AnalyticalTable) {
			fnBeforePlaceAt = TableClass;
			TableClass = Table;
		} else if (typeof TableClass === "object") {
			fnBeforePlaceAt = mOptions;
			mOptions = TableClass;
			TableClass = Table;
		}
		mOptions = Object.assign({}, mDefaultOptions, mOptions);
		TableClass = TableClass == null ? Table : TableClass;

		var oTable = new TableClass(createTableConfig(TableClass, mOptions));
		setExperimentalConfig(oTable, mOptions);
		addAsyncHelpers(oTable);
		addHelpers(oTable);

		if (typeof fnBeforePlaceAt === "function") {
			fnBeforePlaceAt(oTable, mOptions);
		}

		var sContainerId;
		if (typeof mOptions.placeAt === "string") {
			sContainerId = mOptions.placeAt;
		} else if (mOptions.placeAt !== false) {
			sContainerId = "qunit-fixture";
		}

		if (sContainerId != null) {
			oTable.placeAt(sContainerId);
			sap.ui.getCore().applyChanges();
		}

		return oTable;
	};

	/**
	 * Adds a column to the tested table.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {string} sTitle The label of the column.
	 * @param {string} sText The text of the column template.
	 * @param {boolean} bInputElement If set to <code>true</code>, the column template will be an input element, otherwise a span.
	 * @param {boolean} bFocusable If set to <code>true</code>, the column template will focusable. Only relevant, if <code>bInputElement</code>
	 *                             is set to true.
	 * @param {boolean} bTabbable If set to <code>true</code>, the column template will be tabbable.
	 * @param {string} sInputType The type of the input element. Only relevant, if <code>bInputElement</code> is set to true.
	 * @param {boolean} [bBindText=true] If set to <code>true</code>, the text property will be bound to the value of <code>sText</code>.
	 * @param {boolean} [bInteractiveLabel=false] If set to <code>true</code>, the column label will be focusable and tabbable.
	 * @returns {sap.ui.table.Column} The added column.
	 */
	TableQUnitUtils.addColumn = function(oTable, sTitle, sText, bInputElement, bFocusable, bTabbable, sInputType, bBindText, bInteractiveLabel) {
		bBindText = bBindText !== false;
		bInteractiveLabel = bInteractiveLabel === true;

		var oTemplate;

		if (bInputElement) {
			oTemplate = new TestInputControl({
				text: bBindText ? "{" + sText + "}" : sText,
				index: oTable.getColumns().length,
				visible: true,
				tabbable: bTabbable,
				type: sInputType
			});
		} else {
			oTemplate = new TestControl({
				text: bBindText ? "{" + sText + "}" : sText,
				index: oTable.getColumns().length,
				visible: true,
				focusable: bFocusable,
				tabbable: bFocusable && bTabbable
			});
		}

		var oColumn = new Column({
			label: new TestControl({
				text: sTitle,
				focusable: bInteractiveLabel,
				tabbable: bInteractiveLabel
			}),
			width: "100px",
			template: oTemplate
		});
		oTable.addColumn(oColumn);

		for (var i = 0; i < iNumberOfDataRows; i++) {
			oTable.getModel().getData().rows[i][sText] = sText + (i + 1);
		}

		return oColumn;
	};

	TableQUnitUtils.addEventDelegateOnce = function(oTable, sEventName, fnHandler) {
		var oDelegate = {};

		oDelegate[sEventName] = function() {
			this.removeEventDelegate(oDelegate);
			fnHandler.apply(this, arguments);
		};

		oTable.addEventDelegate(oDelegate, oTable);
	};

	TableQUnitUtils.addEventListenerOnce = function(oElement, sEventName, fnHandler) {
		oElement.addEventListener(sEventName, function(oEvent) {
			oElement.removeEventListener(sEventName, fnHandler);
			fnHandler.call(this, oEvent);
		});
	};

	TableQUnitUtils.wrapOnce = function(oObject, sFunctionName, fnBefore, fnAfter) {
		var fnOriginalFunction = oObject[sFunctionName];

		oObject[sFunctionName] = function() {
			oObject[sFunctionName] = fnOriginalFunction;

			if (fnBefore) {
				fnBefore.apply(oObject, arguments);
			}

			oObject[sFunctionName].apply(oObject, arguments);

			if (fnAfter) {
				fnAfter.apply(oObject, arguments);
			}
		};
	};

	/**
	 * Returns a promise that resolves after a certain delay.
	 *
	 * @param {int} [iMilliseconds] The delay in milliseconds. If none is set, <code>requestAnimationFrame</code> is used.
	 * @returns {Promise} A promise.
	 */
	TableQUnitUtils.wait = function(iMilliseconds) {
		var bUseRequestAnimationFrame = iMilliseconds == null;

		return new Promise(function(resolve) {
			if (bUseRequestAnimationFrame) {
				window.requestAnimationFrame(resolve);
			} else {
				setTimeout(resolve, iMilliseconds);
			}
		});
	};

	/**
	 * Wrapper around #wait for easier promise chaining. Returns a function that returns a promise.
	 *
	 * @param {int} [iMilliseconds] The delay in milliseconds. If none is set, <code>requestAnimationFrame</code> is used.
	 * @returns {function(): Promise} Wrapper function.
	 */
	TableQUnitUtils.$wait = function(iMilliseconds) {
		return function() {
			return TableQUnitUtils.wait(iMilliseconds);
		};
	};

	/***********************************
	 * Legacy utils                    *
	 ***********************************/

	var oTable, oTreeTable;
	var oModel = new JSONModel();
	var aFields = ["A", "B", "C", "D", "E"];

	window.oModel = oModel;
	window.aFields = aFields;
	window.iNumberOfRows = iNumberOfDataRows;

	window.createTables = function(bSkipPlaceAt, bFocusableCellTemplates, iCustomNumberOfRows) {
		var iCount = !!iCustomNumberOfRows ? iCustomNumberOfRows : iNumberOfDataRows;

		oTable = new Table({
			rows: "{/rows}",
			title: "Grid Table",
			selectionMode: "MultiToggle",
			visibleRowCount: 3,
			ariaLabelledBy: "ARIALABELLEDBY",
			fixedColumnCount: 1
		});
		window.oTable = oTable;

		oTreeTable = new TreeTable({
			rows: {
				path: "/tree",
				parameters: {arrayNames: ["rows"]}
			},
			title: "Tree Table",
			selectionMode: "Single",
			visibleRowCount: 3,
			groupHeaderProperty: aFields[0],
			ariaLabelledBy: "ARIALABELLEDBY"
		});
		window.oTreeTable = oTreeTable;

		var oData = {rows: [], tree: {rows: []}};
		var oRow;
		var oTree;
		for (var i = 0; i < iCount; i++) {
			oRow = {};
			oTree = {rows: [{}]};
			for (var j = 0; j < aFields.length; j++) {
				oRow[aFields[j]] = aFields[j] + (i + 1);
				oTree[aFields[j]] = aFields[j] + (i + 1);
				oTree.rows[0][aFields[j]] = aFields[j] + "SUB" + (i + 1);
				if (i == 0) {
					oTable.addColumn(new Column({
						label: aFields[j] + "_TITLE",
						width: "100px",
						tooltip: j == 2 ? aFields[j] + "_TOOLTIP" : null,
						template: new TestControl({
							text: "{" + aFields[j] + "}",
							index: j,
							visible: j != 3,
							tabbable: !!bFocusableCellTemplates
						})
					}));
					oTreeTable.addColumn(new Column({
						label: aFields[j] + "_TITLE",
						width: "100px",
						template: new TestControl({
							text: "{" + aFields[j] + "}",
							index: j,
							tabbable: !!bFocusableCellTemplates
						})
					}));
				}
			}
			oData.rows.push(oRow);
			oData.tree.rows.push(oTree);
		}

		oModel.setData(oData);
		oTable.setModel(oModel);
		oTable.setSelectedIndex(0);
		oTreeTable.setModel(oModel);
		if (!bSkipPlaceAt) {
			oTable.placeAt("qunit-fixture");
			oTreeTable.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		}
	};

	window.destroyTables = function() {
		oTable.destroy();
		oTable = null;
		oTreeTable.destroy();
		oTreeTable = null;
	};


	//************************************************************************
	// Helper Functions
	//************************************************************************


	window.getCell = function(iRow, iCol, bFocus, assert, oTableInstance) {
		if (oTableInstance == null) {
			oTableInstance = oTable;
		}

		var oCell = jQuery.sap.domById(oTableInstance.getId() + "-rows-row" + iRow + "-col" + iCol);
		if (bFocus) {
			oCell.focus();
		}
		if (assert) {
			if (bFocus) {
				assert.deepEqual(oCell, document.activeElement, "Cell [" + iRow + ", " + iCol + "] focused");
			} else {
				assert.notEqual(oCell, document.activeElement, "Cell [" + iRow + ", " + iCol + "] not focused");
			}
		}
		return jQuery(oCell);
	};

	window.getColumnHeader = function(iCol, bFocus, assert, oTableInstance) {
		if (oTableInstance == null) {
			oTableInstance = oTable;
		}

		var oCell = jQuery.sap.domById((oTableInstance._getVisibleColumns()[iCol]).getId());
		if (bFocus) {
			oCell.focus();
		}
		if (assert) {
			if (bFocus) {
				assert.deepEqual(oCell, document.activeElement, "Column Header " + iCol + " focused");
			} else {
				assert.notEqual(oCell, document.activeElement, "Column Header " + iCol + " not focused");
			}
		}
		return jQuery(oCell);
	};

	window.getRowHeader = function(iRow, bFocus, assert, oTableInstance) {
		if (oTableInstance == null) {
			oTableInstance = oTable;
		}

		var oCell = jQuery.sap.domById(oTableInstance.getId() + "-rowsel" + iRow);
		if (bFocus) {
			oCell.focus();
		}
		if (assert) {
			if (bFocus) {
				assert.deepEqual(oCell, document.activeElement, "Row Header " + iRow + " focused");
			} else {
				assert.notEqual(oCell, document.activeElement, "Row Header " + iRow + " not focused");
			}
		}
		return jQuery(oCell);
	};

	window.getRowAction = function(iRow, bFocus, assert, oTableInstance) {
		if (oTableInstance == null) {
			oTableInstance = oTable;
		}

		var oCell = jQuery.sap.domById(oTableInstance.getId() + "-rowact" + iRow);
		if (bFocus) {
			oCell.focus();
		}
		if (assert) {
			if (bFocus) {
				assert.deepEqual(oCell, document.activeElement, "Row Action " + iRow + " focused");
			} else {
				assert.notEqual(oCell, document.activeElement, "Row Action " + iRow + " not focused");
			}
		}
		return jQuery(oCell);
	};

	window.getSelectAll = function(bFocus, assert, oTableInstance) {
		if (oTableInstance == null) {
			oTableInstance = oTable;
		}

		var oCell = jQuery.sap.domById(oTableInstance.getId() + "-selall");
		if (bFocus) {
			oCell.focus();
		}
		if (assert) {
			if (bFocus) {
				assert.deepEqual(oCell, document.activeElement, "Select All focused");
			} else {
				assert.notEqual(oCell, document.activeElement, "Select All not focused");
			}
		}
		return jQuery(oCell);
	};

	window.setFocusOutsideOfTable = function(assert, sId) {
		sId = sId || "outerelement";
		var oOuterElement = jQuery.sap.domById(sId);
		oOuterElement.focus();
		assert.deepEqual(oOuterElement, document.activeElement, "Outer element with id '" + sId + "' focused");
		return jQuery(oOuterElement);
	};

	/**
	 * Check whether an element is focused.
	 * @param {jQuery|HTMLElement} oElement The element to check.
	 * @param {Object} assert QUnit assert object.
	 * @returns {jQuery} A jQuery object containing the active element.
	 */
	window.checkFocus = function(oElement, assert) {
		var $ActiveElement = jQuery(document.activeElement);
		var $Element = jQuery(oElement);

		assert.deepEqual(document.activeElement, $Element[0], "Focus is on: " + $ActiveElement.attr("id") + ", should be on: " + $Element.attr("id"));

		return $ActiveElement;
	};

	window.fakeGroupRow = function(iRow, oTableInstance) {
		if (!oTableInstance) {
			oTableInstance = oTable;
		}

		var oRow = oTableInstance.getRows()[iRow];
		var $Row = oTableInstance.$("rows-row" + iRow);
		var $RowFixed = oTableInstance.$("rows-row" + iRow + "-fixed");
		var $RowHdr = oTableInstance.$("rowsel" + iRow).parent();
		var $RowAct = oTableInstance.$("rowact" + iRow).parent();
		var $Ref = oRow.getDomRefs(true);
		var oAccExtension = oTable._getAccExtension();
		var mTooltipTexts = oAccExtension.getAriaTextsForSelectionMode(true);
		var iLevel = 1;

		oRow.getType = function() {return oRow.Type.GroupHeader;};
		oRow.getLevel = function() {return iLevel;};
		oRow.isExpandable = function() {return true;};
		oRow.isExpanded = function() {return true;};
		oRow.isContentHidden = function() {return true;};
		$Row.toggleClass("sapUiTableGroupHeaderRow sapUiTableRowHidden", true).data("sap-ui-level", iLevel);
		$RowFixed.toggleClass("sapUiTableGroupHeaderRow sapUiTableRowHidden", true).data("sap-ui-level", iLevel);
		$RowHdr.toggleClass("sapUiTableGroupHeaderRow sapUiTableRowHidden", true).data("sap-ui-level", iLevel);
		$RowAct.toggleClass("sapUiTableGroupHeaderRow sapUiTableRowHidden", true).data("sap-ui-level", iLevel);
		oAccExtension.updateAriaExpandAndLevelState(oRow);
		oAccExtension.updateRowTooltips(oRow, $Ref, mTooltipTexts, false);
		return {
			row: $Row,
			fixed: $RowFixed,
			hdr: $RowHdr,
			act: $RowAct
		};
	};

	window.fakeSumRow = function(iRow, oTableInstance) {
		if (!oTableInstance) {
			oTableInstance = oTable;
		}

		var oRow = oTableInstance.getRows()[iRow];
		var $Row = oTableInstance.$("rows-row" + iRow);
		var $RowFixed = oTableInstance.$("rows-row" + iRow + "-fixed");
		var $RowHdr = oTableInstance.$("rowsel" + iRow).parent();
		var $RowAct = oTableInstance.$("rowact" + iRow).parent();
		var $Ref = oRow.getDomRefs(true);
		var oAccExtension = oTable._getAccExtension();
		var mTooltipTexts = oAccExtension.getAriaTextsForSelectionMode(true);
		var iLevel = 1;

		oRow.getType = function() {return oRow.Type.Summary;};
		oRow.getLevel = function() {return iLevel;};
		$Row.toggleClass("sapUiTableSummaryRow", true).data("sap-ui-level", iLevel);
		$RowFixed.toggleClass("sapUiTableSummaryRow", true).data("sap-ui-level", iLevel);
		$RowHdr.toggleClass("sapUiTableSummaryRow", true).data("sap-ui-level", iLevel);
		$RowAct.toggleClass("sapUiTableSummaryRow", true).data("sap-ui-level", iLevel);
		oAccExtension.updateAriaExpandAndLevelState(oRow);
		oAccExtension.updateRowTooltips(oRow, $Ref, mTooltipTexts, false);
		return {
			row: $Row,
			fixed: $RowFixed,
			hdr: $RowHdr,
			act: $RowAct
		};
	};

	window.initRowActions = function(oTable, iCount, iNumberOfActions) {
		oTable.setRowActionCount(iCount);
		var oRowAction = new RowAction();
		var aActions = [{type: "Navigation"}, {type: "Delete"}, {icon: "sap-icon://search", text: "Inspect"}];
		for (var i = 0; i < Math.min(iNumberOfActions, 3); i++) {
			var oItem = new RowActionItem({
				icon: aActions[i].icon,
				text: aActions[i].text,
				type: aActions[i].type || "Custom"
			});
			oRowAction.addItem(oItem);
		}
		oTable.setRowActionTemplate(oRowAction);
		sap.ui.getCore().applyChanges();
	};

	window.removeRowActions = function(oTable) {
		var oCurrentTemplate = oTable.getRowActionTemplate();
		if (oCurrentTemplate) {
			oCurrentTemplate.destroy();
		}

		oTable.setRowActionCount(0);
		sap.ui.getCore().applyChanges();
	};

	return TableQUnitUtils;
});