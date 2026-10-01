using BuildMyHome.Models;
using BuildMyHome.Services;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace BuildMyHome.Pages;

public class CalculatorsModel : PageModel
{
    private readonly ContentStore _store;

    public CalculatorsModel(ContentStore store)
    {
        _store = store;
    }

    public IReadOnlyList<Material> Paints { get; private set; } = [];
    public IReadOnlyList<Material> Flooring { get; private set; } = [];

    public void OnGet()
    {
        Paints = _store.MaterialsByCategory("paint");
        Flooring = _store.MaterialsByCategory("flooring");
    }
}
