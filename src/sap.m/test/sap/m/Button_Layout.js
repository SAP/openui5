sap.ui.define([
  "sap/m/Button"
], function(Button) {
  "use strict";
  // Note: the HTML page 'Button_Layout.html' loads this module via data-sap-ui-on-init

  var aValues = [
	  [
		  "",
		  "Hello World"
	  ],
	  [
		  "",
		  "sap-icon://delete"
	  ],
	  [
		  "",
		  "200px",
		  "80px"
	  ],
	  [
		  true,
		  false
	  ]
  ];
  var aPropNames = [
	  "text",
	  "icon",
	  "width",
	  "iconFirst"
  ];

  function res(index, aResult) {
	  if (index === aValues.length) {
		  return;
	  }

	  for (var j = 0; j < aResult.length; j++) {
		  aResult[j][aPropNames[index]] = aValues[index][0];
	  }

	  var aOtherResults = [];
	  for (var i = 1; i < aValues[index].length; i++) {
		  aOtherResults.push(aResult.map(function(x) {
			  return { text: x.text, icon: x.icon, width: x.width, iconFirst: x.iconFirst };
		  }));
		  for (var j = 0; j < aOtherResults[i - 1].length; j++) {
			  aOtherResults[i - 1][j][aPropNames[index]] = aValues[index][i];
		  }
	  }

	  for (var i = 0; i < aOtherResults.length; i++) {
		  for (var j = 0; j < aOtherResults[i].length; j++) {
			  aResult.push(aOtherResults[i][j]);
		  }
	  }

	  res(++index, aResult);
  }

  var oResultSettings = [{}];
  res(0, oResultSettings);

  [
	  "cozydiv",
	  "compactdiv",
	  "condenseddiv"
  ].forEach(function(sDIVId) {
	  var oTheDiv = document.getElementById(sDIVId);
	  var oDivToAppend = oTheDiv;
	  for (var i = 0; i < oResultSettings.length; i++) {
		  if (oResultSettings[i].text || oResultSettings[i].icon) {
			  if (sDIVId === "condenseddiv") {
				  var oEl1 = document.createElement("div");
				  oEl1.className = "sapUiTableDataCell";
				  oTheDiv.appendChild(oEl1);
				  oDivToAppend = oEl1;
			  }

			  var oEl = document.createElement("div"),
				  sId = sDIVId + i;
			  oEl.setAttribute("id", sId);
			  oDivToAppend.appendChild(oEl);
			  new Button(oResultSettings[i]).placeAt(sId);
		  }
	  }
  });
});