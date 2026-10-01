using BuildMyHome.Models;
using BuildMyHome.Services;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace BuildMyHome.Pages;

public class ChecklistPageModel : PageModel
{
    private readonly ContentStore _store;

    public ChecklistPageModel(ContentStore store)
    {
        _store = store;
    }

    public IReadOnlyList<ChecklistItem> Items { get; private set; } = [];
    public IReadOnlyList<string> Phases { get; private set; } = [];

    public void OnGet()
    {
        Items = _store.Checklist;
        Phases = _store.Checklist.Select(i => i.Phase).Distinct().ToList();
    }
}
