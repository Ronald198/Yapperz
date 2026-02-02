using YapperzAPI.Dtos.Chatroom;
using YapperzAPI.Dtos.Users;

namespace YapperzAPI.Services.Interfaces
{
    public interface IChatroomService
    {
        Task<bool> JoinChatroomAsync(ChatroomJoinLeaveDto request);
        Task<bool> LeaveChatroomAsync(ChatroomJoinLeaveDto request);
        Task<ChatroomDto?> GetRoomByCodeAsync(string roomCode);
        Task<IReadOnlyList<UsersDto>> GetUsersByRoomCodeAsync(string roomCode);
    }
}
