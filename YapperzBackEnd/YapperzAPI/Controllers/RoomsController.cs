using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using YapperzAPI.Models;
using YapperzAPI.DTOs;
using YapperzAPI.Data;

namespace YapperzAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RoomsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Rooms
        [HttpGet]
        public async Task<ActionResult<List<ChatRoom>>> GetAllRooms()
        {
            var chatrooms = await _context.Chatrooms
                .Include(c => c.Users)
                .ToListAsync();
            
            return Ok(chatrooms);
        }

        // GET: api/Rooms/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ChatRoom>> GetRoomById(int id)
        {
            var chatroom = await _context.Chatrooms
                .Include(c => c.Users)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (chatroom == null)
            {
                return NotFound();
            }

            return chatroom;
        }

        // POST: api/Rooms
        [HttpPost]
        public async Task<ActionResult<ChatRoom>> CreateRoom([FromBody] ChatRoomDto roomDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Generate unique room code
            string roomCode = GenerateUniqueRoomCode();

            var chatroom = new ChatRoom
            {
                Code = roomCode,
                Name = roomDto.Name,
                Description = roomDto.Description,
                Theme = roomDto.Theme,
                MaxPlayers = roomDto.MaxPlayers,
                Status = RoomStatus.Open,
                Users = new List<User>()
            };

            _context.Chatrooms.Add(chatroom);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRoomById), new { id = chatroom.Id }, chatroom);
        }

        // DELETE: api/Rooms/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoom(int id)
        {
            var chatroom = await _context.Chatrooms
                .Include(c => c.Users)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (chatroom == null)
            {
                return NotFound(new { message = "Room not found" });
            }

            // Check if room has any members
            if (chatroom.Users != null && chatroom.Users.Any())
            {
                return BadRequest(new { message = "Cannot delete room. Room still has members." });
            }

            _context.Chatrooms.Remove(chatroom);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Room deleted successfully" });
        }

        // Generate a unique 6-character room code
        private string GenerateUniqueRoomCode()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            string code;

            do
            {
                code = new string(Enumerable.Repeat(chars, 6)
                    .Select(s => s[random.Next(s.Length)]).ToArray());
            } 
            while (_context.Chatrooms.Any(c => c.Code == code));

            return code;
        }
    }
}

// ChatRoomDto.cs
namespace YapperzAPI.DTOs
{
    public class ChatRoomDto
    {
        [Required]
        [StringLength(100, MinimumLength = 1)]
        public required string Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        public required string Theme { get; set; }

        [Range(2, 100)]
        public int MaxPlayers { get; set; } = 10;
    }
}