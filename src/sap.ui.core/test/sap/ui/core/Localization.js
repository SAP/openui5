sap.ui.define([
  "sap/base/i18n/Localization",
  "sap/m/MessageBox",
  "sap/ui/core/Supportability",
  "sap/ui/layout/form/SimpleForm",
  "sap/m/Title",
  "sap/m/Label",
  "sap/m/Input",
  "sap/ui/model/resource/ResourceModel"
], function(Localization, MessageBox, Supportability, SimpleForm, Title, Label, Input, ResourceModel) {
  "use strict";
  function showInfo() {
	  var mInfo = this.getOriginInfo("text"),
		  sText = "Info:\n";

	  if (mInfo) {
		  undefined/*jQuery*/.each(mInfo, function(key, value) {
			  sText += key + ": " + value + "\n";
		  });
	  } else {
		  sText += "Not available!";
	  }
	  MessageBox.show(sText);
  }

  var sLocale = Localization.getLanguage();
  var oBundle = undefined/*jQuery*/.sap.resources({url : "resources/i18n.properties", locale: sLocale, includeInfo: Supportability.collectOriginInfo()});

  var oSimpleForm = new SimpleForm({
	  editable: true,
	  content: [
		  new Title({text: oBundle.getText("welcome", ["Administrator"])}).attachBrowserEvent("click", showInfo),
		  new Label({text: oBundle.getText("lastname"), tooltip: oBundle.getText("lastname")}).attachBrowserEvent("click", showInfo) ,
		  new Input(),
		  new Label({text: oBundle.getText("firstname")}).attachBrowserEvent("click", showInfo) ,
		  new Input(),
		  new Label({text: oBundle.getText("street")}).attachBrowserEvent("click", showInfo) ,
		  new Input(),
		  new Label({text: oBundle.getText("zip")}).attachBrowserEvent("click", showInfo) ,
		  new Input(),
		  new Label({text: oBundle.getText("city")}).attachBrowserEvent("click", showInfo) ,
		  new Input()
	  ]
  });
  oSimpleForm.placeAt("resourcebundle");

  var oResourceModel = new ResourceModel({bundleUrl:"resources/i18n.properties"});
  new SimpleForm({
	  editable: true,
	  content: [
		  new Title({text: oResourceModel.getResourceBundle().getText("welcome", ["Administrator"])}).attachBrowserEvent("click", showInfo),
		  new Label({text: "{i18n>lastname}", tooltip: "{i18n>lastname}"}).attachBrowserEvent("click", showInfo) ,
		  new Input(),
		  new Label({text: "{i18n>firstname}"}).attachBrowserEvent("click", showInfo) ,
		  new Input(),
		  new Label({text: "{i18n>street}"}).attachBrowserEvent("click", showInfo) ,
		  new Input(),
		  new Label({text: "{i18n>zip}"}).attachBrowserEvent("click", showInfo) ,
		  new Input(),
		  new Label({text: "{i18n>city}"}).attachBrowserEvent("click", showInfo) ,
		  new Input()
	  ],
	  models: {
		  i18n: oResourceModel
	  }
  }).placeAt("resourcemodel");

  undefined/*jQuery*/(function(){
	  var url = sap.ui.require.toUrl("sap/m/messagebundle.properties");
	  var oBundle = undefined/*jQuery*/.sap.resources({url:url});
	  undefined/*jQuery*/("#locale").html(oBundle ? oBundle.sLocale : "--");
  });
});