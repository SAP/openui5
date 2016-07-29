(function () {
    'use strict';

    jQuery.sap.require('sap.ui.qunit.qunit-css');
    jQuery.sap.require('sap.ui.qunit.QUnitUtils');
    jQuery.sap.require('sap.ui.thirdparty.qunit');
    jQuery.sap.require('sap.ui.thirdparty.sinon');
    jQuery.sap.require('sap.ui.thirdparty.sinon-qunit');
    sinon.config.useFakeTimers = true;

    //================================================================================
    // LightBox Base API
    //================================================================================

    QUnit.module('API', {
        setup: function() {
            this.LightBox = new sap.m.LightBox({
                imageContent : [
                    new sap.m.LightBoxItem()
                ]
            });
        },
        teardown: function() {
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
        setup: function() {
            this.LightBox = new sap.m.LightBox({
                imageContent : [
                    new sap.m.LightBoxItem()
                ]
            });
        },
        teardown: function() {
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

        // act
        var result = oImageContent.setImageSrc(sSource);

        // assert
        assert.strictEqual(result, oImageContent, 'Setter should return a reference to the object.');
        assert.strictEqual(oImageContent.getImageSrc(), sSource, 'The source should be set correctly.');
        assert.strictEqual(oImageContent._oImage.src, '', 'The native js image source should not be set because LightBox is not open.');
    });

    //================================================================================
    // LightBox public API
    //================================================================================


    QUnit.module('PublicAPI', {
        setup: function() {
            this.LightBox = new sap.m.LightBox({
                imageContent : [
                    new sap.m.LightBoxItem()
                ]
            });
        },
        teardown: function() {
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
        expect(2);
        var done = assert.async;
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
        }, this)

        // act
        this.LightBox.open();
        this.clock.tick(500);

        //assert
        assert.strictEqual(this.LightBox.isOpen(), true, 'The lightbox should be open.');

        // act
        this.LightBox.close();
        this.clock.tick(1000);
    });

})();