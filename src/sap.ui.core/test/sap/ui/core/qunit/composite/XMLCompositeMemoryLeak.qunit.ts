import jQuery from "jquery.sap.global";
import MemoryLeakCheck from "sap/ui/qunit/utils/MemoryLeakCheck";
import SimpleText from "composites/SimpleText";
import TextToggleButtonNested from "composites/TextToggleButtonNested";
import ForwardText2 from "composites/ForwardText2";
import Text from "sap/m/Text";
MemoryLeakCheck.checkControl("XMLComposite: SimpleText", function () {
    return new SimpleText();
});
MemoryLeakCheck.checkControl("XMLComposite: TextToggleButtonNested", function () {
    return new TextToggleButtonNested();
});
MemoryLeakCheck.checkControl("XMLComposite: ForwardText2", function () {
    return new ForwardText2();
});
MemoryLeakCheck.checkControl("XMLComposite: ForwardText2 with item", function () {
    return new ForwardText2({
        textItems: new Text({
            text: "test"
        })
    });
});