using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BrowserMonitor2
{
    class Statistics
    {
        static double[][] tValues95 = null;
        static double[][] tValues99 = null;

        static Statistics()
        {
            if (tValues95 == null) {
                initTValues();
            }
        }

        private static void initTValues() {
            tValues95 = new double[14][];
            tValues99 = new double[16][]; // needs more points for similar accuracy

            tValues95[0] = new[] { 1, 12.71 };
            tValues95[1] = new[] { 2, 4.303 };
            tValues95[2] = new[] { 3, 3.182 };
            tValues95[3] = new[] { 4, 2.776 };
            tValues95[4] = new[] { 10, 2.228 };
            tValues95[5] = new[] { 15, 2.131 };
            tValues95[6] = new[] { 20, 2.086 };
            tValues95[7] = new[] { 30, 2.042 };
            tValues95[8] = new[] { 40, 2.021 };
            tValues95[9] = new[] { 50, 2.009 };
            tValues95[10] = new[] { 100, 1.984 };
            tValues95[11] = new[] { 200, 1.972 };
            tValues95[12] = new[] { 1000, 1.962 };
            tValues95[13] = new[] { 99999999999, 1.960 };

            tValues99[0] = new[] { 1, 63.66 };
            tValues99[1] = new[] { 2, 9.925 };
            tValues99[2] = new[] { 3, 5.841 };
            tValues99[3] = new[] { 4, 4.604 };
            tValues99[4] = new[] { 10, 3.169 };
            tValues99[5] = new[] { 15, 2.947 };
            tValues99[6] = new[] { 20, 2.845 };
            tValues99[7] = new[] { 30, 2.750 };
            tValues99[8] = new[] { 40, 2.704 };
            tValues99[9] = new[] { 50, 2.678 };
            tValues99[10] = new[] { 70, 2.648 };
            tValues99[11] = new[] { 100, 2.626 };
            tValues99[12] = new[] { 200, 2.601 };
            tValues99[13] = new[] { 500, 2.586 };
            tValues99[14] = new[] { 1000, 2.581 };
            tValues99[15] = new[] { 99999999999, 2.576 };
        }

        public static string GetStats(double[] times)
        {
            string result = "";
            int count = times.Length;
            Array.Sort(times);


            // calculate the simple average
            double sum = 0;
            for (int i = 0; i < count; i++)
            {
                sum += times[i];
            }
            double average = sum / count;
            result += "Average: " + Math.Round(average, 2).ToString() + " ms" + Environment.NewLine;


            // calculate the standard deviation
            double stdDeviation = 0;
            if (count > 1)
            {
                double devsqrs = 0;
                for (int i = 0; i < count; i++)
                {
                    devsqrs += (times[i] - average) * (times[i] - average);
                }
                double variance = devsqrs / (count - 1);
                stdDeviation = Math.Sqrt(variance);
            }
            result += " Std deviation: " + Math.Round(stdDeviation,2).ToString() + " ms" + Environment.NewLine;


            // calculate the 95% and 99% confidence intervals
            double stdError = stdDeviation / Math.Sqrt(count);
            double tValue95 = getTValue(0.95, count-1);
            double tValue99 = getTValue(0.99, count-1);
            double delta95 = tValue95 * stdError;
            double delta99 = tValue99 * stdError;
            String confInter95 = Math.Round(average - delta95, 1).ToString() + "; " + Math.Round(average + delta95,1).ToString();
            String confInter99 = Math.Round(average - delta99, 1).ToString() + "; " + Math.Round(average + delta99,1).ToString();
            result += " 95% conf. interval: [" + confInter95 + "] (=" + Math.Round(2 * delta95, 2) + ")" + Environment.NewLine;
            result += " 99% conf. interval: [" + confInter99 + "] (=" + Math.Round(2 * delta99, 2) + ")" + Environment.NewLine;


            // calculate the median
            int medianPos = (int)Math.Floor((double)(count + 1) / (double)2);
            result += "Median: " + times[Math.Min(medianPos, count - 1)].ToString() + " ms" + Environment.NewLine;


            // calculate the "fixed" average, which removes the fastest and slowest 20%
            double[] fixedTimes = RemoveOutliers(times, 20, 20);
            double fixedSum = 0;
            for (int i = 0; i < fixedTimes.Length; i++)
            {
                fixedSum += fixedTimes[i];
            }
            double fixedAverage = fixedSum / fixedTimes.Length;
            result += "Fixed Average: " + Math.Round(fixedAverage, 2).ToString() + " ms" + Environment.NewLine;


            // calculate the "aku" average, which removes the fastest 20% and the slowest 60%
            double[] akuTimes = RemoveOutliers(times, 20, 60);
            double akuSum = 0;
            for (int i = 0; i < akuTimes.Length; i++)
            {
                akuSum += akuTimes[i];
            }
            double akuAverage = akuSum / akuTimes.Length;
            result += "'AKU' Average: " + Math.Round(akuAverage, 2).ToString() + " ms" + Environment.NewLine;

            return result;
        }

        private static double getTValue(double p, int count)
        {
            double t = 1;
            double[][] tValues;
            if (p == 0.95)
            {
                tValues = tValues95;
            }
            else if (p == 0.99)
            {
                tValues = tValues99;
            }
            else
            {
                throw new Exception("unsupported p-value for T-value calculation: " + p);
            }

            double lastTValue = -1;
            double lastCount = -1;
            for (int i = 0; i < tValues.Length; i++)
            {
                if (tValues[i][0] < count) // not yet reached... save value in case we need to interpolate because the next existing count is too high
                {
                    lastCount = tValues[i][0];
                    lastTValue = tValues[i][1];
                }
                else if (tValues[i][0] == count) // exact hit
                {
                    return tValues[i][1];
                }
                else // tValues[i][0] > count   // so we jumped beyond the desired value... let's interpolate...
                {
                    double valueBelow = lastTValue;
                    double valueAbove = tValues[i][1];
                    double diff = valueBelow - valueAbove; // this is a positive number, the difference between the border T values
                    double frac = (count - lastCount) / (tValues[i][0] - lastCount); // how far are we into the not covered interval?
                    return valueBelow - (diff * frac);
                }
            }
            
            return t;
        }

        private static double[] RemoveOutliers(double[] times, int fastestPercent, int slowestPercent)
        {
            int tooFastCount = (int)Math.Floor((double)times.Length * (fastestPercent / (double)100));
            int tooSlowCount = (int)Math.Floor((double)times.Length * (slowestPercent / (double)100));

            int resultCount = times.Length - tooFastCount - tooSlowCount;
            double[] result = new double[0];
            if (resultCount > 0)
            {
                // fill the result array
                result = new double[resultCount];
                for (int i = tooFastCount; i < times.Length - tooSlowCount; i++)
                {
                    result[i - tooFastCount] = times[i];
                }
            }
            return result;
        }
    }
}
