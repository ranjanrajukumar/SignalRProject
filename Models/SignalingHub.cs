using Microsoft.AspNetCore.SignalR;

namespace SignalRProject1.Models
{
    public class SignalingHub:Hub
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

        public async Task StartVideoChat()
        {
            await Clients.Others.SendAsync("ReceiveVideoOffer", "offer");
        }

        public async Task SendVideoAnswer(string answer)
        {
            await Clients.Others.SendAsync("ReceiveVideoAnswer", answer);
        }

        public async Task SendNewICECandidate(string candidate)
        {
            await Clients.Others.SendAsync("ReceiveNewICECandidate", candidate);
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
