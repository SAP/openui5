
function onLoad() {
	this.oFeaturedProjects = {
		"Ui5Strap": {
			"name": "Ui5Strap",
			"decription": "-",
			"githubLink": "https://github.com/pks5/ui5strap",
			"documentaionLink": "http://www.ui5strap.com/manual/",
			"owner": "-",
			"license": "Apache 2"
		},
		"UI5CustomControl": {
			"name": "OpenUI5 Custom Controls for charting",
			"decription": "-",
			"githubLink": "https://github.com/SAP/openui5-charting-custom-controls",
			"documentaionLink": "#UI5CustomControl",
			"owner": "Michael Graf",
			"license": "-"
		},
		"Meteor-UI5": {
			"name": "Meteor-UI5",
			"decription": "-",
			"githubLink": "https://github.com/propellerlabsio/meteor-ui5",
			"documentaionLink": "https://meteor-ui5.propellerlabs.com/",
			"owner": "-",
			"license": "-"
		}
	};
	// generate template for each table entry
	var tableNode = document.getElementById("projectsTable");
	Object.keys(this.oFeaturedProjects).forEach(function (sKey) {
		var sRowTemplate = document.createElement("tr");
		var sTdTemplate1, sTdTemplate2, sTdTemplate3, sTdTemplate4, sTdTemplate5,sTdTemplate6;
		sName  = "<td>" + oFeaturedProjects[sKey].name + "</td>";
		sGitHubLink  = "<td><a href=" + oFeaturedProjects[sKey].githubLink + " " + "name=" + sKey + ">" + oFeaturedProjects[sKey].name + "</a></td>";
		sOwner  = "<td>" + oFeaturedProjects[sKey].owner + "</td>";
		sDescription  = "<td>" + oFeaturedProjects[sKey].decription + "</td>";
		sDocumentationLink  = "<td><a href=" + oFeaturedProjects[sKey].documentaionLink + ">" + "Documentation</a></td>";
		sLicense  = "<td>" + oFeaturedProjects[sKey].license + "</td>";
		sRowTemplate.innerHTML = sName + sGitHubLink + sOwner + sDescription + sDocumentationLink + sLicense;
		tableNode.appendChild(sRowTemplate);
	});
}
 
 function toggleTutorial () {

	$("#tutorial").toggle();
 }
 
 // handel click event on the Ui5Strap project
 function onUi5StrapClick () {
	 var sFirstRow = $("#projectsTable").children()[1];
	 var sSecondRow = $("#projectsTable").children()[2];
	 $(sFirstRow).css("background-color", "#dcdcdc");
	 $(sSecondRow).css("background-color", "#ffffff");
 }
 // handel click event on the OpenUI5 Custom Controls project
  function onCustomControlClick () {
	 var sFirstRow = $("#projectsTable").children()[1];
	 var sSecondRow = $("#projectsTable").children()[2];
	 $(sSecondRow).css("background-color", "#dcdcdc");
	 $(sFirstRow).css("background-color", "#ffffff");
 }

	
