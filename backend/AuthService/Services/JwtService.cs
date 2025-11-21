using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using AuthService.Models;

namespace AuthService.Services
{
    public class JwtService : IJwtService
    {
        private readonly string _secret;
        private readonly string _issuer;

        public JwtService(IConfiguration config)
        {
            _secret = config["Jwt:Secret"]!;
            _issuer = config["Jwt:Issuer"]!;
        }

        //Generates JWT access token for authenticated user
        public string GenerateToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_secret);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("fullName", user.FullName ?? string.Empty),
                new Claim("department", user.Department ?? string.Empty),
                new Claim("bio", user.Bio ?? string.Empty)
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(1),
                Issuer = _issuer,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature
                )
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
