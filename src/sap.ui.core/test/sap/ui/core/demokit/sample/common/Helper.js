/*!
 * ${copyright}
 */

sap.ui.define("sap/ui/core/sample/common/Helper", [
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/ui/test/Opa5",
	"sap/ui/test/actions/EnterText",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Interactable",
	"sap/ui/test/TestUtils"
], function (Log, Localization, Opa5, EnterText, Press, Interactable, TestUtils) {
	"use strict";
	var aCleanupTasks = [],
		Helper;

	/**
	 * Checks the value/text of a sap.m.Input/.Text field
	 *
	 * @param {sap.ui.test.Opa5} oOpa5
	 *  An instance of Opa5 to access the current page object
	 * @param {string} sViewName
	 *  The name of the view which contains the searched control
	 * @param {boolean} bText
	 *  Whether the type of the control is "sap.m.Text", otherwise it is "sap.m.Input"
	 * @param {string} sId
	 *  The ID of a "sap.m.Input" or "sap.m.Text"  control inside the view sViewName
	 * @param {string} sValue
	 *  The external value of the control as a string
	 * @param {number} [iRow]
	 *  The row number (zero based) of the control if the control is within a collection
	 * @param {boolean} bSearchOpenDialogs
	 *  If set to true, Opa5 will only search in open dialogs
	 * @param {boolean} bEnabled
	 *  If set to false, Opa5 will look for both enabled and disabled controls.
	 */
	function checkControlValue(oOpa5, sViewName, bText, sId, sValue, iRow, bSearchOpenDialogs,
			bEnabled) {
		oOpa5.waitFor({
			controlType : bText ? "sap.m.Text" : "sap.m.Input",
			id : sId,
			matchers : iRow === undefined ? undefined : function (oControl) {
				return oControl.getBindingContext().getIndex() === iRow;
			},
			enabled : bEnabled,
			searchOpenDialogs : bSearchOpenDialogs,
			success : function (vControls) {
				var oControl = iRow === undefined ? vControls : vControls[0],
					sActual = bText ? oControl.getText() : oControl.getValue();

				Opa5.assert.ok(iRow === undefined || vControls.length === 1);
				Opa5.assert.strictEqual(sActual, sValue, "Control: " + sId + " Value is: "
					+ sActual);
			},
			viewName : sViewName
		});
	}

	/**
	 * Compares the IDs of two different controls lexicographically.
	 *
	 * @param {sap.ui.core.Control} oControl1 - The first control
	 * @param {sap.ui.core.Control} oControl2 - The second control
	 * @returns {number}
	 *   <code>-1</code> if the ID of the first control is lexicographically smaller than the ID
	 *   of the second control; <code>1</code> otherwise.
	 */
	function compareByID(oControl1, oControl2) {
		return oControl1.getId() < oControl2.getId() ? -1 : 1;
	}

	// Helper functions used within sap.ui.core.sample.common namespace
	Helper = {
		/**
		 * Adds a clean-up task which is called in <code>afterEach</code>.
		 *
		 * @param {function():void} fnTask - The task
		 */
		addToCleanUp : function (fnTask) {
			aCleanupTasks.push(fnTask);
		},

		/**
		 * Changes the value of a sap.m.Input field
		 *
		 * @param {sap.ui.test.Opa5} oOpa5
		 *  An instance of Opa5 to access the current page object
		 * @param {string} sViewName
		 *  The name of the view which contains the searched control
		 * @param {string} sId
		 *  The ID of a "sap.m.Input" control inside the view sViewName
		 * @param {string} sValue
		 *  The external value of the control as a string
		 * @param {number} [iRow]
		 *  The row number (zero based) of the control if the control is within a collection
		 * @param {boolean} [bSearchOpenDialogs]
		 *  If set to true, Opa5 will only search in open dialogs
		 */
		changeInputValue : function (oOpa5, sViewName, sId, sValue, iRow, bSearchOpenDialogs) {
			oOpa5.waitFor({
				actions : new EnterText({clearTextFirst : true, text : sValue}),
				controlType : "sap.m.Input",
				id : sId,
				matchers : iRow === undefined ? undefined : function (oControl) {
					return oControl.getBindingContext().getIndex() === iRow;
				},
				searchOpenDialogs : bSearchOpenDialogs,
				success : function (vControls) {
					var oInput = iRow === undefined ? vControls : vControls[0];

					Opa5.assert.ok(iRow === undefined || vControls.length === 1);
					Opa5.assert.strictEqual(oInput.getValue(), sValue, "Row: " + iRow + " " + sId
						+ ": Input value set to " + sValue);
				},
				viewName : sViewName
			});
		},

		/**
		 * Changes the value of a sap.m.StepInput field
		 *
		 * @param {sap.ui.test.Opa5} oOpa5
		 *  An instance of Opa5 to access the current page object
		 * @param {string} sViewName
		 *  The name of the view which contains the searched control
		 * @param {string} sId
		 *  The ID of a "sap.m.StepInput" control inside the view sViewName
		 * @param {string} sValue
		 *  The entered value of the control as a string
		 * @param {string} [sExpectedValue=sValue]
		 *  The expected value after entering, for example if <code>sValue</code> contains decimals
		 *  and the control's 'displayValuePrecision' property, or the binding's data type
		 *  constraint 'scale' is 0 then the expected new value should be the largest integer less
		 *  than or equal to <code>sValue<sValue>
		 * @param {boolean} bSearchOpenDialogs
		 *  If set to true, Opa5 will only search in open dialogs
		 */
		changeStepInputValue : function (oOpa5, sViewName, sId, sValue, sExpectedValue = sValue,
				bSearchOpenDialogs = false) {
			// The StepInput control behaves different than e.g. Input: Changing and checking of the
			// new value have to be done via separate waitFor(...) promises, e.g. the check for the
			// value would fail if it is done in the success function of the first waitFor.
			oOpa5.waitFor({
				actions : new EnterText({clearTextFirst : true, text : sValue}),
				controlType : "sap.m.StepInput",
				id : sId,
				searchOpenDialogs : bSearchOpenDialogs,
				viewName : sViewName
			});
			oOpa5.waitFor({
				controlType : "sap.m.StepInput",
				id : sId,
				searchOpenDialogs : bSearchOpenDialogs,
				success : function (oControl) {
					Opa5.assert.strictEqual(oControl.getValue().toString(), sExpectedValue,
						"Control: " + sId + " Value is: " + sExpectedValue);
				},
				viewName : sViewName
			});
		},

		/**
		 * Checks if a sap.m.Button is disabled.
		 *
		 * @param {sap.ui.test.Opa5} oOpa5
		 *  An instance of Opa5 to access the current page object
		 * @param {string} sViewName
		 *  The name of the view which contains the searched control
		 * @param {string} sButtonId
		 *  The ID of a "sap.m.Button" control inside the view sViewName
		 */
		checkButtonDisabled : function (oOpa5, sViewName, sButtonId) {
			oOpa5.waitFor({
				autoWait : false,
				controlType : "sap.m.Button",
				id : sButtonId,
				success : function (oButton) {
					Opa5.assert.ok(oButton.getEnabled() === false,
						"Button is disabled: " + sButtonId);
				},
				viewName : sViewName
			});
		},

		/**
		 * Checks if a sap.m.Button is enabled.
		 *
		 * @param {sap.ui.test.Opa5} oOpa5
		 *  An instance of Opa5 to access the current page object
		 * @param {string} sViewName
		 *  The name of the view which contains the searched control
		 * @param {string} sButtonId
		 *  The ID of a "sap.m.Button" control inside the view sViewName
		 */
		checkButtonEnabled : function (oOpa5, sViewName, sButtonId) {
			oOpa5.waitFor({
				controlType : "sap.m.Button",
				id : sButtonId,
				matchers : new Interactable(),
				success : function (oButton) {
					Opa5.assert.ok(oButton.getEnabled(), "Button is enabled: " + sButtonId);
				},
				viewName : sViewName
			});
		},

		/**
		 * Checks if a sap.m.Input is dirty or not.
		 *
		 * @param {sap.ui.test.Opa5} oOpa5
		 *  An instance of Opa5 to access the current page object
		 * @param {string} sViewName
		 *  The name of the view which contains the searched control
		 * @param {string} sId
		 *  The ID of a "sap.m.Input" control inside the view sViewName
		 * @param {string} bIsDirty
		 *  Whether the control is expected dirty or not
		 */
		checkInputIsDirty : function (oOpa5, sViewName, sId, bIsDirty) {
			oOpa5.waitFor({
				controlType : "sap.m.Input",
				id : sId,
				success : function (oControl) {
					Opa5.assert.strictEqual(
						oControl.getBinding("value").getDataState().isControlDirty(),
						bIsDirty, "Control: " + sId + " is " + (bIsDirty ? "dirty" : "clean"));
				},
				viewName : sViewName
			});
		},

		/**
		 * Checks whether a sap.m.Input control has an expected value.
		 *
		 * @param {sap.ui.test.Opa5} oOpa5
		 *  An instance of Opa5 to access the current page object
		 * @param {string} sViewName
		 *  The name of the view which contains the searched control
		 * @param {string} sId
		 *  The ID of a "sap.m.Input" control inside the view sViewName
		 * @param {string} vValue
		 *  The expected value of the control
		 * @param {number} [iRow]
		 *  The row number (zero based) of the control if the control is within a collection
		 * @param {boolean} [bSearchOpenDialogs]
		 *  Whether Opa5 will only search for controls in open dialogs
		 * @param {boolean} bEnabled
		 *  If set to false, Opa5 will look for both enabled and disabled controls.
		 */
		checkInputValue : function (oOpa5, sViewName, sId, vValue, iRow, bSearchOpenDialogs,
				bEnabled) {
			checkControlValue(oOpa5, sViewName, false, sId, vValue, iRow, bSearchOpenDialogs,
				bEnabled);
		},

		/**
		 * Checks the text of the 'More' button for a sap.m.Table.
		 *
		 * @param {sap.m.Button} oMore - The 'More' button
		 * @param {string} sExpectedCount - The expected count as text w/o "More" without spaces,
		 *    e.g. "[5/10]"
		 */
		checkMoreButtonCount : function (oMore, sExpectedCount) {
			Opa5.assert.strictEqual(oMore.getDomRef().innerText.replace(/\s/g, ""),
				"More" + sExpectedCount, "'More' button has text " + sExpectedCount);
		},

		/**
		 * Checks whether a sap.m.Text control has an expected text.
		 *
		 * @param {sap.ui.test.Opa5} oOpa5
		 *  An instance of Opa5 to access the current page object
		 * @param {string} sViewName
		 *  The name of the view which contains the searched control
		 * @param {string} sId
		 *  The ID of a "sap.m.Text" control inside the view sViewName
		 * @param {string} sText
		 *  The expected text of the control
		 * @param {number} [iRow]
		 *  The row number (zero based) of the control if the control is within a collection
		 * @param {boolean} [bSearchOpenDialogs]
		 *  Whether Opa5 will only search for controls in open dialogs
		 */
		checkTextValue : function (oOpa5, sViewName, sId, sText, iRow, bSearchOpenDialogs) {
			checkControlValue(oOpa5, sViewName, true, sId, sText, iRow, bSearchOpenDialogs);
		},

		/**
		 * Checks whether a control has an expected value state and (optional) value state text.
		 *
		 * @param {sap.ui.test.Opa5} oOpa5
		 *  An instance of Opa5 to access the current page object
		 * @param {string} sViewName
		 *  The name of the view which contains the searched control
		 * @param {string|RegExp} sID
		 *  The ID of a control inside the view sViewName, may be a regular expression
		 * @param {sap.ui.core.ValueState} sValueState
		 *  The expected value state of the control
		 * @param {string} [sValueStateText]
		 *  The expected value state text of the control, if supplied
		 * @param {boolean} [bSearchOpenDialogs]
		 *  Whether Opa5 will only search for controls in open dialogs
		 * @param {number} [iRow]
		 *  The row number (zero based) of the control if the control is within a collection
		 */
		checkValueState : function (oOpa5, sViewName, sID, sValueState, sValueStateText,
				bSearchOpenDialogs, iRow) {
			oOpa5.waitFor({
				id : sID,
				matchers : iRow === undefined ? undefined : function (oControl) {
					return oControl.getBindingContext().getIndex() === iRow;
				},
				searchOpenDialogs : bSearchOpenDialogs,
				success : function (vControls) {
					// vControl is an array only if iRow is supplied
					var oControl = iRow === undefined ? vControls : vControls[0];

					Opa5.assert.ok(iRow === undefined || vControls.length === 1);
					Opa5.assert.strictEqual(oControl.getValueState(), sValueState,
						"Control: " + oControl.getId() + " has valueState: " + sValueState);
					if (sValueStateText !== undefined) {
						Opa5.assert.strictEqual(oControl.getValueStateText(), sValueStateText,
							"Control: " + oControl.getId() + " has valueStateText: "
							+ sValueStateText);
					}
				},
				viewName : sViewName
			});
		},

		/**
		 * Decides whether given log is related to OData V4 topic and has a log level which is at
		 * least WARNING
		 *
		 * @param {object} oLog
		 *  A single log entry returned by {@link sap.ui.base.Log.getLogEntries}
		 * @returns {boolean}
		 *  Whether the log matches to the criterias above or not
		 */
		isRelevantLog : function (oLog) {
			var sComponent = oLog.component || "";

			return oLog.level <= Log.Level.WARNING
				&& (sComponent.indexOf("sap.ui.base.BindingParser") === 0
					|| sComponent.indexOf("sap.ui.base.ExpressionParser") === 0
					|| sComponent.indexOf("sap.ui.core.sample.") === 0
					|| sComponent.indexOf("sap.ui.core.util.XMLPreprocessor") === 0
					|| sComponent.indexOf("sap.ui.model.odata.AnnotationHelper") === 0
					|| sComponent.indexOf("sap.ui.model.odata.ODataMetaModel") === 0
					|| sComponent.indexOf("sap.ui.model.odata.type.") === 0
					|| sComponent.indexOf("sap.ui.model.odata.v4.") === 0
					|| sComponent.indexOf("sap.ui.test.TestUtils") === 0);
		},

		/**
		 * Invokes the Press() action on a "sap.m.Button" and adds a useful success message
		 *
		 * @param {sap.ui.test.Opa5} oOpa5
		 *  An instance of Opa5 to access the current page object
		 * @param {string} sViewName
		 *  The name of the view which contains the searched control
		 * @param {string} sId
		 *  The ID of a "sap.m.Button" control inside the view sViewName
		 * @param {boolean} bSearchOpenDialogs
		 *  If set to true, Opa5 will only search in open dialogs
		 */
		pressButton : function (oOpa5, sViewName, sId, bSearchOpenDialogs) {
			oOpa5.waitFor({
				actions : new Press(),
				controlType : "sap.m.Button",
				id : sId,
				searchOpenDialogs : bSearchOpenDialogs,
				success : function (oButton) {
					var sText = oButton.getTooltip() || oButton.getText() || sId;

					Opa5.assert.ok(true, "Button pressed: " + sText);
				},
				viewName : sViewName
			});
		},

		/**
		 * Invokes the Press() action on the (one and only) sap.m.CustomListItem in the view
		 *
		 * @param {sap.ui.test.Opa5} oOpa5
		 *  An instance of Opa5 to access the current page object
		 * @param {string} sViewName
		 *  The name of the view which contains the more button as a sap.m.CustomListItem
		 * @param {string} sTableControlId
		 *  The ID of the table control containing the 'More' button
		 */
		pressMoreButton : function (oOpa5, sViewName, sTableControlId) {
			oOpa5.waitFor({
				actions : new Press(),
				controlType : "sap.m.CustomListItem",
				id : new RegExp(sTableControlId + "-trigger"),
				success : function (aControls) {
					Opa5.assert.strictEqual(aControls.length, 1, "Multiple 'More' buttons found");
					Opa5.assert.ok(true, "Pressed 'More' button: " + aControls[0].getId());
				},
				viewName : sViewName
			});
		},

		/**
		 * Selects the sap.m.ColumnListItem with the given <iIndex> in the view.
		 *
		 * Note: Works only within views with not more than one sap.m.Table
		 *
		 * @param {sap.ui.test.Opa5} oOpa5
		 *  An instance of Opa5 to access the current page object
		 * @param {string} sViewName
		 *  The name of the view containing the collection of column list items
		 * @param {number} iIndex
		 *  The zero based index of the column list item within its collection
		 */
		selectColumnListItem : function (oOpa5, sViewName, iIndex) {
			oOpa5.waitFor({
				actions : new Press(),
				controlType : "sap.m.ColumnListItem",
				errorMessage : "Item: " + iIndex + " not found",
				matchers : function (oControl) {
					return oControl.getBindingContext().getIndex() === iIndex;
				},
				success : function (aControls) {
					Opa5.assert.ok(true, "Selected item: " + aControls[0].getBindingContext());
				},
				viewName : sViewName
			});
		},

		/**
		 * Waits for several controls and sorts the resulting controls by their IDs before the
		 * success handler is called, see {@link sap.ui.test.Opa5#waitFor}.
		 *
		 * @param {sap.ui.test.Opa5} oOpa5
		 *   An instance of Opa5 to access the current page object
		 * @param {object} options
		 *   The options containing the success callback, see {@link sap.ui.test.Opa5#waitFor}
		 */
		waitForSortedByID : function (oOpa5, options) {
			var fnSuccess = options.success;

			options.success = function (aControls) {
				aControls.sort(compareByID);
				fnSuccess(aControls);
			};

			oOpa5.waitFor(options);
		},

		/**
		 * Invokes QUnit.module() with the given <code>sName</code>.
		 * Sets the language fix to "en-US" and restores back to the language before.
		 * For a given <code>iTestTimeout</code) and TestUtils.isRealOData() === true
		 * the QUnit.config.testTimeout for a single QUnit.test within this module is set to
		 * <code>iTestTimeOut * 1000</code>.
		 *
		 * @param {string} sName
		 *  The QUnit module name
		 * @param {number} [iTestTimeout]
		 *  The desired timeout in seconds for one QUnit.test() within the current QUnit module.
		 * @param {function} [fnBeforeEach] - Runs before each test
		 * @param {function} [fnAfterEach] - Runs after each test
		 */
		qUnitModule : function (sName, iTestTimeout, fnBeforeEach, fnAfterEach) {
			var sDefaultLanguage = Localization.getLanguage(),
				iTimeoutBefore,
				bSetTimeout = TestUtils.isRealOData() && iTestTimeout;

			QUnit.module(sName, {
				before : function () {
					Localization.setLanguage("en-US");
					if (bSetTimeout) {
						iTimeoutBefore = QUnit.config.testTimeout;
						QUnit.config.testTimeout = iTestTimeout * 1000;
					}
				},
				after : function () {
					Localization.setLanguage(sDefaultLanguage);
					if (bSetTimeout) {
						QUnit.config.testTimeout = iTimeoutBefore;
					}
				},
				beforeEach : fnBeforeEach,
				afterEach : function () {
					aCleanupTasks.forEach((fnTask) => { fnTask(); });
					aCleanupTasks.length = 0;
					return fnAfterEach && fnAfterEach.apply(this, arguments);
				}
			});
		}
	};

	return Helper;
}, /* bExport= */ true);
