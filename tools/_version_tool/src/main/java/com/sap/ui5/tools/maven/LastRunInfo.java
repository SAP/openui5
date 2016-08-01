/*
 * Copyright 2014 by SAP AG, Walldorf., http://www.sap.com.
 * All rights reserved. Use is subject to license terms.
 * This software is the confidential and proprietary information
 * of SAP AG, Walldorf. You shall not disclose such confidential
 * information and shall use it only in accordance with the terms
 * of the license agreement you entered into with SAP.
 */
package com.sap.ui5.tools.maven;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.HashMap;
import java.util.InvalidPropertiesFormatException;
import java.util.Map;
import java.util.Properties;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.stream.JsonReader;

/**
 * 
 * The class <b><code>LastRunInfo</code></b> ...
 * Allow the .version-tool.xml properties file to be used for another purposes
 * <br>
 * @author Todor Atanasov
 * @since 1.25.0
 */
public class LastRunInfo {
  private File lastVersionToolResultsFile;
  private String profile;
  private String branch;
  private VersionTool versionTool;
  
  private class VersionTool{
      Map<String, LastPerVersion> lastPerVersion;
  }
  
  private class LastPerVersion {
      Map<String, Properties> changes;
      String lastCommitId = null;
      
      public LastPerVersion() {
        changes = new HashMap<String, Properties>();
    }
  }
  
  public LastRunInfo (File root, String branch) throws IOException {
    this(root, "default", branch);
  }
   
  public LastRunInfo(File root, String profile, String branch) throws IOException {
    this.profile = profile;
    this.branch = branch;
    lastVersionToolResultsFile = new File(root, ".version-tool.xml");
    if (lastVersionToolResultsFile.canRead()) {
      Gson gson = new GsonBuilder().setPrettyPrinting().create();
      FileReader fileReader = new FileReader(lastVersionToolResultsFile);
      versionTool = gson.fromJson(new JsonReader(fileReader), VersionTool.class);
      if (versionTool.lastPerVersion == null) {
        versionTool.lastPerVersion = new HashMap<String, LastPerVersion>();
        versionTool.lastPerVersion.put(branch, (LastPerVersion) gson.fromJson(new JsonReader(fileReader), LastPerVersion.class));
      }
      fileReader.close();
    } else {
      versionTool = new VersionTool();
      versionTool.lastPerVersion = new HashMap<String, LastPerVersion>();
    }
  }

  public void save() throws IOException{
    Gson gson = new GsonBuilder().disableHtmlEscaping().setPrettyPrinting().create();
    String json = gson.toJson(versionTool);
    FileWriter fw = new FileWriter(lastVersionToolResultsFile);
    fw.write(json);
    fw.close();
  }
  
  public Properties getDiffs() {
    LastPerVersion lastPerVersion = getLastPerVersion();
    if (!lastPerVersion.changes.containsKey(profile)) {
      lastPerVersion.changes.put(profile, new Properties());
    }
    return lastPerVersion.changes.get(profile);
  }
    
  public void setDiffs(Properties diffs) {
    getLastPerVersion().changes.put(profile, diffs);
  }

  private LastPerVersion getLastPerVersion() {
    if (!versionTool.lastPerVersion.containsKey(branch)) {
      versionTool.lastPerVersion.put(this.branch, new LastPerVersion());
    }
    return versionTool.lastPerVersion.get(branch);
  }

  public String getLastCommitId() {
    return getLastPerVersion().lastCommitId;
  }

  public void setLastCommitId(String lastCommitId) {
    getLastPerVersion().lastCommitId = lastCommitId;
  }
}
