/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/commons/TextField",
	"sap/ui/commons/Button",
	"sap/ui/thirdparty/jquery",
	"sap/ui/commons/Dialog",
	"sap/ui/core/UIArea",
	"sap/ui/Device",
	"sap/ui/core/ResizeHandler",
	"sap/ui/commons/Link",
	"sap/ui/commons/Label",
	"sap/ui/core/HTML",
	"sap/base/Log",
	"sap/ui/events/KeyCodes",
	"sap/ui/dom/jquery/Selectors" // :sapTabbable
], function(
	qutils,
	TextField,
	Button,
	jQuery,
	Dialog,
	UIArea,
	Device,
	ResizeHandler,
	Link,
	Label,
	HTML,
	Log,
	KeyCodes
) {
	"use strict";

	var sWidth = '300px',
		sHeight = '350px',
		iScrollLeft = 0,
		iScrollTop = 0,
		oTitle = null,
		bApplyContentPadding = true,
		bShowCloseButton = true,
		bResizable = true,
		Core = sap.ui.getCore();

	QUnit.module('Common use-cases', {

		beforeEach: function() {
			var TEXT_FIELD_ID = 'txtField';
			var OK_BUTTON_ID = 'btnOk';
			var CANCEL_BUTTON_ID = 'btnCancel';

			this.textField = new TextField(TEXT_FIELD_ID, {
				value: 'I am text field',
				width: '100%'
			});

			this.btnOk = new Button(OK_BUTTON_ID, {
				text: 'OK',
				press: function() {
					Log.debug('OK button is clicked');
				}
			});
			this.btnCancel = new Button(CANCEL_BUTTON_ID, {
				text: 'Cancel',
				press: function() {
					Log.debug('Cancel button is clicked');
				}
			});

			this.oDialog = new Dialog('Dialog', {
				content: [this.textField],
				scrollLeft: iScrollLeft,
				scrollTop: iScrollTop,
				title: oTitle,
				applyContentPadding: bApplyContentPadding,
				showCloseButton: bShowCloseButton,
				resizable: bResizable,
				buttons: [this.btnOk, this.btnCancel]
			});

			this.initialFocusSpy = sinon.spy(this.oDialog, 'setInitialFocus');
			this.initialPopupFocusSpy = sinon.spy(this.oDialog.oPopup, 'setInitialFocusId');
		},
		afterEach: function() {
			this.oDialog.destroy();
			this.initialFocusSpy.restore();
			this.initialPopupFocusSpy.restore();
		}
	});

	QUnit.test('On initialization the dialog', function(assert) {
		assert.ok(this.oDialog, 'should not exist');
		assert.equal(this.oDialog.isOpen(), false, 'should be closed initially!');
	});

	QUnit.test('Setting inital focus to a string id', function(assert) {
		this.oDialog.setInitialFocus('btnOk');
		assert.ok(this.initialFocusSpy.calledOnce, 'setIntialFocus should be called once');
		assert.ok(this.initialPopupFocusSpy.calledWithExactly('btnOk'), 'setIntialFocusId should be called on the popup with the passed id');
	});

	QUnit.test('Setting inital focus to a control', function(assert) {
		this.oDialog.setInitialFocus(this.btnCancel);
		assert.ok(this.initialPopupFocusSpy.calledWithExactly('btnCancel'), 'setInitialFocusId should be called with the proper sId');
	});

	QUnit.test('Setting inital focus to null', function(assert) {
		this.oDialog.setInitialFocus(null);
		assert.ok(this.initialPopupFocusSpy.calledWithExactly(null), 'setInitialFocusId should be called with the proper sId');
	});

	QUnit.test('Setting inital focus to undefined', function(assert) {
		this.oDialog.setInitialFocus(undefined);
		assert.ok(this.initialPopupFocusSpy.calledWithExactly(undefined), 'setInitialFocusId should be called with the proper sId');
	});

	QUnit.test('Open Dialog and changing its dimensions', function(assert) {
		var done = assert.async();
		var oSpyInvalidate = sinon.spy(UIArea.prototype, 'rerender');
		var that = this;

		var fnOpened = function() {
			assert.ok(!oSpyInvalidate.calledOnce, 'UIArea was not rerendered when Dialog was opened');

			that.oDialog.setWidth(sWidth);
			that.oDialog.setHeight(sHeight);
			Core.applyChanges();

			assert.ok(that.oDialog.isOpen(), 'Dialog should be open after opening!');
			assert.equal(jQuery('#Dialog').css('visibility'), 'visible', 'Dialog should be visible after opening');

			var oDomRef = that.oDialog.getDomRef();
			assert.strictEqual(oDomRef.offsetWidth, parseInt(that.oDialog.getWidth()), 'Width of the Dialog should be equal to the set value.');

			var offsetHeight = oDomRef.offsetHeight;
			if (Device.browser.chrome && offsetHeight == 351) { // a known issue in Chrome that sometimes happens
				offsetHeight = 350;
			}
			assert.strictEqual(offsetHeight, parseInt(that.oDialog.getHeight()), 'Height of the Dialog should be equal to the set value.');
			done();
		};

		this.oDialog.oPopup.attachOpened(fnOpened);
		this.oDialog.open();
	});

	QUnit.test("Change Title (Width) During Opening", function(assert) {
		var done = assert.async();
		var that = this;
		var iWinWidth = document.getElementsByClassName("sapUiBody")[0].offsetWidth; // the width of the window without the scroll bar
		var iWinMiddle = parseInt(iWinWidth / 2);

		var sTitle = "Lorem Ipsum dolor sit amet";

		var fnOpened = function() {
			var oDomRef = that.oDialog.getDomRef();
			var iDialWidth = oDomRef.offsetWidth;
			var iDialLeft = oDomRef.offsetLeft;
			var iDialMiddleAbsolute = iDialLeft + parseInt(iDialWidth / 2);

			// is the dialog centered (calculated with a little puffer)
			var bDialogCentered = iWinMiddle + 3 > iDialMiddleAbsolute &&
					iWinMiddle - 3 < iDialMiddleAbsolute;

			assert.ok(bDialogCentered, "Dialog is centered for the current window");
			done();
		};

		this.oDialog.destroyContent();
		this.oDialog.destroyButtons();
		this.oDialog.oPopup.attachOpened(fnOpened);
		this.oDialog.open();
		this.oDialog.setTitle(sTitle);

	});

	QUnit.test("Test resizeHandler registration", function(assert) {
		var done = assert.async();
		var that = this;
		var sTitle = "Lorem Ipsum dolor sit amet",
			popupPositionSpy = sinon.spy(this.oDialog.oPopup, 'setPosition'),
			registerSpy = sinon.spy(ResizeHandler, 'register');

		var fnOpened = function() {

			assert.ok(popupPositionSpy.callCount === 2, 'should call setPosition of the popup as setting Title after ' +
					'Dialog opening triggers resize handler');
			assert.ok(!!that.oDialog._sContentResizeListenerId, '_sContentResizeListenerId is not null as setting Title after ' +
					'Dialog opening triggers resize handler');
			assert.ok(registerSpy.callCount > 0, "setTitle triggers register method of sap.ui.core.ResizeHandler");

			popupPositionSpy.restore();
			registerSpy.restore();
			done();
		};

		this.oDialog.destroyContent();
		this.oDialog.destroyButtons();
		this.oDialog.oPopup.attachOpened(fnOpened);
		this.oDialog.open();
		this.oDialog.setTitle(sTitle);

	});

	QUnit.test("Test resizeHandler deregistration as moving dialog deregisters the resize handler", function(assert) {
		var that = this,
				done = assert.async(),
				mouseDownSpy = sinon.spy(this.oDialog, 'onmousedown'),
				mouseMoveSpy = sinon.spy(this.oDialog, 'handleMove'),
				mouseUpSpy = sinon.spy(this.oDialog, 'handleMouseUp'),
				popupPositionSpy = sinon.spy(this.oDialog.oPopup, 'setPosition'),
				deregisterSpy = sinon.spy(ResizeHandler, 'deregister');

		function fnOpened() {
			var headerDomRef = that.oDialog.getDomRef("hdr");

			qutils.triggerMouseEvent(headerDomRef, 'mousedown');
			assert.strictEqual(mouseDownSpy.callCount, 1, 'should be called');
			assert.strictEqual(that.oDialog.sDragMode, 'move','Move mode should be triggered');

			qutils.triggerMouseEvent(headerDomRef, 'mousemove');
			assert.strictEqual(mouseMoveSpy.callCount, 1,'The dialog should be moved');
			assert.ok(popupPositionSpy.callCount === 2, 'should call setPosition on the popup 2 times as drag calls setPosition internally. Open dialog also calls it.');
			assert.strictEqual(mouseMoveSpy.returnValues[0], false, 'handleMove should return false');
			assert.ok(deregisterSpy.callCount === 1, "move/resize dialog triggers deregister method of sap.ui.core.ResizeHandler");

			qutils.triggerMouseEvent(headerDomRef, 'mouseup');
			assert.strictEqual(mouseUpSpy.callCount, 1, 'handleUp should be called');

			mouseDownSpy.restore();
			mouseMoveSpy.restore();
			mouseUpSpy.restore();
			popupPositionSpy.restore();
			deregisterSpy.restore();
			done();
		}


		this.oDialog.oPopup.attachOpened(fnOpened);
		this.oDialog.open();

	});

	QUnit.test("Test resizeHandler deregistration as resize dialog deregisters the resize handler", function(assert) {
		var that = this,
			done = assert.async(),
			mouseDownSpy = sinon.spy(this.oDialog, 'onmousedown'),
			mouseMoveSpy = sinon.spy(this.oDialog, 'handleMove'),
			mouseUpSpy = sinon.spy(this.oDialog, 'handleMouseUp'),
			setPropertySpy = sinon.spy(this.oDialog, 'setProperty'),
			invalidateSpy = sinon.spy(this.oDialog, 'invalidate'),
			popupPositionSpy = sinon.spy(this.oDialog.oPopup, 'setPosition');


		function fnOpened() {
			var gripHandleRef = that.oDialog.getDomRef('grip');

			qutils.triggerMouseEvent(gripHandleRef, 'mousedown');

			assert.strictEqual(mouseDownSpy.callCount, 1, 'should call onmousedown handler');
			assert.strictEqual(that.oDialog.sDragMode, 'resize', 'should be trigger resize mode');

			qutils.triggerMouseEvent(gripHandleRef, 'mousemove');
			assert.strictEqual(setPropertySpy.callCount, 4,'should set its the width and height once at the beginning and once after resize is finished');
			assert.strictEqual(invalidateSpy.callCount, 0, 'should not cause rerendering');
			assert.strictEqual(popupPositionSpy.callCount, 1,'The popup setPosition is not called as handler is deregistered, but Dialog.open calls it');


			qutils.triggerMouseEvent(gripHandleRef, 'mouseup');

			mouseDownSpy.restore();
			mouseMoveSpy.restore();
			mouseUpSpy.restore();
			setPropertySpy.restore();
			invalidateSpy.restore();
			popupPositionSpy.restore();
			done();
		}

		this.oDialog.oPopup.attachOpened(fnOpened);
		this.oDialog.open();

	});

	QUnit.test('Close Dialog', function(assert) {
		var done = assert.async(),
			that = this;

		function fnClosed () {
			assert.equal(that.oDialog.isOpen(), false, 'Dialog should be closed again after closing!');
			assert.equal(jQuery('#Dialog').length, 0, 'Dialog DOM should be removed after closing');
			done();
		}

		this.oDialog.oPopup.attachOpened(function fnOpened() {
			that.oDialog.oPopup.attachClosed(fnClosed);
			that.oDialog.close();
		});

		this.oDialog.open();
	});

	QUnit.test("Test dialog onClick event handling", function (assert) {
		var done = assert.async(),
				that = this;

		function fnClosed () {
			assert.equal(that.oDialog.isOpen(), false, 'Dialog should be closed now!');
			assert.equal(jQuery('#Dialog').length, 0, 'Dialog DOM should be removed after closing');
			done();
		}

		this.oDialog.oPopup.attachOpened(function fnOpened() {
			that.oDialog.oPopup.attachClosed(fnClosed);
			var $CloseBtn = that.oDialog.$("close");
			$CloseBtn.trigger("click");
		});

		this.oDialog.open();

	});

	QUnit.test('Test setAutoClose API', function(assert) {
		var that = this,
			done = assert.async(),
			popupSetAutoCloseSpy = sinon.spy(this.oDialog.oPopup, 'setAutoClose');

		function fnOpened() {
			assert.ok(popupSetAutoCloseSpy.calledOnce, 'should call setAutoClose on the popup');
			assert.equal(that.oDialog.getAutoClose(), true, 'Popup autoclose should be true');
			popupSetAutoCloseSpy.restore();
			done();
		}

		this.oDialog.oPopup.attachOpened(fnOpened);
		this.oDialog.setAutoClose(true);
		this.oDialog.getAutoClose();
		this.oDialog.open();
	});

	QUnit.test('Pressing enter', function(assert) {
		var fnBtnClickSpy = sinon.spy(this.btnOk, 'onclick'),
			that = this,
			done = assert.async();

		function fnOpened() {
			qutils.triggerKeydown(that.oDialog.getDomRef(), KeyCodes.ENTER);
			assert.equal(fnBtnClickSpy.calledOnce, true, 'should click the default button if set');
			that.oDialog.close();
			fnBtnClickSpy.restore();
			done();
		}

		this.oDialog.setDefaultButton(this.btnOk);
		this.oDialog.oPopup.attachOpened(fnOpened);
		this.oDialog.open();
	});

	QUnit.test('Pressing escape', function(assert) {
		var done = assert.async();

		function fnClosed(e) {
			assert.ok(true, 'should close the Dialog');
			done();
		}

		this.oDialog.oPopup.attachClosed(fnClosed);
		this.oDialog.open();
		qutils.triggerKeydown(this.oDialog.getDomRef(), KeyCodes.ESCAPE);
	});

	QUnit.test('Moving the dialog', function(assert) {
		var that = this,
			done = assert.async(),
			mouseDownSpy = sinon.spy(this.oDialog, 'onmousedown'),
			mouseMoveSpy = sinon.spy(this.oDialog, 'handleMove'),
			mouseUpSpy = sinon.spy(this.oDialog, 'handleMouseUp'),
			popupPositionSpy = sinon.spy(this.oDialog.oPopup, 'setPosition');

		function fnOpened() {
			var headerDomRef = that.oDialog.getDomRef('hdr');

			qutils.triggerMouseEvent(headerDomRef, 'mousedown');
			assert.strictEqual(mouseDownSpy.callCount, 1, 'should be called');
			assert.strictEqual(that.oDialog.sDragMode, 'move','Move mode should be triggered');

			qutils.triggerMouseEvent(headerDomRef, 'mousemove');
			assert.strictEqual(mouseMoveSpy.callCount, 1,'The dialog should be moved');
			assert.ok(popupPositionSpy.callCount === 2, 'should call setPosition on the popup');
			assert.strictEqual(mouseMoveSpy.returnValues[0], false, 'handleMove should return false');

			qutils.triggerMouseEvent(headerDomRef, 'mouseup');
			assert.strictEqual(mouseUpSpy.callCount, 1, 'handleUp should be called');

			mouseDownSpy.restore();
			mouseMoveSpy.restore();
			mouseUpSpy.restore();
			popupPositionSpy.restore();
			done();
		}


		this.oDialog.oPopup.attachOpened(fnOpened);
		this.oDialog.open();
	});


	QUnit.test('Resizing the dialog', function(assert) {
		var that = this,
			done = assert.async(),
			mouseDownSpy = sinon.spy(this.oDialog, 'onmousedown'),
			mouseMoveSpy = sinon.spy(this.oDialog, 'handleMove'),
			mouseUpSpy = sinon.spy(this.oDialog, 'handleMouseUp'),
			setPropertySpy = sinon.spy(this.oDialog, 'setProperty'),
			invalidateSpy = sinon.spy(this.oDialog, 'invalidate');

		function fnOpened() {
			var gripHandleRef = that.oDialog.getDomRef('grip');

			qutils.triggerMouseEvent(gripHandleRef, 'mousedown');
			assert.strictEqual(mouseDownSpy.callCount, 1, 'should call onmousedown handler');
			assert.strictEqual(that.oDialog.sDragMode, 'resize', 'should be trigger resize mode');

			qutils.triggerMouseEvent(gripHandleRef, 'mousemove');
			assert.strictEqual(setPropertySpy.callCount, 4,'should set its the width and height once at the beginning and once after resize is finished');
			assert.strictEqual(invalidateSpy.callCount, 0, 'should not cause rerendering');

			qutils.triggerMouseEvent(gripHandleRef, 'mouseup');

			mouseDownSpy.restore();
			mouseMoveSpy.restore();
			mouseUpSpy.restore();
			setPropertySpy.restore();
			invalidateSpy.restore();
			done();
		}

		this.oDialog.oPopup.attachOpened(fnOpened);
		this.oDialog.open();

	});

	QUnit.test('Destroying the dialog', function(assert) {
		var done = assert.async();

		function fnClosed() {
			assert.ok(true, 'should call the close handler');
			done();
		}
		this.oDialog.oPopup.attachClosed(fnClosed);
		this.oDialog.oPopup.attachOpened(function() {
			this.destroy();
		});
		this.oDialog.open();
	});


	QUnit.module('Special use-cases', {

		FOCUS_LINK_ID: 'focus-link',
		DIALOG_ID: 'Dialog',

		beforeEach: function() {

			this.oLink = new Link(this.FOCUS_LINK_ID, {
				text: "Link a Action",
				tooltip: "This a link to action"
			});

			this.oLabel = new Label({
				text: "This is a label"
			});

			this.oTextField = new TextField({
				value: 'I am text field',
				width: '100%'
			});

			this.btnOk = new Button({
				text: 'OK',
				width: '150px'
			});

			this.oDialog = new Dialog(this.DIALOG_ID, {
				scrollLeft: iScrollLeft,
				scrollTop: iScrollTop,
				title: oTitle,
				applyContentPadding: bApplyContentPadding,
				showCloseButton: bShowCloseButton,
				resizable: bResizable
			});
		},

		afterEach: function() {
			this.oDialog.destroy();
			this.oLink.destroy();
		}
	});

	QUnit.test('Dialog with focusable elements', function(assert) {
		var that = this,
			done = assert.async();

		this.oDialog.oPopup.attachOpened(function opened(){
			assert.strictEqual(jQuery(":sapTabbable", that.oDialog.$("cont"))[0].id, that.FOCUS_LINK_ID, "should focus the first  focusable element");
			done();
		});

		this.oDialog.addContent(this.oLink);
		this.oDialog.addContent(this.oTextField);
		Core.applyChanges();
		this.oDialog.open();
	});


	QUnit.test('Dialog without focusable elements', function(assert) {
		var that = this,
			done = assert.async();

		this.oDialog.oPopup.attachOpened(function opened(){
			assert.strictEqual(document.getElementById(that.oDialog._mParameters.firstFocusable).id, that.DIALOG_ID + '-fhfe', "should focus the first fake focusable element (Header)");
			done();
		});
		this.oDialog.addContent(this.oLabel);
		this.oDialog.open();
	});

	QUnit.test('Dialog with variable size of the footer/header', function(assert) {
		var that = this,
			done = assert.async(),
			oOldMinSize,
			oNewMinSize;

		this.oDialog.oPopup.attachOpened(function opened(){
			oOldMinSize = that.oDialog.getMinSize();
			that.oDialog.addButton(that.btnOk);
			Core.applyChanges();
			oNewMinSize = that.oDialog.getMinSize();
			assert.notDeepEqual(oOldMinSize, oNewMinSize, 'should be correctly reflected on the minSize');
			done();
		});

		this.oDialog.open();
	});



	QUnit.test("Preserve Dialog Content", function(assert) {
		var done = assert.async();
		var bRendered = false;
		var oHtml = new HTML({
			content: "<div id='htmlControl'>test</div>",
			preferDOM : true,
			afterRendering : function(oEvent) {
				if (!bRendered) {
					document.querySelector("#htmlControl").setAttribute("data-some-attribute", "some-value");
					bRendered = true;
				}
			}
		});
		this.oDialog.addContent(oHtml);


		var fnOpened2 = function() {
			this.oDialog.oPopup.detachOpened(fnOpened2);

			assert.ok(!!document.querySelector("#htmlControl"), "HTML control rendered");
			assert.equal(document.querySelector("#htmlControl").getAttribute("data-some-attribute"), "some-value", "DOM attribute value set correctly");

			this.oDialog.oPopup.attachClosed(done);

			this.oDialog.close();
		}.bind(this);

		var fnClosed1 = function() {
			this.oDialog.oPopup.detachClosed(fnClosed1);

			assert.equal(document.querySelector("#htmlControl").parentElement.id, "sap-ui-preserve", "HTML control rendered (preserved)");

			this.oDialog.open();
			this.oDialog.oPopup.attachOpened(fnOpened2);
		}.bind(this);


		var fnOpened1 = function() {
			this.oDialog.oPopup.detachOpened(fnOpened1);

			assert.ok(!!document.querySelector("#htmlControl"), "HTML control rendered");
			assert.equal(document.querySelector("#htmlControl").getAttribute("data-some-attribute"), "some-value", "DOM attribute value set correctly");

			this.oDialog.oPopup.attachClosed(fnClosed1);
			this.oDialog.close();
		}.bind(this);


		assert.equal(document.querySelector("#htmlControl"), null, "HTML control not rendered");

		this.oDialog.oPopup.attachOpened(fnOpened1);
		this.oDialog.open();
	});

});