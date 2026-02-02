using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Globalization;
using System.Text.RegularExpressions;
using YapperzAPI.Data;
using YapperzAPI.Dtos.Chatroom;
using YapperzAPI.Dtos.Users;
using YapperzAPI.Extensions;
using YapperzAPI.Hubs;
using YapperzAPI.Models;
using YapperzAPI.Services.Interfaces;

namespace YapperzAPI.Services
{
    public class ChatroomService : IChatroomService
    {
        public AppDbContext _appDbContext;
        private readonly IHubContext<ChatroomHub> _hubContext;

        public ChatroomService(AppDbContext appDbContext, IHubContext<ChatroomHub> hubContext)
        {
            _appDbContext = appDbContext;
            _hubContext = hubContext;
        }

        public async Task<ChatRoom?> GetByCodeAsync(string roomCode)
        {
            return await _appDbContext.Chatrooms.FirstOrDefaultAsync(c => c.Code == roomCode);
            /*
            return await _appDbContext.Include(c => c.Users).FirstOrDefaultAsync(c => c.Code == roomCode);
            //Eager-load Users so the DTO mapping can include them
            */
        }

        public async Task<ChatroomDto?> GetRoomByCodeAsync(string roomCode)
        {
            var room = await GetByCodeAsync(roomCode);
            return room?.ToDto();
        }

        public async Task<IReadOnlyList<UsersDto>> GetUsersByRoomCodeAsync(string roomCode)
        {
            var chatRoom = await _appDbContext.Chatrooms
                .Include(c => c.Users)
                .FirstOrDefaultAsync(c => c.Code == roomCode);

            if (chatRoom is null || chatRoom.Users is null || chatRoom.Users.Count == 0)
            {
                return Array.Empty<UsersDto>();
            }

            // Assuming you have a User -> UsersDto mapper/extension like user.ToDto()
            return chatRoom.Users
                .Select(u => u.ToDto())
                .ToList();
        }

        public async Task<bool> JoinChatroomAsync(ChatroomJoinLeaveDto request)
        {
            ChatRoom? chatRoom = _appDbContext.Chatrooms.SingleOrDefault(c => c.Code == request.RoomCode);

            if (chatRoom == null)
            {
                throw new InvalidOperationException("Room does not exist. Check code.");
            }
            else
            {
                User? user = _appDbContext.Users.FirstOrDefault(u => u.Id == request.UserId);

                if (user == null)
                {
                    throw new InvalidOperationException("User does not exist.");
                }
                else
                {
                    user.Room = null;
                    await _appDbContext.SaveChangesAsync();
                        
                    if (chatRoom.Users.Count >= chatRoom.MaxPlayers)
                    {
                        throw new InvalidOperationException("Room is full.");
                    }
                    if (chatRoom.Status == RoomStatus.Closed)
                    {
                        throw new InvalidOperationException("Room is closed.");
                    }

                    chatRoom.Users.Add(user);
                    user.Room = chatRoom;
                    await _appDbContext.SaveChangesAsync();

                    // Notify connected clients in this room that a new player joined
                    UsersDto userDto = user.ToDto();
                    await _hubContext.Clients.Group(chatRoom.Code).SendAsync("NewPlayerJoined", userDto);
                    return true;
                }
            }
        }

        public async Task<bool> LeaveChatroomAsync(ChatroomJoinLeaveDto request)
        {
            User? user = _appDbContext.Users.FirstOrDefault(u => u.Id == request.UserId);
            ChatRoom? chatRoom = _appDbContext.Chatrooms.SingleOrDefault(c => c.Code == request.RoomCode);

            if (user == null)
            {
                throw new InvalidOperationException("User does not exist.");
            }
            else
            {
                user.Room = null;
                await _appDbContext.SaveChangesAsync();

                if (chatRoom == null)
                {
                    throw new InvalidOperationException("Room no longer exists.");
                }
                else
                {
                    chatRoom.Users.Remove(user);
                    await _appDbContext.SaveChangesAsync();
                    await _hubContext.Clients.Group(chatRoom.Code).SendAsync("PlayerLeft", user.Id, user.DisplayName);
                    return true;
                }
            }
        }
    }
}
