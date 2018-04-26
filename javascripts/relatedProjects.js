function onLoad() {
	debugger;
	// generate template for each table entry
	var oTableNode = document.getElementById("projectsTable");
	$.getJSON("./OpenUI5RelatedProjects.json", function(aResult){
		aResult.sort(function (a, b) {
			if (a.name.toLowerCase() > b.name.toLowerCase()) {
				return 1;
			} else if (a.name.toLowerCase() < b.name.toLowerCase()) {
				return -1;
			} else {
				return 0
			}

		});

		$.each(aResult, function(sIndex, oEntry){
			var sRowTemplate = document.createElement("tr");
			sName  = "<td><a href=" + oEntry.githubLink +">" + oEntry.name + "</a></td>";
			sType  = "<td class='phone-cells'>" + oEntry.type + "</td>";
			sOwner  = "<td><a href=https://github.com/" + oEntry.owner +">" + "@" + oEntry.owner + "</a></td>";
			sDescription  = "<td class='phone-cells tablet-cells'>" + oEntry.description + "</td>";
			sDocumentationLink  = "<td><a href=" + oEntry.documentationLink + ">" + "Documentation</a></td>";
			sLicense  = "<td class='phone-cells tablet-cells'>" + oEntry.license + "</td>";
			sRowTemplate.innerHTML = sName + sOwner + sType + sDescription + sDocumentationLink + sLicense;
			oTableNode.appendChild(sRowTemplate);
		});
	});
}

