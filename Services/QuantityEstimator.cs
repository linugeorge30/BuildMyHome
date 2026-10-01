using BuildMyHome.Models;

namespace BuildMyHome.Services;

public sealed class QuantityEstimator
{
    public EstimateResult Calculate(EstimateInput input)
    {
        var width = Math.Max(0, input.Width);
        var length = Math.Max(0, input.Length);
        var height = input.Height > 0 ? input.Height : 2.7m;
        var waste = input.WastePercent < 0 ? 0 : input.WastePercent / 100m;
        var coats = input.Coats > 0 ? input.Coats : 2m;
        var coverage = input.PaintCoveragePerLitre > 0 ? input.PaintCoveragePerLitre : 11m;

        var floorArea = decimal.Round(width * length, 2);
        var floorWithWaste = decimal.Round(floorArea * (1 + waste), 2);

        var wallArea = 2m * (width + length) * height;
        wallArea -= input.DoorCount * 1.8m * 0.9m;
        wallArea -= input.WindowCount * 1.2m * 1.2m;
        wallArea = Math.Max(0, decimal.Round(wallArea, 2));

        var paintLitres = coverage == 0 ? 0 : decimal.Round((wallArea * coats) / coverage, 2);

        var tileW = input.TileWidthCm > 0 ? input.TileWidthCm / 100m : 0.6m;
        var tileL = input.TileLengthCm > 0 ? input.TileLengthCm / 100m : 0.6m;
        var tileArea = Math.Max(0.01m, tileW * tileL);
        var tileCount = (int)Math.Ceiling((double)(floorWithWaste / tileArea));

        var packCoverage = input.FlooringCoveragePerPack > 0 ? input.FlooringCoveragePerPack : 2.16m;
        var flooringPacks = (int)Math.Ceiling((double)(floorWithWaste / packCoverage));

        var paintCost = decimal.Round(paintLitres * input.PaintPrice, 2);
        var flooringCost = decimal.Round(floorWithWaste * input.FlooringPrice, 2);
        var tileCost = decimal.Round(floorWithWaste * input.TilePrice, 2);

        return new EstimateResult
        {
            FloorArea = floorArea,
            FloorAreaWithWaste = floorWithWaste,
            WallArea = wallArea,
            PaintLitres = paintLitres,
            TileCount = tileCount,
            FlooringPacks = flooringPacks,
            PaintCost = paintCost,
            FlooringCost = flooringCost,
            TileCost = tileCost,
            TotalCost = decimal.Round(paintCost + flooringCost, 2)
        };
    }
}
