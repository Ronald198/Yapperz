using System.ComponentModel.DataAnnotations;

namespace YapperzAPI.Models
{
    public class ChatRoom
    {
        public int Id { get; set; }
        public required string Code { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public required string Theme { get; set; }
        [Range(2, 100)]
        public int MaxPlayers { get; set; }
        public RoomStatus Status { get; set; } = RoomStatus.Open;
        public List<User> Users { get; set; } = new List<User>();
    }
}
