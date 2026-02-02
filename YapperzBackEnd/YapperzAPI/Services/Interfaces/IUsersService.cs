using YapperzAPI.Models;
using YapperzAPI.Dtos.Users;
using YapperzAPI.Dtos.Chatroom;

namespace YapperzAPI.Services.Interfaces
{
    public interface IUsersService
    {
        Task<UsersDto> SignUpAsync(UserSignUpDto request);
        Task<UsersDto?> AuthenticateUser(UserLoginDto request);
        Task<UsersDto?> GetProfileAsync(int id);
        Task<ChatroomDto?> GetUsersChatroomAsync(int id);
        Task<User?> GetByIdAsync(int id);
        Task<UsersDto?> UpdateUserAvatarAsync(UpdateAvatarDto updateAvatarDto);
        Task<UsersDto?> UpdateUserProfileAsync(int id, UsersDto userDto);
        Task<UsersDto?> UpdateUserAvatarAsync(int id, UsersDto userDto);
    }
}