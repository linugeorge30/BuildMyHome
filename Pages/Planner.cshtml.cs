using BuildMyHome.Models;
using BuildMyHome.Services;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace BuildMyHome.Pages;

public class PlannerModel : PageModel
{
    private readonly ContentStore _store;

    public PlannerModel(ContentStore store)
    {
        _store = store;
    }

    public IReadOnlyList<FurnitureItem> Furniture { get; private set; } = [];
    public IReadOnlyList<Material> Flooring { get; private set; } = [];
    public IReadOnlyList<Material> Paints { get; private set; } = [];
    public IReadOnlyList<HouseLayout> Houses { get; private set; } = [];

    public void OnGet()
    {
        Furniture = _store.Furniture;
        Flooring = _store.MaterialsByCategory("flooring");
        Paints = _store.MaterialsByCategory("paint");
        Houses = _store.Houses;
    }
}
