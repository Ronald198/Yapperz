namespace YapperzAPI.Models
{
    public class User
    {
        public int Id { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public string PasswordHash { get; set; } = null!;
        public required string DisplayName { get; set; }
        public string Bio { get; set; } = string.Empty;
        public required string AvatarPath { get; set; }
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
        public ChatRoom? Room { get; set; }
    }
}
