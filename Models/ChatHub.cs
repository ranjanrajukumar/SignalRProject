using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace SignalRProject1.Models
{
    public class ChatHub : Hub
    {
        public static List<string> connectedUsers = new List<string>();

        public override async Task OnConnectedAsync()
        {
            connectedUsers.Add(Context.ConnectionId);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            connectedUsers.Remove(Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        public async Task StartVideoChat(string targetUserId,string offer)
        {
            //await Clients.Others.SendAsync("ReceiveVideoOffer", "offer");
            await Clients.All.SendAsync("ReceiveVideoOffer", targetUserId, offer);

        }
    

        public async Task SendVideoAnswer(string targetUserId, string answer)
        {
            await Clients.All.SendAsync("ReceiveVideoAnswer", targetUserId, answer);
        }

        public async Task SendNewICECandidate(string targetUserId,string candidate)
        {
            await Clients.All.SendAsync("ReceiveNewICECandidate", targetUserId, candidate);
        }

        public async Task JoinVideoChat(string targetUserId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, targetUserId);
        }

        public async Task LeaveVideoChat(string targetUserId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, targetUserId);
        }
    }
}
