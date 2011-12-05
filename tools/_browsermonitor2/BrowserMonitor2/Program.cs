using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Windows.Forms;

namespace BrowserMonitor2
{
    static class Program
    {
        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            BrowserMonitorForm form = new BrowserMonitorForm();

            
            // dummy args!
            if (args == null || args.Length == 0)
            {
                /*  args = new string[7];
                  args[0] = "-url";
                  args[1] = "http://wdfd00183770a:8888/uilib-sample/test-resources/sap/ui/commons/profiling/TestPageCommons.html?sap-ui-theme=sap_platinum";
                  args[2] = "-runs";
                  args[3] = "5";
                  args[4] = "-url";
                  args[5] = "http://wdfd00183770a:8888/uilib-sample/test-resources/sap/ui/commons/profiling/TestPageCommons.html?sap-ui-theme=sap_hcb";
                  args[6] = "-auto";
                  */

                /*
                   args = new string[9];
                  args[0] = "-url";
                  args[1] = "http://wdfd00183770a:8888/uilib-sample/test-resources/sap/ui/commons/profiling/TestPageCommons.html?sap-ui-theme=sap_platinum";
                  args[2] = "-runs";
                  args[3] = "20";
                  args[4] = "-url";
                  args[5] = "http://wdfd00183770a:8888/uilib-sample/test-resources/sap/ui/commons/profiling/TestPageCommons.html?sap-ui-theme=sap_hcb";
                  args[6] = "-auto";
                  args[7] = "-outurl";
                  args[8] = "http://localhost:8888/performance-webm/measurements";
                 */
                
                /*
                args = new string[8];
                args[0] = "-url";
                args[1] = "http://wdfd00183770a:8888/uilib-sample/test-resources/sap/ui/commons/profiling/TestPageCommons_new.html?sap-ui-theme=sap_platinum";
                args[2] = "-runs";
                args[3] = "10";
                args[4] = "-dummy";
                args[5] = "-dummy";
                args[6] = "-outurl";
                args[7] = "http://localhost:8888/performance-webm/measurements";
                 */

                /*
                args = new string[2];
                args[0] = "-url";
                args[1] = "http://wdfd00183770a:8888/uilib-sample/test-resources/sap/ui/commons/profiling/TestPageCommons.html?sap-ui-theme=sap_platinum";
                */

                args = new string[4];
                args[0] = "-url";
                args[1] = "http://vephxinfra.dhcp.wdf.sap.corp:8080/uilib-sample/test-resources/sap/ui/commons/profiling/TestPageCommons.html?sap-ui-theme=sap_platinum";
                args[2] = "-runs";
                args[3] = "30";

                /*
                args = new string[6];
                args[0] = "-url";
                args[1] = "http://vephxinfra.dhcp.wdf.sap.corp:8080/uilib-sample/test-resources/sap/ui/commons/profiling/TestPageCommons.html?sap-ui-theme=sap_platinum";
                args[2] = "-runs";
                args[3] = "20";
                args[4] = "-outurl";
                args[5] = "http://vephxinfra.dhcp.wdf.sap.corp:8080/performance/measurements";
                args[4] = "-dummy";
                args[5] = "-dummy";
               */
                /*
                args = new string[2];
                args[0] = "-outurl";
                args[1] = "http://localhost:8888/PerfServlet/measurements";
                */
            }

            // initialize the form according to command line parameters
            if (args.Length > 0)
            {
                for (int i = 0; i < args.Length; i++)
                {
                    string paramName = args[i];

                    // parameter setting the file name for reporting the results. The file must not exist.
                    if (paramName == "-out")
                    {
                        if (i + 1 >= args.Length)
                        {
                            Console.WriteLine("ERROR: outfile missing after command line parameter '-out'. Exiting.");
                            System.Environment.Exit(-1);
                        }
                        else if (args[i + 1].StartsWith("-"))
                        {
                            Console.WriteLine("ERROR: outfile must be given given after command line parameter '-out'. Currently given: '"
                                   + args[i + 1] + "' Exiting.");
                            System.Environment.Exit(-1);
                        }
                        else
                        {
                            FileInfo outFile = new FileInfo(args[i + 1]);
                            if (outFile.Exists)
                            {
                                Console.WriteLine("ERROR: outfile does already exist: '" + args[i + 1] + "'. Ignoring.");
                            }
                            else
                            {
                                TextWriter outWriter = new StreamWriter(args[i + 1]);
                                form.SetWriter(outWriter);
                            }
                            i++;
                        }
                    }

                    // parameter setting a URL for testing
                    else if (paramName == "-url")
                    {
                        if (i + 1 >= args.Length)
                        {
                            Console.WriteLine("ERROR: URL missing after command line parameter '-url'. Exiting.");
                            System.Environment.Exit(-1);
                        }
                        else if (args[i + 1].StartsWith("-"))
                        {
                            Console.WriteLine("ERROR: URL must be given given after command line parameter '-url'. Currently given: '"
                                   + args[i + 1] + "'. Exiting.");
                            System.Environment.Exit(-1);
                        }
                        else
                        {
                            Uri url = new Uri(args[i + 1]);
                            form.AddURL(url);
                            i++;
                        }
                    }

                    // parameter setting a URL for reporting the results
                    else if (paramName == "-outurl")
                    {
                        if (i + 1 >= args.Length)
                        {
                            Console.WriteLine("ERROR: URL missing after command line parameter '-outurl'. Exiting.");
                            System.Environment.Exit(-1);
                        }
                        else if (args[i + 1].StartsWith("-"))
                        {
                            Console.WriteLine("ERROR: URL must be given given after command line parameter '-outurl'. Currently given: '"
                                   + args[i + 1] + "'. Exiting.");
                            System.Environment.Exit(-1);
                        }
                        else
                        {
                            Uri url = new Uri(args[i + 1]);
                            form.AddOutputURL(url);
                            i++;
                        }
                    }


                    // parameter setting the repeat count
                    else if (paramName == "-runs")
                    {
                        if (i + 1 >= args.Length)
                        {
                            Console.WriteLine("ERROR: count missing after command line parameter '-runs'. Exiting.");
                            System.Environment.Exit(-1);
                        }
                        else if (args[i + 1].StartsWith("-"))
                        {
                            Console.WriteLine("ERROR: count must be given given after command line parameter '-runs'. Currently given: '"
                                   + args[i + 1] + "'. Exiting.");
                            System.Environment.Exit(-1);
                        }
                        else
                        {
                            int runs = int.Parse(args[i + 1]);
                            if (runs > 0)
                            {
                                form.SetRepeatCount(runs);
                                i++;
                            }
                            else
                            {
                                Console.WriteLine("ERROR: run count must be > 0. Currently given: '" + runs + "'. Exiting.");
                                System.Environment.Exit(-1);
                            }
                        }
                    }

                    else if (paramName == "-auto") // output some documentation
                    {
                        form.SetAutoRun(true);
                    }

                    else if (paramName == "-dummy") // output some documentation
                    {
                        // ignore; this parameter is used as a placeholder for temporarily disabled parameters in a parameter array
                    }


                    else if (paramName == "-help") // output some documentation
                    {
                        Console.WriteLine("Phoenix Browser Performance Monitor");
                        Console.WriteLine("Supported parameters (all parameters are optional):");
                        Console.WriteLine();
                        Console.WriteLine(" -url <url>      Use the given URL (which may not contain spaces and needs to");
                        Console.WriteLine("                 be written without quotes). This parameter may in the future");
                        Console.WriteLine("                 be used several times to schedule different URLs.");
                        Console.WriteLine();
                        Console.WriteLine(" -runs <n>       Repeat each performance analysis <n> times (n must be > 0).");
                        Console.WriteLine("                 Default is '10'.");
                        Console.WriteLine();
                        Console.WriteLine(" -outfile <name> Write the measurement results to the given file (which must");
                        Console.WriteLine("                 not exist before). Default is 'do not write to a file'.");
                        Console.WriteLine("                 NOTE: the file name may not contain spaces as of now!");
                        Console.WriteLine();
                        Console.WriteLine(" -outurl <url>   Send the measurement results to the given URL");
                        Console.WriteLine();
                        Console.WriteLine(" -auto           Start the performance runs automatically and quit afterwards.");
                        Console.WriteLine("                 (Otherwise the other parameters are just filled into the");
                        Console.WriteLine("                 respective UI fields.) Default is 'off'.");
                        System.Environment.Exit(-1);
                    }

                    else
                    {
                        Console.WriteLine("ERROR: unknown commandline parameter: '" + paramName + "'. Use '-help' to get a list of supported parameters. Exiting.");
                        System.Environment.Exit(-1);
                    }
                }
            }

            Application.Run(form);
        }
    }
}
