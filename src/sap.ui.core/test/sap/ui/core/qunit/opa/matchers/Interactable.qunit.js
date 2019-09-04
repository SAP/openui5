/*global QUnit, sinon */
sap.ui.define([
	'sap/ui/test/matchers/Interactable',
	'jquery.sap.global',
	'sap/m/Button',
	'sap/m/NavContainer',
	'sap/m/App',
	'sap/m/Page',
	'sap/m/Dialog',
	'sap/m/Toolbar',
	'sap/ui/test/opaQunit',
	'sap/ui/test/Opa5',
	'sap/ui/test/_LogCollector',
	'../utils/phantomJS',
	'../utils/customQUnitAssertions'
], function (Interactable,
			 $,
			 Button,
			 NavContainer,
			 App,
			 Page,
			 Dialog,
			 Toolbar,
			 opaTest,
			 Opa5,
			 _LogCollector,
			phantomJSUtils) {
	"use strict";

	phantomJSUtils.introduceSinonXHR();

	[NavContainer, App].forEach(function (fnConstructor) {

		QUnit.module("Matching in a :" + fnConstructor.getMetadata().getName(), {
			beforeEach: function () {
				this.oInitialPageButton = new Button();
				this.oSecondPageButton = new Button();
				var oInitialPage = new Page({
					content: this.oInitialPageButton
				});
				this.oSecondPage = new Page({
					content: this.oSecondPageButton
				});
				this.oNavContainer = new fnConstructor({
					pages: [oInitialPage, this.oSecondPage]
				}).placeAt("qunit-fixture");


				this.oInteractable = new Interactable();
				this.oSpy = sinon.spy(this.oInteractable._oLogger, "debug");
				sap.ui.getCore().applyChanges();
			},

			afterEach: function () {
				this.oSpy.restore();
				this.oNavContainer.destroy();
			}
		});

		QUnit.test("Should match an interactable Button", function (assert) {
			// Act
			var bResult = this.oInteractable.isMatching(this.oInitialPageButton);

			// Assert
			assert.ok(bResult, "Control is matching");
			sinon.assert.notCalled(this.oSpy);
		});

		QUnit.test("Should not match a Button that is invisible", function (assert) {
			// Act
			var bResult = this.oInteractable.isMatching(this.oSecondPageButton);

			// Assert
			assert.ok(!bResult, "Control isn't matching");
		});

		QUnit.test("Should not match a Button while it is busy", function (assert) {
			// Arrange
			this.oInitialPageButton.setBusy(true);

			// Act
			var bResult = this.oInteractable.isMatching(this.oInitialPageButton);

			// Assert
			assert.ok(!bResult, "Control isn't matching");
		});

		QUnit.test("Should not match a Button while one of its parents is busy", function (assert) {
			// Arrange
			this.oNavContainer.setBusy(true);

			// Act
			var bResult = this.oInteractable.isMatching(this.oInitialPageButton);

			// Assert
			assert.ok(!bResult, "Control isn't matching");
		});
	});

	QUnit.module("Dialogs", {
		beforeEach: function () {
			this.oInteractable = new Interactable();

			this.oButtonInPage = new Button();
			this.oButtonInDialog = new Button();
			this.oDialog = new Dialog({
				content: this.oButtonInDialog
			});
			this.oButtonInPage.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			// Async tests use global spy
			this.oSpy = sinon.spy(this.oInteractable._oLogger, "debug");
		},
		afterEach: function () {
			this.oButtonInPage.destroy();
			this.oDialog.destroy();
			this.oSpy.restore();
		}
	});

	QUnit.test("Should not match a Button when a dialog is opened in front of it", function (assert) {
		// Arrange
		var fnStart = assert.async();

		// Act
		var bResultBeforeOpening = this.oInteractable.isMatching(this.oButtonInPage);

		this.oDialog.attachAfterOpen(function () {
			var bResultAfterOpening = this.oInteractable.isMatching(this.oButtonInPage);

			// Assert
			assert.ok(bResultBeforeOpening, "Control is matching");
			assert.ok(!bResultAfterOpening, "Control isn't matching after a dialog is opened");
			sinon.assert.calledWith(this.oSpy,  sinon.match(/hidden behind a blocking popup layer/));

			fnStart();
		}, this);

		this.oDialog.open();
	});

	QUnit.test("Should not match a Button when a dialog is opened in front of it even if the dialog is still opening", function (assert) {
		// Arrange
		var fnStart = assert.async();
		var bResultAfterOpenEvent;

		// Act
		var bResultBeforeOpening = this.oInteractable.isMatching(this.oButtonInPage);

		this.oDialog.attachAfterOpen(function () {
			bResultAfterOpenEvent = this.oInteractable.isMatching(this.oButtonInPage);
		}, this);

		this.oDialog.open();
		var bResultAfterOpenFunctionCall = this.oInteractable.isMatching(this.oButtonInPage);

		this.oDialog.attachAfterClose(function () {
			// Assert
			assert.ok(bResultBeforeOpening, "Control is matching");
			assert.ok(!bResultAfterOpenFunctionCall, "Control isn't matching after a dialog open function is called");
			assert.ok(!bResultAfterOpenEvent, "Control isn't matching after a dialog is opened - Event afterOpen has fired");
			assert.ok(!bResultAfterClosingImmediately, "Control isn't matching after a dialog is opened and closed immediately");
			sinon.assert.calledWith(this.oSpy,  sinon.match(/hidden behind a blocking popup layer/));
			assert.ok(this.oInteractable.isMatching(this.oButtonInPage), "Control is matching");
			fnStart();
		}, this);

		// close immediately
		// sometimes opa tests close and open dialogs very fast so we need this check here
		this.oDialog.close();
		var bResultAfterClosingImmediately = this.oInteractable.isMatching(this.oButtonInPage);

	});


	QUnit.test("Should match a Button in an open dialog", function (assert) {
		// Arrange
		var fnStart = assert.async();

		// Act
		var bResultBeforeOpening = this.oInteractable.isMatching(this.oButtonInDialog);

		this.oDialog.attachAfterOpen(function () {
			var bResultAfterOpening = this.oInteractable.isMatching(this.oButtonInDialog);

			// Assert
			assert.ok(!bResultBeforeOpening, "Control isn't matching");
			assert.ok(bResultAfterOpening, "Control is matching after a dialog is opened");

			fnStart();
		}, this);

		this.oDialog.open();
	});

	QUnit.module("Invalidation", {
		beforeEach: function () {
			this.oInteractable = new Interactable();

			this.oButton = new Button();
			this.oButton.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			// Async tests use global spy
			this.oSpy = sinon.spy(this.oInteractable._oLogger, "debug");
		},
		afterEach: function () {
			this.oSpy.restore();
			this.oButton.destroy();
			sap.ui.getCore().applyChanges();
		}
	});

	QUnit.test("Should not match an invalidated Button", function (assert) {
		// Arrange
		var fnTimeoutDone = assert.async(),
			fnAfterRenderingDone = assert.async(),
			oButton = this.oButton;

		// Squeeze between the rendering and the invalidation
		setTimeout(function () {
			// Act
			var oLogCollector = _LogCollector.getInstance();
			oLogCollector.getAndClearLog();
			assert.ok(!this.oInteractable.isMatching(oButton), "No match because the button was invalidated");
			var sLog = oLogCollector.getAndClearLog();
			QUnit.assert.contains(sLog, "Control 'Element sap.m.Button#__button22' is currently in a UIArea that needs a new rendering");
			fnTimeoutDone();
		}.bind(this), 0);

		// invalidate but do not render yet
		this.oButton.setText("foo");

		this.oButton.addEventDelegate({
			onAfterRendering : function() {
				// the UI is ready immediately after rendering
				setTimeout(function () {
					assert.ok(this.oInteractable.isMatching(oButton), "Match because the button was rendered again");
					fnAfterRenderingDone();
				}.bind(this), 0);
			}.bind(this)
		});
	});

	jQuery(function () {
		// open a dialog and destroy it because it introduces a singleton global in IE
		new Dialog().open().destroy();
		// start after dom is ready
		QUnit.start();
	});
});
