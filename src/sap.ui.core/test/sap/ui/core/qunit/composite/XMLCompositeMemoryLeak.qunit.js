/*!
 * ${copyright}
 */

sap.ui.require([
	'jquery.sap.global', 'sap/ui/qunit/utils/MemoryLeakCheck', 'composites/SimpleText', 'composites/TextToggleButtonNested', 'composites/ForwardText2', 'sap/m/Text'
], function(jQuery, MemoryLeakCheck, SimpleText, TextToggleButtonNested, ForwardText2, Text) {

	MemoryLeakCheck.checkControl("XMLComposite: SimpleText", function() {
		return new SimpleText();
	});

	MemoryLeakCheck.checkControl("XMLComposite: TextToggleButtonNested", function() {
		return new TextToggleButtonNested();
	});

	MemoryLeakCheck.checkControl("XMLComposite: ForwardText2", function() {
		return new ForwardText2();
	});

	MemoryLeakCheck.checkControl("XMLComposite: ForwardText2 with item", function() {
		return new ForwardText2({
			textItems: new Text({
				text: "test"
			})
		});
	});
});
