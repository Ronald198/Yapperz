using System.ComponentModel.DataAnnotations;
using YapperzAPI.Models;

namespace YapperzAPI.Dtos.Chatroom
{
    public class ChatroomDto
    {
        public required string Code { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public required string Theme { get; set; }
        [Range(2, 100)]
        public int MaxPlayers { get; set; }
        public RoomStatus Status { get; set; } = RoomStatus.Open;
        //public List<UserDto> Users { get; set; } = new List<UserDto>();
    }
}
