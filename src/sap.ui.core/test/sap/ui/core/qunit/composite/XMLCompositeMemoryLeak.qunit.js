/*!
 * ${copyright}
 */

sap.ui.require([
	'jquery.sap.global', 'sap/ui/qunit/utils/MemoryLeakCheck', 'composites/SimpleText', 'composites/TextToggleButtonNested', 'composites/ForwardText2', 'sap/m/Text'
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
