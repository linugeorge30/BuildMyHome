using System.Text.Json;
using BuildMyHome.Models;

namespace BuildMyHome.Services;

public sealed class ContentStore
{
    private readonly Lazy<SiteContent> _content;

    public ContentStore(IWebHostEnvironment env)
    {
        var dataPath = Path.Combine(env.ContentRootPath, "Data");
        _content = new Lazy<SiteContent>(() => Load(dataPath));
    }

    public IReadOnlyList<HouseLayout> Houses => _content.Value.Houses;
    public IReadOnlyList<Material> Materials => _content.Value.Materials;
    public IReadOnlyList<InteriorStyle> Styles => _content.Value.Styles;
    public IReadOnlyList<FurnitureItem> Furniture => _content.Value.Furniture;
    public IReadOnlyList<ChecklistItem> Checklist => _content.Value.Checklist;

    public HouseLayout? GetHouse(string id) =>
        Houses.FirstOrDefault(h => h.Id.Equals(id, StringComparison.OrdinalIgnoreCase));

    public InteriorStyle? GetStyle(string id) =>
        Styles.FirstOrDefault(s => s.Id.Equals(id, StringComparison.OrdinalIgnoreCase));

    public IReadOnlyList<HouseLayout> HousesByCategory(string? category)
    {
        if (string.IsNullOrWhiteSpace(category) || category == "all")
        {
            return Houses;
        }

        return Houses
            .Where(h => h.Category.Equals(category, StringComparison.OrdinalIgnoreCase))
            .ToList();
    }

    public IReadOnlyList<Material> MaterialsByCategory(string? category)
    {
        if (string.IsNullOrWhiteSpace(category) || category == "all")
        {
            return Materials;
        }

        return Materials
            .Where(m => m.Category.Equals(category, StringComparison.OrdinalIgnoreCase))
            .ToList();
    }

    private static SiteContent Load(string dataPath)
    {
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            ReadCommentHandling = JsonCommentHandling.Skip,
            AllowTrailingCommas = true
        };

        return new SiteContent
        {
            Houses = Read<List<HouseLayout>>(dataPath, "houses.json", options),
            Materials = Read<List<Material>>(dataPath, "materials.json", options),
            Styles = Read<List<InteriorStyle>>(dataPath, "styles.json", options),
            Furniture = Read<List<FurnitureItem>>(dataPath, "furniture.json", options),
            Checklist = Read<List<ChecklistItem>>(dataPath, "checklist.json", options)
        };
    }

    private static T Read<T>(string dataPath, string fileName, JsonSerializerOptions options) where T : new()
    {
        var path = Path.Combine(dataPath, fileName);
        if (!File.Exists(path))
        {
            return new T();
        }

        var json = File.ReadAllText(path);
        return JsonSerializer.Deserialize<T>(json, options) ?? new T();
    }

    private sealed class SiteContent
    {
        public List<HouseLayout> Houses { get; set; } = [];
        public List<Material> Materials { get; set; } = [];
        public List<InteriorStyle> Styles { get; set; } = [];
        public List<FurnitureItem> Furniture { get; set; } = [];
        public List<ChecklistItem> Checklist { get; set; } = [];
    }
}
