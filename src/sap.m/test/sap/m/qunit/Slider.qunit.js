/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/Slider",
	"sap/m/SliderRenderer",
	"sap/m/RangeSlider",
	"sap/m/Label",
	"sap/m/ResponsiveScale",
	"sap/ui/core/Element",
	"sap/m/SliderTooltipBase",
	"sap/m/SliderTooltipBaseRenderer",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/InvisibleText"
], function(
	qutils,
	createAndAppendDiv,
	App,
	Page,
	Slider,
	SliderRenderer,
	RangeSlider,
	Label,
	ResponsiveScale,
	Element,
	SliderTooltipBase,
	SliderTooltipBaseRenderer,
	KeyCodes,
	InvisibleText
) {
	createAndAppendDiv("content");
	var styleElement = document.createElement("style");
	styleElement.textContent =
		"div.sapMSliderWithoutPadding {" +
		"  padding-left: 0;" +
		"  padding-right: 0;" +
		"}";
	document.head.appendChild(styleElement);


	var oApp = new App("myApp", {
		initialPage: "page1"
	});

	var oPage = new Page("page1", {
		title: "Mobile Slider Control"
	});

	oApp.addPage(oPage);
	oApp.placeAt("content");



	// helper functions
	var fnGetControlProperty = function(mOptions) {

		// arrange
		var sProperty = mOptions.property.charAt(0).toUpperCase() + mOptions.property.slice(1);

		if (mOptions.invalidate) {
			oPage.addContent(mOptions.control);
			sap.ui.getCore().applyChanges();
		}

		// assert
		QUnit.test("method: get" + sProperty + "()", function(assert) {
			assert.strictEqual(mOptions.control["get" + sProperty](), mOptions.output, mOptions.description + " on " + mOptions.control);
		});

		// cleanup
		mOptions.control.destroy();
	};

	/* =========================================================== */
	/* HTML module                                                 */
	/* =========================================================== */

	QUnit.module("HTML");

	/* ------------------------------ */
	/* rendering                      */
	/* ------------------------------ */

	QUnit.test("rendering", function(assert) {
		var oSlider0 = new Slider();

		var oSlider1 = new Slider({
			width: "300px",
			value: 69,
			min: 10,
			max: 100,
			step: 1,
			progress: false,
			visible: false,
			enabled: false
		});

		var oSlider2 = new Slider({
			width: "250px",
			value: 67,
			min: 5,
			max: 90,
			step: 1,
			progress: true,
			visible: true,
			enabled: true,
			name: "slider1"
		});

		var oSlider3 = new Slider({
			value: 70,
			min: 10,
			max: 100,
			width: "150px",
			step: 5,
			progress : true,
			visible: true,
			enabled: true
		});

		var oSlider4 = new Slider({
			value: 27,
			width: "10em"
		});

		var oSlider5 = new Slider({
			value: 20,
			width: "15em",
			enabled: false
		});

		var oSlider6 = new Slider({
			value: 10.34,
			step: 0.1
		});

		var oSlider7 = new Slider({
			value: 50.34,
			step: 0.01,
			min: 50
		});

		var oSlider8 = new Slider({
			value: 150,
			step: 50,
			min: 0,
			max: 500
		});

		var oSlider9 = new Slider({
			value: 160,
			step: 0.5,
			min: 0,
			max: 500
		});

		var oSlider10 = new Slider({
			step: 0.01,
			value: 10.35,
			min: 0,
			max: 500
		});

		var oSlider11 = new Slider({
			step: 0.01,
			value: 66,
			min: 10.4,
			max: 500.5
		});

		// arrange
		oPage.addContent(oSlider0);
		oPage.addContent(oSlider1);
		oPage.addContent(oSlider2);
		oPage.addContent(oSlider3);
		oPage.addContent(oSlider4);
		oPage.addContent(oSlider5);
		oPage.addContent(oSlider6);
		oPage.addContent(oSlider7);
		oPage.addContent(oSlider8);
		oPage.addContent(oSlider9);
		oPage.addContent(oSlider10);
		oPage.addContent(oSlider11);
		sap.ui.getCore().applyChanges();

		var aSliders = [oSlider0, oSlider1, oSlider2, oSlider3, oSlider4, oSlider5, oSlider6, oSlider7, oSlider8, oSlider9, oSlider10, oSlider11];
		var CSS_CLASS = SliderRenderer.CSS_CLASS;

		// assert
		for (var iIndex = 0, oSlider; iIndex < aSliders.length; iIndex++) {
			oSlider = aSliders[iIndex];

			if (!oSlider.getVisible()) {
				continue;
			}

			if (oSlider.getEnabled()) {

				assert.ok(oSlider.getDomRef(), "The slider HTML DIV element container exist");
				assert.ok(oSlider.getDomRef("inner"), "The slider HTML DIV element exist");

				if (oSlider.getProgress()) {
					assert.ok(oSlider.getDomRef("progress"), "The slider progress indicator HTML DIV element exist");
				}

				assert.ok(oSlider.getDomRef("handle"), "The slider handle HTML Span element exist");

				if (oSlider.getName()) {
					assert.ok(oSlider.getDomRef("input"), "The slider HTML input element exist");
				} else {
					assert.ok(!oSlider.getDomRef("input"), "The slider HTML input element does not exist");
				}

				assert.ok(oSlider.$().hasClass(CSS_CLASS), 'The slider root HTML Div element "must have" the CSS class "' + CSS_CLASS + '"');
				assert.ok(oSlider.$("inner").hasClass(CSS_CLASS + "Inner"), 'The slider first-child HTML Div element "must have" the CSS class "' + CSS_CLASS + 'Inner"');

				if (oSlider.getProgress()) {
					assert.ok(oSlider.$("progress").hasClass(CSS_CLASS + "Progress"), 'The slider progress indicator HTML Div element "must have" the CSS class "' + CSS_CLASS + 'Progress"');
				}

				assert.ok(oSlider.$("handle").hasClass(CSS_CLASS + "Handle"), 'The slider handle HTML Span element "must have" the CSS class "' + CSS_CLASS + 'Handle"');

				if (oSlider.getName()) {
					assert.ok(oSlider.$("input").hasClass(CSS_CLASS + "Input"), 'The slider HTML Input element "must have" the CSS class "' + CSS_CLASS + 'Input"');
				}

				assert.strictEqual(jQuery(oSlider.getFocusDomRef()).attr("aria-disabled"), undefined, 'The "aria-disabled" attribute is not set');
			} else {
				assert.strictEqual(jQuery(oSlider.getFocusDomRef()).attr("aria-disabled"), "true", 'The "aria-disabled" attribute is set');
				assert.ok(oSlider.$().hasClass(CSS_CLASS + "Disabled"), 'The slider HTML DIV element container must have the CSS class "' + CSS_CLASS + 'Disabled"');
			}

			assert.strictEqual(jQuery.trim(oSlider.getDomRef().style.width), oSlider.getWidth(), 'Check if the style attribute has the correct value');
			assert.ok(oSlider.getDomRef("progress"), 'The slider div element "must have" the css class "' + CSS_CLASS + 'Progress"');
			assert.ok(oSlider.getDomRef("handle"), 'The slider span thumb element "must have" the css class "' + CSS_CLASS + 'Handle"');

			if (oSlider.getName()) {
				assert.strictEqual(oSlider.getValue(), +oSlider.$("input").attr("value"), 'The "value" attribute of the INPUT is 0');
				assert.strictEqual(oSlider.getValue(), +oSlider.$("input").prop("value"), 'The "value" property of the INPUT is 0');
			}

			// cleanup
			oSlider.destroy();
		}
	});


	QUnit.test("End labels should be rendered in correct order", function(assert) {

		var oSlider = new Slider();
		// arrange
		oSlider.setEnableTickmarks(true);
		oSlider.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.equal(oSlider.$().find(".sapMSliderLabel:eq(1)").html(), oSlider.getMax(), "The end label shows the max value");
		assert.equal(oSlider.$().find(".sapMSliderLabel:eq(1)").parent()[0].style.left, "100%", "The max label should be shown on the right side");
		assert.equal(oSlider.$().find(".sapMSliderLabel:eq(0)").parent()[0].style.left, "0%", "The min label should be shown on the left side");
		// clean up
		oSlider.destroy();

	});

	QUnit.test("it should render two handles", function(assert) {

		// system under test
		Slider.extend("sap.m.RangeSlider", {
			renderer: {
				renderHandles: function(oRm, oSlider) {
					this.renderHandle(oRm, oSlider, {
						id: oSlider.getId() + "-handle1"
					});
					this.renderHandle(oRm, oSlider, {
						id: oSlider.getId() + "-handle2"
					});
				}
			}
		});

		var oRangeSlider = new RangeSlider();

		// arrange
		oRangeSlider.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oRangeSlider.getDomRef("handle1"));
		assert.ok(oRangeSlider.getDomRef("handle2"));

		// cleanup
		oRangeSlider.destroy();
	});

	/* =========================================================== */
	/* API module                                                  */
	/* =========================================================== */

	QUnit.module("API");

	/* ------------------------------ */
	/* default Values                 */
	/* ------------------------------ */

	QUnit.test("default Values", function(assert) {

		// system under test
		var oSlider = new Slider();

		// arrange
		oPage.addContent(oSlider);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSlider.getWidth(), "100%", "Default slider width");
		assert.strictEqual(oSlider.getEnabled(), true, "By default the slider is enabled");
		assert.strictEqual(oSlider.getVisible(), true, "By default the slider is visible");
		assert.strictEqual(oSlider.getName(), "", 'By default the slider name is ""');
		assert.strictEqual(oSlider.getMin(), 0, "By default the slider min is 0");
		assert.strictEqual(oSlider.getMax(), 100, "By default the slider max is 100");
		assert.strictEqual(oSlider.getStep(), 1, "By default the slider step is 1");
		assert.strictEqual(oSlider.getProgress(), true, "By default the slider progress is true");
		assert.strictEqual(oSlider.getValue(), 0, "By default the slider value is 0");
		assert.strictEqual(oSlider.getEnableTickmarks(), false, "Default tickmarks visibility");
		assert.strictEqual(oSlider.getFocusDomRef().getAttribute("role"), "slider", "The role slider is set");
		assert.strictEqual(oSlider.getFocusDomRef().getAttribute("aria-orientation"), "horizontal", 'The "aria-orientation" attribute is set to "horizontal"');
		assert.strictEqual(oSlider.getFocusDomRef().getAttribute("aria-valuemin"), "0", 'The "aria-valuemin" attribute is set to its default value');
		assert.strictEqual(oSlider.getFocusDomRef().getAttribute("aria-valuemax"), "100", 'The "aria-valuemax" attribute is set to its default value');
		assert.strictEqual(oSlider.getFocusDomRef().getAttribute("aria-valuenow"), "0", 'The "aria-valuenow" attribute is set to its default value');
		assert.strictEqual(jQuery(oSlider.getFocusDomRef()).attr("aria-disabled"), undefined, 'The "aria-disabled" attribute is set not set by default');
		assert.strictEqual(oSlider.getDomRef("progress").getAttribute("aria-hidden"), "true");
		assert.strictEqual(oSlider.getShowAdvancedTooltip(), false, "By default the sliders advanced tooltips are not shown");
		assert.strictEqual(oSlider.getInputsAsTooltips(), false, "By default the sliders advanced tooltips are not of type input");

		// cleanup
		oSlider.destroy();
	});

	QUnit.test("_handlesLabels aggregation", function (assert) {
		// arrange & act
		var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m"),
			oBoundleCalledStub = this.stub(oResourceBundle, "getText"),
			oSlider = new Slider(),
			aLabels = oSlider.getAggregation("_handlesLabels"),
			oSliderWithTickmarks = new Slider({enableTickmarks: true}),
			aTickmarksLabels = oSliderWithTickmarks.getAggregation("_handlesLabels");

		oSlider.placeAt("content");
		oSliderWithTickmarks.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(aLabels.length, 1, "Label for handles should be added as an aggregation");
		assert.ok(oBoundleCalledStub.calledWith("SLIDER_HANDLE"), "Text should be regarding the handle");
		assert.strictEqual(oSlider.getDomRef("handle").getAttribute("aria-labelledby"), aLabels[0].getId());
		assert.strictEqual(oSliderWithTickmarks.getDomRef("handle").getAttribute("aria-labelledby"), aTickmarksLabels[0].getId());

		// cleanup
		oSlider.destroy();
	});

	QUnit.test("Aria labels forwarding to handle", function (assert) {
		// arrange & act
		var sHandleLabels,
			oSlider = new Slider({ariaLabelledBy: new Label({text: "LabelForSlider"})});

		oSlider.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		sHandleLabels = oSlider.getDomRef("handle").getAttribute("aria-labelledby");
		assert.ok(sHandleLabels.indexOf(oSlider.getAriaLabelledBy()[0]) > -1, "The slider's label is forwarded to its handle");

		// cleanup
		oSlider.destroy();
	});

	QUnit.test("Register and deregister the ResizeHandler", function(assert) {
		var oSlider = new Slider({
			width: "300px"
		});
		var fnRegisterResizeHandlerSpy = this.spy(oSlider, "_registerResizeHandler");
		var fnDeregisterResizeHandlerSpy = this.spy(oSlider, "_deregisterResizeHandler");
		oSlider.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(fnDeregisterResizeHandlerSpy.callCount, 1, "_deregisterResizeHandler should be called");
		assert.strictEqual(fnRegisterResizeHandlerSpy.callCount, 1, "_registerResizeHandler should be called");

		// act
		oSlider.destroy();

		//assert
		assert.strictEqual(fnDeregisterResizeHandlerSpy.callCount, 2, "_deregisterResizeHandler should be called twice");

		//clean
		oSlider.destroy();
		fnRegisterResizeHandlerSpy.restore();
		fnDeregisterResizeHandlerSpy.restore();
	});

	QUnit.test("_handleSliderResize is called after Slider is rendered", function(assert) {
		var oSlider = new Slider({
			width: "300px"
		});

		//arrange
		var fnHandleSliderResizeSpy = this.spy(oSlider, "_handleSliderResize");
		oSlider.placeAt("content");
		sap.ui.getCore().applyChanges();
		this.clock.tick(1);

		// assert
		assert.ok(fnHandleSliderResizeSpy.callCount, "_handleSliderResize was called");
		assert.ok(oSlider._parentResizeHandler, "Slider has resize handler.");

		//clean
		oSlider.destroy();
		fnHandleSliderResizeSpy.restore();
	});

	/* ------------------------------ */
	/* getWidth()                     */
	/* ------------------------------ */

	fnGetControlProperty({
		control: new Slider({
			width: "300px"
		}),
		property: "width",
		output: "300px",
		description: 'The width is "300px"'
	});

	fnGetControlProperty({
		control: new Slider({
			width: "10em"
		}),
		property: "width",
		output: "10em",
		description: 'The width is "10em"'
	});

	/* ------------------------------ */
	/* getMin()                       */
	/* ------------------------------ */

	fnGetControlProperty({
		control: new Slider({
			min: 10
		}),
		property: "min",
		output: 10,
		description: "The min is 10",
		invalidate: true
	});

	fnGetControlProperty({
		control: new Slider({
			min: 10
		}),
		property: "min",
		output: 10,
		description: "The min is 10"
	});

	/* ------------------------------ */
	/* getMax()                       */
	/* ------------------------------ */

	fnGetControlProperty({
		control: new Slider({
			max: 500.5
		}),
		property: "max",
		output: 500.5,
		description: "The max is 500.5"
	});

	fnGetControlProperty({
		control: new Slider({
			max: 90
		}),
		property: "max",
		output: 90,
		description: "The max is 90"
	});

	/* ------------------------------ */
	/* getStep()                      */
	/* ------------------------------ */

	fnGetControlProperty({
		control: new Slider({
			step: 1
		}),
		property: "step",
		output: 1,
		description: "The step is 1"
	});

	/* ------------------------------ */
	/* getProgress()                  */
	/* ------------------------------ */

	fnGetControlProperty({
		control: new Slider({
			progress: true
		}),
		property: "progress",
		output: true,
		description: "The progress is true"
	});

	fnGetControlProperty({
		control: new Slider({
			progress: false
		}),
		property: "progress",
		output: false,
		description: "The progress is false"
	});

	/* ------------------------------ */
	/* getVisible()                   */
	/* ------------------------------ */

	fnGetControlProperty({
		control: new Slider({
			visible: true
		}),
		property: "visible",
		output: true,
		description: "The control is visible"
	});

	fnGetControlProperty({
		control: new Slider({
			visible: false
		}),
		property: "visible",
		output: false,
		description: "The control is not visible"
	});

	/* ------------------------------ */
	/* getEnabled()                   */
	/* ------------------------------ */

	fnGetControlProperty({
		control: new Slider({
			enabled: true
		}),
		property: "enabled",
		output: true,
		description: "The control is enabled"
	});

	fnGetControlProperty({
		control: new Slider({
			enabled: false
		}),
		property: "enabled",
		output: false,
		description: "The control is not enabled"
	});

	/* ------------------------------ */
	/* setWidth()                     */
	/* ------------------------------ */

	QUnit.test("method: setWidth()", function(assert) {

		// system under test
		var oSlider = new Slider({
			width: "100px"
		});

		// arrange
		oPage.addContent(oSlider);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSlider.$().outerWidth() + "px", "100px", "Check the slider width after rendering");

		// cleanup
		oSlider.destroy();
	});

	/* ------------------------------ */
	/* setName()                      */
	/* ------------------------------ */

	QUnit.test("method: setName()", function(assert) {

		// system under test
		var oSlider = new Slider({
			name: "mySlider"
		});

		// arrange
		oPage.addContent(oSlider);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSlider.getValue(), +oSlider.$("input").attr("value"), 'Check the "value" attribute of the native input');
		assert.strictEqual(oSlider.$("input").attr("name"), "mySlider", 'Check the "value" attribute of the native input');

		// cleanup
		oSlider.destroy();
	});

	/* ------------------------------ */
	/* setValue()                     */
	/* ------------------------------ */

	QUnit.test("method: setValue() the value must not be bigger than the minimum", function(assert) {

		// system under test
		var oSlider = new Slider();

		// act
		var vReturnedValue = oSlider.setValue(45);
		oSlider.setMin(50);

		// arrange
		oPage.addContent(oSlider);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSlider.getValue(), 50);
		assert.strictEqual(vReturnedValue, oSlider);

		// cleanup
		oSlider.destroy();
	});

	QUnit.test("method: setValue() the value must not be bigger than the maximum", function(assert) {

		// system under test
		var oSlider = new Slider({
			value: 101,
			max: 100,
			min: 0,
			step: 1
		});

		// arrange
		oPage.addContent(oSlider);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSlider.getValue(), 100);

		// cleanup
		oSlider.destroy();
	});

	QUnit.test("method: setValue() the value has to be in a valid step", function(assert) {

		// system under test
		var oSlider = new Slider({
			step: 5,
			value: 92.5,
			min: 0,
			max: 100
		});

		// arrange
		oPage.addContent(oSlider);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSlider.getValue(), 95);

		// cleanup
		oSlider.destroy();
	});

	QUnit.test("method: setValue() the value has to be in a valid step", function(assert) {

		// system under test
		var oSlider = new Slider({
			step: 5,
			value: 92.4,
			max: 100,
			min: 0
		});

		// arrange
		oPage.addContent(oSlider);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSlider.getValue(), 90);

		// cleanup
		oSlider.destroy();
	});

	QUnit.test("method: setValue()", function(assert) {

		// system under test
		var oSlider = new Slider({
			value: 90
		});

		// arrange
		oPage.addContent(oSlider);
		sap.ui.getCore().applyChanges();

		var log = sap.ui.require('sap/base/Log'),
			fnErrorSpy = this.spy(log, "error");

		// act
		var oReturnedValue = oSlider.setValue("96");	// string
		oSlider.setValue(NaN);
		oSlider.setValue(Infinity);
		oSlider.setValue(1e+309);	// infinite positive number
		oSlider.setValue(-1e+309);	// infinite negative number

		// assert
		assert.strictEqual(fnErrorSpy.callCount, 0, "sap.base.log.error method was not called");
		assert.strictEqual(oSlider.getValue(), 90);
		assert.equal(oReturnedValue, oSlider);

		// cleanup
		oSlider.destroy();
	});

	QUnit.test('method: setValue() the attribute "aria-valuenow" is updated accordingly (initial rendering)', function(assert) {

		// system under test
		var oSlider = new Slider({
			value: 50
		});

		// arrange
		oSlider.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSlider.getFocusDomRef().getAttribute("aria-valuenow"), "50");

		// cleanup
		oSlider.destroy();
	});

	QUnit.test('method: setValue() the attribute "aria-valuenow" is updated accordingly', function(assert) {

		// system under test
		var oSlider = new Slider();

		// arrange
		oSlider.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSlider.setValue(50);

		// assert
		assert.strictEqual(oSlider.getFocusDomRef().getAttribute("aria-valuenow"), "50");

		// cleanup
		oSlider.destroy();
	});

	QUnit.test("it should not round the value", function(assert) {

		// system under test
		var oSlider = new Slider({
			step:  0.0000000001,
			value: 0.5555555555
		});

		// arrange
		oSlider.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSlider.getValue(), 0.5555555555);

		// cleanup
		oSlider.destroy();
	});

	QUnit.test("it should corretly render the progress bar and handle elements", function(assert) {

		// system under test
		var oSlider = new Slider({
			value: -2.437456030974558,
			step: 0.000000000000001,
			min: -2.437456030974558,
			max: 5.950642552587727
		});

		// arrange
		oSlider.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSlider.getDomRef("progress").style.width, "0%");
		assert.strictEqual(oSlider.getDomRef("handle").style.left, "0%");

		// cleanup
		oSlider.destroy();
	});

	QUnit.test("it should corretly render the progress bar and handle elements", function(assert) {

		// system under test
		var oSlider = new Slider({
			step: 1,
			min: 0,
			max: 10
		});

		// arrange
		oSlider.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSlider.setValue(50);

		// assert
		assert.strictEqual(oSlider.getDomRef("progress").style.width, "100%");
		assert.strictEqual(oSlider.getDomRef("handle").style.left, "100%");

		// cleanup
		oSlider.destroy();
	});

	QUnit.test("it should correctly round the value to the nearest step", function(assert) {

		// system under test
		var oSlider = new Slider({
			value: 12.3,
			min: 10,
			max: 20,
			step: 3
		});

		// arrange
		oSlider.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSlider.getValue(), 13);

		// cleanup
		oSlider.destroy();
	});

	// BCP: 1580215885
	QUnit.test("it should not throw an exception when the id has a dot", function(assert) {

		// system under test
		var oSlider = new Slider({
			id: "my.Slider"
		});

		// arrange
		oSlider.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oSlider.setValue(50);

		// assert
		assert.strictEqual(oSlider.getValue(), 50);

		// cleanup
		oSlider.destroy();
	});

	QUnit.test("it should display values using the fixed-point notation instead of the e-notation (initial rendering)", function(assert) {

		// system under test
		var oSlider = new Slider({
			name: "lorem ipsum",
			step: 1e-7,
			min: 1e-7,
			max: 5e-7,
			value: 5e-7
		});

		// arrange
		oSlider.placeAt("content");
		sap.ui.getCore().applyChanges();
		var oHandleDomRef = oSlider.getDomRef("handle");

		// assert
		assert.strictEqual(oHandleDomRef.title, "0.0000005");
		assert.strictEqual(oHandleDomRef.getAttribute("aria-valuenow"), "0.0000005");
		assert.strictEqual(oSlider.getDomRef("input").value, "0.0000005");
		assert.strictEqual(oHandleDomRef.getAttribute("aria-valuemin"), "0.0000001");
		assert.strictEqual(oHandleDomRef.getAttribute("aria-valuemax"), "0.0000005");

		// cleanup
		oSlider.destroy();
	});

	QUnit.test("it should display values using the fixed-point notation instead of the e-notation", function(assert) {

		// system under test
		var oSlider = new Slider({
			name: "lorem ipsum",
			step: 1e-7,
			min: 1e-7,
			max: 5e-7
		});

		// arrange
		oSlider.placeAt("content");
		sap.ui.getCore().applyChanges();
		var oHandleDomRef = oSlider.getDomRef("handle");

		// act
		oSlider.setValue(5e-7);

		// assert
		assert.strictEqual(oHandleDomRef.title, "0.0000005");
		assert.strictEqual(oHandleDomRef.getAttribute("aria-valuenow"), "0.0000005");
		assert.strictEqual(oSlider.getDomRef("input").value, "0.0000005");
		assert.strictEqual(oHandleDomRef.getAttribute("aria-valuemin"), "0.0000001");
		assert.strictEqual(oHandleDomRef.getAttribute("aria-valuemax"), "0.0000005");

		// cleanup
		oSlider.destroy();
	});

	QUnit.test("it should display values using the fixed-point notation instead of the e-notation (labels)", function(assert) {

		// system under test
		var oSlider = new Slider({
			step: 1e-7,
			min: 1e-7,
			max: 5e-7,
			value: 5e-7,
			enableTickmarks: true,
			scale: new ResponsiveScale({tickmarksBetweenLabels: 1})
		});

		// arrange
		oSlider.placeAt("content");
		sap.ui.getCore().applyChanges();
		var oHandleDomRef = oSlider.$().find(".sapMSliderLabel");

		// assert
		assert.ok(oHandleDomRef.size() > 0, "Have initialized the labels");
		assert.strictEqual(oHandleDomRef.eq(0).text(), "0.0000001", "Have properly set the first value");
		assert.strictEqual(oHandleDomRef.eq(4).text(), "0.0000005", "Have properly set the last value");

		// cleanup
		oSlider.destroy();
	});

	/* ------------------------------ */
	/* setMin()                       */
	/* ------------------------------ */

	QUnit.test("method: setMin() the minimum must not be bigger than the maximum", function(assert) {

		// system under test
		var oSlider = new Slider({
			min: 150,
			max: 100
		});

		// arrange
		var log = sap.ui.require('sap/base/Log'),
			fnWarningSpy = this.spy(log, "warning");

		oPage.addContent(oSlider);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(fnWarningSpy.callCount, 1, "sap.base.log.Warning method was called");

		// cleanup
		oSlider.destroy();
	});

	QUnit.test('method: setMin() the attribute "aria-valuemin" is updated accordingly (initial rendering)', function(assert) {

		// system under test
		var oSlider = new Slider({
			min: 5
		});

		// arrange
		oSlider.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSlider.getFocusDomRef().getAttribute("aria-valuemin"), "5");

		// cleanup
		oSlider.destroy();
	});

	QUnit.test('it should display the "aria-valuemin" attribute using the fixed-point notation', function(assert) {

		// system under test
		var oSlider = new Slider({
			step: 1.5,
			min: 1e+7
		});

		// arrange
		oSlider.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSlider.getFocusDomRef().getAttribute("aria-valuemin"), "10000000");

		// cleanup
		oSlider.destroy();
	});

	/* ------------------------------ */
	/* setMax()                       */
	/* ------------------------------ */

	QUnit.test('method: setMax() the attribute "aria-valuemax" is updated accordingly (initial rendering)', function(assert) {

		// system under test
		var oSlider = new Slider({
			max: 200
		});

		// arrange
		oSlider.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSlider.getFocusDomRef().getAttribute("aria-valuemax"), "200");

		// cleanup
		oSlider.destroy();
	});

	QUnit.test('it should display the "aria-valuemax" attribute using the fixed-point notation', function(assert) {

		// system under test
		var oSlider = new Slider({
			step: 1.5,
			max: 1e+7
		});

		// arrange
		oSlider.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSlider.getFocusDomRef().getAttribute("aria-valuemax"), "10000000");

		// cleanup
		oSlider.destroy();
	});

	/* ------------------------------ */
	/* setProgress()                  */
	/* ------------------------------ */

	QUnit.test("method: setProgress()", function(assert) {

		// system under test
		var oSlider = new Slider({
			progress: true
		});

		// arrange
		oPage.addContent(oSlider);
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSlider.getDomRef("progress"), "The progress indicator HTMLDivElement is in DOM");
		assert.ok(oSlider.$("progress").hasClass(SliderRenderer.CSS_CLASS + "Progress"), 'Check if the slider has the CSS class "' + SliderRenderer.CSS_CLASS + 'Progress"');

		// cleanup
		oSlider.destroy();
	});

	/* ------------------------------ */
	/* stepUp()                       */
	/* ------------------------------ */

	QUnit.test("method: stepUp()", function(assert) {

		// system under test
		var oSlider = new Slider({
			step: 5,
			min: 0,
			max: 100
		});

		// act
		oSlider.stepUp(2);

		// assert
		assert.strictEqual(oSlider.getValue(), 10);

		// cleanup
		oSlider.destroy();
	});

	QUnit.test("method: stepUp()", function(assert) {

		// system under test
		var oSlider = new Slider({
			step: 5,
			min: 0,
			max: 100
		});

		// act
		oSlider.stepUp(20);

		// assert
		assert.strictEqual(oSlider.getValue(), 100);

		// cleanup
		oSlider.destroy();
	});

	// BCP: 1580185288
	QUnit.test("it should not snap the value", function(assert) {

		// system under test
		var oSlider = new Slider({
			value: 10,
			step: 3
		});

		// act
		oSlider.stepUp(1);

		// assert
		assert.strictEqual(oSlider.getValue(), 13);

		// cleanup
		oSlider.destroy();
	});

	/* ------------------------------ */
	/* stepDown()                     */
	/* ------------------------------ */

	QUnit.test("method: stepDown()", function(assert) {

		// system under test
		var oSlider = new Slider({
			value: 50,
			step: 5,
			min: 0,
			max: 100
		});

		// act
		oSlider.stepDown(2);

		// assert
		assert.strictEqual(oSlider.getValue(), 40);

		// cleanup
		oSlider.destroy();
	});

	QUnit.test("method: stepDown()", function(assert) {

		// system under test
		var oSlider = new Slider({
			value: 50,
			step: 5,
			min: 0,
			max: 100
		});

		// act
		oSlider.stepDown(20);

		// assert
		assert.strictEqual(oSlider.getValue(), 0);

		// cleanup
		oSlider.destroy();
	});

	// BCP: 1580185288
	QUnit.test("it should not snap the value", function(assert) {

		// system under test
		var oSlider = new Slider({
			value: 10,
			step: 3
		});

		// act
		oSlider.stepDown(1);

		// assert
		assert.strictEqual(oSlider.getValue(), 7);

		// cleanup
		oSlider.destroy();
	});

	/* ------------------------------ */
	/* setStep()                      */
	/* ------------------------------ */

	QUnit.test("method: setStep() should give a warning when called with faulty parameter", function(assert) {

		// system under test
		var oSlider = new Slider({
			value: 50,
			step: 1
		}),
			log = sap.ui.require('sap/base/Log'),
			fnWarningSpy = this.spy(log, "warning");

		// arrange
		oPage.addContent(oSlider);
		sap.ui.getCore().applyChanges();

		// act
		oSlider.setStep(-1);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSlider.getStep(), -1);
		assert.strictEqual(oSlider.getValue(), 50);
		assert.strictEqual(fnWarningSpy.callCount, 1);

		// cleanup
		oSlider.destroy();
	});

	/* ------------------------------ */
	/* getPrecisionOfNumber()         */
	/* ------------------------------ */

	QUnit.test("it should return the precision of the number", function(assert) {
		assert.strictEqual(Slider.prototype.getDecimalPrecisionOfNumber(1), 0);
		assert.strictEqual(Slider.prototype.getDecimalPrecisionOfNumber(3.125e7), 0);
		assert.strictEqual(Slider.prototype.getDecimalPrecisionOfNumber(1.2), 1);
		assert.strictEqual(Slider.prototype.getDecimalPrecisionOfNumber(1.12345), 5);
		assert.strictEqual(Slider.prototype.getDecimalPrecisionOfNumber(0.437456030974558), 15);
		assert.strictEqual(Slider.prototype.getDecimalPrecisionOfNumber(0.000000000000001), 15);
		assert.strictEqual(Slider.prototype.getDecimalPrecisionOfNumber(1e-19), 19);
		assert.strictEqual(Slider.prototype.getDecimalPrecisionOfNumber(1.666e-7), 10);
	});

	/* ------------------------------ */
	/* handle tooltip                 */
	/* ------------------------------ */

	QUnit.test("it should render the handle tooltip (test case 1)", function(assert) {

		// system under test
		var oSlider = new Slider({
			showHandleTooltip: true
		});

		// arrange
		oPage.addContent(oSlider);
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSlider.getDomRef("handle").hasAttribute("title"));

		// cleanup
		oSlider.destroy();
	});

	QUnit.test("it should render the handle tooltip (test case 2)", function(assert) {

		// system under test
		var oSlider = new Slider();

		// arrange
		oPage.addContent(oSlider);
		sap.ui.getCore().applyChanges();

		// act
		oSlider.setValue(5);

		// assert
		assert.ok(oSlider.getDomRef("handle").hasAttribute("title"));

		// cleanup
		oSlider.destroy();
	});

	QUnit.test("it should not render the handle tooltip (test case 1)", function(assert) {

		// system under test
		var oSlider = new Slider({
			showHandleTooltip: false
		});

		// arrange
		oPage.addContent(oSlider);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oSlider.getDomRef("handle").hasAttribute("title"), false);

		// cleanup
		oSlider.destroy();
	});

	QUnit.test("it should not render the handle tooltip (test case 2)", function(assert) {

		// system under test
		var oSlider = new Slider({
			showHandleTooltip: false
		});

		// arrange
		oPage.addContent(oSlider);
		sap.ui.getCore().applyChanges();

		// act
		oSlider.setValue(5);

		// assert
		assert.strictEqual(oSlider.getDomRef("handle").hasAttribute("title"), false);

		// cleanup
		oSlider.destroy();
	});

	/* =========================================================== */
	/* Events module                                               */
	/* =========================================================== */

	QUnit.module("Events");

	/* ------------------------------ */
	/* touchstart                     */
	/* ------------------------------ */

	QUnit.test("Firing events: touchstart", function(assert) {

		// system under test
		var oSlider = new Slider({
			width: "250px",
			value: 67,
			min: 5,
			max: 90,
			step: 1
		});

		// arrange
		oPage.addContent(oSlider);
		sap.ui.getCore().applyChanges();

		var fnFocus = this.spy(oSlider.getDomRef("handle"), "focus");
		var oTouches = {
			0: {
				pageX: 150,
				length: 1
			},

			length: 1
		};

		// act
		qutils.triggerTouchEvent("touchstart", oSlider.getDomRef(), {
			targetTouches: oTouches,
			srcControl: oSlider
		});

		this.clock.tick(1);

		// assert
		assert.ok(oSlider.$("inner").hasClass(SliderRenderer.CSS_CLASS + "Pressed"), 'On touchstart event the slider innner div muss have the CSS class “' + SliderRenderer.CSS_CLASS + 'Pressed”');
		assert.ok(jQuery(oSlider.getFocusDomRef()).hasClass(SliderRenderer.CSS_CLASS + "Handle"), "The focus should be in the slider handle");
		assert.ok(fnFocus.called);

		// cleanup
		oSlider.destroy();
	});

	/* ----------------------------------- */
	/* touchmove                           */
	/* ----------------------------------- */

	QUnit.test("Firing events: touchmove", function(assert) {

		// system under test
		var oSlider = new Slider({
			value: 0,
			width: "100px",
			min: 0,
			max: 100
		}).addStyleClass("sapMSliderWithoutPadding");

		// arrange
		oPage.addContent(oSlider);
		sap.ui.getCore().applyChanges();

		var oTouches = {
			0: {
				pageX: 50
			},

			length: 1
		};

		// act
		qutils.triggerTouchEvent("touchstart", oSlider.getDomRef(), {
			targetTouches: oTouches,
			srcControl: oSlider
		});

		for (var i = 51; i <= 100; i++) {

			oTouches["0"].pageX = i;

			qutils.triggerTouchEvent("touchmove", oSlider.getDomRef(), {
				targetTouches: oTouches,
				pageX: i
			}, '_on');

			// assert
			assert.strictEqual(oSlider.getValue(), i);
		}

		qutils.triggerTouchEvent("touchend", oSlider.getDomRef(), {
			targetTouches: oTouches
		}, '_on');

		// assert
		assert.strictEqual(oSlider.getValue(), 100);

		// cleanup
		oSlider.destroy();
	});

	/* ----------------------------------- */
	/* tap                                 */
	/* ----------------------------------- */

	function fnTapTestCase(iPageX) {
		QUnit.test("Firing events: tap", function(assert) {

			// system under test
			var oSlider = new Slider({
				value: 0,
				width: "100px",
				min: 0,
				max: 100
			}).addStyleClass("sapMSliderWithoutPadding");

			// arrange
			oPage.addContent(oSlider);
			sap.ui.getCore().applyChanges();

			var oTouches = {
				0: {
					pageX: iPageX
				},

				length: 1
			};

			var fnHasEventListeners = function(oDomRef, sEventType) {
				var aEventListeners = jQuery._data(oDomRef, "events")[sEventType] || [];

				if (!aEventListeners.length) {
					return false;
				}

				return aEventListeners.some(function(oEventListener) {
					return oEventListener.namespace === SliderRenderer.CSS_CLASS;
				});
			};

			// act
			qutils.triggerTouchEvent("touchstart", oSlider.getDomRef(), {
				targetTouches: oTouches,
				srcControl: oSlider
			});

			qutils.triggerTouchEvent("touchend", oSlider.getDomRef(), {
				targetTouches: oTouches,
				srcControl: oSlider
			}, '_on');

			// assert
			assert.strictEqual(oSlider.getValue(), iPageX);
			assert.ok(!oSlider.$("inner").hasClass(SliderRenderer.CSS_CLASS + "Pressed"), 'On touchend the slider muss not have the CSS class “' + SliderRenderer.CSS_CLASS + 'Pressed”');
			assert.strictEqual(fnHasEventListeners(document, "touchend"), false);
			assert.strictEqual(fnHasEventListeners(document, "touchcancel"), false);
			assert.strictEqual(fnHasEventListeners(document, "mouseup"), false);

			// cleanup
			oSlider.destroy();
		});
	}

	for (var iPageX = 0; iPageX < 100; iPageX++) {
		fnTapTestCase(iPageX);
	}

	/* ------------------------------ */
	/* change and liveChange          */
	/* ------------------------------ */

	QUnit.test("Firing events: change and liveChange", function(assert) {

		// system under test
		var oSlider = new Slider().addStyleClass("sapMSliderWithoutPadding");

		// arrange
		oPage.addContent(oSlider);
		sap.ui.getCore().applyChanges();

		var oTouches = {
			0: {
				pageX: 150,
				length: 1
			},

			length: 1
		};

		var fnFireLiveChangeSpy = this.spy(oSlider, "fireLiveChange");
		var fnFireChangeSpy = this.spy(oSlider, "fireChange");

		// act
		qutils.triggerTouchEvent("touchstart", oSlider.getDomRef(), {
			targetTouches: oTouches,
			srcControl: oSlider
		});

		qutils.triggerTouchEvent("touchend", oSlider.getDomRef(), {
			targetTouches: oTouches,
			srcControl: oSlider
		}, '_on');

		// assert
		assert.strictEqual(fnFireLiveChangeSpy.callCount, 1, 'The "livechange" event handler must be fired exactly once');
		assert.strictEqual(fnFireChangeSpy.callCount, 1, 'The "change" event handler must be fired exactly once');

		// cleanup
		oSlider.destroy();
	});

	/* ------------------------------ */
	/* onsapincrease                  */
	/* ------------------------------ */

	QUnit.test("Firing events: onsapincrease", function(assert) {

		// system under test
		var oSlider = new Slider({
			value: 99
		});

		// arrange
		var fnFireChangeSpy = this.spy(oSlider, "fireChange");
		var fnFireLiveChangeSpy = this.spy(oSlider, "fireLiveChange");
		var fnIncreaseSpy = this.spy(oSlider, "onsapincrease");

		oPage.addContent(oSlider);
		sap.ui.getCore().applyChanges();

		// act
		qutils.triggerKeydown(oSlider.getDomRef(), KeyCodes.ARROW_RIGHT);
		qutils.triggerKeydown(oSlider.getDomRef(), KeyCodes.ARROW_RIGHT);

		// assert
		assert.strictEqual(oSlider.getValue(), 100, "The slider value must be increased to 100");
		assert.strictEqual(fnIncreaseSpy.callCount, 2);
		assert.strictEqual(fnFireChangeSpy.callCount, 1);
		assert.strictEqual(fnFireLiveChangeSpy.callCount, 1);

		// cleanup
		oSlider.destroy();
	});

	/* ------------------------------ */
	/* onsapincreasemodifiers         */
	/* ------------------------------ */

	function fnOnIncreaseModifiersTestCase(mOptions) {
		QUnit.test("Firing events: onsapincreasemodifiers", function(assert) {

			// system under test
			var oSlider = mOptions.control;

			// arrange
			var fnFireChangeSpy = this.spy(oSlider, "fireChange");
			var fnFireLiveChangeSpy = this.spy(oSlider, "fireLiveChange");
			this.spy(oSlider, "onsapincreasemodifiers");

			oPage.addContent(oSlider);
			sap.ui.getCore().applyChanges();

			// act
			qutils.triggerKeydown(oSlider.getDomRef(), KeyCodes.ARROW_RIGHT, false, false, /* Ctrl key */ true);

			// assert
			assert.strictEqual(oSlider.getValue(), mOptions.expectedValue, "The slider value must be increased to " + mOptions.expectedValue);
			assert.strictEqual(fnFireChangeSpy.callCount, 1);
			assert.strictEqual(fnFireLiveChangeSpy.callCount, 1);

			// cleanup
			oSlider.destroy();
		});
	}

	fnOnIncreaseModifiersTestCase({
		control: new Slider({
			min: 0,
			max: 100,
			step: 1,
			value: 0
		}),

		expectedValue: 10
	});

	fnOnIncreaseModifiersTestCase({
		control: new Slider({
			min: 5,
			max: 10,
			step: 1,
			value: 0
		}),

		expectedValue: 6
	});

	fnOnIncreaseModifiersTestCase({
		control: new Slider({
			min: -100,
			max: 0,
			step: 2,
			value: -100
		}),

		expectedValue: -90
	});

	/* ------------------------------ */
	/* onsapdecrease                  */
	/* ------------------------------ */

	QUnit.test("Firing events: onsapdecrease", function(assert) {

		// system under test
		var oSlider = new Slider({
			value: 1
		});

		// arrange
		var fnFireChangeSpy = this.spy(oSlider, "fireChange");
		var fnFireLiveChangeSpy = this.spy(oSlider, "fireLiveChange");
		var fnDecreaseSpy = this.spy(oSlider, "onsapdecrease");

		oPage.addContent(oSlider);
		sap.ui.getCore().applyChanges();

		// act
		qutils.triggerKeydown(oSlider.getDomRef(), KeyCodes.ARROW_LEFT);
		qutils.triggerKeydown(oSlider.getDomRef(), KeyCodes.ARROW_LEFT);

		// assert
		assert.strictEqual(oSlider.getValue(), 0, "The slider value must be decreased to 0");
		assert.strictEqual(fnDecreaseSpy.callCount, 2);
		assert.strictEqual(fnFireChangeSpy.callCount, 1);
		assert.strictEqual(fnFireLiveChangeSpy.callCount, 1);

		// cleanup
		oSlider.destroy();
	});

	/* ------------------------------ */
	/* onsapdecreasemodifiers         */
	/* ------------------------------ */

	function fnOnDecreaseModifiersTestCase(mOptions) {
		QUnit.test("Firing events: onsapdecreasemodifiers", function(assert) {

			// system under test
			var oSlider = mOptions.control;

			// arrange
			var fnFireChangeSpy = this.spy(oSlider, "fireChange");
			var fnFireLiveChangeSpy = this.spy(oSlider, "fireLiveChange");
			var fnDecreaseModifiersSpy = this.spy(oSlider, "onsapdecreasemodifiers");

			oPage.addContent(oSlider);
			sap.ui.getCore().applyChanges();

			// act
			qutils.triggerKeydown(oSlider.getDomRef(), KeyCodes.ARROW_LEFT, false, false, /* Ctrl key */ true);

			// assert
			assert.strictEqual(oSlider.getValue(), mOptions.expectedValue, "The slider value must be decreased to " + mOptions.expectedValue);
			assert.strictEqual(fnDecreaseModifiersSpy.callCount, 1);
			assert.strictEqual(fnFireChangeSpy.callCount, 1);
			assert.strictEqual(fnFireLiveChangeSpy.callCount, 1);

			// cleanup
			oSlider.destroy();
		});
	}

	fnOnDecreaseModifiersTestCase({
		control: new Slider({
			min: 0,
			max: 100,
			step: 1,
			value: 100
		}),

		expectedValue: 90
	});

	fnOnDecreaseModifiersTestCase({
		control: new Slider({
			min: 5,
			max: 10,
			step: 1,
			value: 10
		}),

		expectedValue: 9
	});

	fnOnDecreaseModifiersTestCase({
		control: new Slider({
			min: -100,
			max: 0,
			step: 2,
			value: 0
		}),

		expectedValue: -10
	});

	/* ------------------------------ */
	/* onsappageup                    */
	/* ------------------------------ */

	QUnit.test("Firing events: onsappageup", function(assert) {

		// system under test
		var oSlider = new Slider({
			value: 99
		});

		// arrange
		var fnFireChangeSpy = this.spy(oSlider, "fireChange");
		var fnFireLiveChangeSpy = this.spy(oSlider, "fireLiveChange");
		var fnPageUpSpy = this.spy(oSlider, "onsappageup");

		oPage.addContent(oSlider);
		sap.ui.getCore().applyChanges();

		// act
		qutils.triggerKeydown(oSlider.getDomRef(), KeyCodes.PAGE_UP);

		// assert
		assert.strictEqual(oSlider.getValue(), 100, "The slider value must be increased to 100");
		assert.strictEqual(fnPageUpSpy.callCount, 1);
		assert.strictEqual(fnFireChangeSpy.callCount, 1);
		assert.strictEqual(fnFireLiveChangeSpy.callCount, 1);

		// cleanup
		oSlider.destroy();
	});

	/* ------------------------------ */
	/* onsappagedown                  */
	/* ------------------------------ */

	QUnit.test("Firing events: onsappagedown", function(assert) {

		// system under test
		var oSlider = new Slider({
			value: 1
		});

		// arrange
		var fnFireChangeSpy = this.spy(oSlider, "fireChange");
		var fnFireLiveChangeSpy = this.spy(oSlider, "fireLiveChange");
		var fnPageDownSpy = this.spy(oSlider, "onsappagedown");

		oPage.addContent(oSlider);
		sap.ui.getCore().applyChanges();

		// act
		qutils.triggerKeydown(oSlider.getDomRef(), KeyCodes.PAGE_DOWN);

		// assert
		assert.strictEqual(oSlider.getValue(), 0, "The slider value must be increased to 0");
		assert.strictEqual(fnPageDownSpy.callCount, 1);
		assert.strictEqual(fnFireChangeSpy.callCount, 1);
		assert.strictEqual(fnFireLiveChangeSpy.callCount, 1);

		// cleanup
		oSlider.destroy();
	});

	/* ------------------------------ */
	/* onsaphome                      */
	/* ------------------------------ */

	QUnit.test("Firing events: onsaphome", function(assert) {

		// system under test
		var oSlider = new Slider({
			value: 90
		});

		// arrange
		var fnFireChangeSpy = this.spy(oSlider, "fireChange");
		var fnFireLiveChangeSpy = this.spy(oSlider, "fireLiveChange");
		var fnHomeSpy = this.spy(oSlider, "onsaphome");

		oPage.addContent(oSlider);
		sap.ui.getCore().applyChanges();

		// act
		qutils.triggerKeydown(oSlider.getDomRef(), KeyCodes.HOME);
		qutils.triggerKeydown(oSlider.getDomRef(), KeyCodes.HOME);

		// assert
		assert.strictEqual(oSlider.getValue(), 0);
		assert.strictEqual(fnHomeSpy.callCount, 2);
		assert.strictEqual(fnFireChangeSpy.callCount, 1);
		assert.strictEqual(fnFireLiveChangeSpy.callCount, 1);

		// cleanup
		oSlider.destroy();
	});

	/* ------------------------------ */
	/* onsapend                       */
	/* ------------------------------ */

	QUnit.test("Firing events: onsapend", function(assert) {

		// system under test
		var oSlider = new Slider();

		// arrange
		var fnFireChangeSpy = this.spy(oSlider, "fireChange");
		var fnFireLiveChangeSpy = this.spy(oSlider, "fireLiveChange");
		var fnEndSpy = this.spy(oSlider, "onsapend");

		oPage.addContent(oSlider);
		sap.ui.getCore().applyChanges();

		// act
		qutils.triggerKeydown(oSlider.getDomRef(), KeyCodes.END);
		qutils.triggerKeydown(oSlider.getDomRef(), KeyCodes.END);

		// assert
		assert.strictEqual(oSlider.getValue(), 100);
		assert.strictEqual(fnEndSpy.callCount, 2);
		assert.strictEqual(fnFireChangeSpy.callCount, 1);
		assert.strictEqual(fnFireLiveChangeSpy.callCount, 1);

		// cleanup
		oSlider.destroy();
	});

	QUnit.test("SAP modifiers events: Global ALT + Arrow", function (assert) {
		var oRangeSlider = new Slider(),
			oMockEvent = {
				srcControl: oRangeSlider,
				altKey: true,
				preventDefault: function () {},
				setMarked: function () {}
			},
			oEventSpyPreventDefault = this.spy(oMockEvent, "preventDefault"),
			oEventSpySetMarked = this.spy(oMockEvent, "setMarked");

		// Act
		oRangeSlider.onsapincreasemodifiers(oMockEvent);

		// Assert
		assert.ok(oEventSpyPreventDefault.callCount === 0, "The method is skipped and the event went to the global KH");
		assert.ok(oEventSpySetMarked.callCount === 0, "The method is skipped and the event went to the global KH");

		// Act
		oRangeSlider.onsapdecreasemodifiers(oMockEvent);

		// Assert
		assert.ok(oEventSpyPreventDefault.callCount === 0, "The method is skipped and the event went to the global KH");
		assert.ok(oEventSpySetMarked.callCount === 0, "The method is skipped and the event went to the global KH");
	});

	/* ------------------------------ */
	/* oInput change               */
	/* ------------------------------ */

	QUnit.test("Tooltip firing events: fire change should fire Slider's change and livechange", function(assert) {

		// system under test
		var oSlider = new Slider({
			step: 0.05,
			value: 0.5,
			min: 0,
			max: 1,
			showAdvancedTooltip: true,
			inputsAsTooltips: true
		});

		// arrange
		var fnFireChangeSpy = this.spy(oSlider, "fireChange");
		var fnFireLiveChangeSpy = this.spy(oSlider, "fireLiveChange");

		oPage.addContent(oSlider);
		sap.ui.getCore().applyChanges();

		oSlider.getAggregation("_tooltipContainer").show(oSlider);
		oSlider.getAggregation("_defaultTooltips")[0].fireChange({ value: 0.45 });

		// assert
		assert.strictEqual(oSlider.getValue(), 0.45, "The slider value must be decreased to 0.45");
		assert.strictEqual(fnFireChangeSpy.callCount, 1);
		assert.strictEqual(fnFireLiveChangeSpy.callCount, 1);

		// cleanup
		oSlider.destroy();
	});

	/* =========================================================== */
	/* RTL module                                                  */
	/* =========================================================== */

	QUnit.module("RTL", {
		beforeEach: function () {
			sap.ui.getCore().getConfiguration().setRTL(true);
			this.oSlider = new Slider();
		},
		afterEach: function () {
			sap.ui.getCore().getConfiguration().setRTL(false);
			this.oSlider.destroy();
		}
	});

	QUnit.test("End labels should be rendered in correct order when in RTL mode", function(assert) {

		// arrange
		this.oSlider.setEnableTickmarks(true);
		this.oSlider.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assert
		assert.equal(this.oSlider.$().find(".sapMSliderLabel:eq(0)").html(), this.oSlider.getMin(), "The start label shows the min value");
		assert.equal(this.oSlider.$().find(".sapMSliderLabel:eq(0)").parent()[0].style.right, "0%", "The min label should be shown on the right side");
		assert.equal(this.oSlider.$().find(".sapMSliderLabel:eq(1)").parent()[0].style.right, "100%", "The max label should be shown on the left side");
	});

	QUnit.module('Scale');

	QUnit.test("Slider with scale, should fallback to default one, after the scale is destroyed", function(assert) {
			var oSlider, oDefaultScale, oHandleLabelsDomRef,
				oScale = new ResponsiveScale({tickmarksBetweenLabels: 1});

			oScale.getLabel = function (fCurValue, oSlider) {
				var monthList = ["Zero", "One", "2"];

				return monthList[fCurValue];
			};

			oSlider = new Slider({
				step: 1,
				min: 0,
				max: 2,
				enableTickmarks: true,
				scale: oScale
			});

			// arrange
			oSlider.placeAt("content");
			sap.ui.getCore().applyChanges();
			oHandleLabelsDomRef = oSlider.$().find(".sapMSliderLabel");

			// assert
			assert.strictEqual(oScale.sId, oSlider._getUsedScale().sId, "The _getUsedScale function, should return the user defined scale.");
			assert.strictEqual(oHandleLabelsDomRef.size(), 3, "There should be 3 labels created");
			assert.strictEqual(oHandleLabelsDomRef.eq(0).text(), "Zero", "The labels should be added correspondingly");
			assert.strictEqual(oHandleLabelsDomRef.eq(2).text(), "2", "The labels should be added correspondingly");

			// arrange
			oScale.destroy();
			sap.ui.getCore().applyChanges();
			oDefaultScale = oSlider.getAggregation('_defaultScale');
			oHandleLabelsDomRef = oSlider.$().find(".sapMSliderLabel");

			// assert
			assert.ok(oDefaultScale,"The default scale should be set");
			assert.strictEqual(oDefaultScale.sId, oSlider._getUsedScale().sId, "The _getUsedScale function, should return the default scale.");
			assert.strictEqual(oHandleLabelsDomRef.size(), 2, "There should be 2 labels created");
			assert.strictEqual(oHandleLabelsDomRef.eq(0).text(), "0", "The first label should be equal to the min");
			assert.strictEqual(oHandleLabelsDomRef.eq(1).text(), "2", "The second label should be equal to the max.");

			// cleanup
			oSlider.destroy();
		});

	QUnit.test("Slider with default scale", function(assert) {
		var oSlider;

		oSlider = new Slider({
			enableTickmarks: true
		});

		// arrange
		oSlider.placeAt('content');
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(oSlider.getAggregation('_defaultScale'), "The default scale should be created.");

		// arrange
		oSlider.setEnableTickmarks(false);
		sap.ui.getCore().applyChanges();

		// assert
		assert.notOk(oSlider.getAggregation('_defaultScale'), "The default scale should be destroyed.");

		// cleanup
		oSlider.destroy();
	});

	QUnit.test("Slider with enabled tickmarks and not set scale, should remove the default one, after 'scale' aggregation is set", function(assert) {
		var oSlider, oDefaultScale,
			oScale = new ResponsiveScale({tickmarksBetweenLabels: 1});

		oSlider = new Slider({
			enableTickmarks: true
		});

		// arrange
		oSlider.placeAt('content');
		sap.ui.getCore().applyChanges();
		oDefaultScale = oSlider.getAggregation('_defaultScale');

		// assert
		assert.ok(oDefaultScale ,"The default scale should be set");
		assert.strictEqual(oDefaultScale.sId, oSlider._getUsedScale().sId, "The _getUsedScale function, should return the user defined scale.");

		// arrange
		oSlider.setAggregation('scale', oScale);
		sap.ui.getCore().applyChanges();
		oDefaultScale = oSlider.getAggregation('_defaultScale');

		// assert
		assert.notOk(oDefaultScale ,"The default scale, should not be present");
		assert.strictEqual(oScale.sId, oSlider._getUsedScale().sId, "The _getUsedScale function, should return the new scale.");

		// cleanup
		oSlider.destroy();
	});

	QUnit.test("Slider with custom Scale", function(assert) {
		var oSlider, oDefaultScale, oCustonScale, CustomScale,
		oSliderTickmarksDomRef, oSliderLabelsDomRef, oSliderTicksDomRef;

		CustomScale = Element.extend("sap.test.CustomScale", {
			metadata: {
				interfaces: [
					"sap.m.IScale"
				]
			}
		});

		CustomScale.prototype.calcNumberOfTickmarks = function (mOptions) {
			return 5;
		};
		CustomScale.prototype.getTickmarksBetweenLabels = function (mOptions) {
			return 1;
		};
		CustomScale.prototype.handleResize = function (oEvent) {};

		oSlider = new Slider({
			min: 0,
			max: 5,
			step: 1,
			enableTickmarks: true,
			scale: new CustomScale()
		});

		// arrange
		oSlider.placeAt("content");
		sap.ui.getCore().applyChanges();
		oSliderTickmarksDomRef = oSlider.$().find('.sapMSliderTickmarks');
		oSliderLabelsDomRef = oSlider.$().find(".sapMSliderLabel");
		oSliderTicksDomRef = oSlider.$().find(".sapMSliderTick");

		// assert
		assert.ok(oSliderTickmarksDomRef.size(), "The tickmarks should be rendered.");
		assert.strictEqual(oSliderLabelsDomRef.size(), 5, "There should be labels for each tickmark.");
		assert.strictEqual(oSliderTicksDomRef.size(), 5, "There should be 6 tickmarks.");

		// cleanup
		oSlider.destroy();
	});

	QUnit.module("Tooltips", function (hooks) {
		hooks.before(function () {
			// dummy class
			SliderTooltipBase.extend("sap.xx.SliderTooltipCustom", {});
		});

		hooks.beforeEach(function () {
			this.oSlider = new Slider({
				showAdvancedTooltip: true
			});

			this.oSlider.placeAt('content');
			sap.ui.getCore().applyChanges();
		});

		hooks.afterEach(function () {
			this.oSlider.destroy();
		});

		QUnit.test("Default tooltips: should be set if no custom are provided", function (assert) {
			assert.strictEqual(this.oSlider.getCustomTooltips().length, 0, "Custom Tooltips should be 0");
			assert.strictEqual(this.oSlider.getAggregation("_defaultTooltips").length, 1, "Default Tooltips should be 1");
		});

		QUnit.test("Custom tooltips: should be set if provided", function (assert) {
			var aDefaultTooltips;

			this.oSlider.addCustomTooltip(new sap.xx.SliderTooltipCustom());
			sap.ui.getCore().applyChanges();

			aDefaultTooltips = this.oSlider.getAggregation("_defaultTooltips") || [];

			assert.strictEqual(this.oSlider.getCustomTooltips().length, 1, "Custom tooltip is set");
			assert.strictEqual(aDefaultTooltips.length, 0, "No default tooltip show be set");
		});

		QUnit.test("Custom tooltips: Adding more than 1 tooltip should log an error and ignore the additional tooltips", function (assert) {
			var log = sap.ui.require('sap/base/Log'),
				fnWarningSpy = this.spy(log, "warning");

			this.oSlider.addCustomTooltip(new sap.xx.SliderTooltipCustom());
			this.oSlider.addCustomTooltip(new sap.xx.SliderTooltipCustom());
			this.oSlider.placeAt("content");
			sap.ui.getCore().applyChanges();

			assert.strictEqual(this.oSlider.getCustomTooltips().length, 2, "Custom tooltips are set");
			assert.strictEqual(this.oSlider.getAggregation("_tooltipContainer").getAssociatedTooltips().length, 1, "TooltipContainer should render 1 Tooltip");
			assert.strictEqual(fnWarningSpy.callCount, 1, "sap.base.log.Warning is called");
		});

		QUnit.test("TooltipContainer: Should be initialized on demand", function (assert) {
			var oSlider = new Slider();

			assert.notOk(oSlider.getAggregation("_tooltipContainer"), "TooltipContainer should not be initialized on init");

			oSlider.placeAt("content");
			sap.ui.getCore().applyChanges();

			assert.notOk(oSlider.getAggregation("_tooltipContainer"), "TooltipContainer should not be initialized if advancedTooltips is false");

			oSlider.setShowAdvancedTooltip(true);
			sap.ui.getCore().applyChanges();

			assert.ok(oSlider.getAggregation("_tooltipContainer"), "TooltipContainer is initialized after advanced tooltips are on");

			oSlider.destroy();
		});

		QUnit.test("Tooltips: Removing all custom tooltips should fallback the defaults", function (assert) {
			var oTooltip = new sap.xx.SliderTooltipCustom(),
				oSliderTooltipContainer = this.oSlider.getAggregation("_tooltipContainer");

			// act
			this.oSlider.addCustomTooltip(oTooltip);
			sap.ui.getCore().applyChanges();

			// assert
			assert.strictEqual(this.oSlider.getCustomTooltips()[0], oSliderTooltipContainer.getAssociatedTooltipsAsControls()[0], "Custom tooltip should be used");

			// act
			this.oSlider.removeAllCustomTooltips();
			sap.ui.getCore().applyChanges();

			// assert
			assert.strictEqual(this.oSlider.getAggregation("_defaultTooltips")[0], oSliderTooltipContainer.getAssociatedTooltipsAsControls()[0], "Default tooltip should be used");
		});

		QUnit.test("Tooltips: Should be initialized on demand", function (assert) {
			var oSlider = new Slider(),
				aDefaultTooltips;

			oSlider.placeAt("content");
			sap.ui.getCore().applyChanges();

			aDefaultTooltips = oSlider.getAggregation("_defaultTooltips") || [];

			assert.strictEqual(oSlider.getCustomTooltips().length, 0, "No custom tooltips are added initially");
			assert.strictEqual(aDefaultTooltips.length, 0, "No default tooltips are added initially");

			oSlider.setShowAdvancedTooltip(true);
			sap.ui.getCore().applyChanges();

			aDefaultTooltips = oSlider.getAggregation("_defaultTooltips") || [];

			assert.strictEqual(oSlider.getCustomTooltips().length, 0, "No custom tooltips are being added");
			assert.strictEqual(aDefaultTooltips.length, 1, "Default tooltips are added after invalidation and showAdvanedTooltips set to true");

			oSlider.destroy();
		});

		QUnit.test("Tooltips: Destroying Custom tooltip should fallback to default", function (assert) {
			var oCustomTooltip = new sap.xx.SliderTooltipCustom(),
				oSliderTooltipContainer = this.oSlider.getAggregation("_tooltipContainer");

			this.oSlider.addCustomTooltip(oCustomTooltip);
			sap.ui.getCore().applyChanges();

			// act
			oCustomTooltip.destroy();
			sap.ui.getCore().applyChanges();

			// assert
			assert.ok(true, "No exception have been thrown");
			assert.strictEqual(this.oSlider.getAggregation("_defaultTooltips")[0], oSliderTooltipContainer.getAssociatedTooltipsAsControls()[0], "Default tooltip should be used");
		});

		QUnit.test("Tooltips: Setting a value when TooltipContainer is not visible", function (assert) {
			this.oSlider.setValue(4);
			sap.ui.getCore().applyChanges();

			assert.ok(true, "should not throw an error");
		});

		QUnit.test("Tooltips: Setting the editable property should toggle a class", function (assert) {
			// arrange
			var oSliderTooltip = this.oSlider.getUsedTooltips()[0];

			// act
			this.oSlider.getAggregation("_tooltipContainer").show(this.oSlider);
			var oLeftTooltip = jQuery("#" + this.oSlider.getId() + "-" + "leftTooltip-input");
			sap.ui.getCore().applyChanges();

			// assert
			assert.ok(oLeftTooltip.hasClass("sapMSliderTooltipNotEditable"), "'sapMSliderTooltipNotEditable' class should be applied");

			//act
			oSliderTooltip.setEditable(true);
			sap.ui.getCore().applyChanges();

			//assert
			assert.notOk(oLeftTooltip.hasClass("sapMSliderTooltipNotEditable"), "'sapMSliderTooltipNotEditable' class should not be applied");
		});
	});

	QUnit.module("Accessibility");

	QUnit.test("Slider with inputs as tooltip should add an aria", function(assert) {
		var sInvisibleTextId,
			oSlider = new Slider({
				step: 1,
				min: 0,
				max: 2,
				showAdvancedTooltip: true,
				inputsAsTooltips: true
			});

		// arrange
		oSlider.placeAt("content");
		sap.ui.getCore().applyChanges();

		sInvisibleTextId = oSlider.getDomRef("handle").getAttribute("aria-describedby");

		// assert
		assert.strictEqual(sap.ui.getCore().byId(sInvisibleTextId).getText(), sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("SLIDER_INPUT_TOOLTIP"));
		assert.ok(!oSlider.getFocusDomRef().getAttribute("aria-controls"), 'The "aria-controls" should not be set, before the tooltip is rendered');

		oSlider.focus();
		this.clock.tick(1);

		assert.ok(oSlider.getFocusDomRef().getAttribute("aria-controls"), 'The "aria-controls" should be set');


		// cleanup
		oSlider.destroy();
	});

	QUnit.test("Slider with custom scale should change handle title html attribute accordingly", function(assert) {
		var oSlider,
			oScale = new ResponsiveScale({tickmarksBetweenLabels: 1}),
			oHandleDomRef;

		oScale.getLabel = function (fCurValue, oSlider) {
			var monthList = ["Zero", "One", "2"];

			return monthList[fCurValue];
		};

		oSlider = new Slider({
			step: 1,
			min: 0,
			max: 2,
			enableTickmarks: true,
			scale: oScale
		});

		// arrange
		oSlider.placeAt("content");
		sap.ui.getCore().applyChanges();
		oHandleDomRef = oSlider.$().find(".sapMSliderHandle");

		// assert
		assert.strictEqual(oHandleDomRef.attr("title"), "Zero", "The title should be Zero.");
		assert.strictEqual(oHandleDomRef.attr("aria-valuenow"), "0", "The aria-valuenow should be 0.");
		assert.strictEqual(oHandleDomRef.attr("aria-valuetext"), "Zero", "The aria-valuetext should be Zero.");

		oSlider.setValue(1);

		assert.strictEqual(oHandleDomRef.attr("title"), "One", "The title should be One.");
		assert.strictEqual(oHandleDomRef.attr("aria-valuenow"), "1", "The aria-valuenow should be 1.");
		assert.strictEqual(oHandleDomRef.attr("aria-valuetext"), "One", "The aria-valuetext should be One.");

		oSlider.setValue(2);

		assert.strictEqual(oHandleDomRef.attr("title"), "2", "The title should be 2.");
		assert.strictEqual(oHandleDomRef.attr("aria-valuenow"), "2", "The aria-valuenow should be 2, since the label is numeric.");
		assert.notOk(oHandleDomRef.attr("aria-valuetext"), "The aria-valuetext should not be defined.");

		// cleanup
		oSlider.destroy();
	});

	QUnit.test("Slider with scale and tooltip should use the prioritisation of the labelling", function (assert) {
		var oSlider, oTooltip, oHandleDomRef,
				oScale = new ResponsiveScale({tickmarksBetweenLabels: 1});

		oScale.getLabel = function (fCurValue) {
			var monthList = ["Zero", "One", "2"];

			return monthList[fCurValue];
		};

		oTooltip = SliderTooltipBase.extend("sap.xx.TestTooltip", {
			renderer: function (oRm, oControl) {
				SliderTooltipBaseRenderer.render.apply({
					renderTooltipContent: function (oRm, oControl) {
						oRm.write("zzzz");
					}
				}, arguments);
			}
		});

		oTooltip.prototype.getLabel = function (fValue) {
			return "XXXXXXX-" + fValue;
		};

		oSlider = new Slider({
			step: 1,
			min: 0,
			max: 2,
			enableTickmarks: true,
			showAdvancedTooltip: true,
			scale: oScale,
			customTooltips: [
				new oTooltip()
			]
		});

		// arrange
		oSlider.placeAt("content");
		sap.ui.getCore().applyChanges();
		oHandleDomRef = oSlider.$().find(".sapMSliderHandle");

		// assert
		assert.ok(!oHandleDomRef.attr("aria-controls"), 'The "aria-controls" should not be set, before the tooltip is rendered');
		assert.strictEqual(oHandleDomRef.attr("title"), undefined, "The title should be undefined if there's a tooltip.");
		assert.strictEqual(oHandleDomRef.attr("aria-valuenow"), "0", "The aria-valuenow should be 0.");
		assert.strictEqual(oHandleDomRef.attr("aria-valuetext"), "XXXXXXX-0", "The aria-valuetext should be XXXXXXX-0.");

		// Act
		oSlider.setValue(1);
		sap.ui.getCore().applyChanges();
		oHandleDomRef = oSlider.$().find(".sapMSliderHandle");

		assert.strictEqual(oHandleDomRef.attr("title"), undefined, "The title should be undefined if there's a tooltip.");
		assert.strictEqual(oHandleDomRef.attr("aria-valuenow"), "1", "The aria-valuenow should be 1.");
		assert.strictEqual(oHandleDomRef.attr("aria-valuetext"), "XXXXXXX-1", "The aria-valuetext should be XXXXXXX-1.");

		//Act
		oSlider.setShowAdvancedTooltip(false);
		sap.ui.getCore().applyChanges();
		oHandleDomRef = oSlider.$().find(".sapMSliderHandle");

		assert.strictEqual(oHandleDomRef.attr("title"), "One", "The title should be One.");
		assert.strictEqual(oHandleDomRef.attr("aria-valuenow"), "1", "The aria-valuenow should be 1.");
		assert.strictEqual(oHandleDomRef.attr("aria-valuetext"), "One", "The aria-valuetext should be One.");

		// cleanup
		oSlider.destroy();
	});
});