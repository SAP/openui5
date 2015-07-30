/**
 * Responses for a Batch Request during the TBA Expand/Collapse/Toggle Test
 */
o4aFakeService.addResponse({
	batch: true,
	uri: [
			"ActualPlannedCosts(P_ControllingArea=\'US01\',P_CostCenter=\'100-1000\',P_CostCenterTo=\'999-9999\')/Results?$select=ActualCosts,Currency&$top=100&$inlinecount=allpages",
			"ActualPlannedCosts(P_ControllingArea=\'US01\',P_CostCenter=\'100-1000\',P_CostCenterTo=\'999-9999\')/Results?$select=CostCenter,ActualCosts,Currency&$orderby=CostCenter%20asc&$top=120&$inlinecount=allpages",
			"ActualPlannedCosts(P_ControllingArea=\'US01\',P_CostCenter=\'100-1000\',P_CostCenterTo=\'999-9999\')/Results?$select=CostCenter,CostElement,Currency&$top=1&$inlinecount=allpages"
		],
	header: o4aFakeService.headers.BATCH,
	content: "--AAD136757C5CF75E21C04F59B8682CEA0\r\n" +
			"Content-Type: application/http\r\n" +
			"Content-Length: 364\r\n" +
			"content-transfer-encoding: binary\r\n" +
			"\r\n" +
			"HTTP/1.1 200 OK\r\n" +
			"Content-Type: application/json\r\n" +
			"content-language: en-US\r\n" +
			"Content-Length: 267\r\n" +
			"\r\n" +
			"{\"d\":{\"results\":[{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28597942706279411\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"Currency\":\"USD\",\"ActualCosts\":\"11775332\"}],\"__count\":\"1\"}}\r\n" +
			"--AAD136757C5CF75E21C04F59B8682CEA0\r\n" +
			"Content-Type: application/http\r\n" +
			"Content-Length: 2442\r\n" +
			"content-transfer-encoding: binary\r\n" +
			"\r\n" +
			"HTTP/1.1 200 OK\r\n" +
			"Content-Type: application/json\r\n" +
			"content-language: en-US\r\n" +
			"Content-Length: 2344\r\n" +
			"\r\n" +
			"{\"d\":{\"results\":[{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28597944094308351\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"Currency\":\"USD\",\"ActualCosts\":\"1588416\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28597944094308352\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1100\",\"Currency\":\"USD\",\"ActualCosts\":\"1398408\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28597944094308353\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"200-1000\",\"Currency\":\"USD\",\"ActualCosts\":\"1547326\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28597944094308354\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"200-2000\",\"Currency\":\"USD\",\"ActualCosts\":\"1542211\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28597944094308355\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"200-3000\",\"Currency\":\"USD\",\"ActualCosts\":\"1690110\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28597944094308356\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"200-4000\",\"Currency\":\"USD\",\"ActualCosts\":\"1190663\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28597944094308357\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"200-5000\",\"Currency\":\"USD\",\"ActualCosts\":\"1403813\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28597944094308358\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"300-1000\",\"Currency\":\"USD\",\"ActualCosts\":\"661910\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28597944094308359\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"300-2000\",\"Currency\":\"USD\",\"ActualCosts\":\"752475\"}],\"__count\":\"9\"}}\r\n" +
			"--AAD136757C5CF75E21C04F59B8682CEA0\r\n" +
			"Content-Type: application/http\r\n" +
			"Content-Length: 388\r\n" +
			"content-transfer-encoding: binary\r\n" +
			"\r\n" +
			"HTTP/1.1 200 OK\r\n" +
			"Content-Type: application/json\r\n" +
			"content-language: en-US\r\n" +
			"Content-Length: 291\r\n" +
			"\r\n" +
			"{\"d\":{\"results\":[{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'28597945494934541\')\",\"type\":\"fake.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"400020\",\"Currency\":\"USD\"}],\"__count\":\"106\"}}\r\n" + 
			"--AAD136757C5CF75E21C04F59B8682CEA0--\r\n" +
			""
});

o4aFakeService.addResponse({
	batch: true,
	uri: [
			"ActualPlannedCosts(P_ControllingArea=\'US01\',P_CostCenter=\'100-1000\',P_CostCenterTo=\'999-9999\')/Results?$select=CostCenter,CostElement,ActualCosts,Currency&$filter=(CostCenter%20eq%20%27100-1000%27)&$orderby=CostCenter%20asc,CostElement%20asc&$top=20&$inlinecount=allpages"
		],
	header: o4aFakeService.headers.BATCH,
	content: "--AAD136757C5CF75E21C04F59B8682CEA0\r\n" +
			"Content-Type: application/http\r\n" + 
			"Content-Length: 4746\r\n" + 
			"content-transfer-encoding: binary\r\n" + 
			"\r\n" + 
			"HTTP/1.1 200 OK\r\n" + 
			"Content-Type: application/json\r\n" + 
			"content-language: en-US\r\n" + 
			"Content-Length: 4648\r\n" + 
			"\r\n" + 
			"{\"d\":{\"results\":[{\"__metadata\": {\"uri\":\"http://localhost:8080/uilib-sample/proxy/http/dewdflhanaui5.emea.global.corp.sap:8000/tmp/d041558/cca/CCA.xsodata/ActualPlannedCostsResults(\'43196236913942581\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"400020\",\"Currency\":\"USD\",\"CostElementText\":\"Flights\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"131254\",\"PlannedCosts\":\"120000\"},{\"__metadata\": {\"uri\":\"http://localhost:8080/uilib-sample/proxy/http/dewdflhanaui5.emea.global.corp.sap:8000/tmp/d041558/cca/CCA.xsodata/ActualPlannedCostsResults(\'43196236913942582\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"400021\",\"Currency\":\"USD\",\"CostElementText\":\"Lodging\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"132025\",\"PlannedCosts\":\"150000\"},{\"__metadata\": {\"uri\":\"http://localhost:8080/uilib-sample/proxy/http/dewdflhanaui5.emea.global.corp.sap:8000/tmp/d041558/cca/CCA.xsodata/ActualPlannedCostsResults(\'43196236913942583\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"410050\",\"Currency\":\"USD\",\"CostElementText\":\"Rental Cars\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"44532\",\"PlannedCosts\":\"43000\"},{\"__metadata\": {\"uri\":\"http://localhost:8080/uilib-sample/proxy/http/dewdflhanaui5.emea.global.corp.sap:8000/tmp/d041558/cca/CCA.xsodata/ActualPlannedCostsResults(\'43196236913942584\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"417900\",\"Currency\":\"USD\",\"CostElementText\":\"Third Party\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"12521\",\"PlannedCosts\":\"20000\"},{\"__metadata\": {\"uri\":\"http://localhost:8080/uilib-sample/proxy/http/dewdflhanaui5.emea.global.corp.sap:8000/tmp/d041558/cca/CCA.xsodata/ActualPlannedCostsResults(\'43196236913942585\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"421000\",\"Currency\":\"USD\",\"CostElementText\":\"Indirect labor costs\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"4532\",\"PlannedCosts\":\"5000\"},{\"__metadata\": {\"uri\":\"http://localhost:8080/uilib-sample/proxy/http/dewdflhanaui5.emea.global.corp.sap:8000/tmp/d041558/cca/CCA.xsodata/ActualPlannedCostsResults(\'43196236913942586\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"430100\",\"Currency\":\"USD\",\"CostElementText\":\"Salaries & Wages\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"675652\",\"PlannedCosts\":\"670000\"},{\"__metadata\": {\"uri\":\"http://localhost:8080/uilib-sample/proxy/http/dewdflhanaui5.emea.global.corp.sap:8000/tmp/d041558/cca/CCA.xsodata/ActualPlannedCostsResults(\'43196236913942587\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"435000\",\"Currency\":\"USD\",\"CostElementText\":\"Annual Bonus\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"131254\",\"PlannedCosts\":\"130000\"},{\"__metadata\": {\"uri\":\"http://localhost:8080/uilib-sample/proxy/http/dewdflhanaui5.emea.global.corp.sap:8000/tmp/d041558/cca/CCA.xsodata/ActualPlannedCostsResults(\'43196236913942588\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"440001\",\"Currency\":\"USD\",\"CostElementText\":\"Legal Social Expense\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"352126\",\"PlannedCosts\":\"350000\"},{\"__metadata\": {\"uri\":\"http://localhost:8080/uilib-sample/proxy/http/dewdflhanaui5.emea.global.corp.sap:8000/tmp/d041558/cca/CCA.xsodata/ActualPlannedCostsResults(\'43196236913942589\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"449000\",\"Currency\":\"USD\",\"CostElementText\":\"Other Personnel Exp.\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"76521\",\"PlannedCosts\":\"75000\"},{\"__metadata\": {\"uri\":\"http://localhost:8080/uilib-sample/proxy/http/dewdflhanaui5.emea.global.corp.sap:8000/tmp/d041558/cca/CCA.xsodata/ActualPlannedCostsResults(\'431962369139425810\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"474240\",\"Currency\":\"USD\",\"CostElementText\":\"Travel Exp. Other\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"9145\",\"PlannedCosts\":\"9000\"},{\"__metadata\": {\"uri\":\"http://localhost:8080/uilib-sample/proxy/http/dewdflhanaui5.emea.global.corp.sap:8000/tmp/d041558/cca/CCA.xsodata/ActualPlannedCostsResults(\'431962369139425811\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"476900\",\"Currency\":\"USD\",\"CostElementText\":\"Other Costs\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"7589\",\"PlannedCosts\":\"8000\"},{\"__metadata\": {\"uri\":\"http://localhost:8080/uilib-sample/proxy/http/dewdflhanaui5.emea.global.corp.sap:8000/tmp/d041558/cca/CCA.xsodata/ActualPlannedCostsResults(\'431962369139425812\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"478000\",\"Currency\":\"USD\",\"CostElementText\":\"Conference Fees\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"11265\",\"PlannedCosts\":\"13000\"}],\"__count\":\"12\"}}\r\n" +
			"--AAD136757C5CF75E21C04F59B8682CEA0--\r\n" +
			""
});