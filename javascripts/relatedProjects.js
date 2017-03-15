function onLoad() {
	this.oFeaturedProjects = {
		"ui5-inspector": {
			"name": "UI5 Inspector",
			"decription": "The UI5 Inspector is a standard Chrome extension for debugging and getting to know UI5 applications.",
			"githubLink": "https://github.com/SAP/ui5-inspector",
			"documentaionLink": "",
			"owner": "SAP",
			"license": "Apache 2.0"
		},
		"UI5CustomControl": {
			"name": "OpenUI5 Custom Controls for charting",
			"decription": "This project shows how to use C3.js and Chart.js within OpenUI5 projects.",
			"githubLink": "https://github.com/SAP/openui5-charting-custom-controls",
			"documentaionLink": "",
			"owner": "michadelic",
			"license": "Apache 2.0"
		},
		"Meteor-UI5": {
			"name": "Meteor-UI5",
			"decription": "Meteor-UI5 is a collection of packages that brings to together two powerful open source JavaScript web frameworks: Meteor and OpenUI5.",
			"githubLink": "https://github.com/propellerlabsio/meteor-ui5",
			"documentaionLink": "https://meteor-ui5.propellerlabs.com/",
			"owner": "proehlen",
			"license": "Apache 2.0"
		},
		"openui5-i18n-util": {
			"name": "openui5-i18n-util",
			"decription": "This script will search all your i18n strings and build auto-magically every translations file for you.",
			"githubLink": "https://github.com/StErMi/openui5-i18n-util",
			"documentaionLink": "",
			"owner": "StErMi",
			"license": "Apache 2.0"
		},
		"ui5-inspector": {
			"name": "UI5 Inspector",
			"decription": "The UI5 Inspector is a standard Chrome extension for debugging and getting to know UI5 applications.",
			"githubLink": "https://github.com/SAP/ui5-inspector",
			"documentaionLink": "",
			"owner": "SAP",
			"license": "Apache 2.0"
		},
		"Ui5Strap": {
			"name": "Ui5Strap",
			"decription": "Ui5Strap is a multitasking environment, which means you can start multiple apps at the same time",
			"githubLink": "https://github.com/pks5/ui5strap",
			"documentaionLink": "http://www.ui5strap.com/manual/",
			"owner": "pks5",
			"license": "Apache 2.0"
		}
	};
	// generate template for each table entry
	var tableNode = document.getElementById("projectsTable");
	Object.keys(this.oFeaturedProjects).forEach(function (sKey) {
		var sRowTemplate = document.createElement("tr");
		sName  = "<td><a href=" + oFeaturedProjects[sKey].githubLink + " " + "name=" + sKey + ">" + oFeaturedProjects[sKey].name + "</a></td>";
		sOwner  = "<td><a href=https://github.com/" + oFeaturedProjects[sKey].owner +">" + "@" + oFeaturedProjects[sKey].owner + "</a></td>";
		sDescription  = "<td>" + oFeaturedProjects[sKey].decription + "</td>";
		sDocumentationLink  = "<td><a href=" + oFeaturedProjects[sKey].documentaionLink + ">" + "Documentation</a></td>";
		sLicense  = "<td>" + oFeaturedProjects[sKey].license + "</td>";
		sRowTemplate.innerHTML = sName + sOwner + sDescription + sDocumentationLink + sLicense;
		tableNode.appendChild(sRowTemplate);
	});
}

