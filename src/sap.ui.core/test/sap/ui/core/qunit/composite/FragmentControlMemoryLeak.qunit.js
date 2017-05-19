/*!
 * ${copyright}
 */

sap.ui.require([
	'jquery.sap.global', 'sap/ui/qunit/utils/MemoryLeakCheck', 'fragments/SimpleText', 'fragments/TextToggleButtonNested', 'fragments/ForwardText2', 'sap/m/Text'
], function(jQuery, MemoryLeakCheck, SimpleText, TextToggleButtonNested, ForwardText2, Text) {

	MemoryLeakCheck.checkControl(function() {
		return new SimpleText();
	});

	MemoryLeakCheck.checkControl(function() {
		return new TextToggleButtonNested();
	});

	MemoryLeakCheck.checkControl(function() {
		return new ForwardText2();
	});

	MemoryLeakCheck.checkControl(function() {
		return new ForwardText2({
			textItems: new Text({
				text: "test"
			})
		});
	});
});
