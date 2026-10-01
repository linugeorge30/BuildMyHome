using BuildMyHome.Models;
using BuildMyHome.Services;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace BuildMyHome.Pages;

public class StylesModel : PageModel
{
    private readonly ContentStore _store;

    public StylesModel(ContentStore store)
    {
        _store = store;
    }

    public IReadOnlyList<InteriorStyle> Styles { get; private set; } = [];

    public void OnGet()
    {
        Styles = _store.Styles;
    }
}
