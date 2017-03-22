describe('sap.m.Tokenizer', function() {

    it('should load test page', function () {
        expect(takeScreenshot()).toLookAs('initial');
    });

    //Editable tokenizer not selected
    it("should show  editable  Tokenzier", function () {
        expect(takeScreenshot(element(by.id("editableTokenizer")))).toLookAs("tokenizer-editable-not-selected");

    });

    //Editable tokenizer selected
    it("should show  editable  Tokenzier", function () {
        element(by.id("editableTokenizer")).click();
        expect(takeScreenshot(element(by.id("editableTokenizer")))).toLookAs("tokenizer-editable-selected");

    });

    //Show not editable  tokenizer
    it("should show not editable  Tokenzier", function () {
        expect(takeScreenshot(element(by.id("notEditableTokenizer")))).toLookAs("tokenizer-not-editable-not-selected");
    });

    //Not editable tokenizer selected
    it("should select not editable  Tokenzier", function () {
        element(by.id("notEditableTokenizer")).click();
        expect(takeScreenshot(element(by.id("notEditableTokenizer")))).toLookAs("tokenizer-not-editable-selected");

    });

    //Not editable and editable tokenizer not selected
    it("should select not editable  Tokenzier", function () {
        expect(takeScreenshot(element(by.id("editableAndNotEditable")))).toLookAs("tokenizer-editable-and-not-editalbe");

    });

    //Not editable and editable tokenizer selected
    it("should select not editable  Tokenzier", function () {
        element(by.id("editableAndNotEditable")).click();
        expect(takeScreenshot(element(by.id("editableAndNotEditable")))).toLookAs("tokenizer-editable-and-not-editalbe-no");

    });

    //Set width tokenizer not selected
    it("should show set width Tokenzier", function () {
        expect(takeScreenshot(element(by.id("setWidth")))).toLookAs("tokenizer-set-width-not-selected");

    });

    //Set width tokenizer selected
    it("should select set width Tokenzier", function () {
        element(by.id("setWidth")).click();
        expect(takeScreenshot(element(by.id("setWidth")))).toLookAs("tokenizer-set-width-selected");

    });
});