namespace YapperzAPI.Dtos.Users
{
    public class UserLoginDto
    {
        public required string UsernameOrEmail { get; set; }
        public required string Password { get; set; }
    }
}
