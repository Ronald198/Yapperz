using Microsoft.AspNetCore.Mvc;
using YapperzAPI.Dtos.Chatroom;
using YapperzAPI.Dtos.Users;
using YapperzAPI.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using YapperzAPI.Models;
namespace YapperzAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatroomController : ControllerBase
    {
        private readonly IChatroomService _chatroomService;

        public ChatroomController(IChatroomService chatroomService)
        {
            _chatroomService = chatroomService;
        }

        [HttpPost("join")]
        public async Task<IActionResult> JoinChatroom([FromBody] ChatroomJoinLeaveDto chatroomJoinDto)
        {
            try
            {
                bool res = await _chatroomService.JoinChatroomAsync(chatroomJoinDto);

                if (res)
                {
                    return Ok(new { message = "User joined chatroom successfully!" });
                }
                else
                {
                    return BadRequest(new { message = "Failed to join chatroom." });
                }
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("leave")]
        public async Task<IActionResult> LeaveChatroom([FromBody] ChatroomJoinLeaveDto chatroomLeaveDto)
        {
            try
            {
                bool res = await _chatroomService.LeaveChatroomAsync(chatroomLeaveDto);

                if (res)
                {
                    return Ok(new { message = "User left chatroom successfully!" });
                }
                else
                {
                    return BadRequest(new { message = "Failed to leave chatroom." });
                }
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{roomCode}")]
        public async Task<ActionResult<ChatroomDto>> GetRoomByCode(string roomCode)
        {
            var chatroomDto = await _chatroomService.GetRoomByCodeAsync(roomCode);

            if (chatroomDto is null)
            {
                return NotFound();
            }

            return Ok(chatroomDto);
        }

        [HttpGet("{roomCode}/users")]
        public async Task<ActionResult<IReadOnlyList<UsersDto>>> GetUsersByRoomCode(string roomCode)
        {
            var users = await _chatroomService.GetUsersByRoomCodeAsync(roomCode);

            if (users.Count == 0)
            {            
                return Ok(users);
            }

            return Ok(users);
        }
    }
}
