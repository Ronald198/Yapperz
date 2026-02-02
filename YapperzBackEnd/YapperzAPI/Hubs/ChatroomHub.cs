using Microsoft.AspNetCore.SignalR;
using YapperzAPI.Dtos.Chatroom;
using YapperzAPI.Dtos.Users;
using YapperzAPI.Models;
using YapperzAPI.Services.Interfaces;

namespace YapperzAPI.Hubs
{
    public class ChatroomHub: Hub
    {
        private readonly IChatroomService _chatroomService;
        private readonly IUsersService _usersService;
        private readonly Dictionary<string, int> connections;

        public ChatroomHub(IChatroomService chatroomService, IUsersService usersService)
        {
            _chatroomService = chatroomService;
            _usersService = usersService;
            connections = new Dictionary<string, int>();
        }

        public async Task JoinRoomGroup(string roomCode, int userId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);
            Console.WriteLine($"User {userId} joined room {roomCode} with connection ID {Context.ConnectionId}");
            connections[Context.ConnectionId] = userId;
            Console.WriteLine(connections[Context.ConnectionId]);
        }

        // You can also add a method to leave a group
        public async Task LeaveRoomGroup(string roomCode)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomCode);
            connections.Remove(Context.ConnectionId);
        }

        public async Task SendMessage(string roomCode, int userId, string message)
        {
            await Clients.Group(roomCode).SendAsync("ReceiveMessage", userId, message);
        }

        public async Task NotifyNewPlayerJoined(string roomCode, int userId)
        {
            var users = await _chatroomService.GetUsersByRoomCodeAsync(roomCode);
            var user = users.FirstOrDefault(u => u.Id == userId);

            if (user is null)
            {
                return;
            }

            await Clients.Group(roomCode).SendAsync("NewPlayerJoined", user);
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var userId = GetUserIdFromConnectionId(Context.ConnectionId);

            if (userId is null)
            {
                await base.OnDisconnectedAsync(exception);
                return;
            }
    
            User? user = await _usersService.GetByIdAsync((int)userId);
            ChatroomDto? chatroomDto = await _usersService.GetUsersChatroomAsync((int)userId);

            if (chatroomDto != null && user != null)
            {
                await Clients.Group(chatroomDto.Code).SendAsync("PlayerLeft", chatroomDto.Code, user.DisplayName);
            }

            await base.OnDisconnectedAsync(exception);
        }

        private int? GetUserIdFromConnectionId(string connectionId)
        {
            if (connections.ContainsKey(connectionId))
            {
                return connections[connectionId];
            }
            return null;
        }
    }
}
