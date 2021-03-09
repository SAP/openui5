sap.ui.define([
	"sap/ui/table/library",
	"sap/ui/table/Table",
	"sap/ui/table/TreeTable",
	"sap/ui/table/AnalyticalTable",
	"sap/ui/table/Column",
	"sap/ui/table/RowAction",
	"sap/ui/table/RowActionItem",
	"sap/ui/table/plugins/PluginBase",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Control",
	"sap/base/util/merge",
	"sap/ui/thirdparty/jquery"
], function(
	TableLibrary, Table, TreeTable, AnalyticalTable, Column, RowAction, RowActionItem, PluginBase, TableUtils, JSONModel, Control, merge, jQuery
) {
	"use strict";

	var TableQUnitUtils = {}; // TBD: Move global functions to this object
	var aData = [];
	var oDataTemplate = {};
	var mDefaultSettings = {};
	var iNumberOfDataRows = 8;

	var TestControl = Control.extend("sap.ui.table.test.TestControl", {
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

	var TestInputControl = Control.extend("sap.ui.table.test.TestInputControl", {
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

	var HeightTestControl = Control.extend("sap.ui.table.test.HeightTestControl", {
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
	var HelperPlugin = PluginBase.extend("sap.ui.table.test.HelperPlugin", {
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

		var wrapForRenderingDetection = function(oObject, sFunctionName) {
			var fnOriginalFunction = oObject[sFunctionName];
			oObject[sFunctionName] = function() {
				this.fireRenderingTriggered();
				fnOriginalFunction.apply(oObject, arguments);
			}.bind(this);
		}.bind(this);

		// Add wrappers and hooks for functions that inevitably trigger a "rowsUpdated" event.
		wrapForRenderingDetection(oTable, "invalidate");
		wrapForRenderingDetection(oTable, "rerender");
	};
	HelperPlugin.prototype.hooks[TableUtils.Hook.Keys.Table.RefreshRows] = function() {this.fireRenderingTriggered();};
	HelperPlugin.prototype.hooks[TableUtils.Hook.Keys.Table.UpdateRows] = function() {this.fireRenderingTriggered();};
	HelperPlugin.prototype.hooks[TableUtils.Hook.Keys.Table.UnbindRows] = function() {this.fireRenderingTriggered();};

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
		var oError = new Error("Timed out" + (typeof iMilliseconds === "number" ? " after " + iMilliseconds + "ms" : ""));

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

		var iTimeoutId;
		var pTimeout = new Promise(function(resolve, reject) {
			iTimeoutId = setTimeout(function() {
				reject(new TimeoutError(iTimeout));
			}, iTimeout);
		});
		var pAction = new Promise(function() {
			fnExecutor.apply(this, Array.prototype.slice.call(arguments));
		});

		pAction.then(function() {
			clearTimeout(iTimeoutId);
		});

		return Promise.race([pTimeout, pAction]);
	}

	function deepCloneSettings(mSettings) {
		var oClone = merge({}, mSettings);

		// Clone all instances of type sap.ui.base.ManagedObject.
		for (var sProperty in oClone) {
			if (!oClone.hasOwnProperty(sProperty)) {
				continue;
			}

			var vValue = oClone[sProperty];

			if (TableUtils.isA(vValue, "sap.ui.base.ManagedObject")) {
				oClone[sProperty] = vValue.clone();
			} else if (Array.isArray(vValue)) {
				for (var i = 0; i < vValue.length; i++) {
					if (TableUtils.isA(vValue[i], "sap.ui.base.ManagedObject")) {
						vValue[i] = vValue[i].clone();
					}
				}
			}
		}

		return oClone;
	}

	sap.ui.table.TableHelper = {
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
		// TODO: Replace with a helper method in the "qunit" member of the table, or delete and replace with oTable#getColumns().length
		Object.defineProperty(TableClass.prototype, "columnCount", {
			get: function() {
				return this.getColumns().length;
			}
		});

		// TODO: Remove once the "plugins" aggregation is of type sap.ui.table.PluginBase
		var fnOriginalValidateAggregation = TableClass.prototype.validateAggregation;
		TableClass.prototype.validateAggregation = function(sAggregationName, oObject) {
			if (sAggregationName === "plugins" && oObject.isA("sap.ui.table.test.HelperPlugin")) {
				return oObject;
			} else {
				return fnOriginalValidateAggregation.apply(this, arguments);
			}
		};

		// TODO: Remove this once row modes and CreationRow are public.
		var fnApplySettings = TableClass.prototype.applySettings;
		TableClass.prototype.applySettings = function(mSettings) {
			if (mSettings && "rowMode" in mSettings) {
				this.setRowMode(mSettings.rowMode);
				delete mSettings.rowMode;
			}
			if (mSettings && "creationRow" in mSettings) {
				this.setCreationRow(mSettings.creationRow);
				delete mSettings.creationRow;
			}
			fnApplySettings.apply(this, arguments);
		};
	});

	function createTableSettings(TableClass, mSettings) {
		var oMetadata = TableClass.getMetadata();
		var aProperties = Object.keys(oMetadata.getAllProperties());
		var aAggregations = Object.keys(oMetadata.getAllAggregations());
		var aAssociations = Object.keys(oMetadata.getAllAssociations());
		var aAdditionalKeys = ["models"];
		var aAllMetadataKeys = aProperties.concat(aAggregations).concat(aAssociations).concat(aAdditionalKeys);

		aAllMetadataKeys = aAllMetadataKeys.concat(["rowMode", "creationRow"]); // TODO: Remove this once row modes and CreationRow are public.

		return Object.keys(mSettings).reduce(function(oObject, sKey) {
			if (aAllMetadataKeys.indexOf(sKey) >= 0) {
				oObject[sKey] = mSettings[sKey];
			}
			return oObject;
		}, {});
	}

	function setExperimentalSettings(oTable, mSettings) {
		var aExperimentalProperties = ["_bVariableRowHeightEnabled", "_bLargeDataScrolling"];

		for (var sKey in mSettings) {
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

			var bWrapperDisabled = false;
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
			var oBinding = oTable.getBinding();

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
			var oBinding = oTable.getBinding();

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
			var oVSb = oTable._getScrollExtension().getVerticalScrollbar();
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
			var oHSb = oTable._getScrollExtension().getHorizontalScrollbar();
			var $HSb = jQuery(oHSb);
			var bRTL = sap.ui.getCore().getConfiguration().getRTL();
			var iOldScrollLeft = bRTL ? $HSb.scrollLeftRTL() : oHSb.scrollLeft;

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
			var oHSb = oTable._getScrollExtension().getHorizontalScrollbar();
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
		 * <b>Do not use this method is you need to check whether an element is focusable!</b>
		 *
		 * @param {HTMLElement} oElement The element to focus.
		 * @returns {Promise} A Promise that resolves after the focus events are fired and processed.
		 */
		oTable.qunit.focus = function(oElement) {
			var oEventListener;

			return new ExpiringPromise(0, function(resolve) {
				oEventListener = TableQUnitUtils.addEventListenerOnce(oElement, "focusin", function() {
					oHelperPlugin.whenFocusHandlingFinished().then(resolve);
				});
				oElement.focus();
			}).catch(function(oError) {
				if (oError instanceof TimeoutError) {
					// If the tab or browser are in the background, or the focus is in the dev tools, the are no focus events. To be able to continue
					// with the test execution, fake the focus events.
					oElement.dispatchEvent(TableQUnitUtils.createFocusEvent("focusin"));
					oElement.dispatchEvent(TableQUnitUtils.createFocusEvent("focus"));
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

		/**
		 * Adds a column that has test controls as template and label. Both template and label are text controls.
		 *
		 * @param {string|Object} [mConfig] A string that is set as the text of the template, or a config object. If no config is provided, the label
		 *                                  and template have empty texts.
		 * @param {string} [mConfig.text=undefined] The text of the template.
		 * @param {string} [mConfig.bind=false] Whether the text represents a binding path and the text property of the template should be bound.
		 *                                      The corresponding entry in the default test data is created if it does not yet exist.
		 * @param {string} [mConfig.focusable=false] Whether the text is focusable.
		 * @param {string} [mConfig.tabbable=false] Whether the text is tabbable.
		 * @param {string} [mConfig.label=undefined] The text of the label.
		 * @param {boolean} [mConfig.interactiveLabel=false] Whether the label should be interactive (focusable & tabbable).
		 * @returns {sap.ui.table.Column} The column that was added to the table.
		 * @see TableQUnitUtils.createTextColumn
		 */
		oTable.qunit.addTextColumn = function(mConfig) {
			var oColumn = TableQUnitUtils.createTextColumn(mConfig);
			oTable.addColumn(oColumn);
			return oColumn;
		};

		/**
		 * Adds a column that has interactive (focusable & tabbable) test controls as template and label. Both template and label are text controls.
		 *
		 * @param {string|Object} [mConfig] A string that is set as the text of the template, or a config object. If no config is provided, the label
		 *                                  and template have empty texts.
		 * @param {string} [mConfig.text=undefined] The text of the template.
		 * @param {string} [mConfig.bind=false] Whether the text represents a binding path and the text property of the template should be bound.
		 *                                      The corresponding entry in the default test data is created if it does not yet exist.
		 * @param {string} [mConfig.label=undefined] The text of the label.
		 * @returns {sap.ui.table.Column} The column that was added to the table.
		 * @see TableQUnitUtils.createInteractiveTextColumn
		 */
		oTable.qunit.addInteractiveTextColumn = function(mConfig) {
			var oColumn = TableQUnitUtils.createInteractiveTextColumn(mConfig);
			oTable.addColumn(oColumn);
			return oColumn;
		};

		/**
		 * Adds a column that has test controls as template and label. The template is an input control, and the label is a text control.
		 *
		 * @param {string|Object} [mConfig] A string that is set as the text of the template, or a config object. If no config is provided, the label
		 *                                  and template have empty texts.
		 * @param {string} [mConfig.text=undefined] The text of the template.
		 * @param {string} [mConfig.bind=false] Whether the text represents a binding path and the text property of the template should be bound.
		 *                                      The corresponding entry in the default test data is created if it does not yet exist.
		 * @param {string} [mConfig.type=text] The type of the input element.
		 * @param {string} [mConfig.tabbable=false] Whether the input is tabbable.
		 * @param {string} [mConfig.label=undefined] The text of the label.
		 * @param {boolean} [mConfig.interactiveLabel=false] Whether the label should be interactive (focusable & tabbable).
		 * @returns {sap.ui.table.Column} The column that was added to the table.
		 * @see TableQUnitUtils.createInputColumn
		 */
		oTable.qunit.addInputColumn = function(mConfig) {
			var oColumn = TableQUnitUtils.createInputColumn(mConfig);
			oTable.addColumn(oColumn);
			return oColumn;
		};

		/**
		 * A "touchstart" event is translated to a "mousedown" event by UI5. When the "mousedown" event is forwarded to the item navigation, it
		 * focuses the target element. When an element is focused, the browser scrolls it into the view. This method prevents this chain of events
		 * and is therefore useful when testing scrolling with touch events.
		 */
		oTable.qunit.preventFocusOnTouch = function() {
			oTable._getKeyboardExtension()._suspendItemNavigation();
		};
	}

	TableQUnitUtils.TestControl = TestControl;
	TableQUnitUtils.TestInputControl = TestInputControl;
	TableQUnitUtils.HeightTestControl = HeightTestControl;
	TableQUnitUtils.TimeoutError = TimeoutError;

	TableQUnitUtils.setDefaultSettings = function(mSettings) {
		mDefaultSettings = Object.assign({}, mSettings);
	};

	TableQUnitUtils.getDefaultSettings = function() {
		return Object.create(mDefaultSettings);
	};

	TableQUnitUtils.createTable = function(TableClass, mSettings, fnBeforePlaceAt) {
		if (typeof TableClass === "function" && TableClass !== Table && TableClass !== TreeTable && TableClass !== AnalyticalTable) {
			fnBeforePlaceAt = TableClass;
			TableClass = Table;
		} else if (typeof TableClass === "object") {
			fnBeforePlaceAt = mSettings;
			mSettings = TableClass;
			TableClass = Table;
		}
		mSettings = Object.assign({}, deepCloneSettings(mDefaultSettings), mSettings);
		TableClass = TableClass == null ? Table : TableClass;

		var oHelperPlugin = new HelperPlugin();

		if ("plugins" in mSettings) {
			mSettings.plugins.push(oHelperPlugin);
		} else {
			mSettings.plugins = [oHelperPlugin];
		}

		var oTable = new TableClass(createTableSettings(TableClass, mSettings));

		Object.defineProperty(oTable, "qunit", {
			value: {}
		});

		setExperimentalSettings(oTable, mSettings);
		addAsyncHelpers(oTable, oHelperPlugin);
		addHelpers(oTable);

		if (typeof fnBeforePlaceAt === "function") {
			fnBeforePlaceAt(oTable, mSettings);
		}

		var sContainerId;
		if (typeof mSettings.placeAt === "string") {
			sContainerId = mSettings.placeAt;
		} else if (mSettings.placeAt !== false) {
			sContainerId = "qunit-fixture";
		}

		if (sContainerId != null) {
			oTable.placeAt(sContainerId);
			sap.ui.getCore().applyChanges();
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

		for (var i = aData.length; i < iLength; i++) {
			var oNewEntry = Object.assign({children: [{}]}, oDataTemplate);

			for (var sKey in oNewEntry) {
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

		for (var i = 0; i < aData.length; i++) {
			aData[i][sProperty] = sProperty + "_" + i;
			aData[i].children[0][sProperty] = aData[i][sProperty] + "_child_0";
		}
	}

	/**
	 * Creates a column that has test controls as template and label. Both template and label are text controls.
	 *
	 * @param {string|Object} [mConfig] A string that is set as the text of the template, or a config object. If no config is provided, the label
	 *                                  and template have empty texts.
	 * @param {string} [mConfig.text=undefined] The text of the template.
	 * @param {string} [mConfig.bind=false] Whether the text represents a binding path and the text property of the template should be bound.
	 *                                      The corresponding entry in the default test data is created if it does not yet exist.
	 * @param {string} [mConfig.focusable=false] Whether the text is focusable.
	 * @param {string} [mConfig.tabbable=false] Whether the text is tabbable.
	 * @param {string} [mConfig.label=undefined] The text of the label.
	 * @param {boolean} [mConfig.interactiveLabel=false] Whether the label should be interactive (focusable & tabbable).
	 * @returns {sap.ui.table.Column} The column.
	 */
	TableQUnitUtils.createTextColumn = function(mConfig) {
		if (typeof mSettings === "string") {
			mConfig = {text: mConfig};
		}

		mConfig = Object.assign({}, mConfig);

		var oColumn = new Column({
			label: new TestControl({
				text: mConfig.label,
				focusable: mConfig.interactiveLabel === true,
				tabbable: mConfig.interactiveLabel === true
			}),
			template: new TestControl({
				text: mConfig.bind === true ? "{" + mConfig.text + "}" : mConfig.text,
				focusable: mConfig.focusable === true,
				tabbable: mConfig.tabbable === true
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
	 * @param {string} [mConfig.text=undefined] The text of the template.
	 * @param {string} [mConfig.bind=false] Whether the text represents a binding path and the text property of the template should be bound.
	 *                                      The corresponding entry in the default test data is created if it does not yet exist.
	 * @param {string} [mConfig.label=undefined] The text of the label.
	 * @returns {sap.ui.table.Column} The column.
	 */
	TableQUnitUtils.createInteractiveTextColumn = function(mConfig) {
		mConfig = Object.assign({}, mConfig);
		return TableQUnitUtils.createTextColumn({
			text: mConfig.text,
			bind: mConfig.bind,
			focusable: true,
			tabbable: true,
			label: mConfig.label,
			interactiveLabel: true
		});
	};

	/**
	 * Creates a column that has test controls as template and label. The template is an input control, and the label is a text control.
	 *
	 * @param {string|Object} [mConfig] A string that is set as the text of the template, or a config object. If no config is provided, the label
	 *                                  and template have empty texts.
	 * @param {string} [mConfig.text=undefined] The text of the template.
	 * @param {string} [mConfig.bind=false] Whether the text represents a binding path and the text property of the template should be bound.
	 *                                      The corresponding entry in the default test data is created if it does not yet exist.
	 * @param {string} [mConfig.type=text] The type of the input element.
	 * @param {string} [mConfig.tabbable=false] Whether the input is tabbable.
	 * @param {string} [mConfig.label=undefined] The text of the label.
	 * @param {boolean} [mConfig.interactiveLabel=false] Whether the label should be interactive (focusable & tabbable).
	 * @returns {sap.ui.table.Column} The column.
	 */
	TableQUnitUtils.createInputColumn = function(mConfig) {
		if (typeof mSettings === "string") {
			mConfig = {text: mConfig};
		}

		mConfig = Object.assign({}, mConfig);

		var oColumn = new Column({
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
	 * Adds a delegate that listens to an event of an element once. The delegate is removed after the event.
	 *
	 * @param {sap.ui.core.Element} oElement The element to add the delegate to.
	 * @param {string} sEventName The name of the event.
	 * @param {Function} fnHandler The event handler.
	 * @param {boolean} [bCallBefore=false] Whether the listener is called before the listener of the element.
	 * @return {{remove: Function}} An object providing methods, for example to remove the delegate before it is called.
	 */
	TableQUnitUtils.addDelegateOnce = function(oElement, sEventName, fnHandler, bCallBefore) {
		var oDelegate = {};

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
	 * Changes the text direction.
	 *
	 * @param {boolean} bRTL Whether to set the direction to RTL. If <code>false</code>, the direction is set to LTR.
	 * @return {Promise} A Promise that resolves after text direction is changed.
	 */
	TableQUnitUtils.changeTextDirection = function(bRTL) {
		sap.ui.getCore().getConfiguration().setRTL(bRTL);
		sap.ui.getCore().applyChanges();

		// Give the text direction change enough time, otherwise the UI might not be ready when the tests start.
		return TableQUnitUtils.wait(1000).then(TableQUnitUtils.wait);
	};

	/**
	 * Wrapper around {@link #changeTextDirection} for easier promise chaining. Returns a function that returns a promise.
	 *
	 * @param {boolean} bRTL Whether to set the direction to RTL. If <code>false</code>, the direction is set to LTR.
	 * @returns {function(): Promise} Wrapper function.
	 */
	TableQUnitUtils.$changeTextDirection = function(bRTL) {
		return function() {
			return TableQUnitUtils.changeTextDirection(bRTL);
		};
	};

	/**
	 * Creates a focus event object.
	 *
	 * @param {string} sFocusEventType The focus event type.
	 * @returns {FocusEvent} The focus event object.
	 */
	TableQUnitUtils.createFocusEvent = function(sFocusEventType) {
		var oFocusEvent;

		if (typeof FocusEvent === "function") {
			oFocusEvent = new FocusEvent(sFocusEventType);
		} else { // IE
			oFocusEvent = document.createEvent("FocusEvent");
			oFocusEvent.initFocusEvent(sFocusEventType, true, false);
		}

		return oFocusEvent;
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
		var sTestTitle = sTitle == null ? "" : sTitle + ": ";

		assert.equal(oTable.getDomRef().classList.contains("sapUiTableEmpty"), bVisible, sTestTitle + "NoData visible");

		if (!bVisible) {
			// If the NoData element is not visible, the table must have focusable elements (cells).
			assert.ok(oTable.qunit.getDataCell(0, 0), sTestTitle + "If 'NoData' is not visible, rows are rendered");
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
		var oFixedTopRowContainer = oTable.getDomRef("table-fixrow");
		var oScrollableRowContainer = oTable.getDomRef("table");
		var oFixedBottomRowContainer = oTable.getDomRef("table-fixrow-bottom");
		var iFixedTopRowCount = oFixedTopRowContainer ? oFixedTopRowContainer.querySelectorAll(".sapUiTableRow").length : 0;
		var iScrollableTopRowCount = oScrollableRowContainer ? oScrollableRowContainer.querySelectorAll(".sapUiTableRow").length : 0;
		var iFixedBottomRowCount = oFixedBottomRowContainer ? oFixedBottomRowContainer.querySelectorAll(".sapUiTableRow").length : 0;

		assert.equal(iFixedTopRowCount, iFixedTop, "Fixed top row count");
		assert.equal(iScrollableTopRowCount, iScrollable, "Scrollable row count");
		assert.equal(iFixedBottomRowCount, iFixedBottom, "Fixed bottom row count");
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
		var oOuterElement;

		if (typeof assert === "string") {
			sId = assert;
		}

		sId = sId || "outerelement";
		oOuterElement = document.getElementById(sId);
		oOuterElement.focus();

		// IE does not support Element.closest
		if (oOuterElement.closest && oOuterElement.closest(".sapUiTable")) {
			throw new Error("Element with id '" + sId + "' is inside a table");
		}

		if (assert) {
			assert.deepEqual(oOuterElement, document.activeElement, "Outer element with id '" + sId + "' focused");
		}

		return oOuterElement;
	};

	/***********************************
	 * Legacy utils                    *
	 ***********************************/

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
				visible: true,
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
							visible: j != 3,
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

		var oCell = oTableInstance.getDomRef("rows-row" + iRow + "-col" + iCol);
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

		var oCell = oTableInstance._getVisibleColumns()[iCol].getDomRef();
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

		var oCell = oTableInstance.getDomRef("rowsel" + iRow);
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

		var oCell = oTableInstance.getDomRef("rowact" + iRow);
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

		var oCell = oTableInstance.getDomRef("selall");
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
		var $ActiveElement = jQuery(document.activeElement);
		var $Element = jQuery(oElement);

		assert.deepEqual(document.activeElement, $Element[0], "Focus is on: " + $ActiveElement.attr("id") + ", should be on: " + $Element.attr("id"));

		return $ActiveElement;
	};

	function getRowDomRefs(oTableInstance, iRow) {
		return {
			row: oTableInstance.$("rows-row" + iRow),
			fixed: oTableInstance.$("rows-row" + iRow + "-fixed"),
			hdr: oTableInstance.$("rowsel" + iRow).parent(),
			act: oTableInstance.$("rowact" + iRow).parent()
		};
	}

	window.fakeGroupRow = function(iRow, oTableInstance) {
		if (!oTableInstance) {
			oTableInstance = oTable;
		}

		var oRow = oTableInstance.getRows()[iRow];

		oTable._mode = "Group";
		oRow.getType = function() {return oRow.Type.GroupHeader;};
		oRow.getLevel = function() {return 1;};
		oRow.isExpandable = function() {return true;};
		oRow.isExpanded = function() {return true;};
		oRow.isContentHidden = function() {return true;};

		oTableInstance.rerender();
		return new Promise(function(resolve) {
			oTable.attachEventOnce("rowsUpdated", function() {
				resolve(getRowDomRefs(oTableInstance, iRow));
			});
		});
	};

	window.fakeSumRow = function(iRow, oTableInstance) {
		if (!oTableInstance) {
			oTableInstance = oTable;
		}

		var oRow = oTableInstance.getRows()[iRow];

		oTable._mode = "Tree";
		oRow.getType = function() {return oRow.Type.Summary;};
		oRow.getLevel = function() {return 1;};

		oTableInstance.rerender();
		return new Promise(function(resolve) {
			oTable.attachEventOnce("rowsUpdated", function() {
				resolve(getRowDomRefs(oTableInstance, iRow));
			});
		});
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