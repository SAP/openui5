/*global describe,it,element,by,takeScreenshot,expect*/

describe('sap.f.Avatar', function() {
	'use strict';

	it('Test page loaded', function() {
		expect(takeScreenshot()).toLookAs('initial');
	});

	it('Default XS avatar with square shape', function() {
		var defaultXSSquare = element(by.id('defaultXSSquareAvatar')).click();
		expect(takeScreenshot(defaultXSSquare)).toLookAs('default_XS_Square');
	});

	it('Default avatar', function() {
		var defaultAvatar = element(by.id('defaultAvatar'));
		expect(takeScreenshot(defaultAvatar)).toLookAs('default');
	});

	it('Initials M avatar with circle shape', function() {
		var initialsM = element(by.id('initialsMCircleAvatar'));
		expect(takeScreenshot(initialsM)).toLookAs('initials_M');
	});

	it('Icon L avatar', function() {
		var iconL = element(by.id('iconLAvatar'));
		expect(takeScreenshot(iconL)).toLookAs('icon_L');
	});

	it('Image XL avatar', function() {
		var imageXL = element(by.id('imageXL'));
		expect(takeScreenshot(imageXL)).toLookAs('image_XL');
	});

	it('Initials Custom avatar', function() {
		var initialsCustom = element(by.id('initialsCustomAvatar'));
		expect(takeScreenshot(initialsCustom)).toLookAs('initials_custom');
	});

	it('Lightbox avatar', function() {
		element(by.id('__avatar0')).click();
		expect(takeScreenshot(element(by.id('body')))).toLookAs('lightbox_opened');
	});
});
