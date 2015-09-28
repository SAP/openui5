/**
 * Responses for $batch requests in the AnalyticalTable.qunit.html
 * Tests for: simple expand/collapse AND provideGrandTotals = false Tests
 */
o4aFakeService.addResponse({
	batch: true,
	uri: [
			"ActualPlannedCosts(P_ControllingArea=\'US01\',P_CostCenter=\'100-1000\',P_CostCenterTo=\'999-9999\')/Results?$select=ActualCosts,Currency,PlannedCosts&$top=100&$inlinecount=allpages"
		],
	header: o4aFakeService.headers.BATCH,
	content: "--AAD136757C5CF75E21C04F59B8682CEA0\r\n" +
			"Content-Type: application/http\r\n" + 
			"Content-Length: 406\r\n" + 
			"content-transfer-encoding: binary\r\n" + 
			"\r\n" + 
			"HTTP/1.1 200 OK\r\n" + 
			"Content-Type: application/json\r\n" + 
			"content-language: en-US\r\n" + 
			"Content-Length: 309\r\n" + 
			"\r\n" + 
			"{\"d\":{\"results\":[{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544452006589331\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"Currency\":\"USD\",\"ActualCosts\":\"11775332\",\"PlannedCosts\":\"11819870\"}],\"__count\":\"1\"}}\r\n" + 
			"--AAD136757C5CF75E21C04F59B8682CEA0\r\n" + 
			"Content-Type: application/http\r\n" + 
			"Content-Length: 404\r\n" + 
			"content-transfer-encoding: binary\r\n" + 
			"\r\n" + 
			"HTTP/1.1 200 OK\r\n" + 
			"Content-Type: application/json\r\n" + 
			"content-language: en-US\r\n" + 
			"Content-Length: 307\r\n" + 
			"\r\n" + 
			"{\"d\":{\"results\":[{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544453325463651\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"400020\",\"Currency\":\"USD\"}],\"__count\":\"106\"}}\r\n" + 
			"--AAD136757C5CF75E21C04F59B8682CEA0\r\n" + 
			"Content-Type: application/http\r\n" + 
			"Content-Length: 3113\r\n" + 
			"content-transfer-encoding: binary\r\n" + 
			"\r\n" + 
			"HTTP/1.1 200 OK\r\n" + 
			"Content-Type: application/json\r\n" + 
			"content-language: en-US\r\n" + 
			"Content-Length: 3015\r\n" + 
			"\r\n" + 
			"{\"d\":{\"results\":[{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544454628369891\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"Currency\":\"USD\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"1588416\",\"PlannedCosts\":\"1593000\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544454628369892\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1100\",\"Currency\":\"USD\",\"CostCenterText\":\"Consulting Canada\",\"ActualCosts\":\"1398408\",\"PlannedCosts\":\"1368000\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544454628369893\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"200-1000\",\"Currency\":\"USD\",\"CostCenterText\":\"Sales US North\",\"ActualCosts\":\"1547326\",\"PlannedCosts\":\"1563500\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544454628369894\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"200-2000\",\"Currency\":\"USD\",\"CostCenterText\":\"Sales US South\",\"ActualCosts\":\"1542211\",\"PlannedCosts\":\"1489500\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544454628369895\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"200-3000\",\"Currency\":\"USD\",\"CostCenterText\":\"Sales US East\",\"ActualCosts\":\"1690110\",\"PlannedCosts\":\"1716650\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544454628369896\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"200-4000\",\"Currency\":\"USD\",\"CostCenterText\":\"Sales US West\",\"ActualCosts\":\"1190663\",\"PlannedCosts\":\"1211100\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544454628369897\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"200-5000\",\"Currency\":\"USD\",\"CostCenterText\":\"Sales Canada\",\"ActualCosts\":\"1403813\",\"PlannedCosts\":\"1493950\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544454628369898\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"300-1000\",\"Currency\":\"USD\",\"CostCenterText\":\"Marketing US\",\"ActualCosts\":\"661910\",\"PlannedCosts\":\"642350\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544454628369899\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"300-2000\",\"Currency\":\"USD\",\"CostCenterText\":\"Marketing Canada\",\"ActualCosts\":\"752475\",\"PlannedCosts\":\"741820\"}],\"__count\":\"9\"}}\r\n" + 
			"--AAD136757C5CF75E21C04F59B8682CEA0--\r\n" +
			""
});

o4aFakeService.addResponse({
	batch: true,
	uri: [
			"ActualPlannedCosts(P_ControllingArea=\'US01\',P_CostCenter=\'100-1000\',P_CostCenterTo=\'999-9999\')/Results?$select=CostCenter,CostCenterText,CostElement,CostElementText,ActualCosts,Currency,PlannedCosts&$filter=(CostCenter%20eq%20%27100-1000%27)&$orderby=CostCenter%20asc,CostElement%20asc&$top=119&$inlinecount=allpages"
		],
	header: o4aFakeService.headers.BATCH,
	content: "--AAD136757C5CF75E21C04F59B8682CEA0\r\n" +
			"Content-Type: application/http\r\n" + 
			"Content-Length: 4758\r\n" + 
			"content-transfer-encoding: binary\r\n" + 
			"\r\n" + 
			"HTTP/1.1 200 OK\r\n" + 
			"Content-Type: application/json\r\n" + 
			"content-language: en-US\r\n" + 
			"Content-Length: 4660\r\n" + 
			"\r\n" + 
			"{\"d\":{\"results\":[{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544460853913201\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"400020\",\"Currency\":\"USD\",\"CostElementText\":\"Flights\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"131254\",\"PlannedCosts\":\"120000\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544460853913202\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"400021\",\"Currency\":\"USD\",\"CostElementText\":\"Lodging\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"132025\",\"PlannedCosts\":\"150000\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544460853913203\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"410050\",\"Currency\":\"USD\",\"CostElementText\":\"Rental Cars\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"44532\",\"PlannedCosts\":\"43000\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544460853913204\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"417900\",\"Currency\":\"USD\",\"CostElementText\":\"Third Party\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"12521\",\"PlannedCosts\":\"20000\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544460853913205\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"421000\",\"Currency\":\"USD\",\"CostElementText\":\"Indirect labor costs\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"4532\",\"PlannedCosts\":\"5000\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544460853913206\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"430100\",\"Currency\":\"USD\",\"CostElementText\":\"Salaries & Wages\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"675652\",\"PlannedCosts\":\"670000\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544460853913207\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"435000\",\"Currency\":\"USD\",\"CostElementText\":\"Annual Bonus\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"131254\",\"PlannedCosts\":\"130000\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544460853913208\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"440001\",\"Currency\":\"USD\",\"CostElementText\":\"Legal Social Expense\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"352126\",\"PlannedCosts\":\"350000\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544460853913209\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"449000\",\"Currency\":\"USD\",\"CostElementText\":\"Other Personnel Exp.\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"76521\",\"PlannedCosts\":\"75000\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'1425444608539132010\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"474240\",\"Currency\":\"USD\",\"CostElementText\":\"Travel Exp. Other\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"9145\",\"PlannedCosts\":\"9000\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'1425444608539132011\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"476900\",\"Currency\":\"USD\",\"CostElementText\":\"Other Costs\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"7589\",\"PlannedCosts\":\"8000\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'1425444608539132012\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"478000\",\"Currency\":\"USD\",\"CostElementText\":\"Conference Fees\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"11265\",\"PlannedCosts\":\"13000\"}],\"__count\":\"12\"}}\r\n" +
			"--AAD136757C5CF75E21C04F59B8682CEA0--\r\n" +
			""
});

o4aFakeService.addResponse({
	batch: true,
	uri: [
			"ActualPlannedCosts(P_ControllingArea=\'US01\',P_CostCenter=\'100-1000\',P_CostCenterTo=\'999-9999\')/Results?$select=CostCenter,CostElement,Currency&$top=0&$inlinecount=allpages",
			"ActualPlannedCosts(P_ControllingArea=\'US01\',P_CostCenter=\'100-1000\',P_CostCenterTo=\'999-9999\')/Results?$select=CostCenter,CostCenterText,ActualCosts,Currency,PlannedCosts&$orderby=CostCenter%20asc&$top=120&$inlinecount=allpages"
		],
	header: o4aFakeService.headers.BATCH,
	content: "--AAD136757C5CF75E21C04F59B8682CEA0\r\n" +
			"Content-Type: application/http\r\n" + 
			"Content-Length: 404\r\n" + 
			"content-transfer-encoding: binary\r\n" + 
			"\r\n" + 
			"HTTP/1.1 200 OK\r\n" + 
			"Content-Type: application/json\r\n" + 
			"content-language: en-US\r\n" + 
			"Content-Length: 307\r\n" + 
			"\r\n" + 
			"{\"d\":{\"results\":[{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544470103294811\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"400020\",\"Currency\":\"USD\"}],\"__count\":\"106\"}}\r\n" + 
			"--AAD136757C5CF75E21C04F59B8682CEA0\r\n" + 
			"Content-Type: application/http\r\n" + 
			"Content-Length: 3113\r\n" + 
			"content-transfer-encoding: binary\r\n" + 
			"\r\n" + 
			"HTTP/1.1 200 OK\r\n" + 
			"Content-Type: application/json\r\n" + 
			"content-language: en-US\r\n" + 
			"Content-Length: 3015\r\n" + 
			"\r\n" + 
			"{\"d\":{\"results\":[{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544471403373811\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"Currency\":\"USD\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"1588416\",\"PlannedCosts\":\"1593000\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544471403373812\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1100\",\"Currency\":\"USD\",\"CostCenterText\":\"Consulting Canada\",\"ActualCosts\":\"1398408\",\"PlannedCosts\":\"1368000\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544471403373813\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"200-1000\",\"Currency\":\"USD\",\"CostCenterText\":\"Sales US North\",\"ActualCosts\":\"1547326\",\"PlannedCosts\":\"1563500\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544471403373814\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"200-2000\",\"Currency\":\"USD\",\"CostCenterText\":\"Sales US South\",\"ActualCosts\":\"1542211\",\"PlannedCosts\":\"1489500\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544471403373815\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"200-3000\",\"Currency\":\"USD\",\"CostCenterText\":\"Sales US East\",\"ActualCosts\":\"1690110\",\"PlannedCosts\":\"1716650\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544471403373816\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"200-4000\",\"Currency\":\"USD\",\"CostCenterText\":\"Sales US West\",\"ActualCosts\":\"1190663\",\"PlannedCosts\":\"1211100\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544471403373817\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"200-5000\",\"Currency\":\"USD\",\"CostCenterText\":\"Sales Canada\",\"ActualCosts\":\"1403813\",\"PlannedCosts\":\"1493950\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544471403373818\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"300-1000\",\"Currency\":\"USD\",\"CostCenterText\":\"Marketing US\",\"ActualCosts\":\"661910\",\"PlannedCosts\":\"642350\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544471403373819\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"300-2000\",\"Currency\":\"USD\",\"CostCenterText\":\"Marketing Canada\",\"ActualCosts\":\"752475\",\"PlannedCosts\":\"741820\"}],\"__count\":\"9\"}}\r\n" +
			"--AAD136757C5CF75E21C04F59B8682CEA0--\r\n" +
			""
});

o4aFakeService.addResponse({
	batch: true,
	uri: [
			"ActualPlannedCosts(P_ControllingArea=\'US01\',P_CostCenter=\'100-1000\',P_CostCenterTo=\'999-9999\')/Results?$select=CostCenter,CostCenterText,CostElement,CostElementText,ActualCosts,Currency,PlannedCosts&$filter=(CostCenter%20eq%20%27100-1000%27)&$orderby=CostCenter%20asc,CostElement%20asc&$top=120&$inlinecount=allpages"
		],
	header: o4aFakeService.headers.BATCH,
	content: "--AAD136757C5CF75E21C04F59B8682CEA0\r\n" +
			"Content-Type: application/http\r\n" + 
			"Content-Length: 4758\r\n" + 
			"content-transfer-encoding: binary\r\n" + 
			"\r\n" + 
			"HTTP/1.1 200 OK\r\n" + 
			"Content-Type: application/json\r\n" + 
			"content-language: en-US\r\n" + 
			"Content-Length: 4660\r\n" + 
			"\r\n" + 
			"{\"d\":{\"results\":[{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544476701336951\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"400020\",\"Currency\":\"USD\",\"CostElementText\":\"Flights\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"131254\",\"PlannedCosts\":\"120000\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544476701336952\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"400021\",\"Currency\":\"USD\",\"CostElementText\":\"Lodging\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"132025\",\"PlannedCosts\":\"150000\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544476701336953\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"410050\",\"Currency\":\"USD\",\"CostElementText\":\"Rental Cars\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"44532\",\"PlannedCosts\":\"43000\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544476701336954\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"417900\",\"Currency\":\"USD\",\"CostElementText\":\"Third Party\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"12521\",\"PlannedCosts\":\"20000\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544476701336955\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"421000\",\"Currency\":\"USD\",\"CostElementText\":\"Indirect labor costs\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"4532\",\"PlannedCosts\":\"5000\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544476701336956\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"430100\",\"Currency\":\"USD\",\"CostElementText\":\"Salaries & Wages\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"675652\",\"PlannedCosts\":\"670000\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544476701336957\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"435000\",\"Currency\":\"USD\",\"CostElementText\":\"Annual Bonus\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"131254\",\"PlannedCosts\":\"130000\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544476701336958\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"440001\",\"Currency\":\"USD\",\"CostElementText\":\"Legal Social Expense\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"352126\",\"PlannedCosts\":\"350000\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'142544476701336959\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"449000\",\"Currency\":\"USD\",\"CostElementText\":\"Other Personnel Exp.\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"76521\",\"PlannedCosts\":\"75000\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'1425444767013369510\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"474240\",\"Currency\":\"USD\",\"CostElementText\":\"Travel Exp. Other\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"9145\",\"PlannedCosts\":\"9000\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'1425444767013369511\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"476900\",\"Currency\":\"USD\",\"CostElementText\":\"Other Costs\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"7589\",\"PlannedCosts\":\"8000\"},{\"__metadata\": {\"uri\":\"http://o4aFakeService:8080/ActualPlannedCostsResults(\'1425444767013369512\')\",\"type\":\"tmp.d041558.cca.CCA.ActualPlannedCostsResultsType\"},\"CostCenter\":\"100-1000\",\"CostElement\":\"478000\",\"Currency\":\"USD\",\"CostElementText\":\"Conference Fees\",\"CostCenterText\":\"Consulting US\",\"ActualCosts\":\"11265\",\"PlannedCosts\":\"13000\"}],\"__count\":\"12\"}}\r\n" +
			"--AAD136757C5CF75E21C04F59B8682CEA0--\r\n" +
			""
});