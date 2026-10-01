using BuildMyHome.Models;
using BuildMyHome.Services;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace BuildMyHome.Pages;

public class IndexModel : PageModel
{
    private readonly ContentStore _store;

    public IndexModel(ContentStore store)
    {
        _store = store;
    }

    public IReadOnlyList<HouseLayout> Featured { get; private set; } = [];
    public IReadOnlyList<InteriorStyle> Styles { get; private set; } = [];

    public void OnGet()
    {
        Featured = _store.Houses.Take(4).ToList();
        Styles = _store.Styles;
    }
}
