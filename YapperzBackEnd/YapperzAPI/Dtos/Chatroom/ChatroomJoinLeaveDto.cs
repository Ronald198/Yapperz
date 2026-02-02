namespace YapperzAPI.Dtos.Chatroom
{
    public class ChatroomJoinLeaveDto
    {
        public required string RoomCode { get; set; }
        public int UserId { get; set; }
    }
}
