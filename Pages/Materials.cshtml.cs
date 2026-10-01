using BuildMyHome.Models;
using BuildMyHome.Services;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace BuildMyHome.Pages;

public class MaterialsModel : PageModel
{
    private readonly ContentStore _store;

    public MaterialsModel(ContentStore store)
    {
        _store = store;
    }

    public IReadOnlyList<Material> Materials { get; private set; } = [];
    public IReadOnlyList<string> Categories { get; private set; } = [];

    public void OnGet()
    {
        Materials = _store.Materials;
        Categories = _store.Materials.Select(m => m.Category).Distinct(StringComparer.OrdinalIgnoreCase).ToList();
    }
}
