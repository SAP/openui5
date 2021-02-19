sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
	'../utility/Arrangement',
	'../utility/Action',
	'../utility/Assertion',
	'sap/ui/Device',
	"sap/ui/events/KeyCodes"
], function (Opa5, opaTest, Arrangement, Action, Assertion, Device, KeyCodes) {
	'use strict';

	if (window.blanket) {
		//window.blanket.options("sap-ui-cover-only", "sap/ui/mdc");
		window.blanket.options("sap-ui-cover-never", "sap/viz");
	}

	Opa5.extendConfig({
		arrangements: new Arrangement(),
		actions: new Action(),
		assertions: new Assertion(),
		autoWait: true
	});

	var LABEL_MTABLE_MDCGRID_DELEGATE = "M.Table / MDC.GridtableType: via Delegate";
	var LABEL_MTABLE_MDCGRID_XML = "M.Table / MDC.GridtableType: via XML";
	var LABEL_MTABLE_MDCRESPONSIVE_DELEGATE = "M.Table / MDC.ResponsivetableType: via Delegate";
	var LABEL_MTABLE_MDCRESPONSIVE_XML = "M.Table / MDC.ResponsivetableType: via XML";

	var LABEL_MTABLE_DELEGATE = "M.Table via Delegate";
	var LABEL_MTABLE_XML = "M.Table via XML";
	var LABEL_MTABLE = "M.Table";
	var LABEL_MTABLE_INPUTPARAMETER = "M.Table with InputParameter";
	var LABEL_MDCTABLE_INPUTPARAMETER = "MDC.Table with InputParameter";


	opaTest("'M.Table / MDC.GridTableType: via Delegate' - SingleSelect / Suggest -> Dialog", function (Given, When, Then) {

		Given.iStartMyAppInAFrame({
			source: "test-resources/sap/ui/mdc/qunit/field/opa/valuehelp/index.html",
			autoWait: true
		});

		When.iLookAtTheScreen();

		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_DELEGATE, KeyCodes.ARROW_DOWN);
		Then.iShouldSeeATableOfType("sap.m.Table");
		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_DELEGATE, KeyCodes.ESCAPE);

		When.iEnterTextOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_DELEGATE, "gil");
		Then.iShouldSeeATableOfType("sap.m.Table");
		Then.iShouldSeeMTableItems(["Gilman, Charlotte Perkins", "Virgil", "Chesterton, G. K. (Gilbert Keith)", "Gilbert, W. S. (William Schwenck)"]);

		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_DELEGATE, KeyCodes.ARROW_DOWN);
		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_DELEGATE, KeyCodes.ENTER);

		Then.iShouldSeeSelectedConditionOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_DELEGATE, "Gilman, Charlotte Perkins (102)");

		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_DELEGATE, KeyCodes.F4);

		Then.iShouldSeeATableOfType("sap.ui.table.Table");
		Then.iShouldSeeUITableSelection(["Gilman, Charlotte Perkins"], 1);

		When.iEnterTextOnDialogSearchField("mark");
		When.iPressButtonWithText("Go");
		Then.iShouldSeeUITableItems(["Twain, Mark", "Jacobs, W. W. (William Wymark)", "Marks, Winston K."]);

		When.iPressButtonWithText("Show Filters");
		When.iEnterTextOnFilterFieldWithLabel("Name", "Twain*");
		When.iPressKeyOnFilterFieldWithLabel("Name", KeyCodes.ENTER);

		Then.iShouldSeeUITableItems(["Twain, Mark"]);

		When.iSelectUITableItems(["Twain, Mark"]);
		Then.iShouldSeeUITableSelection(["Twain, Mark"], 1);

		When.iPressButtonWithText("OK");

		Then.iShouldSeeSelectedConditionOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_DELEGATE, "Twain, Mark (106)");
		Then.iTeardownMyAppFrame();
	});

	opaTest("'M.Table / MDC.GridTableType: via Delegate' - MultiSelect / Suggest -> Dialog", function (Given, When, Then) {

		Given.iStartMyAppInAFrame({
			source: "test-resources/sap/ui/mdc/qunit/field/opa/valuehelp/index.html?maxconditions=-1",
			autoWait: true
		});

		When.iLookAtTheScreen();

		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_DELEGATE, KeyCodes.ARROW_DOWN);
		Then.iShouldSeeATableOfType("sap.m.Table");
		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_DELEGATE, KeyCodes.ESCAPE);

		When.iEnterTextOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_DELEGATE, "car");
		Then.iShouldSeeATableOfType("sap.m.Table");
		Then.iShouldSeeMTableItems(["Carroll, Lewis", "Wilde, Oscar" , "Descartes, Rene", "Clausewitz, Carl von", "Collodi, Carlo", "Carlyle, Thomas", "Wells, Carolyn", "Lucretius Carus, Titus", "Reynolds, George W. M. (George William MacArthur)", "Carnegie, Andrew"]);

		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_DELEGATE, KeyCodes.ARROW_DOWN);
		When.iPressKeyOnMTableRow(0, KeyCodes.SPACE);
		When.iPressKeyOnMTableRow(1, KeyCodes.ENTER);

		Then.iShouldSeeSelectedTokensOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_DELEGATE, ["Carroll, Lewis (103)", "Wilde, Oscar (107)"]);

		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_DELEGATE, KeyCodes.F4);

		Then.iShouldSeeATableOfType("sap.ui.table.Table");
		Then.iShouldSeeUITableSelection(["Carroll, Lewis", "Wilde, Oscar"], 2);


		When.iEnterTextOnDialogSearchField("mark");
		When.iPressButtonWithText("Go");
		Then.iShouldSeeUITableItems(["Twain, Mark", "Jacobs, W. W. (William Wymark)", "Marks, Winston K."]);

		When.iPressButtonWithText("Show Filters");
		When.iEnterTextOnFilterFieldWithLabel("Name", "Twain*");
		When.iPressKeyOnFilterFieldWithLabel("Name", KeyCodes.ENTER);

		Then.iShouldSeeUITableItems(["Twain, Mark"]);

		When.iSelectUITableItems(["Twain, Mark"]);
		Then.iShouldSeeUITableSelection(["Twain, Mark"], 1);

		When.iPressButtonWithText("OK");

		Then.iShouldSeeSelectedTokensOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_DELEGATE, ["Carroll, Lewis (103)", "Wilde, Oscar (107)", "Twain, Mark (106)"]);

		Then.iTeardownMyAppFrame();
	});

	// XML

	opaTest("'M.Table / MDC.GridTableType: via XML' - SingleSelect / Suggest -> Dialog", function (Given, When, Then) {

		Given.iStartMyAppInAFrame({
			source: "test-resources/sap/ui/mdc/qunit/field/opa/valuehelp/index.html",
			autoWait: true
		});

		When.iLookAtTheScreen();

		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_XML, KeyCodes.ARROW_DOWN);
		Then.iShouldSeeATableOfType("sap.m.Table");
		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_XML, KeyCodes.ESCAPE);

		When.iEnterTextOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_XML, "gil");
		Then.iShouldSeeATableOfType("sap.m.Table");
		Then.iShouldSeeMTableItems(["Gilman, Charlotte Perkins", "Virgil", "Chesterton, G. K. (Gilbert Keith)", "Gilbert, W. S. (William Schwenck)"]);

		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_XML, KeyCodes.ARROW_DOWN);
		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_XML, KeyCodes.ENTER);

		Then.iShouldSeeSelectedConditionOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_XML, "Gilman, Charlotte Perkins (102)");

		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_XML, KeyCodes.F4);

		Then.iShouldSeeATableOfType("sap.ui.table.Table");
		Then.iShouldSeeUITableSelection(["Gilman, Charlotte Perkins"], 1);

		When.iEnterTextOnDialogSearchField("mark");
		When.iPressButtonWithText("Go");
		Then.iShouldSeeUITableItems(["Twain, Mark", "Jacobs, W. W. (William Wymark)", "Marks, Winston K."]);

		When.iPressButtonWithText("Show Filters");
		When.iEnterTextOnFilterFieldWithLabel("Name", "Twain*");
		When.iPressKeyOnFilterFieldWithLabel("Name", KeyCodes.ENTER);

		Then.iShouldSeeUITableItems(["Twain, Mark"]);

		When.iSelectUITableItems(["Twain, Mark"]);
		Then.iShouldSeeUITableSelection(["Twain, Mark"], 1);

		When.iPressButtonWithText("OK");

		Then.iShouldSeeSelectedConditionOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_XML, "Twain, Mark (106)");
		Then.iTeardownMyAppFrame();
	});

	opaTest("'M.Table / MDC.GridTableType: via XML' - MultiSelect / Suggest -> Dialog", function (Given, When, Then) {

		Given.iStartMyAppInAFrame({
			source: "test-resources/sap/ui/mdc/qunit/field/opa/valuehelp/index.html?maxconditions=-1",
			autoWait: true
		});

		When.iLookAtTheScreen();

		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_XML, KeyCodes.ARROW_DOWN);
		Then.iShouldSeeATableOfType("sap.m.Table");
		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_XML, KeyCodes.ESCAPE);

		When.iEnterTextOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_XML, "car");
		Then.iShouldSeeATableOfType("sap.m.Table");
		Then.iShouldSeeMTableItems(["Carroll, Lewis", "Wilde, Oscar" , "Descartes, Rene", "Clausewitz, Carl von", "Collodi, Carlo", "Carlyle, Thomas", "Wells, Carolyn", "Lucretius Carus, Titus", "Reynolds, George W. M. (George William MacArthur)", "Carnegie, Andrew"]);

		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_XML, KeyCodes.ARROW_DOWN);
		When.iPressKeyOnMTableRow(0, KeyCodes.SPACE);
		When.iPressKeyOnMTableRow(1, KeyCodes.ENTER);

		Then.iShouldSeeSelectedTokensOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_XML, ["Carroll, Lewis (103)", "Wilde, Oscar (107)"]);


		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_XML, KeyCodes.F4);
		Then.iShouldSeeATableOfType("sap.ui.table.Table");

		When.iEnterTextOnDialogSearchField("mark");
		When.iPressButtonWithText("Go");
		Then.iShouldSeeUITableItems(["Twain, Mark", "Jacobs, W. W. (William Wymark)", "Marks, Winston K."]);

		When.iPressButtonWithText("Show Filters");
		When.iEnterTextOnFilterFieldWithLabel("Name", "Twain*");
		When.iPressKeyOnFilterFieldWithLabel("Name", KeyCodes.ENTER);

		Then.iShouldSeeUITableItems(["Twain, Mark"]);

		When.iSelectUITableItems(["Twain, Mark"]);
		Then.iShouldSeeUITableSelection(["Twain, Mark"], 1);

		When.iPressButtonWithText("OK");

		Then.iShouldSeeSelectedTokensOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_XML, ["Carroll, Lewis (103)", "Wilde, Oscar (107)", "Twain, Mark (106)"]);

		Then.iTeardownMyAppFrame();
	});

	// MDC.ResponsiveTableType BEG

opaTest("'M.Table / MDC.ResponsiveTableType: via Delegate' - SingleSelect / Suggest -> Dialog", function (Given, When, Then) {

    Given.iStartMyAppInAFrame({
        source: "test-resources/sap/ui/mdc/qunit/field/opa/valuehelp/index.html",
        autoWait: true
    });

    When.iLookAtTheScreen();

    When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_DELEGATE, KeyCodes.ARROW_DOWN);
    Then.iShouldSeeATableOfType("sap.m.Table");
    When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_DELEGATE, KeyCodes.ESCAPE);

    When.iEnterTextOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_DELEGATE, "gil");
    Then.iShouldSeeATableOfType("sap.m.Table");
    Then.iShouldSeeMTableItems(["Gilman, Charlotte Perkins", "Virgil", "Chesterton, G. K. (Gilbert Keith)", "Gilbert, W. S. (William Schwenck)"]);

    When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_DELEGATE, KeyCodes.ARROW_DOWN);
    When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_DELEGATE, KeyCodes.ENTER);

    Then.iShouldSeeSelectedConditionOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_DELEGATE, "Gilman, Charlotte Perkins (102)");

    When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_DELEGATE, KeyCodes.F4);

    Then.iShouldSeeATableOfType("sap.m.Table");
    Then.iShouldSeeMTableSelection(["Gilman, Charlotte Perkins"], 1);

    When.iEnterTextOnDialogSearchField("mark", false);
    When.iPressButtonWithText("Go");
    Then.iShouldSeeMTableItems(["Twain, Mark", "Jacobs, W. W. (William Wymark)", "Marks, Winston K."]);

    When.iPressButtonWithText("Show Filters");
    When.iEnterTextOnFilterFieldWithLabel("Name", "Twain*", false);
    When.iPressKeyOnFilterFieldWithLabel("Name", KeyCodes.ENTER);

    Then.iShouldSeeMTableItems(["Twain, Mark"]);
	When.iSelectMdcResponsiveTableItem("Twain, Mark");
	Then.iShouldSeeMTableSelection(["Twain, Mark"], 1);

    When.iPressButtonWithText("OK");

    Then.iShouldSeeSelectedConditionOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_DELEGATE, "Twain, Mark (106)");
    Then.iTeardownMyAppFrame();
});

opaTest("'M.Table / MDC.ResponsiveTableType: via Delegate' - MultiSelect / Suggest -> Dialog", function (Given, When, Then) {

    Given.iStartMyAppInAFrame({
        source: "test-resources/sap/ui/mdc/qunit/field/opa/valuehelp/index.html?maxconditions=-1",
        autoWait: true
    });

    When.iLookAtTheScreen();

    When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_DELEGATE, KeyCodes.ARROW_DOWN);
    Then.iShouldSeeATableOfType("sap.m.Table");
    When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_DELEGATE, KeyCodes.ESCAPE);

    When.iEnterTextOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_DELEGATE, "car");
    Then.iShouldSeeATableOfType("sap.m.Table");
    Then.iShouldSeeMTableItems(["Carroll, Lewis", "Wilde, Oscar" , "Descartes, Rene", "Clausewitz, Carl von", "Collodi, Carlo", "Carlyle, Thomas", "Wells, Carolyn", "Lucretius Carus, Titus", "Reynolds, George W. M. (George William MacArthur)", "Carnegie, Andrew"]);

    When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_DELEGATE, KeyCodes.ARROW_DOWN);
    When.iPressKeyOnMTableRow(0, KeyCodes.SPACE);
    When.iPressKeyOnMTableRow(1, KeyCodes.ENTER);

    Then.iShouldSeeSelectedTokensOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_DELEGATE, ["Carroll, Lewis (103)", "Wilde, Oscar (107)"]);

    When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_DELEGATE, KeyCodes.F4);

    Then.iShouldSeeATableOfType("sap.m.Table");
    Then.iShouldSeeMTableSelection(["Carroll, Lewis", "Wilde, Oscar"], 2);


    When.iEnterTextOnDialogSearchField("mark");
    When.iPressButtonWithText("Go");
    Then.iShouldSeeMTableItems(["Twain, Mark", "Jacobs, W. W. (William Wymark)", "Marks, Winston K."]);

    When.iPressButtonWithText("Show Filters");
    When.iEnterTextOnFilterFieldWithLabel("Name", "Twain*");
    When.iPressKeyOnFilterFieldWithLabel("Name", KeyCodes.ENTER);

    Then.iShouldSeeMTableItems(["Twain, Mark"]);

    When.iPressKeyOnMTableRow(0, KeyCodes.SPACE);
    Then.iShouldSeeMTableSelection(["Twain, Mark"], 1);

    When.iPressButtonWithText("OK");

    Then.iShouldSeeSelectedTokensOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_DELEGATE, ["Carroll, Lewis (103)", "Wilde, Oscar (107)", "Twain, Mark (106)"]);

    Then.iTeardownMyAppFrame();
});

opaTest("'M.Table / MDC.ResponsiveTableType: via XML' - SingleSelect / Suggest -> Dialog", function (Given, When, Then) {

    Given.iStartMyAppInAFrame({
        source: "test-resources/sap/ui/mdc/qunit/field/opa/valuehelp/index.html",
        autoWait: true
    });

    When.iLookAtTheScreen();

    When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_XML, KeyCodes.ARROW_DOWN);
    Then.iShouldSeeATableOfType("sap.m.Table");
    When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_XML, KeyCodes.ESCAPE);

    When.iEnterTextOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_XML, "gil");
    Then.iShouldSeeATableOfType("sap.m.Table");
    Then.iShouldSeeMTableItems(["Gilman, Charlotte Perkins", "Virgil", "Chesterton, G. K. (Gilbert Keith)", "Gilbert, W. S. (William Schwenck)"]);

    When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_XML, KeyCodes.ARROW_DOWN);
    When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_XML, KeyCodes.ENTER);

    Then.iShouldSeeSelectedConditionOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_XML, "Gilman, Charlotte Perkins (102)");

    When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_XML, KeyCodes.F4);

    Then.iShouldSeeATableOfType("sap.m.Table");
    Then.iShouldSeeMTableSelection(["Gilman, Charlotte Perkins"], 1);

    When.iEnterTextOnDialogSearchField("mark");
    When.iPressButtonWithText("Go");
    Then.iShouldSeeMTableItems(["Twain, Mark", "Jacobs, W. W. (William Wymark)", "Marks, Winston K."]);

    When.iPressButtonWithText("Show Filters");
    When.iEnterTextOnFilterFieldWithLabel("Name", "Twain*");
    When.iPressKeyOnFilterFieldWithLabel("Name", KeyCodes.ENTER);

    Then.iShouldSeeMTableItems(["Twain, Mark"]);

	When.iSelectMdcResponsiveTableItem("Twain, Mark");
    Then.iShouldSeeMTableSelection(["Twain, Mark"], 1);

    When.iPressButtonWithText("OK");

    Then.iShouldSeeSelectedConditionOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_XML, "Twain, Mark (106)");
    Then.iTeardownMyAppFrame();
});

opaTest("'M.Table / MDC.ResponsiveTableType: via XML' - MultiSelect / Suggest -> Dialog", function (Given, When, Then) {

    Given.iStartMyAppInAFrame({
        source: "test-resources/sap/ui/mdc/qunit/field/opa/valuehelp/index.html?maxconditions=-1",
        autoWait: true
    });

    When.iLookAtTheScreen();

    When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_XML, KeyCodes.ARROW_DOWN);
    Then.iShouldSeeATableOfType("sap.m.Table");
    When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_XML, KeyCodes.ESCAPE);

    When.iEnterTextOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_XML, "car");
    Then.iShouldSeeATableOfType("sap.m.Table");
    Then.iShouldSeeMTableItems(["Carroll, Lewis", "Wilde, Oscar" , "Descartes, Rene", "Clausewitz, Carl von", "Collodi, Carlo", "Carlyle, Thomas", "Wells, Carolyn", "Lucretius Carus, Titus", "Reynolds, George W. M. (George William MacArthur)", "Carnegie, Andrew"]);

    When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_XML, KeyCodes.ARROW_DOWN);
    When.iPressKeyOnMTableRow(0, KeyCodes.SPACE);
    When.iPressKeyOnMTableRow(1, KeyCodes.ENTER);

    Then.iShouldSeeSelectedTokensOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_XML, ["Carroll, Lewis (103)", "Wilde, Oscar (107)"]);

    When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_XML, KeyCodes.F4);

    Then.iShouldSeeATableOfType("sap.m.Table");
    Then.iShouldSeeMTableSelection(["Carroll, Lewis", "Wilde, Oscar"], 2);


    When.iEnterTextOnDialogSearchField("mark");
    When.iPressButtonWithText("Go");
    Then.iShouldSeeMTableItems(["Twain, Mark", "Jacobs, W. W. (William Wymark)", "Marks, Winston K."]);

    When.iPressButtonWithText("Show Filters");
    When.iEnterTextOnFilterFieldWithLabel("Name", "Twain*");
    When.iPressKeyOnFilterFieldWithLabel("Name", KeyCodes.ENTER);

    Then.iShouldSeeMTableItems(["Twain, Mark"]);

    When.iPressKeyOnMTableRow(0, KeyCodes.SPACE);
    Then.iShouldSeeMTableSelection(["Twain, Mark"], 1);

    When.iPressButtonWithText("OK");

    Then.iShouldSeeSelectedTokensOnFilterFieldWithLabel(LABEL_MTABLE_MDCRESPONSIVE_XML, ["Carroll, Lewis (103)", "Wilde, Oscar (107)", "Twain, Mark (106)"]);

    Then.iTeardownMyAppFrame();
});

// MDC.ResponsiveTableType END


	// M.Table BEG

	opaTest("'M.Table: via Delegate' - SingleSelect / Suggest -> Dialog", function (Given, When, Then) {

		Given.iStartMyAppInAFrame({
			source: "test-resources/sap/ui/mdc/qunit/field/opa/valuehelp/index.html",
			autoWait: true
		});

		When.iLookAtTheScreen();

		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_DELEGATE, KeyCodes.ARROW_DOWN);
		Then.iShouldSeeATableOfType("sap.m.Table");
		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_DELEGATE, KeyCodes.ESCAPE);

		When.iEnterTextOnFilterFieldWithLabel(LABEL_MTABLE_DELEGATE, "gil");
		Then.iShouldSeeATableOfType("sap.m.Table");
		Then.iShouldSeeMTableItems(["Gilman, Charlotte Perkins", "Virgil", "Chesterton, G. K. (Gilbert Keith)", "Gilbert, W. S. (William Schwenck)"]);

		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_DELEGATE, KeyCodes.ARROW_DOWN);
		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_DELEGATE, KeyCodes.ENTER);

		Then.iShouldSeeSelectedConditionOnFilterFieldWithLabel(LABEL_MTABLE_DELEGATE, "Gilman, Charlotte Perkins (102)");

		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_DELEGATE, KeyCodes.F4);

		Then.iShouldSeeATableOfType("sap.m.Table");
		Then.iShouldSeeMTableSelection(["Gilman, Charlotte Perkins"], 1);

		When.iEnterTextOnDialogSearchField("mark");
		When.iPressButtonWithText("Go");
		Then.iShouldSeeMTableItems(["Twain, Mark", "Jacobs, W. W. (William Wymark)", "Marks, Winston K."]);

		When.iPressButtonWithText("Show Filters");
		When.iEnterTextOnFilterFieldWithLabel("Name", "Twain*", false);
		When.iPressKeyOnFilterFieldWithLabel("Name", KeyCodes.ENTER);

		Then.iShouldSeeMTableItems(["Twain, Mark"]);

		//When.iPressKeyOnMTableRow(0, KeyCodes.ENTER);
		When.iPressOnMTableRow(0);
		Then.iShouldSeeMTableSelection(["Twain, Mark"], 1);

		When.iPressButtonWithText("OK");

		Then.iShouldSeeSelectedConditionOnFilterFieldWithLabel(LABEL_MTABLE_DELEGATE, "Twain, Mark (106)");
		Then.iTeardownMyAppFrame();
	});

	opaTest("'M.Table: via Delegate' - MultiSelect / Suggest -> Dialog", function (Given, When, Then) {

		Given.iStartMyAppInAFrame({
			source: "test-resources/sap/ui/mdc/qunit/field/opa/valuehelp/index.html?maxconditions=-1",
			autoWait: true
		});

		When.iLookAtTheScreen();

		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_DELEGATE, KeyCodes.ARROW_DOWN);
		Then.iShouldSeeATableOfType("sap.m.Table");
		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_DELEGATE, KeyCodes.ESCAPE);

		When.iEnterTextOnFilterFieldWithLabel(LABEL_MTABLE_DELEGATE, "car");
		Then.iShouldSeeATableOfType("sap.m.Table");
		Then.iShouldSeeMTableItems(["Carroll, Lewis", "Wilde, Oscar" , "Descartes, Rene", "Clausewitz, Carl von", "Collodi, Carlo", "Carlyle, Thomas", "Wells, Carolyn", "Lucretius Carus, Titus", "Reynolds, George W. M. (George William MacArthur)", "Carnegie, Andrew"]);

		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_DELEGATE, KeyCodes.ARROW_DOWN);
		When.iPressKeyOnMTableRow(0, KeyCodes.SPACE);
		When.iPressKeyOnMTableRow(1, KeyCodes.ENTER);

		Then.iShouldSeeSelectedTokensOnFilterFieldWithLabel(LABEL_MTABLE_DELEGATE, ["Carroll, Lewis (103)", "Wilde, Oscar (107)"]);

		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_DELEGATE, KeyCodes.F4);

		Then.iShouldSeeATableOfType("sap.m.Table");
		Then.iShouldSeeMTableSelection(["Carroll, Lewis", "Wilde, Oscar"], 2);


		When.iEnterTextOnDialogSearchField("mark");
		When.iPressButtonWithText("Go");
		Then.iShouldSeeMTableItems(["Twain, Mark", "Jacobs, W. W. (William Wymark)", "Marks, Winston K."]);

		When.iPressButtonWithText("Show Filters");
		When.iEnterTextOnFilterFieldWithLabel("Name", "Twain*");
		When.iPressKeyOnFilterFieldWithLabel("Name", KeyCodes.ENTER);

		Then.iShouldSeeMTableItems(["Twain, Mark"]);

		When.iPressKeyOnMTableRow(0, KeyCodes.SPACE);
		Then.iShouldSeeMTableSelection(["Twain, Mark"], 1);

		When.iPressButtonWithText("OK");

		Then.iShouldSeeSelectedTokensOnFilterFieldWithLabel(LABEL_MTABLE_DELEGATE, ["Carroll, Lewis (103)", "Wilde, Oscar (107)", "Twain, Mark (106)"]);

		Then.iTeardownMyAppFrame();
	});

	opaTest("'M.Table: via XML' - SingleSelect / Suggest -> Dialog", function (Given, When, Then) {

		Given.iStartMyAppInAFrame({
			source: "test-resources/sap/ui/mdc/qunit/field/opa/valuehelp/index.html",
			autoWait: true
		});

		When.iLookAtTheScreen();

		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_XML, KeyCodes.ARROW_DOWN);
		Then.iShouldSeeATableOfType("sap.m.Table");
		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_XML, KeyCodes.ESCAPE);

		When.iEnterTextOnFilterFieldWithLabel(LABEL_MTABLE_XML, "gil");
		Then.iShouldSeeATableOfType("sap.m.Table");
		Then.iShouldSeeMTableItems(["Gilman, Charlotte Perkins", "Virgil", "Chesterton, G. K. (Gilbert Keith)", "Gilbert, W. S. (William Schwenck)"]);

		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_XML, KeyCodes.ARROW_DOWN);
		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_XML, KeyCodes.ENTER);

		Then.iShouldSeeSelectedConditionOnFilterFieldWithLabel(LABEL_MTABLE_XML, "Gilman, Charlotte Perkins (102)");

		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_XML, KeyCodes.F4);

		Then.iShouldSeeATableOfType("sap.m.Table");
		Then.iShouldSeeMTableSelection(["Gilman, Charlotte Perkins"], 1);

		When.iEnterTextOnDialogSearchField("mark");
		When.iPressButtonWithText("Go");
		Then.iShouldSeeMTableItems(["Twain, Mark", "Jacobs, W. W. (William Wymark)", "Marks, Winston K."]);

		When.iPressButtonWithText("Show Filters");
		When.iEnterTextOnFilterFieldWithLabel("Name", "Twain*", false);
		When.iPressKeyOnFilterFieldWithLabel("Name", KeyCodes.ENTER);

		Then.iShouldSeeMTableItems(["Twain, Mark"]);

		//When.iPressKeyOnMTableRow(0, KeyCodes.ENTER);
		When.iPressOnMTableRow(0);
		Then.iShouldSeeMTableSelection(["Twain, Mark"], 1);

		When.iPressButtonWithText("OK");

		Then.iShouldSeeSelectedConditionOnFilterFieldWithLabel(LABEL_MTABLE_XML, "Twain, Mark (106)");
		Then.iTeardownMyAppFrame();
	});

	opaTest("'M.Table: via XML' - MultiSelect / Suggest -> Dialog", function (Given, When, Then) {

		Given.iStartMyAppInAFrame({
			source: "test-resources/sap/ui/mdc/qunit/field/opa/valuehelp/index.html?maxconditions=-1",
			autoWait: true
		});

		When.iLookAtTheScreen();

		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_XML, KeyCodes.ARROW_DOWN);
		Then.iShouldSeeATableOfType("sap.m.Table");
		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_XML, KeyCodes.ESCAPE);

		When.iEnterTextOnFilterFieldWithLabel(LABEL_MTABLE_XML, "car");
		Then.iShouldSeeATableOfType("sap.m.Table");
		Then.iShouldSeeMTableItems(["Carroll, Lewis", "Wilde, Oscar" , "Descartes, Rene", "Clausewitz, Carl von", "Collodi, Carlo", "Carlyle, Thomas", "Wells, Carolyn", "Lucretius Carus, Titus", "Reynolds, George W. M. (George William MacArthur)", "Carnegie, Andrew"]);

		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_XML, KeyCodes.ARROW_DOWN);
		When.iPressKeyOnMTableRow(0, KeyCodes.SPACE);
		When.iPressKeyOnMTableRow(1, KeyCodes.ENTER);

		Then.iShouldSeeSelectedTokensOnFilterFieldWithLabel(LABEL_MTABLE_XML, ["Carroll, Lewis (103)", "Wilde, Oscar (107)"]);

		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_XML, KeyCodes.F4);

		Then.iShouldSeeATableOfType("sap.m.Table");
		Then.iShouldSeeMTableSelection(["Carroll, Lewis", "Wilde, Oscar"], 2);


		When.iEnterTextOnDialogSearchField("mark");
		When.iPressButtonWithText("Go");
		Then.iShouldSeeMTableItems(["Twain, Mark", "Jacobs, W. W. (William Wymark)", "Marks, Winston K."]);

		When.iPressButtonWithText("Show Filters");
		When.iEnterTextOnFilterFieldWithLabel("Name", "Twain*");
		When.iPressKeyOnFilterFieldWithLabel("Name", KeyCodes.ENTER);

		Then.iShouldSeeMTableItems(["Twain, Mark"]);

		When.iPressKeyOnMTableRow(0, KeyCodes.SPACE);
		Then.iShouldSeeMTableSelection(["Twain, Mark"], 1);

		When.iPressButtonWithText("OK");

		Then.iShouldSeeSelectedTokensOnFilterFieldWithLabel(LABEL_MTABLE_XML, ["Carroll, Lewis (103)", "Wilde, Oscar (107)", "Twain, Mark (106)"]);

		Then.iTeardownMyAppFrame();
	});

	// M.Table END

	opaTest("Suspend, Resume", function (Given, When, Then) {

		Given.iStartMyAppInAFrame({
			source: "test-resources/sap/ui/mdc/qunit/field/opa/valuehelp/index.html?suspended=true",
			autoWait: true
		});

		When.iLookAtTheScreen();

		When.iEnterTextOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_DELEGATE, "auste");
		Then.iShouldSeeATableOfType("sap.m.Table");
		Then.iShouldSeeMTableItems(["Austen, Jane"]);
		When.iEnterTextOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_DELEGATE, "");
		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_DELEGATE, KeyCodes.F4);
		Then.iShouldSeeAnEmptyTableOfType("sap.ui.table.Table");
		When.iEnterTextOnDialogSearchField("mark");
		When.iPressButtonWithText("Go");
		Then.iShouldSeeUITableItems(["Twain, Mark", "Jacobs, W. W. (William Wymark)", "Marks, Winston K."]);
		When.iPressButtonWithText("Cancel");


		When.iEnterTextOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_XML, "auste");
		Then.iShouldSeeATableOfType("sap.m.Table");
		Then.iShouldSeeMTableItems(["Austen, Jane"]);
		When.iEnterTextOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_XML, "");
		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_MDCGRID_XML, KeyCodes.F4);
		Then.iShouldSeeAnEmptyTableOfType("sap.ui.table.Table");
		When.iEnterTextOnDialogSearchField("mark");
		When.iPressButtonWithText("Go");
		Then.iShouldSeeUITableItems(["Twain, Mark", "Jacobs, W. W. (William Wymark)", "Marks, Winston K."]);
		When.iPressButtonWithText("Cancel");

		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_DELEGATE, KeyCodes.F4);
		Then.iShouldSeeAnEmptyTableOfType("sap.m.Table");
		When.iEnterTextOnDialogSearchField("mark");
		When.iPressButtonWithText("Go");
		Then.iShouldSeeMTableItems(["Twain, Mark", "Jacobs, W. W. (William Wymark)", "Marks, Winston K."]);
		When.iPressButtonWithText("Cancel");

		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_XML, KeyCodes.F4);
		Then.iShouldSeeAnEmptyTableOfType("sap.m.Table");
		When.iEnterTextOnDialogSearchField("mark");
		When.iPressButtonWithText("Go");
		Then.iShouldSeeMTableItems(["Twain, Mark", "Jacobs, W. W. (William Wymark)", "Marks, Winston K."]);
		When.iPressButtonWithText("Cancel");

		Then.iTeardownMyAppFrame();
	});

	opaTest("Input Parameters", function (Given, When, Then) {

		Given.iStartMyAppInAFrame({
			source: "test-resources/sap/ui/mdc/qunit/field/opa/valuehelp/index.html",
			autoWait: true
		});

		When.iLookAtTheScreen();

		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE, KeyCodes.ARROW_DOWN);
		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE, KeyCodes.ENTER);

		When.iPressKeyOnFilterFieldWithLabel(LABEL_MTABLE_INPUTPARAMETER, KeyCodes.F4);
		Then.iShouldSeeMTableItems(["Adventure novel", "British literature", "Children's literature", "Education", "Erotic fiction", "Experimental fiction", "Graphic novel", "Historical fiction", "Literary fiction", "Literary nonsense", "Mathematical fiction", "Metafiction", "Nonfiction novel", "Philosophical fiction", "Political fiction", "Pulp fiction", "Quantum fiction", "Religious fiction", "Saga", "Speculative fiction"]);
		When.iPressButtonWithText("Cancel");


		When.iPressKeyOnFilterFieldWithLabel(LABEL_MDCTABLE_INPUTPARAMETER, KeyCodes.F4);
		Then.iShouldSeeUITableItems(["Adventure novel", "British literature", "Children's literature", "Education", "Erotic fiction", "Experimental fiction", "Graphic novel", "Historical fiction", "Literary fiction", "Literary nonsense", "Mathematical fiction", "Metafiction", "Nonfiction novel", "Philosophical fiction", "Political fiction", "Pulp fiction", "Quantum fiction", "Religious fiction", "Saga", "Speculative fiction"]);
		When.iPressButtonWithText("Cancel");


		Then.iTeardownMyAppFrame();
	});

});



