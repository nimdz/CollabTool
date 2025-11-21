using AuthService.DTOs;
using System.Collections.Generic;

namespace AuthService.Services
{
    public interface IProfileService
    {
        UserResponseDto? GetProfile(string username);
        UserResponseDto? UpdateProfile(string username, UpdateProfileRequestDto request);
        List<UserResponseDto> GetAllUsers();
        List<UserResponseDto> GetUsersByIds(List<string> userIds);
    }
}
