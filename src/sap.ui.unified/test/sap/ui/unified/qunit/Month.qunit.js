/*global QUnit, window */

sap.ui.define([
	"sap/ui/unified/calendar/Month",
	"sap/ui/unified/calendar/CalendarDate",
	"sap/ui/unified/CalendarLegend",
	"sap/ui/unified/CalendarLegendRenderer",
	"sap/ui/unified/CalendarLegendItem",
	"sap/m/Button",
	"sap/ui/unified/DateRange",
	"sap/ui/unified/DateTypeRange",
	"sap/ui/unified/library"
], function(Month, CalendarDate, CalendarLegend, CalendarLegendRenderer,
	CalendarLegendItem, Button, DateRange, DateTypeRange, unifiedLibrary) {
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
				sap.ui.getCore().applyChanges();
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

			var aItems = this.oM.$().find(".sapUiCalItem"),
				$FirstDay = jQuery(aItems[0]);

			// Assert
			assert.strictEqual($FirstDay.hasClass("sapUiCalItemDsbl"), true, "The day from year 0000 should be disabled");
			assert.strictEqual($FirstDay.find(".sapUiCalItemText").text(), "", "The day from year 0000 should not have a visible text");
		});

		QUnit.test("Corner case for December 9999", function (assert) {
			// Act
			this.oM.setDate(createDate(9999, 11, 1));

			var aItems = this.oM.$().find(".sapUiCalItem"),
				$LastDay = jQuery(aItems[aItems.length - 1]);

			// Assert
			assert.strictEqual($LastDay.data("sap-day"), 99991231, "The last rendered day should be 9999-12-31");
			assert.strictEqual($LastDay.text(), "31", "The last rendered day should contain the string 31");
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
			 * @param {int} iVisibleDaysExpected visible days.
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
				sap.ui.getCore().applyChanges();
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
			sap.ui.getCore().applyChanges();

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
			sap.ui.getCore().applyChanges();

			// Assert
			oAssert.strictEqual(this.oM.$().hasClass("sapUiCalNoWeekNum"), true, "When showWeekNumbers property is 'false', the class that hides the week numbers should be 'visible'");
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

		// BCP: 1880151681
		QUnit.test("Selecting a weeknumber does not throw an error", function (assert) {
			// Arrange
			var oTarget = document.createElement("span");
			oTarget.classList.add("sapUiCalWeekNum");
			var oMouseEvent = { clientX: 10, clientY: 10, target: oTarget },
				deviceStub = this.stub(sap.ui.Device.support, "touch", true),
				isValueInThresholdStub = this.stub(this.oM, "_isValueInThreshold", function () { return true; });

			// Act
			this.oM._oMousedownPosition = oMouseEvent;
			this.oM.onmouseup(oMouseEvent);

			// Assert
			assert.ok(true, "onmouseup does not throw an exception when weeknum is selected");

			deviceStub.restore();
			isValueInThresholdStub.restore();
		});

		// BCP: 1880151681
		QUnit.test("Selecting a day header does not throw an error", function (assert) {
			// Arrange
			var oTarget = document.createElement("span");
			oTarget.classList.add("sapUiCalWH");
			var oMouseEvent = { clientX: 10, clientY: 10, target: oTarget },
				deviceStub = this.stub(sap.ui.Device.support, "touch", true),
				isValueInThresholdStub = this.stub(this.oM, "_isValueInThreshold", function () { return true; });

			// Act
			this.oM._oMousedownPosition = oMouseEvent;
			this.oM.onmouseup(oMouseEvent);

			// Assert
			assert.ok(true, "onmouseup does not throw an exception when day header is selected");

			deviceStub.restore();
			isValueInThresholdStub.restore();
		});

		QUnit.test("Selecting a week number in IE + touch does not cause day selection", function (assert) {
			// Arrange
			var oTarget = document.createElement("span");
			oTarget.classList.add("sapUiCalWeekNum");
			var oMouseEvent = { clientX: 10, clientY: 10, target: oTarget },
				isSelectedDaySpy = this.spy(this.oM, "_selectDay"),
				oBrowserStub = this.stub(sap.ui.Device, "browser", { msie: true });

			//act
			this.oM._handleMousedown(oMouseEvent, CalendarDate.fromLocalJSDate(new Date(2017, 6, 20), this.oM.getPrimaryCalendarType()));

			//assert
			assert.strictEqual(isSelectedDaySpy.called, false, "_handleMousedown does not invoke _selectDay in IE");

			//cleanup
			oBrowserStub.restore();
			isSelectedDaySpy.restore();
		});

		QUnit.test("Selecting a week number in Edge + touch does not cause day selection", function (assert) {
			// Arrange
			var oTarget = document.createElement("span");
			oTarget.classList.add("sapUiCalWeekNum");
			var oMouseEvent = { clientX: 10, clientY: 10, target: oTarget },
				isSelectedDaySpy = this.spy(this.oM, "_selectDay"),
				oBrowserStub = this.stub(sap.ui.Device, "browser", {edge: true});

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
				deviceStub = this.stub(sap.ui.Device.support, "touch", true),
				oMonthSelectSpy = this.spy(this.oM, "fireSelect");

			oTarget.classList.add("sapUiCalDayName");
			oTargetParent.setAttribute('data-sap-day', "20170101");
			oTargetParent.appendChild(oTarget);
			this.oM._oMousedownPosition = oMouseEvent;
			this.oM._oItemNavigation = new sap.ui.core.delegate.ItemNavigation();

			// Act
			this.oM.onmouseup(oMouseEvent);

			// Assert
			assert.equal(oMonthSelectSpy.callCount, 1, "select was fired");

			// Cleanup
			deviceStub.restore();
			oMonthSelectSpy.reset();
		});

		QUnit.test("select event is also called when click on sapUiCalItemText", function (assert) {
			// Arrange
			var oTarget = document.createElement("span"),
				oTargetParent = document.createElement("div"),
				oMouseEvent = { clientX: 10, clientY: 10, target: oTarget},
				deviceStub = this.stub(sap.ui.Device.support, "touch", true),
				oMonthSelectSpy = this.spy(this.oM, "fireSelect");

			oTarget.classList.add("sapUiCalItemText");
			oTargetParent.setAttribute('data-sap-day', "20170101");
			oTargetParent.appendChild(oTarget);
			this.oM._oMousedownPosition = oMouseEvent;
			this.oM._oItemNavigation = new sap.ui.core.delegate.ItemNavigation();

			// Act
			this.oM.onmouseup(oMouseEvent);

			// Assert
			assert.equal(oMonthSelectSpy.callCount, 1, "select was fired");

			// Cleanup
			deviceStub.restore();
			oMonthSelectSpy.reset();
		});

		QUnit.module("Aria", {
			beforeEach: function() {
				//Prepare
				this.sOldLanguage = sap.ui.getCore().getConfiguration().getLanguage();
				sap.ui.getCore().getConfiguration().setLanguage("en-US");//due to text strings for built-in CalendarDayType texts

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
				sap.ui.getCore().getConfiguration().setLanguage(this.sOldLanguage);
			}
		});

		QUnit.test("Day cells have role gridcell", function (assert) {
			// Arrange
			this.oSut.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();

			// Assert
			assert.equal(jQuery("#" + this.oSut.getId() + "-20160105").attr("role"), "gridcell", "The day cell has role gridcell");
		});

		QUnit.test("Wrapper of day cells has role row", function (assert) {
			// Arrange
			this.oSut.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();

			// Assert
			assert.equal(jQuery("#" + this.oSut.getId() + "-days").attr("role"), "row", "The day cell's wrapper has role row");
		});

		QUnit.test("Special Dates with legend", function (assert) {
			//Act
			this.oSut.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();

			//Assert
			assert.ok(jQuery("#" + this.oSut.getId() + "-20160101").attr("aria-label").indexOf("National Holidays") >= 0,
					"The corresponding legend item's text is used as aria-label");
		});

		QUnit.test("Special Dates without legend", function (assert) {
			//Act
			this.oSut.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();

			assert.ok(jQuery("#" + this.oSut.getId() + "-20160102").attr("aria-describedby").indexOf(CalendarLegendRenderer.typeARIATexts[CalendarDayType.Type02].getId()),
					"The corresponding CalendarDayType.Type02 text is used as aria-describedby");
		});

		QUnit.module("Other");

		QUnit.test("interval selection feedback", function(assert) {
			//arrange
			var oMonth = new Month({
					intervalSelection: true,
					date: new Date(2017, 6, 19) //2017, July 19
				}),
				$HoveredDate,
				$HoveredDateBefore,
				oSelectedDate = new DateRange({ startDate: new Date(2017, 6, 19) });

			oMonth.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

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

		QUnit.module("_getDateTypes function", {
			beforeEach: function () {
				this.oM = new Month({date: new Date(2017, 1, 1)}).placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();
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
					primaryCalendarType: sap.ui.core.CalendarType.Gregorian
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
			var oCalendarType = sap.ui.core.CalendarType;

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
					primaryCalendarType: sap.ui.core.CalendarType.Gregorian
				}).placeAt("qunit-fixture");

				this.oTarget = document.createElement("span");
				this.oTargetParent = document.createElement("div");

				this.oTarget.classList.add("sapUiCalWeekNum");
				this.oTargetParent.setAttribute('data-sap-day', "20170101");
				this.oTargetParent.appendChild(this.oTarget);

				sap.ui.getCore().applyChanges();
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
					keyCode: jQuery.sap.KeyCodes.SPACE,
					stopPropagation: function () {},
					preventDefault: function () {}
				};

			this.stub(sap.ui.Device.support, "touch", true);

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
				oMockEvent = { target: this.oTarget };

			this.stub(sap.ui.Device.support, "touch", true);
			this.stub(this.oM, "_areMouseEventCoordinatesInThreshold", function () { return true; });

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
				oMockEvent = { target: this.oTarget };

			this.stub(sap.ui.Device.support, "touch", false);
			this.stub(this.oM, "_areMouseEventCoordinatesInThreshold", function () { return true; });

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
					keyCode: jQuery.sap.KeyCodes.SPACE,
					stopPropagation: function () {},
					preventDefault: function () {}
				};

			this.stub(sap.ui.Device.support, "touch", true);
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
				oMockEvent = { target: this.oTarget };

			this.stub(sap.ui.Device.support, "touch", true);
			this.stub(this.oM, "_areMouseEventCoordinatesInThreshold", function () { return true; });
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
				oMockEvent = { target: this.oTarget };

			this.stub(sap.ui.Device.support, "touch", false);
			this.stub(this.oM, "_areMouseEventCoordinatesInThreshold", function () { return true; });

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
					primaryCalendarType: sap.ui.core.CalendarType.Gregorian
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

				sap.ui.getCore().applyChanges();
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
					keyCode: jQuery.sap.KeyCodes.ENTER,
					stopPropagation: function () {},
					preventDefault: function () {}
				},
				oDeselectionEvent = {
					target: this.oRangeStart,
					shiftKey: true,
					keyCode: jQuery.sap.KeyCodes.ENTER,
					stopPropagation: function () {},
					preventDefault: function () {}
				};

			this.stub(sap.ui.Device.support, "touch", true);

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

			this.stub(sap.ui.Device.support, "touch", true);
			this.stub(this.oM, "_areMouseEventCoordinatesInThreshold", function () { return true; });

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

			this.stub(sap.ui.Device.support, "touch", false);
			this.stub(this.oM, "_areMouseEventCoordinatesInThreshold", function () { return true; });

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