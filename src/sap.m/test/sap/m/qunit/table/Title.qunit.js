/*global QUnit */
sap.ui.define([
    "sap/m/Title",
    "sap/ui/core/library",
    "sap/ui/core/Lib",
    "sap/ui/core/format/NumberFormat",
	"sap/base/i18n/Localization",
    "sap/m/table/Title",
    "sap/ui/qunit/utils/nextUIUpdate"
], function (Title, coreLibrary, Library, NumberFormat, Localization, TableTitle, nextUIUpdate) {
    "use strict";

    // shortcut for sap.ui.core.TextAlign
    var TextAlign = coreLibrary.TextAlign;

    // shortcut for sap.ui.core.TitleLevel
    var TitleLevel = coreLibrary.TitleLevel;

    const fGetTextForCounts = (iSelectedCount, iTotalCount, bExtendedView) => {
        const oNumberFormat = NumberFormat.getIntegerInstance({groupingEnabled: true});
        const sSelectedCount = oNumberFormat.format(iSelectedCount);
        const sTotalCount = oNumberFormat.format(iTotalCount);
        const oResourceBundle = Library.getResourceBundleFor("sap.m");
        let sText;

        if (iTotalCount < 0 || iTotalCount === undefined && iSelectedCount >= 0) {
            sText = oResourceBundle.getText("TABLETITLE_SELECTED_COUNT_ONLY", [sSelectedCount]);
        } else if (iSelectedCount < 0 || iSelectedCount === undefined && iTotalCount >= 0) {
            sText = sTotalCount;
        } else if (bExtendedView) {
            sText = oResourceBundle.getText("TABLETITLE_SELECTED_ROW_COUNT_EXT", [sSelectedCount, sTotalCount]);
        } else {
            sText = oResourceBundle.getText("TABLETITLE_SELECTED_ROW_COUNT_COMP", [sSelectedCount, sTotalCount]);
        }
        return "(" + sText + ")";
    };



    QUnit.module("Basics", {
        beforeEach : async function() {
            this.oTitle = new Title({
                text : "Hello",
                level : TitleLevel.H1,
                titleStyle : TitleLevel.H2,
                width : "50%",
                textAlign : TextAlign.Begin,
                visible : true,
                tooltip : "Tooltip",
                wrapping: true
            });

            this.oTableTitle = new TableTitle();
            this.oTableTitle2 = new TableTitle({
                title: this.oTitle,
                totalCount: 10,
                selectedCount: 2
            });

            this.oTableTitle2.placeAt("qunit-fixture");
            await nextUIUpdate();
        },
        afterEach : function() {
            this.oTitle.destroy();
            this.oTitle = null;

            this.oTableTitle.destroy();
            this.oTableTitle2.destroy();
            this.oTableTitle = null;
            this.oTableTitle2 = null;
        }
    });

    QUnit.test("API Properties", function(assert){
        assert.equal(this.oTableTitle.getTotalCount(), 0, "Default totalCount is 0");
        assert.equal(this.oTableTitle.getSelectedCount(), 0, "Default selectedCount is 0");
        assert.notOk(this.oTableTitle.getShowExtendedView(), "Default showExtendedView is set to false => Compact view is used");
        assert.ok(this.oTableTitle.getVisible(), "Default visible is set to true");
    });

    QUnit.test("TableTitle should implement ITitle interface", function(assert){
        assert.ok(this.oTableTitle.getMetadata().isInstanceOf("sap.ui.core.ITitle"), "Title control implements ITitle interface");
    });

    QUnit.test("TableTitle should adjust font-size based on Title controls font-size", async function(assert){
        this.oTableTitle2.getTitle().setTitleStyle(TitleLevel.H1);
        await nextUIUpdate();

        assert.equal(this.oTableTitle2.getTitle().getTitleStyle(), TitleLevel.H1, "Title has level H1.");

        const oTableTitle2TitleDomRef = this.oTableTitle2.getTitle().getDomRef();
        const oTableTitle2CountsDomRef = this.oTableTitle2.getDomRef("tableTitleContent");
        let iTableTitle2TitleFontSize, iTableTitle2CountsFontSize;

        iTableTitle2TitleFontSize = parseInt(window.getComputedStyle(oTableTitle2TitleDomRef).fontSize);
        iTableTitle2CountsFontSize = parseInt(window.getComputedStyle(oTableTitle2CountsDomRef).fontSize);

        assert.equal(iTableTitle2TitleFontSize, iTableTitle2CountsFontSize + 2, "The font-size of the TableTitle content is 2px less then of the Title.");

        this.oTableTitle2.getTitle().setTitleStyle(TitleLevel.H6);
        await nextUIUpdate();

        assert.equal(this.oTableTitle2.getTitle().getTitleStyle(), TitleLevel.H6, "Title has level H6");

        iTableTitle2TitleFontSize = parseInt(window.getComputedStyle(oTableTitle2TitleDomRef).fontSize);
        iTableTitle2CountsFontSize = parseInt(window.getComputedStyle(oTableTitle2CountsDomRef).fontSize);

        assert.equal(iTableTitle2TitleFontSize, iTableTitle2CountsFontSize, "The font-size of the TableTitle content matches the Title font-size.");

        this.oTableTitle2.setTotalCount(-1);
        await nextUIUpdate();

        assert.equal(this.oTableTitle2.getTitle().getTitleStyle(), TitleLevel.H6, "Title has level H6");

        iTableTitle2TitleFontSize = parseInt(window.getComputedStyle(oTableTitle2TitleDomRef).fontSize);
        iTableTitle2CountsFontSize = parseInt(window.getComputedStyle(oTableTitle2CountsDomRef).fontSize);

        assert.equal(iTableTitle2TitleFontSize, iTableTitle2CountsFontSize, "The font-size of the TableTitle content matches the Title font-size.");

        this.oTableTitle2.setTotalCount(1);
        this.oTableTitle2.setSelectedCount(-1);
        await nextUIUpdate();

        assert.equal(this.oTableTitle2.getTitle().getTitleStyle(), TitleLevel.H6, "Title has level H6");
        iTableTitle2TitleFontSize = parseInt(window.getComputedStyle(oTableTitle2TitleDomRef).fontSize);
        iTableTitle2CountsFontSize = parseInt(window.getComputedStyle(oTableTitle2CountsDomRef).fontSize);

        assert.equal(iTableTitle2TitleFontSize, iTableTitle2CountsFontSize, "The font-size of the TableTitle content matches the Title font-size.");

        this.oTableTitle2.setTotalCount(-1);
        this.oTableTitle2.setSelectedCount(2);
        await nextUIUpdate();

        assert.equal(this.oTableTitle2.getTitle().getTitleStyle(), TitleLevel.H6, "Title has level H6");
        iTableTitle2TitleFontSize = parseInt(window.getComputedStyle(oTableTitle2TitleDomRef).fontSize);
        iTableTitle2CountsFontSize = parseInt(window.getComputedStyle(oTableTitle2CountsDomRef).fontSize);

        assert.equal(iTableTitle2TitleFontSize, iTableTitle2CountsFontSize, "The font-size of the TableTitle content matches the Title font-size.");

        this.oTableTitle2.setTotalCount(-1);
        this.oTableTitle2.setSelectedCount(2);
        this.oTableTitle2.getTitle().setTitleStyle(TitleLevel.H1);
        await nextUIUpdate();

        assert.equal(this.oTableTitle2.getTitle().getTitleStyle(), TitleLevel.H1, "Title has level H1");
        iTableTitle2TitleFontSize = parseInt(window.getComputedStyle(oTableTitle2TitleDomRef).fontSize);
        iTableTitle2CountsFontSize = parseInt(window.getComputedStyle(oTableTitle2CountsDomRef).fontSize);

        assert.equal(iTableTitle2TitleFontSize, iTableTitle2CountsFontSize + 2, "The font-size of the TableTitle content is 2px less then of the Title.");
    });

    QUnit.test("TableTitle should display counts in compact or extended view", async function(assert){
        const oTableTitle2CountsDomRef = this.oTableTitle2.getDomRef("tableTitleContent");

        assert.equal(this.oTableTitle2.getShowExtendedView(), false, "By default, showExtendedView is set to false => Compact view is used");
        assert.equal(oTableTitle2CountsDomRef.innerText, fGetTextForCounts(2, 10, false), "By default, TableTitle is in compact mode and displays counts in compact format.");

        this.oTableTitle2.setShowExtendedView(true);
        await nextUIUpdate();

        assert.equal(this.oTableTitle2.getShowExtendedView(), true, "Extended view is used");
        assert.equal(oTableTitle2CountsDomRef.innerText, fGetTextForCounts(2, 10, true), "TableTitle is in extended mode and displays counts in extended format.");

        this.oTableTitle2.setSelectedCount(0);
        this.oTableTitle2.setTotalCount(0);
        await nextUIUpdate();

        assert.equal(oTableTitle2CountsDomRef.innerText, "", "When selectedCount and totalCount are 0, they are still displayed.");

        this.oTableTitle2.setSelectedCount(-1);
        this.oTableTitle2.setTotalCount(-1);
        await nextUIUpdate();

        assert.equal(oTableTitle2CountsDomRef.innerText, "", "When selectedCount and totalCount are  < 0, nothing is displayed.");

        this.oTableTitle2.setSelectedCount(-1);
        this.oTableTitle2.setTotalCount(1);
        await nextUIUpdate();

        assert.equal(oTableTitle2CountsDomRef.innerText, fGetTextForCounts(-1, 1, true), "When only totalCount is >= 0, it will be shown without a label.");

        this.oTableTitle2.setSelectedCount(1);
        this.oTableTitle2.setTotalCount(-1);
        await nextUIUpdate();

        assert.equal(oTableTitle2CountsDomRef.innerText, fGetTextForCounts(1, -1, true), "When only selectedCount is >= 0, it will be shown with a label.");

        this.oTableTitle2.setShowExtendedView(undefined);
        await nextUIUpdate();

        assert.equal(this.oTableTitle2.getShowExtendedView(), false, "showExtendedView is reset to default value false => Compact view is used.");
        assert.equal(oTableTitle2CountsDomRef.innerText, fGetTextForCounts(1, -1, false), "Changing to compact view has no effect as long as only selectedCount is >= 0.");

        this.oTableTitle2.setSelectedCount(-1);
        this.oTableTitle2.setTotalCount(1);
        await nextUIUpdate();

        assert.equal(oTableTitle2CountsDomRef.innerText, fGetTextForCounts(-1, 1, false), "Changing to compact view has no effect as long as only totalCount is >= 0.");

        this.oTableTitle2.setSelectedCount(undefined);
        this.oTableTitle2.setTotalCount(undefined);
        await nextUIUpdate();

        assert.equal(oTableTitle2CountsDomRef.innerText, "", "Setting counts to undefined, resets to default values.");
    });

    QUnit.test("TableTitle context switches the extended count label between rows and items", async function(assert){
        const oResourceBundle = Library.getResourceBundleFor("sap.m");

        this.oTableTitle2.setShowExtendedView(true);
        await nextUIUpdate();

        assert.equal(this.oTableTitle2.getContext(), "Table", "Default context is Table");
        assert.equal(this.oTableTitle2.getDomRef("tableTitleContent").innerText,
            "(" + oResourceBundle.getText("TABLETITLE_SELECTED_ROW_COUNT_EXT", ["2", "10"]) + ")",
            "Default context renders the row count label");

        this.oTableTitle2.setContext("List");
        await nextUIUpdate();

        assert.equal(this.oTableTitle2.getDomRef("tableTitleContent").innerText,
            "(" + oResourceBundle.getText("TABLETITLE_SELECTED_ITEM_COUNT_EXT", ["2", "10"]) + ")",
            "List context renders the item count label");
    });

    QUnit.test("TableTitle should change visibility correctly", async function(assert){
        assert.equal(this.oTableTitle2.getVisible(), true, "TableTitle is visible by default.");
        assert.equal(this.oTableTitle2.getDomRef().style.display, "", "TableTitle displayed is set to '' by default.");

        this.oTableTitle2.setVisible(false);
        await nextUIUpdate();

        assert.equal(this.oTableTitle2.getVisible(), false, "TableTitle is not visible.");
        assert.equal(this.oTableTitle2.getDomRef().style.display, "none", "TableTitle displayed is set to 'none'.");

        this.oTableTitle2.setVisible(true);
        await nextUIUpdate();

        assert.equal(this.oTableTitle2.getVisible(), true, "TableTitle is visible.");
        assert.equal(this.oTableTitle2.getDomRef().style.display, "", "TableTitle displayed is set to ''.");
    });

    QUnit.test("TableTitle should format the counts correctly based on the current locale", async function(assert){

        this.oTableTitle2.setTotalCount(5);
        this.oTableTitle2.setSelectedCount(-1);
        this.oTableTitle2.fireEvent("onAfterRendering");
        await nextUIUpdate();

        let oTableTitle2CountsDomRef = this.oTableTitle2.getDomRef("tableTitleContent");

        assert.equal(oTableTitle2CountsDomRef.innerText, fGetTextForCounts(-1, 5, false), "totalCount is formatted correctly");

        this.oTableTitle2.setTotalCount(1234567);
        this.oTableTitle2.fireEvent("onAfterRendering");
        await nextUIUpdate();

        assert.equal(oTableTitle2CountsDomRef.innerText, fGetTextForCounts(-1, 1234567, false), "totalCount is formatted correctly with locale en-US");

        Localization.setLanguage("de-DE");

        this.oTableTitle2.destroy();
        this.oTableTitle2 = new TableTitle({
            title: new Title(),
            totalCount: 10,
            selectedCount: -1
        });

        this.oTableTitle2.placeAt("qunit-fixture");
        await nextUIUpdate();

        this.oTableTitle2.setTotalCount(1234567);
        this.oTableTitle2.fireEvent("onAfterRendering");
        await nextUIUpdate();

        oTableTitle2CountsDomRef = this.oTableTitle2.getDomRef("tableTitleContent");

        assert.equal(oTableTitle2CountsDomRef.innerText, fGetTextForCounts(-1, 1234567, false), "totalCount is formatted correctly with locale de-DE");

        this.oTableTitle2.setSelectedCount(1234);
        this.oTableTitle2.fireEvent("onAfterRendering");
        await nextUIUpdate();

        assert.equal(this.oTableTitle2.getShowExtendedView(), false, "Compact view is used");
        assert.equal(oTableTitle2CountsDomRef.innerText, fGetTextForCounts(1234, 1234567, false), "Counts are formatted correctly with locale de-DE in compact mode");

        this.oTableTitle2.setShowExtendedView(true);
        await nextUIUpdate();

        assert.equal(this.oTableTitle2.getShowExtendedView(), true, "Extended view is used");
        assert.equal(oTableTitle2CountsDomRef.innerText, fGetTextForCounts(1234, 1234567, true), "Counts are formatted correctly with locale de-DE in extended mode");

        this.oTableTitle2.setTotalCount(-1);
        await nextUIUpdate();

        assert.equal(oTableTitle2CountsDomRef.innerText, fGetTextForCounts(1234, -1, true), "selectedCount is formatted correctly with locale de-DE in extended mode");
    });
});