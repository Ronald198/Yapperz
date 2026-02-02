using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using YapperzAPI.Data;
using YapperzAPI.Dtos.Chatroom;
using YapperzAPI.Dtos.Users;
using YapperzAPI.Extensions;
using YapperzAPI.Models;
using YapperzAPI.Services.Interfaces;

namespace YapperzAPI.Services
{
    public class UsersServices : IUsersService
    {
        public AppDbContext _appDbContext;
        public IPasswordHasher< User > _passwordHasher;

        public UsersServices(AppDbContext appDbContext, IPasswordHasher<User> passwordHasher) 
        {
            _appDbContext = appDbContext;
            _passwordHasher = passwordHasher;
        }

        public async Task<UsersDto> SignUpAsync(UserSignUpDto request)
        {
            if (await _appDbContext.Users.AnyAsync(u => u.Username == request.Username))
            {
                throw new InvalidOperationException("Username already exists.");
            }

            if (await _appDbContext.Users.AnyAsync(u => u.Email == request.Email))
            {
                throw new InvalidOperationException("Email already exists.");
            }

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                DisplayName = request.DisplayName,
                AvatarPath = request.AvatarPath
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

            _appDbContext.Users.Add(user);
            await _appDbContext.SaveChangesAsync();

            return user.ToDto();
        }

        public async Task<UsersDto?> AuthenticateUser(UserLoginDto request)
        {
            var lowered = request.UsernameOrEmail.ToLowerInvariant();
            var user = await _appDbContext.Users.FirstOrDefaultAsync(u => u.Username.ToLower() == lowered || u.Email.ToLower() == lowered);
            if (user is null)
            {
                return null;
            }

            var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
            return result == PasswordVerificationResult.Success || result == PasswordVerificationResult.SuccessRehashNeeded
                ? user.ToDto()
                : null;
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            return await _appDbContext.Users.FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<UsersDto?> GetProfileAsync(int id)
        {
            var user = await GetByIdAsync(id);
            return user?.ToDto();
        }

        public async Task<ChatroomDto?> GetUsersChatroomAsync(int id)
        {
            var user = await GetByIdAsync(id) ?? throw new InvalidOperationException("User not found.");

            if (user.Room is null)
            {
                throw new InvalidOperationException("Room not found.");
            }

            return user.Room.ToDto();
        }
        
        // Update user avatar
        public async Task<UsersDto?> UpdateUserAvatarAsync(UpdateAvatarDto updateAvatarDto)
        {
            var user = await GetByIdAsync(updateAvatarDto.UserId);
    
            if (user == null)
            {
                return null;
            }

            // Update the avatar path
            user.AvatarPath = updateAvatarDto.AvatarPath;
    
            await _appDbContext.SaveChangesAsync();

            // Return the updated user as DTO
            return user.ToDto();
        }

        public async Task<UsersDto?> UpdateUserProfileAsync(int id, UsersDto userDto)
        {
            var user = await _appDbContext.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user is null) return null;

            // Update specific profile fields
            user.DisplayName = userDto.DisplayName;
            user.Bio = userDto.Bio; // Assuming Bio property exists on User model

            await _appDbContext.SaveChangesAsync();
            return user.ToDto();
        }

        public async Task<UsersDto?> UpdateUserAvatarAsync(int id, UsersDto userDto)
        {
            var user = await _appDbContext.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user is null) return null;

            // Update avatar path
            user.AvatarPath = userDto.AvatarPath;

            await _appDbContext.SaveChangesAsync();

            return user.ToDto();
        }
    }
}