using BuildMyHome.Models;
using BuildMyHome.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace BuildMyHome.Pages;

public class Design3DModel : PageModel
{
    private readonly ContentStore _store;

    public Design3DModel(ContentStore store)
    {
        _store = store;
    }

    public HouseLayout House { get; private set; } = new();

    public IActionResult OnGet(string id)
    {
        var house = _store.GetHouse(id);
        if (house is null)
        {
            return NotFound();
        }

        House = house;
        return Page();
    }
}
