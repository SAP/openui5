sap.ui.define([
	"sap/ui/table/Table",
	"sap/ui/table/TreeTable",
	"sap/ui/table/AnalyticalTable",
	"sap/ui/table/Column",
	"sap/ui/table/RowAction",
	"sap/ui/table/RowActionItem",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/table/plugins/PluginBase",
	"sap/ui/table/plugins/SelectionPlugin",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Control",
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"sap/ui/core/UIArea",
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/base/util/merge",
	"sap/base/i18n/Localization",
	// provides jQuery.fn.scrollLeftRTL
	"sap/ui/dom/jquery/scrollLeftRTL"
], function(
	Table,
	TreeTable,
	AnalyticalTable,
	Column,
	RowAction,
	RowActionItem,
	FixedRowMode,
	PluginBase,
	SelectionPlugin,
	TableUtils,
	JSONModel,
	Control,
	oCore,
	CoreLibrary,
	UIArea,
	Device,
	jQuery,
	nextUIUpdate,
	merge,
	Localization
) {
	"use strict";

	const TableQUnitUtils = {}; // TBD: Move global functions to this object
	const aData = [];
	const oDataTemplate = {};
	let mDefaultSettings = {};
	const iNumberOfDataRows = 8;
	let iTouchPositionX;
	let iTouchPositionY;
	let oTouchTargetElement;

	const TestSelectionPlugin = SelectionPlugin.extend("sap.ui.table.test.TestSelectionPlugin", {
		init: function() {
			this.aSelectedRows = [];
		},
		setSelected: function(oRow, bSelected, mConfig) {
			let iIndex;

			if (bSelected) {
				iIndex = this.aSelectedRows.indexOf(oRow.getIndex());
				if (iIndex === -1) {
					this.aSelectedRows.push(oRow.getIndex());
				}
			} else {
				iIndex = this.aSelectedRows.indexOf(oRow.getIndex());
				this.aSelectedRows.splice(iIndex, 1);
			}

			this.fireSelectionChange();
		},
		isSelected: function(oRow) {
			return this.aSelectedRows.indexOf(oRow.getIndex()) > -1;
		},
		clearSelection: function() {
			this.aSelectedRows = [];
			this.fireSelectionChange();
		}
	});

	const TestControl = Control.extend("sap.ui.table.test.TestControl", {
		metadata: {
			properties: {
				"text": {type: "string", defaultValue: ""},
				"visible": {type: "boolean", defaultValue: true},
				"focusable": {type: "boolean", defaultValue: false},
				"tabbable": {type: "boolean", defaultValue: false}
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
				oRm.text(oControl.getText());
				oRm.close("span");
			}
		}
	});

	const TestInputControl = Control.extend("sap.ui.table.test.TestInputControl", {
		metadata: {
			properties: {
				"text": {type: "string", defaultValue: ""},
				"visible": {type: "boolean", defaultValue: true},
				"tabbable": {type: "boolean", defaultValue: false},
				"type": {type: "string", defaultValue: "text"}
			},
			associations: {
				"ariaLabelledBy": {type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"}
			}
		},

		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.voidStart("input", oControl);
				oRm.attr("type", oControl.getType());
				oRm.attr("value", oControl.getText());
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

	const HeightTestControl = Control.extend("sap.ui.table.test.HeightTestControl", {
		metadata: {
			properties: {
				height: {type: "sap.ui.core.CSSSize", defaultValue: "1px"}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.style("height", oControl.getHeight());
				oRm.style("width", "100px");
				oRm.style("overflow", "hidden");
				oRm.style("background", "linear-gradient(blue 1px, orange 1px, orange calc(100% - 1px), blue)");
				oRm.openEnd();
				oRm.close("div");
			}
		}
	});

	// This plugin helps to add hooks to the table, including the ones that are called during initialization of the table.
	const HelperPlugin = PluginBase.extend("sap.ui.table.test.HelperPlugin", {
		metadata: {
			events: {
				renderingTriggered: {}
			}
		}
	});

	HelperPlugin.prototype.init = function() {
		this.iTableUpdateProcesses = 0;
		this.pTableUpdateFinished = Promise.resolve();
		this.fnResolveTableUpdateFinished = null;
		this.iFocusHandlingProcesses = 0;
		this.pFocusHandlingFinished = Promise.resolve();
		this.fnResolveFocusHandlingFinished = null;
	};
	HelperPlugin.prototype.hooks = {};

	HelperPlugin.prototype.onActivate = function(oTable) {
		TableUtils.Hook.install(oTable, this.hooks, this);

		const wrapForRenderingDetection = function(oObject, sFunctionName) {
			const fnOriginalFunction = oObject[sFunctionName];
			oObject[sFunctionName] = function() {
				if (sFunctionName !== "rerenderControl" || arguments[0] === oTable) {
					this.fireRenderingTriggered();
				}
				fnOriginalFunction.apply(oObject, arguments);
			}.bind(this);
		}.bind(this);

		// Add wrappers and hooks for functions that inevitably trigger a "rowsUpdated" event.
		wrapForRenderingDetection(oTable, "invalidate");
		wrapForRenderingDetection(UIArea, "rerenderControl");
	};
	HelperPlugin.prototype.hooks[TableUtils.Hook.Keys.Table.RefreshRows] = function() { this.fireRenderingTriggered(); };
	HelperPlugin.prototype.hooks[TableUtils.Hook.Keys.Table.UpdateRows] = function() { this.fireRenderingTriggered(); };
	HelperPlugin.prototype.hooks[TableUtils.Hook.Keys.Table.UnbindRows] = function() { this.fireRenderingTriggered(); };

	HelperPlugin.prototype.onDeactivate = function(oTable) {
		TableUtils.Hook.uninstall(oTable, this);
	};

	HelperPlugin.prototype.hooks[TableUtils.Hook.Keys.Signal] = function(sSignal) {
		switch (sSignal) {
			case "StartTableUpdate":
				if (this.iTableUpdateProcesses === 0) {
					this.pTableUpdateFinished = new Promise(function(resolve) {
						this.fnResolveTableUpdateFinished = resolve;
					}.bind(this));
				}
				this.iTableUpdateProcesses++;
				break;
			case "EndTableUpdate":
				this.iTableUpdateProcesses--;
				if (this.iTableUpdateProcesses === 0) {
					this.fnResolveTableUpdateFinished();
					this.pTableUpdateFinished = Promise.resolve();
				}
				break;
			case "StartFocusHandling":
				if (this.iFocusHandlingProcesses === 0) {
					this.pFocusHandlingFinished = new Promise(function(resolve) {
						this.fnResolveFocusHandlingFinished = resolve;
					}.bind(this));
				}
				this.iFocusHandlingProcesses++;
				break;
			case "EndFocusHandling":
				this.iFocusHandlingProcesses--;
				if (this.iFocusHandlingProcesses === 0) {
					this.fnResolveFocusHandlingFinished();
					this.pFocusHandlingFinished = Promise.resolve();
				}
				break;
			default:
		}
	};

	HelperPlugin.prototype.whenTableUpdateFinished = function() {
		return this.pTableUpdateFinished;
	};

	HelperPlugin.prototype.whenFocusHandlingFinished = function() {
		return this.pFocusHandlingFinished;
	};

	function TimeoutError(iMilliseconds) {
		const oError = new Error("Timed out" + (typeof iMilliseconds === "number" ? " after " + iMilliseconds + "ms" : ""));

		oError.name = "TimeoutError";
		oError.milliseconds = iMilliseconds;
		Object.setPrototypeOf(oError, Object.getPrototypeOf(this));

		if (Error.captureStackTrace) {
			Error.captureStackTrace(oError, TimeoutError);
		}

		return oError;
	}

	TimeoutError.prototype = Object.create(Error.prototype, {
		constructor: {
			value: Error,
			enumerable: false,
			writable: true,
			configurable: true
		}
	});
	Object.setPrototypeOf(TimeoutError, Error);

	function ExpiringPromise(iTimeout, fnExecutor) {
		if (iTimeout == null || fnExecutor == null) {
			throw new Error("Invalid arguments");
		}

		let iTimeoutId;
		const pTimeout = new Promise(function(resolve, reject) {
			iTimeoutId = setTimeout(function() {
				reject(new TimeoutError(iTimeout));
			}, iTimeout);
		});
		const pAction = new Promise(function() {
			fnExecutor.apply(this, Array.prototype.slice.call(arguments));
		});

		pAction.then(function() {
			clearTimeout(iTimeoutId);
		});

		return Promise.race([pTimeout, pAction]);
	}

	function deepCloneSettings(mSettings) {
		const oClone = merge({}, mSettings);

		// Clone all instances of type sap.ui.base.ManagedObject.
		for (const sProperty in oClone) {
			if (!oClone.hasOwnProperty(sProperty)) {
				continue;
			}

			const vValue = oClone[sProperty];

			if (TableUtils.isA(vValue, "sap.ui.base.ManagedObject")) {
				oClone[sProperty] = vValue.clone();
			} else if (Array.isArray(vValue)) {
				for (let i = 0; i < vValue.length; i++) {
					if (TableUtils.isA(vValue[i], "sap.ui.base.ManagedObject")) {
						vValue[i] = vValue[i].clone();
					}
				}
			}
		}

		return oClone;
	}

	TableUtils._getTableTemplateHelper = function() {
		// Esure that for test purposes the table helper mechanism is still in place for now
		return {
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
	};

	[Table, TreeTable].forEach(function(TableClass) {
		// TODO: Replace with a helper method in the "qunit" member of the table, or delete and replace with oTable#getColumns().length
		Object.defineProperty(TableClass.prototype, "columnCount", {
			get: function() {
				return this.getColumns().length;
			}
		});

		// TODO: Remove this once CreationRow is removed.
		const fnApplySettings = TableClass.prototype.applySettings;
		TableClass.prototype.applySettings = function(mSettings) {
			if (mSettings && "creationRow" in mSettings) {
				this.setCreationRow(mSettings.creationRow);
				delete mSettings.creationRow;
			}
			fnApplySettings.apply(this, arguments);
		};
	});

	function createTableSettings(TableClass, mSettings) {
		let aAllSettingKeys = Object.keys(TableClass.getMetadata().getAllSettings());

		aAllSettingKeys = aAllSettingKeys.concat(["creationRow"]); // TODO: Remove this once CreationRow is removed.

		return Object.keys(mSettings).reduce(function(oObject, sKey) {
			if (aAllSettingKeys.indexOf(sKey) >= 0) {
				oObject[sKey] = mSettings[sKey];
			}
			return oObject;
		}, {});
	}

	function setExperimentalSettings(oTable, mSettings) {
		const aExperimentalProperties = ["_bVariableRowHeightEnabled", "_bLargeDataScrolling"];

		for (const sKey in mSettings) {
			if (aExperimentalProperties.indexOf(sKey) >= 0) {
				oTable[sKey] = mSettings[sKey];
			}
		}
	}

	function addAsyncHelpers(oTable, oHelperPlugin) {
		/**
		 * Returns a promise that resolves when the next <code>rowsUpdated</code> event is fired.
		 *
		 * @returns {Promise<Object>} A promise. Resolves with the event parameters.
		 */
		oTable.qunit.whenNextRowsUpdated = function() {
			return new Promise(function(resolve) {
				oTable.attachEventOnce("rowsUpdated", function(oEvent) {
					resolve(oEvent.getParameters());
				});
			});
		};

		function waitForFinalDOMUpdates() {
			return oHelperPlugin.whenTableUpdateFinished().then(TableQUnitUtils.wait);
		}

		function waitForRowsUpdatedAndFinalDomUpdates() {
			return oTable.qunit.whenNextRowsUpdated().then(function(mParameters) {
				return waitForFinalDOMUpdates().then(function() {
					return mParameters;
				});
			});
		}

		function waitForFullRendering() {
			if (oTable.getBinding()) {
				return waitForRowsUpdatedAndFinalDomUpdates();
			}

			// A table without binding does not fire rowsUpdated events.
			return new Promise(function(resolve) {
				TableQUnitUtils.addDelegateOnce(oTable, "onAfterRendering", function() {
					if (oTable.getBinding()) { // In case the table has been bound in the meanwhile.
						waitForRowsUpdatedAndFinalDomUpdates().then(function(mParameters) {
							resolve(mParameters);
						});
					} else {
						waitForFinalDOMUpdates().then(resolve);
					}
				});
			});
		}

		function initRenderingFinishedPromise(sID, fnWaitForRendering) {
			if (oTable.qunit["pRenderingFinished" + sID] == null) {
				oTable.qunit["pRenderingFinished" + sID] = new Promise(function(resolve) {
					oTable.qunit["fnResolveRenderingFinished" + sID] = resolve;
				});
			}

			if (oTable.qunit["fnResolveRenderingFinishedWrapper" + sID]) {
				oTable.qunit["fnResolveRenderingFinishedWrapper" + sID].disable();
			}

			let bWrapperDisabled = false;
			oTable.qunit["fnResolveRenderingFinishedWrapper" + sID] = function(mParameters) {
				if (!bWrapperDisabled) {
					oTable.qunit["fnResolveRenderingFinished" + sID](mParameters);
					oTable.qunit["pRenderingFinished" + sID] = null;
					delete oTable.qunit["fnResolveRenderingFinished" + sID];
					delete oTable.qunit["fnResolveRenderingFinishedWrapper" + sID];
				}
			};
			oTable.qunit["fnResolveRenderingFinishedWrapper" + sID].disable = function() {
				bWrapperDisabled = true;
			};

			fnWaitForRendering().then(oTable.qunit["fnResolveRenderingFinishedWrapper" + sID]);
		}

		/**
		 * Returns a promise that resolves when the next rendering is finished.
		 *
		 * @returns {Promise<Object>} A promise. Resolves with the event parameters.
		 */
		oTable.qunit.whenNextRenderingFinished = function() {
			if (oTable.qunit.pRenderingFinishedNext == null) {
				initRenderingFinishedPromise("Next", waitForFullRendering);
			}
			return oTable.qunit.pRenderingFinishedNext;
		};
		oTable.qunit.pRenderingFinishedNext = null;

		oHelperPlugin.attachRenderingTriggered(function() {
			if (oTable.qunit.pRenderingFinishedNext != null) {
				initRenderingFinishedPromise("Next", waitForFullRendering);
			}
		});

		/**
		 * Returns a promise that resolves when no rendering is to be expected or when an ongoing rendering is finished.
		 *
		 * @returns {Promise} A promise.
		 */
		oTable.qunit.whenRenderingFinished = function() {
			if (oTable.qunit.pRenderingFinishedCurrent == null) {
				initRenderingFinishedPromise("Current", waitForFinalDOMUpdates);
			}
			return oTable.qunit.pRenderingFinishedCurrent;
		};
		oTable.qunit.pRenderingFinishedCurrent = null;

		initRenderingFinishedPromise("Current", waitForFullRendering);
		oHelperPlugin.attachRenderingTriggered(function() {
			initRenderingFinishedPromise("Current", waitForFullRendering);
		});

		/**
		 * Returns a promise that resolves when the initial rendering is finished.
		 *
		 * @returns {Promise} A promise.
		 */
		oTable.qunit.whenInitialRenderingFinished = function() {
			return oTable.qunit.pInitialRenderingFinished;
		};
		oTable.qunit.pInitialRenderingFinished = oTable.qunit.whenRenderingFinished();

		/**
		 * Returns a promise that resolves when the next binding refresh event is fired.
		 *
		 * @returns {Promise} A promise.
		 */
		oTable.qunit.whenBindingRefresh = function() {
			const oBinding = oTable.getBinding();

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
			const oBinding = oTable.getBinding();

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
				const oVSb = oTable._getScrollExtension().getVerticalScrollbar();
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
				const oHSb = oTable._getScrollExtension().getHorizontalScrollbar();
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
			const oVSb = oTable._getScrollExtension().getVerticalScrollbar();
			const iOldScrollTop = oVSb.scrollTop;

			oVSb.scrollTop = iScrollPosition;

			if (oVSb.scrollTop === iOldScrollTop) {
				return Promise.resolve();
			} else {
				return oTable.qunit.whenVSbScrolled().then(oTable.qunit.whenRenderingFinished);
			}
		};

		/**
		 * Wrapper around {@link #scrollVSbTo} for easier promise chaining. Returns a function that returns a promise.
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
			const oVSb = oTable._getScrollExtension().getVerticalScrollbar();
			return oTable.qunit.scrollVSbTo(oVSb.scrollTop + iDistance);
		};

		/**
		 * Wrapper around {@link #scrollVSbBy} for easier promise chaining. Returns a function that returns a promise.
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
		 * Returns a promise that resolves when the scrolling is performed and rendering is finished.
		 *
		 * @param {int} iScrollPosition The new horizontal scroll position.
		 * @returns {Promise} A promise.
		 */
		oTable.qunit.scrollHSbTo = function(iScrollPosition) {
			const oHSb = oTable._getScrollExtension().getHorizontalScrollbar();
			const $HSb = jQuery(oHSb);
			const bRTL = Localization.getRTL();
			const iOldScrollLeft = bRTL ? $HSb.scrollLeftRTL() : oHSb.scrollLeft;

			if (bRTL) {
				$HSb.scrollLeftRTL(iScrollPosition);
			} else {
				oHSb.scrollLeft = iScrollPosition;
			}

			if ((bRTL ? $HSb.scrollLeftRTL() : oHSb.scrollLeft) === iOldScrollLeft) {
				return Promise.resolve();
			} else {
				return oTable.qunit.whenHSbScrolled();
			}
		};

		/**
		 * Wrapper around {@link #scrollHSbTo} for easier promise chaining. Returns a function that returns a promise.
		 *
		 * @param {int} iScrollPosition The new horizontal scroll position.
		 * @returns {function(): Promise} Wrapper function.
		 */
		oTable.qunit.$scrollHSbTo = function(iScrollPosition) {
			return function() {
				return oTable.qunit.scrollHSbTo(iScrollPosition);
			};
		};

		/**
		 * Returns a promise that resolves when the scrolling is performed and rendering is finished.
		 *
		 * @param {int} iDistance The distance to scroll.
		 * @returns {Promise} A promise.
		 */
		oTable.qunit.scrollHSbBy = function(iDistance) {
			const oHSb = oTable._getScrollExtension().getHorizontalScrollbar();
			return oTable.qunit.scrollHSbTo(oHSb.scrollLeft + iDistance);
		};

		/**
		 * Wrapper around {@link #scrollHSbBy} for easier promise chaining. Returns a function that returns a promise.
		 *
		 * @param {int} iDistance The distance to scroll.
		 * @returns {function(): Promise} Wrapper function.
		 */
		oTable.qunit.$scrollHSbBy = function(iDistance) {
			return function() {
				return oTable.qunit.scrollHSbBy(iDistance);
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
			const oDomRef = oTable.getDomRef();
			const oContainerElement = oDomRef ? oDomRef.parentNode : null;

			if (!oContainerElement) {
				return Promise.resolve();
			}

			const sOldHeight = oContainerElement.style.height;
			const sOldWidth = oContainerElement.style.width;

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

			if ((mSizes.height != null && mSizes.height !== sOldHeight) || (mSizes.width != null && mSizes.width !== sOldWidth)) {
				// Give the table time to react. Default interval of IntervalTrigger singleton that is used by the ResizeHandler is 200ms.
				return TableQUnitUtils.wait(250).then(oTable.qunit.whenRenderingFinished);
			} else {
				return Promise.resolve();
			}
		};

		/**
		 * Wrapper around {@link #resize} for easier promise chaining. Returns a function that returns a promise.
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

		/**
		 * Focuses an element. If no focus events are fired, for example because the tab or browser window is in the background,
		 * artificial focus events are dispatched to the focused element.
		 *
		 * <b>Do not use this method if you need to check whether an element is focusable!</b>
		 *
		 * @param {HTMLElement} oElement The element to focus.
		 * @returns {Promise} A Promise that resolves after the focus events are fired and processed.
		 */
		oTable.qunit.focus = function(oElement) {
			let oEventListener;

			return new ExpiringPromise(0, function(resolve) {
				oEventListener = TableQUnitUtils.addEventListenerOnce(oElement, "focusin", function() {
					oHelperPlugin.whenFocusHandlingFinished().then(resolve);
				});
				oElement.focus();
			}).catch(function(oError) {
				if (oError instanceof TimeoutError) {
					// If the tab or browser are in the background, or the focus is in the dev tools, the are no focus events. To be able to continue
					// with the test execution, fake the focus events.
					oElement.dispatchEvent(new FocusEvent("focus"));
					oElement.dispatchEvent(new FocusEvent("focusin"));
					oEventListener.remove();
					return oHelperPlugin.whenFocusHandlingFinished();
				}
				throw oError;
			});
		};

		/**
		 * Wrapper around {@link #focus} for easier promise chaining. Returns a function that returns a promise.
		 *
		 * @param {HTMLElement} oElement The element that is focused.
		 * @returns {function(): Promise} Wrapper function.
		 */
		oTable.qunit.$focus = function(oElement) {
			return function() {
				return oTable.qunit.focus(oElement);
			};
		};

		/**
		 * Sets the content density and invalidates the table.
		 *
		 * @param {string} [sDensity] The content density value to be set.
		 * @returns {Promise} A promise that resolves after the rendering of the table is finished.
		 */
		oTable.qunit.setDensity = function(sDensity) {
			document.body.classList.remove("sapUiSizeCozy");
			document.body.classList.remove("sapUiSizeCompact");
			oTable.removeStyleClass("sapUiSizeCondensed");

			if (sDensity != null) {
				if (sDensity === "sapUiSizeCondensed") {
					document.body.classList.add("sapUiSizeCompact");
					oTable.addStyleClass("sapUiSizeCondensed");
				} else {
					document.body.classList.add(sDensity);
				}
			}

			oTable.invalidate();
			return oTable.qunit.whenRenderingFinished();
		};

		/**
		 * Resets to the original content density and invalidates the table.
		 *
		 * @returns {Promise} A promise that resolves after the rendering of the table is finished.
		 */
		oTable.qunit.resetDensity = function() {
			return oTable.qunit.setDensity("sapUiSizeCozy");
		};
	}

	function addHelpers(oTable) {
		/**
		 * Gets the data cell element.
		 *
		 * @param {int} iRowIndex Index of the row. Can be negative, for example -1 for the last row.
		 * @param {int} iColumnIndex Index of the column. Can be negative, for example -1 for the last column.
		 * @returns {HTMLElement} The cell DOM element.
		 */
		oTable.qunit.getDataCell = function(iRowIndex, iColumnIndex) {
			iColumnIndex = iColumnIndex < 0 ? oTable.getColumns().length + iColumnIndex : iColumnIndex;
			iRowIndex = iRowIndex < 0 ? oTable.getRows().length + iRowIndex : iRowIndex;
			return oTable.getDomRef("rows-row" + iRowIndex + "-col" + iColumnIndex);
		};

		/**
		 * Gets the column header cell element.
		 *
		 * @param {int} iColumnIndex Index of the column in the list of visible columns. Can be negative, for example -1 for the last column.
		 * @param {int} [iRowIndex] Index of the header row.
		 * @returns {HTMLElement} The cell DOM element.
		 */
		oTable.qunit.getColumnHeaderCell = function(iColumnIndex, iRowIndex = 0) {
			iColumnIndex = iColumnIndex < 0 ? oTable._getVisibleColumns().length + iColumnIndex : iColumnIndex;
			return document.getElementById(oTable._getVisibleColumns()[iColumnIndex].getId() + (iRowIndex > 0 ? "_" + iRowIndex : ""));
		};

		/**
		 * Gets the row header cell element.
		 *
		 * @param {int} iRowIndex Index of the row the cell is inside. Can be negative, for example -1 for the last row.
		 * @returns {HTMLElement} The cell DOM element.
		 */
		oTable.qunit.getRowHeaderCell = function(iRowIndex) {
			iRowIndex = iRowIndex < 0 ? oTable.getRows().length + iRowIndex : iRowIndex;
			return oTable.getDomRef("rowsel" + iRowIndex);
		};

		/**
		 * Gets the row action cell element.
		 *
		 * @param {int} iRowIndex Index of the row the cell is inside. Can be negative, for example -1 for the last row.
		 * @returns {HTMLElement} Returns the DOM element.
		 */
		oTable.qunit.getRowActionCell = function(iRowIndex) {
			iRowIndex = iRowIndex < 0 ? oTable.getRows().length + iRowIndex : iRowIndex;
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

		/**
		 * Adds a column that has test controls as template and label. Both template and label are text controls.
		 *
		 * @param {string|Object} [mConfig] A string that is set as the text of the template, or a config object. If no config is provided, the label
		 *                                  and template have empty texts.
		 * @param {string} [mConfig.id] Id for the new column.
		 * @param {string} [mConfig.text=undefined] The text of the template.
		 * @param {boolean} [mConfig.bind=false] Whether the text represents a binding path and the text property of the template should be bound.
		 *                                       The corresponding entry in the default test data is created if it does not yet exist.
		 * @param {boolean} [mConfig.focusable=false] Whether the text is focusable.
		 * @param {boolean} [mConfig.tabbable=false] Whether the text is tabbable.
		 * @param {string} [mConfig.label=undefined] The text of the label.
		 * @param {boolean} [mConfig.interactiveLabel=false] Whether the label should be interactive (focusable & tabbable).
		 * @returns {sap.ui.table.Column} The column that was added to the table.
		 * @see TableQUnitUtils.createTextColumn
		 */
		oTable.qunit.addTextColumn = function(mConfig) {
			const oColumn = TableQUnitUtils.createTextColumn(mConfig);
			oTable.addColumn(oColumn);
			return oColumn;
		};

		/**
		 * Adds a column that has interactive (focusable & tabbable) test controls as template and label. Both template and label are text controls.
		 *
		 * @param {string|Object} [mConfig] A string that is set as the text of the template, or a config object. If no config is provided, the label
		 *                                  and template have empty texts.
		 * @param {string} [mConfig.id] Id for the new column.
		 * @param {string} [mConfig.text=undefined] The text of the template.
		 * @param {boolean} [mConfig.bind=false] Whether the text represents a binding path and the text property of the template should be bound.
		 *                                       The corresponding entry in the default test data is created if it does not yet exist.
		 * @param {string} [mConfig.label=undefined] The text of the label.
		 * @returns {sap.ui.table.Column} The column that was added to the table.
		 * @see TableQUnitUtils.createInteractiveTextColumn
		 */
		oTable.qunit.addInteractiveTextColumn = function(mConfig) {
			const oColumn = TableQUnitUtils.createInteractiveTextColumn(mConfig);
			oTable.addColumn(oColumn);
			return oColumn;
		};

		/**
		 * Adds a column that has test controls as template and label. The template is an input control, and the label is a text control.
		 *
		 * @param {string|Object} [mConfig] A string that is set as the text of the template, or a config object. If no config is provided, the label
		 *                                  and template have empty texts.
		 * @param {string} [mConfig.id] Id for the new column.
		 * @param {string} [mConfig.text=undefined] The text of the template.
		 * @param {boolean} [mConfig.bind=false] Whether the text represents a binding path and the text property of the template should be bound.
		 *                                       The corresponding entry in the default test data is created if it does not yet exist.
		 * @param {string} [mConfig.type=text] The type of the input element.
		 * @param {boolean} [mConfig.tabbable=false] Whether the input is tabbable.
		 * @param {string} [mConfig.label=undefined] The text of the label.
		 * @param {boolean} [mConfig.interactiveLabel=false] Whether the label should be interactive (focusable & tabbable).
		 * @returns {sap.ui.table.Column} The column that was added to the table.
		 * @see TableQUnitUtils.createInputColumn
		 */
		oTable.qunit.addInputColumn = function(mConfig) {
			const oColumn = TableQUnitUtils.createInputColumn(mConfig);
			oTable.addColumn(oColumn);
			return oColumn;
		};

		/**
		 * A "touchstart" event is translated to a "mousedown" event by UI5. When the "mousedown" event is forwarded to the item navigation, it
		 * focuses the target element. When an element is focused, the browser scrolls it into the view. This method prevents this chain of events
		 * and is therefore useful when testing scrolling with touch events.
		 */
		oTable.qunit.preventFocusOnTouch = function() {
			oTable._getKeyboardExtension().suspendItemNavigation();
		};

		/**
		 * Sets the row states and invalidates the table. The row states are applied in the order in which they are provided. The row states are
		 * reset if no row states are provided.
		 *
		 * @param {object[]} [aRowStates] The row states to set.
		 * @returns {Promise} A promise that resolves after the rendering of the table is finished.
		 */
		oTable.qunit.setRowStates = function(aRowStates) {
			if (aRowStates) {
				if (!oTable.qunit._mSetRowStates) {
					oTable.qunit._mSetRowStates = {
						updateRowState: function(oState) {
							const iIndex = oTable.getFirstVisibleRow() + oTable.qunit._mSetRowStates.currentIndex;
							Object.assign(oState, oTable.qunit._mSetRowStates.rowStates[iIndex]);
							oTable.qunit._mSetRowStates.currentIndex++;
						},
						onRowsUpdated: function() {
							oTable.qunit._mSetRowStates.currentIndex = 0;
						},
						currentIndex: 0
					};
					oTable.attachRowsUpdated(oTable.qunit._mSetRowStates.onRowsUpdated);
					TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Row.UpdateState, oTable.qunit._mSetRowStates.updateRowState);
				}
				oTable.qunit._mSetRowStates.rowStates = aRowStates;
			} else if (oTable.qunit._mSetRowStates) {
				oTable.detachRowsUpdated(oTable.qunit._mSetRowStates.onRowsUpdated);
				TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Row.UpdateState, oTable.qunit._mSetRowStates.updateRowState);
				delete oTable.qunit._mSetRowStates;
			}

			oTable.invalidate();
			return oTable.qunit.whenRenderingFinished();
		};
	}

	TableQUnitUtils.TestSelectionPlugin = TestSelectionPlugin;
	TableQUnitUtils.TestControl = TestControl;
	TableQUnitUtils.TestInputControl = TestInputControl;
	TableQUnitUtils.HeightTestControl = HeightTestControl;
	TableQUnitUtils.ColumnHeaderMenu = Control.extend("sap.ui.table.test.TestContextMenu", {
		metadata: {
			interfaces: ["sap.ui.core.IColumnHeaderMenu"]
		},
		openBy: () => {},
		getAriaHasPopupType: () => { return CoreLibrary.aria.HasPopup.Menu; }
	});
	TableQUnitUtils.TimeoutError = TimeoutError;

	TableQUnitUtils.setDefaultSettings = function(mSettings) {
		mDefaultSettings = Object.assign({}, mSettings);
	};

	TableQUnitUtils.getDefaultSettings = function() {
		return mDefaultSettings;
	};

	TableQUnitUtils.createTable = async function(TableClass, mSettings, fnBeforePlaceAt) {
		if (typeof TableClass === "function" && TableClass !== Table && TableClass !== TreeTable && TableClass !== AnalyticalTable) {
			fnBeforePlaceAt = TableClass;
			TableClass = Table;
		} else if (typeof TableClass === "object") {
			fnBeforePlaceAt = mSettings;
			mSettings = TableClass;
			TableClass = Table;
		} else if (typeof TableClass === "function" && typeof mSettings === "function") {
			fnBeforePlaceAt = mSettings;
			mSettings = undefined;
		}
		mSettings = Object.assign({}, deepCloneSettings(this.getDefaultSettings()), mSettings);
		TableClass = TableClass == null ? Table : TableClass;

		const oHelperPlugin = new HelperPlugin();

		if ("dependents" in mSettings) {
			mSettings.dependents.push(oHelperPlugin);
		} else {
			mSettings.dependents = [oHelperPlugin];
		}

		const oTable = new TableClass(createTableSettings(TableClass, mSettings));

		Object.defineProperty(oTable, "qunit", {
			value: {}
		});

		setExperimentalSettings(oTable, mSettings);
		addAsyncHelpers(oTable, oHelperPlugin);
		addHelpers(oTable);

		if (typeof fnBeforePlaceAt === "function") {
			fnBeforePlaceAt(oTable, mSettings);
		}

		let sContainerId;
		if (typeof mSettings.placeAt === "string") {
			sContainerId = mSettings.placeAt;
		} else if (mSettings.placeAt !== false) {
			sContainerId = "qunit-fixture";
		}

		if (sContainerId != null) {
			oTable.placeAt(sContainerId);
			await nextUIUpdate();
		}

		return oTable;
	};

	TableQUnitUtils.createJSONModelWithEmptyRows = function(iLength) {
		return new JSONModel(new Array(iLength).fill({}));
	};

	TableQUnitUtils.createJSONModel = function(iLength) {
		fillDataUpTo(iLength);
		return new JSONModel(aData.slice(0, iLength));
	};

	function fillDataUpTo(iLength) {
		if (aData.length >= iLength) {
			return;
		}

		for (let i = aData.length; i < iLength; i++) {
			const oNewEntry = Object.assign({children: [{}]}, oDataTemplate);

			for (const sKey in oNewEntry) {
				if (sKey === "children") {
					continue;
				}
				oNewEntry[sKey] = oNewEntry[sKey] + "_" + i;
				oNewEntry.children[0][sKey] = oNewEntry[sKey] + "_child_0";
			}

			aData.push(oNewEntry);
		}
	}

	function addPropertyToData(sProperty) {
		if (aData.length === 0 || sProperty in aData[0]) {
			return;
		}

		oDataTemplate[sProperty] = sProperty;

		for (let i = 0; i < aData.length; i++) {
			aData[i][sProperty] = sProperty + "_" + i;
			aData[i].children[0][sProperty] = aData[i][sProperty] + "_child_0";
		}
	}

	/**
	 * Creates a column that has test controls as template and label. Both template and label are text controls.
	 *
	 * @param {string|Object} [mConfig] A string that is set as the text of the template, or a config object. If no config is provided, the label
	 *                                  and template have empty texts.
	 * @param {string} [mConfig.id] Id for the new column.
	 * @param {string} [mConfig.text=undefined] The text of the template.
	 * @param {boolean} [mConfig.bind=false] Whether the text represents a binding path and the text property of the template should be bound.
	 *                                       The corresponding entry in the default test data is created if it does not yet exist.
	 * @param {boolean} [mConfig.focusable=false] Whether the text is focusable.
	 * @param {boolean} [mConfig.tabbable=false] Whether the text is tabbable.
	 * @param {string} [mConfig.label=undefined] The text of the label.
	 * @param {boolean} [mConfig.interactiveLabel=false] Whether the label should be interactive (focusable & tabbable).
	 * @param {boolean} [mConfig.templateHidden=false] Whether the <code>visible</code> property of the template should be set to <code>false</code>.
	 * @returns {sap.ui.table.Column} The column.
	 */
	TableQUnitUtils.createTextColumn = function(mConfig) {
		mConfig = typeof mConfig === "string" ? {text: mConfig} : Object.assign({}, mConfig);

		const oColumn = new Column(mConfig.id, {
			label: new TestControl({
				text: mConfig.label,
				focusable: mConfig.interactiveLabel === true,
				tabbable: mConfig.interactiveLabel === true
			}),
			template: new TestControl({
				text: mConfig.bind === true ? "{" + mConfig.text + "}" : mConfig.text,
				focusable: mConfig.focusable === true,
				tabbable: mConfig.tabbable === true,
				visible: !mConfig.templateHidden
			}),
			width: "100px"
		});

		if (mConfig.bind === true) {
			addPropertyToData(mConfig.text);
		}

		return oColumn;
	};

	/**
	 * Creates a column that has interactive (focusable & tabbable) test controls as template and label. Both template and label are text controls.
	 *
	 * @param {string|Object} [mConfig] A string that is set as the text of the template, or a config object. If no config is provided, the label
	 *                                  and template have empty texts.
	 * @param {string} [mConfig.id] Id for the new column.
	 * @param {string} [mConfig.text=undefined] The text of the template.
	 * @param {boolean} [mConfig.bind=false] Whether the text represents a binding path and the text property of the template should be bound.
	 *                                       The corresponding entry in the default test data is created if it does not yet exist.
	 * @param {string} [mConfig.label=undefined] The text of the label.
	 * @returns {sap.ui.table.Column} The column.
	 */
	TableQUnitUtils.createInteractiveTextColumn = function(mConfig) {
		mConfig = typeof mConfig === "string" ? {text: mConfig} : Object.assign({
			focusable: true,
			tabbable: true,
			interactiveLabel: true
		}, mConfig);

		return TableQUnitUtils.createTextColumn(mConfig);
	};

	/**
	 * Creates a column that has test controls as template and label. The template is an input control, and the label is a text control.
	 *
	 * @param {string|Object} [mConfig] A string that is set as the text of the template, or a config object. If no config is provided, the label
	 *                                  and template have empty texts.
	 * @param {string} [mConfig.id] Id for the new column.
	 * @param {string} [mConfig.text=undefined] The text of the template.
	 * @param {boolean} [mConfig.bind=false] Whether the text represents a binding path and the text property of the template should be bound.
	 *                                       The corresponding entry in the default test data is created if it does not yet exist.
	 * @param {string} [mConfig.type=text] The type of the input element.
	 * @param {boolean} [mConfig.tabbable=false] Whether the input is tabbable.
	 * @param {string} [mConfig.label=undefined] The text of the label.
	 * @param {boolean} [mConfig.interactiveLabel=false] Whether the label should be interactive (focusable & tabbable).
	 * @returns {sap.ui.table.Column} The column.
	 */
	TableQUnitUtils.createInputColumn = function(mConfig) {
		mConfig = typeof mConfig === "string" ? {text: mConfig} : Object.assign({}, mConfig);

		const oColumn = new Column(mConfig.id, {
			label: new TestControl({
				text: mConfig.label,
				focusable: mConfig.interactiveLabel === true,
				tabbable: mConfig.interactiveLabel === true
			}),
			template: new TestInputControl({
				text: mConfig.bind === true ? "{" + mConfig.text + "}" : mConfig.text,
				tabbable: mConfig.tabbable === true,
				type: mConfig.type
			}),
			width: "100px"
		});

		if (mConfig.bind === true) {
			addPropertyToData(mConfig.text);
		}

		return oColumn;
	};

	/**
	 * Creates an instance of a <code>RowAction</code> with items. Can be used as a row action template in the table.
	 *
	 * @param {object[]} [aItemSettings=[{type: "Navigation"}, {type: "Delete"}]]
	 *     The settings for the items. If no settings are provided, a navigation and a delete item are created. If <code>null</code> is provided, no
	 *     items are created.
	 * @returns {sap.ui.table.RowAction} Row action with items.
	 */
	TableQUnitUtils.createRowAction = function(aItemSettings = [
		{type: "Navigation"},
		{type: "Delete"}
	]) {
		return new RowAction({
			items: (aItemSettings ?? []).map(function(mItemSettings) {
				return new RowActionItem(mItemSettings);
			})
		});
	};

	/**
	 * Adds a delegate that listens to an event of an element once. The delegate is removed after the event.
	 *
	 * @param {sap.ui.core.Element} oElement The element to add the delegate to.
	 * @param {string} sEventName The name of the event.
	 * @param {Function} fnHandler The event handler.
	 * @param {boolean} [bCallBefore=false] Whether the listener is called before the listener of the element.
	 * @return {{remove: Function}} An object providing methods, for example to remove the delegate before it is called.
	 */
	TableQUnitUtils.addDelegateOnce = function(oElement, sEventName, fnHandler, bCallBefore) {
		const oDelegate = {};

		oDelegate[sEventName] = function() {
			this.removeDelegate(oDelegate);
			fnHandler.apply(this, arguments);
		};

		oElement.addDelegate(oDelegate, bCallBefore === true, oElement);

		return {
			remove: function() {
				oElement.removeDelegate(oDelegate);
			}
		};
	};

	/**
	 * Adds an event listener that listens to an event of an element once. THe listener is removed after the event.
	 *
	 * @param {HTMLElement} oElement The element to add the listener to.
	 * @param {string} sEventName The name of the event.
	 * @param {Function} fnHandler The event handler.
	 * @return {{remove: Function}} An object providing methods, for example to remove the listener before it is called.
	 */
	TableQUnitUtils.addEventListenerOnce = function(oElement, sEventName, fnHandler) {
		oElement.addEventListener(sEventName, function(oEvent) {
			oElement.removeEventListener(sEventName, fnHandler);
			fnHandler.call(this, oEvent);
		});

		return {
			remove: function() {
				oElement.removeEventListener(sEventName, fnHandler);
			}
		};
	};

	/**
	 * Wraps a method once. The method is unwrapped after it is called.
	 *
	 * @param {Object} oObject The object whose method is to be wrapped.
	 * @param {string} sFunctionName The name of the function to wrap.
	 * @param {Function} fnBefore This function is called before the wrapped function is executed.
	 * @param {Function} fnAfter This function is called after the wrapped function is executed.
	 * @return {{remove: Function}} An object providing methods, for example to remove the wrapper before it is called.
	 */
	TableQUnitUtils.wrapOnce = function(oObject, sFunctionName, fnBefore, fnAfter) {
		const fnOriginalFunction = oObject[sFunctionName];

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

		return {
			remove: function() {
				oObject[sFunctionName] = fnOriginalFunction;
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
		const bUseRequestAnimationFrame = iMilliseconds == null;

		return new Promise(function(resolve) {
			if (bUseRequestAnimationFrame) {
				window.requestAnimationFrame(resolve);
			} else {
				setTimeout(resolve, iMilliseconds);
			}
		});
	};

	/**
	 * Attachs an event handler for the next event with the given name to the given EventProvider instance.
	 * Returns a Promise that resolves with the sap.ui.base.Event instance.
	 *
	 * @param {string} sEventName Name of the event
	 * @param {sap.ui.base.EventProvider} oEventProvider EventProvider where the event handler is attached
	 * @returns {Promise} Resolves with the sap.ui.base.Event instance
	 */
	TableQUnitUtils.nextEvent = async (sEventName, oEventProvider) => {
		return await new Promise((fnResolve) => {
			oEventProvider?.attachEventOnce(sEventName, fnResolve);
		});
	};

	/**
	 * Wrapper around {@link #wait} for easier promise chaining. Returns a function that returns a promise.
	 *
	 * @param {int} [iMilliseconds] The delay in milliseconds. If none is set, <code>requestAnimationFrame</code> is used.
	 * @returns {function(): Promise} Wrapper function.
	 */
	TableQUnitUtils.$wait = function(iMilliseconds) {
		return function() {
			return TableQUnitUtils.wait(iMilliseconds);
		};
	};

	/**
	 * Checks if the "NoData" text of a table matches certain conditions.
	 *
	 * @param {object} assert QUnit assert object.
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {boolean} bVisible Whether the "NoData" text is expected to be visible.
	 * @param {string} [sTitle] Title of the test that prefixes all test messages.
	 */
	TableQUnitUtils.assertNoDataVisible = function(assert, oTable, bVisible, sTitle) {
		const sTestTitle = sTitle == null ? "" : sTitle + ": ";

		assert.equal(TableUtils.isNoDataVisible(oTable), bVisible, sTestTitle + "NoData visibility");

		if (!bVisible) {
			// If the NoData element is not visible, the table must have focusable elements (cells).
			assert.ok(oTable.qunit.getDataCell(0, oTable._getVisibleColumns()[0].getIndex()),
				sTestTitle + "If 'NoData' is not visible, rows are rendered");
		}
	};

	/**
	 * Checks if the correct number of rows is rendered.
	 *
	 * @param {object} assert QUnit assert object.
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {int} iFixedTop The number of fixed top rows.
	 * @param {int} iScrollable The number of scrollable rows.
	 * @param {int} iFixedBottom The number of fixed bottom rows.
	 */
	TableQUnitUtils.assertRenderedRows = function(assert, oTable, iFixedTop, iScrollable, iFixedBottom) {
		const oFixedTopRowContainer = oTable.getDomRef("table-fixrow");
		const oScrollableRowContainer = oTable.getDomRef("table");
		const oFixedBottomRowContainer = oTable.getDomRef("table-fixrow-bottom");
		const iFixedTopRowCount = oFixedTopRowContainer ? oFixedTopRowContainer.querySelectorAll(".sapUiTableRow").length : 0;
		const iScrollableTopRowCount = oScrollableRowContainer ? oScrollableRowContainer.querySelectorAll(".sapUiTableRow").length : 0;
		const iFixedBottomRowCount = oFixedBottomRowContainer ? oFixedBottomRowContainer.querySelectorAll(".sapUiTableRow").length : 0;

		assert.strictEqual(iFixedTopRowCount, iFixedTop, "Fixed top row count");
		assert.strictEqual(iScrollableTopRowCount, iScrollable, "Scrollable row count");
		assert.strictEqual(iFixedBottomRowCount, iFixedBottom, "Fixed bottom row count");
	};

	/**
	 * Checks if the row heights for the given test settings are correct.
	 *
	 * @param {object} assert QUnit assert object.
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {object} mTestSettings Test settings.
	 * @param {string} mTestSettings.density Current content density.
	 * @param {string} mTestSettings.title Title for the assertion.
	 * @param {number} mTestSettings.expectedHeight Expected row height.
	 */
	TableQUnitUtils.assertRowHeights = function(assert, oTable, mTestSettings) {
		const sDensity = mTestSettings.density ? mTestSettings.density.replace("sapUiSize", "") : "undefined";
		mTestSettings.title += " (Density=\"" + sDensity + "\")";

		const aRowDomRefs = oTable.getRows()[0].getDomRefs();
		assert.strictEqual(aRowDomRefs.rowSelector.getBoundingClientRect().height, mTestSettings.expectedHeight,
			mTestSettings.title + ": Selector height is ok");
		assert.strictEqual(aRowDomRefs.rowFixedPart.getBoundingClientRect().height, mTestSettings.expectedHeight,
			mTestSettings.title + ": Fixed part height is ok");
		assert.strictEqual(aRowDomRefs.rowScrollPart.getBoundingClientRect().height, mTestSettings.expectedHeight,
			mTestSettings.title + ": Scrollable part height is ok");
		assert.strictEqual(aRowDomRefs.rowAction.getBoundingClientRect().height, mTestSettings.expectedHeight,
			mTestSettings.title + ": Action height is ok");
	};

	/**
	 * Checks if the column header heights for the given test settings are correct.
	 *
	 * @param {object} assert QUnit assert object.
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {object} mTestSettings Test settings.
	 * @param {string} mTestSettings.density Current content density.
	 * @param {string} mTestSettings.title Title for the assertion.
	 * @param {number} mTestSettings.expectedHeight Expected column header height.
	 */
	TableQUnitUtils.assertColumnHeaderHeights = function(assert, oTable, mTestSettings) {
		const sDensity = mTestSettings.density ? mTestSettings.density.replace("sapUiSize", "") : "undefined";
		mTestSettings.title += " (Density=\"" + sDensity + "\")";

		const aRowDomRefs = oTable.getDomRef().querySelectorAll(".sapUiTableColHdrTr");
		const oColumnHeaderCnt = oTable.getDomRef().querySelector(".sapUiTableColHdrCnt");

		assert.strictEqual(aRowDomRefs[0].getBoundingClientRect().height, mTestSettings.expectedHeight,
			mTestSettings.title + ": Fixed part height is ok");
		assert.strictEqual(aRowDomRefs[1].getBoundingClientRect().height, mTestSettings.expectedHeight,
			mTestSettings.title + ": Scrollable part height is ok");
		assert.strictEqual(oColumnHeaderCnt.getBoundingClientRect().height, mTestSettings.expectedHeight + 1 /* border */,
			mTestSettings.title + ": Column header container height is ok");
	};

	/**
	 * Focus an element that is outside of a table.
	 *
	 * @param {object} [assert] QUnit assert object. This parameter can be omitted.
	 * @param {string} [sId] Id of an element outside of the table.
	 * @throws {Error} If the focused element is inside a table.
	 * @returns {HTMLElement} The focused element.
	 */
	TableQUnitUtils.setFocusOutsideOfTable = function(assert, sId) {
		if (typeof assert === "string") {
			sId = assert;
		}

		sId = sId || "outerelement";
		const oOuterElement = document.getElementById(sId);
		oOuterElement.focus();

		if (oOuterElement.closest(".sapUiTable")) {
			throw new Error("Element with id '" + sId + "' is inside a table");
		}

		if (assert) {
			assert.deepEqual(oOuterElement, document.activeElement, "Outer element with id '" + sId + "' focused");
		}

		return oOuterElement;
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

		let oTemplate;

		if (bInputElement) {
			oTemplate = new TestInputControl({
				text: bBindText ? "{" + sText + "}" : sText,
				tabbable: bTabbable,
				type: sInputType
			});
		} else {
			oTemplate = new TestControl({
				text: bBindText ? "{" + sText + "}" : sText,
				visible: true,
				focusable: bFocusable,
				tabbable: bFocusable && bTabbable
			});
		}

		const oColumn = new Column({
			label: new TestControl({
				text: sTitle,
				focusable: bInteractiveLabel,
				tabbable: bInteractiveLabel
			}),
			width: "100px",
			template: oTemplate
		});
		oTable.addColumn(oColumn);

		for (let i = 0; i < iNumberOfDataRows; i++) {
			oTable.getModel().getData().rows[i][sText] = sText + (i + 1);
		}

		return oColumn;
	};

	TableQUnitUtils.createMouseWheelEvent = function(iScrollDelta, iDeltaMode, bShift) {
		return new window.WheelEvent("wheel", {
			deltaY: bShift ? 0 : iScrollDelta,
			deltaX: bShift ? iScrollDelta : 0,
			deltaMode: iDeltaMode,
			shiftKey: bShift,
			bubbles: true,
			cancelable: true
		});
	};

	TableQUnitUtils.createTouchEvent = function(sType, mParams) {
		if (Device.browser.firefox || Device.browser.safari) {
			return Object.assign(new Event(sType, {
				bubbles: true,
				cancelable: true
			}), mParams);
		} else {
			return new window.TouchEvent(sType, Object.assign({
				bubbles: true,
				cancelable: true
			}, mParams));
		}
	};

	TableQUnitUtils.createTouchObject = function(mParams) {
		if (Device.browser.firefox || Device.browser.safari) {
			const oTarget = mParams.target;

			delete mParams.target;

			return Object.assign(new Event({
				bubbles: true,
				cancelable: true,
				target: oTarget
			}), mParams);
		} else {
			return new window.Touch(mParams);
		}
	};

	TableQUnitUtils.startTouchScrolling = function(oTargetElement, iPageX, iPageY) {
		oTouchTargetElement = oTargetElement;
		iTouchPositionX = iPageX || 0;
		iTouchPositionY = iPageY || 0;

		const oTouchEvent = this.createTouchEvent("touchstart", {
			touches: [
				this.createTouchObject({
					target: oTouchTargetElement,
					identifier: Date.now(),
					pageX: iTouchPositionX,
					pageY: iTouchPositionY
				})
			]
		});

		oTouchTargetElement.dispatchEvent(oTouchEvent);

		return oTouchEvent;
	};

	TableQUnitUtils.doTouchScrolling = function(iScrollDeltaX, iScrollDeltaY) {
		iTouchPositionX -= iScrollDeltaX || 0;
		iTouchPositionY -= iScrollDeltaY || 0;

		const oTouchEvent = this.createTouchEvent("touchmove", {
			touches: [
				this.createTouchObject({
					target: oTouchTargetElement,
					identifier: Date.now(),
					pageX: iTouchPositionX,
					pageY: iTouchPositionY
				})
			]
		});

		oTouchTargetElement.dispatchEvent(oTouchEvent);

		return oTouchEvent;
	};

	TableQUnitUtils.endTouchScrolling = function() {
		const oTouchEvent = this.createTouchEvent("touchend", {
			changedTouches: [
				this.createTouchObject({
					target: oTouchTargetElement,
					identifier: Date.now(),
					pageX: iTouchPositionX,
					pageY: iTouchPositionY
				})
			]
		});

		oTouchTargetElement.dispatchEvent(oTouchEvent);

		return oTouchEvent;
	};

	TableQUnitUtils.createScrollEvent = function() {
		return new window.Event("scroll");
	};

	/**
	 * Creates and returns an object that can be used to predefine QUnit tests to reuse them in multiple QUnit test pages.
	 *
	 * @example
	 * // The module that contains the reusable tests returns the QUnit test collector.
	 * const QUnitTestCollector = TableQUnitUtils.createQUnitTestCollector();
	 * QUnitTestCollector.module("My module", {
	 *     beforeEach: () => {...}
	 * });
	 * QUnitTestCollector.test("My test", function(assert) {...});
	 * QUnitTestCollector.skip("My other test", function(assert) {...});
	 * return QUnitTestCollector;
	 *
	 * // The tests are registered in the QUnit test page.
	 * QUnitTestCollector.registerTo(QUnit);
	 * @returns {{registerTo: function(QUnit, fnTestStart), testStart: function(assert, fnOriginalTest)}} A QUnit test collector
	 */
	TableQUnitUtils.createQUnitTestCollector = function() {
		const aCollection = [];
		let fnTestCallback;

		function wrapTest(fnTest) {
			return function(assert) {
				const _fnTest = () => { return fnTest.apply(this, arguments); };
				return fnTestCallback ? fnTestCallback.call(this, assert, _fnTest) : _fnTest();
			};
		}

		const oCollector = new Proxy({
			testStart: (fnCallback) => {
				fnTestCallback = fnCallback;
			},
			registerTo: function(QUnit, fnCallback) {
				fnTestCallback = fnCallback;
				aCollection.forEach((entry) => {
					QUnit[entry.methodName](...entry.arguments);
				});
			}
		}, {
			get: (oTarget, sProperty, oProxy) => {
				return new Proxy(() => {}, {
					apply: (fn, thisArg, aArgumentsList) => {
						if (typeof oTarget[sProperty] === "function") {
							oTarget[sProperty].apply(oTarget, aArgumentsList);
						} else {
							if (typeof aArgumentsList[1] === "function") {
								aArgumentsList[1] = wrapTest(aArgumentsList[1]);
							}
							aCollection.push({
								methodName: sProperty,
								arguments: aArgumentsList
							});
						}
					}
				});
			}
		});

		return oCollector;
	};

	TableQUnitUtils.hideTestContainer = function() {
		const oQunitFixture = document.getElementById("qunit-fixture");

		oQunitFixture.dataset.originalDisplayStyle = oQunitFixture.style.display;
		oQunitFixture.style.display = "none";

		return new Promise(function(resolve) {
			window.requestAnimationFrame(resolve);
		});
	};

	TableQUnitUtils.showTestContainer = function() {
		const oQunitFixture = document.getElementById("qunit-fixture");

		oQunitFixture.style.display = oQunitFixture.dataset.originalDisplayStyle;
		delete oQunitFixture.dataset.originalDisplayStyle;

		return new Promise(function(resolve) {
			window.requestAnimationFrame(resolve);
		});
	};

	/***********************************
	 * Legacy utils                    *
	 ***********************************/

	let oTable;
	let oTreeTable;
	const oModel = new JSONModel();
	const aFields = ["A", "B", "C", "D", "E"];

	window.oModel = oModel;
	window.aFields = aFields;
	window.iNumberOfRows = iNumberOfDataRows;

	window.createTables = async function(bSkipPlaceAt, bFocusableCellTemplates, iCustomNumberOfRows) {
		const iCount = iCustomNumberOfRows ? iCustomNumberOfRows : iNumberOfDataRows;

		oTable = new Table({
			rows: "{/rows}",
			extension: [
				new TestControl({text: "Grid Table"})
			],
			selectionMode: "MultiToggle",
			rowMode: new FixedRowMode({
				rowCount: 3
			}),
			ariaLabelledBy: "ARIALABELLEDBY",
			fixedColumnCount: 1
		});
		window.oTable = oTable;

		oTreeTable = new TreeTable({
			rows: {
				path: "/tree",
				parameters: {arrayNames: ["rows"]}
			},
			extension: [
				new TestControl({text: "Tree Table"})
			],
			selectionMode: "Single",
			rowMode: new FixedRowMode({
				rowCount: 3
			}),
			groupHeaderProperty: aFields[0],
			ariaLabelledBy: "ARIALABELLEDBY"
		});
		window.oTreeTable = oTreeTable;

		const oData = {rows: [], tree: {rows: []}};
		let oRow;
		let oTree;
		for (let i = 0; i < iCount; i++) {
			oRow = {};
			oTree = {rows: [{}]};
			for (let j = 0; j < aFields.length; j++) {
				oRow[aFields[j]] = aFields[j] + (i + 1);
				oTree[aFields[j]] = aFields[j] + (i + 1);
				oTree.rows[0][aFields[j]] = aFields[j] + "SUB" + (i + 1);
				if (i === 0) {
					oTable.addColumn(new Column({
						label: aFields[j] + "_TITLE",
						width: "100px",
						tooltip: j === 2 ? aFields[j] + "_TOOLTIP" : null,
						template: new TestControl({
							text: "{" + aFields[j] + "}",
							visible: j !== 3,
							tabbable: !!bFocusableCellTemplates
						})
					}));
					oTreeTable.addColumn(new Column({
						label: aFields[j] + "_TITLE",
						width: "100px",
						template: new TestControl({
							text: "{" + aFields[j] + "}",
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
			await nextUIUpdate();
		}
	};

	window.destroyTables = function() {
		oTable.destroy();
		oTable = null;
		oTreeTable.destroy();
		oTreeTable = null;
	};

	window.getCell = function(iRow, iCol, bFocus, assert, oTableInstance) {
		if (oTableInstance == null) {
			oTableInstance = oTable;
		}

		const oCell = oTableInstance.getDomRef("rows-row" + iRow + "-col" + iCol);
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

		const oCell = oTableInstance._getVisibleColumns()[iCol].getDomRef();
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

		const oCell = oTableInstance.getDomRef("rowsel" + iRow);
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

		const oCell = oTableInstance.getDomRef("rowact" + iRow);
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

		const oCell = oTableInstance.getDomRef("selall");
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

	/**
	 * Check whether an element is focused.
	 * @param {jQuery|HTMLElement} oElement The element to check.
	 * @param {Object} assert QUnit assert object.
	 * @returns {jQuery} A jQuery object containing the active element.
	 */
	window.checkFocus = function(oElement, assert) {
		const $ActiveElement = jQuery(document.activeElement);
		const $Element = jQuery(oElement);

		assert.deepEqual(document.activeElement, $Element[0], "Focus is on: " + $ActiveElement.attr("id") + ", should be on: " + $Element.attr("id"));

		return $ActiveElement;
	};

	return TableQUnitUtils;
});