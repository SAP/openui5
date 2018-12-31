sap.ui.require([
	'sap/m/Panel',
	'sap/m/Text'
], function (Panel, Text) {
	"use strict";

	var panel = new Panel({
		headerText: 'README',
		expanded: true
	});
	var readmeText = new Text();

	readmeText.setText(
			'****** Definition ******\n' +
			'This OPA test demonstrates how to extend an OPA journey (see "Opa.js" from the sources) to execute ' +
			'Rule Checks with provided by Support Assistant assertions.\n\n' +
			'****** Test page ******\n' +
			'The test page consists of two buttons, the first opening Dialog 1 and the latter - Dialog 2.\n\n' +
			'****** First test ******\n' +
			'Dialog 1 is opened and the Support Assistant checks are executed globally for the whole test page with all available rules\n\n' +
			'****** Second rule check ******\n' +
			'Dialog 1 is opened again and checks are executed only on elements contained within Dialog1 using a subset of rules.\n' +
			' The OPA assertion would fail if there are High severity issues, and is expected to pass as there are only Medium/Low issues found. \n\n' +
			'****** Third rule check ******\n' +
			'Dialog 1 is opened again and checks are executed only on elements contained within Dialog1 using a system preset of rules.\n' +
			' The OPA assertion would fail if there are any accessibility issues. \n\n' +
			'****** Fourth rule check ******\n' +
			'The checks are executed on elements contained within Dialog2 using a subset of rules. \n' +
			'The OPA assertion would fail if any severity issues are found, and it is expected to always pass. \n\n' +
			'****** Support Assistant rule check report	******\n' +
			'After all the checks are completed, a detailed Support Assistant report is displayed. ' +
			'It shows all Rules and issues generated from the different checks executed. \n' +
			'In this case errors should come only from the first test.\n\n' +
			'****** Saving the report ******\n' +
			'At the end of the OPA journey the report is saved as an array\n' +
			'at window._$files which can be used to save it to an external file.\n\n'
	);
	panel.addContent(readmeText);
	panel.placeAt('readme');
});
