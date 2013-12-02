package com.sap.ui5.selenium.tools.jenkins;

import java.io.File;
import java.io.FileFilter;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.w3c.dom.Document;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.sap.ui5.selenium.util.Utility;

/** Update Junit test results with additional test environment information */
public class JunitResultsUpdater {

	public static void main(String[] args) {

		if (args.length < 2) {
			System.out.println("ERROR: please provide 2 parameters: sourceFolderPath, targetFolderPath");
			return;
		}

		String sourceFolderPath = args[0];
		String targetFolderPath = args[1];

		File sourceFolder = new File(sourceFolderPath);
		if (!sourceFolder.exists() || !sourceFolder.isDirectory()) {
			System.out.println("ERROR: sourceFolderPath is not valid!");
			return;
		}

		File sourceFils[] = sourceFolder.listFiles(new FileFilter() {
			@Override
			public boolean accept(File pathname) {
				return pathname.getName().contains(".xml");
			}
		});

		System.out.println("-----------------------------");
		File targetFolder = new File(targetFolderPath);
		if (!targetFolder.exists()) {
			targetFolder.mkdirs();
		}

		String testEnv = "";
		for (File xml : Arrays.asList(sourceFils)) {
			System.out.println("Update Junit XML Results: " + xml.getName());
			testEnv = updateXML(xml, targetFolder);
		}

		File attachmentFolders[] = sourceFolder.listFiles(new FileFilter() {
			@Override
			public boolean accept(File pathname) {
				return pathname.isDirectory();
			}
		});

		for (File folder : attachmentFolders) {
			System.out.println("Update Junit Attachments Folder: " + folder.getName());
			updateAttachments(testEnv, folder, targetFolder);
		}
	}

	public static String updateXML(File xml, File targetFolder) {

		DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		DocumentBuilder builder;
		Document doc;
		try {
			builder = factory.newDocumentBuilder();
			doc = builder.parse(xml);
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}

		// Get test environment attributes
		NodeList propertiesList = doc.getElementsByTagName("property");

		Map<String, String> envMap = new HashMap<String, String>();
		for (int i = 0; i < propertiesList.getLength(); i++) {
			NamedNodeMap nodeMap = propertiesList.item(i).getAttributes();

			envMap.put(nodeMap.getNamedItem("name").getNodeValue(),
					nodeMap.getNamedItem("value").getNodeValue());
		}

		String osName = envMap.get("Driver.OS.Name");
		String osBits = envMap.get("Driver.OS.Bits");
		String browserName = envMap.get("Driver.Browser.Name");
		String browserVersion = envMap.get("Driver.Browser.Version");
		String browserBits = envMap.get("Driver.Browser.Bits");
		String ui5Theme = envMap.get("URL.Parameter.sap-ui-theme");
		String ui5TextDirection;

		boolean rtl = Boolean.parseBoolean(envMap.get("URL.Parameter.sap-ui-rtl"));
		if (rtl == true) {
			ui5TextDirection = "RTL";
		} else {
			ui5TextDirection = "LTR";
		}

		String testEnv;
		if (browserName.equalsIgnoreCase("IE")) {
			testEnv = osName + "_" + osBits + "."
					+ browserName + browserVersion + "_" + browserBits + "."
					+ ui5Theme + "." + ui5TextDirection + ".";
		} else {
			testEnv = osName + "_" + osBits + "."
					+ browserName + "."
					+ ui5Theme + "." + ui5TextDirection + ".";
		}

		// Update test suite
		NodeList nl = doc.getElementsByTagName("testsuite");
		Node node = nl.item(0).getAttributes().getNamedItem("name");
		String nodeValue = node.getNodeValue();
		node.setNodeValue(testEnv + nodeValue);

		// Update test case
		nl = doc.getElementsByTagName("testcase");

		for (int i = 0; i < nl.getLength(); i++) {
			node = nl.item(i).getAttributes().getNamedItem("classname");
			nodeValue = node.getNodeValue();
			node.setNodeValue(testEnv + nodeValue);
		}

		TransformerFactory tFactory = TransformerFactory.newInstance();
		Transformer transformer;
		try {
			transformer = tFactory.newTransformer();
		} catch (TransformerConfigurationException e) {
			e.printStackTrace();
			return null;
		}
		DOMSource source = new DOMSource(doc);

		File resultsFile = new File(targetFolder, xml.getName().replaceFirst("TEST-", "TEST-" + testEnv));
		StreamResult result = new StreamResult(resultsFile);
		try {
			transformer.transform(source, result);
		} catch (TransformerException e) {
			e.printStackTrace();
			return null;
		}

		return testEnv;
	}

	public static void updateAttachments(String testEnv, File attachmentFolder, File targetFolder) {

		File attachments[] = attachmentFolder.listFiles();
		File newAttachmentFolder = new File(targetFolder, testEnv + attachmentFolder.getName());
		newAttachmentFolder.mkdirs();

		for (File attachment : attachments) {
			File newAttachment = new File(newAttachmentFolder, attachment.getName());
			Utility.copyFile(attachment, newAttachment);
		}
	}
}
