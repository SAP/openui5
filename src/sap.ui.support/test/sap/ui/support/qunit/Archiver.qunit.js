/*global QUnit,sinon*/

sap.ui.require([
	'sap/ui/support/supportRules/report/Archiver'],
	function(Archiver) {
    'use strict';

    var createTestInfo = function(title) {
        return  {
            testInfo: {
                appurl : 'url',
                bootconfig : {},
                build : '20170510112921',
                change : '${lastchange}',
                config : {},
                debug : null,
                docmode : '',
                jquery : '2.2.3',
                libraries : {},
                loadedLibraries : {},
                locationhash : '',
                locationsearch : '',
                modules : {},
                resourcePaths : {},
                sapUi5Version : {},
                statistics : false,
                themePaths : {},
                title : title,
                uriparams : {},
                useragent : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.96 Safari/537.36',
                version : '1.49.0-SNAPSHOT'
            }
        };
    };

    QUnit.module('Archiver API test', {
        setup: function () {
            sinon.spy(jQuery.sap.log, 'error');
            this.Archiver = new Archiver();
        },
        teardown: function () {
            jQuery.sap.log.error.restore();
            this.Archiver.clear();
            delete this.Archiver;
        }
    });

    QUnit.test('Archiver', function(assert) {
        var mock = createTestInfo('test');

        this.Archiver.add('mockInfo.json', mock, 'json');

        assert.strictEqual(this.Archiver.hasData(), true, 'There is data within the Archiver !');

        assert.ok(this.Archiver._mData.hasOwnProperty('mockInfo.json') , 'The data is inside the Archiver !');

        assert.ok(typeof this.Archiver._mData['mockInfo.json'] === 'string', 'The data is of the correct type !');

        this.Archiver.clear();

        assert.ok(!this.Archiver._mData.hasOwnProperty('mockInfo.json'), 'Cleared successfully !');

        assert.equal(this.Archiver.hasData(), false, 'The data  has been cleared successfully !');
    });
});