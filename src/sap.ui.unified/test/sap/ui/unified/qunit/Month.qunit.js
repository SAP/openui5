/*global QUnit */

sap.ui.define([
	"sap/ui/unified/calendar/Month",
	"sap/ui/unified/calendar/CalendarDate",
	"sap/ui/unified/CalendarLegend",
	"sap/ui/unified/CalendarLegendItem",
	"sap/m/Button",
	"sap/ui/unified/DateRange",
	"sap/ui/unified/DateTypeRange",
	"sap/ui/core/CalendarType",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/delegate/ItemNavigation",
	"sap/ui/unified/library",
	"sap/ui/events/KeyCodes",
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Core"
], function(Month, CalendarDate, CalendarLegend,
	CalendarLegendItem, Button, DateRange, DateTypeRange, CalendarType, InvisibleText, ItemNavigation, unifiedLibrary, KeyCodes, Device, jQuery, oCore) {
	"use strict";

	(function () {

		var CalendarDayType = unifiedLibrary.CalendarDayType;
		/**
		 * Generate correct Date even for years before 1901
		 * @param {int} iYear [0..9999] Full Year
		 * @param {int} iMonth [0..11] Zero based month index
		 * @param {int} iDay [1..31] Day of the month
		 * @param [bUTC=false] {boolean} Should the returned date be a UTC date
		 * @returns {Date} Date
		 */
		var createDate = function (iYear, iMonth, iDay, bUTC) {
			var oDate;
			// Note setFullYear/setUTCFullYear needed to explicitly switch to years before 1901 which is not supported with the constructor
			// or with the deprecated setYear setter
			if (bUTC) {
				oDate = new Date(Date.UTC(iYear, iMonth, iDay));
				oDate.setUTCFullYear(iYear);
			} else {
				oDate = new Date(iYear, iMonth, iDay);
				oDate.setFullYear(iYear);
			}
			return oDate;
		};

		/**
		 * Generate correct Date even for years before 1901
		 * @param {int} iYear [0..9999] Full Year
		 * @param {int} iMonth [0..11] Zero based month index
		 * @param {int} iDay [1..31] Day of the month
		 * @param [bUTC=false] {boolean} Should the returned date be a UTC date
		 * @returns {sap.ui.unified.calendar.CalendarDate} Date
		 */
		var createCalendarDate = function (iYear, iMonth, iDay, bUTC) {
			var oCalDate;
			// Note setFullYear/setUTCFullYear needed to explicitly switch to years before 1901 which is not supported with the constructor
			// or with the deprecated setYear setter
			if (bUTC) {
				oCalDate = new CalendarDate(iYear, iMonth, iDay);
			} else {
				oCalDate = CalendarDate.fromLocalJSDate(new Date(iYear, iMonth, iDay));
			}
			return oCalDate;
		};

		QUnit.module("Rendering", {
			beforeEach: function () {
				this.oM = new Month().placeAt("qunit-fixture");
				oCore.applyChanges();
			},
			afterEach: function () {
				this.oM.destroy();
				this.oM = null;
			}
		});

		QUnit.test("Control is rendered", function (assert) {
			// Assert
			assert.ok(this.oM.getDomRef(), "Control is rendered");
		});

		QUnit.test("Corner case for January 0001", function (assert) {
			// Act
			this.oM.setDate(createDate(1, 0, 1));
			oCore.applyChanges();

			var aItems = this.oM.$().find(".sapUiCalItem"),
				$FirstDay = jQuery(aItems[0]);

			// Assert
			assert.strictEqual($FirstDay.hasClass("sapUiCalItemDsbl"), true, "The day from year 0000 should be disabled");
			assert.strictEqual($FirstDay.find(".sapUiCalItemText").text(), "", "The day from year 0000 should not have a visible text");
		});

		QUnit.test("Corner case for December 9999", function (assert) {
			// Act
			var oMonth = new Month({
			}).placeAt("qunit-fixture");
			oCore.applyChanges();

			oMonth.setDate(createDate(9999, 11, 1));
			oCore.applyChanges();

			var aItems = oMonth.$().find(".sapUiCalItem"),
				$LastDay = jQuery(aItems[aItems.length - 1]);

			// Assert
			assert.strictEqual($LastDay.data("sap-day"), 99991231, "The last rendered day should be 9999-12-31");
			assert.strictEqual($LastDay.text(), "31", "The last rendered day should contain the string 31");

			// Clean
			oMonth.destroy();
		});

		QUnit.module("_getVisibleDays", {
			beforeEach: function () {
				this.oM = new Month();
			},
			afterEach: function () {
				this.oM.destroy();
				this.oM = null;
			},
			/**
			 * Assert the date range returned for rendering from the method.
			 * @param {sap.ui.unified.calendar.CalendarDate} oFocusDate The first day of the target month.
			 * @param {sap.ui.unified.calendar.CalendarDate} oFirstVisibleDate Expected first visible day.
			 * @param {sap.ui.unified.calendar.CalendarDate} oLastVisibleDate Expected last visible day.
			 * @param {int} iVisibleDays Expected visible days.
			 * @param {string} sTargetMonthName Name of the target month used for test description.
			 * @param {boolean} [bForRendering=false] should days before 0001-01-01 be included in the returned array.
			 */
			assertByDate: function (oFocusDate, oFirstVisibleDate, oLastVisibleDate, iVisibleDays, sTargetMonthName, bForRendering, assert) {
				var aDays = this.oM._getVisibleDays(oFocusDate, bForRendering),
					sExpectedFirstDay = oFirstVisibleDate.toString(),
					sExpectedLastDay = oLastVisibleDate.toString();

				// Assert
				assert.strictEqual(aDays[0].toString(), sExpectedFirstDay,
					"For " + sTargetMonthName + " the first day should be: " + sExpectedFirstDay);
				assert.strictEqual(aDays[aDays.length - 1].toString(), sExpectedLastDay,
					"For " + sTargetMonthName + " the last day should be: " + sExpectedLastDay);
				assert.strictEqual(aDays.length, iVisibleDays, "There should be " + iVisibleDays + " returned.");
			}
		});

		QUnit.test("Days in front and in back of the month should be added", function (assert) {
			this.assertByDate(
				createCalendarDate(2016, 10, 1, true),
				createCalendarDate(2016, 9, 30, true),
				createCalendarDate(2016, 11, 3, true),
				35,
				"November 2016",
				false,
				assert
			);
		});

		QUnit.test("Days in front of the month should be added", function (assert) {
			this.assertByDate(
				createCalendarDate(2016, 11, 1, true),
				createCalendarDate(2016, 10, 27, true),
				createCalendarDate(2016, 11, 31, true),
				35,
				"December 2016",
				false,
				assert
			);
		});

		QUnit.test("Days in back of the month should be added", function (assert) {
			this.assertByDate(
				createCalendarDate(2017, 0, 1, true),
				createCalendarDate(2017, 0, 1, true),
				createCalendarDate(2017, 1, 4, true),
				35,
				"January 2017",
				false,
				assert
			);
		});

		QUnit.test("Only days corresponding to the current month", function (assert) {
			this.assertByDate(
				createCalendarDate(2015, 1, 1, true),
				createCalendarDate(2015, 1, 1, true),
				createCalendarDate(2015, 1, 28, true),
				28,
				"February 2015",
				false,
				assert
			);
		});

		QUnit.test("Corner case for January year 0001", function (assert) {
			this.assertByDate(
				createCalendarDate(1, 0, 1, true),
				createCalendarDate(1, 0, 1, true),
				createCalendarDate(1, 1, 3, true),
				34,
				"January 0001",
				false,
				assert
			);
		});

		QUnit.test("Corner case for January year 0001 called with parameter for rendering", function (assert) {
			this.assertByDate(
				createCalendarDate(1, 0, 1, true),
				createCalendarDate(0, 11, 31, true),
				createCalendarDate(1, 1, 3, true),
				35,
				"January 0001",
				true,
				assert
			);
		});

		QUnit.test("Corner case December year 9999 there should be no day returned from year 10000", function (assert) {
			this.assertByDate(
				createCalendarDate(9999, 11, 1, true),
				createCalendarDate(9999, 10, 28, true),
				createCalendarDate(9999, 11, 31, true),
				34,
				"December 2015",
				false,
				assert
			);
		});

		QUnit.module("Rendering", {
			beforeEach: function () {
				this.oM = new Month().placeAt("qunit-fixture");
				oCore.applyChanges();
			},
			afterEach: function () {
				this.oM.destroy();
				this.oM = null;
			}
		});

		QUnit.test("Adding special date should not move the focus to the month control", function (oAssert) {
			// Arrange
			var fnDone = oAssert.async(), // Async test
				oSpecialDate = new DateTypeRange({
					type: CalendarDayType.Type01,
					startDate: createDate(2017, 1, 20)
				}),
				oButton = new Button({text: "Btn"}).placeAt("qunit-fixture");

			this.oM.setDate(createDate(2017, 1, 1));
			oCore.applyChanges();

			// Act - focus the button control and add a special date to the month
			oButton.focus();
			this.oM.addSpecialDate(oSpecialDate);

			// Assert
			setTimeout(function () {
				var $Focus = jQuery(document.activeElement);

				if ($Focus.length === 0) {
					oAssert.ok(false, "The focus should be on the browser tab on which this " +
						"QUnit is executed. If not the test will fail!");
					fnDone(); // Complete async test
					return;
				}

				oAssert.strictEqual($Focus.control(0).getId(), oButton.getId(),
					"Focus should remain on the button");

				fnDone();
			}, 0);

		});

		QUnit.test("Testing if showWeekNumbers property works properly", function (oAssert) {

			oAssert.strictEqual(this.oM.$().hasClass("sapUiCalNoWeekNum"), false, "When showWeekNumbers property is 'true', the class that hides the week numbers should not be 'visible'");
			// Act
			this.oM.setShowWeekNumbers(false);
			oCore.applyChanges();

			// Assert
			oAssert.strictEqual(this.oM.$().hasClass("sapUiCalNoWeekNum"), true, "When showWeekNumbers property is 'false', the class that hides the week numbers should be 'visible'");
		});

		QUnit.test("There is no focus on mobile", function (oAssert) {
			// Prepare
			var oDeviceStub = this.stub(Device.system, "phone").value(true),
				oItemNavSpy = this.spy(this.oM._oItemNavigation, "focusItem");

			// Act
			this.oM._focusDate(CalendarDate.fromLocalJSDate(new Date()));

			// Assert
			oAssert.strictEqual(oItemNavSpy.callCount, 0, "item navigation is not applying a focus");

			// Clean
			oDeviceStub.restore();
			oItemNavSpy.restore();
		});

		QUnit.module("Internals", {
			beforeEach: function () {
				this.oM = new Month();
			},
			afterEach: function () {
				this.oM.destroy();
				this.oM = null;
			}
		});

		QUnit.test("Invalidate from parent aggregation specialDates", function (oAssert) {
			// Arrange
			this.oM.getDomRef = function () {
				return document.createElement("div"); // Mock object getDomRef() method return
			};
			this.oM._bNoFocus = false; // Mock focus return boolean

			// Act - invalidate without origin
			this.oM.invalidate();

			// Assert
			oAssert.strictEqual(this.oM._bNoFocus, false, "When invalidating without origin focus should be returned");

			// Act - invalidate with mock origin which is of type sap.ui.unified.DateRange with parent aggregation "specialDates"
			this.oM.invalidate(new DateRange().setParent(this.oM, "specialDates"));

			// Assert
			oAssert.strictEqual(this.oM._bNoFocus, false, "When invalidating with origin DateRange and parent " +
				"aggregation 'specialDates' focus should be returned");
		});

		QUnit.test("specialDates outside current month are not rendered as such", function (oAssert) {
			// Arrange
			var $Date;
			this.oM.setDate(new Date(2016, 6, 1));
			this.oM.addSpecialDate(
				new DateTypeRange({
					startDate: new Date(2016, 5, 30),
					endDate:  new Date(2016, 5, 30)
			}));

			// Act
			this.oM.placeAt("qunit-fixture");
			oCore.applyChanges();

			// Assert
			$Date = jQuery("#" + this.oM.getId() + "-20160630");
			oAssert.notOk($Date.hasClass("sapUiCalItemType01"), "specialDates type indicator is not rendered");
			oAssert.notOk($Date.children().hasClass("sapUiCalSpecialDate"), "specialDates HTML element is not rendered");
		});

		QUnit.test("_isValueInThreshold return true if provided value is in provided threshold", function (assert) {
			assert.ok(this.oM._isValueInThreshold(248, 258, 10), "value is between 238 and 258 - upper boundary"); // (reference value, actual value, threshold)
			assert.ok(this.oM._isValueInThreshold(248, 238, 10), "value is between 238 and 258 - lower boundary"); // (reference value, actual value, threshold)
			assert.ok(this.oM._isValueInThreshold(248, 240, 10), "value is between 238 and 258"); // (reference value, actual value, threshold)
			assert.ok(this.oM._isValueInThreshold(248, 250, 10), "value is between 238 and 258"); // (reference value, actual value, threshold)
		});

		QUnit.test("_isValueInThreshold return false if provided value is out of provided threshold", function (assert) {
			assert.equal(this.oM._isValueInThreshold(248, 237, 10), false, "value is lower"); // (reference value, actual value, threshold)
			assert.equal(this.oM._isValueInThreshold(248, 259, 10), false, "value is upper"); // (reference value, actual value, threshold)
		});

		// BCP 2080183678
		QUnit.test("_areMouseEventCoordinatesInThreshold works properly", function (assert) {
			this.oM._oMousedownPosition = { clientX: 20, clientY: 20 };
			assert.equal(this.oM._areMouseEventCoordinatesInThreshold(27, 27, 10), true, "both distances between mousedown and mouseup clientX, clientY are within the threshold");
			assert.equal(this.oM._areMouseEventCoordinatesInThreshold(27, 37, 10), false, "the distance between mousedown and mouseup clientY is not within the threshold");
			assert.equal(this.oM._areMouseEventCoordinatesInThreshold(37, 27, 10), false, "the distance between mousedown and mouseup clientX is not within the threshold");
			assert.equal(this.oM._areMouseEventCoordinatesInThreshold(37, 37, 10), false, "both distances between mousedown and mouseup clientX, clientY are not within the threshold");
			delete this.oM._oMousedownPosition;
			assert.equal(this.oM._areMouseEventCoordinatesInThreshold(27, 27, 10), false, "there is no mousedown data stored, cannot check, return false");
		});

		// BCP: 1880151681
		QUnit.test("Selecting a weeknumber does not throw an error", function (assert) {
			// Arrange
			this.oM.placeAt("qunit-fixture");
			oCore.applyChanges();

			var oTarget = this.oM.getDomRef().querySelectorAll(".sapUiCalWeekNum")[1],
				oMouseEvent = { clientX: 10, clientY: 10, target: oTarget },
				deviceStub = this.stub(Device.support, "touch").value(true);

			// Act
			this.oM._oMousedownPosition = oMouseEvent;
			this.oM.onmouseup(oMouseEvent);

			// Assert
			assert.ok(true, "onmouseup does not throw an exception when weeknum is selected");

			deviceStub.restore();
		});

		// BCP: 1880151681
		QUnit.test("Selecting a day header does not throw an error", function (assert) {
			// Arrange
			this.oM.placeAt("qunit-fixture");
			oCore.applyChanges();

			var oTarget = this.oM.getDomRef().querySelector(".sapUiCalWH"),
				oMouseEvent = { clientX: 10, clientY: 10, target: oTarget },
				deviceStub = this.stub(Device.support, "touch").value(true);

			// Act
			this.oM._oMousedownPosition = oMouseEvent;
			this.oM.onmouseup(oMouseEvent);

			// Assert
			assert.ok(true, "onmouseup does not throw an exception when day header is selected");

			deviceStub.restore();
			this.oM.destroy();
		});

		QUnit.test("Date can't be selected via mouse's right button click", function (assert) {
			// Arrange
			var oTarget = document.createElement("span");
			oTarget.classList.add("sapUiCalItemText");
			var oMouseEvent = { clientX: 10, clientY: 10, target: oTarget, button: 2 },
				deviceStub = this.stub(Device.support, "touch").value(true),
				isSelectedDaySpy = this.spy(this.oM, "_selectDay");

			//act
			this.oM._oMousedownPosition = oMouseEvent;
			this.oM.onmouseup(oMouseEvent);

			//assert
			assert.notOk(isSelectedDaySpy.called, "onmouseup with the right button on the mouse does not invoke _selectDay");

			//cleanup
			deviceStub.restore();
			isSelectedDaySpy.restore();
		});

		QUnit.test("Selecting a week number in Edge + touch does not cause day selection", function (assert) {
			// Arrange
			this.oM.placeAt("qunit-fixture");
			oCore.applyChanges();

			var oTarget = this.oM.getDomRef().querySelectorAll(".sapUiCalWeekNum")[1],
				oMouseEvent = { clientX: 10, clientY: 10, target: oTarget },
				isSelectedDaySpy = this.spy(this.oM, "_selectDay"),
				oBrowserStub = this.stub(Device, "browser").value({edge: true});

			//act
			this.oM._handleMousedown(oMouseEvent, CalendarDate.fromLocalJSDate(new Date(2017, 6, 20), this.oM.getPrimaryCalendarType()));

			//assert
			assert.strictEqual(isSelectedDaySpy.called, false, "_handleMousedown does not invoke _selectDay in Edge");

			//cleanup
			oBrowserStub.restore();
			isSelectedDaySpy.restore();
		});

		QUnit.test("select event is also called when click on sapUiCalDayName", function (assert) {
			// Arrange
			var oTarget = document.createElement("span"),
				oTargetParent = document.createElement("div"),
				oMouseEvent = { clientX: 10, clientY: 10, target: oTarget},
				oMonthSelectSpy = this.spy(this.oM, "fireSelect");
			this.stub(Device.support, "touch").value(true);

			oTarget.classList.add("sapUiCalDayName");
			oTargetParent.setAttribute('data-sap-day', "20170101");
			oTargetParent.appendChild(oTarget);
			this.oM._oMousedownPosition = oMouseEvent;
			this.oM._oItemNavigation = new ItemNavigation();

			// Act
			this.oM.onmouseup(oMouseEvent);

			// Assert
			assert.equal(oMonthSelectSpy.callCount, 1, "select was fired");
		});

		QUnit.test("select event is also called when click on sapUiCalItemText", function (assert) {
			// Arrange
			var oTarget = document.createElement("span"),
				oTargetParent = document.createElement("div"),
				oMouseEvent = { clientX: 10, clientY: 10, target: oTarget},
				oMonthSelectSpy = this.spy(this.oM, "fireSelect");
			this.stub(Device.support, "touch").value(true);

			oTarget.classList.add("sapUiCalItemText");
			oTargetParent.setAttribute('data-sap-day', "20170101");
			oTargetParent.appendChild(oTarget);
			this.oM._oMousedownPosition = oMouseEvent;
			this.oM._oItemNavigation = new ItemNavigation();

			// Act
			this.oM.onmouseup(oMouseEvent);

			// Assert
			assert.equal(oMonthSelectSpy.callCount, 1, "select was fired");
		});

		QUnit.test("setting startDate doesn't apply focus", function (assert) {
			// Arrange
			var oMonthFocusDateSpy = this.spy(this.oM, "setDate"),
				oLastMonthDate = new Date();

			oLastMonthDate.setMonth(oLastMonthDate.getMonth() - 1);
			this.oM.displayDate(oLastMonthDate);
			this.oM.placeAt("qunit-fixture");
			oCore.applyChanges();

			// Act
			this.oM.displayDate(new Date());

			// Assert
			assert.equal(oMonthFocusDateSpy.callCount, 0, "select was fired");
		});

		QUnit.module("Aria", {
			beforeEach: function() {
				//Prepare
				this.sOldLanguage = oCore.getConfiguration().getLanguage();
				oCore.getConfiguration().setLanguage("en-US");//due to text strings for built-in CalendarDayType texts

				this.oLegend = new CalendarLegend({
					items: [
						new CalendarLegendItem({
							type: CalendarDayType.Type01,
							text: "National Holidays"
						})]
				});

				this.oSut = new Month({
					date: new Date(2016, 0, 1),
					legend: this.oLegend,
					specialDates: [
						new DateTypeRange({
							startDate: new Date(2016, 0, 1),
							endDate:  new Date(2016, 0, 1),
							type: CalendarDayType.Type01 /* Calendar Legend Item exists for this type*/
						}),
						new DateTypeRange({
							startDate: new Date(2016, 0, 2),
							endDate:  new Date(2016, 0, 2),
							type: CalendarDayType.Type02 /* Calendar Legend Item DOES not exist for this type*/
						})
					]
				});
			},
			afterEach: function() {
				//Clear
				this.oSut.destroy();
				this.oLegend.destroy();
				oCore.getConfiguration().setLanguage(this.sOldLanguage);
			}
		});

		QUnit.test("General ARIA", function (assert) {
			// Arrange
			this.oSut.placeAt("qunit-fixture");
			oCore.applyChanges();

			// Assert
			assert.notOk(this.oSut.$().attr("aria-readonly"), "Month doesn't have aria-readonly on it");
		});

		QUnit.test("First DOM element with role='rowheader' has week label set", function (assert) {
			// Arrange
			this.oSut.placeAt("qunit-fixture");
			oCore.applyChanges();
			var oRowHeader = this.oSut.$().find("[role='rowheader']")[0],
				aAriaLabels = oRowHeader.getAttribute("aria-labelledby").split(" ");

			// Assert
			assert.equal(
				aAriaLabels[0],
				InvisibleText.getStaticId("sap.ui.unified", "CALENDAR_WEEK"),
				"Week row info is corretly added"
			);

			assert.equal(
				aAriaLabels[1],
				oRowHeader.id,
				"Week row info is corretly added"
			);
		});

		QUnit.test("Day cells have role gridcell", function (assert) {
			// Arrange
			this.oSut.placeAt('qunit-fixture');
			oCore.applyChanges();

			// Assert
			assert.equal(jQuery("#" + this.oSut.getId() + "-20160105").attr("role"), "gridcell", "The day cell has role gridcell");
		});

		QUnit.test("Wrapper of day cells has role row", function (assert) {
			// Arrange
			this.oSut.placeAt('qunit-fixture');
			oCore.applyChanges();

			// Assert
			assert.equal(this.oSut.getDomRef().childNodes[1].getAttribute("role"), "row", "The day cell's wrapper has role row");
		});

		QUnit.test("Special Dates with legend", function (assert) {
			//Act
			this.oSut.placeAt('qunit-fixture');
			oCore.applyChanges();

			//Assert
			assert.ok(jQuery("#" + this.oSut.getId() + "-20160101").attr("aria-label").indexOf("National Holidays") >= 0,
					"The corresponding legend item's text is used as aria-label");
		});

		QUnit.test("Dummy cell has an accessible name", function (assert) {
			var oCore = sap.ui.getCore();

			this.oSut.placeAt("qunit-fixture");
			oCore.applyChanges();

			assert.strictEqual(document.getElementsByClassName("sapUiCalDummy")[0].getAttribute("aria-label"),
				oCore.getLibraryResourceBundle("sap.ui.unified").getText("CALENDAR_WEEK"),
				"Dummy cell's accessible name is provided in aria-label");
		});

		QUnit.module("Unfinished range selection indication allowance", {
			beforeEach: function () {
				this.oMonth = new Month();
				this.oSelectedRange = new DateRange();

				this.oMonth.addAggregation("selectedDates", this.oSelectedRange);
			},
			afterEach: function () {
				this.oMonth.destroy();
				this.oMonth = null;
			}
		});

		QUnit.test("Unfinished range in intervalSelection mode", function (assert) {
			// Act
			this.oMonth.setIntervalSelection(true);
			this.oSelectedRange.setStartDate(new Date());

			// Assert
			assert.strictEqual(this.oMonth._isMarkingUnfinishedRangeAllowed(), true,
				"Indication is allowed");
		});

		QUnit.test("Unfinished range not in intervalSelection mode", function (assert) {
			// Act
			this.oSelectedRange.setStartDate(new Date());

			// Assert
			assert.strictEqual(this.oMonth._isMarkingUnfinishedRangeAllowed(), false,
				"Indication is not allowed");
		});

		QUnit.test("Finished range in intervalSelection mode", function (assert) {
			// Act
			this.oMonth.setIntervalSelection(true);
			this.oSelectedRange.setStartDate(new Date());
			this.oSelectedRange.setEndDate(new Date());

			// Assert
			assert.strictEqual(this.oMonth._isMarkingUnfinishedRangeAllowed(), false,
				"Indication is not allowed");
		});

		QUnit.test("Finished range not in intervalSelection mode", function (assert) {
			// Act
			this.oSelectedRange.setStartDate(new Date());
			this.oSelectedRange.setEndDate(new Date());

			// Assert
			assert.strictEqual(this.oMonth._isMarkingUnfinishedRangeAllowed(), false,
				"Indication is not allowed");
		});

		QUnit.test("Month in intervalSelection mode and no selection started", function (assert) {
			// Act
			this.oMonth.setIntervalSelection(true);
			this.oMonth.removeAllAggregation("selectedDates");

			// Assert
			assert.strictEqual(this.oMonth._isMarkingUnfinishedRangeAllowed(), false,
				"Indication is not allowed");
		});

		QUnit.module("Unfinished range selection indication in the DOM");

		QUnit.test("Unfinished interval selection feedback when using keyboard", function (assert) {
			// Prepare
			var aItemsMarkedAsBetween,
				oMonth = new Month({
					intervalSelection: true,
					date: new Date(2018, 9, 16), // 2018, October 16
					selectedDates: new DateRange({
						startDate: new Date(2018, 9, 14) // 2018, October 14
					})
				});

			oMonth.placeAt("qunit-fixture");
			oCore.applyChanges();

			aItemsMarkedAsBetween = jQuery('.sapUiCalItemSelBetween');

			// Assert
			assert.strictEqual(aItemsMarkedAsBetween.length, 0, "No dates marked yet");

			oMonth.destroy();
		});

		QUnit.test("Unfinished interval selection feedback when using mouse", function(assert) {
			//arrange
			var oMonth = new Month({
					intervalSelection: true,
					date: new Date(2017, 6, 19) //2017, July 19
				}),
				$HoveredDate,
				$HoveredDateBefore,
				oSelectedDate = new DateRange({ startDate: new Date(2017, 6, 19) });

			oMonth.placeAt("qunit-fixture");
			oCore.applyChanges();

			//act - hover a date, with nothing selected yet
			$HoveredDate = jQuery("#" + oMonth.getId() + "-20170725");
			oMonth.onmouseover({ target: $HoveredDate }); //2017, July 25

			//assert
			assert.equal(jQuery('.sapUiCalItemSelBetween').length, 0, 'no selection feedback yet');

			//act - hover the same end date
			oMonth.addSelectedDate(oSelectedDate);
			oMonth.onmouseover({ target: $HoveredDate }); //2017, July 25

			//assert
			assert.equal(jQuery('.sapUiCalItemSelBetween').length, 5, 'selection feedback is applied');

			//act - hover a date before the selected.startDate
			$HoveredDateBefore = jQuery("#" + oMonth.getId() + "-20170712");
			oMonth.onmouseover({ target: $HoveredDateBefore }); //2017, July 12

			//assert
			assert.equal(jQuery('.sapUiCalItemSelBetween').length, 6, 'selection feedback is applied on hovered dates before start date');

			//act - finish selection and then hover
			oMonth.getSelectedDates()[0].setEndDate(new Date(2017, 6, 12));
			oMonth.onmouseover({ target: $HoveredDate }); //2017, July 25

			//assert
			assert.equal(jQuery('.sapUiCalItemSelBetween').length, 6, 'no additional selection feedback after end date has been given');

			//clean
			oMonth.destroy();
		});

		QUnit.test("_markDatesBetweenStartAndHoveredDate", function (assert) {
			// Prepare
			var aItemsMarkedAsBetween,
				oMonth = new Month({
					intervalSelection: true,
					date: new Date(2018, 8, 1)
				});

			oMonth.placeAt("qunit-fixture");
			oCore.applyChanges();

			oMonth._oMinDate = CalendarDate.fromLocalJSDate(new Date(2018, 8, 10));
			oMonth._oMaxDate = CalendarDate.fromLocalJSDate(new Date(2018, 8, 20));

			// Act
			oMonth._markDatesBetweenStartAndHoveredDate(20180810, 20220820);

			aItemsMarkedAsBetween = jQuery('.sapUiCalItemSelBetween');

			// Assert
			assert.strictEqual(aItemsMarkedAsBetween.length, 9, "9 days inside the interval");

			// Act
			oMonth._markDatesBetweenStartAndHoveredDate(20180801, 20220820);

			aItemsMarkedAsBetween = jQuery('.sapUiCalItemSelBetween');

			// Assert
			assert.strictEqual(aItemsMarkedAsBetween.length, 9, "9 days inside the interval");

			// Act
			oMonth._markDatesBetweenStartAndHoveredDate(20180810, 20220830);

			aItemsMarkedAsBetween = jQuery('.sapUiCalItemSelBetween');

			// Assert
			assert.strictEqual(aItemsMarkedAsBetween.length, 9, "9 days inside the interval");

			oMonth.destroy();
		});

		QUnit.module("_isIntervalSelected function", {
			beforeEach: function () {
				this.oM = new Month();
				this.oRangeSelection = new DateRange({
					startDate: new Date(2018, 9, 14),
					endDate: new Date(2018,9,24)
				});
			},
			afterEach: function () {
				this.oM.destroy();
				this.oM = null;
				this.oRangeSelection.destroy();
				this.oRangeSelection = null;
			}
		});

		QUnit.test("_isIntervalSelected function with missing selected date", function(assert){
			//act
			this.oM.addSelectedDate(new DateRange());

			// Assert
			assert.notOk(!!this.oM._isIntervalSelected(this.oRangeSelection),"Not same interval selected");
		});

		QUnit.test("_isIntervalSelected function with selected startDate and missing endDate", function(assert){
			//act
			this.oM.addSelectedDate(new DateRange({
				startDate: new Date(2018,1,24)
			}));

			// Assert
			assert.notOk(!!this.oM._isIntervalSelected(this.oRangeSelection),"Not same interval selected");
		});

		QUnit.test("_isIntervalSelected function with selected endDate and missng startDate", function(assert){
			//act
			this.oM.addSelectedDate(new DateRange({
				endDate: new Date(2018,1,24)
			}));

			// Assert
			assert.notOk(!!this.oM._isIntervalSelected(this.oRangeSelection), "Not same interval selected");
		});

		QUnit.test("_isIntervalSelected function with the different selected startDate, endDate and range selection date", function(assert){
			//act
			this.oM.addSelectedDate(new DateRange({
				startDate: new Date(2018, 1, 14),
				endDate: new Date(2018,1,24)
			}));

			// Assert
			assert.notOk(!!this.oM._isIntervalSelected(this.oRangeSelection), "Not same interval selected");
		});

		QUnit.test("_isIntervalSelected function with the same startDate and endDate", function(assert){
			//act
			this.oM.addSelectedDate(new DateRange({
				startDate: new Date(2018, 9, 14),
				endDate: new Date(2018,9,24)
			}));

			// Assert
			assert.ok(!!this.oM._isIntervalSelected(this.oRangeSelection), "Same interval selected");
		});

		QUnit.module("_getDateTypes function", {
			beforeEach: function () {
				this.oM = new Month({date: new Date(2017, 1, 1)}).placeAt("qunit-fixture");
				oCore.applyChanges();
			},
			afterEach: function () {
				this.oM.destroy();
				this.oM = null;
			}
		});

		QUnit.test("_getDateTypes when Type01 and NonWorking types are set", function (assert) {
			var aDayTypes,
				oDate = new Date(2017, 1, 20),
				oSpecialDate1 = new DateTypeRange({
					type: CalendarDayType.Type01,
					startDate: oDate
				}),
				oSpecialDate2 = new DateTypeRange({
					type: CalendarDayType.NonWorking,
					startDate: oDate
				});

			this.oM.addSpecialDate(oSpecialDate1);
			this.oM.addSpecialDate(oSpecialDate2);

			aDayTypes = this.oM._getDateTypes(createCalendarDate(2017, 1, 20, true));

			// Assert
			assert.equal(aDayTypes.length, 2, "Two types are returned");
			assert.equal(aDayTypes[0].type, "Type01", "Type01 is returned");
			assert.equal(aDayTypes[1].type, "NonWorking", "NonWorking type is returned");
		});

		QUnit.test("_getDateTypes when NonWorking and Type01 types are set", function (assert) {
			var aDayTypes,
				oDate = new Date(2017, 1, 20),
				oSpecialDate1 = new DateTypeRange({
					type: CalendarDayType.NonWorking,
					startDate: oDate
				}),
				oSpecialDate2 = new DateTypeRange({
					type: CalendarDayType.Type01,
					startDate: oDate
				});

			this.oM.addSpecialDate(oSpecialDate1);
			this.oM.addSpecialDate(oSpecialDate2);

			aDayTypes = this.oM._getDateTypes(createCalendarDate(2017, 1, 20, true));

			// Assert
			assert.equal(aDayTypes.length, 2, "Two types are returned");
			assert.equal(aDayTypes[0].type, "NonWorking", "NonWorking type is returned");
			assert.equal(aDayTypes[1].type, "Type01", "Type01 is returned");
		});

		QUnit.test("_getDateTypes when Type01, NonWorking and Type03 types are set", function (assert) {
			var aDayTypes,
				oDate = new Date(2017, 1, 20),
				oSpecialDate1 = new DateTypeRange({
					type: CalendarDayType.Type01,
					startDate: oDate
				}),
				oSpecialDate2 = new DateTypeRange({
					type: CalendarDayType.NonWorking,
					startDate: oDate
				}),
				oSpecialDate3 = new DateTypeRange({
					type: CalendarDayType.Type03,
					startDate: oDate
				});

			this.oM.addSpecialDate(oSpecialDate1);
			this.oM.addSpecialDate(oSpecialDate2);
			this.oM.addSpecialDate(oSpecialDate3);

			aDayTypes = this.oM._getDateTypes(createCalendarDate(2017, 1, 20, true));

			// Assert
			assert.equal(aDayTypes.length, 2, "Two types are returned");
			assert.equal(aDayTypes[0].type, "Type01", "Type01 is returned since it was set first");
			assert.equal(aDayTypes[1].type, "NonWorking", "NonWorking type is returned");
		});

		QUnit.test("_getDateTypes when Type02 and Type01 types are set", function (assert) {
			var aDayTypes,
				oDate = new Date(2017, 1, 20),
				oSpecialDate1 = new DateTypeRange({
					type: CalendarDayType.Type02,
					startDate: oDate
				}),
				oSpecialDate2 = new DateTypeRange({
					type: CalendarDayType.Type01,
					startDate: oDate
				});

			this.oM.addSpecialDate(oSpecialDate1);
			this.oM.addSpecialDate(oSpecialDate2);

			aDayTypes = this.oM._getDateTypes(createCalendarDate(2017, 1, 20, true));

			// Assert
			assert.equal(aDayTypes.length, 1, "Only one type is returned");
			assert.equal(aDayTypes[0].type, "Type02", "Type02 is returned since it was set first");
		});

		QUnit.test("_getDateTypes when only Type01 is set", function (assert) {
			var aDayTypes,
				oDate = new Date(2017, 1, 20),
				oSpecialDate1 = new DateTypeRange({
					type: CalendarDayType.Type01,
					startDate: oDate
				});

			this.oM.addSpecialDate(oSpecialDate1);

			aDayTypes = this.oM._getDateTypes(createCalendarDate(2017, 1, 20, true));

			// Assert
			assert.equal(aDayTypes.length, 1, "Only one type is returned");
			assert.equal(aDayTypes[0].type, "Type01", "Type01 is returned");
		});

		QUnit.test("_getDateTypes when only NonWorking is set", function (assert) {
			var aDayTypes,
				oDate = new Date(2017, 1, 20),
				oSpecialDate1 = new DateTypeRange({
					type: CalendarDayType.NonWorking,
					startDate: oDate
				});

			this.oM.addSpecialDate(oSpecialDate1);

			aDayTypes = this.oM._getDateTypes(createCalendarDate(2017, 1, 20, true));

			// Assert
			assert.equal(aDayTypes.length, 1, "Only one type is returned");
			assert.equal(aDayTypes[0].type, "NonWorking", "NonWorking is returned");
		});


		QUnit.module("Week selection allowance", {
			beforeEach: function () {
				this.oM = new Month({
					primaryCalendarType: CalendarType.Gregorian
				});
			},
			afterEach: function () {
				this.oM.destroy();
				this.oM = null;
			}
		});

		QUnit.test("Single day selection (by default)", function (assert) {
			assert.notOk(this.oM._isWeekSelectionAllowed(), "Week selection isn't allowed for single days selection");
		});

		QUnit.test("Multiple day seleciton", function (assert) {
			this.oM.setSingleSelection(false);
			assert.ok(this.oM._isWeekSelectionAllowed(), "Week selection is allowed for multiple days selection");
		});

		QUnit.test("Single interval selection", function (assert) {
			this.oM.setIntervalSelection(true);
			assert.ok(this.oM._isWeekSelectionAllowed(), "Week selection is allowed for single interval selection");
		});

		QUnit.test("Multiple interval selection", function (assert) {
			this.oM.setIntervalSelection(true);
			this.oM.setSingleSelection(false);
			assert.notOk(this.oM._isWeekSelectionAllowed(), "Week selection isn't allowed for multiple interval selection");
		});

		QUnit.test("Calendar type other than Gregorian", function (assert) {
			var oCalendarType = CalendarType;

			// Islamic
			this.oM.setPrimaryCalendarType(oCalendarType.Islamic);
			assert.notOk(this.oM._isWeekSelectionAllowed(), "Week selection isn't allowed for Islamic calendars");

			// Japanese
			this.oM.setPrimaryCalendarType(oCalendarType.Japanese);
			assert.notOk(this.oM._isWeekSelectionAllowed(), "Week selection isn't allowed for Japanese calendars");

			// Persian
			this.oM.setPrimaryCalendarType(oCalendarType.Persian);
			assert.notOk(this.oM._isWeekSelectionAllowed(), "Week selection isn't allowed for Persian calendars");

			// Buddhist
			this.oM.setPrimaryCalendarType(oCalendarType.Buddhist);
			assert.notOk(this.oM._isWeekSelectionAllowed(), "Week selection isn't allowed for Buddhist calendars");
		});

		QUnit.test("Custom firstDayOfWeek", function (assert) {
			this.oM.setFirstDayOfWeek(4);
			assert.notOk(this.oM._isWeekSelectionAllowed(), "Week selection isn't allowed when there is custom firstDayOfWeek");
		});


		QUnit.module("Week selection/deselection - Multiple day selection", {
			beforeEach: function () {
				this.oM = new Month({
					primaryCalendarType: CalendarType.Gregorian
				}).placeAt("qunit-fixture");

				this.oTarget = document.createElement("span");
				this.oTargetParent = document.createElement("div");

				this.oTargetParent.setAttribute('data-sap-day', "20170101");
				this.oTargetParent.appendChild(this.oTarget);

				oCore.applyChanges();
			},
			afterEach: function () {
				this.oM.destroy();
				this.oM = null;
			},
			assertMultipleDaySelectionWeekSelected: function (oWeekNumberSelectSpy, assert) {
				var aSelectedDates = this.oM.getSelectedDates(),
					bIntervalIsSelected;

				// Check if any of the DateRanges in selectedDates has endDate
				bIntervalIsSelected = aSelectedDates.some(function (oDate) {
					return !!oDate.getEndDate();
				});

				assert.ok(oWeekNumberSelectSpy.called, "weekNumberSelect event was fired");
				assert.strictEqual(aSelectedDates.length, 7, "All 7 days from the week were selected");
				assert.notOk(bIntervalIsSelected, "Each selected date is a singular date and not an interval");
			},
			assertSingleIntervalSelectionWeekSelected: function (oWeekNumberSelectSpy, assert) {
				var aSelectedDates = this.oM.getSelectedDates(),
					oWeekInterval = aSelectedDates[0],
					oIntervalStartDate = oWeekInterval && oWeekInterval.getStartDate(),
					oIntervalEndDate = oWeekInterval && oWeekInterval.getEndDate();

				assert.ok(oWeekNumberSelectSpy.called, "weekNumberSelect event was fired");
				assert.strictEqual(aSelectedDates.length, 1, "Only the week interval is in selectedDates");
				assert.ok(!!oWeekInterval, "Week interval is selected");
				assert.ok(!!oIntervalStartDate && !!oIntervalEndDate, "Week interval has both startDate and endDate");
				// TODO: 6 days apart
			},
			assertWeekDeselected: function (oWeekNumberSelectSpy, assert) {
				assert.ok(oWeekNumberSelectSpy.called, "weekNumberSelect event was fired");
				assert.strictEqual(this.oM.getSelectedDates().length, 0, "Selected week days are removed");
			}
		});

		QUnit.test("[Multiple day selection] Shift + Space shortcut", function (assert) {
			// Prepare
			var oWeekNumberSelectSpy = this.spy(this.oM, "fireWeekNumberSelect"),
				oMockEvent = {
					target: this.oTarget,
					shiftKey: true,
					keyCode: KeyCodes.SPACE,
					stopPropagation: function () {},
					preventDefault: function () {}
				};

			this.stub(Device.support, "touch").value(true);

			this.oM.setSingleSelection(false);

			// Act
			this.oM.onsapselectmodifiers(oMockEvent); // Select the week
			// Assert
			this.assertMultipleDaySelectionWeekSelected(oWeekNumberSelectSpy, assert);

			// Act
			this.oM.onsapselectmodifiers(oMockEvent); // Deselect it
			// Assert
			this.assertWeekDeselected(oWeekNumberSelectSpy, assert);
		});

		QUnit.test("[Multiple day selection] Week number click on touch devices", function (assert) {
			// Prepare
			var oWeekNumberSelectSpy = this.spy(this.oM, "fireWeekNumberSelect"),
				oMockEvent = { target: this.oM.getDomRef().querySelectorAll(".sapUiCalWeekNum")[1] };

			this.stub(Device.support, "touch").value(true);
			this.stub(this.oM, "_areMouseEventCoordinatesInThreshold").returns(true);

			this.oM.setSingleSelection(false);

			// Act
			this.oM.onmouseup(oMockEvent); // Select the week
			// Assert
			this.assertMultipleDaySelectionWeekSelected(oWeekNumberSelectSpy, assert);

			// Act
			this.oM.onmouseup(oMockEvent); // Deselect it
			// Assert
			this.assertWeekDeselected(oWeekNumberSelectSpy, assert);
		});

		QUnit.test("[Multiple day selection] Week number click on non-touch devices", function (assert) {
			// Prepare
			var oWeekNumberSelectSpy = this.spy(this.oM, "fireWeekNumberSelect"),
				oMockEvent = { target: this.oM.getDomRef().querySelectorAll(".sapUiCalWeekNum")[1] };

			this.stub(Device.support, "touch").value(false);
			this.stub(this.oM, "_areMouseEventCoordinatesInThreshold").returns(true);

			this.oM.setSingleSelection(false);

			// Act
			this.oM._handleMousedown(oMockEvent); // Select the week
			// Assert
			this.assertMultipleDaySelectionWeekSelected(oWeekNumberSelectSpy, assert);

			// Act
			this.oM._handleMousedown(oMockEvent); // Deselect it
			// Assert
			this.assertWeekDeselected(oWeekNumberSelectSpy, assert);
		});

		QUnit.test("[Single interval selection] Shift + Space shortcut", function (assert) {
			// Prepare
			var oWeekNumberSelectSpy = this.spy(this.oM, "fireWeekNumberSelect"),
				oMockEvent = {
					target: this.oTarget,
					shiftKey: true,
					keyCode: KeyCodes.SPACE,
					stopPropagation: function () {},
					preventDefault: function () {}
				};

			this.stub(Device.support, "touch").value(true);
			this.oM.setIntervalSelection(true);

			// Act
			this.oM.onsapselectmodifiers(oMockEvent); // Select the week
			// Assert
			this.assertSingleIntervalSelectionWeekSelected(oWeekNumberSelectSpy, assert);

			// Act
			this.oM.onsapselectmodifiers(oMockEvent); // Deselect it
			// Assert
			this.assertWeekDeselected(oWeekNumberSelectSpy, assert);
		});

		QUnit.test("[Single interval selection] Week number click on touch devices", function (assert) {
			// Prepare
			var oWeekNumberSelectSpy = this.spy(this.oM, "fireWeekNumberSelect"),
				oMockEvent = { target: this.oM.getDomRef().querySelectorAll(".sapUiCalWeekNum")[1] };

			this.stub(Device.support, "touch").value(true);
			this.stub(this.oM, "_areMouseEventCoordinatesInThreshold").returns(true);
			this.oM.setIntervalSelection(true);

			// Act
			this.oM.onmouseup(oMockEvent); // Select the week
			// Assert
			this.assertSingleIntervalSelectionWeekSelected(oWeekNumberSelectSpy, assert);

			// Act
			this.oM.onmouseup(oMockEvent); // Deselect it
			// Assert
			this.assertWeekDeselected(oWeekNumberSelectSpy, assert);
		});

		QUnit.test("[Single interval selection] Week number click on non-touch devices", function (assert) {
			// Prepare
			var oWeekNumberSelectSpy = this.spy(this.oM, "fireWeekNumberSelect"),
				oMockEvent = { target: this.oM.getDomRef().querySelectorAll(".sapUiCalWeekNum")[1] };

			this.stub(Device.support, "touch").value(false);
			this.stub(this.oM, "_areMouseEventCoordinatesInThreshold").returns(true);

			this.oM.setIntervalSelection(true);

			// Act
			this.oM._handleMousedown(oMockEvent); // Select the week
			// Assert
			this.assertSingleIntervalSelectionWeekSelected(oWeekNumberSelectSpy, assert);

			// Act
			this.oM._handleMousedown(oMockEvent); // Deselect it
			// Assert
			this.assertWeekDeselected(oWeekNumberSelectSpy, assert);
		});


		QUnit.module("Multiselect mode (SHIFT + Click/ENTER)", {
			beforeEach: function () {
				this.oM = new Month({
					singleSelection: false,
					primaryCalendarType: CalendarType.Gregorian
				}).placeAt("qunit-fixture");

				this.oRangeStart = document.createElement("span");
				this.oRangeEnd = document.createElement("span");
				this.oRangeStartParent = document.createElement("div");
				this.oRangeEndParent = document.createElement("div");

				this.oRangeStart.classList.add("sapUiCalItemText");
				this.oRangeEnd.classList.add("sapUiCalItemText");

				this.oRangeStartParent.setAttribute('data-sap-day', "20180911");
				this.oRangeEndParent.setAttribute('data-sap-day', "20180914");

				this.oRangeStartParent.appendChild(this.oRangeStart);
				this.oRangeEndParent.appendChild(this.oRangeEnd);

				oCore.applyChanges();
			},
			afterEach: function () {
				this.oM.destroy();
				this.oM = null;
			}
		});

		QUnit.test("Allowance", function (assert) {
			assert.ok(this.oM._isConsecutiveDaysSelectionAllowed(),
					"Multiselect is allowed on multiple day selection");

			this.oM.setSingleSelection(true);
			assert.notOk(this.oM._isConsecutiveDaysSelectionAllowed(),
					"Multiselect isn't allowed on single day selection");

			this.oM.setIntervalSelection(true);
			assert.notOk(this.oM._isConsecutiveDaysSelectionAllowed(),
					"Multiselect isn't allowed on multiple interval selection");

			this.oM.setSingleSelection(false);
			assert.notOk(this.oM._isConsecutiveDaysSelectionAllowed(),
					"Multiselect isn't allowed on single interval selection");
		});

		QUnit.test("Selecting/Deselecting a range using SHIFT+ENTER", function (assert) {
			// Prepare
			var oRangeStartEvent = {
					target: this.oRangeStart,
					stopPropagation: function () {},
					preventDefault: function () {}
				},
				oRangeEndEvent = {
					target: this.oRangeEnd,
					shiftKey: true,
					keyCode: KeyCodes.ENTER,
					stopPropagation: function () {},
					preventDefault: function () {}
				},
				oDeselectionEvent = {
					target: this.oRangeStart,
					shiftKey: true,
					keyCode: KeyCodes.ENTER,
					stopPropagation: function () {},
					preventDefault: function () {}
				};

			this.stub(Device.support, "touch").value(true);

			// Act
			this.oM.onsapselect(oRangeStartEvent); // Selecting the interval's starting day
			this.oM.onsapselectmodifiers(oRangeEndEvent); // SHIFT + ENTER on interval's ending day
			// Assert
			assert.strictEqual(this.oM.getSelectedDates().length, 4, "All 4 days between have been selected");

			// Act
			this.oM.onsapselectmodifiers(oDeselectionEvent); // SHIFT + ENTER back on interval's starting day
			// Assert
			assert.strictEqual(this.oM.getSelectedDates().length, 0, "All 4 days between have been deselected");
		});

		QUnit.test("Selecting/Deselecting a range using SHIFT+Click on touch device", function (assert) {
			// Prepare
			var oRangeStartEvent = {
					target: this.oRangeStart
				},
				oRangeEndEvent = {
					target: this.oRangeEnd,
					shiftKey: true
				},
				oDeselectionEvent = {
					target: this.oRangeStart,
					shiftKey: true
				};

			this.stub(Device.support, "touch").value(true);
			this.stub(this.oM, "_areMouseEventCoordinatesInThreshold").returns(true);

			// Act
			this.oM.onmouseup(oRangeStartEvent); // Click on interval's starting day
			this.oM.onmouseup(oRangeEndEvent); // SHIFT + click on interval's ending day
			// Assert
			assert.strictEqual(this.oM.getSelectedDates().length, 4, "All 4 days between have been selected");

			// Act
			this.oM.onmouseup(oDeselectionEvent); // Shift + click back on interval's starting day
			// Assert
			assert.strictEqual(this.oM.getSelectedDates().length, 0, "All 4 days between have been deselected");
		});

		QUnit.test("Selecting/Deselecting a range using SHIFT+Click on non-touch device", function (assert) {
			// Prepare
			var oRangeStartEvent = {
					target: this.oRangeStart,
					button: 0,
					preventDefault: function () {},
					setMark: function () {}
				},
				oRangeEndEvent = {
					target: this.oRangeEnd,
					shiftKey: true,
					button: 0,
					preventDefault: function () {},
					setMark: function () {}
				},
				oDeselectionEvent = {
					target: this.oRangeStart,
					shiftKey: true,
					button: 0,
					preventDefault: function () {},
					setMark: function () {}
				};

			this.stub(Device.support, "touch").value(false);
			this.stub(this.oM, "_areMouseEventCoordinatesInThreshold").returns(true);

			// Act
			// Pass a second parameter, because for selecting single day, _handleMousedown will call
			// _selectDay with that parameter. Normally it would be set on "afterFocus", but since we mock
			// the selection, than there will be no focused date.
			this.oM._handleMousedown(oRangeStartEvent, this.oM._getSelectedDateFromEvent(oRangeStartEvent)); // Click on interval's starting day
			this.oM._handleMousedown(oRangeEndEvent); // SHIFT + click back on interval's starting day
			// Assert
			assert.strictEqual(this.oM.getSelectedDates().length, 4, "All 4 days between have been selected");

			// Act
			this.oM._handleMousedown(oDeselectionEvent);
			// Assert
			assert.strictEqual(this.oM.getSelectedDates().length, 0, "All 4 days between have been deselected");
		});

	})();
});