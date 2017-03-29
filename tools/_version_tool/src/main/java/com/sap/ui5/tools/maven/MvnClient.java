package com.sap.ui5.tools.maven;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintStream;
import java.util.List;
import java.util.Scanner;

public class MvnClient {
  
  public boolean verbose = false;
  private String latestOutput = "";

  public boolean execute(File pomPath, String... cmds) throws IOException {
    ProcessBuilder pb = new ProcessBuilder();
    pb.directory(pomPath);
    List<String> args = pb.command();
    args.add("mvn.bat");
    if (verbose){
      args.add("-X");
    }
    for (String cmd : cmds) {
      args.add(cmd);
    }
    pb.redirectErrorStream(true);
    System.out.printf("%s > %s", pb.directory(), pb.command());

    long t0 = System.currentTimeMillis();
    Process process = pb.start();
    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    inheritIO(process.getInputStream(), System.out, new PrintStream(baos));
    try {
      process.waitFor();
    } catch (InterruptedException e) {
      throw new RuntimeException(e);
    }
    int lastExitValue = process.exitValue();
    long t1 = System.currentTimeMillis();
    System.out.println("  Process returned exit code " + process.exitValue() + " (" + (t1 - t0) + "ms)");
    if (lastExitValue != 0) {
      throw new IOException("Maven failed with error code " + lastExitValue);
    }
    latestOutput = baos.toString();
    return lastExitValue == 0;
  }

  private static void inheritIO(final InputStream src, final PrintStream ... dests) {
    new Thread(new Runnable() {
        public void run() {
            Scanner sc = new Scanner(src);
            while (sc.hasNextLine()) {
              String nextLine = sc.nextLine();
              for (PrintStream dest: dests){
                dest.println(nextLine);
              }
            }
        }
    }).start();
  }

  public String getLatestOutput() {
    return latestOutput;
  }
  
}
