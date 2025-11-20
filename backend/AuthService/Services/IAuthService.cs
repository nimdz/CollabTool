using AuthService.DTOs;
using System.Threading.Tasks;

namespace AuthService.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto?> RegisterAsync(RegisterRequestDto request);
        Task<AuthResponseDto?> LoginAsync(LoginRequestDto request);
        Task<AuthResponseDto?> RefreshTokenAsync(string token);
    }
}
