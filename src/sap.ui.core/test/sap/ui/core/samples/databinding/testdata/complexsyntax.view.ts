import Label from "sap/ui/commons/Label";
import TextField from "sap/ui/commons/TextField";
import JSView from "sap/ui/core/mvc/JSView";
import Column from "sap/ui/table/Column";
import Table from "sap/ui/table/Table";
sap.ui.jsview("testdata.complexsyntax", {
    getControllerName: function () {
        return "testdata.complexsyntax";
    },
    createContent: function (oController) {
        var aControls = [];
        var oLabel = new Label({ text: "Hello Mr. {path:'/singleEntry/firstName', formatter:'.myFormatter'}, {/singleEntry/lastName}" }, oController);
        aControls.push(oLabel);
        var oTable = new Table({ rows: "{/table}" });
        var oColumn = new Column();
        var oLabel2 = new Label({ text: "Name" });
        var oTextField = new TextField({ value: "{path:'gender', formatter:'.myGenderFormatter'} {firstName}, {lastName}" }, oController);
        oColumn.setLabel(oLabel2);
        oColumn.setTemplate(oTextField);
        oTable.addColumn(oColumn);
        aControls.push(oTable);
        var oLabel2 = new Label({ text: "{path:'/singleEntry/amount', type:'sap.ui.model.type.Float'}" });
        aControls.push(oLabel2);
        return aControls;
    }
});