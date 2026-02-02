using Microsoft.EntityFrameworkCore;
using YapperzAPI.Models;

namespace YapperzAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        { }

        public DbSet<User> Users { get; set; }
        public DbSet<ChatRoom> Chatrooms { get; set; }
    }
}
