/*!
 * ${copyright}
 */

/* eslint-disable quotes */
/* global sap.ui.test.gherkin */
(function() {
'use strict';

var text = "Number of lemmings saved: ";
var numSavedLemmings = 0;

var title = sap.ui.commons.Label({
  id: "lemming-website-title",
  text: "Lemming Life Saving Machine"
});
title.addStyleClass('large');

var label = new sap.ui.commons.Label({
  id: "num-lemmings-saved",
  text: text + numSavedLemmings
});
label.addStyleClass('large');

var lemmingNames = ["Alice", "Bob", "Charlie", "David", "Elektra", "Felicia", "Georgia", "Holly", "Idris", "Julien",
  "Kevin", "Lucia", "Michael", "Nancy", "Oscar", "Peter", "Qubert", "Rascal", "Susan", "Terry", "Ursula", "Vicky",
  "Walter", "Xavier", "Yolanda", "Zelda"];

var layout = new sap.ui.layout.VerticalLayout({id: "layout"});

var button = new sap.ui.commons.Button({
  id: "life-saving-button",
  text: "Save a Lemming",
  press: function() {
    numSavedLemmings += 1;
    label.setText(text + numSavedLemmings);

    var newLabel = new sap.ui.commons.Label({
      id: "lemming-name-" + numSavedLemmings,
      text: lemmingNames[(numSavedLemmings - 1) % lemmingNames.length]
    });
    newLabel.addStyleClass('lemmingName');
    layout.addContent(newLabel);
  }
});
button.addStyleClass('large');

layout.addContent(title);
layout.addContent(button);
layout.addContent(label);
layout.placeAt("uiArea");

}());