function onLoad() {
	// generate template for each table entry
	var tableNode = document.getElementById("projectsTable");
	$.getJSON("./OpenUI5RelatedProjects.json", function(result){
		$.each(result, function(sIndex, oEntry){
			var sRowTemplate = document.createElement("tr");
			sName  = "<td><a href=" + oEntry.githubLink +">" + oEntry.name + "</a></td>";
			sType  = "<td>" + oEntry.type + "</td>";
			sOwner  = "<td><a href=https://github.com/" + oEntry.owner +">" + "@" + oEntry.owner + "</a></td>";
			sDescription  = "<td>" + oEntry.decription + "</td>";
			sDocumentationLink  = "<td><a href=" + oEntry.documentationLink + ">" + "Documentation</a></td>";
			sLicense  = "<td>" + oEntry.license + "</td>";
			sRowTemplate.innerHTML = sName + sOwner + sType + sDescription + sDocumentationLink + sLicense;
			tableNode.appendChild(sRowTemplate);
		});
	});
}

