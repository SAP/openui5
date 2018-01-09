sap.ui.define(['sap/ui/core/UIComponent'],
  function(UIComponent) {
  "use strict";

  var Component = UIComponent.extend("sap.ui.core.sample.Html.preserveDOM.Component", {

    metadata : {
      rootView : {
      	"viewName": "sap.ui.core.sample.Html.preserveDOM.Html",
      	"type": "XML",
      	"async": true
      },
      dependencies : {
        libs : [
          "sap.ui.layout"
        ]
      },
      config : {
        sample : {
          stretch : true,
          files : [
            "Html.view.xml",
            "Html.controller.js"
          ]
        }
      }
    }
  });

  return Component;

});
