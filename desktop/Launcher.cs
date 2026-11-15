using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

internal static class Launcher
{
    private const string Site = "https://arpitagarwala.com/";

    [STAThread]
    private static void Main()
    {
        try
        {
            var edge = FindEdge();
            if (edge == null)
            {
                MessageBox.Show("Install Microsoft Edge to use this launcher, or install the web app from arpitagarwala.com.",
                    "Arpit Agarwala", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }

            // Use the regular Edge profile so website sessions and Google sign-in work.
            Process.Start(new ProcessStartInfo(edge, "--app=" + Site + " --start-maximized")
            {
                UseShellExecute = false
            });
        }
        catch (System.ComponentModel.Win32Exception)
        {
            MessageBox.Show("The launcher could not open Edge. You can open arpitagarwala.com in your browser.",
                "Arpit Agarwala", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }

    private static string FindEdge()
    {
        var roots = new[] {
            Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86),
            Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles),
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData)
        };
        foreach (var root in roots)
        {
            if (String.IsNullOrEmpty(root)) continue;
            var executable = Path.Combine(root, "Microsoft", "Edge", "Application", "msedge.exe");
            if (File.Exists(executable)) return executable;
        }
        return null;
    }
}
