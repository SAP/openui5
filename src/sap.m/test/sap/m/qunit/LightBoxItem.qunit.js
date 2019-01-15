/*global QUnit,sinon*/

sap.ui.define(
	["sap/m/LightBoxItem"],
	function (LightBoxItem) {
		'use strict';

		QUnit.module('API', {
			beforeEach: function () {
				this.LightBoxItem = new LightBoxItem();
			},
			afterEach: function () {
				this.LightBoxItem.destroy();
			}
		});


		QUnit.test('Setting image source', function (assert) {
			//arrange
			var imageSrc = 'test.jpg';
			this.LightBoxItem.setImageSrc(imageSrc);
			//act
			var actualResult = this.LightBoxItem.getImageSrc();

			//assert
			assert.strictEqual(actualResult, imageSrc, 'Should set correct image source');
		});

		QUnit.test('Setting native image source when popup is not open', function (assert) {
			//arrange
			sinon.stub(this.LightBoxItem, 'getParent', function () {
				return {
					_oPopup: {
						getOpenState: function () {
							return 'LOADING';
						}
					}
				};
			});
			var imageSrc = 'test.jpg';

			// act
			this.LightBoxItem.setImageSrc(imageSrc);

			// assert
			assert.strictEqual(this.LightBoxItem._getNativeImage().getAttribute('src'), imageSrc, 'setImageSrc should not set the image src if the popup is open');

			// clean
			this.LightBoxItem.getParent.restore();
		});

		QUnit.test('Setting image alt', function (assert) {
			//arrange
			var imageAlt = 'test image';
			this.LightBoxItem.setAlt(imageAlt);
			//act
			var actualResult = this.LightBoxItem.getAlt();

			//assert
			assert.strictEqual(actualResult, imageAlt, 'Should set correct image alt');
		});

		QUnit.test('Setting image title', function (assert) {
			//arrange
			var imageTitle = 'test image';
			this.LightBoxItem.setTitle(imageTitle);
			//act
			var actualResult = this.LightBoxItem.getTitle();

			//assert
			assert.strictEqual(actualResult, imageTitle, 'Should set correct image title');
		});

		QUnit.test('Setting image subtitle', function (assert) {
			//arrange
			var imageSubtitle = 'test image';
			this.LightBoxItem.setSubtitle(imageSubtitle);
			//act
			var actualResult = this.LightBoxItem.getSubtitle();

			//assert
			assert.strictEqual(actualResult, imageSubtitle, 'Should set correct image subtitle');
		});

		QUnit.test('Setting image subtitle', function (assert) {
			//arrange
			var imageSubtitle = 'test image';
			this.LightBoxItem.setSubtitle(imageSubtitle);
			//act
			var actualResult = this.LightBoxItem.getSubtitle();

			//assert
			assert.strictEqual(actualResult, imageSubtitle, 'Should set correct image subtitle');
		});

		QUnit.test('Setting image when state is loading', function (assert) {
			// arrange
			sinon.stub(this.LightBoxItem, 'getParent', function() {
				return {
					_oPopup: {
						getOpenState: function () {
							return 'LOADING';
						}
					}
				};
			});

			var imageSrc = 'test.jpg';
			var image = new window.Image();
			image.src = imageSrc;

			// act
			this.LightBoxItem.setImageSrc(imageSrc);

			// assert
			assert.strictEqual(this.LightBoxItem.getAggregation("_image").getSrc(), imageSrc, 'setImageSrc should set the image src despite the loading state of the LightBoxImage');

			// clean
			this.LightBoxItem.getParent.restore();
		});
	}
);