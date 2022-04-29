sap.ui.define(["poc/lib/Core"], function(Core) {
    sap.ui.require(["sap/ui/webc/main/Button"], function(Button) {

        Core.attachInit(function() {
           new Button({
                text: "Hello World",
                click: function() {
                    alert(this.getText());
                }
            }).placeAt(document.body);
        });
    });
});
