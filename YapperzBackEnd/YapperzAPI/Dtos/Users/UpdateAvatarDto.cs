namespace YapperzAPI.Dtos.Users
{
    public class UpdateAvatarDto
    {
        public int UserId { get; set; }
        public required string AvatarPath { get; set; }
    }
}