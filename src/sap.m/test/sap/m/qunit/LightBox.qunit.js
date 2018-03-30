/*global QUnit,sinon*/

(function () {
	'use strict';

	jQuery.sap.require('sap.ui.qunit.qunit-css');
	jQuery.sap.require('sap.ui.qunit.QUnitUtils');
	jQuery.sap.require('sap.ui.thirdparty.qunit');
	jQuery.sap.require('sap.ui.thirdparty.sinon');
	jQuery.sap.require('sap.ui.thirdparty.sinon-qunit');
	sinon.config.useFakeTimers = true;
	jQuery.sap.require("sap.ui.qunit.qunit-coverage");
	//================================================================================
	// LightBox Base API
	//================================================================================

	QUnit.module('API', {
		beforeEach: function() {
			this.LightBox = new sap.m.LightBox({
				imageContent : [
					new sap.m.LightBoxItem()
				]
			});
		},
		afterEach: function() {
			this.LightBox.destroy();
		}
	});

	QUnit.test('Default values', function(assert) {
		var oImageContent = this.LightBox.getImageContent()[0];
		// assert
		assert.strictEqual(oImageContent.getImageSrc(), '', 'The image source should be empty');
		assert.strictEqual(oImageContent.getAlt(), '', 'The image alt should be empty');
		assert.strictEqual(oImageContent.getTitle(), '', 'Title should be empty');
		assert.strictEqual(oImageContent.getSubtitle(), '', 'Subtitle should be empty');
	});

	//================================================================================
	// LightBox setters and getters
	//================================================================================

	QUnit.module('Public setters and getters', {
		beforeEach: function() {
			this.LightBox = new sap.m.LightBox({
				imageContent : [
					new sap.m.LightBoxItem()
				]
			});
		},
		afterEach: function() {
			this.LightBox.destroy();
		}
	});

	QUnit.test('Setting the lightbox\'s title', function(assert) {
		// arrange
		var oImageContent = this.LightBox.getImageContent()[0];
		var title = 'Some title to be shown';

		// act
		var result = oImageContent.setTitle(title);

		// assert
		assert.strictEqual(result, oImageContent, 'Setter should return a reference to the object.');
		assert.strictEqual(oImageContent.getTitle(), title, 'The title should be set correctly.');
	});

	QUnit.test('Setting the lightbox\'s subtitle', function(assert) {
		// arrange
		var oImageContent = this.LightBox.getImageContent()[0];
		var subtitle = 'Some subtitle to be shown';

		// act
		var result = oImageContent.setSubtitle(subtitle);

		// assert
		assert.strictEqual(result, oImageContent, 'Setter should return a reference to the object.');
		assert.strictEqual(oImageContent.getSubtitle(), subtitle, 'The subtitle should be set correctly.');
	});

	QUnit.test('Setting the lightbox\'s alt', function(assert) {
		// arrange
		var oImageContent = this.LightBox.getImageContent()[0];
		var alt = 'Some image alt';

		// act
		var result = oImageContent.setAlt(alt);

		// assert
		assert.strictEqual(result, oImageContent, 'Setter should return a reference to the object.');
		assert.strictEqual(oImageContent.getAlt(), alt, 'The alt should be set correctly.');
	});

	QUnit.test('Setting the lightbox\'s image source', function(assert) {
		// arrange
		var oImageContent = this.LightBox.getImageContent()[0];
		var sSource = '../images/demo/nature/elephant.jpg';
		var image = new window.Image();
		image.src = sSource;

		// act
		var result = oImageContent.setImageSrc(sSource);

		// assert
		assert.strictEqual(result, oImageContent, 'Setter should return a reference to the object.');
		assert.strictEqual(oImageContent.getImageSrc(), sSource, 'The source should be set correctly.');

		this.LightBox.open();
		this.clock.tick(500);

		assert.strictEqual(oImageContent._oImage.src, image.src, 'The native js image source should be set after the LightBox is open.');
	});

	//================================================================================
	// LightBox public API
	//================================================================================


	QUnit.module('PublicAPI', {
		beforeEach: function() {
			this.LightBox = new sap.m.LightBox({
				imageContent : [
					new sap.m.LightBoxItem()
				]
			});
		},
		afterEach: function() {
			this.LightBox.close();
			this.LightBox.destroy();
		}
	});

	QUnit.test('Opening a lightbox without image source', function(assert) {
		// arrange

		//act
		this.LightBox.open();
		this.clock.tick(500);

		// assert
		assert.strictEqual(this.LightBox.isOpen(), false, 'The lightbox should not be open because no image source is set');
		assert.strictEqual(this.LightBox._oPopup.isOpen(), false, 'The lightbox should not be open because no image source is set.');
	});

	QUnit.test('Opening a lightbox with image source', function(assert) {
		// arrange
		assert.expect(2);
		var oImageContent = this.LightBox.getImageContent()[0],
			sImageSource = '../images/demo/nature/elephant.jpg',
			oLightBoxPopup = this.LightBox._oPopup;

		oImageContent.setImageSrc(sImageSource);

		oLightBoxPopup.attachOpened(function() {
			// assert
			assert.strictEqual(this.LightBox.isOpen(), true, 'The lightbox should be open');
			assert.strictEqual(oLightBoxPopup.isOpen(), true, 'The lightbox should be open');
		}, this);
		sap.ui.getCore().applyChanges();

		//act
		this.LightBox.open();
		this.clock.tick(500);
	});

	QUnit.test('Closing a lightbox', function(assert) {
		// arrange
		var oImageContent = this.LightBox.getImageContent()[0],
			sImageSource = '../images/demo/nature/elephant.jpg',
			oLightBoxPopup = this.LightBox._oPopup;

		oImageContent.setImageSrc(sImageSource);
		oLightBoxPopup.attachClosed(function() {
			//assert
			assert.strictEqual(this.LightBox.isOpen(), false, 'The lightbox should be closed.');
			assert.strictEqual(oLightBoxPopup.isOpen(), false, 'The lightbox should be open');
		}, this);

		// act
		this.LightBox.open();
		this.clock.tick(500);

		//assert
		assert.strictEqual(this.LightBox.isOpen(), true, 'The lightbox should be open.');

		// act
		this.LightBox.close();
		this.clock.tick(1000);
	});

	//================================================================================
	// LightBox private methods
	//================================================================================

	QUnit.module('private methods', {
		beforeEach: function() {
			this.LightBox = new sap.m.LightBox({
				imageContent : [
					new sap.m.LightBoxItem()
				]
			});
		},
		afterEach: function() {
			this.LightBox.destroy();
		}
	});

	QUnit.test('pixel to numbers method', function(assert) {
		var expectedResult = 1234567;
		var actualResult = this.LightBox._pxToNumber('123456789');
		// assert
		assert.strictEqual(actualResult, expectedResult, 'The result should be 1234567');
	});


	QUnit.test('Setting image state', function(assert) {
		var oImageContent = this.LightBox.getImageContent()[0];
		oImageContent._setImageState('ERROR');
		var actualResult = oImageContent._getImageState();
		var expectedResult = 'ERROR';
		// assert
		assert.strictEqual(actualResult, expectedResult, 'The result should be "ERROR"');
	});

	//================================================================================
	// LightBox accessibility
	//================================================================================

	QUnit.module('Accessibility', {
		beforeEach: function() {
			this.LightBox = new sap.m.LightBox({
				imageContent : [
					new sap.m.LightBoxItem()
				]
			});
		},
		afterEach: function() {
			this.LightBox.destroy();
		}
	});


	QUnit.test('ACC state', function(assert) {
		var oImageContent = this.LightBox.getImageContent()[0],
			sImageSource = '../images/demo/nature/elephant.jpg';

		oImageContent.setImageSrc(sImageSource);

		sap.ui.getCore().applyChanges();

		this.LightBox.open();
		this.clock.tick(500);

		var $popupContent = this.LightBox._oPopup.getContent().$();

		assert.ok($popupContent.attr('aria-labelledby'), 'aria-labelledby attribute is set');
		assert.strictEqual($popupContent.attr('role'), 'dialog', 'correct role is set');
	});
})();