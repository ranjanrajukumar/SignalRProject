using Microsoft.AspNetCore.Mvc;

namespace SignalRProject1.Hubs
{
    public class VideoChatController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
