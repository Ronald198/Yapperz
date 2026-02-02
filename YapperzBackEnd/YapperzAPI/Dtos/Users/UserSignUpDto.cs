using YapperzAPI.Models;

namespace YapperzAPI.Dtos.Users
{
    public class UserSignUpDto
    {
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required string DisplayName { get; set; }
        public string Bio { get; set; } = string.Empty;
        public required string AvatarPath { get; set; }
    }
}
