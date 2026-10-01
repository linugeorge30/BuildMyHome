using BuildMyHome.Models;
using BuildMyHome.Services;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace BuildMyHome.Pages;

public class ReportModel : PageModel
{
    private readonly ContentStore _store;

    public ReportModel(ContentStore store)
    {
        _store = store;
    }

    public IReadOnlyList<Material> Materials { get; private set; } = [];
    public IReadOnlyList<InteriorStyle> Styles { get; private set; } = [];

    public void OnGet()
    {
        Materials = _store.Materials;
        Styles = _store.Styles;
    }
}
