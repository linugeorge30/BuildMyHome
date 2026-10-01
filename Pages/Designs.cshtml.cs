using BuildMyHome.Models;
using BuildMyHome.Services;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace BuildMyHome.Pages;

public class DesignsModel : PageModel
{
    private readonly ContentStore _store;

    public DesignsModel(ContentStore store)
    {
        _store = store;
    }

    public string Category { get; private set; } = "all";
    public IReadOnlyList<HouseLayout> Houses { get; private set; } = [];

    public void OnGet(string? category)
    {
        Category = string.IsNullOrWhiteSpace(category) ? "all" : category;
        Houses = _store.HousesByCategory(Category);
    }
}
