describe('sap.m.Token', function() {

    it('should load test page', function () {
        expect(takeScreenshot()).toLookAs('initial');
    });

    //Token not selected, editable
    it('should show not selected token editable', function () {
        expect(takeScreenshot( element(by.id('tokenNotSelected1')))).toLookAs('token-not-selected-editable');
    });

    //Token not selected, not editable
    it('should show token not editable', function () {
        expect(takeScreenshot( element(by.id('tokenSelected3')))).toLookAs('token-not-selected-not-editable');
    });

    //Token selected, editable
    it('should show  selected token, editable', function () {
        expect(takeScreenshot( element(by.id('tokenSelected4')))).toLookAs('token-selected-editable');
    });

    //Token selected, not editable
    it('should show  selected token, not editable', function () {
        expect(takeScreenshot( element(by.id('tokenSelected6')))).toLookAs('token-selected-not-editable');
    });
});