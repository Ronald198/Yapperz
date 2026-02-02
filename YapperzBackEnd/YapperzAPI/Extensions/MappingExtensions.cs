using YapperzAPI.Dtos.Chatroom;
using YapperzAPI.Dtos.Users;
using YapperzAPI.Models;

namespace YapperzAPI.Extensions
{
    public static class MappingExtensions
    {
        public static UsersDto ToDto(this User user)
        {
            return new UsersDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                DisplayName = user.DisplayName,
                AvatarPath = user.AvatarPath,
                Bio = user.Bio,
                //Room = user.Room,
                JoinedAt = user.JoinedAt
            };
        }

        public static ChatroomDto ToDto(this ChatRoom chatRoom)
        {
            return new ChatroomDto
            {
                Code = chatRoom.Code,
                Name = chatRoom.Name,
                MaxPlayers = chatRoom.MaxPlayers,
                Status = chatRoom.Status,
                Theme = chatRoom.Theme,
                Description = chatRoom.Description,
                //Users = chatRoom.Users
            };
        }
    }
}
