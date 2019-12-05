/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/BusyDialog",
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/RenderManager",
	"sap/ui/core/InvisibleText",
	"sap/ui/events/KeyCodes"
], function(
	qutils,
	createAndAppendDiv,
	BusyDialog,
	Device,
	jQuery,
	JSONModel,
	RenderManager,
	InvisibleText,
	KeyCodes
) {
	"use strict";
	createAndAppendDiv("content");


	// =========================================================================================================
	// Testing a Default Busy Dialog - initialised with no properties/options
	// =========================================================================================================



	QUnit.module('Creating Default BusyDialog.', {
		beforeEach: function () {
			this.oBusyDialog = new BusyDialog();
			this.sId = '#' + this.oBusyDialog.sId;
			this.oBusyDialog.open();
		},
		afterEach: function () {
			this.oBusyDialog.close();
			this.oBusyDialog.destroy();
			this.oBusyDialog = null;
			this.sId = null;
		}
	});

	QUnit.test('Default busyDialog', function (assert) {
		var sBusyDialogPadding = jQuery(this.sId + '-Dialog-scrollCont').css('padding') || '0px';

		//check if exists
		assert.strictEqual(jQuery(this.sId + '-Dialog').length, 1, 'BusyDialog should exist and should be open.');

		//check the width
		assert.equal(jQuery(this.sId + '-Dialog').width(), 300, 'BusyDialog should have width of 300px.');

		//check header existence and content
		assert.strictEqual(jQuery(this.sId + '-Dialog-header').length, 0, 'BusyDialog should not have a header rendered.');

		//check if there is a padding leaking from the dialog styles
		//FF and IE returns '' for padding, chrome returns '0px'
		assert.equal(sBusyDialogPadding, '0px', 'The content area should not have extra padding.');

		//check the text label
		assert.strictEqual(jQuery(this.sId + '-TextLabel').length, 0, 'BusyDialog should not have text rendered.');

		//check the busy indicator
		assert.strictEqual(jQuery(this.sId + '-busyInd').length, 1, 'Should have busyIndicator rendered.');

		//check the footer
		assert.strictEqual(jQuery(this.sId + '-Dialog-footer').length, 0, 'BusyDialog should not have toolbar/footer rendered.');

		//check for close button
		assert.strictEqual(jQuery(this.sId + '-busyDialogCloseBtn').length, 0, 'BusyDialog should not have cancelButton rendered.');

	});

	// =========================================================================================================
	// Testing Busy Dialog initialised will all available properties/options
	// =========================================================================================================

	QUnit.module('Creating BusyDialog with all available properties.', {
		beforeEach: function () {
			/* TODO remove after 1.62 version */
			this.bIE_Edge = Device.browser.msie || Device.browser.edge;
			this.oBusyDialog = new BusyDialog({
				text: 'I am a busy screen with text and a cancel button.',
				title: 'Loading ...',
				showCancelButton: true,
				cancelButtonText: 'Abort',
				close: function (oEvent) {
					jQuery.sap.log.info(oEvent, 'closed');
				}
			});

			this.sId = '#' + this.oBusyDialog.sId;
			this.oBusyDialog.open();
		},
		afterEach: function () {
			this.oBusyDialog.close();
			this.oBusyDialog.destroy();
			this.oBusyDialog = null;
			this.sId = null;
		}
	});


	QUnit.test('BusyDialog content', function (assert) {
		//check if BusyDialog exists and is open
		assert.strictEqual(jQuery(this.sId + '-Dialog').length, 1, 'BusyDialog should exist and should be open.');

		//check header existence and content
		assert.equal(jQuery(this.sId + '-Dialog-header').length, 1, 'should have header rendered.');
		assert.equal(jQuery(this.sId + '-Dialog-title > span').text(), 'Loading ...', 'should have text set properly.');
	});

	QUnit.test('Initial focus', function (assert) {
		this.oBusyDialog._oDialog._handleOpened();

		assert.equal(document.activeElement, this.oBusyDialog._busyIndicator.$('busyIndicator')[0], 'Busy indicator is focused');
	});

	QUnit.test('BusyDialog DOM elements', function (assert) {
		//check if BusyDialog exists and is open
		assert.strictEqual(jQuery(this.sId + '-Dialog').length, 1, 'BusyDialog should exist and should be open.');

		//check the text label
		assert.equal(jQuery(this.sId + '-TextLabel').length, 1, 'should have text rendered.');
		assert.equal(jQuery(this.sId + '-TextLabel').text(), 'I am a busy screen with text and a cancel button.', 'should have text changed properly.');

		//check the busy indicator
		assert.equal(jQuery(this.sId + '-busyInd').length, 1, 'BusyDialog should have busyIndicator rendered.');

		//check the footer
		assert.equal(jQuery(this.sId + '-Dialog-footer').length, 1, 'BusyDialog should have Toolbar/footer rendered.');
		assert.equal(jQuery(this.sId + '-Dialog-footer').find('.sapMBtn:not(.sapMTBHiddenElement)').length, 1, 'BusyDialog should have CancelButton button rendered.');

		//test the close button text
		//IE and Edge do not support BDI tag so it is not rendered
		if (!this.bIE_Edge) {
			assert.equal(jQuery(this.sId + '-Dialog-footer').find('.sapMBtnContent > bdi').html(), 'Abort', 'BusyDialog should have CancelButton text set properly.');
		} else {
			assert.equal(jQuery(this.sId + '-Dialog-footer').find('.sapMBtnContent').html(), 'Abort', 'BusyDialog should have CancelButton text set properly.');
		}
	});

	// =========================================================================================================
	// Testing setters
	// =========================================================================================================

	QUnit.module('Creating Default BusyDialog.', {
		beforeEach: function () {
			/* TODO remove after 1.62 version */
			this.bIE_Edge = Device.browser.msie || Device.browser.edge;
			this.oBusyDialog = new BusyDialog();
			this.sId = '#' + this.oBusyDialog.sId;
			this.oBusyDialog.open();

			this.oBusyIndicator = this.oBusyDialog._busyIndicator;
		},
		afterEach: function () {
			this.oBusyDialog.close();
			this.oBusyDialog.destroy();
			this.oBusyDialog = null;
		}
	});

	QUnit.test('Setting title property', function (assert) {
		//check if header exists & has a title set
		assert.equal(jQuery(this.sId + '-Dialog-header').length, 0, 'Header should not render before being set.');
		assert.equal(jQuery(this.sId + '-Dialog-title > span').text(), '', 'Title should have no title text before it is set.');

		//set title for BusyDialog
		this.oBusyDialog.setTitle('test');
		sap.ui.getCore().applyChanges();

		//check if header exists & has a title set
		assert.equal(jQuery(this.sId + '-Dialog-header').length, 1, 'BusyDialog should have rendered header when the title is set.');
		assert.equal(jQuery(this.sId + '-Dialog-title > span').text(), 'test', 'BusyDialog should have the corrected string set as title.');

		this.oBusyDialog.setTitle('test2');
		sap.ui.getCore().applyChanges();

		//check if header exists & has a title set
		assert.equal(jQuery(this.sId + '-Dialog-header').length, 1, 'BusyDialog should have rendered header.');
		assert.equal(jQuery(this.sId + '-Dialog-title > span').text(), 'test2', 'Title should have the correct string after changing the title.');

		this.oBusyDialog.setTitle('');
		sap.ui.getCore().applyChanges();

		//check if header exists & has a title set
		assert.equal(jQuery(this.sId + '-Dialog-header').length, 0, 'BusyDialog should not have a header when the title is set to an empty string.');
		assert.equal(jQuery(this.sId + '-Dialog-title > span').text(), '', 'Title should have the corrected string set as title.');
	});

	QUnit.test('Setting the text property', function (assert) {

		//check if text is set & exists
		assert.equal(jQuery(this.sId + '-TextLabel').length, 0, 'Text should not render before being set.');
		assert.equal(jQuery(this.sId + '-TextLabel').text(), '', 'Text should be undefined before being set.');

		this.oBusyDialog.setText('SetText');
		sap.ui.getCore().applyChanges();

		//check if text is set & exists
		assert.equal(jQuery(this.sId + '-TextLabel').length, 1, 'Text should be rendered after set.');
		assert.equal(jQuery(this.sId + '-TextLabel').text(), 'SetText', 'Text should be as it is set.');

		this.oBusyDialog.setText('SetText2');
		sap.ui.getCore().applyChanges();

		//check if text is set & exists
		assert.equal(jQuery(this.sId + '-TextLabel').length, 1, 'Text should be rendered after set.');
		assert.equal(jQuery(this.sId + '-TextLabel').text(), 'SetText2', 'Text should be as it is reset.');

		this.oBusyDialog.setText('');
		sap.ui.getCore().applyChanges();

		//check if text is set to '' & exists
		assert.equal(jQuery(this.sId + '-TextLabel').length, 0, 'Text should not be rendered after setting it to an empty string.');
		assert.equal(jQuery(this.sId + '-TextLabel').text(), '', 'Text should be as it is reset.');
	});

	QUnit.test('Setting setShowCancelButton and CancelButton', function (assert) {

		//check if footer exists & has cancel button
		assert.equal(jQuery(this.sId + '-Dialog-footer').length, 0, 'Footer should not be rendered before being set.');
		assert.equal(jQuery(this.sId + '-Dialog-footer').find('.sapMBtn').length, 0, 'Footer should not render CancelButton before being set.');

		this.oBusyDialog.setCancelButtonText('test');
		this.oBusyDialog.setShowCancelButton(false);
		sap.ui.getCore().applyChanges();

		//check if footer exists & has cancel button
		assert.equal(jQuery(this.sId + '-Dialog-footer').length, 0, 'BusyDialog should not render footer before it is set to true.');
		assert.equal(jQuery(this.sId + '-Dialog-footer').find('.sapMBtn').length, 0, 'Should not render the set button if the setShowCancelButton is not set to true.');

		this.oBusyDialog.setShowCancelButton(true);
		sap.ui.getCore().applyChanges();

		//check if footer exists & has cancel button
		assert.equal(jQuery(this.sId + '-Dialog-footer').length, 1, 'BusyDialog should have footer after being set.');
		assert.equal(jQuery(this.sId + '-Dialog-footer').find('.sapMBtn:not(.sapMTBHiddenElement)').length, 1, 'BusyDialog should have CancelButton after setShowCancelButton being set.');

		//IE and Edge do not support BDI tag so it is not rendered
		if (!this.bIE_Edge) {
			assert.equal(jQuery(this.sId + '-Dialog-footer').find('.sapMBtnContent > bdi').html(), 'test', 'Footer should have a button with string that is previously set.');
		} else {
			assert.equal(jQuery(this.sId + '-Dialog-footer').find('.sapMBtnContent').html(), 'test', 'BusyDialog should have a button with string that is previously set.');
		}

		this.oBusyDialog.setCancelButtonText('');
		sap.ui.getCore().applyChanges();

		//check if footer exists & has cancel button
		assert.equal(jQuery(this.sId + '-Dialog-footer').length, 0, 'BusyDialog should not have rendered footer if the CancelButton text is set to an empty string.');
		assert.equal(jQuery(this.sId + '-Dialog-footer').find('.sapMBtn').length, 0, 'BusyDialog should not have rendered button if the CancelButton text is set to an empty string.');

		this.oBusyDialog.setCancelButtonText('test2');
		sap.ui.getCore().applyChanges();

		//check if footer exists & has cancel button
		assert.equal(jQuery(this.sId + '-Dialog-footer').length, 1, 'BusyDialog should render the footer if the CancelButtonText is changed from an empty string.');
		assert.equal(jQuery(this.sId + '-Dialog-footer').find('.sapMBtn:not(.sapMTBHiddenElement)').length, 1, 'BusyDialog should have rendered CancelButton.');

		//IE and Edge do not support BDI tag so it is not rendered
		if (!this.bIE_Edge) {
			assert.equal(jQuery(this.sId + '-Dialog-footer').find('.sapMBtnContent > bdi').html(), 'test2', 'should have rendered CancelButton with the new text value.');
		} else {
			assert.equal(jQuery(this.sId + '-Dialog-footer').find('.sapMBtnContent').html(), 'test2', 'should have rendered CancelButton with the new text value.');
		}
	});

	QUnit.test('Setting BusyIndicator properties', function (assert) {
		var setCustomIconSpy = sinon.spy(this.oBusyIndicator, 'setCustomIcon');
		this.oBusyDialog.setCustomIcon('url');
		assert.equal(setCustomIconSpy.callCount, 1, 'should be able to call setCustomIcon in the busyIndicator.');
		assert.equal(setCustomIconSpy.withArgs('url').callCount, 1, 'should forward the params correctly.');

		//======================================================================================================

		var setCustomIconRotationSpeedSpy = sinon.spy(this.oBusyIndicator, 'setCustomIconRotationSpeed');
		this.oBusyDialog.setCustomIconRotationSpeed(2000);
		assert.equal(setCustomIconRotationSpeedSpy.callCount, 1, 'should be able to call setCustomIcon in the busyIndicator.');
		assert.equal(setCustomIconRotationSpeedSpy.withArgs(2000).callCount, 1, 'should forward the params correctly.');

		//======================================================================================================

		var setCustomIconDensityAwareSpy = sinon.spy(this.oBusyIndicator, 'setCustomIconDensityAware');
		this.oBusyDialog.setCustomIconDensityAware(true);
		assert.equal(setCustomIconDensityAwareSpy.callCount, 1, 'should be able to call setCustomIconDensityAware in the busyIndicator.');
		assert.equal(setCustomIconDensityAwareSpy.withArgs(true).callCount, 1, 'should forward the params correctly.');

		//======================================================================================================

		var setCustomIconWidthSpy = sinon.spy(this.oBusyIndicator, 'setCustomIconWidth');
		this.oBusyDialog.setCustomIconWidth('50px');
		assert.equal(setCustomIconWidthSpy.callCount, 1, 'should be able to call setCustomIconWidth in the busyIndicator.');
		assert.equal(setCustomIconWidthSpy.withArgs('50px').callCount, 1, 'should forward the params correctly.');

		//======================================================================================================

		var setCustomIconHeightSpy = sinon.spy(this.oBusyIndicator, 'setCustomIconHeight');
		this.oBusyDialog.setCustomIconHeight('50px');
		assert.equal(setCustomIconHeightSpy.callCount, 1, 'should be able to call setCustomIconHeight in the busyIndicator.');
		assert.equal(setCustomIconHeightSpy.withArgs('50px').callCount, 1, 'should forward the params correctly.');
	});

	QUnit.test('Closing the BusyDialog event', function (assert) {
		// Arrange
		var isClosedByUser;
		var fnEventSpy = sinon.spy(function (oEvent) {
			isClosedByUser = oEvent.getParameter('cancelPressed');
		});

		// Act
		this.oBusyDialog.attachClose(fnEventSpy);
		this.oBusyDialog.close();
		this.clock.tick(500);

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 1, 'should fire on calling the close() method.');
		assert.strictEqual(isClosedByUser, false, 'should pass cancelPressed: false on closing by calling the close() method.');
	});

	QUnit.test('Closing the BusyDialog by the Cancel Button', function (assert) {
		// Arrange
		var isClosedByUser;
		var fnEventSpy = sinon.spy(function (oEvent) {
			isClosedByUser = oEvent.getParameter('cancelPressed');
		});

		this.oBusyDialog.attachClose(fnEventSpy);
		this.oBusyDialog.setShowCancelButton(true);

		// Act
		this.oBusyDialog._getCancelButton().firePress();
		this.clock.tick(500);

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 1, 'should fire close event after pressing the CancelButton.');
		assert.strictEqual(isClosedByUser, true, 'should pass cancelPressed: true on closing by pressing the CancelButton.');
	});

	QUnit.test('Closing the BusyDialog with ESC key', function (assert) {
		// Arrange
		var isClosedByUser;
		var fnEventSpy = sinon.spy(function (oEvent) {
			isClosedByUser = oEvent.getParameter('cancelPressed');
		});

		this.oBusyDialog.attachClose(fnEventSpy);

		// Act
		qutils.triggerKeydown(this.oBusyDialog.getFocusDomRef(), KeyCodes.ESCAPE);
		this.clock.tick(500);

		// Assert
		assert.strictEqual(fnEventSpy.callCount, 1, 'should fire close event once on esc press.');
		assert.strictEqual(isClosedByUser, true, 'should pass cancelPressed: true on closing by pressing the ESC key.');
	});

	QUnit.test('Multiple Open/Close calls', function (assert) {
		// Arrange
		var fnEventSpy = sinon.spy();
		this.oBusyDialog.attachClose(fnEventSpy);

		// Act
		this.oBusyDialog.close();
		this.oBusyDialog.open();
		this.oBusyDialog.close();
		this.oBusyDialog.open();
		this.oBusyDialog.close();
		this.clock.tick(500);

		// Assert
		assert.ok(fnEventSpy.calledOnce, 'should fire close only once');
		assert.ok(!this.oBusyDialog._oDialog.isOpen(), 'should be closed');
	});

	QUnit.test('Close Event number of calls', function (assert) {
		// Arrange
		var fnEventSpy = sinon.spy();
		this.oBusyDialog.attachClose(fnEventSpy);

		// Act
		this.oBusyDialog.close();
		this.oBusyDialog.close();
		this.oBusyDialog.close();
		this.clock.tick(500);

		// Assert
		assert.ok(fnEventSpy.calledOnce, 'should fire close event only when the busy dialog is opened.');
	});

	QUnit.test('Close Event firing sequence', function (assert) {
		// Arrange
		var bIsClosed = false;
		var fnEventSpy = sinon.spy(function (oEvent) {
			bIsClosed = oEvent.getSource()._oDialog.isOpen() === false;
		});
		this.oBusyDialog.attachClose(fnEventSpy);

		// Act
		this.oBusyDialog.close();
		this.clock.tick(500);

		// Assert
		assert.ok(bIsClosed, 'should fire close event after the dialog is closed.');
	});

	// =========================================================================================================
	// Testing bindings
	// =========================================================================================================

	QUnit.module('Setting binding in BusyDialog.', {
		beforeEach: function () {
			// Binding example =========================================================================================
			var data = {
				text: 'Initial text',
				title: 'Initial title'
			};

			this.model = new JSONModel();
			this.model.setData(data);

			this.oBusyDialog = new BusyDialog({
				text: '{/text}',
				title: '{/title}'
			}).setModel(this.model);

			//end setting up the BusyDialog
			this.sId = '#' + this.oBusyDialog.sId;
			this.oBusyDialog.open();
		},
		afterEach: function () {
			this.oBusyDialog.close();
			this.oBusyDialog.destroy();
			this.oBusyDialog = null;
		}
	});

	QUnit.test('Closing the BusyDialog event', function (assert) {
		assert.equal(jQuery(this.sId + '-TextLabel').text(), 'Initial text', 'should have initial text from the binding.');
		assert.equal(jQuery(this.sId + '-Dialog-title').text(), 'Initial title', 'should have initial title from the binding.');

		this.model.setData({
			text: 'Updated text',
			title: 'Updated title'
		});
		sap.ui.getCore().applyChanges();

		assert.equal(jQuery(this.sId + '-TextLabel').text(), 'Updated text', 'should have updated text from the binding.');
		assert.equal(jQuery(this.sId + '-Dialog-title').text(), 'Updated title', 'should have updated title from the binding.');
	});

	// =========================================================================================================
	// Testing XML view usage
	// =========================================================================================================

	QUnit.module('Using BusyDialog in XMLView.');

	QUnit.test('Testing the pseudo renderer', function (assert) {

		// the XML view content
		var sXMLView =
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:html="http://www.w3.org/1999/xhtml">' +
			'  <BusyDialog id="busyDialog"/>' +
			'</mvc:View>';

		// create the view instance
		var myView = sap.ui.xmlview({
			viewContent: sXMLView
		});

		// check the availability of a renderer and a render function
		// which is required for usage as content in the XMLView
		var oBusyDialog = myView.byId("busyDialog");
		var oRenderer = RenderManager.getRenderer(oBusyDialog);
		assert.ok(oRenderer && typeof oRenderer.render === "function", 'The BusyDialog should have a render function!');

		// test the rendering with the XMLView will fail if there is no renderer
		myView.placeAt("content");
		sap.ui.getCore().applyChanges();

		// destroy the XMLView
		myView.destroy();

	});

	// =========================================================================================================
	// Testing ARIA
	// =========================================================================================================

	QUnit.module('Aria', {
		beforeEach: function () {
			this.oBusyDialog = new BusyDialog('busyAria', {
			});

		},
		afterEach: function () {
			this.oBusyDialog.close();
			this.oBusyDialog.destroy();
			this.oBusyDialog = null;
		}
	});

	QUnit.test('Setting the ariaLabelledBy association', function (assert) {
		var invText = new InvisibleText('hiddenTxt', {text: 'Aria labelled by test'}).placeAt('content');
		this.oBusyDialog.addAriaLabelledBy('hiddenTxt');

		this.oBusyDialog.open();

		assert.strictEqual(this.oBusyDialog._oDialog.getAriaLabelledBy()[0], invText.getId(), 'Should be the same as ariaLabelledBy in the dialog.');
	});

	QUnit.test('Setting the Text property', function (assert) {
		this.oBusyDialog.setText('Loading...');
		this.oBusyDialog.open();

		assert.strictEqual(this.oBusyDialog._oDialog.getAriaLabelledBy()[0], this.oBusyDialog._oLabel.getId(), 'Should be the same as ariaLabelledBy in the dialog.');
	});

	QUnit.module('Style Class Methods', {
		beforeEach: function () {
			this.oBusyDialog = new BusyDialog({
			});

		},
		afterEach: function () {
			this.oBusyDialog.close();
			this.oBusyDialog.destroy();
			this.oBusyDialog = null;
		}
	});
	// =========================================================================================================
	// Testing StyleClass methods
	// =========================================================================================================

	QUnit.test("Check returned reference", function (assert) {
		var sId = "busyDialog1";
		var oBusyDialog = new BusyDialog(sId).addStyleClass("SomeClass");

		assert.equal(oBusyDialog.getId(), sId, "referance is correct");

		oBusyDialog.destroy();
	});

	QUnit.test("Check style classes of internal Dialog", function (assert) {
		//Arrange
		var oDialogAddStyleClassStub = this.stub(this.oBusyDialog._oDialog, "addStyleClass"),
			oDialogHasStyleClassStub = this.stub(this.oBusyDialog._oDialog, "hasStyleClass"),
			oDialogToggleStyleClassStub = this.stub(this.oBusyDialog._oDialog, "toggleStyleClass"),
			oDialogRemoveStyleClassStub = this.stub(this.oBusyDialog._oDialog, "removeStyleClass"),
			sMyStyleClass = "myStyleClass";

		//Act
		this.oBusyDialog.addStyleClass(sMyStyleClass);
		this.oBusyDialog.hasStyleClass(sMyStyleClass);
		this.oBusyDialog.toggleStyleClass(sMyStyleClass);
		this.oBusyDialog.removeStyleClass(sMyStyleClass);

		//Assert
		assert.ok(oDialogAddStyleClassStub.called, "The Dialog addStyleClass has been called");
		assert.equal(oDialogAddStyleClassStub.calledWith(sMyStyleClass), true, "Style class has been handed from BusyDialog to the Dialog successfully");
		assert.ok(oDialogHasStyleClassStub.called, "The Dialog hasStyleClass has been called");
		assert.ok(oDialogRemoveStyleClassStub.called, "The Dialog removeStyleClass has been called");
		assert.ok(oDialogToggleStyleClassStub.called, "The Dialog toggleStyleClass has been called");
	});

	QUnit.module("API", {
		beforeEach: function () {
			this.oBusyDialog = new BusyDialog();
		},
		afterEach: function () {
			this.oBusyDialog.close();
			this.oBusyDialog.destroy();
			this.oBusyDialog = null;
		}
	});

	QUnit.test("#getTooltip", function (assert) {
		//Assert
		assert.notOk(this.oBusyDialog.getTooltip(), "Tooltip should be falsy value if never set.");
		assert.notEqual(this.oBusyDialog.getTooltip(), this.oBusyDialog, "Should NOT return 'this' reference.");

		// Arrange and Act
		var sTooltip = "New tooltip for BusyDialog.";
		this.oBusyDialog.setTooltip(sTooltip);

		//Assert
		assert.strictEqual(this.oBusyDialog.getTooltip(), sTooltip, "Return value should be the one passed on #setTooltip.");
		assert.strictEqual(this.oBusyDialog.getTooltip_AsString(), sTooltip, "Return value should be the one passed on #setTooltip.");
	});
});
