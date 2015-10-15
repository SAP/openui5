sap.ui.controller("my.View", {
  onInit: function() {
    var oView = this.getView();
    var oModel = new sap.ui.model.json.JSONModel({
      person: {
          "name": "<Named>John",
          "phone": "<Named>+123456789",
          manager: {
            "name": "<Named>Marcus",
            "phone": "<Named>+0987654321"
          }
      }
    });
    oView.setModel(oModel, "named");

    var oModel = new sap.ui.model.json.JSONModel({
      person: {
          "name": "John",
          "phone": "+123456789",
          manager: {
            "name": "Marcus",
            "phone": "+0987654321"
          }
      }
    });
    oView.setModel(oModel);
  }
});
