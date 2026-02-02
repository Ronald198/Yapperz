using YapperzAPI.Models;

namespace YapperzAPI.Dtos.Users
{
    public class UsersDto
    {
        public int Id { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string DisplayName { get; set; }
        public required string Bio { get; set; }
        public required string AvatarPath { get; set; }
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
        //public ChatRoomDto? Room { get; set; }
    }
}
