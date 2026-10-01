using System.Net;
using System.Text;
using BuildMyHome.Models;

namespace BuildMyHome.Services;

public sealed class ReportBuilder
{
    public string BuildHtml(PlanReportRequest plan)
    {
        var sb = new StringBuilder();
        sb.Append("""
            <!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="utf-8" />
            <title>Build My Home — Planning Report</title>
            <style>
              body { font-family: Georgia, serif; color: #1c1917; margin: 32px; background: #f7f1e8; }
              h1 { font-size: 28px; margin-bottom: 4px; }
              h2 { font-size: 18px; border-bottom: 1px solid #d6cbb8; padding-bottom: 6px; }
              .muted { color: #6b6358; font-size: 13px; }
              table { width: 100%; border-collapse: collapse; margin: 12px 0 24px; background: #fff; }
              th, td { border: 1px solid #e2d8c8; padding: 8px 10px; text-align: left; font-size: 13px; }
              th { background: #efe6d6; }
              .note { background: #fff; padding: 12px 16px; border-left: 4px solid #c45c26; }
            </style>
            </head>
            <body>
            """);

        sb.Append($"<h1>{Encode(plan.ProjectName)}</h1>");
        sb.Append($"<p class=\"muted\">Interior planning report generated {DateTime.Now:d MMMM yyyy}. Quantities are approximate and not a construction specification.</p>");

        if (!string.IsNullOrWhiteSpace(plan.LayoutName) || !string.IsNullOrWhiteSpace(plan.StyleName))
        {
            sb.Append($"<p><strong>Layout:</strong> {Encode(plan.LayoutName ?? "Custom")} &nbsp;|&nbsp; <strong>Style:</strong> {Encode(plan.StyleName ?? "Not selected")}</p>");
        }

        sb.Append("<h2>Rooms, quantities, and estimated costs</h2>");
        sb.Append("<table><thead><tr><th>Room</th><th>Size</th><th>Flooring</th><th>Paint</th><th>Furniture</th><th>Paint (L)</th><th>Floor (m²)</th><th>Tiles</th><th>Est. cost</th></tr></thead><tbody>");

        decimal total = 0;
        foreach (var room in plan.Rooms)
        {
            var estimate = room.Estimate;
            var cost = estimate?.TotalCost ?? 0;
            total += cost;
            sb.Append("<tr>");
            sb.Append($"<td>{Encode(room.Name)}</td>");
            sb.Append($"<td>{room.Width:0.##} × {room.Length:0.##} × {room.Height:0.##} m</td>");
            sb.Append($"<td>{Encode(room.Flooring ?? "—")}</td>");
            sb.Append($"<td>{Encode(room.Paint ?? "—")}</td>");
            sb.Append($"<td>{Encode(room.Furniture.Count == 0 ? "—" : string.Join(", ", room.Furniture))}</td>");
            sb.Append($"<td>{estimate?.PaintLitres:0.##}</td>");
            sb.Append($"<td>{estimate?.FloorAreaWithWaste:0.##}</td>");
            sb.Append($"<td>{estimate?.TileCount}</td>");
            sb.Append($"<td>{cost:0.00}</td>");
            sb.Append("</tr>");
        }

        sb.Append("</tbody></table>");
        sb.Append($"<p><strong>Combined estimate:</strong> {total:0.00} (using the local prices you entered)</p>");

        sb.Append("""
            <div class="note">
              <strong>Planning note.</strong> This site helps with interior layout, material comparison, and approximate quantities.
              Structural work, load-bearing changes, electrical, plumbing, and building-permit drawings require a licensed professional.
            </div>
            """);

        if (plan.Notes.Count > 0)
        {
            sb.Append("<h2>Notes</h2><ul>");
            foreach (var note in plan.Notes)
            {
                sb.Append($"<li>{Encode(note)}</li>");
            }
            sb.Append("</ul>");
        }

        sb.Append("</body></html>");
        return sb.ToString();
    }

    private static string Encode(string value) => WebUtility.HtmlEncode(value);
}
