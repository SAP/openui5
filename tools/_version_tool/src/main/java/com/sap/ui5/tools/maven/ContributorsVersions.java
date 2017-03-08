/*
 * Copyright 2017 by SAP SE, Walldorf., http://www.sap.com.
 * All rights reserved. Use is subject to license terms.
 * This software is the confidential and proprietary information
 * of SAP SE, Walldorf. You shall not disclose such confidential
 * information and shall use it only in accordance with the terms
 * of the license agreement you entered into with SAP.
 */
package com.sap.ui5.tools.maven;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.sap.ui5.tools.maven.MyReleaseButton;

public class ContributorsVersions {

  Runtime p = Runtime.getRuntime();
  
  public String extractSnapshotVersionJs() throws IOException {
    File file = new File("getSnapshotVersion.js");
      if (!file.exists()) {
           InputStream link = (ContributorsVersions.class.getClassLoader().getResourceAsStream("getSnapshotVersion.js"));
           Files.copy(link, file.getAbsoluteFile().toPath());
      }
      return file.getAbsoluteFile().toString();
  }

  public JsonObject convertFileToJSON (String fileName) throws FileNotFoundException{

    // Read from File to String
    JsonObject jsonObject = new JsonObject();     
    JsonParser parser = new JsonParser();
    JsonElement jsonElement = parser.parse(new FileReader(fileName));
    jsonObject = jsonElement.getAsJsonObject();
    return jsonObject;
}

  public void extractContributorsVersions(String toVersion) throws IOException {
    Runtime p = Runtime.getRuntime();
     String jsLocation = extractSnapshotVersionJs();
     MyReleaseButton.setFileOSLocation(jsLocation);
     //Execution of the getSnapshotVersion.js (which searches and takes data from NEXUS for contributors Snapshot versions)
     p.exec("cmd.exe /c cd "+jsLocation+" & start cmd.exe /c" + "node getSnapshotVersion.js " + toVersion);
  }
}