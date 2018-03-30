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

	QUnit.module('API', {
		beforeEach: function() {
			this.LightBoxItem = new sap.m.LightBoxItem();
		},
		afterEach: function() {
			this.LightBoxItem.destroy();
		}
	});


	QUnit.test('Setting image source', function(assert) {
		//arange
		var imageSrc = 'test.jpg';
		this.LightBoxItem.setImageSrc(imageSrc);
		//act
		var actualResult = this.LightBoxItem.getImageSrc();

		//assert
		assert.strictEqual(actualResult, imageSrc, 'Shoud set correct image source');
	});

	QUnit.test('Setting image alt', function(assert) {
		//arange
		var imageAlt = 'test image';
		this.LightBoxItem.setAlt(imageAlt);
		//act
		var actualResult = this.LightBoxItem.getAlt();

		//assert
		assert.strictEqual(actualResult, imageAlt, 'Shoud set correct image alt');
	});

	QUnit.test('Setting image title', function(assert) {
		//arange
		var imageTitle = 'test image';
		this.LightBoxItem.setTitle(imageTitle);
		//act
		var actualResult = this.LightBoxItem.getTitle();

		//assert
		assert.strictEqual(actualResult, imageTitle, 'Shoud set correct image title');
	});

	QUnit.test('Setting image subtitle', function(assert) {
		//arange
		var imageSubtitle = 'test image';
		this.LightBoxItem.setSubtitle(imageSubtitle);
		//act
		var actualResult = this.LightBoxItem.getSubtitle();

		//assert
		assert.strictEqual(actualResult, imageSubtitle, 'Shoud set correct image subtitle');
	});

	QUnit.test('Setting image subtitle', function(assert) {
		//arange
		var imageSubtitle = 'test image';
		this.LightBoxItem.setSubtitle(imageSubtitle);
		//act
		var actualResult = this.LightBoxItem.getSubtitle();

		//assert
		assert.strictEqual(actualResult, imageSubtitle, 'Shoud set correct image subtitle');
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

})();