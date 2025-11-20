using System.Text.Json.Serialization;
using AuthService.Models;

namespace AuthService.DTOs
{
    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public GlobalRole Role { get; set; }
    }
}
