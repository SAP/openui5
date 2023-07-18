/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
	"sap/ui/events/KeyCodes",
	'sap/ui/v4demo/test/pages/Opa',
	'test-resources/sap/ui/mdc/testutils/opa/filterfield/waitForFilterField'

], function (Opa5, opaTest, KeyCodes, OpaPage, waitForFilterField) {
	'use strict';

	Opa5.extendConfig({
		timeout: 60,
		autoWait: true
	});

	QUnit.module("Typeahead");

	opaTest("Typing raises fitting suggestions", function (Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/integration/valuehelp/index.html?view=sap.ui.v4demo.view.OPA-1");
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField"});
		When.onTheOPAPage.iEnterTextOnTheFilterField("FB0-FF1-10", "aust", {keepFocus: true, clearTextFirst: true});
		Then.onTheOPAPage.iShouldSeeValueHelpListItems([
			["101", "Austen, Jane"],
			["373", "Craig, Austin"]
		]);
	});

	opaTest("Select and Confirm", function (Given, When, Then) {
		When.onTheOPAPage.iToggleTheValueHelpListItem("Craig, Austin");
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField"}, "Craig, Austin (373)");
	});

	opaTest("Escape key hides suggestions", function (Given, When, Then) {
		When.onTheOPAPage.iEnterTextOnTheFilterField({label: "TestField"}, "aust", {keepFocus: true, clearTextFirst: true});
		When.onTheOPAPage.iPressKeyOnTheFilterField({label: "TestField"}, KeyCodes.ESCAPE);
		Then.onTheOPAPage.iShouldNotSeeTheValueHelp();
		Then.iTeardownMyAppFrame();

	});


	opaTest("Popover.opensOnClick", function (Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/integration/valuehelp/index.html?view=sap.ui.v4demo.view.OPA-6");

		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField"});
		When.onTheOPAPage.iPressOnTheFilterField({label: "TestField"});
		Then.onTheOPAPage.iShouldSeeValueHelpListItems([
			"101", "Austen, Jane",
			"102", "Gilman, Charlotte Perkins",
			"103", "Carroll, Lewis",
			"104", "Shelley, Mary Wollstonecraft",
			"105", "Kafka, Franz",
			"106", "Twain, Mark",
			"107", "Wilde, Oscar",
			"109", "Douglass, Frederick",
			"110", "Ibsen, Henrik",
			"111", "Melville, Herman"
		]);

		When.onTheOPAPage.iPressKeyOnTheFilterField({label: "TestField"}, KeyCodes.ESCAPE);
		Then.onTheOPAPage.iShouldNotSeeTheValueHelp();

		Then.iTeardownMyAppFrame();
	});

	opaTest("Popover.opensOnFocus", function (Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/integration/valuehelp/index.html?view=sap.ui.v4demo.view.OPA-7");
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField1"});
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField2"});

		When.onTheOPAPage.iPressKeyOnTheFilterField({label: "TestField1"}, KeyCodes.TAB);

		Then.onTheOPAPage.iShouldSeeValueHelpListItems([
			"101", "Austen, Jane",
			"102", "Gilman, Charlotte Perkins",
			"103", "Carroll, Lewis",
			"104", "Shelley, Mary Wollstonecraft",
			"105", "Kafka, Franz",
			"106", "Twain, Mark",
			"107", "Wilde, Oscar",
			"109", "Douglass, Frederick",
			"110", "Ibsen, Henrik",
			"111", "Melville, Herman"
		], "FH1");

		When.onTheOPAPage.iPressKeyOnTheFilterField({label: "TestField2"}, KeyCodes.TAB);

		Then.onTheOPAPage.iShouldSeeValueHelpListItems([
			"101", "Austen, Jane",
			"102", "Gilman, Charlotte Perkins",
			"103", "Carroll, Lewis",
			"104", "Shelley, Mary Wollstonecraft",
			"105", "Kafka, Franz",
			"106", "Twain, Mark",
			"107", "Wilde, Oscar",
			"109", "Douglass, Frederick",
			"110", "Ibsen, Henrik",
			"111", "Melville, Herman"
		], "FH2");

		waitForFilterField.call(When, {
			properties: {
				label: "TestField1"
			},
			actions: function (oField) {
				return new Promise(function (resolve, reject) {
					oField.getFocusDomRef().focus();
					setTimeout(function () {
						oField.getFocusDomRef().blur();
					},50);
				});
			}
		});

		Then.onTheOPAPage.iShouldNotSeeTheValueHelp();

		Then.iTeardownMyAppFrame();
	});

	QUnit.module("Dialog");

	opaTest("F4 opens VH Dialog", function (Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/integration/valuehelp/index.html?view=sap.ui.v4demo.view.OPA-1");
		When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
		Then.onTheOPAPage.iShouldSeeTheValueHelpDialog();

	});

	opaTest("Select and Confirm", function (Given, When, Then) {
		When.onTheOPAPage.iToggleTheValueHelpListItem("Carroll, Lewis");
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField"}, "Carroll, Lewis (103)");
	});

	opaTest("Reopen F4, change ColSearch and select from SingleMaster table", function (Given, When, Then) {
		When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
		Then.onTheOPAPage.iShouldSeeTheValueHelpDialog();

		When.onTheOPAPage.iNavigateToValueHelpContent({title: "Search Template 1"});
		When.onTheOPAPage.iToggleTheValueHelpListItem("Twain, Mark");
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField"}, "Twain, Mark (106)");

		Then.iTeardownMyAppFrame();
	});

	opaTest("MultiSelect and Confirm", function (Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/integration/valuehelp/index.html?view=sap.ui.v4demo.view.OPA-2");
		When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
		When.onTheOPAPage.iToggleTheValueHelpListItem("Carroll, Lewis");
		When.onTheOPAPage.iToggleTheValueHelpListItem("Twain, Mark");
		When.onTheOPAPage.iCloseTheValueHelpDialog();
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField"}, ["Carroll, Lewis (103)", "Twain, Mark (106)"]);

	});

	opaTest("De-select conditions by removing tokens", function (Given, When, Then) {
		When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
		When.onTheOPAPage.iRemoveValueHelpToken("Twain, Mark (106)");
		When.onTheOPAPage.iCloseTheValueHelpDialog();
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField"}, "Carroll, Lewis (103)");
	});

	opaTest("De-select conditions by removing all tokens at once", function (Given, When, Then) {
		When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
		When.onTheOPAPage.iToggleTheValueHelpListItem("Twain, Mark");
		When.onTheOPAPage.iToggleTheValueHelpListItem("Kafka, Franz");

		When.onTheOPAPage.iCloseTheValueHelpDialog();

		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField"}, ["Carroll, Lewis (103)", "Twain, Mark (106)", "Kafka, Franz (105)"]);

		When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
		When.onTheOPAPage.iRemoveAllValueHelpTokens();
		When.onTheOPAPage.iCloseTheValueHelpDialog();

		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField"}, []);
	});

	opaTest("Range-Selection across multiple pages", function (Given, When, Then) {
		When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
		When.onTheOPAPage.iToggleTheValueHelpListItem("Austen, Jane", undefined);
		When.waitFor({
			controlType: "sap.ui.mdc.Table",
			actions: function (oTable) {
				return oTable.scrollToIndex(75);
			}
		});
		When.onTheOPAPage.iToggleTheValueHelpListItem("Paine, Thomas", undefined, {shiftKey: true});
		When.onTheOPAPage.iCloseTheValueHelpDialog();
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "TestField"}, ['Austen, Jane (101)', 'Gilman, Charlotte Perkins (102)', 'Carroll, Lewis (103)', 'Shelley, Mary Wollstonecraft (104)', 'Kafka, Franz (105)', 'Twain, Mark (106)', 'Wilde, Oscar (107)', 'Douglass, Frederick (109)', 'Ibsen, Henrik (110)', 'Melville, Herman (111)', 'Doyle, Arthur Conan (112)', 'Dickens, Charles (113)', 'Joyce, James (114)', 'Swift, Jonathan (116)', 'Stoker, Bram (117)', 'Machiavelli, Niccolo (118)', 'Tolstoy, Leo, graf (120)', 'Grimm, Wilhelm (121)', 'Vatsyayana (122)', 'Unknown (124)', 'Hugo, Victor (125)', 'Anonymous (126)', 'Bronte, Charlotte (127)', 'Whitman, Walt (128)', 'Hobbes, Thomas (131)', 'Stevenson, Robert Louis (132)', 'Bronte, Emily (134)', 'Conrad, Joseph (135)', 'Dumas, Alexandre (136)', 'Chopin, Kate (138)', 'Barrie, J. M. (James Matthew) (139)', 'Hesse, Hermann (140)', 'Plato (141)', 'Franklin, Benjamin (142)', 'Defoe, Daniel (143)', 'Blake, William (144)', 'Montaigne, Michel de (145)', 'Dante Alighieri (146)', 'Kipling, Rudyard (149)', 'Dostoyevsky, Fyodor (150)', 'Homer (151)', 'Nietzsche, Friedrich Wilhelm (152)', 'Voltaire (153)', 'Babcock & Wilcox Company (154)', 'Shaw, Bernard (155)', 'Shakespeare, William (156)', 'Long, William J. (William Joseph) (159)', 'Bierce, Ambrose (160)', 'Locke, John (161)', 'Baum, L. Frank (Lyman Frank) (164)', 'Mill, John Stuart (165)', 'Jerome, Jerome K. (Jerome Klapka) (167)', 'Wells, H. G. (Herbert George) (169)', 'Equiano, Olaudah (170)', 'Sinclair, Upton (171)', 'Salten, Felix (172)', 'Thoreau, Henry David (173)', 'Tocqueville, Alexis de (176)', 'Maupassant, Guy de (177)', 'Wood, Thomas (178)', 'Rowlandson, Mary White (180)', 'Stowe, Harriet Beecher (181)', 'Benedict, Ralph Paine (182)', 'Irving, Washington (183)', 'Verne, Jules (184)', 'Christie, Agatha (186)', 'London, Jack (187)', 'Montgomery, L. M. (Lucy Maud) (188)', 'Cervantes Saavedra, Miguel de (190)', 'Dewey, John (191)', 'Marlowe, Christopher (193)', 'Wharton, Edith (194)', 'Milton, John (195)', 'More, Thomas, Saint (197)', 'Berens, E. M. (198)', 'Paine, Thomas (200)']);
	});


	opaTest("Navigation between tabs", function (Given, When, Then) {
		When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
		When.onTheOPAPage.iNavigateToValueHelpContent({label: "My Define Conditions Panel"});
		Then.onTheOPAPage.iShouldSeeValueHelpContent({label: "My Define Conditions Panel"});
		When.onTheOPAPage.iNavigateToValueHelpContent({title: "Default Search Template"});
		Then.onTheOPAPage.iShouldSeeValueHelpContent({title: "Default Search Template"});
		When.onTheOPAPage.iCloseTheValueHelpDialog();
		Then.iTeardownMyAppFrame();
	});

	var oFilterBarConfigs = {
		"Default FilterBar": "test-resources/sap/ui/mdc/integration/valuehelp/index.html?view=sap.ui.v4demo.view.OPA-2",
		"Dedicated FilterBar": "test-resources/sap/ui/mdc/integration/valuehelp/index.html?view=sap.ui.v4demo.view.OPA-4"
	};

	Object.keys(oFilterBarConfigs).forEach(function (sModuleName) {
        QUnit.module(sModuleName);

        opaTest("Initial conditions", function (Given, When, Then) {
            Given.iStartMyAppInAFrame(oFilterBarConfigs[sModuleName]);
            When.onTheOPAPage.iEnterTextOnTheFilterField({label: "TestField"}, "doug", {keepFocus: true, clearTextFirst: true});
            When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
            Then.onTheOPAPage.iShouldSeeTheValueHelpDialogSearchField("doug");
            Then.onTheOPAPage.iShouldSeeValueHelpListItems("Douglass, Frederick");
            When.onTheOPAPage.iCloseTheValueHelpDialog(true);
            When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
            Then.onTheOPAPage.iShouldSeeTheValueHelpDialogSearchField("doug");  // Testing repeated opening
            Then.onTheOPAPage.iShouldSeeValueHelpListItems("Douglass, Frederick");
            When.onTheOPAPage.iCloseTheValueHelpDialog(true);
            When.onTheOPAPage.iEnterTextOnTheFilterField({label: "TestField"}, "", {keepFocus: true, clearTextFirst: true});
            When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
            Then.onTheOPAPage.iShouldSeeTheValueHelpDialogSearchField(""); // Testing reset
            Then.onTheOPAPage.iShouldSeeValueHelpListItems("Kafka, Franz");
            When.onTheOPAPage.iCloseTheValueHelpDialog(true);
        });

        opaTest("Reverting to initial conditions after dialog search", function (Given, When, Then) {
            When.onTheOPAPage.iEnterTextOnTheFilterField({label: "TestField"}, "doug", {keepFocus: true, clearTextFirst: true});
            When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
            When.onTheOPAPage.iEnterTextOnTheValueHelpDialogSearchField("carrol", {keepFocus: true, clearTextFirst: true, pressEnterKey: true});
            Then.onTheOPAPage.iShouldSeeValueHelpListItems("Carroll, Lewis");
            When.onTheOPAPage.iCloseTheValueHelpDialog(true);
            When.onTheOPAPage.iOpenTheValueHelpForFilterField({label: "TestField"});
            Then.onTheOPAPage.iShouldSeeTheValueHelpDialogSearchField("doug");
            Then.iTeardownMyAppFrame();

        });
    });


	QUnit.module("MTable");

	opaTest("Considers filterconditions", function (Given, When, Then) {
		Given.iStartMyAppInAFrame("test-resources/sap/ui/mdc/integration/valuehelp/index.html?view=sap.ui.v4demo.view.OPA-5&maxconditions=1");
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "Sales Organization"});
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "Distribution Channel"});
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "Division"});

		// 1030
		When.onTheOPAPage.iEnterTextOnTheFilterField({label: "Distribution Channel"}, "10", {keepFocus: true, clearTextFirst: true});
		Then.onTheOPAPage.iShouldSeeValueHelpListItems(["Distribution Channel 10 for 1030"]);
		When.onTheOPAPage.iToggleTheValueHelpListItem("Distribution Channel 10 for 1030");

		When.onTheOPAPage.iEnterTextOnTheFilterField({label: "Division"}, "02", {keepFocus: false, clearTextFirst: true});
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "Division"}, "Division 02 for 1030 10 (02)");

		// 1010
		When.onTheOPAPage.iEnterTextOnTheFilterField({label: "Division"}, "", {keepFocus: false, clearTextFirst: true});
		When.onTheOPAPage.iEnterTextOnTheFilterField({label: "Sales Organization"}, "", {keepFocus: false, clearTextFirst: true});
		When.onTheOPAPage.iEnterTextOnTheFilterField({label: "Distribution Channel"}, "10", {keepFocus: true, clearTextFirst: true});
		Then.onTheOPAPage.iShouldSeeValueHelpListItems(["Distribution Channel 10 for 1010"]);
		When.onTheOPAPage.iToggleTheValueHelpListItem("Distribution Channel 10 for 1010");

		When.onTheOPAPage.iEnterTextOnTheFilterField({label: "Division"}, "02", {keepFocus: false, clearTextFirst: true});
		Then.onTheOPAPage.iShouldSeeTheFilterField({label: "Division"}, "Division 02 for 1010 10 (02)");

		Then.iTeardownMyAppFrame();
	});
});