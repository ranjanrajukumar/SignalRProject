using Microsoft.AspNetCore.Mvc;
using SignalRProject1.Models;

namespace SignalRProject1.Hubs
{
    public class HomeController : Controller
    {
        private readonly SignalingHub signalingHub;

        public HomeController(SignalingHub signalingHub)
        {
            this.signalingHub = signalingHub;
        }

        public IActionResult ConnectedUsers()
        {
            var connectedUsers = SignalingHub.connectedUsers;
            return View(connectedUsers);
        }
    }
}
