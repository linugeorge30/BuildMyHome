using BuildMyHome.Models;
using BuildMyHome.Services;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace BuildMyHome.Pages;

public class BudgetModel : PageModel
{
    private readonly ContentStore _store;

    public BudgetModel(ContentStore store)
    {
        _store = store;
    }

    public IReadOnlyList<Material> Materials { get; private set; } = [];

    public void OnGet()
    {
        Materials = _store.Materials;
    }
}
