/*global QUnit*/

sap.ui.define([
	"sap/m/LightBox",
	"sap/m/LightBoxItem",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/m/library"
], function(
	LightBox,
	LightBoxItem,
	qutils,
	KeyCodes,
	library
) {
		'use strict';

		// shortcut for sap.m.LightBoxLoadingStates
		var LightBoxLoadingStates = library.LightBoxLoadingStates;

		var IMAGE_PATH = 'test-resources/sap/m/images/';
		var LIGHTBOX_OPEN_TIME = 300;

		//================================================================================
		// LightBox Base API
		//================================================================================

		QUnit.module('API', {
			beforeEach: function() {
				this.LightBox = new LightBox({
					imageContent : [
						new LightBoxItem()
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
				this.LightBox = new LightBox({
					imageContent : [
						new LightBoxItem()
					]
				});
			},
			afterEach: function() {
				if (this.LightBox.isOpen()) {
					this.LightBox.close();
				}
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
			var done = assert.async();
			var oImageContent = this.LightBox.getImageContent()[0];
			var sSource = IMAGE_PATH + 'demo/nature/elephant.jpg';
			var image = new window.Image();
			image.src = sSource;

			// act
			var result = oImageContent.setImageSrc(sSource);

			// assert
			assert.strictEqual(result, oImageContent, 'Setter should return a reference to the object.');
			assert.strictEqual(oImageContent.getImageSrc(), sSource, 'The source should be set correctly.');

			this.LightBox.open();

			setTimeout(function () {
				assert.strictEqual(oImageContent._oImage.src, image.src, 'The native js image source should be set after the LightBox is open.');
				done();
			}, LIGHTBOX_OPEN_TIME);
		});

		//================================================================================
		// LightBox public API
		//================================================================================


		QUnit.module('PublicAPI', {
			beforeEach: function() {
				this.LightBox = new LightBox({
					imageContent : [
						new LightBoxItem()
					]
				});
			},
			afterEach: function() {
				if (this.LightBox.isOpen()) {
					this.LightBox.close();
				}
				this.LightBox.destroy();
			}
		});

		QUnit.test('Opening a lightbox without image source', function(assert) {
			//act
			this.LightBox.open();

			// assert
			assert.strictEqual(this.LightBox.isOpen(), false, 'The lightbox should not be open because no image source is set');
			assert.strictEqual(this.LightBox._oPopup.isOpen(), false, 'The lightbox should not be open because no image source is set.');
		});

		QUnit.test('Opening a lightbox with image source', function(assert) {

			// arrange
			var done = assert.async(),
				oImageContent = this.LightBox.getImageContent()[0],
				sImageSource = IMAGE_PATH + 'demo/nature/elephant.jpg',
				oNativeImage = oImageContent._getNativeImage(),
				fnOnload = oNativeImage.onload,
				oLightBoxPopup = this.LightBox._oPopup;

			oImageContent.setImageSrc(sImageSource);
			sap.ui.getCore().applyChanges();

			oNativeImage.onload = function () {
				fnOnload.apply(oNativeImage, arguments);
				// Assert
				assert.strictEqual(this.LightBox.isOpen(), true, 'The lightbox should be open');
				assert.strictEqual(oLightBoxPopup.isOpen(), true, 'The lightbox should be open');
				done();
			}.bind(this);

			assert.expect(2);

			//act
			this.LightBox.open();
		});

		QUnit.test('Closing a lightbox', function(assert) {
			// arrange
			var oImageContent = this.LightBox.getImageContent()[0],
				sImageSource = IMAGE_PATH + 'demo/nature/elephant.jpg',
				oLightBoxPopup = this.LightBox._oPopup,
				done = assert.async();

			oImageContent.setImageSrc(sImageSource);
			oLightBoxPopup.attachClosed(function() {
				//assert
				assert.strictEqual(this.LightBox.isOpen(), false, 'The lightbox should be closed.');
				assert.strictEqual(oLightBoxPopup.isOpen(), false, 'The lightbox should be open');
			}, this);

			// act
			this.LightBox.open();

			setTimeout(function () {
				//assert
				assert.strictEqual(this.LightBox.isOpen(), true, 'The lightbox should be open.');

				// act
				this.LightBox.close();

				done();

			}.bind(this), LIGHTBOX_OPEN_TIME);
		});

		//================================================================================
		// LightBox private methods
		//================================================================================

		QUnit.module('private methods', {
			beforeEach: function() {
				this.LightBox = new LightBox({
					imageContent : [
						new LightBoxItem()
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
				this.LightBox = new LightBox({
					imageContent : [
						new LightBoxItem({
							title: "Title",
							subtitle: "Subtitle"
						})
					]
				});
				this._oRB = sap.ui.getCore().getLibraryResourceBundle("sap.m");
			},
			afterEach: function() {
				this.LightBox.close();
				this.LightBox.destroy();
				this._oRB = null;
			}
		});


		QUnit.test('ACC state', function(assert) {
			var oImageContent = this.LightBox.getImageContent()[0],
				sImageSource = IMAGE_PATH + 'demo/nature/elephant.jpg',
				done = assert.async();

			oImageContent.setImageSrc(sImageSource);

			sap.ui.getCore().applyChanges();

			this.LightBox.open();

			setTimeout(function () {
				var $popupContent = this.LightBox._oPopup.getContent().$();

				assert.ok($popupContent.attr('aria-labelledby'), 'aria-labelledby attribute is set');
				assert.strictEqual($popupContent.attr('role'), 'dialog', 'correct role is set');
				done();

			}.bind(this), LIGHTBOX_OPEN_TIME);
		});

		QUnit.test('ACC error state', function(assert) {
			var oImageContent = this.LightBox.getImageContent()[0];

			oImageContent._setImageState(LightBoxLoadingStates.Error);
			this.LightBox.onBeforeRendering();

			assert.ok(this.LightBox.getAggregation("_invisiblePopupText").getText().indexOf(this._oRB.getText('LIGHTBOX_IMAGE_ERROR_DETAILS')) > 0, "Error message is added to ACC info.");
		});

		QUnit.test('ESC should close LightBox', function(assert) {
			// arrange
			var done = assert.async();
			var oImageContent = this.LightBox.getImageContent()[0],
				sImageSource = IMAGE_PATH + 'demo/nature/elephant.jpg';

			oImageContent.setImageSrc(sImageSource);
			sap.ui.getCore().applyChanges();

			// act
			this.LightBox.open();
			setTimeout(function () {
				// Assert
				qutils.triggerKeydown(this.LightBox.getDomRef(), KeyCodes.ESCAPE);
				setTimeout(function () {
					// Assert
					assert.strictEqual(this.LightBox.isOpen(), false, 'Dialog should be closed.');
					done();
				}.bind(this), 500);
			}.bind(this), 500);
		});

		QUnit.test('InvisibleText of LightBox', function(assert) {
			var oImageContent = this.LightBox.getImageContent()[0],
				sImageSource = IMAGE_PATH + 'demo/nature/elephant.jpg',
				done = assert.async();

			oImageContent.setImageSrc(sImageSource);

			sap.ui.getCore().applyChanges();

			this.LightBox.open();

			setTimeout(function () {
				var oInvisibleText = this.LightBox.getAggregation("_invisiblePopupText"),
					sInvisibleText = oInvisibleText.getText();

				assert.ok(sInvisibleText.indexOf(oImageContent.getTitle()) > -1, 'The invisible text should contain the title of the LightBox');
				assert.ok(sInvisibleText.indexOf(oImageContent.getSubtitle()) > -1, 'The invisible text should contain the subtitle of the LightBox');

				done();
			}.bind(this), LIGHTBOX_OPEN_TIME);
		});

		QUnit.test("LightBox should have accessibility attribute aria-modal set to true", function(assert) {
			// arrange
			var oImageContent = this.LightBox.getImageContent()[0],
				sImageSource = IMAGE_PATH + 'demo/nature/elephant.jpg',
				done = assert.async();

			oImageContent.setImageSrc(sImageSource);

			sap.ui.getCore().applyChanges();

			// act
			this.LightBox.open();

			// assert
			setTimeout(function() {
				assert.strictEqual(this.LightBox._oPopup.getContent().$().attr('aria-modal'), "true", 'aria-modal attribute is true');
				done();
			}.bind(this), LIGHTBOX_OPEN_TIME);
		});

		//================================================================================
		// LightBox sapMLightBoxTopCornersRadius class
		//================================================================================

		QUnit.module('HasClass', {
			beforeEach: function() {
				this.LightBox = new LightBox({
					imageContent : [
						new LightBoxItem()
					]
				});
			},
			afterEach: function() {
				this.LightBox.close();
				this.LightBox.destroy();
			}
		});


		QUnit.test('sapMLightBoxTopCornersRadius class - big image', function(assert) {
			var oImageContent = this.LightBox.getImageContent()[0],
				sImageSource = IMAGE_PATH + 'demo/nature/elephant.jpg'; // big image

			oImageContent.setImageSrc(sImageSource);
			sap.ui.getCore().applyChanges();

			var done = assert.async();

			// Act
			this.LightBox.open();

			// Wait for CSS animation to complete
			setTimeout(function () {
				var $popupContent = this.LightBox._oPopup.getContent().$();

				// Assert
				assert.ok($popupContent.hasClass('sapMLightBox'), 'sapMLightBox class is there');
				assert.ok($popupContent.hasClass('sapMLightBoxTopCornersRadius'), 'sapMLightBoxTopCornersRadius class is there');
				done();
			}.bind(this), 100);
		});

		QUnit.test('sapMLightBoxTopCornersRadius class - small image', function (assert) {
			var oImageContent = this.LightBox.getImageContent()[0],
				sImageSource = IMAGE_PATH + 'demo/smallImgs/150x150.jpg'; // small image

			oImageContent.setImageSrc(sImageSource);
			sap.ui.getCore().applyChanges();

			var done = assert.async();

			// Act
			this.LightBox.open();

			// Wait for CSS animation to complete
			setTimeout(function () {
				var $popupContent = this.LightBox._oPopup.getContent().$();

				// Assert
				assert.notOk($popupContent.hasClass('sapMLightBoxTopCornersRadius'), 'sapMLightBoxTopCornersRadius class is not there');
				done();
			}.bind(this), 100);
		});

		QUnit.test('sapMLightBoxTopCornersRadius class - horizontal image', function (assert) {
			var oImageContent = this.LightBox.getImageContent()[0],
				sImageSource = IMAGE_PATH + 'demo/smallImgs/320x150.jpg'; // horizontal image

			oImageContent.setImageSrc(sImageSource);
			sap.ui.getCore().applyChanges();

			var done = assert.async();

			// Act
			this.LightBox.open();

			// Wait for CSS animation to complete
			setTimeout(function () {
				var $popupContent = this.LightBox._oPopup.getContent().$();

				// Assert
				assert.notOk($popupContent.hasClass('sapMLightBoxTopCornersRadius'), 'sapMLightBoxTopCornersRadius class is not there');
				done();
			}.bind(this), 100);
		});

		QUnit.test('sapMLightBoxTopCornersRadius class - vertical image', function (assert) {
			var oImageContent = this.LightBox.getImageContent()[0],
				sImageSource = IMAGE_PATH + 'demo/smallImgs/150x288.jpg'; // vertical image

			oImageContent.setImageSrc(sImageSource);
			sap.ui.getCore().applyChanges();

			var done = assert.async();

			// Act
			this.LightBox.open();

			// Wait for CSS animation to complete
			setTimeout(function () {
				var $popupContent = this.LightBox._oPopup.getContent().$();

				// Assert
				assert.notOk($popupContent.hasClass('sapMLightBoxTopCornersRadius'), 'sapMLightBoxTopCornersRadius class is not there');
				done();
			}.bind(this), 100);
		});

		QUnit.module('Resize', {
			beforeEach: function() {
				this.LightBox = new LightBox({
					imageContent : [
						new LightBoxItem({
							imageSrc: IMAGE_PATH + 'demo/nature/elephant.jpg'
						})
					]
				});
			},
			afterEach: function() {
				this.LightBox.close();
				this.LightBox.destroy();
			}
		});

		QUnit.test('image source', function(assert) {
			var done = assert.async();

			// Act
			this.LightBox.open();
			sap.ui.getCore().applyChanges();

			// Wait for CSS animation to complete
			setTimeout(function () {

				var nativeImage = this.LightBox._oPopup.getContent().$().find('img')[0];

				this.LightBox._setImageSize(this.LightBox._getImageContent().getAggregation("_image"), 100, 100);

				setTimeout(function () {

					var newNativeImage = this.LightBox._oPopup.getContent().$().find('img')[0];
					assert.strictEqual(nativeImage, newNativeImage, 'native image is not changed during resizing');

					done();
				}.bind(this), 100);

			}.bind(this), 100);
		});
	}
);
