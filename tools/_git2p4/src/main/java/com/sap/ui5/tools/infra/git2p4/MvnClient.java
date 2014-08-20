package com.sap.ui5.tools.infra.git2p4;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;


public class MvnClient {

  static boolean execute(File pomPath, String... cmds) throws IOException {
    ProcessBuilder pb = new ProcessBuilder();
    pb.directory(pomPath);
    List<String> args = pb.command();
    args.add("mvn.bat");
    for (String cmd : cmds) {
      args.add(cmd);
    }
    pb.redirectErrorStream(true);
    Log.printf("%s > %s", pb.directory(), pb.command());

    long t0 = System.currentTimeMillis();
    Process process = pb.start();

    BufferedReader r = new BufferedReader(new InputStreamReader(process.getInputStream()));
    String line;
    List<String> lines = new ArrayList<String>();
    while ((line = r.readLine()) != null) {
      lines.add(line);
    }
    r.close();
    try {
      process.waitFor();
    } catch (InterruptedException e) {
      throw new RuntimeException(e);
    }
    int lastExitValue = process.exitValue();
    long t1 = System.currentTimeMillis();
    Log.println("  Process returned exit code " + process.exitValue() + " (" + (t1 - t0) + "ms)");
    Log.println("  Process returned output " + Log.summary(lines));
    if (lastExitValue != 0) {
      throw new IOException("Maven failed with error code " + lastExitValue);
    }
    return lastExitValue == 0;
  }


}
