namespace BuildMyHome.Models;

public sealed class HouseLayout
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Category { get; set; } = "";
    public string Tagline { get; set; } = "";
    public string Description { get; set; } = "";
    public decimal TotalAreaSqm { get; set; }
    public decimal PlanWidth { get; set; }
    public decimal PlanDepth { get; set; }
    public int Bedrooms { get; set; }
    public int Bathrooms { get; set; }
    public IList<string> Highlights { get; set; } = new List<string>();
    public IList<LayoutRoom> Rooms { get; set; } = new List<LayoutRoom>();
}

public sealed class LayoutRoom
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Purpose { get; set; } = "";
    public decimal Width { get; set; }
    public decimal Length { get; set; }
    public decimal Height { get; set; } = 2.7m;
    public decimal X { get; set; }
    public decimal Y { get; set; }
    public string Accent { get; set; } = "#c4a35a";
}

public sealed class Material
{
    public string Id { get; set; } = "";
    public string Category { get; set; } = "";
    public string Name { get; set; } = "";
    public string Appearance { get; set; } = "";
    public string Maintenance { get; set; } = "";
    public string Durability { get; set; } = "";
    public string BestFor { get; set; } = "";
    public string Unit { get; set; } = "m²";
    public decimal TypicalCoverage { get; set; }
    public string Swatch { get; set; } = "#888888";
    public string SwatchSecondary { get; set; } = "#cccccc";
    public int DurabilityScore { get; set; }
    public int MaintenanceEase { get; set; }
    public decimal SuggestedPrice { get; set; }
}

public sealed class InteriorStyle
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Summary { get; set; } = "";
    public string Description { get; set; } = "";
    public IList<string> Palette { get; set; } = new List<string>();
    public IList<string> PaletteNames { get; set; } = new List<string>();
    public IList<string> Pairings { get; set; } = new List<string>();
    public string Mood { get; set; } = "";
}

public sealed class FurnitureItem
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Category { get; set; } = "";
    public decimal Width { get; set; }
    public decimal Depth { get; set; }
    public decimal Height { get; set; } = 0.8m;
    public string Color { get; set; } = "#6b4f3a";
}

public sealed class ChecklistItem
{
    public string Id { get; set; } = "";
    public string Phase { get; set; } = "";
    public string Title { get; set; } = "";
    public string Detail { get; set; } = "";
}

public sealed class EstimateInput
{
    public decimal Width { get; set; }
    public decimal Length { get; set; }
    public decimal Height { get; set; } = 2.7m;
    public int DoorCount { get; set; } = 1;
    public int WindowCount { get; set; } = 1;
    public decimal WastePercent { get; set; } = 10m;
    public decimal Coats { get; set; } = 2m;
    public decimal PaintCoveragePerLitre { get; set; } = 11m;
    public decimal TileWidthCm { get; set; } = 60m;
    public decimal TileLengthCm { get; set; } = 60m;
    public decimal FlooringCoveragePerPack { get; set; } = 2.16m;
    public decimal PaintPrice { get; set; }
    public decimal FlooringPrice { get; set; }
    public decimal TilePrice { get; set; }
}

public sealed class EstimateResult
{
    public decimal FloorArea { get; set; }
    public decimal FloorAreaWithWaste { get; set; }
    public decimal WallArea { get; set; }
    public decimal PaintLitres { get; set; }
    public int TileCount { get; set; }
    public int FlooringPacks { get; set; }
    public decimal PaintCost { get; set; }
    public decimal FlooringCost { get; set; }
    public decimal TileCost { get; set; }
    public decimal TotalCost { get; set; }
}

public sealed class PlanReportRequest
{
    public string ProjectName { get; set; } = "My home plan";
    public string? StyleName { get; set; }
    public string? LayoutName { get; set; }
    public IList<PlanRoomSnapshot> Rooms { get; set; } = new List<PlanRoomSnapshot>();
    public IList<string> Notes { get; set; } = new List<string>();
}

public sealed class PlanRoomSnapshot
{
    public string Name { get; set; } = "";
    public decimal Width { get; set; }
    public decimal Length { get; set; }
    public decimal Height { get; set; }
    public string? Flooring { get; set; }
    public string? Paint { get; set; }
    public IList<string> Furniture { get; set; } = new List<string>();
    public EstimateResult? Estimate { get; set; }
}
