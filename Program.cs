using System.Text;
using System.Text.Json;
using BuildMyHome.Models;
using BuildMyHome.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.AddSingleton<ContentStore>();
builder.Services.AddSingleton<QuantityEstimator>();
builder.Services.AddSingleton<ReportBuilder>();
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.SerializerOptions.PropertyNameCaseInsensitive = true;
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

var api = app.MapGroup("/api");
api.MapGet("/houses", (ContentStore store) => Results.Json(store.Houses));
api.MapGet("/houses/{id}", (string id, ContentStore store) =>
{
    var house = store.GetHouse(id);
    return house is null ? Results.NotFound() : Results.Json(house);
});
api.MapGet("/materials", (ContentStore store, string? category) =>
    Results.Json(store.MaterialsByCategory(category)));
api.MapGet("/styles", (ContentStore store) => Results.Json(store.Styles));
api.MapGet("/furniture", (ContentStore store) => Results.Json(store.Furniture));
api.MapGet("/checklist", (ContentStore store) => Results.Json(store.Checklist));
api.MapPost("/estimate", (EstimateInput input, QuantityEstimator estimator) =>
    Results.Json(estimator.Calculate(input)));
api.MapPost("/report", (PlanReportRequest plan, ReportBuilder reports) =>
{
    var html = reports.BuildHtml(plan);
    return Results.File(Encoding.UTF8.GetBytes(html), "text/html; charset=utf-8", "build-my-home-plan.html");
});

app.MapStaticAssets();
app.MapRazorPages().WithStaticAssets();

app.Run();
